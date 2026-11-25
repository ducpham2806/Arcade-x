import { BOARD_TERRAIN_NAMES, type TerrainId } from '../duel/BoardTerrain';
import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { INITIAL_XIANGQI_BOARD, PIECE_SYMBOLS, isKingInCheck, type BoardMatrix, type PieceColor, type PieceType, type XiangqiPiece } from './rules';
import { usePieceMotion } from '../duel/usePieceMotion';
import './battlefield.css';

type Point = [row: number, column: number];
type Captured = Record<PieceColor, XiangqiPiece[]>;
type Move = {
  from: Point;
  to: Point;
  piece: XiangqiPiece;
  victim: XiangqiPiece | null;
  screen: Point | null;
};

const PIECE_ORDER: PieceType[] = ['k', 'a', 'e', 'r', 'c', 'h', 'p'];
const NAMES: Record<PieceType, string> = { k: 'Tướng', a: 'Sĩ', e: 'Tượng', r: 'Xe', c: 'Pháo', h: 'Mã', p: 'Tốt' };
const PIECES = INITIAL_XIANGQI_BOARD.flat().filter((piece): piece is XiangqiPiece => piece !== null);
const POSITION_LIST = INITIAL_XIANGQI_BOARD.flatMap((row, r) => row.map((_, c): Point => [r, c]));
const DELTAS: Record<string, Point> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };

function same(a: Point | null, b: Point) {
  return a?.[0] === b[0] && a[1] === b[1];
}

function findCannonScreen(previous: BoardMatrix, from: Point, to: Point): Point | null {
  const [r, c] = from;
  const [tr, tc] = to;
  if (r !== tr && c !== tc) return null;
  const dr = Math.sign(tr - r);
  const dc = Math.sign(tc - c);
  let screen: Point | null = null;
  for (let i = r + dr, j = c + dc; i !== tr || j !== tc; i += dr, j += dc) {
    if (!previous[i][j]) continue;
    if (screen) return null;
    screen = [i, j];
  }
  return screen;
}

function getMove(before: BoardMatrix, after: BoardMatrix): Move | null | undefined {
  const changed = POSITION_LIST.filter(([r, c]) => before[r][c]?.id !== after[r][c]?.id);
  if (!changed.length) return;
  if (changed.length !== 2) return null;
  const from = changed.find(([r, c]) => before[r][c] && !after[r][c]);
  const to = changed.find(([r, c]) => !!after[r][c]);
  if (!from || !to) return null;
  const piece = after[to[0]][to[1]]!;
  const victim = before[to[0]][to[1]];
  if (before[from[0]][from[1]]?.id !== piece.id || victim?.color === piece.color) return null;
  return { from, to, piece, victim, screen: piece.type === 'c' && victim ? findCannonScreen(before, from, to) : null };
}

function x(point: Point) {
  return `${(point[1] + .5) / 9 * 100}%`;
}

function y(point: Point) {
  return `${(point[0] + .5) / 10 * 100}%`;
}

function Sprite({ piece, classic, vnPieces }: { piece: XiangqiPiece; classic: boolean; vnPieces: boolean }) {
  if (classic) return <span aria-hidden="true" className={`xqb-token xqb-token-${piece.color}`}>
    {vnPieces ? NAMES[piece.type] : PIECE_SYMBOLS[piece.color][piece.type]}
  </span>;
  return <span aria-hidden="true" className="xqb-sprite" style={{
    backgroundPosition: `${PIECE_ORDER.indexOf(piece.type) / 6 * 100}% ${piece.color === 'r' ? 0 : 100}%`,
  }}/>;
}

function Motion({ move, classic, vnPieces, captureOnly = false }: { move: Move; classic: boolean; vnPieces: boolean; captureOnly?: boolean }) {
  const { from, to, piece, victim, screen } = move;
  const [dr, dc] = [to[0] - from[0], to[1] - from[1]];
  const horseCorner: Point = Math.abs(dr) === 2 ? [to[0], from[1]] : [from[0], to[1]];
  const position = {
    '--from-x': x(from), '--from-y': y(from), '--to-x': x(to), '--to-y': y(to),
    '--turn-x': x(horseCorner), '--turn-y': y(horseCorner),
    '--vault-x': screen ? x(screen) : x(from), '--vault-y': screen ? y(screen) : y(from),
    '--shot-angle': `${Math.atan2(dr, dc)}rad`,
    '--facing': dc < 0 ? -1 : 1,
    '--impact-at': screen ? '286ms' : '255ms',
    '--flight-at': screen ? '342ms' : '311ms',
    '--tray-y': piece.color === 'r' ? '104%' : '-4%',
  } as CSSProperties;
  const gait = piece.type === 'h' || piece.type === 'k' || piece.type === 'e' ? 'mounted' : piece.type === 'r' || piece.type === 'c' ? 'wheeled' : 'foot';
  return (
    <div className={`xqb-motion xqb-${gait}${screen ? ' xqb-cannon' : ''}${piece.type === 'h' ? ' xqb-horse' : ''}${victim ? ' xqb-capture' : ''}`}
      style={position} data-xqb-move={captureOnly ? undefined : piece.type} data-xqb-screen={captureOnly ? undefined : screen?.join(',')} aria-hidden="true">
      {!captureOnly && screen && <>
        <span className="xqb-screen"/>
        <span className="xqb-shell"/>
      </>}
      {!captureOnly && <span className="xqb-mover">
        <span className="xqb-ground-shadow"/>
        <span className="xqb-stance"><Sprite piece={piece} classic={classic} vnPieces={vnPieces}/></span>
      </span>}
      {captureOnly && victim && <>
        {!screen && <span className="xqb-strike"/>}
        <span className="xqb-impact"/>
        <span className="xqb-victim"><Sprite piece={victim} classic={classic} vnPieces={vnPieces}/></span>
      </>}
    </div>
  );
}

function Tray({ color, captured, classic, vnPieces }: { color: PieceColor; captured: XiangqiPiece[]; classic: boolean; vnPieces: boolean }) {
  const side = color === 'r' ? 'Đỏ' : 'Đen';
  return (
    <div className={`xqb-tray xqb-tray-${color}`} data-xqb-tray={color} aria-label={`Phe ${side} đã ăn ${captured.length} quân`}>
      <strong>{side}</strong>
      <div className="xqb-tray-pieces">
        {captured.map(piece => <span className="xqb-prisoner" key={piece.id} title={NAMES[piece.type]}><Sprite piece={piece} classic={classic} vnPieces={vnPieces}/></span>)}
      </div>
      <span className="xqb-tray-count">{captured.length}</span>
    </div>
  );
}

interface Props {
  board: BoardMatrix;
  selected: Point | null;
  pending: Point | null;
  legalMoves: Point[];
  vnPieces: boolean;
  paused: boolean;
  motionEnabled: boolean;
  classic?: boolean;
  terrain?: TerrainId<'xiangqi'>;
  readOnly?: boolean;
  onCell: (row: number, column: number) => void;
}

export function BattlefieldBoard({ board, selected, pending, legalMoves, vnPieces, paused, motionEnabled, classic = false, terrain = 'river', readOnly = false, onCell }: Props) {
  const previous = useRef(board);
  const { moving, capture, play, stop } = usePieceMotion<Move>();
  const [focusIndex, setFocusIndex] = useState(9 * 9 + 4);
  const grid = useRef<HTMLDivElement>(null);
  const checked = useMemo(() => ({ r: isKingInCheck(board, 'r'), b: isKingInCheck(board, 'b') }), [board]);
  const captured = useMemo<Captured>(() => {
    const live = new Set(board.flat().map(piece => piece?.id));
    return {
      r: PIECES.filter(piece => piece.color === 'b' && !live.has(piece.id)),
      b: PIECES.filter(piece => piece.color === 'r' && !live.has(piece.id)),
    };
  }, [board]);

  useLayoutEffect(() => {
    const before = previous.current;
    previous.current = board;
    if (paused || !motionEnabled) {
      stop();
      return;
    }
    const move = getMove(before, board);
    if (move === undefined) return;
    if (!move) {
      stop();
      return;
    }
    play(move, move.screen ? 595 : move.victim ? 335 : 295, move.victim ? 565 : undefined);
  }, [board, paused, motionEnabled, play, stop]);

  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, row: number, column: number) {
    const delta = DELTAS[event.key];
    if (!delta) return;
    event.preventDefault();
    const index = Math.max(0, Math.min(9, row + delta[0])) * 9 + Math.max(0, Math.min(8, column + delta[1]));
    grid.current?.querySelectorAll('button')[index]?.focus();
  }

  const captureInFlight = capture?.victim;
  return (
    <div className={classic ? "xqb xqb-classic" : "xqb"} data-board-terrain={classic ? "classic" : terrain} data-chat-protect="true">
      <div className="xqb-title">{classic ? "Bàn cổ điển" : BOARD_TERRAIN_NAMES.xiangqi[terrain]}</div>
      <Tray color="b" captured={captured.b.filter(piece => piece.id !== captureInFlight?.id)} classic={classic} vnPieces={vnPieces}/>
      <div className="xqb-board">
        <div className="xqb-lines" aria-hidden="true">
          <span className="xqb-palace xqb-palace-north"/>
          <span className="xqb-palace xqb-palace-south"/>
        </div>
        <div className="xqb-river" aria-hidden="true"><span>楚 河</span><span>漢 界</span></div>
        <div ref={grid} className="xqb-grid" role="group" aria-label="Bàn cờ tướng, 9 cột và 10 hàng">
          {POSITION_LIST.map(([r, c], index) => {
            const piece = board[r]?.[c];
            const target = legalMoves.some(point => same(point, [r, c]));
            const name = piece ? (piece.type === 'k' && piece.color === 'r' ? 'Soái' : NAMES[piece.type]) : '';
            const glyph = piece && (vnPieces ? name : PIECE_SYMBOLS[piece.color][piece.type]);
            const inCheck = piece?.type === 'k' && checked[piece.color];
            return (
              <button key={index} type="button" data-xqb-cell={`${r},${c}`} data-xqb-piece={piece?.id}
                className={`xqb-cell${same(selected, [r,c]) ? ' xqb-selected' : ''}${inCheck ? ' xqb-checked' : ''}${target ? ' xqb-legal' : ''}${target && piece ? ' xqb-target' : ''}${same(pending, [r,c]) ? ' xqb-pending' : ''}`}
                aria-label={`Hàng ${r + 1}, cột ${c + 1}${piece ? `, ${name} ${piece.color === 'r' ? 'Đỏ' : 'Đen'}${inCheck ? ', đang bị chiếu' : ''}` : ''}`}
                aria-pressed={same(selected, [r,c])}
                tabIndex={index === focusIndex ? 0 : -1} onFocus={() => setFocusIndex(index)}
                onKeyDown={event => moveFocus(event, r, c)} aria-disabled={readOnly || undefined} onClick={() => { if (!readOnly) onCell(r, c); }}>
                {piece && <span className={`xqb-piece xqb-piece-${piece.color}${same(moving?.to ?? null, [r,c]) ? ' xqb-piece-in-motion' : ''}`}>
                  <Sprite piece={piece} classic={classic} vnPieces={vnPieces}/>{!classic && <span className="xqb-glyph" aria-hidden="true">{glyph}</span>}
                </span>}
              </button>
            );
          })}
        </div>
        {moving && <Motion key={`move:${moving.piece.id}:${moving.to}`} move={moving} classic={classic} vnPieces={vnPieces}/>}
        {capture && <Motion key={`capture:${capture.victim?.id}`} move={capture} classic={classic} vnPieces={vnPieces} captureOnly/>}
      </div>
      <Tray color="r" captured={captured.r.filter(piece => piece.id !== captureInFlight?.id)} classic={classic} vnPieces={vnPieces}/>
    </div>
  );
}
