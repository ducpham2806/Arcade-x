#!/usr/bin/env python3
"""Cut game sprites out of Gemini design sheets and export WebP.

Usage: python3 -I scripts/art/import-gemini.py art/gemini/<game>/crops.json [--check]

crops.json:
  {"items": [{"name", "source", "box": [x, y, w, h], "method": "flood" | "chroma" | "none",
              "out": "public/...webp", "size": [w, h] or N (fit inside N x N),
              "cover": [w, h] (crop to aspect then resize), "square": true, "quality": 90,
              "bottom": [aw, ah] (pad to aspect, feet on the bottom edge),
              "canvas": [w, h] (shared canvas in source px, feet on the bottom edge),
              "tol"/"bgMax"/"seal" (flood tuning), "isolate": true (drop neighbours poking in),
              "keyFlood": true (chroma: only border-connected key colour is background),
              "replaces": [asset paths this sprite substitutes at runtime]}],
   "map": "src/.../painted.json" (optional: write the replaces table there)}

methods
  flood   dark design-sheet background: pixels connected to the crop border whose colour is
          close to the sampled background become transparent; edges are feathered by 1 px.
  chroma  green (default) or "key": "magenta" screen: alpha from key-colour dominance, spill
          removed from edge pixels.
  alpha   sheet already has alpha but a noisy matte: keep the solid subject and its
          detached parts, drop coloured speckle ("core", "minPart", "feather").
  none    plain crop (scenes, icons).

Deterministic: the same sources and crops.json always give the same files. --check fails if
any output is missing or differs from what the sources produce.
"""
import hashlib, io, json, os, sys
from collections import deque

import numpy as np
from PIL import Image, ImageFilter


def flood_alpha(rgb, tol, bg_max, seal=0):
    h, w, _ = rgb.shape
    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    bg = np.median(border, axis=0)
    dist = np.sqrt(((rgb.astype(np.int32) - bg) ** 2).sum(axis=2))
    raw = (dist < tol) & (rgb.max(axis=2) < bg_max)
    cand = raw
    if seal:
        # Dark line art (darker than the background) and anything off-colour form a barrier;
        # widening it closes the 1-2 px gaps through which dark clothing/shadows would leak.
        lum = rgb.mean(axis=2)
        barrier = (~raw) | (lum < bg.mean() - 18)
        barrier = np.asarray(Image.fromarray((barrier * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(seal))) > 0
        cand = raw & ~barrier
    seen = np.zeros((h, w), bool)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if cand[y, x] and not seen[y, x]:
                seen[y, x] = True; q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if cand[y, x] and not seen[y, x]:
                seen[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
            if 0 <= ny < h and 0 <= nx < w and cand[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True; q.append((ny, nx))
    if seal:
        # Give back the background ring the widened barrier kept: grow the cleared area into
        # background-coloured pixels only.
        for _ in range(seal):
            grown = np.asarray(Image.fromarray((seen * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3))) > 0
            seen = seen | (grown & raw)
    alpha = Image.fromarray(np.where(seen, 0, 255).astype(np.uint8))
    return alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))


def chroma_alpha(rgb, key='green'):
    f = rgb.astype(np.float32)
    r, g, b = f[..., 0], f[..., 1], f[..., 2]
    out = f.copy()
    if key == 'magenta':
        # Magenta screen: alpha from the distance to the screen colour sampled on the crop
        # border, so purple subjects (far from bright magenta) stay opaque.
        border = np.concatenate([f[0], f[-1], f[:, 0], f[:, -1]])
        key_rgb = np.median(border[(border[:, 0] > 150) & (border[:, 2] > 150)], axis=0) if ((border[:, 0] > 150) & (border[:, 2] > 150)).any() else np.array([255, 0, 255])
        dist = np.sqrt(((f - key_rgb) ** 2).sum(axis=2))
        a = np.clip((dist - 70) * (255 / 90), 0, 255)
        spill = np.minimum(r, b) - g
        # Despill: pull red/blue toward green+neutral where magenta dominates the edge.
        cap = g + np.clip(spill, 0, None) * 0.2
        out[..., 0] = np.where(spill > 0, np.minimum(r, np.maximum(cap, r - spill * 0.8)), r)
        out[..., 2] = np.where(spill > 0, np.minimum(b, np.maximum(cap, b - spill * 0.8)), b)
    else:
        spill = g - np.maximum(r, b)
        # Fully green -> 0, neutral -> 255, with a soft ramp in between.
        a = np.clip(255 - (spill - 30) * (255 / 70), 0, 255)
        # Despill: pull green down to the other channels wherever it dominates.
        out[..., 1] = np.where(spill > 0, np.maximum(r, b) + spill * 0.15, g)
    alpha = Image.fromarray(a.astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))
    return out.clip(0, 255).astype(np.uint8), alpha


def border_connected(alpha):
    a = np.asarray(alpha)
    bg = a < 128
    h, w = bg.shape
    seen = np.zeros((h, w), bool); q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if bg[y, x] and not seen[y, x]: seen[y, x] = True; q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if bg[y, x] and not seen[y, x]: seen[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
            if 0 <= ny < h and 0 <= nx < w and bg[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True; q.append((ny, nx))
    # Keep the soft ramp near the outside; interior keyed pixels become opaque again.
    near = np.asarray(Image.fromarray((seen * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))) > 0
    return Image.fromarray(np.where(near, a, 255).astype(np.uint8))


def clean_alpha(rgba, core_thr, min_part, feather):
    """Sheets exported with alpha but a noisy matte: keep the solid subject (connected
    alpha >= core_thr), plus detached parts at least min_part of the largest that do not touch
    the crop border, then a feather band of the original alpha around them. Coloured
    low-alpha speckle elsewhere is dropped."""
    a = np.asarray(rgba.getchannel('A'))
    core = a >= core_thr
    h, w = core.shape
    lab = np.zeros((h, w), np.int32); sizes = [0]; edge = [False]; n = 0
    for sy in range(h):
        for sx in range(w):
            if core[sy, sx] and not lab[sy, sx]:
                n += 1; lab[sy, sx] = n; q = deque([(sy, sx)]); c = 0; e = False
                while q:
                    y, x = q.popleft(); c += 1
                    if y in (0, h - 1) or x in (0, w - 1): e = True
                    for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                        if 0 <= ny < h and 0 <= nx < w and core[ny, nx] and not lab[ny, nx]:
                            lab[ny, nx] = n; q.append((ny, nx))
                sizes.append(c); edge.append(e)
    if not n: return rgba
    big = int(np.argmax(sizes))
    keep = [i for i in range(1, n + 1) if i == big or (not edge[i] and sizes[i] >= sizes[big] * min_part)]
    mask = Image.fromarray((np.isin(lab, keep) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(feather * 2 + 1))
    out = np.where((np.asarray(mask) > 0) & (a >= 20), a, 0).astype(np.uint8)
    img = rgba.copy(); img.putalpha(Image.fromarray(out)); return img


def drop_edge_fragments(img):
    """Clear opaque islands that touch the crop border, except the largest one (the subject).
    Neighbouring sprites poking into a crop are removed; detached parts fully inside the crop
    (a floating orb, a spark) stay."""
    a = np.asarray(img.getchannel('A')) > 40
    h, w = a.shape
    lab = np.zeros((h, w), np.int32); sizes = [0]; edge = [False]; n = 0
    for sy in range(h):
        for sx in range(w):
            if a[sy, sx] and not lab[sy, sx]:
                n += 1; lab[sy, sx] = n; q = deque([(sy, sx)]); c = 0; e = False
                while q:
                    y, x = q.popleft(); c += 1
                    if y in (0, h - 1) or x in (0, w - 1): e = True
                    for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                        if 0 <= ny < h and 0 <= nx < w and a[ny, nx] and not lab[ny, nx]:
                            lab[ny, nx] = n; q.append((ny, nx))
                sizes.append(c); edge.append(e)
    if n < 2: return img
    biggest = int(np.argmax(sizes))
    drop = [i for i in range(1, n + 1) if edge[i] and i != biggest]
    if not drop: return img
    # Grow the dropped islands by 2 px so their soft fringe goes too.
    m = Image.fromarray((np.isin(lab, drop) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))
    alpha = np.asarray(img.getchannel('A')).copy(); alpha[np.asarray(m) > 0] = 0
    img = img.copy(); img.putalpha(Image.fromarray(alpha)); return img


def process(item, base):
    method = item.get('method', 'none')
    src = Image.open(os.path.join(base, item['source'])).convert('RGBA' if method == 'alpha' else 'RGB')
    x, y, w, h = item['box']
    crop = src.crop((x, y, x + w, y + h))
    rgb = np.asarray(crop)
    if method == 'alpha':
        img = clean_alpha(crop, item.get('core', 128), item.get('minPart', 0.15), item.get('feather', 2))
    elif method == 'flood':
        img = Image.fromarray(rgb).convert('RGBA')
        img.putalpha(flood_alpha(rgb, item.get('tol', 34), item.get('bgMax', 90), item.get('seal', 0)))
    elif method == 'chroma':
        rgb2, alpha = chroma_alpha(rgb, item.get('key', 'green'))
        if item.get('keyFlood'):
            # Only key-coloured pixels connected to the crop border are background, so purple or
            # green parts inside the subject survive.
            alpha = border_connected(alpha)
        img = Image.fromarray(rgb2).convert('RGBA'); img.putalpha(alpha)
    else:
        img = crop.convert('RGBA') if item.get('alpha') else crop
    if method != 'none':
        if item.get('isolate'): img = drop_edge_fragments(img)
        bbox = img.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
        if bbox: img = img.crop(bbox)
        if item.get('square'):
            side = max(img.size); canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
            canvas.paste(img, ((side - img.width) // 2, (side - img.height) // 2)); img = canvas
        elif item.get('canvas'):
            # Shared canvas in source pixels keeps relative sizes across a set (a pawn stays
            # shorter than the king); bottom-centred so every figure stands on the same line.
            cw, ch = item['canvas']
            if img.width > cw or img.height > ch:
                r = min(cw / img.width, ch / img.height); img = img.resize((round(img.width * r), round(img.height * r)), Image.LANCZOS)
            canvas = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
            canvas.paste(img, ((cw - img.width) // 2, ch - img.height)); img = canvas
        elif item.get('bottom'):
            # Pieces/characters stand on their base: pad to a fixed aspect, aligned to the bottom.
            aw, ah = item['bottom']; side_w = max(img.width, round(img.height * aw / ah)); side_h = round(side_w * ah / aw)
            canvas = Image.new('RGBA', (side_w, side_h), (0, 0, 0, 0))
            canvas.paste(img, ((side_w - img.width) // 2, side_h - img.height)); img = canvas
    if 'cover' in item:
        cw, ch = item['cover']; r = max(cw / img.width, ch / img.height)
        img = img.resize((round(img.width * r), round(img.height * r)), Image.LANCZOS)
        left = (img.width - cw) // 2; top = round((img.height - ch) * item.get('coverY', 0.5))
        img = img.crop((left, top, left + cw, top + ch))
    elif 'size' in item:
        s = item['size']
        if isinstance(s, int):
            r = s / max(img.size); img = img.resize((round(img.width * r), round(img.height * r)), Image.LANCZOS)
        else:
            img = img.resize(tuple(s), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, 'WEBP', quality=item.get('quality', 88), method=6, alpha_quality=100)
    return buf.getvalue(), img.size


def main():
    path = sys.argv[1]; check = '--check' in sys.argv
    base = os.path.dirname(path); spec = json.load(open(path))
    bad = []
    for item in spec['items']:
        data, size = process(item, base)
        out = item['out']
        if check:
            if not os.path.exists(out) or open(out, 'rb').read() != data: bad.append(out)
            continue
        os.makedirs(os.path.dirname(out), exist_ok=True)
        open(out, 'wb').write(data)
        print('%-56s %4dx%-4d %6d B' % (out, size[0], size[1], len(data)))
    if 'map' in spec:
        # Runtime substitution table: original asset path -> painted file (served from public/).
        table = {}
        for item in spec['items']:
            for old in item.get('replaces', []): table[old] = item['out'].replace('public', '', 1)
        data = (json.dumps(dict(sorted(table.items())), indent=1) + '\n').encode()
        if check:
            if not os.path.exists(spec['map']) or open(spec['map'], 'rb').read() != data: bad.append(spec['map'])
        else:
            open(spec['map'], 'wb').write(data); print('%-56s %d entries' % (spec['map'], len(table)))
    if check:
        if bad: print('Out of date:', *bad, sep='\n  '); sys.exit(1)
        print(json.dumps({'items': len(spec['items']), 'status': 'up to date'}))


if __name__ == '__main__':
    main()
