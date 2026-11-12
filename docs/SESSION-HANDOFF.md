# Bàn giao · 12/11/2026 · SN-R0b local UI

Nhánh `codex/snake-r0b-ui-save` từ8690fb9/PR26 (parent CI42 success), stack trên PR25/24/23/22. Chưa merge/deploy; repo gốc work@affc5e8/bun.lock giữ nguyên. User yêu cầu Graphify/nhật ký/đầu vào gọn; commerce/ads thật tắt, Snake chưa public. Không SQL/grant/fixture mới/reward flags.

## Kết quả và nguồn

Đọc đúng [SNAKE](plans/SNAKE.md), [report R0b](qa/SNAKE-R0B-2026-11-12.md) khi cần chi tiết. Sáu ca registered UI local: pointer win→saved→reload/new context/stars/best/unlock, offline pending→retry, lostACK→reload/idempotent, cross-tab account isolation, hai context cạnh tranh/revision, fixture expiry refresh giữ engine. Public-engine6/6 (3,3phút) và reference-v2 cùng6/6 (3,2phút), không skip/flaky. Ba guard live qua. Typecheck,6suite Snake cũ, structure/diff qua. Không sửa product/save/wallet/engine; thêm tests/driver/fixture, CLI live có guard và CI job riêng giữ evidence. Full CI nhánh mới cần theo dõi trước merge.

Bản Edge snake-complete đọc chỉ qua connector ACTIVE/v2/verify_jwt, engine digest khớp. Snapshot verifier giữ ngoài git, dùng optional reference replay với Auth/store local; không là DB/JWT/live proof. [Runbook UI](snake/UI-SAVE-RUNBOOK.md) live opt-in dùng disposable fixture đã cấp, kiểm UID/state rỗng; không traces/credentials output/SQL, cần operator cleanup. Live path chưa chạy.

## Tiếp theo

**R0b còn LIVE WAITING**: môi trường network revision1/host Supabase chưa allow, binding fixture/grant chưa có; câu hỏi fixture đang chờ. Không gửi password/token vào chat. Có binding thì preflight, UI live happy/new-device, rồi fault/concurrency trên DB thật, issuer JWT expiry và cleanup readback. Runner mới chỉ happy/restore + optional expiry, không đóng các ca live còn lại. Không tự tạo actor/chạy runner live cũ chỉ vì user nói tiếp tục.

R1: thiết bị/playtest10màn/art/audio; R2: tách embedded payload sau gate. R0a game1.916.911raw/1.346.381gzip,92,22%literal; public gatefalse. Canonical /preview/snake/, alias không slash khác trên Vite preview. Generator legacy art/audio/backend còn thiếu, giữ output. ONLINE-V1 vẫn chờ mạng/account; AD03 chờ Google/site/CMP/domain/license, G1 chưa gắn.

Graphify0.9.106 AST-only scope Snake/preview/Auth/wrapper/tests/live-script,703node/1608edge; seed/contextcall/budget700/depth1, query3node/2edge hoặc mount6/6. Inline test không symbol dùng rg hẹp; không nạp payload/base64/archive rộng. Evidence ngoài git `/workspace/arcadex-snake-r0b-evidence-2026-11-12/`, log `/tmp/snake-r0b-*`.
