# Quy Chuẩn Giao Diện, Dữ Liệu & Đa Ngôn Ngữ (`rules/ui-and-data-rules.md`)

Áp dụng cho phân hệ Giao diện (`src/ui/**`, `ui/**`), Dữ liệu (`assets/data/**`, `resources/**`) và Chuỗi văn bản.

## 1. Giao Diện Chỉ Đóng Vai Trò Quan Sát (Observer UI Pattern)
- Các thành phần UI/HUD chỉ nhận dữ liệu hiển thị thông qua tín hiệu từ `EventBus` hoặc `ViewModel`/`StatsComponent` và gửi yêu cầu thao tác của người chơi xuống tầng hệ thống.
- UI tuyệt đối không tự lưu trữ hay tự ý cộng/trừ lượng máu, tiền tệ, vật phẩm hoặc điểm kinh nghiệm gốc của người chơi.

## 2. Sẵn Sàng Đa Ngôn Ngữ (Localization Readiness)
- Không gắn cứng chuỗi văn bản hiển thị cho người chơi vào sâu trong logic xử lý nếu dự án hướng tới phát hành đa ngôn ngữ; ưu tiên sử dụng khóa dịch (`TR_UI_*`, `TR_SKILL_*`, `TR_DLG_*`).
- Các khung chứa văn bản (Buttons, Labels, Dialogue Boxes) phải co giãn linh hoạt (Auto-sizing / Containers) để chịu được độ giãn nở chiều dài chữ từ 30%–40% giữa tiếng Việt, tiếng Anh và các ngôn ngữ tượng hình.

## 3. Tính Toàn Vẹn Của File Dữ Liệu & Cảnh (Data & Scene Integrity)
- Mọi file JSON trong `assets/data/` phải đúng cú pháp chuẩn, thống nhất quy ước đặt khóa `snake_case`, và khớp định danh với `design/registry/entity-registry.md`.
- Tuyệt đối không chỉnh sửa file nhị phân của Engine (`*.uasset`, `*.umap`) dưới dạng văn bản thuần. Khi chỉnh sửa file cảnh dạng văn bản (`*.tscn`, `*.tres`), phải bảo toàn đúng cấu trúc `ext_resource` và `sub_resource`.
