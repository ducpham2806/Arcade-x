# Đánh giá Blossom Blast: Nature's story (01/11/2026)

> **Mốc tài liệu lịch sử:** các trạng thái/giới hạn bên dưới thuộc thời điểm báo cáo. Hiện trạng 06/11/2026 và việc tiếp theo ở [PROJECT-PLAN](PROJECT-PLAN.md); PR #16 đã merge vào main c705100. Không dùng câu “chưa merge/deploy” cũ để suy ra trạng thái hiện tại; production vẫn cần xác minh trực tiếp.

Game `hex-match` (`src/games/hex-match/`, khoảng 12.500 dòng gồm mã và dữ liệu). Đây là bản đánh giá đầu tiên chạy bằng skill `/game-review`.

## Nguồn đánh giá
- **Dữ liệu màn:** bundle `blossom/levels.ts` rồi lập bảng cho cả 100 màn chính, 14 màn phụ và màn hằng ngày.
- **Bot mô phỏng có sẵn:** `scripts/blossom-simulate.ts`, bot C, 30 ván mỗi màn, tổng 3.000 ván.
  - Bot không đại diện cho người chơi thật. Tỉ lệ thắng chỉ dùng để **so sánh giữa các màn**, sai số khoảng ±9 điểm phần trăm mỗi màn.
- **Chơi trên bản build qua launcher** bằng Playwright, ở 3 kích thước: điện thoại dọc 390×844, điện thoại ngang 844×390, desktop 1280×760.
  - Đi qua màn mở đầu, phần hướng dẫn và màn 1.
  - Đo độ trễ sau mỗi lần chạm.
  - Chụp màn hình ở từng bước.
- **Đọc mã:** `index.tsx`, `engine.ts`, `levels.ts`, lớp `src/accessibility/readability.js`, danh sách asset, các test trong `tests/blossom`.
- **Chưa làm:**
  - nghe âm thanh;
  - chơi tay qua màn 1;
  - thử trên máy thật;
  - đo FPS khi hiệu ứng lớn nổ.

## Điểm mạnh
- **Nội dung dày:**
  - 100 màn, 10 chương, mỗi chương có boss.
  - 14 màn phụ (Vườn thử thách), màn hằng ngày.
  - Khu vườn trang trí, mở từ màn 15.
  - Truyện tranh mở chương, 2 ngôn ngữ.
- **Cơ chế phong phú:**
  - 5 vật phẩm đặc biệt (Ong ngang/dọc, Bom Hoa, Cầu Vồng, Mặt Trời);
  - 9 loại chướng ngại (cỏ dại, đá, kén, băng, dây leo, sâu, bom giờ, mật ong, sương);
  - hạt giống, cổng, màn đếm giờ.
- **Giới thiệu cơ chế đều đặn:** từ màn 11 đến màn 72, cứ khoảng 3–10 màn lại có một cơ chế mới.
- **Phản hồi nhanh:** chạm xong 75–180 ms là bàn sẵn sàng lại. Có gợi ý, đổi chỗ miễn phí, hoàn tác và rung.
- **Popup hoàn thành rõ ràng:** sao, điểm, thưởng lượt dư, xu. Có ghi chú "hỗ trợ chưa dùng đã được hoàn trả".
- **Hướng dẫn tốt:** coach "Bibi hướng dẫn" khoá bàn từng bước và có nút bỏ qua.
- **Công cụ phát triển tốt:**
  - seed xác định;
  - 4 loại bot và bộ mô phỏng cân bằng;
  - kiểm định seed (`tests/blossom/seed-audit.json`);
  - 64 test Playwright.

## Vấn đề khi chơi
1. **Khối nền đen phủ chữ khắp nơi** (lỗi hiển thị, nặng nhất).
   - Các phần bị phủ: tiêu đề "Mỗi bông hoa, một phép màu.", số màn, hàng sao, tên chương, nhãn và số Lượt/Điểm/Combo, "CHƯƠNG 1 · Màn 1", ví xu.
   - Nguyên nhân: `readability.js` (hàm `backgrounds()`) thấy ảnh nền khu vườn ở phần tử cha. Nó coi mọi nhãn chữ là "chữ trên ảnh" nên tự đặt `background-color: #111c2d` và chữ trắng.
   - Hậu quả: giao diện màu kem bị loang lổ khối đen, dù chữ gốc vốn đã đủ tương phản.
2. **Dòng debug hiện cho người chơi:** "3 nhóm hợp lệ · trộn miễn phí 0/3 · seed 1294459280" ngay dưới bàn chơi (`index.tsx:1406`).
3. **Bố cục khi chơi chưa tận dụng màn hình.**
   - Điện thoại ngang 844×390: bàn chơi chỉ còn khoảng 180 px; Lượt/Điểm/Combo bị đẩy khỏi khung, phải cuộn.
   - Desktop 1280×760: hàng công cụ (Ghép đôi, Gợi ý) bị cắt ở đáy.
   - Thanh launcher và thanh logo Blossom chồng nhau, chiếm khoảng 150 px chiều cao.
4. **Chương 1 quá dễ.**
   - Bot thắng 83–100% và luôn đạt 3★.
   - Chạm **ngẫu nhiên** 6 lần đã thắng màn 1 với 3★ (1.543/600 điểm).
   - Người chơi gần như không phải suy nghĩ trong 10 màn đầu.
5. **Đường độ khó răng cưa, có đỉnh đột ngột.**
   - Màn 26/28/29 thắng 43/40/27%, ngay giữa chương 3 (trung bình 63%), khó ngang chương 9–10.
   - Màn 58 chỉ 27% giữa chương 6 (trung bình 57%).
6. **Boss chưa phải cao trào.**
   - Ở cả 10 chương đều có ít nhất một màn thường khó hơn boss.
   - Chênh lớn nhất: chương 3 (màn 29 thắng 27%, boss 77%), chương 6 (27% so với 50%), chương 8 (40% so với 60%).
   - Cả 10 boss chung một dạng "đánh boss N HP", HP chỉ tăng dần từ 18 lên 35.
7. **Số lượt chênh mạnh, không báo trước.** Màn 23 và 46 có 4 lượt, màn 19 và 42 có 5 lượt, nằm xen giữa các màn 20–30 lượt. Có thể đó là màn đố có chủ ý, nhưng giao diện không báo trước (đây là suy luận, chưa chơi tay).
8. **Hết cơ chế mới sau màn 72.**
   - Chương 9–10 (20 màn) chỉ ghép lại chướng ngại cũ.
   - Một số cơ chế xuất hiện rất ít:
     - thả hạt chỉ có ở 4 màn (23, 26, 29 rồi tới tận 87);
     - cổng ở 4 màn;
     - kén làm mục tiêu 1 lần, sương làm mục tiêu 2 lần.
   - Mục tiêu combo và hộp quà có trong engine nhưng chỉ dùng ở màn phụ.
9. **Asset nặng.**
   - 338 PNG, tổng 15,4 MB, chưa có WebP; các game khác đã chuyển, Neon Run giảm được 48%.
   - Sheet hiệu ứng lớn nhất 0,7–1,0 MB mỗi file.
   - Âm thanh thêm 3,3 MB.
10. **Test không chạy trong CI.**
    - 64 test Playwright (`npm run test:blossom`) không có trong `.github/workflows/ci.yml`.
    - `test:fast` không có test engine nào cho Blossom; chỉ có smoke chung trong `test:games`.

## Số liệu level design theo chương

Tỉ lệ thắng là của bot C, 30 ván mỗi màn.

| Ch | Bàn | Màu | Lượt | Thắng TB | Màn khó nhất | Boss (HP · thắng) | Cơ chế mới |
|---|---|---|---|---|---|---|---|
| 1 | 5x5–7x7 | 4 | 10–18 | 94% | 2 (83%) | 18 · 93% (màn trước 97%) | — |
| 2 | 7x7 | 4 | 5–24 | 73% | 17 (53%) | 27 · 67% (màn trước 67%) | Cỏ dại (11) |
| 3 | 7x7–8x8 | 5 | 4–26 | 63% | 29 (27%) | 27 · 77% (màn trước 27%) | 5 màu (21), Đá (22), Thả hạt (23), Kén (25) |
| 4 | 8x8 | 5 | 10–26 | 64% | 38 (50%) | 26 · 53% (màn trước 63%) | Băng (32), Đếm giờ (33), Dây leo (34) |
| 5 | 8x8–8x9 | 5 | 4–28 | 60% | 46 (47%) | 28 · 50% (màn trước 70%) | Sâu (42), Cứu bạn (43), Cổng (44) |
| 6 | 8x9–9x9 | 5 | 6–30 | 57% | 58 (27%) | 24 · 50% (màn trước 63%) | Bom giờ (52) |
| 7 | 9x9 | 5 | 10–33 | 53% | 68 (40%) | 30 · 43% (màn trước 63%) | Mật ong (62) |
| 8 | 9x9 | 6 | 8–32 | 56% | 78 (40%) | 32 · 60% (màn trước 83%) | 6 màu (71), Sương (72) |
| 9 | 9x9 | 6 | 16–38 | 48% | 88 (33%) | 33 · 43% (màn trước 57%) | — |
| 10 | 9x9 | 6 | 10–39 | 46% | 97 (30%) | 35 · 43% (màn trước 43%) | — |

**Cơ cấu mục tiêu ở 100 màn chính:**
- Thu hoa: 31 màn; điểm: 26; băng: 16; boss: 10.
- Cỏ dại 8, cứu bạn 8, đá 7, sâu 7, mật ong 7, bom giờ 6, dây leo 5, thả hạt 4, sương 2, kén 1.
- 9 màn đếm giờ (33, 36, 56, 66, 73, 75, 78, 84, 95).

**Kết luận:** độ khó tăng chủ yếu nhờ bàn to hơn, nhiều màu hơn và nhiều chướng ngại chồng lên nhau. Sau màn 72 không còn ý tưởng mới. Chương 1 quá dễ, rồi có những đỉnh khó lạc nhịp (26–29, 58). Boss chưa phải khoảnh khắc khó và đáng nhớ nhất của chương.

## Đề xuất

**Ưu tiên cao**
- **B1. Bỏ khối nền đen trên chữ.** Sửa `backgrounds()` trong `readability.js` để bỏ qua ảnh trang trí ở phần tử cha khi giữa chữ và ảnh đã có một lớp nền đặc. Nếu không được, cho khung Blossom tự quản độ tương phản (`data-readability=off`) và thêm test kiểm định tương phản cho chữ của Blossom. Cần kiểm tra các game khác có ảnh nền xem có cùng lỗi không.
- **B2. Ẩn dòng seed và số nhóm hợp lệ**, chỉ hiện trong chế độ review hoặc QA.
- **B3. Bố cục khi chơi:**
  - gọn thanh tiêu đề trong trận;
  - khi xoay ngang, đặt HUD và công cụ cạnh bàn chơi;
  - trên desktop, bàn chơi cùng công cụ phải nằm gọn trong 760 px.
  - Kiểm tra ở 390×844, 844×390, 820×1180, 1280×760.
- **B4. Đưa test vào CI:**
  - test engine (luật nhóm, đặc biệt, chướng ngại, mục tiêu) chạy bằng Node trong `test:fast`;
  - một nhóm test Playwright then chốt (vào game, hướng dẫn, thắng màn 1, popup) vào CI.

**Ưu tiên trung bình**
- **B5. Chỉnh đường độ khó bằng bot.**
  - Đặt vùng tỉ lệ thắng mục tiêu cho từng chương, ví dụ chương 1 khoảng 80–90%, giảm dần còn khoảng 45–55% ở chương 10.
  - Làm phẳng màn 26–29 và 58.
  - Boss là màn khó nhất chương.
  - Thêm test hồi quy so với `balance-results`.
- **B6. Đổi PNG sang WebP** như Neon Run (lossless giữ đúng alpha). Dự kiến 15,4 MB còn khoảng 6–8 MB.
- **B7. Dùng lại cơ chế hiếm:**
  - thả hạt, cổng, kén, sương ở chương 6–10;
  - đưa mục tiêu combo và hộp quà vào màn chính;
  - thêm một biến tấu mới cho mỗi chương 9 và 10.
- **B8. Báo trước màn ít lượt** (nhãn "Màn đố · N lượt" ở màn chuẩn bị), hoặc tăng lượt nếu bot cho thấy quá gắt.

**Nâng cấp lớn**
- **B9. Boss riêng mỗi chương:** đòn đánh hoặc chướng ngại gắn với chủ đề chương (băng ở Núi Tuyết, sương ở Thung Lũng Đom Đóm), có 2 pha.
- **B10. Nội dung theo mùa và hằng ngày:** dùng bộ hoa mùa sẵn có (Tết…), chuỗi ngày, bảng xếp hạng màn hằng ngày.

## Làm trước
1. **B1 + B2:** sửa hiển thị nhanh, người chơi thấy khác biệt ngay.
2. **B3:** bố cục khi chơi ở điện thoại ngang và desktop.
3. **B4:** đưa test của Blossom vào CI trước khi chỉnh độ khó (B5) và cơ chế (B7).

## Đã làm (01/11)
- **B1 + B2:**
  - `readability.js` không còn tự đặt nền đen chỉ vì có ảnh ở phần tử cha. Điểm ảnh chưa biết được tính trong khoảng đen–trắng; nền đen chỉ thêm khi không màu chữ nào đạt chuẩn trên cả hai cực.
  - Lớp phủ kem của Blossom chuyển vào nền gốc để readability nhìn thấy nó.
  - Kết quả: 0 nhãn bị phủ nền ở màn bản đồ và màn chơi, ở cả 3 kích thước. Dòng seed chỉ còn trong bản review.
- **B3:**
  - Bàn chơi lấy kích thước theo chiều cao thật của khung (container query).
  - Màn rộng và thấp chuyển sang 2 cột (bàn trái, HUD và công cụ phải). Điện thoại ngang ẩn thanh logo khi chơi.
  - Bàn: 844×390 tăng từ 187 lên 314 px; 1280×760 tăng từ 365 lên 577 px và công cụ không còn bị cắt; 390×844 giữ 366 px.
  - Ở 320×568 bàn còn 211 px (trước 250 px nhưng tràn và phải cuộn); giờ HUD, bàn và công cụ vừa một màn hình.
- **B4:**
  - `test:blossom-engine` (21 test logic) chạy trong `test:fast`.
  - `test:blossom-ui` (8 bộ, 55 test, khoảng 2,7 phút) thêm vào CI, gồm bộ mới `layout-v9` kiểm tra bố cục, nền đen và dòng seed.
  - Sửa một race của test đồng hồ trong `ui.test.ts` (hỏng khoảng 1/6 lần cả trước thay đổi).
  - 3 bộ cũ vẫn hỏng (`branding-integration`, `launcher`, `standalone`; lý do ghi trong README), chưa đưa vào CI.
