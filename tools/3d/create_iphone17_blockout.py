"""Create a lightweight iPhone 17 Pro Max storyboard blockout for Exportech."""

from __future__ import annotations

import argparse
import math
import sys
from pathlib import Path

import bpy
import mathutils


PHONE_WIDTH = 1.56
PHONE_HEIGHT = 3.268
PHONE_DEPTH = 0.175


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", required=True)
    blender_args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    return parser.parse_args(blender_args)


def reset_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)


def make_material(
    name: str,
    base_color: tuple[float, float, float, float],
    *,
    metallic: float,
    roughness: float,
    emission_color: tuple[float, float, float, float] | None = None,
    emission_strength: float = 0.0,
) -> bpy.types.Material:
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = base_color
    shader.inputs["Metallic"].default_value = metallic
    shader.inputs["Roughness"].default_value = roughness
    if emission_color is not None:
        shader.inputs["Emission"].default_value = emission_color
        shader.inputs["Emission Strength"].default_value = emission_strength
    return mat


def make_rounded_box(
    name: str,
    dimensions: tuple[float, float, float],
    location: tuple[float, float, float],
    bevel: float,
    mat: bpy.types.Material,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    modifier = obj.modifiers.new("Manufactured edge", "BEVEL")
    modifier.width = bevel
    modifier.segments = 6
    modifier.limit_method = "ANGLE"
    obj.data.materials.append(mat)
    return obj


def make_disc(
    name: str,
    radius: float,
    depth: float,
    location: tuple[float, float, float],
    mat: bpy.types.Material,
    *,
    vertices: int = 48,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices,
        radius=radius,
        depth=depth,
        location=location,
        rotation=(math.radians(90), 0, 0),
    )
    obj = bpy.context.object
    obj.name = name
    bevel = obj.modifiers.new("Machined rim", "BEVEL")
    bevel.width = min(depth * 0.24, radius * 0.12)
    bevel.segments = 4
    obj.data.materials.append(mat)
    return obj


def create_phone() -> tuple[list[bpy.types.Object], list[bpy.types.Object]]:
    aluminum = make_material(
        "Deep blue anodized aluminum",
        (0.035, 0.095, 0.16, 1),
        metallic=0.92,
        roughness=0.28,
    )
    dark_aluminum = make_material(
        "Dark camera metal",
        (0.012, 0.02, 0.034, 1),
        metallic=0.82,
        roughness=0.2,
    )
    glass = make_material(
        "Ceramic glass",
        (0.018, 0.055, 0.09, 1),
        metallic=0.08,
        roughness=0.2,
    )
    screen = make_material(
        "Powered display",
        (0.003, 0.006, 0.012, 1),
        metallic=0.03,
        roughness=0.08,
        emission_color=(0.025, 0.12, 0.22, 1),
        emission_strength=0.72,
    )
    lens_glass = make_material(
        "Lens glass",
        (0.002, 0.006, 0.014, 1),
        metallic=0.38,
        roughness=0.045,
    )
    sensor = make_material(
        "Sensor coating",
        (0.018, 0.008, 0.055, 1),
        metallic=0.48,
        roughness=0.18,
    )
    white = make_material(
        "Studio white",
        (0.9, 0.94, 1.0, 1),
        metallic=0.0,
        roughness=0.28,
        emission_color=(0.32, 0.46, 0.72, 1),
        emission_strength=0.18,
    )

    product: list[bpy.types.Object] = []
    exploded: list[bpy.types.Object] = []

    product.append(
        make_rounded_box(
            "Unibody chassis",
            (PHONE_WIDTH, PHONE_DEPTH, PHONE_HEIGHT),
            (0, 0, 0),
            0.17,
            aluminum,
        )
    )
    product.append(
        make_rounded_box(
            "Front display",
            (1.48, 0.025, 3.13),
            (0, -0.098, 0),
            0.135,
            screen,
        )
    )
    product.append(
        make_rounded_box(
            "Dynamic sensor island",
            (0.43, 0.023, 0.11),
            (0, -0.116, 1.25),
            0.055,
            dark_aluminum,
        )
    )
    product.append(
        make_rounded_box(
            "Rear glass insert",
            (1.28, 0.02, 1.61),
            (0, 0.101, -0.57),
            0.115,
            glass,
        )
    )
    product.append(
        make_rounded_box(
            "Camera plateau",
            (1.48, 0.105, 0.89),
            (0, 0.112, 1.08),
            0.13,
            aluminum,
        )
    )

    lens_positions = ((-0.43, 1.25), (-0.43, 0.88), (-0.02, 1.05))
    for index, (x, z) in enumerate(lens_positions, start=1):
        outer = make_disc(
            f"Camera {index} outer ring",
            0.195,
            0.105,
            (x, 0.217, z),
            dark_aluminum,
        )
        inner = make_disc(
            f"Camera {index} optical glass",
            0.145,
            0.055,
            (x, 0.29, z),
            lens_glass,
        )
        sensor_disc = make_disc(
            f"Camera {index} sensor",
            0.09,
            0.022,
            (x, 0.326, z),
            sensor,
        )
        product.extend((outer, inner, sensor_disc))
        exploded.extend((outer, inner, sensor_disc))

    product.append(make_disc("Flash", 0.075, 0.025, (0.47, 0.184, 1.23), white))
    product.append(make_disc("LiDAR", 0.06, 0.025, (0.48, 0.184, 0.98), lens_glass))
    product.append(make_disc("Rear microphone", 0.027, 0.018, (0.28, 0.181, 0.86), dark_aluminum))

    product.append(
        make_rounded_box(
            "Action button",
            (0.035, 0.075, 0.28),
            (-0.797, -0.01, 0.78),
            0.018,
            aluminum,
        )
    )
    product.append(
        make_rounded_box(
            "Volume controls",
            (0.035, 0.075, 0.58),
            (-0.797, -0.01, 0.17),
            0.018,
            aluminum,
        )
    )
    product.append(
        make_rounded_box(
            "Camera control",
            (0.035, 0.075, 0.38),
            (0.797, -0.01, -0.48),
            0.018,
            aluminum,
        )
    )

    for obj in product:
        obj["exportech_asset"] = True
    return product, exploded


def point_at(obj: bpy.types.Object, target: tuple[float, float, float]) -> None:
    direction = mathutils.Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def create_studio() -> bpy.types.Object:
    world = bpy.context.scene.world
    world.use_nodes = True
    background = world.node_tree.nodes.get("Background")
    background.inputs["Color"].default_value = (0.0018, 0.0026, 0.0045, 1)
    background.inputs["Strength"].default_value = 0.26

    lights = (
        ("Cool strip", (-3.8, -2.6, 4.4), 920, 3.4, (0.52, 0.72, 1.0)),
        ("Warm rim", (3.8, 1.2, 3.2), 1350, 2.5, (1.0, 0.39, 0.13)),
        ("Top softbox", (0.2, -0.3, 5.4), 720, 3.0, (0.82, 0.9, 1.0)),
        ("Lower fill", (-0.8, -3.8, -1.8), 430, 2.2, (0.22, 0.38, 1.0)),
        ("Rear reveal", (-2.8, 4.2, 1.7), 1050, 3.4, (0.34, 0.58, 1.0)),
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
        point_at(light, (0, 0, 0.3))

    camera_data = bpy.data.cameras.new("Storyboard camera")
    camera_data.lens = 58
    camera = bpy.data.objects.new("Storyboard camera", camera_data)
    bpy.context.collection.objects.link(camera)
    bpy.context.scene.camera = camera
    return camera


def configure_render() -> None:
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.eevee.taa_render_samples = 64
    scene.eevee.use_gtao = True
    scene.eevee.gtao_distance = 3
    scene.eevee.gtao_factor = 1.15
    scene.eevee.use_bloom = True
    scene.eevee.bloom_intensity = 0.025
    scene.view_settings.look = "Medium High Contrast"
    scene.display.shading.light = "STUDIO"
    scene.render.resolution_x = 800
    scene.render.resolution_y = 800
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"


def set_explosion(objects: list[bpy.types.Object], amount: float) -> None:
    for obj in objects:
        base_y = obj.get("base_y")
        if base_y is None:
            obj["base_y"] = obj.location.y
            base_y = obj.location.y
        layer_offset = 0.0
        if "outer ring" in obj.name:
            layer_offset = 0.28
        elif "optical glass" in obj.name:
            layer_offset = 0.55
        elif "sensor" in obj.name:
            layer_offset = 0.82
        obj.location.y = float(base_y) + layer_offset * amount


def render_state(
    camera: bpy.types.Object,
    output_dir: Path,
    filename: str,
    location: tuple[float, float, float],
    target: tuple[float, float, float],
    lens: float,
) -> None:
    camera.location = location
    camera.data.lens = lens
    point_at(camera, target)
    bpy.context.scene.render.filepath = str(output_dir / filename)
    bpy.ops.render.render(write_still=True)


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
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
    )


def main() -> None:
    args = parse_args()
    output_dir = Path(args.output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    reset_scene()
    product, exploded = create_phone()
    camera = create_studio()
    configure_render()

    set_explosion(exploded, 0.0)
    render_state(camera, output_dir, "01-front.png", (0.22, -6.1, 0.18), (0, 0, 0.05), 62)
    render_state(camera, output_dir, "02-side.png", (5.1, -1.7, 0.5), (0, 0, 0.05), 64)
    render_state(camera, output_dir, "03-back.png", (3.15, 5.2, 2.15), (0, 0.08, 0.38), 60)
    set_explosion(exploded, 1.0)
    render_state(camera, output_dir, "04-camera-exploded.png", (1.7, 4.25, 2.2), (-0.12, 0.38, 1.08), 82)

    set_explosion(exploded, 0.0)
    export_glb(product, output_dir / "iphone-17-pro-max-blockout.glb")
    bpy.ops.wm.save_as_mainfile(filepath=str(output_dir / "iphone-17-pro-max-blockout.blend"))


if __name__ == "__main__":
    main()
