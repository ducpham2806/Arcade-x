# Graphify: ngữ cảnh theo task

Dùng CLI chính thức `graphifyy==0.9.106`, chỉ AST cục bộ; không dùng semantic/LLM, API key, cloud upload hoặc auto hooks. Đây là công cụ đọc quan hệ, không thay source/test hoặc chứng minh code chạy đúng.

## Cài và lập graph QA

```bash
python3 -m venv /tmp/arcadex-graphify-venv
/tmp/arcadex-graphify-venv/bin/pip install graphifyy==0.9.106
GRAPHIFY_BIN=/tmp/arcadex-graphify-venv/bin/graphify python3 scripts/graphify-qa.py
```

Trong môi trường chat11/11 đã có `/workspace/.tools/graphify/bin/graphify`; có thể dùng đường dẫn này thay cho venv mới. Build giới hạn các thư mục client/server/test Tank, Nối Từ, smoke/helpers và các entry liên quan trong SCOPES của script. Không quét art, docs/archive, asset, dependencies hoặc file môi trường. Graph/cache nằm trong `graphify-out/`, không commit.

Lần đầu: 67 file →704 node/1715 edge; 0 LLM token. Sau khi thêm server/helper, graph cập nhật tới 716 node/1753 edge theo scope hiện tại. Khi thêm helper phải rebuild; số node có thể đổi. Năm file cấu hình/inline không có symbol hữu ích ở lần đầu, dùng tìm kiếm hẹp cho chúng. Không tuyên bố một tỷ lệ tiết kiệm token chưa đo.

## Hỏi theo vị trí, không nạp cả report

```bash
graphify query 'preview open' --seed tests/tank-clash/online-ui.test.ts --budget 700 --depth 1
graphify query 'offline network' --seed tests/smoke/offline-shell.cjs --budget 700 --depth 1
graphify query 'server token' --seed server/tank-clash-room/server.mjs --budget 700 --depth 1
```

Trước query, kiểm từ vựng node có thuật ngữ tương ứng; ưu tiên seed bằng file/symbol để tránh node chung như Room kéo quá nhiều kết quả. CLI có thể nhỉnh hơn budget để giữ nguyên edge của tập node đầy đủ; nếu báo truncated thì thu hẹp seed/context trước tăng budget.

Chỉ đọc các đoạn source được trả về bằng source_file/source_location. File mới, working tree đổi, source_commit hoặc scope không khớp thì rebuild theo cache trước dùng graph; QA-SCOPE.json ghi mốc và trạng thái dirty, không là bằng chứng freshness tuyệt đối. Khi graph thiếu symbol hoặc parser không hỗ trợ: rg đúng path/đoạn nhỏ và ghi giới hạn, không bịa quan hệ.

Đầu phiên vẫn đọc AGENTS → SESSION-HANDOFF → đúng một task card. Sau phần xong: WORKLOG ngắn, COMPLETED/bàn giao cập nhật, chi tiết vào report/archive. Không cat toàn graph/report hoặc cả thư viện skill để bắt đầu phiên.

Graph này chỉ dành QA. Với Snake hoặc module khác, chọn scope tương ứng trước khi query; kết quả rỗng ở graph QA không chứng minh module đó không có code.

## Đổi scope sang module khác

Script giữ tên cũ để tương thích QA; dùng --include lặp để thay toàn bộ SCOPES, chỉ nhận đường dẫn có thật trong repo. Ví dụ lượt ads:

```bash
GRAPHIFY_BIN=/workspace/.tools/graphify/bin/graphify python3 scripts/graphify-qa.py --include src/App.tsx --include src/components/GameCatalog.tsx --include src/launcher --include src/ads --include scripts/site-pages.mjs --include tests/ads --include vite.config.ts
graphify query 'AdPlacementPreview' --seed 'AdPlacementPreview()' --context call --budget 700 --depth 1
```

QA-SCOPE.json vẫn là tên metadata nhưng scope phản ánh lựa chọn mới. Query theo file có thể trả đủ cạnh và vượt budget; chuyển sang symbol seed + --context call trước tăng budget. Lượt ads177node/328edge, query cuối chỉ hai node/một cạnh; test inline thiếu symbol thì rg đúng file.
