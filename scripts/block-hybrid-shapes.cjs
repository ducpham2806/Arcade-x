/* Geometry-only silhouette library. Legacy masks remain the source of truth. */
const families=[
'diamond','frame','slab','stripes','heart','columns','lattice','hourglass','funnel','checker','wave','citadel','cross','slab','relay','boss',
'frame','hourglass','cross','slab','castle','diamond','wave','checker','triangle','lattice','checker','hourglass','funnel','stripes','relay','boss',
'hourglass','triangle','stripes','diamond','star','citadel','cross','funnel','lattice','wave','frame','hourglass','slab','checker','relay','boss',
'hourglass','diamond','triangle','wave','star','citadel','checker','slab','lattice','frame','cross','stripes','funnel','citadel','relay','boss',
'hourglass','slab','slab','checker','planet','diamond','triangle','stripes','frame','citadel','wave','funnel','checker','lattice','relay','boss',
'checker','funnel','hourglass','frame','planet','checker','stripes','cross','wave','hourglass','triangle','slab','diamond','citadel','relay','boss'];
const labels={diamond:'Kim Cương',frame:'Vành Đai',slab:'Chiến Hạm',stripes:'Lớp Sóng',heart:'Trái Tim',columns:'Rừng Ăng Ten',lattice:'Cụm Thiên Thạch',hourglass:'Đồng Hồ Cát',funnel:'Phễu Năng Lượng',checker:'Đảo Quỹ Đạo',wave:'Sóng Plasma',citadel:'Thành Trì',cross:'Thập Tự',castle:'Lâu Đài',triangle:'Mũi Giáo',star:'Ngôi Sao',planet:'Sao Thổ',relay:'Mạng Tiếp Sóng',arch:'Khải Hoàn Môn',spiral:'Xoáy Thiên Hà',comet:'Sao Chổi',hex:'Lõi Lục Giác',wings:'Cánh Chiến Hạm',fork:'Đinh Ba',orbit:'Quỹ Đạo Kép',bridge:'Cầu Tiếp Sóng',zigzag:'Tia Sét'};
function authored(f,x,y,r){const ax=Math.abs(x),rad=Math.hypot(x,y*.85);switch(f){
case'arch':return (ax>.58&&ax<.94&&y>-.62)||(y<-.42&&y>-.92&&ax<.9)||(ax<.22&&y>.42);
case'spiral':{const a=Math.atan2(y,x),ring=.27+.105*(a+Math.PI);return Math.abs(rad-ring)<.18||(x<-.52&&y<-.30&&y>-.78);}
case'comet':return Math.hypot(x-.38,y+.22)<.52||(x<.18&&Math.abs(y-(.22-x*.35))<.23&&x>-.98)||(x<-.28&&Math.abs(y-(-.36-x*.35))<.12);
case'hex':return Math.max(ax*.86+Math.abs(y)*.5,Math.abs(y))<.92&&Math.max(ax*.86+Math.abs(y)*.5,Math.abs(y))>.36;
case'wings':return (Math.abs(y+.16-Math.abs(x)*.72)<.28&&ax>.12)||(ax<.22&&y>-.75&&y<.6);
case'fork':return ((ax>.57||ax<.22)&&y<.28&&y>-.95)||(y>.08&&y<.46&&ax<.86)||(ax<.22&&y>.2);
case'orbit':return Math.abs(Math.hypot((x+.32)*1.25,y)-.65)<.19||Math.abs(Math.hypot((x-.32)*1.25,y)-.65)<.19;
case'bridge':return (Math.abs(y-.3*Math.cos(x*3.2+r))<.26)||(ax>.7&&Math.abs(y)<.9);
case'zigzag':return Math.abs(x-(y<0?y*.8+.38:y*.8-.38))<.3;
}return false;}
function buildFormation({legacy,index,cols,rows,safe,reserved,target}){const r=Math.floor(index/16),k=index%16;let family=families[index],variant='legacy-remap';
 // Plain legacy slabs and relay carpets receive explicitly sculpted negative space.
 if(family==='slab'){family=['arch','comet','hex','wings','fork','spiral'][(r+k)%6];variant='sculpted-hybrid';}
 if(family==='relay'){family=['orbit','bridge','zigzag','wings','hex','arch'][r];variant='sculpted-relay';}
 const src=legacy.grid.data,sh=src.length,sw=src[0].length,mirror=(r+k)%3===1&& !['heart','star','planet','castle'].includes(family),raw=[];
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const sx=mirror?cols-1-x:x,nx=(sx+.5)/cols*2-1,ny=(y+.5)/rows*2-1;let on;
 if(variant.startsWith('sculpted'))on=authored(family,nx,ny,r);
 else {const x0=sx*sw/cols,x1=(sx+1)*sw/cols,y0=y*sh/rows,y1=(y+1)*sh/rows;let area=0;for(let sy=Math.floor(y0);sy<Math.ceil(y1);sy++)for(let tx=Math.floor(x0);tx<Math.ceil(x1);tx++)if(src[sy]?.[tx]&&src[sy][tx]!=='.')area+=Math.max(0,Math.min(tx+1,x1)-Math.max(tx,x0))*Math.max(0,Math.min(sy+1,y1)-Math.max(sy,y0));on=area/((x1-x0)*(y1-y0))>=.30;}
 if(on)raw.push({x,y});}
 const feasible=q=>safe(q.y,q.x)&&!reserved.has(q.y+','+q.x),mask=new Map(raw.filter(feasible).map(q=>[q.y+','+q.x,q]));
 // Widen sparse structural strokes locally, never fill all gaps to hit a count.
 const widening=['cross','diamond','triangle','funnel','frame','hourglass','wave','citadel','arch','comet','fork','zigzag','spiral'].includes(family);
 if(widening&&mask.size<target*.80){const extra=[];for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const key=y+','+x;if(mask.has(key)||!feasible({x,y}))continue;const dist=Math.min(...raw.map(q=>Math.hypot(q.x-x,q.y-y)));if(dist<=1.01)extra.push({x,y,dist});}
 // Pair selection by distance from center keeps the large silhouette legible.
 extra.sort((a,b)=>a.dist-b.dist||Math.abs(a.x-(cols-1)/2)-Math.abs(b.x-(cols-1)/2)||a.y-b.y||a.x-b.x);
 for(const q of extra){if(mask.size>=Math.round(target*.86))break;mask.set(q.y+','+q.x,q);}}
 // Large silhouettes retain their outline; carve a few interior portholes instead of random erosion.
 const max=Math.round(target*1.22);if(mask.size>max&&!['heart','star','planet','castle','frame'].includes(family)){const holes=[...mask.values()].filter(q=>[[-1,0],[1,0],[0,-1],[0,1]].every(([dx,dy])=>mask.has((q.y+dy)+','+(q.x+dx)))&&((q.x+r)%3===1&&(q.y+k)%3===1));for(const q of holes){if(mask.size<=max)break;mask.delete(q.y+','+q.x);}}
 return{cells:[...mask.values()],family,label:labels[family],variant,mirrored:mirror,source:legacy.id};}
module.exports={buildFormation,families,labels};
