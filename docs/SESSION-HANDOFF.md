# Bàn giao · 13/11/2026 · SN-UI-BADGE ứng viên

User cho làm tiếp; nhánh `codex/fix-hosting-badge-safe-area` từec65ea9/PR32; [PR33](https://github.com/ducpham2806/Arcade-x/pull/33) targetmain gồm cả checkpointPR32. [Thẻ Snake](plans/SNAKE.md), [QA sửa badge](qa/SNAKE-BADGE-2026-11-13.md). Chưa merge/deploy bản sửa; source public8320385 vẫn có S3badge.

## Đã làm và kiểm

Đọc HUD thật, đo `.nl-badge` trongiframe sẵn sàng; chừa64px theo hình học/8px đệm, fallback outer bounds khi opaque. Giữ branding/iframe/link/góiFree. Observer trực tiếp body và frame, không theo subtreegame; popup không co game thêm, hide/remove trả vùng. Khung modal/game lấp vùng còn lại; giữ mobile100%, cap desktop900/800/700. Review QA/Technical Director sửa nguy cơ generic900px làm hụt tallmobile.

Baseline8320385 đỏ đúngCTA; hosting5/5 khôngretry/skip/flaky ở320/390/844landscape/1440 +opaque. Fullstick/dashzone gồmnhãn vàCTA clear, launch/timer/exit/branding qua. Lint/build/rollback/bundle qua; catalog16code/20media/offline reload/play/audio/guest-account qua. Modal36checks gồm390×1000 và1440×1200/AppModalMummy/tabs ổn định. Animation50/50+VFX25/25 và SnakeUI11/11+3guard qua, khôngretry/skip/flaky.

Dùng game-ui-ux/input-systems/game-qa-playtest, review độc lập QA/Technical Director. Graph components37file230node440edge/queryGameDetailModal4node5edge; refresh services47file485node1289edge/queryinstaller2node1edge; depth1/budget900. App/CSS tra hẹp. Graph/CLI/evidence ngoài git; [tái lập](studio/GRAPHIFY.md).

## Bước kế tiếp

Đọc checks PR33 để xác nhận fullCI đúng head mới nhất trước merge; status CI trong checkpoint không thay lần đọc mới. Netlify preview6af7051f09c4af71b6c7fc43 ready đúngef9f636 nhưng URL chuyển edge-access, guest không vào được; chưa nghiệm thu HUD thật. Không lặp kiểm preview nếu chưa có quyền truy cập; không đổi cấu hình bảo vệ. Chỉ merge main khi chủ dự án yêu cầu; Netlify tự phát hành, sau merge phải xác nhận Published/SHA và smoke lại. Không dùng kiểm local/preview để đóng productionbug. Không cần làm lại engine/save/Auth/SQL/rewards/commerce.

R01 đã public qua PR31/main8320385 sauCI50; CI51 sau merge success. Netlify6af6f590d7b4bd3516a37885 Published18:34GMT+7 đúngSHA;36resource byte-match, guest/offline/input/audio/exit qua. [QA phát hành](qa/SNAKE-PUBLIC-2026-11-13.md), [Auth](qa/SNAKE-AUTH-XTAB-2026-11-13.md). Registered public cross-tab/liveDB/JWT còn riêng.

M2/người mới10màn, Android/iPhone/Safari thật, FPS/heap/audio vẫn WAITING; Chromiumviewport không thay thiết bị. Studio/Graphify đã lưu trong checkout. RenderTank giữFree; NốiTừON5/ON6 cònQA; commerce tắt. MộtWORKLOG tối đa3mục, archive giữ nguyên văn.
