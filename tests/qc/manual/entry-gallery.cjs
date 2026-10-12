const {chromium}=require('@playwright/test');const fs=require('node:fs'),path=require('node:path');
(async()=>{
  const {mockSupabase}=await import('../../auth/backend.ts');
  const folder=process.env.QC_ARTIFACTS||path.resolve('test-results/entry-gallery');fs.mkdirSync(folder,{recursive:true});
  const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
  try {
    for (const view of [{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}]) {
      const backend=mockSupabase();const ctx=await browser.newContext({viewport:{width:view.width,height:view.height}});await backend.install(ctx);const page=await ctx.newPage();
      await page.goto('http://127.0.0.1:3000/');await page.locator('#auth-entry-screen').waitFor();await page.screenshot({path:path.join(folder,`${view.name}-login.png`),fullPage:true});
      await page.locator('#tab-auth-register').click();await page.screenshot({path:path.join(folder,`${view.name}-register.png`),fullPage:true});
      await page.locator('#input-reg-email').fill('gallery@example.com');await page.locator('#input-reg-password').fill('TestPassword123!');await page.locator('#input-reg-confirm-password').fill('TestPassword123!');await page.locator('#btn-submit-register').click();await page.locator('#input-setup-name').waitFor();
      await page.locator('#input-setup-name').fill('Arcade Explorer');await page.getByRole('button',{name:'Chọn ảnh đại diện 🦊',exact:true}).click();await page.screenshot({path:path.join(folder,`${view.name}-setup.png`),fullPage:true});
      await page.locator('#btn-complete-profile').click();await page.locator('#game-library').waitFor();await page.screenshot({path:path.join(folder,`${view.name}-launcher.png`),fullPage:true});
      backend.readDelay(2200);await page.reload();await page.locator('#splash-screen').waitFor();await page.screenshot({path:path.join(folder,`${view.name}-splash.png`)});
      await page.locator('#btn-entry-continue').waitFor();await page.screenshot({path:path.join(folder,`${view.name}-returning.png`),fullPage:true});await ctx.close();
    }
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
