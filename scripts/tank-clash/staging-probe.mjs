// Read-only Auth connectivity check using only the staging publishable key; no signup/email/SQL.
import assert from 'node:assert/strict';
import { supabaseAuthenticator } from '../../server/tank-clash-room/server.mjs';
const ref=process.env.TANK_EXPECTED_STAGING_REF;
assert(ref&&/^[a-z]{20}$/.test(ref)&&ref!=='whjatkhhupeqfngakmee','Set the exact non-production TANK_EXPECTED_STAGING_REF');
const url=process.env.VITE_SUPABASE_URL,key=process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
assert.equal(url,`https://${ref}.supabase.co`,'URL must match the explicitly selected staging ref');
assert(key?.startsWith('sb_publishable_'),'Use the staging public key, never an admin key');
const headers={apikey:key},signal=()=>AbortSignal.timeout(10000);
const response=await fetch(`${url}/auth/v1/settings`,{headers,signal:signal()}),settings=await response.json();assert.equal(response.status,200);
const invalid=await fetch(`${url}/auth/v1/user`,{headers:{...headers,Authorization:'Bearer invalid-tc2-test'},signal:signal()});
assert([400,401,403].includes(invalid.status),'Invalid token must be rejected');
const auth=supabaseAuthenticator({url,anonKey:key,requireRegistered:true});assert.equal(await auth('invalid-tc2-test'),null);
console.log(JSON.stringify({staging:ref,authSettingsStatus:response.status,emailProvider:settings.external?.email,invalidTokenStatus:invalid.status,verifierRefused:true,scope:'Read-only connectivity; no real tester session or gameplay acceptance'}));
