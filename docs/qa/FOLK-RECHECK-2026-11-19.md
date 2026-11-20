# Kiểm lại Ô Ăn Quan và Nhảy Lò Cò · 19/11/2026

Nguồn `07bd19f`, nhánh QA `codex/folk-qa-20261119`. So với bản phát hành `f154795`, diff nguồn chỉ có Markdown. Chạy bản production build cục bộ bằng Node 24 và Chromium, tài khoản khách. Khi kiểm online, bộ Playwright dùng hai phiên giả lập Auth, Edge handler thật và PostgreSQL chạy qua PGlite.

## Kết quả

- **Ô Ăn Quan** — Chơi hết ván với bot dễ và hai người chung máy. Animation rải khóa nước đi đến đúng lúc, ăn vào mẹt đúng ghế, lịch sử còn sau reload. Kiểm thưởng một lần, đấu lại, rồi kiểm riêng phòng 1v1, chat hai chiều, gửi lại nước đi, vào lại và hết giờ.
- **Nhảy Lò Cò** — Bot dễ và hai người chung máy chơi đến đủ ba Nhà. Qua luồng thảy, nhảy một/hai chân, nhặt Chàm, đổi lượt, mở lại mốc đã lưu và đấu lại. Sai nhịp làm mất lượt đúng luật. Pause giữ đứng vạch lực và tiếp tục sau countdown.
- **Sảnh và lưu ván** — 8 lượt kiểm ở 320×568, 390×844, 844×390 và 1280×820, mỗi kích thước chạy hai game. Qua luồng mở từ sảnh, thực hiện lượt, thoát và mở lại đúng trạng thái. Không thấy lỗi JavaScript, asset cục bộ trả lỗi hay tràn ngang.
- **Test** — 21/21 ca Node/PGlite qua, bundle Edge khớp nguồn. Playwright lượt đầu 6/7, gồm 5 offline và ca Ô Ăn Quan online qua. Ca Nhảy Lò Cò online hết thời gian tìm vùng lực thảy Chàm. Lint, build production, bundle budget và kiểm tài liệu qua.

## Phát hiện cần xử lý

1. **Nhảy Lò Cò online · vạch lực bỏ qua vùng giữa.** Lượt Playwright đầu hết 6 giây mà giá trị vạch không đi qua dải 44–55 theo ca kiểm. Ảnh lỗi vẫn là pha thảy và còn 15 giây. UI tính lại vạch theo bộ đếm 160 ms ở [OnlineRoom](../../src/games/folk-duel/OnlineRoom.tsx#L58). Với [hàm tính lực](../../src/games/folk-duel/online-protocol.ts#L64), vạch ở dải 44–55 khoảng 63 ms mỗi lần đi qua và ở dải hoàn hảo 42–58 khoảng 89 ms. Mô phỏng đúng chu kỳ cho thấy bước lấy mẫu 160 ms có thể bỏ qua dải test suốt 6 giây. Chu kỳ hiển thị này có thể khiến vạch người chơi thấy lệch thời điểm [server tính lực](../../supabase/functions/folk-duel-room/engine.ts#L64). Phần lệch khi bấm qua mạng thật còn cần đo. Chạy lại cùng ca 3/3 qua, xác nhận hiện tượng không xảy ra ở mọi lượt.
2. **Khung thấp buộc cuộn để thao tác.** Mở ván hai người ở 844×390. Ô Ăn Quan chỉ hiển thị phần trên bàn lúc vào ván. Canvas cao khoảng 415 px trong vùng chơi 270 px, hai nút rải nằm dưới màn hình. Nhảy Lò Cò ở 844×390 để cả vạch lực và nút thảy dưới màn hình. Ở 320×568, nút thảy bắt đầu ở y=550, cao 45 px và chỉ lộ khoảng 18 px đầu. Cuộn thì vẫn phát lệnh và lưu lượt được. [CSS vùng chơi](../../src/games/folk-duel/folk-duel.css#L140).
3. **Nút Chơi lại trên thanh game mở menu.** Chơi một lượt rồi bấm nút có nhãn `Chơi lại ván mới`. Cả hai game trở về menu và hiển thị `Tiếp tục ván đã lưu` với cùng ID và trạng thái. Nút `Đấu Lại` ở màn kết quả tạo ván mới đúng. [Handler thanh game](../../src/games/GameWrapper.tsx#L524).
4. **Nhảy Lò Cò mất focus khi chuyển từ thảy sang nhảy.** Dùng bàn phím focus nút thảy, nhấn Enter khi vạch vào vùng xanh. DOM chuyển qua Bước 1 và focus về `BODY`. Tab kế tiếp tới nút 1 CHÂN nên vẫn chơi được bằng bàn phím. [Nút đổi theo pha](../../src/games/nhay-lo-co/index.tsx#L465).

## Phạm vi đã xác minh

Ảnh, trace, kết quả số đo và stamp lưu cục bộ ở `test-results/folk-qa/`. Đã mở ảnh runtime ở các khung lỗi. Kết nối URL công khai từ shell bị proxy trả 403 ở bước CONNECT. Chrome Cloud không khởi động do lỗi sandbox. Kết quả lần này áp dụng cho bản dựng cục bộ và phòng mô phỏng. Hai tài khoản staging, độ trễ mạng thật và điện thoại vật lý còn chờ nghiệm thu.

Studio Game QA & Playtest, vai trò QA Lead. Graphify 0.9.108, AST code-only phạm vi `src/games/folk-duel`, 126 nút và 277 cạnh, query `useOfflineMatch` và `.arrivalNow` ở depth 1. Đối chiếu file CSS, mã thời gian và bằng chứng runtime trực tiếp.
