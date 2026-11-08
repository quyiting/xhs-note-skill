#!/usr/bin/env python3
"""Render a plain 3:4 placeholder cover (grey card with the item name).

Use it when the body is ready but the photo isn't: the note can be staged in
the draft box immediately, and the image swapped later.

Usage:
    python3 scripts/placeholder.py --out assets/12-x-cover.jpg --label "金菲士"
"""
import argparse
import os
from PIL import Image, ImageDraw, ImageFont

W, H = 1242, 1656
FONT_CANDIDATES = [
    "/System/Library/Fonts/Hiragino Sans GB.ttc",
    "/System/Library/Fonts/PingFang.ttc",
    "/System/Library/Fonts/STHeiti Light.ttc",
    "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
]


def pick_font(size):
    for p in FONT_CANDIDATES:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                continue
    return ImageFont.load_default()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--label", default="")
    a = ap.parse_args()

    im = Image.new("RGB", (W, H), (238, 233, 224))
    d = ImageDraw.Draw(im)
    d.rectangle([60, 60, W - 60, H - 60], outline=(198, 190, 176), width=3)

    if a.label:
        f = pick_font(58)
        tw = d.textbbox((0, 0), a.label, font=f)[2]
        d.text(((W - tw) // 2, H // 2 - 30), a.label, font=f, fill=(150, 142, 128))
        f2 = pick_font(34)
        t2 = "首图待替换"
        tw2 = d.textbbox((0, 0), t2, font=f2)[2]
        d.text(((W - tw2) // 2, H // 2 + 50), t2, font=f2, fill=(176, 168, 154))

    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    im.save(a.out, quality=92)
    print("saved", a.out, im.size)


if __name__ == "__main__":
    main()