# Chat bubble · thiết kế đã duyệt, implementation chờ kiểm

Ngày 14/11/2026 · nhánh `codex/chat-bubble-wireframe` · nguồn `260f160`.
Chủ dự án đã duyệt bố cục14/11 và yêu cầu triển khai để kiểm trước merge. CH1–CH4 đã có code/QA local15/11 trên cùng nhánh; xem [báo cáo implementation](IMPLEMENTATION-QA-2026-11-15.md). Chưa merge/deploy; native chat còn staging/backend và nghiệm thu thiết bị thật.

## Phương án đề xuất

Một hệ thống chat xuyên sảnh và game, ba trạng thái: **bubble → khung nhỏ → phóng lớn**. Đóng khung luôn về bubble; không ngắt nhận tin. Hai dạng bubble có vai trò khác nhau: nút tròn của mình để mở chat và bong bóng lời nói cạnh avatar người gửi.

| Bối cảnh | Mặc định | Khi mở | Khi có tin |
|---|---|---|---|
| Sảnh desktop | Khung nhỏ góc dưới trái, trên footer; khoảng 320×220, xem 2–3 tin và ô nhập | Kéo bằng header, tăng/giảm kích thước; nút phóng lớn mở cộng đồng đầy đủ | Tin cập nhật trong khung; chấm xanh nếu còn kênh chưa đọc |
| Sảnh điện thoại | Khung nhỏ rộng tối đa màn hình trừ 24px, cao khoảng 176px, trên thanh điều hướng | Phóng lớn thành màn chat đầy đủ; có thể thu về bubble 48px | Chấm xanh trên bubble/kênh, có nhãn trợ năng “Có tin chưa đọc” |
| PvP theo lượt | Bubble 48px trong vùng thanh công cụ, ngoài bàn cờ và đồng hồ | Desktop đủ khoảng trống: khung 320×360 cạnh bàn; hẹp: khung đầy đủ có nút thu rõ | Tin của người cùng trận hiện cạnh avatar; nút chat có chấm xanh |
| PvP thời gian thực | Bubble trong vùng chrome trên, tránh minimap/HP/joystick/bắn | Khung nhỏ chỉ khi có vùng trống; nếu không đủ dùng màn chat đầy đủ do người chơi chủ động mở | Lời nói gắn avatar trên HUD; không che đấu trường hay theo tọa độ đối thủ bị ẩn |
| Game solo/bot | Bubble tại vùng công cụ được từng game dành sẵn | Ưu tiên kênh game; có thể chuyển Sảnh/Inbox | Không giả lời bot thành chat người thật |

Góc sảnh có thể đổi nếu đụng PWA prompt/thông báo. Kích thước là thông số thiết kế ban đầu, sẽ kiểm trên bản chạy. Các khung chat nhỏ là dock không modal; riêng màn cộng đồng/phóng lớn giữ đúng quy tắc modal: mobile `w-full h-full`; desktop `sm:h-[92vh] sm:max-h-[900px] sm:max-w-4xl lg:max-w-5xl`. Header/footer cố định, chỉ danh sách nội dung cuộn. Không đổi kích thước ngoài khi chuyển kênh.

## Tương tác đã duyệt

1. **Kéo và nhớ vị trí:** chuột hoặc cảm ứng, ngưỡng kéo 6–8px để phân biệt chạm mở. Kéo xong không tự mở. Chỉ chặn gesture trên bubble/header; không đặt lớp bắt chuột toàn game. Nhớ vị trí theo thiết bị, game và chiều màn hình; lưu neo/tỷ lệ, không lưu tọa độ pixel thô. Resize/xoay máy/bàn phím lên thì kẹp lại vùng nhìn thấy; có nút “Về vị trí mặc định” và lựa chọn vị trí bằng bàn phím.
2. **Vùng an toàn:** mỗi game khai báo các hình chữ nhật cần tránh: bàn/arena, đồng hồ, ô nhập Nối Từ, joystick, bắn, skill, minimap, avatar và menu. Ưu tiên slot trên chrome đã dành sẵn; thả vào vùng cấm sẽ về slot hợp lệ gần nhất. Nếu không có chỗ trống, trở về slot công cụ. Không tự trôi bubble theo diễn biến trận. Khung mở chọn bên còn trống, không nhất thiết bung ngay quanh nút.
3. **Kênh mặc định:** đang trong trận online → “Trận”; trong game chưa có trận → “Game”; ngoài sảnh → “Sảnh”. Giữ Inbox và bạn bè trong màn phóng lớn. Không dùng kênh “Game” công khai thay cho kênh “Trận” riêng tư. Nếu room adapter chưa hỗ trợ, ghi rõ chưa có chat trận và vẫn cho dùng Sảnh/Game/Inbox.
4. **Chấm xanh chưa đọc:** nhận tin mới của người khác ở kênh chưa xem → hiện chấm; tin tự gửi, lịch sử tải đầu, tin trùng và tải lại kết nối không được báo mới. Chỉ đánh dấu đã đọc khi đúng kênh đang hiển thị, tab trình duyệt có focus và đã cuộn đến tin mới nhất; mở khung ở kênh khác không xóa chấm. Đang kéo xem tin cũ → giữ vị trí, hiện “Tin mới”. Đợt đầu nhớ mốc đọc trên thiết bị, không hứa đồng bộ đa thiết bị.
5. **Lời đối thủ:** chỉ tin mới đã được server xác nhận của thành viên cùng trận; neo `playerId` vào avatar/HUD, không neo theo tên/ghế dễ thay. Hiện tối đa 2 dòng (~80 ký tự), khoảng 4 giây; đầy đủ trong lịch sử chat. Mỗi avatar một lời, gộp tin tới nhanh, không chồng nhiều bong bóng. Có tắt lời nổi/tắt tiếng người chơi; tin chặn không xuất hiện. Không phát lại lời cũ khi reconnect hoặc vừa vào trận. Chạm lời nổi mở đúng kênh trận; không đánh dấu đọc toàn bộ chỉ vì đã thấy lời nổi.
6. **Không ảnh hưởng điều khiển:** mở/đóng chat PvP không pause server, không dừng heartbeat hoặc làm rớt membership. Focus ô nhập chặn phím game; nhả toàn bộ trạng thái phím/joystick đang giữ khi chuyển focus. Đóng chat trả focus cho game; Escape chỉ thu chat, không thoát trận. Không tự bật bàn phím khi tin tới. Với solo, chỉ pause nếu adapter/game hỗ trợ rõ; không tái sử dụng cờ chung làm đứng mọi game.
7. **Nút đóng và tin lỗi:** nút “Thu”/× đều trả về bubble, giữ nháp theo kênh; gửi lỗi giữ nháp và hiện thử lại, không giả đã gửi. Thu/phóng không làm gửi trùng. Tin tới không tự phóng cửa sổ, không âm báo mặc định giữa PvP. Mất mạng có trạng thái kết nối; đổi tài khoản/rời trận hủy listener và xóa dữ liệu phiên cũ.

## Hiện trạng trước triển khai · nguồn064a3a5

- `src/components/GameChatBubble.tsx`: đã kéo bằng pointer, ngưỡng 6px, kẹp viewport và redock; vị trí hiện chỉ là state cục bộ, chưa có unread hay vùng tránh theo game.
- `src/components/GlobalChat.tsx`: modal cộng đồng lớn gồm Sảnh/Game/Inbox/Bạn bè; `if (!isOpen) return null`. Đóng sẽ unmount thread; comment ở App về giữ nháp chưa bảo đảm vì nháp nằm trong thread.
- `src/components/SocialChatThread.tsx`: watcher chỉ sống khi thread mount, đọc mỗi 5 giây; tự cuộn mỗi lần messages đổi. `IngameChat` dạng details đang dùng ở Caro, Chess và Xiangqi.
- `src/games/GameWrapper.tsx:708`: `isChatOpen` nằm trong biểu thức truyền `isPaused` cho game. Cần tách hành vi focus/overlay khỏi pause khi tích hợp PvP; chưa khẳng định mọi engine hiện đều bị dừng.
- `src/services/social.ts`: polling tuần tự, dừng khi tab ẩn/offline, backoff tối đa 60s. Đừng tạo thêm một watcher cho mỗi bubble/avatar.
- `supabase/social/schema.sql`: có global/game/dm/room; room kiểm `game_rooms/` với host/guest; read trả tối đa 100 tin, chưa có receipt đọc. Đây là hợp đồng trong repo, chưa xác nhận production hiện tại. Không thể mặc định dùng nguyên room cho Nối Từ và Tank có hệ phòng khác.

## Thiết kế triển khai

Đặt một host chat ở cấp App; `ChatProvider` giữ kênh, cache tin, nháp, unread và trạng thái `bubble/compact/expanded`. Tách `ChatBubble`, `CompactChatPanel`, `OpponentSpeechBubble` và `useChatPlacement` khỏi giao diện cộng đồng. Dùng một nguồn tin theo channel key `(owner, scope, target)` để khung/lời nổi cùng tiêu thụ, dedupe bằng message ID. Mỗi game đăng ký adapter gồm game/match ID, danh sách thành viên, neo avatar, vùng tránh và chính sách input/pause; mount/unmount phải dọn adapter.

Poll chỉ kênh đang mở, trận hiện tại và inbox có giới hạn; không poll mọi game hay mọi người trong danh sách bạn. Tạm dùng hạ tầng 5 giây nên chấm/lời nổi có thể trễ khoảng một chu kỳ cộng độ trễ mạng; không gọi là tức thời. Nếu cần mục tiêu dưới 1 giây, thêm bước đánh giá realtime/WS trong staging, quyền kênh và tải trước khi chọn. Không tự mở Supabase Realtime hay migration production.

| Bước | Phạm vi/file dự kiến | Tiêu chí và bằng chứng |
|---|---|---|
| CH0 · đã duyệt14/11 | Tài liệu này + wireframe tương tác trong chat | Chủ dự án chọn bố trí sảnh, cách mở trong game và lời cạnh avatar |
| CH1 · shell + unread | App, GlobalChat, GameChatBubble, SocialChatThread, social.css; provider/placement mới | Sảnh nhỏ/phóng/thu/kéo/nhớ; một nguồn tin; unread đúng kênh; giữ nháp; fixture browser desktop/mobile |
| CH2 · game PvP theo lượt | GameWrapper; Caro/Chess/Xiangqi + adapter room | Bỏ UI chat details trùng; neo đúng avatar; không che bàn/đồng hồ; chat không đổi lượt hoặc dừng mạng; hai client fixture và hai tài khoản staging |
| CH3 · Tank + Nối Từ | Tank wrapper/runtime/HUD; WordChain OnlineRoom/MatchView; service/server nếu cần | Xác minh auth/membership từng protocol trước nối chat riêng; Tank 2v2 phân biệt trận/đội nếu được duyệt; không tự thêm kênh đội vào bản đầu; Nối Từ không chiếm phím ô trả lời; staging trước backend |
| CH4 · toàn bộ game + QA | Registry/adapter từng game; tests/social + browser suites game bị ảnh hưởng | Mỗi game có bubble/slot và kênh đúng; xoay/resize/keyboard; không chạm nhầm controls; cleanup, mạng và account isolation |
| CH5 · phát hành khi được yêu cầu | CI + báo cáo đúng SHA | Đủ CI theo workflow, chủ dự án yêu cầu merge; xác minh deploy riêng; nghiệm thu thiết bị thật ghi độc lập |

Ước lượng sơ bộ: CH1 khoảng 2–3 ngày; CH2 1–2; CH3 2–4 tùy hợp đồng backend; CH4 1–2. Chốt lại sau CH0 và khảo sát protocol CH3. Không đưa thay engine/gameplay, voice chat, commerce, đồng bộ read đa thiết bị hoặc backend production vào phạm vi duyệt wireframe.

## Ma trận nghiệm thu bắt buộc khi code

- Kích thước 320×568, 390×844, 844×390, 1366×768 và màn rộng; safe area/notch, bàn phím ảo, zoom chữ; bubble/khung/lời đối thủ không vượt mép hay đè vùng cấm.
- Kéo rồi thả không mở; chạm mở, thu về đúng vị trí; phóng/thu giữ nháp/kênh; bàn phím điều khiển đủ, focus rõ, mục tiêu chạm ít nhất 44px.
- Unread: khung đóng, kênh khác, đã ở cuối, xem lịch sử, tin tự gửi, 100 tin lịch sử, trùng/out-of-order/reconnect, tab ẩn và đổi tài khoản.
- PvP: đồng hồ/server vẫn chạy; không mất input sau đóng, không kẹt phím; đối thủ/đồng đội đổi ghế/rời trận không gắn nhầm lời; không rò DM/sảnh thành lời đối thủ.
- Poll chỉ một request mỗi kênh đang hoạt động; không nhân watcher theo avatar; offline/backoff/reconnect, 403 membership và gửi lỗi xử lý đúng.
- Chạy `npm run test:social`, typecheck/build và browser suite module bị sửa; `test:animations` nếu đụng CSS chung; storage khi đụng lưu vị trí/owner. Full CI trước merge. Thiết bị thật/two-account staging là bằng chứng riêng, không thay bằng wireframe.

## Nguồn tham khảo và quyết định thiết kế

- [Roblox: Text chat overview](https://create.roblox.com/docs/chat/in-experience-text-chat): tách cửa sổ, ô nhập, tab kênh và bubble; dùng làm tham khảo phân tách UI, không sao chép API sang ArcadeX.
- [FFXIV: đổi kích thước chat](https://na.finalfantasyxiv.com/uiguide/communication/communication-chat/chat_resize.html) và [ẩn chat](https://na.finalfantasyxiv.com/uiguide/communication/communication-chat/chat_hidewindow.html): tham khảo khung chat có thể thu/ẩn và resize để dành diện tích chơi.
- Các con số kích thước, thời gian 4 giây, chấm xanh, vùng tránh và hành vi PvP ở trên là đề xuất riêng cho ArcadeX, đã nằm trong bố cục được duyệt14/11; giới hạn thực thi ghi trong QA15/11.

## Bằng chứng phiên thiết kế

Wireframe dùng dữ liệu mô phỏng, minh họa sảnh, Caro PvP, Tank PvP và màn điện thoại; không kết nối backend. Kết quả kiểm thực tế được ghi ở WORKLOG/COMPLETED khi đóng phiên. CH0 đã duyệt; CH1–CH4 có code local. Bước tiếp là chủ dự án kiểm bản chạy, staging private chat và QA thiết bị; CH5 chưa được mở.
