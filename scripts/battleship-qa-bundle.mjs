// Temporary deployment bundle only. Canonical production index stays unchanged.
import {readFileSync,writeFileSync} from 'node:fs';
const output=process.argv[2];
if(!output)throw Error('Usage: node scripts/battleship-qa-bundle.mjs /absolute/output.json [--qa-10-minutes]');
const qa=process.argv.includes('--qa-10-minutes');
const files=['index.ts','store.ts','server.ts','engine.ts'].map(name=>({name,content:readFileSync('supabase/functions/battleship-room/'+name,'utf8')}));
if(qa){
 const until=Date.now()+600000;
 files[0].content="import {runCloudQA} from './qa-module.ts';\n"+files[0].content.replace("if(body?.type!=='tick')return reply({error:'WORKER_OPERATION_ONLY'},403);",`if(body?.type==='qa'&&Date.now()<${until}){const publicKey=req.headers.get('apikey');if(!publicKey)return reply({error:'PUBLIC_KEY_REQUIRED'},400);return reply(await runCloudQA(url,key,publicKey));}\n   if(body?.type!=='tick')return reply({error:'WORKER_OPERATION_ONLY'},403);`);
 files.push({name:'qa-module.ts',content:readFileSync('tests/battleship/cloud/qa-module.ts','utf8').replace("../../../supabase/functions/battleship-room/store.ts","./store.ts")});
}
writeFileSync(output,JSON.stringify({name:'battleship-room',entrypoint_path:'index.ts',verify_jwt:true,files}));
console.log(JSON.stringify({output,qa,expiresInSeconds:qa?600:0,files:files.length}));
