# Snake Legend — hoàn tất preview trước phát hành

Mốc 12/11/2026 · SN-R1b từ bad1d56. [SN-R0a](../qa/SNAKE-R0A-2026-11-12.md) và [UI-save R0b local](../qa/SNAKE-R0B-2026-11-12.md) đã kiểm; chưa merge/deploy. Nguồn engine tương đương `5a64fef`. PR#12 đã merge journey/cloud progress/session/boss/props/audio. Snake là preview R01, chưa nằm trong catalog public. Đừng làm lại cloud hydrate từ ghi chú lịch sử.

## SN-PLAN · DONE tài liệu · 07/11/2026

Theo yêu cầu chủ dự án: [plan tiếp tục Rắn Săn Mồi](../snake/CONTINUATION-PLAN.md). Chi tiết chỉ mở đúng mục task. Plan chưa cấp quyền đưa Snake ra sảnh hoặc bật reward/backend production.

| Task | Trạng thái / phụ thuộc | Kết quả cần đạt |
|---|---|---|
| SN-R0a | DONE baseline local12/11 | 7suite +5nhóm browser guest/route/SW, profile và art master; backend flags/live chưa kiểm lại, để R0b |
| SN-R0b | LOCAL UI đã kiểm; LIVE WAITING mạng/fixture/grant | 6ca UI gồm win/save/new-device/offline/lost-ack/isolation/concurrency/fixture expiry; còn backend thật và JWT issuer expiry |
| SN-R1a | LOCAL fixes/coverage12/11; WAITING thiết bị thật | Android/iOS/Safari, input/safe area/background, FPS/memory/audio cleanup |
| SN-R1b | LOCAL 10 màn và renderer đã kiểm; M2 WAITING | Duyệt art, animation, audio và lượt người mới trên thiết bị thật |
| SN-R2a | BACKLOG sau R0/R1 | Bundle/lazy assets, chính sách account/save/reward, candidate catalog/rollback |
| SN-R2b | BACKLOG sau quyết định phát hành | CI/merge/deploy và pilot production thật |

## Bằng chứng đã có và giới hạn

[Live-save QA](../SNAKE_LIVE_SAVE_QA.md) đã kiểm Auth/engine/replay/service thật: thắng/lưu, retry sau lost-ack không nhận lặp, restore mới, đọc offline/retry, refresh và signout. Wrapper React đã nối Auth owner/save session; timeout30giây có hủy. Gold/Gem riêng, adapter chưa phát thưởng launcher. Có sẵn icon/banner/master/manifest, chưa cần vẽ lại.

Runner live cũ không chạy renderer/full launcher DOM. Lượt R0b12/11 bổ sung registered UI với Auth/store local và optional read-only deployed verifier v2, không thay nghiệm thu DB/JWT thật. Có [runner/runbook live UI](../snake/UI-SAVE-RUNBOOK.md) nhưng chưa chạy live. JWT expiry thật, điện thoại thật, production art/audio/animation và M2human playtest chưa đạt. Các game public CI xanh không chứng minh toàn bộ suite Snake đã chạy. Production build không tự gồm route preview.

Kiểm local07/11: build preview +7suite Snake local qua, chunk game1,92MB raw/~1,35MB gzip. [Bằng chứng](../qa/SNAKE-PLAN-BASELINE-2026-11-07.md). Cần tối ưu trước public, Mốc12/11 bổ sung route canonical/guest Auth/SW và graph tải đầu:entry824.401byte, engine1.916.911byte,92,22% payload nhúng; chưa đạt public budget. Flags frontend đã đối chiếu, backend chưa readback.

**File đích:** `src/games/snake-legend/` (wrapper,src,integration), `src/preview/snake/`, `vite.snake-preview.config.ts`, scripts/tests Snake, art nguồn. Output sinh chỉ sửa qua pipeline.

**Kiểm:** `test:snake-cloud`, `test:snake-session`, `test:snake-journey`, `test:snake-boss`, `test:snake-props`, `test:snake-audio`, `test:snake-preview`, `build:snake-preview`; lint/build/bundle theo phần thay đổi, full CI trước merge. `test:snake-live -- --live` tương tác đúng runbook, fixture được cấp và dọn, không bật shared rewards để qua test.

**Tiếp theo:** [SN-R1b local](../qa/SNAKE-R1B-2026-11-12.md) có 10 lượt thắng qua Engine, save 28/30 sao, 16 cảnh renderer và fix CTA 568×320. Còn M2, art/animation/audio, SN-R1a thiết bị thật và SN-R0b live. Chạy phần live theo [runbook](../snake/UI-SAVE-RUNBOOK.md) khi có môi trường thử và fixture hợp lệ. Sau các gate, SN-R2a tách payload/budget và chốt điều kiện phát hành. Giữ Snake ở preview.
