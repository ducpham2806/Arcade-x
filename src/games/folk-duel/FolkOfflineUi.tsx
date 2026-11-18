import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import type { GameBridgeAPI } from '../../types';
import { useDialogFocus } from '../../launcher/useDialogFocus';
import { applyMatchReward, type FolkProfileSave, type MatchRewardInput, type MatchRewardOutput } from './economy';
import type { OfflineMatch, OfflineMode } from './offlineMatch';

const offlineLabels: Record<OfflineMode, string> = { bot_easy: 'Bot Tí Sún', bot_hard: 'Bot Bờm', local_2p: 'Hai người chung máy' };

export function FolkRules({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const titleId = useId();
  const dialog = useDialogFocus(onClose);
  return <div className="fd-overlay" onClick={onClose}>
    <section ref={dialog} role="dialog" tabIndex={-1} aria-modal="true" aria-labelledby={titleId} className="fd-modal-shell" onClick={event => event.stopPropagation()}>
      <header className="fd-modal-header"><h2 id={titleId}>{title}</h2></header>
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar fd-rules-content">{children}</div>
      <footer className="fd-modal-header"><button type="button" className="fd-btn-primary" onClick={onClose}>Đã hiểu</button></footer>
    </section>
  </div>;
}

export function FolkResume({ match, onResume }: { match: OfflineMatch<{ finished: boolean; turnNumber: number }>; onResume: () => void }) {
  return <button type="button" className="fd-menu-btn is-primary" onClick={onResume}>
    <strong>{match.state.finished ? 'Xem kết quả ván trước' : 'Tiếp tục ván đã lưu'}</strong>
    <span>{offlineLabels[match.mode]} · {match.state.finished ? 'Đã kết thúc' : `Lượt ${match.state.turnNumber}`}</span>
  </button>;
}

export function FolkSaveNotice({ onRetry }: { onRetry: () => void }) {
  return <aside className="fd-save-notice" role="alert">
    <span>Thiết bị chưa lưu được ván này.</span>
    <button type="button" className="fd-btn-secondary" onClick={onRetry}>Thử lưu lại</button>
  </aside>;
}

export function FolkMatchReward({ input, profile, bridge, onProfileChange, ready, onAward }: {
  input: MatchRewardInput;
  profile: FolkProfileSave;
  bridge: GameBridgeAPI;
  onProfileChange: (profile: FolkProfileSave) => void;
  ready: boolean;
  onAward: () => void;
}) {
  const [reward, setReward] = useState<MatchRewardOutput>();
  const claimed = useRef<string | null>(null);
  function claim() {
    if (claimed.current === input.matchId) return;
    const result = applyMatchReward(profile, input, bridge);
    setReward(result);
    if (result.saveFailed) return;
    claimed.current = input.matchId;
    onProfileChange(result.profile);
    if (!result.alreadyClaimed) onAward();
  }
  useEffect(() => { if (ready) claim(); }, [ready, input.matchId]);
  if (!ready || !reward) return null;
  if (reward.saveFailed) return <button type="button" className="fd-btn-secondary" onClick={claim}>Chưa lưu được thưởng · Thử lại</button>;
  if (reward.alreadyClaimed) return <p className="fd-reward">Đã nhận thưởng ván này.</p>;
  return <p className="fd-reward">Thưởng +{reward.coins} Xu · +{reward.exp} XP · +{reward.candy} Kẹo</p>;
}
