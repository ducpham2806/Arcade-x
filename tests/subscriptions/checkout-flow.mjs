import assert from 'node:assert/strict';
import {test} from 'node:test';
import {build} from 'esbuild';
import {fixture,createCommerceHandler} from './commerce-fixture.mjs';
const code=c=>e=>e.code===c;
const result=input=>({orderId:input.orderId,amount:input.amount,currency:input.currency,reference:'ref-'+input.orderId,url:'https://payments.example.test/session/'+input.orderId,expiresAt:input.expiresAt});
const provider=fn=>({id:'test-provider',create:fn});

test('server quote supplies current price and refuses ineligible account or disabled checkout',async()=>{
 const f=fixture();const q=await f.service.quote('session:alice','one');assert.equal(q.amount,10000);assert.equal(q.revision,'r1');
 f.ledger.data.offers.one.revision='r2';await assert.rejects(f.create(undefined,{offerRevision:q.revision}),code('price_changed'));
 f.ledger.data.enabled=false;await assert.rejects(f.service.quote('session:alice','one'),code('checkout_disabled'));
 f.ledger.data.enabled=true;f.ledger.data.accounts.alice.blocked=true;await assert.rejects(f.service.quote('session:alice','one'),code('account_not_eligible'));
});
test('repeated preparation reuses one ready session and never grants access',async()=>{
 let calls=0;const f=fixture({provider:provider(async input=>{calls++;return result(input)})}),o=await f.create();
 const first=await f.checkout.begin('session:alice',o.id),second=await f.checkout.begin('session:alice',o.id);
 assert.deepEqual(first,second);assert.equal(calls,1);assert.equal(f.grants().length,0);assert.equal(f.ledger.data.orders[o.id].state,'awaiting_payment');assert.equal(first.reference,undefined);assert.equal(first.requestKey,undefined);
});
test('snapshot price is used even after offer edits',async()=>{
 let amount;const f=fixture({provider:provider(async input=>{amount=input.amount;return result(input)})}),o=await f.create();f.ledger.data.offers.one.amount=99999;
 await f.checkout.begin('session:alice',o.id);assert.equal(amount,10000);
});
test('cross-account, cancelled, expired and unavailable games cannot create a provider session',async()=>{
 let calls=0;const f=fixture({provider:provider(async input=>{calls++;return result(input)})}),o=await f.create();
 await assert.rejects(f.checkout.begin('session:bob',o.id),code('order_not_found'));
 f.ledger.data.available=false;await assert.rejects(f.checkout.begin('session:alice',o.id),code('game_unavailable'));f.ledger.data.available=true;
 await f.service.cancelOrder('session:alice',o.id);await assert.rejects(f.checkout.begin('session:alice',o.id),code('checkout_order_changed'));
 const other=await f.create('request_key_000002');f.time(other.expiresAt);await assert.rejects(f.checkout.begin('session:alice',other.id),code('checkout_order_changed'));assert.equal(calls,0);
});
test('in-flight lease prevents duplicate provider calls',async()=>{
 let entered,release,calls=0;const wait=new Promise(r=>{entered=r}),gate=new Promise(r=>{release=r});
 const f=fixture({provider:provider(async input=>{calls++;entered();await gate;return result(input)})}),o=await f.create(),first=f.checkout.begin('session:alice',o.id);await wait;
 await assert.rejects(f.checkout.begin('session:alice',o.id),code('checkout_in_progress'));assert.equal(calls,1);release();await first;
});
test('ambiguous provider timeout retains one idempotency key on retry',async()=>{
 const seen=[],created=new Map();let attempts=0;
 const f=fixture({provider:provider(async input=>{seen.push(input.idempotencyKey);if(!created.has(input.idempotencyKey))created.set(input.idempotencyKey,result(input));if(attempts++===0)throw Error('timeout after provider creation');return created.get(input.idempotencyKey)})}),o=await f.create();
 await assert.rejects(f.checkout.begin('session:alice',o.id),code('checkout_provider_unavailable'));await f.checkout.begin('session:alice',o.id);
 assert.equal(new Set(seen).size,1);assert.equal(created.size,1);assert.equal(f.grants().length,0);
});
test('expired lease recovery cannot let an older response overwrite a newer reservation',async()=>{
 let entered,release,count=0;const wait=new Promise(r=>{entered=r}),gate=new Promise(r=>{release=r}),keys=[];
 const f=fixture({provider:provider(async input=>{keys.push(input.idempotencyKey);if(++count===1){entered();await gate}return result(input)})}),o=await f.create();
 const first=f.checkout.begin('session:alice',o.id);await wait;f.time('2026-10-18T10:00:46Z');const recovered=await f.checkout.begin('session:alice',o.id);release();await assert.rejects(first,code('checkout_in_progress'));
 assert.equal(recovered.url,f.ledger.data.checkouts[o.id].url);assert.equal(new Set(keys).size,1);
});
test('unsafe URLs, changed money/order and invalid expiry fail closed',async()=>{
 for(const change of [r=>({...r,url:'javascript:alert(1)'}),r=>({...r,url:'http://payments.example.test/pay'}),r=>({...r,url:'https://payments.example.test.evil/pay'}),r=>({...r,url:'https://user@payments.example.test/pay'}),r=>({...r,amount:1}),r=>({...r,currency:'USD'}),r=>({...r,orderId:'other-order'}),r=>({...r,expiresAt:'2026-10-19T10:00:00Z'}),r=>({...r,expiresAt:'invalid'})]){
  const f=fixture({provider:provider(async input=>change(result(input)))}),o=await f.create();await assert.rejects(f.checkout.begin('session:alice',o.id));assert.equal(f.ledger.data.checkouts[o.id].state,'creating');assert.equal(f.grants().length,0);
 }
});
test('cancellation during provider network call is rechecked before returning a link',async()=>{
 let f;f=fixture({provider:provider(async input=>{await f.service.cancelOrder('session:alice',input.orderId);return result(input)})});const o=await f.create();
 await assert.rejects(f.checkout.begin('session:alice',o.id),code('checkout_order_changed'));assert.equal(f.ledger.data.orders[o.id].state,'cancelled');assert.equal(f.ledger.data.checkouts[o.id].state,'creating');assert.equal(f.grants().length,0);
});
test('provider references must be unique across orders',async()=>{
 const f=fixture({provider:provider(async input=>({...result(input),reference:'shared-reference'}))}),a=await f.create(),b=await f.create('request_key_000002');
 await f.checkout.begin('session:alice',a.id);await assert.rejects(f.checkout.begin('session:alice',b.id),code('checkout_reference_conflict'));
});
test('expired provider session is never silently replaced with a fresh payment',async()=>{
 let calls=0;const f=fixture({provider:provider(async input=>{calls++;return {...result(input),expiresAt:'2026-10-18T10:05:00Z'}})}),o=await f.create();await f.checkout.begin('session:alice',o.id);
 f.time('2026-10-18T10:05:00Z');await assert.rejects(f.checkout.begin('session:alice',o.id),code('checkout_session_expired'));assert.equal(calls,1);
});
test('HTTP checkout is independently gated and does not accept browser success claims',async()=>{
 const f=fixture(),disabled=createCommerceHandler(f.service,{enabled:true,allowRequest:async()=>true}),enabled=createCommerceHandler(f.service,{enabled:true,checkoutEnabled:true,checkout:f.checkout,allowRequest:async()=>true}),o=await f.create();
 const req=(path,body)=>new Request('https://example.test/api/rentals'+path,{method:body===undefined?'GET':'POST',headers:{Authorization:'Bearer session:alice','Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})});
 assert.equal((await disabled(req('/offers/one/quote'))).status,503);assert.equal((await disabled(req('/orders',{}))).status,503);
 assert.equal((await enabled(req('/orders/'+o.id+'/checkout',{paid:true}))).status,400);assert.equal((await enabled(req('/orders/'+o.id+'?paid=true'))).status,400);
 assert.equal((await enabled(req('/orders/'+o.id+'/checkout',{}))).status,200);assert.equal(f.grants().length,0);
});
const bundle=await build({stdin:{contents:"export * from './src/commerce/checkout-client';export * from './src/commerce/orders-client';",resolveDir:process.cwd()},bundle:true,write:false,format:'esm',platform:'node'});
const {createCheckoutClient,createOrdersClient,safePaymentUrl}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
test('full client flow gets quote, creates one order, opens link and relies on verified settlement',async()=>{
 const f=fixture(),handler=createCommerceHandler(f.service,{enabled:true,checkoutEnabled:true,checkout:f.checkout,allowRequest:async()=>true});
 const options={enabled:true,readSession:async()=>({owner:'alice',token:'session:alice'}),fetcher:async(path,init)=>handler(new Request('https://example.test'+path,init))};
 const api=createCheckoutClient(options),history=createOrdersClient(options),quote=await api.quote('alice','one');
 const input={offerId:quote.offerId,offerRevision:quote.revision,requestKey:'client_request_key_001'};
 const created=await api.create('alice',input),retry=await api.create('alice',input);assert.equal(created.order.id,retry.order.id);
 const link=await api.begin('alice',created.order.id);assert.ok(safePaymentUrl(link.url));assert.equal((await history.detail('alice',created.order.id)).order.state,'awaiting_payment');
 await f.send(f.event(f.ledger.data.orders[created.order.id]));assert.equal((await history.detail('alice',created.order.id)).order.state,'paid');assert.equal(f.grants().length,1);
});
test('disabled checkout client avoids network, and malformed/unsafe link responses are rejected',async()=>{
 let calls=0;const off=createCheckoutClient({enabled:false,readSession:async()=>{calls++;return null}});await assert.rejects(off.quote('alice','one'),code('orders_unavailable'));assert.equal(calls,0);
 for(const url of ['javascript:alert(1)','https://user@payments.example.test/pay']){
  const api=createCheckoutClient({enabled:true,readSession:async()=>({owner:'alice',token:'token'}),fetcher:async()=>Response.json({orderId:'one',url,expiresAt:'2026-10-18T10:30:00Z',serverTime:'2026-10-18T10:00:00Z'})});
  await assert.rejects(api.begin('alice','one'),code('invalid_response'));
 }
});
