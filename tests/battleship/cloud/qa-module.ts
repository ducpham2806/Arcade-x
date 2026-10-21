/** Explicitly authorized, temporary cloud QA. Never imported by the normal API bundle.
 * Three admin-confirmed test users, no outgoing email. Tokens/passwords stay in memory.
 * The deployment wrapper admits this module only after worker-token verification.
 */
import {PostgresRoomStore} from '../../../supabase/functions/battleship-room/store.ts';
export async function runCloudQA(url:string,key:string,publicKey:string){
 const run=crypto.randomUUID(),accounts:{id:string;token:string}[]=[],roomIds:string[]=[],passed:string[]=[];
 let operation='initialize';
 let current='initialize',failure:string|null=null,cleaned=0,closed=0,detail:string|null=null;
 const headers={apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'};
 const store=new PostgresRoomStore(url,key);
 const ensure=(ok:boolean,name:string)=>{if(!ok){detail=name;throw new Error(name);}};
 const check=async(name:string,fn:()=>Promise<void>)=>{current=name;await fn();passed.push(name);};
 const call=async(actor:number,body:unknown)=>{operation=`${actor}:${(body as any).type}:${(body as any).command?.type||''}`;const response=await fetch(`${url}/functions/v1/battleship-room`,{method:'POST',headers:{apikey:publicKey,Authorization:`Bearer ${accounts[actor].token}`,'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:response.status,body:await response.json()};};
 const command=async(actor:number,id:string,cmd:unknown,actionId=crypto.randomUUID(),version?:number)=>{const snap=await call(actor,{type:'snapshot',roomId:id});ensure(snap.status===200,`snapshot-${snap.status}`);return call(actor,{type:'command',roomId:id,version:version??snap.body.version,actionId,command:cmd});};
 try{
 await check('three disposable registered accounts sign in with real Auth JWTs',async()=>{for(let i=0;i<3;i++){
 const email=`battleship-qa-${run}-${i}@example.invalid`,password=crypto.randomUUID()+crypto.randomUUID();
 const created=await fetch(`${url}/auth/v1/admin/users`,{method:'POST',headers,body:JSON.stringify({email,password,email_confirm:true,app_metadata:{battleship_qa_run:run}})});ensure(created.ok,`admin-${created.status}`);const user=await created.json();accounts.push({id:user.id,token:''});
 const signed=await fetch(`${url}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:publicKey,'Content-Type':'application/json'},body:JSON.stringify({email,password})});ensure(signed.ok,`signin-${signed.status}`);const session=await signed.json();ensure(!!session.access_token&&!session.user.is_anonymous,'registered-token');accounts.at(-1)!.token=session.access_token;
 }});
 const id=crypto.randomUUID();roomIds.push(id);let a:any,b:any;
 await check('A creates room through deployed HTTP API',async()=>{const r=await call(0,{type:'create',requestId:id});ensure(r.status===200,`create-${r.status}`);a=r.body;ensure(a.seat==='A1'&&a.status==='waiting'&&!a.members&&!a.state,'create-view');});
 await check('B joins by room code and has its own seat',async()=>{const r=await call(1,{type:'join',code:a.code});ensure(r.status===200,`join-${r.status}`);b=r.body;ensure(b.seat==='B1'&&b.view.revealedEnemy.length===0,'join-view');a=(await call(0,{type:'snapshot',roomId:id})).body;});
 await check('unrelated account is denied room reads and writes',async()=>{ensure((await call(2,{type:'snapshot',roomId:id})).status===403,'intruder-read');ensure((await call(2,{type:'command',roomId:id,version:a.version,actionId:crypto.randomUUID(),command:{type:'clear'}})).status===403,'intruder-write');});
 await check('both auto-placement responses hide the opposing fleet',async()=>{for(const actor of [0,1]){const r=await command(actor,id,{type:'auto'});ensure(r.status===200,`auto-${r.status}`);ensure(r.body.view.own.length===5&&r.body.view.revealedEnemy.length===0&&!r.body.state&&!r.body.members,'hidden-fleet');}});
 await check('both ready into one battle deadline and turn',async()=>{ensure((await command(0,id,{type:'ready',ready:true})).status===200,'ready-a');ensure((await command(1,id,{type:'ready',ready:true})).status===200,'ready-b');a=(await call(0,{type:'snapshot',roomId:id})).body;b=(await call(1,{type:'snapshot',roomId:id})).body;ensure(a.view.phase==='battle'&&a.view.deadline===b.view.deadline&&a.view.activeSeat===b.view.activeSeat,'battle-sync');});
 await check('replayed real HTTP shot consumes exactly one turn',async()=>{const actor=a.view.activeSeat==='A1'?0:1,snap=actor===0?a:b,actionId=crypto.randomUUID(),body={type:'command',roomId:id,version:snap.version,actionId,command:{type:'fire',row:0,col:0,turnId:snap.view.turn}};const first=await call(actor,body),again=await call(actor,body);ensure(first.status===200&&again.status===200,`shot-${first.status}-${again.status}`);ensure(again.body.duplicate===true&&again.body.view.shots.length===1&&again.body.version===first.body.version,'shot-once');});
 await check('user cannot invoke timeout worker',async()=>{ensure((await call(0,{type:'tick',roomId:id})).status===400,'worker-denied');});
 await check('rejoin returns current battle without reset',async()=>{const r=await call(1,{type:'join',code:a.code});ensure(r.status===200&&r.body.view.shots.length===1&&r.body.view.phase==='battle','rejoin-snapshot');});
 await check('leaving battle creates one authoritative surrender result',async()=>{const r=await command(0,id,{type:'leave'});ensure(r.status===200&&r.body.status==='closed'&&r.body.view.reason==='surrender'&&r.body.view.winner===1,'leave-result');const other=await call(1,{type:'snapshot',roomId:id});ensure(other.body.view.winner===1&&other.body.status==='closed','other-result');});
 }catch(error){failure=current;if(!detail)detail=(error instanceof Error?error.name+': '+error.message:'Unknown error').replace(/eyJ[A-Za-z0-9_.-]+/g,'[token]').slice(0,180);}finally{
 for(const id of roomIds)try{const room=await store.read(id);if(room&&room.status!=='closed'){if(await store.cas(room.version,{...room,status:'closed',version:room.version+1}))closed++;}}catch{}
 for(const account of accounts)try{const response=await fetch(`${url}/auth/v1/admin/users/${account.id}`,{method:'DELETE',headers});if(response.ok)cleaned++;}catch{}
 }
 return {run,passed,operation,checks:passed.length,failure,detail,createdAccounts:accounts.length,deletedAccounts:cleaned,cleanupComplete:accounts.length===cleaned,closedDuringCleanup:closed};
}
