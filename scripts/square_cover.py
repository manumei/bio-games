#!/usr/bin/env python3
"""Convert an image into a square cover image via padding, center-cropping, or stretching."""

from __future__ import annotations

import argparse
from pathlib import Path
from PIL import Image, ImageOps


def make_square(
    img: Image.Image,
    mode: str = "pad",
    size: int | None = None,
    bg_color: tuple[int, int, int, int] = (8, 22, 43, 255),
) -> Image.Image:
    width, height = img.size
    target_size = size or max(width, height)

    if mode == "stretch":
        return img.resize((target_size, target_size), Image.Resampling.LANCZOS)

    if mode == "crop":
        return ImageOps.fit(
            img,
            (target_size, target_size),
            method=Image.Resampling.LANCZOS,
            centering=(0.5, 0.5),
        )

    if mode == "pad":
        rgba = img.convert("RGBA")
        contained = ImageOps.contain(
            rgba, (target_size, target_size), method=Image.Resampling.LANCZOS
        )
        canvas = Image.new("RGBA", (target_size, target_size), bg_color)
        offset = (
            (target_size - contained.width) // 2,
            (target_size - contained.height) // 2,
        )
        canvas.paste(contained, offset, contained)
        return canvas if img.mode == "RGBA" else canvas.convert(img.mode)

    raise ValueError(f"Unsupported mode: {mode}")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Convert an image to a square cover image."
    )
    parser.add_argument("input", type=Path, help="Input image path")
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=None,
        help="Output image path (defaults to overwriting input)",
    )
    parser.add_argument(
        "--mode",
        choices=("pad", "crop", "stretch"),
        default="pad",
        help="How to square the image (default: pad)",
    )
    parser.add_argument(
        "--size",
        type=int,
        default=None,
        help="Target side length in pixels (default: max(width, height))",
    )
    args = parser.parse_args()

    out_path = args.output or args.input
    with Image.open(args.input) as img:
        squared = make_square(img, mode=args.mode, size=args.size)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        squared.save(out_path)

    print(f"Saved {squared.size[0]}x{squared.size[1]} ({args.mode}) -> {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

