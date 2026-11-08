import onlineConfig from './online-config.json';
import type {DropRateConfig,GameAchievementDef,GameControlInfo} from '../../types';
export const WORD_CHAIN_CONTROLS: GameControlInfo[] = [
  {key: 'Bàn phím', action: 'Gõ từ 2 âm tiết nối tiếp (Telex, VNI hoặc bàn phím điện thoại); âm tiết cần nối được điền sẵn.'},
  {key: 'Enter / GỬI', action: 'Gửi từ. Gõ sai được sửa và gửi lại trong thời gian còn lại.'},
  {key: 'Sẵn sàng', action: 'Bấm trong 30 giây chuẩn bị; đủ người là đếm 3-2-1.'},
];
export const WORD_CHAIN_ACHIEVEMENTS: GameAchievementDef[] = [];
// Rewards come from the placement score (bridge.submitScore); no chest drops.
export const WORD_CHAIN_DROP_RATES: DropRateConfig = {baseChestDropChance: 0, scoreThresholdForDrop: 0, chestWeights: []};

// Room requests always use the same Supabase project and identity as launcher Auth.
// Public online release approved on 2026-11-08; staging can use matching URL/key overrides.
export const WORD_CHAIN_ONLINE = onlineConfig.enabled || import.meta.env.VITE_WORD_CHAIN_ONLINE === 'true';
