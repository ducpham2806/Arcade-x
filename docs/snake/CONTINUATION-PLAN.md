# Rắn Săn Mồi — kế hoạch hoàn tất trước phát hành

Ngày 07/11/2026 · nhánh `codex/word-chain-launcher-release` · đối chiếu nguồn `5a64fef` và báo cáo live 02/11. Snake Legend hiện là preview R01, chưa đăng ký trong catalog public. Đây là kế hoạch, chưa có quyết định đưa Snake ra sảnh. [Thẻ công việc](../plans/SNAKE.md) giữ trạng thái ngắn cho phiên mới.

## Đã làm được gì

- PR#12 đã merge journey, cloud progress/session, boss/props/audio; wrapper React `SnakeLegendPreview` nối Auth và save session với launcher. Không còn là việc “chưa viết cloud hydrate”.
- R01 có tiến trình 10 màn được xác thực, boss Nhện Mẹ và điều khiển bàn phím/Dash/Pause; Gold/Gem riêng. Adapter không gọi thưởng chung của launcher.
- Live runner đã kiểm Auth/engine/replay/outbox/service thật: thắng và lưu, mất ACK rồi retry không cộng lặp, restore ở phiên mới, đọc offline/retry, refresh và signout. Timeout save hiện 30 giây có hủy; không giảm về 10 giây chỉ để UI nhanh hơn.
- Có icon/banner/master/manifest cho Snake; ưu tiên tái sử dụng và duyệt chất lượng trong game, không tạo lại marketing art vô cớ.

**Giới hạn:** runner live không chạy renderer/full launcher DOM. JWT hết hạn theo thời gian thực, điện thoại thật, art/animation/audio sản xuất và human playtest vẫn chưa được nghiệm thu. Root CI của các game public không tự bao phủ toàn bộ suite Snake. Preview build/route không đồng nghĩa đã phát hành.

**Kiểm thêm khi lập plan:** build preview, preview package và6suite cloud/session/journey/boss/props/audio local07/11 qua; chunk game1.916.911byte raw/~1,35MB gzip, vượt mức500KB dùng cho public. [Số đo và giới hạn](../qa/SNAKE-PLAN-BASELINE-2026-11-07.md). SN-R0a đã bổ sung baseline12/11: [route/flags/graph mới](../qa/SNAKE-R0A-2026-11-12.md); chỉ DONE baseline local, chưa live R0b.

## Việc còn thiếu và thứ tự

### SN-R0a · DONE baseline local12/11 · khóa baseline preview và đo gói build · 0,5 ngày

**File:** `src/preview/snake/`, `src/games/snake-legend/SnakeLegendPreview.tsx`, `vite.snake-preview.config.ts`, scripts/tests Snake và metadata art.

1. Build preview từ SHA mới; xác nhận entry `/preview/snake/`, Auth binding, endpoint và cờ feature/reward của môi trường thử. Production Netlify hiện không tự thêm preview route như deploy-preview.
2. Chạy suite Snake hiện có; ghi lỗi thật nếu có. Đo chunk lớn nhất, gzip, tải đầu và asset tải theo yêu cầu; không dùng số của checkpoint cũ làm số hiện tại.
3. Chốt danh sách file nguồn/generator; không sửa tay `public/standalone/` hay output sinh. Đối chiếu icon/banner đã có với metadata.

**Đã có:** [baseline12/11](../qa/SNAKE-R0A-2026-11-12.md), CI parent41 success, CI nhánh mới còn cần. Backend flags/deploy/live/device vẫn chưa kiểm lại.

**Đạt khi:** báo cáo baseline `.md` có SHA/lệnh/kết quả/build sizes và route thực tế. Giữ Snake ngoài catalog public, giữ save format và Gold/Gem riêng.

### SN-R0b · BACKLOG sau R0a · chơi và lưu qua launcher thật · 1–2 ngày + thời gian JWT

**File:** preview wrapper, `integration/`, `src/save-hooks.ts` và cloud/session tests theo vị trí được R0a xác nhận; mở [runbook live](../SNAKE_LIVE_SAVE_QA.md) khi chạy.

- Đăng nhập → mở game → chơi/thắng → thấy pending/saved/error → reload → khôi phục đúng màn/sao/Gold/Gem; quan sát renderer và DOM thật, không chỉ gọi service.
- Tắt mạng trước lưu, mất ACK sau server commit, retry/reload; tiến trình không mất, revision/reward không cộng lặp. Không thoát mà làm mất outbox đang chờ.
- Logout/đổi account khi request đang bay; phiên B không thấy tiến trình A. Hai phiên/thiết bị cùng account ghi cạnh tranh có cách merge/conflict đúng hợp đồng cloud hiện có.
- Chờ JWT hết hạn thật từ issuer của môi trường test rồi tiếp tục lưu/refresh; ghi thời điểm và kết quả. Fixture hết hạn đã có không thay ca này.
- Chạy live runner bằng tài khoản fixture được cấp theo runbook; không bật shared reward toàn cục để qua test, dọn đúng fixture sau kiểm.

**Đạt khi:** ảnh/video UI và bằng chứng service của các ca trên cùng build; restore mới và lỗi có thông báo phục hồi rõ. Tách `fixture passed`/`live passed`/`chưa kiểm` trong báo cáo.

### SN-R1a · BACKLOG sau R0a; có thể chuẩn bị trước R0b · điều khiển và thiết bị · 1–2 ngày + thiết bị

**File:** input/app/render/styles và wrapper trong `src/games/snake-legend/`; chỉ mở module cần sửa.

- Android Chrome, iPhone Safari và desktop: chạm/vuốt/Dash/Pause, thao tác nhanh, safe area, dọc-ngang, phóng nền/khôi phục, audio mute và quyền phát âm thanh.
- Rời game/reopen, đổi tab, màn hình khóa: đồng hồ/trạng thái/save theo hợp đồng; không nhân input listener, render loop hoặc audio node.
- Đo FPS/frame time và bộ nhớ trên thiết bị ghi rõ model/browser; giữ mục tiêu 60 FPS ở máy thử phù hợp, ghi mức thấp hơn và nguyên nhân thay vì tuyên bố chung. Profiling theo cảnh thường/boss/nhiều hiệu ứng; sửa nút thắt tái hiện được.

**Đạt khi:** thao tác hoàn thành được màn trên điện thoại thật, không kẹt input/cắt UI; không tăng tài nguyên qua nhiều lần vào/thoát. Browser giả lập chỉ là bổ sung, chưa đủ đóng gate thiết bị.

### SN-R1b · BACKLOG sau R0b · hoàn tất R01 và nghiệm thu nội dung · 1–2 ngày + lượt chơi

**File:** journey/boss/props/audio modules và assets nguồn; dùng đúng tài liệu phần được sửa.

- Chơi đủ 10 màn hợp lệ theo journey hiện có: mở khóa/sao/thắng-thua/chơi lại, props và boss Nhện Mẹ. Kiểm độ khó, dấu hiệu cảnh báo/va chạm và điều kiện thắng có thể hiểu từ UI.
- Review chuyển động Tiểu Xà/enemy/boss, VFX và art trong gameplay; ghi asset nào final, asset nào còn candidate cùng lỗi cụ thể. Có asset không tự coi là đã đạt A1.
- Review nhạc/SFX, mức âm, mute/pause/restart/cleanup và nguồn asset; không coi “có âm thanh” là đã đạt audio sản xuất.
- Human playtest M2: người chưa biết game tự hiểu điều khiển/mục tiêu, ghi vướng mắc và sửa nhóm lỗi cản chơi trước. Ưu tiên nội dung hiện có, chưa mở thêm map/boss/shop.

**Đạt khi:** checklist từng màn/boss/props và báo cáo người chơi/art/audio có bằng chứng; không còn lỗi chặn tiến trình. Sửa đổi cân bằng có chủ đích và giữ tương thích save.

### SN-R2a · BACKLOG sau R0/R1 · sẵn sàng tích hợp catalog · 1–2 ngày

**File:** package/entry Snake, registry/catalog/repository nếu được chọn phát hành, art manifests/build pipeline và regression.

- Từ phép đo R0a, tách asset/chunk nặng khỏi tải đầu, tải lười và dọn khi thoát; áp budget bundle hiện hành khi tích hợp public. Preview riêng vượt budget không được coi là đã đủ điều kiện public.
- Chốt chính sách account/guest, backend verifier/feature flags, quyền chơi/offline và Gold/Gem. Không tự quy đổi sang coin/XP chung hoặc thêm monetization.
- Lập rollout/rollback: bundle nào chứa game, catalog có một mục, icon/banner/offline package đúng, favorite/recent/exit và game khác giữ nguyên. Xác nhận nguồn build production, không dựa vào route preview đã có.
- Chỉ mở PR tích hợp public khi chủ dự án chọn phát hành và các gate trước đạt; kế hoạch này chưa yêu cầu bật Snake production.

**Đạt khi:** candidate có đủ kiểm tra/asset/budget, backend và chính sách rõ; báo cáo go/no-go phân biệt code/merge/deploy/nghiệm thu. Rollback không làm mất save; reward/commerce không tự bật.

### SN-R2b · BACKLOG sau quyết định phát hành · pilot và nghiệm thu production

Full CI trên head tích hợp, deploy theo quyền hiện hành, kiểm launcher production và tiến trình mới/cũ trên thiết bị thật. Theo dõi save fail/timeout, crash và tải asset, dừng rollout khi lỗi mất tiến trình/nhầm account. Nếu chưa đủ thiết bị hoặc tài khoản thì WAITING, không đánh DONE từ build xanh.

## Bộ kiểm tra cần chạy

Theo phần thay đổi, chạy các lệnh đã có: `test:snake-cloud`, `test:snake-session`, `test:snake-journey`, `test:snake-boss`, `test:snake-props`, `test:snake-audio`, `test:snake-preview`, `build:snake-preview`. Chạy lint/build/bundle khi đụng wrapper/packaging; full CI trước merge. `test:snake-live -- --live` cần phiên tương tác/tài khoản fixture đúng runbook, không đưa vào CI tự động.

Mỗi task giữ bằng chứng `.md` trong `docs/qa/`, ghi SHA, môi trường, ca chạy thật và giới hạn. COMPLETED tóm tắt trước chuyển việc, WORKLOG≤3 mục, archive giữ chi tiết; session mới đọc bàn giao + thẻ Snake + đúng mục task này. Ước lượng là công làm việc, không tính chờ thiết bị/người chơi/JWT và không phải lịch cam kết.

**Bước đầu đề xuất:** SN-R0a rồi SN-R0b. Sau kế hoạch Nối Từ, ưu tiên chứng minh chơi → lưu → reload qua giao diện thật; chưa cần thêm nội dung mới hoặc vẽ lại icon/banner.
