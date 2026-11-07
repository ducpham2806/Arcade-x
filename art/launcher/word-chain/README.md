# Nối Từ · launcher artwork · 07/11/2026

## Nguồn và hướng hình ảnh

- Tool: **OpenAI ImageGen built-in**, không CLI/API key. Hai ảnh tạo cho ArcadeX; banner tham chiếu icon vừa tạo, không dùng ảnh bên thứ ba.
- Icon generation: exec-27c324c1-13ac-4c6e-8479-c9ec5039a6c7; banner: exec-eb240d3f-8e0f-45c5-a574-2df315391195.
- Master giữ nguyên PNG tại icon-master.png (1254×1254) và banner-master.png (1774×887). Hash nguồn lưu trong ../tech-art-sources.json; không tham chiếu runtime tới thư mục generated_images ngoài repo.
- Khối chữ ivory/amber, chữ indigo NỐI/TỪ có dấu Việt, mũi tên nối và điểm sáng mint/coral; vật liệu ceramic, bevel tròn, ánh sáng trên trái. Chọn hướng này cho bản phát hành theo phạm vi đã giao.
- Runtime: icon512×512/22.188byte; banner1280×640/29.700byte, RGB/full bleed, WebP. URL có hash, alias cũ giữ tương thích. Desktop hero/detail dùng banner, mobile hero dùng icon để không cắt chữ; lưới game dùng icon.

## Tái tạo bản runtime

Với Node24 và sharp có trong runtime đã cấu hình:

```sh
node scripts/import-tech-art-icons.mjs --only=word-chain
node scripts/build-launcher-art.mjs --only=word-chain
```

Hai script dùng CODEX_PRIMARY_RUNTIME_NODE_MODULES khi sharp không ở node_modules dự án. Không chạy lại ImageGen khi chỉ cần nén/resize. Giữ source hash, kiểm manifest/packageAssets/rasterIcons/rasterBanners đồng bộ; dùng asset_report.py của create-game-assets kiểm512×512 và1280×640.

## Prompt icon · stylized-concept

```text
Use case: stylized-concept
Asset type: finished square launcher icon for the Vietnamese word-chain game Nối Từ in ArcadeX.
Primary request: a polished, tactile 3D board-game icon: two chunky beveled letter tiles, one warm ivory and one golden amber, connected by one clear luminous curved arrow. The ivory tile reads exactly “NỐI”, the amber tile reads exactly “TỪ”, with correct Vietnamese accents and bold dark indigo lettering. Friendly clever word play, instantly legible at a 64px thumbnail.
Scene/backdrop: rich midnight indigo and violet, subtle soft radial glow, sparse mint and warm coral accent dots; full-bleed square background.
Style: premium playful mobile puzzle-game illustration, rounded geometric forms, clean silhouettes, satin ceramic tiles, carefully controlled detail, crisp edges, soft grounded shadows and warm upper-left light. Cohesive with a dark violet word-game interface with golden buttons.
Composition: centered pair of tiles filling about 75 percent of the square, slight opposing tilts, generous safe margin, one tile slightly in front of the other. No scenery, people or extra objects. No outer rounded app frame, no border, no UI buttons, no badge, no watermark. Only the two specified words, no other text. Output square high-resolution production master.
```

## Prompt banner · stylized-concept

Input reference: icon-master.png; transparent_background=false cho cả hai ảnh.

```text
Use case: stylized-concept
Asset type: wide 2:1 launcher banner for the Vietnamese word-chain game Nối Từ, a companion to the supplied square icon.
Primary request: create a NEW wide landscape illustration using the same ivory “NỐI” tile, amber “TỪ” tile, dark indigo lettering, Vietnamese accent accuracy, curved golden connector, satin ceramic material, rounded bevels, light direction and playful premium 3D style as the supplied reference. Preserve the tile design and their recognizable identity. Recompose as a spacious cinematic word-play stage rather than stretching the square icon.
Composition: 2:1 aspect ratio. Place the two large connected tiles on the RIGHT half, fully visible with margins, with a soft oval stage shadow and a few small mint/coral glow dots. The LEFT 45 percent stays quiet, uncluttered deep indigo/violet with a subtle violet light wash, reserved for real HTML title/copy placed later. Keep the motif within a centered safe band so a 1280x640 crop preserves both tiles.
Text: only the existing tile words “NỐI” and “TỪ”, no other words, no title, no subtitle, no buttons, no logo, no watermark, no framing or UI mockup. Dark violet background, warm golden highlight, no new characters or scenery. Crisp, polished production master.
```
