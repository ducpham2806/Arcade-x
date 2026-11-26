import {test,expect,type Page} from '@playwright/test';
import {act,createRun,hint} from '../../src/games/hex-match/blossom/engine';
import {LEVELS} from '../../src/games/hex-match/blossom/levels';
import {defaultSave} from '../../src/games/hex-match/blossom/save';
import {lessonsFor} from '../../src/games/hex-match/blossom/tutorials';
import type { Run } from '../../src/games/hex-match/blossom/types';
for(const special of ['bee_h','bee_v','sun','bloom_bomb','rainbow_orb','pop'] as const) test(`original sprites and readable ${special} motion`,async({page})=>{
 await page.setViewportSize({width:390,height:844});
 const s=defaultSave(),r=createRun(LEVELS[4],9);r.level.goals=[{kind:'score',target:9999999}];
 if(special!=='pop')r.board[14].special=special;
 s.active=r;s.tutorials=lessonsFor(r,[]).map(l=>l.id);
 await page.goto('/blossom-review.html');await page.evaluate(s=>localStorage.setItem('arcadex_blossom_review_v1',JSON.stringify(s)),s);await page.reload();
 const cell=special==='pop'?hint(r)[0]:14;
 const expected=act(r,{type:'tap',cell},0).run.effects.find(effect=>effect.type===special)!;
 await page.locator(`[data-cell="${cell}"]`).click();
 await page.evaluate(()=>document.querySelectorAll('.bb-sprite-fx').forEach(el=>el.getAnimations({subtree:true}).forEach(a=>{a.pause();a.currentTime=220;})));
 const fx=page.locator(`[data-effect="${special}"]`).first();await expect(fx).toBeAttached();
 await expect(page.locator('.bb-footprint-cell,.bb-target-glow')).toHaveCount(0);
 const marked=await fx.locator('[data-impact-cell]').evaluateAll(nodes=>nodes.map(node=>Number(node.getAttribute('data-impact-cell'))));
 expect(marked).toEqual([...new Set(expected.cells ?? [expected.cell])]);
 if(special==='sun'){await expect(fx.locator('[data-beam-axis=h]')).toHaveCount(3);await expect(fx.locator('[data-beam-axis=v]')).toHaveCount(3);await expect(fx.locator('[data-sprite=sun_burst]')).toHaveCount(1);}
 if(special==='bee_h'){await expect(fx.locator('[data-beam-axis=h]')).toHaveCount(1);await expect(fx.locator('[data-beam-axis=v]')).toHaveCount(0);}
 if(special==='bee_v'){await expect(fx.locator('[data-beam-axis=v]')).toHaveCount(1);await expect(fx.locator('[data-beam-axis=h]')).toHaveCount(0);}
 if(special==='bloom_bomb')await expect(fx.locator('[data-sprite=bloom_bomb]')).toHaveCount(1);
 const sheet=fx.locator('.bb-fx-sheet').first();
 expect(await sheet.locator('image').getAttribute('href')).toMatch(/\/blossom\/gemini\/fx-[a-z-]+\.webp$/);
 const box=await page.locator('.bb-board').boundingBox(),overlay=await page.locator('.bb-sprite-fx > svg').first().boundingBox();
 expect(Math.abs(box!.width-overlay!.width)).toBeLessThan(25);
 await page.screenshot({path:`tests/blossom/screenshots/v8-${special}.png`});
 await page.evaluate(()=>document.querySelectorAll('.bb-sprite-fx').forEach(el=>el.getAnimations({subtree:true}).forEach(a=>a.play())));
 await expect(page.locator('.bb-sprite-fx')).toHaveCount(0,{timeout:10000});
});

async function openRun(page: Page, run: Run) {
  const save = defaultSave();
  save.active = run;
  save.tutorials = lessonsFor(run, []).map(lesson => lesson.id);
  await page.goto('/blossom-review.html');
  await page.evaluate(save => localStorage.setItem('arcadex_blossom_review_v1', JSON.stringify(save)), save);
  await page.reload();
  await expect(page.locator('.bb-board')).toBeVisible();
}

function feedbackRun() {
  const run = createRun(LEVELS[4], 9);
  run.level = { ...run.level, goals: [{ kind: 'score', target: 9_999_999 }] };
  return run;
}

test('a valid adjacent fusion links the actual two cells and keeps its cue in reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const run = feedbackRun();
  run.board[14].special = 'bee_h';
  run.board[15].special = 'bloom_bomb';
  const expected = act(run, { type: 'merge', cell: 14, other: 15 }, 0).run;
  await openRun(page, run);
  await page.locator('[data-cell="14"]').click();
  await page.locator('[data-cell="15"]').click();
  const cue = page.locator('[data-link="merge"]');
  await expect(cue).toHaveAttribute('data-from', '15');
  await expect(cue).toHaveAttribute('data-to', '14');
  await expect(cue).toHaveCSS('animation-name', 'none');
  await expect(cue).toHaveCSS('opacity', '0.85');
  await expect(page.locator('[data-sprite="merge-ring"] image')).toHaveAttribute('href', '/blossom/vfx/merge-ring.webp');
  await expect(page.locator('.bb-hud > div').first().locator('b')).toHaveText(String(expected.moves));
  await expect(cue).toHaveCount(0);
});

test('a new special blooms where it lands and the collect goal shows completion once', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  const run = feedbackRun();
  run.level.goals.push({ kind: 'collect', color: 0, target: 5 });
  const cells = [0, 1, 2, 3, 4];
  run.board.forEach((tile, cell) => { tile.color = cells.includes(cell) ? 0 : 1 + cell % 3; });
  const expected = act(run, { type: 'tap', cell: 2 }, 0).run;
  const special = expected.board.findIndex(tile => tile.special && tile.id >= run.nextId);
  expect(special).toBeGreaterThanOrEqual(0);
  await openRun(page, run);
  await page.locator('[data-cell="2"]').click();
  await expect(page.locator(`[data-spawned-special="${special}"] [data-sprite="bloom"] image`)).toHaveAttribute('href', '/blossom/vfx/bloom.webp');
  await expect(page.locator('[data-goal-feedback="completed"]')).toHaveText('✓');
  await expect(page.locator('.bb-score-feedback')).toHaveText(`+${expected.score}`);
  await expect(page.locator('.bb-goal-feedback, .bb-score-feedback')).toHaveCount(0);
  await expect(page.locator('.bb-goals .done strong')).toHaveText('5 / 5');
});

test('portal pulse and trail start at the engine transfer, with a nonblocking board', async ({ page }) => {
  const run = feedbackRun();
  run.level.portals = true;
  run.portals = [1, 2 * run.level.cols + 3];
  run.used['reserved:hammer'] = 1;
  run.board[1].special = 'sun';
  const exit = run.portals[1];
  const expected = act(run, { type: 'hammer', cell: exit }, 0).run;
  expect(expected.portalMoves?.[0]).toMatchObject({ from: 1, to: exit });
  await openRun(page, run);
  await page.locator('.bb-tools').getByRole('button', { name: /Búa/ }).click();
  await page.locator(`[data-cell="${exit}"]`).click();
  const cue = page.locator('[data-link="portal"]');
  await expect(cue).toHaveAttribute('data-from', '1');
  await expect(cue).toHaveAttribute('data-to', String(exit));
  await expect(page.locator('[data-sprite="portal"]')).toHaveCount(2);
  await expect(page.locator('.bb-sprite-fx').last()).toHaveCSS('pointer-events', 'none');
  await expect(page.locator(`[data-cell="${exit}"]`)).toBeEnabled();
  await expect(cue).toHaveCount(0);
});
