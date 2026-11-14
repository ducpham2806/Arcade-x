# Chat bubble · bản kiểm trước merge · 15/11/2026

Nhánh `codex/chat-bubble-wireframe`, tiếp từ thiết kế `064a3a5`. Chủ dự án duyệt bố cục14/11, yêu cầu triển khai sảnh/ingame và kiểm trước merge; tiếp tục15/11. Trạng thái: **đã code và kiểm local; chờ chủ dự án nghiệm thu**, chưa merge hoặc deploy. Không thay backend production, không áp SQL lên production, không đổi gameplay save/golden hay commerce.

## Bản để kiểm

- [ArcadeX local](http://localhost:3000/): sảnh và các game thật trên nhánh làm việc. Sảnh mặc định khung nhỏ; vào game thu về nút chat trên thanh công cụ.
- [Bản kiểm tin đến](http://localhost:3000/test-results/chat-review/index.html): dùng các component chat thật, dịch vụ/khung game thử được gắn nhãn rõ. Chọn Sảnh/Caro/Tank rồi bấm **Bình gửi thử** để kiểm chấm xanh/lời nổi; đây không phải bằng chứng trận online thật.
- Tái tạo fixture: `npm run preview:chat`; mở bằng dev server `npm run dev`. Source fixture nằm trong tests, không nhập vào build sản phẩm. Không sửa thủ công HTML sinh từ script.

## Phần đã triển khai

- `src/chat/ChatProvider.tsx`, `ChatContext.tsx`, `chat-store.ts`, `useChatFeed.ts`: cache/nháp/unread tách theo owner và channel. Một watcher cho mỗi kênh, dùng chung giữa thread và host; giữ kênh mặc định, kênh đang chọn và inbox khi thu khung. Tạm dừng poll khi tab ẩn/offline theo hạ tầng social hiện có. Đổi owner/rời phòng dọn dữ liệu và từ chối phản hồi muộn của phòng/owner cũ.
- `ChatShell.tsx`, `useChatDrag.ts`, `placement.ts`, `chat.css`: khung nhỏ ngoài sảnh, bubble kéo/chạm phân biệt, nhớ vị trí chuẩn hóa theo owner/game/chiều màn hình, kẹp viewport và nút về mặc định. Trong game tránh board/canvas/nút/HUD đã đánh dấu; desktop mở bên còn chỗ, thiếu chỗ thì màn đầy đủ. Mobile/phóng lớn giữ quy tắc modal, header/footer cố định và nội dung cuộn riêng.
- `SocialChatThread.tsx`: giữ nháp theo kênh qua thu/phóng; gửi lỗi giữ nháp; không tự cuộn khi đang xem tin cũ, nút “Tin mới” đưa về cuối. Tin của mình/lịch sử đầu/tin trùng không tạo unread. Chỉ đánh dấu đọc khi đúng kênh đang xem, có focus và ở cuối. Mốc đọc/vị trí lưu theo owner trên thiết bị; nháp hiện giữ trong phiên, không hứa tồn tại qua reload.
- `ChatSpeeches.tsx`: lời mới gần avatar/HUD của thành viên phòng, ID ổn định, tối đa hai dòng/80 ký tự, khoảng4s. Một lời mới nhất để tránh chồng lấp; ẩn khi không có vị trí an toàn. Có tắt toàn bộ hoặc ẩn theo người trong trận, chạm mở đúng kênh. Không phát lịch sử khi mới vào/reconnect; không đọc toàn bộ kênh chỉ vì lời nổi đã hiện.
- `input.ts` và `GameWrapper`: nhả input giữ trước khi mở/focus chat, chặn phím từ chat lọt vào game. Mở chat không truyền pause cho game có room online; không dừng đồng hồ/heartbeat server. Solo vẫn theo pause của game/platform. Nối Từ không giành lại focus ô trả lời khi người chơi đang gõ chat.
- Caro/Chess/Xiangqi: bỏ khung details chat trùng, đăng ký phòng social đang dùng; gắn player ID vào avatar. Khung cộng đồng giữ Sảnh/Game/Inbox/Bạn bè, thêm Trận khi có adapter; đi lại giữa khung nhỏ/phóng lớn giữ đúng nháp/kênh.
- Tank: chat WS theo room, stable public player ID qua đổi đội, ID tin có namespace người gửi, xác nhận gửi/dedupe/rate limit. Gửi từng tin qua WS, không broadcast toàn bộ lịch sử mỗi tin. Không tin sender/name từ client, spectator không gửi, không trộn phòng. Đóng/rời phòng hủy pending; retry kết quả chưa rõ giữ request ID.
- Nối Từ: command chat qua server/CAS/receipt hiện có, chỉ thành viên, tối đa500 ký tự/1giây, public ID theo lần ngồi ghế. Snapshot phân biệt capability; SQL ghép trận giữ epoch người chơi. Không để chat xóa `lastResult` của lệnh nộp từ, không tự gửi lại tin khi reconcile pending.
- Social inbox thêm trường sender tương thích ngược trong nguồn SQL; frontend có fallback cho các lượt gửi cùng phiên trên schema cũ. Chưa áp SQL mới lên dịch vụ thật.

## Kiểm đã chạy

Môi trường Node24.22.3, Chromium headless macOS; không dùng báo cáo cũ chứng minh production. Không tắt hoặc nới assertion để xanh.

| Kiểm | Kết quả/bằng chứng |
|---|---|
| `npm run lint`, `npm run build` | PASS trên bản code cuối; build không chứa fixture hoặc room server Nối Từ |
| `npm run test:bundle` | PASS budget; launcher dưới400KB gzip, mọi chunk dưới500KB |
| `npm run test:social` | PASS: modal cũ, draft/gửi lỗi, routing; store chung/dedupe/unread từng kênh, cleanup owner/room và geometry |
| `npm run test:fast` | PASS toàn bộ script trên Node24; các bộ mới đã nằm trong social/Tank và CI |
| `npm run test:tank-clash` | 70tests PASS, thêm chat membership/ack/dedupe/collision ID, các ca netcode1v1/2v2 giữ budget; không tiêu thụ thêm RNG gameplay |
| `npm run test:tank-clash-server` | 18tests PASS qua WS loopback: Auth/origin/capacity/restart |
| `npm run test:word-chain` | 54checks PASS: rules12/server12/schema9/Edge10/client11; chat được kiểm cả core và HTTP/PGlite, outsider/spoof/length/retry bị xử lý đúng |
| `npm run test:chat-ui` | 3ca PASS: StrictMode, kéo không mở, unread, giữ nháp qua thu/phóng/Inbox, gửi lỗi, đổi owner, closed-channel notifications, game toolbar và board Caro thật |
| Chat phone | PASS320×568,390×844,844×390. Desktop1366×768. Có ảnh khung mở và bubble; chưa bàn phím ảo/thiết bị thật |
| `npm run test:tank-clash-ui` | 13ca PASS: launcher, Auth/logout, private1v1/2v2, queue/party/spectator/surrender/rematch, loopback |
| `npm run test:word-chain-ui` | 8/9ca qua lượt suite; ca phone còn lại PASS42.5s khi thu chat qua nút thật trước chọn thẻ game. Giữ nguyên toàn bộ kiểm lượt/từ/kết quả |
| Motion | 50game/mode CSS/Canvas PASS; lượt cuối tách riêng 25/25Playwright PASS trong1.6m, assertion nguyên bản. Các lượt ghép trước có lỗi HMR/timing, không coi là PASS |
| Tài liệu | `python3 scripts/check-docs.py`, `npm run test:claude`, `git diff --check`: chốt cùng commit |

Các lượt đầu bị xung đột server/output, build trong khi preview đang đọc assets và Vite reload từ HTML report; đã tách report ra `/private/tmp`, dùng server cố định và kiểm lại. Trên điện thoại, khung chat nổi mặc định có thể phủ thẻ game; test Nối Từ thực hiện thao tác thu chat như người chơi, không bỏ qua kiểm gameplay. Ca Dungeon dùng fixture không nhập chat, fail ở opacity0.926 sau120ms khi chạy tải lớn; lượt riêng đã qua, không sửa animation hay assertion của Dungeon.

## Ảnh đã quan sát

[Sảnh thật](evidence/2026-11-15/lobby.png) · [Chat cạnh bàn Caro thật](evidence/2026-11-15/caro-chat.png) · [Chat phone320](evidence/2026-11-15/phone-chat.png) · [Bubble phone320](evidence/2026-11-15/phone-bubble.png). Ảnh sảnh/Caro dùng dịch vụ chat fixture để không gửi tin lên production; phone dùng khung scene thử.

## Giới hạn và bước tiếp

1. Chủ dự án kiểm bản local trước merge. **Full CI remote/merge/deploy chưa làm**; không coi local PASS là nghiệm thu production.
2. Private chat Tank/Nối Từ cần deploy nguồn backend mới vào **staging**, kiểm hai tài khoản/mạng thật và client/server capability trước khi phát hành. Máy chủ cũ báo rõ chưa có chat trận và vẫn cho dùng kênh Game công khai; không gửi nhầm vào phòng social legacy.
3. Chưa kiểm Android/iPhone, bàn phím ảo thực, notch, mạng yếu thật, soak dài hoặc đọc đa thiết bị. Vị trí/unread local không phải receipt đồng bộ máy chủ. Kênh social poll5s, inbox15s; native dùng WS/snapshot khi được backend hỗ trợ.
4. Chặn người trong social giữ hành vi hiện có; native room có ẩn lời nổi theo người, chưa đồng bộ danh sách chặn social sang public ID của Tank/Nối Từ. Hải Chiến đăng ký trạng thái phòng để không pause PvP khi mở chat, hiện dùng kênh Game công khai và báo rõ chưa có chat riêng. Tank spectator hiện không gửi chat. Không có chat đội riêng/voice/offline send queue.
5. Tiếp CH5 chỉ khi chủ dự án yêu cầu, sau staging và CI. Không merge main/áp SQL production từ lần duyệt bố cục này.

## Chốt phiên

Đã có ảnh quan sát, kiểm tài liệu/budget và diff sạch lỗi whitespace. Implementation và bằng chứng được commit cùng nhau trên nhánh riêng. Bản local chờ chủ dự án kiểm; không merge/deploy. Full CI remote, staging private chat và thiết bị thật là bước sau nghiệm thu UI.
