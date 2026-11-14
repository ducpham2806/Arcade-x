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
  | { kind: 'bot'; level: OaqBotLevel; matchId: string }
  | { kind: 'local_2p'; matchId: string }
  | { kind: 'online'; entry: OnlineEntryMode };

export const OAnQuanGame: React.FC<GameComponentProps> = ({ bridge, isMuted = false }) => {
  const [profile, setProfile] = useState<FolkProfileSave>(() => loadFolkProfile(bridge));
  const [screen, setScreen] = useState<ScreenMode>({ kind: 'home' });
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
              onClick={() => setScreen({ kind: 'bot', level: 'easy', matchId: `oaq_easy_${Date.now()}` })}
            >
              <strong>🤖 Bot Tí Sún (Dễ)</strong>
              <span>Làm quen luật · +25 Xu</span>
            </button>
            <button
              type="button"
              className="fd-menu-btn"
              onClick={() => setScreen({ kind: 'bot', level: 'hard', matchId: `oaq_hard_${Date.now()}` })}
            >
              <strong>🧠 Bot Bờm (Khó)</strong>
              <span>Minimax tính nước · +45 Xu</span>
            </button>
            <button
              type="button"
              className="fd-menu-btn"
              onClick={() => setScreen({ kind: 'local_2p', matchId: `oaq_2p_${Date.now()}` })}
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

      {(screen.kind === 'bot' || screen.kind === 'local_2p') && (
        <OaqMatchBoard
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
                ? { kind: 'bot', level: screen.level, matchId: `oaq_${screen.level}_${Date.now()}` }
                : { kind: 'local_2p', matchId: `oaq_2p_${Date.now()}` }
            )
          }
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
              externalState={room.state}
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
        <div className="fd-overlay" role="dialog" aria-modal="true">
          <div className="fd-room-card" style={{ textAlign: 'left' }}>
            <h2 style={{ margin: 0, color: '#fde68a' }}>Luật Chơi Ô Ăn Quan</h2>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.6 }}>
              <li>Mỗi bên có <b>5 ô Dân</b> (5 sỏi/ô) và 2 ô <b>Quan</b> ở hai đầu (10 điểm/Quan).</li>
              <li>Đến lượt, chạm 1 ô Dân của mình rồi chọn <b>◀ Rải Trái</b> hoặc <b>Rải Phải ▶</b>.</li>
              <li>Viên cuối rơi trước ô có quân thì bốc rải tiếp; rơi trước 1 ô trống + 1 ô có quân thì được <b>Ăn quân</b> (có thể ăn kép liên hoàn!).</li>
              <li>2 lượt đầu không được ăn Quan khi Quan chưa có sỏi Dân đi kèm.</li>
              <li>Cả 2 ô Quan hết quân -> Hốt tàn, ai nhiều điểm hơn thắng!</li>
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

interface OaqMatchBoardProps {
  mode: 'bot_easy' | 'bot_hard' | 'local_2p' | 'friend_room' | 'matchmaking';
  matchId: string;
  mySeat: FolkSeat;
  opponentName: string;
  botLevel: OaqBotLevel | null;
  externalState?: OaqState;
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
  externalState,
  externalMoveHandler,
  profile,
  sound,
  bridge,
  onProfileChange,
  onExit,
  onRematch,
}) => {
  const [localState, setLocalState] = useState<OaqState>(() => createInitialOaqState());
  const state = externalState ?? localState;
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [bannerMsg, setBannerMsg] = useState<string>('Chạm vào một ô Dân của bạn để rải sỏi.');
  const [rewardInfo, setRewardInfo] = useState<{ coins: number; exp: number; candy: number } | null>(null);
  const rewardedRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stoneSkin = getSkinById(profile.equippedSkins.oaq_stones);

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
    if (!botLevel || state.finished || state.turn !== 'P2') return;
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
        setLocalState(res.nextState);
      }
    }, 650);
    return () => clearTimeout(timer);
  }, [botLevel, state, opponentName, sound, stoneSkin.sfxProfile]);

  // Trao thưởng khi ván đấu kết thúc
  useEffect(() => {
    if (!state.finished || rewardedRef.current) return;
    rewardedRef.current = true;
    sound.playWin();
    const won = state.winner === mySeat;
    const isDraw = state.winner === 'DRAW';
    const out = applyMatchReward(
      profile,
      {
        matchId,
        game: 'o-an-quan',
        mode,
        won,
        isDraw,
        skillBonuses: state.quanCaptured[mySeat],
        score: state.scores[mySeat],
      },
      bridge
    );
    onProfileChange(out.profile);
    if (!out.alreadyClaimed) {
      setRewardInfo({ coins: out.coins, exp: out.exp, candy: out.candy });
    }
  }, [state.finished]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (state.finished) return;
    const activeSeat = mode === 'local_2p' ? state.turn : mySeat;
    if (state.turn !== activeSeat) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = BOARD_W / rect.width;
    const scaleY = BOARD_H / rect.height;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top) * scaleY;

    const cellRects = getOaqCellRects();
    const hit = cellRects.find((r) => cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.h);
    if (!hit) return;

    const ownRange = getOwnRange(activeSeat);
    if (ownRange.includes(hit.idx) && state.cells[hit.idx] > 0) {
      setSelectedCell(hit.idx);
      setBannerMsg(`Đã chọn ô ${hit.idx}. Hãy chọn hướng Rải Trái hoặc Rải Phải.`);
    }
  };

  const executeMove = (dir: OaqDirection) => {
    if (selectedCell === null || state.finished) return;
    const activeSeat = mode === 'local_2p' ? state.turn : mySeat;
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
    setLocalState(res.nextState);
    setSelectedCell(null);
  };

  const oppSeat: FolkSeat = mySeat === 'P1' ? 'P2' : 'P1';

  return (
    <main className="fd-board-stage">
      <div className={`fd-hud-strip ${state.turn === oppSeat && !state.finished ? 'is-active' : ''}`}>
        <div>
          <strong>{opponentName}</strong>
          <div style={{ fontSize: 12, color: '#fcd34d' }}>
            {state.turn === oppSeat && !state.finished ? '⏳ Đang suy nghĩ…' : 'Đang chờ'}
          </div>
        </div>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#fde047' }}>
          {state.scores[oppSeat]} điểm
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 680, position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={BOARD_W}
          height={BOARD_H}
          onClick={handleCanvasClick}
          className="fd-pixel-canvas"
          style={{ width: '100%', height: 'auto', borderRadius: 14, border: '3px solid #78350f', cursor: 'pointer' }}
        />
      </div>

      <div className="fd-controls-bar">
        {!state.finished ? (
          <>
            <button
              type="button"
              className="fd-btn-primary"
              disabled={selectedCell === null}
              onClick={() => executeMove('CCW')}
            >
              ◀ Rải Trái
            </button>
            <span style={{ fontSize: 13, color: '#fde68a', textAlign: 'center', minWidth: 180 }}>
              {bannerMsg}
            </span>
            <button
              type="button"
              className="fd-btn-primary"
              disabled={selectedCell === null}
              onClick={() => executeMove('CW')}
            >
              Rải Phải ▶
            </button>
          </>
        ) : (
          <div className="fd-room-card" style={{ width: '100%', maxWidth: 520, padding: 14 }}>
            <h3 style={{ margin: 0, color: '#fde047' }}>
              {state.winner === 'DRAW'
                ? '🤝 HÒA NHAU!'
                : state.winner === mySeat
                ? '🏆 BẠN ĐÃ CHIẾN THẮNG!'
                : '😅 ĐỐI THỦ THẮNG RỒI!'}
            </h3>
            <p style={{ margin: '4px 0', fontSize: 13 }}>
              Tỉ số chung cuộc: Bạn <b>{state.scores[mySeat]}</b> – <b>{state.scores[oppSeat]}</b> {opponentName}
            </p>
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

      <div className={`fd-hud-strip ${state.turn === mySeat && !state.finished ? 'is-active' : ''}`}>
        <div>
          <strong>Bạn ({mode === 'local_2p' ? (state.turn === 'P1' ? 'P1' : 'P2') : 'Sân Dưới'})</strong>
          <div style={{ fontSize: 12, color: '#86efac' }}>
            {state.turn === mySeat && !state.finished ? '✨ Đến lượt bạn' : 'Chờ đối thủ'}
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
