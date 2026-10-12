import React,{useEffect,useState} from 'react';
import { Gamepad2, Heart, UserRound } from 'lucide-react';
import { useGame } from '../context/GameContext';

export const MobileNav: React.FC = () => {
  const { activeGameId, activeModal, setActiveModal } = useGame();
  const [category,setCategory]=useState('Tất Cả');
  useEffect(()=>{const handler=(event:Event)=>setCategory((event as CustomEvent<string>).detail);window.addEventListener('arcadex:filter_games',handler);return()=>window.removeEventListener('arcadex:filter_games',handler);},[]);
  if (activeGameId || activeModal !== 'none') return null;
  const browse = (category: string) => {
    window.dispatchEvent(new CustomEvent('arcadex:filter_games', { detail: category }));
    document.getElementById('game-library')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return <nav aria-label="Điều hướng trên điện thoại" className="simple-mobile-nav fixed bottom-0 inset-x-0 z-40 md:hidden grid grid-cols-3 border-t border-white/10 bg-slate-950/95 backdrop-blur-xl safe-area-bottom">
    <button id="mobile-nav-games" type="button" aria-pressed={category!=='Yêu Thích'} onClick={() => browse('Tất Cả')}><Gamepad2 size={20}/><span>Game</span></button>
    <button id="mobile-nav-favorites" type="button" aria-pressed={category==='Yêu Thích'} onClick={() => browse('Yêu Thích')}><Heart size={20}/><span>Yêu thích</span></button>
    <button id="mobile-nav-profile" type="button" onClick={() => setActiveModal('profile')}><UserRound size={20}/><span>Tài khoản</span></button>
  </nav>;
};
