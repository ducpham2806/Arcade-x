"""Build the Bến Sông Sở Hán sprite and VFX atlases with Agent Sprite Forge."""
import argparse
import json
import random
import subprocess
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from prepare_masters import CELL

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'public/games/xiangqi/battlefield'


def cloth_variant(sprite: Image.Image) -> Image.Image:
    hsv = np.array(sprite.convert('HSV'))
    hue, saturation, value = hsv.transpose(2, 0, 1)
    # The red team's cloth is scarlet. Restrict the dye to that hue to keep skin and brass.
    scarlet = ((hue <= 15) | (hue >= 242)) & (saturation >= 118)
    hue[scarlet] = 146
    saturation[scarlet] = np.minimum(saturation[scarlet], 185)
    value[scarlet] = np.minimum(value[scarlet].astype(np.int16) + 17, 243)
    result = Image.fromarray(hsv, mode='HSV').convert('RGBA')
    result.putalpha(sprite.getchannel('A'))
    return result


def landscape() -> Image.Image:
    width, height = 720, 800
    image = Image.new('RGB', (width, height), '#90774f')
    draw = ImageDraw.Draw(image)
    randomizer = random.Random(14055)
    for y in range(height):
        fade = 1 - abs(y - 400) / 400
        color = (int(107 + 56 * fade), int(91 + 41 * fade), int(62 + 28 * fade))
        draw.line((0, y, width, y), fill=color)
    for _ in range(10000):
        x, y = randomizer.randrange(width), randomizer.randrange(height)
        color = image.getpixel((x, y))
        level = randomizer.randrange(-9, 10)
        draw.point((x, y), tuple(max(0, min(255, c + level)) for c in color))
    for side in (0, width):
        for _ in range(80):
            x = min(max(side + randomizer.randrange(-60, 61), 0), width - 1)
            y = randomizer.randrange(20, height - 20)
            if 350 < y < 450:
                continue
            size = randomizer.randrange(4, 17)
            draw.ellipse((x-size, y-size, x+size, y+size), fill=randomizer.choice(
                ('#5a5435', '#64603b', '#72633e', '#746b46', '#887851')))
    draw.polygon([(0, 362), (96, 365), (228, 358), (350, 362), (515, 354), (720, 359),
                  (720, 449), (556, 444), (420, 451), (278, 447), (141, 439), (0, 445)],
                 fill='#514e37')
    draw.polygon([(0, 371), (96, 374), (228, 366), (350, 371), (515, 362), (720, 369),
                  (720, 439), (556, 434), (420, 443), (278, 439), (141, 430), (0, 437)],
                 fill='#355450')
    for _ in range(175):
        x, y = randomizer.randrange(width), randomizer.randrange(378, 429)
        draw.line((x, y, x + randomizer.randrange(5, 45), y),
                  fill=randomizer.choice(('#456964', '#3d5e58', '#57726a', '#42645f')))
    return image.filter(ImageFilter.GaussianBlur(.36))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--forge', type=Path, required=True, help='Agent Sprite Forge checkout')
    parser.add_argument('--pixelfx', type=Path, required=True, help='PixelFX checkout')
    args = parser.parse_args()
    forge = args.forge.resolve()
    pixelfx = args.pixelfx.resolve()
    OUT.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory() as directory:
        temp = Path(directory)
        raw = Image.new('RGBA', (7 * CELL, 2 * CELL))
        with Image.open(Path(__file__).with_name('unit-master.webp')) as source:
            master = source.convert('RGBA')
        if master.size != (7 * CELL, CELL):
            raise ValueError(f'Unexpected unit master size {master.size}')
        raw.paste(master, (0, 0))
        raw.paste(cloth_variant(master), (0, CELL))
        raw.save(temp / 'master.png')
        frames = temp / 'forge'
        subprocess.run([
            'python3', str(forge / 'skills/generate2dsprite/scripts/generate2dsprite.py'),
            'process', '--input', str(temp / 'master.png'), '--target', 'asset', '--mode', 'sheet',
            '--rows', '2', '--cols', '7', '--cell-size', str(CELL), '--background-mode', 'native_alpha',
            '--scale-strategy', 'registered', '--component-mode', 'all', '--output-dir', str(frames),
        ], check=True)
        atlas = Image.new('RGBA', raw.size)
        for i in range(14):
            frame = Image.open(frames / f'sheet-{i + 1}.png').convert('RGBA')
            assert frame.size == (CELL, CELL) and frame.getbbox(), i
            atlas.paste(frame, (i % 7 * CELL, i // 7 * CELL))
        atlas.save(OUT / 'units-v2.webp', lossless=True, method=6)

    effect = 'impacts/hit-spark'
    subprocess.run(['node', 'tools/render.mjs', effect, '--sheet'], cwd=pixelfx, check=True)
    source = pixelfx / 'records' / effect
    meta = json.loads((source / 'hit-spark.json').read_text())
    pixels = Image.open(source / 'hit-spark.png').convert('RGBA')
    entries = meta['frames']
    if isinstance(entries, dict):
        entries = list(entries.values())
    if len(entries) != 16:
        raise ValueError(f'Expected 16 capture frames, got {len(entries)}')
    film = Image.new('RGBA', (96 * len(entries), 56))
    for index, entry in enumerate(entries):
        rect = entry['frame']
        x, y, w, h = (rect[key] for key in ('x', 'y', 'w', 'h'))
        frame = pixels.crop((x, y, x + w, y + h)).resize((96, 56), Image.Resampling.LANCZOS)
        film.paste(frame, (index * 96, 0))
    film.save(OUT / 'capture.webp', lossless=True, method=6)
    landscape().save(OUT / 'river.webp', quality=86, method=6)


if __name__ == '__main__':
    main()
