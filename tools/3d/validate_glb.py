"""Import a GLB in a clean Blender scene and report basic asset health."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import bpy
import mathutils


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", required=True)
    blender_args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    args = parser.parse_args(blender_args)
    path = Path(args.file).resolve()
    if not path.is_file():
        raise FileNotFoundError(path)

    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    bpy.ops.import_scene.gltf(filepath=str(path))

    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    triangles = sum(len(obj.data.loop_triangles) for obj in meshes)
    for obj in meshes:
        obj.data.calc_loop_triangles()
    triangles = sum(len(obj.data.loop_triangles) for obj in meshes)
    materials = {slot.material.name for obj in meshes for slot in obj.material_slots if slot.material}
    if not meshes or not materials:
        raise RuntimeError("GLB import did not contain the expected meshes and materials")

    world_corners = [obj.matrix_world @ mathutils.Vector(corner) for obj in meshes for corner in obj.bound_box]
    minimum = mathutils.Vector(tuple(min(point[i] for point in world_corners) for i in range(3)))
    maximum = mathutils.Vector(tuple(max(point[i] for point in world_corners) for i in range(3)))
    dimensions = maximum - minimum

    print(
        "GLB_VALID "
        f"file={path.name} meshes={len(meshes)} materials={len(materials)} "
        f"triangles={triangles} bytes={path.stat().st_size} "
        f"dimensions=({dimensions.x:.4f},{dimensions.y:.4f},{dimensions.z:.4f})"
    )
    print("GLB_MESHES " + ", ".join(obj.name for obj in meshes))
    print("GLB_MATERIALS " + ", ".join(sorted(materials)))


if __name__ == "__main__":
    main()
