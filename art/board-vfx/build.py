"""Pack PixelFX 5294518 effects into transparent strips for the board-game renderers."""
import argparse
import json
from pathlib import Path
import subprocess
import tempfile

from PIL import Image


def render(checkout, temp, effect, sample_range, size, **options):
    name = effect.rsplit('/', 1)[1]
    destination = temp / name
    subprocess.run(['node', 'tools/render.mjs', effect, '--sheet', '--no-actor',
                    '--out', str(destination), '--opts', json.dumps(options)], cwd=checkout, check=True)
    destination = destination / effect
    document = json.loads((destination / f'{name}.json').read_text())
    entries = document['frames']
    if isinstance(entries, dict):
        entries = list(entries.values())
    first, last = sample_range
    if last >= len(entries):
        raise ValueError(f'{effect} requires at least {last + 1} frames')
    flash_crop = {
        # Remove unused space to center the slash on the victim instead of the demo actor.
        'sword-slash': (22, 28, 110, 100),
    }.get(name)
    with Image.open(destination / f'{name}.png') as raw:
        atlas = raw.convert('RGBA')
    frames = []
    for index in range(16):
        rect = entries[round(first + index * (last - first) / 15)]['frame']
        x, y, w, h = (rect[k] for k in ('x', 'y', 'w', 'h'))
        frame = atlas.crop((x, y, x + w, y + h))
        if flash_crop:
            frame = frame.crop(flash_crop)
        frames.append(frame.resize(size, Image.Resampling.NEAREST))
    if not any(frame.getbbox() for frame in frames):
        raise ValueError(f'{effect} rendered without an effect')
    return frames


def write_sheet(path, rows):
    width, height = rows[0][0].size
    sheet = Image.new('RGBA', (width * 16, height * len(rows)))
    for row, frames in enumerate(rows):
        for column, frame in enumerate(frames):
            sheet.paste(frame, (column * width, row * height))
    path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(path, lossless=True, method=6)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--pixelfx', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True, help='Games asset root')
    args = parser.parse_args()
    root = args.pixelfx.resolve()
    out = args.out
    amber = ['#662822', '#ad3f25', '#dd7435', '#ff9f4a', '#ffc96d', '#ffe8a8', '#fff7d7']
    cyan = ['#154259', '#226b80', '#3899a2', '#78ced1', '#a2e8dc', '#d9fff3', '#fffaf0']
    with tempfile.TemporaryDirectory() as temporary:
        scratch = Path(temporary)
        red = render(root, scratch, 'melee/sword-slash', (0, 14), (88, 72), palette=amber)
        blue = render(root, scratch, 'melee/sword-slash', (0, 14), (88, 72), palette=cyan)
        write_sheet(out / 'o-an-quan/campaign/spear-sweep.webp', [red, blue])
        promotion = render(root, scratch, 'arcane/mana-burst', (4, 35), (104, 75))
        write_sheet(out / 'chess/citadel/promotion.webp', [promotion])
        cannon = render(root, scratch, 'impacts/blunt-hit', (0, 20), (96, 66))
        write_sheet(out / 'xiangqi/battlefield/cannon-impact.webp', [cannon])


if __name__ == '__main__':
    main()
