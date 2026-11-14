# Snake R01 · nghiệm thu bản hoàn thiện · 14/11/2026

Bản kỹ thuật đã merge PR34 vào main533c0e7; Netlify HOLD theo chủ dự án. PR35 đang bổ sung checkpoint và sửa test CI sau merge, không đổi runtime. [QA kỹ thuật](../qa/SNAKE-FINISH-2026-11-14.md), [thẻ Snake](../plans/SNAKE.md). Bản public vẫn8320385; khi được yêu cầu phát hành phải xác nhận Published/SHA mới; không dùng một phiên bản khác để ký nghiệm thu.

## Môi trường và vai trò

- Người điều phối ghi commit/build, model thiết bị, hệ điều hành/browser/version, viewport thực, loại mạng và ngày kiểm. Người chơi mới chưa đọc hướng dẫn giải màn hoặc biết cơ chế boss trước.
- Dùng profile trình duyệt riêng cho lượt mới; giữ nguyên profile/save đang dùng của người chơi. Chỉ thử mất mạng/xóa profile thử trên dữ liệu thử riêng.
- Android Chrome và iPhone Safari là hai lượt trên thiết bị thật. Desktop Chromium, emulation và automation là bằng chứng bổ sung, không ký thay hai lượt này.
- Chạy bản local nếu cần: `npm ci`, `npm run dev -- --mode snake-catalog --port 4368 --strictPort`, mở URL Vite. Điện thoại cần một URL được cấp quyền truy cập thực; localhost của máy tính không phải địa chỉ của điện thoại. Netlify preview hiện có bảo vệ, không đổi bảo vệ để thử guest. Sau phát hành, dùng đúng bản production mới.

## Lượt người chơi mới

Đưa game và đề nghị người chơi bắt đầu một lượt. Ghi thao tác đầu tiên, thời gian tự tìm được điều khiển/mục tiêu, chỗ họ dừng hoặc yêu cầu trợ giúp và các lần chết. Để UI tự hướng dẫn; ghi rõ mỗi lần người điều phối đã nhắc hoặc can thiệp.

Bảng dưới dành cho người điều phối đối chiếu sau lượt chơi, không đọc trước lời giải cho người mới:

| Màn | Điều cần quan sát |
|---|---|
| 1-1 | Hiểu lái liên tục, thu5táo và nhận ra cổng đã mở |
| 1-2 | Hiểu giữ/thả Dash, hồi năng lượng, độ dài và điều kiện sao |
| 1-3 | Đọc hàng rào, va chạm và lối tới cổng |
| 1-4 | Phân biệt quả tím/độc với thức ăn có lợi |
| 1-5 | Hiểu mục tiêu8hoa và tiến độ HUD |
| 1-6 | Nhận ra công tắc chốt/cửa mở, tiếp tục tới cổng |
| 1-7 | Đọc được3cầu/nước, thất bại có đường chơi lại rõ ràng |
| 1-8 | Đọc bộ đếm thời gian, quả vàng và cơ hội tìm ngọc |
| 1-9 | Hiểu nhện/tơ và mục tiêu của màn |
| 1-10 | Hiểu3pha, tutorial, tơ/cộtA-B/điểm yếu/Dash, cổng sau khi hạ boss |

Sau mỗi màn kiểm kết quả/sao, Chơi lại/Màn tiếp theo và mở khóa. Sau thắng màn bất kỳ: thoát/reload, kiểm thành tích còn và tiếp tục đúng màn. Sau xong chương: tổng màn/sao đúng, chơi lại được, không có lỗi chặn tiến trình. Nếu dừng giữa màn, kiểm Tiếp tục từ checkpoint; đổi tài khoản không thấy checkpoint/thành tích của người khác.

## Lượt thiết bị, hình và âm thanh

- Dọc/ngang, notch, thanh trình duyệt, đa chạm joystick+Dash, nhả một ngón, mất focus/chuyển ứng dụng/khóa màn hình rồi quay lại; không kẹt input và có tạm dừng/tiếp tục rõ.
- Âm thanh opt-in bằng gesture, mức âm tương đối, mute, pause, thử âm, chơi lại/thoát; nghe bằng thiết bị thật. Ghi cụ thể SFX/nhạc/đoạn nào khó nghe hoặc gây khó chịu.
- Quan sát Tiểu Xà, food/props, nhện/boss, telegraph/VFX ở kích thước gameplay; ghi asset/cảnh được duyệt hoặc lỗi cụ thể. Không ký art/animation final chỉ vì ảnh đã tải được.
- Đo frame time/FPS theo cảnh thường, boss và hiệu ứng; ghi công cụ/mẫu đo và thiết bị. Kiểm bộ nhớ/tài nguyên qua nhiều lần vào/thoát. Không dùng cadence headless làm cam kết60FPS trên điện thoại.

## Phiếu kết quả (điền khi thực hiện)

| Trường | Kết quả thực tế |
|---|---|
| Build/commit, ngày, người điều phối | Chưa thực hiện |
| Thiết bị/OS/browser/mạng | Chưa thực hiện |
| Người mới, đã biết game trước hay chưa | Chưa thực hiện |
| Thời gian tới thao tác đầu tiên, cần trợ giúp ở đâu | Chưa thực hiện |
| Màn đã chơi, lần chết, chỗ hiểu sai/cần nhắc | Chưa thực hiện |
| Restore/input/đa chạm/background | Chưa thực hiện |
| Art/animation/audio được duyệt và lỗi còn lại | Chưa thực hiện |
| FPS/frame time/bộ nhớ và mẫu đo | Chưa thực hiện |
| Bug/ảnh/video đã che dữ liệu cá nhân | Chưa thực hiện |
| PASS/FAIL/WAITING và người nghiệm thu | WAITING |

Đóng R1a/R1b khi đủ kết quả thực tế và các lỗi chặn đã được sửa/kiểm lại. Một lượt automation10màn không phải human playtest M2. Bản art/audio hiện có tiếp tục là ứng viên cho tới khi được nghiệm thu trên thiết bị.

## Backend/JWT thật là lượt riêng

Theo [runbook](UI-SAVE-RUNBOOK.md), cần disposable actor/grant/rewards disabled và kế hoạch cleanup; secret qua runtime binding, không gửi password/token vào chat hoặc commit. Preflight14/11 trảWAITING_BINDINGS trước network vì thiếu email/password/actorID/xác nhận grant. Chưa chạy live hoặc kiểm issuer expiry thật. Kiểm này không tự cấp quyền SQL/production/backend và không bị thay bằng các fixture CI đã xanh.

## Chạy lại kiểm kỹ thuật tự động

- `npm run test:snake-player`:3ca public account/checkpoint/settings/keyboard, Auth fixture local. CI chạy và giữ ảnh/JSON.
- `npm run test:snake-campaign-browser`: tối đa10màn bằng pointer/keyboard và thời gian thật, khoảng10–15phút trên máy kiểm. Tự chạy Vite4364 và chỉ dùng Auth fixture. Không dùng lệnh này với tài khoản thật.
- Mỗi lượt thắng giữ `browser-state.json` và report trong `test-results/snake-campaign-browser/` (hoặc SNAKE_CAMPAIGN_EVIDENCE). Nếu driver thua ởmàn sau, `npm run test:snake-campaign-browser -- --resume` khôi phục đúng state đã kiếm được để kiểm tiếp; chỉ dùng cùngsource, không tự sửa JSON/thành tích. Lịch sử failure vẫn phải báo, không gọi kết quả là thắng liên tục ởlượt đầu.
- Đây là kiểm chức năng/luồng UI tự động. Cadence driver, tuyến lái và thời gian chờ đều là cấu hình test, không được sửa physics hoặc giảm độ khó chỉ để runner thắng. R1b vẫn cần người mới theo phiếu ởtrên.
