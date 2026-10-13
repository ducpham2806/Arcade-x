import {test,expect} from '@playwright/test';
import {enterLauncher} from '../qc/helpers';
import {parseCatalog} from '../../src/launcher/catalog';
import {BLOSSOM_TITLE} from '../../src/games/hex-match/blossom/branding';

test('old catalog metadata cannot restore Hex branding or change access rules',()=>{
 const catalog=parseCatalog({schemaVersion:1,games:[{id:'hex-match',engine_key:'hex-match',title:'Hex Collapse Puzzle',short_description:'Old timed hex game',status:'maintenance',access_model:'premium'}]})!;
 expect(catalog.games[0].title).toBe(BLOSSOM_TITLE);
 expect(catalog.games[0].shortDesc).not.toContain('Old timed hex');
 expect(catalog.games[0].availability).toBe('maintenance');
 expect(catalog.games[0].accessModel).toBe('premium');
});

for(const [width,height] of [[320,568],[390,844],[768,400],[1280,900]])test(`fresh launcher opens upgraded Blossom with supplied branding ${width}`,async({page})=>{
 await page.setViewportSize({width,height});
 await page.addInitScript(()=>{
  sessionStorage.setItem('arcadex_splash_completed','true');
  localStorage.setItem('arcadex_onboarding_completed_v1','true');
  localStorage.setItem('arcadex_skip_pregame_loading','true');
 });
 await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
 await page.goto('/');await enterLauncher(page);
 const card=page.locator('#game-card-hex-match');await card.scrollIntoViewIfNeeded();
 await expect(card).toContainText(BLOSSOM_TITLE);
 await expect(card.locator('image[href*="logo_blossom_blast.png"]')).toHaveCount(1);
 await page.locator('#btn-play-hex-match').click();
 await expect(page.locator('.blossom')).toBeVisible();
 await expect(page.locator('#btn-pregame-start')).toHaveCount(0);
 await expect(page.locator('.bb-brand')).toHaveAttribute('aria-label',BLOSSOM_TITLE);
 for(const selector of ['.bb-brand-icon','.bb-brand-logo']){
  await expect.poll(()=>page.locator(selector).evaluate((e:HTMLImageElement)=>e.complete&&e.naturalWidth>0)).toBe(true);
 }
 await page.evaluate(()=>{const badge=document.createElement('iframe');badge.id='nl-badge-frame';badge.title='Hosting badge test';badge.style.cssText='position:fixed;bottom:18px;right:18px;width:190px;height:36px;border:0;z-index:2147483647';document.body.append(badge);});
 await page.locator('.bb-node').first().click();
 const popup=page.locator('.bb-preparation');await expect(popup).toBeVisible();
 const start=popup.getByRole('button',{name:/Bắt đầu/});await expect(start).toBeInViewport({ratio:1});
 const geometry=await popup.locator('.bb-modal-body').evaluate(e=>e.scrollHeight-e.clientHeight);expect(geometry).toBeLessThanOrEqual(1);
 if(width<=900){const a=await start.boundingBox(),b=await page.locator('#nl-badge-frame').boundingBox();expect(a!.y+a!.height).toBeLessThanOrEqual(b!.y);}
 await start.click();await expect(page.locator('.bb-cell')).toHaveCount(25);
});
