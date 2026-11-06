# Quy Chuẩn Hệ Thống Cốt Lõi & AI (`rules/core-and-ai-rules.md`)

Áp dụng cho phân hệ Core Engine (`src/core/**`, `autoloads/**`, `components/**`) và AI (`src/ai/**`, `entities/enemies/**`, `entities/companions/**`).

## 1. Không Cấp Phát Bộ Nhớ Trên Hot-Path (Zero Hot-Path Allocations)
- Trong các hàm chạy mỗi khung hình (`_process`, `_physics_process`, `Update`, `FixedUpdate`, `Tick`) hoặc hàm xử lý va chạm hàng loạt:
  - **Cấm** gọi `new()`, `.instantiate()`, `queue_free()`, `Destroy()`, `load()`, `Resources.Load()`.
  - **Cấm** tìm kiếm node theo đường dẫn hoặc nhóm (`get_node()`, `get_nodes_in_group()`, `FindObjectOfType()`, `GetComponent()`) lặp đi lặp lại mỗi frame; phải lưu đệm (cache) tham chiếu trong `_ready()` / `Awake()`.
- **Bắt buộc dùng Object Pooling**: Các đối tượng sinh/hủy liên tục như Số sát thương bay (Floating Damage Labels), Hiệu ứng chém/nổ (VFX), Đạn đạo (Projectiles) và Hạt chiến lợi phẩm (Loot Orbs) phải lấy từ `ObjectPoolManager`.

## 2. Ngân Sách Hiệu Năng AI & Điều Hướng (AI Performance Budgets)
- **Giãn cách nhịp suy nghĩ (Staggered AI Tick)**: Không chạy thuật toán tìm đường (Pathfinding) hoặc quét tầm nhìn phức tạp ở tần suất 60 lần/giây cho toàn bộ quái vật. Chia nhịp cập nhật AI ở mức 5–10 Hz (mỗi 0.1s – 0.2s) và lệch pha giữa các cá thể.
- **Lực tách bầy (Boids Separation)**: Quái vật cận chiến số lượng lớn phải có vector đẩy tách nhẹ với đồng đội lân cận để bao vây người chơi tự nhiên, không đứng chồng khít lên nhau tại một tọa độ.
- **Khả năng Gỡ lỗi (Debuggability)**: Mọi AI Controller nên hỗ trợ cờ bật/tắt hiển thị trạng thái hiện tại, tầm đánh và vùng báo nguy (`TelegraphZone`) khi chạy ở chế độ Debug.
