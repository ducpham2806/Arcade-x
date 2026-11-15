# Snake R01 · runtime evidence · 14/11/2026

Bằng chứng runtime của [lượt hoàn thiện R01](../../../../docs/qa/SNAKE-FINISH-2026-11-14.md). PNG/JSON/trace tại thư mục này là output local ignored; báo cáo Markdown giữ kết luận và lệnh tái lập. CI lưu artifact `snake-player-evidence`, không đưa fixture đăng nhập thật vào artifact.

- Red storage: account mới vào Story lại mở màn2/tải sao của guest.
- Red keyboard: Space bị Controls chặn, nút Bắt đầu không hoạt động.
- Green public player: checkpoint/tùy chỉnh theo owner, thắng/lưu/reload, A/B/guest isolation và keyboard/menu focus.
- Boss renderer:6fixture target/label TƠ, ĂN TÁO, CỘT A/B, ĐIỂM YẾU, CỔNG. Đây là fixture trạng thái hình ảnh, không phải lượt chơi tự nhiên.
- Full campaign:10màn qua pointer/UI/thời gian thật; snapshot/log riêng ghi level, tim/sao, tutorial, tài nguyên và restore/exit. Automation không được ghi là người mới M2 hoặc thiết bị thật.

Bản đầy đủ ngoài git ở `/workspace/tooling/snake-finish-evidence/`; output tái lập bằng `npm run test:snake-player` và `npm run test:snake-campaign-browser`. Chỉ ghi PASS sau khi có kết quả cuối tương ứng trong QA.
