import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyOaqMove,
  cellPointValue,
  createInitialOaqState,
  getValidOaqMoves,
  previewOaqLandingCell,
} from '../../src/games/o-an-quan/rules.ts';
import { chooseOaqBotMove } from '../../src/games/o-an-quan/ai.ts';
import {
  applyNlcTurnResult,
  buildHopSequence,
  countHouses,
  createInitialNlcState,
} from '../../src/games/nhay-lo-co/rules.ts';
import {
  applyMatchReward,
  createInitialFolkProfile,
  equipFolkSkin,
  purchaseSkinWithCandy,
} from '../../src/games/folk-duel/economy.ts';
import { FolkRoomServer, normalizeRoomCode } from '../../src/games/folk-duel/server.ts';

function totalOaqPoints(state) {
  const board = state.cells.reduce((total, _, index) => total + cellPointValue(state, index), 0);
  const outstandingDebt = state.finished ? 0 : state.debt.P1 + state.debt.P2;
  return board + state.scores.P1 + state.scores.P2 - outstandingDebt;
}

test('Ô Ăn Quan: khởi tạo 70 điểm (2 Quan x 10 + 10 Dân x 5) và rải quân hợp lệ', () => {
  const s0 = createInitialOaqState();
  const before = structuredClone(s0);
  const move = { cellIndex: 1, direction: 'CW' };
  assert.equal(s0.quanAlive[0], true);
  assert.equal(s0.quanAlive[1], true);
  assert.equal(totalOaqPoints(s0), 70);
  assert.equal(getValidOaqMoves(s0, 'P1').length, 10);

  const preview = previewOaqLandingCell(s0, move);
  assert.ok(preview !== null);
  assert.ok(previewOaqLandingCell(s0, { ...move, direction: 'CCW' }) !== null);
  assert.deepEqual(s0, before, 'preview in either direction must leave the live game intact');

  const res = applyOaqMove(s0, 'P1', move);
  assert.equal(res.ok, true);
  assert.equal(res.nextState.turn, 'P2');
  assert.equal(res.nextState.cells[1], 0);
  assert.equal(preview, res.steps.findLast(step => step.type === 'drop').cellIndex);
  assert.ok(res.steps.filter(step => step.type === 'pickup').length > 1, 'opening move passes the hand');
  assert.equal(totalOaqPoints(res.nextState), 70);
  assert.deepEqual(s0, before, 'accepted moves must also leave their input intact');
  assert.deepEqual(applyOaqMove(s0, 'P1', move), res, 'replay must produce identical events and board');
});

test('Ô Ăn Quan: Bot AI chọn được nước đi hợp lệ', () => {
  const s0 = createInitialOaqState();
  const s1 = applyOaqMove(s0, 'P1', { cellIndex: 3, direction: 'CW' }).nextState;
  const before = structuredClone(s1);
  const botMove = chooseOaqBotMove(s1, 'P2', 'hard');
  assert.ok(botMove !== null);
  assert.ok(botMove.cellIndex >= 7 && botMove.cellIndex <= 11);
  assert.deepEqual(s1, before, 'searching alternate moves leaves the live bot turn intact');
  assert.equal(applyOaqMove(s1, 'P2', botMove).ok, true);
});

test('Ô Ăn Quan: ăn kép theo chuỗi và bảo vệ Quan ở lượt đầu', () => {
  const initial = {
    ...createInitialOaqState(),
    cells: [0, 1, 0, 0, 3, 0, 0, 4, 0, 0, 0, 0],
    scores: { P1: 22, P2: 20 },
  };
  const move = { cellIndex: 1, direction: 'CW' };
  const early = applyOaqMove(initial, 'P1', move).nextState;
  assert.equal(early.quanAlive[1], true);
  assert.equal(early.lastComboCount, 1);
  assert.equal(early.lastCapturedPoints, 3);
  const late = applyOaqMove({ ...initial, turnNumber: 3 }, 'P1', move).nextState;
  assert.equal(late.quanAlive[1], false);
  assert.equal(late.lastComboCount, 2);
  assert.equal(late.lastCapturedPoints, 13);
  assert.equal(totalOaqPoints(early), 70);
  assert.equal(totalOaqPoints(late), 70);
});

test('Ô Ăn Quan: rải sinh ghi phần thiếu và hốt tàn quyết toán 70 điểm', () => {
  const start = createInitialOaqState();
  start.cells.fill(0, 1, 6);
  start.scores = { P1: 2, P2: 23 };
  const resow = applyOaqMove(start, 'P1', { cellIndex: 1, direction: 'CW' });
  assert.equal(resow.ok, true);
  assert.equal(resow.nextState.debt.P1, 3);
  assert.equal(start.debt.P1, 0);
  assert.equal(totalOaqPoints(resow.nextState), 70);

  const endgame = {
    ...createInitialOaqState(),
    turnNumber: 12,
    quanAlive: [false, true],
    cells: [0, 3, 0, 1, 0, 0, 2, 4, 0, 0, 0, 0],
    scores: { P1: 24, P2: 28 },
    debt: { P1: 2, P2: 0 },
  };
  const settled = applyOaqMove(endgame, 'P1', { cellIndex: 3, direction: 'CW' }).nextState;
  assert.equal(settled.finished, true);
  assert.equal(settled.winner, 'P1');
  assert.deepEqual(settled.scores, { P1: 38, P2: 32 });
  assert.equal(totalOaqPoints(settled), 70);
  assert.ok(settled.cells.every(count => count === 0));
});

test('Ô Ăn Quan: chạm giới hạn chuyền tay vẫn giữ đủ quân trên bàn', () => {
  const state = {
    ...createInitialOaqState(),
    cells: [5, 4, 6, 3, 7, 3, 6, 6, 7, 4, 5, 2],
    quanAlive: [false, false],
    scores: { P1: 6, P2: 6 },
    turnNumber: 12,
  };
  const result = applyOaqMove(state, 'P1', { cellIndex: 3, direction: 'CW' });
  assert.equal(result.steps.filter(step => step.type === 'pickup').length, 24);
  assert.equal(result.steps.at(-1).type, 'stop');
  assert.equal(result.nextState.turn, 'P2');
  assert.equal(totalOaqPoints(result.nextState), 70);
});

test('Nhảy Lò Cò: chuỗi bước nhảy bỏ qua ô có Chàm và Nhà đối thủ', () => {
  const seq = buildHopSequence(4, { 7: 'P2' }, 'P1');
  // Ô 4-5 bị chặn ô 4 (có Chàm) -> phải nhảy 1 chân vào ô 5
  const step45 = seq.find((s) => s.boxes.includes(5));
  assert.ok(step45);
  assert.equal(step45.expectedHop, 'SINGLE');
  assert.deepEqual(step45.boxes, [5]);

  // Ô 7-8 bị chặn ô 7 (Nhà P2) -> phải nhảy 1 chân vào ô 8
  const step78 = seq.find((s) => s.boxes.includes(8));
  assert.ok(step78);
  assert.equal(step78.expectedHop, 'SINGLE');
});

test('Nhảy Lò Cò: xây đủ 3 Ngôi Nhà sẽ chiến thắng ngay', () => {
  let s = createInitialNlcState();
  for (let i = 0; i < 3; i++) {
    s = applyNlcTurnResult(s, 'P1', {
      kind: 'TURN_RESULT',
      throwSuccess: true,
      throwPerfect: true,
      hopCompleted: true,
      scoreGained: 20,
    }).nextState;
    if (!s.finished) {
      s = applyNlcTurnResult(s, 'P2', {
        kind: 'TURN_RESULT',
        throwSuccess: false,
        throwPerfect: false,
        hopCompleted: false,
        scoreGained: 0,
      }).nextState;
    }
  }
  assert.equal(countHouses(s, 'P1'), 3);
  assert.equal(s.finished, true);
  assert.equal(s.winner, 'P1');
});

test('Economy & Tiệm Tạp Hóa: cộng thưởng chống nhận lặp và mua/trang bị Skin', () => {
  let profile = createInitialFolkProfile();
  const r1 = applyMatchReward(profile, {
    matchId: 'm_001',
    game: 'o-an-quan',
    mode: 'matchmaking',
    won: true,
    skillBonuses: 2,
    score: 42,
  });
  assert.equal(r1.alreadyClaimed, false);
  assert.equal(r1.coins, 100); // 80 + 2*10
  assert.equal(r1.candy, 10);  // 8 + 2

  // Gửi lặp cùng matchId -> không cộng trùng
  const rDup = applyMatchReward(r1.profile, {
    matchId: 'm_001',
    game: 'o-an-quan',
    mode: 'matchmaking',
    won: true,
    skillBonuses: 2,
    score: 42,
  });
  assert.equal(rDup.alreadyClaimed, true);
  assert.equal(rDup.coins, 0);

  // Mua Skin Bi Ve (30 Kẹo) -> profile có 20 + 10 = 30 Kẹo -> đủ mua!
  const buy = purchaseSkinWithCandy(r1.profile, 'stones_marbles');
  assert.equal(buy.ok, true);
  assert.equal(buy.profile.equippedSkins.oaq_stones, 'stones_marbles');

  const eq = equipFolkSkin(buy.profile, 'stones_pebbles');
  assert.equal(eq.ok, true);
  assert.equal(eq.profile.equippedSkins.oaq_stones, 'stones_pebbles');
});

test('FolkRoomServer: Tạo phòng mã 6 ký tự, Join bằng mã, Matchmaking FIFO và CAS', () => {
  const server = new FolkRoomServer({
    createInitialState: () => createInitialOaqState(),
    validateAndApplyMove: (state, seat, move) => {
      const res = applyOaqMove(state, seat, move);
      return {
        ok: res.ok,
        error: res.error,
        nextState: res.nextState,
        nextTurn: res.nextState.turn,
        winner: res.nextState.winner,
      };
    },
  });

  const t0 = 1_700_000_000_000;
  const hostRoom = server.createRoom({
    userId: 'u1',
    name: 'Đức',
    gameKind: 'o-an-quan',
    isPublic: false,
    now: t0,
  });
  assert.equal(hostRoom.code.length, 6);
  assert.equal(normalizeRoomCode(` ${hostRoom.code.toLowerCase()} `), hostRoom.code);

  const joined = server.joinByCode({
    userId: 'u2',
    name: 'Bạn B',
    code: hostRoom.code,
    now: t0 + 500,
  });
  assert.equal(joined.ok, true);
  assert.equal(joined.room?.phase, 'countdown');

  // Sau 3 giây đếm ngược -> tự chuyển sang playing
  const playing = server.getRoom(hostRoom.roomId, t0 + 4000);
  assert.equal(playing?.phase, 'playing');

  // Gửi nước đi hợp lệ của P1
  const mv = server.submitMove({
    roomId: hostRoom.roomId,
    userId: 'u1',
    expectedVersion: playing.version,
    requestId: 'req_1',
    move: { cellIndex: 1, direction: 'CW' },
    now: t0 + 5000,
  });
  assert.equal(mv.ok, true);
  assert.equal(mv.room?.turn, 'P2');

  // Thử Matchmaking FIFO
  const q1 = server.matchmake({ userId: 'q_a', name: 'A', gameKind: 'nhay-lo-co', now: t0 });
  const q2 = server.matchmake({ userId: 'q_b', name: 'B', gameKind: 'nhay-lo-co', now: t0 + 200 });
  assert.equal(q1.roomId, q2.roomId);
  assert.equal(q2.players.length, 2);
});
