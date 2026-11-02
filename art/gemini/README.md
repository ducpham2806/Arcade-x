# Art Gemini

Ảnh gốc do chủ dự án tạo bằng Gemini và gửi vào phiên làm việc ngày 01–02/11/2026 (JPEG, đúng độ phân giải Gemini xuất ra). Mỗi game có:

- `source/`: ảnh gốc, không sửa;
- `crops.json`: khung cắt và cách tách nền cho từng sprite, đầu ra trong `public/games/<game>/art/`.

## Tạo lại

```bash
python3 -I scripts/art/import-gemini.py art/gemini/<game>/crops.json          # ghi lại WebP
python3 -I scripts/art/import-gemini.py art/gemini/<game>/crops.json --check  # so với file đang có
python3 -I scripts/art/raster-launcher-art.py <game> --icon <ảnh vuông> [--banner <ảnh ngang>] [--inset 0.07]
```

Script cần Pillow và numpy. Cách tách nền:
- `flood`: nền tối của bảng thiết kế, loang từ mép khung. `seal` dùng nét viền đen làm hàng rào để quần áo hay bóng tối không bị coi là nền.
- `chroma`: nền xanh lá, hoặc `"key": "magenta"` cho nền hồng tím (độ trong suốt theo khoảng cách tới màu nền). `keyFlood` chỉ coi phần màu nền nối với mép khung là nền, để phần tím/xanh bên trong hình được giữ.
- `isolate`: bỏ mảnh của hình bên cạnh lấn vào khung.

Icon launcher đăng ký trong `src/visuals/rasterIcons.json`, `docs/launcher-art-manifest.json` và `art/launcher/tech-art-sources.json`. Màn chờ khi tải game đăng ký ở `GAME_SPLASH_ART` (`src/visuals/gameArt.tsx`). Test: `node tests/artwork/gemini.mjs` (nằm trong `npm run test:artwork`).

## Dùng ở đâu

| Game | Sprite trong game | Launcher |
|---|---|---|
| Blocker | 6 ngọc màu, ngọc sao (ô đặc biệt), ô băng, 3 booster (búa, xáo, hoàn tác), hình chính ở menu | icon, màn chờ khi tải (banner giữ bản vẽ bằng mã vì tranh có chữ "LOADING…") |
| Mummy Escape | nhà thám hiểm, xác ướp trắng/đỏ, bọ cạp, chìa vàng/đỏ, bẫy gai, cát lún, quan tài, cửa thoát | icon, banner, màn chờ |
| Wizard's Chess | 12 quân (cùng tỉ lệ chiều cao như tranh gốc) | icon, banner, màn chờ |
| Cờ Tướng | mặt bàn gỗ, khung sơn mài đỏ, đĩa quân viền vàng–đỏ (Đỏ) và xanh đồng–đen (Đen), chữ vẫn vẽ chồng | — |
| Caro | skin mặc định: kiếm chéo (X), khiên (O), bàn đá; skin trong shop giữ nguyên | banner và màn chờ lâu đài |
| Cyber Blade | 14 loại quả và bom vẽ bằng ảnh (nửa quả khi chém là nửa ảnh), nền sân thượng neon | màn chờ |

Chưa dùng: thanh katana của Cyber Blade, bảng VFX của Blocker (nền ô caro giả trong suốt), nhà thám hiểm góc nghiêng/sau lưng, D-pad bọ hung. Block Breaker chờ ảnh đầy đủ: 4 ảnh đã gửi chỉ có 512×286.

## Nguồn

| File | Cỡ | sha256 |
|---|---|---|
| `blocker/source/icon-crystal-frame.jpg` | 1024×1024 | `87bf7b0f4be7309a…` |
| `blocker/source/sheet-gems-boosters-vfx.jpg` | 1024×1024 | `44c32627253a3415…` |
| `blocker/source/splash-crystal-jewel-blast.jpg` | 1376×768 | `3e22ab599f4fc9b8…` |
| `mummy-escape/source/icon-explorer-vs-pharaoh.jpg` | 1024×1024 | `8014abeb09c42e10…` |
| `mummy-escape/source/scene-tomb-chase.jpg` | 1376×768 | `fc567be8cfb73fa7…` |
| `mummy-escape/source/sheet-characters-props.jpg` | 1264×848 | `3d22982bc5862dd4…` |
| `chess/source/icon-king-vs-rook.jpg` | 1024×1024 | `865314a29355d8d8…` |
| `chess/source/pieces-black-greenscreen.jpg` | 1264×848 | `f7a451838ffb307d…` |
| `chess/source/pieces-white-greenscreen.jpg` | 1264×848 | `e9eedd85fce66a86…` |
| `chess/source/scene-hall-battle.jpg` | 1376×768 | `30bbb29b286f709e…` |
| `caro-gomoku/source/sheet-shield-swords-stone-castle.png` | 1254×1254 | `64445e4cb2cd1d2d…` |
| `xiangqi/source/sheet-wood-lacquer-tokens.png` | 1254×1254 | `26ef4847493f6b94…` |
| `cyber-slice/source/arena-neon-terrace.png` | 1024×1536 | `8ea0987baecf4be3…` |
| `cyber-slice/source/sheet-fruits-bomb-katana.png` | 1254×1254 | `2458678f8db40d69…` |
