import { BOARD_TERRAIN_NAMES, type TerrainId } from '../duel/BoardTerrain';
import { Chess, type Color, type Move, type PieceSymbol, type Square } from 'chess.js';
import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { acceptedCitadelMove, citadelRookMove, citadelVictimSquare, replayCitadelCaptures } from './citadelMoves';
import { ChessPiece } from '../../visuals/ChessPiece';
import { usePieceMotion } from '../duel/usePieceMotion';
import '../duel/board-vfx.css';
import './citadel.css';

const ORDER: PieceSymbol[] = ['k', 'q', 'r', 'b', 'n', 'p'];
export const CITADEL_NAMES: Record<PieceSymbol, string> = { k: 'Vua', q: 'Hậu', r: 'Xe', b: 'Tượng', n: 'Mã', p: 'Tốt' };
const SIDES: Record<Color, string> = { w: 'Ngà Vàng', b: 'Hắc Thạch' };
const STEPS: Record<string, [number, number]> = {
  ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1],
};

function opposite(color: Color): Color {
  return color === 'w' ? 'b' : 'w';
}

function boardSquare(index: number, orientation: Color): Square {
  const row = Math.floor(index / 8);
  const col = index % 8;
  return `${String.fromCharCode(orientation === 'w' ? 97 + col : 104 - col)}${orientation === 'w' ? 8 - row : row + 1}` as Square;
}

function position(square: Square, orientation: Color) {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]);
  const col = orientation === 'w' ? file : 7 - file;
  const row = orientation === 'w' ? 8 - rank : rank - 1;
  return { x: `${(col + .5) * 12.5}%`, y: `${(row + .5) * 12.5}%` };
}

export function CitadelPiece({ type, color, classic }: { type: PieceSymbol; color: Color; classic?: boolean }) {
  if (classic) return <span className="citadel-sprite citadel-statue" aria-hidden="true"><ChessPiece type={type} color={color}/></span>;
  return <span aria-hidden="true" className="citadel-sprite" style={{
    backgroundPosition: `${ORDER.indexOf(type) * 20}% ${color === 'w' ? 0 : 100}%`,
  }}/>;
}

function MotionPiece({ path, orientation, color, type, promotion, attacking, classic }: {
  path: { from: Square; to: Square };
  orientation: Color;
  color: Color;
  type: PieceSymbol;
  promotion?: PieceSymbol;
  attacking?: boolean;
  classic?: boolean;
}) {
  const start = position(path.from, orientation);
  const end = position(path.to, orientation);
  const direction = parseFloat(end.x) < parseFloat(start.x) ? -1 : 1;
  const style = {
    '--x0': start.x, '--y0': start.y, '--x1': end.x, '--y1': end.y, '--facing': direction,
  } as CSSProperties;
  const gait = type === 'r' ? 'roll' : type === 'n' ? 'leap' : 'step';
  return (
    <span className={`citadel-mover citadel-${gait}${attacking ? ' citadel-attacking' : ''}`}
      style={style} data-citadel-motion-piece={type}>
      <span className="citadel-foot-shadow"/>
      <span className="citadel-stance">
        <span className={promotion ? 'citadel-before-promotion' : undefined}><CitadelPiece type={type} color={color} classic={classic}/></span>
      </span>
      {promotion && <span className="citadel-after-promotion" data-citadel-promotion={promotion}>
        <CitadelPiece type={promotion} color={color} classic={classic}/>
      </span>}
    </span>
  );
}

function Animation({ move, orientation, classic, captureOnly = false }: { move: Move; orientation: Color; classic: boolean; captureOnly?: boolean }) {
  const rook = citadelRookMove(move);
  const victimSquare = citadelVictimSquare(move);
  const victim = position(victimSquare, orientation);
  const landing = position(move.to, orientation);
  const trayY = move.color === orientation ? '104%' : '-4%';
  return (
    <div className="citadel-animation" aria-hidden="true" data-citadel-animation={captureOnly ? undefined : rook ? 'castle' : move.san}>
      {!captureOnly && <MotionPiece path={move} orientation={orientation} color={move.color} type={move.piece} promotion={move.promotion} attacking={!!move.captured} classic={classic}/>}
      {!captureOnly && rook && <MotionPiece path={rook} orientation={orientation} color={move.color} type="r" classic={classic}/>}
      {!captureOnly && move.promotion && <span className="citadel-promotion-fx" data-promotion-side={move.color}
        style={{ left: landing.x, top: landing.y }}/>}
      {captureOnly && move.captured && (
        <div className="citadel-capture" data-citadel-victim={victimSquare} data-capture-side={move.color}
          style={{ '--victim-x': victim.x, '--victim-y': victim.y, '--tray-y': trayY } as CSSProperties}>
          {!move.isEnPassant() && <span className="citadel-strike"/>}
          <span className="citadel-shatter"/>
          <span className="board-arrival"/>
          <span className="citadel-victim"><CitadelPiece type={move.captured} color={opposite(move.color)} classic={classic}/></span>
        </div>
      )}
    </div>
  );
}

function Tray({ owner, pieces, classic }: { owner: Color; pieces: PieceSymbol[] | null; classic: boolean }) {
  return (
    <div className={`citadel-tray citadel-tray-${owner}`} data-citadel-tray={owner}
      aria-label={pieces ? `${SIDES[owner]} ăn ${pieces.length} quân` : `${SIDES[owner]} chưa có đủ lịch sử quân bị ăn`}>
      <strong>{SIDES[owner]}</strong>
      <div className="citadel-tray-pieces">
        {pieces?.map((type, index) => <span key={index} title={CITADEL_NAMES[type]}><CitadelPiece type={type} color={opposite(owner)} classic={classic}/></span>)}
      </div>
      <span className="citadel-tray-count">{pieces?.length ?? '—'}</span>
    </div>
  );
}

interface Props {
  fen: string;
  history: readonly string[];
  initialFen?: string;
  orientation: Color;
  selected: Square | null;
  legal: readonly Square[];
  pending: Square | null;
  paused?: boolean;
  motionEnabled: boolean;
  classic?: boolean;
  terrain?: TerrainId<'chess'>;
  readOnly?: boolean;
  onMotionChange?: (active: boolean) => void;
  onSquare: (square: Square) => void;
}

export function CitadelBoard({ fen, history, initialFen, orientation, selected, legal, pending, paused, motionEnabled, classic = false, terrain = 'citadel', readOnly = false, onMotionChange, onSquare }: Props) {
  const engine = useMemo(() => new Chess(fen), [fen]);
  const captured = useMemo(() => replayCitadelCaptures(history, fen, initialFen), [history, fen, initialFen]);
  const previous = useRef(fen);
  const { moving: move, capture, play, stop } = usePieceMotion<Move>(onMotionChange);
  const [last, setLast] = useState<Move>();
  const [focus, setFocus] = useState(60);
  const grid = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const before = previous.current;
    previous.current = fen;
    const transition = acceptedCitadelMove(before, fen);
    if (before !== fen) setLast(transition);
    if (!transition || paused || !motionEnabled) {
      stop();
      return;
    }
    play(transition, transition.promotion ? 520 : transition.captured ? 330 : 285, transition.captured ? 495 : undefined);
  }, [fen, paused, motionEnabled, orientation, play, stop]);

  function keyMove(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const delta = STEPS[event.key];
    if (!delta) return;
    event.preventDefault();
    const row = Math.max(0, Math.min(7, Math.floor(index / 8) + delta[0]));
    const col = Math.max(0, Math.min(7, index % 8 + delta[1]));
    grid.current?.querySelectorAll('button')[row * 8 + col]?.focus();
  }

  function showTray(color: Color) {
    if (!captured) return null;
    const pieces = captured[color];
    if (!capture?.captured || capture.color !== color) return pieces;
    const index = pieces.lastIndexOf(capture.captured);
    return index < 0 ? pieces : pieces.filter((_, i) => i !== index);
  }

  const checked = engine.inCheck();
  const rook = move && citadelRookMove(move);
  const upper = opposite(orientation);
  return (
    <section className={classic ? "citadel citadel-classic" : "citadel"} data-board-terrain={classic ? "classic" : terrain} data-chat-protect="true" aria-label={classic ? "Bàn Cờ vua cổ điển" : "Bàn Thành Trì Huyền Thuật"}>
      <div className="citadel-heading">
        <strong>{classic ? "Bàn cổ điển" : BOARD_TERRAIN_NAMES.chess[terrain]}</strong>
        <span>{engine.isCheckmate() ? 'Chiếu bí' : checked ? 'Đang chiếu' : history.at(-1) || ''}</span>
      </div>
      <Tray owner={upper} pieces={showTray(upper)} classic={classic}/>
      <div className="citadel-stage" id="chess-board" data-citadel-orientation={orientation}>
        <div ref={grid} className="citadel-grid" role="group" aria-label="Bàn cờ vua, 8 cột và 8 hàng">
          {Array.from({ length: 64 }, (_, index) => {
            const square = boardSquare(index, orientation);
            const piece = engine.get(square);
            const destination = legal.includes(square);
            const isChecked = checked && piece?.type === 'k' && piece.color === engine.turn();
            const moving = move?.to === square || rook?.to === square;
            return (
              <button key={square} type="button" id={`chess-sq-${square}`}
                className={`citadel-square${selected === square ? ' citadel-selected' : ''}${destination ? ' citadel-legal' : ''}${destination && piece ? ' citadel-target' : ''}${pending === square ? ' citadel-pending' : ''}${isChecked ? ' citadel-check' : ''}${last?.from === square || last?.to === square ? ' citadel-last' : ''}`}
                data-tone={(Math.floor(index / 8) + index % 8) % 2 === 0 ? "light" : "dark"} data-citadel-square={square} data-citadel-piece={piece ? `${piece.color}${piece.type}` : undefined}
                aria-label={`${square}${piece ? `, ${CITADEL_NAMES[piece.type]} ${piece.color === 'w' ? 'Trắng' : 'Đen'}` : ''}${isChecked ? ', bị chiếu' : ''}`}
                aria-pressed={selected === square} tabIndex={focus === index ? 0 : -1}
                onFocus={() => setFocus(index)} onKeyDown={event => keyMove(event, index)} aria-disabled={readOnly || undefined} onClick={() => { if (!readOnly) onSquare(square); }}>
                {index % 8 === 0 && <span className="citadel-rank" aria-hidden="true">{square[1]}</span>}
                {index >= 56 && <span className="citadel-file" aria-hidden="true">{square[0]}</span>}
                {piece && <span className={`citadel-unit${moving ? ' citadel-in-motion' : ''}`}>
                  <CitadelPiece type={piece.type} color={piece.color} classic={classic}/>
                </span>}
              </button>
            );
          })}
        </div>
        {move && <Animation key={move.after} move={move} orientation={orientation} classic={classic}/>}
        {capture && <Animation key={`capture:${capture.after}`} move={capture} orientation={orientation} classic={classic} captureOnly/>}
      </div>
      <Tray owner={orientation} pieces={showTray(orientation)} classic={classic}/>
    </section>
  );
}
