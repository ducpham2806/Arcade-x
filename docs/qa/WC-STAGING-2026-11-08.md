# Nối Từ · nghiệm thu staging hai tài khoản · 08/11/2026

**Pilot2account đã kiểm; chưa merge hoặc bật production.** Nhánh `codex/word-chain-online`, PR19; core36801d4, checkpoint001d9c5/full CI28success. Nguồn/thay đổi/CI27 và34.512từ ở [báo cáo triển khai](WC-ONLINE-2026-11-07.md). Project duy nhất được thao tác: `khqipuipeawzlkqmdzdg`/arcade-x-staging, không SQL production.

## Xác thực và triển khai

User đã trả lời cho phép đổi riêng function staging và xác nhận hai tester đăng nhập. CUA thấy cả tabA/B có nút Đăng xuất và hai ghế khác nhau; không đọc/xuất password/JWT/UUID. Không hỏi lại quyền này.

- `word-chain-room`: legacy JWT OFF đã Save và reload xác nhận; người chơi vẫn bắt buộc Auth.getUser/registered-only, cron bắt buộc token tick riêng. Local config.toml được đồng bộ; đây không phải quyền deploy production.
- Schema/Edge/CORS đã cài từ lượt07/11. Artifact Edge487.451byte; SHA256 chính xác ở báo cáo triển khai. Bộ từ revision4809405e0579… không đổi. Artifact URLhash mới chưa redeploy; code phòng không đổi.
- Sau chuyển setting, HTTPS thật: thiếu bearer401UNAUTHORIZED; bearer giả401UNAUTHORIZED; token tick giả403UNAUTHORIZED_TICK; request browser tick403UNAUTHORIZED_TICK. Dùng public key/bearer giả, không token đặc quyền. Anonymous/expired-token vẫn chỉ có fixture, chưa kiểm phiên thật.
- Áp scheduler.sql đúng staging qua TextEdit→SQL Editor; cron.schedule trả job1. Query metadata xác nhận `word-chain-room-timeouts`, schedule10seconds, active=true, hash_ready=true. Token sinh và giữ trong Vault, không đọc/copy ra ngoài.

## Phòng riêng · 07–08/11

| Ca thật | Quan sát |
|---|---|
| Tạo/join | A tạo SUKT6K/capacity4; B nhập mã sai bị báo không tồn tại, nhập mã đúng vào ghế2 |
| Quyền/start | B thấy chờ chủ; A thấy2/4 rồi bắt đầu sớm2người; cả hai ready và cùng opener |
| PK | A gửi “phân biệt”, B thấy chuỗi cập nhật và gửi “biệt thự”; server nhận cả hai, chuỗi3từ |
| Bỏ cuộc/kết quả | B xác nhận Bỏ cuộc và rời, về menu sau ACK; A nhận chiến thắng, mỗi người1đáp án, chuỗi3; A về sảnh |
| Vào lại/chuyển chủ | Phòng77YYHF: B nhập chữ thường được chuẩn hóa; A rời lobby→B thành chủ, còn1/4 và chưa được Start |
| Đóng phòng | B rời ghế cuối; A nhập lại mã77YYHF bị báo Phòng đã đóng; sau đó quay lại menu |

CUA đã xem ảnh kết quả và các trạng thái thực. Ảnh inline không được lưu thành artifact staging local; ảnh CI26/27 là fixture riêng, không dùng thay bằng chứng tài khoản thật. Wrapper các tab được giữ RAMAuth từ trước checkpointcleanup/hash; không reload chỉ để đồng bộ wrapper. Core room/client và dictionary revision dùng trong ca không đổi.

## Matchmaking, timeout và tái đấu · 08/11

- A tìm một mình thấy1/4/chờ thêm người; Hủy tìm trận về menu. A tìm lại, B ghép cùng thấy2/4 và countdown18s.
- B hủy khi đã ghép đôi: A về1/4, countdown bị gỡ. B tìm lại ghép đúng A, countdown16s được quan sát; đủ20giây chuyển chuẩn bị. Cả hai ready và vào cùng trận, opener “lơ xe”.
- A không trả lời: A nhận Hạng2, B chiến thắng. A vote→B thấy1/2; B vote đủ→trận mới/chuỗi0/ready lại, rồi vào lượt mới. Không thêm bot, không thưởng XP/xu chung.
- Đã đóng cả hai tab chơi; AX xác nhận không còn tab Nối Từ. Mốc đóng1794093048083ms (2026-11-07T23:10:48.083Z). Đối chiếu DB cho thấy lượt tái đấu đã timeout tại23:10:45.255Z, ghi lúc45.972536Z: **xảy ra trước lúc đóng tab**, không tính là bằng chứng turn timeout không client.
- Không còn tab chơi, roomNS8MXF sau đó chuyển active=false/status=closed, updated_at23:11:53.422718Z, cập nhật sau mốc đóng=true. Đây là bằng chứng cron tự xử lý hết hạn phòng/rematch khi vắng client; chưa chứng minh turn timeout giữa trận vắng mọi client.
- `net._http_response` có3response, cả3HTTP200/timed_out=false; hai response sau khi đóng tab trả updated1 tại23:11:44.013Z và23:11:53.428Z. Không có key/token trong output kiểm. SQL chỉ lấy metadata/kết quả, không đọc Vaultsecret hoặc hồ sơ người chơi.

## Giới hạn và bước tiếp

Hai account/một Chrome/một máy/một mạng; chưa phải3/4account, điện thoại thật,2mạng,≥10trận mỗi format hoặc soak30phút. Chưa kiểm no-client turn timeout riêng, reload/reconnect/expiredAuth/IME và launcher Exit thật của online. Code guard tương ứng đã có regression; gateON5/ON6 vẫn còn. Giữ production online=false và thưởng pilot tắt.

Các tab game đã đóng; RAMAuth không còn, không tự mở lại/login lại vô cớ. Cron staging vẫn active, chỉ gọi HTTP khi room đến hạn. Bước tiếp: commit/push cấu hình/bằng chứng, CI head cuối; chuẩn bị vòng3/4account và thiết bị theo plan trước đề xuất cutover. TC-R0 ca A vẫn để sau theo user.
