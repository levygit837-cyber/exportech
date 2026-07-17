"""Export the prepared Apple User master as a compact, uncompressed web GLB."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from collections import defaultdict
from datetime import date
from pathlib import Path
from typing import Any

import bpy


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--source-manifest", required=True)
    blender_args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    return parser.parse_args(blender_args)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def safe_name(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", value.lower()).strip("_")[:48]


def create_runtime_collection() -> bpy.types.Collection:
    previous = bpy.data.collections.get("EXPORT_RUNTIME")
    if previous:
        for obj in list(previous.objects):
            bpy.data.objects.remove(obj, do_unlink=True)
        bpy.data.collections.remove(previous)
    collection = bpy.data.collections.new("EXPORT_RUNTIME")
    bpy.context.scene.collection.children.link(collection)
    return collection


def duplicate_meshes(collection: bpy.types.Collection) -> list[bpy.types.Object]:
    source_collection = bpy.data.collections.get("WEB_MODEL")
    if not source_collection:
        raise RuntimeError("Prepared scene is missing WEB_MODEL")
    duplicates: list[bpy.types.Object] = []
    # Snapshot Blender's RNA collection before linking duplicates. Iterating
    # the live `all_objects` view while mutating scene collections can crash
    # Blender 3.6 on macOS.
    for source in list(source_collection.all_objects):
        if source.type != "MESH" or not bool(source.get("export_for_web", False)):
            continue
        duplicate = source.copy()
        duplicate.data = source.data.copy()
        duplicate.parent = None
        duplicate.matrix_world = source.matrix_world.copy()
        duplicate.hide_render = False
        duplicate.hide_viewport = False
        duplicate.hide_set(False)
        collection.objects.link(duplicate)
        duplicates.append(duplicate)
    if not duplicates:
        raise RuntimeError("No remastered meshes were available for export")
    return duplicates


def join_by_material(objects: list[bpy.types.Object]) -> list[bpy.types.Object]:
    grouped: dict[tuple[str, ...], list[bpy.types.Object]] = defaultdict(list)
    for obj in objects:
        materials = tuple(
            slot.material.name if slot.material else "none" for slot in obj.material_slots
        )
        grouped[materials].append(obj)

    result: list[bpy.types.Object] = []
    for index, (materials, group) in enumerate(sorted(grouped.items()), 1):
        bpy.ops.object.select_all(action="DESELECT")
        for obj in group:
            obj.select_set(True)
        active = group[0]
        bpy.context.view_layer.objects.active = active
        if len(group) > 1:
            bpy.ops.object.join()
        material_label = materials[0] if materials else "none"
        active.name = f"web_{index:02d}_{safe_name(material_label)}"
        active["source_mesh_count"] = len(group)
        active["export_for_web"] = True
        result.append(active)
    return result


def duplicate_anchors(collection: bpy.types.Collection) -> list[bpy.types.Object]:
    anchor_collection = bpy.data.collections.get("ANNOTATION_ANCHORS")
    if not anchor_collection:
        raise RuntimeError("Prepared scene is missing ANNOTATION_ANCHORS")
    anchors: list[bpy.types.Object] = []
    for source in list(anchor_collection.all_objects):
        if not bool(source.get("export_for_web", False)):
            continue
        exported_name = source.name.split(".", 1)[0]
        # Free the canonical name inside this unsaved runtime scene so the GLB
        # exposes stable anchor names without Blender's `.001` suffix.
        source.name = f"master_{exported_name}"
        duplicate = source.copy()
        duplicate.name = exported_name
        duplicate.parent = None
        duplicate.matrix_world = source.matrix_world.copy()
        collection.objects.link(duplicate)
        anchors.append(duplicate)
    return anchors


def remove_runtime(collection: bpy.types.Collection) -> None:
    for obj in list(collection.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    bpy.data.collections.remove(collection)


def main() -> None:
    args = parse_args()
    output = Path(args.output).resolve()
    manifest_path = Path(args.manifest).resolve()
    source_manifest_path = Path(args.source_manifest).resolve()
    if not source_manifest_path.is_file():
        raise FileNotFoundError(source_manifest_path)
    source_manifest: dict[str, Any] = json.loads(
        source_manifest_path.read_text(encoding="utf-8")
    )
    output.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.parent.mkdir(parents=True, exist_ok=True)

    runtime = create_runtime_collection()
    meshes = join_by_material(duplicate_meshes(runtime))
    anchors = duplicate_anchors(runtime)

    bpy.ops.object.select_all(action="DESELECT")
    for obj in [*meshes, *anchors]:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    bpy.ops.export_scene.gltf(
        filepath=str(output),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_texcoords=True,
        export_normals=True,
        export_tangents=True,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
        export_extras=True,
        export_animations=False,
        export_image_format="AUTO",
    )
    if not output.is_file():
        raise RuntimeError("The Blender glTF exporter did not create the requested GLB")

    triangles = 0
    material_names: set[str] = set()
    object_entries: list[dict[str, Any]] = []
    draw_calls = 0
    for obj in meshes:
        obj.data.calc_loop_triangles()
        count = len(obj.data.loop_triangles)
        triangles += count
        slot_names = [
            slot.material.name for slot in obj.material_slots if slot.material
        ]
        draw_calls += max(1, len(slot_names))
        material_names.update(slot_names)
        object_entries.append(
            {
                "name": obj.name,
                "triangles": count,
                "materials": slot_names,
                "source_mesh_count": int(obj.get("source_mesh_count", 1)),
            }
        )

    manifest = {
        "date": date.today().isoformat(),
        "blender_version": bpy.app.version_string,
        "asset": {
            "filename": output.name,
            "bytes": output.stat().st_size,
            "sha256": sha256(output),
            "triangles": triangles,
            "meshes": len(meshes),
            "materials": len(material_names),
            "draw_calls_estimate": draw_calls,
            "anchors": [anchor.name for anchor in anchors],
        },
        "settings": {
            "format": "GLB",
            "draco": False,
            "topology_decimated": False,
            "merged_by_material": True,
            "tangents_exported": True,
            "animations_exported": False,
            "cameras_exported": False,
            "lights_exported": False,
            "extras_exported": True,
        },
        "objects": object_entries,
        "source": source_manifest["source"],
        "runtime": source_manifest["runtime"],
        "cameras": source_manifest["cameras"],
        "annotations": source_manifest["anchors"],
        "attribution": bpy.context.scene.get(
            "attribution",
            "Modelo 3D de demonstração por Apple User no Sketchfab. Modelo não oficial.",
        ),
    }
    manifest_path.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    print(
        "APPLE_USER_WEB_EXPORTED "
        f"meshes={len(meshes)} triangles={triangles} materials={len(material_names)} "
        f"draw_calls={draw_calls} bytes={output.stat().st_size} sha256={manifest['asset']['sha256']}"
    )
    remove_runtime(runtime)


if __name__ == "__main__":
    main()
