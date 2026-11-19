import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { fetchCatalog } from '../../launcher/repository';
import { SYNC } from '../../services/syncPolicy';
import { platformFolkClient, type FolkOnlineClient } from './online-client';
import type { FolkCommand, FolkOnlineRoom } from './online-protocol';
import type { FolkGameKind } from './types';
import { useFolkChat } from './useFolkChat';

const localPreview = import.meta.env.DEV && import.meta.env.VITE_FOLK_ONLINE === '1';
export type OnlineEntryMode = 'match' | 'create' | 'join' | 'resume';

export function useFolkOnlineAvailability(game: FolkGameKind, inMenu: boolean) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    if (localPreview) return;
    setEnabled(false);
    if (!inMenu) return;
    let generation = 0;
    const disable = () => { generation++; setEnabled(false); };
    const refresh = async () => {
      const current = ++generation;
      try {
        const catalog = await fetchCatalog(true);
        if (current !== generation) return;
        setEnabled(catalog.games.some(row => row.id === game && row.folkOnlineEnabled));
      } catch {
        if (current === generation) setEnabled(false);
      }
    };
    const onVisible = () => { if (!document.hidden) void refresh(); };
    void refresh();
    const timer = setInterval(onVisible, SYNC.library);
    window.addEventListener('online', refresh);
    window.addEventListener('offline', disable);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      generation++;
      clearInterval(timer);
      window.removeEventListener('online', refresh);
      window.removeEventListener('offline', disable);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [game, inMenu]);
  return localPreview || enabled;
}

interface OnlineRoomProps<Game extends FolkGameKind> {
  game: Game;
  gameTitle: string;
  mode: OnlineEntryMode;
  onExit: () => void;
  renderMatch: (ctx: {
    room: FolkOnlineRoom<Game>;
    blocked: boolean;
    now: number;
    readArrivalTime: () => number;
    onAction: (command: FolkCommand) => void;
    onRematch?: () => void;
    onLeave: () => void;
    leaveDisabled: boolean;
  }) => ReactNode;
}

function FolkLeaveDialog({ finished, disabled, onClose, onConfirm }: {
  finished: boolean;
  disabled: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const title = useId();
  const description = useId();
  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return <dialog ref={ref} className="fd-room-card fd-leave-dialog" role="alertdialog"
    aria-labelledby={title} aria-describedby={description} onCancel={event => {
      event.preventDefault();
      onClose();
    }}>
    <h2 id={title}>Rời trận?</h2>
    <p id={description}>{finished ? 'Ván đã kết thúc. Bạn sẽ về menu game.' : 'Rời trận được tính là bỏ cuộc. Đồng hồ vẫn chạy.'}</p>
    <div className="fd-btn-row">
      <button type="button" className="fd-btn-primary" onClick={onClose}>Ở lại</button>
      <button type="button" className="fd-btn-secondary" disabled={disabled} onClick={onConfirm}>
        {finished ? 'Rời phòng' : 'Bỏ cuộc và rời'}
      </button>
    </div>
  </dialog>;
}

export function OnlineRoom<Game extends FolkGameKind>({ game, gameTitle, mode, onExit, renderMatch }: OnlineRoomProps<Game>) {
  const { profile } = usePlayer();
  const name = profile.username;
  const [client, setClient] = useState<FolkOnlineClient<Game> | null>(null);
  const readArrivalTime = useCallback(() => client?.arrivalNow ?? Date.now(), [client]);
  const [joinCode, setJoinCode] = useState('');
  const [connectError, setConnectError] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const [, repaint] = useState(0);
  const [connectAttempt, retryConnection] = useState(0);
  const [entered, setEntered] = useState(false);
  const [leaveMatchId, setLeaveMatchId] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    let connection: FolkOnlineClient<Game> | null = null;
    let unsubscribe: (() => void) | undefined;
    setClient(null);
    setConnectError('');
    setEntered(false);
    platformFolkClient(game).then(async next => {
      if (!live) { next.close(); return; }
      connection = next;
      unsubscribe = next.subscribe(() => repaint(value => value + 1));
      setClient(next);
      if (mode !== 'join') await next.enter(mode, name);
      if (live) setEntered(true);
    }).catch(error => { if (live) setConnectError(error instanceof Error ? error.message : 'Không kết nối được phòng.'); });
    return () => { live = false; unsubscribe?.(); connection?.close(); };
  }, [game, mode, name, connectAttempt]);

  useEffect(() => {
    if (!client) return;
    const poll = setInterval(() => void client.refresh(), 1000);
    const clock = setInterval(() => repaint(value => value + 1), 160);
    const onOnline = () => void client.refresh();
    window.addEventListener('online', onOnline);
    return () => { clearInterval(poll); clearInterval(clock); window.removeEventListener('online', onOnline); };
  }, [client]);

  useEffect(() => {
    if (!client) return;
    const close = () => {
      client.close();
      setClient(null);
      setConnectError('Tài khoản đã thay đổi. Hãy vào lại phòng.');
    };
    window.addEventListener('arcadex_auth_changed', close);
    return () => window.removeEventListener('arcadex_auth_changed', close);
  }, [client]);

  useFolkChat(client);
  const room = client?.room;
  const now = client?.now ?? Date.now();
  const blocked = !client?.online || !!(client.busy || client.pending);
  const handleJoin = (event: FormEvent) => {
    event.preventDefault();
    if (joinCode.length === 6) void client?.enter('join', name, joinCode);
  };
  const leave = async () => {
    if (client && (!room || await client.command({ type: 'leave' }))) onExit();
  };
  const retryPending = async () => {
    const leaving = client?.pending?.type === 'command' && client.pending.command.type === 'leave';
    if (await client?.retry() && leaving) onExit();
  };
  const notice = client?.notice ?? '';
  const error = connectError || notice;
  const retry = client?.pending && !client.busy &&
    <button type="button" className="fd-btn-secondary" onClick={retryPending}>Gửi lại thao tác</button>;

  if (!room) return <section className="fd-room-card">
    <h2>{mode === 'join' ? 'Nhập Mã Phòng 1vs1' : 'Đấu Online 1vs1'}</h2>
    {error && <p className="fd-error-text" role="alert">{error}</p>}
    {!entered && !error && <p role="status">Đang kết nối phòng đấu…</p>}
    {entered && mode === 'resume' && !error && <p role="status">Bạn chưa có phòng đang mở.</p>}
    {mode === 'join' && client && <form onSubmit={handleJoin} className="fd-join-form">
      <label htmlFor="fd-room-code">Mã phòng 6 ký tự</label>
      <input id="fd-room-code" maxLength={6} value={joinCode} autoComplete="off" autoCapitalize="characters"
        className="fd-code-input" onChange={event => setJoinCode(event.target.value.toUpperCase().replace(/[^A-Z2-9]/g, ''))}/>
      <button type="submit" className="fd-btn-primary" disabled={joinCode.length !== 6 || client.busy || !!client.pending}>Vào Phòng</button>
    </form>}
    {retry}
    {error && !client?.pending && mode !== 'join' &&
      <button type="button" className="fd-btn-secondary" onClick={() => retryConnection(value => value + 1)}>Thử kết nối lại</button>}
    <button type="button" className="fd-btn-secondary" onClick={onExit}>Quay lại</button>
  </section>;

  if (!client) return null;
  const seconds = Math.max(0, Math.ceil((room.deadlineAt - now) / 1000));
  const expiredLobby = room.phase === 'finished' && !room.winner;
  const lobby = room.phase === 'lobby' || room.phase === 'countdown' || expiredLobby;
  const canRematch = room.phase === 'finished' && room.rematchUntil > now;
  const voted = room.rematchVotes.includes(room.mySeat);
  const leaveDisabled = client.busy || !!client.pending;
  const requestLeave = () => {
    if (leaveDisabled) return;
    if (room.phase === 'countdown' || room.phase === 'playing') setLeaveMatchId(room.matchId);
    else void leave();
  };
  return <>
    {(error || retry || !client.online) && <div className="fd-room-status" data-chat-protect="true">
      <p role="status">{error || 'Đang kết nối lại…'}</p>
      {retry}
    </div>}
    {lobby ? <section className="fd-room-card">
      <h2>{expiredLobby ? 'Phòng đã hết hạn' : room.phase === 'countdown' ? `Bắt đầu sau ${seconds} giây` : 'Đang chờ đối thủ'}</h2>
      {!room.isPublic && !expiredLobby && <div className="fd-invite-box">
        <span className="fd-invite-label">Mã mời · {gameTitle}</span>
        <strong className="fd-invite-code" data-testid="folk-room-code">{room.code}</strong>
        <button type="button" className="fd-btn-secondary" onClick={() => {
          void navigator.clipboard?.writeText(room.code).then(() => setCopyStatus('Đã sao chép mã.'),
            () => setCopyStatus('Chọn và sao chép mã phía trên.'));
        }}>Sao chép mã</button>
        {copyStatus && <span role="status">{copyStatus}</span>}
      </div>}
      <div className="fd-seats-row">
        {room.players.map(player => <div key={player.seat} className="fd-seat-box is-occupied">
          <span className="fd-seat-tag">{player.seat === room.mySeat ? 'Bạn' : 'Đối thủ'}</span>
          <strong>{player.name}</strong>
        </div>)}
      </div>
      <button type="button" className="fd-btn-secondary" disabled={leaveDisabled} onClick={requestLeave}>Rời phòng</button>
    </section> : <>
      <div className="fd-room-status" data-chat-protect="true">
        {room.phase === 'playing' && now < room.readyAt && <span>Đang rải quân · lượt mới sau {Math.ceil((room.readyAt - now) / 1000)}s</span>}
        {room.phase === 'playing' && now >= room.readyAt && <span>Đến lượt {room.state.turn === room.mySeat ? 'bạn' : 'đối thủ'} · {seconds}s</span>}
        {room.finishReason === 'timeout' && <span>Kết thúc do hết giờ lượt.</span>}
        {room.finishReason === 'forfeit' && <span>Đối thủ đã rời trận.</span>}
        {canRematch && voted && <span>Đã mời đấu lại. Đang chờ đối thủ.</span>}
        <button type="button" className="fd-btn-secondary" disabled={leaveDisabled} onClick={requestLeave}>Rời phòng</button>
      </div>
      {renderMatch({ room, blocked: blocked || seconds === 0, now, readArrivalTime,
        onAction: command => { void client.command(command); },
        onRematch: canRematch && !voted ? () => { void client.command({ type: 'rematch' }); } : undefined,
        onLeave: requestLeave, leaveDisabled,
      })}
    </>}
    {leaveMatchId === room.matchId && <FolkLeaveDialog finished={room.phase === 'finished'} disabled={leaveDisabled}
      onClose={() => setLeaveMatchId(null)} onConfirm={() => {
        setLeaveMatchId(null);
        void leave();
      }}/>}
  </>;
}
