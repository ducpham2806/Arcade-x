/** Named, finite audio events. Native web adapter for the playtest; no gameplay-owned nodes. */
import type {Seat,Shot,Ship,Phase,Team} from './engine';
export type SoundEvent='launch'|'hit'|'miss'|'sunk'|'turn'|'win'|'loss'|'place'|'ready';
export type SoundCue={event:SoundEvent;delay?:number;pan?:number};
export type SoundView={phase:Phase;turn:number;activeSeat:Seat;shots:Shot[];own:Ship[];ready:Seat[];size:number;winner:Team|null};
export class SoundTracker{
 private key='';private previous:SoundView|null=null;
 update(view:SoundView|null,key:string,seat:Seat,control:Seat,now:number,enabled:boolean,reduced=false):SoundCue[]{
  const previous=this.previous;this.previous=view;const changed=key!==this.key;this.key=key;
  if(!view||!previous||changed||!enabled)return [];
  const cues:SoundCue[]=[],shot=view.shots.at(-1),age=shot?now-shot.at:Infinity;
  if(shot&&shot.id!==previous.shots.at(-1)?.id&&age>=-500&&age<1800){
   const flight=reduced?0:720,pan=Math.max(-.65,Math.min(.65,(shot.col/(view.size-1)-.5)*1.3));
   if(age<flight)cues.push({event:'launch',pan});cues.push({event:shot.sunk?'sunk':shot.hit?'hit':'miss',delay:Math.max(0,(flight-age)/1000),pan});
  }
  if(view.phase==='finished'&&previous.phase!=='finished')cues.push({event:view.winner===(seat.startsWith('A')?0:1)?'win':'loss',delay:shot?Math.max(0,(720-age)/1000)+.25:0});
  else if(view.phase==='battle'&&view.activeSeat===control&&(previous.phase!=='battle'||previous.turn!==view.turn))cues.push({event:'turn'});
  if(view.phase==='placement'){
   if(view.own.filter(s=>s.owner===seat).length>previous.own.filter(s=>s.owner===seat).length)cues.push({event:'place'});
   if(view.ready.includes(seat)&&!previous.ready.includes(seat))cues.push({event:'ready'});
  }
  return cues;
 }
}
type Voice={source:AudioScheduledSourceNode;nodes:AudioNode[]};
export class BattleshipAudio{
 private context:AudioContext|null=null;private master:GainNode|null=null;private noise:AudioBuffer|null=null;
 private voices:Voice[]=[];private allowed=true;private disposed=false;private unavailable=false;
 constructor(private createContext:()=>AudioContext=()=>{const C=window.AudioContext||(window as any).webkitAudioContext;if(!C)throw Error('Audio unavailable');return new C();}){}
 activate(){this.disposed=false;}
 get status(){return this.unavailable?'unavailable':this.disposed?'closed':!this.allowed?'muted':this.context?.state||'locked';}
 get voiceCount(){return this.voices.length;}
 configure(allowed:boolean){this.allowed=allowed;if(!allowed){this.stop();void this.context?.suspend().catch(()=>{});}}
 async unlock(){if(!this.allowed||this.disposed||this.unavailable)return;try{
  if(!this.context){const ctx=this.createContext();this.context=ctx;this.master=ctx.createGain();this.master.gain.value=.12;this.master.connect(ctx.destination);this.noise=ctx.createBuffer(1,Math.ceil(ctx.sampleRate),ctx.sampleRate);const a=this.noise.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;}
  await this.context.resume();if(!this.allowed||this.disposed){this.stop();if(!this.disposed)await this.context.suspend();}
 }catch{this.unavailable=true;this.stop();}}
 private voice(noise:boolean,frequency:number,endFrequency:number,duration:number,volume:number,at:number,pan:number){
  const ctx=this.context!;while(this.voices.length>=8)this.remove(this.voices[0],true);
  const source=noise?ctx.createBufferSource():ctx.createOscillator(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();
  if(noise){(source as AudioBufferSourceNode).buffer=this.noise;filter.type='lowpass';filter.frequency.setValueAtTime(frequency,at);filter.frequency.exponentialRampToValueAtTime(endFrequency,at+duration);}
  else{const osc=source as OscillatorNode;osc.type='triangle';osc.frequency.setValueAtTime(frequency,at);osc.frequency.exponentialRampToValueAtTime(endFrequency,at+duration);filter.type='lowpass';filter.frequency.value=2200;}
  gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(volume,at+.012);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
  const nodes:AudioNode[]=[filter,gain];source.connect(filter);filter.connect(gain);
  if(ctx.createStereoPanner){const panner=ctx.createStereoPanner();panner.pan.value=pan;gain.connect(panner);panner.connect(this.master!);nodes.push(panner);}else gain.connect(this.master!);
  const voice={source,nodes};this.voices.push(voice);source.onended=()=>this.remove(voice,false);source.start(at);source.stop(at+duration+.02);
 }
 private remove(voice:Voice,stop:boolean){const index=this.voices.indexOf(voice);if(index<0)return;this.voices.splice(index,1);voice.source.onended=null;if(stop)try{voice.source.stop();}catch{}try{voice.source.disconnect();}catch{}for(const node of voice.nodes)try{node.disconnect();}catch{}}
 emit(cue:SoundCue){if(!this.allowed||this.disposed||this.context?.state!=='running')return;try{
  const at=this.context.currentTime+Math.min(1.2,Math.max(0,cue.delay||0)),pan=cue.pan||0;
  const noise=(f:number,to:number,d:number,v:number,offset=0)=>this.voice(true,f,to,d,v,at+offset,pan);
  const tone=(f:number,to:number,d:number,v:number,offset=0)=>this.voice(false,f,to,d,v,at+offset,pan);
  switch(cue.event){
   case 'launch':noise(2500,650,.32,.3);break;
   case 'hit':noise(1700,140,.56,.8);tone(95,34,.48,.35);break;
   case 'miss':noise(4200,1300,.5,.32);break;
   case 'sunk':noise(1900,110,.78,.85);tone(78,28,.74,.4);noise(1000,180,.48,.35,.18);break;
   case 'turn':tone(420,560,.12,.12);break;
   case 'place':noise(850,280,.1,.2);break;
   case 'ready':tone(330,440,.18,.12);break;
   case 'win':[330,440,554].forEach((f,i)=>tone(f,f,.24,.16,i*.15));break;
   case 'loss':tone(220,110,.48,.16);break;
  }
 }catch{this.stop();}}
 stop(){for(const voice of [...this.voices])this.remove(voice,true);}
 dispose(){this.disposed=true;this.stop();void this.context?.close().catch(()=>{});this.context=null;this.master=null;this.noise=null;}
}
