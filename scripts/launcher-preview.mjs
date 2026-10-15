import {build} from 'esbuild';
import {loadEnv} from 'vite';
import {rainbowAssets} from './rainbow-preview.mjs';
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
// Preserve public deployment settings in the portable bundle too.
const loaded=loadEnv('production',root,'VITE_');
const reviewEnv={DEV:true};
for(const name of ['VITE_SUPABASE_URL','VITE_SUPABASE_PUBLISHABLE_KEY','VITE_SUPABASE_ANON_KEY','VITE_AUTH_REDIRECT_URL']) {
 const value=process.env[name] || loaded[name]; if(value)reviewEnv[name]=value;
}
const result=await build({entryPoints:['src/launcher/review.tsx'],bundle:true,write:false,format:'iife',minify:true,outfile:'launcher.js',define:{'process.env.NODE_ENV':'"production"','import.meta.env':JSON.stringify(reviewEnv)},loader:{'.png':'dataurl','.jpg':'dataurl','.svg':'dataurl','.woff2':'dataurl'},plugins:[{name:'review-css',setup(b){b.onLoad({filter:/\.css$/},()=>({contents:'',loader:'css'}));}}]});
const js=result.outputFiles.find(f=>f.path.endsWith('.js')).text;
const index=fs.readFileSync('dist/index.html','utf8');
const cssPath=index.match(/<link rel="stylesheet"[^>]*href="([^"]+)"/)[1];
// Include styles from all lazy-loaded games in the self-contained review.
const mainCss=path.join('dist',cssPath);
const gameCss=fs.readdirSync('dist/assets').filter(n=>n.endsWith('.css')).map(n=>path.join('dist/assets',n)).filter(f=>f!==mainCss).sort();
let css=[mainCss,...gameCss].map(f=>fs.readFileSync(f,'utf8')).join('\n');
css=css.replace(/url\((?:"|')?(\/[^)'"\s]+)(?:"|')?\)/g,(all,p)=>{const f=path.join('public',p);if(!fs.existsSync(f))return all;const ext=path.extname(f);const mime={'.ttf':'font/ttf','.woff2':'font/woff2','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg'}[ext];return mime?`url("data:${mime};base64,${fs.readFileSync(f).toString('base64')}")`:all;});
const boomAssets={};
for(const name of fs.readdirSync('public/boom',{recursive:true})){
 const file=path.join('public/boom',name);if(!fs.statSync(file).isFile())continue;
 const mime={'.png':'image/png','.ttf':'font/ttf','.woff2':'font/woff2','.wav':'audio/wav','.ogg':'audio/ogg'}[path.extname(name)];
 if(mime)boomAssets[name.replaceAll(path.sep,'/')]=`data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
}
const blossomAssets={};
const cosmicAssets={};
for(const name of fs.readdirSync('public/games/cosmic-defense',{recursive:true})){
 const file=path.join('public/games/cosmic-defense',name);if(!fs.statSync(file).isFile())continue;
 const mime={'.png':'image/png','.ttf':'font/ttf','.wav':'audio/wav','.ogg':'audio/ogg'}[path.extname(name)];
 if(mime)cosmicAssets[name.replaceAll(path.sep,'/')]=`data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
}
for(const name of fs.readdirSync('public/blossom',{recursive:true})){
 const file=path.join('public/blossom',name);if(!fs.statSync(file).isFile())continue;
 const ext=path.extname(name),mime={'.png':'image/png','.wav':'audio/wav','.ogg':'audio/ogg','.woff2':'font/woff2'}[ext];
 if(!mime)continue;
 if(name.startsWith('png/anim/')&&!/anim_fx_(blast_|bloom_bomb|rainbow_burst|sun_burst|special_merge|chain_spark)/.test(name))continue;
 blossomAssets[name.replaceAll(path.sep,'/')]=`data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
}
const realmsRoot='standalone/chronicles-realms/dist';
const realmsData={levels:JSON.parse(fs.readFileSync(`${realmsRoot}/assets/levels.json`)),atlas:JSON.parse(fs.readFileSync(`${realmsRoot}/assets/atlas_all.json`)),skins:JSON.parse(fs.readFileSync(`${realmsRoot}/assets/skins_catalog.json`))};
realmsData.images=Object.fromEntries(Object.entries(realmsData.atlas.sheets).map(([key,sheet])=>[key,`data:image/png;base64,${fs.readFileSync(`${realmsRoot}/assets/${sheet.image}`).toString('base64')}`]));
let realmsHtml=fs.readFileSync(`${realmsRoot}/index.html`,'utf8').replace('<link rel="stylesheet" href="style.css">',`<style>${fs.readFileSync(`${realmsRoot}/style.css`,'utf8')}</style>`).replace('<script src="data.js"></script>',`<script>window.REALMS_DATA=${JSON.stringify(realmsData)};</script>`);
for(const name of ['engine.js','app.js','contrast.js']) realmsHtml=realmsHtml.replace(`<script src="${name}"></script>`,`<script>${fs.readFileSync(`${realmsRoot}/${name}`,'utf8')}</script>`);
const html=`<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>ArcadeX · Launcher UI review</title><style>${css}\nbody:has(#game-wrapper-viewport) .launcher-review-tools{display:none}.launcher-review-tools{position:fixed;bottom:80px;left:12px;z-index:30;display:flex;align-items:center;gap:10px;padding:8px 12px;border:1px solid #dce4ed;border-radius:12px;background:#fffffff5;box-shadow:0 4px 20px #23304518;font:11px system-ui;color:#34445c}.launcher-review-tools select{max-width:180px;padding:6px;border:1px solid #dce4ed;border-radius:8px;background:white;color:#34445c}@media(min-width:768px){.launcher-review-tools{bottom:12px}}@media(max-width:400px){.launcher-review-tools span{display:none}}</style><div id="root"></div><script>window.__CHRONICLES_HTML__=${JSON.stringify(realmsHtml).replaceAll('</script','<\\/script')};window.__BOOM_ASSETS__=${JSON.stringify(boomAssets)};window.__COSMIC_ASSETS__=${JSON.stringify(cosmicAssets)};window.__BLOSSOM_INLINE_ASSETS__=${JSON.stringify(blossomAssets)};window.__RAINBOW_ASSETS__=${JSON.stringify(rainbowAssets())};${js.replaceAll('</script','<\\/script')}</script></html>`;
fs.writeFileSync('../arcadex-launcher-review.html',html);console.log(JSON.stringify({bytes:Buffer.byteLength(html)}));
