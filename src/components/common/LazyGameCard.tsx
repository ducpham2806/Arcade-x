import React, { useEffect, useRef, useState } from 'react';
import { GameConfig } from '../../types';
import { Heart, Trophy, Bot, Play, Info, LockKeyhole } from 'lucide-react';
import { GameArtwork, artFor, artStyle } from '../../visuals/gameArt';

export const getCategoryIcon = (category: string): string => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('puzzle')) return '🧩';
  if (cat.includes('action')) return '⚔️';
  if (cat.includes('multiplayer')) return '👥';
  if (cat.includes('reflex')) return '⚡';
  return '🕹️';
};
interface LazyGameCardProps {
  game: GameConfig & { accessModel?: 'free'|'premium'; availability?: 'published'|'maintenance' };
  personalHighScore: number;
  isFav: boolean;
  onOpenDetail: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onLaunchGame: (id: string, aiMode?: boolean) => void;
}
export const LazyGameCard: React.FC<LazyGameCardProps> = ({game, personalHighScore, isFav, onOpenDetail, onToggleFavorite, onLaunchGame}) => {
  const [visible, setVisible] = useState(false);
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!('IntersectionObserver' in window)){setVisible(true);return;}
    const observer=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){setVisible(true);observer.disconnect();}},{rootMargin:'240px'});
    if(ref.current) observer.observe(ref.current);
    return ()=>observer.disconnect();
  },[]);
  return <div ref={ref} id={`game-card-${game.id}`} className="arcade-cartridge" style={artStyle(game.id)}>
    <button type="button" className="cartridge-cover" disabled={game.availability==='maintenance'} onClick={()=>onLaunchGame(game.id)} aria-label={`Mở ${game.title}`}>
      {visible && <GameArtwork gameId={game.id}/>}
      <span className="cartridge-category">{artFor(game.id).label}</span>
    </button>
    <button id={`btn-fav-card-${game.id}`} type="button" className={`cartridge-favorite ${isFav?'is-favorite':''}`} onClick={()=>onToggleFavorite(game.id)} aria-pressed={isFav} title={isFav?'Bỏ Yêu Thích':'Thêm Vào Yêu Thích'} aria-label={`${isFav?'Bỏ yêu thích':'Yêu thích'} ${game.title}`}>
      <Heart size={16} fill={isFav?'currentColor':'none'}/>
    </button>
    <div className="cartridge-info">
      <button type="button" className="cartridge-title" disabled={game.availability==='maintenance'} onClick={()=>onLaunchGame(game.id)}>{game.title}</button>
      <p>{game.shortDesc}</p><span className="launcher-game-access">{game.availability==='maintenance'?'Đang bảo trì':game.accessModel==='premium'?'Cần mở khóa':'Chơi miễn phí'}</span>
      <div className="cartridge-footer">
        <span className="cartridge-record" title="Kỷ lục cá nhân"><Trophy size={13}/>{personalHighScore.toLocaleString()}</span>
        <div className="cartridge-actions">
          <button id={`btn-detail-card-${game.id}`} type="button" onClick={()=>onOpenDetail(game.id)} title="Cách chơi" aria-label={`Thể lệ ${game.title}`}><Info size={17}/></button>
          {game.supportsAI && <button id={`btn-play-ai-${game.id}`} type="button" onClick={()=>onLaunchGame(game.id,true)} title="Luyện Với AI" aria-label={`Luyện với AI: ${game.title}`}><Bot size={16}/></button>}
          <button id={`btn-play-${game.id}`} type="button" className="cartridge-play" disabled={game.availability==='maintenance'} onClick={()=>onLaunchGame(game.id)} title="Chơi Ngay" aria-label={`Chơi ${game.title}`}><Play size={14} fill="currentColor"/><span>{game.accessModel==='premium'?'MỞ GAME':'CHƠI'}</span></button>
        </div>
      </div>
    </div>
  </div>;
};
