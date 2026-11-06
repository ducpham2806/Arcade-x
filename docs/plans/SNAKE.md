# Snake Legend — hoàn tất preview trước quyết định phát hành

Mốc 06/11/2026. PR #12 đã tích hợp journey, cloud progress/session, boss/props/audio. Một số đoạn SNAKE_PREVIEW mô tả checkpoint cũ: không làm lại cloud hydrate chỉ vì đọc đoạn lịch sử đó. Snake chưa vào catalog/bundle công khai trong phạm vi tích hợp.

**Đầu vào:** [SNAKE_LIVE_SAVE_QA](../SNAKE_LIVE_SAVE_QA.md), mục Remaining gates; [SNAKE_CLOUD_PROGRESS](../SNAKE_CLOUD_PROGRESS.md) khi sửa save; chỉ mở đúng tài liệu journey/boss/props/audio khi chạm phần đó.
**File đích:** `src/games/snake-legend/`, `src/preview/snake/`, entry preview/launcher wrapper và scripts/tests `snake/`; game standalone có thể nằm `public/standalone/`, chỉ sửa qua nguồn/pipeline theo AGENTS.

## SN-R0 · READY chuẩn bị / WAITING account live · end-to-end launcher

- [ ] Đối chiếu vị trí entry hiện hành; đăng nhập → chơi/thắng → save → reload/restore account; lỗi mạng/lost-ack/retry, đổi account/logout và conflict giữa thiết bị.
- [ ] JWT hết hạn theo thời gian thực từ issuer đang deploy; token fixture không thay bằng chứng này. Không bật shared rewards chỉ để test qua.
- [ ] Giữ Gold/Gem riêng, preview isolation và xác nhận không xuất hiện trong catalog production khi chưa có quyết định phát hành.
- **Xong:** báo cáo `.md` ghi nguồn/build/backend/ca test thật, phần fixture và phần live tách rõ; fixture account được dọn theo runbook.

## SN-R1 · WAITING thiết bị/duyệt art · chất lượng chơi

- [ ] Android/iOS/Safari thật: điều khiển, safe-area/dọc/ngang, save khi ẩn/thoát, FPS/memory/audio mute và cleanup.
- [ ] Review authored character animation/art/audio còn thiếu so với mục tiêu đã duyệt; gameplay boss, props, journey và độ khó cần người chơi thật. Không mặc định “có audio” = audio sản xuất đã nghiệm thu.
- Kiểm theo phần đổi: `test:snake-cloud`, `test:snake-session`, `test:snake-journey`, `test:snake-boss`, `test:snake-props`, `test:snake-audio`, `test:snake-preview`, build preview, lint/build/bundle.

## SN-R2 · BACKLOG · phát hành

Sau SN-R0/R1: chốt catalog/quyền/reward/backend verifier, rollout và rollback; cập nhật regression catalog/art/readability nếu thêm game. Có plan không tự cấp quyền bật feature/reward production. Bước tiếp đầu tiên SN-R0, không mở toàn bộ bộ GDD/art.
