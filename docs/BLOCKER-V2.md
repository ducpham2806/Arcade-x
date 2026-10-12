# Xếp Gạch Color Pop v2

Bản nâng cấp ngày 11/10/2026. Game ID `blocker` được giữ để tương thích launcher và bản lưu. Ảnh người dùng cung cấp được dùng làm tham khảo bố cục; đồ họa gạch/VFX mới được tạo bằng CSS, không chép ảnh screenshot thành asset.

## Hai chế độ chính

**Chơi tự do:** bàn 8×8, không đồng hồ/giới hạn lượt, được kết thúc bất cứ lúc nào. Khi hết chỗ, có một lần cứu bàn miễn phí và có thể dùng booster đã kiếm được. Không bắt buộc sử dụng booster để kết thúc/nhận thưởng.

**Hành trình:** 10 vùng × 10 màn = 100 màn. Qua màn trước để mở màn kế; vùng sau không yêu cầu phải cày đủ 3 sao. Mỗi màn kết hợp một mục tiêu với một luật; không biến các luật thành thêm chế độ chính ở menu.

| Mục tiêu | Cách đạt |
|---|---|
| Điểm | Đặt khối, xóa hàng, combo, thu sao và phá băng |
| Xóa hàng/cột | Tổng số hàng và cột hoàn chỉnh |
| Thu sao | Xóa các ô có sao; búa cũng thu sao |
| Phá băng | Xóa hàng có băng để phá lớp băng; gạch còn lại cần xóa lần nữa; búa cũng phá băng |
| Combo | Một lượt xóa ≥2 hàng hoặc lượt xóa trong chuỗi từ thứ hai |

Luật: thư giãn không giới hạn; giới hạn lượt; giới hạn thời gian. Năm màn đầu không có đồng hồ. Màn combo cho giữ chuỗi qua các lượt không xóa để học cách nối combo. Thời gian 4–6 phút 15 giây; giới hạn lượt 40–79. Pause, tab ẩn, dialog và pause launcher đều dừng đồng hồ. Nếu vừa đạt mục tiêu ở lượt cuối, game tính thắng trước khi kiểm tra giới hạn.

Các target, seed và ngân sách cụ thể có trong `levels.json`/`levels.csv` của gói review. Target tăng theo vùng, có màn nhẹ xen kẽ. Các màn thu sao sau vùng đầu đã được tăng target để tránh chỉ cần một lần xóa là thắng.

## Cách giảm độ khó

- Bỏ khối vuông 3×3 và thanh dài 5 ô. Vùng đầu dùng nhóm khối nhỏ; về sau thêm T/Z/L 5 ô.
- Khay sinh dựa trên bàn đang chơi, ưu tiên khối ≤3 ô khi bàn chật; có ít nhất một khối nhỏ mỗi đợt. Dùng mô phỏng đường đặt để chọn khối có khả năng đặt nối tiếp, thay vì ngẫu nhiên hoàn toàn. Đây không phải chứng minh mọi thứ tự đặt đều an toàn.
- Xoay khối và gợi ý luôn miễn phí, không giảm sao. Gợi ý chọn vị trí có lợi cho xóa hàng/sao/băng.
- Kéo thả hoặc chọn khối rồi chạm ô góc trên trái. Preview hợp lệ xanh, không vừa đỏ; cảm ứng nhấc preview 42px khỏi ngón tay. Pointer cancel không đặt khối.
- Một lần cứu bàn miễn phí mỗi lượt, dọn vùng 3×3; được tính là một booster khi tính sao.
- Thử lại màn không mất xu và không có mạng vẫn chơi được.

## Điểm và combo

| Sự kiện | Điểm |
|---|---:|
| Mỗi ô đặt thành công | 10 |
| Mỗi hàng/cột xóa | 120 |
| Mỗi hàng từ thứ hai trong một lần xóa | +80 |
| Mỗi sao thu được | +20 |
| Mỗi lớp băng phá bằng xóa hàng | +30 |

Phần điểm xóa/sao/băng nhân combo: `1 + 0,25 × min(4, max(0, chuỗi − 1))`, tối đa ×2. Điểm đặt khối không nhân. Một ô giao nhau giữa hàng và cột chỉ thu sao/phá băng một lần. Búa tính tiến độ sao/băng, nhưng không cộng điểm hay hàng/combo.

## Sao và xu

- 1 sao: đạt target.
- 2 sao: đạt target và dùng tối đa 2 booster.
- 3 sao: dùng tối đa 1 booster và còn ít nhất 20% thời gian/lượt. Màn thư giãn dùng ngân sách tham chiếu `24 + 8 × số vùng` để tính hiệu quả; hết ngân sách này không thua.
- Sao tốt nhất và điểm tốt nhất được giữ độc lập; chơi lại kém hơn không giảm thành tích.
- Qua lần đầu: `100 + 10 × (vùng − 1) + 20 × sao` xu, tối đa 250 xu.
- Chơi lại: 20 xu + 20 xu cho mỗi sao mới cải thiện.
- Tự do: `floor(điểm / 80)` xu, tối đa 300 mỗi lượt. Không thưởng xu chiến dịch khi thua.
- Bắt đầu có 200 xu, 2 búa, 2 đổi khay và 3 hoàn tác. Mỗi lượt có ID, thưởng được kết toán một lần, không nhận lại bằng reload.

Xu này là **ví riêng Xếp Gạch**, khác xu launcher. Không có nạp tiền, quảng cáo hay thanh toán. Có thể kiếm đủ để dùng booster qua chơi bình thường.

| Booster | Giá | Tác dụng |
|---|---:|---|
| Búa cầu vồng | 60 | Dọn vùng 3×3 do người chơi chọn, thu sao/phá băng |
| Đổi khay | 80 | Sinh ba khối phù hợp với bàn |
| Quay lại | 50 | Hoàn tác lượt đặt cuối, giữ thời gian đã trôi và chi phí booster |

Hoàn tác chỉ giữ snapshot trong phiên mở hiện tại; reload khôi phục bàn/khay/tiến độ, nhưng không phục hồi snapshot hoàn tác cũ.

## Đồ họa và trải nghiệm

Nền sáng, màu kẹo, ô có bevel, sao dễ thấy, băng khác vật liệu. Xóa hàng tạo burst theo màu ô và chữ điểm/combo nổi; thưởng không bật modal giữa lượt. Có tùy chọn giảm chuyển động và tôn trọng `prefers-reduced-motion`. Dùng SFX hiện có của app, không bổ sung nhạc mới. Cửa hàng/help/kết quả full-screen mobile; desktop 92vh, nội dung cuộn riêng.

## Lưu, Supabase và tương thích

Bản lưu v2 gồm bàn/khay/RNG/mục tiêu/đồng hồ, sao, điểm tốt nhất, xu và inventory. Dùng `bridge.saveGameState` cùng cơ chế save theo tài khoản của ArcadeX; người đăng nhập đồng bộ qua `game_sessions` hiện có. Khách lưu trên thiết bị. Không có migration hay Edge Function mới cần cài cho bản này. Database cần đã có cấu trúc nền ArcadeX.

Bản lưu v1 hợp lệ được chuyển về lượt tự do, giữ bàn, khay và điểm. Kỷ lục cũ `blocker_best` trong tài khoản đang hoạt động được giữ. Chơi lại từ kết quả launcher không xóa campaign/ví.

Đây là save do client ghi, không phải ví có xác thực giao dịch trên server. Chưa thêm bảng xếp hạng xác thực cho luật mới; kết thúc phiên vẫn dùng cơ chế điểm launcher hiện có. Khi làm thanh toán hoặc leaderboard cạnh tranh cần tách mode và xác thực replay/wallet server, không coi save này là số dư có thể mua/bán.

## Mã nguồn chính

- `src/games/blocker/engine.ts`: luật, phát khối thích ứng, 100 màn, điểm/sao, booster/gợi ý.
- `src/games/blocker/save.ts`: validate/migrate/save, ví và thưởng một lần.
- `src/games/blocker/index.tsx`, `blocker.css`: flow, pointer/touch, timer, UI/VFX.
- `tests/product/blocker-v2.spec.ts`: kiểm tra engine và browser, 100 màn bằng bot hợp lệ.
- `GameWrapper.tsx`: giữ tiến trình khi replay, cho menu game cuộn cảm ứng.

## Chơi và đưa lên hosting

`ARCADEX-BLOCKER-V2-WEBSITE.zip` chứa build toàn bộ website, gồm các nâng cấp game trước đó. Upload nội dung lên hosting static HTTPS có SPA fallback về index.html; không mở trực tiếp index.html bằng file://. Vào launcher → Xếp Gạch → chọn một trong hai chế độ. Sau khi tải lần đầu trên HTTPS, PWA cache đủ file để vào và chơi offline.

Chưa có URL hosting/quyền triển khai trong phiên này nên chưa phát hành link công khai mới. Không cần nhập thêm khóa bí mật để chơi local/offline; không đưa service_role vào frontend.
