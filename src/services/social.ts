import { ensureCloudIdentity } from './supabaseClient';
export interface SocialProfile { id:string; username:string; avatar:string; level:number; currentTitle?:string; stats?:Record<string,unknown>; bio:string; favorite:string; online:boolean; lastSeen?:string }
export interface SocialMessage { id:string; sender:string; profile:SocialProfile|null; text:string; created_at:string }
export interface SocialRelation { sender:string; target:string; status:'pending'|'accepted'|'blocked'; profile:SocialProfile|null }
export interface InboxEntry { peer:string; profile:SocialProfile|null; text:string; created_at:string }
export async function socialAction<T=unknown>(actor:string,action:string,target='',text='',scope='global'):Promise<T>{
 const client=await ensureCloudIdentity();
 const {data,error}=await client.rpc('arcadex_social_action',{p_actor:actor,p_action:action,p_target:target,p_text:text,p_scope:scope});
 if(error) throw new Error(error.message || 'Chưa kết nối được cộng đồng.');
 return data as T;
}
// Sequential polling avoids overlapping responses; focus/online recovery is immediate.
export function watchSocial<T>(read:()=>Promise<T>,receive:(data:T)=>void,fail:(error:Error)=>void,ms=1800){
 let disposed=false,running=false,timer:ReturnType<typeof setTimeout>;let last='';
 const refresh=async()=>{if(disposed||running)return;running=true;clearTimeout(timer);try{const data=await read();if(!disposed){const serialized=JSON.stringify(data);if(serialized!==last){last=serialized;receive(data);}}}catch(e){last='';if(!disposed)fail(e instanceof Error?e:new Error('Mất kết nối.'));}finally{running=false;if(!disposed)timer=setTimeout(refresh,ms);}};
 void refresh();window.addEventListener('focus',refresh);window.addEventListener('online',refresh);
 return ()=>{disposed=true;clearTimeout(timer);window.removeEventListener('focus',refresh);window.removeEventListener('online',refresh);};
}
