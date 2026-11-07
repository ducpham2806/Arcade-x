# Từ điển Nối Từ · 07/11/2026

Runtime mới `words.v2.json`: **34.512** từ/cụm2âm tiết,3.011từ mở màn. Gồm toàn bộ17.522câu trả lời v1 +16.990mục bổ sung sau chuẩn hóa/dedup. V1 giữ nguyên byte để client cũ tiếp tục đọc; engine mới vẫn đọc được cả v1 và v2.

## Nguồn và giấy phép

- Nền: `which-dialect-vi@0.2.0`, npm tarball SHA1 `a53d8b87a204666cc5f020d744089ab8b35c6925`, Wiktionary qua Kaikki và wordfreq, **CC BY-SA4.0**. URL: https://registry.npmjs.org/which-dialect-vi/-/which-dialect-vi-0.2.0.tgz. Giữ xếp hạng tần suất và nguyên bộ opener để không đổi seed/mức dễ hiện có.
- Bổ sung: [Wiktionary tiếng Việt qua Kaikki](https://kaikki.org/viwiktionary/), dump2026-10-02, extraction2026-11-03, tải07/11/2026. [Raw archive](https://kaikki.org/viwiktionary/rawdata.html), gzipSHA256 `1f0abd21982660b5fc2eff5eb3fbacbed2d9fe8f476af794dbed0d927ffb8187`. Kaikki phát hành dữ liệu theo các giấy phép Wiktionary; bản thích nghi này chọn CC BY-SA4.0, giữ [LICENSE](LICENSE.txt).
- Snapshot đã lọc ở `data/word-chain/viwiktionary-20261002.json`, SHA256 `5b94ebc783a309c68f9d241e75dd107ec044be13f173132d9f5541e440d25306`. Lưu headword và các ví dụ nguyên cụm2âm tiết từ mục tiếng Việt một âm tiết, kèm head nguồn cho từng ví dụ. Không dùng ngữ liệu tiếng nước ngoài hoặc cắt câu thành n-gram tùy ý.

## Chính sách và đóng gói

Giữ2âm tiết chữ Việt/NFC; bỏ tên riêng, chữ viết tắt và mục không phù hợp qua tag/gloss/blocked syllable. Ví dụ phải nguyên cụm2âm tiết, chứa headword, không nhận chữ hoa ở âm tiết thứ2; không biến mọi cặp từ có thể ghép thành câu trả lời. Bộ lọc tự động không thay toàn bộ review ngôn ngữ; thiếu/sai từ cần có nguồn và regression trước cập nhật.

Dedup theo `wordKey` dùng chung browser/Edge: vị trí dấu “hoà/hòa”, Unicode tổ hợp và chữ hoa không tạo từ trùng. Giữ toàn bộ từ/mở màn cũ. Mục mới bổ sung sau nền xếp tần suất, không đưa từ hiếm thành opener hoặc làm bot Dễ chỉ chọn từ khó.

V2 dùng chuỗi phân cách `|`, token `~âm_tiết_cuối` khi lặp âm tiết đầu ngay trước và opener là chỉ số. Decoder khôi phục nguyên thứ tự/từ; giữ file dưới400.000byte, không nới budget. `revision` SHA256 của danh sách từ giúp Edge từ chối client lệch từ điển trước khi tạo phòng/ghi lượt. Bản này khoảng329KB raw; bot, UI, offline package và Edge cùng dữ liệu v2.

## Tái tạo

1. Tải raw archive từ Kaikki vào file local; importer kiểm checksum rồi sinh snapshot: `node scripts/word-chain/import-viwiktionary.mjs /path/to/raw-wiktextract-data.jsonl.gz`.
2. `node scripts/word-chain/build-lexicon.mjs` tải nguồn npm có checksum, hợp nhất snapshot và sinh v1/v2/packageAssets. `--check` xác nhận byte không trôi; không sửa tay output.
3. `npm run prepare:word-chain-server` đồng bộ từ điển/decoder vào Edge. Chạy `test:word-chain` và UI/offline phù hợp trước phát hành.

Tác giả nguồn: cộng đồng Wiktionary/Wikimedia; Tatu Ylonen và cộng tác viên wiktextract/Kaikki; tác giả which-dialect; Robyn Speer/wordfreq (https://doi.org/10.5281/zenodo.7199437). Không có liên kết/được bảo trợ bởi các bên này. Attribution trong game ghi Wiktionary, CC BY-SA4.0, Kaikki/which-dialect.
