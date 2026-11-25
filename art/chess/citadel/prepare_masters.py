"""Turn the chroma-key chess source sheet into two transparent faction rows."""
import argparse
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import label

CELL = 96
# King, Queen, Rook, Bishop, Knight, Pawn. Keep their relative size on the board.
HEIGHTS = (90, 88, 76, 86, 90, 78)


def extract_sprite(sheet, index):
    row, column = divmod(index, 4)
    width, height = sheet.size
    region = sheet.crop((round(column * width / 4), round(row * height / 2),
                         round((column + 1) * width / 4), round((row + 1) * height / 2)))
    rgb = np.array(region.convert('RGB'))
    red, green, blue = rgb.astype(np.int16).transpose(2, 0, 1)
    other = np.maximum(red, blue)
    foreground = ~((green >= 108) & (green > other + 23) & (green > other * 1.22))
    islands, count = label(foreground, structure=np.ones((3, 3), dtype=np.uint8))
    if count == 0:
        raise ValueError(f'Empty source sprite {index + 1}')
    areas = np.bincount(islands.ravel())
    areas[0] = 0
    foreground = islands == areas.argmax()
    rgb[:, :, 1] = np.minimum(green, np.where(green > other + 8, other + 8, 255))
    sprite = Image.fromarray(np.dstack((rgb, (foreground * 255).astype(np.uint8))))
    bounds = sprite.getbbox()
    if not bounds or bounds[2] - bounds[0] < 35 or bounds[3] - bounds[1] < 35:
        raise ValueError(f'Invalid silhouette in source sprite {index + 1}')
    sprite = sprite.crop(bounds)
    sprite.thumbnail((92, HEIGHTS[index]), Image.Resampling.LANCZOS)
    return sprite


def faction_variant(sprite, ivory):
    hsv = np.array(sprite.convert('HSV'))
    hue, saturation, value = hsv.transpose(2, 0, 1)
    cloth = ((hue <= 15) | (hue >= 242)) & (saturation >= 108)
    if ivory:
        hue[cloth] = 32
        saturation[cloth] = np.clip(saturation[cloth].astype(float) * .50, 30, 110)
        value[cloth] = np.minimum(value[cloth].astype(int) * 1.28 + 27, 255)
    else:
        hue[cloth] = 190
        saturation[cloth] = np.minimum(saturation[cloth], 145)
        value[cloth] = np.clip(value[cloth].astype(float) * .78 + 8, 30, 206)
        metal = ~cloth & (saturation < 47) & (value > 75)
        hue[metal] = 182
        saturation[metal] = np.maximum(saturation[metal], 30)
        value[metal] = (value[metal].astype(float) * .77).astype(np.uint8)
    color = Image.frombytes('HSV', sprite.size, hsv.tobytes()).convert('RGB')
    color = color.quantize(colors=76, dither=Image.Dither.NONE).convert('RGBA')
    rgb = np.array(color)
    red, green, blue = rgb[:, :, :3].astype(np.int16).transpose(2, 0, 1)
    chroma_edge = (green > np.maximum(red, blue) + 24) & (green > 135)
    rgb[:, :, 1][chroma_edge] = np.maximum(red, blue)[chroma_edge]
    color = Image.fromarray(rgb)
    color.putalpha(sprite.getchannel('A').point(lambda a: 255 if a >= 134 else 0))
    return color


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('sheet', type=Path)
    parser.add_argument('--out', type=Path, default=Path(__file__).with_name('piece-master.webp'))
    args = parser.parse_args()
    master = Image.new('RGBA', (6 * CELL, 2 * CELL))
    with Image.open(args.sheet) as sheet:
        for i in range(6):
            sprite = extract_sprite(sheet, i)
            for row in range(2):
                frame = faction_variant(sprite, ivory=row == 0)
                master.paste(frame, (i * CELL + (CELL - frame.width) // 2,
                                     row * CELL + 93 - frame.height))
    master.save(args.out, lossless=True, method=6)


if __name__ == '__main__':
    main()
