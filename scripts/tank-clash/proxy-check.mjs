// Exercise the shipped proxy routes over trusted local TLS. No public ACME, system trust or Supabase.
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { request } from 'node:https';
import assert from 'node:assert/strict';
import WS from '../../server/tank-clash-room/node_modules/ws/index.js';
import { createTankRoomServer } from '../../server/tank-clash-room/server.mjs';
const bin=process.env.CADDY_EXECUTABLE;if(!bin)throw Error('Set CADDY_EXECUTABLE to the official Caddy binary');
const dir=mkdtempSync(join(tmpdir(),'arcadex-tank-proxy-')),origin='https://review.arcadex.test',port=33443;
const backend=await createTankRoomServer({allowedOrigins:[origin],allowMissingOrigin:false,allowLocalOrigins:false,detailedHealth:false,metricsToken:'test-metrics-token'});
const template=readFileSync('server/tank-clash-room/deploy/Caddyfile','utf8');
const config='{\nadmin off\nskip_install_trust\nauto_https disable_redirects\n}\n'+template.replace('tank-staging.example.com {',`https://localhost:${port} {\n tls internal`).replace('127.0.0.1:3223',`127.0.0.1:${backend.port}`);
const path=join(dir,'Caddyfile');writeFileSync(path,config);
const child=spawn(resolve(bin),['run','--config',path,'--adapter','caddyfile'],{env:{...process.env,XDG_DATA_HOME:join(dir,'data'),XDG_CONFIG_HOME:join(dir,'config')},stdio:['ignore','ignore','pipe']});
let errors='';child.stderr.on('data',b=>errors+=b);const sockets=[];
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const get=(path,ca)=>new Promise((resolve,reject)=>{const req=request(`https://localhost:${port}${path}`,{ca},res=>{let text='';res.on('data',b=>text+=b);res.on('end',()=>resolve({status:res.statusCode,text,headers:res.headers}));});req.on('error',reject);req.end();});
async function wsConnect(ca,from){return new Promise((resolve,reject)=>{const ws=new WS(`wss://localhost:${port}/tank`,{ca,origin:from});sockets.push(ws);ws.once('open',()=>resolve(ws));ws.once('unexpected-response',(_q,res)=>{res.resume();resolve(res.statusCode);});ws.on('error',reject);});}
try{
 let ca,health;const deadline=performance.now()+10000;
 while(performance.now()<deadline){if(child.exitCode!==null)throw Error(`Caddy stopped: ${errors}`);const p=join(dir,'data/caddy/pki/authorities/local/root.crt');if(existsSync(p)){ca=readFileSync(p);try{health=await get('/health',ca);break;}catch{}}await wait(50);}
 assert.equal(health?.status,200,errors);assert.deepEqual(Object.keys(JSON.parse(health.text)).sort(),['instance','ok','protocol']);assert.equal(health.headers['cache-control'],'no-store');
 assert.equal((await get('/metrics',ca)).status,404);assert.equal((await get('/anything-else',ca)).status,404);
 assert.equal(await wsConnect(ca,'https://foreign.example'),403);assert.equal(await wsConnect(ca,'http://localhost:3000'),403);
 const ws=await wsConnect(ca,origin);assert.equal(ws.readyState,WS.OPEN);
 const messages=[];ws.on('message',b=>messages.push(JSON.parse(b)));const closed=once(ws,'close');await backend.close({notify:true});assert.equal((await closed)[0],1012);assert(messages.some(m=>m.code==='ROOM_CLOSED'));
 console.log('PASS: trusted local WSS, health, private metrics route, exact origins and restart close through shipped Caddy routes. Fixture only; public DNS/ACME/VPS not tested.');
}finally{
 sockets.forEach(ws=>ws.terminate());await backend.close();if(child.exitCode===null){const exited=once(child,'exit');child.kill('SIGTERM');await exited;}rmSync(dir,{recursive:true,force:true});
}
