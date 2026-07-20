"""Build the conservative Apple User LOD0 without changing its visible content.

The source GLB is treated as immutable. This script removes only attributes that
are proven redundant in the source, converts PNG textures to lossless WebP, and
applies high-precision Meshopt compression. It intentionally does not simplify
topology, merge materials, resize textures, or change material parameters.

The glTF Transform package is version-pinned and runs locally through ``npx``.
The model is never uploaded to an external service.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import struct
import subprocess
import sys
import tempfile
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any, Iterable


GLTF_TRANSFORM_VERSION = "4.4.1"
EXPECTED_SOURCE_SHA256 = (
    "9d401b6b32bc57a86cafa266245b107e6e597b86fc441e2287d4facd3aa2a8b8"
)
EXPECTED_ANCHORS = {
    "anchor_unibody",
    "anchor_action_button",
    "anchor_camera_control",
    "anchor_display",
    "anchor_ceramic_shield",
    "anchor_camera_system",
    "anchor_lidar",
}
COMPONENT_FORMATS = {
    5120: ("b", 1),
    5121: ("B", 1),
    5122: ("h", 2),
    5123: ("H", 2),
    5125: ("I", 4),
    5126: ("f", 4),
}
TYPE_COMPONENTS = {
    "SCALAR": 1,
    "VEC2": 2,
    "VEC3": 3,
    "VEC4": 4,
    "MAT2": 4,
    "MAT3": 9,
    "MAT4": 16,
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--npx", default="npx")
    parser.add_argument("--max-bytes", type=int, default=2_100_000)
    parser.add_argument("--force", action="store_true")
    return parser.parse_args()


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def read_glb(path: Path) -> tuple[dict[str, Any], bytes]:
    raw = path.read_bytes()
    if len(raw) < 20 or raw[:4] != b"glTF":
        raise ValueError(f"Not a GLB 2.0 file: {path}")
    version, declared_length = struct.unpack_from("<II", raw, 4)
    if version != 2 or declared_length != len(raw):
        raise ValueError(
            f"Invalid GLB header: version={version} length={declared_length}"
        )

    offset = 12
    document: dict[str, Any] | None = None
    binary = b""
    while offset + 8 <= len(raw):
        chunk_length, chunk_type = struct.unpack_from("<II", raw, offset)
        offset += 8
        chunk = raw[offset : offset + chunk_length]
        offset += chunk_length
        if chunk_type == 0x4E4F534A:
            document = json.loads(chunk.rstrip(b"\x00 ").decode("utf-8"))
        elif chunk_type == 0x004E4942:
            binary = bytes(chunk)

    if document is None or not binary:
        raise ValueError(f"GLB is missing JSON or BIN data: {path}")
    return document, binary


def write_glb(path: Path, document: dict[str, Any], binary: bytes) -> None:
    encoded = json.dumps(
        document, ensure_ascii=False, separators=(",", ":")
    ).encode("utf-8")
    json_padding = (-len(encoded)) % 4
    bin_padding = (-len(binary)) % 4
    encoded += b" " * json_padding
    padded_binary = binary + b"\x00" * bin_padding
    total_length = 12 + 8 + len(encoded) + 8 + len(padded_binary)

    with path.open("wb") as handle:
        handle.write(struct.pack("<4sII", b"glTF", 2, total_length))
        handle.write(struct.pack("<II", len(encoded), 0x4E4F534A))
        handle.write(encoded)
        handle.write(struct.pack("<II", len(padded_binary), 0x004E4942))
        handle.write(padded_binary)


def iter_texture_infos(value: Any, key: str = "") -> Iterable[tuple[str, dict[str, Any]]]:
    if isinstance(value, dict):
        for child_key, child in value.items():
            if child_key.endswith("Texture") and isinstance(child, dict):
                if isinstance(child.get("index"), int):
                    yield child_key, child
            yield from iter_texture_infos(child, child_key)
    elif isinstance(value, list):
        for child in value:
            yield from iter_texture_infos(child, key)


def accessor_values(
    document: dict[str, Any], binary: bytes, accessor_index: int
) -> Iterable[tuple[float | int, ...]]:
    accessor = document["accessors"][accessor_index]
    if accessor.get("sparse"):
        raise ValueError("Sparse COLOR_0 accessors are not expected in this asset")
    view = document["bufferViews"][accessor["bufferView"]]
    if view.get("buffer", 0) != 0:
        raise ValueError("Only the embedded GLB buffer is supported")

    component_type = accessor["componentType"]
    component_format, component_bytes = COMPONENT_FORMATS[component_type]
    component_count = TYPE_COMPONENTS[accessor["type"]]
    packed_bytes = component_count * component_bytes
    stride = view.get("byteStride", packed_bytes)
    start = view.get("byteOffset", 0) + accessor.get("byteOffset", 0)
    unpack_format = "<" + component_format * component_count

    for index in range(accessor["count"]):
        offset = start + index * stride
        yield struct.unpack_from(unpack_format, binary, offset)


def assert_white_vertex_color(
    document: dict[str, Any], binary: bytes, accessor_index: int
) -> None:
    accessor = document["accessors"][accessor_index]
    if accessor["type"] not in {"VEC3", "VEC4"}:
        raise ValueError(f"Unexpected COLOR_0 type: {accessor['type']}")
    component_type = accessor["componentType"]
    if not accessor.get("normalized") or component_type not in {5121, 5123}:
        raise ValueError("COLOR_0 must be a normalized unsigned integer accessor")
    expected = 255 if component_type == 5121 else 65535
    for vertex_index, values in enumerate(
        accessor_values(document, binary, accessor_index)
    ):
        if any(value != expected for value in values):
            raise ValueError(
                "Refusing to remove non-white COLOR_0 data at "
                f"accessor={accessor_index} vertex={vertex_index} values={values}"
            )


def remove_redundant_attributes(
    document: dict[str, Any], binary: bytes
) -> Counter[str]:
    removed: Counter[str] = Counter()
    materials = document.get("materials", [])

    for mesh in document.get("meshes", []):
        for primitive in mesh.get("primitives", []):
            attributes = primitive.get("attributes", {})
            material = (
                materials[primitive["material"]]
                if isinstance(primitive.get("material"), int)
                else {}
            )
            texture_infos = list(iter_texture_infos(material))

            color_accessor = attributes.get("COLOR_0")
            if isinstance(color_accessor, int):
                assert_white_vertex_color(document, binary, color_accessor)
                del attributes["COLOR_0"]
                removed["COLOR_0"] += 1

            if "TEXCOORD_1" in attributes and not any(
                info.get("texCoord", 0) == 1 for _, info in texture_infos
            ):
                del attributes["TEXCOORD_1"]
                removed["TEXCOORD_1"] += 1

            if "TEXCOORD_0" in attributes and not texture_infos:
                del attributes["TEXCOORD_0"]
                removed["TEXCOORD_0"] += 1

            normal_texture_infos = [
                info
                for slot, info in texture_infos
                if slot in {"normalTexture", "clearcoatNormalTexture"}
            ]
            if "TANGENT" in attributes and not normal_texture_infos:
                del attributes["TANGENT"]
                removed["TANGENT"] += 1

    return removed


def attribute_counts(document: dict[str, Any]) -> Counter[str]:
    counts: Counter[str] = Counter()
    for mesh in document.get("meshes", []):
        for primitive in mesh.get("primitives", []):
            counts.update(primitive.get("attributes", {}).keys())
    return counts


def triangle_count(document: dict[str, Any]) -> int:
    total = 0
    for mesh in document.get("meshes", []):
        for primitive in mesh.get("primitives", []):
            if primitive.get("mode", 4) != 4 or "indices" not in primitive:
                raise ValueError("LOD0 expects indexed TRIANGLES primitives")
            index_accessor = document["accessors"][primitive["indices"]]
            if index_accessor["count"] % 3:
                raise ValueError("Triangle index count must be divisible by three")
            total += index_accessor["count"] // 3
    return total


def node_by_name(document: dict[str, Any], name: str) -> dict[str, Any]:
    matches = [node for node in document.get("nodes", []) if node.get("name") == name]
    if len(matches) != 1:
        raise ValueError(f"Expected exactly one node named {name!r}, found {len(matches)}")
    return matches[0]


def anchor_signature(node: dict[str, Any]) -> dict[str, Any]:
    return {
        key: node[key]
        for key in ("name", "translation", "rotation", "scale", "matrix", "extras")
        if key in node
    }


def asset_summary(document: dict[str, Any]) -> dict[str, Any]:
    image_bytes = 0
    for image in document.get("images", []):
        view_index = image.get("bufferView")
        if isinstance(view_index, int):
            image_bytes += document["bufferViews"][view_index]["byteLength"]
    return {
        "triangles": triangle_count(document),
        "nodes": len(document.get("nodes", [])),
        "meshes": len(document.get("meshes", [])),
        "materials": len(document.get("materials", [])),
        "textures": len(document.get("textures", [])),
        "images": len(document.get("images", [])),
        "embedded_image_bytes": image_bytes,
        "attributes": dict(sorted(attribute_counts(document).items())),
        "extensions_used": document.get("extensionsUsed", []),
        "extensions_required": document.get("extensionsRequired", []),
    }


def run(command: list[str]) -> str:
    print("RUN " + " ".join(command), flush=True)
    completed = subprocess.run(
        command,
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )
    if completed.stdout:
        print(completed.stdout, end="")
    return completed.stdout


def validate_invariants(
    source: dict[str, Any], output: dict[str, Any], max_bytes: int, output_path: Path
) -> None:
    if output_path.stat().st_size > max_bytes:
        raise ValueError(
            f"LOD0 exceeds byte budget: {output_path.stat().st_size} > {max_bytes}"
        )
    if triangle_count(output) != triangle_count(source):
        raise ValueError("Conservative LOD0 changed the triangle count")
    for collection in ("meshes", "materials"):
        source_names = sorted(item.get("name") for item in source.get(collection, []))
        output_names = sorted(item.get("name") for item in output.get(collection, []))
        if output_names != source_names:
            raise ValueError(f"Conservative LOD0 changed {collection} names")

    source_scene_extras = source.get("scenes", [{}])[0].get("extras")
    output_scene_extras = output.get("scenes", [{}])[0].get("extras")
    if output_scene_extras != source_scene_extras:
        raise ValueError("LOD0 did not preserve the source attribution extras")
    if not output_scene_extras or output_scene_extras.get("source_noai") is not True:
        raise ValueError("LOD0 is missing the source NoAI marker")

    for anchor in EXPECTED_ANCHORS:
        if anchor_signature(node_by_name(output, anchor)) != anchor_signature(
            node_by_name(source, anchor)
        ):
            raise ValueError(f"LOD0 changed annotation anchor {anchor}")

    counts = attribute_counts(output)
    if counts.get("COLOR_0", 0) or counts.get("TEXCOORD_1", 0):
        raise ValueError("LOD0 retained a proven-redundant vertex attribute")
    if counts.get("TANGENT") != 7 or counts.get("TEXCOORD_0") != 13:
        raise ValueError(f"Unexpected optimized attribute counts: {dict(counts)}")

    required = set(output.get("extensionsRequired", []))
    expected_required = {
        "EXT_meshopt_compression",
        "EXT_texture_webp",
        "KHR_mesh_quantization",
    }
    if not expected_required.issubset(required):
        raise ValueError(
            f"LOD0 is missing required extensions: {expected_required - required}"
        )


def atomic_write_json(path: Path, payload: dict[str, Any]) -> None:
    temporary = path.with_name(path.name + ".tmp")
    temporary.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    os.replace(temporary, path)


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
        raise ValueError(
            "Unexpected source SHA-256; inspect and update the pipeline deliberately: "
            f"{source_digest}"
        )

    source_document, source_binary = read_glb(source_path)
    source_extras = source_document.get("scenes", [{}])[0].get("extras", {})
    if source_extras.get("source_license") != "Free Standard":
        raise ValueError("The recorded source license changed or is missing")
    if source_extras.get("source_noai") is not True:
        raise ValueError("The recorded NoAI restriction changed or is missing")

    stripped_document = json.loads(json.dumps(source_document))
    removed = remove_redundant_attributes(stripped_document, source_binary)
    expected_removed = Counter(
        {"COLOR_0": 32, "TEXCOORD_1": 11, "TEXCOORD_0": 19, "TANGENT": 25}
    )
    if removed != expected_removed:
        raise ValueError(
            f"Source attribute inventory drifted: removed={dict(removed)} "
            f"expected={dict(expected_removed)}"
        )

    with tempfile.TemporaryDirectory(prefix="exportech-apple-lod0-") as temp_dir:
        temp = Path(temp_dir)
        stripped_path = temp / "stripped.glb"
        webp_path = temp / "lossless-webp.glb"
        candidate_path = temp / "lod0.glb"
        write_glb(stripped_path, stripped_document, source_binary)

        cli = [
            args.npx,
            "--yes",
            f"@gltf-transform/cli@{GLTF_TRANSFORM_VERSION}",
        ]
        run(
            [
                *cli,
                "webp",
                str(stripped_path),
                str(webp_path),
                "--formats",
                "png",
                "--lossless",
                "true",
                "--effort",
                "100",
            ]
        )
        run(
            [
                *cli,
                "meshopt",
                str(webp_path),
                str(candidate_path),
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
        validator_output = run([*cli, "validate", str(candidate_path)])
        if "No errors found" not in validator_output or "No warnings found" not in validator_output:
            raise ValueError("glTF Validator reported errors or warnings")

        output_document, _ = read_glb(candidate_path)
        validate_invariants(source_document, output_document, args.max_bytes, candidate_path)
        output_digest = sha256(candidate_path)
        output_bytes = candidate_path.stat().st_size
        shutil.copyfile(candidate_path, output_path)

    manifest = {
        "date": date.today().isoformat(),
        "pipeline": {
            "script": "tools/3d/build_apple_user_lod0.py",
            "gltf_transform": GLTF_TRANSFORM_VERSION,
            "local_only": True,
            "source_uploaded": False,
        },
        "source": {
            "filename": source_path.name,
            "bytes": source_path.stat().st_size,
            "sha256": source_digest,
            "summary": asset_summary(source_document),
        },
        "output": {
            "filename": output_path.name,
            "bytes": output_bytes,
            "sha256": output_digest,
            "reduction_percent": round(
                (1 - output_bytes / source_path.stat().st_size) * 100, 2
            ),
            "max_bytes": args.max_bytes,
            "summary": asset_summary(output_document),
        },
        "changes": {
            "removed_attribute_bindings": dict(sorted(removed.items())),
            "png_to_webp": "lossless",
            "meshopt_level": "high",
            "quantization": {
                "position_bits": 16,
                "normal_bits": 12,
                "texcoord_bits": 14,
            },
            "topology_simplified": False,
            "materials_changed": False,
            "textures_resized": False,
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
            "mesh_and_material_names_equal": True,
            "anchors_preserved": sorted(EXPECTED_ANCHORS),
            "scene_attribution_preserved": True,
        },
    }
    atomic_write_json(manifest_path, manifest)
    print(
        "APPLE_USER_LOD0_BUILT "
        f"bytes={output_bytes} sha256={output_digest} "
        f"triangles={triangle_count(output_document)} "
        f"reduction={manifest['output']['reduction_percent']}%"
    )


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, subprocess.CalledProcessError) as error:
        print(f"APPLE_USER_LOD0_FAILED {error}", file=sys.stderr)
        raise
