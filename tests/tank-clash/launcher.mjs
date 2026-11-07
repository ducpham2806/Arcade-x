import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
await build({stdin:{contents:"export {parseCatalog,bundledCatalog,isDeviceLibraryGame} from './src/launcher/catalog';export {checkAccess,enqueueFavorite,flushFavorites,pendingFavorites} from './src/launcher/repository';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',external:['react'],outfile:'node_modules/.cache/tank-launcher.cjs',define:{'import.meta.env':JSON.stringify({DEV:false,BASE_URL:'/'})},loader:{'.png':'dataurl','.webp':'dataurl'},plugins:[{name:'isolated-client',setup(b){b.onLoad({filter:/\.css$/},()=>({contents:'',loader:'css'}));b.onResolve({filter:/supabaseClient$/},()=>({path:'client',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:'export const supabase=null;export const supabasePublicConfig={};export const resetCloudIdentity=()=>{};export const pauseCloudIdentity=async()=>{};export const resumeCloudIdentity=()=>{};export const ensureCloudIdentity=async()=>{throw Error("offline fixture")};',loader:'js'}));}}]});
global.window={};Object.defineProperty(globalThis,'navigator',{value:{onLine:true},configurable:true});
const {parseCatalog,bundledCatalog,isDeviceLibraryGame,checkAccess,enqueueFavorite,flushFavorites,pendingFavorites}=require('../../node_modules/.cache/tank-launcher.cjs');
const catalog=parseCatalog({schemaVersion:1,games:[]});
assert.deepEqual(catalog.games.map(g=>g.id),['word-chain','tank-clash']);
for(const id of ['tank-clash','word-chain']){
 const game=catalog.games.find(g=>g.id===id);assert.ok(game?.deviceOnly&&game.supportsOffline&&game.featured);
 assert.deepEqual(await checkAccess(game),{allowed:true,reason:'bundled_free'},'approved release works with older production catalog, without DB writes');
 assert.equal(bundledCatalog.games.filter(g=>g.id===id).length,1);
 for(const [status,access_model] of [['maintenance','free'],['published','premium']]){
  const result=parseCatalog({schemaVersion:1,games:[{id,engine_key:id,status,access_model}]});
  const row=result.games.find(g=>g.id===id);assert.equal(result.games.filter(g=>g.id===id).length,1);assert.equal(row.availability,status);assert.equal(row.deviceOnly,undefined);
  assert.equal((await checkAccess(row)).allowed,false,'server maintenance/premium always override bundled free release');
 }
}
assert.ok(parseCatalog({schemaVersion:1,games:[{id:'tank-clash',engine_key:'evil',status:'published',access_model:'free'}]}).games.some(g=>g.id==='tank-clash'&&g.deviceOnly));
const repeated=parseCatalog({schemaVersion:1,games:[{id:'word-chain',engine_key:'word-chain',status:'published',access_model:'free'},{id:'word-chain',engine_key:'word-chain',status:'published',access_model:'free'}]});
assert.equal(repeated.games.filter(g=>g.id==='word-chain').length,1);assert.equal(repeated.games.find(g=>g.id==='word-chain').deviceOnly,undefined);
assert.equal(JSON.parse((await import('node:fs')).readFileSync('src/games/word-chain/online-config.json','utf8')).enabled,false);
const favoriteStorage=new Map();global.localStorage={getItem:k=>favoriteStorage.get(k)??null,setItem:(k,v)=>favoriteStorage.set(k,v)};
assert.equal(isDeviceLibraryGame('word-chain'),true);assert.equal(isDeviceLibraryGame('chess'),false);
enqueueFavorite('fixture-owner','word-chain',true);await flushFavorites('fixture-owner');assert.deepEqual(pendingFavorites('fixture-owner'),[],'device favorite never uploads a game missing from the server');
console.log('PASS production catalog includes Word Chain/Tank Clash once, free offline entry, server policy precedence and online-off gate');
