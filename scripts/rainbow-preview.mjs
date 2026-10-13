import {build} from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
export function rainbowAssets(){const dir='public/rainbow_blocks_assets',map={};function walk(d){for(const n of fs.readdirSync(d)){const f=path.join(d,n);if(fs.statSync(f).isDirectory())walk(f);else if(f.endsWith('.svg'))map[path.relative(dir,f).replaceAll('\\','/')]='data:image/svg+xml;base64,'+fs.readFileSync(f).toString('base64');}}walk(dir);return map;}
if(process.argv[1]?.endsWith('rainbow-preview.mjs')){
const result=await build({entryPoints:['src/games/rainbow-blocks/review.tsx'],bundle:true,write:false,format:'iife',minify:true,outfile:'rainbow.js',define:{'process.env.NODE_ENV':'"production"','import.meta.env':'{"BASE_URL":"/","DEV":true}'}});
const js=result.outputFiles.find(f=>f.path.endsWith('.js')).text,css=result.outputFiles.find(f=>f.path.endsWith('.css')).text;
const html=`<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Rainbow Blocks · ArcadeX review</title><style>html,body,#root{margin:0;width:100%;height:100%;overflow:hidden}body{background:#021438}button{font-family:inherit}${css}</style></head><body><div id="root"></div><script>window.__RAINBOW_ASSETS__=${JSON.stringify(rainbowAssets())};${js.replaceAll('</script','<\\/script')}</script></body></html>`;
fs.writeFileSync('../rainbow-blocks-review.html',html);console.log(JSON.stringify({bytes:Buffer.byteLength(html),assets:Object.keys(rainbowAssets()).length}));
}
