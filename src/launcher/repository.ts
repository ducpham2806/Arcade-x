import { supabase } from '../services/supabaseClient';
import { bundledCatalog, parseCatalog, type Catalog, type CatalogGame } from './catalog';
const cacheKey='launcher_catalog_v1';
export function cachedCatalog(): Catalog {
  try { return parseCatalog(JSON.parse(localStorage.getItem(cacheKey)||'null')) || bundledCatalog; } catch { return bundledCatalog; }
}
async function rpc(name: string, args: Record<string,unknown> = {}) {
  if (!supabase || !navigator.onLine) throw new Error('offline');
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),5000);
  try { const result=await supabase.rpc(name,args).abortSignal(controller.signal);if(result.error)throw result.error;return result.data; }
  finally {clearTimeout(timer);}
}
export async function fetchCatalog(): Promise<Catalog> {
  const raw=await rpc('launcher_catalog');const result=parseCatalog(raw);
  if(!result)throw new Error('catalog_unavailable');
  try {localStorage.setItem(cacheKey,JSON.stringify(raw));}catch {}
  return result;
}
export async function checkAccess(game: CatalogGame): Promise<{allowed:boolean;reason:string}> {
  if(game.availability!=='published')return {allowed:false,reason:'unavailable'};
  if(!navigator.onLine)return {allowed:game.accessModel==='free' && game.supportsOffline,reason:'offline'};
  try {
    const result=await rpc('launcher_check_access',{p_game_id:game.id});
    if(typeof result?.allowed==='boolean')return result;
  }catch {/* Keep the existing free library usable while the additive migration rolls out. */}
  return {allowed:game.accessModel==='free',reason:game.accessModel==='free'?'local':'connection'};
}
async function requireOwner(owner: string) {
  if(!supabase)throw new Error('unconfigured');
  const {data}=await supabase.auth.getSession();
  if(data.session?.user.id!==owner || data.session.user.is_anonymous)throw new Error('account_changed');
}
export type LibraryRow={game_id:string;favorite:boolean;last_played_at:string|null};
export async function readLibrary(owner:string):Promise<LibraryRow[]> {
  await requireOwner(owner);const rows=await rpc('launcher_library_state',{p_expected_owner:owner});
  if(!Array.isArray(rows))throw new Error('library_unavailable');
  return rows.filter(row=>typeof row.game_id==='string'&&typeof row.favorite==='boolean');
}
type Mutation={gameId:string;favorite:boolean;id:string};
const queueKey=(owner:string)=>`launcher_favorite_outbox_${owner}`;
function queue(owner:string):Mutation[]{try{const q=JSON.parse(localStorage.getItem(queueKey(owner))||'[]');return Array.isArray(q)?q:[];}catch{return [];}}
export function pendingFavorites(owner:string){return queue(owner);}
export function enqueueFavorite(owner:string,gameId:string,favorite:boolean){
  localStorage.setItem(queueKey(owner),JSON.stringify([...queue(owner).filter(row=>row.gameId!==gameId),{gameId,favorite,id:crypto.randomUUID()}]));
}
const inFlight=new Map<string,Promise<void>>();
export async function flushFavorites(owner:string):Promise<void>{
  if(inFlight.has(owner))return inFlight.get(owner)!;
  const task=(async()=>{for(const mutation of queue(owner)){
    await requireOwner(owner);await rpc('launcher_set_favorite',{p_game_id:mutation.gameId,p_favorite:mutation.favorite,p_expected_owner:owner});
    localStorage.setItem(queueKey(owner),JSON.stringify(queue(owner).filter(row=>row.id!==mutation.id)));
  }})();inFlight.set(owner,task);try{await task;}finally{inFlight.delete(owner);}
}
export async function startSession(owner:string,gameId:string,id:string){await requireOwner(owner);await rpc('launcher_session_start',{p_game_id:gameId,p_session_id:id,p_expected_owner:owner});}
export async function finishSession(owner:string,id:string,outcome:'completed'|'left',score?:number){await requireOwner(owner);await rpc('launcher_session_finish',{p_session_id:id,p_outcome:outcome,p_expected_owner:owner,p_score:Number.isFinite(score)?Math.max(0,Math.floor(score!)):null});}

