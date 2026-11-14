import React, { useEffect, useState } from 'react';
import { FOLK_EMOTES, type EquippedFolkSkins, type FolkGameKind, type FolkRoomSnapshot, type FolkSeat } from './types';
import type { FolkRoomServer } from './server';

export type OnlineEntryMode = 'match' | 'create' | 'join';

interface OnlineRoomProps<TState, TMove> {
  gameKind: FolkGameKind;
  gameTitle: string;
  mode: OnlineEntryMode;
  server: FolkRoomServer<TState, TMove>;
  userId: string;
  playerName: string;
  skins: EquippedFolkSkins;
  onExit: () => void;
  renderMatch: (ctx: {
    room: FolkRoomSnapshot<TState>;
    mySeat: FolkSeat;
    onMove: (move: TMove) => { ok: boolean; error?: string };
    onEmote: (emoteId: string) => void;
    onRematch: () => void;
    onLeave: () => void;
  }) => React.ReactNode;
}

export function OnlineRoom<TState, TMove>({
  gameKind,
  gameTitle,
  mode,
  server,
  userId,
  playerName,
  skins,
  onExit,
  renderMatch,
}: OnlineRoomProps<TState, TMove>) {
  const [room, setRoom] = useState<FolkRoomSnapshot<TState> | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setError('');
    if (mode === 'create') {
      setRoom(server.createRoom({ userId, name: playerName, gameKind, isPublic: false, skins }));
    } else if (mode === 'match') {
      setRoom(server.matchmake({ userId, name: playerName, gameKind, skins }));
    } else {
      setRoom(null);
    }
  }, [mode, gameKind, userId, playerName]);

  useEffect(() => {
    if (!room) return;
    const interval = setInterval(() => {
      const updated = server.getRoom(room.roomId, Date.now());
      if (updated && updated.version !== room.version) {
        setRoom(updated);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [room?.roomId, room?.version]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = server.joinByCode({ userId, name: playerName, code: joinCode, skins });
    if (!res.ok || !res.room) {
      setError(res.error || 'Không vào được phòng.');
      return;
    }
    setRoom(res.room);
  };

  const handleCopyCode = () => {
    if (!room) return;
    const text = `Vào đấu ${gameTitle} 1vs1 với mình trên ArcadeX! Mã phòng: ${room.code}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(room.code).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    void text;
  };

  const handleLeave = () => {
    if (room) {
      server.leaveRoom(room.roomId, userId);
    }
    onExit();
  };

  if (!room && mode === 'join') {
    return (
      <div className="fd-room-card">
        <h2>Nhập Mã Phòng 1vs1</h2>
        <p className="fd-subtitle">Nhập mã 6 ký tự từ bạn bè để vào thẳng bàn {gameTitle}.</p>
        <form onSubmit={handleJoin} className="fd-join-form">
          <input
            type="text"
            maxLength={6}
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="VD: K8M4P2"
            className="fd-code-input"
            aria-label="Mã phòng 6 ký tự"
          />
          {error && <p className="fd-error-text">{error}</p>}
          <div className="fd-btn-row">
            <button type="submit" className="fd-btn-primary" disabled={joinCode.trim().length < 4}>
              Vào Phòng
            </button>
            <button type="button" className="fd-btn-secondary" onClick={onExit}>
              Quay lại
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="fd-room-card">
        <p>Đang kết nối phòng đấu…</p>
      </div>
    );
  }

  const mySeat: FolkSeat = room.players.find((p) => p.userId === userId)?.seat ?? 'P1';

  if (room.phase === 'lobby' || room.phase === 'countdown') {
    return (
      <div className="fd-room-card">
        <div className="fd-room-badge">{room.isPublic ? '⚡ Ghép Trận 1vs1' : '🏠 Phòng Riêng'}</div>
        <h2>{room.phase === 'countdown' ? 'Đã đủ 2 người! Chuẩn bị vào trận…' : 'Đang chờ đối thủ'}</h2>

        {!room.isPublic && (
          <div className="fd-invite-box">
            <span className="fd-invite-label">Mã Mời Bạn Bè</span>
            <div className="fd-invite-code">{room.code}</div>
            <button type="button" className="fd-btn-primary" onClick={handleCopyCode}>
              {copied ? '✓ Đã sao chép mã!' : '📋 Sao chép mã mời'}
            </button>
          </div>
        )}

        <div className="fd-seats-row">
          {(['P1', 'P2'] as FolkSeat[]).map((seat) => {
            const player = room.players.find((p) => p.seat === seat);
            return (
              <div key={seat} className={`fd-seat-box ${player ? 'is-occupied' : ''}`}>
                <span className="fd-seat-tag">{seat === 'P1' ? 'Chủ Sân' : 'Khách Thách Đấu'}</span>
                <strong>{player ? player.name : 'Đang chờ…'}</strong>
              </div>
            );
          })}
        </div>

        <button type="button" className="fd-btn-secondary" onClick={handleLeave}>
          Rời phòng
        </button>
      </div>
    );
  }

  return (
    <>
      {renderMatch({
        room,
        mySeat,
        onMove: (move) => {
          const res = server.submitMove({
            roomId: room.roomId,
            userId,
            expectedVersion: room.version,
            requestId: `${userId}_${room.version}_${Date.now()}`,
            move,
          });
          if (res.room) setRoom(res.room);
          return { ok: res.ok, error: res.error };
        },
        onEmote: (emoteId) => {
          const updated = server.sendEmote(room.roomId, userId, emoteId);
          if (updated) setRoom(updated);
        },
        onRematch: () => {
          const updated = server.voteRematch(room.roomId, userId);
          if (updated) setRoom(updated);
        },
        onLeave: handleLeave,
      })}
      <div className="fd-emote-bar" aria-label="Biểu cảm nhanh">
        {FOLK_EMOTES.map((em) => (
          <button
            key={em.id}
            type="button"
            title={em.label}
            className="fd-emote-btn"
            onClick={() => {
              const updated = server.sendEmote(room.roomId, userId, em.id);
              if (updated) setRoom(updated);
            }}
          >
            {em.emoji}
          </button>
        ))}
      </div>
    </>
  );
}
