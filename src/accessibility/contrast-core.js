/* Shared readability math. Alpha is composited before the WCAG luminance ratio. */
export function parseColor(value) {
 if (!value || value==='transparent') return [0,0,0,0];
 if(value==='white')return [255,255,255,1];if(value==='black')return [0,0,0,1];
 const hex=value.match(/^#([a-f\d]{3,8})$/i);
 if(hex){let h=hex[1];if(h.length===3||h.length===4)h=[...h].map(c=>c+c).join('');if(h.length===6)h+='ff';if(h.length!==8)return null;return [0,2,4,6].map((n,i)=>parseInt(h.slice(n,n+2),16)/(i===3?255:1));}
 const rgb=value.match(/^rgba?\((.*)\)$/i);if(!rgb)return null;
 const parts=rgb[1].replace(/[,/]/g,' ').trim().split(/\s+/);if(parts.length<3)return null;
 return parts.map((p,i)=>p.endsWith('%')?parseFloat(p)*(i===3?.01:2.55):parseFloat(p)).slice(0,4).concat(parts.length===3?[1]:[]);
}
export function composite(f,b){const a=f[3]??1,ba=b[3]??1,out=a+ba*(1-a);return out?[...f.slice(0,3).map((v,i)=>(v*a+b[i]*ba*(1-a))/out),out]:[0,0,0,0];}
export function luminance(c){const l=c.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return .2126*l[0]+.7152*l[1]+.0722*l[2];}
export function ratio(f,b){const a=luminance(composite(f,b)),z=luminance(b);return (Math.max(a,z)+.05)/(Math.min(a,z)+.05);}
export function cssColor(c){return `rgb(${c.slice(0,3).map(Math.round).join(', ')})`;}
export function readableColor(f,backgrounds,target=4.5){
 const worst=c=>Math.min(...backgrounds.map(b=>ratio(c,b)));
 if(worst(f)>=target)return {color:f,changed:false,ratio:worst(f)};
 let best=null;
 for(const end of [[17,28,45,1],[255,255,255,1]]){
  if(worst(end)<target)continue;let lo=0,hi=1;
  for(let i=0;i<20;i++){const t=(lo+hi)/2,c=f.slice(0,3).map((v,n)=>v+(end[n]-v)*t).concat(1);if(worst(c)>=target)hi=t;else lo=t;}
  const c=f.slice(0,3).map((v,n)=>v+(end[n]-v)*hi).concat(1).map((v,i)=>i===3?v:Math.round(v));
  // Rounding must not push a pair back below the threshold.
  if(worst(c)<target)for(let i=0;i<3;i++)c[i]+=Math.sign(end[i]-c[i]);
  if(!best||hi<best.amount)best={color:c,changed:true,ratio:worst(c),amount:hi};
 }
 return best||{color:[255,255,255,1],changed:true,ratio:worst([255,255,255,1]),needsSurface:true};
}
