# S3 · Badge hosting chồng footer mobile · 13/11/2026

Nguồn public `8320385`, Netlify deploy `6af6f590d7b4bd3516a37885`; Chromium156/Playwright1.64, viewport390×844online. Ghi nhận trong [QA phát hành Snake](../../../docs/qa/SNAKE-PUBLIC-2026-11-13.md); chưa sửa.

## Tái hiện / quan sát

1. Mở `https://arcade-x.netlify.app/` bằng guest, online, viewport390×844.
2. Mở chi tiết Snake: badge “Powered by Netlify” chồng phần phải footer/nút Chơi.
3. Chơi màn1: badge chồng phần dưới Dash/chữ “Giữ nút”, còn tâm nút. Tâm CTA detail/joystick/Dash đã kiểm vẫn tới được. Khi reload offline từ gói đã tải, không thấy badge.

Mong đợi: nhãn và vùng nút điều khiển/CTA đọc được, chạm được mà không bị hosting chrome che. Không crash/pageerror hoặc mất dữ liệu; mức S3, vẫn chơi được. Ảnh local: `/workspace/tooling/snake-release-live-20261113/public-detail-mobile.png`, `public-online-play-mobile.png`; hit test ở `online-controls.json`.

## Bước xử lý / AC

Xác định DOM/cấu hình badge thực trước khi chọn giải pháp. Ưu tiên cấu hình hosting hoặc chừa vùng hợp lý; không tự xóa branding/đổi gói trả phí. Giữ modal/fullscreen theo AGENTS, tránh làm game bị cắt controls. Kiểm320/390portrait và844×390landscape khi online/offline; CTA/joystick/Dash cùng nhãn không bị che, hit-test/ảnh trước sau, exit/offlinepackage và animation checks theo phần thay đổi. Không coi viewport Chromium là nghiệm thu iPhone/Android thật.
