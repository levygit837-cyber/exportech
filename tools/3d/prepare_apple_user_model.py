"""Prepare the Apple User iPhone 17 Pro Max asset without altering its source.

The source GLB is imported into a hidden reference collection. A separate copy
is organised semantically, receives restrained web-compatible PBR adjustments,
annotation anchors and camera presets, then is saved as an editable Blender
master. This script intentionally performs no AI-assisted texture processing.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import sys
from datetime import date
from pathlib import Path
from typing import Any

import bpy
import mathutils


SOURCE_AUTHOR = "Apple User"
SOURCE_PAGE = (
    "https://sketchfab.com/3d-models/"
    "apple-iphone-17-pro-max-43570bd2d48f48b6aafb8adbb04e346d"
)
SOURCE_LICENSE = "Free Standard"
WEB_SCALE = 18.0


MESH_RULES: dict[str, tuple[str, str]] = {
    "iiaJouajajQCUNT": ("unibody_structure", "BODY"),
    "lwfmQebmsqyrPXh": ("inner_structure", "BODY"),
    "AGRAGZgDdQiqAwv.001": ("front_glass", "FRONT"),
    "HkNSnYzBPABcqwM.001": ("display_surface", "FRONT"),
    "gCMlCSdRJrizepS": ("rear_glass", "REAR"),
    "vDwikmBvgqpSImF.001": ("rear_glass_detail", "REAR"),
    "dlfOvjAvSNEnzpf.001": ("camera_lower_housing", "CAMERAS"),
    "FcKPMmFYyTgIxkR": ("camera_upper_housing", "CAMERAS"),
    "UduOrBpYBvdbGKN.001": ("camera_center_housing", "CAMERAS"),
    "lqtBOuVuGZSmIKO": ("camera_center_ring", "CAMERAS"),
    "pJRQKDwCsreIOlZ": ("camera_upper_ring", "CAMERAS"),
    "sPzwKNuTuRdmZwe.001": ("camera_lower_ring", "CAMERAS"),
    "NfdueRaYqzGELQN.001": ("camera_upper_glass", "CAMERAS"),
    "OXoCgzLWQYAQquU.001": ("camera_center_glass", "CAMERAS"),
    "SRAnKQnxTzzZwap.001": ("camera_lower_glass", "CAMERAS"),
    "fbdwSPZAhafRoVX.001": ("flash_diffuser", "CAMERAS"),
    "uPJJfDjsnCmUqMb.001": ("flash_bezel", "CAMERAS"),
    "aAftszMZbNEMhoe.001": ("lidar_glass", "CAMERAS"),
    "CUXydfOmpZTOIwn.001": ("lidar_inner", "CAMERAS"),
    "MurNHnRHsVHWaxp": ("action_button", "BUTTONS"),
    "VOwOyTIgUdFOGSH.001": ("volume_down", "BUTTONS"),
    "YMhcZuJreIkCuNy.001": ("volume_up", "BUTTONS"),
    "oKryyXghVaYcnxt": ("side_button", "BUTTONS"),
    "LXcFmsoszzDyTrR": ("camera_control", "BUTTONS"),
    "OKxkTkuhCyxGhZE.001": ("usb_c_shell", "PORTS"),
    "yTmdRacfvebHTTS": ("usb_c_inner", "PORTS"),
    "VQJvjrUDkUerjps": ("usb_c_trim", "PORTS"),
}


MATERIAL_NAMES = {
    "SLmJkLdkhbbuEfG": "EX_Unibody_Orange",
    "sJxAokqqlZYuwzy": "EX_Inner_Structure",
    "LqxrKBoiOXSOFqs": "EX_Front_Glass",
    "BsXHDwLKqtDOfrW": "EX_Display",
    "SMUhrjUPCjJkPUK": "EX_Rear_Glass",
    "JKTmNomFyvfvVAj": "EX_Camera_Rings",
    "nypJRzXNHbmJCqR": "EX_Lens_Glass",
    "vUNWrAqjHCArnzh": "EX_Optical_Elements",
    "EiHyBykxPjKZBgf": "EX_Flash_Diffuser",
    "UiBplfShRNPzcmF": "EX_Flash_Emitter",
    "jKYrqbVsPDbEaqj": "EX_LiDAR_Glass",
    "ooxVuxObmmqIeuh": "EX_Camera_Control",
}


ANCHOR_DEFINITIONS: dict[str, dict[str, Any]] = {
    "anchor_unibody": {
        "position": (0.0395, 0.0100, 0.0000),
        "normal_web": (1.0, 0.0, 0.0),
        "direction": "right",
        "annotation_id": "unibody",
    },
    "anchor_action_button": {
        "position": (-0.0397, 0.0100, 0.0440),
        "normal_web": (-1.0, 0.0, 0.0),
        "direction": "left",
        "annotation_id": "action-button",
    },
    "anchor_camera_control": {
        "position": (0.0395, 0.0100, -0.0330),
        "normal_web": (1.0, 0.0, 0.0),
        "direction": "right",
        "annotation_id": "camera-control",
    },
    "anchor_display": {
        "position": (0.0000, 0.0042, 0.0100),
        "normal_web": (0.0, 0.0, 1.0),
        "direction": "left",
        "annotation_id": "display",
    },
    "anchor_ceramic_shield": {
        "position": (0.0240, 0.0042, 0.0570),
        "normal_web": (0.0, 0.0, 1.0),
        "direction": "right",
        "annotation_id": "ceramic-shield",
    },
    "anchor_camera_system": {
        "position": (0.0247, 0.0178, 0.0540),
        "normal_web": (0.0, 0.0, -1.0),
        "direction": "right",
        "annotation_id": "camera-system",
    },
    "anchor_lidar": {
        "position": (-0.0252, 0.0162, 0.0441),
        "normal_web": (0.0, 0.0, -1.0),
        "direction": "left",
        "annotation_id": "lidar",
    },
}


CAMERA_DEFINITIONS: dict[str, dict[str, Any]] = {
    "web_intro": {
        "position": (0.095, -0.300, 0.038),
        "target": (0.000, 0.000, 0.005),
        "fov": 31.0,
    },
    "web_right_side": {
        "position": (0.315, -0.020, 0.020),
        "target": (0.000, 0.000, 0.000),
        "fov": 31.5,
    },
    "web_rear": {
        "position": (0.060, 0.305, 0.042),
        "target": (0.005, 0.000, 0.012),
        "fov": 31.0,
    },
    "web_camera_macro": {
        "position": (0.070, 0.165, 0.083),
        "target": (0.022, 0.006, 0.056),
        "fov": 34.0,
    },
    "web_left_side": {
        "position": (-0.315, -0.018, 0.026),
        "target": (0.000, 0.000, 0.008),
        "fov": 31.5,
    },
    "web_front": {
        "position": (-0.015, -0.305, 0.020),
        "target": (0.000, 0.000, 0.000),
        "fov": 31.0,
    },
    "web_outro": {
        "position": (-0.090, -0.305, 0.034),
        "target": (0.000, 0.000, 0.004),
        "fov": 32.0,
    },
    "evidence_button_macro": {
        "position": (-0.105, -0.075, 0.052),
        "target": (-0.038, 0.000, 0.036),
        "fov": 38.0,
    },
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True)
    parser.add_argument("--blend", required=True)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--report", required=True)
    blender_args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    return parser.parse_args(blender_args)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def rounded(values: mathutils.Vector, scale: float = 1.0) -> list[float]:
    return [round(float(value) * scale, 6) for value in values]


def ensure_collection(name: str, parent: bpy.types.Collection | None = None) -> bpy.types.Collection:
    collection = bpy.data.collections.new(name)
    if parent is None:
        bpy.context.scene.collection.children.link(collection)
    else:
        parent.children.link(collection)
    return collection


def move_to_collection(obj: bpy.types.Object, collection: bpy.types.Collection) -> None:
    for current in list(obj.users_collection):
        current.objects.unlink(obj)
    collection.objects.link(obj)


def world_bounds(objects: list[bpy.types.Object]) -> tuple[mathutils.Vector, mathutils.Vector]:
    points = [
        obj.matrix_world @ mathutils.Vector(corner)
        for obj in objects
        for corner in obj.bound_box
    ]
    minimum = mathutils.Vector(
        tuple(min(point[axis] for point in points) for axis in range(3))
    )
    maximum = mathutils.Vector(
        tuple(max(point[axis] for point in points) for axis in range(3))
    )
    return minimum, maximum


def srgb_channel(value: int) -> float:
    normalized = value / 255.0
    if normalized <= 0.04045:
        return normalized / 12.92
    return ((normalized + 0.055) / 1.055) ** 2.4


def color(hex_value: str) -> tuple[float, float, float, float]:
    value = hex_value.lstrip("#")
    return (
        srgb_channel(int(value[0:2], 16)),
        srgb_channel(int(value[2:4], 16)),
        srgb_channel(int(value[4:6], 16)),
        1.0,
    )


def principled(material: bpy.types.Material) -> bpy.types.Node | None:
    if not material.use_nodes or not material.node_tree:
        return None
    return next(
        (node for node in material.node_tree.nodes if node.type == "BSDF_PRINCIPLED"),
        None,
    )


def set_socket(
    material: bpy.types.Material,
    socket_names: str | tuple[str, ...],
    value: Any,
    *,
    disconnect: bool = True,
) -> None:
    node = principled(material)
    if not node or not material.node_tree:
        return
    names = (socket_names,) if isinstance(socket_names, str) else socket_names
    socket = next((node.inputs.get(name) for name in names if node.inputs.get(name)), None)
    if not socket:
        return
    if disconnect:
        for link in list(socket.links):
            material.node_tree.links.remove(link)
    socket.default_value = value


def tune_material(material: bpy.types.Material, source_name: str) -> list[str]:
    changes: list[str] = []
    if source_name == "SLmJkLdkhbbuEfG":
        set_socket(material, "Base Color", color("C65A2A"))
        set_socket(material, "Metallic", 0.92)
        set_socket(material, "Roughness", 0.27)
        set_socket(material, ("Clearcoat", "Coat Weight"), 0.12)
        set_socket(material, ("Clearcoat Roughness", "Coat Roughness"), 0.18)
        changes.append("cor sólida e resposta metálica do alumínio laranja-cósmico")
    elif source_name == "LqxrKBoiOXSOFqs":
        set_socket(material, "Base Color", color("03070B"))
        set_socket(material, "Metallic", 0.0)
        set_socket(material, "Roughness", 0.075)
        set_socket(material, ("Clearcoat", "Coat Weight"), 0.9)
        set_socket(material, ("Clearcoat Roughness", "Coat Roughness"), 0.045)
        changes.append("vidro frontal escuro com reflexão limpa")
    elif source_name == "SMUhrjUPCjJkPUK":
        set_socket(material, "Base Color", color("B94E25"))
        set_socket(material, "Metallic", 0.04)
        set_socket(material, "Roughness", 0.31)
        set_socket(material, ("Clearcoat", "Coat Weight"), 0.26)
        set_socket(material, ("Clearcoat Roughness", "Coat Roughness"), 0.16)
        changes.append("vidro traseiro limpo, sem depender do mapa de cor borrado")
    elif source_name == "JKTmNomFyvfvVAj":
        set_socket(material, "Base Color", color("171A1F"))
        set_socket(material, "Metallic", 1.0)
        set_socket(material, "Roughness", 0.16)
        changes.append("anéis das câmeras com highlights mais definidos")
    elif source_name == "nypJRzXNHbmJCqR":
        material.blend_method = "OPAQUE"
        set_socket(material, "Base Color", color("02070D"))
        set_socket(material, "Metallic", 0.05)
        set_socket(material, "Roughness", 0.045)
        set_socket(material, "Alpha", 1.0)
        set_socket(material, "IOR", 1.46)
        set_socket(material, "Transmission", 0.10)
        set_socket(material, ("Clearcoat", "Coat Weight"), 1.0)
        set_socket(material, ("Clearcoat Roughness", "Coat Roughness"), 0.025)
        changes.append("lentes opacas estáveis com camada óptica discreta")
    elif source_name == "vUNWrAqjHCArnzh":
        material.blend_method = "OPAQUE"
        set_socket(material, "Base Color", color("071722"))
        set_socket(material, "Metallic", 0.18)
        set_socket(material, "Roughness", 0.12)
        set_socket(material, "Alpha", 1.0)
        set_socket(material, ("Clearcoat", "Coat Weight"), 0.7)
        changes.append("elementos ópticos reconstruídos sem mapas de 64-128 px")
    elif source_name in {"EiHyBykxPjKZBgf", "UiBplfShRNPzcmF"}:
        warm_white = color("F4E8C9")
        set_socket(material, "Base Color", warm_white)
        set_socket(material, "Metallic", 0.0)
        set_socket(material, "Roughness", 0.24)
        set_socket(material, "Emission", warm_white)
        set_socket(material, "Emission Strength", 0.45)
        set_socket(material, "Alpha", 1.0)
        material.blend_method = "OPAQUE"
        changes.append("flash com emissão controlada para evitar estouro")
    elif source_name == "jKYrqbVsPDbEaqj":
        set_socket(material, "Base Color", color("08131B"))
        set_socket(material, "Metallic", 0.08)
        set_socket(material, "Roughness", 0.12)
        set_socket(material, ("Clearcoat", "Coat Weight"), 0.8)
        changes.append("vidro do LiDAR com contraste e reflexo próprios")
    elif source_name == "ooxVuxObmmqIeuh":
        set_socket(material, "Base Color", color("A94722"))
        set_socket(material, "Metallic", 0.9)
        set_socket(material, "Roughness", 0.23)
        changes.append("Controle da Câmera alinhado ao acabamento lateral")
    return changes


def classify_mesh(
    source_name: str, obj: bpy.types.Object, index: int
) -> tuple[str, str]:
    known = MESH_RULES.get(source_name)
    if known:
        return known
    minimum, maximum = world_bounds([obj])
    dimensions = maximum - minimum
    if maximum.y > 0.013 and maximum.z > 0.030:
        return f"camera_detail_{index:02d}", "CAMERAS"
    if minimum.y < 0.0052 and dimensions.x > 0.020:
        return f"front_detail_{index:02d}", "FRONT"
    if minimum.z < -0.075:
        return f"port_detail_{index:02d}", "PORTS"
    if dimensions.x > 0.060 or dimensions.z > 0.120:
        return f"body_detail_{index:02d}", "BODY"
    return f"product_detail_{index:02d}", "DETAILS"


def point_at(obj: bpy.types.Object, target: tuple[float, float, float]) -> None:
    direction = mathutils.Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def blender_to_three(values: tuple[float, float, float]) -> list[float]:
    return [
        round(values[0] * WEB_SCALE, 6),
        round(values[2] * WEB_SCALE, 6),
        round(-values[1] * WEB_SCALE, 6),
    ]


def create_camera_presets(collection: bpy.types.Collection) -> dict[str, Any]:
    manifest: dict[str, Any] = {}
    for name, definition in CAMERA_DEFINITIONS.items():
        data = bpy.data.cameras.new(name)
        data.sensor_width = 36.0
        data.lens = 36.0 / (2.0 * math.tan(math.radians(definition["fov"]) / 2.0))
        camera = bpy.data.objects.new(name, data)
        collection.objects.link(camera)
        camera.location = definition["position"]
        point_at(camera, definition["target"])
        camera["web_fov"] = float(definition["fov"])
        camera["web_position"] = blender_to_three(definition["position"])
        camera["web_target"] = blender_to_three(definition["target"])
        manifest[name] = {
            "position": blender_to_three(definition["position"]),
            "target": blender_to_three(definition["target"]),
            "fov": float(definition["fov"]),
        }
    return manifest


def write_report(manifest: dict[str, Any], path: Path) -> None:
    totals = manifest["source"]["totals"]
    lines = [
        "# Preparo Apple User: iPhone 17 Pro Max",
        "",
        f"Data: {manifest['date']}",
        f"Blender: {manifest['blender_version']}",
        "",
        "## Procedência",
        "",
        f"- Autor: {SOURCE_AUTHOR}",
        f"- Página: <{SOURCE_PAGE}>",
        f"- Licença exibida: {SOURCE_LICENSE}",
        "- Marcação: NoAI",
        f"- SHA-256 do original: `{manifest['source']['sha256']}`",
        "",
        "O GLB, as texturas e os renders não foram enviados para serviços generativos. O preparo foi executado localmente por operações determinísticas no Blender.",
        "",
        "## Auditoria do original",
        "",
        f"- Meshes: {totals['meshes']}",
        f"- Vértices: {totals['vertices']:,}",
        f"- Triângulos: {totals['triangles']:,}",
        f"- Materiais: {totals['materials']}",
        f"- Imagens incorporadas: {totals['images']}",
        f"- Draw calls estimadas antes da união: {totals['draw_calls_estimate']}",
        f"- Dimensões em mm: {' x '.join(f'{value:.4f}' for value in totals['dimensions_mm'])}",
        "",
        "## Mudanças reversíveis",
        "",
    ]
    lines.extend(f"- {change}" for change in manifest["remaster_changes"])
    lines.extend(
        [
            "",
            "A coleção `SOURCE_REFERENCE` preserva a importação sem alteração. A coleção `WEB_MODEL` contém a cópia editável. Nenhum decimate, corte, bevel ou alteração destrutiva de topologia foi aplicado.",
            "",
            "## Anotações",
            "",
        ]
    )
    for anchor in manifest["anchors"]:
        lines.append(
            f"- `{anchor['name']}`: `{anchor['annotation_id']}`, direção `{anchor['direction']}`"
        )
    lines.extend(
        [
            "",
            "## Limites",
            "",
            "- O modelo é de terceiros e não é um modelo industrial oficial da Apple.",
            "- Detalhes ausentes em texturas pequenas não foram inventados.",
            "- A aprovação estética depende da comparação humana entre os renders original e remasterizado.",
            "- O GLB entregue ao navegador pode ser extraído por quem possui acesso à prévia.",
            "",
        ]
    )
    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    args = parse_args()
    source = Path(args.source).resolve()
    blend_path = Path(args.blend).resolve()
    manifest_path = Path(args.manifest).resolve()
    report_path = Path(args.report).resolve()
    if not source.is_file():
        raise FileNotFoundError(source)

    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for collection in list(bpy.data.collections):
        bpy.data.collections.remove(collection)

    bpy.context.scene.unit_settings.system = "METRIC"
    bpy.context.scene.unit_settings.scale_length = 1.0
    bpy.ops.import_scene.gltf(filepath=str(source), import_pack_images=True)
    imported_meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not imported_meshes:
        raise RuntimeError("The imported Apple User GLB contains no meshes")

    minimum, maximum = world_bounds(imported_meshes)
    center = (minimum + maximum) * 0.5
    dimensions = maximum - minimum

    source_collection = ensure_collection("SOURCE_REFERENCE")
    web_collection = ensure_collection("WEB_MODEL")
    category_collections = {
        name: ensure_collection(name, web_collection)
        for name in ("BODY", "FRONT", "REAR", "CAMERAS", "BUTTONS", "PORTS", "DETAILS")
    }
    anchor_collection = ensure_collection("ANNOTATION_ANCHORS")
    camera_collection = ensure_collection("CAMERA_PRESETS")

    source_root = bpy.data.objects.new("source_reference_root", None)
    source_collection.objects.link(source_root)
    source_root.hide_render = True
    source_root.hide_viewport = True

    web_root = bpy.data.objects.new("iphone17_root", None)
    web_collection.objects.link(web_root)
    web_root["export_for_web"] = True
    web_root["model_scale_web"] = WEB_SCALE

    material_copies: dict[str, bpy.types.Material] = {}
    material_changes: list[str] = []
    semantic_entries: list[dict[str, Any]] = []

    for index, original in enumerate(sorted(imported_meshes, key=lambda obj: obj.name), 1):
        source_name = original.name
        source_world = original.matrix_world.copy()
        move_to_collection(original, source_collection)
        original.parent = source_root
        original.matrix_world = source_world
        original["source_original_name"] = source_name
        original.name = f"source_{index:02d}_{source_name}"
        original.hide_render = True
        original.hide_viewport = True

        working = original.copy()
        working.data = original.data.copy()
        semantic_name, category = classify_mesh(source_name, original, index)
        category_collections[category].objects.link(working)
        working.name = semantic_name
        working["source_original_name"] = source_name
        working["semantic_group"] = category.lower()
        working["export_for_web"] = True
        # The editable copy must not inherit the hidden state of the frozen
        # source reference. Keeping this explicit also makes headless export
        # deterministic across Blender versions.
        working.hide_render = False
        working.hide_viewport = False
        working.hide_set(False)
        working.parent = web_root
        working.matrix_world = source_world

        for slot in working.material_slots:
            if not slot.material:
                continue
            source_material = slot.material
            copy = material_copies.get(source_material.name)
            if copy is None:
                copy = source_material.copy()
                copy.name = MATERIAL_NAMES.get(
                    source_material.name, f"EX_Source_{source_material.name}"
                )
                material_copies[source_material.name] = copy
                material_changes.extend(tune_material(copy, source_material.name))
            slot.material = copy

        working.data.calc_loop_triangles()
        semantic_entries.append(
            {
                "name": semantic_name,
                "source_name": source_name,
                "group": category.lower(),
                "triangles": len(working.data.loop_triangles),
                "materials": [
                    slot.material.name for slot in working.material_slots if slot.material
                ],
            }
        )

    source_root.location = -center
    web_root.location = -center

    for obj in list(bpy.context.scene.objects):
        if obj.type != "MESH" and obj not in {source_root, web_root}:
            bpy.data.objects.remove(obj, do_unlink=True)

    anchors: list[dict[str, Any]] = []
    for name, definition in ANCHOR_DEFINITIONS.items():
        anchor = bpy.data.objects.new(name, None)
        anchor.empty_display_type = "PLAIN_AXES"
        anchor.empty_display_size = 0.003
        anchor_collection.objects.link(anchor)
        anchor.parent = web_root
        anchor.location = definition["position"]
        anchor["export_for_web"] = True
        anchor["annotation_id"] = definition["annotation_id"]
        anchor["normal_web"] = list(definition["normal_web"])
        anchor["callout_direction"] = definition["direction"]
        centered = mathutils.Vector(definition["position"]) - center
        anchors.append(
            {
                "name": name,
                "annotation_id": definition["annotation_id"],
                "position_model_m": rounded(centered),
                "position_web": blender_to_three(tuple(centered)),
                "normal_web": list(definition["normal_web"]),
                "direction": definition["direction"],
            }
        )

    cameras = create_camera_presets(camera_collection)
    bpy.context.scene.camera = bpy.data.objects["web_intro"]
    source_collection.hide_render = True
    source_collection.hide_viewport = True
    web_collection.hide_render = False
    web_collection.hide_viewport = False
    anchor_collection.hide_render = True
    camera_collection.hide_render = True

    scene = bpy.context.scene
    scene["source_author"] = SOURCE_AUTHOR
    scene["source_page"] = SOURCE_PAGE
    scene["source_license"] = SOURCE_LICENSE
    scene["source_noai"] = True
    scene["attribution"] = (
        "Modelo 3D de demonstração por Apple User no Sketchfab. "
        "Modelo não oficial, adaptado para esta prévia privada."
    )
    scene.view_settings.view_transform = "Filmic"
    scene.view_settings.look = "Medium High Contrast"
    scene.view_settings.exposure = 0.0
    scene.view_settings.gamma = 1.0

    unique_changes = list(dict.fromkeys(material_changes))
    texture_bytes = sum(
        int(image.size[0]) * int(image.size[1]) * 4
        for image in bpy.data.images
        if image.source != "VIEWER"
    )
    manifest = {
        "date": date.today().isoformat(),
        "blender_version": bpy.app.version_string,
        "source": {
            "filename": source.name,
            "bytes": source.stat().st_size,
            "sha256": sha256(source),
            "author": SOURCE_AUTHOR,
            "page": SOURCE_PAGE,
            "license": SOURCE_LICENSE,
            "noai": True,
            "totals": {
                "meshes": len(imported_meshes),
                "vertices": sum(len(obj.data.vertices) for obj in imported_meshes),
                "triangles": sum(item["triangles"] for item in semantic_entries),
                "materials": len(material_copies),
                "images": len([image for image in bpy.data.images if image.source != "VIEWER"]),
                "draw_calls_estimate": sum(
                    max(1, len([slot for slot in obj.material_slots if slot.material]))
                    for obj in imported_meshes
                ),
                "dimensions_mm": rounded(dimensions, 1000.0),
                "decoded_texture_budget_bytes": texture_bytes,
            },
        },
        "master": {
            "blend": blend_path.name,
            "web_meshes": len(semantic_entries),
            "source_reference_preserved": True,
            "topology_decimated": False,
            "bevels_added": False,
            "animations": [],
            "web_scale": WEB_SCALE,
        },
        "remaster_changes": unique_changes,
        "objects": semantic_entries,
        "anchors": anchors,
        "cameras": cameras,
        "runtime": {
            "model_url": "/models/iphone-17-pro-max/apple-user-remastered-web.glb",
            "poster_url": "/models/iphone-17-pro-max/apple-user-poster.webp",
            "mobile_poster_url": "/models/iphone-17-pro-max/apple-user-poster-mobile.webp",
            "environment_url": "/models/iphone-17-pro-max/studio_small_08_1k.hdr",
            "target_glb_bytes": 8_000_000,
            "target_draw_calls": 45,
            "target_triangles": 85_000,
        },
    }

    blend_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.file.pack_all()
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
    manifest_path.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    write_report(manifest, report_path)
    print(
        "APPLE_USER_PREPARED "
        f"meshes={len(semantic_entries)} triangles={manifest['source']['totals']['triangles']} "
        f"materials={len(material_copies)} anchors={len(anchors)} blend={blend_path}"
    )


if __name__ == "__main__":
    main()
