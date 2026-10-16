/* Mechanical atlas extraction, compatibility mapping and code-native VFX baking. */
const fs=require('fs'),path=require('path'),sharp=require('sharp'),{createCanvas}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'../standalone/chronicles-realms/dist'),out=root+'/assets/scifi';
const src=process.argv[2];if(!src)throw Error('Pass generated image source directory');
const originals=JSON.parse(fs.readFileSync(root+'/assets/atlas_all.json'));
const files={core:'exec-a8639a1b-7073-4ccf-be05-93ce73340d2a.png',icons:'exec-db34a6c8-17da-4f8d-9928-76ded3a807b8.png',boss:'exec-7ff725be-52a4-4fe3-81b8-83c5ec808d71.png',bg:'exec-fc934816-ce0a-41a6-ab70-86e2131bf9e9.png'};
const rects={},meta=[];
async function pack(key,cols,rows,bands){const input=path.join(src,files[key]),m=await sharp(input).metadata(),size=key==='boss'?192:key==='bg'?384:128,tiles=[],bounds=[];
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){let left=Math.round(x*m.width/cols),top=Math.round((bands?.[y]??y/rows)*m.height),width=Math.round((x+1)*m.width/cols)-left,height=Math.round((bands?.[y+1]??(y+1)/rows)*m.height)-top;
 let data=await sharp(input).extract({left,top,width,height}).ensureAlpha().raw().toBuffer();let minX=width,minY=height,maxX=0,maxY=0;
 for(let yy=0;yy<height;yy++)for(let xx=0;xx<width;xx++)if(data[(yy*width+xx)*4+3]>64){minX=Math.min(minX,xx);maxX=Math.max(maxX,xx);minY=Math.min(minY,yy);maxY=Math.max(maxY,yy)}
 if(key==='bg'){minX=0;minY=0;maxX=width-1;maxY=height-1;}
 const tw=maxX-minX+1,th=maxY-minY+1,scale=(size-8)/Math.max(tw,th),dw=Math.max(1,Math.round(tw*scale)),dh=Math.max(1,Math.round(th*scale));
 const tile=await sharp(input).extract({left:left+minX,top:top+minY,width:tw,height:th}).resize(dw,dh).png().toBuffer(),dx=x*size+Math.floor((size-dw)/2),dy=y*size+Math.floor((size-dh)/2);
 tiles.push({input:tile,left:dx,top:dy});bounds.push([dx,dy,dw,dh]);}
 await sharp({create:{width:cols*size,height:rows*size,channels:4,background:'#00000000'}}).composite(tiles).webp({quality:90,alphaQuality:100}).toFile(out+'/'+key+'.webp');rects[key]=bounds;meta.push({file:key+'.webp',width:cols*size,height:rows*size});}
function native(){const cells=[],R=(kind,index=0)=>{let cv=createCanvas(96,96),c=cv.getContext('2d');c.strokeStyle='#7cecff';c.fillStyle='#b5f5ff';c.lineWidth=3;const t=index/7;
 if(kind==='fx'){c.globalAlpha=1-t*.9;c.beginPath();c.arc(48,48,5+t*36,0,7);c.stroke();for(let j=0;j<8;j++){let a=j*Math.PI/4,r=8+t*35;c.save();c.translate(48+Math.cos(a)*r,48+Math.sin(a)*r);c.rotate(a);c.fillRect(-3,-1,6*(1-t)+1,2);c.restore();}}
 if(kind==='frame'){c.strokeStyle=['#5ae8c1','#ffce70','#8cddff','#ff984f','#ed8cff','#b4a0ff'][index%6];c.lineWidth=4;c.strokeRect(3,3,90,90);c.lineWidth=7;for(const [x,y]of [[4,4],[74,4],[4,74],[74,74]]){c.beginPath();c.moveTo(x,y+18);c.lineTo(x,y);c.lineTo(x+18,y);c.stroke();}}
 if(kind==='star'){c.fillStyle='#ffd783';c.beginPath();for(let i=0;i<10;i++){let a=-Math.PI/2+i*Math.PI/5,r=i%2?15:32;c.lineTo(48+Math.cos(a)*r,48+Math.sin(a)*r)}c.closePath();c.fill();}
 if(kind==='heart'){c.fillStyle='#8af1f0';c.beginPath();c.moveTo(48,75);c.bezierCurveTo(2,44,15,6,48,29);c.bezierCurveTo(81,6,94,44,48,75);c.fill();}
 if(kind==='lock'){c.lineWidth=8;c.beginPath();c.arc(48,36,17,Math.PI,0);c.stroke();c.fillStyle='#263b53';c.fillRect(20,36,56,43);c.strokeRect(20,36,56,43);c.fillStyle='#d5faff';c.fillRect(44,49,8,16);}
 if(kind==='beam'){const g=c.createLinearGradient(30,0,66,0);g.addColorStop(0,'#00caff00');g.addColorStop(.4,'#18cfff');g.addColorStop(.5,'#ffffff');g.addColorStop(.6,'#18cfff');g.addColorStop(1,'#00caff00');c.fillStyle=g;c.globalAlpha=.6+.1*index;c.fillRect(30,0,36,96);}
 cells.push(cv);return cells.length-1;};rects.nativeIds={fx:Array.from({length:8},(_,i)=>R('fx',i)),frame:Array.from({length:6},(_,i)=>R('frame',i)),star:R('star'),heart:R('heart'),lock:R('lock'),beam:Array.from({length:4},(_,i)=>R('beam',i))};const cols=8,rows=Math.ceil(cells.length/cols),atlas=createCanvas(cols*96,rows*96),ctx=atlas.getContext('2d');rects.native=cells.map((cv,i)=>{ctx.drawImage(cv,(i%cols)*96,Math.floor(i/cols)*96);return[(i%cols)*96,Math.floor(i/cols)*96,96,96]});fs.writeFileSync(out+'/native.png',atlas.toBuffer('image/png'));meta.push({file:'native.png',width:cols*96,height:rows*96});}
(async()=>{await pack('core',6,6,[0,220/1254,390/1254,610/1254,805/1254,1020/1254,1]);await pack('icons',6,4);await pack('boss',4,6,[0,.15,.30,.46,.62,.79,1]);await pack('bg',3,2);native();
 const regions=['forest','desert','ice','lava','cyber','void'],bosses=['treant','pharaoh','ice_queen','magma_dragon','ai_overseer','lord_fracture'];const atlas={sheets:{}},map={};
 for(const[sheet,old]of Object.entries(originals.sheets)){let frames={};for(const[name,oldRect]of Object.entries(old.frames)){let type='core',i=0,hue=0,alpha=1;let r=Math.max(0,regions.findIndex(n=>name.includes(n))),j=Object.keys(old.frames).indexOf(name);const f=Number(name.match(/_(\d+)$/)?.[1]||0),n=rects.nativeIds;
 if(sheet==='sheet_bricks'||sheet==='sheet_skin_bricks'){i=name.includes('normal')?r:name.includes('hard')?6:name.includes('steel')?7:name.includes('special')?8:name.includes('ghost')?11:name.includes('chest')?9:10;if(sheet==='sheet_skin_bricks'){r=j%6;i=name.includes('normal')?r:6;hue=r*28;}if(name.includes('hard2'))alpha=.65;}
 else if(sheet==='sheet_paddle'){i=({normal:12,wide:13,narrow:12,laser:14,magnet:16,frozen:12,stunned:17,shield:13})[name.replace('paddle_','')]??15;}
 else if(sheet==='sheet_skin_paddles'){i=12+j%6;hue=j>=6?j*21:0;}
 else if(sheet==='sheet_balls'||sheet==='sheet_skin_balls'){i=({normal:18,mega:20,fire:19,bomb:22,electric:21,ice:23,ghost:20,meteor:19})[name.replace(/^(ball|trail)_/,'')]??18+j%6;if(sheet==='sheet_skin_balls')hue=Math.floor(j/6)*42;}
 else if(sheet==='sheet_boosters'){type='icons';i=j;}
 else if(sheet==='sheet_blockers'){i=({steel_wall:7,bumper:25,black_hole:27,turret:14,asteroid:24,fog:27,wind:26,gravity:27,drone:30})[name.replace('blocker_','')];}
 else if(sheet==='sheet_backgrounds'||sheet==='sheet_skin_backgrounds'){type='bg';i=j%6;hue=sheet==='sheet_skin_backgrounds'?25:0;}
 else if(sheet==='sheet_characters'){i=30+j%6;}
 else if(sheet==='sheet_orb_companion'){i=30+j;}
 else if(sheet==='sheet_bosses'||sheet==='sheet_boss_defeat'){type='boss';let b=bosses.findIndex(b=>name.startsWith(b+'_'));i=b*4+(name.includes('attack')?1:name.includes('hurt')||name.includes('defeat')?2:name.includes('weakpoint')?3:0);if(name.includes('defeat'))alpha=Math.max(.06,1-f/7);}
 else if(sheet==='sheet_frames'){type='native';i=n.frame[j%6];hue=j>=6?j*25:0;}
 else if(sheet==='sheet_ui_icons'){type='icons';i=({ui_coin:11,ui_play:20,ui_pause:21,ui_settings:22,ui_shop:11,ui_sound:10,ui_trophy:23})[name];if(i===undefined){type='native';i=name.includes('heart')?n.heart:name.includes('star')?n.star:n.lock;}if(/empty|lost/.test(name))alpha=.25;}
 else if(sheet==='sheet_skin_profile'){if(name.startsWith('avatar_frame')){type='native';i=n.frame[j%6]}else if(name.startsWith('badge')){type='icons';i=[11,12,23,7,10,23][j%6]}else{i=30+j%6;hue=Math.floor(j/6)*55;}}
 else if(sheet==='sheet_gp_icons'){type='icons';i=({skill_slow:5,skill_beam:4,skill_shield:7,perfect_catch:12,overdrive:3,combo_flame:3,hub_coin:11,hub_trophy:23,hub_friend:8,hub_portal:6})[name]??22;}
 else if(sheet==='sheet_gp_special_bricks'){i=name.includes('music')?10:9;hue=f*12;}
 else if(sheet==='sheet_gp_picture_levels'){i=18+j%6;}
 else {type='native';i=sheet==='sheet_gp_beam'?n.beam[f%4]:sheet==='sheet_gp_wide'?n.beam[f%4]:n.fx[f%8];hue=sheet==='sheet_brick_break'?r*40:Math.floor(j/8)*40;}
 const rect=rects[type][i];if(!rect)throw Error(sheet+' '+name+' unmapped '+type+':'+i);frames[name]=[...rect,hue,alpha];map[sheet+'|'+name]={type,index:i};
 // A logical sheet may reference multiple physical textures, carried as frame[6].
 frames[name][6]='scifi/'+type+(type==='native'?'.png':'.webp');}
 atlas.sheets[sheet]={image:frames[Object.keys(frames)[0]][6],frames};}
 fs.writeFileSync(out+'/atlas.json',JSON.stringify(atlas));fs.writeFileSync(out+'/rects.json',JSON.stringify(rects));let decodedBytes=0,totalBytes=0;for(const m of meta){m.bytes=fs.statSync(out+'/'+m.file).size;decodedBytes+=m.width*m.height*4;totalBytes+=m.bytes;}
 fs.writeFileSync(out+'/manifest.json',JSON.stringify({version:1,sourceSprites:90,logicalFrames:Object.keys(map).length,textures:meta,decodedBytes,totalBytes,notes:'90 generated source cells; legacy names map to shared forms, hue variants and procedural VFX. Boss phases share four authored poses per boss.'},null,2));console.log({decodedBytes,totalBytes,frames:Object.keys(map).length});
})();
