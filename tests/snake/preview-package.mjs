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
const productionFiles=fs.readdirSync('dist/assets');
assert(!productionFiles.some(name=>/SnakeLegend|^snake-/.test(name)),'Production must not ship Snake chunk');
assert(!fs.existsSync('dist/snake-offline-package.json'),'Default build must exclude the catalog package');
assert(!fs.readFileSync('dist/index.html','utf8').includes('/preview/snake/'));
const html=fs.readFileSync(`${root}/index.html`,'utf8');
assert(html.includes('noindex,nofollow'));
assert(html.includes('/preview/snake/assets/'),'Preview asset paths survive deep-link reload');
assert(!html.includes('registerSW'),'Preview must not register a second worker');
const art=JSON.parse(fs.readFileSync('art/launcher/snake-legend/manifest.json','utf8'));
for(const [name,spec] of Object.entries(art.assets)){
 const master=fs.readFileSync(path.join('art/launcher/snake-legend',spec.source));
 assert.equal(createHash('sha256').update(master).digest('hex'),spec.sourceSha256,`${name} master hash changed`);
 assert(master.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),`${name} master is PNG`);
 assert.deepEqual([master.readUInt32BE(16),master.readUInt32BE(20)],spec.sourceSize,`${name} master dimensions changed`);

 const bytes=fs.readFileSync(`src/preview/snake/art/${name}.webp`);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),spec.sha256);
 assert(bytes.length<=spec.budgetBytes,`${name} exceeds mobile byte budget`);
 assert(Object.values(manifest).some(v=>v.file.endsWith('.webp')&&v.src?.endsWith(`/${name}.webp`)),`${name} must be emitted`);
}
console.log(JSON.stringify({status:'PASS',checks:['lazy engine','lazy wrapper','catalog exclusion','production exclusion','deep-link assets','no duplicate service worker','original master hashes/dimensions and runtime icon/banner hashes/budgets'],initialChunks:initial.size,gameBytes:fs.statSync(path.join(root,game[1].file)).size}));

const previewFiles=fs.readdirSync(path.join(root,'assets'));
const media=new Set();
function verifyMedia(name, extension, base64) {
 const file=previewFiles.find(value=>value.startsWith(`snake-${name}-`)&&value.endsWith('.'+extension));
 assert(file,`${name} must be a hashed resource`);
 assert(!productionFiles.includes(file),`${name} must stay out of the production build`);
 assert(fs.readFileSync(path.join(root,'assets',file)).equals(Buffer.from(base64,'base64')),`${name} bytes differ from source`);
 media.add(file);
}
const sourceRoot='src/games/snake-legend/src/';
const imageSource=fs.readFileSync(sourceRoot+'assets.ts','utf8');
for(const [,name,extension,base64] of imageSource.matchAll(/"([a-z0-9_]+)":\{"image":"data:image\/(png|webp);base64,([A-Za-z0-9+/=]+)"/g))verifyMedia(name,extension,base64);
const props=fs.readFileSync(sourceRoot+'story-prop-assets.ts','utf8').match(/"data:image\/webp;base64,([A-Za-z0-9+/=]+)"/);
assert(props,'Props generator must supply its atlas');
verifyMedia('r01_props','webp',props[1]);
for(const source of ['audio-assets.ts','audio-feedback-assets.ts']){
 for(const [,name,base64] of fs.readFileSync(sourceRoot+source,'utf8').matchAll(/"(sfx_[a-z0-9_]+)":\s*"(UklGR[A-Za-z0-9+/=]+)"/g))verifyMedia(name,'wav',base64);
}
assert.equal(media.size,20,'Expected 6 atlases and 14 WAVs');
assert.deepEqual(new Set(game[1].assets?.filter(file=>file.startsWith('assets/snake-')).map(file=>path.basename(file))),media,'Game manifest must track its external media');
for(const key of initial)assert(!(manifest[key].assets??[]).some(file=>file.startsWith('assets/snake-')),'Initial manifest graph must exclude game media');
const gameText=fs.readFileSync(path.join(root,game[1].file),'utf8');
for(const file of media)assert(gameText.includes(file),`${file} must be referenced by Snake gameplay`);
assert(!/data:image\/[^"' ]+;base64,|["']UklGR[A-Za-z0-9+/=]{128,}["']/.test(gameText),'Gameplay JS must not embed images or WAVs');
for(const file of previewFiles.filter(value=>value.endsWith('.js'))){
 assert(fs.statSync(path.join(root,'assets',file)).size<=500*1024,`${file} exceeds the 500 KiB chunk budget`);
}
console.log(JSON.stringify({status:'PASS',checks:['byte-identical external media','no inline game media','500 KiB JS budget'],media:media.size}));
