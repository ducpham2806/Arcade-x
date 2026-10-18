import assert from 'node:assert/strict';
import {test} from 'node:test';
import {fixture,CommerceError,addTerm,grantActive} from './commerce-fixture.mjs';
const clone=value=>structuredClone(value);
const code=expected=>e=>e.code===expected;

test('price is read from server; immutable snapshot survives catalog edit',async()=>{
  const f=fixture(),o=await f.create();f.ledger.data.offers.one.amount=99999;f.ledger.data.offers.one.gameIds=['other'];
  await f.send(f.event(o));assert.equal(f.grants().length,1);assert.deepEqual(f.grants()[0].gameIds,['tile-2048']);assert.equal(o.offer.amount,10000);
});
test('stale quote, disabled checkout, unavailable games and invalid amounts fail closed',async()=>{
  const f=fixture();await assert.rejects(f.create(undefined,{offerRevision:'old'}),code('price_changed'));
  f.ledger.data.enabled=false;await assert.rejects(f.create(),code('checkout_disabled'));
  f.ledger.data.enabled=true;f.ledger.data.available=false;await assert.rejects(f.create(),code('game_unavailable'));
  f.ledger.data.available=true;f.ledger.data.offers.one.amount=10.5;await assert.rejects(f.create(),code('offer_unavailable'));
  assert.equal(Object.keys(f.ledger.data.orders).length,0);
});
test('only registered eligible authenticated owners may create',async()=>{
  const f=fixture();await assert.rejects(f.service.createOrder({userId:'alice'},{}),code('unauthenticated'));
  for(const account of [{registered:false,pilot:true,blocked:false},{registered:true,pilot:false,blocked:false},{registered:true,pilot:true,blocked:true}]){
    f.ledger.data.accounts.alice=account;await assert.rejects(f.create(),code('account_not_eligible'));
  }
});
test('concurrent repeated checkout returns one order; key cannot change purchase',async()=>{
  const f=fixture();const orders=await Promise.all(Array.from({length:12},()=>f.create()));
  assert.equal(new Set(orders.map(o=>o.id)).size,1);assert.equal(Object.keys(f.ledger.data.orders).length,1);
  await assert.rejects(f.create(undefined,{offerId:'different'}),code('request_key_reused'));
  // An interrupted checkout can still recover its existing order while new checkout is off.
  f.ledger.data.enabled=false;assert.equal((await f.create()).id,orders[0].id);
});
test('order read/cancel is owner-only and cancellation is idempotent',async()=>{
  const f=fixture(),o=await f.create();
  await assert.rejects(f.service.getOrder('session:bob',o.id),code('order_not_found'));
  await assert.rejects(f.service.cancelOrder('session:bob',o.id),code('order_not_found'));
  assert.equal((await f.service.cancelOrder('session:alice',o.id)).state,'cancelled');
  assert.equal((await f.service.cancelOrder('session:alice',o.id)).state,'cancelled');
  assert.equal((await f.send(f.event(o))).outcome,'review');assert.equal(f.grants().length,0);
});
test('forged webhook fails before touching ledger',async()=>{
  const f=fixture(),o=await f.create(),before=clone(f.ledger.data);
  await assert.rejects(f.send(f.event(o),{}),code('invalid_signature'));assert.deepEqual(f.ledger.data,before);
});
test('concurrent duplicate delivery and new event ID for same payment grant once',async()=>{
  const f=fixture(),o=await f.create(),e=f.event(o);
  await Promise.all(Array.from({length:20},()=>f.send(e)));assert.equal(f.grants().length,1);
  assert.equal((await f.send({...e,eventId:'another-event'})).outcome,'duplicate');assert.equal(f.grants().length,1);
  assert.equal(f.ledger.data.audit.filter(a=>a.action==='payment_unlocked').length,1);
});
test('reused event payload or payment on another order is rejected',async()=>{
  const f=fixture(),o=await f.create(),e=f.event(o);await f.send(e);
  await assert.rejects(f.send({...e,amount:e.amount+1}),code('event_id_conflict'));
  const other=await f.create('request_key_000002');
  await assert.rejects(f.send(f.event(other,{paymentId:e.paymentId})),code('payment_order_conflict'));assert.equal(f.grants().length,1);
});
test('wrong amount/currency quarantines without granting',async()=>{
  for(const extra of [{amount:9999},{amount:10001},{currency:'USD'}]){
    const f=fixture(),o=await f.create();assert.equal((await f.send(f.event(o,extra))).outcome,'review');assert.equal(f.grants().length,0);
    assert.equal((await f.service.getOrder('session:alice',o.id)).state,'review');
  }
});
test('invalid timestamps, fractional and negative event money are rejected',async()=>{
  for(const extra of [{occurredAt:'not-a-date'},{occurredAt:'2026-10-19T10:00:00Z'},{amount:0},{amount:1.5},{amount:-1}]){
    const f=fixture(),o=await f.create();await assert.rejects(f.send(f.event(o,extra)),code('invalid_payment_event'));assert.equal(f.grants().length,0);
  }
});
test('order expires at exact deadline; a late payment goes to review',async()=>{
  const f=fixture(),o=await f.create();f.time(o.expiresAt);
  assert.equal((await f.service.getOrder('session:alice',o.id)).state,'expired');
  assert.equal((await f.send(f.event(o))).reason,'outside_payment_window');assert.equal(f.grants().length,0);
});
test('delayed delivery of an on-time payment starts rental on receipt',async()=>{
  const f=fixture(),o=await f.create(),e=f.event(o);f.time('2026-10-18T12:00:00Z');
  await f.service.getOrder('session:alice',o.id);assert.equal((await f.send(e)).outcome,'unlocked');
  assert.equal(f.grants()[0].startsAt,'2026-10-18T12:00:00.000Z');
  await assert.rejects(f.service.cancelOrder('session:alice',o.id),code('order_cannot_cancel'));
});
test('same coverage renewals append without losing remaining time, even concurrently',async()=>{
  const f=fixture(),a=await f.create('request_key_000001'),b=await f.create('request_key_000002');
  await Promise.all([f.send(f.event(a)),f.send(f.event(b))]);
  const grants=f.grants().sort((a,b)=>a.startsAt.localeCompare(b.startsAt));
  assert.equal(grants[0].expiresAt,grants[1].startsAt);assert.equal(grants[1].expiresAt,'2026-11-01T10:00:00.000Z');
  assert.equal(grantActive(grants[0],grants[0].startsAt),true);assert.equal(grantActive(grants[0],grants[0].expiresAt),false);
  assert.equal(grantActive(grants[1],grants[0].startsAt),false);
});
test('different coverage begins now and does not consume another rental',async()=>{
  const f=fixture(),a=await f.create();await f.send(f.event(a));
  f.ledger.data.offers.one={...f.ledger.data.offers.one,revision:'r2',scope:'all',gameIds:[]};
  const b=await f.create('request_key_000002');await f.send(f.event(b));
  assert.equal(f.grants()[0].startsAt,f.grants()[1].startsAt);assert.equal(f.grants()[1].allGames,true);
});
test('a second payment for one order creates review without a second grant',async()=>{
  const f=fixture(),o=await f.create();await f.send(f.event(o));
  const extra=f.event(o,{paymentId:'accidental-second-payment'});assert.equal((await f.send(extra)).reason,'extra_payment');
  assert.equal(f.grants().length,1);assert.equal((await f.service.getOrder('session:alice',o.id)).state,'paid');
  await f.send({...extra,eventId:'refund-extra',kind:'refunded'});assert.equal(f.grants()[0].revokedAt,undefined);
});
test('full refund revokes only that order and retries cannot restore it',async()=>{
  const f=fixture(),a=await f.create(),b=await f.create('request_key_000002'),e=f.event(a);
  await f.send(e);await f.send(f.event(b));const refund={...e,eventId:'refund-one',kind:'refunded'};
  assert.equal((await f.send(refund)).outcome,'refunded');await f.send(refund);
  assert.ok(f.grants().find(g=>g.orderId===a.id).revokedAt);assert.equal(f.grants().find(g=>g.orderId===b.id).revokedAt,undefined);
  assert.equal((await f.send({...e,eventId:'late-success'})).reason,'already_refunded');assert.equal(f.grants().length,2);
});
test('refund received before success leaves tombstone and never grants',async()=>{
  const f=fixture(),o=await f.create(),e=f.event(o);await f.send({...e,eventId:'refund-first',kind:'refunded'});
  await f.send(e);assert.equal(f.grants().length,0);assert.equal((await f.service.getOrder('session:alice',o.id)).state,'refunded');
});
test('partial refund is flagged for review and does not implicitly revoke other grants',async()=>{
  const f=fixture(),o=await f.create(),e=f.event(o);await f.send(e);
  assert.equal((await f.send({...e,eventId:'partial',kind:'refunded',amount:1000})).reason,'partial_or_excess_refund');
  assert.equal(f.grants()[0].revokedAt,undefined);
});
test('atomic rollback when audit fails prevents half-paid or half-granted orders',async()=>{
  const f=fixture(),o=await f.create(),e=f.event(o),before=clone(f.ledger.data);f.ledger.failAudit=true;
  await assert.rejects(f.send(e),/audit unavailable/);assert.deepEqual(f.ledger.data,before);
  f.ledger.failAudit=false;await f.send(e);assert.equal(f.grants().length,1);
});
test('all six terms, leap years, month-end clamp and expiry boundary',()=>{
  const start='2026-01-31T10:11:12.000Z';
  for(const [term,expected] of [['7d','2026-02-07'],['14d','2026-02-14'],['30d','2026-03-02'],['3m','2026-04-30'],['6m','2026-07-31'],['1y','2027-01-31']])assert.equal(addTerm(start,term),`${expected}T10:11:12.000Z`);
  assert.equal(addTerm('2024-02-29T00:00:00.000Z','1y'),'2025-02-28T00:00:00.000Z');
  assert.throws(()=>addTerm(start,'2d'),code('invalid_term'));
});
