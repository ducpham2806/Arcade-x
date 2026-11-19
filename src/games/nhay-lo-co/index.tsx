import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { GameComponentProps } from '../../types';
import {
  loadFolkProfile,
  type FolkProfileSave,
} from '../folk-duel/economy';
import { FolkMatchReward, FolkResume, FolkRules, FolkSaveNotice } from '../folk-duel/FolkOfflineUi';
import { isNlcOfflineState, useFolkRestart, useOfflineMatch, type OfflineMode } from '../folk-duel/offlineMatch';
import { FolkShopModal } from '../folk-duel/FolkShopModal';
import { OnlineRoom, folkOnlineEnabled, type OnlineEntryMode } from '../folk-duel/OnlineRoom';
import { folkChatId, type FolkCommand, type FolkOnlineRoom } from '../folk-duel/online-protocol';
import { FolkSoundEngine } from '../folk-duel/sfx';
import { getSkinById } from '../folk-duel/skins-catalog';
import type { FolkSeat } from '../folk-duel/types';
import '../folk-duel/folk-duel.css';
import { simulateNlcBotTurn, type NlcBotLevel } from './ai';
import { COURT_H, COURT_W, renderNhayLoCoCourt } from './renderer';
import { NlcPowerMeter } from './NlcPowerMeter';
import './court.css';
import {
  applyNlcTurnResult,
  buildHopSequence,
  countHouses,
  createInitialNlcState,
  getNlcTargetBox,
  type HopType,
  type NlcMove,
  type NlcState,
  type NlcTurnPhase,
} from './rules';

type ScreenMode =
  | { kind: 'home' }
  | { kind: 'offline' }
  | { kind: 'online'; entry: OnlineEntryMode };

export const NhayLoCoGame: React.FC<GameComponentProps> = ({ bridge, isMuted = false, isPaused, registerRestart }) => {
  const [profile, setProfile] = useState<FolkProfileSave>(() => loadFolkProfile(bridge));
  const [screen, setScreen] = useState<ScreenMode>({ kind: 'home' });
  const offline = useOfflineMatch(bridge, createInitialNlcState, isNlcOfflineState);
  const mode = offline.match?.mode;
  const botLevel = mode === 'bot_easy' ? 'easy' : mode === 'bot_hard' ? 'hard' : null;
  const startOffline = (mode: OfflineMode) => {
    if (offline.start(mode)) setScreen({ kind: 'offline' });
  };
  const [showShop, setShowShop] = useState(false);
  const [showRules, setShowRules] = useState(false);
  useFolkRestart(registerRestart, screen.kind === 'offline' && !showShop ? offline.restart : undefined);

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
            {offline.match && <FolkResume match={offline.match} onResume={() => setScreen({ kind: 'offline' })}/>}
            {folkOnlineEnabled && <>
              <button type="button" className="fd-menu-btn" onClick={() => setScreen({ kind: 'online', entry: 'resume' })}>
                <strong>Tiếp tục phòng online</strong><span>Kết nối lại phòng đang mở</span>
              </button>
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
            </>}
            <button
              type="button"
              className="fd-menu-btn"
              onClick={() => startOffline('bot_easy')}
            >
              <strong>🤖 Bot Tí Sún (Dễ)</strong>
              <span>Luyện thảy Chàm và nhảy</span>
            </button>
            <button
              type="button"
              className="fd-menu-btn"
              onClick={() => startOffline('bot_hard')}
            >
              <strong>🧠 Bot Bờm (Khó)</strong>
              <span>Đối thủ xây Nhà chính xác hơn</span>
            </button>
            <button
              type="button"
              className="fd-menu-btn"
              onClick={() => startOffline('local_2p')}
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

      {!offline.saved && <FolkSaveNotice onRetry={offline.retry}/>}
      {screen.kind === 'offline' && offline.match && (
        <NlcMatchCourt
          key={offline.match.id}
          mode={offline.match.mode}
          matchId={offline.match.id}
          mySeat="P1"
          opponentName={botLevel === 'easy' ? 'Bot Tí Sún' : botLevel === 'hard' ? 'Bot Bờm' : 'Người chơi 2'}
          botLevel={botLevel}
          state={offline.match.state}
          onLocalStateChange={offline.update}
          paused={isPaused || showShop}
          rewardReady={offline.saved}
          profile={profile}
          sound={soundRef.current}
          bridge={bridge}
          onProfileChange={setProfile}
          onExit={() => setScreen({ kind: 'home' })}
          onRematch={offline.restart}
        />
      )}

      {screen.kind === 'online' && (
        <OnlineRoom
          game="nhay-lo-co"
          gameTitle="Nhảy Lò Cò"
          mode={screen.entry}
          onExit={() => setScreen({ kind: 'home' })}
          renderMatch={({ room, blocked, readArrivalTime, onAction, onRematch, onLeave, leaveDisabled }) => (
            <NlcMatchCourt
              mode={room.isPublic ? 'matchmaking' : 'friend_room'}
              key={room.matchId}
              matchId={room.matchId}
              mySeat={room.mySeat}
              opponentName={room.players.find((p) => p.seat !== room.mySeat)?.name ?? 'Đối thủ'}
              botLevel={null}
              state={room.state}
              online={{ room, readArrivalTime, onAction }}
              paused={isPaused || showShop || blocked}
              rewardReady={false}
              profile={profile}
              sound={soundRef.current}
              bridge={bridge}
              onProfileChange={setProfile}
              onExit={onLeave}
              exitDisabled={leaveDisabled}
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
        <FolkRules title="Luật chơi Nhảy Lò Cò" onClose={() => setShowRules(false)}>
          <ol className="list-decimal pl-6">
            <li>Canh vạch vàng trong vùng xanh rồi thảy Chàm. Trúng vùng giữa được thêm 10 điểm kỹ năng.</li>
            <li>Ô đơn bấm 1 chân, cặp ô trống và Đầu Chùa bấm 2 chân. Bỏ qua ô có Chàm hoặc Nhà đối thủ.</li>
            <li>Khi quay về đến gần ô có Chàm, bấm Nhặt Chàm lúc vạch vàng ở vùng xanh. Nhảy về vạch xuất phát.</li>
            <li>Xong lượt thì xây Nhà ở ô mục tiêu còn trống. Ai xây đủ 3 Nhà trước sẽ thắng. Game lưu sau lượt đã hoàn tất.</li>
          </ol>
        </FolkRules>
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
  state: NlcState;
  onLocalStateChange?: (state: NlcState) => void;
  paused?: boolean;
  rewardReady?: boolean;
  online?: {
    room: FolkOnlineRoom<'nhay-lo-co'>;
    readArrivalTime: () => number;
    onAction: (action: FolkCommand) => void;
  };
  profile: FolkProfileSave;
  sound: FolkSoundEngine;
  bridge: GameComponentProps['bridge'];
  onProfileChange: (next: FolkProfileSave) => void;
  onExit: () => void;
  exitDisabled?: boolean;
  onRematch?: () => void;
}

const NlcMatchCourt: React.FC<NlcMatchCourtProps> = ({
  mode,
  matchId,
  mySeat,
  opponentName,
  botLevel,
  state,
  onLocalStateChange,
  paused = false,
  rewardReady = true,
  online,
  profile,
  sound,
  bridge,
  onProfileChange,
  onExit,
  exitDisabled,
  onRematch,
}) => {

  const [localPhase, setTurnPhase] = useState<NlcTurnPhase>('THROW');
  const [localPower, setPowerPos] = useState(50);
  const powerAngle = useRef(0);
  const [throwPerfect, setThrowPerfect] = useState(false);
  const [localPickedUp, setPickedUp] = useState(false);
  const [localHopIndex, setHopIndex] = useState(0);
  const [localStatus, setStatusMsg] = useState(state.lastSummary);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const keyboardActionRef = useRef<HTMLButtonElement | null>(null);
  const [, checkReady] = useState(0);
  const remoteStep = online?.room.nlc;
  const turnPhase = remoteStep?.phase ?? localPhase;
  const pickedUp = remoteStep?.pickedUp ?? localPickedUp;
  const hopIndex = remoteStep?.hopIndex ?? localHopIndex;
  const statusMsg = remoteStep?.message ?? (online ? state.lastSummary : localStatus);
  const readArrivalTime = online?.readArrivalTime;
  const inputReadyAt = remoteStep ? remoteStep.since + (turnPhase === 'HOP' ? 110 : 0) : 0;
  const waitingForInput = !!readArrivalTime && readArrivalTime() < inputReadyAt;

  const doubleSkin = getSkinById(profile.equippedSkins.nlc_double_tile);
  const localTwo = mode === 'local_2p';
  const activeSeat = localTwo ? state.turn : mySeat;
  const isMyTurn = !state.finished && state.turn === activeSeat;
  const targetBox = getNlcTargetBox(state, state.turn);
  const timing = turnPhase === 'THROW' || turnPhase === 'PICKUP';

  const hopSequence = useMemo(
    () => buildHopSequence(targetBox, state.houses, state.turn),
    [targetBox, state.houses, state.turn]
  );

  useEffect(() => {
    if (!readArrivalTime || !waitingForInput || !isMyTurn || paused) return;
    const timer = setTimeout(() => checkReady(value => value + 1), Math.max(1, Math.ceil(inputReadyAt - readArrivalTime())));
    return () => clearTimeout(timer);
  }, [readArrivalTime, inputReadyAt, waitingForInput, isMyTurn, paused]);

  useLayoutEffect(() => {
    const source = keyboardActionRef.current;
    if (!source) return;
    if (document.activeElement !== document.body && document.activeElement !== source) {
      keyboardActionRef.current = null;
      return;
    }
    if (!isMyTurn || paused || waitingForInput) return;
    const target = source.isConnected ? source : actionsRef.current?.querySelector<HTMLButtonElement>('[data-nlc-action]');
    if (target && !target.disabled) {
      target.focus({ preventScroll: true });
      keyboardActionRef.current = null;
    }
  }, [isMyTurn, paused, waitingForInput, turnPhase, hopIndex, state.turnNumber]);

  useEffect(() => {
    powerAngle.current = 0;
    setPowerPos(50);
  }, [state.turnNumber, turnPhase]);

  useEffect(() => {
    if (online || paused || !isMyTurn || !timing) return;
    const id = setInterval(() => {
      powerAngle.current += 0.12;
      setPowerPos(Math.round(50 + Math.sin(powerAngle.current) * 48));
    }, 30);
    return () => clearInterval(id);
  }, [!!online, isMyTurn, paused, timing, state.turnNumber, turnPhase]);

  // Vẽ bàn lò cò
  useEffect(() => {
    let raf = 0;
    let tick = 0;
    const draw = () => {
      tick += 1;
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          const step = hopSequence[turnPhase === 'PICKUP' ? hopIndex - 1 : hopIndex];
          const activeBoxes = state.finished ? [] : turnPhase !== 'THROW' && step ? step.boxes : [targetBox];
          const chamBox = !state.finished && turnPhase !== 'THROW' && !pickedUp ? targetBox : null;
          renderNhayLoCoCourt(ctx, state, profile.equippedSkins, activeBoxes, chamBox, mySeat, tick);
        }
      }
      if (!paused && !state.finished) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [state, profile.equippedSkins, turnPhase, hopSequence, hopIndex, targetBox, mySeat, paused, pickedUp]);

  // Bot tự động chơi lượt P2
  useEffect(() => {
    if (paused || !botLevel || state.finished || state.turn !== 'P2') return;
    const timer = setTimeout(() => {
      const mv = simulateNlcBotTurn(state, 'P2', botLevel);
      const res = applyNlcTurnResult(state, 'P2', mv);
      if (res.ok) {
        if (mv.hopCompleted) sound.playCapture(true);
        else sound.playFoul();
        onLocalStateChange?.(res.nextState);
        setTurnPhase('THROW');
        setHopIndex(0);
        setStatusMsg(res.nextState.lastSummary);
      }
    }, 1100);
    return () => clearTimeout(timer);
  }, [paused, botLevel, state, sound, onLocalStateChange]);

  const submitTurnResult = (mv: NlcMove) => {
    const res = applyNlcTurnResult(state, activeSeat, mv);
    if (res.ok) {
      onLocalStateChange?.(res.nextState);
      setStatusMsg(res.nextState.lastSummary);
    }
    setTurnPhase('THROW');
    setHopIndex(0);
    setPickedUp(false);
  };

  const handleThrowCham = () => {
    if (paused || !isMyTurn || turnPhase !== 'THROW') return;
    if (online) { online.onAction({ type: 'throw' }); return; }
    const inGreen = localPower >= 25 && localPower <= 75;
    const inPerfect = localPower >= 42 && localPower <= 58;
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
    setStatusMsg(inPerfect ? `Trúng tâm ô ${targetBox} · +10 điểm kỹ năng khi hết lượt.` : `Chàm đã vào ô ${targetBox}.`);
  };

  const finishHop = () => {
    sound.playCapture(true);
    submitTurnResult({ kind: 'TURN_RESULT', throwSuccess: true, throwPerfect, hopCompleted: true, scoreGained: throwPerfect ? 25 : 15 });
  };

  const handlePickup = () => {
    if (paused || !isMyTurn || turnPhase !== 'PICKUP') return;
    if (online) { online.onAction({ type: 'pickup' }); return; }
    if (localPower < 25 || localPower > 75) {
      sound.playFoul();
      submitTurnResult({ kind: 'TURN_RESULT', throwSuccess: true, throwPerfect, hopCompleted: false, scoreGained: 0, missedPickup: true });
      return;
    }
    setPickedUp(true);
    if (hopIndex === hopSequence.length) finishHop();
    else { setTurnPhase('HOP'); setStatusMsg('Đã nhặt Chàm. Nhảy về vạch xuất phát.'); }
  };

  const handleHop = (hopType: HopType) => {
    if (paused || !isMyTurn || turnPhase !== 'HOP') return;
    if (online) { online.onAction({ type: 'hop', feet: hopType }); return; }
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
    setHopIndex(hopIndex + 1);
    if (step.pickChamHere) {
      setTurnPhase('PICKUP');
      setStatusMsg(`Canh vùng xanh để nhặt Chàm ở ô ${targetBox}.`);
    } else if (hopIndex + 1 === hopSequence.length) {
      finishHop();
    }
  };

  const oppSeat: FolkSeat = mySeat === 'P1' ? 'P2' : 'P1';
  const nextStep = hopSequence[hopIndex];
  const playerName = localTwo ? 'Người chơi 1' : 'Bạn';
  const winnerName = state.winner === mySeat ? playerName : opponentName;

  return (
    <main className="fd-board-stage nlc-stage" data-folk-version={online?.room.version}>
      <div data-chat-player={online ? folkChatId(online.room.matchId, oppSeat) : undefined} data-folk-seat={oppSeat} className={`fd-hud-strip ${state.turn === oppSeat && !state.finished ? 'is-active' : ''}`}>
        <div>
          <strong>{opponentName}</strong>
          <div style={{ fontSize: 12, color: '#fcd34d' }}>
            Ô {getNlcTargetBox(state, oppSeat)} · {countHouses(state, oppSeat)}/{state.maxHousesToWin} Nhà
          </div>
        </div>
        <div style={{ fontSize: 16, fontWeight: 900, color: '#fde047' }}>{state.scores[oppSeat]}đ</div>
      </div>

      <div className="fd-court">
        <canvas
          ref={canvasRef}
          width={COURT_W}
          height={COURT_H}
          className="fd-pixel-canvas"
          aria-label="Sân lò cò 10 ô"
          data-chat-protect="true"
        />

        <div className="nlc-actions" ref={actionsRef} data-chat-protect="true" onClickCapture={event => {
          const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-nlc-action]');
          if (button && event.detail === 0 && document.activeElement === button) keyboardActionRef.current = button;
        }}>
          {!state.finished && <p className="fd-status" role="status">{statusMsg}</p>}
          {isMyTurn && timing && (
            <div className="nlc-power-panel">
              <NlcPowerMeter power={remoteStep ? 50 : localPower} since={remoteStep?.since} readArrivalTime={readArrivalTime} paused={paused} />
              <button type="button" className="fd-btn-primary" data-nlc-action disabled={paused || waitingForInput}
                onClick={turnPhase === 'PICKUP' ? handlePickup : handleThrowCham}>
                {turnPhase === 'PICKUP' ? 'NHẶT CHÀM' : `THẢY CHÀM VÀO Ô ${targetBox}`}
              </button>
              <p className="fd-meter-hint">Bấm khi vạch vàng vào vùng xanh.</p>
            </div>
          )}

          {!state.finished && isMyTurn && turnPhase === 'HOP' && (
            <div className="nlc-hop-panel">
              <div className="nlc-hop-hint">
                Bước {hopIndex + 1}/{hopSequence.length} · Nhảy vào{' '}
                <b>{nextStep?.boxes.join(' & ')}</b> ({nextStep?.expectedHop === 'DOUBLE' ? '2 CHÂN' : '1 CHÂN'})
              </div>
              <div className="nlc-hop-buttons">
                <button
                  type="button"
                  className="fd-btn-primary"
                  data-nlc-action
                  disabled={paused || waitingForInput}
                  onClick={() => handleHop('SINGLE')}
                >
                  🦶 1 CHÂN
                </button>
                <button
                  type="button"
                  className="fd-btn-primary"
                  data-nlc-action
                  disabled={paused || waitingForInput}
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
                {state.winner === 'DRAW' ? 'Hòa nhau!' : `${winnerName} thắng!`}
              </h3>
              <p style={{ margin: '4px 0', fontSize: 13 }}>{state.lastSummary}</p>
              <FolkMatchReward
                input={{ matchId, game: 'nhay-lo-co', mode, won: state.winner === mySeat, isDraw: state.winner === 'DRAW',
                  skillBonuses: countHouses(state, mySeat), score: state.scores[mySeat] }}
                profile={profile} bridge={bridge} ready={rewardReady} onProfileChange={onProfileChange} onAward={() => sound.playWin()}
              />
              <div className="fd-btn-row">
                {onRematch && <button type="button" className="fd-btn-primary" onClick={onRematch}>
                  🔄 Đấu Lại
                </button>}
                <button type="button" className="fd-btn-secondary" disabled={exitDisabled} onClick={onExit}>
                  Về Sảnh Game
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div data-chat-player={online ? folkChatId(online.room.matchId, mySeat) : undefined} data-folk-seat={mySeat} className={`fd-hud-strip ${state.turn === mySeat && !state.finished ? 'is-active' : ''}`}>
        <div>
          <strong>{playerName}</strong>
          <div style={{ fontSize: 12, color: '#86efac' }}>
            Ô {getNlcTargetBox(state, mySeat)} · {countHouses(state, mySeat)}/{state.maxHousesToWin} Nhà
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 900, color: '#fde047' }}>{state.scores[mySeat]}đ</span>
          <button type="button" className="fd-btn-secondary" style={{ padding: '6px 10px' }} disabled={exitDisabled} onClick={onExit}>
            Thoát
          </button>
        </div>
      </div>
    </main>
  );
};

export default NhayLoCoGame;
