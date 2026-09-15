/**
 * Standard Multiplayer Schema Interfaces & Types
 */

export type GameStatus = 'waiting' | 'ready' | 'playing' | 'ended' | 'abandoned';

export type PlayerColor = 'RED' | 'BLACK' | 'WHITE' | 'X' | 'O';

export type EndReason = 'CHECKMATE' | 'FIVE_IN_A_ROW' | 'TIMEOUT' | 'SURRENDER' | 'DISCONNECT' | 'DRAW_AGREEMENT';

export interface RoomPlayerData {
  uid: string;
  name: string;
  avatarUrl: string;
  elo: number;
  color: PlayerColor;
  ready: boolean;
  connected: boolean;
  lastHeartbeat?: number;
}

export interface MoveRecord {
  from?: [number, number] | string;
  to: [number, number] | string;
  by: string; // Player UID
  notation?: string;
  piece?: string;
  captured?: string;
  timestamp: number;
}

export interface StandardGameRoom {
  roomId: string;
  roomCode: string; // 6-digit code
  gameId: string; // 'xiangqi' | 'caro-gomoku' | 'cyber-chess'
  isPrivate: boolean;
  status: GameStatus;
  players: {
    host: RoomPlayerData;
    guest: RoomPlayerData | null;
  };
  currentTurn: string; // Player UID
  turnDuration: number; // in seconds (e.g., 30, 60, 90)
  turnDeadline: number; // Epoch timestamp (ms)
  boardState: any; // Dynamic matrix / state
  lastMove: MoveRecord | null;
  moveHistory: MoveRecord[];
  winner: string | 'DRAW' | null; // Player UID or 'DRAW'
  endReason: EndReason | null;
  drawOfferBy: string | null; // Player UID
  rematchOfferBy?: string | null; // Player UID who requested rematch
  eloChange: {
    hostDelta: number;
    guestDelta: number;
    newHostElo: number;
    newGuestElo: number;
  } | null;
  messages: Array<{
    id: string;
    senderUid: string;
    senderName: string;
    text: string;
    isEmote?: boolean;
    timestamp: number;
  }>;
  createdAt: number;
  updatedAt: number;
}

export interface MatchmakingQueueRecord {
  uid: string;
  displayName: string;
  avatarUrl: string;
  gameId: string;
  elo: number;
  status: 'waiting' | 'matched' | 'cancelled';
  matchedRoomId: string | null;
  createdAt: number;
}
