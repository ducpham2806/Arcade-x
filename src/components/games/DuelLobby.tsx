import React,{useState} from 'react';
import {Bot,Users,ArrowRight,Wifi,Gamepad2} from 'lucide-react';
import {GameArtwork} from '../../visuals/gameArt';
type Difficulty='easy'|'medium'|'hard';
interface Props{gameId:string;title:string;username:string;elo:number;onAi:(difficulty:Difficulty)=>void;onOnline:()=>void;onLocal?:()=>void}
export function DuelLobby({gameId,title,username,elo,onAi,onOnline,onLocal}:Props){
 const [difficulty,setDifficulty]=useState<Difficulty>(()=>{try{const d=localStorage.getItem(`arcadex_difficulty_${gameId}`);return ['easy','medium','hard'].includes(d||'')?d as Difficulty:'medium';}catch{return 'medium';}});
 const choose=(d:Difficulty)=>{setDifficulty(d);try{localStorage.setItem(`arcadex_difficulty_${gameId}`,d);}catch{}};
 return <section className="duel-lobby legacy-menu" data-readability="off" aria-label={`Chọn cách chơi ${title}`}>
  <div className="duel-intro"><div className="duel-art"><GameArtwork gameId={gameId}/></div><p className="game-eyebrow">ARCADEX · ĐẤU TRÍ</p><h2>{title}</h2><p>Một ván cờ. Một ý tưởng mới.</p><div className="duel-player"><span>{username}</span><strong>{elo.toLocaleString()} ELO</strong></div></div>
  <div className="duel-options"><article className="duel-mode duel-ai"><div className="duel-mode-heading"><span className="duel-mode-icon"><Bot size={23}/></span><div><span className="game-eyebrow">SẴN SÀNG CHƠI</span><h3>Đấu với máy</h3></div><span className="duel-chip">Offline</span></div><p>Chọn sức đối thủ rồi vào bàn ngay.</p><div className="duel-difficulties" aria-label="Độ khó">{([['easy','Tập sự'],['medium','Cao thủ'],['hard','Kiện tướng']] as [Difficulty,string][]).map(([id,label])=><button type="button" key={id} aria-pressed={difficulty===id} onClick={()=>choose(id)}>{label}</button>)}</div><button id={`btn-${gameId}-quick-ai`} className="game-primary" onClick={()=>onAi(difficulty)}>Chơi ngay <ArrowRight size={18}/></button></article>
  <div className="duel-secondary-modes"><article className="duel-mode"><Wifi size={21}/><h3>Chơi online</h3><p>Tìm đối thủ hoặc vào phòng bạn bè.</p><button className="game-secondary" onClick={onOnline}>Tìm trận / Vào phòng <ArrowRight size={16}/></button></article>{onLocal&&<article className="duel-mode"><Users size={21}/><h3>Hai người, một máy</h3><p>Đổi lượt trên cùng thiết bị.</p><button className="game-secondary" onClick={onLocal}><Gamepad2 size={17}/>Vào bàn ngay</button></article>}</div></div>
 </section>;
}
