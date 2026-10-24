import type {Input} from './core';
/** Independent pointers: joystick never captures Dash's pointer. */
export class Controls {
 keys=new Set<string>();stick={x:0,y:0};dashPointer:number|null=null;stickPointer:number|null=null;sensitivity=1;
 private abort=new AbortController();private stickEl:HTMLElement;private dashEl:HTMLElement;private knob:HTMLElement;
 constructor(stick:HTMLElement,dash:HTMLElement,knob:HTMLElement,onPause:()=>void,onToggle:()=>void){this.stickEl=stick;this.dashEl=dash;this.knob=knob;const signal=this.abort.signal;
  const update=(e:PointerEvent)=>{const r=stick.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)/(r.width*.38),y=(e.clientY-r.top-r.height/2)/(r.height*.38),m=Math.hypot(x,y),f=Math.min(m,1)/(m||1);this.stick={x:x*f*this.sensitivity,y:y*f*this.sensitivity};knob.style.transform=`translate(${x*f*30}px,${y*f*30}px)`;};
  stick.addEventListener('pointerdown',e=>{if(this.stickPointer!==null)return;e.preventDefault();this.stickPointer=e.pointerId;stick.setPointerCapture(e.pointerId);update(e);},{signal});
  stick.addEventListener('pointermove',e=>{if(e.pointerId===this.stickPointer)update(e);},{signal});
  stick.addEventListener('pointerup',e=>{if(e.pointerId===this.stickPointer){this.stickPointer=null;this.stick={x:0,y:0};knob.style.transform='';}},{signal});
  dash.addEventListener('pointerdown',e=>{if(this.dashPointer!==null)return;e.preventDefault();this.dashPointer=e.pointerId;dash.setPointerCapture(e.pointerId);dash.classList.add('held');},{signal});
  dash.addEventListener('pointerup',e=>{if(e.pointerId===this.dashPointer){this.dashPointer=null;dash.classList.remove('held');}},{signal});
  for(const el of [stick,dash]){el.addEventListener('pointercancel',()=>{this.clear();onPause();},{signal});el.addEventListener('lostpointercapture',e=>{if(e.pointerId===this.stickPointer||e.pointerId===this.dashPointer){this.clear();onPause();}},{signal});}
  window.addEventListener('keydown',e=>{if(e.target instanceof HTMLInputElement||e.target instanceof HTMLSelectElement||e.target instanceof HTMLTextAreaElement)return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD','Space','Escape'].includes(e.code)){e.preventDefault();if(e.code==='Escape'){if(!e.repeat)onToggle();return;}this.keys.add(e.code);}},{signal});
  window.addEventListener('keyup',e=>this.keys.delete(e.code),{signal});
  window.addEventListener('blur',()=>{this.clear();onPause();},{signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){this.clear();onPause();}},{signal});
 }
 read():Input{const k=this.keys,x=Number(k.has('KeyD')||k.has('ArrowRight'))-Number(k.has('KeyA')||k.has('ArrowLeft')),y=Number(k.has('KeyS')||k.has('ArrowDown'))-Number(k.has('KeyW')||k.has('ArrowUp'));return {x:x||y?x:this.stick.x,y:x||y?y:this.stick.y,steering:x||y?1:this.sensitivity,dash:k.has('Space')||this.dashPointer!==null};}
 clear(){const s=this.stickPointer,d=this.dashPointer;this.stickPointer=this.dashPointer=null;this.keys.clear();this.stick={x:0,y:0};this.knob.style.transform='';this.dashEl.classList.remove('held');for(const [el,id] of [[this.stickEl,s],[this.dashEl,d]] as const)if(id!==null&&el.hasPointerCapture(id))el.releasePointerCapture(id);}
 destroy(){this.clear();this.abort.abort();}
}
