# Word Cross v2 — 11/10/2026

Viết lại game tìm từ trong ma trận chữ (word search), giữ tiếng Anh theo game hiện tại. Không chuyển thành ô chữ điền đáp án theo câu hỏi.

## Kho từ và sinh màn

117.597 dạng từ khác nhau, 3–10 chữ cái A–Z; 7.321 từ phổ biến và 110.276 từ mở rộng. Nguồn từ chính `dwyl/english-words`, Unlicense; nguồn, bộ lọc và checksum ở `src/games/word-cross/data/SOURCES.md`, giấy phép ở `data/LICENSE.txt`. Đây là số dạng từ, gồm biến thể số nhiều/chia từ, không phải số nghĩa hay số lemma.

JSON đóng gói với game và precache bằng service worker. Không cần gọi API từ điển hoặc tải kho từ khi đang chơi. Chơi offline sau khi ứng dụng tải và cache lần đầu. Kho dữ liệu giống nhau được seed vào Supabase để máy chủ tạo và kiểm chứng ván xếp hạng.

200 màn; bảng 6×6 (1–25), 8×8 (26–60), 10×10 (61–120), 12×12 (121–200). Từ cần tìm tăng từ 4 đến 12, độ dài tăng từ 3–5 đến 5–10. Các màn 1–120 dùng kho phổ biến; phần nâng cao dùng toàn bộ kho, có thể gặp từ ít quen thuộc.

Ván chiến dịch mới lấy seed ngẫu nhiên từ `crypto.getRandomValues`, trộn thêm số màn. Chọn từ không trùng nhau, không chọn hai từ đảo ngược của nhau; tránh 120 từ vừa gặp. Máy chủ tránh từ trong tối đa 10 ván gần nhất. Kho hữu hạn nên từ có thể gặp lại sau nhiều ván, không cam kết mọi từ vĩnh viễn chỉ xuất hiện một lần. Tiếp tục ván đang dở giữ nguyên seed, bảng và các từ đã tìm.

Sinh bảng theo tám hướng, cho phép giao nhau khi chữ trùng, rồi điền chữ ngẫu nhiên vào ô trống. Nếu không đặt đủ từ sau giới hạn thử, sinh bố cục dự phòng với hàng riêng để bảo đảm đủ từ và luôn giải được. Không âm thầm bỏ bớt mục tiêu.

Thử thách ngày dùng cùng seed UTC và cùng đề cho mọi người (màn cấu hình 91, bảng 10×10, 8 từ, 144 giây). Chơi lại đề ngày giữ nguyên đề; đây là ngoại lệ chủ ý để cạnh tranh cùng bài toán.

## Chế độ và điểm

Năm chế độ được trộn theo màn, cấu hình cố định theo số màn để bảng xếp hạng so cùng cỡ bảng, số từ và chế độ:

- Tự do: không giới hạn thời gian.
- Đếm ngược: thời gian max(90 giây, số từ ×18 giây).
- Chính xác: thua khi số lần chọn sai đạt max(3, ceil(số từ/2)).
- Ẩn chữ: hiển thị chữ đầu/cuối và số ký tự còn lại; không giấu toàn bộ từ không có manh mối.
- Theo thứ tự: chỉ chấp nhận từ tiếp theo đang được đánh dấu.

Chọn theo đường thẳng ngang/dọc/chéo; cả hai chiều đều được nhận. Chọn lại từ đã tìm không cộng điểm/lượt sai. Chọn một ô hoặc hủy kéo không ghi lượt. Lỗi chọn được ghi trong replay. Kéo, chạm hai đầu từ và phím mũi tên/Enter đều được hỗ trợ.

Mốc thời gian chuẩn = số từ ×9 giây + cỡ bảng ×2 giây. Chỉ ván thắng có sao:

- 3 sao: không hint, không chọn sai, trong mốc chuẩn; đếm ngược cần hoàn thành trong 75% ngân sách.
- 2 sao: không hint, tối đa hai lần sai, trong 175% mốc chuẩn.
- 1 sao: các ván thắng còn lại hoặc đã dùng hint.
- Luyện tập không giới hạn sau khi thua: cùng bảng, không sao hoặc xếp hạng.

Điểm = max(100, sao ×1000 + số từ ×100 + max(0,600 − floor(giây) ×2) − lỗi ×40 − hint ×100). Không có hệ số combo tăng vô hạn hoặc thưởng xu/kho báu trong game. Điểm local và điểm máy chủ có thể khác vì xếp hạng dùng thời gian thực.

Hint miễn phí, tự nguyện, hiển thị trọn đường một từ chưa tìm. Không tự đánh dấu từ đã tìm. Lưu số hint và giới hạn sao ở một.

## Lưu và tương thích

Save version 2 dùng GameBridge và cơ chế cloud save hiện có: kết quả từng màn, kết quả ngày, lịch sử từ gần đây, seed, bảng, từ đã tìm, đường chọn, lỗi, hint, thời gian và ticket. Nước đi/kết quả ghi ngay; timer ghi theo giây. Đổi tài khoản giữ cơ chế tách dữ liệu của nền tảng.

Khôi phục kiểm lại bảng bằng generator và phát lại các đường chọn; không phụ thuộc thứ tự key JSON từ PostgreSQL. Save cũ `{level}` giữ các màn đã mở, không tự tặng sao. Kết thúc phiên/chơi lại từ màn tổng kết giữ sao; khởi tạo ván mới thay vì mở lại kết quả đã thắng.

Đồng hồ local dừng khi pause, mở modal, trở về bản đồ hoặc tab ẩn. Xếp hạng tính thời gian thực cả khi pause để không tin thời gian client; ván đếm ngược có thể thắng local nhưng bị máy chủ từ chối nếu thời gian thực đã hết. Giao diện ghi rõ điều này.

Định nghĩa được viết sẵn trước đây vẫn dùng offline cho một phần từ. Từ chưa có nghĩa được ghi rõ; không dựng phiên âm, nghĩa hoặc ví dụ giả. Phát âm phụ thuộc giọng tiếng Anh đã cài trên thiết bị.

## Supabase và bảng thành tích

`word_cross_packs`: pack dữ liệu từ được bảo vệ, không cho client ghi/đọc trực tiếp. `word_cross_runs`: ticket, chủ sở hữu JWT, bảng do máy chủ tạo, cấu hình, thời gian và kết quả. RLS chỉ cho xem ván của chính tài khoản; client không sửa bảng/điểm. API bảng thành tích chỉ trả tên hiển thị và thống kê, không trả email.

`word_cross_start`: kiểm tài khoản dự kiến, người dùng đã đăng nhập, giới hạn 20 lần tạo/phút dưới khóa theo owner; máy chủ chọn seed và tạo bảng bằng generator tương đương client. Nếu offline hoặc API chưa sẵn sàng, chơi ván local và ghi rõ trạng thái.

`word_cross_submit`: khóa ticket, kiểm owner, phát lại đường chọn với tọa độ hợp lệ, kiểm chữ và thứ tự, loại lặp từ, bắt buộc tìm đủ, kiểm giới hạn lỗi và thời gian, tính sao/điểm phía máy chủ. Gửi lại ticket đã hoàn thành trả cùng kết quả. Số hint được client báo; kiểm chứng lời giải không đồng nghĩa chống bot, việc đọc đáp án từ client, hoặc xác thực trợ giúp ngoài game.

Bảng gồm tổng sao chiến dịch, thành tích theo màn và đề ngày; tách có hint/không hint. Chiến dịch tính kết quả tốt nhất mỗi người mỗi màn, tối đa 600 sao. Mỗi bảng theo màn/ngày lấy một kết quả tốt nhất mỗi người. Không dùng bảng điểm Word Cross cũ do client tự khai cho bảng mới; không tạo người chơi giả. Guest/offline có thành tích trên thiết bị.

## Áp dụng và bảo trì

Chưa áp dụng SQL trên Supabase production, chưa phát hành frontend lên hosting công khai.

Nếu đã có các migration nền tảng, identity và launcher: chạy **một lần** `supabase/word-cross-upgrade.sql` trong SQL Editor. Hoặc dùng CLI chạy hai migration `202610110006_word_cross.sql`, `202610110007_word_cross_lexicon.sql`; không chạy cả hai cách. Word Cross không yêu cầu các migration Car Escape để hoạt động.

Sau khi áp dụng trên staging: đăng nhập, bắt đầu ván xếp hạng, giải, xem cả ba bảng và kiểm thử timeout/đổi tài khoản, rồi triển khai frontend. Publishable key có sẵn chỉ dùng từ client, không cho phép assistant quản trị SQL.

Node 24+: `node scripts/export-word-cross.mjs` xuất pack hiện có, SQL bundle và 33 fixture so sánh generator. Không thay pack đã phát hành hoặc ghi đè migration đã áp dụng: dùng pack version/migration mới và cập nhật RPC/client đồng bộ. QC: `docs/WORD-CROSS-QC.md`.
