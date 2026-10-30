// Bundle report: chunk sizes (raw + gzip), which chunks the launcher loads up front
// (entry + static imports), the largest modules inside the biggest chunks, and the
// service-worker precache total. Usage: node scripts/analyze-bundle.mjs [--json=FILE] [--budget]
// --budget fails when a chunk exceeds 500 kB or the initial launcher JS exceeds 400 kB gzip.
import { build } from 'vite';
import { gzipSync } from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('node_modules/.cache/bundle-report');
const modules = {};
let chunks = [];
await build({
  logLevel: 'error',
  build: { outDir, emptyOutDir: true },
  plugins: [{
    name: 'bundle-report',
    generateBundle(_o, bundle) {
      chunks = Object.values(bundle).filter(c => c.type === 'chunk').map(c => ({
        file: c.fileName, isEntry: c.isEntry, imports: c.imports, dynamicImports: c.dynamicImports,
        size: Buffer.byteLength(c.code), gzip: gzipSync(c.code).length,
        name: c.name, facade: c.facadeModuleId ? path.relative(process.cwd(), c.facadeModuleId) : null,
      }));
      for (const c of Object.values(bundle)) if (c.type === 'chunk') {
        modules[c.fileName] = Object.entries(c.modules).map(([id, m]) => ({ id: path.relative(process.cwd(), id.replace(/\0/g, '')), size: m.renderedLength }))
          .sort((a, b) => b.size - a.size);
      }
    },
  }],
});

const byFile = Object.fromEntries(chunks.map(c => [c.file, c]));
const initial = new Set();
const visit = f => { if (initial.has(f) || !byFile[f]) return; initial.add(f); byFile[f].imports.forEach(visit); };
chunks.filter(c => c.isEntry).forEach(c => visit(c.file));
const initialJs = [...initial].map(f => byFile[f]);
const sum = (list, k) => list.reduce((n, c) => n + c[k], 0);
const kb = n => (n / 1024).toFixed(1) + ' kB';

const cssFiles = fs.readdirSync(path.join(outDir, 'assets')).filter(f => f.endsWith('.css'));
const sw = fs.existsSync(path.join(outDir, 'sw.js')) ? fs.readFileSync(path.join(outDir, 'sw.js'), 'utf8') : '';
const precache = [...sw.matchAll(/url:"([^"]+)"/g)].map(m => m[1]);
const precacheBytes = precache.reduce((n, u) => { const f = path.join(outDir, u); return n + (fs.existsSync(f) ? fs.statSync(f).size : 0); }, 0);

const report = {
  chunkCount: chunks.length,
  initial: { files: initialJs.map(c => c.file), raw: sum(initialJs, 'size'), gzip: sum(initialJs, 'gzip') },
  largest: [...chunks].sort((a, b) => b.size - a.size).slice(0, 12).map(c => ({ file: c.file, facade: c.facade, raw: c.size, gzip: c.gzip, initial: initial.has(c.file), topModules: modules[c.file].slice(0, 8) })),
  css: cssFiles.map(f => ({ file: f, raw: fs.statSync(path.join(outDir, 'assets', f)).size })),
  precache: { entries: precache.length, bytes: precacheBytes },
};

console.log(`chunks: ${report.chunkCount}`);
console.log(`initial launcher JS: ${initialJs.length} files, ${kb(report.initial.raw)} raw, ${kb(report.initial.gzip)} gzip`);
console.log(`precache: ${report.precache.entries} entries, ${kb(report.precache.bytes)}`);
console.log('largest chunks:');
for (const c of report.largest) {
  console.log(`  ${kb(c.raw).padStart(10)} raw ${kb(c.gzip).padStart(9)} gzip ${c.initial ? '[initial]' : '         '} ${c.file} ${c.facade ? '<- ' + c.facade : ''}`);
  for (const m of c.topModules.slice(0, 5)) console.log(`        ${kb(m.size).padStart(9)}  ${m.id}`);
}
const json = process.argv.find(a => a.startsWith('--json='));
if (json) fs.writeFileSync(json.slice(7), JSON.stringify(report, null, 1));
if (process.argv.includes('--budget')) {
  const over = chunks.filter(c => c.size > 500 * 1024);
  const problems = [...over.map(c => `${c.file} is ${kb(c.size)} (> 500 kB)`), ...(report.initial.gzip > 400 * 1024 ? [`initial JS ${kb(report.initial.gzip)} gzip (> 400 kB)`] : [])];
  if (problems.length) { console.error('BUDGET FAIL:\n  ' + problems.join('\n  ')); process.exitCode = 1; }
}
