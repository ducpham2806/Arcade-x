// Gemini art (art/gemini/<game>, cut by scripts/art/import-gemini.py): every exported sprite
// exists, ships in its game's offline package and stays within budget; painted launcher icons
// and loading backdrops are registered consistently. Pixel output is re-checked with
// `python3 -I scripts/art/import-gemini.py art/gemini/<game>/crops.json --check` (needs Pillow).
import fs from 'node:fs';import assert from 'node:assert/strict';import crypto from 'node:crypto';
const packages=JSON.parse(fs.readFileSync('src/games/packageAssets.json','utf8'));
const icons=JSON.parse(fs.readFileSync('src/visuals/rasterIcons.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('docs/launcher-art-manifest.json','utf8'));
const sources=JSON.parse(fs.readFileSync('art/launcher/tech-art-sources.json','utf8'));
const gameArt=fs.readFileSync('src/visuals/gameArt.tsx','utf8');
// Canvas size of a WebP file (VP8X extended, VP8L lossless or VP8 lossy header).
const webpSize=f=>{const b=fs.readFileSync(f),k=b.toString('ascii',12,16);
 if(k==='VP8X')return[1+b.readUIntLE(24,3),1+b.readUIntLE(27,3)];
 if(k==='VP8L'){const v=b.readUInt32LE(21);return[1+(v&0x3fff),1+((v>>14)&0x3fff)]}
 return[b.readUInt16LE(26)&0x3fff,b.readUInt16LE(28)&0x3fff]};
const sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
let checks=0;const games=fs.readdirSync('art/gemini').filter(g=>fs.existsSync(`art/gemini/${g}/crops.json`));
assert.deepEqual(games.sort(),['blocker','caro-gomoku','chess','cyber-slice','hex-match','mummy-escape','xiangqi']);
// Games with a painted launcher icon; the others keep their existing icon.
const PAINTED_ICONS=['blocker','chess','mummy-escape'];
// Blossom Blast substitutes its original PNGs by path through painted.json (see blossom/assets.ts):
// every replaced original exists, the table matches crops.json, and every preloaded file exists.
{
 const spec=JSON.parse(fs.readFileSync('art/gemini/hex-match/crops.json','utf8'));
 const table=JSON.parse(fs.readFileSync(spec.map,'utf8')),expected={};
 for(const it of spec.items){
  assert.ok(fs.existsSync(`art/gemini/hex-match/${it.source}`)&&fs.existsSync(it.out),`hex-match: ${it.name} missing`);
  const budget=it.method==='flipbook'?it.frames*24_000:it.method==='none'||it.method==='compose'?200_000:60_000;
  assert.ok(fs.statSync(it.out).size<=budget,`hex-match: ${it.out} over budget`);
  // Flipbooks replace the original strips in place: same frame count and cell size, so VFX.tsx
  // plays them unchanged; they ship in the offline package because every match uses them.
  if(it.method==='flipbook'){
   assert.deepEqual(webpSize(it.out),[it.frames*it.cell,it.cell],`hex-match: ${it.name} strip geometry`);
   assert.ok(['blast','sun','rainbow','bomb','merge','spark'].includes(it.effect),`hex-match: ${it.name} unknown effect`);
   if(it.effect==='blast')assert.ok(it.petal in spec.pieces,`hex-match: ${it.name} uses unknown piece ${it.petal}`);
   assert.ok(packages['hex-match'].includes(it.out.replace(/^public/,'')),`hex-match: ${it.name} not in packageAssets (offline)`);
  }
  // A sprite either substitutes original PNGs or is referenced directly by the named file.
  if(it.usedBy)assert.ok(fs.readFileSync(it.usedBy,'utf8').includes(it.out.replace(/^public/,'')),`hex-match: ${it.name} not used in ${it.usedBy}`);
  else assert.ok(it.replaces?.length,`hex-match: ${it.name} replaces nothing`);
  // Composed scenes may only layer sprites produced earlier in crops.json.
  for(const layer of it.layers||[])assert.ok(spec.items.indexOf(spec.items.find(o=>o.out===layer.sprite))>-1&&spec.items.findIndex(o=>o.out===layer.sprite)<spec.items.indexOf(it),`hex-match: ${it.name} layers an unknown or later sprite`);
  for(const old of it.replaces||[]){assert.ok(fs.existsSync('public/blossom/'+old),`hex-match: ${old} is not an original asset`);expected[old]=it.out.replace(/^public/,'');}
  checks++;
 }
 for(const [name,p] of Object.entries(spec.pieces||{}))assert.ok(fs.existsSync(`art/gemini/hex-match/${p.source}`),`hex-match: piece ${name} source missing`);
 assert.deepEqual(table,expected,'painted.json is out of date');
 for(const url of packages['hex-match'])assert.ok(fs.existsSync('public'+url),`hex-match: preloaded ${url} missing`);
 for(const url of Object.values(table))assert.ok(url.startsWith('/blossom/gemini/'));
 assert.ok(!packages['hex-match'].some(u=>u.slice('/blossom/'.length) in table),'hex-match preloads a replaced PNG');
}
for(const game of games.filter(g=>g!=='hex-match')){
 const {items}=JSON.parse(fs.readFileSync(`art/gemini/${game}/crops.json`,'utf8'));
 for(const it of items){
  assert.ok(fs.existsSync(`art/gemini/${game}/${it.source}`),`${game}: missing source ${it.source}`);
  assert.ok(fs.existsSync(it.out),`${game}: missing ${it.out}`);
  const url=it.out.replace(/^public/,'');
  assert.ok(packages[game].includes(url),`${game}: ${url} not in packageAssets (offline)`);
  const bytes=fs.statSync(it.out).size,limit=it.method==='none'?200_000:40_000;
  assert.ok(bytes<=limit,`${game}: ${url} is ${bytes} B > ${limit}`);checks++;
 }
 const art=fs.readdirSync(`public/games/${game}/art`).map(f=>`/games/${game}/art/${f}`);
 for(const url of art)assert.ok(items.some(it=>it.out==='public'+url),`${game}: ${url} is not produced by crops.json`);
 const splash=items.find(it=>/\/(splash|arena)\.webp$/.test(it.out));
 if(splash){assert.ok(gameArt.includes(splash.out.replace(/^public/,'')),`${game}: loading backdrop not registered`);checks++;}
 if(!PAINTED_ICONS.includes(game)){assert.ok(!(game in icons),`${game}: unexpected raster icon`);continue;}
 // Launcher icon: hashed immutable file on disk, preloaded, and traced to its Gemini master.
 const icon=icons[game];assert.ok(icon&&fs.existsSync('public'+icon),`${game}: raster icon missing`);
 assert.ok(packages[game].includes(icon),`${game}: icon not in packageAssets`);
 const row=manifest.find(r=>r.id===game);assert.equal(row.icon,icon);assert.equal(row.sha256,sha('public'+icon));
 assert.equal(row.sourceType,'imagegen');assert.equal(sources[game].sourceSHA256,sha(sources[game].master));
 assert.ok(sources[game].master.startsWith(`art/gemini/${game}/source/`));
 checks+=3;
}
console.log(`gemini art: ${checks} checks passed`);
