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
const sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
let checks=0;const games=fs.readdirSync('art/gemini').filter(g=>fs.existsSync(`art/gemini/${g}/crops.json`));
assert.deepEqual(games.sort(),['blocker','caro-gomoku','chess','cyber-slice','mummy-escape','xiangqi']);
// Games with a painted launcher icon; the others keep their existing icon.
const PAINTED_ICONS=['blocker','chess','mummy-escape'];
for(const game of games){
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
