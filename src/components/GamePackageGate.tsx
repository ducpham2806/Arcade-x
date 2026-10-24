import React, { Suspense, useEffect, useState } from 'react';
import type { GameMetadata } from '../types';
import { GameArtwork } from '../visuals/gameArt';
import { prepareGamePackage, type PackageProgress } from '../games/gamePackages';
import './splash.css';

export function GamePackageGate({ game, onExit, children }: { game: GameMetadata; onExit: () => void; children: React.ReactNode }) {
  const [state, setState] = useState<PackageProgress>({ progress: 0, message: 'Đang chuẩn bị game…', completed: 0, total: 0 });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); let alive = true;
    setReady(false); setError(false);
    setState({ progress: 0, message: 'Đang chuẩn bị game…', completed: 0, total: 0 });
    void prepareGamePackage(game.id, controller.signal, value => { if (alive) setState(value); }).then(() => {
      if (alive) setReady(true);
    }).catch(() => { if (alive) setError(true); });
    return () => { alive = false; controller.abort(); };
  }, [game.id, attempt]);
  const progress = Math.round(Math.max(0, Math.min(100, state.progress)));
  const splash = <section id="game-package-splash" data-game-id={game.id} className="fixed inset-0 z-[80] bg-[#080b12] text-slate-200 flex items-center justify-center p-6" aria-busy={!error}>
    <div className="w-full max-w-md text-center space-y-6">
      <div className={`arcadex-boot-logo ${error ? 'arcadex-boot-paused' : ''} w-28 h-28 mx-auto rounded-3xl`}><GameArtwork gameId={game.id} variant="icon" src={game.artwork?.icon}/><span className="arcadex-boot-orbit" aria-hidden="true"/></div>
      <div><p className="text-xs text-slate-400 mb-2">ARCADEX · CHUẨN BỊ GAME</p><h1 className="text-2xl font-bold text-white">{game.title}</h1></div>
      {error ? <div className="space-y-4"><p role="alert">Chưa tải xong game. Kiểm tra kết nối rồi thử lại; tiến trình đã lưu vẫn được giữ.</p><button className="simple-primary-button w-full justify-center" onClick={() => setAttempt(v => v + 1)}>Thử tải lại game</button></div> : <div className="space-y-3">
        <p role="status" aria-live="polite" className="text-sm">{state.message}</p>
        <div role="progressbar" aria-label={`Tải ${game.title}`} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} className="h-2 rounded-full overflow-hidden bg-white/10"><div className="arcadex-boot-bar h-full bg-gradient-to-r from-indigo-500 to-lime-300 transition-[width] duration-300" style={{width:`${progress}%`}}/></div>
        <p className="text-2xl font-bold tabular-nums" aria-hidden="true">{progress}%</p>
        <p className="text-xs text-slate-400">Tải phần cần thiết trước. Sẵn sàng là chơi ngay.</p>
      </div>}
      <button id="btn-package-back" className="simple-secondary-button w-full justify-center" onClick={onExit}>Về thư viện</button>
    </div>
  </section>;
  return ready ? <Suspense fallback={splash}>{children}</Suspense> : splash;
}
