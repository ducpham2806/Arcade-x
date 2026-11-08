import {test} from 'node:test';
import assert from 'node:assert/strict';
import {connectTankRoom} from '../../src/games/tank-clash/net-client.ts';

function sockets(t) {
  t.mock.timers.enable({apis:['setTimeout','setInterval']});
  const original=globalThis.WebSocket, all=[];
  class Socket {
    static OPEN=1;
    readyState=0; sent=[]; closes=0;
    constructor(){all.push(this);}
    send(text){this.sent.push(JSON.parse(text));}
    close(){this.closes++;this.readyState=3;this.onclose?.();}
    open(){this.readyState=1;this.onopen?.();}
  }
  globalThis.WebSocket=Socket;
  t.after(()=>{globalThis.WebSocket=original;t.mock.timers.reset();});
  return all;
}

test('stalled initial handshake retries after cold-start allowance and preserves the queued action once',t=>{
  const all=sockets(t), c=connectTankRoom('wss://example.invalid/tank',{storage:null});
  t.after(()=>c.close());
  c.session.create('An');
  t.mock.timers.tick(74_999);assert.equal(c.status,'connecting');
  t.mock.timers.tick(1);assert.equal(c.status,'reconnecting');assert.equal(all[0].closes,1);
  all[0].open();assert.equal(c.status,'reconnecting');assert.equal(all[0].sent.length,0);
  t.mock.timers.tick(500);assert.equal(all.length,2);
  all[1].open();assert.equal(c.status,'open');
  assert.deepEqual(all[1].sent.map(m=>m.type),['create']);
  assert.equal(all[1].sent[0].name,'An');
  all[0].onmessage?.({data:JSON.stringify({type:'error',code:'AUTH_FAILED',message:'stale',fatal:true})});
  assert.equal(c.session.error,null);
});

test('reconnect handshake times out within the seat hold window; stale close cannot stop the new heartbeat',t=>{
  const all=sockets(t), c=connectTankRoom('wss://example.invalid/tank',{storage:null});
  t.after(()=>c.close());
  all[0].open();all[0].close();t.mock.timers.tick(500);
  t.mock.timers.tick(10_000);assert.equal(all[1].closes,1);assert.equal(c.status,'reconnecting');
  t.mock.timers.tick(1_000);assert.equal(all.length,3);all[2].open();
  all[0].onclose();all[1].onclose();t.mock.timers.tick(1_000);
  assert.equal(c.status,'open');assert.deepEqual(all[2].sent.map(m=>m.type),['ping']);
  t.mock.timers.tick(10_000);assert.equal(all.length,3);assert.equal(c.status,'open');
});

test('closing a pending connection cancels all timers, queued work and late socket callbacks',t=>{
  const all=sockets(t), changes=[];
  const c=connectTankRoom('wss://example.invalid/tank',{storage:null,onChange:k=>changes.push(k)});
  c.session.create('An');c.close();const count=changes.length;
  all[0].open();all[0].onmessage?.({data:JSON.stringify({type:'error',code:'AUTH_FAILED',message:'late',fatal:true})});
  t.mock.timers.tick(200_000);
  assert.equal(c.status,'closed');assert.equal(c.session.error,null);assert.equal(all.length,1);
  assert.equal(all[0].sent.length,0);assert.equal(changes.length,count);
});
