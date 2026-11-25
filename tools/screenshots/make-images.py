#!/usr/bin/env python3
"""Turns the raw captures (PNG, straight from Playwright) into the WebP files the site serves.
Every capture is made in a dark and a light version (MODE=dark|light, see lib.mjs) and becomes <name>-dark.webp and <name>-light.webp.
Nothing is edited except the crop of a few pages whose lower part is empty (see the boxes below) and the social-preview image (a crop of one capture).
Usage: python3 -I tools/screenshots/make-images.py <raw-dir> <out-dir>"""
import sys
from pathlib import Path
from PIL import Image

raw, out = Path(sys.argv[1]), Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)

# site name -> (raw name without the -dark/-light suffix, crop box or None)
PICKS = {
    "music-desk-home": ("music-desk-home", None),
    "music-desk-albums": ("music-desk-albums", None),
    "music-desk-rank": ("music-desk-rank", None),
    "music-desk-album": ("music-desk-album", None),
    "music-desk-tracks": ("music-desk-tracks", None),
    "pantry-desk-recipes": ("pantry-desk-recipes", None),
    "pantry-desk-recipe": ("pantry-desk-recipe", None),
    "pantry-desk-shopping": ("pantry-desk-shopping", None),
    "pantry-phone-recipes": ("pantry-phone-recipes", None),
    "pantry-phone-pantry": ("pantry-phone-pantry", None),
    "pantry-phone-shopping": ("pantry-phone-shopping", None),
    "keep-desk-home": ("keep-desk-home", None),
    "keep-desk-wall": ("keep-desk-wall", None),
    "keep-desk-note": ("keep-desk-note", None),
    "keep-phone-home": ("keep-phone-home", None),
    "cut-desk-edit": ("cut-desk-edit", None),
    "docs-desk-doc": ("docs-desk-doc", None),
    "docs-desk-sheet": ("docs-desk-sheet", None),
    "docs-desk-slides": ("docs-desk-slides", None),
    "budget-desk-accounts": ("budget-desk-accounts", None),
    "budget-desk-subs": ("budget-desk-subs", None),
    "budget-desk-debts": ("budget-desk-debts", (0, 0, 1440, 560)),
    "budget-desk-graphs": ("budget-desk-graphs", None),
    "turboui-demo": ("ui-demo", None),
}
# the four "looks" strips are made once each (they are about the look, so they do not follow dark/light): site name -> (raw file, crop)
LOOKS = {
    "turbomusic-look-dark": ("looks-music-dark", (0, 0, 1440, 560)),
    "turbomusic-look-light": ("looks-music-light", (0, 0, 1440, 560)),
    "turbomusic-look-glass": ("looks-music-glass", (0, 0, 1440, 560)),
    "turbomusic-look-cyber": ("looks-music-cyber", (0, 0, 1440, 560)),
}
total = 0
def save(im, dest):
    global total
    im.save(dest, "WEBP", quality=84, method=6)
    total += dest.stat().st_size
    print(f"{dest.name}  {im.width}x{im.height}  {dest.stat().st_size // 1024} KB")

for name, (src, box) in PICKS.items():
    for mode in ("dark", "light"):
        f = raw / f"{src}-{mode}.png"
        if not f.exists():
            print("MISSING", f)
            continue
        im = Image.open(f).convert("RGB")
        if box:
            im = im.crop(box)
        save(im, out / f"{name}-{mode}.webp")
for name, (src, box) in LOOKS.items():
    f = raw / f"{src}.png"
    if not f.exists():
        print("MISSING", f)
        continue
    save(Image.open(f).convert("RGB").crop(box), out / f"{name}.webp")
print(f"total {total // 1024} KB")

# the social preview (1200x630): the dark album grid, cropped to the shape, at the site root
og = raw / "music-desk-albums-dark.png"
if og.exists():
    im = Image.open(og).convert("RGB").crop((224, 60, 1424, 690))
    dest = out.parent.parent / "og.png"
    im.save(dest, optimize=True)
    print("og.png", im.size)
