# Bàn giao · 07/11/2026

**Nguồn:** main1131927; nhánh `codex/word-chain-launcher-release`, head5a64fef/PR#18. **Hiện tại WC-L0 ACTIVE:** bot/offline Nối Từ ra sảnh +icon/banner, online=false, không SQL production. Preview head5a64fef success/deploy6aeeb1639973bd8b2a56d893; CI23/run42341160368 fail bước nhập suffix desktop (4/5WC UI qua). Bổ sung focus/caret/value assertions trước nhập, cần CI head mới. Local lint/build/bundle/fast,36check engine và CUA desktop/phone/bot/controls320–390 qua. [Bằng chứng](qa/WC-L0-2026-11-07.md). Tiếp: CI xanh→merge→kiểm Netlify production; không dùng CI22/headb0 làm proof head mới.

## Yêu cầu mới đã lập plan

Chủ dự án yêu cầu tiếp phần phòng/ghép trận/PK Nối Từ và plan Snake. **WC-PLAN/SN-PLAN DONE tài liệu**, chưa triển khai online/Snake. Chi tiết nằm dưới thẻ module, chỉ mở mục task cần:

- [Nối Từ](plans/WORD-CHAIN.md): ON1staging/Auth/tick/tắt thưởng pilot→phòng riêng2account→FIFO2–4→PK→mạng/Auth/IME→nghiệm thu. Core/UI/schema đã có; chặn thưởng lặp bền vững, kiểm bỏ cuộc qua leave/server forfeit và retry, không thêm lệnh trùng. Không bật online production từ plan.
- [Snake](plans/SNAKE.md): R0abaseline/bundle→R0bUI chơi/lưu/reload+JWT thật→thiết bị→R01/art/audio/playtest→candidate. Cloud core và icon/banner đã có; live runner chưa kiểm renderer/DOM, expiry thật và điện thoại. Chưa vào catalog public.
- Sau WC-L0 ưu tiên online Nối Từ, rồi Snake. Game_Studio_Agent c5dac462,297blob/116skill/21role/4rules đủ và đã merge PR#17; không cần cài lại.

## Đã phát hành / còn chờ

- PR#17/main1131927: Netlify nested ws dependencies +Auth cross-tab fix, full CI42311533962 success. Production deploy6aee682dc2bd2dba16385690 Published,4bundle byte-match. [Build report](qa/NETLIFY-BUILD-2026-11-07.md).
- **TC-R0 WAITING:** user chọn để ca A sau. Hai tab production B/logout qua; lần sau A khác B kiểm phòng B9FNNVT không còn/không tiếp quản ghế. Không tự hỏi/login lại. TC-R1≥10trận/format,2thiết bị/2mạng/soak30phút chưa làm; TC-R2 chỉ port P2 sang P3, không merge nguyên nhánh.
- Render c705100 Live/Free/cap16/registered-free, Blueprint cũ paused; không sync/deploy vô cớ. Không thay SQL/key/chi phí, commerce tắt.

## Tiếp quản

WORKLOG≤3mục; phần TC cũ lưu nguyên văn trong archive, kết quả gọn tại COMPLETED. `deliverables/` là artifact local cũ, không commit. Local preview4323/session25526 đã dừng sau QA. Đọc AGENTS→bàn giao→một thẻ; doc checker trước commit. Plan đã commit local; push cùng fixture focus/caret rồi chờ CI head mới.
