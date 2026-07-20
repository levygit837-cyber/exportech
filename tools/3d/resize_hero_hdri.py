"""Create a smaller local-only Radiance HDR environment for the 3D hero.

Run this script with Blender so the source remains in linear floating-point
space. It preserves the 2:1 equirectangular projection and writes another
Radiance HDR file; it does not involve an image-generation or upload service.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import sys
from datetime import date
from pathlib import Path

import bpy


EXPECTED_SOURCE_SIZE = (1024, 512)
OUTPUT_SIZE = (256, 128)
POLY_HAVEN_PAGE = "https://polyhaven.com/a/studio_small_08"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--max-bytes", type=int, default=150_000)
    parser.add_argument("--force", action="store_true")
    blender_args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    return parser.parse_args(blender_args)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def sampled_rgb_stats(image: bpy.types.Image, maximum_samples: int = 16_384) -> dict:
    pixels = image.pixels
    pixel_count = image.size[0] * image.size[1]
    step = max(1, pixel_count // maximum_samples)
    minimum = [math.inf, math.inf, math.inf]
    maximum = [-math.inf, -math.inf, -math.inf]
    totals = [0.0, 0.0, 0.0]
    samples = 0
    for pixel_index in range(0, pixel_count, step):
        offset = pixel_index * 4
        values = [float(pixels[offset + channel]) for channel in range(3)]
        if not all(math.isfinite(value) and value >= 0 for value in values):
            raise ValueError(f"HDR contains an invalid RGB sample at pixel {pixel_index}")
        for channel, value in enumerate(values):
            minimum[channel] = min(minimum[channel], value)
            maximum[channel] = max(maximum[channel], value)
            totals[channel] += value
        samples += 1
    return {
        "samples": samples,
        "min_rgb": [round(value, 8) for value in minimum],
        "max_rgb": [round(value, 8) for value in maximum],
        "mean_rgb": [round(value / samples, 8) for value in totals],
    }


def atomic_write_json(path: Path, payload: dict) -> None:
    temporary = path.with_name(path.name + ".tmp")
    temporary.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    os.replace(temporary, path)


def main() -> None:
    args = parse_args()
    source = Path(args.source).resolve()
    output = Path(args.output).resolve()
    manifest = Path(args.manifest).resolve()
    if not source.is_file():
        raise FileNotFoundError(source)
    if source == output:
        raise ValueError("Source and output must be different files")
    for target in (output, manifest):
        if target.exists() and not args.force:
            raise FileExistsError(f"Refusing to overwrite {target}; pass --force")
        target.parent.mkdir(parents=True, exist_ok=True)

    source_image = bpy.data.images.load(str(source), check_existing=False)
    source_image.colorspace_settings.name = "Non-Color"
    if tuple(source_image.size) != EXPECTED_SOURCE_SIZE or not source_image.is_float:
        raise ValueError(
            f"Unexpected source HDR: size={tuple(source_image.size)} "
            f"is_float={source_image.is_float}"
        )
    source_stats = sampled_rgb_stats(source_image)
    source_bytes = source.stat().st_size
    source_digest = sha256(source)

    source_image.scale(*OUTPUT_SIZE)
    source_image.filepath_raw = str(output)
    source_image.file_format = "HDR"
    source_image.save()
    if not output.is_file() or output.stat().st_size > args.max_bytes:
        raise ValueError(
            f"HDR output is missing or exceeds budget: "
            f"{output.stat().st_size if output.exists() else 'missing'}"
        )
    header = output.read_bytes()[:128]
    if not header.startswith(b"#?RADIANCE") or b"FORMAT=32-bit_rle_rgbe" not in header:
        raise ValueError("Output is not a valid Radiance RGBE file")

    bpy.data.images.remove(source_image)
    output_image = bpy.data.images.load(str(output), check_existing=False)
    output_image.colorspace_settings.name = "Non-Color"
    if tuple(output_image.size) != OUTPUT_SIZE or not output_image.is_float:
        raise ValueError(
            f"HDR reimport failed: size={tuple(output_image.size)} "
            f"is_float={output_image.is_float}"
        )
    output_stats = sampled_rgb_stats(output_image)
    if max(output_stats["max_rgb"]) <= 1:
        raise ValueError("HDR dynamic range was lost during resizing")

    payload = {
        "date": date.today().isoformat(),
        "pipeline": {
            "script": "tools/3d/resize_hero_hdri.py",
            "blender": bpy.app.version_string,
            "local_only": True,
            "source_uploaded": False,
            "resampling": "Blender Image.scale",
        },
        "source": {
            "filename": source.name,
            "bytes": source_bytes,
            "sha256": source_digest,
            "width": EXPECTED_SOURCE_SIZE[0],
            "height": EXPECTED_SOURCE_SIZE[1],
            "sampled_linear_rgb": source_stats,
        },
        "output": {
            "filename": output.name,
            "bytes": output.stat().st_size,
            "sha256": sha256(output),
            "width": OUTPUT_SIZE[0],
            "height": OUTPUT_SIZE[1],
            "format": "Radiance RGBE",
            "max_bytes": args.max_bytes,
            "reduction_percent": round(
                (1 - output.stat().st_size / source_bytes) * 100, 2
            ),
            "sampled_linear_rgb": output_stats,
        },
        "provenance": {
            "asset": "Studio Small 08",
            "source": POLY_HAVEN_PAGE,
            "license": "CC0",
        },
        "validation": {
            "radiance_header": True,
            "float_reimport": True,
            "equirectangular_aspect_ratio": "2:1",
            "dynamic_range_preserved": True,
        },
    }
    atomic_write_json(manifest, payload)
    print(
        "HERO_HDRI_RESIZED "
        f"bytes={output.stat().st_size} sha256={payload['output']['sha256']} "
        f"resolution={OUTPUT_SIZE[0]}x{OUTPUT_SIZE[1]} "
        f"reduction={payload['output']['reduction_percent']}%"
    )


if __name__ == "__main__":
    main()
