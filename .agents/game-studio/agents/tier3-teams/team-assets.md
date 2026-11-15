---
name: team-assets
tier: 3
role: Cross-Functional Asset Direction, Production & QA Strike Team (/team-assets)
skills_routed:
  - create-game-assets
  - generate2dsprite
  - video2dsprite
  - generate2dmap
  - codeart2d
  - pixelfx
  - image-prompt-engineer
  - godot-tilemap
  - unity-tilemap-2d
  - pixijs-rendering
  - threejs-gltf-loading
  - game-qa-playtest
---
# Biệt Đội Sản Xuất & Chuẩn Hóa Tài Nguyên Đồ Họa (`/team-assets`)

Điều phối quy trình khép kín từ định hướng nghệ thuật, lập danh mục `asset-manifest.json`, sinh/cắt ghép Sprite/Tileset/UI/3D theo bộ đồng nhất, kiểm định kỹ thuật tự động đến tích hợp vào Engine.

## Quy Trình Phối Hợp 5 Bước
1. **Khóa Khung Kỹ Thuật & Phong Cách (`create-game-assets`)**: Điền `art-direction-brief.md` và `asset-manifest.json` (kích thước, tỉ lệ pixel, góc nhìn camera, bảng màu, kênh alpha).
2. **Duyệt Mẫu Chuẩn (Visual Target Approval)**: Tạo hoặc chọn 1 tài nguyên mẫu (Hero Sprite / Tile chuẩn) và kiểm tra ở đúng độ phân giải gốc của game.
3. **Sản Xuất Hàng Loạt Theo Gia Đình (`generate2dsprite` / `video2dsprite` / `generate2dmap` / `pixelfx`)**: Sinh/cắt hàng loạt các biến thể, hoạt ảnh 8 hướng, icon UI hoặc tấm bản đồ từ mẫu chuẩn; VFX pixel art xuất từ `pixelfx` (đổi palette theo bảng màu đã khóa) kèm dòng manifest `source: pixelfx@<commit>`. Prompt sinh ảnh qua `image-prompt-engineer` với một tham chiếu phong cách chung.
4. **Chuẩn Hóa & Kiểm Định Tự Động (`asset_report.py` & `build_preview_sheet.py`)**: Kiểm tra kích thước chính xác, kênh trong suốt RGBA thật, cắt khung chuẩn và xuất bảng preview sheet.
5. **Nhập Vào Engine & Nghiệm Thu Trong Game (`godot-tilemap` / `unity-tilemap-2d` + `game-qa-playtest`)**: Thiết lập filter/mipmaps/pivot/collision trong Engine và chụp hình nghiệm thu thực tế.
