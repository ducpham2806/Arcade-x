import {test,expect,type Page} from '@playwright/test';
async function enter(page:Page){
 await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
 await page.goto('/');await page.locator('#btn-play-o-an-quan').click();await expect(page.locator('.oaq')).toHaveAttribute('data-art-ready','true');
}
async function bounds(page:Page,selector:string){
 const out=await page.locator(selector).evaluateAll(es=>es.filter(e=>{const s=getComputedStyle(e);return s.display!=='none'&&s.visibility!=='hidden';}).map(e=>({name:e.tagName,r:e.getBoundingClientRect().toJSON()})));
 for(const e of out){expect(e.r.x,e.name).toBeGreaterThanOrEqual(-1);expect(e.r.right,e.name).toBeLessThanOrEqual((await page.viewportSize())!.width+1);}
}
for(const size of [{width:1440,height:900},{width:390,height:844},{width:320,height:568},{width:844,height:390}])test(`OAQ art and UI fit ${size.width}x${size.height}`,async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize(size);await page.emulateMedia({reducedMotion:'reduce'});await enter(page);
 await expect(page.getByRole('heading',{name:/Một nắm sỏi/})).toBeVisible();await bounds(page,'.oaq-header,.oaq-play-card');
 await page.screenshot({path:info.outputPath('home.png')});
 await page.getByRole('button',{name:/2 Người Chung Máy/}).click();
 await expect(page.locator('.oaq-pit-hit[aria-label^="Ô 1,"]')).toBeFocused();
 await page.getByRole('combobox',{name:'Chọn ô Dân'}).selectOption('1');
 await expect(page.locator('.oaq-pit-hit[aria-label^="Ô 1,"]')).toHaveAttribute('aria-pressed','true');
 const button=page.getByRole('button',{name:'Rải Phải',exact:true});const box=(await button.boundingBox())!;expect(box.height).toBeGreaterThanOrEqual(56);expect(box.width).toBeGreaterThanOrEqual(56);
 await button.click();await expect(page.locator('.oaq-match')).toHaveAttribute('data-turn','P2');
 await expect(page.locator('[data-seat=P1] strong')).toHaveText('Người chơi 1');await expect(page.locator('[data-seat=P2] strong')).toHaveText('Người chơi 2');
 await expect(page.locator('[data-seat=P1]')).toHaveAttribute('data-score','6');await expect(page.locator('[data-seat=P2]')).toHaveAttribute('data-score','0');
 for(const c of await page.locator('.oaq-cell-count').evaluateAll(es=>es.map(e=>parseFloat(getComputedStyle(e).fontSize))))expect(c).toBeGreaterThanOrEqual(10);
 await bounds(page,'.oaq-player,.oaq-board-wrap,.oaq-move-controls');
 const frame=(await page.locator('.fd-shell').boundingBox())!,controls=(await page.locator('.oaq-move-controls').boundingBox())!;
 expect(controls.y+controls.height).toBeLessThanOrEqual(frame.y+frame.height+1);
 if(size.height>540){const p1=(await page.locator('[data-seat=P1]').boundingBox())!,board=(await page.locator('.oaq-board-wrap').boundingBox())!,p2=(await page.locator('[data-seat=P2]').boundingBox())!;expect(p2.y+p2.height).toBeLessThanOrEqual(board.y);expect(board.y+board.height).toBeLessThanOrEqual(p1.y);expect(p1.y+p1.height).toBeLessThanOrEqual(controls.y);}else{const board=(await page.locator('.oaq-board-wrap').boundingBox())!;expect(board.x+board.width).toBeLessThanOrEqual(controls.x);}
 await page.screenshot({path:info.outputPath('board.png')});
 const rules=page.getByRole('button',{name:'Luật Chơi Nhanh',exact:true});await rules.click();const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
 await page.keyboard.press('Shift+Tab');await expect(dialog.getByRole('button',{name:'Đã hiểu, vào sân'})).toBeFocused();await page.keyboard.press('Escape');await expect(rules).toBeFocused();
 await page.getByRole('button',{name:'Tiệm Tạp Hóa',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();
 await page.getByRole('button',{name:/Sân & Bàn Cờ/}).click();await page.getByRole('button',{name:/Mặt Bàn Gỗ Học Trò/}).click();
 await page.screenshot({path:info.outputPath('shop.png')});await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Tiệm Tạp Hóa',exact:true})).toBeFocused();expect(errors).toEqual([]);
});

test('OAQ pauses bot and blocks game input behind its dialog',async({page})=>{
 await enter(page);await page.getByRole('button',{name:/Luyện với Bot Tí Sún/}).click();
 await page.getByRole('combobox',{name:'Chọn ô Dân'}).selectOption('1');await page.getByRole('button',{name:'Rải Phải',exact:true}).click();
 await page.locator('.oaq-match').getByRole('button',{name:'Tạm dừng',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();
 await expect(page.locator('.oaq-match')).toHaveAttribute('data-turn','P2');const n=await page.locator('.oaq-match').getAttribute('data-turn-number');await page.waitForTimeout(900);await expect(page.locator('.oaq-match')).toHaveAttribute('data-turn-number',n!);
 await expect(page.getByRole('combobox',{name:'Chọn ô Dân'})).toBeDisabled();await page.getByRole('button',{name:'Chơi tiếp',exact:true}).click();
 await expect(page.locator('.oaq-match')).toHaveAttribute('data-turn','P1');await expect(page.locator('.oaq-match')).toHaveAttribute('data-turn-number','3');
});

test('OAQ still plays when generated images cannot load',async({page})=>{
 await page.route('**/*',r=>new URL(r.request().url()).hostname!=='127.0.0.1'||r.request().url().includes('/o-an-quan/assets/')?r.abort():r.continue());
 await page.goto('/');await page.locator('#btn-play-o-an-quan').click();await page.getByRole('button',{name:/2 Người Chung Máy/}).click();
 await page.getByRole('combobox',{name:'Chọn ô Dân'}).selectOption('1');await page.getByRole('button',{name:'Rải Phải',exact:true}).click();await expect(page.locator('.oaq-match')).toHaveAttribute('data-turn','P2');
});


test('OAQ bot waits behind shop, rules and launcher pause',async({page},info)=>{
 await enter(page);await page.getByRole('button',{name:/Luyện với Bot Tí Sún/}).click();
 for(const overlay of ['shop','rules','launcher']){
  const select=page.getByRole('combobox',{name:'Chọn ô Dân'});await expect(select).toBeEnabled();
  const value=await select.locator('option:not(:disabled)').first().getAttribute('value');await select.selectOption(value!);await page.getByRole('button',{name:'Rải Phải',exact:true}).click();
  if(overlay==='launcher')await page.locator('#btn-game-pause').click();else await page.getByRole('button',{name:overlay==='shop'?'Tiệm Tạp Hóa':'Luật Chơi Nhanh',exact:true}).click();
  await expect(page.locator('.oaq-match')).toHaveAttribute('data-turn','P2');const before=await page.locator('.oaq-match').getAttribute('data-turn-number');
  await page.waitForTimeout(900);await expect(page.locator('.oaq-match')).toHaveAttribute('data-turn-number',before!);await expect(select).toBeDisabled();
  if(overlay==='launcher'){await expect(page.getByText('Ván hiện tại chỉ chơi trong phiên này · Kẹo và trang bị lưu riêng')).toBeVisible();await page.locator('#btn-pause-resume').click();}else await page.keyboard.press('Escape');
  await expect(page.locator('.oaq-match')).toHaveAttribute('data-turn','P1');
 }
 await page.locator('#btn-game-pause').click();await expect(page.locator('#btn-pause-save-exit')).toHaveAttribute('aria-label','Về sảnh (kết thúc ván hiện tại)');await page.locator('#btn-pause-save-exit').click();await expect(page.locator('#game-library')).toBeVisible();
 await page.locator('#btn-play-o-an-quan').click();await page.getByRole('button',{name:/2 Người Chung Máy/}).click();await page.locator('#btn-game-exit').click();await expect(page.getByText(/Rời sân sẽ kết thúc ván hiện tại/)).toBeVisible();await expect(page.locator('#btn-exit-save-suspend')).toHaveText('Kết thúc ván & về sảnh');await page.screenshot({path:info.outputPath('exit.png')});await page.locator('#btn-exit-save-suspend').click();await expect(page.locator('#game-library')).toBeVisible();
});
