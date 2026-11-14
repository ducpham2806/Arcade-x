# S2 · Mũi tên boss gọi tơ/cột là điểm yếu · 14/11/2026

Nguồn trước sửa2ca0b3c, RendererChromium390×844. Đã merge PR34/main533c0e7, chưa deploy vì Netlify HOLD theo user. [QA](../../../docs/qa/SNAKE-FINISH-2026-11-14.md).

1. Vào boss, qua2lần húc sangpha2 và đi xa tơ trái để hiện mũi tên offscreen.
2. Target là tơ nhưng nhãn luôn ĐIỂM YẾU. Sangpha3, targetcộtA/B cũng bị gọi như vậy; khi thiếu độ dài vẫn chỉ cột thay vì thức ăn cần thu.

Mong đợi: minimap/mũi tên cùng chỉ mục tiêu phù hợp nhiệm vụ. Bản sửa presentation-only chọn TƠ, ĂN TÁO, CỘT A/B, ĐIỂM YẾU khi mở và CỔNG sau thắng. Lấy thức ăn khả dụng gần nhất, fallback thức ăn hồi nếu cần; không sửa Engine.objectiveTarget, trạng thái/simulation/digest. Unit kiểm nhãn+tọa độ+purity và rendererfixture6cảnh đã xem. Ảnhfixture không phải human playtest hoặc proof người mới đã hiểu boss.
