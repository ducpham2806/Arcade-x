export type FolkGameKind = 'o-an-quan' | 'nhay-lo-co';

export type FolkSeat = 'P1' | 'P2';

export type SkinCategory =
  | 'oaq_stones'
  | 'oaq_board'
  | 'oaq_hand'
  | 'nlc_double_tile'
  | 'nlc_court'
  | 'nlc_cham'
  | 'nlc_character';

export interface EquippedFolkSkins {
  oaq_stones: string;
  oaq_board: string;
  oaq_hand: string;
  nlc_double_tile: string;
  nlc_court: string;
  nlc_cham: string;
  nlc_character: string;
}

export const DEFAULT_EQUIPPED_SKINS: EquippedFolkSkins = {
  oaq_stones: 'stones_pebbles',
  oaq_board: 'board_terracotta',
  oaq_hand: 'hand_student',
  nlc_double_tile: 'tile_cement_chalk',
  nlc_court: 'court_afternoon_alley',
  nlc_cham: 'cham_ceramic',
  nlc_character: 'char_ti',
};

export interface SkinItemDef {
  id: string;
  game: FolkGameKind;
  category: SkinCategory;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  priceCoins: number;
  priceCandy: number;
  isDefault?: boolean;
  /** Bảng màu pixel dùng cho renderer và live preview */
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    highlight: string;
    outline: string;
    particle: string;
  };
  sfxProfile: 'stone' | 'wood' | 'glass' | 'metal' | 'crystal' | 'chalk' | 'water' | 'ceramic';
}

export interface FolkEmoteDef {
  id: string;
  emoji: string;
  label: string;
}

export const FOLK_EMOTES: FolkEmoteDef[] = [
  { id: 'laugh', emoji: '😂', label: 'Cười sảng khoái' },
  { id: 'think', emoji: '🤔', label: 'Đang tính nước' },
  { id: 'shock', emoji: '😱', label: 'Thôi xong!' },
  { id: 'clap', emoji: '👏', label: 'Hay quá!' },
  { id: 'hurry', emoji: '⏳', label: 'Nhanh lên bạn ơi' },
  { id: 'gg', emoji: '🙏', label: 'Bắt tay / Tái đấu' },
];

export interface FolkPlayerInfo {
  seat: FolkSeat;
  userId: string;
  name: string;
  ready: boolean;
  connected: boolean;
  lastSeenAt: number;
  skins: EquippedFolkSkins;
}

export type RoomPhase = 'lobby' | 'countdown' | 'playing' | 'finished';

export interface FolkRoomSnapshot<TState = unknown> {
  roomId: string;
  code: string;
  gameKind: FolkGameKind;
  isPublic: boolean;
  version: number;
  phase: RoomPhase;
  hostSeat: FolkSeat;
  players: FolkPlayerInfo[];
  turn: FolkSeat;
  turnNumber: number;
  deadlineAt: number;
  rematchDeadlineAt: number | null;
  rematchVotes: FolkSeat[];
  winner: FolkSeat | 'DRAW' | null;
  finishReason: 'normal' | 'timeout' | 'forfeit' | 'disconnect' | null;
  lastEmote: { seat: FolkSeat; emoteId: string; at: number } | null;
  state: TState;
  createdAt: number;
  updatedAt: number;
}
