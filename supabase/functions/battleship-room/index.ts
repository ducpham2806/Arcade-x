// Staged deployment. Package generated engine.ts/server.ts with this entrypoint.
import {RoomServer,RoomError,type Command} from './server.ts';
import {PostgresRoomStore} from './store.ts';
declare const Deno:{env:{get(name:string):string|undefined};serve(handler:(request:Request)=>Promise<Response>):void};
const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
Deno.serve(async(req)=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='POST')return reply({error:'METHOD_NOT_ALLOWED'},405);
 try{
  const url=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');if(!url||!key)return reply({error:'SERVER_CONFIGURATION'},503);
  const auth=req.headers.get('Authorization')||'';if(!/^Bearer \S+$/.test(auth))return reply({error:'UNAUTHORIZED'},401);
  // Verify identity with Auth. Never trust a decoded, unsigned JWT or a body actor UID.
  const userResponse=await fetch(`${url}/auth/v1/user`,{headers:{apikey:key,Authorization:auth}});
  if(!userResponse.ok)return reply({error:'UNAUTHORIZED'},401);
  const user=await userResponse.json();if(!user.id||user.is_anonymous)return reply({error:'REGISTERED_ACCOUNT_REQUIRED'},403);
  const text=await req.text();if(text.length>16384)return reply({error:'REQUEST_TOO_LARGE'},413);
  let body:any;try{body=JSON.parse(text);}catch{return reply({error:'INVALID_JSON'},400);}
  const service=new RoomServer(new PostgresRoomStore(url,key)),now=Date.now();
  if(body?.type==='create'){
   if(typeof body.requestId!=='string'||!/^[0-9a-f-]{36}$/i.test(body.requestId))return reply({error:'INVALID_REQUEST_ID'},400);
   const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const code=Array.from(crypto.getRandomValues(new Uint8Array(6)),n=>chars[n%chars.length]).join('');
   return reply(await service.create(user.id,body.requestId,code,now));
  }
  if(body?.type==='join'&&typeof body.code==='string')return reply(await service.join(user.id,body.code,now));
  if(typeof body?.roomId!=='string'||body.roomId.length>128)return reply({error:'INVALID_ROOM_ID'},400);
  if(body.type==='snapshot')return reply(await service.snapshot(user.id,body.roomId,now));
  if(body.type==='command'&&body.command&&typeof body.command==='object')return reply(await service.command(user.id,body.roomId,body.version,body.actionId,body.command as Command,now));
  return reply({error:'BAD_REQUEST'},400);
 }catch(error){if(error instanceof RoomError)return reply({error:error.code,message:error.message},error.code==='NOT_MEMBER'?403:error.code==='NOT_FOUND'?404:409);
  // Rules reject malformed placement/shot input. Keep database/internal details private.
  const name=error instanceof Error?error.name:'';return reply({error:name==='RuleError'?'INVALID_MOVE':'SERVER_ERROR'},name==='RuleError'?400:500);
 }
});
