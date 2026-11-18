# ST-XXX: [Tên User Story Ngắn Gọn, Rõ Hành Động]

- **Thuộc Epic**: `EP-XX`
- **Độ ưu tiên**: `P0 (Blocker/MVP) | P1 (Vertical Slice) | P2 (Polish)`
- **Trạng thái**: `TODO | READY | BLOCKED — BLOCKED: <lý do> | IN_PROGRESS | IN_REVIEW | DONE`
- **Loại Story**: `Logic | Integration | Visual/Feel | UI | Config/Data`
- **Bước dựng (Build step)**: `core | thin — <hệ thống> | deepen — <hệ thống>` *(chỉ khi `design/game-brief.md` có mục "Your systems"; nếu không thì bỏ dòng này)*
- **Story phụ thuộc cần xong trước**: `[Không có hoặc đường dẫn ST-YYY]`
- **Engine**: `[tên + phiên bản từ project.yaml — nếu chưa đặt engine thì ghi "chưa đặt engine, chạy /setup-engine", không tự điền]`
- **Loại bằng chứng kiểm thử bắt buộc**: `[x] Logic  [x] Integration  [x] Visual/UI  [ ] Config` *(ở `qa.level: minimal`, test Logic/Integration ghi "Test: waived at qa.level minimal"; ảnh chụp Visual/UI thì không bao giờ được miễn)*

## 1. Mô Tả User Story
> **Là một** `[Người chơi / Hệ thống AI / Giao diện HUD]`,
> **Tôi muốn** `[Hành động hoặc tính năng cụ thể]`,
> **Để** `[Giá trị trải nghiệm hoặc kết quả gameplay đạt được]`.

## 2. Bối Cảnh & Tóm Tắt Quyết Định GDD / ADR (Nhúng Trực Tiếp)
*(Toàn bộ công thức, thông số và quy tắc kiến trúc được nhúng tại đây để lập trình viên không cần đọc lại file GDD/ADR gốc)*
- **GDD / Brief nguồn**: `design/gdd/[file].md` hoặc dòng Features trong `design/game-brief.md`
- **ADR chi phối**: `ADR-NNNN: [tiêu đề]` — **Trạng thái ADR**: `Accepted | Proposed` *(ADR chưa Accepted, hoặc phụ thuộc ADR chưa Accepted ⇒ Story phải ở trạng thái BLOCKED)*
- **Công thức & Thông số từ GDD** (giá trị gameplay mới đưa vào file dữ liệu, không viết literal trong code):
- **Quy tắc kiến trúc từ ADR**:
- **Tín hiệu `EventBus` phát/nhận**:

## 3. Files
*`/create-stories` liệt kê các file dự kiến; `/dev-story` thay bằng danh sách file thực sự đã đổi; `/story-done` kiểm tra phạm vi theo danh sách này.*
- `[Tạo mới / Cập nhật]` `[đường dẫn dưới engine.code_root]` — `[Trách nhiệm của file]`
- `[Test]` `[đường dẫn dưới engine.test_root]`

## 4. Tiêu Chí Nghiệm Thu (Acceptance Criteria)
- [ ] **AC-1 (Logic chính)**:
- [ ] **AC-2 (Trường hợp biên / Edge case)**:
- [ ] **AC-3 (Hiệu năng / Không cấp phát rác trên hot-path)**:
- [ ] **AC-4 (Kiểm tra trực quan / The Look Rule)**: Đã chạy thử cảnh/game và lưu ảnh/log xác nhận vào `production/qa/evidence/`.

## 5. Ngoài Phạm Vi (Out of Scope)
- `[ST-YYY]`: `[phần việc do story kế bên đảm nhận — không làm ở đây]`

## 6. Bằng Chứng & Đóng Story (điền khi `/story-done`)
- **Bằng chứng**: `production/qa/evidence/[story-slug]/` + `stamp.txt` *(ghi các file mà ảnh chụp chứng minh; file nào đổi sau khi chụp ⇒ "re-capture it")*
- **Reviewed by**: `lead-programmer | /code-review (bạn nói đã chạy; chưa xác minh ở đây) | self, no independent review` *(không bao giờ để trống)*
- **Quyết định riêng của AI ngoài thiết kế**: `[liệt kê để người dùng giữ hoặc đổi]`
- **Kiểm tra hành vi chưa chơi thử**: `[DEFERRED — chờ playtest]` *(khi người dùng nói "tôi sẽ kiểm tra khi chơi")*
