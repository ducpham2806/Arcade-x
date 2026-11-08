# ONLINE-ERROR · ACTIVE · 08/11/2026

Publicmain086d6ac; nhánhcodex/fix-online-room-errors, [PR21 nháp](https://github.com/ducpham2806/Arcade-x/pull/21). User gửi ảnh và xác nhận cả Nối Từ/Tank lỗi. Bản sửa client mới chưa merge/deploy; không gọi dịch vụ hosting đã khôi phục.

## Kết quả Nối Từ trên public

- Hai profile Chrome có phiên registered sẵn: xuan duc tạo **AJEV5P1/2**; Meliodas nhập mã→phòng2người/chuẩn bị, bấm Sẵn sàng nhận Hủy sẵn sàng. Tạo/vào phòng ban đầu thành công, không phải endpoint luôn hỏng hoặc chặn mọi tài khoản.
- Network sau đó có8response503. Đã đọc Response JSON: **code=SUPABASE_EDGE_RUNTIME_SERVICE_DEGRADED, message=Service is temporarily unavailable**. Đây là phản hồi tầng dịch vụ Supabase; không phải RoomError do luật từ/SQL của handler trả. Một số preflight503 khiến browser báo CORS; probeOPTIONS trước đó204/exactorigin. Chưa có bằng chứng cần đổi allowlist.
- Phiên chủ phòng sau đó trả **403/error=NOT_MEMBER/message=Bạn không có quyền vào phòng này**; ghế không còn, profile kia thành chủ phòng1/2. Đã quan sát chuỗi503→403; chưa phân biệt chắc mốc loại do ready30s hay absence90s. Không kết luận quyền tài khoản bị cấu hình sai.
- UI cũ cùng hiện lỗi membership và notice Mất kết nối còn sót. Chủ phòng Quay lại→menu; người còn lại Rời phòng→menu. Đã dọn phòng thử. Không chạy thêm3/4người.
- 409 trong ảnh cũ không còn requestbody để đọc; capture mới ở cả hai profile không có409. Nguồn có VERSION_CONFLICT/EXPIRED được client đồng bộ/thử lại, nhưng **chưa xác định409 cũ thuộc mã nào**, không khẳng định mọi409 là bình thường. Authpassword400 cũ cũng chưa tái hiện; không lấy mật khẩu để thử.
- [SupabaseStatus](https://status.supabase.com/) lúc kiểm báo fullyoperational; không phủ nhận503 cụ thể đã bắt và không đủ chứng minh outage toàn hệ thống. Báo cáo chỉ lưu mã lỗi và dữ kiện cần thiết, không lưu header đăng nhập/token/danh tính account.

## Sửa client Nối Từ

online-client.ts nhận thêm fieldcode của gateway, thông báo503 tiếng Việt, giữ mutationID/pending để retry không tạo ghế trùng. Khi snapshot xác nhận NOT_MEMBER/LEFT_ROOM/NOT_FOUND, xóa notice mạng cũ và hướng dẫn vào lại bằng mã/tạo phòng; giữ lastErrorCode cho cơ chế dọn resumeKey hiện có. Lỗi dứt khoát sau retry cũng xóa notice cũ. Không đổi HTTPstatus/quyền/CORS/luật server.

Red/green: fixture503 trước sửa bị mất mã thànhHTTP_ERROR; sau sửa11clientchecks/52WordChainchecks qua. Hai ca UI lỗi mới qua Chrome headless riêng:503→Thử lại→phòng; networkfail→NOT_MEMBER→thông báo mới→tạo phòng lại. Ảnh 390×844 tạo hoàn toàn từ fixture local, chỉ có giao diện/thông báo mẫu; đã mở xem chữ/nút vừa khung, chụp sau animation chuyển cảnh: giữ local ở `/private/tmp/arcadex-online-error-evidence/` (hai PNG). Bộ duyệt tự động chặn công khai một ảnh vì thiếu ủy quyền cho payload; giữ cả hai local, không đưa ảnh lỗi mới vào Git hoặc artifact public. Các test vẫn chụp vào `test-results/local-online-errors/`, giữ nguyên toàn bộ assert. Fixture chỉ ởtests, không có trong bundleproduction.

## Tank Clash

- Cả hai profile kẹt connecting/reconnecting. /health4lần timeout25/20/15/15s,0byte. Probe thứ3: DNS0,004s/TCP0,064s/TLS0,116s nhưng khôngfirstbyte. [RenderStatus](https://status.render.com/) báo operational/SingaporeFree; chưa xác định nguyên nhân service cụ thể.
- Tái hiện thiếu deadline bằng stalledWebSocket + Node24clockmock: sau75s vẫnconnecting (testđỏ). Sửa net-client.ts:75s lần đầu cho coldstart,10s handshake sau khi từng mở; timeout đóng/thử lại, giữ action chờ một lần. Socketcũ/đãđóng không đổi phiên hoặc dừngheartbeat mới;close dọn timer/queue.3regressionxanh,69Tankchecks+launcher và18WS/ops thậtloopback qua.
- Dashboard session hết hạn. GitHub trả account chỉ connectedfordeploys, không signin. Google hiện tại dẫn sang Createaccount; **dừng trước tạo account**, không có service settings/logs để kết luận. Đã hỏi user mở đúng service bằng Renderaccountcũ tại dashboard.render.com/web/srv-dbm1r9t6e07s73asmulg. Không đổi gói/env/JWT/SQL/deploy trong triage.

## Kiểm và bước tiếp

Node24lint/build qua; budget giữ nguyên. Toàn bộ 9 Word Chain UI đã qua (2,6 phút), gồm phòng/PK/queue, hai ca lỗi mới và bot phone/desktop. Máy thiếu ChromiumPlaywright, lần chạy mặc định dừng trướclaunch; chạy lại bằng Chromeđãcài quaCHROMIUM_EXECUTABLE, profiletest riêng. Không hạ assert hoặc bỏ fixture.

PR21 đã push cả hai bản sửa client, chưa merge/deploy. Full CI đúng head mới là gate trước merge; CI34 chỉ kiểm checkpoint Tank đầu tiên, không chứng minh phần Nối Từ mới. Khi user mở Render: đọc service/event/log/health trước, khôi phục đúng nguyên nhân trong quyền hiện có; không đổi chi phí hay redeploy vô cớ. Theo dõi probe Nối Từ sau dịch vụ phục hồi;409 cũ chỉ phân loại khi có body hoặc bước tái hiện. TC-R0accountA userđểsau, không mở lại. Không có thay đổi SQL/backend production.
