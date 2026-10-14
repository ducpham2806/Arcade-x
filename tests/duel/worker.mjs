import {Worker} from 'node:worker_threads';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const source=JSON.parse(fs.readFileSync('src/games/duel/worker-source.json','utf8'));
const prefix="const {parentPort}=require('node:worker_threads');global.self={postMessage:data=>parentPort.postMessage(data)};parentPort.on('message',data=>self.onmessage({data}));";
const run=(game,args)=>new Promise((resolve,reject)=>{const w=new Worker(prefix+source,{eval:true});const t=setTimeout(()=>{w.terminate();reject(new Error('worker timeout'));},5000);w.once('message',m=>{clearTimeout(t);w.terminate();m.error?reject(new Error(m.error)):resolve(m.move);});w.once('error',reject);w.postMessage({game,args,id:1});});
let b={'3_7':'X'};for(let i=4;i<8;i++)b[`${i}_7`]='O';assert.deepEqual(await run('caro',[b,'O','hard']),{x:8,y:7});
assert.ok(await run('chess',['7k/8/6QK/8/8/8/8/8 w - - 0 1','hard']));
console.log('PASS bundled worker executes Caro and chess without browser/network dependencies.');
