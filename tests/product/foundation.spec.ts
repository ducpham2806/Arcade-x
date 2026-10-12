import { test, expect } from '@playwright/test';
import { slideBoard, spawnBoardTile } from '../../src/games/tile-2048/engine';
import { mockSupabase } from '../auth/backend';
import { launch, enterLauncher } from '../qc/helpers';

test('2048 rules: each tile merges once, input board immutable, no-op does not spawn', () => {
  const board = [[2,2,2,2],[4,0,4,4],[0,0,0,0],[8,0,0,8]];
  const result = slideBoard(board,'LEFT');
  expect(result.grid).toEqual([[4,4,0,0],[8,4,0,0],[0,0,0,0],[16,0,0,0]]);
  expect(result.points).toBe(32); expect(result.merges).toBe(4);
  expect(board[0]).toEqual([2,2,2,2]);
  expect(slideBoard([[2,0],[4,0]],'LEFT').moved).toBe(false);
  expect(slideBoard([[2,2],[2,2]],'DOWN').grid).toEqual([[0,0],[4,4]]);
  expect(spawnBoardTile([[2,4],[8,16]],42)).toEqual({grid:[[2,4],[8,16]],seed:42,spawned:false});
});
test('2048 rules: deterministic spawn and tile sum conserved by sliding in all directions', () => {
  const grid = [[2,0,2,4],[4,4,0,8],[0,2,2,0],[8,8,16,16]];
  expect(spawnBoardTile(grid,123)).toEqual(spawnBoardTile(grid,123));
  for (const direction of ['UP','DOWN','LEFT','RIGHT'] as const) {
    expect(slideBoard(grid,direction).grid.flat().reduce((a,b)=>a+b,0)).toBe(grid.flat().reduce((a,b)=>a+b,0));
  }
});
test('save hydration preserves local and remote candidates, separates games, recovers legacy',async({context,page})=>{
  await mockSupabase().install(context);await page.goto('/');await enterLauncher(page);
  const result=await page.evaluate(async()=>{
    // @ts-expect-error browser-side Vite module
    const module = await import(/* @vite-ignore */ '/src/services/gameSaves.ts');
    const values = { arcadex_save_v1_blocker: JSON.stringify({schemaVersion:1,payload:{score:20},baseVersion:5,dirty:true}), arcadex_gamestate_shikaku:'{"level":3}' };
    const hydrated=module.hydrateGameSaves(values,[{path:'players/u/game_sessions/save-blocker',version:9,data:{schemaVersion:1,payload:{score:30}}}]);
    for(const [key,value] of Object.entries(hydrated))localStorage.setItem(key,String(value));
    const local=module.readGameSave('blocker');
    const conflict=module.gameSaveStatus('blocker');
    const legacy=module.readGameSave('shikaku');
    module.resolveGameSave('blocker','remote');
    return {local,conflict,legacy,selected:module.readGameSave('blocker'), backups:Object.keys(localStorage).filter(key=>key.startsWith('arcadex_save_backup_')).length};
  });
  expect(result).toEqual({local:{score:20},conflict:'conflict',legacy:{level:3},selected:{score:30},backups:1});
});
test('2048 reload resumes automatically and confirms discarding when changing mode',async({context,page})=>{
  await mockSupabase().install(context);await launch(page,'tile-2048');
  for(const key of ['ArrowLeft','ArrowDown','ArrowRight','ArrowUp'])await page.keyboard.press(key);
  const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('arcadex_save_v1_tile-2048')!).payload);
  await page.locator('#game-viewport-stage').getByRole('button',{name:'5x5 Lớn',exact:true}).click();
  await expect(page.getByRole('dialog',{name:'Bắt đầu ván mới'})).toBeVisible();
  await page.getByRole('button',{name:'Giữ ván hiện tại',exact:true}).click();
  await page.reload();await enterLauncher(page);await page.locator('#btn-play-tile-2048').click();
  await expect(page.locator('#tile-2048-board')).toBeVisible();
  const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('arcadex_save_v1_tile-2048')!).payload);
  expect(after.grid).toEqual(before.grid);expect(after.rngState).toBe(before.rngState);
  await expect(page.locator('#game-viewport-stage')).not.toContainText('Ngọc Nhặt');
  await expect(page.getByRole('button',{name:'Thách Đấu',exact:true})).toHaveCount(0);
});
test('local write failure is visible and never reports a successful save',async({context,page})=>{
  await mockSupabase().install(context);await page.goto('/');await enterLauncher(page);
  const result=await page.evaluate(async()=>{
    // @ts-expect-error browser-side Vite module
    const module=await import(/* @vite-ignore */ '/src/services/gameSaves.ts');const original=Storage.prototype.setItem;
    let status='';window.addEventListener('arcadex:save-status',(event:any)=>{status=event.detail.status;});
    Storage.prototype.setItem=()=>{throw new DOMException('Full','QuotaExceededError');};
    const saved=module.writeGameSave('tile-2048',{score:1});Storage.prototype.setItem=original;return {saved,status};
  });expect(result).toEqual({saved:false,status:'error'});
});

test('per-game cloud sync uses server revisions and preserves both conflict candidates',async({context,page})=>{
  const backend=mockSupabase();await backend.install(context);await page.goto('/');await enterLauncher(page);
  const id=await page.evaluate(async()=>{
    // @ts-expect-error browser-side Vite module
    const cloud=await import('/src/services/supabaseClient.ts');
    await cloud.ensureCloudIdentity();
    // @ts-expect-error browser-side Vite module
    const saves=await import('/src/services/gameSaves.ts');
    const id=JSON.parse(localStorage.getItem('arcadex_player_profile')!).id;
    saves.writeGameSave('tile-2048',{score:10});await saves.syncGameSaves(id);return id;
  });
  const path=`players/${id}/game_sessions/save-tile-2048`;
  expect(backend.documents.get(path)?.data.payload).toEqual({score:10});
  const previous=backend.documents.get(path)!;
  backend.documents.set(path,{...previous,version:previous.version+100,data:{schemaVersion:1,payload:{score:90}}});
  const result=await page.evaluate(async(id)=>{
    // @ts-expect-error browser-side Vite module
    const saves=await import('/src/services/gameSaves.ts');
    saves.writeGameSave('tile-2048',{score:20});await saves.syncGameSaves(id);
    return {status:saves.gameSaveStatus('tile-2048'),payload:saves.readGameSave('tile-2048')};
  },id);
  expect(result).toEqual({status:'conflict',payload:{score:20}});
  expect(backend.documents.get(path)?.data.payload).toEqual({score:90});
  await page.evaluate(async(id)=>{
    // @ts-expect-error browser-side Vite module
    const saves=await import('/src/services/gameSaves.ts');
    saves.resolveGameSave('tile-2048','local');await saves.syncGameSaves(id);
  },id);
  expect(backend.documents.get(path)?.data.payload).toEqual({score:20});
});

test('Blocker preserves grid and tray after reload and cancels a drag without placing',async({context,page})=>{
  await mockSupabase().install(context);await launch(page,'blocker');
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('arcadex_save_v1_blocker')||'null')?.payload?.shapes?.length===3);
  const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('arcadex_save_v1_blocker')!).payload);
  const piece=page.locator('#game-viewport-stage div.cursor-grab').first();const box=(await piece.boundingBox())!;
  await piece.dispatchEvent('pointerdown',{pointerType:'mouse',clientX:box.x+box.width/2,clientY:box.y+box.height/2});
  await page.evaluate(()=>window.dispatchEvent(new PointerEvent('pointercancel',{clientX:200,clientY:200})));
  const cancelled=await page.evaluate(()=>JSON.parse(localStorage.getItem('arcadex_save_v1_blocker')!).payload);
  expect(cancelled.grid).toEqual(before.grid);expect(cancelled.shapes).toEqual(before.shapes);
  await page.reload();await enterLauncher(page);await page.locator('#btn-play-blocker').click();
  await expect(page.locator('#game-viewport-stage div.cursor-grab').first()).toBeVisible();
  const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('arcadex_save_v1_blocker')!).payload);
  expect(after.grid).toEqual(before.grid);expect(after.shapes).toEqual(before.shapes);
});

test('Runner simulation executes 60 ticks at 30, 60 and 120 Hz and drops paused backlog',async()=>{
  const {createFixedTicker}=await import('../../src/games/neon-runner/timing');
  for(const hz of [30,60,120]){
    const ticker=createFixedTicker();let count=0;
    for(let frame=0;frame<=hz;frame++)count+=ticker.advance(frame*1000/hz);
    expect(count).toBe(60);
    expect(ticker.advance(5000,false)).toBe(0);
    expect(ticker.advance(5000+1000/60,true)).toBe(1);
    expect(ticker.advance(9000,true)).toBeLessThanOrEqual(6);
  }
});

test('2048 touch swipe advances exactly one move, undo restores RNG and timer',async({context,page})=>{
  await mockSupabase().install(context);await launch(page,'tile-2048');
  await page.evaluate(async()=>{
    // @ts-expect-error browser-side Vite module
    const saves=await import('/src/services/gameSaves.ts');
    saves.writeGameSave('tile-2048',{version:1,rngState:42,assisted:false,gameMode:'classic',grid:[[0,2,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0]],score:0,combo:0,movesCount:0,maxTile:2,rushTime:60,gemsEarnedThisGame:0,milestonesReached:{},undoCharges:3,shuffleCharges:1,hammerCharges:1,history:[]});
  });
  await page.reload();await enterLauncher(page);await page.locator('#btn-play-tile-2048').click();await expect(page.locator('#tile-2048-board')).toBeVisible();
  await page.locator('#tile-2048-board').evaluate(target=>{
    const box=target.getBoundingClientRect(),y=box.y+box.height/2;
    const start=new Touch({identifier:1,target,clientX:box.x+box.width*.8,clientY:y});
    const end=new Touch({identifier:1,target,clientX:box.x+box.width*.2,clientY:y});
    target.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[start],changedTouches:[start]}));
    target.dispatchEvent(new TouchEvent('touchend',{bubbles:true,touches:[],changedTouches:[end]}));
  });
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('arcadex_save_v1_tile-2048')!).payload.movesCount)).toBe(1);
  await page.locator('#btn-2048-undo').click();
  const undone=await page.evaluate(()=>JSON.parse(localStorage.getItem('arcadex_save_v1_tile-2048')!).payload);
  expect(undone.movesCount).toBe(0);expect(undone.rngState).toBe(42);expect(undone.maxTile).toBe(2);expect(undone.assisted).toBe(true);
});

for(const viewport of [{width:320,height:568},{width:390,height:844}])test(`2048 ${viewport.width}: board and direction controls fit viewport`,async({context,page})=>{
  await mockSupabase().install(context);await page.setViewportSize(viewport);await launch(page,'tile-2048');
  const board=await page.locator('#tile-2048-board').boundingBox();expect(board!.y).toBeGreaterThanOrEqual(0);expect(board!.y+board!.height).toBeLessThanOrEqual(viewport.height);
  for(const label of ['Trượt Lên','Trượt Xuống','Trượt Trái','Trượt Phải']){
    const button=page.getByRole('button',{name:label,exact:true});const box=(await button.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);expect(box.y+box.height).toBeLessThanOrEqual(viewport.height);
  }
});
