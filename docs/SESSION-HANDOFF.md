# Bàn giao · 13/11/2026 · SN-AUTH-XTAB sửa local

Nhánh `codex/fix-snake-cross-tab-auth` từ PR30/c5b95a4 (CI49 success), theo yêu cầu user làm tiếp. CI48/main19af480 có event đăng nhậpB nhưng RPC bind playerB mang JWT anonymous cũ. `activateSession` nay gắn token cùng Session cho6RPC restore trên header riêng từng request; không sửa client headers chung, engine, save, epoch, rewards hoặc backend. [Báo cáo/trace/giới hạn](qa/SNAKE-AUTH-XTAB-2026-11-13.md), [thẻ Snake](plans/SNAKE.md).

## Đã kiểm

Unit realPostgREST và browser lag storage tái hiện source cũ đỏ→bản sửa xanh; Auth7/7, hai ca cross-tab qua17,9s, giữ ví/màn/late snapshot isolation. Storage golden, sync14/14,6suite Snake local, typecheck, production/preview/rollback build, root bundle291,8kB gzip và catalog/offline package qua. Đã xem ảnh trước/sau. Lượt UI đầy đủ đầu10/11 có navigation khi build ghi nguồn sinh; ca hai device chạy riêng qua56,2s. Lượt cả bộ tách riêng qua11/11 trong214,7s,3guard; không skip/flaky/retry. Docs/structure/diff qua. Không nới timeout/assertion.

Dùng save-systems/game-qa-playtest, playbook QA/Technical Director và reviewer độc lập (không finding). Graphify services sau sửa46file/483node/1288edge; AST local, không API. [Cấu hình hai repo đã ghi nhớ](studio/GRAPHIFY.md); đầu phiên chọn1–3skill/vai trò, graph đúng scope và kiểm độ mới. CLI/cache không tự đi theo phiên khác.

## Bước tiếp và giới hạn

Nhánh sửa được gửi PR dựa trên PR30; chờ đủ CI mới trước merge; chưa merge/deploy. Sửa này ràng buộc credential khi restore, không tuyên bố sửa mọi race anonymous/storage. Sau tích hợp mới xác minh Netlify Published đúngSHA và smoke public. PR29 đã merge main19af480; R01 sảnh lưu theo thiết bị/owner, cloud preview riêng. Thiết bị Android/iPhone/người mới và live save/JWT vẫn chờ. Render Tank giữFree; Nối Từ ON5/ON6 cònQA; commerce tắt. Nhật ký duy nhất WORKLOG, tối đa3mục; chi tiết cũ có archive.
