import {test,expect} from '@playwright/test';
import {createRun,hint} from '../../src/games/hex-match/blossom/engine';
import {LEVELS} from '../../src/games/hex-match/blossom/levels';
import {defaultSave} from '../../src/games/hex-match/blossom/save';
import {lessonsFor} from '../../src/games/hex-match/blossom/tutorials';
for(const special of ['bee_h','bee_v','sun','bloom_bomb','rainbow_orb','pop'] as const) test(`original sprites and readable ${special} motion`,async({page})=>{
 await page.setViewportSize({width:390,height:844});
 const s=defaultSave(),r=createRun(LEVELS[4],9);r.level.goals=[{kind:'score',target:9999999}];
 if(special!=='pop')r.board[14].special=special;
 s.active=r;s.tutorials=lessonsFor(r,[]).map(l=>l.id);
 await page.goto('/blossom-review.html');await page.evaluate(s=>localStorage.setItem('arcadex_blossom_review_v1',JSON.stringify(s)),s);await page.reload();
 await page.locator(`[data-cell="${special==='pop'?hint(r)[0]:14}"]`).click();
 await page.evaluate(()=>document.querySelectorAll('.bb-sprite-fx').forEach(el=>el.getAnimations({subtree:true}).forEach(a=>{a.pause();a.currentTime=220;})));
 const fx=page.locator(`[data-effect="${special}"]`).first();await expect(fx).toBeAttached();
 await expect(page.locator('.bb-footprint-cell,.bb-target-glow')).toHaveCount(0);
 if(special==='sun'){await expect(fx.locator('[data-beam-axis=h]')).toHaveCount(3);await expect(fx.locator('[data-beam-axis=v]')).toHaveCount(3);await expect(fx.locator('[data-sprite=sun_burst]')).toHaveCount(1);}
 if(special==='bee_h'){await expect(fx.locator('[data-beam-axis=h]')).toHaveCount(1);await expect(fx.locator('[data-beam-axis=v]')).toHaveCount(0);}
 if(special==='bee_v'){await expect(fx.locator('[data-beam-axis=v]')).toHaveCount(1);await expect(fx.locator('[data-beam-axis=h]')).toHaveCount(0);}
 if(special==='bloom_bomb')await expect(fx.locator('[data-sprite=bloom_bomb]')).toHaveCount(1);
 const sheet=fx.locator('.bb-fx-sheet').first();
 expect(await sheet.locator('image').getAttribute('href')).toContain('/png/anim/anim_fx_');
 const box=await page.locator('.bb-board').boundingBox(),overlay=await page.locator('.bb-sprite-fx > svg').first().boundingBox();
 expect(Math.abs(box!.width-overlay!.width)).toBeLessThan(25);
 await page.screenshot({path:`tests/blossom/screenshots/v8-${special}.png`});
 await page.evaluate(()=>document.querySelectorAll('.bb-sprite-fx').forEach(el=>el.getAnimations({subtree:true}).forEach(a=>a.play())));
 await expect(page.locator('.bb-sprite-fx')).toHaveCount(0,{timeout:10000});
});
