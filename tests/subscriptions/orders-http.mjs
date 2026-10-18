import assert from 'node:assert/strict';
import {test} from 'node:test';
import {fixture,createCommerceHandler} from './commerce-fixture.mjs';
function setup(){const f=fixture(),handler=createCommerceHandler(f.service,{enabled:true,allowRequest:async()=>true});
 const request=(path='',init={})=>handler(new Request('https://example.test/api/rentals/orders'+path,{headers:{Authorization:'Bearer session:alice',...init.headers},...init,...(init.headers?{headers:{Authorization:'Bearer session:alice',...init.headers}}:{})}));
 return {...f,handler,request};}
const post=(body={})=>({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});

test('HTTP factory is disabled until host readiness and rate limiting are supplied',async()=>{
 const f=fixture();const request=new Request('https://example.test/api/rentals/orders');
 assert.equal((await createCommerceHandler(f.service)(request)).status,503);
 assert.equal((await createCommerceHandler(f.service,{enabled:true})(request)).status,503);
});
test('authentication and rate limiting fail closed with no ledger writes',async()=>{
 const f=setup();assert.equal((await f.handler(new Request('https://example.test/api/rentals/orders'))).status,401);
 assert.equal((await f.request('',{headers:{Authorization:'Bearer unknown'}})).status,401);
 const limited=createCommerceHandler(f.service,{enabled:true,allowRequest:async()=>false});
 assert.equal((await limited(new Request('https://example.test/api/rentals/orders',{headers:{Authorization:'Bearer session:alice'}}))).status,429);
 assert.equal(Object.keys(f.ledger.data.orders).length,0);
});
test('create/read response strips internal ownership, request and payment fields',async()=>{
 const f=setup(),response=await f.request('',post({offerId:'one',offerRevision:'r1',requestKey:'request_key_000001'}));
 assert.equal(response.status,201);const {order}=await response.json();
 assert.equal(order.amount,10000);assert.equal(order.ownerId,undefined);assert.equal(order.requestKey,undefined);assert.equal(order.paymentKey,undefined);assert.equal(order.offer,undefined);
 assert.match(response.headers.get('cache-control'),/no-store/);assert.equal(response.headers.get('vary'),'Authorization');
 const detail=await f.request('/'+order.id);assert.equal(detail.status,200);
 const another=await f.request('/'+order.id,{headers:{Authorization:'Bearer session:bob'}});assert.equal(another.status,404);
});
test('owner-only history has deterministic keyset pagination across identical timestamps',async()=>{
 const f=setup();const orders=await Promise.all(Array.from({length:7},(_,i)=>f.create('request_key_'+String(i).padStart(6,'0'))));
 await f.service.createOrder('session:bob',{offerId:'one',offerRevision:'r1',requestKey:'request_key_000000'});
 let cursor=null;const ids=[];
 do{const params=new URLSearchParams({limit:'2'});if(cursor)params.set('cursor',JSON.stringify(cursor));
 const r=await f.request('?'+params);assert.equal(r.status,200);const page=await r.json();ids.push(...page.orders.map(o=>o.id));cursor=page.nextCursor;}while(cursor);
 assert.equal(ids.length,7);assert.equal(new Set(ids).size,7);assert.deepEqual(new Set(ids),new Set(orders.map(o=>o.id)));
});
test('list expires pending orders and paid history describes only its rental grants',async()=>{
 const f=setup(),a=await f.create(),b=await f.create('request_key_000002');await f.send(f.event(a));f.time(b.expiresAt);
 const body=await (await f.request()).json();assert.equal(body.orders.find(o=>o.id===b.id).state,'expired');
 const paid=body.orders.find(o=>o.id===a.id);assert.equal(paid.state,'paid');assert.equal(paid.grants.length,1);assert.equal(paid.paymentKey,undefined);assert.equal(paid.grants[0].ownerId,undefined);
});
test('server refuses injected ownership, prices, invalid pages and cursors',async()=>{
 const f=setup();for(const body of [{offerId:'one',offerRevision:'r1',requestKey:'request_key_000001',amount:1},{ownerId:'bob'}])assert.equal((await f.request('',post(body))).status,400);
 for(const query of ['?limit=0','?limit=51','?limit=NaN','?limit=2&limit=3','?ownerId=bob','?cursor=garbage','?cursor='+encodeURIComponent('{"id":"x","createdAt":"bad"}')])assert.equal((await f.request(query)).status,400,query);
 assert.equal(Object.keys(f.ledger.data.orders).length,0);
});
test('JSON content type, strict fields and byte limits are enforced',async()=>{
 const f=setup();assert.equal((await f.request('',{method:'POST',body:'{}'})).status,415);
 assert.equal((await f.request('',{method:'POST',headers:{'Content-Type':'application/json'},body:'{'})).status,400);
 assert.equal((await f.request('',{method:'POST',headers:{'Content-Type':'application/json'},body:'[]'})).status,400);
 assert.equal((await f.request('',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({data:'x'.repeat(5000)})})).status,413);
});
test('cancel requires owner; cancellation after payment refreshes with conflict',async()=>{
 const f=setup(),o=await f.create();assert.equal((await f.request('/'+o.id+'/cancel',{...post(),headers:{'Content-Type':'application/json',Authorization:'Bearer session:bob'}})).status,404);
 assert.equal((await f.request('/'+o.id+'/cancel',post({paid:true}))).status,400);
 await f.send(f.event(o));const r=await f.request('/'+o.id+'/cancel',post());assert.equal(r.status,409);assert.deepEqual(await r.json(),{error:'order_cannot_cancel'});
 const pending=await f.create('request_key_000002'),cancel=await f.request('/'+pending.id+'/cancel',post());assert.equal((await cancel.json()).order.state,'cancelled');
});
test('unexpected failures are sanitized and never cacheable',async()=>{
 const f=setup();f.ledger.transaction=async()=>{throw Error('SECRET_DATABASE_URL')};const r=await f.request();assert.equal(r.status,503);assert.deepEqual(await r.json(),{error:'service_unavailable'});assert.match(r.headers.get('cache-control'),/no-store/);
});
test('owner defense catches a persistence adapter that leaks another user',async()=>{
 const f=setup(),o=await f.create();const original=f.ledger.transaction.bind(f.ledger);
 f.ledger.transaction=work=>original(tx=>work({...tx,orders:async()=>[{...o,ownerId:'bob'}]}));
 const r=await f.request();assert.equal(r.status,503);assert.equal((await r.text()).includes(o.id),false);
});
