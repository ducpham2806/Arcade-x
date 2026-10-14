import {parseColor,composite,readableColor,cssColor} from './contrast-core.js';
// Text only: never inspects canvas pixels, changes sprites, geometry, or game state.
export function installReadability(root=document.body){
 const selector='h1,h2,h3,h4,h5,h6,p,span,small,strong,b,em,label,legend,button,a,td,th,li,summary,option,input,textarea,select,div';
 let timer=0,active=true,observer;const managed=new Map(),cache=new Map();
 let cv;
 const color=v=>{if(cache.has(v))return cache.get(v);let c=parseColor(v);if(!c){try{cv ||=document.createElement('canvas').getContext('2d',{willReadFrequently:true});cv.clearRect(0,0,1,1);cv.fillStyle=v;cv.fillRect(0,0,1,1);const d=cv.getImageData(0,0,1,1).data;c=[d[0],d[1],d[2],d[3]/255];}catch{return null;}}cache.set(v,c);return c;};
 const gradients=v=>(v.match(/(?:rgba?|oklch|oklab|color)\([^()]*\)|#[\da-f]{3,8}\b|\btransparent\b/gi)||[]).map(color).filter(Boolean).slice(0,6);
 function backgrounds(el){let chain=[],p=el;while(p&&p instanceof HTMLElement){chain.push(p);p=p.parentElement;}let bg=[[255,255,255,1]],image=false;
  for(const item of chain.reverse()){const s=getComputedStyle(item),c=color(s.backgroundColor);if(c&&c[3]){bg=bg.map(b=>composite(c,b));if(c[3]>.98)image=false;}
   if(s.backgroundImage!=='none'){const stops=gradients(s.backgroundImage);if(stops.length)bg=stops.flatMap(stop=>bg.map(b=>composite(stop,b))).slice(0,12);else image=true;}}
  return {bg,image};
 }
 function audit(){if(!active)return;timer=0;observer?.disconnect();
  // Restore only our own overrides before resolving current CSS, including hover/tab/theme changes.
  for(const [el,prev] of managed){if(prev.appliedBg&&el.style.backgroundColor===prev.appliedBg)el.style.backgroundColor=prev.bg;if(prev.appliedImg&&el.style.backgroundImage===prev.appliedImg)el.style.backgroundImage=prev.img;el.style.removeProperty('--ax-readable-color');el.removeAttribute('data-ax-readable');}
  managed.clear();
  for(const el of root.querySelectorAll(selector)){
   if(!(el instanceof HTMLElement)||el.closest('svg,canvas,[aria-hidden=true],[data-readability=off]'))continue;
   const direct=[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());const form=el.matches('input:not([type=range]):not([type=checkbox]):not([type=radio]),textarea,select');const icon=el.matches('button,a')?el.querySelector('svg:not(.game-artwork):not(.monster-art)'):null;if(!direct&&!form&&!icon)continue;
   const s=getComputedStyle(el);if(s.display==='none'||s.visibility==='hidden'||s.opacity==='0')continue;
   if(el.closest('.animate-pulse,.animate-pulse-glow')&&!el.matches('button'))continue;
   // Transparent cells and animated gradient wordmarks are intentional visual art, not labels.
   if(s.color==='rgba(0, 0, 0, 0)'||s.color==='transparent')continue;
   const fg=color(icon&&!direct?getComputedStyle(icon).color:s.color);if(!fg||fg[3]===0)continue;const {bg,image}=backgrounds(el);const size=parseFloat(s.fontSize),weight=parseInt(s.fontWeight)||400,target=icon&&!direct||size>=24||size>=18.66&&weight>=700?3:4.5;
   const resolved=readableColor(fg,bg,target);if(!resolved.changed&&!image)continue;
   const prev={bg:el.style.backgroundColor,img:el.style.backgroundImage,appliedBg:'',appliedImg:''};managed.set(el,prev);
   // Image/texture-backed direct labels receive a small opaque text surface; no sampled-image guess.
   if(image||resolved.needsSurface){el.style.backgroundColor='#111c2d';prev.appliedBg=el.style.backgroundColor;el.style.backgroundImage='none';prev.appliedImg=el.style.backgroundImage;el.style.setProperty('--ax-readable-color','#ffffff');}
   else el.style.setProperty('--ax-readable-color',cssColor(resolved.color));
   el.setAttribute('data-ax-readable','true');
  }
  observer?.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','disabled','aria-pressed','aria-selected','aria-current','aria-disabled'],attributeOldValue:true});
 }
 function schedule(){if(active&&!timer)timer=window.setTimeout(audit,180);}
 observer=new MutationObserver(records=>{if(records.some(r=>{
 if(r.type==='attributes'&&r.attributeName==='style'){
  const visual=s=>String(s||'').split(';').filter(v=>/^(?:\s*)(?:color|background(?:-color|-image)?|font(?:-size|-weight)?):/.test(v)).join(';');
  return visual(r.oldValue)!==visual(r.target.getAttribute('style'));
 }
 if(r.type==='childList')return [...r.addedNodes].some(n=>n.textContent?.trim());
 return r.type!=='characterData';
 }))schedule();});observer.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','disabled','aria-pressed','aria-selected','aria-current','aria-disabled'],attributeOldValue:true});
 for(const type of ['pointerover','pointerout','focusin','focusout','click','change'])root.addEventListener(type,schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});document.fonts?.ready.then(schedule);schedule();
 return()=>{active=false;clearTimeout(timer);observer.disconnect();for(const type of ['pointerover','pointerout','focusin','focusout','click','change'])root.removeEventListener(type,schedule);window.removeEventListener('resize',schedule);for(const [el,p] of managed){if(p.appliedBg&&el.style.backgroundColor===p.appliedBg)el.style.backgroundColor=p.bg;if(p.appliedImg&&el.style.backgroundImage===p.appliedImg)el.style.backgroundImage=p.img;el.style.removeProperty('--ax-readable-color');el.removeAttribute('data-ax-readable');}};
}
