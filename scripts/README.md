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

### `scripts/build_wordle_lists.py`

Builds the curated Bio Wordle answer dataset (`games/bio-wordle/data/answers.json`, 555 biology words of lengths 4–7 with topics and plain-language definitions ≤ 120 chars), logs rejected words from `scripts/data/bio_words_raw.txt` into `scripts/data/bio_words_rejected.txt`, and generates the per-length allowed guess lists (`public/assets/data/wordle/allowed-{4,5,6,7}.txt`).

- **Allowed guess dictionary source:** The **ENABLE** (`Enhanced North American Benchmark LExicon`) word list (`enable1.txt`) compiled by Alan Beale and M Cooper.
- **Source URL:** `https://raw.githubusercontent.com/dolph/dictionary/master/enable1.txt`
- **License:** Public Domain (explicitly placed in the public domain by its authors).
- **Word counts by length:**
  - `allowed-4.txt`: 3,904 words (138 curated answers)
  - `allowed-5.txt`: 8,639 words (142 curated answers)
  - `allowed-6.txt`: 15,234 words (144 curated answers)
  - `allowed-7.txt`: 23,114 words (131 curated answers)
  - Total: 50,891 allowed words, 555 curated answers

```bash
python scripts/build_wordle_lists.py
```

### `scripts/square_cover.py`

Converts an image into a square cover image using `--mode pad` (default), `crop`, or `stretch`.

```bash
python scripts/square_cover.py public/assets/img/covers/home/taxo.png --mode pad
```

### `scripts/notebooks/wordvec.ipynb`

Historical notebook used to prototype `scripts/data/bio_words_raw.txt`. Not runnable without external files (`bioword.vec.bin`, `desc2025.xml`).
