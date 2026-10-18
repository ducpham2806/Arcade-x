import {build} from 'esbuild';
const bundle=await build({stdin:{contents:"export * from './server/commerce/service';export * from './server/commerce/http';",resolveDir:process.cwd()},bundle:true,write:false,format:'esm',platform:'node'});
export const {CommerceService,CommerceError,addTerm,grantActive,createCommerceHandler}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const clone=value=>structuredClone(value);

// Test-only ledger. Transactions are serialized and rolled back in full on failure.
// It is deliberately not a production persistence or authentication adapter.
export class Ledger {
  data={enabled:true,available:true,accounts:{alice:{registered:true,pilot:true,blocked:false},bob:{registered:true,pilot:true,blocked:false}},
    offers:{one:{id:'one',revision:'r1',title:'2048 7 days',scope:'game',gameIds:['tile-2048'],term:'7d',amount:10000,currency:'VND',active:true}},
    orders:{},payments:{},events:{},grants:{},audit:[]};
  tail=Promise.resolve(); failAudit=false;
  async transaction(work){
    let release;const before=this.tail;this.tail=new Promise(resolve=>{release=resolve});await before;
    const d=clone(this.data);
    const tx={
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
export function fixture(){
  const ledger=new Ledger();let serial=0,now=new Date('2026-10-18T10:00:00.000Z');
  const identity={async requireUser(session){if(!['session:alice','session:bob'].includes(session))throw new CommerceError('unauthenticated');return {id:session.slice(8)}}};
  const verifier={async verify(body,headers){if(headers['x-test-signature']!=='valid')throw new CommerceError('invalid_signature');return JSON.parse(new TextDecoder().decode(body))}};
  const service=new CommerceService(ledger,identity,verifier,()=>new Date(now),()=>`id-${++serial}`);
  const create=(requestKey='request_key_000001',extra={})=>service.createOrder('session:alice',{offerId:'one',offerRevision:ledger.data.offers.one.revision,requestKey,...extra});
  const event=(order,extra={})=>({provider:'test-only',eventId:`ev-${++serial}`,paymentId:`pay-${order.id}`,orderId:order.id,kind:'paid',amount:order.offer.amount,currency:'VND',occurredAt:now.toISOString(),...extra});
  const send=(e,headers={'x-test-signature':'valid'})=>service.handleWebhook(new TextEncoder().encode(JSON.stringify(e)),headers);
  return {ledger,service,create,event,send,time:v=>{now=new Date(v)},grants:()=>Object.values(ledger.data.grants)};
}
