"""Render deterministic original/remaster evidence and web posters.

The generated images are intended for human review. They are not submitted to
vision or generative services because the source asset is marked NoAI.
"""

from __future__ import annotations

import argparse
import sys
from array import array
from pathlib import Path

import bpy
import mathutils


EVIDENCE_CAMERAS = (
    ("web_intro", "01-front-three-quarter"),
    ("web_front", "02-front"),
    ("web_right_side", "03-right-side"),
    ("web_rear", "04-rear"),
    ("web_camera_macro", "05-camera-macro"),
    ("web_left_side", "06-left-side"),
    ("evidence_button_macro", "07-button-macro"),
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--poster", required=True)
    parser.add_argument("--mobile-poster", required=True)
    parser.add_argument("--hdri", required=True)
    parser.add_argument("--posters-only", action="store_true")
    blender_args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    return parser.parse_args(blender_args)


def point_at(obj: bpy.types.Object, target: tuple[float, float, float]) -> None:
    direction = mathutils.Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def configure_world(hdri_path: Path) -> None:
    if not hdri_path.is_file():
        raise FileNotFoundError(hdri_path)
    world = bpy.context.scene.world or bpy.data.worlds.new("Exportech studio world")
    bpy.context.scene.world = world
    world.use_nodes = True
    nodes = world.node_tree.nodes
    links = world.node_tree.links
    nodes.clear()

    output = nodes.new("ShaderNodeOutputWorld")
    mix = nodes.new("ShaderNodeMixShader")
    light_path = nodes.new("ShaderNodeLightPath")
    environment = nodes.new("ShaderNodeTexEnvironment")
    environment.image = bpy.data.images.load(str(hdri_path), check_existing=True)
    environment.image.colorspace_settings.name = "Linear"
    reflected = nodes.new("ShaderNodeBackground")
    reflected.inputs["Strength"].default_value = 0.72
    camera_background = nodes.new("ShaderNodeBackground")
    camera_background.inputs["Color"].default_value = (0.0030, 0.0030, 0.0030, 1.0)
    camera_background.inputs["Strength"].default_value = 1.0

    links.new(environment.outputs["Color"], reflected.inputs["Color"])
    links.new(light_path.outputs["Is Camera Ray"], mix.inputs["Fac"])
    links.new(reflected.outputs["Background"], mix.inputs[1])
    links.new(camera_background.outputs["Background"], mix.inputs[2])
    links.new(mix.outputs["Shader"], output.inputs["Surface"])


def create_studio_lights() -> None:
    previous = bpy.data.collections.get("STUDIO_RUNTIME")
    if previous:
        for obj in list(previous.objects):
            bpy.data.objects.remove(obj, do_unlink=True)
        bpy.data.collections.remove(previous)
    collection = bpy.data.collections.new("STUDIO_RUNTIME")
    bpy.context.scene.collection.children.link(collection)

    definitions = (
        (
            "Studio key",
            (-0.21, -0.22, 0.23),
            (0.0, 0.0, 0.015),
            95.0,
            0.20,
            (1.0, 0.92, 0.84),
        ),
        (
            "Studio fill",
            (0.23, -0.10, 0.10),
            (0.0, 0.0, 0.005),
            42.0,
            0.24,
            (0.72, 0.82, 1.0),
        ),
        (
            "Studio rim",
            (0.03, 0.25, 0.22),
            (0.0, 0.0, 0.035),
            68.0,
            0.16,
            (0.86, 0.93, 1.0),
        ),
    )
    for name, position, target, energy, size, light_color in definitions:
        data = bpy.data.lights.new(name, "AREA")
        data.energy = energy
        data.shape = "DISK"
        data.size = size
        data.color = light_color
        light = bpy.data.objects.new(name, data)
        collection.objects.link(light)
        light.location = position
        point_at(light, target)


def configure_render(width: int, height: int, *, transparent: bool) -> None:
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.eevee.taa_render_samples = 96
    scene.eevee.use_gtao = True
    scene.eevee.gtao_distance = 0.045
    scene.eevee.gtao_factor = 0.72
    scene.eevee.use_bloom = False
    scene.view_settings.view_transform = "Filmic"
    scene.view_settings.look = "Medium High Contrast"
    scene.view_settings.exposure = -0.15
    scene.view_settings.gamma = 1.0
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    scene.render.resolution_percentage = 100
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.color_depth = "8"
    scene.render.film_transparent = transparent
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = ""


def set_variant(original: bool) -> None:
    source = bpy.data.collections.get("SOURCE_REFERENCE")
    web = bpy.data.collections.get("WEB_MODEL")
    if not source or not web:
        raise RuntimeError("Prepared scene is missing SOURCE_REFERENCE or WEB_MODEL")
    # Snapshot the RNA views before toggling collection visibility. Blender
    # 3.6 can invalidate a live `all_objects` iterator when the parent
    # collection changes render state.
    source_objects = list(source.all_objects)
    web_objects = list(web.all_objects)
    source.hide_render = not original
    web.hide_render = original
    for obj in source_objects:
        obj.hide_render = not original
    for obj in web_objects:
        obj.hide_render = original


def render(camera_name: str, output: Path, width: int = 800, height: int = 800) -> None:
    camera = bpy.data.objects.get(camera_name)
    if not camera or camera.type != "CAMERA":
        raise RuntimeError(f"Prepared scene is missing camera {camera_name}")
    configure_render(width, height, transparent=False)
    scene = bpy.context.scene
    scene.camera = camera
    scene.render.filepath = str(output)
    output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.render.render(write_still=True)


def render_poster(camera_name: str, output: Path, width: int, height: int) -> None:
    camera = bpy.data.objects[camera_name]
    configure_render(width, height, transparent=True)
    scene = bpy.context.scene
    scene.camera = camera
    scene.render.image_settings.file_format = "WEBP"
    scene.render.image_settings.quality = 92
    scene.render.filepath = str(output)
    output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.render.render(write_still=True)


def combine_pair(left_path: Path, right_path: Path, output_path: Path) -> None:
    left = bpy.data.images.load(str(left_path), check_existing=False)
    right = bpy.data.images.load(str(right_path), check_existing=False)
    left_width, left_height = int(left.size[0]), int(left.size[1])
    right_width, right_height = int(right.size[0]), int(right.size[1])
    gap = 2
    width = left_width + gap + right_width
    height = max(left_height, right_height)
    background = array("f", (0.003, 0.003, 0.003, 1.0)) * (width * height)
    left_pixels = array("f", left.pixels[:])
    right_pixels = array("f", right.pixels[:])

    for row in range(left_height):
        source_start = row * left_width * 4
        source_end = source_start + left_width * 4
        target_start = row * width * 4
        background[target_start : target_start + left_width * 4] = left_pixels[
            source_start:source_end
        ]
    for row in range(right_height):
        source_start = row * right_width * 4
        source_end = source_start + right_width * 4
        target_start = (row * width + left_width + gap) * 4
        background[target_start : target_start + right_width * 4] = right_pixels[
            source_start:source_end
        ]

    combined = bpy.data.images.new(
        output_path.stem, width=width, height=height, alpha=True, float_buffer=False
    )
    combined.pixels.foreach_set(background)
    combined.filepath_raw = str(output_path)
    combined.file_format = "PNG"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    combined.save()
    bpy.data.images.remove(left)
    bpy.data.images.remove(right)
    bpy.data.images.remove(combined)


def main() -> None:
    args = parse_args()
    output_dir = Path(args.output_dir).resolve()
    poster = Path(args.poster).resolve()
    mobile_poster = Path(args.mobile_poster).resolve()
    hdri = Path(args.hdri).resolve()
    original_dir = output_dir / "original"
    remaster_dir = output_dir / "remastered"
    comparison_dir = output_dir / "comparison"
    for path in (original_dir, remaster_dir, comparison_dir, poster.parent, mobile_poster.parent):
        path.mkdir(parents=True, exist_ok=True)

    configure_world(hdri)
    create_studio_lights()

    rendered_pairs: list[tuple[Path, Path, Path]] = []
    if not args.posters_only:
        for original in (True, False):
            set_variant(original)
            variant_dir = original_dir if original else remaster_dir
            for camera_name, filename in EVIDENCE_CAMERAS:
                output = variant_dir / f"{filename}.png"
                render(camera_name, output)
                if not original:
                    rendered_pairs.append(
                        (
                            original_dir / f"{filename}.png",
                            output,
                            comparison_dir / f"{filename}-ab.png",
                        )
                    )

        for left, right, output in rendered_pairs:
            combine_pair(left, right, output)

    set_variant(False)
    render_poster("web_intro", poster, 1440, 900)
    render_poster("web_intro", mobile_poster, 780, 1688)
    if not args.posters_only:
        (output_dir / "README.md").write_text(
            "# Comparações A/B\n\n"
            "Cada arquivo em `comparison/` mostra o original à esquerda e o remasterizado à direita. "
            "A aprovação visual deve ser humana porque o ativo de origem está marcado como NoAI.\n",
            encoding="utf-8",
        )
    print(
        "APPLE_USER_EVIDENCE "
        f"views={len(EVIDENCE_CAMERAS)} comparisons={len(rendered_pairs)} "
        f"poster={poster} mobile_poster={mobile_poster}"
    )


if __name__ == "__main__":
    main()
