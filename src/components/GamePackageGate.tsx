import React, { Suspense, useEffect, useState } from 'react';
import type { GameMetadata } from '../types';
import { GameArtwork } from '../visuals/gameArt';
import { prepareGamePackage, type PackageProgress } from '../games/gamePackages';
import './splash.css';

export function GamePackageGate({ game, onExit, children }: { game: GameMetadata; onExit: () => void; children: React.ReactNode }) {
  const [state, setState] = useState<PackageProgress>({ progress: 4, message: 'Đang chuẩn bị gói game…', completed: 0, total: 0 });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [visual, setVisual] = useState(4);
  useEffect(() => {
    const controller = new AbortController(); let alive = true;
    setReady(false); setError(false); setVisual(4);
    setState({ progress: 4, message: 'Đang chuẩn bị gói game…', completed: 0, total: 0 });
    void prepareGamePackage(game.id, controller.signal, value => { if (alive) setState(value); }).then(() => {
      if (alive) { setVisual(100); setReady(true); }
    }).catch(() => { if (alive) setError(true); });
    return () => { alive = false; controller.abort(); };
  }, [game.id, attempt]);
  useEffect(() => {
    if (ready || error) return;
    const timer = setInterval(() => setVisual(value => {
      const ceiling = state.progress < 30 ? 27 : Math.min(98, state.progress + 2);
      return Math.max(value, Math.min(ceiling, value + Math.max(0.05, (ceiling - value) * 0.08)));
    }), 200);
    return () => clearInterval(timer);
  }, [ready, error, state.progress]);
  const progress = Math.floor(Math.max(visual, Math.min(99, state.progress)));
  const splash = <section id="game-package-splash" data-game-id={game.id} className="fixed inset-0 z-[80] bg-[#080b12] text-slate-200 flex items-center justify-center p-6" aria-busy={!error}>
    <div className="w-full max-w-md text-center space-y-6">
      <div className={`arcadex-boot-logo ${error ? 'arcadex-boot-paused' : ''} w-28 h-28 mx-auto rounded-3xl`}><GameArtwork gameId={game.id}/><span className="arcadex-boot-orbit" aria-hidden="true"/></div>
      <div><p className="text-xs text-slate-400 mb-2">ARCADEX · CHUẨN BỊ GAME</p><h1 className="text-2xl font-bold text-white">{game.title}</h1></div>
      {error ? <div className="space-y-4"><p role="alert">Chưa tải xong game. Kiểm tra kết nối rồi thử lại; tiến trình đã lưu vẫn được giữ.</p><button className="simple-primary-button w-full justify-center" onClick={() => setAttempt(v => v + 1)}>Thử tải lại game</button></div> : <div className="space-y-3">
        <p role="status" aria-live="polite" className="text-sm">{state.message}{state.total > 0 && ` (${state.completed}/${state.total})`}</p>
        <div role="progressbar" aria-label={`Tải ${game.title}`} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} className="h-2 rounded-full overflow-hidden bg-white/10"><div className="arcadex-boot-bar h-full bg-gradient-to-r from-indigo-500 to-lime-300 transition-[width] duration-300" style={{width:`${progress}%`}}/></div>
        <p className="text-xs text-slate-400">{progress}% · Chỉ tải gói của game bạn đã chọn.</p>
      </div>}
      <button id="btn-package-back" className="simple-secondary-button w-full justify-center" onClick={onExit}>Về thư viện</button>
    </div>
  </section>;
  return ready ? <Suspense fallback={splash}>{children}</Suspense> : splash;
}
