"""Prepare a four-by-two chroma-key image as a seven-piece red-team master."""
import argparse
from pathlib import Path

import numpy as np
from PIL import Image

CELL = 96
# Atlas order is General, Advisor, Elephant, Chariot, Cannon, Horse, Soldier.
MAX_HEIGHTS = (88, 83, 85, 85, 75, 86, 81)


def cut_subject(source: Image.Image, index: int) -> Image.Image:
    row, col = divmod(index, 4)
    width, height = source.size
    cell = source.crop((round(col * width / 4), round(row * height / 2),
                        round((col + 1) * width / 4), round((row + 1) * height / 2)))
    rgb = np.array(cell.convert('RGB'))
    red, green, blue = rgb.astype(np.int16).transpose(2, 0, 1)
    other = np.maximum(red, blue)
    alpha = np.where((green >= 105) & (green > other + 26) & (green > other * 1.24), 0, 255)
    # Remove reflected key colour from partially mixed outline pixels.
    rgb[:, :, 1] = np.minimum(green, np.where(green > other + 9, other + 9, 255))
    subject = Image.fromarray(np.dstack((rgb, alpha.astype(np.uint8))))
    bounds = subject.getbbox()
    if not bounds or bounds[2] - bounds[0] < 30 or bounds[3] - bounds[1] < 30:
        raise ValueError(f'No usable silhouette in cell {index + 1}')
    sprite = subject.crop(bounds)
    sprite.thumbnail((88, MAX_HEIGHTS[index]), Image.Resampling.LANCZOS)
    pixels = np.array(sprite)
    coverage = np.where(pixels[:, :, 3] >= 132, 255, 0).astype(np.uint8)
    reduced = sprite.convert('RGB').quantize(colors=72, dither=Image.Dither.NONE).convert('RGBA')
    reduced.putalpha(Image.fromarray(coverage))
    normalized = Image.new('RGBA', (CELL, CELL))
    normalized.paste(reduced, ((CELL - reduced.width) // 2, 91 - reduced.height))
    return normalized


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('sheet', type=Path)
    parser.add_argument('--out', type=Path, default=Path(__file__).with_name('unit-master.webp'))
    args = parser.parse_args()
    with Image.open(args.sheet) as source:
        master = Image.new('RGBA', (7 * CELL, CELL))
        for index in range(7):
            master.paste(cut_subject(source, index), (index * CELL, 0))
        master.save(args.out, lossless=True, method=6)


if __name__ == '__main__':
    main()
