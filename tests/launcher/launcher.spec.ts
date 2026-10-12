import {test,expect,type BrowserContext} from '@playwright/test';
import {mockSupabase} from '../auth/backend';
import {enterLauncher,inspectState} from '../qc/helpers';
import {parseCatalog,normalizeSearch} from '../../src/launcher/catalog';
const row=(id:string,extra:Record<string,unknown>={})=>({id,engine_key:id,title:id==='tile-2048'?'2048':'Blocker',short_description:'Giải đố thư giãn',category:'Puzzle',status:'published',access_model:'free',supports_offline:true,featured:true,sort_order:1,...extra});
const catalog=(games:any[])=>({schemaVersion:1,games,commerceEnabled:false,support:{enabled:false}});
async function launcherBackend(context:BrowserContext,initial:any){
 let data=initial;const library=new Map<string,any>();const sessions:any[]=[];
 await context.route('**/rest/v1/rpc/launcher_*',async route=>{
  const name=new URL(route.request().url()).pathname.split('/').at(-1);const body=route.request().postDataJSON()||{};
  let result:any=null;
  if(name==='launcher_catalog')result=data;
  else if(name==='launcher_check_access'){const g=data.games.find((game:any)=>game.id===body.p_game_id);result={allowed:g?.status==='published'&&g.access_model==='free',reason:g?.access_model==='premium'?'locked':'unavailable'};}
  else if(name==='launcher_library_state')result=[...library.values()];
  else if(name==='launcher_set_favorite')library.set(body.p_game_id,{...library.get(body.p_game_id),game_id:body.p_game_id,favorite:body.p_favorite});
  else if(name==='launcher_session_start'||name==='launcher_session_finish')sessions.push({name,...body});
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(result)});
 });return {set:(next:any)=>{data=next;},library,sessions};
}
test('catalog uses only registered engines, hides retired/draft, accepts empty and searches Vietnamese accents',()=>{
 const parsed=parseCatalog(catalog([row('tile-2048'),row('blocker',{status:'retired'}),row('chess',{status:'draft'}),row('remote-code',{engine_key:'https://bad.test/game.js'}),row('alias',{engine_key:'tile-2048'}),row('tile-2048')]));
 expect(parsed?.games.map(game=>game.id)).toEqual(['tile-2048']);expect(parseCatalog(catalog([]))?.games).toEqual([]);expect(parseCatalog({games:[]})).toBeNull();expect(normalizeSearch('Giải Đố')).toBe('giai do');
});
for(const width of [1440,390,320])test(`bright launcher ${width}: first visit, search, detail focus, explicit first-game guide and save-exit`,async({context,page},info)=>{
 await mockSupabase().install(context);await launcherBackend(context,catalog([row('tile-2048'),row('blocker')]));
 await context.addInitScript(()=>localStorage.removeItem('arcadex_skip_pregame_loading'));
 await page.setViewportSize({width,height:width===320?568:900});await page.goto('/');await expect(page.locator('#auth-entry-screen')).toBeVisible();
 await page.screenshot({path:info.outputPath('entry.png')});await enterLauncher(page);
 await expect(page.locator('#game-card-tile-2048')).toBeVisible();await expect.poll(()=>page.locator('.arcade-cartridge').count()).toBe(2);
 expect(await page.locator('.arcade-launcher').evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgb(247, 249, 252)');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await page.screenshot({path:info.outputPath('launcher.png'),fullPage:true});
 await page.locator('#input-search-games').fill('giai do');await expect(page.locator('.arcade-cartridge')).toHaveCount(2);
 await page.locator('#input-search-games').fill('khong co game');await expect(page.getByText('Không tìm thấy trò chơi phù hợp',{exact:true})).toBeVisible();await page.locator('#btn-show-all-games').click();
 await page.locator('#btn-detail-card-tile-2048').click();const detail=page.locator('#game-detail-modal-overlay');await expect(detail).toBeVisible();await page.keyboard.press('Tab');expect(await detail.evaluate(el=>el.contains(document.activeElement))).toBe(true);
 await page.locator('#btn-detail-launch-game').click();await expect(page.locator('#btn-pregame-start')).toBeVisible();await page.waitForTimeout(3800);await expect(page.locator('#btn-pregame-start')).toBeVisible();
 await page.screenshot({path:info.outputPath('guide.png')});await page.locator('#btn-pregame-start').click();await expect(page.locator('#tile-2048-board')).toBeVisible();
 await page.keyboard.press('ArrowLeft');await page.locator('#btn-game-pause').click();await page.locator('#btn-pause-save-exit').click();await expect(page.locator('#paused-game-banner')).toBeVisible();
 await page.locator('#btn-resume-paused-game').click();await expect(page.locator('#tile-2048-board')).toBeVisible();await expect(page.locator('#btn-pregame-start')).toHaveCount(0);
});
test('catalog update retires games, maintenance and paid access cannot be launched through recents or direct actions',async({context,page})=>{
 await mockSupabase().install(context);await inspectState(page);const server=await launcherBackend(context,catalog([row('tile-2048'),row('blocker',{access_model:'premium'}),row('car-escape',{status:'maintenance'})]));
 await page.goto('/');await enterLauncher(page);await expect(page.locator('#btn-play-car-escape')).toBeDisabled();
 await page.locator('#btn-play-blocker').click();await expect(page.getByText('Game này cần quyền mở khóa. Thanh toán trong ứng dụng chưa được mở.')).toBeVisible();await expect(page.locator('#game-viewport-stage')).toHaveCount(0);
 server.set(catalog([row('tile-2048',{status:'retired'})]));await page.evaluate(()=>window.dispatchEvent(new Event('online')));
 await expect(page.locator('#game-card-tile-2048')).toHaveCount(0);await expect(page.locator('.arcade-cartridge')).toHaveCount(0);
 await page.evaluate(()=>(window as any).qcContext('launchGame').launchGame('tile-2048'));await expect(page.locator('#game-viewport-stage')).toHaveCount(0);
 await page.reload();await enterLauncher(page);await expect(page.locator('.arcade-cartridge')).toHaveCount(0);
});
test('game completion offers one result screen and one-click return, replay starts a fresh run',async({context,page},info)=>{
 await mockSupabase().install(context);await inspectState(page);await launcherBackend(context,catalog([row('neon-runner')]));
 await page.goto('/');await enterLauncher(page);await page.locator('#btn-play-neon-runner').click();
 await page.waitForFunction(()=>Array.isArray((window as any).qcStates('NeonRunnerGame')));
 const complete=()=>page.evaluate(()=>{
  const root=document.querySelector('#root') as any;let f=root[Object.keys(root).find(k=>k.startsWith('__reactContainer$'))!];if(f.stateNode?.current)f=f.stateNode.current;
  function visit(node:any):boolean{if(!node)return false;if(node.memoizedProps?.onGameOver && node.memoizedProps?.bridge){node.memoizedProps.onGameOver(42);return true;}return visit(node.child)||visit(node.sibling);}if(!visit(f))throw new Error('No game callback');
 });
 await complete();
 await expect(page.locator('#btn-gameover-home')).toBeVisible();await expect(page.getByRole('dialog')).toContainText('42');await page.screenshot({path:info.outputPath('result.png')});
 await page.locator('#btn-gameover-replay').click();await expect(page.locator('#btn-gameover-home')).toHaveCount(0);
 await complete();await page.locator('#btn-gameover-home').click();await expect(page.locator('#game-library')).toBeVisible();await expect(page.locator('#btn-session-summary-confirm')).toHaveCount(0);
});
test('bank support is hidden by default and only shows configured bank details without granting access',async({context,page})=>{
 await mockSupabase().install(context);const server=await launcherBackend(context,catalog([row('tile-2048')]));await page.goto('/');await enterLauncher(page);await expect(page.locator('.launcher-support')).toHaveCount(0);
 server.set({...catalog([row('tile-2048')]),support:{enabled:true,bankName:'Test Bank',account:'0000000000',beneficiary:'TEST RECEIVER',message:'Test support only'}});await page.evaluate(()=>window.dispatchEvent(new Event('online')));
 await page.locator('.launcher-support summary').click();await expect(page.locator('.launcher-support')).toContainText('TEST RECEIVER');await expect(page.locator('.launcher-support')).toContainText('không phải mua game');
});

test('signed-in launcher imports local favorites, restores cloud library and logs session lifecycle',async({context,page})=>{
 await mockSupabase().install(context);await inspectState(page);const server=await launcherBackend(context,catalog([row('tile-2048'),row('blocker')]));server.library.set('blocker',{game_id:'blocker',favorite:true,last_played_at:'2026-10-01T00:00:00Z'});
 await page.goto('/');await page.locator('#tab-auth-register').click();await page.locator('#input-reg-email').fill('launcher@example.com');await page.locator('#input-reg-password').fill('Password123!');await page.locator('#input-reg-confirm-password').fill('Password123!');await page.locator('#btn-submit-register').click();await page.locator('#input-setup-name').fill('Launcher Hero');await page.locator('#btn-complete-profile').click();
 await expect(page.locator('#btn-fav-card-blocker')).toHaveAttribute('aria-pressed','true');await page.locator('#btn-fav-card-tile-2048').click();await expect.poll(()=>server.library.get('tile-2048')?.favorite).toBe(true);
 await page.locator('#btn-play-tile-2048').click();await expect(page.locator('#tile-2048-board')).toBeVisible();await page.locator('#btn-game-pause').click();await page.locator('#btn-pause-save-exit').click();
 await expect.poll(()=>server.sessions.filter(s=>s.name==='launcher_session_finish').length).toBe(1);expect(server.sessions[0].p_session_id).toBe(server.sessions[1].p_session_id);
 await page.reload();await enterLauncher(page);await expect(page.locator('#btn-fav-card-tile-2048')).toHaveAttribute('aria-pressed','true');
});
