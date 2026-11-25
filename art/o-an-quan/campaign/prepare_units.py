"""Key and register a two-by-two Ô Ăn Quan unit sheet."""
import argparse
from pathlib import Path

import numpy as np
from PIL import Image

CELL = 96


def cut_subject(source, row, col):
    width, height = source.size
    cell = source.crop((col * width // 2, row * height // 2,
                        (col + 1) * width // 2, (row + 1) * height // 2))
    rgb = np.array(cell.convert('RGB'))
    red, green, blue = rgb.astype(np.int16).transpose(2, 0, 1)
    other = np.maximum(red, blue)
    alpha = np.where((green > 100) & (green > other + 28) & (green > 1.3 * other), 0, 255)
    rgb[:, :, 1] = np.minimum(green, np.where(green > other + 9, other + 9, 255))
    subject = Image.fromarray(np.dstack((rgb, alpha.astype(np.uint8))))
    bounds = subject.getbbox()
    if not bounds or bounds[2] - bounds[0] < 40 or bounds[3] - bounds[1] < 40:
        raise ValueError(f'No silhouette in row {row}, column {col}')
    subject = subject.crop(bounds)
    subject.thumbnail((90, 91 if col else 86), Image.Resampling.LANCZOS)
    alpha = subject.getchannel('A').point(lambda value: 255 if value >= 135 else 0)
    palette = subject.convert('RGB').quantize(colors=64, dither=Image.Dither.NONE).convert('RGBA')
    palette.putalpha(alpha)
    return palette


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('sheet', type=Path)
    parser.add_argument('out', type=Path)
    args = parser.parse_args()
    atlas = Image.new('RGBA', (2 * CELL, 2 * CELL))
    with Image.open(args.sheet) as source:
        for row in range(2):
            for col in range(2):
                unit = cut_subject(source, row, col)
                atlas.paste(unit, (col * CELL + (CELL - unit.width) // 2, row * CELL + 93 - unit.height))
    atlas.save(args.out, lossless=True, method=6)


if __name__ == '__main__':
    main()
