import assert from 'node:assert/strict';
import {test} from 'node:test';
import {build} from 'esbuild';
import {fixture,createCommerceHandler} from './commerce-fixture.mjs';
const code=c=>e=>e.code===c;
async function reviewed(extra={}){const f=fixture(),o=await f.create();f.time(o.expiresAt);const event=f.event(o,extra);await f.send(event);const c=Object.values(f.ledger.data.reviews)[0];return {...f,o,event,c}}
const decision=(c,extra={})=>({action:'note',expectedRevision:c.revision,reason:'QA checked provider record',requestKey:'review_request_00001',...extra});

test('verified abnormal events enter queue once with a minimal event snapshot',async()=>{
 const f=await reviewed();await f.send(f.event);
 assert.equal(Object.keys(f.ledger.data.reviews).length,1);
 const page=await f.service.listReviews('session:bob');assert.equal(page.reviews.length,1);assert.equal(page.reviews[0].canGrant,true);
 assert.equal(page.reviews[0].event.orderId,undefined);assert.equal(page.reviews[0].paymentKey,undefined);
});
test('admin membership is checked server-side for every read and write',async()=>{
 const f=await reviewed();for(const task of [()=>f.service.listReviews('session:alice'),()=>f.service.reviewDetails('session:alice',f.c.id),()=>f.service.decideReview('session:alice',f.c.id,decision(f.c))])await assert.rejects(task(),code('admin_required'));
 f.ledger.data.admins=[];await assert.rejects(f.service.decideReview('session:bob',f.c.id,decision(f.c)),code('admin_required'));
 assert.equal(f.ledger.data.reviews[f.c.id].revision,1);
});
test('notes require reason/revision and save before/after audit atomically',async()=>{
 const f=await reviewed();await assert.rejects(f.service.decideReview('session:bob',f.c.id,decision(f.c,{reason:' '})),code('invalid_review_decision'));
 await assert.rejects(f.service.decideReview('session:bob',f.c.id,decision(f.c,{expectedRevision:2})),code('review_stale'));
 const reply=await f.service.decideReview('session:bob',f.c.id,decision(f.c));assert.equal(reply.review.revision,2);assert.equal(reply.review.status,'open');assert.equal(f.grants().length,0);
 const log=f.ledger.data.audit.find(a=>a.action==='review_note');assert.equal(log.actor,'bob');assert.equal(log.before.revision,1);assert.equal(log.after.revision,2);
});
test('retrying identical admin command does not duplicate notes; changing content rejects key reuse',async()=>{
 const f=await reviewed(),input=decision(f.c);await Promise.all(Array.from({length:8},()=>f.service.decideReview('session:bob',f.c.id,input)));
 assert.equal(f.ledger.data.reviews[f.c.id].history.length,1);
 await assert.rejects(f.service.decideReview('session:bob',f.c.id,{...input,reason:'Different contents'}),code('request_key_reused'));
});
test('eligible late payment approval grants once with concurrent decisions',async()=>{
 const f=await reviewed(),input=decision(f.c,{action:'grant_access'});
 await Promise.all(Array.from({length:8},()=>f.service.decideReview('session:bob',f.c.id,input)));
 assert.equal(f.grants().length,1);assert.equal(f.ledger.data.orders[f.o.id].state,'paid');assert.equal(f.ledger.data.reviews[f.c.id].status,'resolved');
 await f.send({...f.event,eventId:'success-again'});assert.equal(f.grants().length,1);
 await assert.rejects(f.service.decideReview('session:bob',f.c.id,decision({...f.c,revision:2},{requestKey:'review_request_00002'})),code('review_closed'));
});
test('wrong amount, currency, refund or already-settled order cannot be granted by review',async()=>{
 for(const extra of [{amount:9999},{currency:'USD'},{kind:'refunded',amount:1000}]){
  const f=await reviewed(extra);const view=await f.service.reviewDetails('session:bob',f.c.id);assert.equal(view.review.canGrant,false);
  await assert.rejects(f.service.decideReview('session:bob',f.c.id,decision(f.c,{action:'grant_access'})),code('review_grant_forbidden'));assert.equal(f.grants().length,0);
 }
 const f=fixture(),o=await f.create();await f.send(f.event(o));await f.send(f.event(o,{paymentId:'extra-payment'}));const c=Object.values(f.ledger.data.reviews)[0];
 await assert.rejects(f.service.decideReview('session:bob',c.id,decision(c,{action:'grant_access'})),code('review_grant_forbidden'));assert.equal(f.grants().length,1);
});
test('refund queue records work without changing payments or granting access',async()=>{
 const f=await reviewed(),before=structuredClone(f.ledger.data.payments);const reply=await f.service.decideReview('session:bob',f.c.id,decision(f.c,{action:'queue_refund'}));
 assert.equal(reply.review.status,'awaiting_refund');assert.deepEqual(f.ledger.data.payments,before);assert.equal(f.grants().length,0);
 assert.equal((await f.service.listReviews('session:bob',{status:'awaiting_refund'})).reviews.length,1);
 await f.send({...f.event,kind:'refunded',eventId:'verified-refund'});
 const current=f.ledger.data.reviews[f.c.id];assert.equal(current.status,'resolved');assert.equal(current.history.at(-1).action,'provider_refund');
 await assert.rejects(f.service.decideReview('session:bob',f.c.id,decision({...f.c,revision:2},{action:'grant_access',requestKey:'review_request_00002'})),code('review_stale'));
});
test('refund amount/currency matches actual verified payment when an order was underpaid or wrong-currency',async()=>{
 for(const extra of [{amount:9000},{amount:10000,currency:'USD'}]){
  const f=await reviewed(extra);await f.send({...f.event,kind:'refunded',eventId:'actual-full-refund'});
  assert.equal(f.ledger.data.reviews[f.c.id].status,'resolved');assert.equal(f.ledger.data.orders[f.o.id].state,'refunded');assert.equal(f.grants().length,0);
 }
});
test('closing a case keeps financial and entitlement records unchanged',async()=>{
 const f=await reviewed(),before=structuredClone({orders:f.ledger.data.orders,payments:f.ledger.data.payments,grants:f.ledger.data.grants});
 await f.service.decideReview('session:bob',f.c.id,decision(f.c,{action:'dismiss'}));
 assert.equal(f.ledger.data.reviews[f.c.id].status,'resolved');assert.deepEqual({orders:f.ledger.data.orders,payments:f.ledger.data.payments,grants:f.ledger.data.grants},before);
});
test('audit failure rolls back review, entitlement and command together',async()=>{
 const f=await reviewed(),before=structuredClone(f.ledger.data);f.ledger.failAudit=true;
 await assert.rejects(f.service.decideReview('session:bob',f.c.id,decision(f.c,{action:'grant_access'})),/audit unavailable/);assert.deepEqual(f.ledger.data,before);
 f.ledger.failAudit=false;await f.service.decideReview('session:bob',f.c.id,decision(f.c,{action:'grant_access'}));assert.equal(f.grants().length,1);
});
test('concurrent approval and full refund leave no active refunded grant',async()=>{
 const f=await reviewed();await Promise.allSettled([f.service.decideReview('session:bob',f.c.id,decision(f.c,{action:'grant_access'})),f.send({...f.event,kind:'refunded',eventId:'refund-race'})]);
 assert.equal(f.ledger.data.orders[f.o.id].state,'refunded');assert.equal(f.grants().filter(g=>!g.revokedAt).length,0);
});
test('HTTP exposes admin queue/detail/decision with membership and private responses',async()=>{
 const f=await reviewed(),handler=createCommerceHandler(f.service,{enabled:true,reviewEnabled:true,allowRequest:async()=>true});
 const req=(path='',user='bob',init={})=>handler(new Request('https://example.test/api/rentals/admin/reviews'+path,{...init,headers:{Authorization:'Bearer session:'+user,...init.headers}}));
 assert.equal((await req('','alice')).status,403);assert.equal((await req('/missing','alice')).status,403);
 const list=await req();assert.match(list.headers.get('cache-control'),/no-store/);assert.equal((await list.json()).reviews.length,1);
 assert.equal((await req('?status=bogus')).status,400);
 assert.equal((await req('/'+f.c.id)).status,200);
 const init={method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(decision(f.c))};
 assert.equal((await req('/'+f.c.id+'/decide','alice',init)).status,403);
 assert.equal((await req('/'+f.c.id+'/decide','bob',{...init,body:JSON.stringify({...decision(f.c),ownerId:'injected'})})).status,400);
 assert.equal((await req('/'+f.c.id+'/decide','bob',init)).status,200);
 assert.equal((await req('/'+f.c.id+'/decide','bob',{...init,body:JSON.stringify(decision(f.c,{requestKey:'review_request_00002'}))})).status,409);
});
const clientBundle=await build({entryPoints:['src/commerce/review-client.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {createReviewClient}=await import('data:text/javascript;base64,'+Buffer.from(clientBundle.outputFiles[0].text).toString('base64'));
test('review client performs real handler roundtrip and preserves no-store transport',async()=>{
 const f=await reviewed(),handler=createCommerceHandler(f.service,{enabled:true,reviewEnabled:true,allowRequest:async()=>true});let last;
 const api=createReviewClient({enabled:true,readSession:async()=>({owner:'bob',token:'session:bob'}),fetcher:async(path,init)=>{last=init;return handler(new Request('https://example.test'+path,init))}});
 const page=await api.list('bob','open');assert.equal(page.reviews[0].id,f.c.id);assert.equal((await api.detail('bob',f.c.id)).review.canGrant,true);
 const reply=await api.decide('bob',f.c.id,decision(f.c,{action:'queue_refund'}));assert.equal(reply.review.status,'awaiting_refund');assert.equal(last.cache,'no-store');assert.equal(last.credentials,'omit');
});
test('disabled review client avoids all session/network calls; malformed data fails closed',async()=>{
 let calls=0;const api=createReviewClient({enabled:false,readSession:async()=>{calls++;return null},fetcher:async()=>{calls++}});
 await assert.rejects(api.list('bob','open'),code('orders_unavailable'));assert.equal(calls,0);
 const malformed=createReviewClient({enabled:true,readSession:async()=>({owner:'bob',token:'session:bob'}),fetcher:async()=>Response.json({reviews:[{id:'bad'}],nextCursor:null,serverTime:new Date().toISOString()})});
 await assert.rejects(malformed.list('bob','open'),code('invalid_response'));
});

test('review HTTP readiness is independent from owner history readiness',async()=>{
 const f=await reviewed(),handler=createCommerceHandler(f.service,{enabled:true,allowRequest:async()=>true});
 const r=await handler(new Request('https://example.test/api/rentals/admin/reviews',{headers:{Authorization:'Bearer session:bob'}}));assert.equal(r.status,503);assert.deepEqual(await r.json(),{error:'reviews_unavailable'});
});
test('two admins cannot apply conflicting decisions from the same revision',async()=>{
 const f=await reviewed();f.ledger.data.admins.push('alice');
 const results=await Promise.allSettled([f.service.decideReview('session:bob',f.c.id,decision(f.c,{action:'grant_access'})),f.service.decideReview('session:alice',f.c.id,decision(f.c,{action:'queue_refund'}))]);
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.find(r=>r.status==='rejected').reason.code,'review_stale');assert.equal(f.grants().length,1);
});
test('refund completed before admin approval invalidates the viewed revision',async()=>{
 const f=await reviewed();await f.send({...f.event,kind:'refunded',eventId:'refund-before-approval'});
 await assert.rejects(f.service.decideReview('session:bob',f.c.id,decision(f.c,{action:'grant_access'})),code('review_stale'));assert.equal(f.grants().length,0);
});
