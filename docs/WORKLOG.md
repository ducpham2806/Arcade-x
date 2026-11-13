# Nhật ký công việc

Một nhật ký chính, tối đa ba mục. [Trước đóng phát hành Snake](archive/WORKLOG-2026-11-13-before-snake-release-close.md). Xem WORKFLOW và COMPLETED.

## 13/11/2026 · SN-RELEASE-VERIFY · codex/snake-release-verification-20261113

- User cho tiếp kế hoạch; fullCI50/head1909fa6 success cảverify/snake_ui. PR31 retargetmain→merge8320385, gồmPR30; tree khớp nguồn đã kiểm. Netlify6af6f590d7b4bd3516a37885 Published18:34:34GMT+7 đúngSHA; đọc API thật.
- Public36resource/3.047.410byte byte-match build;6nhóm guest/card/art/favorite/mobile detail/download/offline reload/play/input/audio/exit qua, khôngAuthfixture/pageerror/snake-complete. Online probeCTA/joystick/Dash tới được. Đã xem4ảnh; S3badge hosting che một phần nhãn mobile được ghi bug.
- [QA/giới hạn](qa/SNAKE-PUBLIC-2026-11-13.md): Chromiumviewport không thay điện thoại/human/liveJWT; registered public chưa kiểm. Dùng game-release-liveops/game-qa-playtest và release-lead. CLItrustCA môi trường trongNSS, giữTLS. CI51 sau merge đang chạy; docs-only checkpoint kiểm docs/structure/diff, không chạy lại gameplay.

## 13/11/2026 · SN-AUTH-XTAB sửa local · codex/fix-snake-cross-tab-auth

- Nguồn c5b95a4/PR30 CI49success; trace CI48 xác nhận eventB tới trước SDK storage mới, bind playerB mang JWT anonymous và bị42501. Ràng buộc6RPC restore với token từ cùng Session, header riêng từng request; giữ epoch/save/protocol.
- Tạo unit realPostgREST và browser lag chỉ khóa SDKstorage của tab cũ. Source trước sửa tái hiện đỏ; sau sửa Auth7/7 và hai ca cross-tab qua17,9s, ảnhB ví0/màn2khóa đã xem. Test không tăngtimeout. Bằng chứng/kiểm tích hợp: [QA](qa/SNAKE-AUTH-XTAB-2026-11-13.md).
- Storage golden, sync14/14,6suite Snake local và typecheck qua. Bộ UI cuối11/11 qua214,7s/3guard, khôngskip/flaky; lượt đầu cóVitereload dobuild đã giữtrace. Production/preview/rollback/catalog/bundle291,8kBgzip qua. Dùng save-systems/game-qa-playtest, review độc lập QA/Technical Director; graph46services cập nhật483node/1288edge. Chưa merge/deploy, không backend/SQL/reward. CI nhánh mới và Netlify/thiết bị/liveJWT còn riêng.

## 13/11/2026 · DOC-02 Studio/Graphify · codex/studio-graphify-workflow

- Theo yêu cầu chủ dự án, lưu hai repo trong AGENTS/project/skill đầu mối; mỗi task chọn skill/vai trò và graph đúng module. [Nguồn/cài đặt](studio/GRAPHIFY.md).
- So297tệp Studio với head357b1a1: khớp toàn bộ. Cài Graphify0.9.108/pin52cb282 trong venv riêng; AST46file services cho484node/1291edge; query session/restore/storage budget900/depth2 qua, không LLM. CLI/graph ngoài git, tái lập theo tài liệu.
- Kiểm docs/link/budget/297blob và npm test:claude qua; không chạy full gameplay cho thay đổi hướng dẫn. Main19af480 đã merge PR29; CI48 còn lỗi cross-tab UI, Netlify chưa xác minh. Chưa sửa Auth hoặc deploy. Bàn giao giữ đúng bước tiếp.
