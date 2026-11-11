# Đối chiếu nhánh và phát hành — 11/11/2026

## Kết luận

**Các đợt phát hành mới nhất đã vào main; chưa phải mọi commit trên mọi nhánh đều đã merge.** Commerce được chủ dự án yêu cầu làm sau; không có thao tác gỡ nền tảng commerce đã tồn tại trong main.

- Nguồn kiểm: `origin/main@9061bfd8411fd18de28a731d30e379e80eb7dc94`; `git fetch --no-tags origin main` và `git ls-remote --heads origin` ngày 11/11.
- Checkout môi trường ban đầu: `work@affc5e8`, chậm hơn main 38 commit. Không reset checkout này hoặc xóa `bun.lock` có sẵn. Nhánh plan mới bắt đầu từ đúng main.
- Trước tạo nhánh plan: 31 head remote; 28 head là tổ tiên main. Truy vấn GitHub không có PR mở.
- [PR #21](https://github.com/ducpham2806/Arcade-x/pull/21) merged thành 9061bfd ngày 08/11. [CI #36](https://github.com/ducpham2806/Arcade-x/actions/runs/42456461599) success trên head 47649f9; [Netlify production](https://app.netlify.com/projects/arcade-x/deploys/6af075593632a228f5ca3102) ready/published đúng9061bfd, API đã xác minh trong lượt audit trước cùng chat ngày 11/11. Không suy health backend hiện tại từ deploy frontend.

## Ba nhánh không là tổ tiên main

| Nhánh/head | Bằng chứng | Xử lý |
|---|---|---|
| docs/project-plan-and-handoff / f834e3e4 | `git cherry origin/main f834e3e4` trả dấu `-`: patch tương đương đã có | Không merge lại docs cũ |
| ccr-e38a635d-qyei9d / 39dbb6ef | 3 commit P3b/P3c/P3d triển khai song song; main có P3b `0e20896`, P3c `e2f89e9`, P3d `6eb394c` và release PR16 | Không merge nguyên nhánh; chỉ lấy một sửa lỗi nếu so code/test chứng minh còn thiếu |
| feat/tank-clash-p2-staging-readiness / bdc6f85e | `git cherry` dấu `+`; protocol nhánh `tank-clash.p2.v2`, main `tank-clash.p3.v1` | Còn công việc TC-R2: đối chiếu rồi port các bảo đảm còn thiếu, không merge P2 vào P3 |

## Khoảng trống P2 đã đối chiếu source

P2 có `Snapshot.epoch`, epoch trong input, opId/context ở ready/leave, message ack và transport resume ràng buộc endpoint. Main P3 có input-sequence ack và matchId/start, nhưng không có hợp đồng control opId/ack và epoch tương đương. PR #21 đã thêm handshake deadline 75s/10s và bỏ callback socket cũ: **không làm lại hai sửa này**. Chưa có bằng chứng bug production cho từng khoảng trống; TC-R2 phải tạo tình huống/test đỏ rồi mới port phần cần thiết. Auth/ops hiện hành của P3 giữ nguyên.

## Kiểm local đã có trên main trong cùng chat

Lint/build/bundle/fast qua; 24/24 game launch/input/exit; 18/18 WS/ops; smoke 7, modal 22, perf 3,9 render/s; Snake 6 suite + build/package preview qua. 15/22 UI bị Chromium chặn file://; 7 qua. Offline runner bị navigator.onLine đổi false→reload→true, tái hiện ngoài app. Đây là giới hạn harness cần xử lý ở QA-ENV, không là bằng chứng mọi game hay backend thật đã nghiệm thu.

Các ghi chú handoff 08/11 nói PR #21 còn draft/chưa deploy đã lỗi thời, được thay bằng checkpoint 11/11. Lịch sử nguyên văn giữ trong docs/archive. Nhánh plan sẽ tạo một head mới; số 31 chỉ là snapshot trước lượt này.
