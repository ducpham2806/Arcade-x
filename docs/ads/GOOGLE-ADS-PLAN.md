# Quảng cáo Google cho ArcadeX — plan 11/11/2026

## Sản phẩm và lựa chọn

Mục tiêu là Google trả tiền cho vị trí hiển thị trên website. Chọn **Google AdSense**, không phải Google Ads/Ads Manager để mua traffic. Chủ dự án xác nhận chưa có AdSense hoặc site chưa được duyệt. Chưa có publisher ID/slot ID; plan và mock không gọi Google SDK hay phục vụ quảng cáo thật.

| Phương án | Đánh đổi | Quyết định đề xuất |
|---|---|---|
| Display AdSense, vị trí chủ động ngoài game | Kiểm soát bố cục tốt; ít inventory hơn ads trong game | Giai đoạn 1 |
| Auto ads phủ SPA | Ít code ban đầu; khó giữ vị trí khi SPA chuyển sang game | Chưa bật; nếu thử sau cần exclusion và kiểm riêng |
| H5 Games Ads / Ad Placement API | Interstitial/rewarded tại khoảng nghỉ; cần quyền sản phẩm riêng | AD-05 tùy chọn sau |
| AdMob | Phù hợp luồng app/mobile riêng | Không dùng cho website PWA hiện tại |

H5 là sản phẩm xét duyệt riêng và yêu cầu approved AdSense [G5]. Không bọc display ad trong modal để giả preroll hoặc rewarded ad.

## Vị trí

[Bố cục](PLACEMENTS.md), [mock tương tác](../../review/ads-placement-proposal.html). Mock là wireframe đề xuất, không phải screenshot production.

| ID | Điểm chèn theo code hiện tại | Phạm vi |
|---|---|---|
| AD-L1 | GameCatalog.tsx: sau carousel/benefits và một đoạn giới thiệu gốc, trước recent/library | Leaderboard responsive ở desktop; mặc định ẩn trên mobile |
| AD-L2 | GameCatalog.tsx: section riêng, full width sau tám thẻ đầu của All Games | Vị trí đầu tiên nên thử trên mobile; ẩn khi ≤8 thẻ, search/favorites/empty |
| AD-G1 | Trang public /huong-dan/<game>/, sau nội dung/cách chơi thực | In-article responsive; chỉ khi đã có trang đủ giá trị, không đặt trong popup chi tiết ngắn |

Pilot bật **một vị trí cho mỗi context** trước: L1 desktop, L2 mobile; chỉ thêm tối đa hai slot trên một trang đủ nội dung sau khi đo. Đây là giới hạn sản phẩm đề xuất, không phải hạn mức Google. Thư viện chỉ có link card và whitespace không mặc định đủ publisher content [G6,G7]; AD-01 phải kiểm nội dung trước khi bật ở launcher.

Không đặt display ads trong canvas/viewport game, room/queue/ready, loading/countdown, pause/result, login/reset password, chat/UGC, error/offline hoặc empty search. Không có banner cố định chồng mobile nav/joystick/nút Chơi. Khi activeGameId khác null, mọi launcher display slot phải được dỡ khỏi giao diện.

## AD-01 — readiness và xét site

1. **Account/domain:** owner tạo AdSense, chọn site đang kiểm soát và xác minh theo phương thức Google cung cấp. Chốt arcade-x.netlify.app hay custom domain trước canonical/verification. Không khẳng định domain miễn phí chắc được duyệt hoặc custom domain là bắt buộc; kiểm trực tiếp trong Sites.
2. **Nội dung thực:** About/Contact/Privacy/Cookies phản ánh Auth/cloud/chat/analytics/ads thật. Liên hệ/tên tổ chức do owner xác nhận. Hướng dẫn chơi có mục tiêu, điều khiển, mẹo đã kiểm và screenshot có quyền dùng; không bịa nội dung hoặc nhồi chữ để xin duyệt.
3. **Crawl:** ưu tiên hướng dẫn Nối Từ, Tank, Car Escape, Shikaku, Word Cross. Xuất static/prerender HTML `/huong-dan/<slug>/index.html`, không login; title/canonical/link game và liên kết từ launcher. Không dùng lại path asset public/games làm router. Chưa cần đổi framework.
4. **Verification/ads.txt:** dùng đúng meta/code/ads.txt Google đưa ra. Nếu chọn ads.txt, đặt record publisher thật ở `/ads.txt`, HTTP 200 text/plain, không bị SPA fallback nuốt. Google khuyến nghị ads.txt chứ không bắt buộc chung; plan chọn làm để sẵn sàng [G1,G2]. Không publish ID mẫu.
5. **Consent:** chọn CMP phù hợp traffic. Personalized ads tại EEA/UK/Switzerland cần CMP được Google chứng nhận, tích hợp TCF [G3]. Không tự viết banner rồi coi là đủ; không mặc định non-personalized ads loại mọi nghĩa vụ cookie. Rà đối tượng trẻ em/nội dung hướng trẻ em nếu áp dụng.
6. **Review:** kiểm license nguồn/art, giữ chat/UGC ngoài inventory; robots/CSP không chặn crawler hợp lệ; nội dung công khai không bị login wall. Lưu trạng thái Sites và thông báo Google thật. Không hứa ngày duyệt hay doanh thu.

**AC:** có URL HTML hữu ích, privacy/contact chính xác, nội dung là trọng tâm, mọi ID thuộc owner. Google duyệt site là gate bên ngoài, không thay bằng lint hoặc mock.

## AD-02 — phần code sẽ triển khai

File đề xuất: `src/ads/{config,policy,loader}.ts`, `src/ads/{AdProvider,AdSlot}.tsx`, `src/ads/ads.css`; chèn slot ở GameCatalog, kiểm session/modal trong App. `VITE_ADS_ENABLED=false` mặc định; publisher/slot config tách mọi VITE_RENTAL flag. Những file runtime này **chưa được tạo trong lượt lập plan**.

### Policy và vòng đời

- Eligibility: site/slot được bật, config hợp lệ, nội dung đủ điều kiện, consent cho phép, online, launcher/guide, không modal che và không activeGameId. Không bắt login chỉ để đọc nội dung hoặc xem quảng cáo.
- Provider tách progression/reward/commerce. Loader một promise/một client ID; chỉ load khi đủ điều kiện; StrictMode/retry không chèn hai script.
- Slot reserve kích thước theo container trước request; không request lúc width bằng 0 hoặc hidden. Một request cho lifecycle hợp lệ; filter/search/scroll/re-render không remount để tăng impression. Không timer refresh hoặc retry vô hạn để săn fill.
- Vào game hoặc mở modal/auth: dỡ slot, không phát request mới. Script đã load có thể còn trong document; không hứa chặn mọi kết nối nội bộ của SDK. Không chỉnh creative/iframe Google.
- Adblock/no-fill/SDK fail/timeout/consent deny không chặn Chơi/save/online. Placeholder chỉ ở mock/dev; flag off trên production không chừa khung trống.
- Hạn chế CLS: reserve slot đúng. Không collapse đột ngột khi người chơi đang chạm gần slot; dọn ở lần chuyển view hoặc ngoài viewport theo UX đã kiểm. Không để creative gây overflow.
- PWA không precache Google ads/creative/response cá nhân; offline vẫn chơi, không dùng creative cache làm ảnh fallback.
- CSP dùng đúng các domain SDK/CMP cần, không wildcard. Không đưa email, UID, JWT, room code hoặc save vào ad request/custom analytics. Không tự click quảng cáo để test.

### Kiểm thử

- Unit policy: flag off/config thiếu/offline/denied hoặc unknown consent/in-game/modal/empty không eligible; chỉ đúng context/slot được phép.
- Fake provider/loader: single-flight và StrictMode, duplicate push, lỗi/retry có giới hạn, width 0, điều hướng vào/thoát game, filter không request lại.
- Browser 320/360/390/768/1280/1440px: không overflow/overlap; mock no-fill/adblock/mạng chậm; input game vẫn đúng; dỡ slot khi chơi. Giữ smoke 24 game, save/offline và motion nếu sửa CSS chung.
- Đo CLS/LCP/INP và byte trước/sau, ghi riêng request bên thứ ba. Budget app JS không chứng minh SDK quảng cáo miễn phí băng thông.
- Full CI trước merge code; ảnh placeholder không là bằng chứng Google đã serve. Chưa duyệt thì flag vẫn off.

## AD-03 — bật thật sau site Ready

Owner cung cấp publisher ID/ad unit ID công khai, không cần đưa mật khẩu Google. Xác minh site/consent/ads.txt bằng request và dashboard. Manual display, loại trừ game/chat/auth, Auto ads vẫn off trong pilot. Bật một slot trên production vào thời điểm được chọn; không phục vụ ads thật trong CI/deploy preview.

Kiểm request/render/status, không click ads; console/no-fill/error, consent theo vùng, game/save/online không bị gián đoạn. Theo dõi 48–72 giờ đầu và tổng hợp 7–14 ngày trước thêm vị trí. Đây là khoảng quan sát đề xuất, không cam kết Google phân phối quảng cáo.

Đường dừng: tắt slot/config và build/deploy đã được duyệt; có thể dừng ad unit trong AdSense nếu phù hợp nguyên nhân. Không đổi commerce/DB để tắt ads, không tự rollback site deploy.

## AD-04 — đo hiệu quả

AdSense: page views, ad impressions, coverage/viewability, revenue và RPM đúng đơn vị. App: lượt vào game, tỷ lệ thoát, thời gian chơi, LCP/CLS/INP; consent và aggregation phải có trước analytics. Không hook click creative để tự đếm click.

Chỉ ước tính khi có dữ liệu: `page views / 1000 × page RPM` hoặc `ad impressions / 1000 × impression RPM`; không trộn hai loại RPM, không cam kết thu nhập. A/B sau pilot chia cohort/context hợp lệ, không refresh creative.

## AD-05 — H5 tùy chọn sau

Chỉ thực hiện khi owner chọn và Google cấp quyền H5. Dùng Ad Placement API thật; approved display không đồng nghĩa được dùng H5. Natural break sau khi xong màn solo hoặc trước ván mới, không chen giữa PvP/ready countdown. Callback trước ads pause/mute đúng; end/no-fill/error resume một lần; giới hạn tần suất theo cấu hình và UX đã kiểm.

Rewarded là opt-in, mô tả phần thưởng trước khi chọn; cấp đúng callback và chỉ một lần, không thưởng vì click display ads. Không đổi thành tiền/gói thuê/quà cash hoặc lợi thế PvP. XP/xu chung vẫn tắt tới khi có receipt/backend phù hợp. Có thể chọn tiện ích solo riêng sau; plan chưa chốt game hoặc mức thưởng.

## Nguồn Google đã đọc 11/11/2026

- G1 [Thêm và xác minh site](https://support.google.com/adsense/answer/12169212?hl=en).
- G2 [Ads.txt guide](https://support.google.com/adsense/answer/12171612?hl=en).
- G3 [CMP cho EEA/UK/Switzerland](https://support.google.com/adsense/answer/13554116?hl=en).
- G4 [Display ads trên trang game](https://support.google.com/adsense/answer/2768340?hl=en): Google khuyến nghị cách game ít nhất 150px hoặc bỏ khỏi trang chơi. ArcadeX chọn ẩn khi chơi; không coi 150px là bảo đảm đủ mọi policy.
- G5 [Đăng ký H5 Games Ads](https://developers.google.com/ad-placement/docs/signup).
- G6 [Screen thiếu nội dung](https://support.google.com/publisherpolicies/answer/11112688?hl=en).
- G7 [Ads không lấn át nội dung](https://support.google.com/publisherpolicies/answer/11169917?hl=en).
- G8 [Privacy required content](https://support.google.com/adsense/answer/1348695?hl=en).
- G9 [Eligibility](https://support.google.com/adsense/answer/9724?hl=en).

Đọc lại tài liệu Google lúc tích hợp. Đây là phương án triển khai, không là xác nhận ArcadeX đã đủ điều kiện hoặc được duyệt.
