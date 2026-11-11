import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import { syncNetworkState, setOffline } from './network-state.cjs';
import { reviewURL } from './review-url';

// A fulfilled document permits a reload without a service worker. The probe below is
// never fulfilled: it exercises Chromium's real offline network emulation separately.
const documentHTML = `<!doctype html><html><body><p id="state"></p><script>
const update=()=>document.getElementById('state').textContent=navigator.onLine?'online':'offline';
addEventListener('online',update);addEventListener('offline',update);update();
</script></body></html>`;

test('offline transport, navigator state and events survive reload, then recover', async ({ page, context, baseURL }) => {
  await context.route('**/__qa-document', route => route.fulfill({ contentType: 'text/html', body: documentHTML }));
  await page.goto(baseURL + '/__qa-document');
  const reachable = () => page.evaluate(async () => {
    try { return (await fetch('/__qa-uncached-probe?nonce=' + crypto.randomUUID(), { cache: 'no-store' })).ok; }
    catch { return false; }
  });
  await expect(page.locator('#state')).toHaveText('online');
  expect(await reachable()).toBe(true);
  await setOffline(context, page, true);
  await expect(page.locator('#state')).toHaveText('offline');
  expect(await reachable()).toBe(false);
  await page.reload();
  await syncNetworkState(page, true);
  await expect(page.locator('#state')).toHaveText('offline');
  expect(await reachable()).toBe(false);
  await setOffline(context, page, false);
  await expect(page.locator('#state')).toHaveText('online');
  expect(await reachable()).toBe(true);
});

test('review URLs use the configured HTTP origin for standalone browser contexts', async ({ browser }, info) => {
  const url = reviewURL(info, 'tests/helpers/review-fixture.html', { sample: 'a b&c' });
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    const response = await page.goto(url);
    expect(response!.status()).toBe(200);
    expect(await response!.text()).toBe(readFileSync('tests/helpers/review-fixture.html', 'utf8'));
    expect(new URL(page.url()).origin).toBe(new URL(String(info.config.metadata.reviewBaseURL)).origin);
    expect(new URL(page.url()).searchParams.get('sample')).toBe('a b&c');
    await expect(page.locator('h1')).toHaveText('HTTP review transport fixture');
    await expect(page.locator('#sample')).toHaveText('a b&c');
    // The raw server exposes only explicit synthetic fixture files, never repo secrets.
    const outside = await page.request.get(new URL('/package.json', url).href);
    expect(outside.status()).toBe(404);
  } finally { await context.close(); }
});
