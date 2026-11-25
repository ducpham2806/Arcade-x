import { BoardMotionToggle, useBoardMotion } from '../duel/BoardMotion';
import { BoardTerrainPicker, useBoardTerrain } from '../duel/BoardTerrain';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GameComponentProps } from '../../types';
import {
  loadFolkProfile,
  type FolkProfileSave,
} from '../folk-duel/economy';
import { FolkMatchReward, FolkResume, FolkRules, FolkSaveNotice } from '../folk-duel/FolkOfflineUi';
import { isOaqOfflineState, useFolkRestart, useOfflineMatch, type OfflineMode } from '../folk-duel/offlineMatch';
import { FolkShopModal } from '../folk-duel/FolkShopModal';
import { OnlineRoom, useFolkOnlineAvailability, type OnlineEntryMode } from '../folk-duel/OnlineRoom';
import { folkChatId } from '../folk-duel/online-protocol';
import { FolkSoundEngine } from '../folk-duel/sfx';
import { getSkinById } from '../folk-duel/skins-catalog';
import type { FolkSeat } from '../folk-duel/types';
import '../folk-duel/folk-duel.css';
import { chooseOaqBotMove, type OaqBotLevel } from './ai';
import { BOARD_H, BOARD_W, getOaqCellRects } from './renderer';
import { OaqSkinPreview } from './OaqSkinPreview';
import { OaqMoveHistory, rightDirection } from './OaqMoveHistory';
import { useOaqAnimation } from './useOaqAnimation';
import './board.css';
import {
  applyOaqMove,
  createInitialOaqState,
  getOaqTray,
  getOwnRange,
  previewOaqLandingCell,
  recordOaqTurn,
  type OaqDirection,
  type OaqMove,
  type OaqState,
} from './rules';

type ScreenMode =
  | { kind: 'home' }
  | { kind: 'offline' }
  | { kind: 'online'; entry: OnlineEntryMode };

export const OAnQuanGame: React.FC<GameComponentProps> = ({ bridge, isMuted = false, isPaused, registerRestart }) => {
  const [profile, setProfile] = useState<FolkProfileSave>(() => loadFolkProfile(bridge));
  const [screen, setScreen] = useState<ScreenMode>({ kind: 'home' });
  const folkOnlineEnabled = useFolkOnlineAvailability('o-an-quan', screen.kind === 'home');
  const offline = useOfflineMatch(bridge, createInitialOaqState, isOaqOfflineState);
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
          <h1>Ô ĂN QUAN</h1>
          <p>Dân gian Việt Nam · 1vs1</p>
        </div>
        <div className="fd-wallet-row">
          <span className="fd-candy-badge" title="Kẹo Mạch Nha dùng để đổi Skin">
            🍬 {profile.candyTokens} Kẹo
          </span>
          <button type="button" className="fd-shop-btn" onClick={() => setShowShop(true)}>
            Tiệm Tạp Hóa
          </button>
        </div>
      </header>

      {screen.kind === 'home' && (
        <main className="fd-home-body">
          <div className="fd-hero-card oaq-campaign-intro">
            <h2 style={{ margin: '0 0 6px', color: '#fde68a' }}>Ô Ăn Quan · Chiến Trường</h2>
            <p style={{ margin: 0, fontSize: 13, color: '#fed7aa' }}>
              Chọn ô Dân và hướng hành quân. Lính tính 1 điểm, Tướng tính 10 điểm. Có thể đổi địa hình hoặc chọn lại bàn Sân Đình trong trận.
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
              <span>Tìm đối thủ ngẫu nhiên · 25s/lượt</span>
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
              <span>Vào bàn của bạn bè</span>
            </button>
            </>}
            <button
              type="button"
              className="fd-menu-btn"
              onClick={() => startOffline('bot_easy')}
            >
              <strong>🤖 Bot Tí Sún (Dễ)</strong>
              <span>Làm quen cách rải quân</span>
            </button>
            <button
              type="button"
              className="fd-menu-btn"
              onClick={() => startOffline('bot_hard')}
            >
              <strong>🧠 Bot Bờm (Khó)</strong>
              <span>Đối thủ tính trước nhiều nước</span>
            </button>
            <button
              type="button"
              className="fd-menu-btn"
              onClick={() => startOffline('local_2p')}
            >
              <strong>👥 2 Người Chung Máy</strong>
              <span>Đấu trực tiếp cạnh nhau</span>
            </button>
            <button type="button" className="fd-menu-btn" onClick={() => setShowRules(true)}>
              <strong>📜 Luật Chơi Nhanh</strong>
              <span>Ăn kép · Bảo vệ Quan · Rải sinh</span>
            </button>
          </div>
        </main>
      )}

      {!offline.saved && <FolkSaveNotice onRetry={offline.retry}/>}
      {screen.kind === 'offline' && offline.match && (
        <OaqMatchBoard
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
          game="o-an-quan"
          gameTitle="Ô Ăn Quan"
          mode={screen.entry}
          onExit={() => setScreen({ kind: 'home' })}
          renderMatch={({ room, blocked, now, onAction, onRematch, onLeave, leaveDisabled }) => (
            <OaqMatchBoard
              mode={room.isPublic ? 'matchmaking' : 'friend_room'}
              key={room.matchId}
              matchId={room.matchId}
              mySeat={room.mySeat}
              opponentName={room.players.find((p) => p.seat !== room.mySeat)?.name ?? 'Đối thủ'}
              botLevel={null}
              state={room.state}
              externalMoveHandler={move => onAction({ type: 'sow', move })}
              chatMatchId={room.matchId}
              paused={isPaused || showShop}
              inputBlocked={blocked || now < room.readyAt}
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
          game="o-an-quan"
          profile={profile}
          bridge={bridge}
          onProfileChange={setProfile}
          onClose={() => setShowShop(false)}
          renderPreview={item => <OaqSkinPreview item={item} equipped={profile.equippedSkins}/>}
        />
      )}

      {showRules && (
        <FolkRules title="Luật chơi Ô Ăn Quan" onClose={() => setShowRules(false)}>
          <ol className="list-decimal pl-6">
            <li>Mỗi bên có 5 ô Dân. Hai ô Quan ở hai đầu có Quan trị giá 10 điểm.</li>
            <li>Chạm ô Dân phía mình hoặc dùng Tab và Enter để chọn. Xem ô rải cuối, rồi chọn Rải Trái hoặc Rải Phải.</li>
            <li>Ô kế bên còn quân thì bốc rải tiếp. Qua một ô trống gặp ô có quân thì ăn quân và có thể ăn kép.</li>
            <li>Hai lượt đầu chỉ được ăn Quan có sỏi Dân đi kèm. Khi cả hai Quan hết quân, hốt tàn và chốt điểm.</li>
          </ol>
        </FolkRules>
      )}
    </div>
  );
};

interface OaqMatchBoardProps {
  mode: 'bot_easy' | 'bot_hard' | 'local_2p' | 'friend_room' | 'matchmaking';
  matchId: string;
  mySeat: FolkSeat;
  opponentName: string;
  botLevel: OaqBotLevel | null;
  state: OaqState;
  onLocalStateChange?: (state: OaqState) => void;
  paused?: boolean;
  rewardReady?: boolean;
  inputBlocked?: boolean;
  externalMoveHandler?: (move: OaqMove) => void;
  chatMatchId?: string;
  profile: FolkProfileSave;
  sound: FolkSoundEngine;
  bridge: GameComponentProps['bridge'];
  onProfileChange: (next: FolkProfileSave) => void;
  onExit: () => void;
  exitDisabled?: boolean;
  onRematch?: () => void;
}

const OaqMatchBoard: React.FC<OaqMatchBoardProps> = ({
  mode, matchId, mySeat, opponentName, botLevel, state, onLocalStateChange,
  paused = false, rewardReady = true, inputBlocked = false, externalMoveHandler, profile, sound, bridge,
  onProfileChange, onExit, exitDisabled, onRematch, chatMatchId,
}) => {
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [bannerMsg, setBannerMsg] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardMotion = useBoardMotion('o-an-quan');
  const boardTerrain = useBoardTerrain('o-an-quan', 'grass');
  const previousState = useRef(state);

  const stoneSkin = getSkinById(profile.equippedSkins.oaq_stones);
  const localTwo = mode === 'local_2p';
  const activeSeat = localTwo ? state.turn : mySeat;
  const oppSeat = mySeat === 'P1' ? 'P2' : 'P1';
  const playerName = localTwo ? 'Người chơi 1' : 'Bạn';
  const names = useMemo((): Record<FolkSeat, string> => mySeat === 'P1'
    ? { P1: playerName, P2: opponentName }
    : { P1: opponentName, P2: playerName }, [mySeat, playerName, opponentName]);
  const ownCells = getOwnRange(activeSeat);

  const preview = useMemo(() => {
    if (selectedCell === null || state.finished || state.turn !== activeSeat) return [];
    const cw = previewOaqLandingCell(state, { cellIndex: selectedCell, direction: 'CW' });
    const ccw = previewOaqLandingCell(state, { cellIndex: selectedCell, direction: 'CCW' });
    return [cw, ccw].filter((cell): cell is number => cell !== null);
  }, [selectedCell, state, activeSeat]);

  const animation = useOaqAnimation({
    canvas: canvasRef, state, skins: profile.equippedSkins, selected: selectedCell, preview,
    paused: paused || showHistory, sound, stoneSound: stoneSkin.sfxProfile, motionEnabled: boardMotion.enabled, terrain: boardTerrain.terrain,
  });
  const { startingBoard, start, running } = animation;
  const shown = startingBoard ?? state;
  const scoreboard = boardTerrain.terrain !== 'classic' ? animation.presentedTray ?? shown : shown;
  const canMove = !inputBlocked && !paused && !showHistory && !startingBoard && !state.finished && state.turn === activeSeat;

  const present = useCallback((before: OaqState, result: ReturnType<typeof applyOaqMove>) => {
    if (!start(before, result.steps)) {
      const capture = result.steps.find(step => step.type === 'capture');
      if (capture) sound.playCapture(capture.isQuan);
      else if (result.steps.some(step => step.type === 'drop')) sound.playDropStone(0, stoneSkin.sfxProfile);
    }
    const next = result.nextState;
    const actor = names[before.turn];
    if (next.lastComboCount > 1) {
      setBannerMsg(`${actor} ăn kép ×${next.lastComboCount} · +${next.lastCapturedPoints} điểm`);
    } else if (next.lastCapturedPoints > 0) {
      setBannerMsg(`${actor} ăn +${next.lastCapturedPoints} điểm`);
    } else {
      setBannerMsg('');
    }
  }, [names, start, sound, stoneSkin.sfxProfile]);

  // A room update can follow an opponent's turn. Advance only from the preceding board.
  useEffect(() => {
    const before = previousState.current;
    previousState.current = state;
    const move = state.history?.at(-1);
    if (!externalMoveHandler || before === state || before.finished || running() || move?.turn !== before.turnNumber) return;
    const result = applyOaqMove(before, move.seat, move.move);
    if (result.ok) present(before, result);
  }, [state, externalMoveHandler, present, running]);

  useEffect(() => {
    if (paused || showHistory || startingBoard || !botLevel || state.finished || state.turn !== 'P2') return;
    const timer = setTimeout(() => {
      const move = chooseOaqBotMove(state, 'P2', botLevel);
      if (!move) return;
      const result = applyOaqMove(state, 'P2', move);
      if (!result.ok) return;
      present(state, result);
      onLocalStateChange?.(recordOaqTurn(state, move, result.nextState, result.steps));
    }, 650);
    return () => clearTimeout(timer);
  }, [paused, showHistory, startingBoard, botLevel, state, onLocalStateChange, present]);

  function executeMove(direction: OaqDirection) {
    if (selectedCell === null || !canMove || running()) return;
    const move = { cellIndex: selectedCell, direction };
    const result = applyOaqMove(state, activeSeat, move);
    if (!result.ok) {
      setBannerMsg(result.error || 'Nước đi không hợp lệ.');
      return;
    }
    if (externalMoveHandler) {
      externalMoveHandler(move);
      setSelectedCell(null);
      return;
    } else {
      onLocalStateChange?.(recordOaqTurn(state, move, result.nextState, result.steps));
    }
    present(state, result);
    setSelectedCell(null);
  }

  function seatHud(seat: FolkSeat) {
    const active = !shown.finished && shown.turn === seat;
    const tray = getOaqTray(scoreboard, seat);
    const side = seat === 'P1' ? '1' : '2';
    return <div data-chat-player={chatMatchId ? folkChatId(chatMatchId, seat) : undefined} data-folk-seat={seat} className={`fd-hud-strip oaq-seat${active ? ' is-active' : ''}`}>
      <span className="oaq-seat-mark" aria-label={`Ghế ${side}`}>{side}</span>
      <div className="oaq-seat-name">
        <strong>{names[seat]}</strong>
        <span>{active ? startingBoard ? 'Đang đi quân' : 'Đến lượt' : shown.finished ? 'Kết thúc' : 'Đang chờ'}</span>
      </div>
      <div className="oaq-seat-score" role="group" aria-label={`Mẹt ${side}, ${tray.dan} sỏi, ${tray.quan} Quan, ${scoreboard.scores[seat]} điểm`}>
        <b>{scoreboard.scores[seat]}</b> <span>điểm</span>
      </div>
      {seat === 'P1' && <button type="button" className="fd-btn-secondary oaq-exit" disabled={exitDisabled} onClick={onExit}>Thoát</button>}
    </div>;
  }

  const right = rightDirection(activeSeat);
  return (
    <main className="fd-board-stage oaq-stage" data-oaq-playing={!!startingBoard} data-oaq-terrain={boardTerrain.terrain}
      style={{ '--oaq-board-ratio': BOARD_W / BOARD_H } as React.CSSProperties}>
      {seatHud('P2')}
      <div className="fd-oaq-board" data-chat-protect="true">
        <canvas ref={canvasRef} width={BOARD_W} height={BOARD_H} className="fd-pixel-canvas" aria-hidden="true"/>
        <div className="fd-oaq-targets" role="group" aria-label="Ô dân trên bàn">
          {getOaqCellRects().filter(cell => !cell.isQuan).map(({ idx, x, y, w, h }) => (
            <button key={idx} type="button" className="fd-cell-target" data-folk-cell={idx}
              style={{ left: `${x / BOARD_W * 100}%`, top: `${y / BOARD_H * 100}%`, width: `${w / BOARD_W * 100}%`, height: `${h / BOARD_H * 100}%` }}
              disabled={!canMove || !ownCells.includes(idx) || state.cells[idx] === 0}
              aria-label={`Ô ${idx}, ${shown.cells[idx]} sỏi`} aria-pressed={selectedCell === idx}
              onClick={() => { setSelectedCell(idx); setBannerMsg(`Đã chọn ô ${idx}. Chọn một hướng rải.`); }}/>
          ))}
        </div>
      </div>
      {seatHud('P1')}

      <div className="fd-controls-bar" data-chat-protect="true">
        {startingBoard ? (
          <>
            <p className="fd-status" role="status">{names[startingBoard.turn]} đang thực hiện lượt đi.</p>
            <button type="button" className="fd-btn-secondary" onClick={animation.finish}>Bỏ qua hiệu ứng</button>
          </>
        ) : !state.finished ? (
          <>
            <p className="fd-status" role="status">{bannerMsg || `Đến lượt ${names[state.turn]}`}</p>
            <button type="button" className="fd-btn-primary" disabled={selectedCell === null || !canMove}
              onClick={() => executeMove(right === 'CW' ? 'CCW' : 'CW')}>◀ Rải Trái</button>
            <button type="button" className="fd-btn-primary" disabled={selectedCell === null || !canMove}
              onClick={() => executeMove(right)}>Rải Phải ▶</button>
          </>
        ) : (
          <div className="fd-room-card oaq-result">
            <h3>{state.winner === 'DRAW' || !state.winner ? 'Hòa nhau!' : `${names[state.winner]} thắng!`}</h3>
            <p>{playerName} <b>{state.scores[mySeat]}</b> – <b>{state.scores[oppSeat]}</b> {opponentName}</p>
            <FolkMatchReward
              input={{ matchId, game: 'o-an-quan', mode, won: state.winner === mySeat, isDraw: state.winner === 'DRAW',
                skillBonuses: state.quanCaptured[mySeat], score: state.scores[mySeat] }}
              profile={profile} bridge={bridge} ready={rewardReady} onProfileChange={onProfileChange} onAward={() => sound.playWin()}
            />
            <div className="fd-btn-row">
              {onRematch && <button type="button" className="fd-btn-primary" onClick={onRematch}>Đấu Lại</button>}
              <button type="button" className="fd-btn-secondary" disabled={exitDisabled} onClick={onExit}>Về Sảnh Game</button>
            </div>
          </div>
        )}
        <div className="oaq-board-options">
          <BoardMotionToggle {...boardMotion} className="fd-btn-secondary"/>
          <BoardTerrainPicker {...boardTerrain} className="fd-btn-secondary" disabled={!!startingBoard}/>
        </div>
        <button type="button" className="fd-btn-secondary oaq-history-button" onClick={() => setShowHistory(true)}>
          Lịch sử lượt đi{state.history?.length ? ` · ${state.history.length}` : ''}
        </button>
      </div>
      {showHistory && <OaqMoveHistory turns={state.history ?? []} names={names} onClose={() => setShowHistory(false)}/>}
    </main>
  );
};

export default OAnQuanGame;
