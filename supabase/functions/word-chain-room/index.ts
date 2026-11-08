// Authoritative Nối Từ (word-chain) rooms. Run `npm run prepare:word-chain-server` to stage
// normalize.ts, rules.ts, lexicon.ts, server.ts and words.v1.json from src/ and public/.
// NOT DEPLOYED: needs supabase/word-chain/schema.sql and a scheduler calling `tick`
// (docs/WORD-CHAIN-SERVER.md).
import {WordChainRoomServer,RoomError,type Command} from './server.ts';
import {buildLexicon,type Lexicon,type PackedLexiconData} from './lexicon.ts';
import {PostgresWordChainStore} from './store.ts';
import words from './words.v2.json' with {type: 'json'};
declare const Deno: {env: {get(name: string): string | undefined}; serve(handler: (request: Request) => Promise<Response>): void};
const code = () => {const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; return Array.from(crypto.getRandomValues(new Uint8Array(6)), n => chars[n % chars.length]).join('');};
let lexicon: Lexicon | null = null;
const dictionary = () => lexicon ??= buildLexicon(words as PackedLexiconData);
/** Display name from the verified account (never from the request body). */
const nameOf = (user: {email?: string; user_metadata?: Record<string, unknown>}) => {
  const m = user.user_metadata ?? {};
  return String(m.display_name || m.full_name || m.name || m.username || (user.email ? user.email.split('@')[0] : '') || 'Người chơi');
};

export async function handle(req: Request, env: {url?: string; key?: string; origins?: string[]}, now = Date.now()): Promise<Response> {
  const origin=req.headers.get('Origin');
  const allowed=(env.origins??[]).filter(value=>{try{
    const url=new URL(value);return url.origin===value&&(url.protocol==='https:'||(url.protocol==='http:'&&['127.0.0.1','localhost','[::1]'].includes(url.hostname)));
  }catch{return false;}});
  const headers:Record<string,string>={'Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info,x-word-chain-lexicon','Access-Control-Allow-Methods':'POST,OPTIONS','Content-Type':'application/json','Vary':'Origin'};
  if(origin&&allowed.includes(origin))headers['Access-Control-Allow-Origin']=origin;
  const reply=(body:unknown,status=200)=>new Response(JSON.stringify(typeof body==='object'&&body!==null?{...body,serverNow:Date.now()}:body),{status,headers});
  if(origin&&!allowed.includes(origin))return reply({error:'ORIGIN_DENIED'},403);
  if(req.method==='OPTIONS')return origin?new Response(null,{status:204,headers}):reply({error:'ORIGIN_REQUIRED'},403);
  if (req.method !== 'POST') return reply({error: 'METHOD_NOT_ALLOWED'}, 405);
  try {
    const {url, key} = env;
    if (!url || !key) return reply({error: 'SERVER_CONFIGURATION'}, 503);
    const auth = req.headers.get('Authorization') || '';
    if (!/^Bearer \S+$/.test(auth)) return reply({error: 'UNAUTHORIZED'}, 401);
    const text = await req.text();
    if (text.length > 4096) return reply({error: 'REQUEST_TOO_LARGE'}, 413);
    let body: any; try {body = JSON.parse(text);} catch {return reply({error: 'INVALID_JSON'}, 400);}
    const store = new PostgresWordChainStore(url, key);
    if(!body||typeof body!=='object'||Array.isArray(body))return reply({error:'BAD_REQUEST'},400);
    // A tick-only credential is generated in Vault. Its hash is checked through a
    // service-only RPC; no service-role key is copied into cron headers or clients.
    if(body.type==='tick'){
      const token=auth.slice(7);
      if(origin||! /^[a-f0-9]{64}$/.test(token))return reply({error:'UNAUTHORIZED_TICK'},403);
      const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));
      const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
      if(!await store.authorizeTick(hash))return reply({error:'UNAUTHORIZED_TICK'},403);
      return reply(await new WordChainRoomServer(store,dictionary()).tick(now));
    }
    if(!origin)return reply({error:'ORIGIN_REQUIRED'},403);
    // Verify identity with Auth; never trust a decoded token or a UID from the body.
    const userResponse = await fetch(`${url}/auth/v1/user`, {headers: {apikey: key, Authorization: auth}});
    if (!userResponse.ok) return reply({error: 'UNAUTHORIZED'}, 401);
    const user = await userResponse.json();
    if (!user.id || user.is_anonymous) return reply({error: 'REGISTERED_ACCOUNT_REQUIRED'}, 403);
    if (!['create', 'match', 'join', 'snapshot', 'command'].includes(body?.type)) return reply({error: 'BAD_REQUEST'}, 400);
    if (!(await store.takeRequest(user.id, body.type === 'snapshot' ? 'read' : 'write'))) return reply({error: 'RATE_LIMITED'}, 429);
    if(req.headers.get('x-word-chain-lexicon')!==words.revision)return reply({error:'DICTIONARY_MISMATCH',message:'Từ điển đã cập nhật. Tải lại game để vào phòng.'},409);
    const service = new WordChainRoomServer(store, dictionary()), name = nameOf(user);
    if (body.type === 'create' || body.type === 'match') {
      if (typeof body.requestId !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.requestId)) return reply({error: 'INVALID_REQUEST_ID'}, 400);
      if (body.type === 'match') return reply(await service.match(user.id, body.requestId, code(), name, now));
      if (![2, 3, 4].includes(body.capacity)) return reply({error: 'BAD_CAPACITY'}, 400);
      return reply(await service.create(user.id, body.requestId, code(), name, body.capacity, now));
    }
    if (body.type === 'join') return typeof body.code === 'string' ? reply(await service.join(user.id, body.code, name, now)) : reply({error: 'BAD_CODE'}, 400);
    if (typeof body.roomId !== 'string' || body.roomId.length > 128) return reply({error: 'INVALID_ROOM_ID'}, 400);
    if (body.type === 'snapshot') return reply(await service.snapshot(user.id, body.roomId, now));
    if (validCommand(body.command)) return reply(await service.command(user.id, body.roomId, body.version, body.actionId, body.command as Command, now));
    return reply({error: 'BAD_REQUEST'}, 400);
  } catch (error) {
    if (error instanceof RoomError) return reply({error: error.code, message: error.message}, error.code === 'NOT_MEMBER' ? 403 : error.code === 'NOT_FOUND' ? 404 : 409);
    // Rule violations are client errors; keep database/internal details private.
    if (error instanceof Error && error.name === 'RuleError') return reply({error: 'NOT_YOUR_TURN', message: error.message}, 400);
    return reply({error: 'SERVER_ERROR'}, 500);
  }
}

function validCommand(command:unknown):command is Command {
  if(!command||typeof command!=='object'||Array.isArray(command))return false;
  const c=command as Record<string,unknown>;
  switch(c.type){
    case 'ready':return typeof c.ready==='boolean';
    case 'submit':return typeof c.word==='string'&&c.word.length<=80&&Number.isInteger(c.turn)&&Number(c.turn)>0;
    case 'react':return typeof c.emoji==='string'&&c.emoji.length<=16;
    case 'start':case 'forfeit':case 'leave':case 'rematch':return true;
    default:return false;
  }
}
if (typeof Deno !== 'undefined') Deno.serve(req => handle(req, {url: Deno.env.get('SUPABASE_URL'), key: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),origins:Deno.env.get('WORD_CHAIN_ALLOWED_ORIGINS')?.split(',').map(s=>s.trim())}));
