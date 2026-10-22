import {supabase} from '../services/supabaseClient';
export const accessPreviewEnabled = import.meta.env.VITE_ACCESS_CONTROL_V2 === 'true';
export type Entitlement={id:string;game_id:string|null;all_games:boolean;starts_at:string;expires_at:string|null;revoked_at:string|null;source:'admin'|'payment'|'starter'};
export type Block={id:string;game_id:string|null;expires_at:string|null;revoked_at:string|null;reason:string};
export type AdminState={starter:{enabled:boolean;game_ids:string[]};mode:'off'|'pilot';pilot:boolean;games:{id:string;title:string;status:string;access_model:string}[];entitlements:Entitlement[];blocks:Block[];audit:{id:number;action:string;target_id:string;reason:string;created_at:string}[]};
export async function accessRpc<T>(name:string,args:Record<string,unknown>={}):Promise<T>{
 if(!supabase||!navigator.onLine)throw new Error('Cần kết nối mạng để quản lý quyền.');
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),10000);
 try{const {data,error}=await supabase.rpc(name,args).abortSignal(controller.signal);if(error)throw new Error(error.message);return data as T;}finally{clearTimeout(timer);}
}
export const adminState=(user:string|null)=>accessRpc<AdminState>('launcher_admin_state',{p_user:user});
export const adminCommand=(action:string,payload:Record<string,unknown>,reason:string)=>accessRpc<{ok:boolean;id:string}>('launcher_admin_command',{p_action:action,p_payload:payload,p_reason:reason});
export const termOptions=[['7d','7 ngày'],['14d','14 ngày'],['30d','30 ngày'],['3m','3 tháng'],['6m','6 tháng'],['1y','1 năm']] as const;

export type MyAccessState={serverTime:string;pilot:boolean;starterGames:string[];entitlements:Entitlement[];games:{id:string;title:string;access:{allowed:boolean;reason:string}}[]};
export const myAccess=(owner:string)=>accessRpc<MyAccessState>('launcher_my_access',{p_expected_owner:owner});
