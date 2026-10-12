import { enterLauncher } from './helpers';
import {test,expect} from '@playwright/test';
import {mockSupabase} from '../auth/backend';
import {inspectState} from './helpers';
let backend: ReturnType<typeof mockSupabase>;
async function modal(page:any,name:string){await page.evaluate((modal:string)=>window.dispatchEvent(new CustomEvent('arcadex:open_modal',{detail:{modal}})),name);}
test.beforeEach(async({context,page})=>{backend=mockSupabase();await backend.install(context);await inspectState(page);await page.goto('/');await enterLauncher(page);await page.locator('#game-card-word-cross').waitFor();});
test('Settings: sound preference persists after reload',async({page})=>{
  await modal(page,'settings');const before=await page.evaluate(()=>(window as any).qcContext('toggleSound').isSoundMuted);await page.locator('#btn-settings-toggle-sound').click();
  await expect.poll(()=>page.evaluate(()=>localStorage.getItem('arcadex_sound_muted'))).toBe(String(!before));await page.reload();await enterLauncher(page);await page.locator('#game-card-word-cross').waitFor();expect(await page.evaluate(()=>(window as any).qcContext('toggleSound').isSoundMuted)).toBe(!before);
});
test('Retired shop and inventory routes do not open or block the launcher',async({page})=>{
  for(const route of ['shop','inventory','crafting','dailyReward','achievements','dailyQuests','weeklyQuests','monthlyLogin','spinWheel','hallOfFame','friends','dailyChallengesList','publicProfile']) {
    await modal(page,route);
    expect(await page.evaluate(()=>(window as any).qcContext('setActiveModal').activeModal)).toBe('none');
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
    expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');
  }
  await page.locator('#btn-play-tile-2048').click();await expect(page.locator('#tile-2048-board')).toBeVisible();
});
test('Legacy data: chest consumption service still survives immediate reload',async({page},info)=>{
  const before=await page.evaluate(()=>(window as any).qcContext('openChest').chestCounts.common);await page.evaluate(()=>(window as any).qcContext('openChest').openChest('common'));
  await expect.poll(()=>page.evaluate(()=>(window as any).qcContext('openChest').chestCounts.common)).toBe(before-1);
  await page.reload();await enterLauncher(page);await page.locator('#game-card-word-cross').waitFor();const after=await page.evaluate(()=>(window as any).qcContext('openChest').chestCounts.common);await info.attach('chest-counts',{body:JSON.stringify({before,expected:before-1,after}),contentType:'application/json'});expect(after).toBe(before-1);
});

test('Inventory: newer cloud depletion replaces counts; older snapshots cannot resurrect items',async({page})=>{
  await page.evaluate(async()=>{await (window as any).qcContext('manualSyncInventory').manualSyncInventory();});
  const id=await page.evaluate(()=>JSON.parse(localStorage.getItem('arcadex_player_profile')!).id);const path=`players/${id}/inventory_data/main`;
  const doc=backend.documents.get(path)!;expect(doc).toBeTruthy();const old=structuredClone(doc.data),revision=Date.now()+10000;
  backend.documents.set(path,{...doc,version:doc.version+1,data:{...doc.data,items:[],chestCounts:{common:0,rare:0,epic:0,legendary:0},stateUpdatedAt:revision}});
  await expect.poll(()=>page.evaluate(()=>(window as any).qcContext('openChest').chestCounts.common),{timeout:10000}).toBe(0);
  expect(await page.evaluate(()=>(window as any).qcContext('openChest').items.filter((i:any)=>i.count>0).length)).toBe(0);
  backend.documents.set(path,{...doc,version:doc.version+2,data:{...old,stateUpdatedAt:revision-1,updatedAt:revision+10000}});
  await page.waitForTimeout(5200);expect(await page.evaluate(()=>(window as any).qcContext('openChest').chestCounts.common)).toBe(0);
  await page.reload();await enterLauncher(page);await page.locator('#game-card-word-cross').waitFor();expect(await page.evaluate(()=>(window as any).qcContext('openChest').items.filter((i:any)=>i.count>0).length)).toBe(0);
});
test('Inventory: stale outgoing write cannot replace a newer cloud snapshot',async({page})=>{
  await page.evaluate(async()=>{await (window as any).qcContext('manualSyncInventory').manualSyncInventory();});
  const id=await page.evaluate(()=>JSON.parse(localStorage.getItem('arcadex_player_profile')!).id);const path=`players/${id}/inventory_data/main`,doc=backend.documents.get(path)!,revision=Date.now()+10000;
  backend.documents.set(path,{...doc,version:doc.version+1,data:{...doc.data,stateUpdatedAt:revision,chestCounts:{common:0,rare:0,epic:0,legendary:0}}});
  const accepted=await page.evaluate(async({id,revision})=>{const source='/src/services/supabase.ts';const{SupabaseService}=await import(source);return SupabaseService.syncInventoryToCloud(id,[],{common:99,rare:0,epic:0,legendary:0},undefined,undefined,revision-1);},{id,revision});
  expect(accepted).toBe(false);expect(backend.documents.get(path)!.data.chestCounts.common).toBe(0);
});
