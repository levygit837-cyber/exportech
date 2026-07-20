"""Build a runtime-focused Apple User GLB from the conservative LOD0.

The source LOD0 remains immutable. This local-only pipeline bounds decoded
texture memory, transcodes textures with slot-aware WebP quality, removes the
advanced material extensions used by the source, and replaces their visible
role with deterministic core metallic-roughness parameters. Geometry, object
names, annotation anchors, provenance, and the NoAI marker are preserved.
"""

from __future__ import annotations

import argparse
import json
import shutil
import struct
import subprocess
import tempfile
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any

from build_apple_user_lod0 import (
    EXPECTED_ANCHORS,
    GLTF_TRANSFORM_VERSION,
    anchor_signature,
    asset_summary,
    atomic_write_json,
    node_by_name,
    read_glb,
    run,
    sha256,
    triangle_count,
    write_glb,
)


EXPECTED_SOURCE_SHA256 = (
    "9e0fa4c4f6fcbdd18cc62acc84c781fadc936f852890b78b41cefce2ae4ba6e3"
)
ADVANCED_MATERIAL_EXTENSIONS = {
    "KHR_materials_clearcoat",
    "KHR_materials_ior",
    "KHR_materials_specular",
    "KHR_materials_transmission",
}

# A single core-PBR lobe cannot reproduce clearcoat/transmission exactly. These
# conservative values preserve the intended hierarchy (metal, glossy glass,
# dark optics, emissive display, translucent accents) without advanced shaders.
MATERIAL_OVERRIDES: dict[str, dict[str, Any]] = {
    "EX_Unibody_Orange": {
        "roughnessFactor": 0.25,
        "reason": "Fold the subtle clearcoat highlight into the metal roughness.",
    },
    "EX_Front_Glass": {
        "roughnessFactor": 0.055,
        "reason": "Keep the front cover dark and glossy with one core-PBR lobe.",
    },
    "EX_Display": {
        "roughnessFactor": 0.22,
        "reason": "Retain a restrained screen reflection over the emissive map.",
    },
    "EX_Source_ieDmCkHnOnSIOcm": {
        "roughnessFactor": 0.35,
        "reason": "Replace the low-energy clearcoat on the black insert.",
    },
    "EX_Rear_Glass": {
        "roughnessFactor": 0.29,
        "reason": "Approximate clearcoat plus suppressed dielectric specular.",
    },
    "EX_Optical_Elements": {
        "metallicFactor": 0.22,
        "roughnessFactor": 0.065,
        "reason": "Preserve the dark reflective optical stack without clearcoat.",
    },
    "EX_Lens_Glass": {
        "metallicFactor": 0.18,
        "roughnessFactor": 0.04,
        "reason": "Approximate low transmission and IOR with dark glossy PBR.",
    },
    "EX_Source_hqDUrVMlYhzYusu": {
        "roughnessFactor": 0.085,
        "reason": "Preserve the glossy alpha-blended textured layer.",
    },
    "EX_LiDAR_Glass": {
        "metallicFactor": 0.1,
        "roughnessFactor": 0.09,
        "reason": "Keep the LiDAR cover glossy without a second coat lobe.",
    },
    "EX_Flash_Diffuser": {
        "roughnessFactor": 0.24,
        "reason": "The emissive diffuser already carries the visible energy.",
    },
    "EX_Source_YQFhPSFSryEqJMp": {
        "roughnessFactor": 0.9,
        "reason": "Retain the authored roughness texture with a subtle coat bias.",
    },
    "EX_Source_CVcxUAKakDuRdCf": {
        "roughnessFactor": 0.24,
        "reason": "Replace clearcoat on the dark alpha-blended overlay.",
    },
    "EX_Source_yPEFElLJTRhfWfw": {
        "roughnessFactor": 0.085,
        "reason": "Preserve the glossy translucent orange accent.",
    },
    "EX_Source_PJgHvfOhNXkxvzq": {
        "roughnessFactor": 0.22,
        "reason": "Use the roughness map as a restrained glossy alpha layer.",
    },
    "EX_Source_awYxKfiOpRgQIxD": {
        "roughnessFactor": 0.7,
        "reason": "Reduce the default core dielectric highlight after specular removal.",
    },
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--npx", default="npx")
    parser.add_argument("--max-bytes", type=int, default=1_300_000)
    parser.add_argument(
        "--max-decoded-texture-bytes", type=int, default=6_000_000
    )
    parser.add_argument("--force", action="store_true")
    return parser.parse_args()


def texture_infos(value: Any) -> list[tuple[str, int]]:
    result: list[tuple[str, int]] = []
    if isinstance(value, dict):
        for key, child in value.items():
            if key.endswith("Texture") and isinstance(child, dict):
                texture_index = child.get("index")
                if isinstance(texture_index, int):
                    result.append((key, texture_index))
            result.extend(texture_infos(child))
    elif isinstance(value, list):
        for child in value:
            result.extend(texture_infos(child))
    return result


def image_payload(document: dict[str, Any], binary: bytes, index: int) -> bytes:
    image = document["images"][index]
    view = document["bufferViews"][image["bufferView"]]
    start = view.get("byteOffset", 0)
    return binary[start : start + view["byteLength"]]


def webp_dimensions(payload: bytes) -> tuple[int, int]:
    if payload[:4] != b"RIFF" or payload[8:12] != b"WEBP":
        raise ValueError("Runtime textures must be embedded WebP images")
    chunk = payload[12:16]
    if chunk == b"VP8X":
        return (
            1 + int.from_bytes(payload[24:27], "little"),
            1 + int.from_bytes(payload[27:30], "little"),
        )
    if chunk == b"VP8L":
        if payload[20] != 0x2F:
            raise ValueError("Invalid VP8L signature")
        bits = int.from_bytes(payload[21:25], "little")
        return 1 + (bits & 0x3FFF), 1 + ((bits >> 14) & 0x3FFF)
    if chunk == b"VP8 ":
        if payload[23:26] != b"\x9d\x01\x2a":
            raise ValueError("Invalid VP8 frame signature")
        width = struct.unpack_from("<H", payload, 26)[0] & 0x3FFF
        height = struct.unpack_from("<H", payload, 28)[0] & 0x3FFF
        return width, height
    raise ValueError(f"Unsupported WebP chunk {chunk!r}")


def jpeg_dimensions(payload: bytes) -> tuple[int, int]:
    if payload[:2] != b"\xff\xd8":
        raise ValueError("Invalid embedded JPEG image")
    offset = 2
    start_of_frame = {
        0xC0,
        0xC1,
        0xC2,
        0xC3,
        0xC5,
        0xC6,
        0xC7,
        0xC9,
        0xCA,
        0xCB,
        0xCD,
        0xCE,
        0xCF,
    }
    while offset + 9 <= len(payload):
        while offset < len(payload) and payload[offset] != 0xFF:
            offset += 1
        while offset < len(payload) and payload[offset] == 0xFF:
            offset += 1
        if offset >= len(payload):
            break
        marker = payload[offset]
        offset += 1
        if marker in {0xD8, 0xD9} or 0xD0 <= marker <= 0xD7:
            continue
        if offset + 2 > len(payload):
            break
        segment_length = struct.unpack_from(">H", payload, offset)[0]
        if marker in start_of_frame:
            if offset + 7 > len(payload):
                break
            height = struct.unpack_from(">H", payload, offset + 3)[0]
            width = struct.unpack_from(">H", payload, offset + 5)[0]
            return width, height
        if segment_length < 2:
            raise ValueError("Invalid JPEG segment length")
        offset += segment_length
    raise ValueError("JPEG dimensions were not found")


def image_dimensions(payload: bytes, mime_type: str) -> tuple[int, int]:
    if mime_type == "image/webp":
        return webp_dimensions(payload)
    if mime_type == "image/jpeg":
        return jpeg_dimensions(payload)
    raise ValueError(f"Unsupported embedded image type {mime_type!r}")


def mip_chain_rgba8_bytes(width: int, height: int) -> int:
    total = 0
    while True:
        total += width * height * 4
        if width == 1 and height == 1:
            return total
        width = max(1, width // 2)
        height = max(1, height // 2)


def texture_inventory(
    document: dict[str, Any], binary: bytes
) -> tuple[list[dict[str, Any]], int]:
    texture_slots: dict[int, set[str]] = defaultdict(set)
    for material in document.get("materials", []):
        for slot, texture_index in texture_infos(material):
            texture_slots[texture_index].add(slot)

    inventory: list[dict[str, Any]] = []
    total = 0
    for texture_index, texture in enumerate(document.get("textures", [])):
        source = texture.get("source")
        if not isinstance(source, int):
            source = texture.get("extensions", {}).get("EXT_texture_webp", {}).get(
                "source"
            )
        if not isinstance(source, int):
            raise ValueError(f"Texture {texture_index} has no embedded image source")
        image = document["images"][source]
        payload = image_payload(document, binary, source)
        width, height = image_dimensions(payload, image.get("mimeType", ""))
        decoded_bytes = mip_chain_rgba8_bytes(width, height)
        total += decoded_bytes
        inventory.append(
            {
                "texture": texture_index,
                "image": source,
                "name": image.get("name"),
                "mime_type": image.get("mimeType"),
                "width": width,
                "height": height,
                "encoded_bytes": len(payload),
                "decoded_rgba8_mip_bytes": decoded_bytes,
                "slots": sorted(texture_slots[texture_index]),
            }
        )
    return inventory, total


def convert_materials(document: dict[str, Any]) -> list[dict[str, Any]]:
    converted: list[dict[str, Any]] = []
    seen = set()
    removed_counts: Counter[str] = Counter()
    for material in document.get("materials", []):
        name = material.get("name")
        extensions = material.get("extensions", {})
        removed = {
            key: extensions[key]
            for key in sorted(ADVANCED_MATERIAL_EXTENSIONS & extensions.keys())
        }
        if not removed:
            continue
        if name not in MATERIAL_OVERRIDES:
            raise ValueError(f"Missing deterministic core-PBR override for {name}")
        seen.add(name)
        removed_counts.update(removed.keys())
        pbr = material.setdefault("pbrMetallicRoughness", {})
        before = {
            "metallicFactor": pbr.get("metallicFactor", 1),
            "roughnessFactor": pbr.get("roughnessFactor", 1),
        }
        override = MATERIAL_OVERRIDES[name]
        for key in ("metallicFactor", "roughnessFactor"):
            if key in override:
                pbr[key] = override[key]
        for key in removed:
            del extensions[key]
        if not extensions:
            material.pop("extensions", None)
        converted.append(
            {
                "material": name,
                "removed_extensions": removed,
                "core_pbr_before": before,
                "core_pbr_after": {
                    "metallicFactor": pbr.get("metallicFactor", 1),
                    "roughnessFactor": pbr.get("roughnessFactor", 1),
                },
                "reason": override["reason"],
            }
        )

    missing = set(MATERIAL_OVERRIDES) - seen
    if missing:
        raise ValueError(f"Expected advanced materials were not converted: {sorted(missing)}")
    if removed_counts != Counter(
        {
            "KHR_materials_clearcoat": 14,
            "KHR_materials_specular": 2,
            "KHR_materials_ior": 1,
            "KHR_materials_transmission": 1,
        }
    ):
        raise ValueError(f"Advanced material extension inventory drifted: {removed_counts}")

    document["extensionsUsed"] = [
        extension
        for extension in document.get("extensionsUsed", [])
        if extension not in ADVANCED_MATERIAL_EXTENSIONS
    ]
    document["extensionsRequired"] = [
        extension
        for extension in document.get("extensionsRequired", [])
        if extension not in ADVANCED_MATERIAL_EXTENSIONS
    ]
    return converted


def validate_invariants(
    source: dict[str, Any],
    output: dict[str, Any],
    output_binary: bytes,
    output_path: Path,
    max_bytes: int,
    max_texture_bytes: int,
) -> tuple[list[dict[str, Any]], int]:
    if output_path.stat().st_size > max_bytes:
        raise ValueError(
            f"Runtime GLB exceeds byte budget: {output_path.stat().st_size} > {max_bytes}"
        )
    if triangle_count(output) != triangle_count(source):
        raise ValueError("Runtime GLB changed triangle count")
    for collection in ("meshes", "materials", "nodes"):
        source_names = sorted(item.get("name", "") for item in source[collection])
        output_names = sorted(item.get("name", "") for item in output[collection])
        if source_names != output_names:
            raise ValueError(f"Runtime GLB changed {collection} names")
    for collection in ("meshes", "materials", "nodes"):
        if len(output[collection]) != len(source[collection]):
            raise ValueError(f"Runtime GLB changed {collection} count")

    if output.get("scenes", [{}])[0].get("extras") != source.get("scenes", [{}])[0].get(
        "extras"
    ):
        raise ValueError("Runtime GLB changed source provenance")
    if output["scenes"][0]["extras"].get("source_noai") is not True:
        raise ValueError("Runtime GLB lost the NoAI marker")
    for anchor in EXPECTED_ANCHORS:
        if anchor_signature(node_by_name(output, anchor)) != anchor_signature(
            node_by_name(source, anchor)
        ):
            raise ValueError(f"Runtime GLB changed annotation anchor {anchor}")

    serialized = json.dumps(output, sort_keys=True)
    if any(extension in serialized for extension in ADVANCED_MATERIAL_EXTENSIONS):
        raise ValueError("Runtime GLB retained an advanced material extension")
    required = set(output.get("extensionsRequired", []))
    expected_required = {
        "EXT_meshopt_compression",
        "EXT_texture_webp",
        "KHR_mesh_quantization",
    }
    if required != expected_required:
        raise ValueError(f"Unexpected required extensions: {sorted(required)}")

    inventory, decoded_bytes = texture_inventory(output, output_binary)
    if decoded_bytes > max_texture_bytes:
        raise ValueError(
            f"Decoded texture budget exceeded: {decoded_bytes} > {max_texture_bytes}"
        )
    for texture in inventory:
        maximum = max(texture["width"], texture["height"])
        expected_maximum = 512 if texture["name"] != "ZHfKunYSTKCyTaN" else 256
        if maximum > expected_maximum:
            raise ValueError(
                f"Texture {texture['name']} exceeds {expected_maximum}px: "
                f"{texture['width']}x{texture['height']}"
            )
    return inventory, decoded_bytes


def main() -> None:
    args = parse_args()
    source_path = Path(args.source).resolve()
    output_path = Path(args.output).resolve()
    manifest_path = Path(args.manifest).resolve()
    if not source_path.is_file():
        raise FileNotFoundError(source_path)
    if source_path == output_path:
        raise ValueError("Source and output must be different files")
    for target in (output_path, manifest_path):
        if target.exists() and not args.force:
            raise FileExistsError(f"Refusing to overwrite {target}; pass --force")
        target.parent.mkdir(parents=True, exist_ok=True)

    source_digest = sha256(source_path)
    if source_digest != EXPECTED_SOURCE_SHA256:
        raise ValueError(f"Unexpected LOD0 SHA-256: {source_digest}")
    source_document, _ = read_glb(source_path)
    source_extras = source_document.get("scenes", [{}])[0].get("extras", {})
    if source_extras.get("source_license") != "Free Standard":
        raise ValueError("The recorded source license changed or is missing")
    if source_extras.get("source_noai") is not True:
        raise ValueError("The recorded NoAI restriction changed or is missing")

    cli = [args.npx, "--yes", f"@gltf-transform/cli@{GLTF_TRANSFORM_VERSION}"]
    with tempfile.TemporaryDirectory(prefix="exportech-apple-runtime-") as temp_dir:
        temp = Path(temp_dir)
        resize_512 = temp / "resize-512.glb"
        resize_selective = temp / "resize-selective.glb"
        normal_webp = temp / "normal-webp.glb"
        mr_webp = temp / "metallic-roughness-webp.glb"
        base_webp = temp / "base-color-webp.glb"
        texture_webp = temp / "texture-webp.glb"
        core_pbr = temp / "core-pbr.glb"
        candidate = temp / "runtime.glb"

        run(
            [
                *cli,
                "resize",
                str(source_path),
                str(resize_512),
                "--width",
                "512",
                "--height",
                "512",
                "--filter",
                "lanczos3",
            ]
        )
        run(
            [
                *cli,
                "resize",
                str(resize_512),
                str(resize_selective),
                "--width",
                "256",
                "--height",
                "256",
                "--pattern",
                "ZHfKunYSTKCyTaN",
                "--filter",
                "lanczos3",
            ]
        )
        webp_passes = (
            (resize_selective, normal_webp, "normalTexture", "95"),
            (normal_webp, mr_webp, "metallicRoughnessTexture", "95"),
            (mr_webp, base_webp, "baseColorTexture", "92"),
            (base_webp, texture_webp, "emissiveTexture", "92"),
        )
        for input_path, result_path, slot, quality in webp_passes:
            run(
                [
                    *cli,
                    "webp",
                    str(input_path),
                    str(result_path),
                    "--formats",
                    "*",
                    "--slots",
                    slot,
                    "--lossless",
                    "false",
                    "--quality",
                    quality,
                    "--effort",
                    "100",
                ]
            )

        texture_document, texture_binary = read_glb(texture_webp)
        material_conversions = convert_materials(texture_document)
        write_glb(core_pbr, texture_document, texture_binary)
        run(
            [
                *cli,
                "meshopt",
                str(core_pbr),
                str(candidate),
                "--level",
                "high",
                "--quantize-position",
                "16",
                "--quantize-normal",
                "12",
                "--quantize-texcoord",
                "14",
                "--quantize-color",
                "8",
            ]
        )
        validator_output = run([*cli, "validate", str(candidate)])
        if "No errors found" not in validator_output or "No warnings found" not in validator_output:
            raise ValueError("glTF Validator reported errors or warnings")

        output_document, output_binary = read_glb(candidate)
        inventory, decoded_bytes = validate_invariants(
            source_document,
            output_document,
            output_binary,
            candidate,
            args.max_bytes,
            args.max_decoded_texture_bytes,
        )
        output_digest = sha256(candidate)
        output_bytes = candidate.stat().st_size
        shutil.copyfile(candidate, output_path)

    source_inventory, source_decoded_bytes = texture_inventory(
        source_document, read_glb(source_path)[1]
    )
    manifest = {
        "date": date.today().isoformat(),
        "pipeline": {
            "script": "tools/3d/build_apple_user_runtime.py",
            "gltf_transform": GLTF_TRANSFORM_VERSION,
            "local_only": True,
            "source_uploaded": False,
        },
        "source": {
            "filename": source_path.name,
            "bytes": source_path.stat().st_size,
            "sha256": source_digest,
            "summary": asset_summary(source_document),
            "decoded_rgba8_mip_texture_bytes": source_decoded_bytes,
            "texture_inventory": source_inventory,
        },
        "output": {
            "filename": output_path.name,
            "bytes": output_bytes,
            "sha256": output_digest,
            "max_bytes": args.max_bytes,
            "reduction_percent": round(
                (1 - output_bytes / source_path.stat().st_size) * 100, 2
            ),
            "summary": asset_summary(output_document),
            "decoded_rgba8_mip_texture_bytes": decoded_bytes,
            "max_decoded_texture_bytes": args.max_decoded_texture_bytes,
            "decoded_texture_reduction_percent": round(
                (1 - decoded_bytes / source_decoded_bytes) * 100, 2
            ),
            "texture_inventory": inventory,
        },
        "changes": {
            "texture_policy": {
                "all_maximum_dimension": 512,
                "ZHfKunYSTKCyTaN_maximum_dimension": 256,
                "resampling": "Lanczos3",
                "normal_and_metallic_roughness_webp_quality": 95,
                "base_color_and_emissive_webp_quality": 92,
            },
            "material_conversions": material_conversions,
            "advanced_material_extensions_removed": sorted(
                ADVANCED_MATERIAL_EXTENSIONS
            ),
            "topology_simplified": False,
            "mesh_material_node_names_changed": False,
            "anchors_changed": False,
        },
        "provenance": source_extras,
        "publication_gate": (
            "Revalidar os termos vinculantes do pacote Sketchfab antes de publicar. "
            "O ativo e seus derivados mantêm a marcação NoAI e não podem ser "
            "enviados a serviços generativos."
        ),
        "validation": {
            "gltf_validator_errors": 0,
            "gltf_validator_warnings": 0,
            "source_and_output_triangles_equal": True,
            "mesh_material_node_counts_and_names_equal": True,
            "anchors_preserved": sorted(EXPECTED_ANCHORS),
            "scene_attribution_preserved": True,
            "advanced_material_extensions_absent": True,
            "runtime_byte_budget_passed": True,
            "decoded_texture_budget_passed": True,
        },
    }
    atomic_write_json(manifest_path, manifest)
    print(
        "APPLE_USER_RUNTIME_BUILT "
        f"bytes={output_bytes} sha256={output_digest} "
        f"triangles={triangle_count(output_document)} "
        f"decoded_texture_bytes={decoded_bytes}"
    )


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, subprocess.CalledProcessError) as error:
        print(f"APPLE_USER_RUNTIME_FAILED {error}")
        raise
