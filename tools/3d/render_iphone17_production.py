"""Render consistent production evidence from the prepared Blender scene."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import bpy
import mathutils


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--poster", required=True)
    parser.add_argument("--mobile-fallback", required=True)
    blender_args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    return parser.parse_args(blender_args)


def point_at(obj: bpy.types.Object, target: tuple[float, float, float]) -> None:
    direction = mathutils.Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def create_material(
    name: str,
    color: tuple[float, float, float, float],
    metallic: float,
    roughness: float,
) -> bpy.types.Material:
    material = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    material.use_nodes = True
    principled = next(
        node for node in material.node_tree.nodes if node.type == "BSDF_PRINCIPLED"
    )
    principled.inputs["Base Color"].default_value = color
    principled.inputs["Metallic"].default_value = metallic
    principled.inputs["Roughness"].default_value = roughness
    return material


def create_studio() -> None:
    previous = bpy.data.collections.get("STUDIO_RUNTIME")
    if previous:
        for obj in list(previous.objects):
            bpy.data.objects.remove(obj, do_unlink=True)
        bpy.data.collections.remove(previous)
    collection = bpy.data.collections.new("STUDIO_RUNTIME")
    bpy.context.scene.collection.children.link(collection)

    world = bpy.context.scene.world
    world.use_nodes = True
    background = world.node_tree.nodes.get("Background")
    background.inputs["Color"].default_value = (0.0012, 0.0022, 0.0048, 1)
    background.inputs["Strength"].default_value = 0.035

    lights = (
        ("Cool key", (-0.17, 0.17, 0.23), 10, 0.14, (0.50, 0.68, 1.0), (0, 0, 0.09)),
        ("Warm rim", (0.17, -0.12, 0.19), 4.5, 0.11, (1.0, 0.48, 0.20), (0, 0, 0.10)),
        ("Rear cool", (-0.13, -0.17, 0.14), 3.5, 0.13, (0.42, 0.62, 1.0), (0, -0.004, 0.10)),
        ("Top strip", (0.01, 0.00, 0.30), 8, 0.16, (0.82, 0.90, 1.0), (0, 0, 0.09)),
        ("Front soft fill", (0.13, 0.20, 0.08), 3, 0.18, (0.72, 0.82, 1.0), (0, 0.003, 0.08)),
    )
    for name, position, energy, size, color, target in lights:
        data = bpy.data.lights.new(name, "AREA")
        data.energy = energy
        data.shape = "DISK"
        data.size = size
        data.color = color
        light = bpy.data.objects.new(name, data)
        collection.objects.link(light)
        light.location = position
        point_at(light, target)

    floor_material = create_material(
        "EX_Studio_Floor", (0.0025, 0.004, 0.008, 1), 0.06, 0.30
    )
    bpy.ops.mesh.primitive_plane_add(size=1.2, location=(0, 0, -0.004))
    floor = bpy.context.object
    floor.name = "studio_floor"
    for current in list(floor.users_collection):
        current.objects.unlink(floor)
    collection.objects.link(floor)
    floor.data.materials.append(floor_material)


def configure_render(width: int = 800, height: int = 800) -> None:
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.eevee.taa_render_samples = 64
    scene.eevee.use_gtao = True
    scene.eevee.gtao_distance = 0.06
    scene.eevee.gtao_factor = 1.05
    scene.eevee.use_bloom = False
    scene.view_settings.view_transform = "Filmic"
    scene.view_settings.look = "Medium High Contrast"
    scene.view_settings.exposure = -0.35
    scene.view_settings.gamma = 1.0
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    scene.render.resolution_percentage = 100
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.color_depth = "8"
    scene.render.film_transparent = False
    scene.camera.data.dof.use_dof = False


def set_display_state(on: bool, show_mark: bool = False) -> None:
    display = bpy.data.objects["display"]
    material_name = display["screen_state_soft_on"] if on else display["screen_state_off"]
    material = bpy.data.materials[material_name]
    display.data.materials.clear()
    display.data.materials.append(material)
    mark = bpy.data.objects["display_logo_placeholder"]
    mark.hide_render = not show_mark
    mark.hide_viewport = not show_mark


def render(
    camera_name: str,
    frame: int,
    output: Path,
    *,
    display_on: bool = False,
    show_mark: bool = False,
    file_format: str = "PNG",
    width: int = 800,
    height: int = 800,
) -> None:
    scene = bpy.context.scene
    scene.camera = bpy.data.objects[camera_name]
    scene.frame_set(frame)
    configure_render(width, height)
    set_display_state(display_on, show_mark)
    scene.render.image_settings.file_format = file_format
    if file_format == "WEBP":
        scene.render.image_settings.quality = 82
    scene.render.filepath = str(output)
    bpy.ops.render.render(write_still=True)


def main() -> None:
    args = parse_args()
    output_dir = Path(args.output_dir).resolve()
    poster = Path(args.poster).resolve()
    mobile_fallback = Path(args.mobile_fallback).resolve()
    sequence_dir = output_dir / "exploded-sequence"
    for path in (output_dir, poster.parent, mobile_fallback.parent, sequence_dir):
        path.mkdir(parents=True, exist_ok=True)

    required = (
        "phone_body",
        "rear_plateau",
        "rear_glass",
        "front_glass",
        "display",
        "camera_main_glass",
        "camera_main_ring",
        "camera_ultrawide_glass",
        "camera_ultrawide_ring",
        "camera_telephoto_glass",
        "camera_telephoto_ring",
    )
    missing = [name for name in required if name not in bpy.data.objects]
    if missing:
        raise RuntimeError(f"Prepared scene is missing: {', '.join(missing)}")

    create_studio()
    render("camera_front", 1, output_dir / "01-front-off.png")
    render("camera_front", 1, output_dir / "02-front-on.png", display_on=True, show_mark=True)
    render("camera_side", 1, output_dir / "03-side.png")
    render("camera_back", 1, output_dir / "04-back.png")
    render("camera_close", 1, output_dir / "05-camera-close.png")
    render("camera_close", 48, output_dir / "06-camera-exploded.png")
    render("camera_close_side", 48, output_dir / "07-camera-exploded-side.png")

    render("camera_front", 1, poster, file_format="WEBP", width=800, height=800)
    render("camera_front", 1, mobile_fallback, file_format="WEBP", width=480, height=600)

    sequence = (
        (1, "01-assembled.webp"),
        (12, "02-separation-start.webp"),
        (28, "03-partially-expanded.webp"),
        (48, "04-fully-presented.webp"),
        (64, "05-returning.webp"),
        (80, "06-assembled-return.webp"),
    )
    for frame, filename in sequence:
        render(
            "camera_close",
            frame,
            sequence_dir / filename,
            file_format="WEBP",
            width=512,
            height=512,
        )
    set_display_state(False, False)
    bpy.context.scene.frame_set(1)
    print(f"IPHONE17_RENDERS output={output_dir} count={7 + len(sequence) + 2}")


if __name__ == "__main__":
    main()
