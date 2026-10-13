import { test, expect } from '@playwright/test';
import { createRun,act,area,hint } from '../../src/games/hex-match/blossom/engine';
import { LEVELS } from '../../src/games/hex-match/blossom/levels';
import { defaultSave } from '../../src/games/hex-match/blossom/save';
import { lessonsFor } from '../../src/games/hex-match/blossom/tutorials';
import { effectDuration } from '../../src/games/hex-match/blossom/VFX';
async function load(page:any,save:any) {
 await page.goto('/blossom-review.html');await page.evaluate((s:any)=>localStorage.setItem('arcadex_blossom_review_v1',JSON.stringify(s)),save);await page.reload();
}
test('special footprints preserve exact rainbow color and sun three rows/columns',()=>{
 for(const special of ['rainbow_orb','sun','bloom_bomb'] as const){
  const r=createRun(LEVELS[79],9);r.level.goals=[{kind:'score',target:99999999}];r.level.bossHP=0;r.bossHP=0;
  r.board=r.board.map((t,i)=>({id:t.id,color:i%6}));r.board[40].special=special;
  const expected=area(r,40,special);if(!expected.includes(40))expected.push(40);
  const out=act(r,{type:'tap',cell:40},0).run,e=out.effects.find(e=>e.type===special)!;
  expect(e.cells!.sort((a,b)=>a-b)).toEqual(expected.sort((a,b)=>a-b));
  if(special==='rainbow_orb') expect(e.targets!.filter(t=>t.cell!==40).every(t=>t.color===e.color)).toBe(true);
  if(special==='sun') expect(e.cells!.every(i=>Math.abs(Math.floor(i/r.level.cols)-Math.floor(40/r.level.cols))<=1||Math.abs(i%r.level.cols-40%r.level.cols)<=1)).toBe(true);
 }
});
test('winning animations finish before one combined popup; reload never duplicates rewards',async({page})=>{
 const save=defaultSave(),r=createRun(LEVELS[0],9);r.level.goals=[{kind:'score',target:1}];r.moves=3;save.active=r;save.tutorials=lessonsFor(r,[]).map(l=>l.id);
 const result=act(r,{type:'tap',cell:hint(r)[0]},0).run;
 await load(page,save);const start=Date.now();await page.locator(`.bb-cell[data-cell="${hint(r)[0]}"]`).click();
 await expect(page.locator('.bb-animation-status')).toBeVisible();await expect(page.locator('.bb-unified-result')).toHaveCount(0);
 await expect(page.locator('.bb-cell').first()).toBeDisabled();
 await expect(page.locator('.bb-unified-result')).toBeVisible({timeout:20000});
 expect(Date.now()-start).toBeGreaterThanOrEqual(effectDuration(result)-120);
 await expect(page.getByRole('dialog')).toHaveCount(1);
 await expect(page.locator('.bb-unified-result')).toContainText('Thưởng lượt còn lại');
 await expect(page.locator('.bb-unified-result')).toContainText('Tổng Xu nhận được');
 await expect(page.getByRole('button',{name:/Xem tổng kết|Xem thưởng lượt dư/})).toHaveCount(0);
 const coins=await page.evaluate(()=>JSON.parse(localStorage.getItem('arcadex_blossom_review_v1')!).coins);
 await page.reload();await expect(page.locator('.bb-unified-result')).toBeVisible({timeout:20000});
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('arcadex_blossom_review_v1')!).coins)).toBe(coins);
});
test('rainbow links show target flowers and sun uses a cross, not a bomb ring',async({page})=>{
 for(const special of ['rainbow_orb','sun','bloom_bomb'] as const){
  const save=defaultSave(),r=createRun(LEVELS[4],9);r.level.goals=[{kind:'score',target:9999999}];r.board[14].special=special;save.active=r;save.tutorials=lessonsFor(r,[]).map(l=>l.id);
  await load(page,save);await page.locator('.bb-cell[data-cell="14"]').click();
  const wave=page.locator(`[data-effect="${special}"]`).first();await expect(wave).toBeAttached();
  expect(await wave.locator('[data-target-cell]').count()).toBeGreaterThan(0);
  if(special==='rainbow_orb')expect(await wave.locator('.bb-rainbow-thread').count()).toBeGreaterThan(0);
  if(special==='sun'){await expect(wave.locator('.bb-sun-rays')).toHaveCount(1);await expect(wave.locator('.bb-bomb-ring')).toHaveCount(0);}
  await page.waitForTimeout(200);await page.screenshot({path:`tests/blossom/screenshots/v6-${special}.png`});
 }
});
for(const width of [320,390])test(`garden fits ${width}px and place/delete survives reload`,async({page})=>{
 await page.setViewportSize({width,height:844});await page.goto('/blossom-review.html');await page.getByRole('button',{name:'Khu vườn',exact:true}).click();
 const grid=page.locator('.bb-garden'),b=await grid.boundingBox();expect(b!.x).toBeGreaterThanOrEqual(0);expect(b!.x+b!.width).toBeLessThanOrEqual(width);
 const boxes=await grid.locator('button').evaluateAll(es=>es.map(e=>({x:e.getBoundingClientRect().x,right:e.getBoundingClientRect().right})));
 expect(boxes).toHaveLength(48);expect(boxes.every(x=>x.x>=b!.x&&x.right<=b!.x+b!.width+1)).toBe(true);
 await grid.locator('button').last().click();await page.reload();await page.getByRole('button',{name:'Khu vườn',exact:true}).click();
 await expect(grid.locator('button').last().locator('img')).toHaveAttribute('alt','tree');
 await page.locator('.bb-decor').getByRole('button',{name:/Xóa/}).click();await grid.locator('button').last().click();
 await page.reload();await page.getByRole('button',{name:'Khu vườn',exact:true}).click();await expect(grid.locator('button').last().locator('img')).toHaveCount(0);
 expect(await page.locator('.bb-main').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
 await page.screenshot({path:`tests/blossom/screenshots/v6-garden-${width}.png`});
});
test('preparation and unified results are inset popups with visible footer on small mobile',async({page})=>{
 await page.setViewportSize({width:320,height:568});await page.goto('/blossom-review.html');await page.locator('.bb-node').first().click();
 const modal=page.locator('.bb-modal');const b=await modal.boundingBox();expect(b!.x).toBeGreaterThan(0);expect(b!.width).toBeLessThan(320);
 await expect(modal.locator('footer')).toBeInViewport();
 const save=defaultSave(),r=createRun(LEVELS[0],9);r.status='won';r.score=15000;r.bonusMoves=4;save.active=r;await load(page,save);
 await expect(page.locator('.bb-unified-result')).toBeVisible();await expect(page.locator('.bb-unified-result footer')).toBeInViewport();
 await page.screenshot({path:'tests/blossom/screenshots/v6-result-320.png'});
});

test('vacuum visual uses clicked color even when the goal requests another color',()=> {
 const r=createRun(LEVELS[4],9);r.level.goals=[{kind:'collect',color:0,target:999}];r.used['reserved:vacuum']=1;
 const cell=r.board.findIndex(t=>t.color===1&&!t.hazard&&!t.special);
 const out=act(r,{type:'vacuum',cell},0);expect(out.valid).toBe(true);
 const effect=out.run.effects.find(e=>e.type==='rainbow_orb')!;expect(effect.color).toBe(1);expect(effect.targets!.every(t=>t.color===1)).toBe(true);
});
test('winning with a hammer waits for falling even without explosion effects',async({page})=> {
 const save=defaultSave(),r=createRun(LEVELS[32],9);r.level.goals=[{kind:'score',target:1}];r.used['reserved:hammer']=1;
 const cell=r.board.findIndex(t=>t.color>=0&&!t.hazard&&!t.special&&!t.seed&&!t.boss);
 save.active=r;save.tutorials=lessonsFor(r,[]).map(l=>l.id);await load(page,save);
 await page.locator('.bb-tools').getByRole('button',{name:/Búa/}).click();
 const start=Date.now();await page.locator(`.bb-cell[data-cell="${cell}"]`).click();
 await expect(page.locator('.bb-unified-result')).toHaveCount(0);await expect(page.locator('.bb-animation-status')).toBeVisible();
 await expect(page.locator('.bb-unified-result')).toBeVisible();expect(Date.now()-start).toBeGreaterThanOrEqual(700);
});
