# ONLINE-ERROR · client đã phát hành, Tank Free phục hồi thủ công · 08/11/2026

User yêu cầu kiểm lỗi cả hai game, sau đó tiếp tục làm cho xong. **Mã sửa đã merge/deploy; giữ Free và giới hạn cold start theo quyết định user.** Không coi lần khôi phục thủ công là đã sửa vĩnh viễn việc tự thức dậy của hosting.

## Nguồn và phát hành frontend

- [PR21](https://github.com/ducpham2806/Arcade-x/pull/21): head **47649f9d1c6da89bf1085bc1448e4cedb2504d60**, [full CI36 success](https://github.com/ducpham2806/Arcade-x/actions/runs/42456461599), job128656472600. Mọi bước typecheck/build/budget/fast/WS/browser/motion/offline/generated clean qua. Không bỏ fixture hoặc nới assert.
- Merge **9061bfd8411fd18de28a731d30e379e80eb7dc94**; cây mã main khớp head đã kiểm. [Netlify6af075593632a228f5ca3102](https://app.netlify.com/projects/arcade-x/deploys/6af075593632a228f5ca3102) quan sát **Currently published Production/main9061bfd**.
- Public hai assetHTTP200 và byte-match build local: `index-BnBjx5Z1.js`61.344byte/SHA256`03fd2a8c5c2cf0ecf53d82ab4f025ecccbc55f132d637a13e9396917fcfd23df`; `online-platform-CjcrIxEG.js`8.244byte/SHA256`40b01ee3c933930d894486e73dca2497d296f473f7c4572087930105a40dc76c`.

## Chẩn đoán và sửa Nối Từ

Hai phiên registered có sẵn tạo/vào AJEV5P thành công trước khi Network xuất hiện503. Response **code=SUPABASE_EDGE_RUNTIME_SERVICE_DEGRADED, message=Service is temporarily unavailable** xác định lỗi tầng dịch vụ; preflight503 gây thông báo CORS trong browser. OPTIONS từng trả204/exactorigin, chưa có bằng chứng cần đổi allowlist.

Sau đó chủ phòng nhận403/errorNOT_MEMBER; ghế không còn, người kia thành chủ1/2. Đã quan sát chuỗi503→403, chưa phân biệt chắc mốc ready30s hay vắng90s. UI cũ còn giữ notice mất mạng cạnh lỗi membership, gây hiểu nhầm. Hai phiên đã về menu/rời phòng. Không suy ra quyền tài khoản sai.

409 trong ảnh cũ không có responsebody để phân loại; capture mới không tái hiện409. Nguồn hỗ trợ VERSION_CONFLICT/EXPIRED và đồng bộ/thử lại, nhưng không dùng điều đó để kết luận mọi409 cũ bình thường. Authpassword400 cũ chưa tái hiện; không lấy mật khẩu để thử.

`online-client.ts` nay giữ fieldcode của gateway, thông báo503 tiếng Việt, giữ nguyên pending/mutation ID khi kết quả chưa chắc chắn. SnapshotNOT_MEMBER/LEFT_ROOM/NOT_FOUND xóa notice mạng cũ và hướng dẫn vào lại bằng mã/tạo phòng; lastErrorCode vẫn dùng để dọn resumeKey. Lỗi dứt khoát sau retry cũng xóa notice cũ. Quyền/CORS/HTTPstatus/luật server giữ nguyên.

Red/green: trước sửa fixture503 bị đổi thànhHTTP_ERROR; sau sửa52checks qua. Toàn bộ9UI qua, gồm hai ca503→thử lại→phòng và mất mạng→mất membership→tạo phòng mới, cùng bot phone/desktop và phòng/PK/queue cũ. Lint/build/bundle qua trênNode24. Máy thiếu ChromiumPlaywright nên local dùng Chrome đã cài với profile headless riêng; CI dùng Chromium chuẩn.

Ảnh390×844 đã xem từ fixture local, chỉ có giao diện/thông báo mẫu. Duyệt tự động chặn công khai một ảnh vì thiếu ủy quyền payload: giữ cả hai tại `/private/tmp/arcadex-online-error-evidence/`, test chụp vào `test-results/local-online-errors/` ngoài glob artifact public. Không bỏ assert. Không lưu header đăng nhập, token hoặc định danh account vào báo cáo.

Sau NetlifyPublished, tại sảnh bấm **Cập nhật & khởi động lại**, launcher tải lại hoàn tất; tạo **SSQT7U1/4** rồi Rời phòng→menu thành công. Trước cutover cũng đã tạo/rời BKV9PP. Những lần này chứng minh khả dụng ngắn tại thời điểm kiểm, không là SLA cho Supabase.

## Tank: triệu chứng, sửa client và phục hồi

Ban đầu health4lần timeout25/20/15/15s; DNS/TCP/TLS qua nhưng khôngfirstbyte. WSS handshake cũng timeout. Tái hiện riêng stalledWebSocket bằng Node24clockmock: sau75s vẫnconnecting (đỏ trước sửa). Client mới có deadline75s lần đầu cho cold start/10s khi nối lại, giữ action chờ; event socket cũ/đãclose không đổi phiên hoặc dừng heartbeat mới; close dọn timer/queue.3regression mới,69Tankchecks+launcher và18WS/ops loopback qua; fullCI36 bao gồm các suite UI Tank.

Đã tìm đúng dashboard trong Chrome **duc (xuan duc)**, không phải profilexuan duc ở trang tạo account. Không tạo account mới. Service srv-dbm1r9t6e07s73asmulg vẫnLivec705100; log trước đó có dừng theo thời gian nghỉ, chưa thấy crash/OOM trong phạm vi log đã đọc. Restart14:24 không khôi phục; HTTP70s vàWSS20s vẫn timeout.

Redeploy đúng **c7051001054943a10c3685ff645872c3f43b45af**, không Sync Blueprint hoặc chọn main mới:

| Lần | Deployment / kết quả |
|---|---|
| Hồi chiều | dep-dbo2981srm7s73apfv80, Live14:29GMT+7; health200/~0,31s, WSSopen/~0,30s; hai account thật tạo/vào MFSSFS đúng hai đội, sau đó về thư viện |
| Sau nhiều giờ nghỉ | lượt kiểm sau frontendPublished lại kẹt; HTTP70s rồi180s đều0byte/HTTP000; browser navigation cũng timeout; robots.txt200 trả `User-agent: * / Disallow: /`, phù hợp trạng thái đang ngủ |
| Khôi phục cuối theo lựa chọnFree | dep-dbo7ke3rjlhs73aktsj0, Live20:35GMT+7; preflightNode24.22.2/AuthArcadeXregistered-free/origins1/cap16; health200/~0,45s, WSSopen/~0,29s, instancec787d22a-dc49-4efa-ba20-f128e0138e57 |

Client mới đang chờ đã tự nối lại sau lần cuối, nhận phòng **MB7CU8**; quan sát phòng trên public rồi bấmRời phòng→menu. Không giữ phòng thử này sau kiểm. Đây là kiểm retry qua gián đoạn thật, không phải trận3/4người hay bài soak.

## Quyết định Free và phần còn lại

Dashboard cho thấy Free0USD, lựa chọn0,5CPU/512MB7USD/tháng. User trả lời **“Giữ Free, chưa nâng gói”**; đã giữ Free, không đổi gói workspace, billing hoặc phát sinh nâng cấp. Theo [tài liệu Render](https://render.com/docs/free#spinning-down-on-idle), Free ngủ sau15phút không có inbound traffic và bình thường thức dậy khi cóHTTP/WSS, khoảng một phút. Thử thực tế ở service này đã quá180s không tự thức dậy; chưa đủ log để kết luận nguyên nhân sâu bên hosting.

Phương án user đã chọn là **khôi phục thủ công và ghi rõ giới hạn**, không tuyên bố cold start đã được sửa ổn định. Nếu tái diễn: kiểmhealth/log/robots và thao tác redeploy đúng bản backend đã xác minh trong ngân sáchFree; không tự nâng gói, Sync Blueprint, thêm cron keep-alive hoặc hỏi lại cùng quyết định giá nếu user chưa đổi ý. Sitefrontend vẫn Netlify9061bfd, backend vẫnc705100.

ON5/ON6 còn thiết bị/mạng/soak/IME/Auth/no-client turn; user bỏ gate thật3/4người, fixture giữ nguyên. OnlineNốiTừ chưaXP/xu. TC-R0accountA/mãB cũ user để sau. Commerce và quyền SQL production ngoài gói Nối Từ đã duyệt không thay đổi.

Checkpoint sau phát hành: `codex/online-error-release-verification`; lịch sử trước cập nhật giữ [nguyên văn](../archive/ONLINE-ERROR-2026-11-08-before-restoration.md). Không bắt đầu Snake trong checkpoint này.
