# Nhật ký công việc

Một nhật ký chính, tối đa3mục. [Main trước tích hợp chat](archive/WORKLOG-2026-11-15-main-before-chat-integration.md); [chat trước native](archive/WORKLOG-2026-11-15-before-native-chat-staging.md).

[Nhật ký trước mở rộng chat](archive/WORKLOG-2026-11-18-before-all-game-chat.md).

## 18/11/2026 · STUDIO / CHAT toàn game / kế hoạch Folk · codex/chat-all-games

- Cập nhật Game Studio Agent từ `main` nguồn `fa7b1db`; 125 skill, 21 vai trò, 340 blob đúng hash. Check-docs và Claude structure qua. Graphify AST cache của upstream được tái tạo cục bộ khi cần.
- Gắn chat chung vào `/preview/snake/` sau Play. Bảo vệ iframe khỏi vị trí kéo bubble. `test:games` 27/27 qua mở/thu chat và thoát, có cả Nhảy Lò Cò, Ô Ăn Quan. Build, lint, bài preview đăng nhập bằng fixture, chat chung 3/3 và chat trận 3/3 qua.
- Hai tài khoản staging thật còn chờ. [Kế hoạch Folk](plans/FOLK-GAMES-PLAN.md) ưu tiên sửa preview Ô Ăn Quan đổi state, Canvas và artwork trước offline/1v1; xác nhận lại 5/6 ca Folk. Chat của hai game dân gian dùng kênh Game tới khi có phòng online thật. PR 38 draft, chưa merge.

## 15/11/2026 · CHAT native cả3game / staging, chờ2tester · codex/chat-bubble-wireframe

- User duyệt bố cục và yêu cầu hoàn thiện Tank/Nối Từ/Hải Chiến, kiểm staging trước merge. Hải Chiến đã có chat riêng/receipt/membership/HUD; Tank sửa UTC/spectator; Word chat đồng thời không nới guard gameplay. Speech đo thật, tránh board/timer/nút, giữ unread/nháp/input chung.
- Native UI3/3 và commonChat3/3 qua; build/lint/bundle/social, Tank70/WS18, Word54, Battleship toàn bộ qua. Ảnh native dùng Auth fixture+WS/PGlite, không là bằng chứng2account thật.
- Đã áp SQL staging khqipuipeawzlkqmdzdg, deploy Word4/Battleship2; 12probe HTTPS/Auth-negative qua. Tank process riêng localhost4335, không đổi Render production. [QA nguồn/hash/giới hạn](chat/NATIVE-MATCH-QA-2026-11-15.md).
- PR38draft đã mở; tích hợp maina55 trên nhánh chat, giữ nguyên bản Snake của main/archivedhandoff. Thu gọn GDD Folk nguyên văn ra archive, kiểm8thẻ có route và budget6500. Sửa2cúpháp upstream để typecheck/build chạy.
- Fullfast kết hợp còn lỗi Folk kế thừa: Canvascontrast/thiếu artwork; giữ test, không thêm art/exception giả. Native3/common3 qua trên nguồn kết hợp; không nhận fullCI xanh.
- User báo đăng nhập;2tab profile xuan duc vẫn form login, đang xác định phiên để kiểm positive. Chưa merge/deploy production; còn fullCI/nghiệm thu. Mốc sync trước native local4f96eea/remote05506ec cùngtreee8dcffc; không force-push. [Log trước native](archive/WORKLOG-2026-11-15-before-native-chat-staging.md).

## 14/11/2026 · SN-R01-FINISH · codex/snake-r01-finish

- User yêu cầu làm tiếp Snake cho xong. Từ2ca0b3c/PR33(CI55xanh), sửa S1 Story ghi guest dù Journey theo owner; truyền store Story/Lab, giữ audio settings. Red/green account win/checkpoint/reload/B/guest và Space/focus/Escape; marker boss đúng nhiệm vụ, physics/digest giữ nguyên.
- V2 UI10màn/29sao/3tim mỗi màn qua native input/time, boss6hit/tutorial2-3, reload/cleanup0/pageerror0. V1 driver thua boss giữ evidence; sửa cadence/routebot, không hạ độkhó. Lint/build/rollback/preview/budget/6suite/catalog/storage, player3/3 và hosting5/5 qua; CI56 Snake xanh, verify lỗi testDungeon syntheticerror/autosave; sửa quota thật/recovery, giữ timeout và thêm artifactmotion. CI đúnghead trướcmerge. [QA](qa/SNAKE-FINISH-2026-11-14.md).
- game-qa-playtest/game-feel/game-ui-ux, Technical Director/QA độc lập không còn blocker. Graph46file/424node/1101edge, contextcall700. [Phiếu nghiệmthu](snake/R01-ACCEPTANCE.md); livepreflightWAITING4bindings. Thiết bị/người mới/art/audio thật chưa PASS; bản sửa chưa merge/deploy.
