import assert from 'node:assert/strict';
import {createClient} from '@supabase/supabase-js';
import {LauncherSnakeBinding} from '../../src/games/snake-legend/integration/launcher-binding';
const owner='00000000-0000-4000-8000-000000000011',nextOwner='00000000-0000-4000-8000-000000000012';
let refreshes=0,apiCalls=0;
const token=(id:string,exp:number)=>Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:id,exp,role:'authenticated'})).toString('base64url')+'.'+Buffer.from('fixture-signature').toString('base64url');
const user=(id:string)=>({id,aud:'authenticated',role:'authenticated',email:'fixture@example.invalid',app_metadata:{provider:'email'},user_metadata:{},created_at:new Date().toISOString(),is_anonymous:false});
const authFetch:typeof fetch=async(url,init)=>{
 const u=new URL(String(url));
 if(u.pathname.endsWith('/token')){refreshes++;return Response.json({access_token:token(owner,Math.floor(Date.now()/1000)+3600),refresh_token:'fixture-refreshed',expires_in:3600,token_type:'bearer',user:user(owner)});}
 if(u.pathname.endsWith('/user')){const auth=new Headers(init?.headers).get('authorization')!;const id=JSON.parse(Buffer.from(auth.split('.')[1],'base64url').toString()).sub;return Response.json(user(id));}
 if(u.pathname.endsWith('/logout'))return new Response(null,{status:204});
 throw Error('Unexpected fixture Auth route');
};
const client=createClient('https://fixture.invalid','fixture-publishable',{global:{fetch:authFetch},auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
const initial=await client.auth.setSession({access_token:token(owner,1),refresh_token:'fixture-expired-refresh'});assert.equal(initial.error,null);assert(refreshes>0);
assert.equal((await client.auth.getSession()).data.session?.user.id,owner);
console.log('PASS SDK restores expired fixture session via refresh');
let current:string|null=owner;
const binding=new LauncherSnakeBinding({actorId:owner,auth:client.auth,hostOwner:()=>current,endpoint:'https://fixture.invalid/save',publishableKey:'fixture',fetcher:async()=>{apiCalls++;return Response.json({revision:1,levels:{'1-1':{stars:[true,true,false],bestTime:20,bestScore:100}},secrets:[],wallet:{snake_gold:0,snake_gem:0}});}});
binding.connect();const factory=binding.createSaveSession;await binding.refreshState();assert.equal(binding.getView().status,'ready');
await client.auth.refreshSession();await binding.refreshState();assert.equal(binding.createSaveSession,factory);assert.equal(binding.getView().status,'ready');
console.log('PASS real SDK TOKEN_REFRESHED preserves factory and hydrated snapshot');
await client.auth.signOut();assert.equal(binding.getView().status,'closed');const calls=apiCalls;await binding.refreshState();assert.equal(apiCalls,calls);assert.equal(binding.getView().snapshot,null);
console.log('PASS SDK SIGNED_OUT clears snapshot and prevents network');
await client.auth.setSession({access_token:token(nextOwner,Math.floor(Date.now()/1000)+3600),refresh_token:'fixture-next-owner'});current=nextOwner;await binding.refreshState();assert.equal(apiCalls,calls);binding.destroy();await client.auth.signOut();
console.log('PASS closed binding cannot reopen for another SDK account');
// Client-expired session is denied before transport even if a host resolver
// supplies it. This is a local guard test, not a real JWT issuer expiry test.
const expired=new LauncherSnakeBinding({actorId:owner,auth:{getSession:async()=>({data:{session:{user:{id:owner},access_token:'expired',expires_at:1}},error:null}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},hostOwner:()=>owner,endpoint:'https://fixture.invalid/save',publishableKey:'fixture',fetcher:async()=>{throw Error('Expired sessions must not reach HTTP');}});
await expired.refreshState();assert.equal(expired.getView().status,'error');expired.destroy();
console.log('PASS client expiry guard blocks HTTP');
// A cold read longer than the former 10s limit must finish under the same
// policy used by the React preview. No real network or backend data is used.
const {SNAKE_SAVE_TIMEOUT_MS}=await import('../../src/games/snake-legend/integration/save-policy');
const auth={getSession:async()=>({data:{session:{user:{id:owner},access_token:'fixture',expires_at:Date.now()/1000+600}},error:null}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})};
const cold=new LauncherSnakeBinding({actorId:owner,auth,hostOwner:()=>owner,endpoint:'https://fixture.invalid/save',publishableKey:'fixture',timeoutMs:SNAKE_SAVE_TIMEOUT_MS,fetcher:async(_url,init)=>new Promise<Response>((resolve,reject)=>{const timer=setTimeout(()=>resolve(Response.json(null)),11000);init?.signal?.addEventListener('abort',()=>{clearTimeout(timer);reject(Error('aborted'));},{once:true});})});
await cold.refreshState();assert.equal(cold.getView().status,'ready');cold.destroy();
console.log('PASS slow 11s state read succeeds under preview timeout policy');
let release:((value:Response)=>void)|undefined;
const late=new LauncherSnakeBinding({actorId:owner,auth,hostOwner:()=>owner,endpoint:'https://fixture.invalid/save',publishableKey:'fixture',timeoutMs:SNAKE_SAVE_TIMEOUT_MS,fetcher:async()=>new Promise<Response>(resolve=>{release=resolve;})});
const pending=late.refreshState();while(!release)await new Promise(resolve=>setTimeout(resolve,0));
late.invalidate();release(Response.json({revision:9,levels:{},secrets:[],wallet:{snake_gold:0,snake_gem:0}}));await pending;
assert.equal(late.getView().status,'closed');assert.equal(late.getView().snapshot,null);late.destroy();
console.log('PASS invalidation cancels read and late response cannot restore snapshot');
