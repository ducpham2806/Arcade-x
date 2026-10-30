# Duel server (Chess · Xiangqi · Caro) — phase 1

**Trạng thái:** mã nguồn và test đã có; **chưa deploy**, các game vẫn dùng đường online cũ.

## Vì sao

Hiện nay Caro (`services/multiplayer.ts`, kiểu `GameRoomData`) và Chess/Xiangqi (`services/matchmakingService.ts` + `useMultiplayerBridge`, kiểu `StandardGameRoom`) để **client tự kiểm tra nước đi và ghi thẳng document phòng**. Một client sửa đổi có thể ghi bất kỳ trạng thái nào, kể cả tự xử thắng. Hai hệ thống còn dùng hai kiểu `lastMove`/`MoveRecord` khác nhau.

Phase 1 dựng phía server theo đúng mẫu Battleship (server làm trọng tài):

| Phần | File |
|---|---|
| Trọng tài thuần (chess.js, luật Xiangqi, luật Caro), hết giờ, đầu hàng, cầu hoà | `src/games/duel/rules.ts` |
| Phòng: tạo/vào bằng mã, CAS theo version, receipt chống gửi lặp, vắng 90 s xử thua, scheduler `tick` | `src/games/duel/server.ts` |
| Client trình duyệt (một thao tác đang gửi, thử lại an toàn, đồng hồ theo server) | `src/games/duel/online-client.ts` |
| Edge Function + store gọi RPC | `supabase/functions/duel-room/` (`npm run prepare:duel-server` chép luật từ `src/`) |
| Schema SQL chỉ `service_role` truy cập được | `supabase/duel/schema.sql` |

Kiểu nước đi thống nhất: `DuelMoveRecord` với toạ độ luôn là chuỗi (chess `"e4"`, xiangqi `"row,col"`, caro `"x,y"`). Hai kiểu cũ được đánh dấu `@deprecated` và sẽ xoá cùng đường online cũ.

## Kiểm thử

`npm run test:duel-server` (nằm trong `test:fast`): luật và phòng với store trong bộ nhớ, schema trên PGlite (quyền, một phòng đang mở cho mỗi người, CAS, presence, chặn xử thua khi heartbeat chen ngang, scheduler, giới hạn request), và Edge Function chạy end to end qua schema thật với Auth/PostgREST giả.

## Cutover (cần chủ dự án)

1. Áp `supabase/duel/schema.sql` lên **project staging** trước, chạy lại `test:duel-server`.
2. `npm run prepare:duel-server`, deploy `supabase/functions/duel-room` (biến môi trường `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` do Supabase cấp).
3. Lên lịch gọi `{"type":"tick"}` bằng service key mỗi 10–15 s (pg_cron/pg_net như `supabase/battleship/scheduler.sql`).
4. Nối `DuelClient` vào UI online của Chess, Xiangqi, Caro sau một feature flag; thử hai tài khoản thật.
5. Khi ổn định: bỏ `MultiplayerService` / `MatchmakingService` cũ, kiểu `GameRoomData`, `StandardGameRoom`, `MoveRecord`.

Chưa có trong phase 1: ghép trận tự động (queue), đấu lại, chat trong phòng, Elo phía server.
