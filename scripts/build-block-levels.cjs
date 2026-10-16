/* Deterministic authored campaign grammar; keeps IDs, region gates and rewards. */
const fs=require('fs'),path=require('path');const root=path.resolve(__dirname,'../standalone/chronicles-realms/dist'),file=root+'/assets/levels.json',D=JSON.parse(fs.readFileSync(file));
const shapes=['open','chamfer','stepped','waist','reactor','hangar'];
const patterns=['gateway','wings','chevrons','reactor','constellation','staircase','rings','batteries','trident','precision','cascade','fortress','diagonal','citadel','relay'];
const names=['Cổng Khởi Động','Hai Cánh Quỹ Đạo','Mũi Tên Xuyên Giáp','Lõi Phản Ứng','Chòm Sao','Bậc Thang Năng Lượng','Vòng Cung','Dãy Pin','Đinh Ba','Đường Ngắm','Thác Năng Lượng','Pháo Đài','Đường Chéo','Thành Trì','Trạm Tiếp Sóng'];
function rand(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const count=(grid)=>grid.flat().filter(t=>t!=='.'&&!['X','M','P'].includes(t)).length;
function wallsFor(arena){const l=(480-arena.width)/2,r=480-l,cw=arena.width/arena.cols,w=[];const add=(side,y,h,steps)=>w.push({x:side==='left'?l:r-steps*cw,y,w:steps*cw,h});
 if(arena.shape==='chamfer'){for(const side of ['left','right']){add(side,92,54,1.3);add(side,146,46,.65);}}
 if(arena.shape==='stepped'){add('left',92,92,1);add('right',190,100,.9);}
 if(arena.shape==='waist'){for(const side of ['left','right'])add(side,225,72,.85);}
 if(arena.shape==='reactor'){add('left',92,70,.8);add('right',92,70,.8);add('left',295,54,.7);add('right',295,54,.7);}
 if(arena.shape==='hangar'){add('left',92,100,1.4);add('right',92,100,1.4);add('left',192,40,.6);add('right',192,40,.6);}
 return w;
}
for(let index=0;index<96;index++){
 const old=D.levels[index],r=Math.floor(index/16),k=index%16,boss=k===15,rng=rand(17017+index*991),cols=9+r,rows=boss?4:7+r+(k>=6?1:0)+(k>=11?1:0),shape=boss?'open':shapes[(r+Math.floor(k/3))%shapes.length];
 const arena={width:384+Math.min(48,r*8+Math.floor(k/5)*4),cols,grid_top:112,cell_height:boss?26:Math.max(23,28-r),shape};
 const walls=wallsFor(arena),left=(480-arena.width)/2,cw=arena.width/cols,rh=arena.cell_height,grid=Array.from({length:rows},()=>Array(cols).fill('.'));
 const safe=(y,x)=>{let q={x:left+x*cw+3,y:112+y*rh+2,w:cw-6,h:rh-5};return walls.every(w=>q.x+q.w+7<=w.x||q.x-7>=w.x+w.w||q.y+q.h+7<=w.y||q.y-7>=w.y+w.h)};
 const laneA=Math.max(1,Math.floor(cols*.28)),laneB=cols-1-laneA,reserved=new Set();const put=(y,x,t)=>{if(y>=0&&y<rows&&x>=0&&x<cols&&safe(y,x)){grid[y][x]=t;return true;}return false};
 const moving=[];
 if(!boss&&r>=2&&[3,8,12].includes(k)){const y=rows-3,x=Math.floor(cols/2);for(let c=x-1;c<=x+1;c++)reserved.add(y+','+c);if(put(y,x,'V'))moving.push({cell:[y,x],axis:'x',range:.65,speed:.65+r*.1});}
 const candidates=[];for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if(safe(y,x)&&!reserved.has(y+','+x)&&((x!==laneA&&x!==laneB)||boss&&y%2===0)){
 const nx=(x-(cols-1)/2)/(cols/2),ny=y/(rows-1),p=patterns[k%15];let score=0;
 if(p==='gateway')score=Math.abs(nx)*.6+ny*.4;
 if(p==='wings')score=Math.abs(Math.abs(nx)-(.25+ny*.55));
 if(p==='chevrons')score=Math.abs(ny-Math.abs(nx)*.65);
 if(p==='reactor'||p==='rings')score=Math.abs(Math.hypot(nx,ny-.45)-.55);
 if(p==='constellation')score=((x+y+r)%3)*.22+ny*.25;
 if(p==='staircase')score=Math.abs(ny-(nx+1)/2);
 if(p==='batteries')score=(x%3)*.28+ny*.2;
 if(p==='trident')score=Math.min(Math.abs(nx),Math.abs(nx-.65),Math.abs(nx+.65))+ny*.2;
 if(p==='precision')score=Math.abs(nx)*.55+ny*.25;
 if(p==='cascade')score=Math.abs(Math.sin(x*.8+r)*.25+.45-ny);
 if(p==='fortress'||p==='citadel')score=Math.min(ny,Math.abs(nx)*.4)+(y%3===1?.15:0);
 if(p==='diagonal')score=((x+y)%4)*.16+ny*.1;
 if(p==='relay')score=((y%3)+(x%3))*.13;
 if(boss)score=Math.abs(x-(cols-1)/2)*.04+(y%2)*.12;
 candidates.push({y,x,score:score+rng()*.15});}
 candidates.sort((a,b)=>a.score-b.score||a.y-b.y||a.x-b.x);
 let target=boss?24+r*4:36+r*12+Math.floor(k*1.6);if(!boss&&[4,10].includes(k))target-=4;if(!boss&&k===9)target-=3;
 target=Math.min(target,candidates.length+moving.length);
 for(const c of candidates.slice(0,target-moving.length))grid[c.y][c.x]='n';
 let cells=()=>grid.flatMap((row,y)=>row.map((t,x)=>({t,y,x}))).filter(q=>q.t==='n');
 let shuffled=cells().sort(()=>0);for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
 const hard=Math.floor(target*(.07+r*.025+k*.002)),steel=r>=2?Math.floor(target*(.012*(r-1))):0;let cursor=0;
 for(let i=0;i<hard&&cursor<shuffled.length;i++,cursor++){const q=shuffled[cursor];grid[q.y][q.x]='h';}
 for(let i=0;i<steel&&cursor<shuffled.length;i++,cursor++){const q=shuffled[cursor];grid[q.y][q.x]='s';}
 const special=(type,amount,low=false)=>{let opts=cells().sort((a,b)=>low?b.y-a.y:a.y-b.y);for(let i=0;i<amount&&opts.length;i++){const at=Math.min(opts.length-1,Math.floor((i+.5)*opts.length/amount));const q=opts.splice(at,1)[0];grid[q.y][q.x]=type;}};
 if(!boss){if(r>=1||k>=3)special('T',1+Math.floor(r/2));if(r>=1)special('F',Math.min(2,r));if(r>=2)special('I',2);if(r>=3)special('R',2);if(r>=4)special('E',3);if(k===10||k===4)special('K',1,true);}
 let chains=[],electric_groups=[],portals=[];
 if(!boss&&((r%2===0&&k===14)||(r>=1&&k===6))){let opts=cells();for(let group=0;group<3;group++){const center=opts[Math.floor((group+.5)*opts.length/3)];if(!center)continue;const list=opts.filter(q=>Math.abs(q.y-center.y)<=1).sort((a,b)=>Math.abs(a.x-center.x)-Math.abs(b.x-center.x)).slice(0,4);for(const q of list)grid[q.y][q.x]='C';chains.push({group:group+1,cells:list.map(q=>[q.y,q.x])});opts=opts.filter(q=>!list.includes(q));}}
 if(!boss&&r>=4){const es=grid.flatMap((row,y)=>row.map((t,x)=>({t,y,x}))).filter(q=>q.t==='E');if(es.length)electric_groups=[es.map(q=>[q.y,q.x])];}
 if(!boss&&r>=3&&[2,8,13].includes(k)){const a=[rows-2,laneA],b=[1,laneB];if(put(...a,'P')&&put(...b,'P'))portals=[{a,b}];}
 if(!boss&&r>=2&&[5,11].includes(k)){special('L',2);special('Y',1,true);}
 const isPicture=k===4,isPrecision=k===9,isRelay=k===14;let type=boss?'boss':isPicture?'picture':isPrecision?'precision':isRelay?(r%2?'rhythm':'chain'):'normal';
 if(type==='rhythm')special('U',Math.max(6,Math.floor(target*.22)));
 const level={...old,type,name:boss?old.name:names[k]+' '+String(r+1).padStart(2,'0'),grid:{cols,rows,data:grid.map(row=>row.join(''))},arena,moving,chains,electric_groups,portals,blockers:[],pattern:boss?'boss-shield-'+r:patterns[k],balls:1,lives:3,ball_speed:+(8.2+index*.033).toFixed(3),paddle_scale:+(1.13-index*.0017+(isPrecision?.03:0)).toFixed(3),difficulty:+(1+index*.09).toFixed(2),solvable:true};
 if(!boss&&r>=1&&[7,12].includes(k))level.blockers=[{type:r>=4&&k===12?'turret':'bumper',x:Math.floor(cols/2)-.4,y:Math.max(rows+1,(470-112)/rh)}];
 for(const key of ['chain_rules','rhythm','intro_features','picture','boss'])if(!((key==='boss'&&boss)||(key==='picture'&&isPicture)))delete level[key];
 if(type==='rhythm')level.rhythm={bpm:96+r*7,beats_per_bar:4,window_ms:180};
 if(isPicture){const oldPic=old.picture||{id:['heart','star','planet','castle','heart','planet'][r]};level.picture={...oldPic,palette:['#8aeeff','#ffaa63','#c394ff'],color_rows:grid.map((row,y)=>row.map((t,x)=>t==='.'?'.':String((x+y+r)%3)).join(''))};for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if(grid[y][x]==='n')grid[y][x]='p';level.grid.data=grid.map(row=>row.join(''));}
 if(boss){level.boss={...old.boss,hp:18+r*5,shield_open_remaining:Math.floor(target*.22),pressure_after_breaks:Math.floor(target*.25)};level.boss.attacks=old.boss.attacks.map(a=>({...a,base_cooldown_sec:a.base_cooldown_sec??a.cooldown,telegraph:Math.max(1.15,a.telegraph),cooldown:Math.max(6.5,(a.base_cooldown_sec??a.cooldown)-r*.15)}));}
 level.bricks_to_clear=count(grid);level.indestructible=grid.flat().filter(t=>['X','M','P'].includes(t)).length;level.max_base_points=grid.flat().reduce((n,t)=>n+(D.points[t]||0),0);
 const hp=grid.flat().reduce((n,t)=>n+(['.','X','M','P'].includes(t)?0:D.hp[t]||1),0);level.hit_budget=hp+(level.boss?.hp||0);
 level.par_time_sec=boss?120+r*16:Math.round(65+r*12+k*3.2+(level.hit_budget-level.bricks_to_clear)*.4);
 level.stars={'1':'Hoàn thành màn','2':{score_at_least:Math.round(level.max_base_points*1.15/10)*10},'3':{score_at_least:Math.round(level.max_base_points*1.55/10)*10,lives_lost_at_most:0}};
 level.design={revision:3,beat:boss?'climax':[4,10].includes(k)?'release':k<3?'teach':k<10?'practice':'mastery',target_time_sec:boss?[100+r*12,175+r*12]:[Math.max(55,level.par_time_sec-25),level.par_time_sec+45],entry_lanes:[laneA,laneB],cleanup_after_sec:16,cleanup_remaining:Math.max(3,Math.ceil(level.bricks_to_clear*.045)),regen_limit:1};
 level.booster_pool={...old.booster_pool,drop_rate:{normal:.065,hard:.085,steel:.12,chest:1},pity_after:20,bad_chance:r===0?0:Math.min(.12,.04+r*.015),drop_cooldown_sec:5,drop_budget:boss?7:Math.max(3,Math.min(10,Math.floor(level.bricks_to_clear/12)))};
 level.booster_pool.good={...old.booster_pool.good};delete level.booster_pool.good.extra_life;delete level.booster_pool.good.magnet;if(r===0&&k<3)level.booster_pool.good={big_paddle:4,multi_ball:4,slow_ball:2,shield:2};
 level.booster_pool.bad=r<2?{small_paddle:1}:r<4?{small_paddle:2,fast_ball:1,heavy_paddle:1}:{small_paddle:2,fast_ball:1,heavy_paddle:1,reverse:1};
 D.levels[index]=level;
}
D.version='3.0-orbital-levels';D.grid_cols='per-level';D.campaign_design={revision:3,arena_shapes:shapes,cols:[9,14],normal_target_sec:[65,250],notes:'Targets are design budgets until bot/human calibration; three lives in campaign precision trials.'};fs.writeFileSync(file,JSON.stringify(D));
// Synchronize embedded runtime data without dropping the atlas/skin compatibility metadata.
const vm=require('vm'),context={window:{}};vm.runInNewContext(fs.readFileSync(root+'/data.js','utf8'),context);context.window.REALMS_DATA.levels=D;fs.writeFileSync(root+'/data.js','window.REALMS_DATA='+JSON.stringify(context.window.REALMS_DATA)+';\n');
console.log(D.levels.map(l=>({id:l.id,blocks:l.bricks_to_clear,hits:l.hit_budget,cols:l.grid.cols,rows:l.grid.rows,shape:l.arena.shape,par:l.par_time_sec})).filter((l,i)=>i%16===0||i%16===14||i%16===15));
