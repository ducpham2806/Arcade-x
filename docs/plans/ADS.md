# Quảng cáo Google — readiness trước bật thật

Ngày 11/11/2026. Chủ dự án yêu cầu thêm vị trí kiếm tiền, xác nhận chưa có AdSense/site Ready. Commerce hoãn; ads là module riêng. [Plan](../ads/GOOGLE-ADS-PLAN.md), [vị trí](../ads/PLACEMENTS.md), [mock](../../review/ads-placement-proposal.html).

## Lựa chọn

Giai đoạn 1 dùng AdSense display manual ngoài gameplay. Không mua traffic bằng Google Ads, chưa bật Auto ads phủ SPA. H5 interstitial/rewarded cần approved AdSense và quyền H5 riêng, là AD-05 tùy chọn. Lượt plan không gắn SDK/ads thật.

| Task | Trạng thái / phụ thuộc | File đích và điều kiện xong |
|---|---|---|
| AD-01a account/domain | WAITING owner | Chọn domain, tạo/thêm site và xác minh; lưu status Google thật, không bịa publisher ID |
| AD-01b nội dung | READY | About/Contact/Privacy, guide HTML public hữu ích, art/license, robots/canonical; liên hệ owner xác nhận |
| AD-02a policy/loader | READY sau chốt layout | src/ads/config.ts, policy.ts, loader.ts, AdProvider/AdSlot.tsx: flag off, consent/context gates, StrictMode single-flight; lỗi ads không cản chơi |
| AD-02b slots | READY cùng AD-02a | GameCatalog/CSS: desktop L1, mobile L2 sau tám card; G1 sau khi có guide. Ảnh 320–1440px, không che nút/điều hướng |
| AD-03 bật thật | WAITING site Ready, ID, CMP, lịch phát hành | Publisher/unit đúng owner, verification/ads.txt theo phương thức chọn, consent phù hợp; một slot pilot; không live ads trong CI/preview |
| AD-04 đo | Sau AD-03 | AdSense RPM/revenue/viewability và game entry/performance; thêm vị trí sau 7–14 ngày dữ liệu, không hứa doanh thu |
| AD-05 H5 | BACKLOG, quyền Google và scope user | Natural break solo/opt-in rewarded, pause/mute/resume đúng callback; không giữa PvP, không thưởng click display; XP/xu chung chờ receipt |

## Hợp đồng vị trí

- L1 sau carousel/benefits và đoạn nội dung gốc, trước recent/library; mặc định desktop.
- L2 section full width sau tám thẻ All Games; mặc định mobile; search/favorites/empty/≤8 thẻ thì ẩn.
- G1 trong guide hữu ích; không popup chi tiết ngắn hoặc màn chỉ có links.
- Không display ads trong game/canvas/joystick, lobby/queue/ready, loading/countdown, login/chat/pause/result/error. activeGameId khác null → dỡ slot, không request mới.
- Pilot mỗi context một slot; mock có thể hiện hai để duyệt. Kích thước theo container, không nhét creative320px vào container288px.
- Flag off/config thiếu/consent deny/offline/no-fill/adblock không cản chơi; không khung mẫu production. Không refresh bằng timer/filter/re-render.

## Kiểm và gate

Unit policy + fake provider; loader single-flight/StrictMode, no-fill/timeout/navigation. Browser 320/390/768/1280/1440px không overflow/overlap, vào game dỡ ads; smoke24game/save/offline; motion khi sửa CSS chung. Đo CLS/LCP/INP và byte bên thứ ba. Full CI trước merge code; placeholder không chứng minh Google đã serve.

Nguồn Google: [game pages](https://support.google.com/adsense/answer/2768340?hl=en), [H5 signup](https://developers.google.com/ad-placement/docs/signup), [CMP](https://support.google.com/adsense/answer/13554116?hl=en), [site approval](https://support.google.com/adsense/answer/12169212?hl=en). Đọc lại trước implementation; owner tự nhập account/payment/KYC, không đưa secret vào chat.

Làm AD-01b và AD-02 mock trong lúc chờ Google; không chặn Snake hoặc đòi bật commerce. Tài liệu và mock hoàn tất không đồng nghĩa runtime ads đã tích hợp.
