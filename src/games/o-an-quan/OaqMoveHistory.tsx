import { useEffect, useMemo, useRef } from 'react';
import { BoardReview, useBoardReview } from '../duel/BoardReview';
import { getSkinById } from '../folk-duel/skins-catalog';
import { campaignUniform, type OaqTerrain } from './battlefield';
import { BOARD_H, BOARD_W, renderOAnQuanBoard } from './renderer';
import { replayOaqPositions } from './review';
import { useCampaignImages } from './useCampaignImages';
import { createPortal } from 'react-dom';
import { useDialogFocus } from '../../launcher/useDialogFocus';
import type { EquippedFolkSkins, FolkSeat } from '../folk-duel/types';
import type { OaqDirection, OaqState, OaqTurn } from './rules';

const cellName = (index: number) => index === 0 ? 'Quan trái' : index === 6 ? 'Quan phải' : `ô ${index}`;
export const rightDirection = (seat: FolkSeat): OaqDirection => seat === 'P1' ? 'CW' : 'CCW';

function HistoryBoard({ state, turn, skins, terrain }: { state: OaqState; turn?: OaqTurn; skins: EquippedFolkSkins; terrain: OaqTerrain }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const images = useCampaignImages(terrain !== 'classic');
  const units = useMemo(() => images.units && campaignUniform(images.units, getSkinById(skins.oaq_stones)), [images.units, skins.oaq_stones]);
  useEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (!ctx) return;
    const field = terrain === 'classic' ? undefined : { terrain, ...images, units };
    renderOAnQuanBoard(ctx, state, skins, turn?.move.cellIndex ?? null, turn?.drops ?? [], state, field);
  }, [state, turn, skins, terrain, images, units]);

  return <canvas ref={canvas} className="fd-pixel-canvas oaq-history-board" width={BOARD_W} height={BOARD_H}
    role="img" aria-label={`Thế bàn ${turn ? `sau lượt ${turn.turn}` : 'xuất phát'}. Điểm người 1: ${state.scores.P1}. Điểm người 2: ${state.scores.P2}.`}/>;
}

export function OaqMoveHistory({ turns, state, skins, terrain, names, onClose }: {
  turns: OaqTurn[];
  state: OaqState;
  skins: EquippedFolkSkins;
  terrain: OaqTerrain;
  names: Record<FolkSeat, string>;
  onClose: () => void;
}) {
  const dialog = useDialogFocus(onClose);
  const positions = useMemo(() => replayOaqPositions(turns, state), [turns, state]);
  const review = useBoardReview(true, Math.max(0, positions.length - 1));
  const selectedTurn = turns[review.index - 1];
  const viewport = document.getElementById('game-wrapper-viewport') ?? document.body;
  return createPortal(<div className="fd-overlay oaq-history-overlay" onClick={onClose}>
    <section ref={dialog} className="fd-modal-shell oaq-history" data-modal-skin="authored" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="oaq-history-title"
      onClick={event => event.stopPropagation()}>
      <header className="fd-modal-header">
        <h2 id="oaq-history-title">Lịch sử lượt đi</h2>
        <button type="button" className="fd-close-btn" aria-label="Đóng lịch sử" onClick={onClose}>×</button>
      </header>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar oaq-history-list">
        {positions.length > 1 && <>
          <BoardReview {...review} count={positions.length - 1} label={selectedTurn && names[selectedTurn.seat]}/>
          <HistoryBoard state={positions[review.index]} turn={selectedTurn} skins={skins} terrain={terrain}/>
        </>}
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
