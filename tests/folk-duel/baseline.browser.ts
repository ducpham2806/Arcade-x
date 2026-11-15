import {test,expect,type Page} from '@playwright/test';
import {BOARD_W,BOARD_H,getOaqCellRects} from '../../src/games/o-an-quan/renderer';

async function open(page:Page,id:string){
 await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
 await page.goto('/');await page.locator('#btn-play-'+id).click();
 await expect(page.locator('.fd-shell')).toBeVisible();
 for(const name of [/Ghép Trận/,/Tạo Phòng/,/Nhập Mã/])await expect(page.getByRole('button',{name})).toBeDisabled();
 expect(await page.locator('.fd-shell').innerText()).not.toMatch(/\+\d+ Xu/);
}
async function exit(page:Page){await page.locator('#btn-game-exit').click();await page.locator('#btn-exit-confirm').click();await expect(page.locator('#game-library')).toBeVisible();}
async function choosePit(page:Page,index:number){
 const c=page.locator('.fd-pixel-canvas'),box=(await c.boundingBox())!,r=getOaqCellRects().find(r=>r.idx===index)!;
 await page.mouse.click(box.x+(r.x+r.w/2)/BOARD_W*box.width,box.y+(r.y+r.h/2)/BOARD_H*box.height);
}
for(const size of [{width:1440,height:900},{width:390,height:844}])test(`folk preview local games and shop (${size.width})`,async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize(size);
 await open(page,'o-an-quan');
 await page.getByRole('button',{name:/2 Người Chung Máy/}).click();await expect(page.locator('canvas')).toBeVisible();
 await choosePit(page,1);await expect(page.getByRole('button',{name:'Rải Phải ▶',exact:true})).toBeEnabled();
 await page.getByRole('button',{name:'Rải Phải ▶',exact:true}).click();await expect(page.locator('.fd-controls-bar')).not.toContainText('Ô được chọn không hợp lệ');
 await choosePit(page,8);await expect(page.getByRole('button',{name:'◀ Rải Trái',exact:true})).toBeEnabled();
 await page.screenshot({path:info.outputPath(`oaq-local-${size.width}.png`)});await exit(page);
 await page.locator('#btn-play-o-an-quan').click();await page.getByRole('button',{name:/Bot Tí Sún/}).click();
 await choosePit(page,1);await page.getByRole('button',{name:'Rải Phải ▶',exact:true}).click();
 await expect(page.locator('.fd-controls-bar')).toContainText(/Bot Tí Sún.*vừa ăn|Đến lượt của bạn!/);
 await expect(page.locator('.fd-hud-strip').last()).toContainText('Đến lượt bạn');await exit(page);
 await page.locator('#btn-play-o-an-quan').click();await page.getByRole('button',{name:/Tiệm Tạp Hóa/}).click();
 const shop=page.getByRole('dialog');await expect(shop).toBeVisible();
 await expect(shop.locator('h2')).toHaveCSS('color','rgb(253, 230, 138)');
 const frame=(await page.locator('.fd-shell').boundingBox())!,modal=(await shop.locator('.fd-modal-shell').boundingBox())!;
 expect(modal.x).toBeGreaterThanOrEqual(frame.x);expect(modal.y).toBeGreaterThanOrEqual(frame.y);
 expect(modal.x+modal.width).toBeLessThanOrEqual(frame.x+frame.width);
 expect(modal.y+modal.height).toBeLessThanOrEqual(frame.y+frame.height);
 if(size.width<640)await expect(shop.locator('.fd-modal-shell')).toHaveCSS('border-radius','0px');
 await shop.getByRole('button',{name:/Hạt Me/}).click();
 await shop.getByRole('button',{name:/Đổi bằng/}).click();await expect(shop).toContainText('Đã mở khóa');await page.screenshot({path:info.outputPath(`shop-${size.width}.png`)});
 await page.getByRole('button',{name:'Đóng tiệm'}).click();await exit(page);
 await open(page,'nhay-lo-co');await page.getByRole('button',{name:/2 Người Chung Máy/}).click();
 await expect(page.locator('canvas')).toBeVisible();await expect(page.getByRole('button',{name:/THẢY CHÀM/})).toBeVisible();
 await page.screenshot({path:info.outputPath(`nlc-local-${size.width}.png`)});await exit(page);expect(errors).toEqual([]);
});
