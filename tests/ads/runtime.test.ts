import {test,expect} from '@playwright/test';
import {setOffline} from '../helpers/network-state.cjs';
const requests = new WeakMap<object,string[]>();
test.beforeEach(async ({page}) => {
  const external:string[]=[];requests.set(page,external);
  page.on('request', request => {if(/googlesyndication|doubleclick|googleadservices/.test(request.url())) external.push(request.url());});
  await page.route('**/*', route => ['127.0.0.1','localhost'].includes(new URL(route.request().url()).hostname)?route.continue():route.abort());
});
test.afterEach(async ({page}) => {expect(requests.get(page)).toEqual([]);});
const start = async (page:any, query = '') => {
  await page.goto('/tests/ads/runtime-harness.html'+query);
  await page.waitForFunction(()=>!!(window as any).adsHarness);
};
const action = (page:any, method:string, value?:any) => page.evaluate(({method,value})=>(window as any).adsHarness[method](value),{method,value});
const metric = (page:any, name:string) => page.evaluate(name=>(window as any).adsHarness.metrics[name],name);

test('config and context deny every missing gate; consent cannot come from query or app identity',async({page})=>{
  await start(page);
  const results=await page.evaluate(()=>{
    const h=(window as any).adsHarness;
    const context={activeGameId:null,hasContent:true,blocked:false,online:true,visible:true,mobile:false};
    const allowed=(config=h.config,consent=h.granted,ctx=context)=>h.canRequestAd(config,consent,ctx,'L1');
    return {
      valid:allowed(), closed:[allowed({...h.config,enabled:false}),allowed({...h.config,siteReady:false}),allowed({...h.config,production:false}),allowed({...h.config,client:'invalid'}),allowed({...h.config,units:{}}),allowed(h.config,h.unknownConsent),allowed(h.config,{status:'denied',canRequestAds:true}),allowed(h.config,{status:'granted',canRequestAds:false}),
        ...[{hasContent:false},{activeGameId:'game'},{blocked:true},{online:false},{visible:false},{mobile:true}].map(part=>allowed(h.config,h.granted,{...context,...part}))],
      default:h.readAdsConfig({PROD:true,'ads-preview':'1',isLoggedIn:true}),
      buildOnly:h.readAdsConfig({PROD:true,VITE_ADS_ENABLED:'true',VITE_ADS_SITE_READY:'true'}),
    };
  });
  expect(results.valid).toBe(true);expect(results.closed.every(v=>v===false)).toBe(true);
  expect(results.default.enabled).toBe(false);expect(results.default.production).toBe(false);expect(results.buildOnly.production).toBe(false);
  expect(await metric(page,'loads')).toBe(0);await expect(page.locator('.ad-display-slot')).toHaveCount(0);
});

test('StrictMode shares one load, zero width waits, and remount/filter/resize never refresh',async({page})=>{
  await start(page);await action(page,'narrow',true);await action(page,'consent',{status:'granted',canRequestAds:true});
  await expect(page.locator('.ad-display-slot')).toHaveCount(1);expect(await metric(page,'loads')).toBe(0);
  await action(page,'narrow',false);await expect.poll(()=>metric(page,'loads')).toBe(1);
  await action(page,'show',false);await action(page,'show',true);
  await action(page,'load');await expect.poll(()=>metric(page,'requests')).toBe(1);
  await expect(page.locator('[data-ad-outcome="filled"]')).toBeVisible();
  for (const method of ['filter','block','game']) {await action(page,method,method==='game'?'x':true);await expect(page.locator('ins')).toHaveCount(0);await action(page,method,method==='game'?null:false);}
  await action(page,'remount');await page.setViewportSize({width:390,height:844});
  expect(await metric(page,'loads')).toBe(1);expect(await metric(page,'requests')).toBe(1);await expect(page.locator('.ad-display-slot')).toHaveCount(0);
});

for (const reason of ['game','consent','offline','block']) test(`pending load cannot request after ${reason}`,async({page})=>{
  await start(page);await action(page,'consent',{status:'granted',canRequestAds:true});await expect.poll(()=>metric(page,'loads')).toBe(1);
  if(reason==='offline') await setOffline(page.context(),page,true);
  else await action(page,reason,reason==='game'?'game':reason==='block'?true:{status:'denied',canRequestAds:false});
  await expect(page.locator('.ad-display-slot')).toHaveCount(0);
  await action(page,'load');
  expect(await metric(page,'requests')).toBe(0);
});

for (const outcome of ['unfilled','timeout','error']) test(`${outcome} remains stable and play stays usable`,async({page})=>{
  await start(page);await action(page,'outcome',outcome);await action(page,'consent',{status:'granted',canRequestAds:true});await expect.poll(()=>metric(page,'loads')).toBe(1);await action(page,'load');
  await expect(page.locator(`[data-ad-outcome="${outcome}"]`)).toBeVisible();
  const height=(await page.locator('.ad-display-slot').boundingBox())!.height;expect(height).toBeGreaterThan(120);
  await page.locator('#play').click();await expect(page.locator('ins')).toHaveCount(0);await page.locator('#exit').click();
  expect(await metric(page,'requests')).toBe(1);await expect(page.locator('.ad-display-slot')).toHaveCount(0);
});

test('SDK single-flight, terminal failures and client conflicts without any network tag insertion',async({page})=>{
  await start(page);
  expect(await action(page,'sdkStartWhileEligible')).toEqual([true]);
  for(const mode of ['load','error','timeout']) {
    const result=await action(page,'sdkTest',mode);
    expect(result.same).toBe(true);expect(result.appends).toBe(1);expect(result.conflict).toBe(true);
    expect(result.results).toEqual(mode==='load'?['fulfilled','fulfilled']:['rejected','rejected']);expect(result.third).toBe(mode==='load');
  }
});

test('Google status distinguishes fill from processing and cleans up on abort',async({page})=>{
  await start(page);
  expect(await action(page,'duplicatePush')).toEqual({first:'filled',second:'error',pushes:1});
  for(const [status,expected] of [['filled','filled'],['unfilled','unfilled'],['unfill-optimized','unfilled'],['processing','timeout'],['abort','error']]) expect(await action(page,'googleStatus',status)).toBe(expected);
});


test('initial eligible StrictMode replay starts one SDK load and pushes once',async({page})=>{
  await start(page,'?granted=1');await expect.poll(()=>metric(page,'loads')).toBe(1);
  await action(page,'load');await expect.poll(()=>metric(page,'requests')).toBe(1);
  await expect(page.locator('[data-ad-outcome="filled"]')).toBeVisible();
});

test('load rejection stays terminal and never disables play',async({page})=>{
  await start(page,'?granted=1');await expect.poll(()=>metric(page,'loads')).toBe(1);await action(page,'failLoad');
  await expect(page.locator('[data-ad-outcome="error"]')).toBeVisible();
  await page.locator('#play').click();await page.locator('#exit').click();
  await action(page,'remount');expect(await metric(page,'loads')).toBe(1);expect(await metric(page,'requests')).toBe(0);await expect(page.locator('.ad-display-slot')).toHaveCount(0);
});

test('navigation aborts an outstanding result and late completion does not revive a slot',async({page})=>{
  await start(page);await action(page,'outcome','pending');await action(page,'consent',{status:'granted',canRequestAds:true});
  await expect.poll(()=>metric(page,'loads')).toBe(1);await action(page,'load');await expect.poll(()=>metric(page,'requests')).toBe(1);
  await page.locator('#play').click();await expect.poll(()=>metric(page,'aborts')).toBe(1);await action(page,'finish');
  await page.locator('#exit').click();await expect(page.locator('.ad-display-slot')).toHaveCount(0);
});
