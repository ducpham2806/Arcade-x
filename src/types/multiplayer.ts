export type MultiplayerGameType = 'caro-gomoku' | 'cyber-chess' | 'xiangqi';

export type RoomStatus = 'waiting' | 'playing' | 'finished' | 'abandoned';

export type PlayerRole = 'host' | 'guest';

export interface RoomPlayerInfo {
  uid: string;
  displayName: string;
  avatar: string;
  elo: number;
  symbol: 'X' | 'O' | 'red' | 'black';
  isReady?: boolean;
  isConnected?: boolean;
  lastHeartbeat?: number;
}

export interface BoardMove {
  moveIndex: number;
  x: number;
  y: number;
  symbol: string;
  playerId: string;
  timestamp: number;
  notation?: string;
}

export interface QuickMessage {
  id: string;
  senderRole: PlayerRole;
  senderName: string;
  text: string;
  isEmote?: boolean;
  timestamp: number;
}

export interface GameRoomData {
  roomId: string;
  roomCode: string;
  gameId: string;
  isPrivate: boolean;
  status: RoomStatus;
  hostPlayer: RoomPlayerInfo;
  guestPlayer: RoomPlayerInfo | null;
  currentTurn: PlayerRole;
  turnDurationSeconds: number;
  turnDeadline: number;
  moveCount: number;
  boardState: Record<string, string>; // "row_col" -> "X" | "O"
  lastMove: { x: number; y: number; symbol: string; moveIndex: number } | null;
  winningLine: { x: number; y: number }[] | null;
  winner: PlayerRole | 'draw' | null;
  winReason: 'five_in_a_row' | 'timeout' | 'forfeit' | 'draw_agreement' | 'disconnect' | null;
  drawOfferFrom: PlayerRole | null;
  rematchOfferFrom?: PlayerRole | null;
  eloChange: { hostDelta: number; guestDelta: number } | null;
  quickMessages: QuickMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface MatchmakingQueueEntry {
  uid: string;
  displayName: string;
  avatarUrl: string;
  gameId: string;
  elo: number;
  status: 'waiting' | 'matched' | 'cancelled';
  matchedRoomId: string | null;
  createdAt: number;
}

export interface EloCalculationResult {
  newHostElo: number;
  newGuestElo: number;
  hostDelta: number;
  guestDelta: number;
}

