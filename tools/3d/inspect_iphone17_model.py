"""Inspect the licensed iPhone 17 Pro Max GLB without modifying it.

Run with Blender 3.6 in background mode. The script imports the GLB into a
clean scene, measures geometry and topology, inventories PBR materials and
embedded images, and writes both JSON evidence and a readable Markdown report.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any

import bpy
import mathutils


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", required=True)
    parser.add_argument("--json", required=True)
    parser.add_argument("--report", required=True)
    parser.add_argument("--label", default="iPhone 17 Pro Max")
    parser.add_argument("--author", default="Taufiq K")
    parser.add_argument(
        "--page",
        default="https://sketchfab.com/3d-models/iphone-17-pro-max-e7c5674931ae4b0ea1b4eaaabb159fdb",
    )
    parser.add_argument("--license", default="Creative Commons Attribution 4.0")
    blender_args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    return parser.parse_args(blender_args)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def vector(values: mathutils.Vector, scale: float = 1.0) -> list[float]:
    return [round(float(value) * scale, 4) for value in values]


def world_bounds(obj: bpy.types.Object) -> tuple[mathutils.Vector, mathutils.Vector]:
    points = [obj.matrix_world @ mathutils.Vector(corner) for corner in obj.bound_box]
    minimum = mathutils.Vector(tuple(min(point[axis] for point in points) for axis in range(3)))
    maximum = mathutils.Vector(tuple(max(point[axis] for point in points) for axis in range(3)))
    return minimum, maximum


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


def material_snapshot(material: bpy.types.Material) -> dict[str, Any]:
    snapshot: dict[str, Any] = {
        "name": material.name,
        "blend_method": material.blend_method,
        "use_nodes": material.use_nodes,
        "images": [],
    }
    if not material.use_nodes or not material.node_tree:
        return snapshot

    principled = next(
        (node for node in material.node_tree.nodes if node.type == "BSDF_PRINCIPLED"),
        None,
    )
    if principled:
        for label, socket_name in (
            ("base_color", "Base Color"),
            ("metallic", "Metallic"),
            ("roughness", "Roughness"),
            ("alpha", "Alpha"),
            ("emission", "Emission"),
            ("emission_strength", "Emission Strength"),
        ):
            socket = principled.inputs.get(socket_name)
            if socket is None:
                continue
            value = socket.default_value
            snapshot[label] = [round(float(v), 5) for v in value] if hasattr(value, "__len__") else round(float(value), 5)
            snapshot[f"{label}_linked"] = bool(socket.is_linked)

    snapshot["images"] = sorted(
        {
            node.image.name
            for node in material.node_tree.nodes
            if node.type == "TEX_IMAGE" and node.image
        }
    )
    return snapshot


def mesh_snapshot(obj: bpy.types.Object) -> dict[str, Any]:
    mesh = obj.data
    mesh.calc_loop_triangles()
    minimum, maximum = world_bounds(obj)
    dimensions = maximum - minimum

    union = UnionFind(len(mesh.vertices))
    for edge in mesh.edges:
        union.union(edge.vertices[0], edge.vertices[1])

    vertices_by_component: dict[int, list[int]] = defaultdict(list)
    polygons_by_component: dict[int, list[bpy.types.MeshPolygon]] = defaultdict(list)
    for vertex in mesh.vertices:
        vertices_by_component[union.find(vertex.index)].append(vertex.index)
    for polygon in mesh.polygons:
        polygons_by_component[union.find(polygon.vertices[0])].append(polygon)

    material_names = [slot.material.name if slot.material else "<none>" for slot in obj.material_slots]
    components: list[dict[str, Any]] = []
    for root, vertex_indices in vertices_by_component.items():
        world_points = [obj.matrix_world @ mesh.vertices[index].co for index in vertex_indices]
        component_min = mathutils.Vector(tuple(min(point[axis] for point in world_points) for axis in range(3)))
        component_max = mathutils.Vector(tuple(max(point[axis] for point in world_points) for axis in range(3)))
        component_polygons = polygons_by_component.get(root, [])
        material_counts = Counter(
            material_names[polygon.material_index]
            if polygon.material_index < len(material_names)
            else "<invalid>"
            for polygon in component_polygons
        )
        components.append(
            {
                "vertices": len(vertex_indices),
                "polygons": len(component_polygons),
                "triangles": sum(max(1, len(polygon.vertices) - 2) for polygon in component_polygons),
                "center_mm": vector((component_min + component_max) * 0.5, 1000),
                "dimensions_mm": vector(component_max - component_min, 1000),
                "materials": dict(sorted(material_counts.items())),
            }
        )
    components.sort(key=lambda item: (item["triangles"], item["vertices"]), reverse=True)
    for index, component in enumerate(components, 1):
        component["component"] = index

    edge_faces = Counter()
    duplicate_faces = Counter()
    for polygon in mesh.polygons:
        duplicate_faces[tuple(sorted(polygon.vertices))] += 1
        vertices = list(polygon.vertices)
        for index, start in enumerate(vertices):
            edge_faces[tuple(sorted((start, vertices[(index + 1) % len(vertices)])))] += 1

    material_polygons = Counter(
        material_names[polygon.material_index]
        if polygon.material_index < len(material_names)
        else "<invalid>"
        for polygon in mesh.polygons
    )

    return {
        "name": obj.name,
        "vertices": len(mesh.vertices),
        "edges": len(mesh.edges),
        "polygons": len(mesh.polygons),
        "triangles": len(mesh.loop_triangles),
        "material_slots": material_names,
        "material_polygon_counts": dict(sorted(material_polygons.items())),
        "dimensions_mm": vector(dimensions, 1000),
        "bounds_min_mm": vector(minimum, 1000),
        "bounds_max_mm": vector(maximum, 1000),
        "scale": vector(obj.scale),
        "rotation_radians": vector(obj.rotation_euler),
        "loose_components": len(components),
        "boundary_edges": sum(1 for count in edge_faces.values() if count == 1),
        "non_manifold_edges": sum(1 for count in edge_faces.values() if count != 2),
        "duplicate_faces": sum(count - 1 for count in duplicate_faces.values() if count > 1),
        "degenerate_polygons": sum(1 for polygon in mesh.polygons if polygon.area <= 1e-16),
        "invalid_normals": sum(1 for vertex in mesh.vertices if vertex.normal.length < 0.5)
        + sum(1 for polygon in mesh.polygons if polygon.normal.length < 0.5),
        "components": components,
    }


def image_snapshot(image: bpy.types.Image) -> dict[str, Any]:
    packed = bool(image.packed_file or image.packed_files)
    return {
        "name": image.name,
        "size_px": [int(image.size[0]), int(image.size[1])],
        "channels": int(image.channels),
        "colorspace": image.colorspace_settings.name,
        "packed": packed,
        "filepath": image.filepath,
    }


def animation_snapshot() -> dict[str, Any]:
    scene = bpy.context.scene
    original_frame = scene.frame_current
    sample_frames = (1, 12, 28, 48, 64, 80)
    animated_objects: list[dict[str, Any]] = []
    action_names: set[str] = set()
    for obj in scene.objects:
        animation_data = obj.animation_data
        if not animation_data:
            continue
        actions = []
        if animation_data.action:
            actions.append(animation_data.action)
        for track in animation_data.nla_tracks:
            actions.extend(strip.action for strip in track.strips if strip.action)
        if not actions:
            continue
        action_names.update(action.name for action in actions)
        samples: dict[str, list[float]] = {}
        for frame in sample_frames:
            scene.frame_set(frame)
            samples[str(frame)] = vector(obj.matrix_world.translation, 1000)
        start = mathutils.Vector(samples["1"])
        end = mathutils.Vector(samples["80"])
        max_displacement = max((mathutils.Vector(value) - start).length for value in samples.values())
        animated_objects.append(
            {
                "name": obj.name,
                "actions": sorted({action.name for action in actions}),
                "samples_mm": samples,
                "return_error_mm": round((end - start).length, 6),
                "max_displacement_mm": round(max_displacement, 4),
            }
        )
    scene.frame_set(original_frame)
    return {
        "actions": sorted(action_names),
        "animated_objects": sorted(animated_objects, key=lambda item: item["name"]),
        "sample_frames": list(sample_frames),
        "maximum_return_error_mm": max(
            (item["return_error_mm"] for item in animated_objects), default=0.0
        ),
    }


def write_markdown(data: dict[str, Any], path: Path) -> None:
    asset = data["asset"]
    totals = data["totals"]
    provenance = data["provenance"]
    lines = [
        f"# Inspeção do GLB: {provenance['label']}",
        "",
        f"Data da inspeção: {data['inspection_date']}",
        f"Blender: {data['blender_version']}",
        "",
        "## Procedência do arquivo",
        "",
        f"- Modelo: {provenance['label']}",
        f"- Autor: {provenance['author']}",
        f"- Página: <{provenance['page']}>",
        f"- Licença informada na página: {provenance['license']}",
        f"- Arquivo inspecionado: `{asset['filename']}`",
        f"- Tamanho: {asset['bytes']:,} bytes",
        f"- SHA-256: `{asset['sha256']}`",
        "",
        "## Resultado resumido",
        "",
        f"- Objetos de malha: {totals['meshes']}",
        f"- Vértices: {totals['vertices']:,}",
        f"- Triângulos: {totals['triangles']:,}",
        f"- Materiais: {totals['materials']}",
        f"- Imagens carregadas: {totals['images']} ({totals['packed_images']} incorporadas ao GLB)",
        f"- Dimensões totais (X × Y × Z): {totals['dimensions_mm'][0]:.4f} × {totals['dimensions_mm'][1]:.4f} × {totals['dimensions_mm'][2]:.4f} mm",
        f"- Ilhas desconectadas: {totals['loose_components']}",
        f"- Faces duplicadas detectadas: {totals['duplicate_faces']}",
        "",
        "O eixo Y corresponde à profundidade. A medida inclui o relevo total das câmeras e não deve ser comparada diretamente à espessura oficial do corpo.",
        "",
        "## Malhas",
        "",
    ]
    for mesh in data["meshes"]:
        lines.extend(
            [
                f"### `{mesh['name']}`",
                "",
                f"- Vértices / polígonos / triângulos: {mesh['vertices']:,} / {mesh['polygons']:,} / {mesh['triangles']:,}",
                f"- Dimensões: {mesh['dimensions_mm'][0]:.4f} × {mesh['dimensions_mm'][1]:.4f} × {mesh['dimensions_mm'][2]:.4f} mm",
                f"- Ilhas desconectadas: {mesh['loose_components']}",
                f"- Arestas de contorno / não manifold: {mesh['boundary_edges']:,} / {mesh['non_manifold_edges']:,}",
                f"- Faces duplicadas: {mesh['duplicate_faces']}",
                f"- Polígonos degenerados / normais inválidas: {mesh['degenerate_polygons']} / {mesh['invalid_normals']}",
                "",
                "Principais ilhas por contagem de triângulos:",
                "",
                "| Ilha | Triângulos | Centro mm (X, Y, Z) | Dimensões mm (X, Y, Z) | Materiais |",
                "| ---: | ---: | --- | --- | --- |",
            ]
        )
        for component in mesh["components"][:40]:
            materials = ", ".join(f"{name}: {count}" for name, count in component["materials"].items())
            lines.append(
                f"| {component['component']} | {component['triangles']:,} | "
                f"{', '.join(f'{value:.3f}' for value in component['center_mm'])} | "
                f"{', '.join(f'{value:.3f}' for value in component['dimensions_mm'])} | {materials} |"
            )
        lines.append("")

    lines.extend(["## Materiais", ""])
    for material in data["materials"]:
        images = ", ".join(material["images"]) or "sem textura de imagem"
        lines.append(f"- `{material['name']}` — imagens: {images}")

    lines.extend(["", "## Imagens", ""])
    if data["images"]:
        for image in data["images"]:
            lines.append(
                f"- `{image['name']}` — {image['size_px'][0]} × {image['size_px'][1]} px, "
                f"{image['colorspace']}, incorporada: {'sim' if image['packed'] else 'não'}"
            )
    else:
        lines.append("- Nenhuma imagem foi carregada.")

    animation = data["animation"]
    lines.extend(["", "## Animação reimportada", ""])
    if animation["animated_objects"]:
        lines.extend(
            [
                f"- Ações: {', '.join(animation['actions'])}",
                f"- Objetos animados: {len(animation['animated_objects'])}",
                f"- Maior erro de retorno entre frames 1 e 80: {animation['maximum_return_error_mm']:.6f} mm",
                "",
                "| Objeto | Deslocamento máximo | Erro de retorno |",
                "| --- | ---: | ---: |",
            ]
        )
        for item in animation["animated_objects"]:
            lines.append(
                f"| `{item['name']}` | {item['max_displacement_mm']:.4f} mm | {item['return_error_mm']:.6f} mm |"
            )
    else:
        lines.append("- Nenhuma animação foi encontrada.")

    lines.extend(
        [
            "",
            "## Interpretação",
            "",
            "A inspeção é descritiva e não altera o GLB. Ilhas desconectadas e materiais são pistas para a separação sem cortes; a classificação semântica final precisa ser confirmada por renders após o preparo.",
            "",
        ]
    )
    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    args = parse_args()
    source = Path(args.file).resolve()
    json_path = Path(args.json).resolve()
    report_path = Path(args.report).resolve()
    if not source.is_file():
        raise FileNotFoundError(source)

    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    bpy.ops.import_scene.gltf(filepath=str(source), import_pack_images=True)

    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not meshes:
        raise RuntimeError("The imported GLB does not contain a mesh")

    mesh_data = [mesh_snapshot(obj) for obj in meshes]
    materials = [material_snapshot(material) for material in bpy.data.materials]
    images = [image_snapshot(image) for image in bpy.data.images if image.source != "VIEWER"]

    all_points = [obj.matrix_world @ mathutils.Vector(corner) for obj in meshes for corner in obj.bound_box]
    minimum = mathutils.Vector(tuple(min(point[axis] for point in all_points) for axis in range(3)))
    maximum = mathutils.Vector(tuple(max(point[axis] for point in all_points) for axis in range(3)))

    data = {
        "inspection_date": date.today().isoformat(),
        "blender_version": bpy.app.version_string,
        "asset": {
            "filename": source.name,
            "bytes": source.stat().st_size,
            "sha256": sha256(source),
        },
        "provenance": {
            "label": args.label,
            "author": args.author,
            "page": args.page,
            "license": args.license,
        },
        "totals": {
            "meshes": len(meshes),
            "vertices": sum(item["vertices"] for item in mesh_data),
            "triangles": sum(item["triangles"] for item in mesh_data),
            "materials": len({name for item in mesh_data for name in item["material_slots"] if name != "<none>"}),
            "images": len(images),
            "packed_images": sum(1 for item in images if item["packed"]),
            "dimensions_mm": vector(maximum - minimum, 1000),
            "loose_components": sum(item["loose_components"] for item in mesh_data),
            "duplicate_faces": sum(item["duplicate_faces"] for item in mesh_data),
        },
        "meshes": mesh_data,
        "materials": materials,
        "images": images,
        "animation": animation_snapshot(),
    }

    json_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    write_markdown(data, report_path)
    print(
        "IPHONE17_INSPECTION "
        f"meshes={data['totals']['meshes']} vertices={data['totals']['vertices']} "
        f"triangles={data['totals']['triangles']} materials={data['totals']['materials']} "
        f"images={data['totals']['images']} components={data['totals']['loose_components']}"
    )


if __name__ == "__main__":
    main()
