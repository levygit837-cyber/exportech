"""Validate the local Blender pipeline with a lightweight phone blockout."""

from __future__ import annotations

import argparse
import math
from pathlib import Path

import bpy


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", required=True)
    args = []
    if "--" in __import__("sys").argv:
        args = __import__("sys").argv[__import__("sys").argv.index("--") + 1 :]
    return parser.parse_args(args)


def reset_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.materials, bpy.data.cameras, bpy.data.lights):
        for datablock in list(datablocks):
            if datablock.users == 0:
                datablocks.remove(datablock)


def material(
    name: str,
    color: tuple[float, float, float, float],
    *,
    metallic: float = 0.0,
    roughness: float = 0.45,
    emission: tuple[float, float, float, float] | None = None,
    emission_strength: float = 0.0,
) -> bpy.types.Material:
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = color
    shader.inputs["Metallic"].default_value = metallic
    shader.inputs["Roughness"].default_value = roughness
    if emission is not None:
        shader.inputs["Emission"].default_value = emission
        shader.inputs["Emission Strength"].default_value = emission_strength
    return mat


def rounded_cube(
    name: str,
    location: tuple[float, float, float],
    scale: tuple[float, float, float],
    bevel: float,
    mat: bpy.types.Material,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bevel_modifier = obj.modifiers.new("Precision bevel", "BEVEL")
    bevel_modifier.width = bevel
    bevel_modifier.segments = 5
    bevel_modifier.limit_method = "ANGLE"
    obj.data.materials.append(mat)
    return obj


def create_phone() -> list[bpy.types.Object]:
    aluminum = material(
        "Brushed aluminum",
        (0.09, 0.11, 0.14, 1.0),
        metallic=0.92,
        roughness=0.2,
    )
    glass = material(
        "Display glass",
        (0.004, 0.006, 0.012, 1.0),
        metallic=0.08,
        roughness=0.08,
        emission=(0.015, 0.09, 0.16, 1.0),
        emission_strength=0.6,
    )
    lens = material(
        "Camera lens",
        (0.005, 0.008, 0.014, 1.0),
        metallic=0.25,
        roughness=0.08,
    )

    phone = [
        rounded_cube("Phone chassis", (0, 0, 0), (1.56, 0.17, 3.268), 0.18, aluminum),
        rounded_cube("Display", (0, -0.091, 0), (1.47, 0.025, 3.12), 0.14, glass),
    ]

    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -0.111, 1.24))
    island = bpy.context.object
    island.name = "Front sensor island"
    island.dimensions = (0.42, 0.03, 0.105)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    island_bevel = island.modifiers.new("Island bevel", "BEVEL")
    island_bevel.width = 0.055
    island_bevel.segments = 5
    island.data.materials.append(lens)
    phone.append(island)

    for x in (-0.35, 0.0, 0.35):
        bpy.ops.mesh.primitive_torus_add(
            major_radius=0.11,
            minor_radius=0.035,
            major_segments=36,
            minor_segments=10,
            location=(x, 0.115, 1.08),
            rotation=(math.radians(90), 0, 0),
        )
        ring = bpy.context.object
        ring.name = f"Camera ring {x:+.2f}"
        ring.data.materials.append(aluminum)
        phone.append(ring)

        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=32,
            ring_count=16,
            radius=0.085,
            location=(x, 0.155, 1.08),
        )
        camera_lens = bpy.context.object
        camera_lens.name = f"Camera lens {x:+.2f}"
        camera_lens.scale.y = 0.2
        camera_lens.data.materials.append(lens)
        phone.append(camera_lens)

    return phone


def point_at(obj: bpy.types.Object, target: tuple[float, float, float]) -> None:
    direction = mathutils.Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def create_studio() -> None:
    world = bpy.context.scene.world
    world.use_nodes = True
    background = world.node_tree.nodes.get("Background")
    background.inputs["Color"].default_value = (0.003, 0.005, 0.009, 1.0)
    background.inputs["Strength"].default_value = 0.18

    for name, location, energy, size, color in (
        ("Key", (-3.5, -3.0, 4.2), 850, 3.2, (0.72, 0.86, 1.0)),
        ("Rim", (3.7, 0.7, 2.8), 1100, 2.4, (1.0, 0.54, 0.25)),
        ("Fill", (0.0, -4.0, -1.4), 500, 2.8, (0.3, 0.48, 1.0)),
    ):
        data = bpy.data.lights.new(name, "AREA")
        data.energy = energy
        data.shape = "RECTANGLE"
        data.size = size
        data.color = color
        light = bpy.data.objects.new(name, data)
        bpy.context.collection.objects.link(light)
        light.location = location
        point_at(light, (0, 0, 0.2))

    camera_data = bpy.data.cameras.new("Approval camera")
    camera_data.lens = 56
    camera = bpy.data.objects.new("Approval camera", camera_data)
    bpy.context.collection.objects.link(camera)
    camera.location = (3.55, -5.4, 2.35)
    point_at(camera, (0, 0, 0.18))
    bpy.context.scene.camera = camera


def configure_render(output_path: Path) -> None:
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.eevee.taa_render_samples = 48
    scene.eevee.use_gtao = True
    scene.eevee.gtao_distance = 3
    scene.eevee.gtao_factor = 1.2
    scene.eevee.use_bloom = True
    scene.eevee.bloom_intensity = 0.035
    scene.view_settings.look = "Medium High Contrast"
    scene.render.resolution_x = 720
    scene.render.resolution_y = 720
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = str(output_path)
    scene.render.film_transparent = False


def export_glb(objects: list[bpy.types.Object], output_path: Path) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.export_scene.gltf(
        filepath=str(output_path),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
    )


def main() -> None:
    args = parse_args()
    output_dir = Path(args.output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    reset_scene()
    phone_objects = create_phone()
    create_studio()
    configure_render(output_dir / "diagnostic-phone.png")
    export_glb(phone_objects, output_dir / "diagnostic-phone.glb")
    bpy.ops.wm.save_as_mainfile(filepath=str(output_dir / "diagnostic-phone.blend"))
    bpy.ops.render.render(write_still=True)


if __name__ == "__main__":
    import mathutils

    main()
