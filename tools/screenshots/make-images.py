#!/usr/bin/env python3
"""Turns the raw captures (PNG, straight from Playwright) into the WebP files the site serves.
Nothing is edited except the crop of the "looks" strip (top of the page only, the rest is empty).
Usage: python3 -I tools/screenshots/make-images.py <raw-dir> <out-dir>"""
import sys
from pathlib import Path
from PIL import Image

raw, out = Path(sys.argv[1]), Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)

# site name -> (raw file, crop box or None)
PICKS = {
    "turbomusic-home": ("music-desk-home", None),
    "turbomusic-rank": ("music-desk-rank", None),
    "turbomusic-album": ("music-desk-album", None),
    "turbomusic-tracks": ("music-desk-tracks", None),
    "turbomusic-look-dark": ("looks-music-dark", (0, 0, 1440, 560)),
    "turbomusic-look-light": ("looks-music-light", (0, 0, 1440, 560)),
    "turbomusic-look-glass": ("looks-music-glass", (0, 0, 1440, 560)),
    "turbomusic-look-cyber": ("looks-music-cyber", (0, 0, 1440, 560)),
    "turbopantry-recipe": ("pantry-desk-recipe", None),
    "turbopantry-shopping": ("pantry-desk-shopping", None),
    "turbopantry-pantry-phone": ("pantry-phone-pantry", None),
    "turbopantry-shopping-phone": ("pantry-phone-shopping", None),
    "turbokeep-home": ("keep-desk-home", None),
    "turbokeep-note": ("keep-desk-note", None),
    "turbokeep-home-phone": ("keep-phone-home", None),
    "turbocut-edit": ("cut-desk-edit", None),
    "turbodocs-doc": ("docs-desk-doc", None),
    "turbodocs-sheet": ("docs-desk-sheet", None),
    "turbodocs-slides": ("docs-desk-slides", None),
    "turbobudget-accounts": ("budget-desk-accounts", None),
    "turbobudget-subs": ("budget-desk-subs", None),
    "turbobudget-debts": ("budget-desk-debts", (0, 0, 1440, 560)),
    "turbobudget-graphs": ("budget-desk-graphs", None),
}
total = 0
for name, (src, box) in PICKS.items():
    im = Image.open(raw / f"{src}.png").convert("RGB")
    if box:
        im = im.crop(box)
    dest = out / f"{name}.webp"
    im.save(dest, "WEBP", quality=84, method=6)
    total += dest.stat().st_size
    print(f"{name}.webp  {im.width}x{im.height}  {dest.stat().st_size // 1024} KB")
print(f"total {total // 1024} KB")
