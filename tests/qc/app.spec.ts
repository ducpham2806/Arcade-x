import { enterLauncher } from './helpers';
import { test, expect, type Page } from '@playwright/test';
import { mockSupabase } from '../auth/backend';

const games = ['word-cross','car-escape','dungeon-tap','mummy-escape','shikaku','eat-em-all','scoodoku','fill-the-space','draw-a-shape','blocker','chess','xiangqi','caro-gomoku','neon-runner','cosmic-defense','cyber-slice','hex-match','tile-2048'];
const modals = ['profile','leaderboard','settings','auth','pvpHistory'];
async function openGame(page: Page, id: string) {
  await page.locator(`#game-card-${id}`).scrollIntoViewIfNeeded();
  const ai = ['chess','caro-gomoku'].includes(id);
  await page.locator(`button[id^="btn-play-${ai?'ai-':''}"][id$="${id}"]`).first().click();
  await expect(page.locator('#game-viewport-stage')).toBeVisible();
  await expect(page.getByText('Đang tải game…', {exact:true})).toHaveCount(0);
  await expect(page.getByText('Chưa mở được game.', {exact:false})).toHaveCount(0);
}
test.beforeEach(async ({context}) => { await mockSupabase().install(context); });
for (const view of [{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}]) {
  test.describe(view.name, () => {
    test.use({viewport:{width:view.width,height:view.height},isMobile:view.name==='mobile',hasTouch:view.name==='mobile'});
    for (const id of games) test(`${id}: launch and pause`, async ({page}, info) => {
      const errors: string[]=[];page.on('pageerror',e=>errors.push(e.message));
      await page.goto('/');await enterLauncher(page);await openGame(page,id);
      await expect(page.locator('#game-viewport-stage')).not.toHaveText('');
      await page.screenshot({path:info.outputPath('game.png')});
      await page.locator('#btn-game-pause').click();
      await expect(page.locator('#btn-pause-save-exit')).toBeVisible();
      expect(errors).toEqual([]);
    });
    for (const modal of modals) test(`${modal}: modal content and viewport`, async ({page}, info) => {
      const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
      await page.goto('/');await enterLauncher(page);await page.locator('#game-card-word-cross').waitFor();
      await page.evaluate(modal=>window.dispatchEvent(new CustomEvent('arcadex:open_modal',{detail:{modal}})),modal);
      if (modal === 'auth') { await expect(page.locator('#auth-entry-screen')).toBeVisible(); expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true); return; }
      await expect.poll(()=>page.evaluate(()=>[...document.querySelectorAll('div')].filter(e=>{
        const s=getComputedStyle(e),r=e.getBoundingClientRect();
        return s.position==='fixed'&&Number(s.zIndex)>=50&&r.width>200&&r.height>200&&e.innerText.trim().length>30;
      }).length)).toBeGreaterThan(0);
      await page.screenshot({path:info.outputPath('modal.png')});
      // Check horizontal overflow at the page level; modal scrolling is allowed.
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
      expect(errors).toEqual([]);
    });
  });
}
