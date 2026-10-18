import assert from 'node:assert/strict';
import {test} from 'node:test';
import {build} from 'esbuild';
import {fixture,createCommerceHandler} from './commerce-fixture.mjs';
const code=c=>e=>e.code===c;
test('healthy paid, future renewal and refunded orders produce no consistency findings',async()=>{
 const f=fixture(),a=await f.create(),b=await f.create('request_key_000002');await f.send(f.event(a));await f.send(f.event(b));
 assert.deepEqual((await f.service.reconcile('session:bob')).findings,[]);
 await f.send(f.event(a,{kind:'refunded'}));assert.deepEqual((await f.service.reconcile('session:bob')).findings,[]);
});
test('detect missing grants and payment mismatch without mutating ledger',async()=>{
 const f=fixture(),o=await f.create();await f.send(f.event(o));f.ledger.data.grants={};f.ledger.data.payments={};const before=structuredClone(f.ledger.data);
 const p=await f.service.reconcile('session:bob');assert.deepEqual(p.findings.map(f=>f.code).sort(),['paid_payment_mismatch','paid_without_grant']);assert.deepEqual(f.ledger.data,before);
});
test('detect wrong owner, scope, dates, duplicate and unrevoked refunded grants',async()=>{
 const f=fixture(),o=await f.create();await f.send(f.event(o));const g=f.grants()[0];
 Object.assign(f.ledger.data.grants[g.id],{ownerId:'bob',gameIds:['wrong'],expiresAt:g.startsAt});
 f.ledger.data.grants.duplicate={...g,id:'duplicate'};f.ledger.data.orders[o.id].state='refunded';
 const codes=(await f.service.reconcile('session:bob')).findings.map(f=>f.code);
 for(const c of ['grant_owner_mismatch','grant_coverage_mismatch','invalid_grant_dates','duplicate_grants','refunded_unrevoked_grant'])assert.ok(codes.includes(c));
});
test('scan authorization and readiness fail closed',async()=>{
 const f=fixture();await assert.rejects(f.service.reconcile('session:alice'),code('admin_required'));
 f.ledger.data.permissions.bob=[];await assert.rejects(f.service.reconcile('session:bob'),code('admin_permission_required'));
 await assert.rejects(fixture({assurance:'aal1'}).service.reconcile('session:bob'),code('admin_mfa_required'));
 const req=()=>new Request('https://test/api/rentals/admin/reconciliation',{headers:{Authorization:'Bearer session:bob'}});
 assert.equal((await createCommerceHandler(f.service,{enabled:true,allowRequest:async()=>true})(req())).status,503);
 f.ledger.data.permissions.bob=['reviews.read'];const handler=createCommerceHandler(f.service,{enabled:true,reconciliationEnabled:true,allowRequest:async()=>true});
 assert.equal((await handler(req())).status,200);
});
test('bounded scan visits tied timestamps once with exclusive cursor',async()=>{
 const f=fixture();for(let i=0;i<53;i++)await f.create('request_key_'+String(i).padStart(6,'0'));
 const a=await f.service.reconcile('session:bob'),b=await f.service.reconcile('session:bob',a.nextCursor);
 assert.equal(a.scanned,50);assert.equal(b.scanned,3);assert.equal(b.nextCursor,null);
});
test('permanent ownership blocks quotes, creation and checkout after ownership changes',async()=>{
 const f=fixture();f.ledger.data.permanent.alice=['tile-2048'];
 await assert.rejects(f.service.quote('session:alice','one'),code('already_owned'));await assert.rejects(f.create(),code('already_owned'));
 f.ledger.data.permanent.alice=[];const o=await f.create();f.ledger.data.permanent.alice=['tile-2048'];
 await assert.rejects(f.checkout.begin('session:alice',o.id),code('already_owned'));assert.equal(Object.keys(f.ledger.data.checkouts).length,0);
});
test('partially owned bundles remain eligible, fully owned bundles do not',async()=>{
 const f=fixture();Object.assign(f.ledger.data.offers.one,{scope:'bundle',gameIds:['tile-2048','second']});f.ledger.data.permanent.alice=['tile-2048'];
 await f.service.quote('session:alice','one');f.ledger.data.permanent.alice.push('second');await assert.rejects(f.create(),code('already_owned'));
 Object.assign(f.ledger.data.offers.one,{scope:'all',gameIds:[]});await f.create();
});
const bundle=await build({entryPoints:['server/commerce/maintenance-policy.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {maintenanceCreditMs}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
test('maintenance proposal unions overlapping incidents, clips to rental and requires full coverage',()=>{
 const grant={startsAt:'2026-10-18T10:00:00Z',expiresAt:'2026-10-18T14:00:00Z',gameIds:['a'],allGames:false};
 const incident=(start,end)=>({startsAt:`2026-10-18T${start}:00:00Z`,endsAt:`2026-10-18T${end}:00:00Z`,gameIds:['a'],allGames:false});
 const events=[incident('09','11'),incident('10','12'),incident('13','16')];
 assert.equal(maintenanceCreditMs(grant,events),3*3600000);
 assert.equal(maintenanceCreditMs({...grant,gameIds:['a','b']},events),0);
 assert.equal(maintenanceCreditMs({...grant,allGames:true},events),0);
 assert.equal(maintenanceCreditMs({...grant,revokedAt:'2026-10-18T11:00:00Z'},events),0);
 assert.throws(()=>maintenanceCreditMs(grant,[incident('12','11')]),/invalid_incident_dates/);
});
test('payment after permanent ownership goes to review and cannot be manually granted',async()=>{
 const f=fixture(),o=await f.create();f.ledger.data.permanent.alice=['tile-2048'];
 assert.equal((await f.send(f.event(o))).reason,'already_owned');assert.equal(f.grants().length,0);
 const c=Object.values(f.ledger.data.reviews)[0];
 assert.equal((await f.service.reviewDetails('session:bob',c.id)).review.canGrant,false);
 await assert.rejects(f.service.decideReview('session:bob',c.id,{action:'grant_access',expectedRevision:1,reason:'Checked the account',requestKey:'review_request_00001'}),code('review_grant_forbidden'));
});
