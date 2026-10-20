import { createPortal } from 'react-dom';
import React, { useEffect, useState } from 'react';
import { gameSaveStatus, resolveGameSave, type SaveStatus } from '../services/gameSaves';

export function GameSaveGate({ gameId, onResolved, children }: {
  gameId: string; onResolved: () => void; children: React.ReactNode;
}) {
  const [status, setStatus] = useState<SaveStatus>(() => gameSaveStatus(gameId));
  const [error, setError] = useState('');
  const [statusSlot, setStatusSlot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setStatusSlot(document.getElementById('game-save-status-slot'));
    setStatus(gameSaveStatus(gameId));
    const listener = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail.gameId === gameId) setStatus(detail.status);
    };
    window.addEventListener('arcadex:save-status', listener);
    return () => window.removeEventListener('arcadex:save-status', listener);
  }, [gameId]);
  // An in-flight cloud conflict must not unmount the active game. Resolve on next entry.
  const [blocked, setBlocked] = useState(() => gameSaveStatus(gameId) === 'conflict');
  const resolve = (choice: 'local' | 'remote') => {
    try { resolveGameSave(gameId, choice); onResolved(); setBlocked(false); }
    catch { setError('Chưa lưu được lựa chọn. Hãy kiểm tra dung lượng trình duyệt và thử lại.'); }
  };
  if (blocked) return <div className="max-w-md mx-auto p-6 space-y-4 text-slate-200" role="dialog" aria-label="Chọn ván chơi">
    <h2 className="text-xl font-bold">Có hai bản lưu khác nhau</h2>
    <p>Ván trên thiết bị này khác với ván đã lưu trực tuyến. Chọn ván để chơi tiếp; cả hai bản sẽ được giữ dự phòng.</p>
    <button onClick={() => resolve('local')} className="w-full p-3 rounded-xl bg-indigo-600 font-semibold">Chơi ván trên thiết bị này</button>
    <button onClick={() => resolve('remote')} className="w-full p-3 rounded-xl border border-white/20 font-semibold">Chơi ván đã lưu trực tuyến</button>
    {error && <p role="alert">{error}</p>}
  </div>;
  let guest = true;
  try { guest = JSON.parse(localStorage.getItem('arcadex_player_profile') || '{}').id?.startsWith('guest_') ?? true; } catch { /* local-only */ }
  const text = gameId === 'battleship' ? 'Trận tập · chưa hỗ trợ lưu ván' : status === 'error' ? 'Chưa lưu được ván trên thiết bị.' : status === 'conflict' ? 'Ván này đang lưu trên máy; có bản trực tuyến khác để chọn khi mở lại game.' : status === 'synced' && !guest ? 'Đã đồng bộ' : guest || status === 'local' ? 'Đã lưu trên thiết bị' : 'Đã lưu trên thiết bị · chờ đồng bộ';
  return <>{statusSlot && createPortal(<span className="text-[9px] truncate max-w-[90px] sm:max-w-[220px]" role="status" title={text}>{text}</span>, statusSlot)}{children}</>;
}

export class GameLoadBoundary extends React.Component<{ children: React.ReactNode; onExit: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <div className="p-8 text-center space-y-4 text-slate-200" role="alert">
      <p>Chưa mở được game. Hãy kiểm tra kết nối và quay lại danh sách để thử lại.</p>
      <button onClick={this.props.onExit} className="p-3 rounded-xl bg-indigo-600">Về danh sách game</button>
    </div>;
    return this.props.children;
  }
}


