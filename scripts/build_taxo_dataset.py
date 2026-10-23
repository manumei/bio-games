#!/usr/bin/env python3
"""Build the Taxo Bingo WebP image assets and data/organisms.json from raw-assets/taxo."""

from __future__ import annotations

import argparse
from collections import Counter
import json
import os
from pathlib import Path
import sys
from PIL import Image


ROOT_DIR = Path(__file__).resolve().parent.parent
DEFAULT_RAW_DIR = ROOT_DIR / "raw-assets" / "taxo"
DEFAULT_WEBP_DIR = ROOT_DIR / "public" / "assets" / "webp" / "games" / "taxo"
DEFAULT_JSON_OUT = ROOT_DIR / "data" / "organisms.json"
DEFAULT_OVERRIDES = ROOT_DIR / "scripts" / "data" / "name_overrides.json"


def format_binomial_name(stem: str) -> str:
    """Format a filename stem into binomial style: 'Genus species' or 'Genus spp.'."""
    cleaned = " ".join(stem.replace("_", " ").split()).lower()
    if not cleaned:
        return stem
    parts = cleaned.split(" ")
    parts[0] = parts[0].capitalize()
    if len(parts) > 1 and parts[-1] in ("spp", "sp"):
        parts[-1] = f"{parts[-1]}."
    return " ".join(parts)


def normalize_id(stem: str) -> str:
    """Normalize a file stem into a lowercase underscore organism id."""
    return "_".join(stem.replace("_", " ").split()).lower()


def load_overrides(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    return {str(k): str(v) for k, v in data.items()}


def should_encode(png_path: Path, webp_path: Path, force: bool) -> bool:
    if force or not webp_path.exists():
        return True
    return png_path.stat().st_mtime > webp_path.stat().st_mtime


def encode_webp(
    png_path: Path, webp_path: Path, max_size: int, quality: int
) -> None:
    webp_path.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(png_path) as img:
        width, height = img.size
        longest = max(width, height)
        if longest > max_size:
            scale = max_size / float(longest)
            new_size = (
                max(1, int(round(width * scale))),
                max(1, int(round(height * scale))),
            )
            img = img.resize(new_size, Image.Resampling.LANCZOS)
        img.save(webp_path, "WEBP", quality=quality, method=4)


def directory_bytes(root: Path, suffix: str) -> int:
    if not root.exists():
        return 0
    return sum(
        p.stat().st_size
        for p in root.rglob(f"*{suffix}")
        if p.is_file()
    )


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Encode Taxo Bingo WebP images and generate data/organisms.json."
    )
    parser.add_argument(
        "--raw-dir",
        type=Path,
        default=DEFAULT_RAW_DIR,
        help="Input directory containing raw PNGs organized by taxonomy path",
    )
    parser.add_argument(
        "--webp-dir",
        type=Path,
        default=DEFAULT_WEBP_DIR,
        help="Output directory for resized WebP images",
    )
    parser.add_argument(
        "--json-out",
        type=Path,
        default=DEFAULT_JSON_OUT,
        help="Output path for organisms.json",
    )
    parser.add_argument(
        "--overrides",
        type=Path,
        default=DEFAULT_OVERRIDES,
        help="Path to name_overrides.json",
    )
    parser.add_argument(
        "--max-size",
        type=int,
        default=1024,
        help="Maximum longest side in pixels (never upscales, default: 1024)",
    )
    parser.add_argument(
        "--quality",
        type=int,
        default=75,
        help="WebP encoding quality (default: 75)",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Re-encode all WebP images even if up to date",
    )
    args = parser.parse_args()

    if not args.raw_dir.exists():
        print(f"Error: raw directory not found: {args.raw_dir}", file=sys.stderr)
        return 1

    overrides = load_overrides(args.overrides)
    webp_bytes_before = directory_bytes(args.webp_dir, ".webp")
    raw_png_bytes = 0
    encoded_count = 0
    skipped_count = 0
    failures: list[str] = []
    organisms: list[dict[str, object]] = []
    category_counts: Counter[str] = Counter()

    for dirpath, dirnames, filenames in os.walk(args.raw_dir):
        if dirnames or not filenames:
            continue
        leaf_dir = Path(dirpath)
        rel_dir = leaf_dir.relative_to(args.raw_dir)
        taxon_path = [part.lower() for part in rel_dir.parts]

        for filename in sorted(filenames):
            if not filename.lower().endswith(".png"):
                continue

            png_path = leaf_dir / filename
            raw_png_bytes += png_path.stat().st_size
            stem = Path(filename).stem
            org_id = normalize_id(stem)
            webp_rel = Path(*rel_dir.parts) / f"{stem}.webp"
            webp_full = args.webp_dir / webp_rel
            public_url = "/assets/webp/games/taxo/" + webp_rel.as_posix()

            if should_encode(png_path, webp_full, args.force):
                try:
                    encode_webp(png_path, webp_full, args.max_size, args.quality)
                    encoded_count += 1
                except Exception as exc:  # noqa: BLE001
                    failures.append(f"{png_path}: {exc}")
                    continue
            else:
                skipped_count += 1

            display_name = (
                overrides.get(org_id)
                or overrides.get(stem)
                or format_binomial_name(stem)
            )

            organisms.append(
                {
                    "id": org_id,
                    "name": display_name,
                    "path": taxon_path,
                    "image": public_url,
                }
            )
            for taxon in taxon_path:
                category_counts[taxon] += 1

    organisms.sort(key=lambda item: str(item["id"]))
    args.json_out.parent.mkdir(parents=True, exist_ok=True)
    with args.json_out.open("w", encoding="utf-8", newline="\n") as f:
        json.dump(organisms, f, indent=2, ensure_ascii=False)
        f.write("\n")

    webp_bytes_after = directory_bytes(args.webp_dir, ".webp")

    print("=== Taxo Dataset Build Summary ===")
    print(f"Organisms written : {len(organisms)} -> {args.json_out}")
    print(f"WebPs encoded     : {encoded_count} (skipped {skipped_count})")
    print(f"Categories present: {len(category_counts)}")
    print(f"Raw PNG total     : {raw_png_bytes:,} bytes ({raw_png_bytes / (1024 * 1024):.2f} MiB)")
    print(
        f"WebP total before : {webp_bytes_before:,} bytes ({webp_bytes_before / (1024 * 1024):.2f} MiB)"
    )
    print(
        f"WebP total after  : {webp_bytes_after:,} bytes ({webp_bytes_after / (1024 * 1024):.2f} MiB)"
    )
    print("\nCounts per category:")
    for taxon, count in sorted(category_counts.items()):
        print(f"  {taxon:<18} {count:>4}")

    if failures:
        print(f"\nFailed ({len(failures)}):", file=sys.stderr)
        for failure in failures:
            print(f"  - {failure}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

