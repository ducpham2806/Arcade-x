import { build } from 'esbuild';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
const bundle = await build({ entryPoints: ['src/games/tank-clash/preview.ts'], bundle: true, write: false, format: 'iife', target: 'es2022', minify: true });
const css = readFileSync('src/games/tank-clash/tank-clash.css', 'utf8');
const script = bundle.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const html = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#142424"><title>Tank Clash · P3a 2v2 với bot + Online 1v1</title><style>html,body,#app{margin:0;width:100%;height:100%;overflow:hidden}body{background:#10191b}#app{height:100dvh;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);box-sizing:border-box}${css}</style></head><body><div id="app"></div><script>${script}</script></body></html>`;
mkdirSync('preview/tank-clash', { recursive: true });
mkdirSync('deliverables', { recursive: true });
writeFileSync('preview/tank-clash/index.html', html);
writeFileSync('deliverables/Tank_Clash_P2_Playtest.html', html);
// Compatibility alias for earlier tooling; both names contain the current P2 UI.
writeFileSync('deliverables/Tank_Clash_P1_Playtest.html', html);
console.log(`Tank Clash P3a (2v2 with bots) + P2 online exported: ${Buffer.byteLength(html)} bytes, self-contained UI; online rooms require the separate WebSocket server; no per-frame database writes.`);
