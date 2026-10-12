# Cosmic Defend v2 — Bản nâng cấp theo GDD 1.5

Ngày kiểm tra: 11/10/2026. Game ID giữ nguyên `cosmic-defense` để không làm mất bản lưu/tích hợp launcher. Tên hiển thị mới: Cosmic Defend.

## Bản có thể chơi hiện tại

- Dùng sprite gốc của gói người dùng cung cấp: Aegis Nova Lv1–5, 13 enemy, 10 boss, item, UI, chân dung, logo và ba lớp nền của từng hành tinh. Renderer canvas 180×320, lọc nearest; giao diện HTML có focus bàn phím và font VT323 lưu cục bộ.
- Campaign 100 màn, 10 hành tinh, 1.762 lệnh wave JSON. Mỗi hành tinh có 10 mục tiêu: hạ enemy, sống sót, nhặt Star Core, hazard, mini-boss, hộ tống trạm 12 HP, phá 3 máy phát, Score Attack, Gauntlet và boss.
- Màn Asteria M1 dùng 8 wave mẫu của GDD (39 Scout, yêu cầu hạ 24). Các màn còn lại sinh từ template và được lưu thành dữ liệu để chỉnh độc lập. Chỉ số D dùng đường răng cưa theo mục 24.3, thời lượng 90–170 giây.
- Di chuyển tương đối một ngón tay hoặc WASD/mũi tên; bắn tự động; hitbox lõi nhỏ. Input được lượng hóa ở 20 Hz, mô phỏng 60 Hz tách khỏi render, vị trí làm tròn 1/256 trước khi vẽ tại pixel nguyên.
- 4 HP gốc, Hull Lv5 thêm HP thứ 5; bất tử 1,5 giây sau trúng đạn. Telegraph theo dải D; đạn không sinh trong bán kính 48 pixel quanh tàu. Enemy/đạn có giới hạn; đòn 2 HP cách nhau ít nhất 8 giây.
- Mỗi boss có pattern khác nhau, pha 1–3 (Xar’Kul 1–4), chuyển pha xóa đạn, cửa sổ điểm yếu. Các boss Aquaris/Machina/Tempest có bộ phận phá được; Prism phản đạn mặt tối; Cryowyrm dùng đốt thân; Xar’Kul có pattern ký ức và lực hút.
- 10 item: Plasma, Missile, Bomb, Laser, Shield, Nanobot, Cloak, Magnet, Overdrive, Amplifier. Slot bấm dùng Q/Space, E, R; các cấp item reset mỗi lượt bay. Reactor Lv10 có slot thứ ba.
- PRP năm tiêu chí, 1–3 sao, combo ×1–3; star gate theo GDD. Kỷ lục điểm và sao giữ độc lập ở từng màn.
- Hangar sáu nhánh, giá ×1,45 theo cấp và trần theo hành tinh; độ bền quyết định HP/sát thương khi cất cánh; sửa đầy, sửa nhanh, Repair Kit, dock khẩn cấp. Cửa hàng 10 booster, giảm giá ngày UTC, tối đa 3 booster trừ khi cất cánh.
- Credits riêng trong game: thắng, thưởng sao, thưởng boss lần đầu, replay 70%/55%, thua 25%. Không có mua Credits bằng tiền thật, quảng cáo hoặc IAP.
- Phòng luyện tập: Enemy Lab (đường bay/số lượng), wave đã mở, pha boss; tốc độ 70/85/100%, tua lại 10 giây; không thưởng/hao mòn. Mutator tối đa hai, tổng thưởng tối đa 80%.
- Daily ba lượt/ngày UTC, SL30; weekly cùng boss/seed SL30; Endless và Boss Rush SL40 mở sau màn 100; New Game+ có tiến trình riêng và tăng HP enemy/D/Credits.
- Ghost kỷ lục cá nhân gần nhất khi cùng seed; skin hoán đổi palette; Blueprint mở Striker/Bulwark/Courier; 30 mục Archive mở theo mini-boss, Gauntlet ba sao và boss.
- Luồng menu → bản đồ → chuẩn bị → chơi → kết quả → sửa chữa/chuẩn bị; dialog toàn màn hình mobile, desktop 92vh. Launcher không hiện lời mời cài PWA trong lúc chơi.

## Lưu và Supabase

`bridge.saveGameState` dùng bản lưu riêng từng tài khoản hiện có của ArcadeX, bao gồm campaign, ví Credits, nâng cấp, kho, cài đặt và replay lượt bay. Reload dựng lại mô phỏng từ seed/config/input; không tin snapshot vị trí/HP do client cung cấp. Bản cũ của Cosmic chỉ có gameplay tạm thời, không có campaign để chuyển đổi; giữ dữ liệu tài khoản/kỷ lục launcher, bắt đầu campaign v2 ở màn 1.

Migration `202610110008_cosmic_defend.sql` tạo vé lượt chơi chuẩn hóa, RLS theo chủ sở hữu, giới hạn ngày và RPC top100. Điểm chỉ được công bố bởi `cosmic-verify`, chạy lại chính engine/data của frontend. Client không có quyền gọi `cosmic_accept` hay sửa điểm. Server lấy tên từ danh tính tài khoản chính thức. Replay encode 6 byte/entry (frame uint16, x uint8, y uint16, mask uint8); không bị mất tọa độ 256–304. Hồi sinh và chủ động kết thúc cũng là sự kiện replay.

Các bảng đã xác thực hiện có: Daily, weekly, Endless, Boss Rush. Campaign/planet là kỷ lục cá nhân đồng bộ qua save, chưa phải bảng campaign toàn cầu được xác thực. Không đưa bảng generic của launcher thành bảng Cosmic được xác thực.

Lượt có vé nhưng mất mạng được xếp hàng tối đa 10 lượt và tự gửi lại khi có mạng, đúng tài khoản. Vé hết hạn sau 24 giờ. Lượt bắt đầu hoàn toàn offline không có vé server nên chỉ giữ kỷ lục local. Credits/nâng cấp trong bản lưu cloud là dữ liệu client; không được xem là ví kinh tế có tính bảo mật giao dịch.

## Triển khai backend

Frontend đã cấu hình public Supabase URL/key của dự án. Chưa áp dụng migration/Edge Function vào production vì phiên làm việc chỉ có public key, không có quyền quản trị triển khai. Không đặt service_role vào VITE hoặc gửi khóa bí mật qua chat.

Cách dùng giao diện web (không cần dòng lệnh):

1. Mở Supabase Dashboard của project `whjatkhhupeqfngakmee`, vào SQL Editor. Mở file `cosmic-defend-upgrade.sql` trong gói backend, sao chép toàn bộ và chạy. Database cần có các migration nền ArcadeX. Migration này chạy một lần; nếu đã áp dụng bằng CLI thì không chạy lại bundle.
2. Vào Edge Functions, tạo/deploy function bằng editor với tên **`cosmic-verify`**. Sao chép toàn bộ `cosmic-verify/index.ts` trong gói backend vào editor. Đây là bundle tự chứa engine và campaign; không dùng index.ts ngắn của source để dán riêng.
3. Tắt kiểm tra JWT ở gateway cho function này nếu Dashboard có tùy chọn **Verify JWT**. Function tự xác thực Bearer token bằng `auth.getUser` và kiểm tra chủ tài khoản/vé; không dựa vào tên tài khoản do client gửi. Cấu hình này hỗ trợ publishable key mới. Các biến Supabase server tiêu chuẩn do runtime cung cấp; tuyệt đối không đưa `service_role` vào frontend.
4. Upload nội dung ZIP website lên hosting static, phục vụ HTTPS và fallback SPA về `index.html`. Không mở index.html trực tiếp từ ổ đĩa. Chưa có địa chỉ hosting được cung cấp, nên chưa có link chơi công khai mới.
5. Đăng nhập thật, chơi Daily/weekly; kiểm tra kết quả được verifier chấp nhận và xuất hiện trên bảng top100. Backend đã kiểm tra trong môi trường cô lập, chưa kiểm tra end-to-end trên production.

Dành cho người quản trị dùng CLI: trong checkout đã liên kết đúng project, chạy `supabase functions deploy cosmic-verify --project-ref whjatkhhupeqfngakmee --no-verify-jwt`. Source canonical import engine/data từ `src/games/cosmic-defense`, nên deploy từ toàn bộ checkout. Có thể tái tạo bundle bằng `node scripts/export-cosmic-backend.mjs /output/cosmic-verify/index.ts` sau `npm ci`. Mọi thay đổi engine/data ảnh hưởng replay cần phiên bản pack mới; không trộn vé khác phiên bản.

## Độ phủ GDD và việc cần hoàn thiện trước phát hành

Đây là một bản nâng cấp có thể chơi, không phải chứng nhận Release Candidate theo checklist 50 tuần trong tài liệu.

- Wave và boss dựa theo cấu trúc/chủ đề GDD, một số quỹ đạo và chi tiết pattern đã được rút gọn. Chưa có Wave Editor kéo thả; chưa chứng minh mọi wave đạt chính xác ngân sách TP, 16 lần tiếp xúc, hoặc hành lang liên tục theo toàn bộ mục 24. Chưa đủ playtest người thật để chốt cân bằng 100 màn/khoảng 115 lượt cày.
- Endless/Boss Rush giới hạn phiên mô phỏng/xếp hạng 10 phút trong bản này. Endless thật sự không giới hạn cần replay theo segment/checkpoint, thay vì tăng thời gian mà phá giới hạn encode/CPU.
- Ghost hiện chỉ là kỷ lục cá nhân gần nhất; chưa có ghost bạn bè/top10 và tùy chọn chia sẻ. Archive có nội dung ngắn theo bối cảnh GDD, chưa phải 30 đoạn văn được biên tập riêng đầy đủ.
- Chưa có bảng campaign/planet/bạn bè/quốc gia, League hay vùng lân cận thứ hạng. Các chế độ xếp hạng chuẩn hóa hiện tách khỏi tiến trình campaign và ví client.
- Bộ asset không có nhạc/SFX/voice/font. Font VT323 chính thức (SIL OFL) đã bổ sung; hiệu ứng dùng audio engine hiện có của launcher. Chưa có soundtrack thích ứng riêng cho 10 hành tinh/lồng tiếng LUMI.
- Hiện UI tiếng Việt; chưa đủ bản địa hóa tiếng Anh, ba bảng màu trợ năng, tùy chỉnh cỡ chữ/nút, hoặc profile 8 thiết bị Android/iOS thật. Không có dashboard telemetry; hit/wave được ghi trong mô phỏng để phục vụ kiểm tra, chưa gửi analytics.
- Canvas đang dùng mảng có giới hạn, chưa có object pool toàn diện. Có nearest/pixel rounding; khung responsive có thể phóng không nguyên ở kích thước lẻ. Asset gốc do script tạo, GDD tự xác định là art prototype cần họa sĩ tinh chỉnh.
- Không suy diễn từ test headless thành bảo đảm 60 FPS/độ trễ cảm ứng trên thiết bị thật. Cần kiểm tra mobile Safari, máy yếu, hiệu năng verifier, độ khó boss cuối và kinh tế trong playtest.
