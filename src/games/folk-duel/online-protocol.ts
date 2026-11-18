import type { HopType, NlcState, NlcTurnPhase } from '../nhay-lo-co/rules';
import type { OaqMove, OaqState } from '../o-an-quan/rules';
import type { FolkGameKind, FolkSeat } from './types';

export type FolkStates = { 'o-an-quan': OaqState; 'nhay-lo-co': NlcState };
export type NlcAction = { type: 'throw' } | { type: 'hop'; feet: HopType } | { type: 'pickup' };
export type FolkCommand =
  | { type: 'sow'; move: OaqMove }
  | NlcAction
  | { type: 'chat'; text: string }
  | { type: 'rematch' }
  | { type: 'leave' };

export type FolkRequest = { game: FolkGameKind } & (
  | { type: 'create' | 'match'; requestId: string; name: string }
  | { type: 'join'; code: string; name: string }
  | { type: 'resume' }
  | { type: 'snapshot'; roomId: string }
  | { type: 'command'; roomId: string; version: number; actionId: string; command: FolkCommand }
);

export type NlcOnlineStep = {
  phase: NlcTurnPhase;
  since: number;
  hopIndex: number;
  perfect: boolean;
  pickedUp: boolean;
  message: string;
};

export type FolkChatMessage = { id: string; seat: FolkSeat; text: string; at: number };
export type FolkOnlineRoom<Game extends FolkGameKind = FolkGameKind> = {
  roomId: string;
  game: Game;
  code: string;
  isPublic: boolean;
  matchId: string;
  version: number;
  phase: 'lobby' | 'countdown' | 'playing' | 'finished';
  mySeat: FolkSeat;
  players: { seat: FolkSeat; name: string; left: boolean }[];
  readyAt: number;
  deadlineAt: number;
  rematchUntil: number;
  rematchVotes: FolkSeat[];
  winner: FolkSeat | 'DRAW' | null;
  finishReason: 'normal' | 'timeout' | 'forfeit' | 'expired' | 'cancelled' | null;
  state: FolkStates[Game];
  nlc: NlcOnlineStep | null;
  chat: FolkChatMessage[];
};

export type FolkReply<Game extends FolkGameKind = FolkGameKind> = {
  room: FolkOnlineRoom<Game> | null;
  serverNow: number;
  accepted?: boolean;
  error?: string;
  message?: string;
};

export const otherSeat = (seat: FolkSeat): FolkSeat => seat === 'P1' ? 'P2' : 'P1';
export const folkChatId = (matchId: string, seat: FolkSeat) => `${matchId}:${seat}`;

export function folkPowerAt(since: number, now: number) {
  return Math.round(50 + Math.sin(Math.max(0, now - since) / 250) * 48);
}
