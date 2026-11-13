# Nhật ký công việc

Một nhật ký chính, tối đa ba mục. [Bản nguyên văn trước sửa Snake Auth](archive/WORKLOG-2026-11-13-before-snake-auth.md). Xem WORKFLOW và COMPLETED.

## 13/11/2026 · SN-AUTH-XTAB sửa local · codex/fix-snake-cross-tab-auth

- Nguồn c5b95a4/PR30 CI49success; trace CI48 xác nhận eventB tới trước SDK storage mới, bind playerB mang JWT anonymous và bị42501. Ràng buộc6RPC restore với token từ cùng Session, header riêng từng request; giữ epoch/save/protocol.
- Tạo unit realPostgREST và browser lag chỉ khóa SDKstorage của tab cũ. Source trước sửa tái hiện đỏ; sau sửa Auth7/7 và hai ca cross-tab qua17,9s, ảnhB ví0/màn2khóa đã xem. Test không tăngtimeout. Bằng chứng/kiểm tích hợp: [QA](qa/SNAKE-AUTH-XTAB-2026-11-13.md).
- Storage golden, sync14/14,6suite Snake local và typecheck qua. Bộ UI cuối11/11 qua214,7s/3guard, khôngskip/flaky; lượt đầu cóVitereload dobuild đã giữtrace. Production/preview/rollback/catalog/bundle291,8kBgzip qua. Dùng save-systems/game-qa-playtest, review độc lập QA/Technical Director; graph46services cập nhật483node/1288edge. Chưa merge/deploy, không backend/SQL/reward. CI nhánh mới và Netlify/thiết bị/liveJWT còn riêng.

## 13/11/2026 · DOC-02 Studio/Graphify · codex/studio-graphify-workflow

- Theo yêu cầu chủ dự án, lưu hai repo trong AGENTS/project/skill đầu mối; mỗi task chọn skill/vai trò và graph đúng module. [Nguồn/cài đặt](studio/GRAPHIFY.md).
- So297tệp Studio với head357b1a1: khớp toàn bộ. Cài Graphify0.9.108/pin52cb282 trong venv riêng; AST46file services cho484node/1291edge; query session/restore/storage budget900/depth2 qua, không LLM. CLI/graph ngoài git, tái lập theo tài liệu.
- Kiểm docs/link/budget/297blob và npm test:claude qua; không chạy full gameplay cho thay đổi hướng dẫn. Main19af480 đã merge PR29; CI48 còn lỗi cross-tab UI, Netlify chưa xác minh. Chưa sửa Auth hoặc deploy. Bàn giao giữ đúng bước tiếp.

## 13/11/2026 · SN-R2b đang phát hành · codex/snake-public-release

- Chủ dự án yêu cầu merge main và deploy Netlify. Tách Snake từ ứng viên 4432a0e sang nhánh dựa trên main9061bfd. R01 miễn phí, lưu trên thiết bị theo owner, không dùng cloud save hay thưởng chung ở bản sảnh.
- Build production và rollback, Chrome card/tải gói/retry/reload offline/ảnh/âm thanh/đổi account đã qua. Ẩn công cụ QA trong game public. Chờ CI trên PR trước khi merge. [Báo cáo](qa/SNAKE-PUBLIC-2026-11-13.md).
