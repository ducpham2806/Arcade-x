# Đánh giá Neon Run · Luma Chronicles (31/10/2026)

Nguồn: dữ liệu 40 màn và mã `public/standalone/neon-run/game.js` (bản build v0.14), chơi thử màn 1 trên desktop và điện thoại, bot vật lý `tests/neon/routes.cjs` (đi hết 40/40 màn, 42 ca ablation). Chưa chơi tay hết 40 màn; nhận xét về màn sau dựa trên số liệu.

## Điểm mạnh
- Pixel art đẹp, có hồn; sprite Néo và Pip có cá tính; mở màn bằng truyện tranh đặt bối cảnh nhanh.
- Vật lý tốt: chạy 230 px/s, nhảy cao theo thời gian giữ (≈79 px), coyote 0,11 s, nhớ lệnh nhảy 0,13 s, lướt 77 px.
- Có kiểm tra tự động cho mọi màn, lưu tiến trình theo tài khoản.

## Vấn đề khi chơi
1. **Không có âm thanh** (không nhạc, không hiệu ứng).
2. **Thiếu phản hồi:** không rung màn hình, không khựng hình khi đạp quái/đánh boss, không combo xu.
3. **Dễ chạy quá mục tiêu rồi phải quay lại:** ở màn 1, chạy thẳng sẽ bỏ qua "Đèn mái nhà" và đụng cổng đóng. Thời gian mục tiêu chỉ tương đương 30–48 px/s so với tốc độ chạy 230 px/s.
4. **Nút cảm ứng hiện cả trên desktop**, che cảnh.
5. **Mobile ngang (844×390):** joystick đè lên vị trí nhân vật lúc xuất phát; vùng chơi chật.
6. **12 MB PNG** (175 file, lớn nhất ≈690 KB) cộng 640 KB JS; các game khác đã dùng WebP.

## Level design: số liệu
| Thông số | Quan sát |
|---|---|
| Độ dài | Tăng đúng 260 px mỗi màn (3.600 → 13.740 px) |
| Kẻ địch | Luôn bằng số màn + 1 (2 → 41) |
| Độ khó | `difficultyRank` bằng số màn; thời gian mục tiêu tuyến tính 126 → 287 s |
| Cấu trúc | Số phòng bằng số thế giới + 1; hoán vị từ 8 loại phòng |
| Gợi ý | 160 phòng, chỉ 8 câu gợi ý |
| Thử thách phụ | 40/40 màn đều là "thu 3 ký ức" |
| Bẫy | Cả game có đúng 1 bẫy |
| Gió, băng chuyền, rượt đuổi | Có code, 0 màn dùng |
| Encounter | Rỗng ở cả 40 màn dù có 41 KB art |
| Kẻ địch | 5 loài; thế giới 5 không có loài/cơ chế mới; phạm vi tuần tra rất hẹp |
| Boss | 5 boss chung một khuôn (arena 900 px, cùng vòng chờ → báo hiệu → đánh → hở lõi), máu 3–5 |
| Checkpoint | Cách nhau 1.800–2.600 px; màn cuối ≈5 phút |
| Truyện | 12 cảnh cho 40 màn; ≈30 màn không có nhịp truyện |

Kết luận: độ khó tăng tuyến tính bằng độ dài và số quái, không bằng ý tưởng mới; sau màn 25 không còn cơ chế mới; thiếu khoảnh khắc đáng nhớ.

## Đề xuất
**Ưu tiên cao**
1. Âm thanh: nhạc theo thế giới và ≈12 hiệu ứng, nối với nút tắt/bật của launcher.
2. Phản hồi: khựng hình 60–80 ms, rung nhẹ khi boss đánh, bụi đáp đất, chuỗi xu; tôn trọng `lowFx`.
3. Bớt quay lại: mục tiêu nằm trước cổng trên đường chính, hoặc báo trước từ xa, hoặc camera nhìn trước.
4. Ẩn điều khiển cảm ứng khi dùng bàn phím/chuột.
5. Mobile ngang: nhân vật không nằm dưới joystick; chỉnh cỡ/độ mờ nút; zoom gần hơn.
6. Đổi PNG sang WebP (dự kiến 12 MB → 3–5 MB); tải trước theo thế giới.

**Ưu tiên trung bình**
7. Phá đường thẳng độ khó: màn ngắn 60–90 s xen kẽ, màn nghỉ sau boss, màn cuối ≈3 phút, checkpoint mỗi 1.200–1.500 px.
8. Dùng các hệ thống sẵn có: gió (thế giới 4), băng chuyền (thế giới 3), bẫy theo nhịp, encounter, màn rượt đuổi cuối thế giới.
9. Cơ chế và quái riêng cho thế giới 5; 1–2 loài quái mới mỗi thế giới.
10. Thử thách phụ đa dạng: không trúng đòn, giới hạn thời gian, không lướt, phòng bí mật.
11. Gợi ý theo ngữ cảnh.

**Nâng cấp lớn**
12. Boss riêng mỗi thế giới, 2–3 pha gắn với môi trường.
13. Thoại ngắn Néo–Pip mỗi màn; ký ức mở dần truyện phụ.
14. Bảng thời gian theo màn, chế độ thử thách thời gian, trang phục mở theo sao.

**Làm trước:** (1) âm thanh + phản hồi, (2) luồng quay lại và điều khiển mobile/desktop, (3) làm lại thế giới 1 bằng tay làm khuôn mẫu.

**Lưu ý:** repo chỉ có bản build; nên đưa mã nguồn gốc (Site source `8e1b771`) vào repo trước khi nâng cấp lớn.
