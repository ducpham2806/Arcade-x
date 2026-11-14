import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { GameComponentProps } from '../../types';
import {
  applyMatchReward,
  loadFolkProfile,
  type FolkProfileSave,
} from '../folk-duel/economy';
import { FolkShopModal } from '../folk-duel/FolkShopModal';
import { OnlineRoom, type OnlineEntryMode } from '../folk-duel/OnlineRoom';
import { FolkRoomServer } from '../folk-duel/server';
import { FolkSoundEngine } from '../folk-duel/sfx';
import { getSkinById } from '../folk-duel/skins-catalog';
import type { FolkSeat } from '../folk-duel/types';
import '../folk-duel/folk-duel.css';
import { simulateNlcBotTurn, type NlcBotLevel } from './ai';
import { COURT_H, COURT_W, renderNhayLoCoCourt } from './renderer';
import {
  applyNlcTurnResult,
  buildHopSequence,
  countHouses,
  createInitialNlcState,
  type HopType,
  type NlcMove,
  type NlcState,
} from './rules';

const sharedLocalNlcServer = new FolkRoomServer<NlcState, NlcMove>({
  createInitialState: () => createInitialNlcState(),
  validateAndApplyMove: (state, seat, move) => {
    const res = applyNlcTurnResult(state, seat, move);
    return {
      ok: res.ok,
      error: res.error,
      nextState: res.nextState,
      nextTurn: res.nextState.turn,
      winner: res.nextState.winner,
    };
  },
});

type ScreenMode =
  | { kind: 'home' }
  | { kind: 'bot'; level: NlcBotLevel; matchId: string }
  | { kind: 'local_2p'; matchId: string }
  | { kind: 'online'; entry: OnlineEntryMode };

export const NhayLoCoGame: React.FC<GameComponentProps> = ({ bridge, isMuted = false }) => {
  const [profile, setProfile] = useState<FolkProfileSave>(() => loadFolkProfile(bridge));
  const [screen, setScreen] = useState<ScreenMode>({ kind: 'home' });
  const [showShop, setShowShop] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [localUserId] = useState(() => `nlc_${Math.random().toString(36).slice(2, 8)}`);

  const mutedRef = useRef(isMuted);
  mutedRef.current = isMuted;
  const soundRef = useRef<FolkSoundEngine | null>(null);
  soundRef.current ??= new FolkSoundEngine(() => mutedRef.current);

  useEffect(() => () => soundRef.current?.dispose(), []);

  return (
    <div className="fd-shell">
      <header className="fd-header">
        <div className="fd-title-group">
          <h1>NHẢY LÒ CÒ · NGÕ NHỎ</h1>
          <p>Dân gian Việt Nam · Đua Xây Nhà 1vs1</p>
        </div>
        <div className="fd-wallet-row">
          <span className="fd-candy-badge">🍬 {profile.candyTokens} Kẹo</span>
          <button type="button" className="fd-shop-btn" onClick={() => setShowShop(true)}>
            🏪 Tiệm Tạp Hóa
          </button>
        </div>
      </header>

      {screen.kind === 'home' && (
        <main className="fd-home-body">
          <div className="fd-hero-card">
            <h2 style={{ margin: '0 0 6px', color: '#fde68a' }}>Thảy Chàm · Nhảy Nhịp · Cất Nhà</h2>
            <p style={{ margin: 0, fontSize: 13, color: '#fed7aa' }}>
              Thảy Chàm trúng ô, bấm nhịp 1 chân / 2 chân vượt chướng ngại vật để xây đủ 3 Ngôi Nhà trước đối thủ! Đổi Kẹo lấy Skin Viên Gạch Đôi &amp; Bàn Chơi cực đẹp.
            </p>
          </div>

          <div className="fd-menu-grid">
            <button
              type="button"
              className="fd-menu-btn is-primary"
              onClick={() => setScreen({ kind: 'online', entry: 'match' })}
            >
              <strong>⚡ Ghép Trận 1vs1 (Matchmaking)</strong>
              <span>Đua xây 3 Nhà · Tìm đối thủ nhanh</span>
            </button>
            <button
              type="button"
              className="fd-menu-btn"
              onClick={() => setScreen({ kind: 'online', entry: 'create' })}
            >
              <strong>🏠 Tạo Phòng Riêng</strong>
              <span>Lấy mã 6 ký tự mời bạn</span>
            </button>
            <button
              type="button"
              className="fd-menu-btn"
              onClick={() => setScreen({ kind: 'online', entry: 'join' })}
            >
              <strong>🔑 Nhập Mã Vào Phòng</strong>
              <span>Vào sân của bạn bè</span>
            </button>
            <button
              type="button"
              className="fd-menu-btn"
              onClick={() => setScreen({ kind: 'bot', level: 'easy', matchId: `nlc_easy_${Date.now()}` })}
            >
              <strong>🤖 Bot Tí Sún (Dễ)</strong>
              <span>Luyện thảy Chàm · +25 Xu</span>
            </button>
            <button
              type="button"
              className="fd-menu-btn"
              onClick={() => setScreen({ kind: 'bot', level: 'hard', matchId: `nlc_hard_${Date.now()}` })}
            >
              <strong>🧠 Bot Bờm (Khó)</strong>
              <span>Nhịp nhanh chuẩn xác · +45 Xu</span>
            </button>
            <button
              type="button"
              className="fd-menu-btn"
              onClick={() => setScreen({ kind: 'local_2p', matchId: `nlc_2p_${Date.now()}` })}
            >
              <strong>👥 2 Người Chung Máy</strong>
              <span>Thay phiên nhau nhảy lò cò</span>
            </button>
            <button type="button" className="fd-menu-btn" onClick={() => setShowRules(true)}>
              <strong>📜 Luật Chơi Nhanh</strong>
              <span>1 chân · 2 chân · Xây nhà</span>
            </button>
          </div>
        </main>
      )}

      {(screen.kind === 'bot' || screen.kind === 'local_2p') && (
        <NlcMatchCourt
          key={screen.matchId}
          mode={screen.kind === 'bot' ? (screen.level === 'easy' ? 'bot_easy' : 'bot_hard') : 'local_2p'}
          matchId={screen.matchId}
          mySeat="P1"
          opponentName={
            screen.kind === 'bot'
              ? screen.level === 'easy'
                ? 'Bot Tí Sún (Dễ)'
                : 'Bot Bờm (Khó)'
              : 'Người chơi 2'
          }
          botLevel={screen.kind === 'bot' ? screen.level : null}
          profile={profile}
          sound={soundRef.current}
          bridge={bridge}
          onProfileChange={setProfile}
          onExit={() => setScreen({ kind: 'home' })}
          onRematch={() =>
            setScreen(
              screen.kind === 'bot'
                ? { kind: 'bot', level: screen.level, matchId: `nlc_${screen.level}_${Date.now()}` }
                : { kind: 'local_2p', matchId: `nlc_2p_${Date.now()}` }
            )
          }
        />
      )}

      {screen.kind === 'online' && (
        <OnlineRoom
          gameKind="nhay-lo-co"
          gameTitle="Nhảy Lò Cò"
          mode={screen.entry}
          server={sharedLocalNlcServer}
          userId={localUserId}
          playerName="Bé Tí"
          skins={profile.equippedSkins}
          onExit={() => setScreen({ kind: 'home' })}
          renderMatch={({ room, mySeat, onMove, onRematch, onLeave }) => (
            <NlcMatchCourt
              mode={room.isPublic ? 'matchmaking' : 'friend_room'}
              matchId={room.roomId}
              mySeat={mySeat}
              opponentName={room.players.find((p) => p.seat !== mySeat)?.name ?? 'Đối thủ'}
              botLevel={null}
              externalState={room.state}
              externalMoveHandler={(mv) => onMove(mv)}
              profile={profile}
              sound={soundRef.current}
              bridge={bridge}
              onProfileChange={setProfile}
              onExit={onLeave}
              onRematch={onRematch}
            />
          )}
        />
      )}

      {showShop && (
        <FolkShopModal
          game="nhay-lo-co"
          profile={profile}
          bridge={bridge}
          onProfileChange={setProfile}
          onClose={() => setShowShop(false)}
        />
      )}

      {showRules && (
        <div className="fd-overlay" role="dialog" aria-modal="true">
          <div className="fd-room-card" style={{ textAlign: 'left' }}>
            <h2 style={{ margin: 0, color: '#fde68a' }}>Luật Chơi Nhảy Lò Cò</h2>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.6 }}>
              <li><b>Bước 1 — Thảy Chàm:</b> Bấm nút dừng thanh lực ở vùng Xanh lá để ném Chàm vào đúng ô mục tiêu.</li>
              <li><b>Bước 2 — Nhảy 10 Ô:</b> Bấm <b>1 CHÂN</b> cho ô đơn, <b>2 CHÂN</b> cho cặp Ô Gạch Đôi (4-5, 7-8) và Đầu Chùa (10).</li>
              <li><b>Vượt chướng ngại:</b> Ô đang có Chàm của bạn hoặc ô đã thành Nhà của đối thủ sẽ phải nhảy vọt qua (không dẫm lên).</li>
              <li><b>Xây Nhà thắng trận:</b> Hoàn thành bàn nào được đóng dấu Xây Nhà ô đó. Ai xây đủ <b>3 Ngôi Nhà</b> trước sẽ thắng!</li>
            </ul>
            <button type="button" className="fd-btn-primary" onClick={() => setShowRules(false)}>
              Đã hiểu!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface NlcMatchCourtProps {
  mode: 'bot_easy' | 'bot_hard' | 'local_2p' | 'friend_room' | 'matchmaking';
  matchId: string;
  mySeat: FolkSeat;
  opponentName: string;
  botLevel: NlcBotLevel | null;
  externalState?: NlcState;
  externalMoveHandler?: (move: NlcMove) => void;
  profile: FolkProfileSave;
  sound: FolkSoundEngine;
  bridge: GameComponentProps['bridge'];
  onProfileChange: (next: FolkProfileSave) => void;
  onExit: () => void;
  onRematch: () => void;
}

const NlcMatchCourt: React.FC<NlcMatchCourtProps> = ({
  mode,
  matchId,
  mySeat,
  opponentName,
  botLevel,
  externalState,
  externalMoveHandler,
  profile,
  sound,
  bridge,
  onProfileChange,
  onExit,
  onRematch,
}) => {
  const [localState, setLocalState] = useState<NlcState>(() => createInitialNlcState());
  const state = externalState ?? localState;

  const [turnPhase, setTurnPhase] = useState<'THROW' | 'HOP'>('THROW');
  const [powerPos, setPowerPos] = useState(50);
  const [throwPerfect, setThrowPerfect] = useState(false);
  const [hopIndex, setHopIndex] = useState(0);
  const [statusMsg, setStatusMsg] = useState('Canh thanh lực ở vùng Xanh rồi bấm THẢY CHÀM!');
  const [rewardInfo, setRewardInfo] = useState<{ coins: number; exp: number; candy: number } | null>(null);
  const rewardedRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const doubleSkin = getSkinById(profile.equippedSkins.nlc_double_tile);
  const activeSeat = mode === 'local_2p' ? state.turn : mySeat;
  const isMyTurn = !state.finished && state.turn === activeSeat;
  const targetBox = state.level[state.turn];

  const hopSequence = useMemo(
    () => buildHopSequence(targetBox, state.houses, state.turn),
    [targetBox, state.houses, state.turn]
  );

  // Con thoi thanh lực chạy qua lại trong pha THROW
  useEffect(() => {
    if (!isMyTurn || turnPhase !== 'THROW') return;
    let t = 0;
    const id = setInterval(() => {
      t += 0.12;
      setPowerPos(Math.round(50 + Math.sin(t) * 48));
    }, 30);
    return () => clearInterval(id);
  }, [isMyTurn, turnPhase]);

  // Vẽ bàn lò cò
  useEffect(() => {
    let raf = 0;
    let tick = 0;
    const draw = () => {
      tick += 1;
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          const activeBoxes =
            turnPhase === 'HOP' && hopSequence[hopIndex] ? hopSequence[hopIndex].boxes : [targetBox];
          renderNhayLoCoCourt(ctx, state, profile.equippedSkins, activeBoxes, targetBox, mySeat, tick);
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [state, profile.equippedSkins, turnPhase, hopSequence, hopIndex, targetBox, mySeat]);

  // Bot tự động chơi lượt P2
  useEffect(() => {
    if (!botLevel || state.finished || state.turn !== 'P2') return;
    const timer = setTimeout(() => {
      const mv = simulateNlcBotTurn(state, 'P2', botLevel);
      const res = applyNlcTurnResult(state, 'P2', mv);
      if (res.ok) {
        if (mv.hopCompleted) sound.playCapture(true);
        else sound.playFoul();
        setLocalState(res.nextState);
        setTurnPhase('THROW');
        setHopIndex(0);
        setStatusMsg(res.nextState.lastSummary);
      }
    }, 1100);
    return () => clearTimeout(timer);
  }, [botLevel, state, sound]);

  // Trao thưởng khi kết thúc
  useEffect(() => {
    if (!state.finished || rewardedRef.current) return;
    rewardedRef.current = true;
    sound.playWin();
    const won = state.winner === mySeat;
    const out = applyMatchReward(
      profile,
      {
        matchId,
        game: 'nhay-lo-co',
        mode,
        won,
        skillBonuses: countHouses(state, mySeat),
        score: state.scores[mySeat],
      },
      bridge
    );
    onProfileChange(out.profile);
    if (!out.alreadyClaimed) {
      setRewardInfo({ coins: out.coins, exp: out.exp, candy: out.candy });
    }
  }, [state.finished]);

  const submitTurnResult = (mv: NlcMove) => {
    if (externalMoveHandler) {
      externalMoveHandler(mv);
    } else {
      const res = applyNlcTurnResult(state, activeSeat, mv);
      if (res.ok) {
        setLocalState(res.nextState);
        setStatusMsg(res.nextState.lastSummary);
      }
    }
    setTurnPhase('THROW');
    setHopIndex(0);
  };

  const handleThrowCham = () => {
    if (!isMyTurn || turnPhase !== 'THROW') return;
    const inGreen = powerPos >= 25 && powerPos <= 75;
    const inPerfect = powerPos >= 42 && powerPos <= 58;
    if (!inGreen) {
      sound.playFoul();
      submitTurnResult({
        kind: 'TURN_RESULT',
        throwSuccess: false,
        throwPerfect: false,
        hopCompleted: false,
        scoreGained: 0,
      });
      return;
    }
    sound.playHop(false, doubleSkin.sfxProfile);
    setThrowPerfect(inPerfect);
    setTurnPhase('HOP');
    setHopIndex(0);
    setStatusMsg(
      inPerfect
        ? `TRÚNG TÂM Ô ${targetBox}! Bấm nhịp 1 Chân / 2 Chân để hoàn thành bàn!`
        : `Trúng Ô ${targetBox}! Hãy nhảy lần lượt qua các ô.`
    );
  };

  const handleHop = (hopType: HopType) => {
    if (!isMyTurn || turnPhase !== 'HOP') return;
    const step = hopSequence[hopIndex];
    if (!step) return;

    if (hopType !== step.expectedHop) {
      sound.playFoul();
      submitTurnResult({
        kind: 'TURN_RESULT',
        throwSuccess: true,
        throwPerfect,
        hopCompleted: false,
        scoreGained: 0,
      });
      return;
    }

    sound.playHop(hopType === 'DOUBLE', doubleSkin.sfxProfile);
    const nextIdx = hopIndex + 1;
    if (nextIdx >= hopSequence.length) {
      sound.playCapture(true);
      submitTurnResult({
        kind: 'TURN_RESULT',
        throwSuccess: true,
        throwPerfect,
        hopCompleted: true,
        scoreGained: throwPerfect ? 25 : 15,
      });
    } else {
      setHopIndex(nextIdx);
    }
  };

  const oppSeat: FolkSeat = mySeat === 'P1' ? 'P2' : 'P1';
  const nextStep = hopSequence[hopIndex];

  return (
    <main className="fd-board-stage">
      <div className={`fd-hud-strip ${state.turn === oppSeat && !state.finished ? 'is-active' : ''}`}>
        <div>
          <strong>{opponentName}</strong>
          <div style={{ fontSize: 12, color: '#fcd34d' }}>
            Bàn Ô {state.level[oppSeat]} · 🏠 {countHouses(state, oppSeat)}/{state.maxHousesToWin} Nhà
          </div>
        </div>
        <div style={{ fontSize: 16, fontWeight: 900, color: '#fde047' }}>{state.scores[oppSeat]}đ</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%', maxWidth: 420 }}>
        <canvas
          ref={canvasRef}
          width={COURT_W}
          height={COURT_H}
          className="fd-pixel-canvas"
          style={{ maxHeight: '48vh', width: 'auto', borderRadius: 14, border: '3px solid #78350f' }}
        />

        {!state.finished && isMyTurn && turnPhase === 'THROW' && (
          <div style={{ width: '100%', background: '#1c0f0a', padding: 10, borderRadius: 12, border: '2px solid #92400e' }}>
            <div style={{ height: 18, borderRadius: 999, background: '#7f1d1d', position: 'relative', overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ position: 'absolute', left: '25%', width: '50%', top: 0, bottom: 0, background: '#15803d' }} />
              <div style={{ position: 'absolute', left: '42%', width: '16%', top: 0, bottom: 0, background: '#22c55e' }} />
              <div
                style={{
                  position: 'absolute',
                  left: `calc(${powerPos}% - 4px)`,
                  top: 0,
                  bottom: 0,
                  width: 8,
                  background: '#fde047',
                  border: '1px solid #000',
                }}
              />
            </div>
            <button type="button" className="fd-btn-primary" style={{ width: '100%' }} onClick={handleThrowCham}>
              🎯 THẢY CHÀM VÀO Ô {targetBox}
            </button>
          </div>
        )}

        {!state.finished && isMyTurn && turnPhase === 'HOP' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ textAlign: 'center', fontSize: 12, color: '#fde68a' }}>
              Bước {hopIndex + 1}/{hopSequence.length}: Nhảy vào{' '}
              <b>{nextStep?.boxes.join(' & ')}</b> ({nextStep?.expectedHop === 'DOUBLE' ? '2 CHÂN' : '1 CHÂN'})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                type="button"
                className="fd-btn-primary"
                style={{ minHeight: 56, fontSize: 15 }}
                onClick={() => handleHop('SINGLE')}
              >
                🦶 1 CHÂN
              </button>
              <button
                type="button"
                className="fd-btn-primary"
                style={{ minHeight: 56, fontSize: 15 }}
                onClick={() => handleHop('DOUBLE')}
              >
                🦶🦶 2 CHÂN
              </button>
            </div>
          </div>
        )}

        {!state.finished && !isMyTurn && (
          <div style={{ fontSize: 13, color: '#fcd34d', padding: 8 }}>⏳ {opponentName} đang nhảy…</div>
        )}

        {state.finished && (
          <div className="fd-room-card" style={{ width: '100%', padding: 14 }}>
            <h3 style={{ margin: 0, color: '#fde047' }}>
              {state.winner === mySeat ? '🏆 BẠN ĐÃ XÂY ĐỦ NHÀ & CHIẾN THẮNG!' : '😅 ĐỐI THỦ VỀ ĐÍCH TRƯỚC RỒI!'}
            </h3>
            <p style={{ margin: '4px 0', fontSize: 13 }}>{statusMsg}</p>
            {rewardInfo && (
              <p style={{ margin: '4px 0', fontSize: 13, color: '#86efac', fontWeight: 700 }}>
                Phần thưởng: +{rewardInfo.coins} Xu · +{rewardInfo.exp} XP · +{rewardInfo.candy} 🍬 Kẹo
              </p>
            )}
            <div className="fd-btn-row">
              <button type="button" className="fd-btn-primary" onClick={onRematch}>
                🔄 Đấu Lại
              </button>
              <button type="button" className="fd-btn-secondary" onClick={onExit}>
                Về Sảnh Game
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={`fd-hud-strip ${isMyTurn ? 'is-active' : ''}`}>
        <div>
          <strong>Bạn ({activeSeat})</strong>
          <div style={{ fontSize: 12, color: '#86efac' }}>
            Bàn Ô {state.level[mySeat]} · 🏠 {countHouses(state, mySeat)}/{state.maxHousesToWin} Nhà
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 900, color: '#fde047' }}>{state.scores[mySeat]}đ</span>
          <button type="button" className="fd-btn-secondary" style={{ padding: '6px 10px' }} onClick={onExit}>
            Thoát
          </button>
        </div>
      </div>
    </main>
  );
};

export default NhayLoCoGame;
