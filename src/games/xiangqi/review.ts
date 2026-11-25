import { INITIAL_XIANGQI_BOARD, cloneBoard, getLegalMovesForPiece, type BoardMatrix, type PieceColor } from './rules';

export interface XiangqiReviewMove {
  from?: string | [number, number];
  to?: string | [number, number];
}

function isPoint(value: XiangqiReviewMove['from']): value is [number, number] {
  return Array.isArray(value) && value.length === 2 && Number.isInteger(value[0]) && Number.isInteger(value[1])
    && value[0] >= 0 && value[0] < 10 && value[1] >= 0 && value[1] < 9;
}

export function replayXiangqiPositions(moves: readonly XiangqiReviewMove[], finalBoard: BoardMatrix): BoardMatrix[] {
  const boards = [INITIAL_XIANGQI_BOARD];
  let side: PieceColor = 'r';
  for (const { from, to } of moves) {
    if (!isPoint(from) || !isPoint(to)) return [];
    const board = boards[boards.length - 1];
    const moving = board[from[0]][from[1]];
    if (!moving || moving.color !== side || !getLegalMovesForPiece(board, ...from).some(([r, c]) => r === to[0] && c === to[1])) return [];
    const next = cloneBoard(board);
    next[to[0]][to[1]] = moving;
    next[from[0]][from[1]] = null;
    boards.push(next);
    side = side === 'r' ? 'b' : 'r';
  }
  const last = boards.at(-1)!;
  const matches = last.every((row, r) => row.every((piece, c) => piece?.id === finalBoard[r]?.[c]?.id));
  return matches ? boards : [];
}
