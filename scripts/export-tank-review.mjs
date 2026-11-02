import { build } from 'esbuild';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
const bundle = await build({ entryPoints: ['src/games/tank-clash/preview.ts'], bundle: true, write: false, format: 'iife', target: 'es2022', minify: true });
const css = readFileSync('src/games/tank-clash/tank-clash.css', 'utf8');
const script = bundle.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const html = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#142424"><title>Tank Clash · Phòng 1v1 P2</title><style>html,body,#app{margin:0;width:100%;height:100%;overflow:hidden}body{background:#10191b}#app{height:100dvh;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);box-sizing:border-box}${css}</style></head><body><div id="app"></div><script>${script}</script></body></html>`;
mkdirSync('preview/tank-clash', { recursive: true });
mkdirSync('deliverables', { recursive: true });
writeFileSync('preview/tank-clash/index.html', html);
writeFileSync('deliverables/Tank_Clash_P2_Playtest.html', html);
console.log(`Tank Clash P2 exported: ${Buffer.byteLength(html)} bytes, self-contained UI; room play uses the configured WebSocket server; no per-frame database writes.`);

const lab = `<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Tank Clash · Phòng thử 2 client</title><style>body{margin:0;background:#10191b;color:#eff3df;font:14px system-ui}header{padding:12px 18px}p{margin:4px 0;color:#bbcdb3}main{display:grid;grid-template-columns:1fr 1fr;height:calc(100dvh - 84px);gap:8px;padding:0 8px}iframe{border:1px solid #52705f;width:100%;height:100%;box-sizing:border-box}@media(max-width:900px){main{grid-template-columns:1fr;height:auto}iframe{height:780px}}</style><header><b>Tank Clash · Hai client độc lập</b><p>Tạo phòng bên A, nhập mã bên B. Cả hai bấm Sẵn sàng. Đây là hai kết nối WebSocket thật đến cùng server.</p></header><main><iframe title="Client A" src="/?pane=left"></iframe><iframe title="Client B" src="/?pane=right"></iframe></main></html>`;
writeFileSync('preview/tank-clash/room-lab.html', lab);
const devices = `<!doctype html><html lang="vi"><meta charset="utf-8"><title>Tank Clash · Khung thiết bị</title><style>body{margin:0;background:#10191b;color:#eff3df;font:14px system-ui}header{padding:12px}main{display:flex;gap:20px;padding:10px;align-items:flex-start}iframe{border:1px solid #587060;display:block}p{margin:4px 0 10px}</style><header>Kiểm tra bố cục CSS ở kích thước mobile, không thay thế thiết bị thật.</header><main><section><p>Dọc · 390 × 844</p><iframe title="Portrait" src="/?pane=portrait" width="390" height="844"></iframe></section><section><p>Ngang · 844 × 390</p><iframe title="Landscape" src="/?pane=landscape" width="844" height="390"></iframe></section></main></html>`;
writeFileSync('preview/tank-clash/devices.html', devices);
