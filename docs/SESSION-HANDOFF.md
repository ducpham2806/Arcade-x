# Bàn giao · 19/11/2026 · sửa lỗi QA Folk

Nhánh `codex/folk-qa-20261119` từ `ea65ede`. Đã sửa nhịp vạch online của Nhảy Lò Cò, bố cục thấp ở hai game, focus theo pha và Chơi lại offline qua xác nhận. 21 Node/PGlite; Playwright, lint/build/bundle/docs theo [báo cáo](qa/FOLK-POLISH-2026-11-19.md). Nghiệm thu hai tài khoản staging, thiết bị và mạng thật còn chờ. Studio Game QA & Playtest, Game UI/UX, QA Lead. Graphify Folk 128/279, Nhảy Lò Cò 73/116, depth 1 theo lưu ván, đăng ký Chơi lại và vạch lực.

Anh yêu cầu merge ngày 19/11. [PR 40](https://github.com/ducpham2806/Arcade-x/pull/40) vào main `f154795`, gồm nền chat [PR 38](https://github.com/ducpham2806/Arcade-x/pull/38) tự ghi merged. Head `4dfd09c` và merge cùng tree `f7caf525`, [full CI #71](https://github.com/ducpham2806/Arcade-x/actions/runs/44416723603) xanh trước merge. [Thẻ Folk](plans/FOLK-GAMES-PLAN.md), [release](qa/FOLK-CHAT-RELEASE-2026-11-19.md), [bàn giao trước merge](archive/SESSION-HANDOFF-2026-11-19-before-folk-chat-merge.md).

Netlify dashboard xác nhận Published main@f154795, deploy `6afe368bb6e8bc96958e23e5`, 06:36 GMT+7 ngày 19/11. [Public](https://arcade-x.netlify.app/). Connector Primary hết phiên, kiểm bằng Chrome đã đăng nhập. 16 tệp JS/CSS/asset public (1.946.623 byte) khớp build; smoke 2 game × desktop/phone 4/4 qua, pageerror 0. Đã xem ảnh runtime, HUD hosting chừa vùng dưới.

Public có chat bubble, hai game offline/bot/chung máy, lưu/đấu lại. Ô Ăn Quan có tay rải, mẹt theo ghế và history. Code phòng Folk/chat Trận đã merge, backend mới vẫn staging `khqipuipeawzlkqmdzdg`. Folk online mặc định tắt trên public. Cấp thưởng online giữ tắt. Không ghi schema/Edge/cron production trong task merge.

Anh chọn tự kiểm hai tài khoản staging sau, giữ quyết định này. Còn thiết bị vật lý và canh lực NLC với latency thật. Preview 4335 dùng backend staging và bật Folk online, 4357 backend tắt. [QA FD-ON1](qa/FOLK-ONLINE-2026-11-19.md) có 21 Node/PGlite và 7 browser, motion 54+25, lint/build/bundle/fast qua.

Studio `fa7b1db`, Game Release & LiveOps, Release Lead, Netlify Deploy. Graph Folk 126/277 và Edge 115/240 từ FD-ON1, depth 1 đối chiếu nguồn/transaction. Lần release kiểm DAG/tree và CI, không đổi code. Bàn giao phát hành trên nhánh `codex/folk-chat-release`.
