"""Render PixelFX one-shots and pack Forge-verified RGBA frames for Blossom."""

import argparse
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image

CELL = 128
FRAME_COUNT = 16
EFFECTS = {
    "bloom": ("nature/healing-bloom", (8, 96), (0, 20, 124, 144), {}),
    "merge-ring": ("pickups/collect-burst", (1, 35), (0, 8, 112, 120), {
        "palette": ["#402225", "#744129", "#ac6932", "#df993d", "#ffc554", "#ffe083", "#fff3b6", "#ffffff"],
    }),
    "portal": ("spawn/spawn-portal", (3, 85), (0, 0, 208, 208), {}),
}


def pack(name, spec, pixelfx, forge, scratch, output):
    effect, (first, last), crop, options = spec
    source = scratch / name
    subprocess.run([
        "node", "tools/render.mjs", effect, "--sheet", "--no-actor",
        "--out", str(source), "--opts", json.dumps(options),
    ], cwd=pixelfx, check=True)
    source /= effect
    stem = source.name
    entries = json.loads((source / f"{stem}.json").read_text())["frames"]
    if isinstance(entries, dict):
        entries = list(entries.values())
    with Image.open(source / f"{stem}.png") as image:
        atlas = image.convert("RGBA")
    raw = scratch / f"{name}-frames"
    raw.mkdir()
    inputs = []
    for index in range(FRAME_COUNT):
        frame = entries[round(first + index * (last - first) / (FRAME_COUNT - 1))]["frame"]
        x, y, width, height = (frame[key] for key in ("x", "y", "w", "h"))
        pixels = atlas.crop((x, y, x + width, y + height)).crop(crop)
        path = raw / f"{index:02}.png"
        pixels.resize((CELL, CELL), Image.Resampling.NEAREST).save(path)
        inputs.append(path)

    package = scratch / f"{name}-forge"
    subprocess.run([
        sys.executable, str(forge / "skills/generate2dsprite/scripts/assemble_frames.py"),
        "--input", *map(str, inputs), "--output-dir", str(package), "--strict",
    ], check=True)
    sheet = Image.new("RGBA", (CELL * FRAME_COUNT, CELL))
    for index in range(FRAME_COUNT):
        with Image.open(package / "frames" / f"frame-{index:02}.png") as frame:
            sheet.paste(frame, (index * CELL, 0))
    path = output / f"{name}.webp"
    sheet.save(path, lossless=True, method=6)
    with Image.open(path) as webp:
        if webp.size != sheet.size or webp.getchannel("A").tobytes() != sheet.getchannel("A").tobytes():
            raise ValueError(f"{name} failed the atlas dimension or alpha check")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pixelfx", type=Path, required=True)
    parser.add_argument("--forge", type=Path, required=True)
    parser.add_argument("--out", type=Path, default=Path("public/blossom/vfx"))
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="blossom-fx-") as directory:
        for name, spec in EFFECTS.items():
            pack(name, spec, args.pixelfx.resolve(), args.forge.resolve(), Path(directory), args.out)
    shutil.copyfile(args.pixelfx / "LICENSE", args.out / "PIXELFX-LICENSE.txt")


if __name__ == "__main__":
    main()
