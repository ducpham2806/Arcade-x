# Nâng cấp đồ họa ArcadeX

Ngày: 10/10/2026. Bản nâng cấp trong workspace, chưa phát hành production.

## Launcher

- Phong cách máy arcade: nền xanh đêm, điểm nhấn xanh chanh, nút nổi và khung console.
- 18 bìa vector theo chủ đề từng game. Tải khi gần vùng nhìn thấy, không dùng CDN hình ảnh.
- Game nổi bật có minh họa lớn, nút chơi rõ ràng, kỷ lục cá nhân và điều hướng bằng nút, vuốt hoặc bàn phím.
- Thẻ game giữ thao tác chơi, luyện AI, yêu thích và xem thể lệ; bỏ số người chơi giả lập trên thẻ.
- Thanh tài khoản gọn hơn, header desktop tránh chồng nội dung, bộ lọc có trạng thái cho công cụ hỗ trợ tiếp cận.
- Cửa sổ chi tiết, kho đồ và cài đặt có khung ổn định, rộng trên desktop và toàn màn hình mobile. Thanh điều hướng dưới không đè lên cửa sổ đang mở.

## Bên trong 18 game

Tất cả game dùng khung chơi theo màu riêng, hình game trong header, nền trang trí không bắt chuột, nút tạm dừng dễ nhận biết và trạng thái focus rõ.

| Game | Nâng cấp riêng |
|---|---|
| Word Cross | Bìa ghép chữ, minh họa bản đồ cấp độ, bàn chữ tím đậm có chiều sâu; mở rộng vùng chơi và tăng tương phản chữ. |
| Car Escape | Bìa xe đô thị, minh họa bản đồ, khung bãi xe với bề mặt và viền nổi. |
| Dungeon Titan | Quái vật vector theo loại, nền kiến trúc hầm ngục và ánh sáng sân đấu. |
| Mummy Escape | Xác ướp/bọ cạp vector, khung bàn sa thạch; ưu tiên bàn chơi trên mobile và thu kích thước để chừa nút điều hướng. |
| Shikaku | Minh họa menu, vùng hình chữ nhật có bề mặt sáng/bóng; bàn giữ đúng hình vuông và không lấn thanh công cụ. |
| Eat Em All | Bìa nguyên tố, khung sân chơi và HUD có viền sáng, đổ khối. |
| Scoodoku | Bìa/menu ma trận cổ đại, khung bàn gỗ và ô số có độ nổi. |
| Fill the Space | Bìa khối gỗ, đế bàn và bóng đổ theo vật liệu. |
| Draw a Shape | Bìa chòm sao, minh họa menu, khung bàn và bề mặt ô có chiều sâu. |
| Blocker | Bìa khối ngọc xanh, đế bàn và viền vật liệu xanh rừng. |
| Chess | Sáu loại quân vector với hai bộ màu, đổ khối rõ; bàn cờ có đế, avatar dự phòng khi không tải được ảnh. |
| Xiangqi | Bìa quân cờ, vân gỗ, bóng và độ nổi của quân cờ. |
| Caro Gomoku | Bìa X/O, khung bàn đấu và ánh sáng ký hiệu. |
| Neon Runner | Thành phố nhiều lớp, cửa sổ sáng, mặt trời và HUD mới. |
| Cosmic Defense | Cảnh ngân hà, hành tinh có vành đai, bụi sao và HUD mới. |
| Cyber Slice | Nền đấu trường kiếm sáng với hoa văn, ánh sáng và các lớp cảnh. |
| Hex Match | Bìa tinh thể/kẹo, khung bàn và bóng đổ làm nổi các khối lục giác. |
| 2048 | Bìa kho báu, bảng màu ô số sáng, viền và bề mặt khối nổi. |

Chat trong game được chuyển vào menu tạm dừng để không che nút thao tác. Các chế độ, luật chơi và dữ liệu đã lưu được giữ qua các kiểm tra hồi quy.

## Hiệu năng và khả năng tiếp cận

- Minh họa dùng SVG trong mã ứng dụng; không thêm thư viện đồ họa hoặc gói ảnh bên ngoài.
- Cảnh canvas tĩnh được vẽ đệm theo kích thước, mỗi khung hình chỉ ghép ảnh nền. Không dùng bộ số ngẫu nhiên của gameplay để tạo cảnh.
- Tôn trọng `prefers-reduced-motion`; carousel dừng tự chuyển khi người dùng đưa chuột/focus vào hoặc bật giảm chuyển động.
- Bìa, yêu thích, tìm kiếm và ô Cờ Vua có tên truy cập; thêm focus và trạng thái nút rõ ràng.

## Xác minh

| Kiểm tra | Kết quả |
|---|---|
| QC Playwright đầy đủ | **119/119 đạt**, 0 thất bại, 0 bỏ qua, 0 flaky; khoảng 10 phút. |
| Phạm vi lượt đầy đủ | 18 game × 2 kích thước mở/tạm dừng; 17 cửa sổ × 2 kích thước; tài khoản, gameplay và các ca hồi quy. Không chơi hết mọi màn/độ khó. |
| Kiểm tra đồ họa mới | 7/7 đạt: tìm kiếm/yêu thích/chơi/chat ở hai kích thước; carousel giảm chuyển động; bố cục Shikaku và Mummy desktop/mobile. Nằm trong 119 ca. |
| Chỉnh sửa cuối MobileNav | Điều kiện hiển thị tương đương, sửa lỗi TypeScript; chạy lại 2/2 ca launcher desktop/mobile đạt sau chỉnh sửa. |
| `npm run lint` | Đạt (TypeScript `tsc --noEmit`). |
| `npm run build` | Đạt; tạo bundle production và Service Worker. |
| PWA trên build cuối | Service Worker điều khiển trang, tải lại offline và chơi 2048 có điểm; không có lỗi JavaScript bắt được. |
| `git diff --check` | Đạt. |

Ảnh bàn Mummy được chụp lại sau sửa kích thước: bàn và các nút điều hướng đều nằm trong màn hình ở hai kích thước kiểm tra.

Đã xem ảnh launcher, các bàn chơi đại diện và ma trận mở/tạm dừng 18 game trên desktop/mobile. Lượt kiểm tra đầu dừng chủ động sau 43 ca đạt để sửa các vấn đề bố cục phát hiện qua ảnh; kết quả đó được lưu riêng, không dùng để tuyên bố lượt cuối đạt.

## Giới hạn

Kiểm tra trên Chromium headless ở kích thước desktop 1440×900 và mobile 390×844. Chưa đo FPS/pin trên thiết bị yếu hay kiểm tra Safari/iPhone thật. Build vẫn báo bundle lớn từ cấu trúc hiện có. Kiểm thử tài khoản sử dụng API Supabase mô phỏng; lần nâng cấp hình ảnh không xác minh lại dịch vụ Supabase thật.

## Chạy lại

```bash
npm run dev
npm run lint
npm run build
npm run test:qc -- --workers=2
```

Mã phong cách và minh họa ở `src/visuals/`; kiểm tra tương tác/bố cục mới ở `tests/qc/graphics.spec.ts`. Ảnh, kết quả JSON và HTML nằm trong `/workspace/arcadex-graphics/`.
