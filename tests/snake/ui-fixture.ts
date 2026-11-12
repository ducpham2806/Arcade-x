import {randomUUID,createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import type {BrowserContext} from '@playwright/test';
import {mockSupabase} from '../auth/backend';
import {Engine} from '../../src/games/snake-legend/src/core';
import {STORY_LEVELS} from '../../src/games/snake-legend/src/story-data';
import {normaliseRequest} from '../../src/games/snake-legend/integration/completion';
import {parseProof} from '../../src/games/snake-legend/integration/replay-proof';
import {ENGINE_DIGEST} from '../../src/games/snake-legend/backend/release';

const empty=()=>({revision:0,levels:{} as Record<string,any>,secrets:[] as string[],wallet:{snake_gold:0,snake_gem:0}});
const headers={'access-control-allow-origin':'*','access-control-allow-headers':'authorization,apikey,content-type,x-client-info','access-control-allow-methods':'POST,OPTIONS','cache-control':'no-store'};
export async function snakeUiFixture() {
 const auth=mockSupabase(),snapshots=new Map<string,ReturnType<typeof empty>>(),tickets=new Map<string,any>(),starts=new Map<string,string>();
 const calls={state:0,start:0,complete:0,commits:0,replayVerified:0};
 let dropAck=false,failRead=false,holdRead=false,holdReply=false,offline=false;
 const reads=new Set<()=>void>(),replies=new Set<()=>void>();
 const identify=(token:string)=>{try{return JSON.parse(Buffer.from(token.split('.')[1],'base64url').toString()).sub;}catch{return '';}};
 const db={
  async authenticate(token:string){try{const payload=JSON.parse(Buffer.from(token.split('.')[1],'base64url').toString());return payload.exp*1000>Date.now()?auth.users.get(identify(token))||null:null;}catch{return null;}},
  async state(owner:string){calls.state++;if(failRead)throw Error('fixture offline');if(holdRead)await new Promise<void>(resolve=>{reads.add(resolve);});return structuredClone(snapshots.get(owner)||empty());},
  async begin(owner:string,levelId:string,key:string,digest:string){
   calls.start++;const memo=owner+':'+key;let id=starts.get(memo);
   if(!id){id=randomUUID();starts.set(memo,id);tickets.set(id,{owner,levelId,engineDigest:digest,started:Date.now()});}
   return {id,levelId,engineDigest:digest,contentVersion:'r01-10-v1',expiresAt:new Date(Date.now()+15*60000).toISOString()};
  },
  async ticket(owner:string,id:string){const ticket=tickets.get(id);if(!ticket||ticket.owner!==owner)throw Error('Wrong ticket owner');return {levelId:ticket.levelId,engineDigest:ticket.engineDigest,ack:ticket.result,proofHash:ticket.proofHash};},
  async commit(owner:string,request:any,ticks:number,hash:string,digest:string){
   const ticket=tickets.get(request.clear.runId);if(!ticket||ticket.owner!==owner||ticket.engineDigest!==digest)throw Error('Ticket mismatch');
   if(ticket.result)return structuredClone(ticket.result);
   if(Date.now()-ticket.started+200<ticks*1000/60)throw Error('Replay must respect real elapsed time');
   const snapshot=structuredClone(snapshots.get(owner)||empty()),clear=request.clear,prior=snapshot.levels[clear.levelId];
   snapshot.revision++;snapshot.levels[clear.levelId]={stars:clear.stars.map((value:boolean,index:number)=>value||!!prior?.stars[index]),bestTime:Math.min(prior?.bestTime??Infinity,clear.time),bestScore:Math.max(prior?.bestScore??0,clear.score)};
   if(clear.secret&&!snapshot.secrets.includes(clear.levelId))snapshot.secrets.push(clear.levelId);
   const result={ack:{protocol:1,kind:'committed',request,receiptId:randomUUID(),revision:snapshot.revision},snapshot,reward:{snake_gold:0,snake_gem:0}};
   ticket.result=structuredClone(result);ticket.proofHash=hash;snapshots.set(owner,snapshot);calls.commits++;return result;
  },
 };
 // CI re-simulates every input using the public engine. It never accepts a claimed win.
 async function fixtureHandler(req:Request){
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
  try{
   const actor=await db.authenticate(req.headers.get('authorization')?.replace(/^Bearer /i,'')||'');
   if(!actor||actor.is_anonymous)return Response.json({error:'Sign in required'},{status:401,headers});
   const body=await req.json();let result:any;
   if(body.action==='state'&&body.actorId===actor.id)result=await db.state(actor.id);
   else if(body.action==='start'&&body.actorId===actor.id)result=await db.begin(actor.id,body.levelId,body.requestId,ENGINE_DIGEST);
   else if(body.action==='complete'){
    const request=normaliseRequest(body.request),proof=parseProof(body.proof);if(request.actorId!==actor.id)throw Error('Wrong actor');
    const ticket=await db.ticket(actor.id,request.clear.runId);
    const hash=createHash('sha256').update(JSON.stringify({request,proof})).digest('hex');
    if(ticket.ack){if(ticket.proofHash!==hash)throw Error('Conflicting replay');result=ticket.ack;}
    else{
     const arena=STORY_LEVELS.find(level=>level.story!.id===ticket.levelId);if(!arena)throw Error('Wrong level');const engine=new Engine(structuredClone(arena));
     for(const command of proof.commands){if(command.length===1){if(!engine.encounters?.tutorialPending)throw Error('Unexpected ack');engine.encounters.tutorialPending=false;continue;}
      for(let i=0;i<command[0];i++){if(engine.status!=='running')throw Error('Input after terminal');engine.step({x:command[1],y:command[2],dash:command[3],...(command.length===5?{steering:command[4]}:{})});}}
     if(engine.status!=='won')throw Error('Replay did not win');
     const verified=normaliseRequest({...request,clear:{...request.clear,time:engine.time,score:engine.score,stars:engine.stars,secret:engine.secret}});
     if(JSON.stringify(request)!==JSON.stringify(verified))throw Error('Claim differs from simulation');calls.replayVerified++;
     result=await db.commit(actor.id,verified,engine.tick,hash,ENGINE_DIGEST);
    }
   }else throw Error('Unexpected fixture action');
   return Response.json(result,{headers});
  }catch(error){return Response.json({error:(error as Error).message},{status:400,headers});}
 }
 let handle=fixtureHandler,verifier='public-engine fixture';
 if(process.env.SNAKE_VERIFIER_MODULE){
  const file=process.env.SNAKE_VERIFIER_MODULE,bytes=readFileSync(file);
  if(createHash('sha256').update(bytes).digest('hex')!=='0bc3cc278c84ddd2fbe71c9b609a0b0d060feec915289cba2968080c71acc0c7')throw Error('Unexpected read-only verifier snapshot');
  const module=await import(pathToFileURL(file).href);if(module.ENGINE_DIGEST!==ENGINE_DIGEST)throw Error('Verifier/client digest mismatch');
  handle=module.createHandler(db,ENGINE_DIGEST);verifier='deployed v2 snapshot; local Auth/store';
 }
 return {
  calls,verifier,snapshots,tickets,auth,
  user(name:string){const id=randomUUID(),email=`snake-${name.toLowerCase()}@example.invalid`,password='LocalFixture123!';auth.users.set(id,{id,email,password,is_anonymous:false,confirmed:true,user_metadata:{}});return {id,email,password,name};},
  offline(value:boolean){offline=value;},dropNextAck(){dropAck=true;},failReads(value:boolean){failRead=value;},holdReads(value:boolean){holdRead=value;},releaseRead(){holdRead=false;for(const resolve of reads)resolve();reads.clear();},holdCompletion(value:boolean){holdReply=value;},releaseCompletion(){holdReply=false;for(const resolve of replies)resolve();replies.clear();},
  async install(context:BrowserContext){
   await auth.install(context);
   await context.routeWebSocket('**/*',socket=>{if(['127.0.0.1','localhost'].includes(new URL(socket.url()).hostname))socket.connectToServer();else void socket.close().catch(()=>{});});
   await context.route('**/functions/v1/snake-complete',async route=>{
    if(offline){await route.abort('internetdisconnected');return;}
    const request=route.request();let body:any={};try{body=request.postDataJSON()||{};}catch{}
    if(body.action==='complete')calls.complete++;
    const response=await handle(new Request(request.url(),{method:request.method(),headers:request.headers(),...(request.method()==='POST'?{body:request.postData()!}:{})}));
    if(body.action==='complete'&&response.ok){if(holdReply)await new Promise<void>(resolve=>{replies.add(resolve);});if(dropAck){dropAck=false;await route.abort('failed');return;}}
    try{await route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:await response.text()});}catch{/* A closed browser must not undo an already committed fixture result. */}
   });
  },
 };
}
