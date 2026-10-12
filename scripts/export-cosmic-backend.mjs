import { build } from 'esbuild';
import { resolve, dirname } from 'node:path';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Export the exact shared engine/campaign as one Dashboard-ready Edge Function.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const destination = process.argv[2];
if (!destination) {
  throw new Error('Usage: node scripts/export-cosmic-backend.mjs /output/cosmic-verify/index.ts');
}
const outfile = resolve(destination);
await mkdir(dirname(outfile), { recursive: true });
await build({
  absWorkingDir: root,
  entryPoints: ['supabase/functions/cosmic-verify/index.ts'],
  outfile,
  bundle: true,
  platform: 'neutral',
  format: 'esm',
  external: ['npm:*'],
  banner: { js: '// @ts-nocheck — generated JavaScript bundle; typed source is checked separately.' },
});
console.log(`Cosmic verifier exported: ${outfile}`);
