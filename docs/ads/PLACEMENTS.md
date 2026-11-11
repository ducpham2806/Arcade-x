# Vị trí quảng cáo đề xuất

Ngày 11/11/2026, dựa GameCatalog/App của main9061bfd. [Mock tương tác](../../review/ads-placement-proposal.html) là wireframe; [plan kỹ thuật](GOOGLE-ADS-PLAN.md). Chưa gắn Google SDK hoặc sửa giao diện production.

## Desktop

```text
Header
Banner game nổi bật / Chơi ngay
Lợi ích + đoạn giới thiệu gốc
[AD-L1: section quảng cáo responsive]
Chơi gần đây
Thư viện / tìm kiếm / thể loại
8 thẻ game đầu
[AD-L2: vị trí thử sau pilot, full width]
Các thẻ còn lại
Support / footer / privacy / contact
```

AD-L1 tham chiếu 728×90 hoặc 970×90 khi container cho phép, không ép creative sai kích thước. AD-L2 responsive theo unit được cấu hình. Không lẫn vào card có nút Chơi, carousel hay hàng filter. Khoảng đệm 32px quanh vùng CTA là đề xuất UX cần kiểm, không phải quy định Google cho mọi trang.

## Điện thoại

```text
Header
Banner / Chơi ngay
Giới thiệu hữu ích
Chơi gần đây
Thư viện / tìm kiếm / thể loại
8 thẻ game đầu, hai cột
[AD-L2: theo chiều rộng thực]
Các game còn lại
Footer
Mobile navigation cố định, giữ safe area
```

Mobile mặc định chỉ L2, không L1 hoặc banner bám đáy. Màn 320px có padding không chứa vừa unit 320px: tính chiều rộng thật, chọn responsive unit hợp lệ hoặc ẩn không request. Nhãn “Quảng cáo” trung tính; không dùng hình/nút play khiến tưởng là game.

## Hướng dẫn và gameplay

AD-G1 nằm sau nội dung/cách chơi đã biên tập, trước phần mẹo nâng cao. Guide có giá trị và nút Chơi thật; không bắt đi qua trang toàn ads để vào game. Pilot một slot mỗi guide, khi đủ nội dung và site Ready.

Khi activeGameId khác null, không còn launcher ads. Canvas, joystick, pause/resume, login/chat, room/queue, loading/result không có slot. Offline/consent deny/adblock/no-fill không cản chơi; flag off không để khung mẫu trên production.

Mock có thể bật hai vị trí desktop để duyệt bố cục, không đại diện pilot bật thật. Bấm “Đang chơi” để thấy thiết kế không có ads; đó không phải Tank thật.
