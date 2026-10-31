const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const source=fs.readFileSync(path.join(__dirname,'../../public/standalone/neon-run/game.js'),'utf8');
const els=new Map();function el(){return {hidden:false,textContent:'',value:'auto',style:{setProperty(){}},setAttribute(){},addEventListener(){},append(){},replaceChildren(){},getContext(){return new Proxy({},{get:()=>()=>{}})}}}
// Reads pixel size from PNG or WebP (VP8L / VP8 / VP8X) headers.
function imageSize(b){if(b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP'){const kind=b.toString('ascii',12,16);if(kind==='VP8L'){const v=b.readUInt32LE(21);return [(v&16383)+1,((v>>14)&16383)+1]}if(kind==='VP8X')return [b.readUIntLE(24,3)+1,b.readUIntLE(27,3)+1];return [b.readUInt16LE(26)&16383,b.readUInt16LE(28)&16383]}return [b.readUInt32BE(16),b.readUInt32BE(20)]}
class Img{set src(uri){const b=fs.readFileSync(path.join(__dirname,'../../public/standalone/neon-run',uri));[this.width,this.height]=imageSize(b);this.onload()}}
const c={__NEON_QA_NO_AUTOSTORY__:true,console,Math,JSON,Set,Map,Number,Object,Promise,Image:Img,localStorage:{getItem:()=>null,setItem(){}},document:{querySelector(s){if(!els.has(s))els.set(s,el());return els.get(s)},createElement:el,addEventListener(){}},addEventListener(){},requestAnimationFrame(){}};c.window=c;vm.createContext(c);vm.runInContext(source,c);const run=s=>vm.runInContext(s,c);
// State-aware playtest driver issues only normal input, interaction, jump and dash actions.
vm.runInContext(`
function driveRoom(){
 const room=L.rooms.find(r=>p.x>=r.x-1&&p.x<r.end),foot=p.y+p.h;
 let right=true,left=false,jump=input.jump&&p.vy<0;
 if(!room){right=true;if(p.ground)jump=L.platforms.filter(routePlatformActive).some(s=>s.x>=p.x+p.w-2&&s.x<p.x+p.w+30&&s.y<foot-4&&s.y+s.h>p.y+3);}else{
 const x=p.x-room.x,kind=room.kind,goal=routeItem(room.goal),done=routePowered(room.goal);
 if(Math.abs(p.x-goal.x)<48&&Math.abs(p.y-goal.y)<45&&!done)interact();
 if(!done&&kind==='lift'&&x<370){
  const m=L.movers.find(m=>m.id===room.id.slice(1)+'-lift');
  if(p.on===m.id){right=foot<235;jump=right;}else if(foot<300&&!p.ground){right=true;jump=true;}else{right=x<250;left=x>264;jump=false;}
 }else if(kind==='ferry'&&x<790){
  const m=L.movers.find(m=>m.id===room.id.slice(1)+'-ferry');
  if(p.on===m.id){right=m.x-room.x>600;jump=x>720;}
  else if(x>270&&!p.ground){right=p.x+12<m.x+m.w/2;left=p.x+12>m.x+m.w/2+8;jump=true;if(x>700){right=true;left=false;}}
  else {right=x<237;left=x>262;jump=false;if(m.x-room.x<310&&x>=230){jump=true;right=p.x+12<m.x+m.w/2;left=false;}}
 }else if(kind==='spring'&&x<330){right=true;jump=true;}
 else{
  if(p.ground){
   const floors=L.platforms.filter(routePlatformActive).filter(s=>Math.abs(s.y-foot)<3&&p.x+p.w>s.x&&p.x<s.x+s.w),floor=floors.sort((a,b)=>b.x+b.w-a.x-a.w)[0];
   const obstruction=L.platforms.filter(routePlatformActive).some(s=>s.x>=p.x+p.w-2&&s.x<p.x+p.w+30&&s.y<foot-4&&s.y+s.h>p.y+3);
   const continuous=floor&&L.platforms.filter(routePlatformActive).some(s=>s!==floor&&s.y===floor.y&&s.x<=floor.x+floor.w+1&&s.x+s.w>floor.x+floor.w);
   jump=!!(obstruction||(floor&&!continuous&&floor.x+floor.w-p.x-p.w<28));
  }
  if(kind==='vent'&&x>425&&x<485){const hazard=L.hazards.find(h=>h.x>room.x&&h.x<room.end);if(vent(hazard)!=='CHỜ'){right=false;jump=false;}}
  if(kind==='dash'&&!p.ground&&x>320&&x<505&&p.dashReady&&p.vy>-240)dash();
 }
 }
 if(room){const target=routeItem(room.goal);if(target.scanUntil&&!target.done){right=false;left=false;jump=false;}}
 const threat=L.enemies.find(e=>!e.dead&&e.x>p.x&&e.x-p.x<100&&Math.abs(e.y-p.y)<35);
 if(threat&&p.ground&&threat.x-p.x<75){right=false;left=false;jump=false;}
 // Reset held jump before each new jump when grounded; preserve the actual input edge.
 keys.clear();if(right)keys.add('ArrowRight');if(left)keys.add('ArrowLeft');if(jump&&!globalThis.denyJump)keys.add('Space');sync();
 if(L.type==='carry'&&!cargo){const o=L.objects.find(o=>o.kind==='cargo'&&!o.done);if(o&&Math.abs(o.x-p.x)<40)interact();}
 if(L.enemies.some(e=>!e.dead&&e.x>p.x&&e.x-p.x<110))attackBoss();
 step(1/120);
}
`,c);
setImmediate(()=>{
 const report=[];
 for(let idx=0;idx<40;idx++){if(process.env.LEVEL_INDEX&&idx!==Number(process.env.LEVEL_INDEX))continue;let trace=[];
  run(`globalThis.neonMenuOpen=false;load(${idx});art.manual='auto';`);
  let done=false;
  for(let f=0;f<120*420;f++){
   run('driveRoom()');if(process.env.LEVEL_INDEX&&f%6===0){trace.push(run('({x:p.x,y:p.y,on:p.on,ground:p.ground,vx:p.vx,vy:p.vy,m:L.movers[0]?.x,keys:[...keys]})'));if(trace.length>35)trace.shift()}
   if(run('deaths>4'))break;
   if(run('routeGoalsComplete()&&p.x>(L.boss?L.boss.arena[0]-40:L.exit-30)')){done=true;break;}
  }
  const row=run(`({id:L.id,complete:${done},x:Math.round(p.x),y:Math.round(p.y),deaths,powered:L.routeTargets.filter(routePowered).length,targets:L.routeTargets.length,seconds:Math.round(elapsed),room:L.rooms.find(r=>p.x>=r.x&&p.x<r.end)?.kind})`);report.push(row);if(!done&&process.env.LEVEL_INDEX)console.log(trace);
 }
 const ablations=[],variants=new Set();
 for(let idx=0;idx<40;idx++){
  const rooms=run(`LEVELS[${idx}].rooms`);
  for(let n=0;n<rooms.length;n++){
   const room=rooms[n],key=room.kind+'-'+room.tier;if(variants.has(key)||room.kind==='vent')continue;variants.add(key);
   run(`globalThis.neonMenuOpen=false;globalThis.denyJump=false;load(${idx});var testRoom=L.rooms[${n}];L.rooms=[testRoom];spawn(testRoom.x+35);p.y=316;cargo=L.type==='carry';L.enemies=[];L.hazards=[];L.checkpoints=[];`);
   if(room.kind==='steps')run('globalThis.denyJump=true');
   if(room.kind==='lift')run('L.movers.forEach(m=>{m.dy=0})');
   if(room.kind==='ferry')run('L.movers.forEach(m=>{m.dx=0})');
   if(room.kind==='spring')run('L.springs=[]');
   if(room.kind==='bridge')run('L.platforms=L.platforms.filter(s=>!s.enabledBy)');
   if(room.kind==='crumble')run('L.platforms=L.platforms.filter(s=>!s.crumble)');
   if(room.kind==='dash')run('L.dash=false');
   let bypass=false;
   for(let f=0;f<120*30;f++){run('driveRoom()');if(run('deaths>0'))break;if(run('p.x>testRoom.end-35')){bypass=true;break}}
   ablations.push({variant:key,level:run('L.id'),removed:room.kind,bypass});
  }
 }
 run('globalThis.denyJump=false');
 console.log(JSON.stringify({ablationCases:ablations.length,unexpectedBypasses:ablations.filter(a=>a.bypass)}));assert(!ablations.some(a=>a.bypass),'unused mechanic: route survives ablation');
 fs.writeFileSync(path.resolve('test-results/neon-route-qa-v014.json'),JSON.stringify({driver:'actual physics, normal inputs, all hazards and enemies enabled; route completion before boss arena, not manual playtest',routes:report,ablations},null,2));
 console.log(JSON.stringify({passed:report.filter(r=>r.complete).length,total:report.length,failed:report.filter(r=>!r.complete)}));
 assert(report.every(r=>r.complete),'route driver failed');
});
