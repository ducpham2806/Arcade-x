import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import path from 'node:path';import {createRequire} from 'node:module';import {build} from 'esbuild';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);fs.mkdirSync('node_modules/.cache',{recursive:true});
await build({stdin:{contents:"export {GAME_REGISTRY} from './src/games/registry';export {validStandaloneSnapshot} from './src/games/StandaloneGame';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',external:['react'],outfile:'node_modules/.cache/full-release.cjs',define:{'import.meta.env':JSON.stringify({DEV:false,BASE_URL:'/'})},loader:{'.png':'dataurl','.webp':'dataurl'},plugins:[{name:'style',setup(b){b.onLoad({filter:/\.css$/},()=>({contents:'',loader:'css'}));}}]});
global.window={};const {GAME_REGISTRY,validStandaloneSnapshot}=require('../../node_modules/.cache/full-release.cjs');
const ids=Object.keys(GAME_REGISTRY),packages=JSON.parse(fs.readFileSync('src/games/packageAssets.json'));assert.equal(ids.length,22);
for(const id of ['quan-nhau-tycoon','snake','ran-san-moi']){assert.ok(!ids.includes(id));assert.ok(!packages[id]);}
let resources=0;for(const id of ids){assert.ok(packages[id]?.length>0,id);for(const url of packages[id]){const file=url.startsWith('/chronicles-realms/')?path.join('standalone/chronicles-realms/dist',url.slice('/chronicles-realms/'.length)):path.join('public',url);assert.ok(fs.existsSync(file),url);resources++;}}
const arts=JSON.parse(fs.readFileSync('docs/launcher-art-manifest.json'));assert.equal(arts.length,22);assert.equal(new Set(arts.map(a=>a.sha256)).size,22);for(const a of arts){assert.ok(a.iconBytes<150000);assert.ok(a.bannerBytes<220000);}
const rasterSources=JSON.parse(fs.readFileSync('art/launcher/tech-art-sources.json')),rasterIcons=JSON.parse(fs.readFileSync('src/visuals/rasterIcons.json'));
assert.equal(Object.keys(rasterSources).length,7);
for(const [id,source]of Object.entries(rasterSources)){
 const row=arts.find(row=>row.id===id),icon=fs.readFileSync('public'+rasterIcons[id]);
 assert.equal(createHash('sha256').update(fs.readFileSync(source.master)).digest('hex'),source.sourceSHA256,id+' original source');
 assert.equal(row.sourceLibraryFileId,source.sourceLibraryFileId);assert.equal(row.icon,rasterIcons[id]);assert.ok(packages[id].includes(row.icon));
 assert.equal(createHash('sha256').update(icon).digest('hex'),row.sha256,id+' current image');assert.ok(row.icon.includes(row.sha256.slice(0,12)));
 assert.ok(icon.equals(fs.readFileSync('public/game-art/icons/'+id+'.webp')),id+' legacy alias');
}
assert.ok(validStandaloneSnapshot('neon-runner',{version:1,storage:{'nr-story-v08':'[]'}}));assert.ok(!validStandaloneSnapshot('neon-runner',{version:1,storage:{'arcadex_player_profile':'{}'}}));assert.ok(!validStandaloneSnapshot('neon-runner',{version:1,storage:{'nr-story-v08':'a'.repeat(500001)}}));
const messages=[],storage=new Map([['arcadex:standalone-owner:neon-runner','old-account'],['nr-story-v08','["old"]']]);let listener,boots=0;const parent={postMessage:m=>messages.push(m)},context={parent,location:{origin:'https://arcadex.test'},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},document:{hidden:false,body:{append(){boots++;}},createElement:()=>({}),addEventListener(){}},addEventListener:(type,fn)=>{if(type==='message')listener=fn;},setInterval(){},JSON,Object};context.window=context;
vm.runInNewContext(fs.readFileSync('public/standalone/neon-run/launcher-bridge.js','utf8'),context);const init={type:'arcadex:standalone-init',gameId:'neon-runner',owner:'new-account',isPaused:true,isMuted:true};
listener({source:{},origin:'https://arcadex.test',data:init});assert.equal(boots,0);listener({source:parent,origin:'https://evil.test',data:init});assert.equal(boots,0);listener({source:parent,origin:'https://arcadex.test',data:init});assert.equal(boots,1);assert.equal(storage.get('nr-story-v08'),undefined);assert.equal(context.__ARCADEX_PAUSED__,true);
listener({source:parent,origin:'https://arcadex.test',data:{type:'arcadex:standalone-state',gameId:'neon-runner',isPaused:false,isMuted:true}});assert.equal(context.__ARCADEX_PAUSED__,false);listener({source:parent,origin:'https://arcadex.test',data:init});assert.equal(boots,1);
console.log(`PASS 22 games, ${resources} package resources, 22 distinct icons/banners; excluded games absent; frame source/origin checks, account isolation, pause and single boot.`);
