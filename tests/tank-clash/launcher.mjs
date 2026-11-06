import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
await build({stdin:{contents:"export {parseCatalog,bundledCatalog} from './src/launcher/catalog';export {checkAccess} from './src/launcher/repository';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',external:['react'],outfile:'node_modules/.cache/tank-launcher.cjs',define:{'import.meta.env':JSON.stringify({DEV:false,BASE_URL:'/'})},loader:{'.png':'dataurl','.webp':'dataurl'},plugins:[{name:'isolated-client',setup(b){b.onLoad({filter:/\.css$/},()=>({contents:'',loader:'css'}));b.onResolve({filter:/supabaseClient$/},()=>({path:'client',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:'export const supabase=null;export const supabasePublicConfig={};export const resetCloudIdentity=()=>{};export const pauseCloudIdentity=async()=>{};export const resumeCloudIdentity=()=>{};export const ensureCloudIdentity=async()=>{throw Error("offline fixture")};',loader:'js'}));}}]});
global.window={};Object.defineProperty(globalThis,'navigator',{value:{onLine:true},configurable:true});
const {parseCatalog,bundledCatalog,checkAccess}=require('../../node_modules/.cache/tank-launcher.cjs');
const catalog=parseCatalog({schemaVersion:1,games:[]});
const tank=catalog.games.find(g=>g.id==='tank-clash');assert.ok(tank?.deviceOnly&&tank.supportsOffline&&tank.featured);
assert.equal((await checkAccess(tank)).allowed,true,'release works with older production catalog, without DB writes');
assert.equal(bundledCatalog.games.filter(g=>g.id==='tank-clash').length,1);
for(const [status,access_model] of [['maintenance','free'],['published','premium']]){
 const result=parseCatalog({schemaVersion:1,games:[{id:'tank-clash',engine_key:'tank-clash',status,access_model}]});
 assert.equal(result.games.length,1);assert.equal(result.games[0].availability,status);assert.equal(result.games[0].deviceOnly,undefined);
 assert.equal((await checkAccess(result.games[0])).allowed,false,'server maintenance/premium always override bundled free release');
}
assert.equal(parseCatalog({schemaVersion:1,games:[{id:'tank-clash',engine_key:'evil',status:'published',access_model:'free'}]}).games[0].id,'tank-clash');
console.log('PASS production catalog includes Tank Clash, free entry/offline package and existing server policy precedence');
