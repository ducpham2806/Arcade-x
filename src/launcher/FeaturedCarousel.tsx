import React,{useEffect,useRef,useState} from 'react';
import {ChevronLeft,ChevronRight,Pause,Play} from 'lucide-react';
import type {CatalogGame} from './catalog';
import {GameArtwork} from '../visuals/gameArt';
export const FEATURED_INTERVAL=15_000;
export const NEW_GAME_IDS=['boom-buddies','brick-breaker','rainbow-blocks'];
const priority=[...NEW_GAME_IDS,'hex-match','car-escape','tile-2048','word-cross','blocker'];
const copy:Record<string,{eyebrow:string;title:string;accent:string;body:string}>={
 'boom-buddies':{eyebrow:'GAME MỚI · BOOM BUDDIES',title:'Đặt bom thật khéo.',accent:'Cùng bạn bùng nổ.',body:'Khám phá mê cung, né ngọn lửa và mở lối đi cùng Pip và Bum.'},
 'brick-breaker':{eyebrow:'GAME MỚI · BLOCK BREAKER',title:'Giải phóng Orb.',accent:'Hàn gắn Aethra.',body:'Phá gạch, vượt sáu vùng đất và chinh phục 96 màn trong Chronicles.'},
 'rainbow-blocks':{eyebrow:'GAME MỚI · RAINBOW BLOCKS',title:'Xếp sắc màu.',accent:'Bật cầu vồng.',body:'Khối rơi rực rỡ, combo bùng nổ. Chinh phục kỷ lục theo cách của bạn.'},
 'hex-match':{eyebrow:'BLOSSOM BLAST · 100 MÀN',title:'Chạm một bông.',accent:'Nở cả khu vườn.',body:'Ghép hoa, đánh thức sức mạnh đặc biệt và viết tiếp hành trình khu vườn.'},
 'car-escape':{eyebrow:'THỬ THÁCH TƯ DUY',title:'Gỡ từng nút.',accent:'Mở đường thoát.',body:'Một bãi xe đông đúc. Bạn sẽ tìm lối ra bằng nước đi nào?'},
 'tile-2048':{eyebrow:'MỘT CÚ VUỐT, MỘT KỶ LỤC',title:'Ghép con số.',accent:'Chạm 2048.',body:'Giữ bình tĩnh, xếp thật khéo và thử phá kỷ lục của chính mình.'},
 'word-cross':{eyebrow:'THƯ VIỆN NGÔN TỪ',title:'Nối từng chữ.',accent:'Khám phá từ mới.',body:'Một khoảng nghỉ nhẹ nhàng với những câu đố và ngôn từ thú vị.'},
 'blocker':{eyebrow:'THƯ GIÃN CÙNG KHỐI NGỌC',title:'Đặt vừa khít.',accent:'Vui thêm chút.',body:'Xếp khối, hoàn thành hàng và tận hưởng từng nước đi gọn gàng.'},
};
export function FeaturedCarousel({games,onPlay,onDetail}:{games:CatalogGame[];onPlay:(id:string)=>void;onDetail:(id:string)=>void}){
 const available=games.filter(g=>g.availability==='published'&&g.accessModel==='free');
 const ordered=[...priority.map(id=>available.find(g=>g.id===id)).filter(Boolean),...available.filter(g=>!priority.includes(g.id))] as CatalogGame[];
 const slides=ordered.slice(0,Math.max(5,Math.min(6,ordered.length)));
 const [index,setIndex]=useState(0),[animate,setAnimate]=useState(true),[paused,setPaused]=useState(false),[interacting,setInteracting]=useState(false),[hidden,setHidden]=useState(document.hidden);
 const count=slides.length,active=index%Math.max(1,count),busy=useRef(false);
 const signature=slides.map(g=>g.id).join(',');
 useEffect(()=>{setIndex(0);busy.current=false;},[signature]);
 useEffect(()=>{const listener=()=>setHidden(document.hidden);document.addEventListener('visibilitychange',listener);return()=>document.removeEventListener('visibilitychange',listener);},[]);
 function go(next:number){if(busy.current||count<2||next===index)return;busy.current=true;setAnimate(true);setIndex(next);}
 useEffect(()=>{if(count<2||paused||interacting||hidden)return;const timer=setInterval(()=>{if(busy.current)return;busy.current=true;setAnimate(true);setIndex(i=>i+1);},FEATURED_INTERVAL);return()=>clearInterval(timer);},[count,paused,interacting,hidden]);
 useEffect(()=>{if(!busy.current)return;const timer=setTimeout(()=>{busy.current=false;if(index===count){setAnimate(false);setIndex(0);}},window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:650);return()=>clearTimeout(timer);},[index,count]);
 if(!count)return null;
 return <section className="launcher-featured-carousel" aria-roledescription="carousel" aria-label="Game nổi bật" data-testid="featured-carousel" data-active-slide={active} onMouseEnter={()=>setInteracting(true)} onMouseLeave={()=>setInteracting(false)} onFocusCapture={()=>setInteracting(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setInteracting(false);}}>
  <div className="featured-viewport"><div className={`featured-track ${animate?'is-animated':''}`} style={{transform:`translateX(-${index*100}%)`}}>
   {[...slides,slides[0]].map((game,i)=>{const c=copy[game.id]||{eyebrow:'HÔM NAY CHƠI GÌ?',title:'Chơi một chút.',accent:'Vui cả ngày.',body:game.shortDesc};return <div key={`${game.id}-${i}`} className={`launcher-welcome featured-slide featured-${game.id}`} role="group" aria-roledescription="slide" aria-label={`${i%count+1} / ${count}: ${game.title}`} aria-hidden={i!==index} inert={i!==index}>
    <div className="featured-copy"><p className="launcher-eyebrow">{c.eyebrow}</p><h1>{c.title}<br/><span>{c.accent}</span></h1><p>{c.body}</p><button className="launcher-primary" onClick={()=>onPlay(game.id)}><Play size={18} fill="currentColor"/>Chơi ngay</button></div>
    <div className="welcome-game"><div className="welcome-sticker">{NEW_GAME_IDS.includes(game.id)?'VỪA CẬP BẾN ✦':'GỢI Ý CHO BẠN'}</div><button className="welcome-art" onClick={()=>onPlay(game.id)} aria-label={`Mở game nổi bật ${game.title}`}><GameArtwork gameId={game.id} variant="icon"/></button><div className="welcome-caption"><div><span>{game.category==='Puzzle'?'GIẢI ĐỐ':'KHÁM PHÁ'}</span><h2>{game.title}</h2></div><button id={i===index?'btn-launch-featured':undefined} aria-label={`Chơi game nổi bật ${game.title}`} className="launcher-icon" onClick={()=>onPlay(game.id)}><Play size={22} fill="currentColor"/></button></div></div>
   </div>;})}
  </div></div>
  <div className="featured-controls"><div className="featured-dots" aria-label="Chọn slide">{slides.map((game,i)=><button key={game.id} aria-label={`Slide ${i+1}: ${game.title}`} aria-current={active===i?'true':undefined} onClick={()=>go(i)}><span/></button>)}</div><div className="featured-arrows"><button aria-label={paused?'Tiếp tục chuyển banner':'Tạm dừng chuyển banner'} aria-pressed={paused} onClick={()=>setPaused(p=>!p)}>{paused?<Play size={14}/>:<Pause size={14}/>}</button><button aria-label="Banner trước" onClick={()=>go(active===0?count-1:active-1)}><ChevronLeft size={18}/></button><button aria-label="Banner tiếp" onClick={()=>go(index+1)}><ChevronRight size={18}/></button></div></div>
 </section>;
}
