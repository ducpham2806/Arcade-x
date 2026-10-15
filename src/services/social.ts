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
// One request at a time. Idle/hidden clients stop polling; failures back off.
export function watchSocial<T>(read:()=>Promise<T>,receive:(data:T)=>void,fail:(error:Error)=>void,ms=5000){
 let disposed=false,running=false,timer:ReturnType<typeof setTimeout>;let last='',failures=0;
 const refresh=async()=>{if(disposed||running)return;clearTimeout(timer);if(document.hidden||!navigator.onLine)return;running=true;
  try{const data=await read();failures=0;if(!disposed){const serialized=JSON.stringify(data);if(serialized!==last){last=serialized;receive(data);}}}
  catch(e){failures++;last='';if(!disposed)fail(e instanceof Error?e:new Error('Mất kết nối.'));}
  finally{running=false;if(!disposed)timer=setTimeout(refresh,Math.min(60000,ms*2**Math.min(failures,4)));}
 };
 void refresh();window.addEventListener('focus',refresh);window.addEventListener('online',refresh);document.addEventListener('visibilitychange',refresh);
 return ()=>{disposed=true;clearTimeout(timer);window.removeEventListener('focus',refresh);window.removeEventListener('online',refresh);document.removeEventListener('visibilitychange',refresh);};
}
