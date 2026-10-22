/* Chronicles of the Shattered Realms — fixed-step game simulation, no DOM dependency. */
(function(root){
'use strict';
const W=480,H=720,LEFT=24,RIGHT=456,TOP=112,PY=642,CW=48,RH=27;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
// Segment vs expanded AABB. Returns first contact and its normal (continuous collision).
function sweep(x,y,dx,dy,r,b){
 const ax=b.x-r,bx=b.x+b.w+r,ay=b.y-r,by=b.y+b.h+r;
 let lo=-Infinity,hi=Infinity,nx=0,ny=0;
 for(const [p,d,a,z,xx,yy] of [[x,dx,ax,bx,1,0],[y,dy,ay,by,0,1]]){
  if(Math.abs(d)<1e-9){if(p<a||p>z)return null;continue}
  let t1=(a-p)/d,t2=(z-p)/d,n=-Math.sign(d);if(t1>t2)[t1,t2]=[t2,t1];
  if(t1>lo){lo=t1;nx=xx*n;ny=yy*n}hi=Math.min(hi,t2);
 }
 if(lo>hi||hi<0||lo>1||lo<-.0001)return null;
 return {t:Math.max(0,lo),nx,ny};
}
const boostNames={big_paddle:'Thanh chắn rộng',multi_ball:'Ba quả cầu',mega_ball:'Mega Ball',fire_ball:'Cầu lửa',laser:'Laser',slow_ball:'Bóng chậm',magnet:'Nam châm',shield:'Khiên cứu bóng',extra_life:'+1 mạng',bomb_ball:'Cầu bom',chain_lightning:'Sét dây chuyền',gold_rush:'Xu vàng',score_x2:'Điểm ×2',time_freeze:'Đóng băng thời gian',small_paddle:'Thanh chắn hẹp',fast_ball:'Bóng nhanh',reverse:'Đảo điều khiển',heavy_paddle:'Thanh chắn nặng',blind:'Màn sương',shrink_ball:'Bóng nhỏ'};
const durations={big_paddle:15,mega_ball:8,fire_ball:8,laser:10,slow_ball:12,magnet:15,bomb_ball:8,chain_lightning:10,gold_rush:10,score_x2:15,time_freeze:8,small_paddle:12,fast_ball:12,reverse:8,heavy_paddle:8,blind:8,shrink_ball:10};
function attackZones(id,x,left=24,right=456,paddleWidth=90){const zone=(center,w)=>({x:clamp(center-w/2,left,right-w),w});if(id==='flame_columns'){const offset=Math.max(Math.abs(W/2-x),(paddleWidth+80)/2);return [zone(W/2-offset,48),zone(W/2+offset,48)];}if(id==='eye_beam')return [zone(x,44)];if(id==='root_zone')return [zone(x,130)];if(id==='freeze_paddle')return [zone(x,76)];if(id==='scan_beam')return [zone(x,56)];if(id==='sand_bullets')return [-44,0,44].map(dx=>zone(x+dx,20));if(id==='shatter_field')return [80,240,400].map(cx=>zone(cx,24));if(id==='fruit_drop')return [zone(x,20)];return [];}
function isObjective(b){return !['X','M','P'].includes(b.t);}
function arenaWalls(arena){const width=arena.width||432,l=(W-width)/2,r=W-l,cw=width/(arena.cols||9),w=[];const add=(side,y,h,steps)=>w.push({x:side==='left'?l:r-steps*cw,y,w:steps*cw,h});
 if(arena.shape==='chamfer'){for(const side of ['left','right']){add(side,92,54,1.3);add(side,146,46,.65);}}
 if(arena.shape==='stepped'){add('left',92,92,1);add('right',190,100,.9);}
 if(arena.shape==='waist'){for(const side of ['left','right'])add(side,225,72,.85);}
 if(arena.shape==='reactor'){add('left',92,70,.8);add('right',92,70,.8);add('left',295,54,.7);add('right',295,54,.7);}
 if(arena.shape==='hangar'){add('left',92,100,1.4);add('right',92,100,1.4);add('left',192,40,.6);add('right',192,40,.6);}
 return w;}
const SUPPORT_CONFIG={wide:{multiplier:1.15,duration:20},shield:{rescues:1},energy:{charge:3}};
class Game{
 constructor(data,index,opts={}){
  this.data=data;this.level=JSON.parse(JSON.stringify(data.levels[index]));this.index=index;this.seed=opts.seed||((Date.now()^index)>>>0);this.random=rng(this.seed);this.events=[];this.log=[];this.opts=opts;this.practice=!!opts.practice;this.time=0;this.score=0;this.coins=0;this.lives=this.level.lives;this.lost=0;this.combo=0;this.maxCombo=0;this.catchStreak=0;this.perfects=0;this.energy=0;this.drive=0;this.overdrive=0;this.effects={};this.shield=0;this.pity=0;this.px=W/2;this.target=W/2;this.pw=90*this.level.paddle_scale;this.speed=this.level.ball_speed*32;this.balls=[];this.bricks=[];this.drops=[];this.shots=[];this.hazards=[];this.lasers=[];this.laserCd=0;this.done=false;this.key=false;this.invulnerable=0;this.frozen=0;this.stunned=0;this.slippery=0;
  const arena=this.level.arena||{};this.cols=this.level.grid.cols||9;this.left=(W-(arena.width||432))/2;this.right=W-this.left;this.cw=(this.right-this.left)/this.cols;this.rh=arena.cell_height||27;this.gridTop=arena.grid_top||112;this.arena={...arena,cols:this.cols,width:this.right-this.left};this.walls=arenaWalls(this.arena);this.initialObjectives=this.level.bricks_to_clear||0;this.lastProgress=0;this.cleanupActive=false;this.dropCount=0;this.lastDrop=-Infinity;
  this.level.grid.data.forEach((row,r)=>[...row].forEach((t,c)=>{if(t!=='.')this.bricks.push(this.brick(t,r,c))}));
  this.blockers=(this.level.blockers||[]).map((b,i)=>({...b,x:this.left+b.x*this.cw,y:this.gridTop+b.y*this.rh,w:b.type==='steel_wall'?70:b.type==='drone'?72:34,h:b.type==='steel_wall'?16:b.type==='drone'?18:34,baseX:this.left+b.x*this.cw,cd:3+i,life:Infinity}));
  if(this.level.boss){this.boss={...this.level.boss,x:175,y:235,w:130,h:110,max:this.level.boss.hp,phase:1,cd:4,telegraph:null,hurt:0,guard:8,attackCount:0,weak:0};}
  if(this.boss)this.boss.initialShield=this.bricks.filter(b=>b.r<4&&isObjective(b)).length;
  this.mastery=this.level.mastery?{...this.level.mastery,progress:0,completed:false,failed:false}:null;this.firstVolleyClosed=false;this.volleyCount=0;this.volleySeen=new Set();this.maxReaction=0;this.launches=0;this.damageContext=null;this.sideCache=this.level.side_route?{...this.level.side_route.cache,opened:false,warning:0,spawned:false}:null;this.support=SUPPORT_CONFIG[opts.support]?{type:opts.support,remaining:opts.support==='wide'?20:0,shieldAvailable:opts.support==='shield',started:false}:null;
  this.newBall();if(this.support?.type==='energy')this.energy=3;if(this.support?.type==='wide')this.pw*=1.15;this.emit('start',{name:this.level.name});
 }
 brick(t,r,c){return {t,r,c,x:this.left+c*this.cw+3,y:this.gridTop+r*this.rh+2,baseX:this.left+c*this.cw+3,w:this.cw-6,h:this.rh-5,hp:this.data.hp[t]||999,max:this.data.hp[t]||999,alive:true,revive:0,revivesLeft:this.level.design?.regen_limit??1,bombAt:t==='B'?8:0}}
 emit(type,obj={}){this.events.push({type,...obj});if(this.events.length>400)this.events.shift()}
 setTarget(x,record=true){this.target=clamp(x,this.left+this.pw/2,this.right-this.pw/2);if(record)this.log.push([Math.round(this.time*120),'move',Math.round(x*10)/10]);}
 newBall(){this.balls=[{x:this.px,y:PY-15,vx:0,vy:0,stuck:true,portalCd:0,trail:[],last:null}];this.effects={};this.speed=this.level.ball_speed*32;this.shield=this.support?.shieldAvailable?1:0;this.invulnerable=1;}
 launch(){if(this.done)return;if(this.balls.some(b=>b.stuck)){this.launches++;if(this.support&&!this.support.started){this.support.started=true;this.emit('support-used',{support:this.support.type});}}for(const b of this.balls)if(b.stuck){const a=(this.random()-.5)*.6;b.stuck=false;b.vx=Math.sin(a)*this.speed;b.vy=-Math.cos(a)*this.speed;}this.log.push([Math.round(this.time*120),'launch']);}
 skill(type='slow'){if(this.done||this.energy<5)return false;this.energy=0;this.log.push([Math.round(this.time*120),'skill',type]);if(type==='beam'){for(const b of this.bricks)if(b.alive&&Math.abs(b.x+b.w/2-this.px)<32){if(b.t!=='X')this.destroy(b,'beam')}if(this.boss&&Math.abs(this.boss.x+65-this.px)<85){this.boss.hp-=8;this.boss.hurt=.2;this.emit('bosshit',{x:this.boss.x+65,y:this.boss.y+55});}this.emit('beam',{x:this.px,y:PY});}else if(type==='shield'){this.effects.skill_shield=12;}else this.effects.skill_slow=6;this.emit('skill',{skill:type});return true;}
 lose(reason){if(this.done||this.invulnerable>0)return;this.firstVolleyClosed=true;this.checkMastery();this.lives--;this.lost++;this.combo=0;this.catchStreak=0;this.drive=0;this.overdrive=0;this.shots=[];this.hazards=[];this.emit('life',{reason});if(this.lives<=0)this.finish(false);else this.newBall();}
 apply(type){
  if(type==='extra_life')this.lives=Math.min(5,this.lives+1);
  else if(type==='shield')this.shield=1;
  else if(type==='multi_ball'){const src=this.balls.filter(b=>!b.stuck);if(!src.length)this.launch();for(const b of (src.length?src:this.balls).slice(0,3))for(const a of [-.45,.45])if(this.balls.length<9)this.balls.push({...b,stuck:false,vx:b.vx*Math.cos(a)-b.vy*Math.sin(a),vy:b.vx*Math.sin(a)+b.vy*Math.cos(a),trail:[],last:null});}
  else{if(type==='big_paddle')delete this.effects.small_paddle;if(type==='small_paddle')delete this.effects.big_paddle;this.effects[type]=(this.effects[type]||0)+(durations[type]||8);if(this.effects.mega_ball&&this.effects.fire_ball){delete this.effects.mega_ball;delete this.effects.fire_ball;this.effects.meteor=6;}}
  this.emit('booster',{name:boostNames[type],booster:type});
 }
 weighted(pool){let sum=Object.values(pool).reduce((a,b)=>a+b,0),r=this.random()*sum;for(const [k,v] of Object.entries(pool)){r-=v;if(r<=0)return k}return Object.keys(pool)[0]||'big_paddle';}
 drop(b){const pool=this.level.booster_pool;if(this.dropCount>=(pool.drop_budget??Infinity)||this.drops.length>=2||this.time-this.lastDrop<(pool.drop_cooldown_sec??0)){this.pity++;return;}const rate=b.t==='K'?1:pool.drop_rate[b.t==='s'?'steel':b.t==='h'?'hard':'normal'];if(this.random()<rate||this.pity>=pool.pity_after){this.pity=0;this.dropCount++;this.lastDrop=this.time;const bad=Object.keys(pool.bad||{}).length&&this.random()<(pool.bad_chance??.16);this.drops.push({x:b.x+b.w/2,y:b.y,type:this.weighted(bad?pool.bad:pool.good),bad:!!bad});}else this.pity++;}
 destroy(b,cause){
  if(!b.alive||b.t==='X'||b.t==='M'&&cause!=='beam'||b.t==='L'&&!this.key)return;
  if(this.damageContext?.source==='ball'){const key=b.r+','+b.c;if(!this.firstVolleyClosed&&this.launches===1&&!this.volleySeen.has(key)){this.volleySeen.add(key);this.volleyCount++;}this.damageContext.seen.add(key);this.maxReaction=Math.max(this.maxReaction,this.damageContext.seen.size);}
  b.alive=false;b.hp=0;this.lastProgress=this.time;if(b.t==='R'&&b.revivesLeft>0){b.revive=this.time+6;b.revivesLeft--;}this.combo++;this.maxCombo=Math.max(this.maxCombo,this.combo);this.checkMastery();const mult=Math.min(8,1+Math.floor(this.combo/4))*(this.overdrive>0?2:1)*(this.effects.score_x2?2:1);this.score+=(this.data.points[b.t]||10)*mult;if(this.effects.gold_rush)this.coins+=2;
  this.drive=Math.min(12,this.drive+1);if(this.drive===12&&this.overdrive<=0){this.overdrive=5;this.drive=0;this.emit('overdrive');}
  this.emit('break',{x:b.x+b.w/2,y:b.y+b.h/2,t:b.t,mult});this.drop(b);
  if(b.t==='Y'){this.key=true;this.emit('message',{text:'Đã mở khoá gạch!'});}
  if(b.t==='I')this.slippery=1;
  if(b.t==='T'||this.effects.bomb_ball&&cause==='ball'){this.emit('explosion',{x:b.x+b.w/2,y:b.y});for(const q of this.bricks)if(q!==b&&Math.abs(q.r-b.r)<=1&&Math.abs(q.c-b.c)<=1)this.destroy(q,'chain');}
  if(b.t==='F')for(const q of this.bricks)if(Math.abs(q.r-b.r)+Math.abs(q.c-b.c)===1)this.destroy(q,'fire');
  if(b.t==='C'){const chain=(this.level.chains||[]).find(g=>g.cells.some(([r,c])=>r===b.r&&c===b.c));if(chain)for(const q of this.bricks)if(chain.cells.some(([r,c])=>r===q.r&&c===q.c))this.destroy(q,'chain');}
  if(b.t==='E'||this.effects.chain_lightning&&cause==='ball'){const group=(this.level.electric_groups||[]).find(g=>g.some(([r,c])=>r===b.r&&c===b.c));const nearby=this.bricks.filter(q=>q.alive&&q!==b&&(group?group.some(([r,c])=>r===q.r&&c===q.c):q.t==='E'&&Math.abs(q.r-b.r)+Math.abs(q.c-b.c)===1));for(const q of nearby.slice(0,5))this.destroy(q,'electric');this.emit('lightning',{x:b.x,y:b.y});}
  if(b.t==='U'){const bpm=this.level.rhythm?.bpm||100;const beat=(this.time*bpm/60)%1;if(beat<.15||beat>.85){this.score+=50;this.emit('message',{text:'ĐÚNG NHỊP +50'});}}
 }
 hit(b,ball,source='ball'){if(b.t==='X'||b.t==='M'||b.t==='L'&&!this.key)return;const previous=this.damageContext;this.damageContext={source,seen:new Set()};try{if(this.effects.meteor||this.effects.mega_ball||this.overdrive>0&&['n','h','p','g'].includes(b.t))b.hp=0;else b.hp-=this.effects.fire_ball?2:1;this.lastProgress=this.time;if(b.hp<=0)this.destroy(b,source);else this.emit('spark',{x:ball.x,y:ball.y});}finally{this.damageContext=previous;}}
 portal(b,ball){if(ball.portalCd>0)return false;const pair=(this.level.portals||[]).find(p=>[p.a,p.b].some(([r,c])=>r===b.r&&c===b.c));let dest;if(pair){const [r,c]=pair.a[0]===b.r&&pair.a[1]===b.c?pair.b:pair.a;dest=this.bricks.find(k=>k.r===r&&k.c===c&&k.alive);}else dest=this.bricks.find(k=>k.t==='P'&&k!==b&&k.alive);if(!dest)return false;ball.x=dest.x+dest.w/2;ball.y=dest.y+dest.h+8;ball.vy=Math.abs(ball.vy);ball.portalCd=.65;this.emit('portal',{x:ball.x,y:ball.y});return true;}
 bounce(ball,dt){
  let remaining=dt;const radius=this.effects.shrink_ball?3.5:6;
  for(let iter=0;iter<8&&remaining>1e-7;iter++){
   const dx=ball.vx*remaining,dy=ball.vy*remaining;let contact=null;
   const consider=(b,kind,obj)=>{const c=sweep(ball.x,ball.y,dx,dy,radius,b);if(c&&(!contact||c.t<contact.t))contact={...c,kind,obj,b};};
   consider({x:this.left-20,y:0,w:20,h:H},'wall');consider({x:this.right,y:0,w:20,h:H},'wall');consider({x:this.left,y:84,w:this.right-this.left,h:8},'wall');
   if(ball.vy>0)consider({x:this.px-this.pw/2,y:PY,w:this.pw,h:16},'paddle');
   for(const wall of this.walls)consider(wall,'wall');
   for(const b of this.bricks)if(b.alive&&b!==ball.last)consider(b,'brick',b);
   if(this.sideCache&&!this.sideCache.opened)consider(this.sideCache,'salvage',this.sideCache);
   for(const b of this.blockers)if(['bumper','steel_wall','asteroid','drone','worm','salvage_drone'].includes(b.type))consider(b,'blocker',b);
   if(this.boss&&this.boss.hp>0)consider(this.boss,'boss',this.boss);
   if(!contact){ball.x+=dx;ball.y+=dy;ball.last=null;break;}
   ball.x+=dx*contact.t;ball.y+=dy*contact.t;remaining*=1-contact.t;
   const {nx,ny,kind,obj}=contact;let reflect=true;
   if(kind==='paddle'){
    const offset=clamp((ball.x-this.px)/(this.pw/2),-1,1),angle=offset*1.12,sp=Math.hypot(ball.vx,ball.vy);ball.vx=Math.sin(angle)*sp;ball.vy=-Math.cos(angle)*sp;ball.y=PY-radius-.1;reflect=false;this.combo=0;this.firstVolleyClosed=true;
    if(Math.abs(offset)<.2){this.catchStreak++;this.perfects++;this.energy=Math.min(5,this.energy+1);this.score+=50*Math.min(3,this.catchStreak);this.emit('perfect',{x:this.px,y:PY});if(this.cleanupActive){const target=this.cleanupTarget();if(target){const a=clamp(Math.atan2(target.x+target.w/2-ball.x,PY-target.y-target.h/2),-.95,.95);ball.vx=Math.sin(a)*sp;ball.vy=-Math.cos(a)*sp;this.emit('cleanup-aim',{x:target.x+target.w/2,y:target.y+target.h/2});}}}else this.catchStreak=0;this.checkMastery();
    if(this.effects.magnet){ball.stuck=true;ball.vx=ball.vy=0;return;}
   }else if(kind==='salvage'){this.openSideRoute();
   }else if(kind==='brick'){
    if(obj.t==='P'&&this.portal(obj,ball))return;
    const pierce=(this.effects.mega_ball||this.effects.meteor||this.overdrive>0&&['n','h','g','p'].includes(obj.t))&&obj.t!=='X'&&obj.t!=='M'&&!(obj.t==='L'&&!this.key);
    this.hit(obj,ball);if(pierce){reflect=false;ball.last=obj;ball.x+=Math.sign(ball.vx)*.3;ball.y+=Math.sign(ball.vy)*.3;}
   }else if(kind==='boss'){
    const guarded=this.bossGuarded();
    if(!guarded&&this.boss.hurt<=0){obj.hp-=this.effects.meteor||this.overdrive>0?3:1;this.lastProgress=this.time;obj.hurt=.12;this.score+=25;this.emit('bosshit',{x:ball.x,y:ball.y});}
    else this.emit('spark',{x:ball.x,y:ball.y});
   }else if(kind==='blocker'&&obj.type==='drone'&&obj.life<Infinity){obj.life--;if(obj.life<=0)this.blockers.splice(this.blockers.indexOf(obj),1);}
   if(reflect){if(nx)ball.vx=-ball.vx;if(ny)ball.vy=-ball.vy;if(kind==='wall'&&this.time-this.lastProgress>8&&this.time-(this.lastNudge||0)>3.5){const speed=Math.hypot(ball.vx,ball.vy),a=clamp(Math.atan2(Math.abs(ball.vx),Math.abs(ball.vy))+.16,.28,1.16);ball.vx=Math.sign(W/2-ball.x||1)*Math.sin(a)*speed;ball.vy=Math.sign(ball.vy||1)*Math.cos(a)*speed;this.lastNudge=this.time;this.emit('angle-correct');}ball.x+=nx*.1;ball.y+=ny*.1;ball.last=null;this.emit('spark',{x:ball.x,y:ball.y});}
   if(this.done)return;
  }
  // Conservative depenetration closes corner-contact escapes without teleporting a lost ball.
  for(let pass=0;pass<2;pass++)for(const wall of this.walls){if(ball.x>wall.x-radius&&ball.x<wall.x+wall.w+radius&&ball.y>wall.y-radius&&ball.y<wall.y+wall.h+radius){const faces=[{d:ball.x-(wall.x-radius),axis:'x',value:wall.x-radius-.02,sign:-1},{d:wall.x+wall.w+radius-ball.x,axis:'x',value:wall.x+wall.w+radius+.02,sign:1},{d:ball.y-(wall.y-radius),axis:'y',value:wall.y-radius-.02,sign:-1},{d:wall.y+wall.h+radius-ball.y,axis:'y',value:wall.y+wall.h+radius+.02,sign:1}].sort((a,b)=>a.d-b.d),f=faces[0];ball[f.axis]=f.value;ball[f.axis==='x'?'vx':'vy']=Math.abs(ball[f.axis==='x'?'vx':'vy'])*f.sign;}}
  if(ball.x<this.left+radius){ball.x=this.left+radius+.02;ball.vx=Math.abs(ball.vx);}if(ball.x>this.right-radius){ball.x=this.right-radius-.02;ball.vx=-Math.abs(ball.vx);}if(ball.y<98){ball.y=98.02;ball.vy=Math.abs(ball.vy);}
  if(ball.y>PY+28&&(this.shield||this.effects.skill_shield)){if(!this.effects.skill_shield){this.shield=0;if(this.support?.shieldAvailable)this.support.shieldAvailable=false;}ball.y=PY+25;ball.vy=-Math.abs(ball.vy);this.emit('shield',{x:ball.x,y:PY+27});}
 }
 bossAttack(id){
  const b=this.boss;if(!b)return;const visualStart={shots:this.shots.length,hazards:this.hazards.length,blockers:this.blockers.length,bricks:this.bricks.length};b.visualAttack={id,at:this.time,x:b.telegraph?.x??this.px};b.attackCount++;this.emit('bossattack',{attack:id});const shot=(x,effect)=>this.shots.push({x,y:b.y+b.h,vx:0,vy:155,effect,r:8});
  switch(id){
   case 'fruit_drop':shot(b.telegraph.x,'stun');break;
   case 'root_zone':this.hazards.push({x:b.telegraph.x-65,w:130,t:2.5,type:'root'});break;
   case 'summon_worms':for(let k=0;k<2;k++)this.blockers.push({type:'worm',x:80+k*250,baseX:80+k*250,y:430+k*32,w:48,h:20,life:15,cd:0});break;
   case 'orbit_shields':b.guard=3.5;this.emit('message',{text:'Khiên xoay — chờ khe hở!'});break;
   case 'sand_bullets':for(let k=-1;k<=1;k++)shot(clamp(b.telegraph.x+k*44,this.left+16,this.right-16),'slow');break;
   case 'eye_beam':this.hazards.push({x:b.telegraph.x-22,w:44,t:1.4,type:'lethal'});break;
   case 'ice_bricks':case 'lava_regen':if((b.summonWaves||0)>=2)break;b.summonWaves=(b.summonWaves||0)+1;for(let c=Math.floor(this.cols/2)-2;c<=Math.floor(this.cols/2)+2;c++){const q=this.bricks.find(q=>q.r===9&&q.c===c);if(!q||!q.alive){const n=this.brick(id==='ice_bricks'?'I':'R',9,c);this.bricks.push(n);}}break;
   case 'freeze_paddle':if(Math.abs(this.px-b.telegraph.x)<38)this.frozen=.65;break;
   case 'blizzard':this.effects.blind=2.5;this.blockers.push({type:'steel_wall',x:120,baseX:120,y:400,w:90,h:12,life:6,cd:0});break;
   case 'flame_columns':for(const z of b.telegraph.zones||attackZones('flame_columns',b.telegraph.x,this.left,this.right,this.pw))this.hazards.push({...z,t:1.7,type:'lethal'});break;
   case 'swallow_ball':for(const ball of this.balls)if(!ball.stuck){ball.x=b.x+65;ball.y=b.y+b.h+9;const a=(this.random()-.5)*1.7;ball.vx=Math.sin(a)*this.speed;ball.vy=Math.cos(a)*this.speed;}break;
   case 'scan_beam':this.hazards.push({x:b.telegraph.x-28,w:56,t:1.8,type:'reverse'});break;
   case 'open_portals':for(const c of [0,this.cols-1])if(!this.bricks.some(q=>q.alive&&q.r===7&&q.c===c))this.bricks.push(this.brick('P',7,c));break;
   case 'spawn_drones':for(let k=0;k<2;k++)this.blockers.push({type:'drone',x:80+k*220,baseX:80+k*220,y:410+k*45,w:72,h:18,life:6,cd:0});break;
   case 'combo_cycle':this.bossAttack(['fruit_drop','sand_bullets','ice_bricks','flame_columns','scan_beam'][Math.floor(b.attackCount/2)%5]);break;
   case 'split_clones':b.clones=6;break;
   case 'shatter_field':this.effects.gravity=6;for(const x of [80,240,400])shot(x,'lethal');break;
  }
  for(const [key,start]of Object.entries(visualStart))for(const item of this[key].slice(start)){item.attack??=id;item.born??=this.time;}
 }
 update(dt){
  if(this.done)return;this.time+=dt;if(this.support?.started&&this.support.type==='wide')this.support.remaining=Math.max(0,this.support.remaining-dt);this.tickSideRoute(dt);this.invulnerable=Math.max(0,this.invulnerable-dt);this.frozen=Math.max(0,this.frozen-dt);this.stunned=Math.max(0,this.stunned-dt);this.slippery=Math.max(0,this.slippery-dt);this.overdrive=Math.max(0,this.overdrive-dt);
  for(const k of Object.keys(this.effects)){this.effects[k]-=dt;if(this.effects[k]<=0)delete this.effects[k];}
  const e=this.effects,ts=e.skill_slow?.6:1;this.pw=90*this.level.paddle_scale*(e.big_paddle?1.5:e.small_paddle?.6:1)*(this.support?.type==='wide'&&this.support.remaining>0?1.15:1);let target=e.reverse?W-this.target:this.target;target=clamp(target,this.left+this.pw/2,this.right-this.pw/2);
  const root=this.hazards.some(h=>h.type==='root'&&this.px>h.x&&this.px<h.x+h.w);if(this.stunned<=0&&this.frozen<=0){const max=dt*850*(e.heavy_paddle?.45:root?.6:1);this.px+=clamp((target-this.px)*(this.slippery?dt*4:1),-max,max);this.px=clamp(this.px,this.left+this.pw/2,this.right-this.pw/2);}
  for(const b of this.bricks){if(b.t==='V'){const m=(this.level.moving||[]).find(m=>m.cell[0]===b.r&&m.cell[1]===b.c);b.x=clamp(b.baseX+Math.sin(this.time*(m?.speed||1.2))*(m?.range||1)*this.cw,this.left,this.right-b.w);}if(!b.alive&&b.revive&&b.revive<this.time&&this.bricks.some(q=>q.alive&&isObjective(q))){b.alive=true;b.hp=b.max;b.revive=0;this.emit('portal',{x:b.x,y:b.y});}if(b.alive&&b.bombAt&&this.time>=b.bombAt){b.bombAt=0;this.destroy(b,'timer');this.lose('Bom hẹn giờ');}}
  for(const b of this.blockers){b.life-=dt;if(b.type==='salvage_drone')b.x=b.baseX+Math.sin(this.time*1.7)*(b.range||0);if(['asteroid','drone','worm'].includes(b.type))b.x=clamp(b.baseX+Math.sin(this.time*(b.type==='worm'?2:1.3))*70,this.left,this.right-b.w);if(b.type==='turret'){b.cd-=dt*(e.time_freeze?0:ts);if(b.cd<=0){b.cd=4;this.shots.push({x:b.x+17,y:b.y+25,vx:0,vy:170,r:6,effect:'stun'});}}}
  this.blockers=this.blockers.filter(b=>b.life>0);
  for(const ball of this.balls.slice()){
   if(ball.stuck){ball.x=this.px;ball.y=PY-9;continue;}ball.portalCd=Math.max(0,(ball.portalCd||0)-dt);
   ball.trail.push({x:ball.x,y:ball.y});if(ball.trail.length>16)ball.trail.shift();let sp=Math.min(460,this.speed*(1+Math.min(.25,this.time*.0015)))*(e.slow_ball?.7:1)*(e.fast_ball?1.4:1);const len=Math.hypot(ball.vx,ball.vy)||1;ball.vx*=sp/len;ball.vy*=sp/len;
   for(const b of this.blockers){const dx=b.x+17-ball.x,dy=b.y+17-ball.y,d=Math.hypot(dx,dy);if(b.type==='black_hole'&&d<110){ball.vx+=dx*dt*3;ball.vy+=dy*dt*3;if(d<13){ball.y=H+30;this.emit('portal',{x:b.x,y:b.y});}}if(b.type==='wind'&&Math.abs(dy)<70)ball.vx+=dt*80;if(b.type==='gravity'&&Math.abs(dy)<80)ball.vy+=dt*100;}
   if(e.gravity)ball.vx+=Math.sin(this.time*2)*dt*180;
   if(Math.abs(ball.vy)<sp*.24){ball.vy=Math.sign(ball.vy||-1)*sp*.24;ball.vx=Math.sign(ball.vx||1)*Math.sqrt(sp*sp-ball.vy*ball.vy);}
   if(this.time-this.lastProgress>12&&this.time-(this.lastNudge||0)>4){const a=Math.atan2(ball.vy,ball.vx)+.18,speed=Math.hypot(ball.vx,ball.vy);ball.vx=Math.cos(a)*speed;ball.vy=Math.sin(a)*speed;this.lastNudge=this.time;this.emit('angle-correct');}
   this.bounce(ball,dt*ts);if(ball.y>H+20)this.balls.splice(this.balls.indexOf(ball),1);
  }
  if(!this.balls.length&&!this.done)this.lose('Orb rơi xuống vực');
  if(e.laser){this.laserCd-=dt;if(this.laserCd<=0){this.laserCd=.28;for(const x of [this.px-this.pw*.35,this.px+this.pw*.35])this.lasers.push({x,y:PY});}}
  for(const l of this.lasers){l.y-=dt*650;const b=this.bricks.find(b=>b.alive&&l.x>=b.x&&l.x<=b.x+b.w&&l.y<=b.y+b.h&&l.y>=b.y-12);if(b){this.hit(b,l,'laser');l.y=-20;}if(this.boss&&l.x>this.boss.x&&l.x<this.boss.x+130&&l.y<this.boss.y+110&&l.y>this.boss.y&&!this.bossGuarded()){this.boss.hp--;this.boss.visualHurtUntil=this.time+.12;this.emit('bosshit',{x:l.x,y:l.y});this.lastProgress=this.time;l.y=-20;}}
  this.lasers=this.lasers.filter(l=>l.y>50);
  for(const d of this.drops){d.y+=dt*105;if(d.y>PY-12&&d.y<PY+24&&Math.abs(d.x-this.px)<this.pw/2+15){this.apply(d.type);d.y=H+30;}}
  this.drops=this.drops.filter(d=>d.y<H+20);
  for(const s of this.shots){s.x+=s.vx*dt*ts;s.y+=s.vy*dt*(e.time_freeze?0:ts);if(s.y>PY-12&&s.y<PY+24&&Math.abs(s.x-this.px)<this.pw/2+s.r){if(s.effect==='lethal')this.lose('Trúng đòn boss');else if(s.effect==='stun')this.stunned=1;else if(s.effect==='slow')e.heavy_paddle=2;s.y=H+40;this.emit('spark',{x:this.px,y:PY});}}
  this.shots=this.shots.filter(s=>s.y<H+30);
  for(const h of this.hazards){h.t-=dt*ts;if(this.px+this.pw/2>h.x&&this.px-this.pw/2<h.x+h.w){if(h.type==='lethal')this.lose('Trúng đòn boss');if(h.type==='reverse')e.reverse=3;}}
  this.hazards=this.hazards.filter(h=>h.t>0);
  const boss=this.boss;if(boss&&boss.hp>0){boss.hurt=Math.max(0,boss.hurt-dt);boss.guard=Math.max(0,boss.guard-dt);boss.clones=Math.max(0,(boss.clones||0)-dt);boss.x=175+Math.sin(this.time*.75)*(boss.clones>0?90:105);const phase=boss.hp/boss.max>.66?1:boss.hp/boss.max>.33?2:3;if(phase!==boss.phase){boss.phase=phase;this.emit('phase',{phase});boss.cd=2;}
   if(!e.time_freeze&&this.bricks.filter(b=>b.alive&&b.r<4&&isObjective(b)).length<=boss.initialShield-(this.level.boss?.pressure_after_breaks||0)){if(boss.telegraph){boss.telegraph.t-=dt*ts;if(boss.telegraph.t<=0){this.bossAttack(boss.telegraph.id);boss.telegraph=null;boss.cd=boss.attacks.find(a=>a.phase===phase).cooldown;}}
    else {boss.cd-=dt*ts;if(boss.cd<=0){const a=boss.attacks.find(a=>a.phase===phase);const id=a.id==='combo_cycle'?['fruit_drop','sand_bullets','ice_bricks','flame_columns','scan_beam'][Math.floor((boss.attackCount+1)/2)%5]:a.id;boss.telegraph={id,t:a.telegraph,total:a.telegraph,x:this.px,text:a.effect,zones:attackZones(id,this.px,this.left,this.right,this.pw)};this.emit('warning',{text:a.effect});}}}
  }
  const remaining=this.bricks.filter(b=>b.alive&&isObjective(b)).length;if(!boss&&!this.cleanupActive&&remaining>0&&remaining<=(this.level.design?.cleanup_remaining??3)&&this.time-this.lastProgress>=(this.level.design?.cleanup_after_sec??16)){this.cleanupActive=true;this.emit('cleanup');}
  if(!this.done&&(boss?boss.hp<=0:!this.bricks.some(b=>b.alive&&isObjective(b))))this.finish(true);
 }
 checkMastery(){const m=this.mastery;if(!m||m.completed||m.failed)return;const values={perfect:this.perfects,combo:this.maxCombo,volley:this.volleyCount,reaction:this.maxReaction};m.progress=Math.min(m.target,values[m.type]||0);if(m.progress>=m.target){m.completed=true;this.emit('mastery',{objective:m.type,target:m.target});}else if(m.type==='volley'&&this.firstVolleyClosed)m.failed=true;}
 openSideRoute(){const cache=this.sideCache,route=this.level.side_route;if(this.done||!cache||cache.opened||!route)return false;cache.opened=true;cache.warning=route.windup_sec;const w=36,range=route.deflector_range,baseX=route.side==='left'?this.left+range+6:this.right-w-range-6;cache.sweep={x:baseX-range,y:cache.y+30,w:w+range*2,h:14};cache.drone={type:'salvage_drone',x:baseX,baseX,y:cache.y+30,w,h:14,range,life:route.deflector_sec,cd:0};this.apply(route.booster);this.emit('salvage',{booster:route.booster});return true;}
 tickSideRoute(dt){const c=this.sideCache;if(!c?.opened||c.spawned)return;c.warning=Math.max(0,c.warning-dt);if(c.warning===0){c.spawned=true;this.blockers.push({...c.drone});this.emit('salvage-risk');}}
 bossGuarded(){return !!this.boss&&(this.boss.guard>0||this.bricks.filter(b=>b.alive&&b.r<4&&isObjective(b)).length>(this.level.boss?.shield_open_remaining||0));}
 cleanupTarget(){return this.bricks.filter(b=>b.alive&&isObjective(b)&&!(b.t==='L'&&!this.key)).sort((a,b)=>(a.t==='Y'?-1000:Math.abs(a.x+a.w/2-this.px))-(b.t==='Y'?-1000:Math.abs(b.x+b.w/2-this.px)))[0]||null;}
 finish(win){if(this.done)return;this.checkMastery();this.done=true;let stars=0;if(win){stars=1;if(this.score>=this.level.stars['2'].score_at_least)stars=2;if(this.score>=this.level.stars['3'].score_at_least&&this.lost<=this.level.stars['3'].lives_lost_at_most)stars=3;}this.result={win,stars,score:this.score,lost:this.lost,time:this.time,coins:this.coins,masteryComplete:!!this.mastery?.completed,sideRouteOpened:!!this.sideCache?.opened};this.emit('end',this.result);}
}
root.RealmsEngine={Game,sweep,rng,W,H,LEFT,RIGHT,TOP,PY,CW,RH,boostNames,arenaWalls,isObjective,attackZones,SUPPORT_CONFIG};
if(typeof module!=='undefined')module.exports=root.RealmsEngine;
})(typeof window!=='undefined'?window:globalThis);

