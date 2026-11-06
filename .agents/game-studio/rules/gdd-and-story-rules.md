# Quy Chuẩn Tài Liệu Thiết Kế GDD & User Stories (`rules/gdd-and-story-rules.md`)

Áp dụng cho mọi tài liệu trong `design/gdd/**`, `docs/adr/**`, `production/epics/**` và `production/stories/**`.

## 1. Quy Chuẩn Công Thức & Thông Số Trong GDD
- **Cấm dùng tính từ định tính mơ hồ**: Không viết "hồi chiêu nhanh", "sát thương lớn", "tỷ lệ rơi hiếm" mà không đi kèm giá trị số cơ sở và tên biến cấu hình (ví dụ: `base_cooldown_sec = 1.2`, `damage_multiplier = 2.4`).
- **Kiểm tra Giá trị Biên (Boundary Values)**: Mọi công thức toán học (sát thương, giáp, kinh nghiệm, kinh tế) phải được tính thử ở ít nhất 3 mốc: Đầu game (Level 1), Giữa game và Cuối game (Max Level / Max Stacks) để tránh lỗi chia cho 0 hoặc tăng trưởng vô hạn.
- **Đối chiếu Thực thể (`entity-registry.md`)**: Tên chỉ số, trạng thái và sự kiện phải đồng nhất 100% giữa các tài liệu GDD.

## 2. Quy Chuẩn User Story Độc Lập Ngữ Cảnh
- Mỗi file User Story (`production/stories/ST-XXX-<slug>.md`) phải nhúng trực tiếp **Tóm tắt Quyết định GDD & ADR** (công thức, máy trạng thái, đường dẫn file, tín hiệu `EventBus`) vào mục `## Bối cảnh & Thông số Kỹ thuật`.
- Nhờ đó, khi chạy `/dev-story`, kỹ sư lập trình có đủ 100% thông số ngay trong file Story mà không phải đọc lại toàn bộ các file GDD dài hàng chục trang.

## 3. Quy Tắc Đóng Story (`/story-done` & Bằng Chứng Thực Tế)
- Không đánh dấu `DONE` cho bất kỳ Story nào nếu chưa tích đủ các mục trong `Acceptance Criteria`.
- Với các Story có thay đổi hiển thị (UI, Sprite, VFX, Shader, Camera, Animation), bắt buộc phải chạy thử cảnh/game và lưu kết quả kiểm tra trực quan tại `production/qa/evidence/`.
