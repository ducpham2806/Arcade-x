import {test,expect} from '@playwright/test';
import {snakeUiFixture} from './ui-fixture';
import {loginSnake,observeEngine,openFirstLevel,winFirstLevel,pendingSnake,platformWallet,openSnakeJourney,resumeSnakeHost,expireFixtureSession} from './ui-driver';
import {setOffline} from '../helpers/network-state.cjs';
test.describe.configure({timeout:120000});

test('registered preview wins through controls, saves and restores in a fresh device context',async({page,context,browser},info)=>{
 const fixture=await snakeUiFixture(),user=fixture.user('actorA');await fixture.install(context);
 await loginSnake(page,user);const wallet=await platformWallet(page);await observeEngine(page);await openFirstLevel(page);await winFirstLevel(page);
 await expect.poll(()=>fixture.calls.commits).toBe(1);await expect(page.locator('.cloud-message')).toContainText('Đã lưu kết quả trực tuyến');
 await expect(page.locator('.story-app .overlay')).toBeVisible();await page.screenshot({path:info.outputPath('saved-result.png')});
 const next=page.locator('.story-app [data-action="primary"]');await expect(next).toHaveText('Màn tiếp theo');await next.scrollIntoViewIfNeeded();await expect(next).toBeInViewport();
 await page.screenshot({path:info.outputPath('saved-result-actions.png')});
 expect(fixture.snapshots.get(user.id)?.revision).toBe(1);expect(fixture.snapshots.get(user.id)?.levels['1-1']).toBeTruthy();
 expect(fixture.snapshots.get(user.id)?.wallet).toEqual({snake_gold:0,snake_gem:0});expect(await platformWallet(page)).toEqual(wallet);
 await page.reload();await openSnakeJourney(page);await page.locator('.snake-journey [data-level="0"]').click();await expect(page.locator('.journey-best')).toContainText('Thành tích tốt nhất');
 const best=await page.locator('.journey-best').innerText(),stars=await page.locator('[data-level="0"] .journey-node-stars').innerText();expect(stars).toContain('★');
 await page.close();fixture.auth.documents.clear(); // Remove generic profile backups: only Snake state can restore this fresh context.
 const fresh=await browser.newContext();try{
  await fixture.install(fresh);const device=await fresh.newPage();await loginSnake(device,user);const reads=fixture.calls.state;await openSnakeJourney(device);
  await expect.poll(()=>fixture.calls.state).toBeGreaterThan(reads);await device.locator('.snake-journey [data-level="0"]').click();await expect(device.locator('.journey-best')).toContainText('Thành tích tốt nhất');
  await expect(device.locator('.journey-best')).toHaveText(best);await expect(device.locator('[data-level="0"] .journey-node-stars')).toHaveText(stars);await expect(device.locator('[data-level="1"]')).toBeEnabled();
  await device.screenshot({path:info.outputPath('fresh-device-restore.png')});
 }finally{await fresh.close();}
 expect(fixture.calls.commits).toBe(1);console.log({verifier:fixture.verifier,commits:fixture.calls.commits});
});

test('network loss before clear retains outbox and explicit retry commits once',async({page,context},info)=>{
 const fixture=await snakeUiFixture(),user=fixture.user('offline');await fixture.install(context);await loginSnake(page,user);await observeEngine(page);await openFirstLevel(page);
 let disconnected=false;await winFirstLevel(page,async probe=>{if(!disconnected&&probe.tick>=900){disconnected=true;fixture.offline(true);await setOffline(context,page,true);}});
 await expect(page.locator('[data-action="retry-cloud"]')).toBeVisible();expect(fixture.calls.commits).toBe(0);expect(await pendingSnake(page,user.id)).toBe(1);
 await page.screenshot({path:info.outputPath('offline-pending.png')});
 fixture.offline(false);await setOffline(context,page,false);await page.locator('[data-action="retry-cloud"]').click();
 await expect(page.locator('.cloud-message')).toContainText('Đã lưu kết quả trực tuyến');expect(fixture.calls.commits).toBe(1);expect(await pendingSnake(page,user.id)).toBe(0);
});

test('lost acknowledgement survives reload and retries the same ticket without another revision',async({page,context},info)=>{
 const fixture=await snakeUiFixture(),user=fixture.user('lostAck');await fixture.install(context);await loginSnake(page,user);await observeEngine(page);await openFirstLevel(page);fixture.dropNextAck();await winFirstLevel(page);
 await expect(page.locator('[data-action="retry-cloud"]')).toBeVisible();expect(fixture.calls.commits).toBe(1);expect(await pendingSnake(page,user.id)).toBe(1);
 const ticket=[...fixture.tickets.keys()][0];await page.screenshot({path:info.outputPath('lost-ack.png')});
 await page.reload();await expect(page.getByRole('button',{name:'Chơi bản preview'})).toBeVisible();await openFirstLevel(page);
 await page.locator('[data-action="retry-cloud"]').click();await expect(page.locator('.cloud-message')).toContainText('Đã lưu kết quả trực tuyến');
 expect(fixture.calls.commits).toBe(1);expect(fixture.snapshots.get(user.id)?.revision).toBe(1);expect([...fixture.tickets.keys()]).toEqual([ticket]);expect(await pendingSnake(page,user.id)).toBe(0);
});

test('cross-tab logout/account switch rejects the old late snapshot',async({page,context},info)=>{
 const fixture=await snakeUiFixture(),a=fixture.user('switchA'),b=fixture.user('switchB');
 fixture.snapshots.set(a.id,{revision:7,levels:{'1-1':{stars:[true,true,true],bestScore:999,bestTime:12}},secrets:[],wallet:{snake_gold:999,snake_gem:7}});
 await fixture.install(context);await loginSnake(page,a);fixture.holdReads(true);await openSnakeJourney(page);await expect.poll(()=>fixture.calls.state).toBe(1);
 const account=await context.newPage();await account.goto('/preview/snake/');await account.getByRole('button',{name:'Đổi tài khoản'}).click();
 await expect(page.getByRole('button',{name:'Đăng nhập để chơi thử'})).toBeVisible();
 await loginSnake(account,b);await expect(page.getByRole('button',{name:'Chơi bản preview'})).toBeVisible();await openSnakeJourney(page);await expect.poll(()=>fixture.calls.state).toBe(2);
 fixture.releaseRead();await expect(page.locator('[role="status"]').filter({hasText:'Snake Gold 0'})).toBeVisible();
 await expect(page.locator('.journey-best')).toContainText('Một thử thách mới');await expect(page.locator('.snake-journey [data-level="1"]')).toBeDisabled();
 await page.screenshot({path:info.outputPath('account-b-isolated.png')});expect(fixture.snapshots.has(b.id)).toBe(false);expect(fixture.calls.commits).toBe(0);await account.close();
});


test('two device contexts merge competing clears and a late acknowledgement cannot roll back newer state',async({page,context,browser},info)=>{
 test.setTimeout(180000);const fixture=await snakeUiFixture(),user=fixture.user('concurrent');await fixture.install(context);await loginSnake(page,user);await observeEngine(page);await openFirstLevel(page);
 const other=await browser.newContext();try{
  await fixture.install(other);const device=await other.newPage();await loginSnake(device,user);await observeEngine(device);await openFirstLevel(device);
  fixture.holdCompletion(true);await winFirstLevel(page);await expect.poll(()=>fixture.calls.commits).toBe(1);
  await winFirstLevel(device);await expect.poll(()=>fixture.calls.commits).toBe(2);
  await resumeSnakeHost(page);await page.getByRole('button',{name:'Tải lại tiến trình'}).click();
  await expect(page.locator('[role="status"]').filter({hasText:'Bản 2'})).toBeVisible();
  fixture.releaseCompletion();await expect(page.locator('.cloud-message')).toContainText('Đã lưu kết quả trực tuyến');
  await expect(page.locator('[role="status"]').filter({hasText:'Bản 2'})).toBeVisible();await expect(device.locator('[role="status"]').filter({hasText:'Bản 2'})).toBeVisible();
  expect(await pendingSnake(page,user.id)).toBe(0);expect(await pendingSnake(device,user.id)).toBe(0);expect(fixture.calls.commits).toBe(2);
  expect(fixture.snapshots.get(user.id)?.wallet).toEqual({snake_gold:0,snake_gem:0});await page.screenshot({path:info.outputPath('newer-state-survives-old-ack.png')});
 }finally{fixture.releaseCompletion();await other.close();}
});


test('expired fixture session refreshes through the SDK without remounting gameplay',async({page,context},info)=>{
 const fixture=await snakeUiFixture(),user=fixture.user('refresh');await fixture.install(context);await loginSnake(page,user);await observeEngine(page);await openFirstLevel(page);
 let checked=false,refreshes=0,engineId:number|undefined;page.on('request',request=>{const url=new URL(request.url());if(url.pathname.endsWith('/auth/v1/token')&&url.searchParams.get('grant_type')==='refresh_token')refreshes++;});
 await winFirstLevel(page,async probe=>{
  if(checked||probe.tick<100)return;checked=true;const id=probe.engineId;engineId=id;await page.mouse.up();await expireFixtureSession(page);
  await page.getByRole('button',{name:'Tải lại tiến trình'}).click();await expect.poll(()=>refreshes).toBeGreaterThan(0);
  await expect.poll(()=>page.evaluate(()=>(window as any).__snakeUiProbe.engineId)).toBe(id);
  const box=(await page.locator('.joystick').boundingBox())!;await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
 });
 await expect(page.locator('.cloud-message')).toContainText('Đã lưu kết quả trực tuyến');expect(fixture.calls.commits).toBe(1);
 expect(await page.evaluate(()=>(window as any).__snakeUiProbe.engineId)).toBe(engineId);
 await page.screenshot({path:info.outputPath('fixture-token-refreshed.png')});
});
