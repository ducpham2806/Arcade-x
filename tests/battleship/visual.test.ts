import {test,expect,type Page} from '@playwright/test';
import {boardCamera,cellPercent} from '../../src/games/battleship/projection';
// The perspective board: a tap on the drawn centre of a cell (near or far, any corner) fires at
// that cell; the rotate button sits beside the ship being placed; nothing throws.
const cam=boardCamera(),coord=(r:number,c:number)=>`${String.fromCharCode(65+r)}${c+1}`;
async function openBattleship(page:Page){
 await page.goto('/');await page.locator('#btn-play-battleship').click();
 await page.locator('.bs-home').waitFor({timeout:30000});
}
async function tapCell(page:Page,row:number,col:number,size=10){
 const canvas=page.locator('[data-testid=board-main] canvas[data-perspective]');await canvas.evaluate(el=>el.scrollIntoView({block:'center'}));const box=(await canvas.boundingBox())!;
 const p=cellPercent(cam,row,col,size);await page.mouse.click(box.x+box.width*p.x/100,box.y+box.height*p.y/100);
}
for(const [name,viewport] of [['phone',{width:390,height:844}],['desktop',{width:1366,height:900}]] as const)
test(`perspective board hits the tapped cell and places ships (${name})`,async({page})=>{
 test.setTimeout(90000);const errors:string[]=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.setViewportSize(viewport);await openBattleship(page);
 await expect(page.locator('.bs-hero-scene')).toBeVisible();
 await page.getByRole('button',{name:/CHƠI VỚI BOT/}).click();
 // Placement: tap a cell on the own board; the rotate button appears next to the ship's end.
 await tapCell(page,2,3);await expect(page.locator('.bs-target')).toContainText('C4');
 const rotate=page.locator('.bs-rotate');await expect(rotate).toBeVisible();
 const box=(await page.locator('[data-testid=board-main] canvas').boundingBox())!,rb=(await rotate.boundingBox())!;
 const end=cellPercent(cam,2,4,10),ex=box.x+box.width*end.x/100,ey=box.y+box.height*end.y/100;
 expect(Math.hypot(rb.x+rb.width/2-ex,rb.y+rb.height/2-ey)).toBeLessThan(70);
 await page.getByRole('button',{name:/Tự đặt/}).click();await expect(page.locator('.bs-panel h2')).toContainText('5/5');
 await page.screenshot({path:`test-results/battleship-${name}-placement.png`});
 await page.getByTestId('ready').click();
 for(const [row,col] of [[0,0],[0,9],[9,0],[9,9],[4,5]]){
  await expect(page.getByTestId('turn-label')).toContainText('LƯỢT CỦA BẠN',{timeout:20000});
  await tapCell(page,row,col);
  await expect(page.locator('.bs-feedback')).toContainText(`A1 bắn ${coord(row,col)}`,{timeout:5000});
 }
 await page.waitForTimeout(1200);await page.screenshot({path:`test-results/battleship-${name}-battle.png`});
 await expect(page.locator('.bs-fleet-status li')).toHaveCount(10);
 expect(errors).toEqual([]);
});
