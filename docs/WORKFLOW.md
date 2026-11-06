# Quy trình phiên làm việc và thu gọn ngữ cảnh

## Đọc khi bắt đầu

1. `AGENTS.md` nếu công cụ chưa tự nạp; [SESSION-HANDOFF](SESSION-HANDOFF.md).
2. Chọn task từ [PROJECT-PLAN](PROJECT-PLAN.md), mở đúng **một** thẻ trong `plans/`. Chỉ đọc `project.md` khi cần công nghệ/quy trình.
3. Đọc các mục spec/runbook liên quan được thẻ dẫn tới. Nếu cần skill, tra [studio/INDEX](studio/INDEX.md), mở 1–3 `SKILL.md`; tài nguyên đi kèm chỉ mở khi cần.

Không `cat` toàn bộ docs/WORKLOG/archive/116 skill. Không lặp lại audit toàn repo mỗi phiên. Mọi file mô tả yêu cầu, trạng thái, quyết định và đầu vào người/agent đọc là `.md`; ảnh/log/JSON là bằng chứng hoặc dữ liệu được mở có mục đích, không làm checkpoint thay thế Markdown.

## Trạng thái công việc

`READY` → `ACTIVE` → `DONE`; `WAITING` phải ghi điều kiện còn thiếu, `BACKLOG` chưa triển khai. Task chỉ `DONE` khi đủ tiêu chí nghiệm thu. Có code nhưng thiếu test/deploy/người chơi thật vẫn `WAITING` hoặc `READY` cho bước kế tiếp. Một task có thể xong mà cả game chưa xong.

Khi nhận việc: cập nhật ID, mục tiêu và bước đầu trong bàn giao. Nếu nhiều module, làm lần lượt; thẻ phải có bối cảnh ngắn, file đích, phụ thuộc, việc làm, tiêu chí và bằng chứng. Không tự biến roadmap thành quyền triển khai/mua dịch vụ.

## Trước bắt đầu việc mới hoặc kết thúc phiên

1. Kiểm diff/trạng thái thật; ghi phần hoàn tất và phần còn dở riêng. Chưa xong thì giữ `ACTIVE/WAITING` và điểm tiếp tục, không đánh `DONE` để thu gọn.
2. Với task xong, thêm/cập nhật **một tóm tắt 5–8 dòng** ở [COMPLETED](COMPLETED.md): ID/ngày/mốc nguồn; kết quả; quyết định phải giữ; bằng chứng; giới hạn; đầu mối tiếp theo. Tóm tắt theo module khi nhiều task cùng mục tiêu.
3. Cập nhật nhật ký chính [WORKLOG](WORKLOG.md): tối đa 3 mục gần nhất, mỗi mục khoảng 100–150 từ. Chuyển phần chi tiết và mục cũ nguyên văn sang `archive/WORKLOG-YYYY-MM.md` (hoặc file mốc rõ tên), đặt liên kết trước khi bỏ khỏi đầu vào chính. Archive là lịch sử của cùng nhật ký, không phải nhật ký song song.
4. Cập nhật trạng thái task/plan và [SESSION-HANDOFF](SESSION-HANDOFF.md): việc hiện tại, điều đã xác minh, phần chưa xác minh, đúng bước tiếp theo. Xóa hướng dẫn “đang chờ merge” khi đã xác nhận merge.
5. Chạy `python3 scripts/check-docs.py`; commit tài liệu cùng phần việc liên quan. Chỉ sau đó bắt đầu task mới. Nếu người dùng đổi hướng giữa chừng, checkpoint phần dở trước rồi tiếp yêu cầu mới.

## Budget đầu vào

| File | Trần ký tự Unicode | Nội dung |
|---|---:|---|
| AGENTS | 5.000 | Luật bắt buộc |
| SESSION-HANDOFF | 3.000 | Một trang trạng thái/bước kế |
| PROJECT-PLAN | 6.500 | Thứ tự và chỉ mục task |
| WORKLOG | 4.500 | ≤3 mục gọn |
| COMPLETED | 6.500 | Tóm tắt thành quả theo module |
| Mỗi thẻ plans | 6.500 | Đủ để tiếp quản một module |

Đây là budget ký tự, **không phải số token chính xác**. Bộ đọc tối thiểu AGENTS + bàn giao + một thẻ có trần 14.500 ký tự; thường thấp hơn. Chi tiết quá trần chuyển vào reference/archive có liên kết; giữ nguyên quyết định, hợp đồng, giới hạn kiểm thử và nguồn/giấy phép.
