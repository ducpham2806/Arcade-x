import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {test,expect} from '@playwright/test';
const file=pathToFileURL(path.resolve(process.cwd(),'../rainbow-blocks-review.html')).href;
for(const [width,height] of [[320,568],[360,640],[783,910],[1280,900],[844,390]])test(`mode frame and start stay fixed across all modes ${width}x${height}`,async({page})=>{
 await page.setViewportSize({width,height});await page.goto(file);await page.getByRole('button',{name:'Chọn chế độ',exact:true}).click();
 let reference:any;
 for(const name of ['Điểm cao','Thư giãn','Đua thời gian','Tốc độ riêng','Sprint 40 hàng']){
  await page.locator('.rb-modes button').filter({has:page.getByText(name,{exact:true})}).click();
  const rect=await page.locator('.rb-mode-panel').evaluate(el=>{const r=el.getBoundingClientRect(),button=el.querySelector('#rb-start')!.getBoundingClientRect(),body=el.querySelector('.rb-mode-body')!;return {x:r.x,y:r.y,w:r.width,h:r.height,buttonY:button.y,buttonBottom:button.bottom,overflow:body.scrollHeight-body.clientHeight};});
  if(!reference)reference=rect;else for(const k of ['x','y','w','h','buttonY'])expect(rect[k]).toBeCloseTo(reference[k],1);
  expect(rect.buttonBottom).toBeLessThanOrEqual(height);expect(rect.overflow).toBeLessThanOrEqual(1);
 }
 await page.screenshot({path:`tests/rainbow/screenshots/preparation-fixed-${width}.png`});
});
test('landing preview is optional before play, persists, and is rendered only when enabled',async({page})=>{
 await page.goto(file);await page.getByRole('button',{name:'Chọn chế độ',exact:true}).click();const toggle=page.getByRole('checkbox',{name:/Dự đoán vị trí rơi/});await expect(toggle).not.toBeChecked();await toggle.check();await page.reload();await page.getByRole('button',{name:'Chọn chế độ',exact:true}).click();await expect(toggle).toBeChecked();await toggle.uncheck();await page.evaluate(()=>localStorage.setItem('rainbow-tutorial-v1','done'));await page.locator('#rb-start').click();await page.waitForTimeout(3200);await expect(page.locator('canvas')).toHaveAttribute('data-ghost','false');
 // Pause prevents gravity from changing either screenshot, so only the ghost layer differs.
 await page.keyboard.press('KeyP');const before=await page.locator('canvas').evaluate((c:HTMLCanvasElement)=>c.toDataURL());await page.getByRole('dialog').getByRole('button',{name:'Cài đặt',exact:true}).click();await page.getByRole('button',{name:'Hình ảnh & âm thanh',exact:true}).click();await page.getByRole('checkbox',{name:'Dự đoán vị trí rơi',exact:true}).check();await expect(page.locator('canvas')).toHaveAttribute('data-ghost','true');await page.waitForTimeout(80);const after=await page.locator('canvas').evaluate((c:HTMLCanvasElement)=>c.toDataURL());expect(after).not.toBe(before);await page.getByRole('button',{name:'Đóng',exact:true}).click();await page.getByRole('button',{name:'Tiếp tục',exact:true}).click();await page.waitForTimeout(3200);await expect(page.locator('canvas')).toHaveAttribute('data-ghost','true');
});
