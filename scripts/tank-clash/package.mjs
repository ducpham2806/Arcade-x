// Assemble only the room process and its shared simulation; no env, app bundle or credentials.
import { mkdirSync, readFileSync, writeFileSync, copyFileSync, readdirSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
export const releaseFiles = [
  'server/tank-clash-room/server.mjs', 'server/tank-clash-room/config.mjs',
  'server/tank-clash-room/package.json', 'server/tank-clash-room/package-lock.json',
  'server/tank-clash-room/deploy/.env.example', 'server/tank-clash-room/deploy/arcadex-tank.service', 'server/tank-clash-room/deploy/Caddyfile',
  'src/games/tank-clash/room.ts', 'src/games/tank-clash/engine.ts', 'src/games/tank-clash/maps.ts', 'src/games/tank-clash/protocol.ts',
  'scripts/tank-clash/preflight.mjs', 'docs/tank-clash/TC2-RUNBOOK.md',
];
export function prepare(output = 'deliverables/tank-clash-server') {
  const out = resolve(output); mkdirSync(out, { recursive: true });
  const allowed = new Set([...releaseFiles, 'manifest.json']);
  for (const entry of readdirSync(out, { recursive: true, withFileTypes: true })) {
    if (!entry.isDirectory() && (!entry.isFile() || !allowed.has(relative(out, resolve(entry.parentPath, entry.name))))) throw Error('Output contains unexpected files; choose a fresh package directory');
  }
  const files = releaseFiles.map(path => { const target = resolve(out, path);mkdirSync(dirname(target), { recursive: true });copyFileSync(path, target);return { path, sha256: createHash('sha256').update(readFileSync(path)).digest('hex') }; });
  const manifest = { commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), workingTreeChanges: !!execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim(), files };
  writeFileSync(resolve(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  return { output: out, files: files.length, workingTreeChanges: manifest.workingTreeChanges };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) console.log(JSON.stringify(prepare()));
