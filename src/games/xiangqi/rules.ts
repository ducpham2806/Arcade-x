/**
 * Xiangqi (Chinese Chess / Cờ Tướng) Rules & Legal Move Engine
 * Board is 9 columns x 10 rows (0..8 x 0..9)
 * RED is usually at the bottom (y: 7..9), BLACK is at the top (y: 0..2)
 */

export type PieceColor = 'r' | 'b'; // r = Red, b = Black
export type PieceType = 'k' | 'a' | 'e' | 'r' | 'c' | 'h' | 'p'; 
// k: King (Tướng/Soái), a: Advisor (Sĩ), e: Elephant (Tượng), 
// r: Rook (Xe), c: Cannon (Pháo), h: Horse (Mã), p: Pawn (Tốt/Chốt)

export interface XiangqiPiece {
  id: string;
  type: PieceType;
  color: PieceColor;
}

export type BoardMatrix = (XiangqiPiece | null)[][]; // 10 rows x 9 cols

export const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  r: {
    k: '帥', // Soái
    a: '仕', // Sĩ
    e: '相', // Tượng
    r: '俥', // Xe
    c: '砲', // Pháo
    h: '傌', // Mã
    p: '兵', // Binh
  },
  b: {
    k: '將', // Tướng
    a: '士', // Sĩ
    e: '象', // Tượng
    r: '車', // Xe
    c: '砲', // Pháo
    h: '馬', // Mã
    p: '卒', // Tốt
  },
};

export const INITIAL_XIANGQI_BOARD: BoardMatrix = [
  // Row 0 (Black baseline)
  [
    { id: 'b_r1', type: 'r', color: 'b' },
    { id: 'b_h1', type: 'h', color: 'b' },
    { id: 'b_e1', type: 'e', color: 'b' },
    { id: 'b_a1', type: 'a', color: 'b' },
    { id: 'b_k', type: 'k', color: 'b' },
    { id: 'b_a2', type: 'a', color: 'b' },
    { id: 'b_e2', type: 'e', color: 'b' },
    { id: 'b_h2', type: 'h', color: 'b' },
    { id: 'b_r2', type: 'r', color: 'b' },
  ],
  // Row 1
  [null, null, null, null, null, null, null, null, null],
  // Row 2 (Black Cannons)
  [
    null,
    { id: 'b_c1', type: 'c', color: 'b' },
    null,
    null,
    null,
    null,
    null,
    { id: 'b_c2', type: 'c', color: 'b' },
    null,
  ],
  // Row 3 (Black Pawns)
  [
    { id: 'b_p1', type: 'p', color: 'b' },
    null,
    { id: 'b_p2', type: 'p', color: 'b' },
    null,
    { id: 'b_p3', type: 'p', color: 'b' },
    null,
    { id: 'b_p4', type: 'p', color: 'b' },
    null,
    { id: 'b_p5', type: 'p', color: 'b' },
  ],
  // Row 4 (River North)
  [null, null, null, null, null, null, null, null, null],
  // Row 5 (River South)
  [null, null, null, null, null, null, null, null, null],
  // Row 6 (Red Pawns)
  [
    { id: 'r_p1', type: 'p', color: 'r' },
    null,
    { id: 'r_p2', type: 'p', color: 'r' },
    null,
    { id: 'r_p3', type: 'p', color: 'r' },
    null,
    { id: 'r_p4', type: 'p', color: 'r' },
    null,
    { id: 'r_p5', type: 'p', color: 'r' },
  ],
  // Row 7 (Red Cannons)
  [
    null,
    { id: 'r_c1', type: 'c', color: 'r' },
    null,
    null,
    null,
    null,
    null,
    { id: 'r_c2', type: 'c', color: 'r' },
    null,
  ],
  // Row 8
  [null, null, null, null, null, null, null, null, null],
  // Row 9 (Red baseline)
  [
    { id: 'r_r1', type: 'r', color: 'r' },
    { id: 'r_h1', type: 'h', color: 'r' },
    { id: 'r_e1', type: 'e', color: 'r' },
    { id: 'r_a1', type: 'a', color: 'r' },
    { id: 'r_k', type: 'k', color: 'r' },
    { id: 'r_a2', type: 'a', color: 'r' },
    { id: 'r_e2', type: 'e', color: 'r' },
    { id: 'r_h2', type: 'h', color: 'r' },
    { id: 'r_r2', type: 'r', color: 'r' },
  ],
];

export function cloneBoard(board: BoardMatrix): BoardMatrix {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

/**
 * Validates whether a move from (fromR, fromC) to (toR, toC) is legal under Xiangqi rules
 */
export function getLegalMovesForPiece(
  board: BoardMatrix,
  fromR: number,
  fromC: number
): [number, number][] {
  const piece = board[fromR]?.[fromC];
  if (!piece) return [];

  const moves: [number, number][] = [];
  const color = piece.color;
  const isRed = color === 'r';

  const isInsidePalace = (r: number, c: number, forRed: boolean) => {
    if (c < 3 || c > 5) return false;
    return forRed ? r >= 7 && r <= 9 : r >= 0 && r <= 2;
  };

  const isEnemyOrEmpty = (r: number, c: number) => {
    if (r < 0 || r > 9 || c < 0 || c > 8) return false;
    const dest = board[r][c];
    return !dest || dest.color !== color;
  };

  switch (piece.type) {
    case 'k': {
      // King / General: 1 step orthogonal within Palace + Flying General rule check
      const deltas = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ];
      for (const [dr, dc] of deltas) {
        const nr = fromR + dr;
        const nc = fromC + dc;
        if (isInsidePalace(nr, nc, isRed) && isEnemyOrEmpty(nr, nc)) {
          moves.push([nr, nc]);
        }
      }
      break;
    }

    case 'a': {
      // Advisor / Sĩ: 1 step diagonal within Palace
      const deltas = [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ];
      for (const [dr, dc] of deltas) {
        const nr = fromR + dr;
        const nc = fromC + dc;
        if (isInsidePalace(nr, nc, isRed) && isEnemyOrEmpty(nr, nc)) {
          moves.push([nr, nc]);
        }
      }
      break;
    }

    case 'e': {
      // Elephant / Tượng: 2 steps diagonal, cannot cross river, blocked if eye occupied
      const deltas = [
        [2, 2, 1, 1],
        [2, -2, 1, -1],
        [-2, 2, -1, 1],
        [-2, -2, -1, -1],
      ];
      for (const [dr, dc, eyeR, eyeC] of deltas) {
        const nr = fromR + dr;
        const nc = fromC + dc;
        const eyeRow = fromR + eyeR;
        const eyeCol = fromC + eyeC;

        // Cannot cross river
        const staysOnSide = isRed ? nr >= 5 && nr <= 9 : nr >= 0 && nr <= 4;
        if (
          staysOnSide &&
          isEnemyOrEmpty(nr, nc) &&
          !board[eyeRow]?.[eyeCol] // Eye must be free
        ) {
          moves.push([nr, nc]);
        }
      }
      break;
    }

    case 'h': {
      // Horse / Mã: L-shape (2+1), blocked if horse leg is obstructed
      const horseMoves = [
        // Moving up: leg at (fromR - 1, fromC)
        [-2, -1, -1, 0],
        [-2, 1, -1, 0],
        // Moving down: leg at (fromR + 1, fromC)
        [2, -1, 1, 0],
        [2, 1, 1, 0],
        // Moving left: leg at (fromR, fromC - 1)
        [-1, -2, 0, -1],
        [1, -2, 0, -1],
        // Moving right: leg at (fromR, fromC + 1)
        [-1, 2, 0, 1],
        [1, 2, 0, 1],
      ];

      for (const [dr, dc, legR, legC] of horseMoves) {
        const nr = fromR + dr;
        const nc = fromC + dc;
        const legRow = fromR + legR;
        const legCol = fromC + legC;

        if (
          nr >= 0 &&
          nr <= 9 &&
          nc >= 0 &&
          nc <= 8 &&
          !board[legRow]?.[legCol] && // Leg unobstructed
          isEnemyOrEmpty(nr, nc)
        ) {
          moves.push([nr, nc]);
        }
      }
      break;
    }

    case 'r': {
      // Rook / Xe: Straight orthogonal lines until blocked
      const dirs = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ];
      for (const [dr, dc] of dirs) {
        let step = 1;
        while (true) {
          const nr = fromR + dr * step;
          const nc = fromC + dc * step;
          if (nr < 0 || nr > 9 || nc < 0 || nc > 8) break;
          const dest = board[nr][nc];
          if (!dest) {
            moves.push([nr, nc]);
          } else {
            if (dest.color !== color) moves.push([nr, nc]);
            break;
          }
          step++;
        }
      }
      break;
    }

    case 'c': {
      // Cannon / Pháo: Straight line to move; needs exactly 1 screen to capture
      const dirs = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ];
      for (const [dr, dc] of dirs) {
        let step = 1;
        let foundScreen = false;
        while (true) {
          const nr = fromR + dr * step;
          const nc = fromC + dc * step;
          if (nr < 0 || nr > 9 || nc < 0 || nc > 8) break;
          const dest = board[nr][nc];

          if (!foundScreen) {
            if (!dest) {
              moves.push([nr, nc]);
            } else {
              foundScreen = true; // First piece is the screen
            }
          } else {
            if (dest) {
              if (dest.color !== color) {
                moves.push([nr, nc]); // Capture!
              }
              break;
            }
          }
          step++;
        }
      }
      break;
    }

    case 'p': {
      // Pawn / Tốt: 1 step forward before river; 1 step forward/left/right after river
      const forwardDir = isRed ? -1 : 1;
      const crossedRiver = isRed ? fromR <= 4 : fromR >= 5;

      // Forward step
      const fRow = fromR + forwardDir;
      if (fRow >= 0 && fRow <= 9 && isEnemyOrEmpty(fRow, fromC)) {
        moves.push([fRow, fromC]);
      }

      // Left / Right after crossing river
      if (crossedRiver) {
        if (fromC > 0 && isEnemyOrEmpty(fromR, fromC - 1)) {
          moves.push([fromR, fromC - 1]);
        }
        if (fromC < 8 && isEnemyOrEmpty(fromR, fromC + 1)) {
          moves.push([fromR, fromC + 1]);
        }
      }
      break;
    }
  }

  // Filter moves that would violate Flying General or leave King in check
  return moves.filter(([toR, toC]) => {
    const testBoard = cloneBoard(board);
    testBoard[toR][toC] = testBoard[fromR][fromC];
    testBoard[fromR][fromC] = null;
    return !hasFlyingGenerals(testBoard);
  });
}

/**
 * Check if the two Kings/Generals face each other directly along the same column without any intervening pieces
 */
export function hasFlyingGenerals(board: BoardMatrix): boolean {
  let redKingPos: [number, number] | null = null;
  let blackKingPos: [number, number] | null = null;

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const p = board[r][c];
      if (p?.type === 'k') {
        if (p.color === 'r') redKingPos = [r, c];
        else blackKingPos = [r, c];
      }
    }
  }

  if (!redKingPos || !blackKingPos) return false;
  if (redKingPos[1] !== blackKingPos[1]) return false; // Not in same column

  const col = redKingPos[1];
  const minR = Math.min(redKingPos[0], blackKingPos[0]) + 1;
  const maxR = Math.max(redKingPos[0], blackKingPos[0]);

  for (let r = minR; r < maxR; r++) {
    if (board[r][col] !== null) {
      return false; // Intervening piece found
    }
  }

  return true; // Flying general violation!
}

/**
 * Check if King of specified color is captured or alive
 */
export function findKing(board: BoardMatrix, color: PieceColor): [number, number] | null {
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const p = board[r][c];
      if (p?.type === 'k' && p.color === color) {
        return [r, c];
      }
    }
  }
  return null;
}

/**
 * Serialize Xiangqi board to JSON string for reliable Firestore storage (avoids nested array restriction)
 */
export function serializeXiangqiBoard(board: BoardMatrix): string {
  return JSON.stringify(board);
}

/**
 * Safely deserialize Xiangqi board from Firestore (supports string or array)
 */
export function deserializeXiangqiBoard(raw: any): BoardMatrix {
  if (!raw) return INITIAL_XIANGQI_BOARD;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === 10) {
        return parsed;
      }
    } catch {
      return INITIAL_XIANGQI_BOARD;
    }
  }
  if (Array.isArray(raw) && raw.length === 10) {
    return raw;
  }
  return INITIAL_XIANGQI_BOARD;
}

