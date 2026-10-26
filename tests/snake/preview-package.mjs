import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

// Run after production build, then build:snake-preview. Verify emitted artifacts,
// not just lazy-import spelling in the source.
const root='dist/preview/snake';
const manifest=JSON.parse(fs.readFileSync(`${root}/.vite/manifest.json`,'utf8'));
const entry=Object.entries(manifest).find(([,v])=>v.isEntry);
assert(entry,'Preview entry exists');
const initial=new Set();
function visit(key){if(initial.has(key))return;initial.add(key);for(const dep of manifest[key].imports||[])visit(dep);}
visit(entry[0]);
const game=Object.entries(manifest).find(([key])=>key.endsWith('/SnakeLegendPreview.tsx'));
assert(game,'Snake gameplay chunk exists');
assert(!initial.has(game[0]),'Landing page must not load Snake engine');
assert(![...initial].some(key=>key.includes('/GameWrapper.')),'Wrapper stays deferred until Play');
assert(fs.existsSync(path.join(root,game[1].file)));
const registry=fs.readFileSync('src/games/registry.ts','utf8');
assert(!registry.includes('snake-legend'),'Preview must stay outside public catalog');
const productionFiles=fs.readdirSync('dist/assets');
assert(!productionFiles.some(name=>name.includes('SnakeLegend')),'Production must not ship Snake chunk');
assert(!fs.readFileSync('dist/index.html','utf8').includes('/preview/snake/'));
const html=fs.readFileSync(`${root}/index.html`,'utf8');
assert(html.includes('noindex,nofollow'));
assert(html.includes('/preview/snake/assets/'),'Preview asset paths survive deep-link reload');
assert(!html.includes('registerSW'),'Preview must not register a second worker');
const art=JSON.parse(fs.readFileSync('art/launcher/snake-legend/manifest.json','utf8'));
for(const [name,spec] of Object.entries(art.assets)){
 const bytes=fs.readFileSync(`src/preview/snake/art/${name}.webp`);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),spec.sha256);
 assert(bytes.length<=spec.budgetBytes,`${name} exceeds mobile byte budget`);
 assert(Object.values(manifest).some(v=>v.file.endsWith('.webp')&&v.src?.endsWith(`/${name}.webp`)),`${name} must be emitted`);
}
console.log(JSON.stringify({status:'PASS',checks:['lazy engine','lazy wrapper','catalog exclusion','production exclusion','deep-link assets','no duplicate service worker','original icon/banner hashes and budgets'],initialChunks:initial.size,gameBytes:fs.statSync(path.join(root,game[1].file)).size}));
