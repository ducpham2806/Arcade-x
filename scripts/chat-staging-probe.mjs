// Read-only negative probes. Public staging key only; never creates data or signs in.
import {writeFileSync} from 'node:fs';
const url=process.env.VITE_SUPABASE_URL,key=process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if(url!=='https://khqipuipeawzlkqmdzdg.supabase.co'||!key?.startsWith('sb_publishable_'))throw Error('Staging public settings required.');
const results=[];
for(const game of ['word-chain','battleship'])for(const origin of ['http://127.0.0.1:4335','http://localhost:4335'])for(const kind of ['preflight','no-bearer','invalid-bearer']){
 const response=await fetch(`${url}/functions/v1/${game}-room`,{method:kind==='preflight'?'OPTIONS':'POST',headers:{apikey:key,Origin:origin,'Content-Type':'application/json',...(kind==='invalid-bearer'?{Authorization:'Bearer invalid-staging-probe'}:{})},body:kind==='preflight'?undefined:'{"type":"snapshot","roomId":"probe-no-data"}'});
 results.push({game,origin,kind,status:response.status,cors:response.headers.get('access-control-allow-origin'),body:kind==='preflight'?null:await response.json()});
}
const output={at:new Date().toISOString(),project:'khqipuipeawzlkqmdzdg',scope:'No signup/login/data mutation. Invalid Auth and preflight only.',results};
if(process.argv[2])writeFileSync(process.argv[2],JSON.stringify(output,null,2)+'\n');console.log(JSON.stringify(output,null,2));
