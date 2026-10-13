import {test,expect} from '@playwright/test';
import {enterLauncher} from '../qc/helpers';
test('mobile production badge stays clear of preparation and game controls',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');await enterLauncher(page);await page.locator('#game-card-rainbow-blocks').scrollIntoViewIfNeeded();await page.locator('#btn-play-rainbow-blocks').click();await expect(page.locator('#rb-play')).toBeVisible();
 await page.evaluate(()=>{const badge=document.createElement('iframe');badge.id='nl-badge-frame';badge.title='Hosting badge test';badge.style.cssText='position:fixed;bottom:18px;right:18px;width:190px;height:36px;border:0;z-index:2147483647';document.body.append(badge);localStorage.setItem('rainbow-tutorial-v1','done');});
 await page.getByRole('button',{name:'Chọn chế độ',exact:true}).click();
 const footer=await page.locator('#rb-start').boundingBox(),badge=await page.locator('#nl-badge-frame').boundingBox();expect(footer!.y+footer!.height).toBeLessThan(badge!.y);await page.locator('#rb-start').click();await page.waitForTimeout(3200);await expect(page.locator('canvas')).toHaveAttribute('data-phase','playing');const drop=page.locator('[data-action=HARD_DROP]');const rect=await drop.boundingBox();expect(rect!.y+rect!.height).toBeLessThan(badge!.y);await drop.click();await expect(page.locator('[data-testid=rb-score]')).not.toHaveText('0');
});
