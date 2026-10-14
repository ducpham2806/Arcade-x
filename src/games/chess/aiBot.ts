import { Chess, Square, Move } from 'chess.js';
import { SimpleAI, MinimaxGameRule } from '../../services/SimpleAI';

// Piece value weights (Centipawns)
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-Square Tables (from White's perspective; mirrored for Black)
const PAWN_PST = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const KNIGHT_PST = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];

const BISHOP_PST = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 5, 5, 10, 10, 5, 5, -10],
  [-10, 0, 10, 10, 10, 10, 0, -10],
  [-10, 10, 10, 10, 10, 10, 10, -10],
  [-10, 5, 0, 0, 0, 0, 5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20],
];

const ROOK_PST = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 10, 10, 10, 10, 10, 10, 5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [0, 0, 0, 5, 5, 0, 0, 0],
];

const QUEEN_PST = [
  [-20, -10, -10, -5, -5, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-5, 0, 5, 5, 5, 5, 0, -5],
  [0, 0, 5, 5, 5, 5, 0, -5],
  [-10, 5, 5, 5, 5, 5, 0, -10],
  [-10, 0, 5, 0, 0, 0, 0, -10],
  [-20, -10, -10, -5, -5, -10, -10, -20],
];

const KING_MID_PST = [
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [20, 30, 10, 0, 0, 10, 30, 20],
];

export function evaluateBoard(chess: Chess): number {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -99999 : 99999;
  }
  if (chess.isDraw()) {
    return 0;
  }

  let totalScore = 0;
  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const isWhite = piece.color === 'w';
      const baseVal = PIECE_VALUES[piece.type] || 0;
      let posVal = 0;

      const rowIdx = isWhite ? r : 7 - r;
      const colIdx = isWhite ? c : 7 - c;

      switch (piece.type) {
        case 'p':
          posVal = PAWN_PST[rowIdx][colIdx];
          break;
        case 'n':
          posVal = KNIGHT_PST[rowIdx][colIdx];
          break;
        case 'b':
          posVal = BISHOP_PST[rowIdx][colIdx];
          break;
        case 'r':
          posVal = ROOK_PST[rowIdx][colIdx];
          break;
        case 'q':
          posVal = QUEEN_PST[rowIdx][colIdx];
          break;
        case 'k':
          posVal = KING_MID_PST[rowIdx][colIdx];
          break;
      }

      const pieceTotal = baseVal + posVal;
      totalScore += isWhite ? pieceTotal : -pieceTotal;
    }
  }

  return totalScore;
}

export function getBestChessMove(
  fen: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): { from: Square; to: Square; promotion?: string } | null {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;
  for(const m of moves){chess.move(m);const mate=chess.isCheckmate();chess.undo();if(mate)return {from:m.from,to:m.to,...(m.promotion?{promotion:m.promotion}:{})};}
  const isWhite = chess.turn() === 'w';

  if (difficulty === 'easy') {
    if (Math.random() < 0.4) {
      const captures = moves.filter((m) => m.captured);
      if (captures.length > 0) {
        const picked = captures[Math.floor(Math.random() * captures.length)];
        return { from: picked.from, to: picked.to, promotion: picked.promotion };
      }
    }
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    return { from: randomMove.from, to: randomMove.to, promotion: randomMove.promotion };
  }

  const deadline=performance.now()+(difficulty==='hard'?850:300);
  const timeout={};
  const search=(state:Chess,depth:number,alpha:number,beta:number):number=>{
    if(performance.now()>deadline)throw timeout;
    if(state.isCheckmate())return -100000-depth;
    if(!depth||state.isGameOver())return evaluateBoard(state)*(state.turn()==='w'?1:-1);
    let best=-Infinity;
    const options=state.moves({verbose:true}).sort((a,b)=>(b.captured?PIECE_VALUES[b.captured]:0)-(a.captured?PIECE_VALUES[a.captured]:0));
    for(const m of options){state.move(m);let score;try{score=-search(state,depth-1,-beta,-alpha);}finally{state.undo();}best=Math.max(best,score);alpha=Math.max(alpha,score);if(alpha>=beta)break;}
    return best;
  };
  let best=moves[0];
  for(let depth=1;depth<=(difficulty==='hard'?4:2);depth++){
    let candidate=best,value=-Infinity;
    try{
      for(const m of moves){chess.move(m);let v;try{v=-search(chess,depth-1,-Infinity,Infinity);}finally{chess.undo();}if(v>value){candidate=m;value=v;}}
      best=candidate;
    }catch(e){if(e!==timeout)throw e;break;}
  }
  return {from:best.from,to:best.to,...(best.promotion?{promotion:best.promotion}:{})};
}
