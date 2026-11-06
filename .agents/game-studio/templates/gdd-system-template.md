# [Tên Hệ Thống] — Game Design Document (GDD)

- **Mã hệ thống**: `SYS-XXX`
- **Phân loại**: `Core | Gameplay | Persistence | Economy | Progression | UI | Audio | Narrative | Meta`
- **Độ ưu tiên**: `MVP (P0) | Vertical Slice (P1) | Content Complete (P2) | Post-Launch (P3)`
- **Trạng thái**: `Draft | In Review | Approved`
- **Hệ thống phụ thuộc (Upstream)**: `[Liệt kê các hệ thống cần có trước]`
- **Hệ thống bị ảnh hưởng (Downstream)**: `[Liệt kê các hệ thống sử dụng đầu ra của hệ thống này]`

## 1. Tổng Quan & Sự Phù Hợp Với Trụ Cột Thiết Kế (Overview & Pillar Alignment)
- **Mục tiêu thiết kế**: Hệ thống này mang lại cảm giác gì cho người chơi?
- **Liên kết Trụ cột (Design Pillars)**: Phục vụ trụ cột nào của dự án?
- **Phân tích MDA**:
  - *Mechanics (Quy tắc/Thao tác)*:
  - *Dynamics (Hành vi phát sinh trong trận)*:
  - *Aesthetics (Cảm xúc người chơi)*:

## 2. Cơ Chế Cốt Lõi & Máy Trạng Thái (Core Mechanics & State Machine)
- **Luồng hoạt động chính**:
- **Bảng chuyển đổi trạng thái (State Transitions)**:

| Trạng thái hiện tại | Điều kiện kích hoạt (Input / Trigger) | Trạng thái tiếp theo | Thời gian (Startup / Active / Recovery) | Có thể hủy chiêu? |
| :--- | :--- | :--- | :--- | :--- |
| `Idle` | Nhấn phím đánh | `Attack_1` | `0.08s / 0.12s / 0.15s` | Có (`Dash`) |

## 3. Thông Số, Công Thức Toán Học & Bảng Dữ Liệu (Parameters & Formulas)
- **Công thức tính toán chính**:
  ```text
  [Viết công thức tường minh, giải thích từng biến số và giới hạn Min/Max]
  ```
- **Bảng kiểm tra giá trị biên (Sample Calculations)**:

| Kịch bản / Cấp độ | Giá trị đầu vào | Kết quả đầu ra | Ghi chú cân bằng |
| :--- | :--- | :--- | :--- |
| Đầu game (Lv.1) | | | |
| Giữa game (Lv.15) | | | |
| Cuối game (Max) | | | |

## 4. Giao Tiếp Hệ Thống & Tín Hiệu (Dependencies & Event Contracts)
- **Tín hiệu phát đi (`EventBus` Emitted)**:
- **Tín hiệu lắng nghe (`EventBus` Subscribed)**:
- **Cấu trúc Resource / JSON lưu trữ**:

## 5. Trường Hợp Biên & Xử Lý Lỗi (Edge Cases & Failure States)
- Bấm hai phím cùng lúc / Nhận sát thương đúng frame tung chiêu:
- Giá trị tài nguyên bằng 0 hoặc tràn giới hạn:
- Mất kết nối / Tải lại giữa chừng:

## 6. Giao Diện, Phản Hồi Thị Giác & Âm Thanh (UI/UX, VFX & Audio Signifiers)
- **Hiển thị trên HUD**:
- **Hiệu ứng hình ảnh (VFX, Hit-stop, Camera Shake)**:
- **Hiệu ứng âm thanh (SFX, Voice Bark)**:

## 7. Các Nút Tinh Chỉnh Dành Cho Designer (Tuning Levers & Economy Sinks/Sources)
- Danh sách các biến `@export` / Resource có thể chỉnh trực tiếp trên Inspector mà không cần sửa code:

## 8. Tiêu Chí Kiểm Thử & Giả Thuyết Prototype (Test Criteria & Hypotheses)
- **Giả thuyết cần kiểm chứng khi chơi thử**:
- **Tiêu chí Đạt / Không Đạt (Pass/Fail Metrics)**:
