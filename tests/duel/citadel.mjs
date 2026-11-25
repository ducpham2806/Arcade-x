import assert from 'node:assert/strict';
import test from 'node:test';
import { Chess } from 'chess.js';
import { acceptedCitadelMove, citadelRookMove, citadelVictimSquare, replayCitadelCaptures } from '../../src/games/chess/citadelMoves.ts';

test('the presentation follows one accepted position, with both castling rooks', () => {
  for (const [side, san, rook] of [
    ['w', 'O-O', { from: 'h1', to: 'f1' }],
    ['w', 'O-O-O', { from: 'a1', to: 'd1' }],
    ['b', 'O-O', { from: 'h8', to: 'f8' }],
    ['b', 'O-O-O', { from: 'a8', to: 'd8' }],
  ]) {
    const before = `r3k2r/8/8/8/8/8/8/R3K2R ${side} KQkq - 0 1`;
    const engine = new Chess(before);
    engine.move(san);
    const move = acceptedCitadelMove(before, engine.fen());
    assert.equal(move?.san, san);
    assert.deepEqual(citadelRookMove(move), rook);
    assert.equal(acceptedCitadelMove(engine.fen(), before), undefined);
    assert.deepEqual(replayCitadelCaptures([san], engine.fen(), before), { w: [], b: [] });
  }
});

test('en passant presents the victim on its actual square and adds one capture', () => {
  const engine = new Chess();
  for (const san of ['e4', 'a6', 'e5', 'd5']) engine.move(san);
  const before = engine.fen();
  engine.move('exd6');
  const move = acceptedCitadelMove(before, engine.fen());
  assert.equal(move.to, 'd6');
  assert.equal(citadelVictimSquare(move), 'd5');
  assert.deepEqual(replayCitadelCaptures(engine.history(), engine.fen()), { w: ['p'], b: [] });
  assert.equal(replayCitadelCaptures(['exd6'], engine.fen()), null);
});

test('each promotion shows its chosen piece and only counts any real capture', () => {
  const before = '1r2k3/P7/8/8/8/8/7p/4K3 w - - 0 1';
  for (const promotion of ['q', 'r', 'b', 'n']) {
    for (const [to, expected] of [['a8', []], ['b8', ['r']]]) {
      const engine = new Chess(before);
      engine.move({ from: 'a7', to, promotion });
      const move = acceptedCitadelMove(before, engine.fen());
      assert.equal(move.piece, 'p');
      assert.equal(move.promotion, promotion);
      assert.deepEqual(replayCitadelCaptures(engine.history(), engine.fen(), before), { w: expected, b: [] });
    }
  }
});
