import {socialAction, watchSocial, type SocialMessage, type InboxEntry} from '../services/social';

export type ChatTransport = {read:()=>Promise<SocialMessage[]>;send:(text:string)=>Promise<void>;subscribe?:(receive:(messages:SocialMessage[])=>void)=>()=>void};
export type Channel = {scope:'global'|'game'|'room'|'dm'|'inbox';target:string;maxLength?:number;selfId?:string;transport?:ChatTransport};
export const channelKey=(c:Channel)=>`${c.scope}:${c.target}`;
export type FeedState={messages:SocialMessage[];draft:string;error:string;busy:boolean;loaded:boolean;unread:SocialMessage[];speech:SocialMessage|null};
const initial=():FeedState=>({messages:[],draft:'',error:'',busy:false,loaded:false,unread:[],speech:null});

/** One feed per owner/channel, shared by the panel, bubble and avatar captions. */
export class ChatStore {
 private feeds=new Map<string,{channel:Channel;state:FeedState;seen:Set<string>;baseline:number;refs:number;stop?:()=>void}>();
 private listeners=new Set<()=>void>();private version=0;private disposed=false;
 constructor(readonly owner:string){}
 subscribe=(fn:()=>void)=>{this.listeners.add(fn);return()=>{this.listeners.delete(fn);};};
 snapshot=()=>this.version;
 private emit(){if(this.disposed)return;this.version++;this.listeners.forEach(fn=>fn());}
 private feed(c:Channel){const key=channelKey(c);let f=this.feeds.get(key);if(!f){let baseline=0;try{baseline=Date.parse(localStorage.getItem(`arcadex.chat.read.v1:${this.owner}:${key}`)||'')||0;}catch{/* optional */}f={channel:c,state:initial(),seen:new Set(),baseline,refs:0};this.feeds.set(key,f);}return f;}
 state(c:Channel){return this.feed(c).state;}
 unread(){return [...this.feeds.values()].some(f=>f.state.unread.length>0);}
 draft(c:Channel,text:string){const f=this.feed(c);f.state={...f.state,draft:text};this.emit();}
 async read(c:Channel){if(c.transport)return c.transport.read();if(c.scope==='inbox'){
  const inbox=await socialAction<InboxEntry[]>(this.owner,'inbox');return inbox.filter(i=>i.sender||!this.feeds.get('dm:'+i.peer)?.state.busy).map(i=>{const known=this.feeds.get('dm:'+i.peer)?.state.messages.find(m=>m.created_at===i.created_at&&m.text===i.text);return {id:i.peer+':'+i.created_at,sender:i.sender||known?.sender||i.peer,profile:i.profile,text:i.text,created_at:i.created_at};});
 }return socialAction<SocialMessage[]>(this.owner,'read',c.target,'',c.scope);}
 receive(c:Channel,data:SocialMessage[]){if(this.disposed)return;const f=this.feed(c),first=!f.state.loaded;
  const messages=[...new Map(data.map(m=>[m.id,m])).values()].sort((a,b)=>a.created_at.localeCompare(b.created_at)||a.id.localeCompare(b.id)).slice(-100);
  if(!first&&!f.state.error&&JSON.stringify(messages)===JSON.stringify(f.state.messages))return;
  const fresh=first?[]:messages.filter(m=>!f.seen.has(m.id)&&Date.parse(m.created_at)>=f.baseline&&m.sender!==(c.selfId||this.owner));
  messages.forEach(m=>f.seen.add(m.id));if(f.seen.size>1000)f.seen=new Set([...f.seen].slice(-500));
  if(first)f.baseline=Math.max(f.baseline,...messages.map(m=>Date.parse(m.created_at)));
  f.state={...f.state,messages,loaded:true,error:'',unread:[...new Map([...f.state.unread,...fresh].map(m=>[m.id,m])).values()].slice(-100),speech:fresh.filter(m=>Date.now()-Date.parse(m.created_at)<7000).at(-1)||f.state.speech};this.emit();
 }
 markRead(c:Channel,through?:string){const f=this.feed(c);if(!f.state.unread.length)return;
  f.state={...f.state,unread:through?f.state.unread.filter(m=>m.sender!==through):[]};
  try{localStorage.setItem(`arcadex.chat.read.v1:${this.owner}:${channelKey(c)}`,f.state.messages.at(-1)?.created_at||'');}catch{/* storage is optional */}
  if(c.scope==='dm')this.markRead({scope:'inbox',target:''},c.target);this.emit();
 }
 retain(c:Channel){const f=this.feed(c);this.disposed=false;f.refs++;
  if(!f.stop){const error=(e:Error)=>{if(!this.disposed){f.state={...f.state,error:e.message};this.emit();}};
   const poll=watchSocial(()=>this.read(c),data=>this.receive(c,data),error,c.scope==='inbox'?15000:5000);
   const live=c.transport?.subscribe?.(data=>this.receive(c,data));f.stop=()=>{poll();live?.();};
  }let released=false;return()=>{if(released)return;released=true;if(--f.refs===0){f.stop?.();f.stop=undefined;}};
 }
 async send(c:Channel){const f=this.feed(c),draft=f.state.draft;if(this.disposed||f.state.busy||!draft.trim())return false;
  f.state={...f.state,busy:true,error:''};this.emit();
  try{if(c.transport)await c.transport.send(draft.trim());else await socialAction(this.owner,'send',c.target,draft,c.scope);
   if(this.disposed||this.feeds.get(channelKey(c))!==f)return false;f.state={...f.state,draft:f.state.draft===draft?'':f.state.draft};const messages=await this.read(c);if(this.disposed||this.feeds.get(channelKey(c))!==f)return false;this.receive(c,messages);return true;
  }catch(e){if(!this.disposed)f.state={...f.state,error:e instanceof Error?e.message:'Chưa gửi được. Hãy thử lại.'};return false;
  }finally{if(!this.disposed){f.state={...f.state,busy:false};this.emit();}}
 }
 forget(c:Channel){const f=this.feeds.get(channelKey(c));f?.stop?.();this.feeds.delete(channelKey(c));this.emit();}
 dispose(){this.disposed=true;this.feeds.forEach(f=>f.stop?.());this.feeds.clear();this.listeners.clear();}
}
