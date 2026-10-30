// Counts React commits and component renders while the launcher sits idle.
// Usage: npm run build && node tests/perf/launcher-idle-renders.cjs
//   [--window=SECONDS] [--max-renders-per-sec=N] [--outDir=DIR] [--screenshot FILE]
// Serves a build with `vite preview`, hooks React through the DevTools global hook (works
// on production builds) and reports work done during a quiet window on the launcher.
// Build with `vite build --minify false --outDir DIR` to see readable component names.
const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const { existsSync } = require('node:fs');

const PORT = 4318;
const windowArg = process.argv.find(a => a.startsWith('--window='));
const WINDOW_MS = windowArg ? Number(windowArg.split('=')[1]) * 1000 : 6000;
const limitArg = process.argv.find(a => a.startsWith('--max-renders-per-sec='));
const limit = limitArg ? Number(limitArg.split('=')[1]) : null;

const hook = () => {
  const stats = { commits: 0, renders: 0, byName: {} };
  window.__renderStats = stats;
  const name = f => f.type && (f.type.displayName || f.type.name || (f.type.render && f.type.render.name)) || 'anonymous';
  // Origins: components that re-rendered although their parent component did not.
  const walk = (fiber, parentRendered) => {
    for (let f = fiber; f; f = f.sibling) {
      const isComponent = f.tag === 0 || f.tag === 1 || f.tag === 11 || f.tag === 14 || f.tag === 15;
      // Components that actually ran this commit: newly mounted, or reworked with PerformedWork.
      const rendered = isComponent && (!f.alternate || !!(f.flags & 1));
      if (rendered) {
        stats.renders++;
        stats.byName[name(f)] = (stats.byName[name(f)] || 0) + 1;
        if (!parentRendered) (stats.origins = stats.origins || {})[name(f)] = ((stats.origins || {})[name(f)] || 0) + 1;
      }
      // A bailed-out subtree keeps sharing the previous child fibers (with stale flags); skip it.
      if (f.child && !(f.alternate && f.alternate.child === f.child)) walk(f.child, isComponent ? rendered : parentRendered);
    }
  };
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    renderers: new Map(), supportsFiber: true,
    inject(r) { this.renderers.set(1, r); return 1; },
    onCommitFiberRoot(_id, root) { if (!window.__countRenders) return; stats.commits++; (stats.at = stats.at || []).push(Math.round(performance.now() - window.__countStart)); walk(root.current.child, false); },
    onCommitFiberUnmount() {}, onPostCommitFiberRoot() {}, onScheduleFiberRoot() {}, checkDCE() {},
  };
};

(async () => {
  const server = spawn(process.execPath, [require('node:path').join(__dirname, '../../node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT), '--strictPort', ...(process.argv.find(a => a.startsWith('--outDir=')) ? [process.argv.find(a => a.startsWith('--outDir=')).replace('=', ' ').split(' ')[0], process.argv.find(a => a.startsWith('--outDir=')).split('=')[1]] : [])], { stdio: 'pipe' });
  let ready = false;
  server.stdout.on('data', d => { if (String(d).includes(String(PORT))) ready = true; });
  for (let i = 0; i < 100 && !ready; i++) await new Promise(r => setTimeout(r, 200));
  const executablePath = process.env.CHROMIUM_EXECUTABLE || ['/usr/bin/chromium', '/opt/pw-browsers/chromium'].find(existsSync);
  const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
    await page.addInitScript(hook);
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle' });
    await page.getByText('Thư viện game').first().waitFor({ timeout: 15000 });
    await page.waitForTimeout(4000); // let startup work settle
    await page.evaluate(() => { window.__countStart = performance.now(); window.__countRenders = true; });
    await page.waitForTimeout(WINDOW_MS);
    const stats = await page.evaluate(() => { window.__countRenders = false; return window.__renderStats; });
    const perSec = stats.renders / (WINDOW_MS / 1000);
    const top = Object.entries(stats.byName).sort((a, b) => b[1] - a[1]).slice(0, 12);
    console.log(`idle ${WINDOW_MS / 1000}s: ${stats.commits} commits at ${JSON.stringify(stats.at || [])}ms, ${stats.renders} component renders (${perSec.toFixed(1)}/s)`);
    console.log('  render origins:', JSON.stringify(stats.origins || {}));
    for (const [name, n] of top) console.log(`  ${String(n).padStart(5)}  ${name}`);
    if (process.argv.includes('--screenshot')) await page.screenshot({ path: process.argv[process.argv.indexOf('--screenshot') + 1] });
    if (limit !== null && perSec > limit) { console.error(`FAIL: ${perSec.toFixed(1)} renders/s exceeds ${limit}`); process.exitCode = 1; }
  } finally {
    await browser.close();
    server.kill();
  }
})();
