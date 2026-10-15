// Raster art generated for this project; sprite state is tied to gameplay time.
export const BOSS_IDS=['gau_ri_set','nu_hoang_bao_tu','sau_khoan','pharaoh_cat','thuyen_truong_hac_sat','yeti_bang_gia','robot_mk7','rong_dung_nham','hiep_si_bong_dem','vua_ri_set'];
export const ENEMY_IDS=['enemy_slime_rust','enemy_rat_machine','enemy_nam_lun','enemy_buom_bao_tu','enemy_doi_hang','enemy_golem_da','enemy_xac_uop','enemy_bo_cap','enemy_cua_giap','enemy_hai_au','enemy_nguoi_tuyet','enemy_canh_cut','enemy_robot_tuan_tra','enemy_drone','enemy_quy_lua','enemy_golem_magma','enemy_ma_mo','enemy_bo_xuong','enemy_ri_set_binh','enemy_robot_tuan_tra_2'];
export const ITEM_IDS=['bomb_plus','fire','boots','shield','heart','gem','coin','remote','hourglass','magnet','kick','glove','bomb_ice','bomb_fire','bomb_blackhole','armor','curse','passwall','pierce','light','radar','treasure','hammer','revive'];
export const ROOT='art-v3/';
export const iconPath=(id,cosmetic=false)=>`${ROOT}icons/${cosmetic?'cosmetics/':''}${id}.webp`;
export function bossPose(boss,time){
 if(boss.hp<=0)return 7;
 if(boss.stun>time)return 6;
 const windup=boss.windupMs||1500;
 const age=time-boss.attackAt,active=boss.attack&&boss.attack!=='idle';
 if(boss.walkUntil>time&&age<400)return 1+Math.floor(time/140)%2;
 if(active&&age>=0&&age<windup)return 3;
 if(active&&age>=windup&&age<windup+400)return 4;
 if(active&&age>=windup+400&&age<windup+850)return 5;
 if(boss.stun>time||boss.weak>time)return 6;
 if(boss.walkUntil>time)return 1+Math.floor(time/150)%2;
 return Math.floor(time/1600)%3===0?0:1+Math.floor(time/180)%2;
}
export function installArt(icons,cosmetics){
 for(const id of ITEM_IDS)icons['item_'+id]=iconPath(id);
 for(const id of ENEMY_IDS)icons[id]=iconPath(id);
 icons.heart_full=iconPath('heart');icons.heart_empty=iconPath('heart');icons.clock=iconPath('hourglass');icons.coin=iconPath('coin');icons.gem_ngoc=iconPath('gem');icons.shard_sao=iconPath('light');icons.core_orb=iconPath('light');icons.bomb_mini=iconPath('bomb_plus');
 icons.target=iconPath('radar');icons.book=iconPath('treasure');icons.revive_coin=iconPath('revive');
 for(let chapter=1;chapter<=10;chapter++){const base=(chapter-1)*3,prefix=chapter===1?'':`ch${chapter}_`;for(const[name,offset]of [['floor_a',0],['floor_b',0],['hard_block',1],['soft_block',2]])icons[prefix+name]=ROOT+'tiles/'+(base+offset)+'.webp';for(const[name,index]of [['gate_open',44],['gate_locked',45]])icons[prefix+name]=ROOT+'tiles/'+index+'.webp';}
 const terrain=['bush','ch2_bounce_mushroom','ch3_rail_h','ch4_quicksand','ch4_spike_trap','ch5_water','ch6_ice_floor','ch6_bonfire','ch7_conveyor','ch7_teleport','ch8_lava','ch8_stone_bridge','ch9_magic_door','ch10_core_socket'];terrain.forEach((name,index)=>icons[name]=ROOT+'tiles/'+(30+index)+'.webp');icons.bomb_0=ROOT+'tiles/46.webp';
 for(const c of cosmetics)c.icon='../'+iconPath(c.id,true);
}
export function artSprite(renderer,ctx,key,x,y,w,h,time){
 let file,frame=0,cols=1,rows=1;
 const enemy=key.match(/^enemies_4dir\/(.+)\/walk_(up|down|left|right)$/);
 const pip=key.match(/^pip_(?:bare|default)\/(idle|run|hit)_(up|down|left|right)$/);
 const boss=key.match(/^art_boss\/(.+)\/(\d)$/);
 const bomb=key.match(/^bombs\/(.+)\/(idle|flash)$/);
 if(enemy){const id=enemy[1]==='enemy_nam_small'?'enemy_nam_lun':enemy[1];if(!ENEMY_IDS.includes(id))return false;file=ROOT+'enemies'+(enemy[2]==='up'?'-up':enemy[2]==='left'||enemy[2]==='right'?'-side':'')+'.webp';cols=5;rows=4;frame=ENEMY_IDS.indexOf(id);}
 else if(pip){file=ROOT+'pip.webp';cols=4;rows=4;frame=['down','up','right','right'].indexOf(pip[2])*4+(pip[1]==='hit'?3:pip[1]==='run'?1+Math.floor(time/120)%2:0);if(pip[2]==='left'||pip[2]==='right')frame=12+(pip[1]==='hit'?3:pip[1]==='run'?1+Math.floor(time/120)%2:0);}
 else if(boss){if(!BOSS_IDS.includes(boss[1]))return false;file=ROOT+'bosses/'+boss[1]+'.webp';cols=4;rows=2;frame=Number(boss[2]);}
 else if(bomb){file=iconPath(bomb[1]==='bomb'?'pet_bum_mini':bomb[1],true);}
 else return false;
 const image=renderer.get(file);if(!image)return false;
 ctx.save();ctx.imageSmoothingEnabled=false;
 // Different movement rigs: grounded stride, jelly squash, and wing beat/hover.
 if(enemy){
  const phase=time/115+(ENEMY_IDS.indexOf(enemy[1])*.7),fly=/buom|doi|hai_au|drone|ma_mo/.test(enemy[1]);
  const jelly=/slime|nam/.test(enemy[1]);const swing=Math.sin(phase);
  ctx.translate(x+w/2,y+h);ctx.rotate(enemy[2]==='left'?-.045:enemy[2]==='right'?.045:0);
  ctx.scale(enemy[2]==='left'?-1:1,jelly?1+swing*.055:1);
  const cw=image.naturalWidth/cols,ch=image.naturalHeight/rows;
  ctx.drawImage(image,(frame%cols)*cw,Math.floor(frame/cols)*ch,cw,ch,-w/2,-h+(fly?-Math.abs(swing)*3:Math.abs(swing)*1.2),w,h);
  ctx.restore();return true;
 }
 if(boss&&frame===0){const pulse=Math.sin(time/420)*.009;ctx.translate(x+w/2,y+h);ctx.scale(1+ pulse,1-pulse);x=-w/2;y=-h;}
 if(bomb&&bomb[2]==='flash'){const pulse=1+.07*Math.sin(time/45);ctx.translate(x+w/2,y+h/2);ctx.scale(pulse,pulse);x=-w/2;y=-h/2;}
 if(pip&&pip[2]==='left'){ctx.translate(x+w,y);ctx.scale(-1,1);x=0;y=0;}
 const cw=image.naturalWidth/cols,ch=image.naturalHeight/rows;
 ctx.drawImage(image,(frame%cols)*cw,Math.floor(frame/cols)*ch,cw,ch,x,y,w,h);
 ctx.restore();return true;
}
export const WEAR_ANCHORS={back:[-.12,.1,1.24,.72],outfit:[.17,.46,.66,.43],shoes:[.19,.82,.62,.18],hair:[.14,.07,.72,.32],face:[.25,.25,.5,.2],hat:[.06,-.02,.88,.4]};
export function drawWardrobe(renderer,ctx,equipped,dir,x,y,w,h,pass){
 const slots=pass==='behind'?['back']:['outfit','shoes','hair','face','hat',...(dir==='up'?['back']:[])];
 for(const slot of slots){if(slot==='back'&&pass==='behind'&&dir==='up')continue;if(slot==='face'&&dir==='up')continue;
 const id=equipped[slot],a=WEAR_ANCHORS[slot];if(!id||!a)continue;
 const image=renderer.get(iconPath(id,true));if(!image)continue;
 ctx.save();ctx.imageSmoothingEnabled=false;
 const side=(dir==='left'||dir==='right')&&['face','hat','hair'].includes(slot),offset=side?(dir==='left'?-.06:.06):0;
 ctx.drawImage(image,x+(a[0]+offset)*w,y+a[1]*h,a[2]*w,a[3]*h);ctx.restore();
 }
}
export function cosmeticBlast(ctx,effect,time,id){
 if(!id||!effect.cells?.length)return;
 const palettes={fx_hoa_reu:'#8de580',fx_bao_tu:'#d995ff',fx_tinh_the:'#8ee7ff',fx_bao_cat:'#ffd47d',fx_song_bien:'#76e4e8',fx_bong_tuyet:'#e5faff',fx_dien_tu:'#9bffd5',fx_phun_trao:'#ff9b62',fx_linh_hon:'#c7afff',fx_cau_vong:'#f4a6ec',fx_phao_hoa:'#fff09b',fx_trai_tim:'#ff91b8',fx_hoa_anh_dao:'#ffd1e4'};
 const age=time-effect.at,alpha=Math.max(0,1-age/500);if(!alpha)return;
 ctx.save();ctx.globalAlpha=alpha*.85;ctx.strokeStyle=ctx.fillStyle=palettes[id]||'#fff0bc';ctx.lineWidth=2;
 for(const c of effect.cells.slice(0,14)){const x=c.x*48+24,y=c.y*48+24,p=age/500;for(let k=0;k<3;k++){const a=k*2.094+c.x+c.y,r=5+p*12;ctx.beginPath();ctx.arc(x+Math.cos(a)*r,y+Math.sin(a)*r,1.5,0,Math.PI*2);ctx.fill();}}
 ctx.restore();
}
