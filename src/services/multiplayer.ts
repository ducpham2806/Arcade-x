/**
 * Real-Time Multiplayer Board Game & Matchmaking Service
 * Powered by Supabase Realtime and Atomic Transactions
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  limit,
  runTransaction,
  serverTimestamp,
  arrayUnion,
  CloudDatabase,
} from './cloudStore';
import { SupabaseService } from './supabase';
import {
  GameRoomData,
  MatchmakingQueueEntry,
  PlayerRole,
  RoomPlayerInfo,
  EloCalculationResult,
  MultiplayerGameType,
  QuickMessage,
} from '../types/multiplayer';

export const BOARD_SIZE = 15; // 15x15 Caro / Gomoku standard tournament grid


export const K_FACTOR = 32;

/**
 * Standard ELO rating algorithm
 */
export function calculateEloChange(
  hostElo: number,
  guestElo: number,
  winner: PlayerRole | 'draw'
): EloCalculationResult {
  const expectedHost = 1 / (1 + Math.pow(10, (guestElo - hostElo) / 400));
  const expectedGuest = 1 / (1 + Math.pow(10, (hostElo - guestElo) / 400));

  let actualHost = 0.5;
  let actualGuest = 0.5;

  if (winner === 'host') {
    actualHost = 1;
    actualGuest = 0;
  } else if (winner === 'guest') {
    actualHost = 0;
    actualGuest = 1;
  }

  const hostDelta = Math.round(K_FACTOR * (actualHost - expectedHost));
  const guestDelta = Math.round(K_FACTOR * (actualGuest - expectedGuest));

  return {
    newHostElo: Math.max(100, hostElo + hostDelta),
    newGuestElo: Math.max(100, guestElo + guestDelta),
    hostDelta,
    guestDelta,
  };
}

/**
 * Check 5-in-a-row Gomoku/Caro win condition
 */
export function checkCaroWin(
  boardState: Record<string, string>,
  lastX: number,
  lastY: number,
  symbol: string,
  gridSize = BOARD_SIZE
): { isWin: boolean; winningLine: { x: number; y: number }[] | null } {
  const directions = [
    { dx: 1, dy: 0 },  // Horizontal
    { dx: 0, dy: 1 },  // Vertical
    { dx: 1, dy: 1 },  // Diagonal \
    { dx: 1, dy: -1 }, // Diagonal /
  ];

  for (const { dx, dy } of directions) {
    const line: { x: number; y: number }[] = [{ x: lastX, y: lastY }];

    // Forward direction
    let step = 1;
    while (true) {
      const nx = lastX + dx * step;
      const ny = lastY + dy * step;
      if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) break;
      if (boardState[`${nx}_${ny}`] === symbol) {
        line.push({ x: nx, y: ny });
        step++;
      } else {
        break;
      }
    }

    // Backward direction
    step = 1;
    while (true) {
      const nx = lastX - dx * step;
      const ny = lastY - dy * step;
      if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) break;
      if (boardState[`${nx}_${ny}`] === symbol) {
        line.push({ x: nx, y: ny });
        step++;
      } else {
        break;
      }
    }

    if (line.length >= 5) {
      return { isWin: true, winningLine: line };
    }
  }

  return { isWin: false, winningLine: null };
}

/**
 * Generate 6-character room invite code
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export class MultiplayerService {
  private static getDb(): CloudDatabase {
    const db = SupabaseService.getDb();
    if (!db) {
      throw new Error('Supabase database is not initialized');
    }
    return db;
  }

  /**
   * 1. Join Matchmaking Queue (Quick Match)
   */
  public static async joinQuickMatch(
    player: { uid: string; displayName: string; avatar: string; elo: number },
    gameId: MultiplayerGameType = 'caro-gomoku',
    onMatched: (roomId: string) => void,
    onError: (err: Error) => void
  ): Promise<() => void> {
    const db = this.getDb();
    const queueCollection = collection(db, 'matchmaking_queue');
    const queueDocId = `${gameId}_${player.uid}`;
    const queueDocRef = doc(db, 'matchmaking_queue', queueDocDocIdSafe(queueDocId));

    try {
      // Step A: Search for another waiting player in this queue (FIFO / close ELO)
      const q = query(
        queueCollection,
        where('gameId', '==', gameId),
        where('status', '==', 'waiting'),
        limit(5)
      );

      const snapshot = await getDocs(q);
      const candidates = snapshot.docs
        .map((d) => ({ id: d.id, data: d.data() as MatchmakingQueueEntry }))
        .filter((c) => c.data.uid !== player.uid);

      if (candidates.length > 0) {
        // Matched with candidate - try to atomically lock one
        for (const candidateDoc of candidates) {
          try {
            const matchedRoomId = await runTransaction(db, async (tx) => {
              const candidateRef = doc(db, 'matchmaking_queue', candidateDoc.id);
              const candidateSnap = await tx.get(candidateRef);
              
              if (!candidateSnap.exists()) {
                throw new Error('Candidate no longer exists');
              }
              
              const candidateData = candidateSnap.data() as MatchmakingQueueEntry;
              if (candidateData.status !== 'waiting') {
                throw new Error('Candidate already matched');
              }

              // Atomically create room and mark matched
              const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
              const roomCode = generateRoomCode();
              const roomRef = doc(db, 'game_rooms', roomId);

              const hostPlayer: RoomPlayerInfo = {
                uid: candidateData.uid,
                displayName: candidateData.displayName,
                avatar: candidateData.avatarUrl,
                elo: candidateData.elo || 1200,
                symbol: 'X',
                isConnected: true,
                lastHeartbeat: Date.now(),
              };

              const guestPlayer: RoomPlayerInfo = {
                uid: player.uid,
                displayName: player.displayName,
                avatar: player.avatar,
                elo: player.elo || 1200,
                symbol: 'O',
                isConnected: true,
                lastHeartbeat: Date.now(),
              };

              const now = Date.now();
              const turnDuration = 30;

              const newRoom: GameRoomData = {
                roomId,
                roomCode,
                gameId,
                isPrivate: false,
                status: 'playing',
                hostPlayer,
                guestPlayer,
                currentTurn: 'host',
                turnDurationSeconds: turnDuration,
                turnDeadline: now + turnDuration * 1000,
                moveCount: 0,
                boardState: {},
                lastMove: null,
                winningLine: null,
                winner: null,
                winReason: null,
                drawOfferFrom: null,
                eloChange: null,
                quickMessages: [
                  {
                    id: 'init_msg',
                    senderRole: 'host',
                    senderName: 'Hệ Thống',
                    text: 'Trận đấu bắt đầu! Chúc hai kỳ thủ thi đấu công bằng!',
                    timestamp: now,
                  },
                ],
                createdAt: now,
                updatedAt: now,
              };

              tx.set(roomRef, newRoom);
              tx.update(candidateRef, {
                status: 'matched',
                matchedRoomId: roomId,
              });

              return roomId;
            });

            if (matchedRoomId) {
              onMatched(matchedRoomId);
              return () => {};
            }
          } catch (e) {
            console.warn('Matchmaking race condition mitigated, trying next candidate...');
            continue;
          }
        }
      }

      // Step B: No opponent currently waiting -> Enter queue as 'waiting'
      const queueEntry: MatchmakingQueueEntry = {
        uid: player.uid,
        displayName: player.displayName,
        avatarUrl: player.avatar,
        gameId,
        elo: player.elo || 1200,
        status: 'waiting',
        matchedRoomId: null,
        createdAt: Date.now(),
      };

      await setDoc(queueDocRef, queueEntry);

      // Listen for when someone matches with us
      const unsubscribe = onSnapshot(
        queueDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as MatchmakingQueueEntry;
            if (data.status === 'matched' && data.matchedRoomId) {
              // We've been matched!
              // Cleanup our queue document
              deleteDoc(queueDocRef).catch(() => {});
              onMatched(data.matchedRoomId);
            }
          }
        },
        (error) => {
          console.warn('Queue listener notice:', error);
          onError(error);
        }
      );

      return () => {
        unsubscribe();
        deleteDoc(queueDocRef).catch(() => {});
      };
    } catch (err) {
      console.error('Join quick match error:', err);
      onError(err instanceof Error ? err : new Error(String(err)));
      return () => {};
    }
  }

  /**
   * Leave matchmaking queue
   */
  public static async leaveQuickMatch(uid: string, gameId: MultiplayerGameType): Promise<void> {
    try {
      const db = this.getDb();
      const queueDocId = queueDocDocIdSafe(`${gameId}_${uid}`);
      await deleteDoc(doc(db, 'matchmaking_queue', queueDocId));
    } catch {
      // ignore
    }
  }

  /**
   * 2. Create Custom Room (Private Match)
   */
  public static async createCustomRoom(
    host: { uid: string; displayName: string; avatar: string; elo: number },
    gameId: MultiplayerGameType = 'caro-gomoku',
    turnDurationSeconds = 30
  ): Promise<{ roomId: string; roomCode: string }> {
    const db = this.getDb();
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const roomCode = generateRoomCode();
    const roomRef = doc(db, 'game_rooms', roomId);

    const hostPlayer: RoomPlayerInfo = {
      uid: host.uid,
      displayName: host.displayName,
      avatar: host.avatar,
      elo: host.elo || 1200,
      symbol: 'X',
      isConnected: true,
      lastHeartbeat: Date.now(),
    };

    const now = Date.now();
    const initialRoom: GameRoomData = {
      roomId,
      roomCode,
      gameId,
      isPrivate: true,
      status: 'waiting',
      hostPlayer,
      guestPlayer: null,
      currentTurn: 'host',
      turnDurationSeconds,
      turnDeadline: now + turnDurationSeconds * 1000,
      moveCount: 0,
      boardState: {},
      lastMove: null,
      winningLine: null,
      winner: null,
      winReason: null,
      drawOfferFrom: null,
      eloChange: null,
      quickMessages: [
        {
          id: 'welcome',
          senderRole: 'host',
          senderName: 'Hệ Thống',
          text: `Phòng cờ #${roomCode} đã tạo. Đang chờ người chơi tham gia...`,
          timestamp: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(roomRef, initialRoom);
    return { roomId, roomCode };
  }

  /**
   * 3. Join Custom Room by 6-character Code
   */
  public static async joinRoomByCode(
    guest: { uid: string; displayName: string; avatar: string; elo: number },
    roomCode: string,
    gameId: MultiplayerGameType = 'caro-gomoku'
  ): Promise<string> {
    const db = this.getDb();
    const normalizedCode = roomCode.trim().toUpperCase();

    const roomsRef = collection(db, 'game_rooms');
    const q = query(
      roomsRef,
      where('roomCode', '==', normalizedCode),
      limit(1)
    );

    const querySnap = await getDocs(q);
    if (querySnap.empty) {
      throw new Error(`Không tìm thấy phòng chơi có mã "${normalizedCode}". Vui lòng kiểm tra lại!`);
    }

    const roomDoc = querySnap.docs[0];
    const roomData = roomDoc.data() as GameRoomData;

    if (gameId && roomData.gameId !== gameId) {
      throw new Error(`Mã phòng "${normalizedCode}" là của trò chơi ${roomData.gameId.toUpperCase()}, không phải trò chơi hiện tại.`);
    }

    if (roomData.hostPlayer.uid === guest.uid) {
      // User is already host
      return roomDoc.id;
    }

    if (roomData.guestPlayer && roomData.guestPlayer.uid !== guest.uid && roomData.status === 'playing') {
      throw new Error('Phòng chơi này đã đủ 2 người thi đấu!');
    }

    // Atomic transaction to join
    await runTransaction(db, async (transaction) => {
      const freshSnap = await transaction.get(roomDoc.ref);
      if (!freshSnap.exists()) {
        throw new Error('Phòng chơi đã bị hủy');
      }
      const freshData = freshSnap.data() as GameRoomData;

      if (freshData.status !== 'waiting' && freshData.guestPlayer?.uid !== guest.uid) {
        throw new Error('Phòng đã đầy hoặc đang trong ván đấu');
      }

      const guestPlayer: RoomPlayerInfo = {
        uid: guest.uid,
        displayName: guest.displayName,
        avatar: guest.avatar,
        elo: guest.elo || 1200,
        symbol: 'O',
        isConnected: true,
        lastHeartbeat: Date.now(),
      };

      const now = Date.now();
      transaction.update(roomDoc.ref, {
        guestPlayer,
        status: 'playing',
        turnDeadline: now + freshData.turnDurationSeconds * 1000,
        updatedAt: now,
        quickMessages: arrayUnion({
          id: `join_${now}`,
          senderRole: 'guest',
          senderName: guest.displayName,
          text: `👋 ${guest.displayName} (ELO ${guest.elo || 1200}) đã vào phòng thi đấu!`,
          timestamp: now,
        }),
      });
    });

    return roomDoc.id;
  }

  /**
   * 4. Subscribe to Real-Time Room State
   */
  public static subscribeToRoom(
    roomId: string,
    onUpdate: (room: GameRoomData | null) => void,
    onError?: (err: Error) => void
  ): () => void {
    const db = this.getDb();
    const roomRef = doc(db, 'game_rooms', roomId);

    const unsubscribe = onSnapshot(
      roomRef,
      (docSnap) => {
        if (!docSnap.exists()) {
          onUpdate(null);
          return;
        }
        const data = docSnap.data() as GameRoomData;
        onUpdate(data);
      },
      (err) => {
        console.warn('Room onSnapshot error:', err);
        if (onError) onError(err);
      }
    );

    return unsubscribe;
  }

  /**
   * 5. Atomic Move Verification with Postgres transaction
   */
  public static async makeMove(
    roomId: string,
    playerRole: PlayerRole,
    x: number,
    y: number
  ): Promise<{ success: boolean; isWin?: boolean; isDraw?: boolean }> {
    const db = this.getDb();
    const roomRef = doc(db, 'game_rooms', roomId);

    return await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(roomRef);
      if (!snap.exists()) {
        throw new Error('Phòng chơi không tồn tại!');
      }

      const room = snap.data() as GameRoomData;

      // 1. Status check
      if (room.status !== 'playing') {
        throw new Error('Trận đấu chưa bắt đầu hoặc đã kết thúc!');
      }

      // 2. Turn check
      if (room.currentTurn !== playerRole) {
        throw new Error('Chưa tới lượt đi của bạn!');
      }

      // 3. Grid Boundary check
      if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) {
        throw new Error('Tọa độ nước đi không hợp lệ!');
      }

      // 4. Cell Occupied check
      const cellKey = `${x}_${y}`;
      if (room.boardState[cellKey]) {
        throw new Error('Ô cờ này đã có quân đặt trước!');
      }

      const symbol = playerRole === 'host' ? 'X' : 'O';
      const updatedBoard = { ...room.boardState, [cellKey]: symbol };
      const moveIndex = room.moveCount + 1;
      const now = Date.now();

      // 5. Check Win condition
      const { isWin, winningLine } = checkCaroWin(updatedBoard, x, y, symbol, BOARD_SIZE);

      // 6. Check Board Full Draw condition
      const isBoardFull = Object.keys(updatedBoard).length >= BOARD_SIZE * BOARD_SIZE;

      let newStatus: GameRoomData['status'] = 'playing';
      let winner: GameRoomData['winner'] = null;
      let winReason: GameRoomData['winReason'] = null;
      let eloChange: EloCalculationResult | null = null;

      if (isWin) {
        newStatus = 'finished';
        winner = playerRole;
        winReason = 'five_in_a_row';
        const hostElo = room.hostPlayer.elo;
        const guestElo = room.guestPlayer?.elo || 1200;
        eloChange = calculateEloChange(hostElo, guestElo, playerRole);
      } else if (isBoardFull) {
        newStatus = 'finished';
        winner = 'draw';
        winReason = 'draw_agreement';
        const hostElo = room.hostPlayer.elo;
        const guestElo = room.guestPlayer?.elo || 1200;
        eloChange = calculateEloChange(hostElo, guestElo, 'draw');
      }

      const nextTurn: PlayerRole = playerRole === 'host' ? 'guest' : 'host';

      // Postgres applies both ELO updates atomically when the room ends.

      // Atomic Update
      transaction.update(roomRef, {
        boardState: updatedBoard,
        moveCount: moveIndex,
        lastMove: { x, y, symbol, moveIndex },
        currentTurn: nextTurn,
        turnDeadline: now + room.turnDurationSeconds * 1000,
        status: newStatus,
        winner,
        winReason,
        winningLine: winningLine || null,
        eloChange,
        updatedAt: now,
      });

      return {
        success: true,
        isWin,
        isDraw: isBoardFull,
      };
    });
  }

  /**
   * 6. Claim Timeout Victory
   */
  public static async claimTimeoutVictory(roomId: string, claimantRole: PlayerRole): Promise<void> {
    const db = this.getDb();
    const roomRef = doc(db, 'game_rooms', roomId);

    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(roomRef);
      if (!snap.exists()) return;
      const room = snap.data() as GameRoomData;

      if (room.status !== 'playing') return;

      const now = Date.now();
      // Only valid if deadline passed by at least 2 seconds (buffer for network lag)
      if (now < room.turnDeadline + 1500) {
        throw new Error('Chưa hết thời gian đếm ngược lượt đi!');
      }

      const opponentRole: PlayerRole = claimantRole === 'host' ? 'guest' : 'host';
      if (room.currentTurn !== opponentRole) {
        throw new Error('Không thể xử thua khi đang là lượt của bạn!');
      }

      const hostElo = room.hostPlayer.elo;
      const guestElo = room.guestPlayer?.elo || 1200;
      const eloChange = calculateEloChange(hostElo, guestElo, claimantRole);
        // Postgres applies both ELO updates atomically when the room ends.

      transaction.update(roomRef, {
        status: 'finished',
        winner: claimantRole,
        winReason: 'timeout',
        eloChange,
        updatedAt: now,
        quickMessages: arrayUnion({
          id: `timeout_${now}`,
          senderRole: claimantRole,
          senderName: 'Hệ Thống',
          text: `⏱️ Đối thủ đã hết thời gian suy nghĩ! ${claimantRole === 'host' ? room.hostPlayer.displayName : room.guestPlayer?.displayName} giành chiến thắng!`,
          timestamp: now,
        }),
      });
    });
  }

  /**
   * 7. Surrender / Forfeit Match
   */
  public static async forfeitMatch(roomId: string, forfeitRole: PlayerRole): Promise<void> {
    const db = this.getDb();
    const roomRef = doc(db, 'game_rooms', roomId);

    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(roomRef);
      if (!snap.exists()) return;
      const room = snap.data() as GameRoomData;

      if (room.status !== 'playing') return;

      const winnerRole: PlayerRole = forfeitRole === 'host' ? 'guest' : 'host';
      const hostElo = room.hostPlayer.elo;
      const guestElo = room.guestPlayer?.elo || 1200;
      const eloChange = calculateEloChange(hostElo, guestElo, winnerRole);
      const now = Date.now();

      const forfeiterName = forfeitRole === 'host' ? room.hostPlayer.displayName : room.guestPlayer?.displayName;
        // Postgres applies both ELO updates atomically when the room ends.

      transaction.update(roomRef, {
        status: 'finished',
        winner: winnerRole,
        winReason: 'forfeit',
        eloChange,
        updatedAt: now,
        quickMessages: arrayUnion({
          id: `forfeit_${now}`,
          senderRole: forfeitRole,
          senderName: 'Hệ Thống',
          text: `🏳️ ${forfeiterName} đã xin đầu hàng. Ván đấu kết thúc!`,
          timestamp: now,
        }),
      });
    });
  }

  /**
   * 8. Offer & Accept/Decline Draw
   */
  public static async offerDraw(roomId: string, fromRole: PlayerRole): Promise<void> {
    const db = this.getDb();
    const roomRef = doc(db, 'game_rooms', roomId);
    const now = Date.now();

    await updateDoc(roomRef, {
      drawOfferFrom: fromRole,
      updatedAt: now,
      quickMessages: arrayUnion({
        id: `draw_offer_${now}`,
        senderRole: fromRole,
        senderName: 'Hệ Thống',
        text: `🤝 ${fromRole === 'host' ? 'Chủ phòng' : 'Đối thủ'} đã gửi lời cầu hòa!`,
        timestamp: now,
      }),
    });
  }

  public static async respondToDraw(roomId: string, accept: boolean, responderRole: PlayerRole): Promise<void> {
    const db = this.getDb();
    const roomRef = doc(db, 'game_rooms', roomId);

    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(roomRef);
      if (!snap.exists()) return;
      const room = snap.data() as GameRoomData;

      if (room.status !== 'playing') return;

      const now = Date.now();
      if (accept) {
        const hostElo = room.hostPlayer.elo;
        const guestElo = room.guestPlayer?.elo || 1200;
        const eloChange = calculateEloChange(hostElo, guestElo, 'draw');
        // Postgres applies both ELO updates atomically when the room ends.

        transaction.update(roomRef, {
          status: 'finished',
          winner: 'draw',
          winReason: 'draw_agreement',
          drawOfferFrom: null,
          eloChange,
          updatedAt: now,
          quickMessages: arrayUnion({
            id: `draw_accept_${now}`,
            senderRole: responderRole,
            senderName: 'Hệ Thống',
            text: '🤝 Hai bên đồng ý hòa cờ! Kết quả: Hòa.',
            timestamp: now,
          }),
        });
      } else {
        transaction.update(roomRef, {
          drawOfferFrom: null,
          updatedAt: now,
          quickMessages: arrayUnion({
            id: `draw_decline_${now}`,
            senderRole: responderRole,
            senderName: 'Hệ Thống',
            text: '❌ Lời cầu hòa đã bị từ chối. Trận đấu tiếp tục!',
            timestamp: now,
          }),
        });
      }
    });
  }

  /**
   * 9. Send Quick Emote / Chat Message
   */
  public static async sendQuickMessage(
    roomId: string,
    senderRole: PlayerRole,
    senderName: string,
    text: string,
    isEmote = false
  ): Promise<void> {
    const db = this.getDb();
    const roomRef = doc(db, 'game_rooms', roomId);
    const msg: QuickMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      senderRole,
      senderName,
      text,
      isEmote,
      timestamp: Date.now(),
    };

    await updateDoc(roomRef, {
      quickMessages: arrayUnion(msg),
      updatedAt: Date.now(),
    });
  }

  /**
   * 10. Restart / Rematch in same room
   */
  public static async offerRematch(roomId: string, fromRole: PlayerRole, fromName: string = 'Đối thủ'): Promise<void> {
    const db = this.getDb();
    const roomRef = doc(db, 'game_rooms', roomId);
    const now = Date.now();
    await updateDoc(roomRef, {
      rematchOfferFrom: fromRole,
      updatedAt: now,
      quickMessages: arrayUnion({
        id: `rematch_offer_${now}`,
        senderRole: fromRole,
        senderName: 'Hệ Thống',
        text: `🔄 ${fromName} đã gửi lời mời ĐẤU LẠI!`,
        timestamp: now,
      }),
    });
  }

  public static async cancelRematch(roomId: string): Promise<void> {
    const db = this.getDb();
    const roomRef = doc(db, 'game_rooms', roomId);
    await updateDoc(roomRef, {
      rematchOfferFrom: null,
      updatedAt: Date.now(),
    });
  }

  public static async rematch(roomId: string): Promise<void> {
    const db = this.getDb();
    const roomRef = doc(db, 'game_rooms', roomId);

    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(roomRef);
      if (!snap.exists()) return;
      const room = snap.data() as GameRoomData;

      const now = Date.now();
      // Swap symbols for fairness
      const newHost = { ...room.hostPlayer, symbol: (room.hostPlayer.symbol === 'X' ? 'O' : 'X') as 'X' | 'O' };
      const newGuest = room.guestPlayer
        ? { ...room.guestPlayer, symbol: (room.guestPlayer.symbol === 'X' ? 'O' : 'X') as 'X' | 'O' }
        : null;

      transaction.update(roomRef, {
        hostPlayer: newHost,
        guestPlayer: newGuest,
        status: 'playing',
        currentTurn: newHost.symbol === 'X' ? 'host' : 'guest',
        turnDeadline: now + room.turnDurationSeconds * 1000,
        moveCount: 0,
        boardState: {},
        lastMove: null,
        winningLine: null,
        winner: null,
        winReason: null,
        drawOfferFrom: null,
        rematchOfferFrom: null,
        eloChange: null,
        updatedAt: now,
        quickMessages: arrayUnion({
          id: `rematch_${now}`,
          senderRole: 'host',
          senderName: 'Hệ Thống',
          text: '🔄 Ván đấu mới đã bắt đầu! Đổi lượt quân cờ.',
          timestamp: now,
        }),
      });
    });
  }
}

function queueDocDocIdSafe(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, '_');
}

