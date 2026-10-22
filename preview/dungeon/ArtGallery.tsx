import React,{useState,useEffect} from 'react';
import {TitanArt} from '../../src/games/dungeon-tap/components/TitanArt';
import {ART,ENEMY_NAMES,PROFESSIONS,RasterSprite,WorldArt,SKILL_IDS,SkillArt} from '../../src/games/dungeon-tap/components/RasterSprite';
import {FantasyIcon,UI_ICONS} from '../../src/games/dungeon-tap/components/FantasyIcon';
import {STORY_CHAPTERS} from '../../src/games/dungeon-tap/storyChapters';
const POSES=['idle','walk','step','windup','attack','recovery','exposed','defeat'];
const LABELS=['Đứng','Bước trái','Bước phải','Báo đòn','Tấn công','Hồi thế','Choáng','Gục'];
const PARTY=['Kiếm sĩ','Cung thủ','Pháp sư','Người đá Titan','Sát thủ','Nữ thần ánh sáng','Kỵ sĩ Long Vương'];
export function ArtGallery({onBack,onBattle}:{onBack:()=>void;onBattle?:(stage:number)=>void}){
 const [tab,setTab]=useState('boss'),[playing,setPlaying]=useState(true),[frame,setFrame]=useState(0);
 useEffect(()=>{if(!playing)return;const t=setInterval(()=>{if(document.visibilityState!=='hidden')setFrame(f=>(f+1)%8)},500);return()=>clearInterval(t)},[playing]);
 const pose=POSES[frame];
 const frameLabels=tab==='party'?['Đứng','Báo đòn','Tấn công','Trúng đòn']:tab==='enemy'?['Đứng','Tấn công']:tab==='fx'?['Khởi phát','Bùng nổ','Tan vỡ','Mờ dần']:LABELS;
 return <div className="art-review art-v5"><header><div><small>DUNGEON TITAN · ATELIER VI</small><h1>Huyền tích thức giấc.</h1><p>8 Titan · 7 anh hùng · 48 quái · 8 vùng đất</p></div><button className="review-return" onClick={onBack}>‹ Trở về trận đấu</button></header>
 <nav aria-label="Nhóm asset">{[['boss','Titan'],['party','Đồng đội'],['enemy','Quái'],['gear','Trang bị'],['spells','Kỹ năng'],['worlds','Vùng đất'],['ui','Biểu tượng'],['fx','Hiệu ứng']].map(([id,label])=><button key={id} aria-pressed={tab===id} onClick={()=>setTab(id)}>{label}</button>)}</nav>
 {['boss','party','enemy','fx'].includes(tab)&&<div className="art-controls"><button onClick={()=>setPlaying(!playing)}>{playing?'Tạm dừng':'Chạy animation'}</button><label>Tư thế <select value={frame%frameLabels.length} onChange={e=>{setPlaying(false);setFrame(Number(e.target.value))}}>{frameLabels.map((label,i)=><option value={i} key={i}>{label}</option>)}</select></label><span>{tab==='boss'?'8 khung / Titan':tab==='party'?'4 tư thế / nhân vật':tab==='enemy'?'2 tư thế / quái':'3 chuỗi × 4 khung'}</span></div>}
 <div className={`artgrid art-${tab}`}>
 {tab==='boss'&&STORY_CHAPTERS.map(c=><article key={c.id}><div className="art-stage"><WorldArt chapter={c.id}/><TitanArt chapter={c.id} boss pose={pose}/></div><b>{c.bossName}</b><small>{LABELS[frame]}</small>{onBattle&&<button onClick={()=>onBattle(c.endStage)}>Đấu thử</button>}</article>)}
 {tab==='party'&&PROFESSIONS.map((p,i)=><article key={i}><div className="art-stage"><WorldArt chapter={1}/><TitanArt hero={!p} profession={p} pose={['idle','windup','attack','hurt'][frame%4]}/></div><b>{PARTY[i]}</b></article>)}
 {tab==='enemy'&&ENEMY_NAMES.flatMap((names,ch)=>names.map((name,i)=><article key={name}><div className="art-stage"><WorldArt chapter={ch+1}/><TitanArt chapter={ch+1} enemyVariant={i} pose={frame%2?'attack':'idle'}/></div><b>{name}</b></article>))}
 {tab==='gear'&&Array.from({length:24},(_,i)=><article key={i}><RasterSprite src={ART.gear} index={i} cols={6} rows={4} className="art-icon"/><b>{i<5?['Kiếm','Giáp','Mũ','Áo choàng','Nhẫn'][i]:i===23?'Rương báu':`${PARTY[1+Math.floor((i-5)/3)]} · ${['Vũ khí','Giáp','Phụ kiện'][(i-5)%3]}`}</b></article>)}
 {tab==='spells'&&SKILL_IDS.map((id,i)=><article key={id}><SkillArt id={id}/><b>{i<7?['Thiên Kiếm','Cuồng Nộ','Bàn Tay Vàng','Phân Thân','Bão Kiếm','Chiến Khải','Quang Diệm'][i]:`${PARTY[1+Math.floor((i-7)/3)]} · ${1+(i-7)%3}`}</b></article>)}
 {tab==='worlds'&&STORY_CHAPTERS.map(c=><article key={c.id}><div className="art-landscape"><WorldArt chapter={c.id}/></div><b>{c.name.replace(/Chương \d+: /,'')}</b></article>)}
 {tab==='ui'&&UI_ICONS.map(id=><article key={id}><FantasyIcon name={id}/><small>{id}</small></article>)}
 {tab==='fx'&&['Kiếm chém','Đỡ đòn','Ma thuật'].map((name,i)=><article key={i}><RasterSprite src={ART.fx} cols={4} rows={3} index={i*4+frame%4} className="art-effect"/><b>{name}</b></article>)}
 </div></div>;
}
