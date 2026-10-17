import assert from 'node:assert/strict';
import React, {act} from 'react';
import {createRoot} from 'react-dom/client';
import {parseHTML} from 'linkedom';
import {EatEmAllGame} from '../../src/games/eat-em-all';
const {window}=parseHTML('<html><body><div id="root"></div></body></html>');
Object.assign(globalThis,{window,document:window.document,HTMLElement:window.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true});
const memory=new Map([['arcadex_eat_journey_v2',JSON.stringify({unlocked:24,stars:{},charm:'shelter'})]]);
Object.assign(globalThis,{localStorage:{getItem:(k:string)=>memory.get(k)||null,setItem:(k:string,v:string)=>memory.set(k,v)}});
let now=0;Object.defineProperty(performance,'now',{value:()=>now,configurable:true});
let timerId=0;const timers=new Map<number,()=>void>();
window.setInterval=((fn:()=>void)=>{timers.set(++timerId,fn);return timerId;}) as any;
window.clearInterval=((id:number)=>timers.delete(id)) as any;
const noop=()=>{};let coins=0,exp=0,gameOvers=0;
const bridge:any={grantCoins:(n:number)=>coins+=n,grantExp:(n:number)=>exp+=n,grantGems:noop,reportProgress:noop,reportQuest:noop,playSound:noop,recordMove:noop,getEquippedSkin:()=> 'default',getSkin:()=> 'default'};
const root=createRoot(document.getElementById('root')!);
await act(async()=>root.render(<EatEmAllGame bridge={bridge} isPaused={false} isMuted={true} onGameOver={()=>gameOvers++} onRestart={noop}/>));
const text=()=>document.body.textContent!;
const button=(label:string)=>Array.from(document.querySelectorAll('button')).find(b=>b.textContent?.includes(label))!;
async function click(b:any){assert.ok(b,'button missing');assert.equal(b.disabled,false);await act(async()=>b.click());}
function props(){return (globalThis as any).__eatProps;}
async function eat(type:string,n:number){await act(async()=>{for(let i=0;i<n;i++)props().onEatItem({id:i,type});});}
async function tick(n:number){for(let i=0;i<n;i++){now+=100;await act(async()=>{for(const fn of [...timers.values()])fn();});}}
assert.ok(text().includes('TRÁI TIM'));
await click(button('CHƯƠNG 1'));
await click(document.querySelectorAll('.eat-node')[0]);
await click(button('LÊN ĐƯỜNG'));
assert.ok(text().includes('ĐÃ SẴN SÀNG'));
await click(button('ĐÃ SẴN SÀNG'));
assert.equal(props().isPaused,false);
await eat('star',20);assert.equal(document.querySelector('.eat-dialog'),null,'wrong food cannot complete ice quota');
assert.ok(button('TUNG FURY'));await click(button('TUNG FURY'));assert.equal(props().furyActive,true);
await click(document.querySelector('[aria-label="Tạm dừng"]'));
assert.equal(props().isPaused,true);
await click(button('TIẾP TỤC'));assert.equal(props().isPaused,false);
await eat('ice',14);assert.ok(text().includes('Vùng đất thức giấc'));
assert.equal(coins,125);assert.equal(exp,65);assert.equal(gameOvers,0);
await eat('ice',5);assert.equal(coins,125,'reward must be idempotent');
await click(button('Bản đồ'));await click(button('CHƯƠNG 4'));
await click(document.querySelectorAll('.eat-node')[5]);await click(button('LÊN ĐƯỜNG'));await click(button('ĐÃ SẴN SÀNG'));
assert.equal(props().campaignStage.id,24);
await eat('ice',20);await eat('fire',20);assert.equal(document.querySelector('.eat-dialog'),null,'boss still has armor');
await tick(35);await eat('ice',8);assert.ok(text().includes('Vùng đất thức giấc'));
assert.ok(text().includes('Vực Đói trở thành Trái Tim Thế Giới'));
assert.equal(coins,325);
await act(async()=>root.unmount());
console.log('PASS: map → story → play → manual Fury → pause/resume → exact quota → first-clear reward → boss armor → ending.');
