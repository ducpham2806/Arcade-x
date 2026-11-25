"""Draw the Citadel masters and normalize them through Agent Sprite Forge."""
import argparse
import json
import random
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'public/games/chess/citadel'
CELL = 72
PIECES = 'kqrbnp'


def piece(kind, gold_side):
    image = Image.new('RGBA', (CELL, CELL))
    draw = ImageDraw.Draw(image)
    if gold_side:
        ink, shadow, stone, light, gild, shine = (
            '#31231e', '#816044', '#d1ac75', '#f9e6b7', '#9a6c34', '#fff2d1')
    else:
        ink, shadow, stone, light, gild, shine = (
            '#1a1427', '#382c49', '#665981', '#a59bb7', '#8b6ca8', '#ead5fd')

    def poly(points, color, edge=ink):
        draw.polygon(points, fill=color, outline=edge, width=2)

    def oval(bounds, color, edge=ink):
        draw.ellipse(bounds, fill=color, outline=edge, width=2)

    def line(points, color, width=2):
        draw.line(points, fill=color, width=width, joint='curve')

    draw.ellipse((10, 43, 63, 62), fill='#11101980')
    if gold_side:
        oval((9, 35, 62, 58), shadow)
        oval((12, 34, 59, 53), stone)
        draw.arc((15, 36, 56, 50), 185, 325, fill=light, width=2)
    else:
        poly([(10, 41), (22, 32), (50, 32), (62, 40), (58, 53), (47, 59), (23, 59), (13, 51)], shadow)
        poly([(12, 40), (23, 33), (49, 33), (59, 40), (51, 50), (20, 51)], stone)
        line([(16, 40), (24, 35), (48, 35), (54, 40)], light)

    if kind == 'r':
        poly([(18, 47), (18, 15), (24, 11), (48, 11), (54, 16), (54, 47), (46, 53), (24, 53)], shadow)
        poly([(17, 18), (17, 9), (27, 9), (27, 16), (32, 16), (32, 8), (41, 8),
              (41, 16), (46, 16), (46, 9), (55, 9), (55, 22), (50, 28), (22, 28)], light)
        poly([(23, 28), (49, 28), (49, 45), (44, 49), (27, 49), (23, 45)], stone)
        poly([(31, 49), (31, 38), (35, 33), (41, 38), (41, 49)], ink)
        line([(24, 31), (29, 31)], shine)
        line([(42, 41), (46, 41)], gild)
    elif kind == 'n':
        poly([(23, 49), (17, 43), (21, 30), (30, 19), (27, 11), (29, 7), (39, 13),
              (47, 15), (53, 25), (55, 34), (48, 40), (39, 36), (34, 40), (46, 49)], stone)
        poly([(23, 40), (24, 28), (30, 20), (25, 15), (30, 8), (40, 13), (37, 20), (32, 29), (32, 39)], shadow)
        line([(36, 19), (45, 20), (49, 28)], light, 3)
        line([(41, 25), (44, 25)], ink)
        line([(46, 34), (51, 34)], gild)
        line([(27, 43), (35, 43), (41, 47)], light)
    else:
        cape = [(16, 44), (20, 29), (29, 22), (44, 22), (51, 29), (57, 44), (45, 51), (25, 51)]
        if kind == 'q':
            cape = [(13, 46), (18, 30), (27, 23), (45, 23), (54, 30), (59, 46), (48, 53), (23, 53)]
        poly(cape, shadow)
        poly([(20, 39), (25, 28), (32, 25), (42, 25), (49, 29), (53, 39), (42, 43), (31, 43)], stone)
        line([(22, 34), (28, 29), (31, 31)], light)
        line([(46, 30), (50, 36)], gild)
        line([(21, 45), (28, 47), (35, 46), (41, 47), (51, 45)], light)
        if kind == 'k':
            poly([(24, 28), (22, 15), (27, 13), (31, 18), (42, 18), (46, 13), (51, 15), (48, 28)], gild)
            poly([(31, 23), (31, 15), (27, 15), (27, 10), (32, 10), (32, 5), (40, 5),
                  (40, 10), (45, 10), (45, 15), (40, 15), (40, 23)], light)
            line([(32, 25), (39, 25)], shine, 3)
        elif kind == 'q':
            poly([(24, 28), (19, 13), (25, 14), (30, 19), (35, 8), (42, 19), (48, 13), (54, 12), (48, 28)], light)
            oval((33, 17, 39, 24), shine)
            line([(28, 25), (44, 25)], gild, 3)
        elif kind == 'b':
            poly([(25, 28), (24, 20), (36, 7), (48, 20), (46, 29), (37, 33)], light)
            line([(40, 13), (33, 24)], ink, 3)
            line([(22, 44), (18, 19)], gild, 3)
            oval((15, 13, 21, 20), shine)
        else:
            oval((28, 13, 43, 29), light)
            poly([(40, 28), (52, 31), (50, 41), (44, 47), (38, 38)], gild)
            line([(44, 33), (47, 35), (44, 40)], shine)
    return image


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
        master = Image.new('RGBA', (6 * CELL, 2 * CELL))
        for row in range(2):
            for col, kind in enumerate(PIECES):
                master.paste(piece(kind, row == 0), (col*CELL, row*CELL))
        master.save(temp / 'masters.png')
        frames = temp / 'forge'
        subprocess.run([
            'python3', str(args.forge.resolve() / 'skills/generate2dsprite/scripts/generate2dsprite.py'),
            'process', '--input', str(temp / 'masters.png'), '--target', 'asset', '--mode', 'sheet',
            '--rows', '2', '--cols', '6', '--cell-size', str(CELL), '--background-mode', 'native_alpha',
            '--scale-strategy', 'registered', '--component-mode', 'all', '--output-dir', str(frames),
        ], check=True)
        final = Image.new('RGBA', master.size)
        for i in range(12):
            frame = Image.open(frames / f'sheet-{i+1}.png').convert('RGBA')
            if frame.size != (CELL, CELL) or not frame.getbbox():
                raise ValueError(f'Invalid sprite frame {i+1}')
            final.paste(frame, (i % 6 * CELL, i // 6 * CELL))
        final.save(OUT / 'pieces.webp', lossless=True, method=6)

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
