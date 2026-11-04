// Loopback-only fixture authority for the operation benchmark. Never imported by production.
import { createTankRoomServer } from '../../server/tank-clash-room/server.mjs';
const server = await createTankRoomServer({ host: '127.0.0.1', maxConnections: 256,
  authenticate: (token, name) => token?.startsWith('local-soak-') ? { userId: token, name, guest: false } : null });
process.send({ type: 'ready', url: server.url });
process.on('message', async msg => {
  if (msg.type === 'stats') { if (msg.gc) globalThis.gc?.(); process.send({ type: 'stats', id: msg.id, value: { ...server.stats(), resources: process.getActiveResourcesInfo() } }); }
  if (msg.type === 'stop') { await server.close(); process.exit(0); }
});
process.on('disconnect', () => { void server.close().then(() => process.exit(0)); });
