"""Build an original, web-oriented iPhone 17 Pro Max study from public dimensions.

This scene is authored from scratch. It does not import or redistribute Apple's
USDZ asset or the previously rejected Sketchfab model. Dimensions and component
positions are based on Apple's public technical specifications and dimensional
drawing. No Apple trademark is reproduced while visual fidelity is being evaluated.
"""

from __future__ import annotations

import argparse
import math
import sys
from pathlib import Path

import bpy
import mathutils


MM = 0.001

PHONE_WIDTH = 77.98 * MM
PHONE_HEIGHT = 163.43 * MM
PHONE_DEPTH = 8.75 * MM
PHONE_CORNER_RADIUS = 11.70 * MM

DISPLAY_GLASS_WIDTH = 75.58 * MM
DISPLAY_GLASS_HEIGHT = 161.03 * MM
DISPLAY_ACTIVE_WIDTH = 72.86 * MM
DISPLAY_ACTIVE_HEIGHT = 158.31 * MM

PLATEAU_HEIGHT = 58.01 * MM
PLATEAU_DEPTH = 1.88 * MM
PLATEAU_RADIUS = 14.00 * MM

# Coordinates use the phone center as origin. Z is vertical and Y is depth.
CAMERA_CENTERS = {
    # A camera looking at the rear maps positive model X to image-left.
    "main": (24.00 * MM, (PHONE_HEIGHT / 2) - 14.37 * MM),
    "ultrawide": (24.00 * MM, (PHONE_HEIGHT / 2) - 33.61 * MM),
    "telephoto": (4.55 * MM, (PHONE_HEIGHT / 2) - 23.99 * MM),
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", required=True)
    parser.add_argument(
        "--finish",
        choices=("cosmic-orange", "silver", "deep-blue"),
        default="cosmic-orange",
    )
    blender_args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    return parser.parse_args(blender_args)


def reset_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (
        bpy.data.meshes,
        bpy.data.curves,
        bpy.data.materials,
        bpy.data.cameras,
        bpy.data.lights,
    ):
        for datablock in list(datablocks):
            if datablock.users == 0:
                datablocks.remove(datablock)


def set_socket(node: bpy.types.Node, names: tuple[str, ...], value) -> None:
    for name in names:
        socket = node.inputs.get(name)
        if socket is not None:
            socket.default_value = value
            return


def material(
    name: str,
    color: tuple[float, float, float, float],
    *,
    metallic: float = 0.0,
    roughness: float = 0.35,
    clearcoat: float = 0.0,
    clearcoat_roughness: float = 0.1,
    transmission: float = 0.0,
    ior: float = 1.45,
    emission: tuple[float, float, float, float] | None = None,
    emission_strength: float = 0.0,
) -> bpy.types.Material:
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get("Principled BSDF")
    set_socket(shader, ("Base Color",), color)
    set_socket(shader, ("Metallic",), metallic)
    set_socket(shader, ("Roughness",), roughness)
    set_socket(shader, ("Specular", "Specular IOR Level"), 0.48)
    set_socket(shader, ("Clearcoat", "Coat Weight"), clearcoat)
    set_socket(shader, ("Clearcoat Roughness", "Coat Roughness"), clearcoat_roughness)
    set_socket(shader, ("Transmission", "Transmission Weight"), transmission)
    set_socket(shader, ("IOR",), ior)
    if emission is not None:
        set_socket(shader, ("Emission", "Emission Color"), emission)
        set_socket(shader, ("Emission Strength",), emission_strength)
    mat.diffuse_color = color
    return mat


def build_materials(finish: str) -> dict[str, bpy.types.Material]:
    finish_values = {
        "cosmic-orange": {
            "metal": (0.235, 0.033, 0.006, 1),
            "glass": (0.092, 0.013, 0.003, 1),
            "accent": (0.31, 0.041, 0.007, 1),
        },
        "silver": {
            "metal": (0.34, 0.39, 0.46, 1),
            "glass": (0.16, 0.20, 0.26, 1),
            "accent": (0.50, 0.58, 0.70, 1),
        },
        "deep-blue": {
            "metal": (0.008, 0.028, 0.070, 1),
            "glass": (0.004, 0.013, 0.038, 1),
            "accent": (0.018, 0.075, 0.19, 1),
        },
    }[finish]

    return {
        "body": material(
            "EX17_Forged_Aluminum",
            finish_values["metal"],
            metallic=0.88,
            roughness=0.27,
            clearcoat=0.08,
            clearcoat_roughness=0.18,
        ),
        "rear_glass": material(
            "EX17_Ceramic_Back",
            finish_values["glass"],
            metallic=0.06,
            roughness=0.42,
            clearcoat=0.20,
            clearcoat_roughness=0.26,
        ),
        "front_glass": material(
            "EX17_Ceramic_Shield",
            (0.002, 0.004, 0.009, 1),
            metallic=0.0,
            roughness=0.055,
            clearcoat=0.55,
            clearcoat_roughness=0.04,
        ),
        "display": material(
            "EX17_Display",
            (0.0007, 0.0012, 0.0025, 1),
            roughness=0.055,
            clearcoat=0.50,
            clearcoat_roughness=0.025,
        ),
        "display_accent": material(
            "EX17_Display_Accent",
            finish_values["accent"],
            roughness=0.22,
            emission=finish_values["accent"],
            emission_strength=0.06,
        ),
        "bezel": material(
            "EX17_Bezel", (0.001, 0.0015, 0.0025, 1), metallic=0.05, roughness=0.18
        ),
        "lens_ring": material(
            "EX17_Lens_Ring",
            (0.045, 0.050, 0.058, 1),
            metallic=0.94,
            roughness=0.25,
            clearcoat=0.08,
        ),
        "lens_barrel": material(
            "EX17_Lens_Barrel", (0.001, 0.0015, 0.003, 1), metallic=0.32, roughness=0.13
        ),
        "lens_glass": material(
            "EX17_Sapphire_Lens",
            (0.0005, 0.0012, 0.0040, 1),
            metallic=0.02,
            roughness=0.035,
            clearcoat=0.62,
            clearcoat_roughness=0.02,
            transmission=0.08,
            ior=1.76,
        ),
        "lens_coating": material(
            "EX17_Lens_Coating",
            (0.0030, 0.0022, 0.0090, 1),
            metallic=0.10,
            roughness=0.075,
            clearcoat=0.58,
        ),
        "sensor": material(
            "EX17_Sensor", (0.001, 0.003, 0.007, 1), metallic=0.0, roughness=0.20
        ),
        "flash": material(
            "EX17_Flash", (0.46, 0.42, 0.34, 1), roughness=0.32, clearcoat=0.16
        ),
        "detail": material(
            "EX17_Detail", (0.004, 0.006, 0.010, 1), metallic=0.28, roughness=0.20
        ),
    }


def rounded_outline(
    width: float, height: float, radius: float, segments: int
) -> list[tuple[float, float]]:
    radius = min(radius, width / 2, height / 2)
    points: list[tuple[float, float]] = []
    corners = (
        (width / 2 - radius, height / 2 - radius, 0.0),
        (-width / 2 + radius, height / 2 - radius, 90.0),
        (-width / 2 + radius, -height / 2 + radius, 180.0),
        (width / 2 - radius, -height / 2 + radius, 270.0),
    )
    for center_x, center_z, start_angle in corners:
        for index in range(segments + 1):
            angle = math.radians(start_angle + (90.0 * index / segments))
            points.append(
                (center_x + math.cos(angle) * radius, center_z + math.sin(angle) * radius)
            )
    return points


def rounded_prism(
    name: str,
    width: float,
    height: float,
    depth: float,
    radius: float,
    location: tuple[float, float, float],
    mat: bpy.types.Material,
    *,
    edge_bevel: float = 0.35 * MM,
    corner_segments: int = 12,
) -> bpy.types.Object:
    outline = rounded_outline(width, height, radius, corner_segments)
    front_y = -depth / 2
    back_y = depth / 2
    vertices = [(x, front_y, z) for x, z in outline] + [(x, back_y, z) for x, z in outline]
    count = len(outline)
    faces: list[tuple[int, ...]] = [tuple(range(count)), tuple(reversed(range(count, count * 2)))]
    for index in range(count):
        next_index = (index + 1) % count
        faces.append((index, next_index, count + next_index, count + index))

    mesh = bpy.data.meshes.new(f"{name}_mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    mesh.use_auto_smooth = True
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    obj.data.materials.append(mat)

    if edge_bevel > 0:
        bevel = obj.modifiers.new("Precision edge", "BEVEL")
        bevel.width = edge_bevel
        bevel.segments = 3
        bevel.limit_method = "ANGLE"
        bevel.harden_normals = True
        normal = obj.modifiers.new("Weighted normals", "WEIGHTED_NORMAL")
        normal.keep_sharp = True
    obj["exportech_asset"] = True
    return obj


def rounded_cube(
    name: str,
    dimensions: tuple[float, float, float],
    location: tuple[float, float, float],
    mat: bpy.types.Material,
    bevel_width: float,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.use_auto_smooth = True
    obj.data.materials.append(mat)
    bevel = obj.modifiers.new("Precision edge", "BEVEL")
    bevel.width = bevel_width
    bevel.segments = 5
    bevel.harden_normals = True
    normal = obj.modifiers.new("Weighted normals", "WEIGHTED_NORMAL")
    normal.keep_sharp = True
    obj["exportech_asset"] = True
    return obj


def cylinder_y(
    name: str,
    radius: float,
    depth: float,
    location: tuple[float, float, float],
    mat: bpy.types.Material,
    *,
    vertices: int = 96,
    bevel_width: float = 0.18 * MM,
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
    obj.data.materials.append(mat)
    if bevel_width > 0:
        bevel = obj.modifiers.new("Machined edge", "BEVEL")
        bevel.width = bevel_width
        bevel.segments = 3
    bpy.ops.object.shade_smooth()
    obj["exportech_asset"] = True
    return obj


def cylinder_z(
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
    )
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    bevel = obj.modifiers.new("Recess edge", "BEVEL")
    bevel.width = 0.10 * MM
    bevel.segments = 2
    obj["exportech_asset"] = True
    return obj


def add_camera_stack(
    name: str,
    x: float,
    z: float,
    surface_y: float,
    mats: dict[str, bpy.types.Material],
) -> list[bpy.types.Object]:
    layers = [
        cylinder_y(
            f"camera_{name}_outer_ring",
            8.10 * MM,
            1.18 * MM,
            (x, surface_y + 0.56 * MM, z),
            mats["lens_ring"],
        ),
        cylinder_y(
            f"camera_{name}_barrel",
            6.70 * MM,
            1.02 * MM,
            (x, surface_y + 1.52 * MM, z),
            mats["lens_barrel"],
        ),
        cylinder_y(
            f"camera_{name}_optic_outer",
            5.78 * MM,
            0.22 * MM,
            (x, surface_y + 2.12 * MM, z),
            mats["lens_glass"],
            bevel_width=0.08 * MM,
        ),
        cylinder_y(
            f"camera_{name}_optic_coating",
            4.05 * MM,
            0.12 * MM,
            (x, surface_y + 2.29 * MM, z),
            mats["lens_coating"],
            bevel_width=0.04 * MM,
        ),
        cylinder_y(
            f"camera_{name}_sensor",
            2.15 * MM,
            0.10 * MM,
            (x, surface_y + 2.40 * MM, z),
            mats["sensor"],
            bevel_width=0,
        ),
    ]
    # A tiny off-axis reflection gives the optical stack depth without a glowing lens.
    highlight = cylinder_y(
        f"camera_{name}_highlight",
        0.25 * MM,
        0.04 * MM,
        (x - 1.22 * MM, surface_y + 2.47 * MM, z + 1.12 * MM),
        mats["flash"],
        vertices=48,
        bevel_width=0,
    )
    highlight.scale.x = 1.55
    layers.append(highlight)
    return layers


def create_phone(mats: dict[str, bpy.types.Material]) -> list[bpy.types.Object]:
    product: list[bpy.types.Object] = []

    body = rounded_prism(
        "phone_body",
        PHONE_WIDTH,
        PHONE_HEIGHT,
        PHONE_DEPTH,
        PHONE_CORNER_RADIUS,
        (0, 0, 0),
        mats["body"],
        edge_bevel=0.55 * MM,
        corner_segments=18,
    )
    product.append(body)

    front_surface = -(PHONE_DEPTH / 2)
    rear_surface = PHONE_DEPTH / 2

    front_glass = rounded_prism(
        "front_glass",
        DISPLAY_GLASS_WIDTH,
        DISPLAY_GLASS_HEIGHT,
        0.42 * MM,
        11.55 * MM,
        (0, front_surface - 0.20 * MM, 0),
        mats["front_glass"],
        edge_bevel=0.16 * MM,
        corner_segments=18,
    )
    product.append(front_glass)

    display = rounded_prism(
        "display",
        DISPLAY_ACTIVE_WIDTH,
        DISPLAY_ACTIVE_HEIGHT,
        0.20 * MM,
        10.25 * MM,
        (0, front_surface - 0.43 * MM, 0),
        mats["display"],
        edge_bevel=0.06 * MM,
        corner_segments=18,
    )
    product.append(display)

    island = rounded_prism(
        "dynamic_island",
        19.74 * MM,
        5.12 * MM,
        0.34 * MM,
        2.56 * MM,
        (0, front_surface - 0.68 * MM, (PHONE_HEIGHT / 2) - 7.91 * MM),
        mats["bezel"],
        edge_bevel=0.08 * MM,
        corner_segments=12,
    )
    product.append(island)

    plateau_z = (PHONE_HEIGHT / 2) - (PLATEAU_HEIGHT / 2)
    # A shallow underlay makes the forged body flow into the plateau instead of
    # reading as a card glued to the back.
    plateau_underlay = rounded_prism(
        "rear_plateau_transition",
        PHONE_WIDTH - 0.18 * MM,
        PLATEAU_HEIGHT + 2.6 * MM,
        0.72 * MM,
        PLATEAU_RADIUS + 0.7 * MM,
        (0, rear_surface + 0.25 * MM, plateau_z - 0.55 * MM),
        mats["body"],
        edge_bevel=0.34 * MM,
        corner_segments=20,
    )
    product.append(plateau_underlay)
    plateau = rounded_prism(
        "rear_plateau",
        PHONE_WIDTH - 0.4 * MM,
        PLATEAU_HEIGHT,
        PLATEAU_DEPTH,
        PLATEAU_RADIUS,
        (0, rear_surface + (PLATEAU_DEPTH / 2) - 0.18 * MM, plateau_z),
        mats["body"],
        edge_bevel=0.56 * MM,
        corner_segments=20,
    )
    product.append(plateau)
    plateau_surface = rear_surface + PLATEAU_DEPTH - 0.18 * MM

    back_glass_height = 98.8 * MM
    back_glass_z = -(PHONE_HEIGHT / 2) + 8.1 * MM + (back_glass_height / 2)
    back_glass = rounded_prism(
        "rear_glass",
        PHONE_WIDTH - 8.75 * MM,
        back_glass_height,
        0.58 * MM,
        11.70 * MM,
        (0, rear_surface + 0.29 * MM, back_glass_z),
        mats["rear_glass"],
        edge_bevel=0.18 * MM,
        corner_segments=18,
    )
    product.append(back_glass)

    for name, (x, z) in CAMERA_CENTERS.items():
        product.extend(add_camera_stack(name, x, z, plateau_surface, mats))

    flash_x = -25.3 * MM
    flash_z = (PHONE_HEIGHT / 2) - 13.82 * MM
    lidar_z = (PHONE_HEIGHT / 2) - 34.16 * MM
    microphone_z = (PHONE_HEIGHT / 2) - 23.99 * MM
    product.append(
        cylinder_y(
            "flash",
            3.40 * MM,
            0.72 * MM,
            (flash_x, plateau_surface + 0.38 * MM, flash_z),
            mats["flash"],
            bevel_width=0.12 * MM,
        )
    )
    product.append(
        cylinder_y(
            "lidar",
            3.32 * MM,
            0.55 * MM,
            (flash_x, plateau_surface + 0.30 * MM, lidar_z),
            mats["sensor"],
            bevel_width=0.10 * MM,
        )
    )
    product.append(
        cylinder_y(
            "rear_microphone",
            0.58 * MM,
            0.48 * MM,
            (flash_x, plateau_surface + 0.26 * MM, microphone_z),
            mats["detail"],
            vertices=32,
            bevel_width=0.04 * MM,
        )
    )

    # Side controls. Dimensions and vertical placement follow the public drawing.
    left_x = -(PHONE_WIDTH / 2) - 0.32 * MM
    right_x = (PHONE_WIDTH / 2) + 0.32 * MM
    for name, z, height in (
        ("action_button", (PHONE_HEIGHT / 2) - 34.28 * MM, 9.0 * MM),
        ("volume_up", (PHONE_HEIGHT / 2) - 48.43 * MM, 10.4 * MM),
        ("volume_down", (PHONE_HEIGHT / 2) - 62.63 * MM, 10.4 * MM),
    ):
        product.append(
            rounded_cube(
                name,
                (0.92 * MM, 2.75 * MM, height),
                (left_x, -0.12 * MM, z),
                mats["body"],
                0.42 * MM,
            )
        )

    product.append(
        rounded_cube(
            "side_button",
            (0.92 * MM, 2.75 * MM, 17.0 * MM),
            (right_x, -0.12 * MM, (PHONE_HEIGHT / 2) - 47.2 * MM),
            mats["body"],
            0.42 * MM,
        )
    )
    product.append(
        rounded_cube(
            "camera_control",
            (0.82 * MM, 3.55 * MM, 17.5 * MM),
            (right_x, -0.10 * MM, -(PHONE_HEIGHT / 2) + 34.0 * MM),
            mats["detail"],
            0.38 * MM,
        )
    )

    # Bottom connector and speaker/microphone recesses.
    bottom_z = -(PHONE_HEIGHT / 2) - 0.23 * MM
    product.append(
        rounded_cube(
            "usb_c_port",
            (12.45 * MM, 3.12 * MM, 0.48 * MM),
            (0, 0, bottom_z),
            mats["detail"],
            0.72 * MM,
        )
    )
    for index, x in enumerate((-25.5, -21.2, -16.9, -12.6, -8.3, 15.2, 19.5, 23.8, 28.1), start=1):
        product.append(
            cylinder_z(
                f"bottom_port_{index}",
                0.72 * MM,
                0.52 * MM,
                (x * MM, 0, bottom_z),
                mats["detail"],
            )
        )

    for obj in product:
        obj["authorial_source"] = "Exportech procedural study v2"
    return product


def point_at(obj: bpy.types.Object, target: tuple[float, float, float]) -> None:
    direction = mathutils.Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def add_area_light(
    name: str,
    location: tuple[float, float, float],
    target: tuple[float, float, float],
    energy: float,
    size: float,
    color: tuple[float, float, float],
    shape: str = "RECTANGLE",
) -> bpy.types.Object:
    data = bpy.data.lights.new(name, "AREA")
    data.energy = energy
    data.shape = shape
    data.size = size
    data.size_y = size * 0.45
    data.color = color
    light = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(light)
    light.location = location
    point_at(light, target)
    return light


def create_studio() -> bpy.types.Object:
    world = bpy.context.scene.world
    world.use_nodes = True
    background = world.node_tree.nodes.get("Background")
    background.inputs["Color"].default_value = (0.0007, 0.0010, 0.0018, 1)
    background.inputs["Strength"].default_value = 0.055

    target = (0, 0, 0.01)
    add_area_light("Key softbox", (-0.22, -0.28, 0.30), target, 72, 0.24, (1.0, 0.88, 0.78))
    add_area_light("Cool edge", (0.24, 0.16, 0.27), target, 92, 0.20, (0.40, 0.62, 1.0))
    add_area_light("Rear sweep", (-0.22, 0.28, 0.06), target, 78, 0.24, (1.0, 0.42, 0.20))
    add_area_light("Top strip", (0.0, -0.03, 0.40), target, 58, 0.18, (0.78, 0.88, 1.0))
    add_area_light("Lower fill", (0.04, -0.26, -0.22), target, 30, 0.20, (0.22, 0.36, 0.72))

    camera_data = bpy.data.cameras.new("Approval camera")
    camera_data.lens = 72
    camera_data.sensor_width = 36
    camera = bpy.data.objects.new("Approval camera", camera_data)
    bpy.context.collection.objects.link(camera)
    bpy.context.scene.camera = camera
    return camera


def configure_render() -> None:
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.eevee.taa_render_samples = 96
    scene.eevee.use_gtao = True
    scene.eevee.gtao_distance = 0.06
    scene.eevee.gtao_factor = 1.15
    scene.eevee.use_soft_shadows = True
    scene.eevee.use_bloom = False
    scene.view_settings.view_transform = "Filmic"
    scene.view_settings.look = "Medium High Contrast"
    scene.view_settings.exposure = -0.65
    scene.view_settings.gamma = 1.0
    scene.render.resolution_x = 1200
    scene.render.resolution_y = 1200
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    scene.camera.data.dof.use_dof = False
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0


def render_view(
    camera: bpy.types.Object,
    path: Path,
    location: tuple[float, float, float],
    target: tuple[float, float, float],
    lens: float,
) -> None:
    camera.location = location
    camera.data.lens = lens
    point_at(camera, target)
    bpy.context.scene.render.filepath = str(path)
    bpy.ops.render.render(write_still=True)


def export_glb(product: list[bpy.types.Object], output_path: Path) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    for obj in product:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = product[0]
    bpy.ops.export_scene.gltf(
        filepath=str(output_path),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_normals=True,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
        export_animations=False,
    )


def main() -> None:
    args = parse_args()
    output_dir = Path(args.output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    reset_scene()
    mats = build_materials(args.finish)
    product = create_phone(mats)
    camera = create_studio()
    configure_render()

    render_view(camera, output_dir / "01-front-three-quarter.png", (0.16, -0.44, 0.075), (0, 0, 0.01), 70)
    render_view(camera, output_dir / "02-back-three-quarter.png", (-0.16, 0.44, 0.085), (0, 0.004, 0.015), 70)
    render_view(camera, output_dir / "03-back-straight.png", (0.0, 0.45, 0.005), (0, 0.004, 0.005), 74)
    render_view(camera, output_dir / "04-side-profile.png", (0.44, -0.020, 0.025), (0, 0, 0.005), 74)
    render_view(
        camera,
        output_dir / "05-camera-close.png",
        (-0.095, 0.255, 0.135),
        (0.010, 0.006, 0.055),
        96,
    )

    bpy.ops.wm.save_as_mainfile(filepath=str(output_dir / "iphone-17-pro-max-authorial-v2.blend"))
    export_glb(product, output_dir / "iphone-17-pro-max-authorial-v2.glb")
    print(f"AUTHORIAL_MODEL_READY output={output_dir} objects={len(product)} finish={args.finish}")


if __name__ == "__main__":
    main()
