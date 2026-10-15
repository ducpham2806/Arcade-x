// Run after: npm run build -- --manifest
const fs=require('node:fs'),assert=require('node:assert/strict');
const manifest=JSON.parse(fs.readFileSync('dist/.vite/manifest.json','utf8'));
const sw=fs.readFileSync('dist/sw.js','utf8');
const precache=[...sw.matchAll(/\{url:"([^"]+)"/g)].map(m=>m[1]);
const initial=new Set();
function visit(key){const item=manifest[key];if(!item||initial.has(item.file))return;initial.add(item.file);for(const dependency of item.imports||[])visit(dependency);}
visit('index.html');
const games=Object.entries(manifest).filter(([path])=>/^src\/games\/[^/]+\/index.tsx$/.test(path));assert.equal(games.length,21);
for(const [path,game]of games){assert.equal(game.isDynamicEntry,true,path);assert.ok(!initial.has(game.file),path);assert.ok(!precache.includes(game.file),path);}
assert.ok(!precache.includes(manifest['src/games/GameWrapper.tsx'].file));
assert.ok(!precache.some(url=>/^(boom|blossom|rainbow_blocks_assets|chronicles-realms|games)\//.test(url)));
assert.ok(precache.includes(manifest['index.html'].file));
console.log(`PASS: all ${games.length} game modules and GameWrapper excluded from launcher/precache; ${precache.length} shell files only.`);
