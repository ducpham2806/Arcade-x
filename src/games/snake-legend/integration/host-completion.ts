import {ReplayRecorder,VerifiedOutbox,type VerifiedSubmission,type VerifiedTransport} from './verified-completion';
import {normaliseRequest} from './completion';
import {UUID,CONTENT} from './replay-proof';
import {ENGINE_DIGEST} from '../backend/release';
import type {SaveHooks,SaveStatus} from '../src/save-hooks';
import type {Input} from '../src/core';
import type {Clear,StorageLike} from '../src/story-save';
import type {VerifiedResult} from './verified-result';

export type StartRequest={actorId:string;levelId:string;requestId:string};
export type SaveCapability={actorId:string;currentActor:()=>string|null;
 start:(request:StartRequest,signal:AbortSignal)=>Promise<unknown>;complete:VerifiedTransport;
 minimumRevision?:number;currentRevision?:()=>number;onSnapshot?:(snapshot:VerifiedResult['snapshot'])=>void;timeoutMs?:number};
type Ticket={id:string;levelId:string;contentVersion:string;engineDigest:string;expiresAt:string};

/** One owner per mounted game; no timer, network request, or flush on construction. */
export class HostCompletion implements SaveHooks{
 readonly storage:StorageLike;private outbox:VerifiedOutbox;private listeners=new Set<()=>void>();
 private generation=0;private stopped=false;private starting=false;private local=false;private message='';
 private startRequest?:StartRequest;private ticket?:Ticket;private recorder?:ReplayRecorder;
 private startController?:AbortController;private unsaved?:VerifiedSubmission;private lastRevision:number;
 private retryJob?:Promise<void>;private applyPending=false;
 constructor(store:StorageLike,private cap:SaveCapability){
  if(!UUID.test(cap.actorId)||!Number.isSafeInteger(cap.minimumRevision??0)||(cap.minimumRevision??0)<0)throw Error('Invalid save capability');
  const ms=cap.timeoutMs??10000;if(!Number.isFinite(ms)||ms<1||ms>60000)throw Error('Invalid timeout');
  this.lastRevision=cap.minimumRevision??0;
  this.storage={getItem:k=>store.getItem(this.scopedKey(k)),setItem:(k,v)=>store.setItem(this.scopedKey(k),v)};
  this.outbox=new VerifiedOutbox(store,cap.actorId,async(p,s)=>{this.requireCurrent();const ack=await cap.complete(p,s);this.requireCurrent();return ack;},ms);
 }
 scopedKey(key:string){return 'snake-legend:account:'+this.cap.actorId+':'+key;}
 private current(){return !this.stopped&&this.cap.currentActor()===this.cap.actorId;}
 private requireCurrent(){if(!this.current())throw Error('Tài khoản đã thay đổi. Kết quả cũ được giữ để thử lại đúng tài khoản.');}
 private emit(){if(!this.stopped)for(const f of this.listeners)f();}
 subscribe(f:()=>void){this.listeners.add(f);return()=>{this.listeners.delete(f);};}
 status():SaveStatus{return {message:this.message||this.outbox.error||(this.outbox.count?'Có kết quả đang chờ lưu trực tuyến.':'Tiến trình trực tuyến sẽ được lưu khi hoàn thành màn.'),starting:this.starting,canRetry:!this.stopped&&(!!this.unsaved||this.outbox.count>0||!!this.outbox.error||this.applyPending),canPlayLocal:!this.local&&!this.recorder,pending:this.outbox.count+(this.unsaved?1:0)};}
 newRun(levelId:string){
  this.generation++;this.startController?.abort();this.startController=undefined;this.starting=false;
  this.ticket=undefined;this.recorder=undefined;this.local=false;this.message='';
  // Unsaved (quota) result belongs to the previous run and remains retryable in this mount.
  this.startRequest={actorId:this.cap.actorId,levelId,requestId:crypto.randomUUID()};this.emit();
 }
 async prepare(){
  if(this.stopped)return false;if(this.local)return true;if(this.recorder)return this.current();if(this.starting||!this.startRequest)return false;
  if(this.unsaved){this.message='Còn một kết quả chưa giữ được trên thiết bị. Hãy thử lưu lại hoặc chơi trên thiết bị.';this.emit();return false;}
  const generation=this.generation,controller=this.startController=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
  this.starting=true;this.message='Đang chuẩn bị lưu tiến trình trực tuyến…';this.emit();
  try{
   this.requireCurrent();
   const value=await Promise.race([this.cap.start({...this.startRequest},controller.signal),new Promise<never>((_,reject)=>{
    const abort=()=>reject(Error('Chưa chuẩn bị được lượt chơi. Hãy thử lại hoặc chơi trên thiết bị.'));
    controller.signal.addEventListener('abort',abort,{once:true});
    timer=setTimeout(()=>controller.abort(),this.cap.timeoutMs??10000);
   })]);
   if(this.stopped||generation!==this.generation||controller.signal.aborted)return false;this.requireCurrent();
   const t=value as Ticket;
   if(!t||Object.keys(t).sort().join(',')!=='contentVersion,engineDigest,expiresAt,id,levelId'||!UUID.test(t.id)||t.levelId!==this.startRequest.levelId||t.contentVersion!==CONTENT||t.engineDigest!==ENGINE_DIGEST||!Number.isFinite(Date.parse(t.expiresAt))||Date.parse(t.expiresAt)<=Date.now())throw Error('Lượt chơi chưa tương thích hoặc đã hết hạn. Hãy thử lại hoặc chơi trên thiết bị.');
   this.ticket=t;this.recorder=new ReplayRecorder();this.message='Lượt chơi sẽ lưu trực tuyến khi hoàn thành.';return true;
  }catch{if(!this.stopped&&generation===this.generation)this.message=this.current()?'Chưa chuẩn bị được lượt chơi. Hãy thử lại hoặc chơi trên thiết bị.':'Tài khoản đã thay đổi. Lượt này có thể chơi trên thiết bị.';return false;}
  finally{if(timer)clearTimeout(timer);if(generation===this.generation){this.starting=false;this.startController=undefined;this.emit();}}
 }
 useLocal(restored=false){this.generation++;this.startController?.abort();this.startController=undefined;this.starting=false;this.local=true;this.recorder=undefined;this.ticket=undefined;this.message=restored?'Màn đã khôi phục chỉ lưu trên thiết bị. Chơi lại từ đầu để lưu trực tuyến.':'Lượt này chỉ lưu trên thiết bị.';this.emit();}
 input(input:Input){if(!this.recorder)return;if(!this.current()){this.useLocal();this.message='Tài khoản đã thay đổi. Lượt này chỉ lưu trên thiết bị.';this.emit();return;}try{this.recorder.input(input);}catch{this.useLocal();this.message='Lượt này quá dài để lưu trực tuyến; tiến trình vẫn lưu trên thiết bị.';this.emit();}}
 acknowledgeTutorial(){if(this.recorder)try{this.recorder.acknowledgeTutorial();}catch{this.useLocal();}}
 complete(clear:Clear){
  if(!this.recorder||!this.ticket||!this.current())return;
  try{
   if(clear.levelId!==this.ticket.levelId)throw Error('Lượt chơi không khớp màn.');
   this.unsaved={request:normaliseRequest({protocol:1,gameId:'snake-legend',contentVersion:CONTENT,actorId:this.cap.actorId,clear:{...clear,runId:this.ticket.id}}),proof:this.recorder.proof()};
   this.recorder=undefined;this.ticket=undefined;this.message='Đang lưu kết quả trực tuyến…';this.emit();void this.retry();
  }catch{this.recorder=undefined;this.ticket=undefined;this.message='Lượt này chỉ lưu trên thiết bị.';this.emit();}
 }
 retry(){if(this.retryJob)return this.retryJob;this.retryJob=this.flush().finally(()=>{this.retryJob=undefined;});return this.retryJob;}
 private async flush(){
  try{
   this.requireCurrent();if(this.unsaved){this.outbox.enqueue(this.unsaved);this.unsaved=undefined;}
   await this.outbox.flush();this.requireCurrent();
   if(this.outbox.error)throw Error(this.outbox.error);
   const result=this.outbox.lastAck;
   const currentRevision=this.cap.currentRevision?.()??0;if(!Number.isSafeInteger(currentRevision)||currentRevision<0)throw Error('Invalid host revision');
   if(result&&result.snapshot.revision>Math.max(this.lastRevision,currentRevision)){this.applyPending=true;this.cap.onSnapshot?.(structuredClone(result.snapshot));this.lastRevision=result.snapshot.revision;}this.applyPending=false;
   this.message=this.outbox.count?'Có kết quả đang chờ lưu trực tuyến.':result?'Đã lưu kết quả trực tuyến.':this.message;
  }catch{if(!this.stopped)this.message=this.current()?(this.applyPending?'Kết quả đã lưu; chưa cập nhật được thông tin tài khoản. Hãy thử lại.':'Chưa lưu được trực tuyến. Kết quả vẫn giữ trong phiên này; hãy thử lại.'):'Tài khoản đã thay đổi. Kết quả cũ được giữ để thử lại đúng tài khoản.';}
  finally{this.emit();}
 }
 destroy(){if(this.stopped)return;this.stopped=true;this.generation++;this.startController?.abort();this.outbox.destroy();this.listeners.clear();}
}
