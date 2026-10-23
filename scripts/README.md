# BioGames Data & Asset Scripts

Python 3.10+ utilities for building datasets and preparing image assets.

## Setup

```bash
pip install -r scripts/requirements.txt
```

## Scripts

### `scripts/build_taxo_dataset.py`

Walks `raw-assets/taxo/<taxonomy-path>/<organism>.png` (leaf folders), resizes images to at most `1024px` on their longest side (never upscaling), encodes WebP files into `public/assets/webp/games/taxo/`, and writes `data/organisms.json` sorted by organism `id`.

Display names are formatted in binomial style (`Genus species`, `Genus spp.`) with manual overrides loaded from `scripts/data/name_overrides.json`.

```bash
# Incremental build (only encodes new/updated PNGs)
python scripts/build_taxo_dataset.py

# Force re-encoding all 546 WebP images
python scripts/build_taxo_dataset.py --force
```

### `scripts/square_cover.py`

Converts an image into a square cover image using `--mode pad` (default), `crop`, or `stretch`.

```bash
python scripts/square_cover.py public/assets/img/covers/home/taxo.png --mode pad
```

### `scripts/notebooks/wordvec.ipynb`

Historical notebook used to prototype `public/assets/data/bio_words.txt`. Not runnable without external files (`bioword.vec.bin`, `desc2025.xml`).

