"""Build the Citadel sprite and VFX atlases with Agent Sprite Forge."""
import argparse
import json
import random
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'public/games/chess/citadel'
CELL = 96


def floor_texture():
    size = 640
    result = Image.new('RGB', (size, size))
    draw = ImageDraw.Draw(result)
    rng = random.Random(222)
    for y in range(8):
        for x in range(8):
            at_x, at_y = x * 80, y * 80
            light = (x + y) % 2 == 0
            top, bottom = ((181, 158, 124), (163, 143, 111)) if light else ((65, 73, 85), (52, 57, 69))
            for line in range(80):
                fill = tuple(round(a + (b-a)*line/80) for a, b in zip(top, bottom))
                draw.line((at_x, at_y+line, at_x+79, at_y+line), fill)
            draw.rectangle((at_x, at_y, at_x+79, at_y+79), outline='#a08b6d' if light else '#282833')
            for _ in range(90):
                px, py = at_x + rng.randrange(3, 76), at_y + rng.randrange(3, 76)
                delta = rng.randrange(-8, 10)
                draw.point((px, py), tuple(c+delta for c in result.getpixel((px, py))))
            for dx, dy in ((4, 4), (75, 4), (4, 75), (75, 75)):
                draw.point((at_x+dx, at_y+dy), '#e0c49d' if light else '#736b83')
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--forge', type=Path, required=True)
    parser.add_argument('--pixelfx', type=Path, required=True)
    args = parser.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as directory:
        temp = Path(directory)
        with Image.open(Path(__file__).with_name('piece-master.webp')) as image:
            master = image.convert('RGBA')
        if master.size != (6 * CELL, 2 * CELL):
            raise ValueError(f'Unexpected master size: {master.size}')
        master.save(temp / 'masters.png')
        frames = temp / 'forge'
        subprocess.run([
            'python3', str(args.forge.resolve() / 'skills/generate2dsprite/scripts/generate2dsprite.py'),
            'process', '--input', str(temp / 'masters.png'), '--target', 'asset', '--mode', 'sheet',
            '--rows', '2', '--cols', '6', '--cell-size', str(CELL), '--background-mode', 'native_alpha',
            '--scale-strategy', 'registered', '--resampler', 'nearest', '--fit-scale', '1', '--component-mode', 'all', '--output-dir', str(frames),
        ], check=True)
        final = Image.new('RGBA', master.size)
        for i in range(12):
            frame = Image.open(frames / f'sheet-{i+1}.png').convert('RGBA')
            if frame.size != (CELL, CELL) or not frame.getbbox():
                raise ValueError(f'Invalid sprite frame {i+1}')
            final.paste(frame, (i % 6 * CELL, i // 6 * CELL))
        final.save(OUT / 'pieces-v2.webp', lossless=True, method=6)

    effect = 'impacts/crit-hit'
    subprocess.run(['node', 'tools/render.mjs', effect, '--sheet'], cwd=args.pixelfx, check=True)
    source = args.pixelfx / 'records' / effect
    entries = json.loads((source / 'crit-hit.json').read_text())['frames']
    if isinstance(entries, dict):
        entries = list(entries.values())
    source_image = Image.open(source / 'crit-hit.png').convert('RGBA')
    film = Image.new('RGBA', (100 * 16, 64))
    for i in range(16):
        box = entries[round(i * (len(entries) - 1) / 15)]['frame']
        x, y, w, h = (box[key] for key in ('x', 'y', 'w', 'h'))
        frame = source_image.crop((x, y, x+w, y+h)).resize((100, 64), Image.Resampling.LANCZOS)
        film.paste(frame, (100*i, 0))
    film.save(OUT / 'shatter.webp', lossless=True, method=6)
    floor_texture().save(OUT / 'floor.webp', quality=84, method=6)


if __name__ == '__main__':
    main()
