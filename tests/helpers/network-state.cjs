// Keep actual traffic blocking in Playwright. Some Chromium builds reset only the
// navigator state on a new document while the context's offline transport persists.
const sessions = new WeakMap();
async function syncNetworkState(page, offline) {
  const expected = !offline;
  if (await page.evaluate(() => navigator.onLine) !== expected) {
    let session = sessions.get(page);
    if (!session) { session = await page.context().newCDPSession(page); sessions.set(page, session); }
    // Use Chromium's real network-state API, never overwrite navigator or fake events.
    await session.send('Network.overrideNetworkState', {
      offline, latency: 0, downloadThroughput: offline ? 0 : -1, uploadThroughput: offline ? 0 : -1,
    });
  }
  await page.waitForFunction(value => navigator.onLine === !value, offline, { timeout: 3000 });
}
async function setOffline(context, page, offline) {
  await context.setOffline(offline);
  await syncNetworkState(page, offline);
}
module.exports = { setOffline, syncNetworkState };
