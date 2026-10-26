import {Engine} from './core';
import {Renderer} from './render';
import {STORY_LEVELS} from './story-data';
import {assetData} from './assets';
const canvas=document.querySelector<HTMLCanvasElement>('#scene')!,renderer=new Renderer(canvas);
renderer.masterArt=true;
let engine:Engine;
const $=(s:string)=>document.querySelector<HTMLInputElement>(s)!;
function scene(){const boss=$('#level').value==='boss',fence=$('#level').value==='fence',a=structuredClone(STORY_LEVELS[boss?9:fence?2:6]),pan=Number($('#pan').value);a.start=boss?{x:27.5+pan,y:35}:fence?{x:32+pan,y:37}:{x:24+pan,y:58};renderer.zoom=Number($('#zoom').value);engine=new Engine(a);if(boss){const b=engine.encounters!;b.phase=Number($('#phase').value);b.state=$('#state').value as typeof b.state;b.shot={from:{...b.boss!.center},to:{x:33,y:40}};b.anchors=[true,false];}engine.tick=300;renderer.masterArt=$('#art').checked;renderer.debug=$('#collision').checked;$('#readout').textContent=boss?'Fixture art: chân nhện là phần hình; vòng ngọc và làn bắn do gameplay vẽ phía trên.':fence?'Fixture rào: ghép cap/rail theo collider gốc.':'Fixture cầu: cap + các mảnh deck lặp, kiểm pan/zoom trên footprint 8 × 2,2u.';}
for(const id of ['level','phase','state','art','collision','zoom','pan'])$('#'+id).addEventListener('change',scene);
$('#pan').addEventListener('input',scene);
$('#width').addEventListener('change',()=>{document.querySelector<HTMLElement>('.scene-wrap')!.style.width=$('#width').value+'px';});
scene();let raf=0;function frame(){renderer.draw(engine,1);raf=requestAnimationFrame(frame);}raf=requestAnimationFrame(frame);
const image=new Image();image.onload=()=>{for(const canvas of Array.from(document.querySelectorAll<HTMLCanvasElement>('[data-asset]'))){const a=assetData.a1_master.atlas,f=a.frames[canvas.dataset.asset as keyof typeof a.frames],r=f.frame,c=canvas.getContext('2d')!;const grey=canvas.dataset.bg==='gray';c.fillStyle=canvas.dataset.bg==='dark'?'#173c36':grey?'#aaa':'#dbe9be';c.fillRect(0,0,canvas.width,canvas.height);if(grey)c.filter='grayscale(1)';for(const [size,x] of [[24,14],[48,66],[96,148]])c.drawImage(image,r.x,r.y,r.w,r.h,x,12,size,size*r.h/r.w);}};image.src=assetData.a1_master.image;
window.addEventListener('pagehide',()=>{cancelAnimationFrame(raf);renderer.destroy();},{once:true});
