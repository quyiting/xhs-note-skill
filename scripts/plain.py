#!/usr/bin/env python3
"""Turn a raw image into a clean 3:4 cover — NO TEXT ADDED.

This is the default cover tool. Per the account profile's `visual.image_mode:
photo`, the first image is a bare photo; all wording lives in the title.

Jobs:
  1. crop to 3:4 without cutting the subject
  2. optionally crop a corner watermark away (cheaper than inpainting)

Usage:
    python3 scripts/plain.py --photo raw.jpg --out assets/12-x-cover.jpg
    python3 scripts/plain.py --photo raw.jpg --out ... --crop 108,120,1619,2135
    python3 scripts/plain.py --photo raw.jpg --out ... --bias 0.35   # keep subject higher

Watermark tip: most generators stamp the bottom-right corner. Cropping it off
is cleaner than inpainting a semi-transparent logo over textured surfaces.
"""
import argparse
import os
from PIL import Image

W, H = 1242, 1656


def crop_34(im, bias=0.42):
    """Centre-crop to 3:4. bias=0 keeps the top edge, 1 keeps the bottom."""
    w, h = im.size
    target = W / H
    if w / h > target:                      # too wide -> trim sides
        nw = int(h * target)
        im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:                                   # too tall -> trim top/bottom
        nh = int(w / target)
        top = max(0, int((h - nh) * bias))
        im = im.crop((0, top, w, top + nh))
    return im.resize((W, H), Image.LANCZOS)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--photo", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--crop", default="", help="explicit box x0,y0,x1,y1")
    ap.add_argument("--bias", type=float, default=0.42)
    ap.add_argument("--size", default=f"{W}x{H}", help="output size, e.g. 1080x1440")
    a = ap.parse_args()

    im = Image.open(a.photo).convert("RGB")
    if a.crop:
        box = tuple(int(v) for v in a.crop.split(","))
        im = im.crop(box)
        print("cropped to", box, "->", im.size)

    im = crop_34(im, a.bias)
    ow, oh = (int(v) for v in a.size.lower().split("x"))
    if (ow, oh) != im.size:
        im = im.resize((ow, oh), Image.LANCZOS)

    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    im.save(a.out, quality=95)
    print("saved", a.out, im.size)


if __name__ == "__main__":
    main()