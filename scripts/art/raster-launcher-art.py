#!/usr/bin/env python3
"""Register a painted launcher icon (and optionally banner) for a game.

Usage: python3 -I scripts/art/raster-launcher-art.py <game-id> --icon <master> [--banner <master>]
                 [--source-name "<original file name>"] [--inset 0.07]

Python counterpart of scripts/import-tech-art-icons.mjs (which needs sharp): writes the
512x512 icon as /game-art/icons/<id>.techart-<hash>.webp (immutable, used at runtime via
src/visuals/rasterIcons.json) plus the legacy /game-art/icons/<id>.webp, an optional
1280x640 banner as /game-art/banners/<id>.webp, and updates the launcher art manifest,
packageAssets.json, art/launcher/tech-art-sources.json and the review gallery.
"""
import argparse, base64, hashlib, io, json, os

from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument('id'); ap.add_argument('--icon', required=True); ap.add_argument('--banner')
ap.add_argument('--source-name', default='Gemini upload')
ap.add_argument('--inset', type=float, default=0, help='crop this fraction off each side (baked-in rounded corners)')
a = ap.parse_args()


def webp(img, quality):
    buf = io.BytesIO(); img.save(buf, 'WEBP', quality=quality, method=6); return buf.getvalue()


def sha(b): return hashlib.sha256(b).hexdigest()


master = open(a.icon, 'rb').read()
src = Image.open(io.BytesIO(master)).convert('RGB')
if src.width != src.height: raise SystemExit('Icon master must be square')
if a.inset:
    m = round(src.width * a.inset); src = src.crop((m, m, src.width - m, src.height - m))
icon = webp(src.resize((512, 512), Image.LANCZOS), 88)
if len(icon) > 150000: raise SystemExit('Icon exceeds 150 KB')
url = f'/game-art/icons/{a.id}.techart-{sha(icon)[:12]}.webp'
gallery_swaps = []
legacy_icon = f'public/game-art/icons/{a.id}.webp'
if os.path.exists(legacy_icon): gallery_swaps.append((open(legacy_icon, 'rb').read(), icon))
for old in [f for f in os.listdir('public/game-art/icons') if f.startswith(a.id + '.techart-')]:
    os.remove('public/game-art/icons/' + old)
open('public' + url, 'wb').write(icon); open(legacy_icon, 'wb').write(icon)

banner_bytes = None
if a.banner:
    b = Image.open(a.banner).convert('RGB'); r = max(1280 / b.width, 640 / b.height)
    b = b.resize((round(b.width * r), round(b.height * r)), Image.LANCZOS)
    left, top = (b.width - 1280) // 2, (b.height - 640) // 2
    banner = webp(b.crop((left, top, left + 1280, top + 640)), 84)
    if len(banner) > 220000: raise SystemExit('Banner exceeds 220 KB')
    path = f'public/game-art/banners/{a.id}.webp'
    if os.path.exists(path): gallery_swaps.append((open(path, 'rb').read(), banner))
    open(path, 'wb').write(banner); banner_bytes = len(banner)

icons = json.load(open('src/visuals/rasterIcons.json')); icons[a.id] = url
json.dump(icons, open('src/visuals/rasterIcons.json', 'w'), indent=2, ensure_ascii=False); open('src/visuals/rasterIcons.json', 'a').write('\n')

manifest = json.load(open('docs/launcher-art-manifest.json'))
row = next(r for r in manifest if r['id'] == a.id)
row.update(icon=url, iconBytes=len(icon), sha256=sha(icon), sourceType='imagegen',
           sourceFileName=a.source_name, sourceLibraryFileId='gemini-upload', sourceSHA256=sha(master))
if banner_bytes: row['bannerBytes'] = banner_bytes
json.dump(manifest, open('docs/launcher-art-manifest.json', 'w'), indent=2, ensure_ascii=False)
open('docs/launcher-art-manifest.json', 'a').write('\n')

packages = json.load(open('src/games/packageAssets.json'))
packages[a.id] = [url if u.startswith('/game-art/icons/') else u for u in packages[a.id]]
json.dump(packages, open('src/games/packageAssets.json', 'w'), indent=2, ensure_ascii=False); open('src/games/packageAssets.json', 'a').write('\n')

sources = json.load(open('art/launcher/tech-art-sources.json'))
sources[a.id] = {'master': a.icon, 'sourceFileName': a.source_name, 'sourceLibraryFileId': 'gemini-upload', 'sourceSHA256': sha(master)}
if a.inset: sources[a.id]['inset'] = a.inset
json.dump(sources, open('art/launcher/tech-art-sources.json', 'w'), indent=2, ensure_ascii=False); open('art/launcher/tech-art-sources.json', 'a').write('\n')

gallery = 'review/arcadex-art-all-worlds.html'
html = open(gallery).read()
for old, new in gallery_swaps:
    o = 'data:image/webp;base64,' + base64.b64encode(old).decode()
    html = html.replace(o, 'data:image/webp;base64,' + base64.b64encode(new).decode())
open(gallery, 'w').write(html)
print(json.dumps({'id': a.id, 'icon': url, 'iconBytes': len(icon), 'bannerBytes': banner_bytes}))
