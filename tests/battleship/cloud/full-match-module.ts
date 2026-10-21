/** Temporary, explicitly approved cloud test. Batches avoid the QA runner's request cap.
 * A continuation is AES-GCM encrypted with a server-derived key and expires after 10 minutes.
 * No password or JWT is returned in plaintext. Normal API deployments never import this module.
 */
import {PostgresRoomStore} from '../../../supabase/functions/battleship-room/store.ts';
export async function runFullMatch(url:string,key:string,publicKey:string,continuation?:string){
 const purpose='battleship-qa-full:v1';
 const aes=await crypto.subtle.importKey('raw',await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key+purpose)),'AES-GCM',false,['encrypt','decrypt']);
 const seal=async(data:any)=>{const iv=crypto.getRandomValues(new Uint8Array(12)),cipher=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},aes,new TextEncoder().encode(JSON.stringify(data))));return btoa(String.fromCharCode(...iv,...cipher));};
 const open=async(token:string)=>{const bytes=Uint8Array.from(atob(token),c=>c.charCodeAt(0));return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.slice(0,12)},aes,bytes.slice(12))));};
 const headers={apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'},store=new PostgresRoomStore(url,key);
 let data:any=continuation?await open(continuation):{purpose,expires:Date.now()+600000,run:crypto.randomUUID(),accounts:[],roomId:crypto.randomUUID(),current:null,batches:0},keep=false,failure:string|null=null,deleted=0;
 if(data.purpose!==purpose||data.expires<Date.now())throw new Error('Invalid or expired QA continuation');
 const ensure=(ok:boolean,name:string)=>{if(!ok)throw new Error(name);};
 const call=async(actor:number,body:any)=>{const response=await fetch(`${url}/functions/v1/battleship-room`,{method:'POST',headers:{apikey:publicKey,Authorization:`Bearer ${data.accounts[actor].token}`,'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:response.status,body:await response.json()};};
 try{
 if(!continuation){
 for(let i=0;i<3;i++){const email=`battleship-qa-${data.run}-${i}@example.invalid`,password=crypto.randomUUID()+crypto.randomUUID();const created=await fetch(`${url}/auth/v1/admin/users`,{method:'POST',headers,body:JSON.stringify({email,password,email_confirm:true,app_metadata:{battleship_qa_run:data.run}})});ensure(created.ok,`admin-${created.status}`);const user=await created.json();data.accounts.push({id:user.id,token:''});const signed=await fetch(`${url}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:publicKey,'Content-Type':'application/json'},body:JSON.stringify({email,password})});ensure(signed.ok,`signin-${signed.status}`);data.accounts.at(-1).token=(await signed.json()).access_token;}
 const created=await call(0,{type:'create',requestId:data.roomId});ensure(created.status===200,`create-${created.status}`);data.current=created.body;
 const joined=await call(1,{type:'join',code:created.body.code});ensure(joined.status===200,`join-${joined.status}`);data.current=joined.body;
 for(const actor of [0,1])for(const command of [{type:'auto'},{type:'ready',ready:true}]){const r=await call(actor,{type:'command',roomId:data.roomId,version:data.current.version,actionId:crypto.randomUUID(),command});ensure(r.status===200,`prepare-${r.status}`);data.current=r.body;}
 const fixture=await store.read(data.roomId),lengths:Record<string,number>={carrier:5,battleship:4,'heavy-cruiser':3,'light-cruiser':3,destroyer:2};ensure(!!fixture?.state,'fixture');const cells=(ships:any[])=>ships.flatMap(s=>Array.from({length:lengths[s.type]},(_,i)=>({row:s.row+(s.horizontal?0:i),col:s.col+(s.horizontal?i:0)})));data.targets=cells(fixture!.state!.boards[1]);const occupied=new Set(cells(fixture!.state!.boards[0]).map(c=>`${c.row},${c.col}`));data.water=Array.from({length:100},(_,i)=>({row:Math.floor(i/10),col:i%10})).filter(c=>!occupied.has(`${c.row},${c.col}`));
 }
 const limit=continuation?12:5;
 for(let i=0;i<limit&&data.current.status!=='closed';i++){
 const v=data.current.view,actor=v.activeSeat==='A1'?0:1,seat=actor===0?'A1':'B1';const shots=new Set(v.shots.filter((s:any)=>s.actor===seat).map((s:any)=>`${s.row},${s.col}`));const target=(actor===0?data.targets:data.water).find((c:any)=>!shots.has(`${c.row},${c.col}`));ensure(!!target,'target');const body={type:'command',roomId:data.roomId,version:data.current.version,actionId:crypto.randomUUID(),command:{type:'fire',row:target.row,col:target.col,turnId:v.turn}};const r=await call(actor,body);
 if(r.status===409){const fresh=await call(actor,{type:'snapshot',roomId:data.roomId});ensure(fresh.status===200,'resync');data.current=fresh.body;continue;}
 ensure(r.status===200,`fire-${r.status}`);data.current=r.body;data.lastActor=actor;data.lastBody=body;
 }
 data.batches++;
 if(data.current.status==='closed'){ensure(data.current.view.winner===0&&data.current.view.reason==='fleet'&&data.current.view.enemySunk===5,'fleet-result');const retry=await call(data.lastActor,data.lastBody);ensure(retry.status===200&&retry.body.duplicate===true&&retry.body.view.winner===0,'winning-action-replay');}
 else{const token=await seal(data);keep=true;return {run:data.run,status:'continue',shots:data.current.view.shots.length,batches:data.batches,createdAccounts:data.accounts.length,continuation:token};}
 }catch(error){failure=error instanceof Error?error.name+': '+error.message:'Unknown failure';}finally{
 if(!keep){try{const room=await store.read(data.roomId);if(room&&room.status!=='closed')await store.cas(room.version,{...room,status:'closed',version:room.version+1});}catch{}
 for(const account of data.accounts)try{const r=await fetch(`${url}/auth/v1/admin/users/${account.id}`,{method:'DELETE',headers});if(r.ok)deleted++;}catch{}
 }
 }
 return {run:data.run,status:failure?'failed':'passed',failure,shots:data.current?.view?.shots?.length||0,batches:data.batches,createdAccounts:data.accounts.length,deletedAccounts:deleted,cleanupComplete:deleted===data.accounts.length,checks:failure?0:1,passed:failure?[]:['complete scripted fleet match through real Auth HTTP, five sinks, winning-action replay']};
}
