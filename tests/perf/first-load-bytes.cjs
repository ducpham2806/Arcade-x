// Measures what a first visit to the launcher downloads, grouped by resource type, split into
// the critical path (requested before the game library is visible) and idle prefetch after it.
// Usage: npm run build && node tests/perf/first-load-bytes.cjs [--outDir=DIR] [--top=N]
// Serves the build with `vite preview` (no compression), so sizes are uncompressed bytes.
const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const { existsSync } = require('node:fs');
const path = require('node:path');

const PORT = 4321;
const outDir = process.argv.find(a => a.startsWith('--outDir='))?.split('=')[1];
const top = Number(process.argv.find(a => a.startsWith('--top='))?.split('=')[1] || 12);

(async () => {
  const server = spawn(process.execPath, [path.join(__dirname, '../../node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT), '--strictPort', ...(outDir ? ['--outDir', outDir] : [])], { stdio: 'pipe' });
  let ready = false;
  server.stdout.on('data', d => { if (String(d).includes(String(PORT))) ready = true; });
  for (let i = 0; i < 100 && !ready; i++) await new Promise(r => setTimeout(r, 200));
  const executablePath = process.env.CHROMIUM_EXECUTABLE || ['/usr/bin/chromium', '/opt/pw-browsers/chromium'].find(existsSync);
  const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 860 }, serviceWorkers: 'block' });
    const seen = [];
    let libraryShown = false;
    page.on('response', async res => {
      const url = res.url();
      if (!url.startsWith(`http://127.0.0.1:${PORT}/`)) return;
      try { const body = await res.body(); seen.push({ url: url.slice(`http://127.0.0.1:${PORT}`.length), type: res.request().resourceType(), bytes: body.length, critical: !libraryShown }); } catch {}
    });
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'commit' });
    await page.locator('#game-library').waitFor({ timeout: 15000 });
    libraryShown = true;
    await page.waitForTimeout(3000);
    const byType = {};
    for (const r of seen) { byType[r.type] = byType[r.type] || { count: 0, bytes: 0 }; byType[r.type].count++; byType[r.type].bytes += r.bytes; }
    const total = seen.reduce((n, r) => n + r.bytes, 0);
    const kb = n => (n / 1024).toFixed(1) + ' kB';
    const critical = seen.filter(r => r.critical);
    const sumType = (list, t) => list.filter(r => r.type === t).reduce((n, r) => n + r.bytes, 0);
    console.log(`critical path (before library visible): ${critical.length} requests, ${kb(critical.reduce((n, r) => n + r.bytes, 0))} (script ${kb(sumType(critical, 'script'))}, css ${kb(sumType(critical, 'stylesheet'))})`);
    console.log(`first load incl. 3 s idle: ${seen.length} requests, ${kb(total)}`);
    for (const [t, v] of Object.entries(byType).sort((a, b) => b[1].bytes - a[1].bytes)) console.log(`  ${t.padEnd(10)} ${String(v.count).padStart(4)} req ${kb(v.bytes).padStart(10)}`);
    console.log('largest:');
    for (const r of seen.sort((a, b) => b.bytes - a.bytes).slice(0, top)) console.log(`  ${kb(r.bytes).padStart(10)}  ${r.type.padEnd(8)} ${r.url}`);
  } finally {
    await browser.close();
    server.kill();
  }
})();
