"""Render a downloaded GLB candidate under Exportech's neutral studio lights."""

from __future__ import annotations

import argparse
import math
import sys
from pathlib import Path

import bpy
import mathutils


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", required=True)
    parser.add_argument("--output-dir", required=True)
    blender_args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    return parser.parse_args(blender_args)


def point_at(obj: bpy.types.Object, target: tuple[float, float, float]) -> None:
    direction = mathutils.Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def normalize_model(meshes: list[bpy.types.Object], target_height: float = 3.268) -> None:
    corners = [obj.matrix_world @ mathutils.Vector(corner) for obj in meshes for corner in obj.bound_box]
    minimum = mathutils.Vector(tuple(min(point[i] for point in corners) for i in range(3)))
    maximum = mathutils.Vector(tuple(max(point[i] for point in corners) for i in range(3)))
    center = (minimum + maximum) * 0.5
    scale = target_height / (maximum.z - minimum.z)
    for obj in meshes:
        obj.location = (obj.location - center) * scale
        obj.scale *= scale


def create_studio() -> bpy.types.Object:
    world = bpy.context.scene.world
    world.use_nodes = True
    background = world.node_tree.nodes.get("Background")
    background.inputs["Color"].default_value = (0.002, 0.0035, 0.0065, 1)
    background.inputs["Strength"].default_value = 0.23

    lights = (
        ("Cool key", (-3.9, -3.0, 4.5), 980, 3.3, (0.55, 0.74, 1.0)),
        ("Warm rim", (3.8, 1.4, 3.4), 1100, 2.6, (1.0, 0.48, 0.18)),
        ("Rear softbox", (-2.4, 4.0, 1.5), 1050, 3.6, (0.46, 0.67, 1.0)),
        ("Top strip", (0.2, 0.0, 5.2), 760, 3.2, (0.86, 0.92, 1.0)),
    )
    for name, position, energy, size, color in lights:
        data = bpy.data.lights.new(name, "AREA")
        data.energy = energy
        data.shape = "RECTANGLE"
        data.size = size
        data.color = color
        light = bpy.data.objects.new(name, data)
        bpy.context.collection.objects.link(light)
        light.location = position
        point_at(light, (0, 0, 0.25))

    camera_data = bpy.data.cameras.new("Candidate camera")
    camera = bpy.data.objects.new("Candidate camera", camera_data)
    bpy.context.collection.objects.link(camera)
    bpy.context.scene.camera = camera
    return camera


def configure_render() -> None:
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.eevee.taa_render_samples = 64
    scene.eevee.use_gtao = True
    scene.eevee.gtao_distance = 3
    scene.eevee.gtao_factor = 1.05
    scene.eevee.use_bloom = True
    scene.eevee.bloom_intensity = 0.018
    scene.view_settings.look = "Medium High Contrast"
    scene.render.resolution_x = 800
    scene.render.resolution_y = 800
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"


def render(
    camera: bpy.types.Object,
    output: Path,
    location: tuple[float, float, float],
    target: tuple[float, float, float],
    lens: float,
) -> None:
    camera.location = location
    camera.data.lens = lens
    point_at(camera, target)
    bpy.context.scene.render.filepath = str(output)
    bpy.ops.render.render(write_still=True)


def main() -> None:
    args = parse_args()
    source = Path(args.file).resolve()
    output_dir = Path(args.output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    bpy.ops.import_scene.gltf(filepath=str(source))
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not meshes:
        raise RuntimeError("Candidate GLB contains no meshes")
    normalize_model(meshes)
    camera = create_studio()
    configure_render()

    render(camera, output_dir / "01-back.png", (0.18, -5.9, 0.16), (0, 0, 0.02), 61)
    render(camera, output_dir / "02-front-angle.png", (3.15, 5.2, 2.1), (0, 0.06, 0.32), 60)
    render(camera, output_dir / "03-dynamic-island-close.png", (1.75, 4.0, 2.2), (-0.25, 0.16, 1.05), 82)


if __name__ == "__main__":
    main()
