import type { FolkSeat } from '../folk-duel/types';

export type OaqDirection = 'CW' | 'CCW'; // CW: tăng chỉ số (+1), CCW: giảm chỉ số (-1)

export interface OaqMove {
  cellIndex: number; // P1: 1..5, P2: 7..11
  direction: OaqDirection;
}

export interface OaqStepEvent {
  type: 'pickup' | 'drop' | 'capture' | 'resow' | 'stop';
  cellIndex: number;
  count: number;
  seat: FolkSeat;
  isQuan?: boolean;
}

export interface OaqState {
  /** 12 ô: 0 = Quan Trái, 1..5 = Dân P1 (Dưới), 6 = Quan Phải, 7..11 = Dân P2 (Trên) */
  cells: number[];
  /** Giá trị điểm Quan còn lại ở ô 0 và 6 (mỗi ô Quan khởi đầu = 10 điểm, 1 viên Quan) */
  quanAlive: [boolean, boolean]; // [ô 0, ô 6]
  scores: { P1: number; P2: number };
  debt: { P1: number; P2: number };
  quanCaptured: { P1: number; P2: number };
  turn: FolkSeat;
  turnNumber: number;
  finished: boolean;
  winner: FolkSeat | 'DRAW' | null;
  lastMove?: OaqMove;
  lastCapturedPoints: number;
  lastComboCount: number;
}

export const QUAN_VALUE = 10;

export function createInitialOaqState(): OaqState {
  // Ô 0 và 6 chứa 1 viên Quan (đếm 1 viên vật lý nhưng quy đổi 10 điểm khi ăn)
  // Để thống nhất logic rải/hiển thị: cells[0] và cells[6] lưu số quân Dân cộng thêm vào ô Quan;
  // quanAlive[0]/[1] đánh dấu viên đá Quan lớn còn nằm trong ô đó hay không.
  return {
    cells: [0, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5],
    quanAlive: [true, true],
    scores: { P1: 0, P2: 0 },
    debt: { P1: 0, P2: 0 },
    quanCaptured: { P1: 0, P2: 0 },
    turn: 'P1',
    turnNumber: 1,
    finished: false,
    winner: null,
    lastCapturedPoints: 0,
    lastComboCount: 0,
  };
}

export function isQuanCell(idx: number): boolean {
  return idx === 0 || idx === 6;
}

export function getQuanSlot(idx: number): 0 | 1 | null {
  if (idx === 0) return 0;
  if (idx === 6) return 1;
  return null;
}

export function cellTotalStones(state: OaqState, idx: number): number {
  const qSlot = getQuanSlot(idx);
  const quanCount = qSlot !== null && state.quanAlive[qSlot] ? 1 : 0;
  return state.cells[idx] + quanCount;
}

export function cellPointValue(state: OaqState, idx: number): number {
  const qSlot = getQuanSlot(idx);
  const quanPts = qSlot !== null && state.quanAlive[qSlot] ? QUAN_VALUE : 0;
  return state.cells[idx] + quanPts;
}

export function getOwnRange(seat: FolkSeat): number[] {
  return seat === 'P1' ? [1, 2, 3, 4, 5] : [7, 8, 9, 10, 11];
}

export function getValidOaqMoves(state: OaqState, seat: FolkSeat): OaqMove[] {
  if (state.finished) return [];
  const range = getOwnRange(seat);
  const moves: OaqMove[] = [];
  for (const idx of range) {
    if (state.cells[idx] > 0) {
      moves.push({ cellIndex: idx, direction: 'CW' });
      moves.push({ cellIndex: idx, direction: 'CCW' });
    }
  }
  return moves;
}

function stepIndex(idx: number, dir: OaqDirection): number {
  return dir === 'CW' ? (idx + 1) % 12 : (idx + 11) % 12;
}

/** Rải sinh nếu 5 ô Dân của người sắp đi đều bằng 0 */
export function ensureSideHasStones(state: OaqState, seat: FolkSeat): OaqState {
  const range = getOwnRange(seat);
  const sum = range.reduce((acc, idx) => acc + state.cells[idx], 0);
  if (sum > 0) return state;
  if (!state.quanAlive[0] && !state.quanAlive[1] && state.cells[0] === 0 && state.cells[6] === 0) {
    return state;
  }

  const next = cloneOaqState(state);
  const opponent: FolkSeat = seat === 'P1' ? 'P2' : 'P1';
  if (next.scores[seat] >= 5) {
    next.scores[seat] -= 5;
  } else {
    const needed = 5 - next.scores[seat];
    next.scores[seat] = 0;
    next.debt[seat] += needed;
    // Ghi nhận nợ với đối phương
    void opponent;
  }
  for (const idx of range) {
    next.cells[idx] = 1;
  }
  return next;
}

export function cloneOaqState(s: OaqState): OaqState {
  return {
    cells: [...s.cells],
    quanAlive: [s.quanAlive[0], s.quanAlive[1]],
    scores: { ...s.scores },
    debt: { ...s.debt },
    quanCaptured: { ...s.quanCaptured },
    turn: s.turn,
    turnNumber: s.turnNumber,
    finished: s.finished,
    winner: s.winner,
    lastMove: s.lastMove ? { ...s.lastMove } : undefined,
    lastCapturedPoints: s.lastCapturedPoints,
    lastComboCount: s.lastComboCount,
  };
}

export function applyOaqMove(
  rawState: OaqState,
  seat: FolkSeat,
  move: OaqMove
): { ok: boolean; error?: string; nextState: OaqState; steps: OaqStepEvent[] } {
  if (rawState.finished) {
    return { ok: false, error: 'Ván đấu đã kết thúc.', nextState: rawState, steps: [] };
  }
  if (rawState.turn !== seat) {
    return { ok: false, error: 'Chưa đến lượt của bạn.', nextState: rawState, steps: [] };
  }

  const state = ensureSideHasStones(rawState, seat);
  const validRange = getOwnRange(seat);
  if (!validRange.includes(move.cellIndex) || state.cells[move.cellIndex] <= 0) {
    return { ok: false, error: 'Ô được chọn không hợp lệ hoặc không có quân.', nextState: rawState, steps: [] };
  }

  const steps: OaqStepEvent[] = [];
  let cursor = move.cellIndex;
  let hand = state.cells[cursor];
  state.cells[cursor] = 0;
  steps.push({ type: 'pickup', cellIndex: cursor, count: hand, seat });

  let loopGuard = 0;
  let capturedTotal = 0;
  let comboCount = 0;

  while (loopGuard < 24) {
    loopGuard += 1;
    // Rải từng viên trong tay
    while (hand > 0) {
      cursor = stepIndex(cursor, move.direction);
      state.cells[cursor] += 1;
      hand -= 1;
      steps.push({ type: 'drop', cellIndex: cursor, count: state.cells[cursor], seat });
    }

    // Kiểm tra ô kế tiếp sau viên cuối
    const nextIdx = stepIndex(cursor, move.direction);
    if (isQuanCell(nextIdx)) {
      const qSlot = getQuanSlot(nextIdx)!;
      const hasAnyInQuan = state.quanAlive[qSlot] || state.cells[nextIdx] > 0;
      if (hasAnyInQuan) {
        // Dừng trước ô Quan (bị Tịt)
        steps.push({ type: 'stop', cellIndex: nextIdx, count: 0, seat });
        break;
      }
      // Ô Quan đã trống hoàn toàn -> kiểm tra ăn tiếp ô sau Quan
    }

    if (!isQuanCell(nextIdx) && state.cells[nextIdx] > 0) {
      // Bốc tiếp ô Dân kế tiếp để rải tiếp
      cursor = nextIdx;
      hand = state.cells[cursor];
      state.cells[cursor] = 0;
      steps.push({ type: 'pickup', cellIndex: cursor, count: hand, seat });
      continue;
    }

    // Trường hợp nextIdx trống -> kiểm tra ăn liên hoàn
    let checkEmpty = nextIdx;
    while (cellTotalStones(state, checkEmpty) === 0) {
      const targetIdx = stepIndex(checkEmpty, move.direction);
      const targetTotal = cellTotalStones(state, targetIdx);
      if (targetTotal === 0) {
        // Gặp 2 ô trống liên tiếp -> dừng lượt
        steps.push({ type: 'stop', cellIndex: targetIdx, count: 0, seat });
        break;
      }

      const qSlot = getQuanSlot(targetIdx);
      // Luật bảo vệ Quan đầu ván: không được ăn Quan ở 2 lượt đầu nếu chưa có Dân đi kèm
      if (qSlot !== null && state.quanAlive[qSlot] && state.turnNumber <= 2 && state.cells[targetIdx] === 0) {
        steps.push({ type: 'stop', cellIndex: targetIdx, count: 0, seat });
        break;
      }

      const pts = cellPointValue(state, targetIdx);
      const ateQuan = qSlot !== null && state.quanAlive[qSlot];
      if (qSlot !== null) {
        state.quanAlive[qSlot] = false;
      }
      state.cells[targetIdx] = 0;
      state.scores[seat] += pts;
      if (ateQuan) state.quanCaptured[seat] += 1;
      capturedTotal += pts;
      comboCount += 1;
      steps.push({ type: 'capture', cellIndex: targetIdx, count: pts, seat, isQuan: ateQuan });

      // Tiếp tục kiểm tra ô kế tiếp cho ăn liên hoàn (Ăn Kép)
      checkEmpty = stepIndex(targetIdx, move.direction);
    }
    break;
  }

  state.lastMove = { ...move };
  state.lastCapturedPoints = capturedTotal;
  state.lastComboCount = comboCount;

  // Kiểm tra kết thúc ván: Cả 2 ô Quan đều không còn quân (cả Quan lẫn Dân trong 2 ô Quan đều hết)
  const quan0Empty = !state.quanAlive[0] && state.cells[0] === 0;
  const quan1Empty = !state.quanAlive[1] && state.cells[6] === 0;
  if (quan0Empty && quan1Empty) {
    // Hốt Tàn: quân Dân còn bên nào thuộc về người đó
    for (const idx of getOwnRange('P1')) {
      state.scores.P1 += state.cells[idx];
      state.cells[idx] = 0;
    }
    for (const idx of getOwnRange('P2')) {
      state.scores.P2 += state.cells[idx];
      state.cells[idx] = 0;
    }
    // Trừ nợ rải sinh
    const finalP1 = state.scores.P1 - state.debt.P1 + state.debt.P2;
    const finalP2 = state.scores.P2 - state.debt.P2 + state.debt.P1;
    state.scores.P1 = Math.max(0, finalP1);
    state.scores.P2 = Math.max(0, finalP2);
    state.finished = true;
    state.winner = state.scores.P1 > state.scores.P2 ? 'P1' : state.scores.P2 > state.scores.P1 ? 'P2' : 'DRAW';
  } else {
    const nextSeat: FolkSeat = seat === 'P1' ? 'P2' : 'P1';
    const ensuredNext = ensureSideHasStones(state, nextSeat);
    ensuredNext.turn = nextSeat;
    ensuredNext.turnNumber = state.turnNumber + 1;
    return { ok: true, nextState: ensuredNext, steps };
  }

  return { ok: true, nextState: state, steps };
}

/** Dự báo ô dừng cuối cùng (chế độ hỗ trợ trực quan) */
export function previewOaqLandingCell(state: OaqState, move: OaqMove): number | null {
  const res = applyOaqMove(state, state.turn, move);
  if (!res.ok || res.steps.length === 0) return null;
  const drops = res.steps.filter((s) => s.type === 'drop');
  return drops.length > 0 ? drops[drops.length - 1].cellIndex : null;
}
