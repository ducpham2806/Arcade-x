# Shikaku: hành trình học, câu đố hằng ngày và gợi ý suy luận

Nối tiếp bản cải tiến kéo thả, triển khai ngày 12/10/2026. Các chế độ thư giãn và 3 phút, lựa chọn bảng, skin, hoàn tác và lưu ván cũ vẫn dùng được.

## Hành trình học

20 bài được thiết kế bằng các vùng cụ thể, chia thành 4 chương, mỗi chương 5 bài:

| Chương | Kỹ thuật | Cỡ bảng |
|---|---|---|
| Đếm ô | Diện tích, dải đứng/ngang, ô đơn | 4×4 |
| Ghép thừa số | Chiều rộng × chiều cao, đổi hướng | 5×5–6×6 |
| Đọc đường biên | Mép bảng, số lân cận và vùng nhỏ | 6×6 |
| Ghép toàn cảnh | Vùng bắt buộc, vùng còn lại, thử và sửa | 6×6–8×8 |

Hoàn thành bài trước để mở bài tiếp theo. Không cần đủ 3 sao mới tiến tiếp. Sao tốt nhất được lưu theo bài; thưởng 25 xu +15 EXP lần đầu hoàn thành bài. Chơi lại để cải thiện sao không cộng lại phần thưởng lần đầu. Các bài cho phép mọi cách ghép hợp luật; không ép theo đáp án mẫu.

## Gợi ý giải thích trước

Nhấn Gợi ý mở lời giải thích: chỉ ra số ở hàng/cột nào, các cặp thừa số và giới hạn do biên/vùng khác. Nếu số chỉ còn một hình hợp lệ, gọi rõ là vùng bắt buộc. Nếu còn nhiều hình, mô tả đó là lựa chọn cần suy luận, không gọi một nhánh tìm kiếm là vùng bắt buộc.

Người chơi có thể quay lại tự giải hoặc bấm Xem khung gợi ý. Một lượt giải thích và khung của nó chỉ tính một hint. Không hint: 3 sao; 1 hint: 2 sao; từ 2 hint: 1 sao. Hoàn tác miễn phí và không ảnh hưởng sao. Cửa sổ gợi ý dừng đồng hồ chơi 3 phút; đồng hồ xếp hạng máy chủ vẫn chạy.

## Câu đố hằng ngày

Có 4 bảng mỗi ngày, theo độ khó 4×4, 5×5, 6×6, 8×8. Mỗi bảng dùng cùng ngày UTC và pack phiên bản 3 cho mọi người; thay ngày lúc 00:00 UTC, tức 07:00 giờ Việt Nam.

Chơi khách hoặc offline vẫn có đúng bảng đó. Lưu kết quả cá nhân theo ngày/cỡ bảng/phiên bản, thưởng lần đầu, giữ sao tốt nhất. Tải lại giữ câu đang chơi và số hint. Không tự gửi ván luyện tập lên bảng toàn cầu.

Đăng nhập và online khi bắt đầu: máy chủ cấp vé, sinh đúng bảng, ghi các lượt hint và kiểm tất cả hình khi nộp. Nếu không kết nối được, game ghi rõ Luyện tập. Mất kết nối lúc dùng hint sẽ chuyển ván sang luyện tập, giữ kết quả cá nhân. Nếu chỉ gửi kết quả thất bại, giữ vé để thử gửi lại.

## Xếp hạng

Tách theo ngày, cỡ bảng, phiên bản pack và nhóm Tự giải/Có gợi ý. Sắp theo sao giảm dần rồi thời gian máy chủ tăng dần. Một lượt chính thức đầu tiên/ngày/cỡ bảng/tài khoản; bắt đầu lại giữ mốc thời gian ban đầu. Vé hoàn thành được trả cùng kết quả khi nộp lại, không tạo thành tích trùng.

Máy chủ kiểm diện tích, một số trong mỗi hình, ranh giới, chồng lấn và phủ đủ bảng. Không nhận score, stars, elapsed hay số hint do client tự khai. Thời gian tính cả pause, xem hướng dẫn và reload. Đây là kiểm chứng bài giải và lượt hint qua API, không chứng minh người chơi đã tự suy luận mà không dùng công cụ bên ngoài.

## Backend và trạng thái triển khai

File chạy thêm cho dự án Supabase ArcadeX đã có bảng identity:

`supabase/shikaku-upgrade.sql`

Chỉ có một file SQL, không cần Edge Function hoặc thư viện mới. Tạo bảng private `shikaku_runs` với RLS và 4 RPC: start, hint, submit, ranking. Tài khoản được phép dùng RPC của chính mình; khách chỉ xem bảng xếp hạng. Profile/save v2 tiếp tục dùng bridge hiện tại để lưu hành trình và ván.

**Chưa áp dụng SQL lên dự án production và chưa xuất bản website.** Môi trường hiện chỉ có URL và publishable key, không có kết nối quản trị database. Đã thử đọc RPC production nhưng không kết nối được; không coi đó là bằng chứng SQL đang có hoặc chưa có trên máy chủ.

Cách bật trên Supabase: vào SQL Editor của dự án, tạo New query, dán toàn bộ `shikaku-upgrade.sql`, bấm Run. Sau đó đưa build website mới lên hosting. Không đưa khóa quản trị vào frontend hoặc gửi qua chat.

## Kiểm chứng

- Bộ kiểm thử sản phẩm gồm 33 case cho phiên bản này: 20 bài học, 160 mẫu daily, 120 câu ngẫu nhiên cũ, solver/gợi ý bắt buộc so với nhiều lựa chọn, mở khóa/tiền thưởng/stars, cảm ứng, pointercancel, bàn phím, 5 viewport, save migration, tài khoản đăng ký, vé daily/hint/submit, reload, lọc xếp hạng, lỗi kết nối và trạng thái chờ RPC. Các API browser dùng mock, không tài khoản production.
- PostgreSQL trong Docker: 163 assertion gồm 129 kiểm tra nền và 34 kiểm tra Shikaku. 12 golden fixture đối chiếu JSON JS/SQL theo ngày/cỡ; kiểm quyền bảng, chủ vé, input sai, hint retry, submit retry, clock máy chủ và tách các bảng thành tích.
- Chơi bằng browser input qua đủ 20 bài; giữ 60 sao sau reload production offline. Kiểm câu daily, giải thích trước/khung sau và giữ số hint qua reload. Đây là browser automation, không phải nhóm người chơi thật.
- TypeScript và build sản xuất; kiểm Service Worker, tải lại offline.

Bài học và daily có đáp án hợp luật nhưng chưa chứng nhận đáp án duy nhất. Chưa cân bằng bằng thử nghiệm người mới trên điện thoại thật. Bộ giải thích hiện dựa trên diện tích, số ứng viên và tìm kiếm có giới hạn; chưa phân tích mọi suy luận loại trừ nâng cao.
