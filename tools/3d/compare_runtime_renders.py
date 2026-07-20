"""Compare two deterministic render directories with local pixel metrics.

Run with Blender. This is conventional numeric image analysis only: images are
not uploaded or sent to a generative/vision service.
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

import bpy
import numpy as np


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", required=True)
    parser.add_argument("--candidate-dir", required=True)
    parser.add_argument("--report", required=True)
    blender_args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    return parser.parse_args(blender_args)


def load_pixels(path: Path) -> np.ndarray:
    image = bpy.data.images.load(str(path), check_existing=False)
    width, height = image.size
    pixels = np.empty(width * height * 4, dtype=np.float32)
    image.pixels.foreach_get(pixels)
    bpy.data.images.remove(image)
    return pixels.reshape((height, width, 4))


def background_color(rgb: np.ndarray) -> np.ndarray:
    patch = 24
    corners = np.concatenate(
        (
            rgb[:patch, :patch].reshape(-1, 3),
            rgb[:patch, -patch:].reshape(-1, 3),
            rgb[-patch:, :patch].reshape(-1, 3),
            rgb[-patch:, -patch:].reshape(-1, 3),
        ),
        axis=0,
    )
    return np.median(corners, axis=0)


def silhouette(rgb: np.ndarray) -> np.ndarray:
    distance = np.linalg.norm(rgb - background_color(rgb), axis=2)
    return distance > 0.0125


def boundary(mask: np.ndarray) -> np.ndarray:
    interior = mask.copy()
    interior[1:, :] &= mask[:-1, :]
    interior[:-1, :] &= mask[1:, :]
    interior[:, 1:] &= mask[:, :-1]
    interior[:, :-1] &= mask[:, 1:]
    return mask & ~interior


def intersection_over_union(left: np.ndarray, right: np.ndarray) -> float:
    union = np.logical_or(left, right).sum()
    return float(np.logical_and(left, right).sum() / union) if union else 1.0


def compare(source: np.ndarray, candidate: np.ndarray) -> dict:
    if source.shape != candidate.shape:
        raise ValueError(f"Render shapes differ: {source.shape} != {candidate.shape}")
    source_rgb = source[:, :, :3]
    candidate_rgb = candidate[:, :, :3]
    source_mask = silhouette(source_rgb)
    candidate_mask = silhouette(candidate_rgb)
    union_mask = np.logical_or(source_mask, candidate_mask)
    difference = candidate_rgb - source_rgb
    absolute = np.abs(difference)
    squared = np.square(difference)
    mse = float(np.mean(squared))
    foreground_mse = float(np.mean(squared[union_mask])) if union_mask.any() else 0.0
    source_luma = np.sum(source_rgb * (0.2126, 0.7152, 0.0722), axis=2)
    candidate_luma = np.sum(candidate_rgb * (0.2126, 0.7152, 0.0722), axis=2)
    return {
        "width": source.shape[1],
        "height": source.shape[0],
        "rgb_mae": round(float(np.mean(absolute)), 8),
        "foreground_rgb_mae": round(
            float(np.mean(absolute[union_mask])) if union_mask.any() else 0.0, 8
        ),
        "rgb_rmse": round(math.sqrt(mse), 8),
        "foreground_rgb_rmse": round(math.sqrt(foreground_mse), 8),
        "psnr_db": round(-10 * math.log10(mse), 4) if mse else None,
        "foreground_psnr_db": (
            round(-10 * math.log10(foreground_mse), 4)
            if foreground_mse
            else None
        ),
        "luma_mae": round(float(np.mean(np.abs(candidate_luma - source_luma))), 8),
        "foreground_luma_mae": round(
            float(np.mean(np.abs(candidate_luma[union_mask] - source_luma[union_mask])))
            if union_mask.any()
            else 0.0,
            8,
        ),
        "silhouette_iou": round(intersection_over_union(source_mask, candidate_mask), 6),
        "boundary_iou": round(
            intersection_over_union(boundary(source_mask), boundary(candidate_mask)), 6
        ),
        "source_foreground_pixels": int(source_mask.sum()),
        "candidate_foreground_pixels": int(candidate_mask.sum()),
    }


def main() -> None:
    args = parse_args()
    source_dir = Path(args.source_dir).resolve()
    candidate_dir = Path(args.candidate_dir).resolve()
    report_path = Path(args.report).resolve()
    source_files = sorted(source_dir.glob("*.png"))
    candidate_by_name = {path.name: path for path in candidate_dir.glob("*.png")}
    if not source_files:
        raise FileNotFoundError(f"No source PNGs in {source_dir}")
    if set(path.name for path in source_files) != set(candidate_by_name):
        raise ValueError("Render directories do not contain the same PNG names")

    pairs = []
    for source_path in source_files:
        candidate_path = candidate_by_name[source_path.name]
        metrics = compare(load_pixels(source_path), load_pixels(candidate_path))
        pairs.append({"render": source_path.name, **metrics})
    summary = {
        "method": "Local Blender PNG pixel comparison; no external vision service",
        "pairs": pairs,
        "mean_silhouette_iou": round(
            sum(pair["silhouette_iou"] for pair in pairs) / len(pairs), 6
        ),
        "mean_boundary_iou": round(
            sum(pair["boundary_iou"] for pair in pairs) / len(pairs), 6
        ),
        "mean_foreground_rgb_mae": round(
            sum(pair["foreground_rgb_mae"] for pair in pairs) / len(pairs), 8
        ),
        "interpretation": (
            "Silhouette and boundary metrics check structural preservation; color/luma "
            "differences are expected after replacing advanced physical material lobes."
        ),
    }
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(
        json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
