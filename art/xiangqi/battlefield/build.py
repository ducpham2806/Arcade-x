"""Render the authored top-down art and normalize it with Agent Sprite Forge."""
import argparse
import json
import random
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'public/games/xiangqi/battlefield'
CELL = 64
PIECES = 'kaerchp'


def unit(kind: str, red: bool) -> Image.Image:
    image = Image.new('RGBA', (CELL, CELL))
    draw = ImageDraw.Draw(image)
    ink = '#271618' if red else '#111b23'
    deep = '#572d22' if red else '#203741'
    mid = '#aa5035' if red else '#476574'
    bright = '#e49658' if red else '#9cb6b3'
    gold = '#fbd18a' if red else '#e9d7aa'
    dark_gold = '#a36837' if red else '#718d85'

    def poly(points, color, outline=ink):
        draw.polygon(points, fill=color, outline=outline, width=2)

    def oval(bounds, color, outline=ink):
        draw.ellipse(bounds, fill=color, outline=outline, width=2)

    def line(points, color, width=2):
        draw.line(points, fill=color, width=width, joint='curve')

    draw.ellipse((10, 36, 55, 57), fill='#11151485')
    base = [(12, 41), (18, 35), (44, 35), (53, 42), (49, 53), (18, 55)]
    if red:
        oval((11, 35, 53, 54), deep)
        draw.arc((13, 36, 50, 51), 200, 335, fill=bright, width=2)
    else:
        poly(base, deep)
        line([(14, 41), (20, 37), (45, 37), (49, 41)], bright)

    if kind in 'kh':
        horse = '#70412a' if red else '#3e4d50'
        poly([(24, 49), (20, 36), (24, 23), (22, 12), (27, 5), (34, 9), (40, 5),
              (39, 14), (43, 20), (39, 27), (44, 39), (41, 46), (33, 43), (30, 51)], horse)
        line([(30, 9), (29, 17), (34, 25), (33, 37), (37, 45)], dark_gold, 3)
        poly([(16, 30), (26, 19), (37, 22), (47, 32), (43, 44), (32, 39), (22, 47)], deep)
        poly([(19, 29), (27, 19), (37, 22), (43, 29), (32, 38), (21, 35)], mid)
        oval((25, 17, 36, 27), bright)
        line([(26, 25), (36, 25)], gold)
        if kind == 'k':
            line([(44, 47), (49, 15)], ink, 6)
            line([(44, 47), (49, 15)], dark_gold, 3)
            poly([(48, 17), (48, 8), (53, 5), (60, 9), (55, 12), (53, 19)], gold)
            poly([(16, 29), (10, 12), (18, 16), (22, 26)], mid)
            line([(12, 15), (18, 23)], bright)
        else:
            line([(13, 45), (45, 13)], ink, 5)
            line([(13, 45), (45, 13)], dark_gold, 2)
            poly([(42, 19), (50, 8), (51, 16)], gold)
    elif kind == 'e':
        oval((16, 14, 47, 50), '#7b7160' if red else '#607076')
        oval((10, 16, 28, 38), deep)
        oval((37, 16, 54, 38), deep)
        oval((14, 18, 25, 33), mid)
        oval((41, 18, 50, 33), mid)
        poly([(23, 31), (41, 31), (45, 44), (38, 49), (24, 48), (19, 41)], mid)
        poly([(25, 21), (26, 9), (34, 8), (38, 14), (36, 24), (30, 28)], bright)
        line([(30, 12), (30, 7), (33, 5)], deep, 3)
        line([(22, 23), (21, 12), (18, 9)], gold, 3)
        line([(40, 23), (42, 12), (45, 9)], gold, 3)
        line([(27, 34), (36, 34)], gold, 2)
    elif kind in 'cr':
        for bounds in [(12, 26, 21, 45), (43, 26, 52, 45)]:
            oval(bounds, ink)
            line([(bounds[0] + 4, 29), (bounds[0] + 4, 41)], bright, 2)
        if kind == 'c':
            poly([(20, 24), (43, 24), (45, 45), (19, 45)], deep)
            poly([(24, 27), (40, 27), (40, 43), (24, 43)], mid)
            poly([(26, 30), (24, 14), (24, 8), (40, 8), (40, 15), (38, 30)], dark_gold)
            oval((24, 6, 40, 17), gold)
            oval((28, 9, 36, 14), ink)
            line([(27, 20), (37, 20)], bright, 3)
            line([(27, 26), (37, 26)], bright, 2)
        else:
            poly([(17, 25), (23, 17), (42, 17), (48, 24), (46, 44), (18, 45)], mid)
            poly([(19, 23), (43, 23), (40, 33), (23, 34)], deep)
            line([(19, 37), (44, 37)], gold)
            line([(32, 34), (33, 11)], ink, 4)
            poly([(33, 9), (51, 14), (32, 21)], bright)
            line([(23, 17), (19, 9), (15, 8)], dark_gold, 3)
            line([(42, 17), (45, 9), (49, 8)], dark_gold, 3)
    else:
        poly([(18, 30), (25, 21), (36, 21), (45, 28), (44, 44), (34, 48), (21, 43)], deep)
        poly([(19, 29), (26, 22), (36, 22), (43, 29), (39, 39), (25, 39)], mid)
        oval((25, 15, 37, 27), bright)
        line([(25, 21), (37, 21)], gold)
        if kind == 'a':
            poly([(34, 12), (48, 17), (47, 30), (41, 38), (33, 29)], dark_gold)
            poly([(36, 16), (44, 19), (44, 28), (41, 33), (37, 28)], bright)
            line([(41, 20), (41, 28)], gold)
            line([(20, 43), (13, 16)], ink, 4)
            line([(20, 43), (13, 16)], dark_gold, 2)
        else:
            line([(19, 46), (43, 12)], ink, 5)
            line([(19, 46), (43, 12)], gold, 2)
            poly([(39, 17), (50, 5), (48, 17)], bright)
            oval((30, 24, 43, 38), dark_gold)
            line([(34, 27), (40, 31), (35, 34)], gold)
    return image


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
        for row, red in enumerate((True, False)):
            for col, kind in enumerate(PIECES):
                raw.paste(unit(kind, red), (col * CELL, row * CELL))
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
        atlas.save(OUT / 'units.webp', lossless=True, method=6)

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
