# Battleship: prompt Gemini cho tàu và hiệu ứng (tuỳ chọn)

Bàn chơi hiện vẽ giả 3D bằng code (`src/games/battleship/projection.ts`, `scene.ts`) từ ảnh tàu chụp thẳng từ trên xuống trong `public/games/battleship/`:
- boong tàu là ảnh gốc, trải theo phối cảnh;
- mạn tàu, bóng và bọt sóng được dựng từ hình bóng của chính ảnh đó.

Có ảnh đẹp hơn thì chỉ cần thay file cùng tên trong `art.json`, không phải sửa code.

## Yêu cầu chung cho ảnh tàu
- Nhìn **thẳng từ trên xuống**, mũi tàu hướng **lên trên**, tàu nằm giữa khung, nền trong suốt (PNG có alpha) hoặc nền xanh lá đồng màu để tách.
- Tỉ lệ dài/rộng giống tàu thật, khoảng 1:6 đến 1:8. Code kéo tàu cho đủ số ô (5, 4, 3, 3, 2) và giới hạn bề ngang khoảng 1,2 ô, nên ảnh càng thon thì càng ít bị co.
- Ánh sáng từ phía trên bên trái, có bóng đổ nhẹ trên boong (tháp pháo, ống khói). Không vẽ bóng tàu trên mặt nước: code tự vẽ.
- Mỗi tàu một ảnh, chiều dài khoảng 1000–1500 px.

## Prompt mẫu (đổi tên tàu cho từng file)
> Top-down orthographic view of a fictional WWII-era US-inspired aircraft carrier, bow pointing straight up, centered, isolated on a pure transparent background, highly detailed painted game asset, wooden flight deck with aircraft parked, island superstructure on the right side, soft light from the upper left, small contact shadows on deck details, no water, no drop shadow on the ground, no text, no border, 1:7 length-to-beam ratio.

Các loại cần vẽ, mỗi loại hai phe US và JP:

| File | Loại tàu | Số ô |
|---|---|---|
| `us-carrier`, `jp-carrier` | tàu sân bay | 5 |
| `us-battleship`, `jp-battleship` | thiết giáp hạm | 4 |
| `us-heavy-cruiser`, `jp-heavy-cruiser` | tuần dương hạm | 3 |
| `us-light-cruiser`, `jp-light-cruiser` | tuần dương nhẹ | 3 |
| `us-destroyer`, `jp-destroyer` | khu trục hạm | 2 |

Với phe Nhật, thay "US-inspired" bằng "Japanese-inspired", ví dụ: "pagoda-style tower mast" cho thiết giáp hạm, "flight deck with red circle markings removed" cho tàu sân bay.

## Tuỳ chọn: tàu góc nghiêng 3/4 cho sảnh
Nếu muốn sảnh đẹp hơn nữa, có thể vẽ thêm ảnh tàu sân bay và thiết giáp hạm ở góc 3/4 (camera chéo khoảng 35°, nhìn từ phía trước bên phải). Các ảnh này dùng riêng cho sảnh. Trên bàn chơi vẫn dùng ảnh nhìn từ trên xuống để khớp ô.

> Three-quarter aerial view, 35 degree camera elevation, of a fictional WWII Japanese-inspired battleship sailing on calm dark sea, dramatic lighting at golden hour, painted game key art, ship isolated with white bow wave, no text.

## Cách đưa vào
1. Đặt ảnh gốc vào `art/gemini/battleship/source/`.
2. Cắt và xuất WebP bằng `scripts/art/import-gemini.py` (thêm `art/gemini/battleship/crops.json`), giữ tên file như bảng trên.
3. Chạy `npm run test:battleship-ui` và xem ảnh trong `test-results/battleship-*.png`.
