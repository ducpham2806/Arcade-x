// Read process env (Node 24 --env-file supported); never print keys, tokens or user IDs.
import { pathToFileURL } from 'node:url';
import { loadServerConfig } from '../../server/tank-clash-room/config.mjs';
export function preflight(env = process.env) {
  if (Number(process.versions.node.split('.')[0]) !== 24) throw Error('Use Node 24 for this release');
  if (env.NODE_ENV !== 'production' || !['staging','production'].includes(env.TANK_ENV)) throw Error('Preflight requires NODE_ENV=production and TANK_ENV=staging or production');
  const config = loadServerConfig(env);
  let role;
  try { role = JSON.parse(Buffer.from(config.publishableKey.split('.')[1], 'base64url').toString()).role; } catch { /* modern keys are opaque */ }
  if (config.publishableKey.startsWith('sb_secret_') || (role && role !== 'anon')) throw Error('Use a publishable/anon key, never an admin key for the room verifier');
  const render = env.RENDER === 'true';
  if (render) {
    if (config.host !== '0.0.0.0') throw Error('Render requires HOST=0.0.0.0 behind its managed TLS proxy');
    if (config.metricsEnabled) throw Error('Disable HTTP metrics on the public Render service');
  } else if (!['127.0.0.1', '::1'].includes(config.host)) throw Error('Bind the pilot to loopback behind the TLS proxy');
  if (!config.port) throw Error('Pilot PORT cannot be ephemeral');
  if ([config.supabaseUrl, config.publishableKey, env.TANK_ALLOWED_USERS, config.metricsToken, ...config.allowedOrigins].some(x => /REPLACE_|STAGING_PROJECT_REF|example\.(com|supabase\.co)/i.test(x))) throw Error('Replace every template value before starting the pilot');
  return { ok: true, node: process.versions.node, auth: config.accessMode === 'registered-free' ? 'ArcadeX registered free play' : 'Supabase registered testers', origins: config.allowedOrigins.length, testerCount: config.allowedUserIds?.length ?? 0, maxConnections: config.maxConnections };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { console.log(JSON.stringify(preflight())); } catch (error) { console.error(`Preflight failed: ${error.message}`); process.exitCode = 1; }
}
