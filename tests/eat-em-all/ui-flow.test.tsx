import assert from 'node:assert/strict';
import React,{act} from 'react';
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
const noop=()=>{};let coins=0,xp=0,gameOvers=0;
const bridge:any={grantCoins:(n:number)=>coins+=n,grantExp:(n:number)=>xp+=n,grantGems:noop,reportProgress:noop,reportQuest:noop,playSound:noop,recordMove:noop,getEquippedSkin:()=> 'default',getSkin:()=> 'default'};
const root=createRoot(document.getElementById('root')!);
await act(async()=>root.render(<EatEmAllGame bridge={bridge} isPaused={false} isMuted={true} onGameOver={()=>gameOvers++} onRestart={noop}/>));
const text=()=>document.body.textContent!;
const button=(label:string)=>Array.from(document.querySelectorAll('button')).find(b=>b.textContent?.includes(label))!;
const aria=(label:string)=>document.querySelector(`button[aria-label="${label}"]`)!;
async function click(b:any){assert.ok(b,'button missing');assert.equal(b.disabled,false);await act(async()=>b.click());}
function props(){return (globalThis as any).__eatProps;}
async function eat(type:string,n:number){await act(async()=>{for(let i=0;i<n;i++)props().onEatItem({id:i,type});});}
async function tick(n:number){for(let i=0;i<n;i++){now+=100;await act(async()=>{for(const fn of [...timers.values()])fn();});}}
assert.ok(text().includes('TRÁI TIM'));
assert.ok(!document.querySelector('.eat-brief'),'no extra preparation card');
await click(aria('Sổ linh thú'));assert.ok(document.querySelector('.eat-artbook'));await click(aria('Đóng sổ'));
await click(document.querySelector('button[aria-label^="Chương 1:"]'));
await click(aria('Chơi màn 1'));
assert.equal(props().campaignStage.id,1);assert.equal(props().isPaused,false,'one tap enters active gameplay');
assert.ok(!text().includes('ĐÃ SẴN SÀNG'));
await eat('star',20);assert.equal(document.querySelector('.eat-result'),null,'wrong food cannot complete ice quota');
await click(button('TUNG FURY'));assert.equal(props().furyActive,true);
await click(aria('Tạm dừng'));assert.equal(props().isPaused,true);await click(button('TIẾP TỤC'));assert.equal(props().isPaused,false);
await eat('ice',14);assert.ok(text().includes('HOÀN THÀNH!'));assert.equal(coins,130);assert.equal(xp,70);assert.equal(gameOvers,0);
await eat('ice',5);assert.equal(coins,130);
await click(aria('Màn tiếp theo'));assert.equal(props().campaignStage.id,2);assert.equal(props().isPaused,false);assert.equal(document.querySelector('.eat-result'),null);
await eat('fire',12);await eat('ice',6);await eat('star',4);assert.equal(coins,260);assert.equal(xp,140);
await click(aria('Về bản đồ'));
await click(aria('Cửa hàng hào quang'));await click(aria('Mua Mầm xanh'));
let saved=JSON.parse(memory.get('arcadex_eat_journey_v2')!);assert.deepEqual(saved.economy.ownedAuras,['grove']);assert.equal(saved.economy.equippedAura,'grove');
assert.equal(aria('Mua Tàn lửa').hasAttribute('disabled'),true,'spent stars cannot be spent twice');
await click(aria('Đóng cửa hàng'));
// Replay a mastered level is one tap and cannot farm campaign grants.
await click(document.querySelector('button[aria-label^="Chơi màn 1:"]'));assert.equal(props().isPaused,false);assert.equal(props().auraId,'grove');
await eat('ice',14);await eat('star',6);assert.equal(coins,260);assert.equal(xp,140);
await click(aria('Về bản đồ'));await click(document.querySelector('button[aria-label^="Chương 4:"]'));await click(document.querySelector('button[aria-label^="Chơi màn 24:"]'));
assert.equal(props().campaignStage.id,24);await eat('ice',20);await eat('fire',20);assert.equal(document.querySelector('.eat-result'),null);
await tick(35);await eat('ice',8);assert.ok(text().includes('HOÀN THÀNH!'));assert.equal(coins,585);assert.equal(xp,315);
await click(aria('Xem câu chuyện'));assert.ok(text().includes('Vực Đói trở thành Trái Tim Thế Giới'));await click(aria('Đóng câu chuyện'));
const beforePractice=memory.get('arcadex_eat_journey_v2');
await act(async()=>root.render(<EatEmAllGame key="practice" bridge={bridge} isPaused={false} isMuted={true} isPracticeMode={true} onGameOver={()=>gameOvers++} onRestart={noop}/>));
await click(document.querySelector('button[aria-label^="Chương 1:"]'));await click(document.querySelector('button[aria-label^="Chơi màn 3:"]'));
await eat('ice',10);await eat('fire',10);await eat('star',4);assert.equal(coins,585);assert.equal(xp,315);assert.equal(memory.get('arcadex_eat_journey_v2'),beforePractice);
await act(async()=>root.unmount());
console.log('PASS: one-tap play/next/replay, optional story, artbook, Fury/pause, exact quota, bounded rewards, star purchase/equip, boss ending.');
