// Raw exported review fixtures must bypass Vite's HTML transforms and strict parser.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const origin = new URL(process.env.QC_REVIEW_BASE_URL || 'http://127.0.0.1:4326');
if (origin.protocol !== 'http:' || !['127.0.0.1', 'localhost'].includes(origin.hostname) || origin.pathname !== '/' || origin.username || origin.password) {
  throw new Error('QC_REVIEW_BASE_URL must be a loopback HTTP origin.');
}
const allowed = new Set([
  '/preview/tank-clash/index.html', '/test-results/word-chain-room-lab.html',
  '/test-results/word-chain-errors.html', '/tests/helpers/review-fixture.html',
]);
const server = createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405).end(); return; }
  const pathname = new URL(request.url, origin).pathname;
  if (pathname === '/__qa-health') { response.writeHead(200, { 'Content-Type': 'application/json' }).end('{"ok":true}'); return; }
  if (!allowed.has(pathname)) { response.writeHead(404).end(); return; }
  try {
    const bytes = await readFile(path.join(root, pathname.slice(1)));
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(request.method === 'HEAD' ? undefined : bytes);
  } catch (error) {
    response.writeHead(error.code === 'ENOENT' ? 404 : 500).end();
  }
});
server.listen(Number(origin.port) || 80, '127.0.0.1', () => console.log(`Raw review fixtures: ${origin.origin}`));
const stop = () => server.close(() => process.exit(0));
process.on('SIGTERM', stop); process.on('SIGINT', stop);
