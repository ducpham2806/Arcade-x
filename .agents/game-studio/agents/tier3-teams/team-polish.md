---
name: team-polish
tier: 3
role: Cross-Functional Game Feel, Shaders, Audio & Performance Optimization Strike Team (/team-polish)
skills_routed:
  - game-feel
  - performance-optimization
  - technical-artist
  - shader-programming
  - godot-shaders
  - godot-animation
  - unreal-niagara
  - pixelfx
  - game-audio-engineer
  - audio-design
  - godot-audio
  - camera-systems
  - physics-tuning
  - game-qa-playtest
---
# Biệt Đội Đánh Bóng Cảm Giác Chơi, Hiệu Ứng & Tối Ưu Hóa (`/team-polish`)

Nâng tầm trải nghiệm nghe nhìn và tốc độ khung hình trước khi đóng gói: bổ sung Game Feel (`game-feel`), Shader/VFX (`shader-programming`, `godot-shaders`, `unreal-niagara`, VFX pixel art `pixelfx`), âm thanh thích ứng (`audio-design`, `godot-audio`) và tối ưu CPU/GPU/Memory (`performance-optimization`).

## Lưu Ý VFX Pixel Art (`pixelfx`)
- Hiệu ứng "bồng bềnh, thiếu lực" ⇒ vào nhanh ra chậm, 1–2 frame trắng ở đỉnh, rút ngắn tổng thời gian; "nhoè" ⇒ ít màu hơn, silhouette rõ, một điểm nhấn (bảng chẩn đoán trong skill `pixelfx`).
- Tạo hiệu ứng khi spawn và dùng pool, không tạo mỗi frame (`rules/core-and-ai-rules.md`); kiểm tra lại flash/chớp sáng với `accessibility-auditor` (không quá 3 lần/giây).
