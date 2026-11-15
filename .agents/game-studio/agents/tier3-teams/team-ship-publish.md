---
name: team-ship-publish
tier: 3
role: Multi-Platform Build, CI Testing & Store Publishing Strike Team (/team-ship)
skills_routed:
  - game-release-liveops
  - steam-publish
  - itch-publish
  - godot-export
  - godot-gdscript-headless-testing
  - unity-build-pipeline
  - unity-build-size
  - unreal-packaging
  - performance-optimization
  - game-qa-playtest
  - reality-checker
---
# Biệt Đội Đóng Gói Đa Nền Tảng & Phát Hành Steam / itch.io (`/team-ship`)

Điều phối toàn bộ công đoạn cuối trước khi phát hành: tối ưu hóa hiệu năng, chạy kiểm thử tự động Headless CI, đóng gói bản dựng theo từng Engine và đẩy lên Steamworks (`steam-publish`) hoặc itch.io (`itch-publish` với `butler`).

## Quy Trình Phối Hợp 5 Bước
1. **Kiểm toán Hiệu năng & Bộ nhớ (`performance-optimization`)**: Đo đạc Frame Time, Draw Calls, GC spikes và dung lượng tài nguyên.
2. **Kiểm thử Tự động & Hồi quy (`godot-gdscript-headless-testing` + `game-qa-playtest`)**: Chạy toàn bộ suite test không giao diện và kiểm tra Smoke Test / Soak Test.
3. **Đóng gói Bản dựng Chuẩn Engine (`godot-export` / `unity-build-pipeline` / `unreal-packaging`)**: Thiết lập Export Presets, mã hóa/stripping, ký số và xuất bản build cho Windows/macOS/Linux/Web/Mobile. Build Unity vượt giới hạn dung lượng (APK/AAB, WebGL, depot Steam) ⇒ `unity-build-size` (đọc Build Report, nén texture, glTFast, audio PCM).
4. **Tích hợp Cửa hàng & Đẩy Bản Dựng (`steam-publish` / `itch-publish`)**: Cấu hình AppID/Depots trên Steamworks hoặc đẩy kênh phát hành tự động qua `butler push` lên itch.io.
5. **Chốt Hồ sơ Phát hành (`game-release-liveops`)**: Chạy `/cut` để chốt danh sách cắt giảm & polish, xuất `CHANGELOG.md` (`/write-changelog`), `patch-notes` cho người chơi và đóng cổng `/release-checklist`.
6. **Thẩm Định Độc Lập (`reality-checker`) — chạy trước bước 4**: Trước khi đẩy bản dựng lên store, kiểm tra lại toàn bộ bằng chứng; thiếu bằng chứng ⇒ NEEDS WORK.
