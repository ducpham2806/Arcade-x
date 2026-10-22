import {build} from 'esbuild';
const bundle=await build({stdin:{contents:"export * from './server/commerce/service';export * from './server/commerce/http';export * from './server/commerce/checkout';",resolveDir:process.cwd()},bundle:true,write:false,format:'esm',platform:'node'});
export const {CommerceService,CommerceError,addTerm,grantActive,createCommerceHandler,CheckoutCoordinator}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const clone=value=>structuredClone(value);

// Test-only ledger. Transactions are serialized and rolled back in full on failure.
// It is deliberately not a production persistence or authentication adapter.
export class Ledger {
  data={enabled:true,available:true,accounts:{alice:{registered:true,pilot:true,blocked:false},bob:{registered:true,pilot:true,blocked:false}},
    offers:{one:{id:'one',revision:'r1',title:'2048 7 days',scope:'game',gameIds:['tile-2048'],term:'7d',amount:10000,currency:'VND',active:true}},
    permanent:{},orders:{},payments:{},events:{},grants:{},audit:[],admins:['bob'],permissions:{alice:['reviews.read','reviews.decide'],bob:['reviews.read','reviews.decide']},reviews:{},commands:{},checkouts:{}};
  tail=Promise.resolve(); failAudit=false;
  async transaction(work){
    let release;const before=this.tail;this.tail=new Promise(resolve=>{release=resolve});await before;
    const d=clone(this.data);
    const tx={
      permanentGameIds:async owner=>clone(d.permanent[owner]??[]),
      grantsForOrder:async id=>clone(Object.values(d.grants).filter(g=>g.orderId===id)),
      reconciliationOrders:async(before,limit)=>clone(Object.values(d.orders).filter(o=>!before||o.createdAt<before.createdAt||o.createdAt===before.createdAt&&o.id<before.id).sort((a,b)=>a.createdAt===b.createdAt?(a.id>b.id?-1:a.id<b.id?1:0):(a.createdAt>b.createdAt?-1:1)).slice(0,limit)),
      checkout:async order=>clone(d.checkouts[order]??null),checkoutByReference:async(provider,ref)=>clone(Object.values(d.checkouts).find(c=>c.provider===provider&&c.reference===ref)??null),putCheckout:async c=>{d.checkouts[c.orderId]=clone(c)},
      isAdmin:async id=>d.admins.includes(id),hasPermission:async(id,permission)=>(d.permissions[id]??[]).includes(permission),review:async id=>clone(d.reviews[id]??null),
      reviews:async(status,before,limit)=>clone(Object.values(d.reviews).filter(r=>(status==='all'||r.status===status)&&(!before||r.createdAt<before.createdAt||r.createdAt===before.createdAt&&r.id<before.id)).sort((a,b)=>a.createdAt===b.createdAt?(a.id>b.id?-1:a.id<b.id?1:0):(a.createdAt>b.createdAt?-1:1)).slice(0,limit)),
      reviewsForPayment:async key=>clone(Object.values(d.reviews).filter(r=>r.paymentKey===key)),putReview:async r=>{d.reviews[r.id]=clone(r)},
      reviewCommand:async(admin,key)=>clone(d.commands[JSON.stringify([admin,key])]??null),putReviewCommand:async c=>{d.commands[JSON.stringify([c.adminId,c.requestKey])]=clone(c)},
      checkoutEnabled:async()=>d.enabled,account:async id=>clone(d.accounts[id]??null),offer:async id=>clone(d.offers[id]??null),
      gamesAvailable:async()=>d.available,order:async id=>clone(d.orders[id]??null),
      orderByRequest:async(owner,key)=>clone(Object.values(d.orders).find(o=>o.ownerId===owner&&o.requestKey===key)??null),
      orders:async(owner,before,limit)=>clone(Object.values(d.orders).filter(o=>o.ownerId===owner&&(!before||o.createdAt<before.createdAt||o.createdAt===before.createdAt&&o.id<before.id)).sort((a,b)=>a.createdAt===b.createdAt?(a.id>b.id?-1:a.id<b.id?1:0):(a.createdAt>b.createdAt?-1:1)).slice(0,limit)),
      putOrder:async o=>{d.orders[o.id]=clone(o)},payment:async k=>clone(d.payments[k]??null),putPayment:async p=>{d.payments[p.key]=clone(p)},
      event:async k=>clone(d.events[k]??null),putEvent:async(k,e)=>{d.events[k]=clone(e)},
      grants:async owner=>clone(Object.values(d.grants).filter(g=>g.ownerId===owner)),putGrant:async g=>{d.grants[g.id]=clone(g)},
      audit:async a=>{if(this.failAudit)throw Error('audit unavailable');d.audit.push(clone(a))},
    };
    try{const result=await work(tx);this.data=d;return clone(result)}finally{release()}
  }
}
export function fixture(options={}){
  const ledger=new Ledger();let serial=0,now=new Date('2026-10-18T10:00:00.000Z');
  const identity={async requireUser(session){if(!['session:alice','session:bob'].includes(session))throw new CommerceError('unauthenticated');return {id:session.slice(8),assurance:options.assurance===undefined?'aal2':options.assurance}}};
  const verifier={async verify(body,headers){if(headers['x-test-signature']!=='valid')throw new CommerceError('invalid_signature');return JSON.parse(new TextDecoder().decode(body))}};
  const service=new CommerceService(ledger,identity,verifier,()=>new Date(now),()=>`id-${++serial}`);
  const provider=options.provider??{id:'test-provider',async create(input){return {orderId:input.orderId,amount:input.amount,currency:input.currency,reference:'ref-'+input.orderId,url:'https://payments.example.test/session/'+input.orderId,expiresAt:input.expiresAt}}};
  const checkout=new CheckoutCoordinator(ledger,identity,provider,'qa_test',['https://payments.example.test'],()=>new Date(now),()=>`lease-${++serial}`);
  const create=(requestKey='request_key_000001',extra={})=>service.createOrder('session:alice',{offerId:'one',offerRevision:ledger.data.offers.one.revision,requestKey,...extra});
  const event=(order,extra={})=>({provider:'test-only',eventId:`ev-${++serial}`,paymentId:`pay-${order.id}`,orderId:order.id,kind:'paid',amount:order.offer.amount,currency:'VND',occurredAt:now.toISOString(),...extra});
  const send=(e,headers={'x-test-signature':'valid'})=>service.handleWebhook(new TextEncoder().encode(JSON.stringify(e)),headers);
  return {ledger,service,checkout,provider,create,event,send,time:v=>{now=new Date(v)},grants:()=>Object.values(ledger.data.grants)};
}
