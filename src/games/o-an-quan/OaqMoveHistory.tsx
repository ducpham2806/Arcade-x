import { createPortal } from 'react-dom';
import { useDialogFocus } from '../../launcher/useDialogFocus';
import type { FolkSeat } from '../folk-duel/types';
import type { OaqDirection, OaqTurn } from './rules';

const cellName = (index: number) => index === 0 ? 'Quan trái' : index === 6 ? 'Quan phải' : `ô ${index}`;
export const rightDirection = (seat: FolkSeat): OaqDirection => seat === 'P1' ? 'CW' : 'CCW';

export function OaqMoveHistory({ turns, names, onClose }: {
  turns: OaqTurn[];
  names: Record<FolkSeat, string>;
  onClose: () => void;
}) {
  const dialog = useDialogFocus(onClose);
  const viewport = document.getElementById('game-wrapper-viewport') ?? document.body;
  return createPortal(<div className="fd-overlay oaq-history-overlay" onClick={onClose}>
    <section ref={dialog} className="fd-modal-shell oaq-history" data-modal-skin="authored" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="oaq-history-title"
      onClick={event => event.stopPropagation()}>
      <header className="fd-modal-header">
        <h2 id="oaq-history-title">Lịch sử lượt đi</h2>
        <button type="button" className="fd-close-btn" aria-label="Đóng lịch sử" onClick={onClose}>×</button>
      </header>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar oaq-history-list">
        {turns.length === 0 ? <p>Chưa có lượt đi được ghi trong ván này.</p> : <ol>
          {[...turns].reverse().map(turn => {
            const points = turn.captures.reduce((sum, capture) => sum + capture.points, 0);
            return <li key={turn.turn}>
              <details data-oaq-history-seat={turn.seat}>
                <summary>
                  <span className="oaq-turn-owner">Lượt {turn.turn} · {names[turn.seat]}</span>
                  <span>{cellName(turn.move.cellIndex)} · Rải {turn.move.direction === rightDirection(turn.seat) ? 'phải' : 'trái'}</span>
                  {points > 0 && <strong>+{points} điểm</strong>}
                </summary>
                <p>Đường rải · {turn.drops.map(cellName).join(' → ')}</p>
                {turn.captures.length > 0 && <p>Ô ăn được · {turn.captures.map(capture =>
                  `${cellName(capture.cellIndex)} (+${capture.points}${capture.quan ? ', có Quan' : ''})`).join(' · ')}</p>}
              </details>
            </li>;
          })}
        </ol>}
      </div>
    </section>
  </div>, viewport);
}
