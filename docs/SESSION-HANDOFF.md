# Bàn giao · 20/11/2026 · mở online Folk

Đã triển khai backend Ô Ăn Quan và Nhảy Lò Cò theo yêu cầu của anh trên Supabase Arcade-x `whjatkhhupeqfngakmee`. Nguồn đã phát hành là `main@932db80`. Đã đối chiếu mã Edge v1, quyền RPC, cron 10 giây, tick 200 và hai ca khách 401. [Nhật ký triển khai](WORKLOG.md) · [Edge production](https://supabase.com/dashboard/project/whjatkhhupeqfngakmee/functions/folk-duel-room).

Đã mở online công khai theo yêu cầu của anh lúc 09:50 GMT+7. API catalog production trả cả hai game `published`, online bật và offline khả dụng. API quyền mở game trả `allowed: true` và `reason: free`. Trận production hai tài khoản, thiết bị và mạng thật chưa kiểm. [Thẻ Folk](plans/FOLK-GAMES-PLAN.md) · [Quy trình thu hồi từng game](qa/FOLK-ON2-2026-11-19.md).

[PR 42](https://github.com/ducpham2806/Arcade-x/pull/42) đã merge vào main theo yêu cầu 20/11. Full CI #80 qua trên head `8d38c86` có cùng tree với commit merge. Netlify đã phát hành deploy `6aff968c2ce7263aaa277072`. [Launcher](https://arcade-x.netlify.app/) · [Netlify](https://app.netlify.com/projects/arcade-x/deploys/6aff968c2ce7263aaa277072).

[QA sửa giao diện Folk](qa/FOLK-POLISH-2026-11-19.md) · [QA backend staging](qa/FOLK-ONLINE-2026-11-19.md) · [Phát hành Bubble và chat Trận](qa/FOLK-CHAT-RELEASE-2026-11-19.md).
