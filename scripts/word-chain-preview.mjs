// Offline review page for the four-player room lab: node scripts/word-chain-preview.mjs [out.html]
// The dictionary is embedded and served to the page's fetch, so the file works from disk.
import {build} from 'esbuild';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
const target=path.resolve(process.argv[2]||'review/word-chain-room-lab.html');
const result=await build({entryPoints:['src/games/word-chain/review.tsx'],bundle:true,write:false,format:'iife',platform:'browser',minify:true,jsx:'automatic',define:{'process.env.NODE_ENV':'"production"','import.meta.env':'{}'},outfile:'word-chain.js'});
const js=result.outputFiles.find(f=>f.path.endsWith('.js')).text,css=result.outputFiles.find(f=>f.path.endsWith('.css')).text;
const words=readFileSync('public/games/word-chain/words.v2.json','utf8');
const shim=`const __W=${JSON.stringify(words)};const __f=window.fetch.bind(window);window.fetch=(u,o)=>String(u).endsWith('/games/word-chain/words.v2.json')?Promise.resolve(new Response(__W,{status:200,headers:{'Content-Type':'application/json'}})):__f(u,o);`;
const html=`<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nối Từ · Phòng thử 4 người</title><style>html,body,#root{margin:0}${css}</style></head><body><div id="root"></div><script>${shim}${js.replaceAll('</script','<\\/script')}</script></body></html>`;
mkdirSync(path.dirname(target),{recursive:true});writeFileSync(target,html);console.log(JSON.stringify({file:target,bytes:Buffer.byteLength(html)}));
