# ONLINE-ERROR · ACTIVE · 08/11/2026

Nguồn publicmain086d6ac, nhánhcodex/fix-online-room-errors (kế thừa checkpointdocs b0b0b32). User gửi ảnh hai Chromeprofile và xác nhận cả Nối Từ/Tank bị lỗi.

## Quan sát

- Ảnh: WordChainRoomPOST403/409; mộtAuthpassword400 ở tabtrái; TankWebSocketclosedbeforeestablished, UIĐang kết nối máy chủ. Không có responsebody trong ảnh, chưa quy mọiHTTP409 thành lỗi cùng nguyên nhân.
- CUA profileMeliodas thấy thêm arcadex_commitERR_CONNECTION_CLOSED, sau đó request khác200/204; profilexuan duc Tank chuyển Mất kết nốiđangthửlại. Chưa chứng minh mất save.
- Probe08/11: CORS Nối TừOPTIONS204/exactorigin; Tank/health timeout25s (0byte), đang kiểm lại sau thời gian khởi động. Không đổi backend/env/SQL lúc triage.
- Chrome liên tục đổi cửa sổ, đã hỏi user để tab lỗi trước5phút để lấy responseNetwork; chưa đọc token/headersAuth.

## Kiểm tiếp

Tái hiện Nối Từ bằng UI → chỉ đọc responseJSON/mã lỗi, đối chiếu client/server; kiểm Tankhealth/dashboard sau coldstart và trạng thái/timeout/retry của client. Chỉ sửa khi có bằng chứng; kiểm hồi quy đúng phạm vi trước commit/push. Không kiểm thêm3/4người hoặc mở lại TC-R0accountA được user để sau.

## Bằng chứng client Tank và sửa nguồn

- Repro bằng stalledWebSocket + đồng hồ giả Node24: sau75s client vẫnconnecting (testđỏ trước sửa). Browser cũ trông chờonclose nên không có hạn trên nếu upgrade bị treo.
- net-client.ts: thời hạn75s lần đầu (dành coldstart),10s sau khi từng kết nối (trong cửa sổ giữghế20s); timeout đóngsocket/thử lại, giữ action chờ gửi một lần. Eventsocketcũ/đãclose không đổi phiên hoặc dừngheartbeat mới;close dọn timer/queue ngay.
- tests/tank-clash/connection.test.mjs (3ca) được thêm vào test:tank-clash, không bỏ fixture/test khác. Lint exit0;69Tankchecks+launcher qua;18WS/ops thật loopback qua. Build/bundle exit0, budget giữ nguyên; CI chưa chốt; chưa deploy, chưa gọi đây là đã sửa dịch vụRender.
- Probe thứ3: DNS0,004s/TCP0,064s/TLS0,116s,15s khôngfirstbyte,HTTP000. Trang [RenderStatus](https://status.render.com/) lúc kiểm báoAllSystemsOperational/SingaporeFreeOperational; không đủ kết luận service cụ thể khỏe.
