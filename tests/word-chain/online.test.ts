import {test,expect,type Page} from '@playwright/test';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import path from 'node:path';
// Online play through the review lab: real WordChainGame UIs (one per player) on the real room
// server with an in-browser store. Private room by code, ready check, words synced to every
// player, leaving mid-match, and matchmaking with the 20 s auto start.
const LAB=path.resolve('test-results/word-chain-room-lab.html');
const words:string[]=JSON.parse(readFileSync('public/games/word-chain/words.v1.json','utf8')).words;
test.beforeAll(()=>{execFileSync(process.execPath,['scripts/word-chain-preview.mjs',LAB],{stdio:'ignore'});});
const pane=(page:Page,name:string)=>page.locator(`.nt-lab-pane[data-player="${name}"]`);
async function open(page:Page){await page.setViewportSize({width:1600,height:900});await page.goto('file://'+LAB);await expect(page.locator('.nt-lab-pane .nt-home')).toHaveCount(4,{timeout:15000});}

test('private room: code join, ready check, synced chain, leaving mid-match',async({page})=>{
 test.setTimeout(90000);const errors:string[]=[];page.on('pageerror',e=>errors.push(String(e)));
 await open(page);
 const an=pane(page,'An');
 await an.getByTestId('nt-create').click();await an.getByRole('button',{name:'3 người'}).click();await an.getByTestId('nt-create-room').click();
 const code=(await an.getByTestId('nt-room-code').innerText()).trim();expect(code).toMatch(/^[A-Z2-9]{6}$/);
 for(const n of ['Bình','Chi']){const p=pane(page,n);await p.getByTestId('nt-join').click();await p.locator('.nt-code-input input').fill(code);await p.getByTestId('nt-join-room').click();}
 for(const n of ['An','Bình','Chi'])await expect(pane(page,n).locator('.nt-ready h2')).toHaveText('Chuẩn bị');
 await expect(an.locator('.nt-ready-list li')).toHaveCount(3);
 for(const n of ['An','Bình','Chi'])await pane(page,n).getByTestId('nt-ready').click();
 for(const n of ['An','Bình','Chi'])await expect(pane(page,n).locator('.nt-answer')).toBeVisible({timeout:10000});
 // Whoever has the turn answers; everyone sees the word.
 const mover=async()=>{for(const n of ['An','Bình','Chi'])if(await pane(page,n).locator('.nt-answer.mine').count())return n;return null;};
 await expect.poll(mover,{timeout:10000}).not.toBeNull();
 const first=(await mover())!,p=pane(page,first),input=p.getByLabel('Gõ từ nối tiếp'),need=(await p.locator('.nt-tile.hot').innerText()).trim();
 await input.fill(need+' xyzq');await input.press('Enter');
 await expect(p.locator('.nt-feedback')).toContainText('không có trong từ điển');
 const reply=words.find(w=>w.startsWith(need+' ')&&words.some(x=>x.startsWith(w.split(' ')[1]+' ')))!;
 await page.waitForTimeout(800);await input.fill(reply);await input.press('Enter');
 for(const n of ['An','Bình','Chi'])await expect(pane(page,n).locator('.nt-chain li').last()).toHaveText(reply,{timeout:8000});
 // The next player leaves during the match: eliminated for everyone, the room goes on.
 await expect.poll(mover,{timeout:8000}).not.toBe(first);
 const quitter=(await mover())!;
 await pane(page,quitter).getByLabel('Rời trận').click();await pane(page,quitter).getByRole('button',{name:'Bỏ cuộc và rời'}).click();
 await expect(pane(page,quitter).locator('.nt-home .nt-menu')).toBeVisible();
 const stay=['An','Bình','Chi'].filter(n=>n!==quitter);
 for(const n of stay)await expect(pane(page,n).locator('.nt-players li.out')).toHaveCount(1,{timeout:8000});
 await page.screenshot({path:'test-results/word-chain-online-match.png'});
 expect(errors).toEqual([]);
});

test('matchmaking: two queued players share a room that starts 20 s after the pair forms',async({page})=>{
 test.setTimeout(90000);const errors:string[]=[];page.on('pageerror',e=>errors.push(String(e)));
 await open(page);
 for(const n of ['An','Bình'])await pane(page,n).getByTestId('nt-match').click();
 for(const n of ['An','Bình'])await expect(pane(page,n).locator('.nt-queue')).toContainText('tự bắt đầu sau',{timeout:10000});
 await expect(pane(page,'An').locator('.nt-seats li.on')).toHaveCount(2);
 for(const n of ['An','Bình'])await expect(pane(page,n).locator('.nt-ready h2')).toHaveText('Chuẩn bị',{timeout:30000});
 expect(errors).toEqual([]);
});
