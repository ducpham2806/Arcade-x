import type {Input} from './core';

const PLAY_KEYS = new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD','Space']);

/** Independent pointers keep steering and Dash usable at the same time. */
export class Controls {
 sensitivity=1;
 private keys=new Set<string>();
 private stick={x:0,y:0};
 private stickPointer:number|null=null;
 private dashPointer:number|null=null;
 private abort=new AbortController();

 constructor(
  private stickEl:HTMLElement,
  private dashEl:HTMLElement,
  private knob:HTMLElement,
  onPause:()=>void,
  onToggle:()=>void,
  active:()=>boolean,
 ){
  const {signal}=this.abort;
  const pause=()=>{this.clear();onPause();};

  stickEl.addEventListener('pointerdown',e=>{
   if(!active()||e.button!==0||this.stickPointer!==null)return;
   e.preventDefault();
   stickEl.setPointerCapture(e.pointerId);
   this.stickPointer=e.pointerId;
   this.updateStick(e);
  },{signal});
  stickEl.addEventListener('pointermove',e=>{
   if(e.pointerId===this.stickPointer)this.updateStick(e);
  },{signal});
  stickEl.addEventListener('pointerup',e=>{
   if(e.pointerId===this.stickPointer)this.resetStick();
  },{signal});

  dashEl.addEventListener('pointerdown',e=>{
   if(!active()||e.button!==0||this.dashPointer!==null)return;
   e.preventDefault();
   dashEl.setPointerCapture(e.pointerId);
   this.dashPointer=e.pointerId;
   dashEl.classList.add('held');
  },{signal});
  dashEl.addEventListener('pointerup',e=>{
   if(e.pointerId===this.dashPointer)this.resetDash();
  },{signal});

  const pauseOnLostStick=(e:PointerEvent)=>{if(e.pointerId===this.stickPointer)pause();};
  const pauseOnLostDash=(e:PointerEvent)=>{if(e.pointerId===this.dashPointer)pause();};
  for(const type of ['pointercancel','lostpointercapture'] as const){
   stickEl.addEventListener(type,pauseOnLostStick,{signal});
   dashEl.addEventListener(type,pauseOnLostDash,{signal});
  }

  window.addEventListener('keydown',e=>{
   if(e.target instanceof HTMLInputElement||e.target instanceof HTMLSelectElement||e.target instanceof HTMLTextAreaElement)return;
   if(e.code==='Escape'){
    e.preventDefault();
    if(!e.repeat)onToggle();
    return;
   }
   if(!PLAY_KEYS.has(e.code)||!active()||e.target instanceof Element&&e.target.closest('button,a,[role="dialog"]'))return;
   e.preventDefault();
   this.keys.add(e.code);
  },{signal});
  window.addEventListener('keyup',e=>this.keys.delete(e.code),{signal});
  window.addEventListener('blur',pause,{signal});
  window.addEventListener('pagehide',pause,{signal});
  window.addEventListener('orientationchange',pause,{signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();},{signal});
 }

 private updateStick(e:PointerEvent){
  const {stickEl,knob}=this;
  const rect=stickEl.getBoundingClientRect();
  const x=(e.clientX-rect.left-rect.width/2)/(rect.width*.38);
  const y=(e.clientY-rect.top-rect.height/2)/(rect.height*.38);
  const scale=1/Math.max(1,Math.hypot(x,y));
  this.stick={x:x*scale*this.sensitivity,y:y*scale*this.sensitivity};
  const travelX=(stickEl.clientWidth-knob.offsetWidth)/2;
  const travelY=(stickEl.clientHeight-knob.offsetHeight)/2;
  knob.style.transform=`translate(${x*scale*travelX}px,${y*scale*travelY}px)`;
 }

 private resetStick(){
  this.stickPointer=null;
  this.stick={x:0,y:0};
  this.knob.style.transform='';
 }

 private resetDash(){
  this.dashPointer=null;
  this.dashEl.classList.remove('held');
 }

 read():Input{
  const k=this.keys;
  const x=Number(k.has('KeyD')||k.has('ArrowRight'))-Number(k.has('KeyA')||k.has('ArrowLeft'));
  const y=Number(k.has('KeyS')||k.has('ArrowDown'))-Number(k.has('KeyW')||k.has('ArrowUp'));
  const keyboard=x!==0||y!==0;
  return {x:keyboard?x:this.stick.x,y:keyboard?y:this.stick.y,steering:keyboard?1:this.sensitivity,dash:k.has('Space')||this.dashPointer!==null};
 }

 clear(){
  const stickPointer=this.stickPointer,dashPointer=this.dashPointer;
  this.keys.clear();
  this.resetStick();
  this.resetDash();
  for(const [el,id] of [[this.stickEl,stickPointer],[this.dashEl,dashPointer]] as const){
   if(id!==null&&el.hasPointerCapture(id))el.releasePointerCapture(id);
  }
 }

 destroy(){this.clear();this.abort.abort();}
}
