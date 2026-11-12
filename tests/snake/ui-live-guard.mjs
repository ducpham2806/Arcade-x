import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const run=(args,bindings={})=>{
 const env=Object.fromEntries(Object.entries(process.env).filter(([key])=>!key.startsWith('SNAKE_LIVE_')));
 return spawnSync(process.execPath,['scripts/test-snake-ui-live.mjs',...args],{env:{...env,...bindings},encoding:'utf8',timeout:30000});
};
test('no mode or ambiguous mode cannot launch the live runner',()=>{
 for(const args of [[],['--live','--preflight'],['--preflight','--wait-for-expiry'],['--unknown']]){const result=run(args);assert.equal(result.status,2);assert.match(result.stderr,/Use --preflight/);assert.doesNotMatch(result.stdout,/VERIFY_EXISTING_FIXTURE|NETWORK_PREFLIGHT/);}
});
test('missing fixture bindings stop before network, authentication and Vite',()=>{
 for(const mode of ['--preflight','--live']){const result=run([mode]);assert.equal(result.status,2);assert.match(result.stdout,/WAITING_BINDINGS/);assert.doesNotMatch(result.stdout,/NETWORK_PREFLIGHT|UI_LOGIN/);}
});
test('invalid grant cannot authenticate or expose the bound identity/password',()=>{
 const password='DO-NOT-PRINT-THIS-TEST-PASSWORD',email='private-fixture@example.invalid';
 const result=run(['--live'],{SNAKE_LIVE_EMAIL:email,SNAKE_LIVE_PASSWORD:password,SNAKE_LIVE_ACTOR_ID:'00000000-0000-4000-8000-000000000001',SNAKE_LIVE_GRANT_CONFIRMED:'0'});
 assert.equal(result.status,1);const output=result.stdout+result.stderr;assert(!output.includes(password));assert(!output.includes(email));assert.doesNotMatch(output,/NETWORK_PREFLIGHT|VERIFY_EXISTING_FIXTURE/);
});
