"""Bake transparent PixelFX frames and assemble a Snake atlas with Agent Sprite Forge."""

import argparse
import base64
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[3]
CELL = 64
FRAMES = 8
PINS = {"pixelfx": "5294518", "forge": "25203d0"}
EFFECTS = [
    ("pickup", "pickups/collect-burst", [1, 4, 7, 11, 15, 19, 23, 27], (0, 8, 112, 120),
     {"palette": ["#472712", "#72431c", "#aa6324", "#d8882c", "#f2b547", "#ffd37a", "#fff2ae", "#ffffec"], "seed": 14}),
    ("dash", "impacts/hit-spark", [1, 2, 3, 4, 5, 7, 9, 11], (-8, -8, 96, 96),
     {"palette": ["#0e403b", "#1b7665", "#38a789", "#61cdbc", "#a8e6cf", "#e7ffdf", "#fff6ba"], "aim": 0, "seed": 7}),
    ("gate", "holy/sunburst", [3, 12, 21, 30, 39, 48, 57, 66], (0, 0, 128, 128),
     {"palette": ["#55301b", "#815022", "#a1692b", "#c48c34", "#eeb64a", "#ffd473", "#fff0ae", "#fff9dc"], "rays": 6}),
    ("clear", "nature/healing-bloom", [12, 22, 31, 39, 50, 62, 73, 85], (0, -4, 124, 120),
     {"palette": ["#123929", "#1b5139", "#256949", "#41875a", "#65a967", "#a1c883", "#d0e7ab", "#f3fbcf"],
      "petal": ["#4b2830", "#926053", "#d6926f", "#ffe1ae"], "seed": 8}),
]


def check_pin(root, kind):
    actual = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=root, text=True).strip()
    if not actual.startswith(PINS[kind]):
        raise SystemExit(f"{kind} is at {actual}, expected {PINS[kind]}")


def pack_row(spec, pixelfx, forge, work):
    name, effect, picks, crop, options = spec
    rendered = work / "pixelfx"
    subprocess.run([
        "node", "tools/render.mjs", effect, "--sheet", "--no-actor",
        "--out", str(rendered), "--opts", json.dumps(options),
    ], cwd=pixelfx, check=True)
    directory = rendered / effect
    stem = directory.name
    entries = json.loads((directory / f"{stem}.json").read_text())["frames"]
    if isinstance(entries, dict):
        entries = list(entries.values())

    with Image.open(directory / f"{stem}.png") as source:
        atlas = source.convert("RGBA")
    if len(picks) != FRAMES:
        raise ValueError(f"{name} frame count")
    inputs = []
    for i, pick in enumerate(picks):
        f = entries[pick]["frame"]
        x, y, w, h = [f[key] for key in ("x", "y", "w", "h")]
        image = atlas.crop((x, y, x + w, y + h)).crop(crop)
        # Filter in premultiplied alpha so light fringes retain their color.
        image = image.convert("RGBa").resize((CELL, CELL), Image.Resampling.LANCZOS).convert("RGBA")
        # Small dark strokes retain the two quickest one-shots against light grass.
        if name in ("pickup", "dash"):
            coverage = image.getchannel("A").point(lambda alpha: min(142, max(0, alpha - 82)))
            outline = Image.new("RGBA", image.size, "#865c35" if name == "pickup" else "#246c62")
            outline.putalpha(coverage.filter(ImageFilter.MaxFilter(3)))
            image = Image.alpha_composite(outline, image)
        if not image.getchannel("A").getbbox() or image.getchannel("A").getextrema()[0] != 0:
            raise ValueError(f"{name} frame {i} lacks ink or transparent margin")
        path = work / f"{name}-{i:02}.png"
        image.save(path)
        inputs.append(path)
    package = work / name
    subprocess.run([
        sys.executable, str(forge / "skills/generate2dsprite/scripts/assemble_frames.py"),
        "--input", *map(str, inputs), "--output-dir", str(package), "--strict",
    ], check=True)
    frames = []
    for i, raw in enumerate(inputs):
        with Image.open(package / "frames" / f"frame-{i:02}.png") as assembled, Image.open(raw) as before:
            if assembled.convert("RGBA").tobytes() != before.convert("RGBA").tobytes():
                raise ValueError(f"Forge shifted the registered {name} frame {i}")
            frames.append(assembled.convert("RGBA"))
    return frames


def preview(sheet, path):
    canvas = Image.new("RGB", (CELL * FRAMES + 56, CELL * len(EFFECTS) * 2), "#d8eab4")
    draw = ImageDraw.Draw(canvas)
    for panel, background in enumerate(["#d8eab4", "#325650"]):
        start = panel * CELL * len(EFFECTS)
        draw.rectangle((0, start, canvas.width, start + CELL * len(EFFECTS)), fill=background)
        for row, (name, *_spec) in enumerate(EFFECTS):
            y = start + row * CELL
            draw.text((4, y + CELL // 2), name, fill="#203e2a" if panel == 0 else "#f8f2ca")
            frame_row = sheet.crop((0, row * CELL, sheet.width, (row + 1) * CELL))
            canvas.paste(frame_row, (56, y), frame_row)
    canvas.save(path)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pixelfx", required=True, type=Path)
    parser.add_argument("--forge", required=True, type=Path)
    parser.add_argument("--out", type=Path, default=Path(__file__).resolve().parent)
    parser.add_argument("--module", type=Path, default=ROOT / "src/games/snake-legend/src/meadow-fx-assets.ts")
    parser.add_argument("--review", type=Path)
    args = parser.parse_args()
    for kind in PINS:
        resolved = getattr(args, kind).resolve()
        setattr(args, kind, resolved)
        check_pin(resolved, kind)
    args.out.mkdir(parents=True, exist_ok=True)

    sheet = Image.new("RGBA", (CELL * FRAMES, CELL * len(EFFECTS)))
    with tempfile.TemporaryDirectory(prefix="snake-meadow-fx-") as temp:
        for row, spec in enumerate(EFFECTS):
            for col, frame in enumerate(pack_row(spec, args.pixelfx, args.forge, Path(temp))):
                sheet.paste(frame, (CELL * col, CELL * row))
    path = args.out / "meadow-fx.webp"
    sheet.save(path, lossless=True, method=6)
    data = path.read_bytes()
    with Image.open(path) as encoded:
        if encoded.size != sheet.size or encoded.getchannel("A").tobytes() != sheet.getchannel("A").tobytes():
            raise ValueError("Encoded atlas changed its dimensions or alpha")
    if len(data) > 72 * 1024:
        raise ValueError(f"Effect atlas exceeds 72 KiB: {len(data)} B")
    if args.review:
        preview(sheet, args.review)
    metadata = {"cell": CELL, "frames": FRAMES, "rows": {spec[0]: i for i, spec in enumerate(EFFECTS)}}
    payload = {"image": "data:image/webp;base64," + base64.b64encode(data).decode(), **metadata}
    args.module.write_text("// Generated by art/snake-legend/meadow-fx/build.py from PixelFX frames.\n"
                           + "export const meadowFxAssets = "
                           + json.dumps(payload, separators=(",", ":")) + " as const;\n")
    shutil.copyfile(args.pixelfx / "LICENSE", args.out / "PIXELFX-LICENSE")
    print(json.dumps({"bytes": len(data), "decodedBytes": sheet.width * sheet.height * 4,
                      "sha256": hashlib.sha256(data).hexdigest(), **metadata}))


if __name__ == "__main__":
    main()
