import {parseColor, readableColor, cssColor, luminance} from './contrast-core.js';
/** A stable contrast surface for HUD/callouts over animated game art. */
export function readableCanvasText(ctx: CanvasRenderingContext2D, label: string, x: number, y: number, maxWidth?: number) {
 const text=String(label);if(!text.trim())return;
 // Single pictograms remain artwork; letter/number labels get a backing surface.
 if(!/[\p{L}\p{N}]/u.test(text)){maxWidth===undefined?ctx.fillText(text,x,y):ctx.fillText(text,x,y,maxWidth);return;}
 ctx.save();const measure=ctx.measureText(text),size=parseFloat(ctx.font.match(/([\d.]+)px/)?.[1]||'14'),width=Math.min(measure.width,maxWidth??Infinity),pad=Math.max(2,size*.12);
 const left=ctx.textAlign==='center'?x-width/2:ctx.textAlign==='right'||ctx.textAlign==='end'?x-width:x;
 const top=ctx.textBaseline==='top'||ctx.textBaseline==='hanging'?y:ctx.textBaseline==='middle'?y-size*.5:y-size*.82;
 const fg=parseColor(typeof ctx.fillStyle==='string'?ctx.fillStyle:'#fff')||[255,255,255,1];const bg=luminance(fg)>.35?[9,20,37,1]:[250,252,255,1];
 ctx.shadowBlur=0;ctx.fillStyle=cssColor(bg);ctx.fillRect(left-pad,top-pad,width+pad*2,size+pad*2);ctx.fillStyle=cssColor(readableColor(fg,[bg],4.5).color);maxWidth===undefined?ctx.fillText(text,x,y):ctx.fillText(text,x,y,maxWidth);ctx.restore();
}
