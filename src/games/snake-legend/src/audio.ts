import {audioAssets} from './audio-assets';
import {feedbackAudioAssets} from './audio-feedback-assets';
import type {Engine} from './core';
const AUDIO_BANK={...audioAssets,...feedbackAudioAssets};
export const MAX_SFX_VOICES=4;
export const SOUND_EVENTS={
 eat:{asset:'sfx_eat_1',cooldown:.075,priority:1,limit:2,gain:.65},gold:{asset:'sfx_eat_gold',cooldown:.12,priority:2,limit:1,gain:.7},poison:{asset:'sfx_eat_poison',cooldown:.25,priority:3,limit:1,gain:.65},damage:{asset:'sfx_hit',cooldown:.3,priority:4,limit:1,gain:.7},switch:{asset:'sfx_switch',cooldown:.2,priority:2,limit:1,gain:.7},gate:{asset:'sfx_gate_open',cooldown:.5,priority:2,limit:1,gain:.6},bossWarn:{asset:'sfx_boss_warn',cooldown:.5,priority:3,limit:1,gain:.55},bossHit:{asset:'sfx_boss_weak_hit',cooldown:.3,priority:4,limit:1,gain:.8},win:{asset:'sfx_win',cooldown:1,priority:5,limit:1,gain:.7},lose:{asset:'sfx_die',cooldown:1,priority:5,limit:1,gain:.65},secret:{asset:'sfx_gem',cooldown:.5,priority:3,limit:1,gain:.7},
 dash:{asset:'sfx_dash_air',cooldown:.45,priority:2,limit:1,gain:.6},bossWeak:{asset:'sfx_boss_weak_open',cooldown:.8,priority:3,limit:1,gain:.7},bossPhase:{asset:'sfx_boss_phase',cooldown:.8,priority:4,limit:1,gain:.65},preview:{asset:'sfx_boss_weak_open',cooldown:.5,priority:3,limit:1,gain:.55}
} as const;
export type SoundEvent=keyof typeof SOUND_EVENTS;
export class GameAudio{
 private context?:AudioContext;private master?:GainNode;private buffers=new Map<string,AudioBuffer>();private loading?:Promise<void>;private readonly requests=new AbortController();private voices:{event:SoundEvent;source:AudioBufferSourceNode;gain:GainNode;priority:number;serial:number}[]=[];private last=new Map<SoundEvent,number>();private serial=0;private disposed=false;private paused=true;private muted=false;private previewEpoch=0;private unlockEpoch=-1;
 enabled=false;volume=.45;private hostVolume=1;ready=false;error='';
 constructor(private create:()=>AudioContext=()=>{const Constructor=window.AudioContext||(window as unknown as {webkitAudioContext:typeof AudioContext}).webkitAudioContext;return new Constructor();}){}
 get activeVoices(){return this.voices.length;}
 get diagnostics(){return {state:this.context?.state??'uncreated',decodedBuffers:this.buffers.size,decodedBytes:[...this.buffers.values()].reduce((n,b)=>n+b.length*b.numberOfChannels*4,0),activeVoices:this.activeVoices};}
 setEnabled(value:boolean){this.enabled=value;if(!value){this.ready=false;this.stop();void this.context?.suspend().catch(()=>{});}}
 setVolume(value:number){this.volume=Number.isFinite(value)?Math.max(0,Math.min(1,value)):0;if(!this.volume)this.stop();this.applyVolume();}
 setHostVolume(value:number){this.hostVolume=Number.isFinite(value)?Math.max(0,Math.min(1,value)):0;if(!this.hostVolume)this.stop();this.applyVolume();}
 setMuted(value:boolean){this.muted=value;if(value)this.stop();this.applyVolume();}
 setPaused(value:boolean){this.paused=value;if(value){this.stop();void this.context?.suspend().catch(()=>{});}}
 private applyVolume(){if(this.context&&this.master)this.master.gain.setTargetAtTime(this.muted?0:this.volume*this.hostVolume,this.context.currentTime,.015);}
 private async loadAudio(c:AudioContext,id:string,source:string){
  let bytes:ArrayBuffer;
  if(source.startsWith('https:')||source.startsWith('http:')){
   const response=await fetch(source,{signal:this.requests.signal});
   if(!response.ok)throw Error('Audio download failed');
   bytes=await response.arrayBuffer();
  }else{
   bytes=Uint8Array.from(atob(source),value=>value.charCodeAt(0)).buffer;
  }
  if(this.disposed)return;
  const buffer=await c.decodeAudioData(bytes);
  if(!this.disposed)this.buffers.set(id,buffer);
 }
 async unlock(){if(this.disposed||!this.enabled||this.muted)return false;const epoch=this.previewEpoch;this.unlockEpoch=epoch;try{
  const c=this.context??=this.create();if(!this.master){this.master=c.createGain();this.master.gain.value=this.volume*this.hostVolume;this.master.connect(c.destination);}
  // Call resume synchronously inside the initiating gesture, before any decode/HTTP await.
  const resumed=c.resume();this.loading??=Promise.allSettled(Object.entries(AUDIO_BANK).filter(([id])=>!this.buffers.has(id)).map(([id,source])=>this.loadAudio(c,id,source))).then(results=>{if(results.some(r=>r.status==='rejected')){this.loading=undefined;throw Error('Audio decode failed');}});
  await Promise.all([resumed,this.loading]);if(this.disposed)return false;
  if(epoch!==this.previewEpoch||!this.enabled||this.muted){
   // A delayed resume must not wake a cancelled gesture. A newer gesture still owns its resume.
   if(this.unlockEpoch!==this.previewEpoch||!this.enabled||this.muted){this.ready=false;await c.suspend().catch(()=>{});}return false;
  }
  this.ready=c.state==='running';this.error=this.ready?'':'Trình duyệt chưa cho phát âm thanh; bấm Nghe thử, Bắt đầu hoặc Tiếp tục.';return this.ready;
 }catch{if(!this.disposed&&epoch===this.previewEpoch){this.ready=false;this.error='Chưa phát được âm thanh. Có thể thử Nghe thử lại; game vẫn chơi bình thường.';}return false;}}
 emit(event:SoundEvent){return this.play(event,false);}
 async preview(){const epoch=this.previewEpoch;const ready=await this.unlock();return ready&&epoch===this.previewEpoch?this.play('preview',true):false;}
 private play(event:SoundEvent,menuPreview:boolean){const c=this.context,def=SOUND_EVENTS[event];if(this.disposed||!this.enabled||this.paused&&!menuPreview||this.muted||this.volume*this.hostVolume<=0||!this.ready||!c||c.state!=='running')return false;const buffer=this.buffers.get(def.asset);if(!buffer)return false;const now=c.currentTime;if(now-(this.last.get(event)??-Infinity)<def.cooldown)return false;
  const same=this.voices.filter(v=>v.event===event);if(same.length>=def.limit)this.release(same[0]);if(this.voices.length>=MAX_SFX_VOICES){const steal=[...this.voices].sort((a,b)=>a.priority-b.priority||a.serial-b.serial)[0];if(steal.priority>def.priority)return false;this.release(steal);}
  const source=c.createBufferSource(),gain=c.createGain(),serial=++this.serial;source.buffer=buffer;source.loop=false;source.playbackRate.value=1+((serial%3)-1)*.012;gain.gain.value=def.gain*(serial%2?.975:1);source.connect(gain);gain.connect(this.master!);const voice={event,source,gain,priority:def.priority,serial};this.voices.push(voice);source.onended=()=>this.release(voice,false);this.last.set(event,now);try{source.start();return true;}catch{this.release(voice);return false;}
 }
 private release(v:typeof this.voices[number],stop=true){const index=this.voices.indexOf(v);if(index<0)return;this.voices.splice(index,1);v.source.onended=null;if(stop)try{v.source.stop();}catch{}v.source.disconnect();v.gain.disconnect();}
 stop(){this.previewEpoch++;for(const v of [...this.voices])this.release(v);this.last.clear();}
 destroy(){if(this.disposed)return;this.disposed=true;this.requests.abort();this.stop();this.ready=false;this.buffers.clear();this.master?.disconnect();void this.context?.close().catch(()=>{});}
}
export type AudioSnapshot={status:string;hearts:number;length:number;collected:number;flowers:number;poison:number;switchOn:boolean;goal:boolean;secret:boolean;dashing:boolean;bossState?:string;bossPhase:number;bossHits:number};
export function readAudioSnapshot(e:Engine):AudioSnapshot{return {status:e.status,hearts:e.hearts,length:e.length,collected:e.collected,flowers:e.flowers,poison:e.poisonHits,switchOn:e.switchOn,goal:e.goalReady,secret:e.secret,dashing:e.dashing,bossState:e.encounters?.state,bossPhase:e.encounters?.phase??0,bossHits:e.encounters?.totalHits??0};}
export function audioEvents(before:AudioSnapshot,after:AudioSnapshot):SoundEvent[]{
 if(before.status!==after.status)return [after.status==='won'?'win':'lose'];
 if(after.hearts<before.hearts)return ['damage'];if(after.bossHits>before.bossHits)return ['bossHit'];if(after.bossPhase>before.bossPhase)return ['bossPhase'];if(after.bossState==='weak'&&before.bossState!=='weak')return ['bossWeak'];if(after.bossState==='telegraph'&&before.bossState!=='telegraph')return ['bossWarn'];
 let pickup:SoundEvent|undefined;if(!before.secret&&after.secret)pickup='secret';else if(after.poison>before.poison)pickup='poison';else if(after.switchOn&&!before.switchOn)pickup='switch';else if(after.goal&&!before.goal)pickup='gate';else if(after.collected>before.collected||after.flowers>before.flowers)pickup=after.length-before.length>=3?'gold':'eat';
 const events:SoundEvent[]=pickup?[pickup]:[];if(after.dashing&&!before.dashing)events.push('dash');return events;
}
