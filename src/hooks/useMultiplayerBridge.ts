/**
 * Universal Multiplayer Game Bridge Hook (useMultiplayerBridge)
 * Seamlessly connects any board or turn-based PvP game to Supabase real-time rooms
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { doc, onSnapshot, CloudDatabase } from '../services/cloudStore';
import { SupabaseService } from '../services/supabase';
import { MatchmakingService } from '../services/matchmakingService';
import {
  StandardGameRoom,
  RoomPlayerData,
  EndReason,
} from '../types/multiplayerCore';
import { usePlayer } from '../context/PlayerContext';

export interface UseMultiplayerBridgeResult {
  // Trạng thái phòng & Người chơi
  roomState: StandardGameRoom | null;
  myRole: 'host' | 'guest' | 'spectator';
  isMyTurn: boolean;
  turnTimeLeft: number;
  myInfo: RoomPlayerData | null;
  opponentInfo: RoomPlayerData | null;
  isLoading: boolean;
  error: string | null;

  // Hành động điều khiển
  makeMove: (
    newBoardState: any,
    moveDetails: {
      from?: [number, number] | string;
      to: [number, number] | string;
      notation?: string;
      piece?: string;
      captured?: string;
    },
    winCheckResult?: { isWin: boolean; isDraw?: boolean; endReason?: EndReason }
  ) => Promise<boolean>;
  surrender: () => Promise<void>;
  offerDraw: () => Promise<void>;
  respondDraw: (accept: boolean) => Promise<void>;
  offerRematch: () => Promise<void>;
  cancelRematch: () => Promise<void>;
  rematch: (resetBoardState: any) => Promise<void>;
  isRematchOfferedByMe: boolean;
  isRematchOfferedByOpponent: boolean;
  leaveRoom: () => void;
  sendChat: (text: string, isEmote?: boolean) => Promise<void>;
  claimTimeout: () => Promise<void>;
}

export function useMultiplayerBridge(
  roomId: string | null,
  gameId: string
): UseMultiplayerBridgeResult {
  const { profile, addExp, addCoins } = usePlayer();
  const [roomState, setRoomState] = useState<StandardGameRoom | null>(null);
  const [turnTimeLeft, setTurnTimeLeft] = useState<number>(45);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(roomId));
  const [error, setError] = useState<string | null>(null);

  // 1. Subscribe to Supabase Game Room
  useEffect(() => {
    if (!roomId) {
      setRoomState(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    let db: CloudDatabase;
    try {
      db = SupabaseService.getDb();
      if (!db) throw new Error('Supabase chưa được cấu hình.');
    } catch (err) {
      setError('Supabase chưa được kết nối.');
      setIsLoading(false);
      return;
    }

    const roomRef = doc(db, 'game_rooms', roomId);
    const unsubscribe = onSnapshot(
      roomRef,
      { includeMetadataChanges: true },
      (docSnap) => {
        setIsLoading(false);
        if (!docSnap.exists()) {
          setError('Phòng thi đấu không tồn tại hoặc đã bị xóa!');
          setRoomState(null);
          return;
        }

        const data = docSnap.data() as StandardGameRoom;
        setRoomState(data);
        setError(null);
      },
      (err) => {
        setIsLoading(false);
        setError(`Lỗi đồng bộ dữ liệu: ${err.message}`);
      }
    );

    return () => unsubscribe();
  }, [roomId]);

  // 2. Determine Role & Players
  const myRole = useMemo<'host' | 'guest' | 'spectator'>(() => {
    if (!roomState || !profile?.id) return 'spectator';
    if (roomState.players.host.uid === profile.id) return 'host';
    if (roomState.players.guest?.uid === profile.id) return 'guest';
    return 'spectator';
  }, [roomState, profile?.id]);

  const myInfo = useMemo<RoomPlayerData | null>(() => {
    if (!roomState) return null;
    if (myRole === 'host') return roomState.players.host;
    if (myRole === 'guest') return roomState.players.guest;
    return null;
  }, [roomState, myRole]);

  const opponentInfo = useMemo<RoomPlayerData | null>(() => {
    if (!roomState) return null;
    if (myRole === 'host') return roomState.players.guest;
    if (myRole === 'guest') return roomState.players.host;
    return null;
  }, [roomState, myRole]);

  const isMyTurn = useMemo<boolean>(() => {
    if (!roomState || !profile?.id) return false;
    if (roomState.status !== 'playing' && roomState.status !== 'ready') return false;
    return roomState.currentTurn === profile.id;
  }, [roomState, profile?.id]);

  // 3. Countdown Timer Loop
  useEffect(() => {
    if (!roomState || (roomState.status !== 'playing' && roomState.status !== 'ready')) {
      return;
    }

    const checkTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((roomState.turnDeadline - now) / 1000));
      setTurnTimeLeft(diff);

      // Auto claim timeout victory if opponent is out of time by > 2.5s
      if (
        diff === 0 &&
        roomState.currentTurn !== profile.id &&
        myRole !== 'spectator' &&
        now > roomState.turnDeadline + 2500 &&
        roomState.status === 'playing'
      ) {
        MatchmakingService.claimTimeout(roomState.roomId, profile.id).catch(() => {});
      }
    };

    checkTimer();
    const interval = setInterval(checkTimer, 500);
    return () => clearInterval(interval);
  }, [roomState?.turnDeadline, roomState?.currentTurn, roomState?.status, profile?.id, myRole]);

  // 4. Action Handlers
  const makeMove = useCallback(
    async (
      newBoardState: any,
      moveDetails: {
        from?: [number, number] | string;
        to: [number, number] | string;
        notation?: string;
        piece?: string;
        captured?: string;
      },
      winCheckResult?: { isWin: boolean; isDraw?: boolean; endReason?: EndReason }
    ): Promise<boolean> => {
      if (!roomState || !profile?.id) return false;
      if(!navigator.onLine){setError('Đang mất mạng. Nước đi chưa được gửi.');return false;}
      try {
      return await MatchmakingService.executeMove(
        roomState.roomId,
        profile.id,
        newBoardState,
        moveDetails,
        winCheckResult,
        roomState.boardState
      );
      }catch(e){setError(e instanceof Error?e.message:'Không gửi được nước đi.');return false;}
    },
    [roomState, profile?.id]
  );

  const surrender = useCallback(async (): Promise<void> => {
    if (!roomState || !profile?.id) return;
    await MatchmakingService.surrender(roomState.roomId, profile.id);
  }, [roomState, profile?.id]);

  const offerDraw = useCallback(async (): Promise<void> => {
    if (!roomState || !profile?.id) return;
    await MatchmakingService.offerDraw(roomState.roomId, profile.id);
  }, [roomState, profile?.id]);

  const respondDraw = useCallback(
    async (accept: boolean): Promise<void> => {
      if (!roomState || !profile?.id) return;
      await MatchmakingService.respondDraw(roomState.roomId, accept, profile.id);
    },
    [roomState, profile?.id]
  );

  const isRematchOfferedByMe = useMemo<boolean>(() => {
    if (!roomState || !profile?.id) return false;
    return Boolean(roomState.rematchOfferBy && roomState.rematchOfferBy === profile.id);
  }, [roomState?.rematchOfferBy, profile?.id]);

  const isRematchOfferedByOpponent = useMemo<boolean>(() => {
    if (!roomState || !profile?.id) return false;
    return Boolean(roomState.rematchOfferBy && roomState.rematchOfferBy !== profile.id);
  }, [roomState?.rematchOfferBy, profile?.id]);

  const offerRematch = useCallback(async (): Promise<void> => {
    if (!roomState || !profile?.id) return;
    await MatchmakingService.offerRematch(roomState.roomId, profile.id, profile.username);
  }, [roomState, profile?.id, profile?.username]);

  const cancelRematch = useCallback(async (): Promise<void> => {
    if (!roomState || !profile?.id) return;
    await MatchmakingService.cancelRematch(roomState.roomId, profile.id);
  }, [roomState, profile?.id]);

  const rematch = useCallback(
    async (resetBoardState: any): Promise<void> => {
      if (!roomState) return;
      await MatchmakingService.rematch(roomState.roomId, resetBoardState);
    },
    [roomState]
  );

  const sendChat = useCallback(
    async (text: string, isEmote = false): Promise<void> => {
      if (!roomState || !profile?.id) return;
      await MatchmakingService.sendChatMessage(
        roomState.roomId,
        profile.id,
        profile.username,
        text,
        isEmote
      );
    },
    [roomState, profile?.id, profile?.username]
  );

  const claimTimeout = useCallback(async (): Promise<void> => {
    if (!roomState || !profile?.id) return;
    await MatchmakingService.claimTimeout(roomState.roomId, profile.id);
  }, [roomState, profile?.id]);

  const leaveRoom = useCallback(() => {
    setRoomState(null);
  }, []);

  return {
    roomState,
    myRole,
    isMyTurn,
    turnTimeLeft,
    myInfo,
    opponentInfo,
    isLoading,
    error,
    makeMove,
    surrender,
    offerDraw,
    respondDraw,
    offerRematch,
    cancelRematch,
    rematch,
    isRematchOfferedByMe,
    isRematchOfferedByOpponent,
    leaveRoom,
    sendChat,
    claimTimeout,
  };
}

