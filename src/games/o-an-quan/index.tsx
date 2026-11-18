import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { GameComponentProps } from '../../types';
import {
  loadFolkProfile,
  type FolkProfileSave,
} from '../folk-duel/economy';
import { FolkMatchReward, FolkResume, FolkRules, FolkSaveNotice } from '../folk-duel/FolkOfflineUi';
import { isOaqOfflineState, useOfflineMatch, type OfflineMode } from '../folk-duel/offlineMatch';
import { FolkShopModal } from '../folk-duel/FolkShopModal';
import { OnlineRoom, type OnlineEntryMode } from '../folk-duel/OnlineRoom';
import { FolkRoomServer } from '../folk-duel/server';
import { FolkSoundEngine } from '../folk-duel/sfx';
import { getSkinById } from '../folk-duel/skins-catalog';
import type { FolkSeat } from '../folk-duel/types';
import '../folk-duel/folk-duel.css';
import { chooseOaqBotMove, type OaqBotLevel } from './ai';
import { BOARD_H, BOARD_W, getOaqCellRects, renderOAnQuanBoard } from './renderer';
import {
  applyOaqMove,
  createInitialOaqState,
  getOwnRange,
  previewOaqLandingCell,
  type OaqDirection,
  type OaqMove,
  type OaqState,
} from './rules';

// Server phòng cục bộ dùng cho preview/test tức thì (khi chưa bật Edge Function)
const sharedLocalOaqServer = new FolkRoomServer<OaqState, OaqMove>({
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

type ScreenMode =
  | { kind: 'home' }
  | { kind: 'offline' }
  | { kind: 'online'; entry: OnlineEntryMode };

export const OAnQuanGame: React.FC<GameComponentProps> = ({ bridge, isMuted = false, isPaused }) => {
  const [profile, setProfile] = useState<FolkProfileSave>(() => loadFolkProfile(bridge));
  const [screen, setScreen] = useState<ScreenMode>({ kind: 'home' });
  const offline = useOfflineMatch(bridge, createInitialOaqState, isOaqOfflineState);
  const mode = offline.match?.mode;
  const botLevel = mode === 'bot_easy' ? 'easy' : mode === 'bot_hard' ? 'hard' : null;
  const startOffline = (mode: OfflineMode) => {
    if (offline.start(mode)) setScreen({ kind: 'offline' });
  };
  const [showShop, setShowShop] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [localUserId] = useState(() => `player_${Math.random().toString(36).slice(2, 8)}`);

  const mutedRef = useRef(isMuted);
  mutedRef.current = isMuted;
  const soundRef = useRef<FolkSoundEngine | null>(null);
  soundRef.current ??= new FolkSoundEngine(() => mutedRef.current);

  useEffect(() => () => soundRef.current?.dispose(), []);

  return (
    <div className="fd-shell">
      <header className="fd-header">
        <div className="fd-title-group">
          <h1>Ô ĂN QUAN · SÂN ĐÌNH</h1>
          <p>Dân gian Việt Nam · 1vs1</p>
        </div>
        <div className="fd-wallet-row">
          <span className="fd-candy-badge" title="Kẹo Mạch Nha dùng để đổi Skin">
            🍬 {profile.candyTokens} Kẹo
          </span>
          <button type="button" className="fd-shop-btn" onClick={() => setShowShop(true)}>
            🏪 Tiệm Tạp Hóa
          </button>
        </div>
      </header>

      {screen.kind === 'home' && (
        <main className="fd-home-body">
          <div className="fd-hero-card">
            <h2 style={{ margin: '0 0 6px', color: '#fde68a' }}>Sân Gạch Tàu · Rải Sỏi Tính Nước</h2>
            <p style={{ margin: 0, fontSize: 13, color: '#fed7aa' }}>
              Chạm ô Dân chọn hướng rải sỏi, săn Ăn Kép và hốt trọn Quan. Kiếm Xu &amp; Kẹo Mạch Nha để sưu tập bộ Bi Ve, Xu Cổ, Ngọc Bích Rồng!
            </p>
          </div>

          <div className="fd-menu-grid">
            {offline.match && <FolkResume match={offline.match} onResume={() => setScreen({ kind: 'offline' })}/>}
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
          onRematch={() => startOffline(offline.match!.mode)}
        />
      )}

      {screen.kind === 'online' && (
        <OnlineRoom
          gameKind="o-an-quan"
          gameTitle="Ô Ăn Quan"
          mode={screen.entry}
          server={sharedLocalOaqServer}
          userId={localUserId}
          playerName="Kỳ Thủ"
          skins={profile.equippedSkins}
          onExit={() => setScreen({ kind: 'home' })}
          renderMatch={({ room, mySeat, onMove, onRematch, onLeave }) => (
            <OaqMatchBoard
              mode={room.isPublic ? 'matchmaking' : 'friend_room'}
              matchId={room.roomId}
              mySeat={mySeat}
              opponentName={room.players.find((p) => p.seat !== mySeat)?.name ?? 'Đối thủ'}
              botLevel={null}
              state={room.state}
              externalMoveHandler={(mv) => {
                onMove(mv);
              }}
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
          game="o-an-quan"
          profile={profile}
          bridge={bridge}
          onProfileChange={setProfile}
          onClose={() => setShowShop(false)}
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
  externalMoveHandler?: (move: OaqMove) => void;
  profile: FolkProfileSave;
  sound: FolkSoundEngine;
  bridge: GameComponentProps['bridge'];
  onProfileChange: (next: FolkProfileSave) => void;
  onExit: () => void;
  onRematch: () => void;
}

const OaqMatchBoard: React.FC<OaqMatchBoardProps> = ({
  mode,
  matchId,
  mySeat,
  opponentName,
  botLevel,
  state,
  onLocalStateChange,
  paused = false,
  rewardReady = true,
  externalMoveHandler,
  profile,
  sound,
  bridge,
  onProfileChange,
  onExit,
  onRematch,
}) => {
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [bannerMsg, setBannerMsg] = useState<string>('Chạm vào một ô Dân của bạn để rải sỏi.');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stoneSkin = getSkinById(profile.equippedSkins.oaq_stones);
  const localTwo = mode === 'local_2p';
  const activeSeat = localTwo ? state.turn : mySeat;
  const canMove = !paused && !state.finished && state.turn === activeSeat;
  const ownCells = getOwnRange(activeSeat);

  const previewCells = useMemo(() => {
    if (selectedCell === null || state.finished) return [];
    const cw = previewOaqLandingCell(state, { cellIndex: selectedCell, direction: 'CW' });
    const ccw = previewOaqLandingCell(state, { cellIndex: selectedCell, direction: 'CCW' });
    return [cw, ccw].filter((x): x is number => x !== null);
  }, [selectedCell, state]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      renderOAnQuanBoard(ctx, state, profile.equippedSkins, selectedCell, previewCells);
    }
  }, [state, profile.equippedSkins, selectedCell, previewCells]);

  // Bot tự động đi khi đến lượt P2
  useEffect(() => {
    if (paused || !botLevel || state.finished || state.turn !== 'P2') return;
    const timer = setTimeout(() => {
      const mv = chooseOaqBotMove(state, 'P2', botLevel);
      if (!mv) return;
      const res = applyOaqMove(state, 'P2', mv);
      if (res.ok) {
        sound.playDropStone(2, stoneSkin.sfxProfile);
        if (res.nextState.lastCapturedPoints > 0) {
          sound.playCapture(res.nextState.lastCapturedPoints >= 10);
          setBannerMsg(`${opponentName} vừa ăn ${res.nextState.lastCapturedPoints} điểm!`);
        } else {
          setBannerMsg(`Đến lượt của bạn!`);
        }
        onLocalStateChange?.(res.nextState);
      }
    }, 650);
    return () => clearTimeout(timer);
  }, [paused, botLevel, state, opponentName, sound, stoneSkin.sfxProfile, onLocalStateChange]);

  const executeMove = (dir: OaqDirection) => {
    if (selectedCell === null || !canMove) return;
    const mv: OaqMove = { cellIndex: selectedCell, direction: dir };

    if (externalMoveHandler) {
      externalMoveHandler(mv);
      setSelectedCell(null);
      return;
    }

    const res = applyOaqMove(state, activeSeat, mv);
    if (!res.ok) {
      setBannerMsg(res.error || 'Nước đi không hợp lệ.');
      return;
    }
    sound.playDropStone(0, stoneSkin.sfxProfile);
    if (res.nextState.lastCapturedPoints > 0) {
      sound.playCapture(res.nextState.lastCapturedPoints >= 10);
      setBannerMsg(
        res.nextState.lastComboCount > 1
          ? `ĂN KÉP x${res.nextState.lastComboCount}! +${res.nextState.lastCapturedPoints} điểm!`
          : `Tuyệt vời! Bạn vừa ăn +${res.nextState.lastCapturedPoints} điểm.`
      );
    } else {
      setBannerMsg(mode === 'local_2p' ? `Đến lượt ${res.nextState.turn === 'P1' ? 'Người 1' : 'Người 2'}` : 'Đang chờ đối thủ…');
    }
    onLocalStateChange?.(res.nextState);
    setSelectedCell(null);
  };

  const oppSeat: FolkSeat = mySeat === 'P1' ? 'P2' : 'P1';
  const playerName = localTwo ? 'Người chơi 1' : 'Bạn';
  const winnerName = state.winner === mySeat ? playerName : opponentName;

  return (
    <main className="fd-board-stage">
      <div data-folk-seat={oppSeat} className={`fd-hud-strip ${state.turn === oppSeat && !state.finished ? 'is-active' : ''}`}>
        <div>
          <strong>{opponentName}</strong>
          <div style={{ fontSize: 12, color: '#fcd34d' }}>
            {state.turn === oppSeat && !state.finished ? localTwo ? 'Đến lượt rải' : 'Đang suy nghĩ…' : 'Đang chờ'}
          </div>
        </div>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#fde047' }}>
          {state.scores[oppSeat]} điểm
        </div>
      </div>

      <div className="fd-oaq-board" data-chat-protect="true">
        <canvas
          ref={canvasRef}
          width={BOARD_W}
          height={BOARD_H}
          className="fd-pixel-canvas"
          aria-hidden="true"
        />
        <div className="fd-oaq-targets" role="group" aria-label="Ô dân trên bàn">
          {getOaqCellRects().filter(cell => !cell.isQuan).map(({ idx, x, y, w, h }) => (
            <button key={idx} type="button" className="fd-cell-target" data-folk-cell={idx}
              style={{ left: `${x / BOARD_W * 100}%`, top: `${y / BOARD_H * 100}%`, width: `${w / BOARD_W * 100}%`, height: `${h / BOARD_H * 100}%` }}
              disabled={!canMove || !ownCells.includes(idx) || state.cells[idx] === 0}
              aria-label={`Ô ${idx}, ${state.cells[idx]} sỏi`} aria-pressed={selectedCell === idx}
              onClick={() => { setSelectedCell(idx); setBannerMsg(`Đã chọn ô ${idx}. Chọn một hướng rải.`); }} />
          ))}
        </div>
      </div>

      <div className="fd-controls-bar">
        {!state.finished ? (
          <>
            <p className="fd-status" role="status">{bannerMsg}</p>
            <button
              type="button"
              className="fd-btn-primary"
              disabled={selectedCell === null || !canMove}
              onClick={() => executeMove('CCW')}
            >
              ◀ Rải Trái
            </button>
            <button
              type="button"
              className="fd-btn-primary"
              disabled={selectedCell === null || !canMove}
              onClick={() => executeMove('CW')}
            >
              Rải Phải ▶
            </button>
          </>
        ) : (
          <div className="fd-room-card" style={{ width: '100%', maxWidth: 520, padding: 14 }}>
            <h3 style={{ margin: 0, color: '#fde047' }}>
              {state.winner === 'DRAW' ? 'Hòa nhau!' : `${winnerName} thắng!`}
            </h3>
            <p style={{ margin: '4px 0', fontSize: 13 }}>
              {playerName} <b>{state.scores[mySeat]}</b> – <b>{state.scores[oppSeat]}</b> {opponentName}
            </p>
            <FolkMatchReward
              input={{ matchId, game: 'o-an-quan', mode, won: state.winner === mySeat, isDraw: state.winner === 'DRAW',
                skillBonuses: state.quanCaptured[mySeat], score: state.scores[mySeat] }}
              profile={profile} bridge={bridge} ready={rewardReady} onProfileChange={onProfileChange} onAward={() => sound.playWin()}
            />
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

      <div data-folk-seat={mySeat} className={`fd-hud-strip ${state.turn === mySeat && !state.finished ? 'is-active' : ''}`}>
        <div>
          <strong>{playerName}</strong>
          <div style={{ fontSize: 12, color: '#86efac' }}>
            {state.turn === mySeat && !state.finished ? 'Đến lượt rải' : 'Đang chờ'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#fde047' }}>{state.scores[mySeat]} điểm</span>
          <button type="button" className="fd-btn-secondary" style={{ padding: '6px 10px' }} onClick={onExit}>
            Thoát
          </button>
        </div>
      </div>
    </main>
  );
};

export default OAnQuanGame;
