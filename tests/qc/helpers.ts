import { expect, type Page } from '@playwright/test';
export async function inspectState(page: Page) {
  await page.addInitScript(()=>{
    (window as any).qcStates=(name:string)=>{
      const root=document.querySelector('#root') as any;
      let f=root[Object.keys(root).find(k=>k.startsWith('__reactContainer$'))!];
      if(f.stateNode?.current)f=f.stateNode.current;
      let result:any;
      function visit(f:any){if(!f||result)return;if(typeof f.type==='function'&&f.type.name===name){let h=f.memoizedState;result=[];while(h){try{result.push(JSON.parse(JSON.stringify(h.memoizedState)));}catch{result.push(null);}h=h.next;}return;}visit(f.child);visit(f.sibling);}visit(f);return result;
    };
    (window as any).qcContext=(key:string)=>{
      const root=document.querySelector('#root') as any;let f=root[Object.keys(root).find(k=>k.startsWith('__reactContainer$'))!];if(f.stateNode?.current)f=f.stateNode.current;
      let result:any;function visit(f:any){if(!f||result)return;if(f.memoizedProps?.value?.[key]){result=f.memoizedProps.value;return;}visit(f.child);visit(f.sibling);}visit(f);return result;
    };
  });
}
export async function launch(page:Page,id:string){await page.goto('/');await enterLauncher(page);await page.locator('#game-card-'+id).scrollIntoViewIfNeeded();await page.locator(`button[id^="btn-play-${['chess','caro-gomoku'].includes(id)?'ai-':''}"][id$="${id}"]`).first().click();await expect(page.locator('#game-viewport-stage')).toBeVisible();await page.waitForTimeout(400);}
export async function state(page:Page,name:string):Promise<any[]>{await page.waitForFunction(name => Array.isArray((window as any).qcStates(name)), name);return page.evaluate(name=>(window as any).qcStates(name),name);}
export async function drag(page:Page,points:{x:number,y:number}[]){await page.mouse.move(points[0].x,points[0].y);await page.mouse.down();await page.waitForTimeout(70);for(const p of points.slice(1)){await page.mouse.move(p.x,p.y,{steps:6});await page.waitForTimeout(60);}await page.mouse.up();await page.waitForTimeout(150);}

export async function enterLauncher(page: Page) {
  await page.locator('#auth-entry-screen').waitFor();
  const continueButton = page.locator('#btn-entry-continue');
  if (await continueButton.isVisible()) await continueButton.click();
  else await page.locator('#btn-auth-play-guest').click();
  await page.locator('#game-library').waitFor();
}

