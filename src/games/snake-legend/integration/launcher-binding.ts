import {httpSaveSession} from './host-api';
import {authenticatedSaveCall} from './verified-completion';
import {parseCampaign} from '../src/story-save';
import {UUID} from './replay-proof';
import type {VerifiedResult} from './verified-result';
import type {SaveHooks,SaveSessionFactory} from '../src/save-hooks';

export type SnakeSnapshot=VerifiedResult['snapshot'];
export type AuthSession={user:{id:string;is_anonymous?:boolean};access_token:string;expires_at?:number};
/** Structural subset of the launcher's existing Supabase client. Never creates an identity. */
export type LauncherAuth={
 getSession():Promise<{data:{session:AuthSession|null};error:unknown}>;
 onAuthStateChange(callback:(event:string,session:AuthSession|null)=>void):{data:{subscription:{unsubscribe():void}}};
};
export type BindingView={status:'idle'|'loading'|'ready'|'error'|'closed';snapshot:SnakeSnapshot|null;message:string};
type Options={actorId:string;auth:LauncherAuth;hostOwner:()=>string|null;endpoint:string;publishableKey:string;fetcher?:typeof fetch;timeoutMs?:number};

/** Validated authoritative state is a separate view, never proof or an unverified local merge. */
export function parseSnakeSnapshot(value:unknown):SnakeSnapshot{
 const s=value as SnakeSnapshot;
 if(!s||Array.isArray(s)||Object.keys(s).sort().join(',')!=='levels,revision,secrets,wallet'||
  !Number.isSafeInteger(s.revision)||s.revision<0||!s.wallet||Array.isArray(s.wallet)||
  Object.keys(s.wallet).sort().join(',')!=='snake_gem,snake_gold'||
  ![s.wallet.snake_gold,s.wallet.snake_gem].every(n=>Number.isSafeInteger(n)&&n>=0))throw Error('Invalid Snake snapshot');
 const encoded=JSON.stringify(s);if(encoded.length>25000)throw Error('Snapshot too large');
 parseCampaign(JSON.stringify({version:1,contentVersion:'r01-10-v1',levels:s.levels,secrets:s.secrets,receipts:[]}));
 return structuredClone(s);
}

/** One binding per authenticated host mount. Invalidation is permanent, including A→B→A. */
export class LauncherSnakeBinding{
 readonly actorId:string;readonly createSaveSession:SaveSessionFactory;
 private active=true;private connected=false;private epoch=0;private readId=0;
 private unsubscribe?:()=>void;private readController?:AbortController;
 private sessions=new Set<SaveHooks>();private listeners=new Set<()=>void>();
 private snapshot:SnakeSnapshot|null=null;
 private view:BindingView={status:'idle',snapshot:null,message:'Chưa tải tiến trình Snake trực tuyến.'};
 constructor(private options:Options){
  if(!UUID.test(options.actorId))throw Error('Authenticated UUID required');this.actorId=options.actorId;
  const ms=options.timeoutMs??10000;if(!Number.isFinite(ms)||ms<1||ms>60000)throw Error('Invalid timeout');
  // Construct once, so snapshot renders and token refresh never restart the game.
  const session=()=>this.session();
  const factory=httpSaveSession({...options,currentActor:()=>this.currentActor(),currentRevision:()=>this.snapshot?.revision??0,
   session,onSnapshot:s=>this.acceptSnapshot(s)});
  this.createSaveSession=storage=>{
   if(!this.currentActor())throw Error('Account mount is closed');
   const hooks=factory(storage),destroy=hooks.destroy.bind(hooks);let stopped=false;
   hooks.destroy=()=>{if(stopped)return;stopped=true;this.sessions.delete(hooks);destroy();};
   this.sessions.add(hooks);return hooks;
  };
 }
 getView=()=>this.view;
 subscribe=(listener:()=>void)=>{this.listeners.add(listener);return()=>{this.listeners.delete(listener);};};
 private publish(status:BindingView['status'],message:string){this.view={status,message,snapshot:this.snapshot?structuredClone(this.snapshot):null};for(const listener of this.listeners)listener();}
 private currentActor(){return this.active&&this.options.hostOwner()===this.actorId?this.actorId:null;}
 connect(){
  if(this.connected||!this.active)return;this.connected=true;
  const {data}=this.options.auth.onAuthStateChange((event,session)=>{
   // No async SDK calls while Supabase holds its auth-event lock.
   if(event==='SIGNED_OUT'||event==='PASSWORD_RECOVERY'||!session||session.user.is_anonymous||session.user.id!==this.actorId||!this.currentActor())this.invalidate();
  });
  this.unsubscribe=()=>data.subscription.unsubscribe();
  if(!this.active){this.unsubscribe();this.unsubscribe=undefined;}
 }
 private async session(){
  const epoch=this.epoch;if(!this.currentActor())return null;
  const {data,error}=await this.options.auth.getSession(),s=data.session;
  if(epoch!==this.epoch||!this.currentActor()||error||!s||s.user.is_anonymous||s.user.id!==this.actorId||!s.access_token||
   s.expires_at!==undefined&&(!Number.isFinite(s.expires_at)||s.expires_at*1000<=Date.now()))return null;
  return {owner:s.user.id,token:s.access_token};
 }
 private acceptSnapshot(value:unknown){
  if(!this.currentActor())throw Error('Account changed');const s=parseSnakeSnapshot(value);
  if(this.snapshot&&s.revision<=this.snapshot.revision)return;
  this.snapshot=s;this.publish('ready','Đã tải tiến trình Snake trực tuyến.');
 }
 /** One explicit read; repeated calls cancel stale reads. No timer-based polling or proof flush. */
 async refreshState(){
  if(!this.currentActor())return;const id=++this.readId;this.readController?.abort();
  const controller=this.readController=new AbortController(),epoch=this.epoch;
  this.publish('loading','Đang tải tiến trình Snake trực tuyến…');
  const send=authenticatedSaveCall(this.options.endpoint,this.options.publishableKey,()=>this.session(),this.options.fetcher);
  let timer:ReturnType<typeof setTimeout>|undefined;
  try{
   const value=await Promise.race([send(this.actorId,{action:'state',actorId:this.actorId},controller.signal),new Promise<never>((_,reject)=>{
    controller.signal.addEventListener('abort',()=>reject(Error('Read stopped')),{once:true});
    timer=setTimeout(()=>controller.abort(),this.options.timeoutMs??10000);
   })]);
   if(!this.currentActor()||epoch!==this.epoch||id!==this.readId||controller.signal.aborted)return;
   const s=value===null?{revision:0,levels:{},secrets:[],wallet:{snake_gold:0,snake_gem:0}}:parseSnakeSnapshot(value);
   this.acceptSnapshot(s);this.publish('ready','Đã tải tiến trình Snake trực tuyến.');
  }catch{
   if(this.currentActor()&&epoch===this.epoch&&id===this.readId)this.publish('error','Chưa tải được tiến trình trực tuyến. Bạn có thể thử lại hoặc chơi trên thiết bị.');
  }finally{if(timer)clearTimeout(timer);if(id===this.readId)this.readController=undefined;}
 }
 invalidate(){
  if(!this.active)return;this.active=false;this.epoch++;this.readId++;this.readController?.abort();this.readController=undefined;
  for(const hooks of [...this.sessions])hooks.destroy();this.unsubscribe?.();this.unsubscribe=undefined;
  this.snapshot=null;this.publish('closed','Phiên tài khoản đã thay đổi. Hãy mở lại game từ tài khoản hiện tại.');
 }
 destroy(){this.invalidate();this.listeners.clear();}
}
