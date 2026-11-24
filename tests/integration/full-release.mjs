import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import path from 'node:path';import {createRequire} from 'node:module';import {build} from 'esbuild';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);fs.mkdirSync('node_modules/.cache',{recursive:true});
await build({stdin:{contents:"export {GAME_REGISTRY} from './src/games/registry';export {bundledCatalog,normalizeSearch,parseCatalog} from './src/launcher/catalog';export {validStandaloneSnapshot} from './src/games/StandaloneGame';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',external:['react'],outfile:'node_modules/.cache/full-release.cjs',define:{'import.meta.env':JSON.stringify({DEV:false,BASE_URL:'/'})},loader:{'.png':'dataurl','.webp':'dataurl'},plugins:[{name:'style',setup(b){b.onLoad({filter:/\.css$/},()=>({contents:'',loader:'css'}));}}]});
global.window={};const {GAME_REGISTRY,bundledCatalog,normalizeSearch,parseCatalog,validStandaloneSnapshot}=require('../../node_modules/.cache/full-release.cjs');
const ids=Object.keys(GAME_REGISTRY),packages=JSON.parse(fs.readFileSync('src/games/packageAssets.json'));assert.equal(ids.length,26);
for(const id of ['o-an-quan','nhay-lo-co']) assert.ok(ids.includes(id),`${id} must remain in the packaged registry`);
const oaqId = 'o-an-quan';
const olderOaqRow = {id:oaqId, engine_key:oaqId, title:'Ô Ăn Quan', status:'published', access_model:'free',
  category:'Multiplayer', supports_offline:true, featured:true, short_description:'Ghép trận, tạo phòng mã 6 ký tự và dùng mã mời'};
const otherCloudRow = {...olderOaqRow, id:'nhay-lo-co', engine_key:'nhay-lo-co', short_description:'Mô tả Nhảy Lò Cò từ catalog'};
const olderCloud = {schemaVersion:1, games:[olderOaqRow, otherCloudRow]};
for (const [source, game] of [
  ['bundled', bundledCatalog.games.find(({id}) => id === oaqId)],
  ['missing cloud row', parseCatalog({...olderCloud, games:[]}, true).games.find(({id}) => id === oaqId)],
  ['cached row from an earlier online session', parseCatalog({...olderCloud, games:[{...olderOaqRow, folk_online_enabled:true}]}).games.find(({id}) => id === oaqId)],
  ['live maintenance row with a stale online flag', parseCatalog({...olderCloud, games:[{...olderOaqRow, status:'maintenance', folk_online_enabled:true}]}, true).games.find(({id}) => id === oaqId)],
  ['live row with only Nhảy Lò Cò enabled', parseCatalog({...olderCloud, games:[olderOaqRow, {...otherCloudRow, folk_online_enabled:true}]}, true).games.find(({id}) => id === oaqId)],
  ['cached older cloud row', parseCatalog(olderCloud).games.find(({id}) => id === oaqId)],
  ['live older cloud row', parseCatalog(olderCloud, true).games.find(({id}) => id === oaqId)],
  ['live cloud row with online disabled', parseCatalog({...olderCloud, games:[{...olderOaqRow, folk_online_enabled:false}]}, true).games.find(({id}) => id === oaqId)],
]) {
  assert.ok(game, source);
  for (const copy of [game.shortDesc, game.description]) {
    assert.match(copy, /bot/i, source);
    assert.match(copy, /2 người chung máy/i, source);
  }
  // These fields feed search, the featured carousel fallback and game details.
  assert.doesNotMatch(normalizeSearch([game.shortDesc, game.description, ...game.tags].join(' ')),
    /online|ghep tran|tao phong|ma moi|ma 6 ky tu/, source);
  assert.equal(game.category, 'Multiplayer', source);
  assert.equal(game.supportsAI, true, source);
  assert.notEqual(game.folkOnlineEnabled, true, source);
}
const explicitOaq = parseCatalog({...olderCloud, games:[{...olderOaqRow, status:'maintenance', access_model:'premium'}]}, true)
  .games.find(({id}) => id === oaqId);
assert.equal(explicitOaq.title, olderOaqRow.title);
assert.equal(explicitOaq.availability, 'maintenance');
assert.equal(explicitOaq.accessModel, 'premium');
assert.equal(explicitOaq.deviceOnly, undefined);
assert.equal(parseCatalog(olderCloud, true).games.find(({id}) => id === otherCloudRow.id).shortDesc, otherCloudRow.short_description);
const enabledOaq = {...olderCloud, games:[{...olderOaqRow, folk_online_enabled:true}]};
for (const row of [enabledOaq.games[0], {...enabledOaq.games[0], short_description:undefined}]) {
  const game = parseCatalog({...enabledOaq, games:[row]}, true).games.find(({id}) => id === oaqId);
  assert.equal(game.folkOnlineEnabled, true);
  assert.equal(game.shortDesc, row.short_description ?? 'Đấu trí rải sỏi · Đấu bot, 2 người chung máy hoặc ghép trận online');
  assert.match(game.description, /bot.*2 người chung máy.*ghép trận online.*mã phòng/i);
  assert.ok(game.tags.includes('Mã phòng'));
}
assert.equal(parseCatalog(enabledOaq).games.find(({id}) => id === oaqId).folkOnlineEnabled, false);
for(const id of ['quan-nhau-tycoon','snake','ran-san-moi']){assert.ok(!ids.includes(id));assert.ok(!packages[id]);}
let resources=0;for(const id of ids){assert.ok(packages[id]?.length>0,id);for(const url of packages[id]){const file=url.startsWith('/chronicles-realms/')?path.join('standalone/chronicles-realms/dist',url.slice('/chronicles-realms/'.length)):path.join('public',url);assert.ok(fs.existsSync(file),url);resources++;}}
const arts=JSON.parse(fs.readFileSync('docs/launcher-art-manifest.json'));assert.deepEqual(arts.map(a=>a.id).sort(),[...ids].sort());assert.equal(new Set(arts.map(a=>a.sha256)).size,ids.length);for(const a of arts){assert.ok(a.iconBytes<150000);assert.ok(a.bannerBytes<220000);}
const rasterSources=JSON.parse(fs.readFileSync('art/launcher/tech-art-sources.json')),rasterIcons=JSON.parse(fs.readFileSync('src/visuals/rasterIcons.json'));
assert.equal(Object.keys(rasterSources).length,12);assert.deepEqual(Object.keys(rasterSources).sort(),Object.keys(rasterIcons).sort());
for(const [id,source]of Object.entries(rasterSources)){
 const row=arts.find(row=>row.id===id),icon=fs.readFileSync('public'+rasterIcons[id]);
 assert.equal(createHash('sha256').update(fs.readFileSync(source.master)).digest('hex'),source.sourceSHA256,id+' original source');
 assert.equal(row.sourceLibraryFileId,source.sourceLibraryFileId);assert.equal(row.icon,rasterIcons[id]);assert.ok(packages[id].includes(row.icon));
 assert.equal(createHash('sha256').update(icon).digest('hex'),row.sha256,id+' current image');assert.ok(row.icon.includes(row.sha256.slice(0,12)));
 assert.ok(icon.equals(fs.readFileSync('public/game-art/icons/'+id+'.webp')),id+' legacy alias');
}
const paintedBanners=JSON.parse(fs.readFileSync('src/visuals/rasterBanners.json'));
assert.deepEqual(Object.keys(paintedBanners),['word-chain']);
const wordArt=arts.find(a=>a.id==='word-chain'),wordSource=rasterSources['word-chain'];
assert.equal(createHash('sha256').update(fs.readFileSync(wordSource.bannerMaster)).digest('hex'),wordSource.bannerSHA256);
assert.equal(wordArt.banner,paintedBanners['word-chain']);assert.ok(packages['word-chain'].includes(wordArt.banner));
assert.equal(createHash('sha256').update(fs.readFileSync('public'+wordArt.banner)).digest('hex'),wordArt.bannerSHA256);
assert.ok(wordArt.banner.includes(wordArt.bannerSHA256.slice(0,12)));
assert.ok(validStandaloneSnapshot('neon-runner',{version:1,storage:{'nr-story-v08':'[]'}}));assert.ok(!validStandaloneSnapshot('neon-runner',{version:1,storage:{'arcadex_player_profile':'{}'}}));assert.ok(!validStandaloneSnapshot('neon-runner',{version:1,storage:{'nr-story-v08':'a'.repeat(500001)}}));
const messages=[],storage=new Map([['arcadex:standalone-owner:neon-runner','old-account'],['nr-story-v08','["old"]']]);let listener,boots=0;const parent={postMessage:m=>messages.push(m)},context={parent,location:{origin:'https://arcadex.test'},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},document:{hidden:false,body:{append(){boots++;}},createElement:()=>({}),addEventListener(){}},addEventListener:(type,fn)=>{if(type==='message')listener=fn;},setInterval(){},JSON,Object};context.window=context;
vm.runInNewContext(fs.readFileSync('public/standalone/neon-run/launcher-bridge.js','utf8'),context);const init={type:'arcadex:standalone-init',gameId:'neon-runner',owner:'new-account',isPaused:true,isMuted:true};
listener({source:{},origin:'https://arcadex.test',data:init});assert.equal(boots,0);listener({source:parent,origin:'https://evil.test',data:init});assert.equal(boots,0);listener({source:parent,origin:'https://arcadex.test',data:init});assert.equal(boots,1);assert.equal(storage.get('nr-story-v08'),undefined);assert.equal(context.__ARCADEX_PAUSED__,true);
listener({source:parent,origin:'https://arcadex.test',data:{type:'arcadex:standalone-state',gameId:'neon-runner',isPaused:false,isMuted:true}});assert.equal(context.__ARCADEX_PAUSED__,false);listener({source:parent,origin:'https://arcadex.test',data:init});assert.equal(boots,1);
console.log(`PASS ${ids.length} games, ${resources} package resources, ${arts.length} distinct icons/banners; excluded games absent; Folk launch copy and cloud policy checks; frame source/origin checks, account isolation, pause and single boot.`);
