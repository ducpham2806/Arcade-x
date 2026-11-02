# Tank Clash — P0/P1 review

Ngày: 02/11/2026. Phạm vi: phần nền, thử nghiệm mạng cục bộ và bản prototype P1. Đây không phải thông báo phát hành online.

## Kiểm kê source

Repository: `ducpham2806/Arcade-x`. Mốc kiểm kê ban đầu: `7df4d1812aac7e8889d13c656c85adb599673208`. Trước merge cập nhật theo `origin/main`; giữ các thay đổi game khác trên main.

| Thành phần đã đọc | Kết luận áp dụng |
|---|---|
| `AGENTS.md` | Mobile dialog dùng trọn màn hình; desktop rộng; chuyển trạng thái không chồng popup |
| `package.json`, `tsconfig.json` | React 19/Vite 6/TypeScript; giữ runtime web, không cần đổi sang engine khác cho prototype |
| `src/games/registry.ts`, `src/games/gamePackages.tsx` | Có lazy game package; P4 sẽ đăng ký sau, P1 dùng preview riêng |
| `src/games/GameBridge.ts`, `src/types/index.ts` | Có bridge và pause interface; adapter P1 nhận pause, không gọi cấp thưởng |
| `src/games/StandaloneGame.tsx` | Có hướng nhúng game standalone; P1 chọn controller trực tiếp, tránh thêm luồng lưu tiến trình chưa cần |
| `src/hooks/useMultiplayerBridge.ts` | API thiên về lượt/board state; không dùng làm vòng truyền tọa độ xe và đạn |
| `src/games/duel/server.ts`, `src/games/duel/online-client.ts`, `docs/DUEL-SERVER.md` | Tham khảo mô hình server trọng tài, sequence/version và reconnect; không sửa đường online của game khác |
| `src/launcher/catalog.ts` | Có local-review catalog; giữ Tank Clash ngoài catalog ở P1 theo plan |

Đây là kiểm kê các điểm tích hợp liên quan, không phải audit toàn bộ 3.500+ file của repository.

## Đã làm

- Simulation thuần fixed step 60 Hz [PLACEHOLDER] dùng được ở browser và Node.
- Lái/ngắm độc lập, chuẩn hóa đường chéo, va chạm tường/xe và trượt dọc tường.
- Đạn quét va chạm, phản xạ một lần, gạch phá được, HP, khiên và giới hạn bắn.
- Kết quả hiệp và trận, hòa khi cùng bị loại, reset gạch/xe/đạn giữa hiệp.
- Năm bài sân tập kiểm tra hành động thật, một đấu trường bot; keyboard và pointer controls.
- Pause khi blur/ẩn tab, cleanup khi unmount, feedback sao chép theo hành động người chơi.
- GDD v1 và bảng cân bằng đề xuất thử tiếp. Giá trị nguồn ở `CONFIG`; sửa bảng không tự đổi runtime.
- Export HTML tự chứa khoảng 34 KB, không dùng asset CDN, không gọi database.
- Spike WebSocket cục bộ có input validation, sequence, timeout input và resume đúng ghế/HP.

## Kiểm chứng

| Kiểm tra | Kết quả và giới hạn |
|---|---|
| 12 ca engine | Qua: tốc độ/va chạm, damage một lần, hồi bắn, ricochet, gạch, khiên, friendly fire, hòa, timeout, bài tập, replay và bot hết trận |
| 1 ca mạng với 2 client WebSocket độc lập | Qua: cùng snapshot/tick, chặn input không hợp lệ và sequence cũ, input quá hạn dừng, reconnect giữ HP và nhận input tiếp |
| TypeScript phạm vi Tank Clash | Qua cho engine, runtime và React adapter |
| Build preview | Bundle thành công, một HTML tự chứa |
| Browser desktop | Đã mở sân tập, kiểm tra pause và bố cục controls |
| Khung mobile 390×844 và 844×390 | Đã quan sát menu/sân tập; controls ngoài canvas; đổi focus làm pause đúng dự kiến |
| Hiệu năng thiết bị | Chưa xác nhận 60 FPS hoặc 30 FPS mobile. Browser kiểm tra bị giới hạn nhịp khoảng 1 FPS; không dùng làm benchmark phần cứng |
| Mạng Internet | Chưa thử RTT/jitter/loss hoặc người chơi trên mạng khác. Số đo loopback chỉ chứng minh hợp đồng cơ bản |

Smoke mạng khoảng một giây có khoảng 5 KB/s outbound/client khi phần lớn không giao tranh. Đây không phải trần băng thông đã nghiệm thu. Nhật ký test đi kèm bản bàn giao chứa số đo của lượt kiểm cuối.

Không chạy lại toàn bộ suite game khác hoặc build launcher sản phẩm trong mốc P1 này: không đăng ký game vào launcher, không sửa logic game cũ, auth hoặc database. Cần kiểm thử tích hợp đầy đủ khi tới P4.

## Phương án kỹ thuật sau thử nghiệm

Giữ pure engine và hợp đồng input/snapshot. P0 dùng WebSocket tối thiểu để không chọn nhà cung cấp trước khi có phép đo. Colyseus vẫn là ứng viên cho lifecycle/matchmaking của P2/P3; chưa tích hợp SDK hay đăng ký hosting. Giữ Supabase cho phần dữ liệu bền vững khi tới mốc tích hợp.

## Bước tiếp theo P2

1. Đặc tả giao thức phòng production, auth/quyền vào, thời gian server, timeout và đóng phòng.
2. Nối UI 1v1 vào room server, tạo/vào bằng mã, ready và đấu lại.
3. Dự đoán xe mình, đối soát server, làm mượt xe khác; không giả làm mượt chỉ bằng giảm tần suất simulation.
4. Thử 2 client với RTT/jitter/loss; kiểm kết quả đồng nhất và reconnect qua vòng hiệp.
5. Chọn môi trường chạy server và trình phương án chi phí trước khi đăng ký dịch vụ phát sinh tiền.

P3 mới làm 2v2/queue/tổ đội. P4 mới sản xuất art/audio và tích hợp catalog. Người dùng đã yêu cầu merge sau khi hoàn tất phần đang làm; merge source không đồng nghĩa duyệt phát hành công khai.
