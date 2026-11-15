# SN-UI-BADGE · ứng viên sửa giao diện · 13/11/2026

Nhánh `codex/fix-hosting-badge-safe-area`, [PR33](https://github.com/ducpham2806/Arcade-x/pull/33) gồm checkpoint PR32, từ `ec65ea9`; source sản phẩm đang public vẫn là `8320385`. [Bug và AC](../../production/qa/bugs/BUG-NETLIFY-BADGE-MOBILE.md). Đây là kiểm ứng viên, chưa phải xác nhận production đã sửa.

## Nguyên nhân và thay đổi

HUD thật `/.netlify/scripts/hud` chèn iframe trực tiếp dưới body, ngoài React. Frame sẵn sàng có `data-nl-ready=1`, rộng194/cao64px; `.nl-badge` bên trong cao38px, cách đáy18px. Vùng cần chừa gồm badge và8px đệm:64px. Khi popup mở, frame cao thêm nhưng badge vẫn nằm ở đáy. Gói Free giữ branding theo HUD; không sửa iframe, link, trạng thái dismiss hoặc gói hosting.

`installHostingSafeArea` đo badge same-origin; iframe opaque dùng bounds bên ngoài. CSS variable điều chỉnh khung game/launcher và hai hệ modal. Không badge thì inset0; giữ mobile đầy vùng còn lại, desktop92vh và cap900/800/700 theo loại. Dùng load/resize/attribute observer có gom requestAnimationFrame, chỉ quan sát con trực tiếp của body; không theo dõi DOM gameplay mỗi frame. Cleanup phục hồi biến và gỡ observer/listener.

Review độc lập QA/Technical Director phát hiện rule generic900px có thể làm modal mobile cao bị hụt. Đã bỏ rule đó, giữ cap theo từng loại và thêm no-badge390×1000/1440×1200. Không đổi engine, save, Auth, gói offline, SQL, reward hoặc commerce.

## Kiểm đã chạy

- Red baseline: cùng kiểm390×844 trên build nguồn public8320385 thất bại đúng assertion CTA nằm trên badge. Giữ screenshot/trace; đây là preview local của bản cũ, không giả là phiên kiểm public mới.
- `test:hosting`: **5/5**, không retry/skip/flaky.320×740,390×844,844×390,1440×900 cùng opaque iframe. Badge chèn muộn, popup cao320px vẫn inset64, ẩn/hiện/gỡ trả đúng vùng; CTA và toàn bộ stick-zone/dash-zone gồm nhãn nằm trên badge; launch/timer/exit qua, branding link còn hiện. Dùng Auth fixture loopback.
- `lint`, production build, rollback build và bundle budget qua. Catalog:16code/20media, retry503, tải/cache, offline reload/chơi/audio, favorite/recent/exit và guest/account isolation qua. Launcher initial JS301.344byte gzip; chunk lớn nhất470.090byte raw.
- `test:modals`: **36checks** qua, gồm tall phone390×1000, desktop1440×1200,6panel và AppModal bản đồ Mummy trong game; tabs không đổi khung, không badge không tạo khoảng trống.
- `test:animations`: **50/50** game/motion checks và **25/25** VFX/polish browser ca qua. `test:snake-ui`: **11/11** qua3,6phút, **3/3** live-runner guard; không retry/skip/flaky. Kiểm native multitouch, cleanup listeners/RAF/observer/audio, save/retry/lost-ack, cross-tab đổi owner cả SDKstorage chậm, hai thiết bị và refresh phiên.

Dedicated `playwright.hosting.config.ts` dùng dev mode snake-catalog; file `.browser.ts` không bị suite mặc định thu vào sai mode. CI snake_ui chạy `test:hosting` và upload ảnh/JSON trước suite sau có thể dọn output. Đã xem ảnh detail390 và gameplay390/landscape844 sau sửa.

Evidence ngoài git: `/workspace/tooling/hosting-badge-fix-evidence/`, gồm red trace/screenshot và5ca green/8ảnh. Logs `/tmp/hosting-badge-final.log`, `hosting-catalog.log`, `hosting-modals.log`, `hosting-animations.log`, `hosting-snake-ui.log`. Artifacts CI là bằng chứng có thể chia sẻ sau push; không coi đường dẫn local là artifact đã upload.

## Studio / Graphify / giới hạn

Dùng `game-ui-ux`, `input-systems`, `game-qa-playtest`, vai trò Technical Director/QA. AST local components37file/230node/440edge; query GameDetailModal depth1/budget900 trả4node/5edge. Sau thay đổi, refresh services cùng scope/output:47file/485node/1289edge; query installHostingSafeArea depth1/budget900 trả2node/1edge. App/CSS ngoài phạm vi quan hệ đã tra hẹp và xác minh bằng browser. Graph không chứng minh hình học/deploy.

FullCI đúng head xem checks của PR33 trước merge; trạng thái lúc ghi local chưa có kết quả cuối. Chưa merge/deploy production bản sửa. Netlify deploy-preview6af7051f09c4af71b6c7fc43 ready đúng sourceef9f636; URL deploy-preview-33 chuyển tới app.netlify.com/edge-access, nên browser guest không vào được launcher. Không nghiệm thu HUD thật trên preview và không thay cấu hình bảo vệ/login. Log /tmp/hosting-real-preview.log; synthetic contract không chứng minh production hiện tại đã sửa. Android/iPhone/Safari thật, M2/người mới10màn và live DB/JWT vẫn theo [thẻ Snake](../plans/SNAKE.md).
