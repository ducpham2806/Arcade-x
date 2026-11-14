import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld} from './harness.mjs';
import {parseClientMessage} from '../../src/games/tank-clash/protocol.ts';
test('room chat is member-bound, acknowledged, deduplicated and survives team moves without leaking to other rooms',async()=>{
 const world=createWorld(),a=world.client({},'An'),b=world.client({},'Binh'),c=world.client({},'Other');a.session.create('An','2v2');world.run(10);b.session.join(a.session.code);c.session.create();world.run(10);
 const sender=a.session.room.seats.find(s=>s.id===a.session.seat).chatId;
 const promise=a.session.chat('Chào bạn');world.run(10);await promise;
 assert.equal(b.session.room.chat.at(-1).text,'Chào bạn');assert.equal(c.session.room.chat.length,0);const id=b.session.room.chat.at(-1).requestId;
 a.sendRaw({type:'chat',id,text:'Chào bạn'});world.run(10);assert.equal(b.session.room.chat.length,1);
 b.sendRaw({type:'chat',id,text:'different sender'});world.run(10);assert.equal(a.session.room.chat.length,2);assert.notEqual(a.session.room.chat[0].id,a.session.room.chat[1].id);
 const limited=a.session.chat('Quá nhanh');world.run(10);await assert.rejects(limited,/Gửi quá nhiều/);
 world.run(1100);a.session.team(1);world.run(10);assert.equal(a.session.room.seats.find(s=>s.id===a.session.seat).chatId,sender);
 assert.equal(parseClientMessage({type:'chat',id:'valid-id',text:'x',sender:'spoof'}),null);assert.equal(parseClientMessage({type:'chat',id:'valid-id',text:'x'.repeat(501)}),null);
 const pending=a.session.chat('Rời phòng');a.session.cancelChat();await assert.rejects(pending,/Đã rời/);
});
