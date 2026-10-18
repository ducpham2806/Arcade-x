import {build} from 'esbuild';
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {fixture,createCommerceHandler} from './commerce-fixture.mjs';
const bundle=await build({entryPoints:['src/commerce/orders-client.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {createOrdersClient}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const code=c=>e=>e.code===c;

test('disabled readiness flag performs no session lookup or API request',async()=>{
 let calls=0;const api=createOrdersClient({enabled:false,readSession:async()=>{calls++;return null},fetcher:async()=>{calls++;throw Error('unexpected')}});
 await assert.rejects(api.list('alice'),code('orders_unavailable'));assert.equal(calls,0);
});
test('account mismatch fails before fetch',async()=>{
 let calls=0;const api=createOrdersClient({enabled:true,readSession:async()=>({owner:'bob',token:'token'}),fetcher:async()=>{calls++}});
 await assert.rejects(api.list('alice'),code('account_changed'));assert.equal(calls,0);
});
test('actual HTTP/client roundtrip lists and cancels with redacted DTOs',async()=>{
 const f=fixture(),o=await f.create(),handler=createCommerceHandler(f.service,{enabled:true,allowRequest:async()=>true});
 let last;
 const api=createOrdersClient({enabled:true,readSession:async()=>({owner:'alice',token:'session:alice'}),fetcher:async(path,init)=>{last={path,init};return handler(new Request('https://example.test'+path,init))}});
 assert.equal((await api.list('alice')).orders[0].id,o.id);assert.equal(last.init.cache,'no-store');assert.equal(last.init.credentials,'omit');
 assert.equal((await api.detail('alice',o.id)).order.state,'awaiting_payment');
 assert.equal((await api.cancel('alice',o.id)).order.state,'cancelled');assert.equal(last.init.body,'{}');
});
test('switching account while response is in flight never returns old data',async()=>{
 const f=fixture();await f.create();const handler=createCommerceHandler(f.service,{enabled:true,allowRequest:async()=>true});let owner='alice';
 const api=createOrdersClient({enabled:true,readSession:async()=>({owner,token:'session:alice'}),fetcher:async(path,init)=>{const r=await handler(new Request('https://example.test'+path,init));owner='bob';return r}});
 await assert.rejects(api.list('alice'),code('account_changed'));
});
test('SPA fallback HTML or malformed payload does not become an empty history',async()=>{
 for(const response of [()=>new Response('<html>SPA</html>'),()=>Response.json({orders:[]}),()=>Response.json({orders:[{id:'broken'}],nextCursor:null,serverTime:'2026-10-18T10:00:00Z'})]){
  const api=createOrdersClient({enabled:true,readSession:async()=>({owner:'alice',token:'token'}),fetcher:async()=>response()});
  await assert.rejects(api.list('alice'),code('invalid_response'));
 }
});
test('caller abort prevents fetch; response errors retain safe machine code',async()=>{
 let calls=0;const controller=new AbortController();controller.abort();
 const api=createOrdersClient({enabled:true,readSession:async()=>({owner:'alice',token:'token'}),fetcher:async()=>{calls++;return Response.json({error:'order_cannot_cancel'},{status:409})}});
 await assert.rejects(api.list('alice',null,controller.signal),e=>e.name==='AbortError');assert.equal(calls,0);
 await assert.rejects(api.cancel('alice','an-order'),code('order_cannot_cancel'));
});
