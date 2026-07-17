"""Prepare the Taufiq K iPhone 17 Pro Max model for Exportech production.

The source GLB is imported read-only. Semantic objects are built from complete
disconnected islands, never from destructive cuts. The resulting Blender file
contains a hidden source reference, web-compatible PBR materials, display
states, an honest reversible camera explosion, and four named camera views.
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any

import bmesh
import bpy
import mathutils


CAMERA_CENTERS_MM = {
    "camera_main": (-24.7478, 149.1527),
    "camera_ultrawide": (-24.7478, 129.8455),
    "camera_telephoto": (-6.6158, 139.4991),
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True)
    parser.add_argument("--blend", required=True)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--report", required=True)
    blender_args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    return parser.parse_args(blender_args)


class UnionFind:
    def __init__(self, size: int) -> None:
        self.parent = list(range(size))
        self.rank = [0] * size

    def find(self, value: int) -> int:
        while self.parent[value] != value:
            self.parent[value] = self.parent[self.parent[value]]
            value = self.parent[value]
        return value

    def union(self, left: int, right: int) -> None:
        left_root = self.find(left)
        right_root = self.find(right)
        if left_root == right_root:
            return
        if self.rank[left_root] < self.rank[right_root]:
            left_root, right_root = right_root, left_root
        self.parent[right_root] = left_root
        if self.rank[left_root] == self.rank[right_root]:
            self.rank[left_root] += 1


def ensure_collection(name: str, parent: bpy.types.Collection | None = None) -> bpy.types.Collection:
    collection = bpy.data.collections.get(name) or bpy.data.collections.new(name)
    parent = parent or bpy.context.scene.collection
    if collection.name not in {child.name for child in parent.children}:
        parent.children.link(collection)
    return collection


def move_to_collection(obj: bpy.types.Object, collection: bpy.types.Collection) -> None:
    if collection not in obj.users_collection:
        collection.objects.link(obj)
    for current in list(obj.users_collection):
        if current != collection:
            current.objects.unlink(obj)


def set_socket(node: bpy.types.Node, names: tuple[str, ...], value: Any) -> None:
    for name in names:
        socket = node.inputs.get(name)
        if socket is not None:
            socket.default_value = value
            return


def create_principled_material(
    name: str,
    base_color: tuple[float, float, float, float],
    metallic: float,
    roughness: float,
    *,
    clearcoat: float = 0.0,
    specular: float = 0.5,
    emission: tuple[float, float, float, float] | None = None,
    emission_strength: float = 0.0,
    alpha: float = 1.0,
) -> bpy.types.Material:
    material = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    material.use_nodes = True
    material.node_tree.nodes.clear()
    output = material.node_tree.nodes.new("ShaderNodeOutputMaterial")
    principled = material.node_tree.nodes.new("ShaderNodeBsdfPrincipled")
    set_socket(principled, ("Base Color",), base_color)
    set_socket(principled, ("Metallic",), metallic)
    set_socket(principled, ("Roughness",), roughness)
    set_socket(principled, ("Clearcoat", "Coat Weight"), clearcoat)
    set_socket(principled, ("Clearcoat Roughness", "Coat Roughness"), min(0.5, roughness * 0.7))
    set_socket(principled, ("Specular", "Specular IOR Level"), specular)
    set_socket(principled, ("Alpha",), alpha)
    if emission is not None:
        set_socket(principled, ("Emission", "Emission Color"), emission)
        set_socket(principled, ("Emission Strength",), emission_strength)
    material.node_tree.links.new(principled.outputs["BSDF"], output.inputs["Surface"])
    material.diffuse_color = base_color
    if alpha < 1.0:
        material.blend_method = "BLEND"
        material.use_screen_refraction = True
        material.show_transparent_back = False
    else:
        material.blend_method = "OPAQUE"
    return material


def build_materials() -> dict[str, bpy.types.Material]:
    return {
        "silver": create_principled_material(
            "EX_Silver_Forged_Aluminum", (0.18, 0.20, 0.24, 1), 0.84, 0.34, clearcoat=0.08, specular=0.38
        ),
        "plateau": create_principled_material(
            "EX_Silver_Camera_Plateau", (0.13, 0.15, 0.19, 1), 0.70, 0.38, clearcoat=0.12, specular=0.34
        ),
        "rear_glass": create_principled_material(
            "EX_Frosted_Rear_Glass", (0.055, 0.072, 0.10, 1), 0.06, 0.46, clearcoat=0.22, specular=0.30
        ),
        "front_glass": create_principled_material(
            "EX_Front_Glass", (0.003, 0.006, 0.012, 0.10), 0.02, 0.12, clearcoat=0.32, alpha=0.10
        ),
        "display_off": create_principled_material(
            "EX_Display_Off", (0.002, 0.004, 0.008, 1), 0.0, 0.18, clearcoat=0.18
        ),
        "display_on": create_principled_material(
            "EX_Display_Soft_On", (0.002, 0.008, 0.020, 1), 0.0, 0.24,
            emission=(0.008, 0.035, 0.09, 1), emission_strength=0.16, specular=0.28
        ),
        "display_mark": create_principled_material(
            "EX_Display_Neutral_Mark", (0.12, 0.42, 0.78, 1), 0.0, 0.28,
            emission=(0.12, 0.42, 0.78, 1), emission_strength=0.48, specular=0.20
        ),
        "lens_housing": create_principled_material(
            "EX_Camera_Lens_Housing", (0.0003, 0.0006, 0.0012, 1), 0.03, 0.22, clearcoat=0.18, specular=0.18
        ),
        "lens_optic": create_principled_material(
            "EX_Camera_Lens_Optic", (0.0005, 0.0025, 0.009, 1), 0.04, 0.12, clearcoat=0.42, specular=0.34
        ),
        "lens_cover": create_principled_material(
            "EX_Camera_Lens_Cover", (0.00015, 0.0004, 0.0010, 1), 0.02, 0.08, clearcoat=0.52, specular=0.28
        ),
        "ring": create_principled_material(
            "EX_Camera_Ring_Aluminum", (0.28, 0.31, 0.36, 1), 0.90, 0.24, clearcoat=0.12, specular=0.38
        ),
        "sensor": create_principled_material(
            "EX_Sensor_Dark", (0.003, 0.006, 0.010, 1), 0.02, 0.18, clearcoat=0.28
        ),
        "flash": create_principled_material(
            "EX_Flash_Diffuser", (0.74, 0.78, 0.79, 1), 0.0, 0.32, clearcoat=0.24
        ),
        "logo": create_principled_material(
            "EX_Rear_Logo_Graphite", (0.055, 0.065, 0.082, 1), 0.48, 0.26, clearcoat=0.12
        ),
        "detail": create_principled_material(
            "EX_Port_And_Speaker_Detail", (0.009, 0.012, 0.018, 1), 0.12, 0.24, clearcoat=0.10
        ),
    }


def component_metadata(obj: bpy.types.Object) -> tuple[dict[int, dict[str, Any]], dict[int, int]]:
    mesh = obj.data
    union = UnionFind(len(mesh.vertices))
    for edge in mesh.edges:
        union.union(edge.vertices[0], edge.vertices[1])

    vertices: dict[int, list[int]] = defaultdict(list)
    polygons: dict[int, list[bpy.types.MeshPolygon]] = defaultdict(list)
    face_roots: dict[int, int] = {}
    for vertex in mesh.vertices:
        vertices[union.find(vertex.index)].append(vertex.index)
    for polygon in mesh.polygons:
        root = union.find(polygon.vertices[0])
        polygons[root].append(polygon)
        face_roots[polygon.index] = root

    material_names = [slot.material.name if slot.material else "<none>" for slot in obj.material_slots]
    metadata: dict[int, dict[str, Any]] = {}
    for root, indices in vertices.items():
        points = [obj.matrix_world @ mesh.vertices[index].co for index in indices]
        minimum = mathutils.Vector(tuple(min(point[axis] for point in points) for axis in range(3)))
        maximum = mathutils.Vector(tuple(max(point[axis] for point in points) for axis in range(3)))
        center = (minimum + maximum) * 500.0
        dimensions = (maximum - minimum) * 1000.0
        component_polygons = polygons.get(root, [])
        material_counts = Counter(
            material_names[polygon.material_index]
            if polygon.material_index < len(material_names)
            else "<invalid>"
            for polygon in component_polygons
        )
        metadata[root] = {
            "center": center,
            "dimensions": dimensions,
            "materials": set(material_counts),
            "triangles": sum(max(1, len(polygon.vertices) - 2) for polygon in component_polygons),
        }
    return metadata, face_roots


def near_xz(center: mathutils.Vector, x: float, z: float, radius: float) -> bool:
    return math.hypot(center.x - x, center.z - z) <= radius


def classify_component(item: dict[str, Any]) -> str:
    center: mathutils.Vector = item["center"]
    dimensions: mathutils.Vector = item["dimensions"]
    materials: set[str] = item["materials"]
    primary = next(iter(materials), "")

    if primary == "17ProMax_Screen":
        return "display"
    if primary == "17ProMax_Logo":
        return "apple_logo"
    if center.y > 3.5 and center.z > 148 and primary in {
        "17ProMax_Black2", "17ProMax_2112", "17ProMax_Lens2"
    }:
        return "dynamic_island"
    if center.y > 3.5 and primary == "17ProMax_glass":
        return "front_glass"
    if center.y > 3.2 and primary == "17ProMax_Black2" and dimensions.x > 20:
        return "front_bezel"

    if center.y < -6.0:
        for camera_name, (x, z) in CAMERA_CENTERS_MM.items():
            if near_xz(center, x, z, 9.2):
                if primary == "17ProMax_color" and dimensions.x > 11:
                    return f"{camera_name}_ring"
                if primary in {"17ProMax_Black2", "17ProMax_Lens", "17ProMax_black1", "17ProMax_glass"}:
                    return f"{camera_name}_glass"
        if near_xz(center, 25.2843, 149.6276, 5.0):
            return "flash"
        if near_xz(center, 25.2843, 129.3707, 5.0):
            return "lidar"
        if near_xz(center, 25.5068, 139.8285, 2.5):
            return "microphone"

    if center.y < -3.5 and center.z > 115 and primary == "17ProMax_color3":
        return "rear_plateau"
    if center.y < -3.5 and center.z < 120 and primary == "17ProMax_color2":
        return "rear_glass"
    if abs(center.x) > 36 and center.z > 20 and dimensions.z < 24 and dimensions.x < 4:
        return "side_buttons"
    if center.z < 5 and abs(center.x) < 8 and dimensions.x < 14:
        return "usb_port"
    if center.z < 5 and (abs(center.x) >= 8 or primary in {"17ProMax_1111", "17ProMax_G", "17ProMax_2222"}):
        return "speaker_details"
    return "phone_body"


def subset_mesh(
    source: bpy.types.Object,
    name: str,
    face_categories: dict[int, str],
    category: str,
) -> bpy.types.Mesh:
    mesh = source.data.copy()
    mesh.name = f"{name}_mesh"
    bm = bmesh.new()
    bm.from_mesh(mesh)
    bm.faces.ensure_lookup_table()
    delete_faces = [face for face in bm.faces if face_categories.get(face.index) != category]
    bmesh.ops.delete(bm, geom=delete_faces, context="FACES")
    used_vertices = {vertex for face in bm.faces for vertex in face.verts}
    unused_vertices = [vertex for vertex in bm.verts if vertex not in used_vertices]
    if unused_vertices:
        bmesh.ops.delete(bm, geom=unused_vertices, context="VERTS")
    degenerate_faces = [face for face in bm.faces if face.calc_area() <= 1e-16]
    if degenerate_faces:
        bmesh.ops.delete(bm, geom=degenerate_faces, context="FACES")
        used_vertices = {vertex for face in bm.faces for vertex in face.verts}
        unused_vertices = [vertex for vertex in bm.verts if vertex not in used_vertices]
        if unused_vertices:
            bmesh.ops.delete(bm, geom=unused_vertices, context="VERTS")
    bm.to_mesh(mesh)
    bm.free()
    mesh.update()
    return mesh


def assign_material(obj: bpy.types.Object, material: bpy.types.Material) -> None:
    obj.data.materials.clear()
    obj.data.materials.append(material)
    for polygon in obj.data.polygons:
        polygon.material_index = 0


def assign_camera_glass_materials(
    obj: bpy.types.Object, materials: dict[str, bpy.types.Material]
) -> None:
    original_slots = [slot.material.name if slot.material else "" for slot in obj.material_slots]
    targets = [materials["lens_housing"], materials["lens_optic"], materials["lens_cover"]]
    target_indices = {material.name: index for index, material in enumerate(targets)}
    polygon_targets: list[int] = []
    for polygon in obj.data.polygons:
        source_name = original_slots[polygon.material_index] if polygon.material_index < len(original_slots) else ""
        if source_name == "17ProMax_Lens":
            target = materials["lens_optic"]
        elif source_name in {"17ProMax_black1", "17ProMax_glass"}:
            target = materials["lens_cover"]
        else:
            target = materials["lens_housing"]
        polygon_targets.append(target_indices[target.name])
    obj.data.materials.clear()
    for material in targets:
        obj.data.materials.append(material)
    for polygon, target_index in zip(obj.data.polygons, polygon_targets):
        polygon.material_index = target_index


def material_for_category(category: str, materials: dict[str, bpy.types.Material]) -> bpy.types.Material:
    if category == "rear_plateau":
        return materials["plateau"]
    if category == "rear_glass":
        return materials["rear_glass"]
    if category == "front_glass":
        return materials["front_glass"]
    if category == "display":
        return materials["display_off"]
    if category.endswith("_ring"):
        return materials["ring"]
    if category in {"dynamic_island", "front_bezel", "lidar", "microphone"}:
        return materials["sensor"]
    if category == "flash":
        return materials["flash"]
    if category == "apple_logo":
        return materials["logo"]
    if category in {"usb_port", "speaker_details"}:
        return materials["detail"]
    return materials["silver"]


def set_origin_to_geometry(obj: bpy.types.Object) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")


def create_placeholder_mark(collection: bpy.types.Collection, material: bpy.types.Material) -> bpy.types.Object:
    bars: list[bpy.types.Object] = []
    specs = (
        ((0.0050, 0.00489, 0.0815), (0.0022, 0.00010, 0.0200)),
        ((-0.0005, 0.00489, 0.0904), (0.0110, 0.00010, 0.0022)),
        ((0.0008, 0.00489, 0.0815), (0.0084, 0.00010, 0.0022)),
        ((-0.0005, 0.00489, 0.0726), (0.0110, 0.00010, 0.0022)),
    )
    for index, (location, scale) in enumerate(specs):
        bpy.ops.mesh.primitive_cube_add(size=1, location=location)
        bar = bpy.context.object
        bar.name = f"display_mark_bar_{index + 1}"
        bar.dimensions = scale
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        bevel = bar.modifiers.new("Soft mark corners", "BEVEL")
        bevel.width = 0.00045
        bevel.segments = 3
        bpy.context.view_layer.objects.active = bar
        bpy.ops.object.modifier_apply(modifier=bevel.name)
        assign_material(bar, material)
        bars.append(bar)

    bpy.ops.object.select_all(action="DESELECT")
    for bar in bars:
        bar.select_set(True)
    bpy.context.view_layer.objects.active = bars[0]
    bpy.ops.object.join()
    mark = bpy.context.object
    mark.name = "display_logo_placeholder"
    move_to_collection(mark, collection)
    mark.hide_render = True
    mark.hide_viewport = True
    mark["usage"] = "Neutral Exportech technical placeholder; not exported in the screen-off production GLB"
    return mark


def animate_explosion(objects: dict[str, bpy.types.Object]) -> None:
    scene = bpy.context.scene
    scene.frame_start = 1
    scene.frame_end = 80
    states = ((1, 0.0), (12, 0.0), (28, 0.55), (48, 1.0), (64, 0.55), (80, 0.0))
    for name, obj in objects.items():
        if name == "rear_plateau":
            distance = -0.0012
        elif name.endswith("_ring"):
            distance = -0.0030
        elif name.endswith("_glass") and name.startswith("camera_"):
            distance = -0.0050
        else:
            continue
        base = obj.location.copy()
        for frame, factor in states:
            obj.location = base + mathutils.Vector((0.0, distance * factor, 0.0))
            obj.keyframe_insert(data_path="location", frame=frame, group="Camera exploded view")
        obj.location = base
        if obj.animation_data and obj.animation_data.action:
            action = obj.animation_data.action
            action.name = f"EX_Camera_Explode__{name}"
            action.use_fake_user = True
            for curve in action.fcurves:
                for point in curve.keyframe_points:
                    point.interpolation = "BEZIER"
                    point.handle_left_type = "AUTO_CLAMPED"
                    point.handle_right_type = "AUTO_CLAMPED"
            track = obj.animation_data.nla_tracks.new()
            track.name = "camera_exploded"
            strip = track.strips.new("camera_exploded", 1, action)
            strip.action_frame_start = 1
            strip.action_frame_end = 80
            obj.animation_data.action = None

    for frame, name in (
        (1, "assembled"),
        (12, "separation_start"),
        (28, "partially_expanded"),
        (48, "fully_presented"),
        (64, "returning"),
        (80, "assembled_return"),
    ):
        scene.timeline_markers.new(name, frame=frame)
    scene.frame_set(1)


def point_at(obj: bpy.types.Object, target: tuple[float, float, float]) -> None:
    direction = mathutils.Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def create_camera(
    name: str,
    collection: bpy.types.Collection,
    location: tuple[float, float, float],
    target: tuple[float, float, float],
    lens: float,
    safe_text_zone: str,
) -> bpy.types.Object:
    data = bpy.data.cameras.new(name)
    data.lens = lens
    data.sensor_width = 36
    camera = bpy.data.objects.new(name, data)
    collection.objects.link(camera)
    camera.location = location
    point_at(camera, target)
    camera["safe_text_zone"] = safe_text_zone
    return camera


def create_cameras(collection: bpy.types.Collection) -> dict[str, bpy.types.Object]:
    return {
        "camera_front": create_camera(
            "camera_front", collection, (0.095, 0.300, 0.115), (-0.004, 0.0, 0.087), 62, "left 24 percent"
        ),
        "camera_side": create_camera(
            "camera_side", collection, (0.350, 0.078, 0.105), (0.0, 0.0, 0.084), 70, "right 28 percent"
        ),
        "camera_back": create_camera(
            "camera_back", collection, (0.090, -0.300, 0.115), (-0.004, -0.003, 0.092), 62, "right 24 percent"
        ),
        "camera_close": create_camera(
            "camera_close", collection, (-0.078, -0.155, 0.153), (-0.014, -0.006, 0.141), 76, "lower right 28 percent"
        ),
        "camera_close_side": create_camera(
            "camera_close_side", collection, (0.075, -0.150, 0.151), (-0.013, -0.007, 0.141), 78, "lower left 28 percent"
        ),
    }


def world_dimensions(objects: list[bpy.types.Object]) -> list[float]:
    points = [obj.matrix_world @ mathutils.Vector(corner) for obj in objects for corner in obj.bound_box]
    minimum = mathutils.Vector(tuple(min(point[axis] for point in points) for axis in range(3)))
    maximum = mathutils.Vector(tuple(max(point[axis] for point in points) for axis in range(3)))
    return [round(value * 1000, 4) for value in maximum - minimum]


def write_report(manifest: dict[str, Any], path: Path) -> None:
    lines = [
        "# Preparo de produção — iPhone 17 Pro Max",
        "",
        f"Data: {manifest['date']}",
        f"Blender: {manifest['blender_version']}",
        "",
        "## Método",
        "",
        "O GLB de trabalho foi importado em cena limpa. Cada objeto semântico foi gerado exclusivamente a partir de ilhas de geometria desconectadas e materiais existentes. Nenhuma face visível foi cortada e nenhuma geometria interna de câmera foi inventada.",
        "",
        f"A limpeza removeu {manifest['totals']['removed_degenerate_polygons']} triângulos de área zero que já possuíam normais inválidas no fonte. Essa remoção não altera a superfície visível.",
        "",
        "O objeto-fonte permanece no `.blend` dentro da coleção oculta `SOURCE_REFERENCE`. O GLB original também permanece inalterado em `.tools/models/taufiq-k-original/`.",
        "",
        "## Objetos preparados",
        "",
        "| Objeto | Triângulos | Ilhas-fonte | Material de produção |",
        "| --- | ---: | ---: | --- |",
    ]
    for item in manifest["objects"]:
        lines.append(
            f"| `{item['name']}` | {item['triangles']:,} | {item['source_components']} | `{item['material']}` |"
        )
    lines.extend(
        [
            "",
            "## Estados técnicos",
            "",
            "- Display desligado: `EX_Display_Off` (estado padrão e exportado).",
            "- Display com emissão suave: `EX_Display_Soft_On`.",
            "- Logo provisório: `display_logo_placeholder`, símbolo técnico neutro da Exportech, oculto no estado padrão.",
            "- A superfície `display` pode receber uma textura futura sem alterar o vidro frontal.",
            "",
            "## Vista explodida",
            "",
            "A animação é reversível entre os frames 1 e 80. A plataforma desloca 1,2 mm, os aros 3 mm e os vidros das lentes 5 mm no eixo traseiro, sem deslocamento lateral. Marcadores registram os estados montado, início, parcial, apresentado e retorno.",
            "",
            "## Limitações honestas",
            "",
            "- Os nomes main, ultrawide e telephoto identificam os três grupos visuais pelo posicionamento convencional; o arquivo não contém metadados ópticos que comprovem o sensor interno de cada grupo.",
            "- Não foram criados sensores internos inexistentes no modelo-fonte.",
            "- O símbolo oficial da Apple presente no modelo-base foi preservado fisicamente; qualquer uso comercial ou animação de marca continua sujeito a revisão. A tela usa um placeholder neutro.",
            "- A integração com scroll, `<model-viewer>` ou frontend não faz parte deste preparo.",
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
    bpy.ops.import_scene.gltf(filepath=str(source), import_pack_images=True)
    imported = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if len(imported) != 1:
        raise RuntimeError(f"Expected exactly one source mesh, found {len(imported)}")
    source_object = imported[0]
    source_object.name = "source_reference__iphone17_taufiq_k"

    root = ensure_collection("IPHONE17_PRODUCTION")
    source_collection = ensure_collection("SOURCE_REFERENCE", root)
    body_collection = ensure_collection("BODY", root)
    camera_collection = ensure_collection("CAMERA_SYSTEM", root)
    display_collection = ensure_collection("DISPLAY", root)
    detail_collection = ensure_collection("DETAILS", root)
    rig_collection = ensure_collection("RIG", root)
    display_states_collection = ensure_collection("DISPLAY_TECH_STATES", root)
    move_to_collection(source_object, source_collection)
    source_object.hide_render = True
    source_object.hide_viewport = True
    source_collection.hide_render = True
    source_collection.hide_viewport = True

    component_data, face_roots = component_metadata(source_object)
    component_categories = {root_id: classify_component(item) for root_id, item in component_data.items()}
    face_categories = {face_index: component_categories[root_id] for face_index, root_id in face_roots.items()}
    category_components = Counter(component_categories.values())
    category_triangles = Counter()
    for root_id, category in component_categories.items():
        category_triangles[category] += component_data[root_id]["triangles"]

    materials = build_materials()
    materials["display_on"].use_fake_user = True
    objects: dict[str, bpy.types.Object] = {}
    for category in sorted(set(component_categories.values())):
        mesh = subset_mesh(source_object, category, face_categories, category)
        if not mesh.polygons:
            bpy.data.meshes.remove(mesh)
            continue
        obj = bpy.data.objects.new(category, mesh)
        obj.matrix_world = source_object.matrix_world.copy()
        if category.startswith("camera_"):
            target_collection = camera_collection
        elif category in {"display", "front_glass", "front_bezel", "dynamic_island"}:
            target_collection = display_collection
        elif category in {"phone_body", "rear_glass", "rear_plateau"}:
            target_collection = body_collection
        else:
            target_collection = detail_collection
        target_collection.objects.link(obj)
        if category.startswith("camera_") and category.endswith("_glass"):
            assign_camera_glass_materials(obj, materials)
        else:
            assign_material(obj, material_for_category(category, materials))
        set_origin_to_geometry(obj)
        obj["source_components"] = category_components[category]
        obj["semantic_role"] = category
        obj["export_for_web"] = True
        objects[category] = obj

    display = objects["display"]
    display["screen_state_off"] = materials["display_off"].name
    display["screen_state_soft_on"] = materials["display_on"].name
    display["screen_state_logo_placeholder"] = materials["display_mark"].name
    display["future_texture_ready"] = True
    create_placeholder_mark(display_states_collection, materials["display_mark"])
    animate_explosion(objects)
    cameras = create_cameras(rig_collection)
    bpy.context.scene.camera = cameras["camera_front"]

    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.length_unit = "MILLIMETERS"
    scene.unit_settings.scale_length = 1.0
    scene["asset_title"] = "iPhone 17 Pro Max"
    scene["base_model_author"] = "Taufiq K"
    scene["base_model_url"] = "https://sketchfab.com/3d-models/iphone-17-pro-max-e7c5674931ae4b0ea1b4eaaabb159fdb"
    scene["base_model_license"] = "Creative Commons Attribution 4.0"
    scene["attribution"] = "Modelo 3D base por Taufiq K no Sketchfab, licenciado sob CC BY 4.0; adaptado e otimizado pela Exportech."
    scene["production_variant"] = "silver"
    scene["frontend_integration"] = "not implemented in this branch"
    scene.frame_set(1)

    export_objects = list(objects.values())
    total_triangles = 0
    manifest_objects: list[dict[str, Any]] = []
    for obj in sorted(export_objects, key=lambda item: item.name):
        obj.data.calc_loop_triangles()
        triangles = len(obj.data.loop_triangles)
        total_triangles += triangles
        manifest_objects.append(
            {
                "name": obj.name,
                "vertices": len(obj.data.vertices),
                "triangles": triangles,
                "source_components": int(obj["source_components"]),
                "material": obj.data.materials[0].name if obj.data.materials else "<none>",
            }
        )

    source_triangles = sum(item["triangles"] for item in component_data.values())
    source_degenerate_polygons = sum(
        1 for polygon in source_object.data.polygons if polygon.area <= 1e-16
    )
    manifest = {
        "date": date.today().isoformat(),
        "blender_version": bpy.app.version_string,
        "source": source.name,
        "method": "complete disconnected islands grouped semantically; no face cuts",
        "variant": "silver",
        "objects": manifest_objects,
        "totals": {
            "objects": len(export_objects),
            "triangles": total_triangles,
            "source_triangles": source_triangles,
            "removed_degenerate_polygons": source_degenerate_polygons,
            "source_components": len(component_data),
            "dimensions_mm": world_dimensions(export_objects),
        },
        "animation": {
            "frame_start": 1,
            "frame_end": 80,
            "fully_presented_frame": 48,
            "return_frame": 80,
        },
        "cameras": sorted(cameras),
        "attribution": scene["attribution"],
    }
    expected_triangles = source_triangles - source_degenerate_polygons
    if manifest["totals"]["triangles"] != expected_triangles:
        raise RuntimeError(
            "Semantic separation changed triangles beyond the documented degenerate cleanup"
        )

    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.parent.mkdir(parents=True, exist_ok=True)
    blend_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    write_report(manifest, report_path)
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path), compress=True)
    print(
        "IPHONE17_PREPARED "
        f"objects={manifest['totals']['objects']} triangles={total_triangles} "
        f"components={manifest['totals']['source_components']} blend={blend_path.name}"
    )


if __name__ == "__main__":
    main()
