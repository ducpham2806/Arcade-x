# Bàn giao · 20/11/2026 · phát hành launcher Folk

Anh yêu cầu bỏ test staging, đưa hai game lên launcher và merge `main`. PR 42 đưa Ô Ăn Quan và Nhảy Lò Cò vào catalog offline đóng gói. Sảnh vẫn hiện hai game khi catalog cloud thiếu hàng. Kiểm CI trên đúng head trước merge và đối chiếu commit triển khai Netlify. Online công khai cần đợt cấu hình backend riêng. [Nhật ký](WORKLOG.md).

Tiếp `aad7895` trên `codex/folk-qa-20261119` ([PR 42](https://github.com/ducpham2806/Arcade-x/pull/42)). Có cấu hình catalog riêng cho từng game, mặc định tắt. [Phiếu FD-ON2](qa/FOLK-ON2-2026-11-19.md) ghi cách bật và thu hồi, preview staging và các bước anh nghiệm thu. [Nhật ký](WORKLOG.md) giữ bằng chứng kiểm thử, phạm vi Graphify và tình trạng CI.

Nhánh QA đã sửa vạch lực Nhảy Lò Cò, khung thấp hai game, focus theo pha và Chơi lại offline. `aad7895` thêm xác nhận bỏ cuộc. [Báo cáo đợt trước](qa/FOLK-POLISH-2026-11-19.md).

Anh yêu cầu merge ngày 19/11. [PR 40](https://github.com/ducpham2806/Arcade-x/pull/40) vào main `f154795`, gồm nền chat [PR 38](https://github.com/ducpham2806/Arcade-x/pull/38) tự ghi merged. Head `4dfd09c` và merge cùng tree `f7caf525`, [full CI #71](https://github.com/ducpham2806/Arcade-x/actions/runs/44416723603) xanh trước merge. [Thẻ Folk](plans/FOLK-GAMES-PLAN.md), [release](qa/FOLK-CHAT-RELEASE-2026-11-19.md), [bàn giao trước merge](archive/SESSION-HANDOFF-2026-11-19-before-folk-chat-merge.md).

Netlify dashboard xác nhận Published main@f154795, deploy `6afe368bb6e8bc96958e23e5`, 06:36 GMT+7 ngày 19/11. [Public](https://arcade-x.netlify.app/). Connector Primary hết phiên, kiểm bằng Chrome đã đăng nhập. 16 tệp JS/CSS/asset public (1.946.623 byte) khớp build; smoke 2 game × desktop/phone 4/4 qua, pageerror 0. Đã xem ảnh runtime, HUD hosting chừa vùng dưới.

Public có chat bubble, hai game offline/bot/chung máy, lưu/đấu lại. Ô Ăn Quan có tay rải, mẹt theo ghế và history. Code phòng Folk/chat Trận đã merge, backend mới vẫn staging `khqipuipeawzlkqmdzdg`. Folk online mặc định tắt trên public. Cấp thưởng online giữ tắt. Không ghi schema/Edge/cron production trong task merge.

Preview Vite 4335 trỏ staging và đã qua smoke khách hai game. [QA FD-ON1](qa/FOLK-ONLINE-2026-11-19.md) giữ hợp đồng và kết quả nền.

Studio `fa7b1db`, Game Release & LiveOps, Release Lead, Netlify Deploy. Graph Folk 126/277 và Edge 115/240 từ FD-ON1, depth 1 đối chiếu nguồn/transaction. Lần release kiểm DAG/tree và CI, không đổi code. Bàn giao phát hành trên nhánh `codex/folk-chat-release`.
