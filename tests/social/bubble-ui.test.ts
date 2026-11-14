import {test,expect} from '@playwright/test';import {execFileSync} from 'node:child_process';import path from 'node:path';
const fixture=path.resolve('test-results/chat-review/index.html');
test.beforeAll(()=>execFileSync(process.execPath,['scripts/chat-preview.mjs',fixture]));
test('shared chat: default lobby, draggable bubble, unread, drafts, failed send, room caption and identity cleanup',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:1366,height:768});await page.goto('file://'+fixture);
 const panel=page.getByRole('region',{name:'Chat nổi'});await expect(panel).toBeVisible();await expect(panel).toContainText('Chào bạn');
 await page.getByRole('button',{name:'Thu chat về bubble'}).click();await expect(panel).toHaveCount(0);
 await page.evaluate(()=>(window as any).chatFixture.incoming());await expect(page.locator('.chat-launcher-bubble .chat-unread-dot')).toBeVisible();
 const bubble=page.locator('.chat-launcher-bubble'),box=(await bubble.boundingBox())!;await page.mouse.move(box.x+20,box.y+20);await page.mouse.down();await page.mouse.move(500,540,{steps:8});await page.mouse.up();await expect(panel).toHaveCount(0);
 await bubble.click();await expect(panel).toBeVisible();await page.getByLabel('Nội dung tin nhắn').fill('Giữ nháp khi thu');await page.getByRole('button',{name:'Thu chat về bubble'}).click();await bubble.click();await expect(page.getByLabel('Nội dung tin nhắn')).toHaveValue('Giữ nháp khi thu');
 await page.evaluate(()=>(window as any).chatFixture.fail(true));await page.getByRole('button',{name:'Gửi ↗'}).click();await expect(page.getByRole('alert')).toContainText('Mất kết nối');await expect(page.getByLabel('Nội dung tin nhắn')).toHaveValue('Giữ nháp khi thu');
 await page.evaluate(()=>(window as any).chatFixture.fail(false));await page.getByRole('button',{name:'Gửi ↗'}).click();await expect(page.getByLabel('Nội dung tin nhắn')).toHaveValue('');await expect(panel).toContainText('Giữ nháp khi thu');
 await page.getByRole('button',{name:'Caro PvP',exact:true}).click();await expect(page.locator('.game-chat-bubble')).toHaveAttribute('aria-expanded','false');await page.evaluate(()=>(window as any).chatFixture.incoming('room','review-room'));await expect(page.locator('.game-chat-bubble .chat-unread-dot')).toBeVisible();await expect(page.locator('.chat-opponent-speech')).toContainText('Bình');
 await page.locator('.game-chat-bubble').click();await expect(page.locator('.chat-floating-panel')).toContainText('Chat · Trận');
 await page.getByLabel('Nội dung tin nhắn').fill('Room draft');await page.getByRole('button',{name:'Phóng lớn chat và bạn bè'}).click();await expect(page.getByRole('dialog')).toBeVisible();await expect(page.getByLabel('Nội dung tin nhắn')).toHaveValue('Room draft');await page.getByRole('button',{name:'Về khung chat nhỏ'}).click();await expect(page.getByLabel('Nội dung tin nhắn')).toHaveValue('Room draft');
 await page.getByRole('button',{name:'Inbox',exact:true}).click();await expect(page.locator('#community-tab-inbox')).toHaveAttribute('aria-selected','true');await page.getByRole('button',{name:'Về khung chat nhỏ'}).click();await expect(page.locator('.chat-floating-panel')).toContainText('Chat · Trận');
 await page.getByRole('button',{name:'Inbox',exact:true}).click();await page.getByRole('button',{name:'Đóng cộng đồng'}).click();await page.locator('.game-chat-bubble').click();await expect(page.locator('.chat-floating-panel')).toContainText('Chat · Trận');
 await page.getByRole('button',{name:'Inbox',exact:true}).click();await page.locator('#community-tab-friends').click();await page.getByRole('button',{name:'Nhắn tin',exact:true}).click();await page.getByLabel('Nội dung tin nhắn').fill('Private draft');await page.getByRole('button',{name:'Về khung chat nhỏ'}).click();await expect(page.getByLabel('Nội dung tin nhắn')).toHaveValue('Private draft');await page.getByRole('button',{name:'Phóng lớn chat và bạn bè'}).click();await expect(page.getByLabel('Nội dung tin nhắn')).toHaveValue('Private draft');await page.getByRole('button',{name:'Về khung chat nhỏ'}).click();
 await page.getByRole('button',{name:'Game',exact:true}).click();await page.getByRole('button',{name:'Thu chat về bubble'}).click();await page.evaluate(()=>(window as any).chatFixture.incoming('game','caro-gomoku'));await expect(page.locator('.game-chat-bubble .chat-unread-dot')).toBeVisible();await page.locator('.game-chat-bubble').click();
 await page.getByRole('button',{name:'Đổi tài khoản thử'}).click();await page.locator('.game-chat-bubble').click();await expect(page.getByLabel('Nội dung tin nhắn')).toHaveValue('');
 await page.screenshot({path:'test-results/chat-review/desktop-room.png'});expect(errors).toEqual([]);
});
test('phone: full chat, input above keyboard viewport, close and bubble remain inside screen',async({page})=>{
 for(const viewport of [{width:320,height:568},{width:390,height:844},{width:844,height:390}]){
  await page.setViewportSize(viewport);await page.goto('file://'+fixture);await expect(page.locator('.chat-floating-panel')).toBeVisible();
  await page.getByRole('button',{name:'Tank PvP',exact:true}).click();await page.locator('.game-chat-bubble').click();await expect(page.locator('.chat-floating-panel')).toBeVisible();
  await page.screenshot({path:`test-results/chat-review/chat-${viewport.width}.png`});
  const rect=await page.locator('.chat-floating-panel').boundingBox();expect(rect!.x).toBeGreaterThanOrEqual(0);expect(rect!.x+rect!.width).toBeLessThanOrEqual(viewport.width+1);expect(rect!.y+rect!.height).toBeLessThanOrEqual(viewport.height+1);
  await page.getByLabel('Nội dung tin nhắn').fill('Chơi vui nhé');await page.getByRole('button',{name:'Thu chat về bubble'}).click();await expect(page.locator('.game-chat-bubble')).toBeVisible();await page.screenshot({path:`test-results/chat-review/game-${viewport.width}.png`});
 }
});

test('launcher integration: compact lobby, community expansion, game toolbar bubble and exit restore',async({page})=>{
 const {buildSync}=await import('esbuild');const body=buildSync({entryPoints:['tests/social/fixture-service.ts'],bundle:true,write:false,format:'esm'}).outputFiles[0].text;
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>['127.0.0.1','localhost'].includes(new URL(route.request().url()).hostname)?route.continue():route.abort());
 await page.route('**/src/services/social.ts*',route=>route.fulfill({contentType:'text/javascript',body}));
 await page.setViewportSize({width:1366,height:768});await page.goto('/');await page.locator('#game-library').waitFor();await expect(page.locator('.chat-floating-panel')).toBeVisible();
 await page.getByRole('button',{name:'Mở cộng đồng, chat và bạn bè'}).click();await expect(page.getByRole('dialog',{name:'Sảnh game thủ'})).toBeVisible();await page.getByRole('button',{name:'Đóng cộng đồng'}).click();
 await page.locator('#btn-play-caro-gomoku').click();await expect(page.locator('.game-chat-bubble')).toBeVisible();await page.locator('#btn-caro-gomoku-quick-ai').click();await expect.poll(async()=>{const r=await page.locator('.arcade-board').boundingBox();return r?.width||0;}).toBeGreaterThan(260);await page.locator('.game-chat-bubble').click();await expect(page.locator('.chat-floating-panel')).toBeVisible();await expect(page.locator('.chat-floating-panel')).toContainText('Chat · Game');await page.screenshot({path:'test-results/chat-review/caro-chat.png'});
 await page.getByRole('button',{name:'Thu chat về bubble'}).click();await page.locator('#btn-game-exit').click();const confirm=page.locator('#btn-exit-confirm');if(await confirm.isVisible())await confirm.click();await expect(page.locator('#game-library')).toBeVisible();
 await page.waitForTimeout(400);await page.screenshot({path:'test-results/chat-review/launcher.png'});expect(errors).toEqual([]);
});
