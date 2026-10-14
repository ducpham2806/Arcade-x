import { startOnlineQueue } from './onlineQueue';
import { rankQueue } from './duelMatchmaking';
/**
 * Core Matchmaking & Multiplayer Service
 * High-performance Supabase Realtime & Atomic Transaction Engine
 */
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  limit,
  runTransaction,
  arrayUnion,
  CloudDatabase,
} from './cloudStore';
import { SupabaseService } from './supabase';
import {
  StandardGameRoom,
  MatchmakingQueueRecord,
  RoomPlayerData,
  MoveRecord,
  PlayerColor,
  EndReason,
} from '../types/multiplayerCore';



export const ELO_K_FACTOR = 32;

export function calculateEloDelta(
  hostElo: number,
  guestElo: number,
  winner: string | 'DRAW',
  hostUid: string,
  guestUid: string
) {
  const expectedHost = 1 / (1 + Math.pow(10, (guestElo - hostElo) / 400));
  const expectedGuest = 1 / (1 + Math.pow(10, (hostElo - guestElo) / 400));

  let actualHost = 0.5;
  let actualGuest = 0.5;

  if (winner === hostUid) {
    actualHost = 1;
    actualGuest = 0;
  } else if (winner === guestUid) {
    actualHost = 0;
    actualGuest = 1;
  }

  const hostDelta = Math.round(ELO_K_FACTOR * (actualHost - expectedHost));
  const guestDelta = Math.round(ELO_K_FACTOR * (actualGuest - expectedGuest));

  return {
    hostDelta,
    guestDelta,
    newHostElo: Math.max(100, hostElo + hostDelta),
    newGuestElo: Math.max(100, guestElo + guestDelta),
  };
}

export function generate6CharRoomCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return code;
}

export class MatchmakingService {
  private static getDb(): CloudDatabase {
    const db = SupabaseService.getDb();
    if (!db) {
      throw new Error('Supabase chưa được cấu hình.');
    }
    return db;
  }

  /**
   * 1. Join Random Matchmaking Queue
   */
  public static async joinQueue(
    player: { uid: string; displayName: string; avatarUrl: string; elo: number },
    gameId: string,
    initialBoardState: any,
    onMatched: (roomId: string) => void,
    onError: (err: Error) => void
  ): Promise<() => void> {
    const db = this.getDb();
    return startOnlineQueue(db,{uid:player.uid,displayName:player.displayName,avatarUrl:player.avatarUrl,elo:player.elo||1200},gameId,(candidateData,roomId,now)=>{
      const roomCode=generate6CharRoomCode();
              const hostPlayer: RoomPlayerData = {
                uid: candidateData.uid,
                name: candidateData.displayName,
                avatarUrl: candidateData.avatarUrl,
                elo: candidateData.elo || 1200,
                color: 'RED',
                ready: true,
                connected: true,
                lastHeartbeat: Date.now(),
              };

              const guestPlayer: RoomPlayerData = {
                uid: player.uid,
                name: player.displayName,
                avatarUrl: player.avatarUrl,
                elo: player.elo || 1200,
                color: 'BLACK',
                ready: true,
                connected: true,
                lastHeartbeat: Date.now(),
              };

              const turnDuration = 45;

              const newRoom: StandardGameRoom = {
                roomId,
                roomCode,
                gameId,
                isPrivate: false,
                status: 'ready', // Versus countdown state
                players: {
                  host: hostPlayer,
                  guest: guestPlayer,
                },
                currentTurn: hostPlayer.uid,
                turnDuration,
                turnDeadline: now + 4000 + turnDuration * 1000,
                boardState: initialBoardState,
                lastMove: null,
                moveHistory: [],
                winner: null,
                endReason: null,
                drawOfferBy: null,
                eloChange: null,
                messages: [
                  {
                    id: 'sys_start',
                    senderUid: 'system',
                    senderName: 'Hệ Thống',
                    text: 'Ghép trận thành công! Chúc hai kỳ thủ thi đấu công bằng!',
                    timestamp: now,
                  },
                ],
                createdAt: now,
                updatedAt: now,
              };

      return newRoom;
    },onMatched,onError);
  }

  /**
   * 2. Cancel Queue
   */
  public static async cancelQueue(uid: string, gameId: string): Promise<void> {
    try {
      const db = this.getDb();
      const queueDocId = `${gameId}_${uid}`.replace(/[^a-zA-Z0-9_-]/g, '_');
      await deleteDoc(doc(db, 'matchmaking_queue', queueDocId));
    } catch {
      // ignore
    }
  }

  /**
   * 3. Create Custom Private Room
   */
  public static async createPrivateRoom(
    host: { uid: string; displayName: string; avatarUrl: string; elo: number },
    gameId: string,
    initialBoardState: any,
    turnDuration = 45,
    hostColor: PlayerColor = 'RED'
  ): Promise<{ roomId: string; roomCode: string }> {
    const db = this.getDb();
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const roomCode = generate6CharRoomCode();
    const roomRef = doc(db, 'game_rooms', roomId);

    const hostPlayer: RoomPlayerData = {
      uid: host.uid,
      name: host.displayName,
      avatarUrl: host.avatarUrl,
      elo: host.elo || 1200,
      color: hostColor,
      ready: true,
      connected: true,
      lastHeartbeat: Date.now(),
    };

    const now = Date.now();
    const room: StandardGameRoom = {
      roomId,
      roomCode,
      gameId,
      isPrivate: true,
      status: 'waiting',
      players: {
        host: hostPlayer,
        guest: null,
      },
      currentTurn: hostPlayer.uid,
      turnDuration,
      turnDeadline: now + turnDuration * 1000,
      boardState: initialBoardState,
      lastMove: null,
      moveHistory: [],
      winner: null,
      endReason: null,
      drawOfferBy: null,
      eloChange: null,
      messages: [
        {
          id: 'sys_create',
          senderUid: 'system',
          senderName: 'Hệ Thống',
          text: `Phòng thi đấu #${roomCode} đã sẵn sàng. Hãy chia sẻ mã mời cho bạn bè!`,
          timestamp: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(roomRef, room);
    return { roomId, roomCode };
  }

  /**
   * 4. Join Room By Code
   */
  public static async joinRoomByCode(
    guest: { uid: string; displayName: string; avatarUrl: string; elo: number },
    roomCode: string,
    gameId?: string
  ): Promise<string> {
    const db = this.getDb();
    const code = roomCode.trim().toUpperCase();

    const roomsRef = collection(db, 'game_rooms');
    const q = query(roomsRef, where('roomCode', '==', code), limit(1));

    const querySnap = await getDocs(q);
    if (querySnap.empty) {
      throw new Error(`Không tìm thấy phòng thi đấu với mã "${code}". Vui lòng kiểm tra lại mã phòng.`);
    }

    const roomDoc = querySnap.docs[0];
    const roomData = roomDoc.data() as StandardGameRoom;

    if (gameId && roomData.gameId !== gameId) {
      throw new Error(`Mã phòng "${code}" là của trò chơi ${roomData.gameId.toUpperCase()}, không phải trò chơi hiện tại.`);
    }

    if (roomData.players.host.uid === guest.uid) {
      return roomDoc.id;
    }

    if (roomData.players.guest && roomData.players.guest.uid !== guest.uid && roomData.status === 'playing') {
      throw new Error('Phòng này đã đủ 2 kỳ thủ đang thi đấu!');
    }

    await runTransaction(db, async (tx) => {
      const freshSnap = await tx.get(roomDoc.ref);
      if (!freshSnap.exists()) throw new Error('Phòng đã bị đóng.');
      const freshData = freshSnap.data() as StandardGameRoom;

      if (freshData.status !== 'waiting' && freshData.players.guest?.uid !== guest.uid) {
        throw new Error('Phòng đã đầy hoặc đang thi đấu.');
      }

      const guestColor: PlayerColor = freshData.players.host.color === 'RED' ? 'BLACK' : 'RED';
      const guestPlayer: RoomPlayerData = {
        uid: guest.uid,
        name: guest.displayName,
        avatarUrl: guest.avatarUrl,
        elo: guest.elo || 1200,
        color: guestColor,
        ready: true,
        connected: true,
        lastHeartbeat: Date.now(),
      };

      const now = Date.now();
      tx.update(roomDoc.ref, {
        'players.guest': guestPlayer,
        status: 'ready', // trigger VS screen
        turnDeadline: now + 3500 + freshData.turnDuration * 1000,
        updatedAt: now,
        messages: arrayUnion({
          id: `join_${now}`,
          senderUid: guest.uid,
          senderName: guest.displayName,
          text: `⚔️ ${guest.displayName} (ELO ${guest.elo || 1200}) đã tham gia phòng đấu!`,
          timestamp: now,
        }),
      });
    });

    return roomDoc.id;
  }

  /**
   * 5. Atomic Execute Move
   */
  public static async executeMove(
    roomId: string,
    playerUid: string,
    newBoardState: any,
    moveDetails: {
      from?: [number, number] | string;
      to: [number, number] | string;
      notation?: string;
      piece?: string;
      captured?: string;
    },
    winCheckResult?: { isWin: boolean; isDraw?: boolean; endReason?: EndReason },
    expectedBoardState?: any
  ): Promise<boolean> {
    const db = this.getDb();
    const roomRef = doc(db, 'game_rooms', roomId);

    return await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) throw new Error('Phòng không tồn tại');
      const room = snap.data() as StandardGameRoom;

      if (room.status !== 'playing' && room.status !== 'ready') {
        throw new Error('Trận đấu chưa bắt đầu hoặc đã kết thúc');
      }

      if(expectedBoardState!==undefined&&JSON.stringify(room.boardState)!==JSON.stringify(expectedBoardState)){throw new Error('Bàn cờ đã thay đổi. Chờ đồng bộ rồi chọn lại nước đi.');}
      if (room.currentTurn !== playerUid) {
        throw new Error('Chưa tới lượt của bạn!');
      }

      const now = Date.now();
      const hostUid = room.players.host.uid;
      const guestUid = room.players.guest?.uid || '';
      const nextTurn = playerUid === hostUid ? guestUid : hostUid;

      const record: MoveRecord = {
        from: moveDetails.from,
        to: moveDetails.to,
        by: playerUid,
        notation: moveDetails.notation,
        piece: moveDetails.piece,
        captured: moveDetails.captured,
        timestamp: now,
      };

      let status = 'playing' as StandardGameRoom['status'];
      let winner = null as StandardGameRoom['winner'];
      let endReason = null as StandardGameRoom['endReason'];
      let eloChange: ReturnType<typeof calculateEloDelta> | null = null;

      if (winCheckResult?.isWin) {
        status = 'ended';
        winner = playerUid;
        endReason = winCheckResult.endReason || 'CHECKMATE';
        eloChange = calculateEloDelta(
          room.players.host.elo,
          room.players.guest?.elo || 1200,
          winner,
          hostUid,
          guestUid
        );
      } else if (winCheckResult?.isDraw) {
        status = 'ended';
        winner = 'DRAW';
        endReason = winCheckResult.endReason || 'DRAW_AGREEMENT';
        eloChange = calculateEloDelta(
          room.players.host.elo,
          room.players.guest?.elo || 1200,
          'DRAW',
          hostUid,
          guestUid
        );
      }

      // Postgres applies both ELO updates atomically when the room ends.

      tx.update(roomRef, {
        boardState: newBoardState,
        lastMove: record,
        moveHistory: arrayUnion(record),
        currentTurn: nextTurn,
        turnDeadline: now + room.turnDuration * 1000,
        status,
        winner,
        endReason,
        eloChange,
        updatedAt: now,
      });

      return true;
    });
  }

  /**
   * 6. Surrender / Forfeit
   */
  public static async surrender(roomId: string, forfeitUid: string): Promise<void> {
    const db = this.getDb();
    const roomRef = doc(db, 'game_rooms', roomId);

    await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) return;
      const room = snap.data() as StandardGameRoom;
      if (room.status === 'ended') return;

      const hostUid = room.players.host.uid;
      const guestUid = room.players.guest?.uid || '';
      const winner = forfeitUid === hostUid ? guestUid : hostUid;
      const now = Date.now();

      const eloChange = calculateEloDelta(
        room.players.host.elo,
        room.players.guest?.elo || 1200,
        winner,
        hostUid,
        guestUid
      );
      // Postgres applies both ELO updates atomically when the room ends.
      const forfeiterName = forfeitUid === hostUid ? room.players.host.name : room.players.guest?.name;

      tx.update(roomRef, {
        status: 'ended',
        winner,
        endReason: 'SURRENDER',
        eloChange,
        updatedAt: now,
        messages: arrayUnion({
          id: `surrender_${now}`,
          senderUid: 'system',
          senderName: 'Hệ Thống',
          text: `🏳️ ${forfeiterName} đã xin đầu hàng!`,
          timestamp: now,
        }),
      });
    });
  }

  /**
   * 7. Claim Timeout
   */
  public static async claimTimeout(roomId: string, claimantUid: string): Promise<void> {
    const db = this.getDb();
    const roomRef = doc(db, 'game_rooms', roomId);

    await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) return;
      const room = snap.data() as StandardGameRoom;
      if (room.status === 'ended') return;

      const now = Date.now();
      if (now < room.turnDeadline + 1500) {
        throw new Error('Thời gian của đối thủ chưa hết!');
      }

      if (room.currentTurn === claimantUid) {
        throw new Error('Đang là lượt đi của bạn!');
      }

      const hostUid = room.players.host.uid;
      const guestUid = room.players.guest?.uid || '';
      const eloChange = calculateEloDelta(
        room.players.host.elo,
        room.players.guest?.elo || 1200,
        claimantUid,
        hostUid,
        guestUid
      );
      // Postgres applies both ELO updates atomically when the room ends.
      tx.update(roomRef, {
        status: 'ended',
        winner: claimantUid,
        endReason: 'TIMEOUT',
        eloChange,
        updatedAt: now,
        messages: arrayUnion({
          id: `timeout_${now}`,
          senderUid: 'system',
          senderName: 'Hệ Thống',
          text: `⏱️ Đối thủ đã hết thời gian suy nghĩ!`,
          timestamp: now,
        }),
      });
    });
  }

  /**
   * 8. Offer Draw & Respond
   */
  public static async offerDraw(roomId: string, fromUid: string): Promise<void> {
    const db = this.getDb();
    const roomRef = doc(db, 'game_rooms', roomId);
    const now = Date.now();
    await updateDoc(roomRef, {
      drawOfferBy: fromUid,
      updatedAt: now,
      messages: arrayUnion({
        id: `draw_${now}`,
        senderUid: fromUid,
        senderName: 'Hệ Thống',
        text: '🤝 Đối thủ đã gửi lời CẦU HÒA!',
        timestamp: now,
      }),
    });
  }

  public static async respondDraw(roomId: string, accept: boolean, responderUid: string): Promise<void> {
    const db = this.getDb();
    const roomRef = doc(db, 'game_rooms', roomId);

    await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) return;
      const room = snap.data() as StandardGameRoom;
      if (room.status === 'ended') return;

      const now = Date.now();
      const hostUid = room.players.host.uid;
      const guestUid = room.players.guest?.uid || '';

      if (accept) {
        const eloChange = calculateEloDelta(
          room.players.host.elo,
          room.players.guest?.elo || 1200,
          'DRAW',
          hostUid,
          guestUid
        );
      // Postgres applies both ELO updates atomically when the room ends.
        tx.update(roomRef, {
          status: 'ended',
          winner: 'DRAW',
          endReason: 'DRAW_AGREEMENT',
          drawOfferBy: null,
          eloChange,
          updatedAt: now,
          messages: arrayUnion({
            id: `draw_ok_${now}`,
            senderUid: responderUid,
            senderName: 'Hệ Thống',
            text: '🤝 Hai bên đồng ý HÒA CỜ!',
            timestamp: now,
          }),
        });
      } else {
        tx.update(roomRef, {
          drawOfferBy: null,
          updatedAt: now,
          messages: arrayUnion({
            id: `draw_no_${now}`,
            senderUid: responderUid,
            senderName: 'Hệ Thống',
            text: '❌ Lời cầu hòa bị từ chối. Trận đấu tiếp tục!',
            timestamp: now,
          }),
        });
      }
    });
  }

  /**
   * 9. Send Emote / Chat
   */
  public static async sendChatMessage(
    roomId: string,
    senderUid: string,
    senderName: string,
    text: string,
    isEmote = false
  ): Promise<void> {
    const db = this.getDb();
    const roomRef = doc(db, 'game_rooms', roomId);
    await updateDoc(roomRef, {
      messages: arrayUnion({
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        senderUid,
        senderName,
        text,
        isEmote,
        timestamp: Date.now(),
      }),
      updatedAt: Date.now(),
    });
  }

  /**
   * 10. Rematch invitation & execution
   */
  public static async offerRematch(roomId: string, playerUid: string, playerName: string): Promise<void> {
    const db = this.getDb();
    const roomRef = doc(db, 'game_rooms', roomId);
    const now = Date.now();
    await updateDoc(roomRef, {
      rematchOfferBy: playerUid,
      updatedAt: now,
      messages: arrayUnion({
        id: `rematch_offer_${now}`,
        senderUid: playerUid,
        senderName: 'Hệ Thống',
        text: `🔄 ${playerName} đã gửi lời mời ĐẤU LẠI!`,
        timestamp: now,
      }),
    });
  }

  public static async cancelRematch(roomId: string, playerUid: string): Promise<void> {
    const db = this.getDb();
    const roomRef = doc(db, 'game_rooms', roomId);
    await updateDoc(roomRef, {
      rematchOfferBy: null,
      updatedAt: Date.now(),
    });
  }

  public static async rematch(roomId: string, resetBoardState: any): Promise<void> {
    const db = this.getDb();
    const roomRef = doc(db, 'game_rooms', roomId);

    await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) return;
      const room = snap.data() as StandardGameRoom;
      const now = Date.now();

      // Swap colors for fair rematch
      // RED remains the legacy first-side code for both chess and Xiangqi.
      const newHostColor:PlayerColor=room.players.host.color==='RED'?'BLACK':'RED';
      const newGuestColor:PlayerColor=newHostColor==='RED'?'BLACK':'RED';
      const firstTurnUid=newHostColor==='RED'?room.players.host.uid:(room.players.guest?.uid||room.players.host.uid);

      tx.update(roomRef, {
        'players.host.color': newHostColor,
        'players.guest.color': newGuestColor,
        status: 'ready',
        currentTurn: firstTurnUid,
        turnDeadline: now + 3500 + room.turnDuration * 1000,
        boardState: resetBoardState,
        lastMove: null,
        moveHistory: [],
        winner: null,
        endReason: null,
        drawOfferBy: null,
        rematchOfferBy: null,
        eloChange: null,
        updatedAt: now,
        messages: arrayUnion({
          id: `rematch_${now}`,
          senderUid: 'system',
          senderName: 'Hệ Thống',
          text: '🔄 Ván đấu mới bắt đầu! Đổi lượt quân đi trước.',
          timestamp: now,
        }),
      });
    });
  }
}

