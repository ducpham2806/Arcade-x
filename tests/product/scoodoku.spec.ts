import { test, expect } from '@playwright/test';
import { mockSupabase } from '../auth/backend';
import { launch, enterLauncher } from '../qc/helpers';

test('Scoodoku preserves notes, board, undo and free hint budget after reload',async({context,page})=>{
  await mockSupabase().install(context);await launch(page,'scoodoku');
  await page.locator('#scoodoku-btn-campaign').click();await page.locator('#scoodoku-stage-btn-1').click();
  const payload=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('arcadex_save_v1_scoodoku')!).payload);
  await expect.poll(async()=>(await payload()).run?.board?.dimension).toBe(4);
  const initial=await payload();const cell=initial.run.board.cells.flat().find((cell:any)=>!cell.isGiven);
  await page.locator(`#scoodoku-cell-${cell.row}-${cell.col}`).click();
  await page.locator('#scoodoku-btn-notes').click();await page.locator('#scoodoku-num-'+cell.solutionValue).click();
  await expect.poll(async()=>(await payload()).run.board.cells[cell.row][cell.col].notes).toEqual([cell.solutionValue]);
  await page.reload();await enterLauncher(page);await page.locator('#btn-play-scoodoku').click();
  await expect(page.locator('#scoodoku-btn-notes')).toContainText('BẬT');
  await expect(page.locator('#scoodoku-btn-undo')).toBeEnabled();await page.locator('#scoodoku-btn-undo').click();
  await expect.poll(async()=>(await payload()).run.board.cells[cell.row][cell.col].notes).toEqual([]);
  const walletBefore=await page.evaluate(()=>JSON.parse(localStorage.getItem('arcadex_player_profile')!).coins);
  for(let i=0;i<3;i++){
    const saved=await payload();const empty=saved.run.board.cells.flat().find((cell:any)=>!cell.isGiven && cell.value===null);
    await page.locator(`#scoodoku-cell-${empty.row}-${empty.col}`).click();await page.locator('#scoodoku-btn-hint').click();
    await expect.poll(async()=>(await payload()).run.hintsAvailable).toBe(2-i);
  }
  await expect(page.locator('#scoodoku-btn-hint')).toBeDisabled();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('arcadex_player_profile')!).coins)).toBe(walletBefore);
  await page.reload();await enterLauncher(page);await page.locator('#btn-play-scoodoku').click();
  await expect(page.locator('#scoodoku-btn-hint')).toBeDisabled();
  await page.locator('#btn-game-pause').click();const before=(await payload()).run.board;
  await page.keyboard.press('1');expect((await payload()).run.board).toEqual(before);
});
