import type { GameBridgeAPI } from '../../types';
import {
  DEFAULT_EQUIPPED_SKINS,
  type EquippedFolkSkins,
  type FolkGameKind,
  type SkinCategory,
} from './types';
import { FOLK_SKINS_CATALOG, getSkinById } from './skins-catalog';

const STORAGE_KEY = 'arcadex:folk-duel:profile:v1';

export interface FolkProfileSave {
  candyTokens: number;
  ownedSkins: string[];
  equippedSkins: EquippedFolkSkins;
  claimedMatchIds: string[];
  friendBonusCount: number;
  stats: {
    oaqWins: number;
    oaqMatches: number;
    nlcWins: number;
    nlcMatches: number;
    winStreak: number;
    bestStreak: number;
  };
}

export function createInitialFolkProfile(): FolkProfileSave {
  const defaultOwned = FOLK_SKINS_CATALOG.filter((s) => s.isDefault).map((s) => s.id);
  return {
    candyTokens: 20, // Quà tân thủ để anh/người chơi thử mua nhanh ngay sau vài trận
    ownedSkins: defaultOwned,
    equippedSkins: { ...DEFAULT_EQUIPPED_SKINS },
    claimedMatchIds: [],
    friendBonusCount: 0,
    stats: {
      oaqWins: 0,
      oaqMatches: 0,
      nlcWins: 0,
      nlcMatches: 0,
      winStreak: 0,
      bestStreak: 0,
    },
  };
}

export function loadFolkProfile(bridge?: GameBridgeAPI): FolkProfileSave {
  const base = createInitialFolkProfile();
  let raw: Partial<FolkProfileSave> | null = null;
  if (bridge) {
    try {
      raw = bridge.loadGameState<FolkProfileSave>();
    } catch {
      raw = null;
    }
  }
  if (!raw && typeof localStorage !== 'undefined') {
    try {
      const str = localStorage.getItem(STORAGE_KEY);
      if (str) raw = JSON.parse(str) as Partial<FolkProfileSave>;
    } catch {
      raw = null;
    }
  }
  if (!raw) return base;
  const owned = new Set([...base.ownedSkins, ...(Array.isArray(raw.ownedSkins) ? raw.ownedSkins : [])]);
  return {
    candyTokens: typeof raw.candyTokens === 'number' && raw.candyTokens >= 0 ? Math.floor(raw.candyTokens) : base.candyTokens,
    ownedSkins: [...owned],
    equippedSkins: { ...base.equippedSkins, ...(raw.equippedSkins ?? {}) },
    claimedMatchIds: Array.isArray(raw.claimedMatchIds) ? raw.claimedMatchIds.slice(-100) : [],
    friendBonusCount: typeof raw.friendBonusCount === 'number' ? raw.friendBonusCount : 0,
    stats: { ...base.stats, ...(raw.stats ?? {}) },
  };
}

export function saveFolkProfile(profile: FolkProfileSave, bridge?: GameBridgeAPI): void {
  if (bridge) {
    try {
      bridge.saveGameState(profile);
    } catch {
      // Bỏ qua nếu môi trường test không có storage
    }
  }
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Optional
    }
  }
}

export interface MatchRewardInput {
  matchId: string;
  game: FolkGameKind;
  mode: 'bot_easy' | 'bot_hard' | 'friend_room' | 'matchmaking' | 'local_2p';
  won: boolean;
  isDraw?: boolean;
  forfeitedEarly?: boolean;
  /** Số lần ăn Quan / ăn kép / xây nhà trong trận */
  skillBonuses: number;
  score: number;
}

export interface MatchRewardOutput {
  alreadyClaimed: boolean;
  coins: number;
  exp: number;
  candy: number;
  profile: FolkProfileSave;
}

export function calculateMatchReward(input: MatchRewardInput): { coins: number; exp: number; candy: number } {
  if (input.mode === 'local_2p' || input.forfeitedEarly) {
    return { coins: 10, exp: 15, candy: 1 };
  }
  let baseCoins = 20;
  let baseExp = 35;
  let baseCandy = 1;

  if (input.mode === 'bot_easy') {
    baseCoins = input.won ? 25 : 10;
    baseExp = input.won ? 40 : 20;
    baseCandy = input.won ? 2 : 1;
  } else if (input.mode === 'bot_hard') {
    baseCoins = input.won ? 45 : 15;
    baseExp = input.won ? 65 : 25;
    baseCandy = input.won ? 4 : 1;
  } else if (input.mode === 'friend_room') {
    baseCoins = input.won ? 50 : 20;
    baseExp = input.won ? 75 : 35;
    baseCandy = input.won ? 5 : 2;
  } else if (input.mode === 'matchmaking') {
    baseCoins = input.won ? 80 : input.isDraw ? 45 : 25;
    baseExp = input.won ? 100 : input.isDraw ? 60 : 45;
    baseCandy = input.won ? 8 : input.isDraw ? 4 : 2;
  }

  const cappedBonus = Math.min(3, Math.max(0, Math.floor(input.skillBonuses)));
  return {
    coins: baseCoins + cappedBonus * 10,
    exp: baseExp + cappedBonus * 15,
    candy: baseCandy + cappedBonus,
  };
}

export function applyMatchReward(
  profile: FolkProfileSave,
  input: MatchRewardInput,
  bridge?: GameBridgeAPI
): MatchRewardOutput {
  if (profile.claimedMatchIds.includes(input.matchId)) {
    return { alreadyClaimed: true, coins: 0, exp: 0, candy: 0, profile };
  }

  const reward = calculateMatchReward(input);
  const nextStats = { ...profile.stats };
  if (input.game === 'o-an-quan') {
    nextStats.oaqMatches += 1;
    if (input.won) nextStats.oaqWins += 1;
  } else {
    nextStats.nlcMatches += 1;
    if (input.won) nextStats.nlcWins += 1;
  }
  if (input.won) {
    nextStats.winStreak += 1;
    nextStats.bestStreak = Math.max(nextStats.bestStreak, nextStats.winStreak);
  } else if (!input.isDraw) {
    nextStats.winStreak = 0;
  }

  const nextProfile: FolkProfileSave = {
    ...profile,
    candyTokens: profile.candyTokens + reward.candy,
    claimedMatchIds: [...profile.claimedMatchIds.slice(-99), input.matchId],
    stats: nextStats,
  };
  saveFolkProfile(nextProfile, bridge);

  if (bridge) {
    // Gọi bridge để cộng Xu, XP & điểm bảng xếp hạng Arcade-X
    bridge.grantCoins(reward.coins);
    bridge.grantExp(reward.exp);
    bridge.reportQuest('play_any', 1);
    if (input.won) bridge.reportQuest('win_match', 1);
    if (input.mode === 'matchmaking' || input.mode === 'friend_room') {
      bridge.triggerLootRoll(input.score);
    }
  }

  return {
    alreadyClaimed: false,
    coins: reward.coins,
    exp: reward.exp,
    candy: reward.candy,
    profile: nextProfile,
  };
}

export function purchaseSkinWithCandy(
  profile: FolkProfileSave,
  skinId: string,
  bridge?: GameBridgeAPI
): { ok: boolean; error?: string; profile: FolkProfileSave } {
  const skin = getSkinById(skinId);
  if (!skin || skin.id !== skinId) {
    return { ok: false, error: 'Không tìm thấy vật phẩm.', profile };
  }
  if (profile.ownedSkins.includes(skinId)) {
    return { ok: false, error: 'Bạn đã sở hữu Skin này rồi.', profile };
  }
  if (profile.candyTokens < skin.priceCandy) {
    return { ok: false, error: `Cần ${skin.priceCandy} Kẹo Mạch Nha để đổi.`, profile };
  }
  const next: FolkProfileSave = {
    ...profile,
    candyTokens: profile.candyTokens - skin.priceCandy,
    ownedSkins: [...profile.ownedSkins, skinId],
    equippedSkins: {
      ...profile.equippedSkins,
      [skin.category as SkinCategory]: skinId,
    },
  };
  saveFolkProfile(next, bridge);
  return { ok: true, profile: next };
}

export function equipFolkSkin(
  profile: FolkProfileSave,
  skinId: string,
  bridge?: GameBridgeAPI
): { ok: boolean; profile: FolkProfileSave } {
  if (!profile.ownedSkins.includes(skinId)) {
    return { ok: false, profile };
  }
  const skin = getSkinById(skinId);
  const next: FolkProfileSave = {
    ...profile,
    equippedSkins: {
      ...profile.equippedSkins,
      [skin.category]: skinId,
    },
  };
  saveFolkProfile(next, bridge);
  return { ok: true, profile: next };
}
