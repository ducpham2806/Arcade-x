# Quy Chuẩn Lập Trình Gameplay (`rules/gameplay-rules.md`)

Áp dụng cho toàn bộ mã nguồn thuộc phân hệ Gameplay (`src/gameplay/**`, `entities/**`, `Assets/Scripts/Gameplay/**`, `Source/**/Gameplay/**`).

## 1. Tách Biệt Dữ Liệu (Data-Driven Parameters)
- **Cấm Hardcode Số Liệu**: Không viết cứng các con số sát thương, thời gian hồi chiêu (cooldown), tốc độ di chuyển, bán kính đòn đánh hay tỷ lệ rơi đồ trực tiếp bên trong hàm xử lý.
- **Sử dụng Resource / Data Table**: Mọi thông số cân bằng phải được khai báo qua biến `@export` (Godot `Resource`), `ScriptableObject` (Unity), `UDataAsset` (Unreal) hoặc đọc từ bảng JSON đã xác thực tại `assets/data/`.

## 2. Độc Lập Tốc Độ Khung Hình (Frame-Rate Independence)
- Mọi phép tính dịch chuyển liên tục, lực vật lý, bộ đếm thời gian hồi chiêu hoặc suy giảm trạng thái trong vòng lặp phải nhân với biến thời gian khung hình (`delta`, `Time.deltaTime`, `DeltaSeconds`).

## 3. Cấm Phụ Thuộc Ngược Lên Giao Diện (Zero Direct UI References)
- Các script Gameplay và Entity tuyệt đối không được gọi trực tiếp tới cây node UI (ví dụ: cấm dùng `get_node("/root/HUD/...")` hoặc giữ tham chiếu trực tiếp tới thanh máu trên màn hình).
- Khi máu, linh lực, cooldown hoặc trạng thái thay đổi, chỉ phát tín hiệu qua `EventBus` hoặc Signal cục bộ để tầng UI tự lắng nghe và cập nhật.

## 4. Va Chạm & Máy Trạng Thái Rõ Ràng
- Sử dụng cặp `HitboxComponent` và `HurtboxComponent` trên các lớp vật lý (Physics Layers) tách biệt thay vì tính khoảng cách hình học thủ công cho mọi thực thể trong mỗi khung hình.
- Mọi hành động có thời gian chuẩn bị (Startup), gây sát thương (Active) và thu chiêu (Recovery) phải đi qua máy trạng thái (State Machine) để xử lý chính xác trường hợp bị ngắt chiêu (Interrupt/Stun) hoặc hủy chiêu (Dash Cancel).
