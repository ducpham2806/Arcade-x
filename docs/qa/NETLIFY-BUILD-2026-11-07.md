# Netlify Deploy Preview · 07/11/2026

Trạng thái: sửa local qua; chờ build Netlify/CI trên commit mới. Nằm trong PR#17, nhánh codex/tank-clash-release-verification.

- Ảnh chủ dự án: Deploy Preview lỗi06:03:55 ở TypeScript TS2307, tests/tank-clash/launcher-ui.test.ts:31 không tìm thấy server/tank-clash-room/node_modules/ws/index.js. Production main/c705100 vẫn Published; lỗi này thuộc build preview, không chứng minh production ngừng chạy.
- Nguyên nhân: root npm ci không cài package trong hai thư mục server riêng. CI có bước cài chúng trước lint; netlify.toml preview gọi lint ngay nên thiếu ws dùng bởi browser fixture.
- Sửa: package.json có deps:tank-clash cài từ lockfile hai server, ignore-scripts; CI và cả Netlify production/preview gọi cùng lệnh trước lint/build. Giữ toàn bộ TypeScript và assertion, không loại test khỏi typecheck. Preview vẫn build thêm Snake.
- Tái hiện trên bản git archive sạch, root dependencies dùng lại từ máy, không có node_modules ở hai server: npm run lint thất bại đúng TS2307 như ảnh.
- Sau sửa trên cùng bản đó: deps:tank-clash cài mỗi server1package từ cache; lint + build + build:snake-preview đều exit0. Không dùng dữ liệu/phiên người dùng. Hai cảnh báo build đã có về dynamic import và chunk Snake không phải lỗi mới.
- Tiếp: xuất commit mới, xem Netlify Deploy Preview thành công và chạy đủ CI trước merge. Kết quả CI cũ không thay build deploy mới.

Phát hiện liên quan: [Nối Từ](WC-R0-2026-11-07.md). Ca Auth xuyên tab vẫn cần retest host thật sau phát hành; xem [AUTH-XTAB](BUG-AUTH-CROSS-TAB.md).
