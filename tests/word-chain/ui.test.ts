import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
// Practice match in the real launcher: ready check, 3-2-1, a rejected word that can be retyped,
// an accepted word typed with Vietnamese diacritics, then the match ends with a result screen.
const words:string[]=JSON.parse(readFileSync('public/games/word-chain/words.v1.json','utf8')).words;
for(const [name,viewport] of [['phone',{width:390,height:844}],['desktop',{width:1366,height:900}]] as const)
test(`practice match with a bot plays to the end (${name})`,async({page})=>{
 test.setTimeout(150000);const errors:string[]=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.setViewportSize(viewport);
 await page.route('**/*',route=>['127.0.0.1','localhost'].includes(new URL(route.request().url()).hostname)?route.continue():route.abort());
 // Seed 6: the player goes first and the opener is "con người".
 await page.addInitScript(()=>{(globalThis as {__WORD_CHAIN_TEST_SEED__?:number}).__WORD_CHAIN_TEST_SEED__=6;});
 await page.goto('/');
 await page.getByRole('button',{name:'Slide 1: Nối Từ Đối Kháng',exact:true}).click();
 await page.getByRole('button',{name:'Tạm dừng chuyển banner',exact:true}).click();
 await page.getByRole('textbox',{name:'Tìm trò chơi',exact:true}).fill('Nối Từ');
 const card=page.locator('#game-card-word-chain');await expect(card).toHaveCount(1);
 await expect(card).toContainText('Luyện với 1–3 bot');
 await expect.poll(()=>card.locator('img').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth===512)).toBe(true);
 await expect.poll(()=>page.locator('.featured-word-chain img').first().evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
 await expect.poll(()=>page.locator('.featured-word-chain img').first().evaluate((img:HTMLImageElement)=>img.currentSrc)).toContain(name==='phone'?'/icons/word-chain.techart-':'/banners/word-chain.techart-');
 if(await page.locator('#btn-dismiss-pwa-prompt').isVisible())await page.locator('#btn-dismiss-pwa-prompt').click();
 await page.screenshot({path:`test-results/word-chain-${name}-launcher.png`,fullPage:true});
 await page.locator('#btn-play-word-chain').click();
 await page.locator('.nt-home').waitFor({timeout:30000});
 await expect(page.getByTestId('nt-match')).toHaveCount(0);
 await expect(page.locator('.nt-home')).toContainText('Đấu online sắp có');
 await page.getByTestId('nt-practice').click();await page.getByRole('button',{name:'1 bot'}).click();await page.getByTestId('nt-start-practice').click();
 await expect(page.locator('.nt-ready h2')).toHaveText('Chuẩn bị');
 await page.getByTestId('nt-ready').click();
 await expect(page.locator('.nt-countdown')).toBeVisible();
 const input=page.getByLabel('Gõ từ nối tiếp');
 await expect(input).toBeEnabled({timeout:8000});
 await expect(page.locator('.nt-tile.hot')).toHaveText('người');
 await expect(input).toHaveValue('người ');
 await input.pressSequentially('xyzq');await input.press('Enter');
 await expect(page.locator('.nt-feedback')).toContainText('không có trong từ điển');
 await expect(input).toBeEnabled();
 const reply=words.find(w=>w.startsWith('người ')&&words.some(x=>x.startsWith(w.split(' ')[1]+' ')))!;
 await page.waitForTimeout(800);
 await input.fill('người ');await input.pressSequentially(reply.split(' ')[1]);
 await expect(page.locator('.nt-feedback')).toContainText('hợp lệ');
 await input.press('Enter');
 await expect(page.locator('.nt-chain li')).toHaveCount(2);
 await expect(page.locator('.nt-chain li').last()).toHaveText(reply);
 await page.screenshot({path:`test-results/word-chain-${name}-match.png`});
 // From here nobody types for the player: either the bot blanks or the player times out.
 await expect(page.locator('.nt-results')).toBeVisible({timeout:100000});
 await expect(page.locator('.nt-podium li')).toHaveCount(2);
 await page.screenshot({path:`test-results/word-chain-${name}-result.png`});
 expect(errors).toEqual([]);
});
