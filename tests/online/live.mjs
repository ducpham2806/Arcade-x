// Explicit live test: creates isolated anonymous audit identities, no email.
// Run only when checking the configured project's real multiplayer transport.
import {createClient} from '@supabase/supabase-js';
import {Chess} from 'chess.js';
import {build} from 'esbuild';
import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
if(!process.argv.includes('--live'))throw new Error('Use --live explicitly for the anonymous Supabase audit.');
const config=JSON.parse(fs.readFileSync('src/config/public-backend.json'));
const artifact='/tmp/arcade-online-audit/cleanup.json';const contexts=[],identities=[],rooms=new Set(),cleanups=[];
const code=(await build({stdin:{contents:"export {MatchmakingService} from './src/services/matchmakingService';export {MultiplayerService} from './src/services/multiplayer';export * from './src/services/cloudStore';export {INITIAL_XIANGQI_BOARD,cloneBoard,serializeXiangqiBoard} from './src/games/xiangqi/rules';",resolveDir:process.cwd(),loader:'ts'},bundle:true,write:false,format:'iife',globalName:'OnlineAudit',plugins:[{name:'isolated-identity',setup(b){b.onResolve({filter:/\/supabaseClient$/},()=>({path:'identity',namespace:'audit'}));b.onResolve({filter:/^\.\/supabase$/},()=>({path:'supabase',namespace:'audit'}));b.onLoad({filter:/.*/,namespace:'audit'},args=>({contents:args.path==='identity'?'export const supabase=globalThis.__client;export async function ensureCloudIdentity(){return supabase;}':'export class SupabaseService{static getDb(){return globalThis.__client;}}',loader:'js'}));}}]})).outputFiles[0].text;
const persist=()=>fs.writeFileSync(artifact,JSON.stringify({identities,rooms:[...rooms]},null,2));
const awaitMatch=(start)=>new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(new Error('match timeout')),120000);start(id=>{clearTimeout(t);resolve(id);},e=>{clearTimeout(t);reject(e);}).then(cancel=>cleanups.push(cancel)).catch(e=>{clearTimeout(t);reject(e);});});
try{
 for(let i=0;i<2;i++){
  const client=createClient(config.url,config.publishableKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  const auth=await client.auth.signInAnonymously();if(auth.error)throw auth.error;
  const id=`guest_online_audit_${crypto.randomUUID()}`;identities.push({id,user:auth.data.user.id});persist();
  const bind=await client.rpc('arcadex_bind_player',{p_player_id:id});if(bind.error)throw bind.error;
  const sandbox={__client:client,console,crypto,setTimeout,clearTimeout,setInterval,clearInterval,Date,performance};vm.runInNewContext(code,sandbox);contexts.push({sdk:sandbox.OnlineAudit,client,id});
 }
 for(const game of ['caro-gomoku','chess','xiangqi']){
  const startBoard=game==='chess'?new Chess().fen():game==='xiangqi'?contexts[0].sdk.serializeXiangqiBoard(contexts[0].sdk.INITIAL_XIANGQI_BOARD):{};
  let deliveries=[0,0];
  const ids=await Promise.all(contexts.map((ctx,i)=>awaitMatch((ok,err)=>game==='caro-gomoku'?ctx.sdk.MultiplayerService.joinQuickMatch({uid:ctx.id,displayName:'Audit',avatar:'🎮',elo:1200},game,id=>{deliveries[i]++;ok(id);},err):ctx.sdk.MatchmakingService.joinQueue({uid:ctx.id,displayName:'Audit',avatarUrl:'🎮',elo:1200},game,startBoard,id=>{deliveries[i]++;ok(id);},err))));
  assert.equal(ids[0],ids[1]);assert.deepEqual(deliveries,[1,1]);const roomId=ids[0];rooms.add(roomId);persist();console.log('PASS simultaneous matchmaking',game);
  const read=async(ctx)=>{const r=await ctx.client.rpc('arcadex_read',{p_collection:'game_rooms',p_id:roomId});if(r.error)throw r.error;assert.equal(r.data.length,1);return r.data[0].data;};
  let room=await read(contexts[0]);const hostId=game==='caro-gomoku'?room.hostPlayer.uid:room.players.host.uid;const host=contexts.find(c=>c.id===hostId),guest=contexts.find(c=>c.id!==hostId);
  const observed=[];const stop=guest.sdk.onSnapshot(guest.sdk.doc(guest.client,'game_rooms',roomId),s=>{if(s.exists())observed.push(s.data().boardState);},()=>{});cleanups.push(stop);
  if(game==='caro-gomoku'){
   await assert.rejects(()=>guest.sdk.MultiplayerService.makeMove(roomId,'guest',7,7));
   await host.sdk.MultiplayerService.makeMove(roomId,'host',7,7);room=await read(guest);assert.equal(room.boardState['7_7'],'X');
   await guest.sdk.MultiplayerService.makeMove(roomId,'guest',7,8);room=await read(host);assert.equal(room.boardState['7_8'],'O');
  }else{
   let first,second,details1,details2;
   if(game==='chess'){const c=new Chess(startBoard);c.move('e4');first=c.fen();c.move('e5');second=c.fen();details1={from:'e2',to:'e4',notation:'e4'};details2={from:'e7',to:'e5',notation:'e5'};}
   else{const b=host.sdk.cloneBoard(host.sdk.INITIAL_XIANGQI_BOARD);b[5][0]=b[6][0];b[6][0]=null;first=host.sdk.serializeXiangqiBoard(b);b[4][0]=b[3][0];b[3][0]=null;second=host.sdk.serializeXiangqiBoard(b);details1={from:[6,0],to:[5,0]};details2={from:[3,0],to:[4,0]};}
   await assert.rejects(()=>guest.sdk.MatchmakingService.executeMove(roomId,guest.id,first,details1,undefined,startBoard));
   await host.sdk.MatchmakingService.executeMove(roomId,host.id,first,details1,undefined,startBoard);room=await read(guest);assert.equal(room.boardState,first);
   await assert.rejects(()=>guest.sdk.MatchmakingService.executeMove(roomId,guest.id,second,details2,undefined,startBoard));
   await guest.sdk.MatchmakingService.executeMove(roomId,guest.id,second,details2,undefined,first);room=await read(host);assert.equal(room.boardState,second);
  }
  const expected=JSON.stringify(room.boardState);
  const deadline=Date.now()+20000;while(Date.now()<deadline&&!observed.some(b=>JSON.stringify(b)===expected))await new Promise(r=>setTimeout(r,200));
  assert.ok(observed.some(b=>JSON.stringify(b)===expected),'subscription or polling must deliver final opponent board');stop();
  console.log('PASS bidirectional moves, turn guard and subscription delivery',game);
 }
}finally{for(const stop of cleanups)stop();for(const ctx of contexts){await ctx.client.removeAllChannels();await ctx.client.auth.signOut();}persist();}
console.log('PASS all three games against live Supabase. Audit-only cleanup list retained.');
process.exit(0);
