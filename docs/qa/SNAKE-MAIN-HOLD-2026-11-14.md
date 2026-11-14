# Snake R01 · merge main, giữ Netlify · 14/11/2026

Chủ dự án yêu cầu: “Merge main luôn e, khoan push netlify”. Lượt này chỉ tích hợp Git và ghi bàn giao, không phát hành website mới.

## Git đã xác minh

- [PR34](https://github.com/ducpham2806/Arcade-x/pull/34), head `9a4f44b83c0c1b4f22f12dd65711a28cd0841ba8`, open/ready/mergeable; đọc lại [CI57](https://github.com/ducpham2806/Arcade-x/actions/runs/43559652286), cả verify và snake_ui success trước merge.
- Merge bằng method merge, expected_head đúng9a4f44b, tạo main `533c0e721c5a1cc46f47c8c794c59e6e73cb3335`. Commit title và body có `[skip netlify]`. Local main đã fast-forward; tree merge trùng hoàn toàn tree head đã kiểm.
- GitHub CI58/push trên mergeSHA đang chạy tại checkpoint: run43565503273. `[skip netlify]` không yêu cầu dừng GitHub Actions; không dùng trạng thái pending này để nói đã có nghiệm thu production.

## Netlify giữ nguyên

Theo [Netlify Manage deploys — Skip a deploy](https://docs.netlify.com/deploy/manage-deploys/manage-deploys-overview/), marker trong Git commit message ngăn branch/production deploy cho commit; marker ở title PR ngăn Deploy Preview. Không cần sửa code/config hosting để giữ riêng lượt merge này.

Netlify API được đọc trước/sau merge, kiểm lại sau webhook:

| Trường | Kết quả |
|---|---|
| Published deploy | `6af6f590d7b4bd3516a37885` |
| Published source | `8320385ce09d873e5c209758b19d3383179990b3` |
| State/context | ready / production |
| Published time cũ | 13/11/2026 18:34:34 GMT+7 |
| Deploy cho merge533c0e7 | Không có trong danh sách API đã kiểm |

Không gọi trigger/buildhook/publish, không đổi gói/auto-publish/stop-builds hoặc dữ liệu backend. Đây là skip theo commit/PR, chưa phải tắt auto-deploy toàn site. Commit sau không có marker có thể tự phát hành cả thay đổi đang giữ; vì vậy HOLD được ghi vào AGENTS/project/bàn giao cho các lần push sau.

Evidence máy đọc ngoài git: `/workspace/tooling/snake-main-hold-evidence/netlify-before.json`, `netlify-after.json`; chỉ giữ trường deploy/source công khai, không lưu toàn site config hoặc credentials. Không chạy smoke bản cũ để nhận bản sửa mới đã live.

## Trạng thái tiếp theo

Source sửa storage/account, keyboard, boss và badge đã ở main; website vẫn bản cũ theo yêu cầu. [QA kỹ thuật](SNAKE-FINISH-2026-11-14.md) và bằng chứng CI57 vẫn là bằng chứng của nguồn đã merge. [Phiếu nghiệm thu](../snake/R01-ACCEPTANCE.md) chưa ký cho điện thoại/người mới/art/audio; live fixture/JWT thật vẫn thiếu điều kiện.

Tới khi chủ dự án yêu cầu phát hành, giữ marker trên mọi commit đẩy nhánh và title PR, kể cả checkpoint docs. Khi được yêu cầu: đọc lại main/CI, chọn source có chủ đích, triển khai rồi xác nhận Published/SHA và smoke public. Không tự coi quyền merge là quyền phát hành ở lượt này.

Dùng game-release-liveops. Thay đổi checkpoint chỉ Markdown, kiểm docs budget/liên kết/structure/diff; không chạy lại gameplay hoặc dựng graph cho tài liệu. Nhật ký duy nhất vẫn là WORKLOG; bản trước thu gọn giữ nguyên văn trong archive.
