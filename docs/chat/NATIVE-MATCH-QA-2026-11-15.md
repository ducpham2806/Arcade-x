# Chat trận Tank / Nối Từ / Hải Chiến · 15/11/2026

Nhánh `codex/chat-bubble-wireframe`, tiếp checkpoint local4f96eea/remote05506ec (cùng treee8dcffc). Chủ dự án yêu cầu hoàn thiện cả3game, kiểm staging rồi duyệt trước merge. **Đã code, QA local và deploy backend staging; chưa nghiệm thu hai tài khoản thật, chưa merge/deploy production.** Báo cáo này thay các giới hạn native cũ trong [QA bubble](IMPLEMENTATION-QA-2026-11-15.md).

## Hành vi và nguồn

- Hải Chiến có command chat riêng qua Auth/room/CAS/receipt:500ký tự,1giây/người, lịch sử100tin; server gán sender/name, không nhận giả actor/sender. Transport dùng RoomClient thật, retry giữ actionId khi mất ACK, gửi lỗi giữ nháp. Chat không thay tàu, lượt hay deadline. ID công khai theo lần vào ghế, giữ qua đổi phe; người rời trận không gửi/nhận chat mới. `src/games/battleship/server.ts`, `online-client.ts`, `OnlineGame.tsx`, `src/chat/useBattleshipChat.ts`; mirror Edge sinh bằng script.
- Tank giữ WS room, ACK/retry/dedupe, broadcast từng tin. Sửa timestamp chat sang UTC epoch riêng, cooldown vẫn dùng đồng hồ mô phỏng để không đổi gameplay/RNG. Spectator không gửi và không nhận lịch sử/tin chat riêng qua joined/room/result. `room.ts`, `runtime.ts`, `tests/tank-clash/chat.test.mjs`.
- Nối Từ cho chat nối vào room version mới nhất khi người khác vừa thao tác; lệnh gameplay vẫn giữ check version/turn. Không để chat xóa lastResult nộp từ. Chỉ type/text được phép; server kiểm membership/rate/length/receipt. Không thêm chat đội riêng theo bố cục đã duyệt.
- Lời nổi đo kích thước thật và tìm khoảng trống gần avatar/HUD, tránh board/canvas, đồng hồ và nút. Chấm xanh, thu/phóng, nháp và input dùng cùng host/store. Hải Chiến có avatar ghế phía trên bàn; đồng hồ Tank được đánh dấu bảo vệ. Có regression hình học và kiểm va chạm DOM trên cả3game.

## Bản kiểm và staging thật

[Bản kiểm](http://127.0.0.1:4335/review) chạy trên máy hiện tại, không phải URL hosting công khai. Nối Từ/Hải Chiến gọi HTTPS Edge staging; Tank chạy WS process riêng cùng localhost4335, xác thực Auth staging thật, không đổi service Render đang phục vụ production. Chỉ500ký tự/chat trận; social Sảnh/Game/Inbox trong harness không kết nối production và báo rõ giới hạn khi gửi. Không XP/xu. Auth RAM riêng từng tab, không lưu password/JWT.

`npm run preview:chat-staging` sinh HTML bị ignore; `scripts/chat-staging-server.mjs` chỉ chấp nhận URL/key công khai của staging `khqipuipeawzlkqmdzdg`. Build game thật và cùng component chat, context bridge staging riêng; không import wrapper này vào launcher. Asset map chỉ public file đã chọn, không mở directory/traversal.

Đã thao tác bằng dashboard trên **arcade-x-staging**, ref `khqipuipeawzlkqmdzdg`, không production `whjatkhhupeqfngakmee`:

1. Áp trong transaction nguồn schema Nối Từ và Battleship schema/presence/matchmaking/rematch. SQL Editor trả `battleship_ready=true`, `word_chain_ready=true`. Không clone save/user, không sửa cron/token Vault hiện có.
2. Deploy `word-chain-room` lần4 và `battleship-room` lần2; danh sách dashboard xác nhận2function và mốc cập nhật mới. Legacy JWT verifier Hải Chiến OFF đã Save/reload; handler vẫn Auth.getUser/registered-only và membership. Không đổi secret đặc quyền.
3. Artifact cuối sinh bằng `node scripts/chat-staging-package.mjs`; [hash nguồn/artifact](evidence/2026-11-15/native-artifacts.json). Word Edge SHA256 `7418a563a06d879d1f348538fb82e1fa6b385f36a381a879c8d8ee2a3cfe5913`; Battleship `2c61f9eec96a6fd76831026d2c1aa82a14228090fb63d831067c2a1ba0146a81`. Nội dung được chuyển từ đúng file qua TextEdit vào editor; không tuyên bố byte-match download từ cloud.
4. [12probe HTTPS thật](evidence/2026-11-15/native-negative-probes.json): hai localhost origin, preflight204; thiếu bearer/token giả401 ở cả2function. Nối Từ CORS đúng origin; Hải Chiến giữ wildcard hiện có, vẫn cần JWT hợp lệ. Probe không login/tạo phòng/SQL.

## Kiểm trên nguồn hiện tại

Node24.22.3/macOS, Chromium tự động; không tắt/nới assertion. Không dùng test fixture thay nghiệm thu tài khoản thật.

| Kiểm | Kết quả |
|---|---|
| Typecheck/build/bundle | PASS; fixture và authority server không nằm trong game production bundle |
| `test:social` | PASS store/nháp/unread/owner/room cleanup, thêm khoảng trống speech cạnh HUD |
| `test:chat-ui` | 3/3PASS bản cuối8,2s; sảnh, kéo/thu/phóng, owner,320/390/landscape và launcher/Caro thật |
| `test:chat-native-ui` | 3/3PASS45,5s; hai phiên riêng, Tank WS loopback thật, Word/Battleship handler+PGlite thật; Auth fixture |
| Native UI cụ thể | Mỗi game gửi/nhận hai chiều, unread, lời nổi cạnh đúng người không va board/điều khiển/timer, giữ nháp. Word giữ focus chat qua poll; Battleship phone390 đồng hồ tiếp tục; Tank rời dọn room/unread |
| `test:tank-clash` / `test:tank-clash-server` | PASS70 /18; clock epoch, spectator redaction, ACK/dedupe/membership/rate, origin/Auth/restart và public asset map |
| `test:word-chain` | PASS54checks:12rules/12server/9schema/10Edge/11client; chat đồng thời giữ gameplay/version guard của nộp từ |
| `test:battleship` | PASS toàn bộ; online pipeline16 và squad24, mất ACK không trùng chat, outsider/spoof/rate/length, 4người/đổi phe/ghế rời không rò chat hoặc tàu |

Các lượt đầu sửa bộ dựng test (locator button, Origin header, Deno handler environment), chờ snapshot khi đặt tàu và thu chat sảnh trước duyệt game. Hai lỗi UI thật đã sửa: speech ước lượng80px khiến mất lời cạnh HUD; CSS toolbar harness ẩn cả span bubble trên phone. Mọi tiêu chí gửi/nhận, unread và va chạm được giữ, không giảm kiểm để xanh. CI có suite native và lưu ảnh riêng trước suite khác dọn output.

Ảnh **QA tự động/Auth fixture**, không phải tài khoản staging thật: [Tank speech](evidence/2026-11-15/native-tank-speech.png), [Nối Từ speech](evidence/2026-11-15/native-noitu-speech.png), [Hải Chiến phone speech](evidence/2026-11-15/native-haichien-speech.png), [khung chat phone](evidence/2026-11-15/native-haichien.png). Đã xem ảnh chạy.

## Phần chưa nghiệm thu

Chủ dự án trả lời đã đăng nhập2tab, nhưng hai tab review trong Chrome profile xuan duc vẫn được quan sát ở form login, chưa có nút Đăng xuất. Đang xác định đúng phiên/handoff để kiểm hai account thật trên backend cuối. Không ghi tạo/join/gửi/nhận staging thành PASS khi chưa thấy hành vi đó. Còn thiết bị thật/bàn phím ảo/mạng yếu và full CI remote trước merge; **không merge khi chưa được chủ dự án yêu cầu**. Tank WS ở localhost không phải phép đo Render/hai mạng. Không nâng plan hoặc deploy backend production từ nhiệm vụ này.
