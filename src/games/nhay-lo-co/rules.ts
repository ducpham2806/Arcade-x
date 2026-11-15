import type { FolkSeat } from '../folk-duel/types';

export type HopType = 'SINGLE' | 'DOUBLE';

export type NlcTurnPhase = 'THROW' | 'HOP';

export interface NlcHopStep {
  /** Các ô (1..10) cần chạm trong bước nhảy này (1 số nếu nhảy 1 chân, 2 số nếu nhảy 2 chân) */
  boxes: number[];
  expectedHop: HopType;
  pickChamHere?: boolean;
}

export interface NlcMove {
  kind: 'TURN_RESULT';
  throwSuccess: boolean;
  throwPerfect: boolean;
  hopCompleted: boolean;
  scoreGained: number;
}

export interface NlcState {
  /** Bàn hiện tại của mỗi người chơi (1..9) */
  level: { P1: number; P2: number };
  /** Các ô (1..9) đã được xây Nhà bởi P1 hoặc P2 */
  houses: Record<number, FolkSeat>;
  scores: { P1: number; P2: number };
  perfectThrows: { P1: number; P2: number };
  turn: FolkSeat;
  turnNumber: number;
  maxHousesToWin: number;
  finished: boolean;
  winner: FolkSeat | 'DRAW' | null;
  lastSummary: string;
}

export function createInitialNlcState(): NlcState {
  return {
    level: { P1: 1, P2: 1 },
    houses: {},
    scores: { P1: 0, P2: 0 },
    perfectThrows: { P1: 0, P2: 0 },
    turn: 'P1',
    turnNumber: 1,
    maxHousesToWin: 3,
    finished: false,
    winner: null,
    lastSummary: 'Đến lượt Người 1 thảy Chàm vào Ô 1!',
  };
}

export function countHouses(state: NlcState, seat: FolkSeat): number {
  return Object.values(state.houses).filter((owner) => owner === seat).length;
}

/**
 * Tính chuỗi bước nhảy chuẩn cho một lượt đi-về:
 * - Bỏ qua ô đang đặt Chàm của mình (targetBox)
 * - Bỏ qua ô đã xây Nhà của đối thủ
 * - Ô đôi (4-5, 7-8): nếu cả 2 ô đều không bị chặn -> DOUBLE; nếu 1 ô bị chặn -> SINGLE vào ô còn lại; nếu cả 2 bị chặn -> nhảy vọt qua!
 * - Ô 10 (Đầu Chùa): luôn DOUBLE để xoay người 180 độ.
 */
export function buildHopSequence(
  targetBox: number,
  houses: Record<number, FolkSeat>,
  seat: FolkSeat
): NlcHopStep[] {
  const isBlocked = (box: number) => box === targetBox || (houses[box] !== undefined && houses[box] !== seat);
  const forward: NlcHopStep[] = [];

  const groups: number[][] = [[1], [2], [3], [4, 5], [6], [7, 8], [9], [10]];
  for (const g of groups) {
    if (g.length === 1) {
      const b = g[0];
      if (b === 10) {
        forward.push({ boxes: [10], expectedHop: 'DOUBLE' });
      } else if (!isBlocked(b)) {
        forward.push({ boxes: [b], expectedHop: 'SINGLE' });
      }
    } else {
      const free = g.filter((b) => !isBlocked(b));
      if (free.length === 2) {
        forward.push({ boxes: free, expectedHop: 'DOUBLE' });
      } else if (free.length === 1) {
        forward.push({ boxes: free, expectedHop: 'SINGLE' });
      }
    }
  }

  // Lượt về từ 9 xuống 1 (bỏ 10 vì vừa đứng ở 10 xoay người)
  const backwardGroups: number[][] = [[9], [7, 8], [6], [4, 5], [3], [2], [1]];
  const backward: NlcHopStep[] = [];
  for (const g of backwardGroups) {
    if (g.length === 1) {
      const b = g[0];
      if (!isBlocked(b)) {
        backward.push({ boxes: [b], expectedHop: 'SINGLE' });
      }
    } else {
      const free = g.filter((b) => !isBlocked(b));
      if (free.length === 2) {
        backward.push({ boxes: free, expectedHop: 'DOUBLE' });
      } else if (free.length === 1) {
        backward.push({ boxes: free, expectedHop: 'SINGLE' });
      }
    }
  }

  // Đánh dấu bước ngay trước khi về qua targetBox để hiện nút Nhặt Chàm (tự động tích hợp ở lượt về)
  return [...forward, ...backward];
}

export function applyNlcTurnResult(
  rawState: NlcState,
  seat: FolkSeat,
  move: NlcMove
): { ok: boolean; error?: string; nextState: NlcState } {
  if (rawState.finished) {
    return { ok: false, error: 'Ván đấu đã kết thúc.', nextState: rawState };
  }
  if (rawState.turn !== seat) {
    return { ok: false, error: 'Chưa đến lượt của bạn.', nextState: rawState };
  }

  const next: NlcState = {
    level: { ...rawState.level },
    houses: { ...rawState.houses },
    scores: { ...rawState.scores },
    perfectThrows: { ...rawState.perfectThrows },
    turn: seat === 'P1' ? 'P2' : 'P1',
    turnNumber: rawState.turnNumber + 1,
    maxHousesToWin: rawState.maxHousesToWin,
    finished: false,
    winner: null,
    lastSummary: '',
  };

  if (!move.throwSuccess) {
    next.lastSummary = `${seat === 'P1' ? 'Người 1' : 'Người 2'} thảy Chàm ra ngoài / đạp vạch! Mất lượt.`;
    return { ok: true, nextState: next };
  }

  if (move.throwPerfect) {
    next.perfectThrows[seat] += 1;
    next.scores[seat] += 10;
  }

  if (!move.hopCompleted) {
    next.lastSummary = `${seat === 'P1' ? 'Người 1' : 'Người 2'} nhảy hụt nhịp / chống chân! Mất lượt.`;
    return { ok: true, nextState: next };
  }

  // Hoàn thành bàn hiện tại -> Xây Nhà nếu ô đó chưa có chủ, tăng bàn lên
  const completedBox = next.level[seat];
  if (!next.houses[completedBox]) {
    next.houses[completedBox] = seat;
    next.scores[seat] += 30;
  } else {
    next.scores[seat] += 20;
  }
  next.scores[seat] += Math.max(0, Math.min(50, move.scoreGained));

  const myHouses = countHouses(next, seat);
  if (myHouses >= next.maxHousesToWin || completedBox >= 9) {
    next.finished = true;
    next.winner = seat;
    next.lastSummary = `${seat === 'P1' ? 'Người 1' : 'Người 2'} đã xây đủ ${myHouses} Ngôi Nhà và chiến thắng!`;
  } else {
    // Tiến tới bàn tiếp theo chưa bị đối phương chiếm
    let nextBox = completedBox + 1;
    while (nextBox <= 9 && next.houses[nextBox] && next.houses[nextBox] !== seat) {
      nextBox += 1;
    }
    next.level[seat] = Math.min(9, nextBox);
    next.lastSummary = `Tuyệt vời! Xây xong Nhà ở Ô ${completedBox} (${myHouses}/${next.maxHousesToWin} Nhà).`;
  }

  return { ok: true, nextState: next };
}
