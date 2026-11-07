# Netlify Deploy Preview · 07/11/2026

Trạng thái: **đã sửa, CI đầy đủ qua, merge và production Published**. PR#17, main11319270cceeb6dda2c084154abf0954fb5ebddd; nhánh checkpoint codex/tank-clash-release-verification.

- Ảnh chủ dự án: Deploy Preview lỗi06:03:55 ở TypeScript TS2307, tests/tank-clash/launcher-ui.test.ts:31 không tìm thấy server/tank-clash-room/node_modules/ws/index.js. Production main/c705100 vẫn Published; lỗi này thuộc build preview, không chứng minh production ngừng chạy.
- Nguyên nhân: root npm ci không cài package trong hai thư mục server riêng. CI có bước cài chúng trước lint; netlify.toml preview gọi lint ngay nên thiếu ws dùng bởi browser fixture.
- Sửa: package.json có deps:tank-clash cài từ lockfile hai server, ignore-scripts; CI và cả Netlify production/preview gọi cùng lệnh trước lint/build. Giữ toàn bộ TypeScript và assertion, không loại test khỏi typecheck. Preview vẫn build thêm Snake.
- Tái hiện trên bản git archive sạch, root dependencies dùng lại từ máy, không có node_modules ở hai server: npm run lint thất bại đúng TS2307 như ảnh.
- Sau sửa trên cùng bản đó: deps:tank-clash cài mỗi server1package từ cache; lint + build + build:snake-preview đều exit0. Không dùng dữ liệu/phiên người dùng. Hai cảnh báo build đã có về dynamic import và chunk Snake không phải lỗi mới.
- Commit sửa b644da2db4e74d873b209e51b52880d79c5d8de5: GitHub status netlify/arcade-x/deploy-preview=success; Header rules/Redirect rules completed/success. [Deploy6aee6157ea767b4dae245593](https://app.netlify.com/projects/arcade-x/deploys/6aee6157ea767b4dae245593), [preview](https://deploy-preview-17--arcade-x.netlify.app/).
- Preview đang Team protection: trình duyệt chưa đăng nhập Netlify chuyển sang “This site is private”. Không tắt bảo vệ hoặc suy UI đã nghiệm thu từ build success. Chủ dự án dùng Chrome có phiên Netlify để xem.
- [CI run42311533962](https://github.com/ducpham2806/Arcade-x/actions/runs/42311533962/job/128213989341) completed/success toàn bộ, gồm Nối Từ/Tank UI và generated-files clean. PR#17 merge main1131927 sau CI xanh, tree merge trùng head đã kiểm.
- [Production deploy6aee682dc2bd2dba16385690](https://app.netlify.com/projects/arcade-x/deploys/6aee682dc2bd2dba16385690) Published main1131927 lúc07/11 khoảng06:52–06:54 UTC+7; dashboard xác nhận mọi section Complete. Đã thấy lệnh deps→lint→build trên production, không chỉ preview.
- Root HTTPS200 và4bundle đầu trang trùng byte build local đã kiểm. Bundle Auth mới assets/index-rWU2dYT6.js, SHA256 73be0c9f90f1faf3eb9b3b626bbb5c6ed8b3522961bff42d7b6c43769346fed9. Ba vendor hash giữ nguyên báo cáo TC-R0.

Phát hiện liên quan: [Nối Từ](WC-R0-2026-11-07.md). Ca Auth xuyên tab vẫn cần retest host thật sau phát hành; xem [AUTH-XTAB](BUG-AUTH-CROSS-TAB.md).
