/** Pre-render scenery once per canvas size. Gameplay uses a single blit per frame. */
type ArenaKind = 'space' | 'city' | 'blade';
const backgrounds = new WeakMap<CanvasRenderingContext2D, {key: string; canvas: HTMLCanvasElement}>();
export function drawArenaBackdrop(ctx: CanvasRenderingContext2D, kind: ArenaKind, width: number, height: number, horizon = height * .78) {
  if (width <= 0 || height <= 0) return;
  const key=`${kind}:${width}:${height}:${horizon}`;
  let cache=backgrounds.get(ctx);
  if (!cache || cache.key!==key) {
    const canvas=document.createElement('canvas');canvas.width=Math.ceil(width);canvas.height=Math.ceil(height);
    const c=canvas.getContext('2d');if(!c)return;
    const sky=c.createLinearGradient(0,0,width,height);
    sky.addColorStop(0,kind==='blade'?'#25132e':'#0b1531');sky.addColorStop(.6,kind==='city'?'#34203e':'#152442');sky.addColorStop(1,'#080f22');
    c.fillStyle=sky;c.fillRect(0,0,width,height);
    const glow=c.createRadialGradient(width*.72,height*.25,0,width*.72,height*.25,width*.65);
    glow.addColorStop(0,kind==='blade'?'#a83d6433':'#647cff33');glow.addColorStop(.5,'#6654a51a');glow.addColorStop(1,'#080f2200');
    c.fillStyle=glow;c.fillRect(0,0,width,height);
    // Deterministic decoration never consumes the random sequence used by gameplay.
    for(let i=0;i<65;i++){const x=((i*97+31)%997)/997*width,y=((i*137+17)%991)/991*height;c.fillStyle=i%7===0?'#b8d6fb99':'#cedbff40';c.beginPath();c.arc(x,y,i%7===0?1.6:.65,0,Math.PI*2);c.fill();}
    if(kind==='space') {
      const x=width*.81,y=height*.23,r=Math.min(width*.17,100);
      c.save();c.translate(x,y);c.rotate(-.4);
      c.strokeStyle='#a0a8e72b';c.lineWidth=7;c.beginPath();c.ellipse(0,0,r*1.65,r*.35,0,0,Math.PI*2);c.stroke();
      const planet=c.createRadialGradient(-r*.35,-r*.35,2,0,0,r);planet.addColorStop(0,'#7586ab');planet.addColorStop(.55,'#3c526e');planet.addColorStop(1,'#172439');c.fillStyle=planet;c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.fill();c.restore();
      c.strokeStyle='#729fbf18';c.lineWidth=1;for(let i=0;i<4;i++){c.beginPath();c.arc(width*.25,height*.7,width*.24+i*13,Math.PI*1.15,Math.PI*1.7);c.stroke();}
    } else if(kind==='city') {
      const r=Math.min(100,width*.15),x=width*.72,y=horizon*.47;
      const sun=c.createLinearGradient(0,y-r,0,y+r);sun.addColorStop(0,'#ffae8888');sun.addColorStop(1,'#d65ba522');c.fillStyle=sun;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();
      for(let layer=0;layer<2;layer++)for(let i=0;i<Math.ceil(width/52)+1;i++){
        const x=i*52-layer*22,h=42+(i*37+layer*49)%120,top=horizon-h;
        c.fillStyle=layer?'#101f37':'#26334b';c.fillRect(x,top,40,h);
        c.fillStyle=layer?'#59d9e342':'#ce7cff25';for(let row=0;row<Math.floor(h/15);row++)for(let col=0;col<3;col++)if((row+col+i)%3!==0)c.fillRect(x+6+col*10,top+8+row*15,3,5);
        c.strokeStyle='#729edd40';c.beginPath();c.moveTo(x,top);c.lineTo(x+40,top);c.stroke();
      }
    } else {
      c.strokeStyle='#e7a2d119';c.lineWidth=2;
      for(const x of [width*.12,width*.88]){c.beginPath();c.moveTo(x,0);c.lineTo(x,height*.7);c.lineTo(width/2,height*.9);c.stroke();}
      c.strokeStyle='#e593cc16';c.beginPath();c.arc(width/2,height*.42,Math.min(width,height)*.3,0,Math.PI*2);c.stroke();
      c.fillStyle='#ff8cac35';for(let i=0;i<9;i++)c.fillRect(width*.13+i*6,height*.84,3,9+(i%3)*5);
    }
    const vignette=c.createRadialGradient(width/2,height/2,Math.min(width,height)*.2,width/2,height/2,Math.max(width,height)*.7);vignette.addColorStop(0,'#00000000');vignette.addColorStop(1,'#030815aa');c.fillStyle=vignette;c.fillRect(0,0,width,height);
    cache={key,canvas};backgrounds.set(ctx,cache);
  }
  ctx.drawImage(cache.canvas,0,0,width,height);
}

