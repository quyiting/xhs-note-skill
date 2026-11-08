#!/usr/bin/env python3
"""Generate a photo-style image through the MiniMax image API.

Why this exists: the cover of a note should look like a phone photo, and
running the prompt through a script keeps the whole batch reproducible.

Setup:
    export MINIMAX_API_KEY=sk-...        # required, never commit it

Usage:
    python3 scripts/genimg.py --prompt "..." --out assets/12-gin-fizz-src.jpg
    python3 scripts/genimg.py --prompt-file prompts/12.txt --out ... --seed 123

Notes:
  * model image-01, aspect_ratio 3:4 -> returns 864x1152 (already 3:4, no watermark)
  * the API ignores explicit width/height; upscale locally if you need more
  * if you use a different provider, only `call()` needs changing
"""
import argparse
import json
import os
import sys
import urllib.request

API = "https://api.minimaxi.com/v1/image_generation"


def key():
    k = os.environ.get("MINIMAX_API_KEY", "").strip()
    if not k:
        sys.exit("MINIMAX_API_KEY is not set. export MINIMAX_API_KEY=sk-...")
    return k


def call(prompt, aspect="3:4", model="image-01", seed=None, n=1):
    body = {
        "model": model,
        "prompt": prompt,
        "aspect_ratio": aspect,
        "response_format": "url",
        "n": n,
    }
    if seed is not None:
        body["seed"] = seed
    req = urllib.request.Request(
        API,
        data=json.dumps(body).encode(),
        headers={"Authorization": f"Bearer {key()}", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=180) as r:
        d = json.loads(r.read())
    if d.get("base_resp", {}).get("status_code") != 0:
        sys.exit("API error: " + json.dumps(d.get("base_resp"), ensure_ascii=False))
    return d["data"]["image_urls"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--prompt")
    ap.add_argument("--prompt-file")
    ap.add_argument("--out", required=True)
    ap.add_argument("--aspect", default="3:4")
    ap.add_argument("--model", default="image-01")
    ap.add_argument("--seed", type=int)
    a = ap.parse_args()

    if not a.prompt and not a.prompt_file:
        sys.exit("need --prompt or --prompt-file")
    prompt = a.prompt or open(a.prompt_file, encoding="utf-8").read()

    if os.path.exists(a.out):
        print(f"skip {a.out} (exists)")
        return

    url = call(prompt, a.aspect, a.model, a.seed)[0]
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    urllib.request.urlretrieve(url, a.out)
    print(f"saved {a.out} ({os.path.getsize(a.out)} bytes)")


if __name__ == "__main__":
    main()