import {build} from 'esbuild';
import assert from 'node:assert/strict';
const {outputFiles}=await build({entryPoints:['src/games/word-chain/online-client.ts'],bundle:true,write:false,platform:'node',format:'esm'});
const {WordChainClient,RoomTransportError,httpRoomTransport}=await import('data:text/javascript;base64,'+Buffer.from(outputFiles[0].text).toString('base64'));
const deferred=()=>{let resolve;const promise=new Promise(r=>{resolve=r;});return {promise,resolve};};
const snapshot=(version=1)=>({id:'room-a',version,seat:'P1',status:'waiting',serverNow:1000});
let checks=0;
const test=async(name,fn)=>{await fn();checks++;console.log('PASS',name);};

await test('close clears owner state and rejects late responses',async()=>{
 const pending=deferred();let requests=0;
 const c=new WordChainClient({request:()=>{requests++;return pending.promise;}},()=>1000,()=> 'request-a');
 const task=c.create(2);await Promise.resolve();c.close();pending.resolve(snapshot());await task;
 assert.equal(c.snapshot,null);assert.equal(c.pending,null);assert.equal(c.busy,false);
 await c.create(2);await c.command({type:'start'});assert.equal(requests,1);
});
await test('forget invalidates a response that was already in flight',async()=>{
 const pending=deferred();const c=new WordChainClient({request:()=>pending.promise},()=>1000,()=> 'request-a');
 const task=c.create(2);await Promise.resolve();c.forget();pending.resolve(snapshot());await task;
 assert.equal(c.snapshot,null);assert.equal(c.pending,null);
});
await test('a stale room refreshes before a room command instead of swallowing the tap',async()=>{
 let now=1000;const calls=[];
 const c=new WordChainClient({request:async b=>{calls.push(b);return {...snapshot(calls.length),serverNow:now};}},()=>now,()=> 'request-a');
 await c.create(2);now=10000;
 assert.equal(await c.command({type:'start'}),true);
 assert.deepEqual(calls.map(b=>b.type),['create','snapshot','command']);
});
await test('unresolved mutation keeps its exact action ID and cannot be overwritten',async()=>{
 let requests=0;
 const c=new WordChainClient({request:async()=>{if(++requests===1)return snapshot();throw new RoomTransportError('NETWORK','lost',true);}},()=>1000,()=> 'request-a');
 await c.create(2);await c.command({type:'ready',ready:true});const original=c.pending;
 assert.equal(await c.command({type:'start'}),false);assert.deepEqual(c.pending,original);
});
await test('leave reconciles a late create before releasing its chair',async()=>{
 const pending=deferred(),calls=[];
 const c=new WordChainClient({request:async b=>{calls.push(b);return calls.length===1?pending.promise:{...snapshot(2),status:'closed'};}},()=>1000,()=> 'request-a');
 const creating=c.create(2);await Promise.resolve();const leaving=c.leave();
 pending.resolve(snapshot());await creating;assert.equal(await leaving,true);
 assert.deepEqual(calls.map(b=>b.type==='command'?b.command.type:b.type),['create','leave']);
 assert.equal(c.snapshot,null);
});
await test('lost leave ACK keeps the room visible; retry can confirm already-left membership',async()=>{
 let requests=0;const calls=[];
 const c=new WordChainClient({request:async b=>{calls.push(b);if(++requests===1)return snapshot();if(requests===2)throw new RoomTransportError('NETWORK','lost ACK',true);throw new RoomTransportError('NOT_MEMBER','already left');}},()=>1000,()=> 'request-a');
 await c.create(2);assert.equal(await c.leave(),false);assert.ok(c.snapshot);const action=c.pending.actionId;
 assert.equal(await c.leave(),true);assert.equal(c.snapshot,null);assert.equal(calls[2].actionId,action);
});
await test('cancel after an uncertain create retries that same request before leave',async()=>{
 const calls=[];
 const c=new WordChainClient({request:async b=>{calls.push(b);if(calls.length===1)throw new RoomTransportError('NETWORK','lost',true);return {...snapshot(calls.length),status:b.type==='command'?'closed':'waiting'};}},()=>1000,()=> 'request-a');
 await c.create(2);assert.equal(await c.leave(),true);
 assert.deepEqual(calls.slice(0,2),[calls[0],calls[0]]);assert.equal(calls[2].command.type,'leave');
});
await test('request after read waits for the read to settle',async()=>{
 const pending=deferred(),calls=[];
 const c=new WordChainClient({request:async b=>{calls.push(b);return calls.length===2?pending.promise:snapshot(calls.length);}},()=>1000,()=> 'request-a');
 await c.create(2);const read=c.refresh(),command=c.command({type:'start'});
 await Promise.resolve();assert.equal(calls.length,2);pending.resolve(snapshot(2));await read;
 assert.equal(await command,true);assert.equal(calls[2].version,2);
});
await test('transport accepts a lifecycle abort signal',async()=>{
 const controller=new AbortController();let signal;
 const t=httpRoomTransport('https://edge.example','public-key',async()=> 'token',async(_url,init)=>{signal=init.signal;controller.abort();throw new Error('aborted');});
 await assert.rejects(t.request({type:'match',requestId:'a'},controller.signal));assert.equal(signal.aborted,true);
});
console.log(`${checks} Word Chain client checks passed`);
