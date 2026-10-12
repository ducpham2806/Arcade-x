import React, { useEffect } from 'react';
import {useDialogFocus} from '../launcher/useDialogFocus';
import { Play, Bot, Heart, Trophy } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { usePlayer } from '../context/PlayerContext';
import { useLauncher } from '../launcher/LauncherContext';
import { GAME_ONBOARDING_DATA } from '../data/gameOnboardingData';
import { GameArtwork } from '../visuals/gameArt';
import { CloseButton } from './common/CloseButton';

export const GameDetailModal: React.FC = () => {
  const { selectedGameForDetail, closeGameDetail, launchGame, favorites, toggleFavorite } = useGame();
  const { profile } = usePlayer();
  const dialogRef=useDialogFocus(closeGameDetail);
  const {catalog}=useLauncher();
  const game = catalog.games.find(game=>game.id===selectedGameForDetail);
  useEffect(() => { const listener = (e: KeyboardEvent) => { if (e.key === 'Escape') closeGameDetail(); }; window.addEventListener('keydown', listener); return () => window.removeEventListener('keydown', listener); }, [closeGameDetail]);
  if (!game) return null;
  const guide = GAME_ONBOARDING_DATA[game.id];
  const favorite = favorites.includes(game.id);
  return <div id="game-detail-modal-overlay" className="arcadex-modal-overlay" onClick={closeGameDetail}>
    <section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="game-detail-title" className="arcadex-modal-container launcher-detail p-4 sm:p-6" onClick={e => e.stopPropagation()}>
      <header className="flex items-center justify-between gap-3 shrink-0 pb-4 border-b border-white/10"><div><h2 id="game-detail-title" className="text-xl font-bold text-white">{game.title}</h2><p className="text-sm text-slate-400">{game.category} · {game.difficulty}</p></div><CloseButton onClose={closeGameDetail}/></header>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar py-5 space-y-5">
        <div className="grid sm:grid-cols-2 gap-5 items-center"><div className="h-44 sm:h-56 rounded-2xl overflow-hidden bg-white/5"><GameArtwork gameId={game.id}/></div><div className="space-y-4"><p className="text-slate-300 leading-relaxed">{game.description}</p><p className="flex items-center gap-2 text-sm text-lime-200"><Trophy size={18}/>Kỷ lục của bạn: {(profile.stats.highScores[game.id] || 0).toLocaleString()} điểm</p><button id="btn-detail-favorite" type="button" aria-pressed={favorite} onClick={() => toggleFavorite(game.id)} className="simple-secondary-button"><Heart size={17} fill={favorite ? 'currentColor' : 'none'}/>{favorite ? 'Đã yêu thích' : 'Thêm vào yêu thích'}</button></div></div>
        <section className="rounded-2xl border border-white/10 p-4 space-y-3"><h3 className="font-bold text-white">Cách chơi</h3><p className="text-sm text-slate-300">{guide?.headlineObjective || game.shortDesc}</p><ul className="list-disc pl-5 space-y-2 text-sm text-slate-300">{(guide?.rules || ['Chọn chế độ chơi và làm theo hướng dẫn trong game.']).map((rule, i) => <li key={i}>{rule}</li>)}</ul>{guide?.proTip && <p className="text-sm text-indigo-200">{guide.proTip}</p>}</section>
        <section className="rounded-2xl border border-white/10 p-4 space-y-3"><h3 className="font-bold text-white">Điều khiển</h3>{game.controls.map((control, i) => <div key={i} className="flex items-center justify-between gap-4 text-sm"><span className="text-slate-300">{control.action}</span><kbd className="rounded-lg bg-white/5 border border-white/10 px-2 py-1 text-indigo-200">{control.key}</kbd></div>)}{guide?.mobileGestures.map((gesture, i) => <p key={i} className="text-sm text-slate-400">{gesture.gesture}: {gesture.action}</p>)}</section>
      </div>
      <footer className="shrink-0 pt-4 border-t border-white/10 flex flex-wrap gap-3"><button id="btn-detail-launch-game" disabled={game.availability==='maintenance'} type="button" onClick={() => launchGame(game.id)} className="simple-primary-button flex-1 justify-center"><Play size={18}/>{game.availability==='maintenance'?'Đang bảo trì':game.accessModel==='premium'?'Kiểm tra quyền chơi':'Chơi ngay'}</button>{game.supportsAI && <button id="btn-detail-launch-ai" type="button" onClick={() => launchGame(game.id, true)} className="simple-secondary-button"><Bot size={18}/>Đấu AI</button>}</footer>
    </section>
  </div>;
};
