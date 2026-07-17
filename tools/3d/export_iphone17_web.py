"""Export the prepared iPhone model as an optimized, attributable web GLB."""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from datetime import date
from pathlib import Path

import bpy


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    parser.add_argument("--manifest", required=True)
    parser.add_argument(
        "--draco",
        action="store_true",
        help="Optionally enable Draco after the consuming frontend has been validated with it.",
    )
    blender_args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    return parser.parse_args(blender_args)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> None:
    args = parse_args()
    output = Path(args.output).resolve()
    manifest_path = Path(args.manifest).resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.parent.mkdir(parents=True, exist_ok=True)

    scene = bpy.context.scene
    scene.frame_set(1)
    display = bpy.data.objects.get("display")
    if display:
        off_material = bpy.data.materials.get(display.get("screen_state_off", "EX_Display_Off"))
        if off_material:
            display.data.materials.clear()
            display.data.materials.append(off_material)

    export_objects = sorted(
        (
            obj
            for obj in scene.objects
            if obj.type == "MESH" and bool(obj.get("export_for_web", False))
        ),
        key=lambda obj: obj.name,
    )
    if not export_objects:
        raise RuntimeError("No production meshes were marked for web export")
    if any(obj.name.startswith("source_reference") for obj in export_objects):
        raise RuntimeError("The source reference must never be included in the web GLB")

    bpy.ops.object.select_all(action="DESELECT")
    for obj in export_objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = export_objects[0]

    export_settings = dict(
        filepath=str(output),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_texcoords=True,
        export_normals=True,
        export_tangents=False,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
        export_extras=True,
        export_animations=True,
        export_frame_range=True,
        export_frame_step=1,
        export_nla_strips=True,
        export_force_sampling=False,
        export_optimize_animation_size=True,
    )
    if args.draco:
        export_settings.update(
            export_draco_mesh_compression_enable=True,
            export_draco_mesh_compression_level=6,
            export_draco_position_quantization=14,
            export_draco_normal_quantization=10,
            export_draco_texcoord_quantization=12,
        )
    bpy.ops.export_scene.gltf(**export_settings)
    if not output.is_file():
        raise RuntimeError("The Blender glTF exporter did not create the requested GLB")

    materials = sorted(
        {
            slot.material.name
            for obj in export_objects
            for slot in obj.material_slots
            if slot.material
        }
    )
    triangles = 0
    object_entries = []
    for obj in export_objects:
        obj.data.calc_loop_triangles()
        count = len(obj.data.loop_triangles)
        triangles += count
        object_entries.append({"name": obj.name, "triangles": count})

    manifest = {
        "date": date.today().isoformat(),
        "blender_version": bpy.app.version_string,
        "output": output.name,
        "bytes": output.stat().st_size,
        "sha256": sha256(output),
        "objects": object_entries,
        "triangles_before_reimport": triangles,
        "materials_before_reimport": materials,
        "animation": {
            "name": "camera_exploded",
            "frame_start": 1,
            "frame_end": 80,
            "mounted_frames": [1, 80],
            "fully_presented_frame": 48,
        },
        "settings": {
            "format": "GLB",
            "source_geometry_decimated": False,
            "textures_in_production_materials": False,
            "draco": bool(args.draco),
            "draco_level": 6 if args.draco else None,
            "position_quantization_bits": 14 if args.draco else None,
            "normal_quantization_bits": 10 if args.draco else None,
            "texcoord_quantization_bits": 12 if args.draco else None,
            "cameras_exported": False,
            "lights_exported": False,
            "display_state": "off",
        },
        "attribution": scene.get(
            "attribution",
            "Modelo 3D base por Taufiq K no Sketchfab, licenciado sob CC BY 4.0; adaptado e otimizado pela Exportech.",
        ),
    }
    manifest_path.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    print(
        "IPHONE17_WEB_EXPORTED "
        f"objects={len(export_objects)} triangles={triangles} materials={len(materials)} "
        f"bytes={output.stat().st_size} sha256={manifest['sha256']}"
    )


if __name__ == "__main__":
    main()
