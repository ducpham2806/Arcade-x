import { enterLauncher } from './helpers';
import {test,expect} from '@playwright/test';
import {mockSupabase} from '../auth/backend';
import {inspectState,launch,state,drag} from './helpers';
test.use({viewport:{width:1440,height:900}});
test.beforeEach(async({context,page})=>{await mockSupabase().install(context);await inspectState(page);});

test('Sudoku campaign: fill puzzle and reach win',async({page})=>{
  await launch(page,'scoodoku');await page.locator('#scoodoku-btn-campaign').click();await page.locator('#scoodoku-stage-btn-1').click();
  const board=(await state(page,'ScoodokuGame')).find(x=>x?.cells&&x?.dimension);
  for(const row of board.cells)for(const cell of row)if(!cell.isGiven){await page.locator(`#scoodoku-cell-${cell.row}-${cell.col}`).click();await page.locator('#scoodoku-num-'+cell.solutionValue).click();}
  await expect(page.locator('#game-viewport-stage')).toContainText(/Hoàn Thành|Chiến Thắng|thành công|Xuất Sắc/i);
});
test('Fill the Space: place every block and win',async({page})=>{
  await launch(page,'fill-the-space');const puzzle=(await state(page,'FillTheSpaceGame'))[4];
  for(const sol of puzzle.solution){await page.locator('#wood-block-'+sol.blockId).click();const b=puzzle.blocks.find((b:any)=>b.id===sol.blockId);await page.locator(`#cell-${sol.position[0]+b.cells[0][0]}-${sol.position[1]+b.cells[0][1]}`).click();}
  await expect(page.locator('#game-viewport-stage')).toContainText(/LẤP ĐẦY THÀNH CÔNG/i);
});
test('Draw a Shape: complete every path and win',async({page})=>{
  await launch(page,'draw-a-shape');const stage=page.locator('#game-viewport-stage');await stage.getByRole('button',{name:/Cổ Điển/}).click();
  const s=await state(page,'DrawAShapeGame');const grid=stage.locator('div[style*="grid-template-columns"]').first();
  for(const path of s[9]){const b=(await grid.boundingBox())!;await drag(page,path.map((p:any)=>({x:b.x+(p.c+.5)*b.width/s[6].C,y:b.y+(p.r+.5)*b.height/s[6].R})));}
  await expect(stage).toContainText(/Xuất Sắc/i);
});
test('Chess: legal pawn move and AI response',async({page})=>{
  await launch(page,'chess');await page.locator('#chess-sq-e2').click();await page.locator('#chess-sq-e4').click();await page.locator('#chess-sq-e4').click();
  await expect.poll(async()=>JSON.stringify(await state(page,'ChessGame'))).toContain('e4');
  await expect(page.locator('#game-viewport-stage')).toContainText('Lượt của bạn');
});
test('2048: keyboard moves increase score',async({page})=>{
  await launch(page,'tile-2048');for(let i=0;i<24;i++)await page.keyboard.press(['ArrowLeft','ArrowDown','ArrowRight','ArrowUp'][i%4]);
  expect((await state(page,'Tile2048Game'))[2]).toBeGreaterThan(0);
});
test('QC-002: 2048 saves and restores the same board',async({page},info)=>{
  await launch(page,'tile-2048');for(let i=0;i<20;i++)await page.keyboard.press(['ArrowLeft','ArrowDown','ArrowRight','ArrowUp'][i%4]);
  const before=await state(page,'Tile2048Game');await page.locator('#btn-game-pause').click();await page.locator('#btn-pause-save-exit').click();
  await page.reload();await enterLauncher(page);await page.locator('#paused-game-banner').getByRole('button',{name:/Tiếp Tục/i}).first().click();await page.locator('#game-viewport-stage').waitFor();
  const after=await state(page,'Tile2048Game');await info.attach('board-state',{body:JSON.stringify({before:before.slice(0,4),after:after.slice(0,4)}),contentType:'application/json'});
  expect(after[1]).toEqual(before[1]);expect(after[2]).toBe(before[2]);
});
test('QC-003: 2048 board survives currency update',async({page},info)=>{
  await launch(page,'tile-2048');for(let i=0;i<20;i++)await page.keyboard.press(['ArrowLeft','ArrowDown','ArrowRight','ArrowUp'][i%4]);
  const before=await state(page,'Tile2048Game');await page.evaluate(()=>(window as any).qcContext('addCoins').addCoins(1));
  await expect.poll(async()=> (await page.evaluate(()=>JSON.parse(localStorage.getItem('arcadex_player_profile')!))).coins).toBeGreaterThan(200);
  const after=await state(page,'Tile2048Game');await info.attach('board-state',{body:JSON.stringify({before:before.slice(0,4),after:after.slice(0,4)}),contentType:'application/json'});
  expect(after[1]).toEqual(before[1]);
});
test('Platform XP and quest callbacks no longer advance the user profile',async({page})=>{
  await page.goto('/');await enterLauncher(page);await page.locator('#game-card-word-cross').waitFor();
  const before=await page.evaluate(()=>{const p=(window as any).qcContext('addExp').profile;return {level:p.level,exp:p.exp};});
  const quests=await page.evaluate(()=>(window as any).qcContext('reportQuestProgress').dailyQuests);
  await page.evaluate(()=>{(window as any).qcContext('addExp').addExp(100000);(window as any).qcContext('reportQuestProgress').reportQuestProgress('game_play:blocker',100);(window as any).qcContext('reportAchievementProgress').reportAchievementProgress('ach-first-game',100);});
  const after=await page.evaluate(()=>{const p=(window as any).qcContext('addExp').profile;return {level:p.level,exp:p.exp};});
  expect(after).toEqual(before);expect(await page.evaluate(()=>(window as any).qcContext('reportQuestProgress').dailyQuests)).toEqual(quests);
  await page.reload();await enterLauncher(page);await page.locator('#game-card-word-cross').waitFor();
  expect(await page.evaluate(()=>{const p=(window as any).qcContext('addExp').profile;return {level:p.level,exp:p.exp};})).toEqual(before);
});
test('QC-005: Draw a Shape timer stops while paused',async({page},info)=>{
  await launch(page,'draw-a-shape');await page.locator('#game-viewport-stage').getByRole('button',{name:/Thời Gian/}).click();await page.locator('#btn-game-pause').click();
  const before=(await state(page,'DrawAShapeGame'))[15];await page.waitForTimeout(3200);const after=(await state(page,'DrawAShapeGame'))[15];
  await info.attach('paused-timer',{body:JSON.stringify({before,after}),contentType:'application/json'});
  expect(after).toBe(before);
});

test('Mummy Escape: movement advances turn and position',async({page})=>{
  await launch(page,'mummy-escape');const before=await state(page,'MummyEscapeGame');await page.locator('#dpad-down').click();await page.waitForTimeout(450);await page.locator('#dpad-down').click();
  expect((await state(page,'MummyEscapeGame'))[18]).not.toEqual(before[18]);
});
test('Eat Em All: start and switch element',async({page})=>{
  await launch(page,'eat-em-all');await page.locator('#btn-start-eat-em-all').click();const before=(await state(page,'EatEmAllGame'))[7];await page.locator('#btn-switch-element-hud').click();expect((await state(page,'EatEmAllGame'))[7]).not.toBe(before);
});
test('Cosmic Defense: EMP consumes exactly one charge',async({page})=>{
  await page.setViewportSize({width:390,height:844});await launch(page,'cosmic-defense');const before=(await state(page,'CosmicDefenseGame'))[7].current.empBombs;await page.locator('#btn-trigger-emp').click();expect((await state(page,'CosmicDefenseGame'))[7].current.empBombs).toBe(before-1);
});
test('Neon Runner: simulation advances and jump control responds',async({page})=>{
  await page.setViewportSize({width:390,height:844});await launch(page,'neon-runner');const before=(await state(page,'NeonRunnerGame'))[6].current.distance;await page.locator('#btn-touch-jump').click();
  await expect.poll(async()=> (await state(page,'NeonRunnerGame'))[6].current.distance).toBeGreaterThan(before);
});
test('Dungeon Tap: attacks progress combat',async({page})=>{
  await launch(page,'dungeon-tap');const before=await state(page,'DungeonTapGame');const arena=page.locator('#game-viewport-stage').locator('div[class*="h-[340px]"]').first();for(let i=0;i<12;i++)await arena.click();const after=await state(page,'DungeonTapGame');expect(after.slice(1,8)).not.toEqual(before.slice(1,8));
});
test('Xiangqi: legal pawn move changes board',async({page})=>{
  await launch(page,'xiangqi');await page.locator('#btn-xiangqi-ai-easy').click();const cells=page.locator('#game-viewport-stage div.grid-cols-9 > div');await cells.nth(54).click();await cells.nth(45).click();await cells.nth(45).click();
  await expect.poll(async()=> (await state(page,'XiangqiGame'))[5][5][0]?.id).toBe('r_p1');
});
test('Hex Match: removing a group awards points',async({page})=>{
  await launch(page,'hex-match');const stage=page.locator('#game-viewport-stage');await stage.getByRole('button',{name:/Tiếp Tục Chơi/}).click();
  const grid=(await state(page,'HexMatchGame'))[6];let selected=-1;
  for(let r=0;r<grid.length&&selected<0;r++)for(let c=0;c<grid[r].length;c++){const seen=new Set<string>(),queue=[[r,c]];while(queue.length){const [a,b]=queue.pop()!;const key=a+','+b;if(seen.has(key)||!grid[a]?.[b]||grid[a][b].color!==grid[r][c].color||grid[a][b].obstacle==='stone')continue;seen.add(key);const odd=a%2;queue.push([a,b-1],[a,b+1],[a-1,b+odd-1],[a-1,b+odd],[a+1,b+odd-1],[a+1,b+odd]);}if(seen.size>=3){selected=r*grid[r].length+c;break;}}
  expect(selected).toBeGreaterThanOrEqual(0);await stage.locator('button.overflow-visible').nth(selected).click();
  await expect.poll(async()=> (await state(page,'HexMatchGame'))[7]).toBeGreaterThan(0);
});

test('Word Cross: drag a word and mark it found',async({page})=>{
  await launch(page,'word-cross');await page.locator('#wc-level-1').click();
  const run=await page.evaluate(()=>JSON.parse(localStorage.getItem('arcadex_save_v1_word-cross')!).payload.run);
  const points=[];for(const p of run.puzzle.words[0].path){const b=(await page.locator(`#wc-board [data-r="${p.r}"][data-c="${p.c}"]`).boundingBox())!;points.push({x:b.x+b.width/2,y:b.y+b.height/2});}
  await drag(page,points);
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('arcadex_save_v1_word-cross')!).payload.run.found.map((w:any)=>w.word))).toContain(run.puzzle.words[0].word);
});
test('Car Escape: isometric vehicle move registers one arbitrary-distance slide',async({page})=>{
  await launch(page,'car-escape');await page.locator('#car-level-1').click();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('arcadex_save_v1_car-escape')!).payload.run);
  const {legalMoves}=await import('../../src/games/car-escape/engine');const move=legalMoves(saved.vehicles,saved.config.size)[0];
  await page.locator(`[data-car-id="${move.vehicleId}"]`).focus();await page.keyboard.press('Enter');
  await page.getByLabel('Điểm đến của xe đã chọn').selectOption(String(move.to));await page.getByRole('button',{name:'Di chuyển',exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('arcadex_save_v1_car-escape')!).payload.run.moves)).toBe(1);
});
test('Blocker: drag a piece onto board and score',async({page})=>{
  await launch(page,'blocker');const stage=page.locator('#game-viewport-stage');const shape=(await state(page,'BlockerGame'))[7][0];const b=(await stage.locator('div.cursor-grab').first().boundingBox())!,g=(await stage.locator('div[style*="grid-template-columns"]').first().boundingBox())!;
  await drag(page,[{x:b.x+b.width/2,y:b.y+b.height/2},{x:g.x+shape.matrix[0].length*g.width/16,y:g.y+shape.matrix.length*g.height/16}]);expect((await state(page,'BlockerGame'))[8]).toBeGreaterThan(0);
});
test('Caro: human move appears on the board',async({page})=>{
  await launch(page,'caro-gomoku');const cells=page.locator('#game-viewport-stage div.group.aspect-square.overflow-hidden');await cells.nth(112).click();await cells.nth(112).click();await expect(cells.nth(112)).toContainText('X');
});
test('Cyber Slice: slicing fruit awards points',async({page})=>{
  await launch(page,'cyber-slice');const b=(await page.locator('#game-viewport-stage canvas').boundingBox())!;
  // Several sweeps allow the first fruit wave to spawn naturally.
  for(let round=0;round<12;round++){await drag(page,[{x:b.x+b.width*.1,y:b.y+b.height*.65},{x:b.x+b.width*.9,y:b.y+b.height*.4},{x:b.x+b.width*.1,y:b.y+b.height*.2}]);await page.waitForTimeout(150);}
  expect((await state(page,'CyberSliceGame'))[10]).toBeGreaterThan(0);
});
test('Shikaku: draw one valid region',async({page})=>{
  await launch(page,'shikaku');const stage=page.locator('#game-viewport-stage');await stage.getByRole('button',{name:'Zen Mode',exact:true}).click();await stage.getByRole('button',{name:'2 Chạm',exact:true}).focus();await page.keyboard.press('Enter');const p=(await state(page,'ShikakuGame'))[1];const q=p.solution[0];const b=(await stage.locator('div[class*="w-[min(96vw"]').first().boundingBox())!;
  await drag(page,[{x:b.x+(q.c+.5)*b.width/p.size,y:b.y+(q.r+.5)*b.height/p.size},{x:b.x+(q.c+q.w-.5)*b.width/p.size,y:b.y+(q.r+q.h-.5)*b.height/p.size}]);expect((await state(page,'ShikakuGame'))[2]).toHaveLength(1);
});
test('QC-008: global chat does not cover Cosmic Defense EMP control',async({page},info)=>{
  await page.setViewportSize({width:1280,height:720});await launch(page,'cosmic-defense');await page.waitForTimeout(500);
  const control=page.locator('#btn-trigger-emp');const b=(await control.boundingBox())!;
  const unobstructed=await page.evaluate(({x,y})=>{const button=document.getElementById('btn-trigger-emp');return button?.contains(document.elementFromPoint(x,y));},{x:b.x+b.width/2,y:b.y+b.height/2});
  await info.attach('covered-control',{body:await page.screenshot(),contentType:'image/png'});expect(unobstructed).toBe(true);
});

test('QC-001: Shikaku completion rewards once and advances to a new puzzle',async({page})=>{
  await launch(page,'shikaku');const stage=page.locator('#game-viewport-stage');await stage.getByRole('button',{name:'Zen Mode',exact:true}).click();
  await stage.getByRole('button',{name:'2 Chạm',exact:true}).focus();await page.keyboard.press('Enter');
  const puzzle=(await state(page,'ShikakuGame'))[1];const b=(await stage.locator('div[class*="w-[min(96vw"]').first().boundingBox())!;
  for(const q of puzzle.solution)await drag(page,[{x:b.x+(q.c+.5)*b.width/puzzle.size,y:b.y+(q.r+.5)*b.height/puzzle.size},{x:b.x+(q.c+q.w-.5)*b.width/puzzle.size,y:b.y+(q.r+q.h-.5)*b.height/puzzle.size}]);
  await expect.poll(async()=> (await state(page,'ShikakuGame'))[12]).toBe(1);
  await expect.poll(async()=> (await state(page,'ShikakuGame'))[1].size).toBe(5);
  await page.waitForTimeout(1600);expect((await state(page,'ShikakuGame'))[12]).toBe(1);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('arcadex_player_profile')!).stats.gamesPlayedCount.shikaku)).toBe(1);
});

for(const mode of [{name:'5x5 Lớn',value:'big5x5'},{name:'Tốc Độ ⏱️',value:'rush'}])test(`2048: ${mode.value} saves power-up charges and restart clears resumed state`,async({page})=>{
  await launch(page,'tile-2048');const stage=page.locator('#game-viewport-stage');await stage.getByRole('button',{name:mode.name,exact:true}).click();
  for(let i=0;i<12;i++)await page.keyboard.press(['ArrowLeft','ArrowDown','ArrowRight','ArrowUp'][i%4]);
  await stage.getByRole('button',{name:'Hoàn Tác (3)',exact:true}).click();const before=await state(page,'Tile2048Game');
  await page.locator('#btn-game-pause').click();await page.locator('#btn-pause-save-exit').click();await page.reload();await enterLauncher(page);
  await page.locator('#paused-game-banner').getByRole('button',{name:/Tiếp Tục/i}).first().click();await expect(stage).toBeVisible();
  const after=await state(page,'Tile2048Game');expect(after[0]).toBe(mode.value);expect(after[1]).toEqual(before[1]);expect(after[2]).toBe(before[2]);
  await expect(stage.getByRole('button',{name:'Hoàn Tác (2)',exact:true})).toBeVisible();await page.locator('#btn-game-restart').click();
  await expect.poll(async()=> (await state(page,'Tile2048Game'))[2]).toBe(0);await expect(stage.getByRole('button',{name:'Hoàn Tác (3)',exact:true})).toBeVisible();
});
