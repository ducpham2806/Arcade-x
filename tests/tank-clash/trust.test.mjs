import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isTrustedServer, parseTrustedServers, tokenFor } from '../../src/games/tank-clash/trust.ts';

const trusted = parseTrustedServers('wss://tank.arcadex.example/tank, ws://plain.example/tank  wss://eu.arcadex.example');
const jwt = () => 'eyJ.player.jwt';

test('trusted list keeps wss URLs only', () => {
  assert.deepEqual(trusted, ['wss://tank.arcadex.example/tank', 'wss://eu.arcadex.example']);
  assert.deepEqual(parseTrustedServers(undefined), []);
});

test('token goes only to the configured wss origin and path', () => {
  assert.equal(isTrustedServer('wss://tank.arcadex.example/tank', trusted), true);
  assert.equal(isTrustedServer('wss://TANK.arcadex.example/tank/', trusted), true);
  assert.equal(isTrustedServer('wss://eu.arcadex.example/', trusted), true);
  assert.equal(tokenFor('wss://tank.arcadex.example/tank', trusted, jwt)?.(), 'eyJ.player.jwt');
  for (const url of [
    'wss://evil.example/tank',                      // invite link pointing elsewhere
    'wss://tank.arcadex.example.evil.example/tank', // look-alike host
    'wss://tank.arcadex.example:4443/tank',         // different port
    'wss://tank.arcadex.example/other',             // different path
    'ws://tank.arcadex.example/tank',               // downgraded to plain ws
    'wss://user:pw@tank.arcadex.example/tank',      // embedded credentials
    'https://tank.arcadex.example/tank', 'not a url', '',
  ]) {
    assert.equal(isTrustedServer(url, trusted), false, url);
    assert.equal(tokenFor(url, trusted, jwt), undefined, url);
  }
});

test('loopback dev servers are trusted without configuration; empty tokens are dropped', () => {
  for (const url of ['ws://localhost:3223/tank', 'ws://127.0.0.1:3223/tank', 'ws://[::1]:3223/tank']) assert.equal(isTrustedServer(url, []), true, url);
  assert.equal(isTrustedServer('ws://192.168.1.5:3223/tank', []), false);
  assert.equal(tokenFor('ws://localhost:3223/tank', [], () => '')?.(), undefined);
  assert.equal(tokenFor('ws://localhost:3223/tank', [], () => { throw new Error('no session'); })?.(), undefined);
  assert.equal(tokenFor('ws://localhost:3223/tank', [], undefined), undefined);
});
