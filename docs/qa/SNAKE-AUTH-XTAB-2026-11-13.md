# Snake / Auth xuyên tab · 13/11/2026

## Lỗi và nguyên nhân

Nguồn `19af480` (main/PR29), nhánh sửa `codex/fix-snake-cross-tab-auth` từ `c5b95a4`/PR30 (CI49 success). [CI48](https://github.com/ducpham2806/Arcade-x/actions/runs/43389651390) chỉ qua9/10ca Snake UI; artifact `snake-ui-fixture-evidence`/14020517095 cho thấy tab game dừng ở màn “Not your player” sau đăng nhập B ở tab khác. Đọc trace và ảnh, không coi CI49 xanh là đã sửa race.

Trong trace, `arcadex_bind_player(p_player_id=B)` của tab cũ mang JWT anonymous trước đó; request bị từ chối400/42501. `AuthService.listen` đã truyền đúng Session B từ broadcast, nhưng RPC hydrate vẫn tự lấy token hiện tại từ SDK. Event có thể tới trước khi tab đó đọc được session mới từ storage. Tăng timeout hoặc reload tab chỉ che thứ tự lỗi.

Môi trường local: Node24.22.1, Linux, Chromium156.0.8078.79, Playwright1.64.0. Mức S2: tab cũ không vào được game sau đổi tài khoản; không quan sát mất dữ liệu.

Tái hiện: đăng nhậpA/mở Snake và giữ state read → tab2logout/loginB → tab1 vẫn đọc session anonymous cũ trong khi nhận broadcastB → về tab1 không reload. Mong đợi hiện B, ví/màn mới; trước sửa hiện lỗi42501.

## Sửa và regression

- `src/services/auth.ts`: cả6request bind/identity/inventory/profile/suspended-session/game-save-list trong `activateSession` dùng token từ cùng Session trên header từng request. Không thay headers client dùng chung. Giữ epoch guard trước áp dữ liệu và xử lý cached restore/server từ chối token.
- `tests/auth/cross-tab.mjs`: real Supabase/PostgREST transport với SDK trả session anonymous cũ; kiểm6request đều dùng token B, collection đúng owner, và request tiếp theo vẫn dùng credential mặc định cũ. Không gọi mạng thật.
- `tests/snake/ui-save.test.ts`: giữ ca cũ, thêm biến thể chỉ làm chậm đọc khóa session ở tab game. Shared writes, tab login và broadcast dùng thực. B phải hiện trên preview trước khi bỏ lag, sau đó vẫn kiểm late snapshot A không mở màn/đổ Gold/Gem vào B và không có commit.
- Giữ timeout/assertion cũ. Tên B có thể là tên mặc định từ email trước khi tab kia hoàn tất setup; assertion mới chấp nhận đúng hai tên của B.

Trước sửa: unit regression thất bại với lỗi42501 trên source cũ; browser variant tái hiện đúng màn “Not your player”. Sau sửa:7/7 Auth unit,2/2ca cross-tab browser qua17,9s. Đã xem ảnh trước/sau, B có0/10màn, ví0 và màn2khóa. Bốn lượt chạy ca cũ trước sửa từng qua38,1s; chỉ rõ đây là lỗi ordering, không phải mọi lần đổi tab đều hỏng.

## Kiểm tra tích hợp

- PASS: `test:auth-session`7/7; storage golden65method/112step + Supabase23method/60step; sync14/14;6suite Snake local; typecheck sau cài room dependencies.
- PASS: production/preview/rollback build; root bundle291,8kB gzip, dưới400kB; catalog300.787B gzip/max chunk468.536B,16code/20media, retry/offline reload/play/audio/save isolation qua.
- PASS: cả11ca Snake UI trong214,7s,3live-runner guard; không skip/flaky/retry. Lượt UI đầu10/11 có navigation/reload trùng lúc build ghi src/games/duel/worker-source.json; trace có kết nối Vite mới. Giữ full-ui-first; ca hai device riêng qua56,2s và cả bộ chạy sau build qua. Không nới assertion.
- PASS: docs budgets/links/Studio297blob, QA links, adapter structure và diff trước commit.

Evidence local ngoài git: `/workspace/tooling/snake-auth-fix-evidence/` (red/green), CI48 gốc tại `/workspace/tooling/snake-ci48-evidence/`; log `/tmp/snake-auth-*` và `/tmp/snake-xtab-*`. CI trên PR mới lưu ảnh/trace theo workflow hiện có. Đây là fixture Chromium; chưa chứng minh backend/JWT issuer/thiết bị thật hoặc Netlify.

## Skill / vai trò / Graphify

Dùng `save-systems`, `game-qa-playtest`, playbook QA Lead/Technical Director; reviewer độc lập đọc code/test và trace, không sửa file. Query graph services AuthService depth1/budget1000 định hướng, sau sửa incremental1file cho483node/1288edge từ46file. Query activateSession depth1/budget1200 trả đủ19node/43edge nhưng vượt budget (~1677token); graph không thay trace/RLS hay test. Scope không phủ React/Snake/test; dùng tìm kiếm hẹp cho các file đó.

## Trạng thái và giới hạn

FullCI50 success trên1909fa6; PR31 đã merge8320385 cùng PR30. Netlify Published đúng8320385,36resource byte-match và guest/offline smoke public qua; [bằng chứng phát hành](SNAKE-PUBLIC-2026-11-13.md). CI51 sau merge đang chạy khi lập checkpoint. Phạm vi sửa là credential khi restore, không tuyên bố sửa mọi race anonymous/storage. Không đổi save format/engine/replay/rewards/commerce/backend/SQL. Registered cross-tab trên public, thiết bị thật và live save/JWT chưa kiểm trong lượt phát hành này.
