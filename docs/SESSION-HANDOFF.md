# Bàn giao · 12/11/2026 · SN-R1a local fixes

Nhánh `codex/snake-r1a-controls-runtime` từ79cf133/PR27 (CI43 success), checkpoint ad7aa50 trước chuyển task. Chưa merge/deploy; repo gốc work@affc5e8/bun.lock giữ nguyên. User cho làm phần không cần live, nghiệm thu backend/thiết bị thật sau; Graphify/nhật ký/đầu vào gọn tiếp tục bắt buộc. Commerce/ads thật tắt, Snake preview chưa public; không SQL/grant/rewards.

## Đã làm và kiểm

Đọc đúng [SNAKE](plans/SNAKE.md); [report R1a](qa/SNAKE-R1A-2026-11-12.md) khi cần chi tiết. Sửa audio late-resume/stale-rejection/decode retry; clear input + pause pagehide/rotation chung story/lab; bỏ min-height360 gây cắt Dash, landscape dock2cột, safe-area chỉ Snake wrapper, Dash SVG. Không đổi physics/digest/save/private/shared wallet/asset generator.

10/10 UI qua239,1s (6save cũ +4controls/resource/layout/native touch),3guard,6suite Snake local/audio race, typecheck, root/preview build, package/public exclusion, root bundle và5nhóm preview guest/rootSW qua. Đã xem ảnh trước/sau/568×320/cutout.3vòng vào/thoát:1RAF/1RO/9listener/1AudioContext khi chơi, tất cả0 sau exit; không là heap/60FPS proof. CI job Snake gồm test mới; fullCI nhánh mới cần trước merge.

## Còn sau theo yêu cầu user

R1a thiết bị thật WAITING: Android/iPhone Safari, touch win, audio nghe thật/khóa màn/ra nền, FPS/heap theo cảnh thường/boss/effects và soak. Chromium native CDP touch/orientation/inset và pagehide inject chỉ bổ sung; không đủ đóng gate. R1b human10màn/art/audio vẫn sau.

R0b local save đã kiểm/PR27CI43 xanh; live DB/JWT/flags/grant/fault/concurrency/cleanup còn chờ. [Runbook UI live](snake/UI-SAVE-RUNBOOK.md) chỉ existing disposable fixture, không chạy trong lượt này. Network/binding không xin lại vì user để test sau. Snapshot verifier v2 private ngoài git đã đối chiếu ở R0b, không là live proof.

Game JS1.917.496raw/1.346.595gzip,92,19%literal, public gatefalse; R2 tách payload/chính sách/catalog sau các gate, không tự public. Canonical /preview/snake/; alias không slash khác trên Vite preview. Generator legacy còn thiếu, giữ output. ONLINE-V1 và AD03/G1 còn gate riêng.

Graphify642node/1462edge AST-only Snake/preview/wrapper/tests, Controls seed/contextcall/budget700→3node/2edge. CSS/inline test dùng tìm kiếm hẹp, không đọc asset/base64/archive rộng. Evidence ngoài git `/workspace/arcadex-snake-r1a-evidence-2026-11-12/`, log `/tmp/snake-r1a-*`.
