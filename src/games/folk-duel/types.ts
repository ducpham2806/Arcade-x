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
