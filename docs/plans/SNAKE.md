# Snake Legend — hoàn tất preview trước phát hành

Mốc12/11/2026 · baseline từ1f4bfc9/PR25, CI41 parent success. [SN-R0a](../qa/SNAKE-R0A-2026-11-12.md) đã kiểm local; chưa merge/deploy. Nguồn engine tương đương `5a64fef`. PR#12 đã merge journey/cloud progress/session/boss/props/audio. Snake là preview R01, chưa nằm trong catalog public. Đừng làm lại cloud hydrate từ ghi chú lịch sử.

## SN-PLAN · DONE tài liệu · 07/11/2026

Theo yêu cầu chủ dự án: [plan tiếp tục Rắn Săn Mồi](../snake/CONTINUATION-PLAN.md). Chi tiết chỉ mở đúng mục task. Plan chưa cấp quyền đưa Snake ra sảnh hoặc bật reward/backend production.

| Task | Trạng thái / phụ thuộc | Kết quả cần đạt |
|---|---|---|
| SN-R0a | DONE baseline local12/11 | 7suite +5nhóm browser guest/route/SW, profile và art master; backend flags/live chưa kiểm lại, để R0b |
| SN-R0b | WAITING mạng/account/live grant | UI đăng nhập→thắng→save→reload, lỗi mạng/lost-ack, account isolation, JWT hết hạn thật |
| SN-R1a | BACKLOG sau R0a; cần thiết bị | Android/iOS/Safari, input/safe area/background, FPS/memory/audio cleanup |
| SN-R1b | BACKLOG sau R0b; cần người chơi | Đủ10màn R01,Nhện Mẹ/props,art/animation/audio và human playtest |
| SN-R2a | BACKLOG sau R0/R1 | Bundle/lazy assets, chính sách account/save/reward, candidate catalog/rollback |
| SN-R2b | BACKLOG sau quyết định phát hành | CI/merge/deploy và pilot production thật |

## Bằng chứng đã có và giới hạn

[Live-save QA](../SNAKE_LIVE_SAVE_QA.md) đã kiểm Auth/engine/replay/service thật: thắng/lưu, retry sau lost-ack không nhận lặp, restore mới, đọc offline/retry, refresh và signout. Wrapper React đã nối Auth owner/save session; timeout30giây có hủy. Gold/Gem riêng, adapter chưa phát thưởng launcher. Có sẵn icon/banner/master/manifest, chưa cần vẽ lại.

Runner live cũ không chạy renderer/full launcher DOM. Baseline12/11 có DOM landing/Auth guest; chưa có UI chơi/lưu registered. JWT expiry thật, điện thoại thật, production art/audio/animation và M2human playtest chưa đạt. Các game public CI xanh không chứng minh toàn bộ suite Snake đã chạy. Production build không tự gồm route preview.

Kiểm local07/11: build preview +7suite Snake local qua, chunk game1,92MB raw/~1,35MB gzip. [Bằng chứng](../qa/SNAKE-PLAN-BASELINE-2026-11-07.md). Cần tối ưu trước public, Mốc12/11 bổ sung route canonical/guest Auth/SW và graph tải đầu:entry824.401byte, engine1.916.911byte,92,22% payload nhúng; chưa đạt public budget. Flags frontend đã đối chiếu, backend chưa readback.

**File đích:** `src/games/snake-legend/` (wrapper,src,integration), `src/preview/snake/`, `vite.snake-preview.config.ts`, scripts/tests Snake, art nguồn. Output sinh chỉ sửa qua pipeline.

**Kiểm:** `test:snake-cloud`, `test:snake-session`, `test:snake-journey`, `test:snake-boss`, `test:snake-props`, `test:snake-audio`, `test:snake-preview`, `build:snake-preview`; lint/build/bundle theo phần thay đổi, full CI trước merge. `test:snake-live -- --live` tương tác đúng runbook, fixture được cấp và dọn, không bật shared rewards để qua test.

**Tiếp theo:** sau ưu tiên online Nối Từ, tiếp SN-R0b khi có mạng/account fixture; giữ baseline mới và không suy live từ guest runner. Chứng minh chơi→lưu→reload qua UI thật trước; chưa thêm map/boss/shop. Báo cáo phải phân biệt code/merge/deploy/nghiệm thu và ca chưa có thiết bị/người chơi.
