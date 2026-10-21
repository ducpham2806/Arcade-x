import {PGlite} from '@electric-sql/pglite';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const db=new PGlite();await db.waitReady;const passed=[];
async function test(name,fn){await fn();passed.push(name);console.log('PASS',name);}
try{
await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema cron;
create table cron.job(jobid bigint primary key,jobname text);
create table cron.job_run_details(runid bigint primary key,jobid bigint,status text,end_time timestamptz);
create function cron.schedule(text,text,text) returns bigint language sql as 'select 1::bigint';`);
await db.exec(readFileSync('supabase/battleship/schema.sql','utf8'));
await db.exec(readFileSync('supabase/battleship/maintenance.sql','utf8'));
await db.exec(`insert into cron.job values(1,'battleship-room-timeouts'),(2,'other-game');
insert into cron.job_run_details values(1,1,'succeeded',now()-interval '8 days'),(2,2,'succeeded',now()-interval '8 days'),(3,1,'running',null),(4,1,'failed',now());
insert into battleship_private.rooms values('old','ABC234',1,false,'{"status":"closed","marker":"recover-me"}',now()-interval '8 days'),('active','BCD234',2,true,'{"status":"active"}',now()-interval '8 days'),('fresh','CDE234',1,false,'{"status":"closed"}',now());
insert into battleship_private.request_budget values('old','read',now()-interval '2 days',5),('fresh','write',now(),1);`);
let result;
await test('maintenance moves only old closed rooms and preserves complete recovery data',async()=>{result=(await db.query('select battleship_private.maintain() doc')).rows[0].doc;assert.equal(result.rooms_archived,1);assert.equal((await db.query('select doc from battleship_private.room_archive')).rows[0].doc.marker,'recover-me');assert.deepEqual((await db.query('select id from battleship_private.rooms order by id')).rows.map(r=>r.id),['active','fresh']);});
await test('archive selection preserves other games, running jobs and recent cron history',async()=>{assert.equal(result.cron_runs_archived,1);assert.deepEqual((await db.query('select runid from cron.job_run_details order by runid')).rows.map(r=>Number(r.runid)),[2,3,4]);});
await test('maintenance removes stale rate counters but preserves current budgets',async()=>{assert.equal(result.expired_budgets,1);assert.equal((await db.query('select uid from battleship_private.request_budget')).rows[0].uid,'fresh');});
await test('repeat maintenance is idempotent',async()=>{assert.deepEqual((await db.query('select battleship_private.maintain() doc')).rows[0].doc,{rooms_archived:0,cron_runs_archived:0,expired_budgets:0});});
await test('browser and service role cannot invoke owner-only maintenance or read archives',async()=>{for(const role of ['anon','authenticated','service_role']){await db.exec('set role '+role);try{await assert.rejects(()=>db.query('select battleship_private.maintain()'),/permission denied/);await assert.rejects(()=>db.query('select * from battleship_private.room_archive'),/permission denied/);}finally{await db.exec('reset role');}}});
await test('archived room can be restored with original version and state',async()=>{await db.exec(`insert into battleship_private.rooms(id,code,version,active,doc,updated_at) select id,code,version,false,doc,updated_at from battleship_private.room_archive where id='old';`);assert.equal((await db.query("select doc from battleship_private.rooms where id='old'")).rows[0].doc.marker,'recover-me');});
await test('normal deployment bundle excludes QA and temporary bundle expires in ten minutes behind worker verification',async()=>{for(const qa of [false,true]){const path='/tmp/bs-qa-bundle-test.json';execFileSync('node',['scripts/battleship-qa-bundle.mjs',path,...qa?['--qa-10-minutes']:[]]);const bundle=JSON.parse(readFileSync(path));assert.equal(bundle.verify_jwt,true);assert.equal(bundle.files.length,qa?5:4);const index=bundle.files[0].content;if(qa){assert(index.indexOf('workerAllowed(worker)')<index.indexOf("body?.type==='qa'"));const expiry=Number(index.match(/Date.now\(\)<(\d+)/)[1]);assert(expiry>Date.now()&&expiry<=Date.now()+600000);}else assert(!index.includes('runCloudQA'));}});
}finally{await db.close();}
writeFileSync('docs/battleship/maintenance-tests.json',JSON.stringify({checks:passed.length,passed,scope:'PostgreSQL/PGlite; cron tables are a fixture. Real scheduler activation checked separately.'},null,2)+'\n');
