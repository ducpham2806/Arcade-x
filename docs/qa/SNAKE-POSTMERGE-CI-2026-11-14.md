# Snake · CI sau merge · 14/11/2026

Nhánh `codex/snake-merge-hold-20261114`, kế thừa checkpoint5b7314b/PR35 và main533c0e7. Giữ Netlify HOLD, commit/PR có `[skip netlify]`. Không đổi runtime, gameplay, save format, backend hoặc cấu hình hosting.

## Lỗi và nguyên nhân

[CI58](https://github.com/ducpham2806/Arcade-x/actions/runs/43565503273) sau merge: snake_ui success; verify FAIL tại `tests/motion/polish.test.ts:41`, desktop/reduced=true. Các kiểm tra motion còn lại24/25 qua. Artifact lỗi `motion-regression-evidence` id14103060780 giữ screenshot/trace.

Bài kiểm đọc envelope `arcadex_save_v1_dungeon-tap` trong một page.evaluate rồi cài Storage interceptor ở page.evaluate kế tiếp. Game vẫn tiến tick và autosave mỗi5giây; autosave thành công giữa hai task là hợp lệ. Test lại so dữ liệu sau quota fault với snapshot trước autosave nên báo lỗi dù write bị chặn đúng. [CI59](https://github.com/ducpham2806/Arcade-x/actions/runs/43566229334), docs5b7314b và cùng runtime, cả verify/snake_ui success; không dùng lượt xanh này xóa CI58FAIL.

## Thay đổi và tái hiện

- Cài interceptor trước, đọc baseline trong cùng browser task đồng bộ. Không có autosave chen giữa hai thao tác; một autosave hoàn tất trước barrier được giữ làm baseline đúng.
- Giữ nguyên fault chỉ áp envelope Dungeon; kiểm write fail thật, banner lỗi, retry pagehide tiếp tục fail, byte save không đổi, finally khôi phục Storage, lưu UI phục hồi. Không skip/retry test, tăng timeout, dừng timer hoặc sửa production để xanh.
- Tái hiện tạm: sau baseline cũ chờ150ms cho engine tiến rồi dispatch pagehide thật trước interceptor. Bản cũ FAIL đúng assertion save bytes; bản sửa PASS cùng kích thích. Mã kích thích tạm không đưa vào commit, không dùng clock giả hay inject dữ liệu thắng.

## Kiểm chứng

- Log đỏ `/tmp/dungeon-barrier-red.log`, trace/ảnh `/workspace/tooling/dungeon-barrier-evidence/red/`.
- Green cùng kích thích `/tmp/dungeon-barrier-forced-green.log`, 1/1 PASS.
- Bản cuối4cấu hình viewport/motion lặp3lần: **PASS12/12**, 2,1phút, không retries. Log `/tmp/dungeon-barrier-repeated.log`, output `/workspace/tooling/dungeon-barrier-evidence/repeated/`. Lint, test:claude, check-docs và diff-check qua; [CI60/head7785d71](https://github.com/ducpham2806/Arcade-x/actions/runs/43568595106) đã success cả verify/snake_ui. PR35 chưa merge.
- Dùng Game Studio game-qa-playtest/performance-optimization và QA Lead. Chưa tối ưu hiệu năng hay tuyên bố FPS thật. Graphify AST đúng module Dungeon29codefile/226node/693edge tại `/workspace/tooling/dungeon-quota-graph/graphify-out/graph.json`; seedDungeonTitanCore/contextcall/budget700/depth1 trả6node/6edge. Seedpersist không match vì callback inline, phải đối chiếu source DungeonTitanCore/FantasyHUD/GameBridge/gameSaves và trace; graph không chứng minh thứ tự browser task.

## Còn lại

Chốt kiểm/CI đúng head mới; Netlify giữ production8320385 cho tới yêu cầu phát hành rõ. R1a Android/iPhone/FPS/heap thật, R1b người mới/M2/art/audio và R0b backend/JWT vẫn WAITING theo [thẻ Snake](../plans/SNAKE.md), [phiếu nghiệm thu](../snake/R01-ACCEPTANCE.md). Lượt này ưu tiên xử lý CI58 mới phát hiện; chưa chạy soak mới và không coi automation là nghiệm thu thiết bị.
