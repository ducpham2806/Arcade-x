import React, { useState, useMemo } from 'react';
import { EquipmentItem, EquipmentSlot, ItemRarity, HeroAlly, AllyEquipmentItem, AllyEquipSlot } from '../types';
import { RARITY_CONFIG } from '../equipmentData';
import { AllyEquipmentSubTab } from './AllyEquipmentSubTab';
import {
  Shield,
  Swords,
  Sparkles,
  Trash2,
  ArrowUpCircle,
  Check,
  Zap,
  TrendingUp,
  TrendingDown,
  X,
  Coins,
  Flame,
  Users,
  Award,
} from 'lucide-react';
import { formatNumber, calculateItemPower, isBetterItem } from '../utils/upgradeMath';

interface EquipmentTabProps {
  equipped: Record<EquipmentSlot, EquipmentItem | null>;
  inventory: EquipmentItem[];
  gold: number;
  onEquipItem: (item: EquipmentItem) => void;
  onUpgradeItem: (item: EquipmentItem, count?: number) => void;
  onSellItem: (itemId: string) => void;
  onEquipBestAll?: () => void;
  allies?: HeroAlly[];
  allyInventory?: AllyEquipmentItem[];
  onEquipAllyItem?: (allyId: string, item: AllyEquipmentItem) => void;
  onUpgradeAllyItem?: (allyId: string, slot: AllyEquipSlot) => void;
  onSellAllyItem?: (itemId: string) => void;
  onEquipBestAllies?: () => void;
  defaultSubTab?: 'hero' | 'allies';
}

const SLOT_NAMES: Record<EquipmentSlot, string> = {
  weapon: 'Vũ Khí (Kiếm)',
  armor: 'Áo Giáp',
  helmet: 'Mũ / Nón',
  cloak: 'Áo Choàng',
  ring: 'Nhẫn Cổ Vật',
};

const SLOT_ICONS: Record<EquipmentSlot, string> = {
  weapon: '⚔️',
  armor: '🛡️',
  helmet: '👑',
  cloak: '🧣',
  ring: '💍',
};

export const EquipmentTab: React.FC<EquipmentTabProps> = ({
  equipped,
  inventory,
  gold,
  onEquipItem,
  onUpgradeItem,
  onSellItem,
  onEquipBestAll,
  allies = [],
  allyInventory = [],
  onEquipAllyItem = () => {},
  onUpgradeAllyItem = () => {},
  onSellAllyItem = () => {},
  onEquipBestAllies = () => {},
  defaultSubTab = 'hero',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'hero' | 'allies'>(defaultSubTab);
  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [filterSlot, setFilterSlot] = useState<EquipmentSlot | 'all'>('all');

  // Derived live selected item (updates reactively upon upgrade without resetting or desyncing state)
  const selectedItem = useMemo(() => {
    if (selectedSlot && equipped[selectedSlot]) {
      return equipped[selectedSlot];
    }
    if (selectedItemId) {
      const fromEquipped = Object.values(equipped).find((i) => i && i.id === selectedItemId);
      if (fromEquipped) return fromEquipped;
      const fromInv = inventory.find((i) => i.id === selectedItemId);
      if (fromInv) return fromInv;
    }
    return null;
  }, [selectedSlot, selectedItemId, equipped, inventory]);

  const filteredInventory =
    filterSlot === 'all' ? inventory : inventory.filter((i) => i.slot === filterSlot);

  // Count items in inventory that are direct upgrades
  const recommendedItems = inventory.filter((item) =>
    isBetterItem(item, equipped[item.slot])
  );
  const recommendedCount = recommendedItems.length;

  // Currently equipped item in the same slot as the selected item
  const currentEquippedInSlot = selectedItem ? equipped[selectedItem.slot] : null;
  const isSelectedAlreadyEquipped =
    Boolean(selectedItem && currentEquippedInSlot && currentEquippedInSlot.id === selectedItem.id);

  // Next level preview when inspecting currently equipped item
  const nextLevelPreview = useMemo<EquipmentItem | null>(() => {
    if (!selectedItem) return null;
    return {
      ...selectedItem,
      level: selectedItem.level + 1,
      tapDmgBonus: selectedItem.tapDmgBonus ? Math.round(selectedItem.tapDmgBonus * 1.25) : 0,
      heroDmgBonus: selectedItem.heroDmgBonus ? Math.round(selectedItem.heroDmgBonus * 1.25) : 0,
      critRateBonus: selectedItem.critRateBonus ? Math.min(45, selectedItem.critRateBonus + 1) : 0,
      goldBonus: selectedItem.goldBonus ? Math.round(selectedItem.goldBonus * 1.25) : 0,
      upgradeCost: Math.round(selectedItem.upgradeCost * 1.45),
      sellValue: Math.round(selectedItem.sellValue * 1.3),
    };
  }, [selectedItem]);

  // Precompute continuous & bulk upgrade affordability
  const upgradeAffordability = useMemo(() => {
    if (!selectedItem) return { can1: false, cost5: 0, levels5: 0, costMax: 0, levelsMax: 0 };
    const can1 = gold >= selectedItem.upgradeCost;

    let cost5 = 0;
    let levels5 = 0;
    let temp5 = { ...selectedItem };
    for (let i = 0; i < 5; i++) {
      if (gold < cost5 + temp5.upgradeCost) break;
      cost5 += temp5.upgradeCost;
      levels5++;
      temp5 = {
        ...temp5,
        upgradeCost: Math.round(temp5.upgradeCost * 1.45),
      };
    }

    let costMax = 0;
    let levelsMax = 0;
    let tempMax = { ...selectedItem };
    while (gold >= costMax + tempMax.upgradeCost && levelsMax < 500) {
      costMax += tempMax.upgradeCost;
      levelsMax++;
      tempMax = {
        ...tempMax,
        upgradeCost: Math.round(tempMax.upgradeCost * 1.45),
      };
    }

    return { can1, cost5, levels5, costMax, levelsMax };
  }, [selectedItem, gold]);

  // Power calculations
  const selectedPower = calculateItemPower(selectedItem);
  const currentPower = calculateItemPower(currentEquippedInSlot);
  const nextPower = calculateItemPower(nextLevelPreview);

  const powerDiff = isSelectedAlreadyEquipped
    ? nextPower - selectedPower
    : selectedPower - currentPower;

  const isSelectedAnUpgrade =
    Boolean(selectedItem && !isSelectedAlreadyEquipped && (!currentEquippedInSlot || powerDiff > 0));

  return (
    <div className="flex flex-col gap-3 p-3 text-slate-200">
      {/* Category Toggle: Sword Master vs Hero Allies */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-md">
        <button
          id="tab-equip-hero"
          onClick={() => setActiveSubTab('hero')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'hero'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>⚔️ KIẾM SĨ (5 MÓN)</span>
        </button>

        <button
          id="tab-equip-allies"
          onClick={() => setActiveSubTab('allies')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'allies'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>👥 ĐỒNG ĐỘI ({allies.length})</span>
        </button>
      </div>

      {activeSubTab === 'allies' ? (
        <AllyEquipmentSubTab
          allies={allies}
          allyInventory={allyInventory}
          gold={gold}
          onEquipAllyItem={onEquipAllyItem}
          onUpgradeAllyItem={onUpgradeAllyItem}
          onSellAllyItem={onSellAllyItem}
          onEquipBestAllies={onEquipBestAllies}
        />
      ) : (
        <>
          {/* 5 Equipped Slots Header Bar */}
          <div className="bg-slate-900/90 border border-slate-700/80 p-3 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Trang Bị Đang Mặc (5 Vị Trí)</span>
          </h3>
          <span className="text-[11px] font-mono text-cyan-400 font-bold">
            Tổng Sức Mạnh: ⚡{' '}
            {Object.values(equipped).reduce(
              (acc, item) => acc + calculateItemPower(item),
              0
            )}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {(['weapon', 'armor', 'helmet', 'cloak', 'ring'] as EquipmentSlot[]).map((slot) => {
            const item = equipped[slot];
            const rarity = item ? RARITY_CONFIG[item.rarity] : null;
            const hasUpgradeInBag = inventory.some((inv) => isBetterItem(inv, item));

            return (
              <button
                key={slot}
                onClick={() => {
                  if (item) {
                    setSelectedSlot(slot);
                    setSelectedItemId(item.id);
                  } else {
                    // Auto switch filter to that slot to help player find an item
                    setFilterSlot(slot);
                  }
                }}
                className={`relative flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl border transition-all active:scale-95 text-center min-h-[76px] ${
                  item && rarity
                    ? `${rarity.bg} ${rarity.border} hover:brightness-110 shadow-sm`
                    : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:border-slate-700'
                } ${selectedItem?.id === item?.id ? 'ring-2 ring-cyan-400' : ''}`}
              >
                {/* Upgrade Available Indicator Badge on Equipped Slot */}
                {hasUpgradeInBag && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-md shadow-emerald-500/40 animate-pulse z-10 flex items-center gap-0.5">
                    ▲ ĐỔI
                  </span>
                )}

                <span className="text-2xl sm:text-3xl mb-0.5 select-none">
                  {item ? item.icon : SLOT_ICONS[slot]}
                </span>
                <span className="text-[10px] font-bold truncate w-full text-slate-300 leading-tight">
                  {item ? item.name : SLOT_NAMES[slot].split(' ')[0]}
                </span>

                {item ? (
                  <span
                    className="text-[9px] font-mono font-bold uppercase mt-0.5"
                    style={{ color: rarity?.color }}
                  >
                    Lv.{item.level}
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-slate-600 mt-0.5">Trống</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison & Inspection Card (When Any Item is Clicked) */}
      {selectedItem && (
        <div className="bg-slate-900 border border-cyan-500/60 p-3 sm:p-4 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-150 relative">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                <span>{SLOT_ICONS[selectedItem.slot]}</span>
                <span>{SLOT_NAMES[selectedItem.slot]}</span>
              </span>
              <span className="text-[11px] text-slate-500">•</span>
              <span className="text-xs text-slate-400">
                {isSelectedAlreadyEquipped
                  ? 'Chi Tiết Trang Bị Đang Mặc'
                  : 'So Sánh Với Món Đang Mặc'}
              </span>
            </div>

            <button
              onClick={() => {
                setSelectedSlot(null);
                setSelectedItemId(null);
              }}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Recommendation / Upgrade Banner */}
          {isSelectedAlreadyEquipped ? (
            <div className="mb-3 p-2 rounded-xl flex items-center justify-between gap-2 text-xs font-bold bg-amber-950/40 border border-amber-500/40 text-amber-300">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Trang bị Kiếm Sĩ đang kích hoạt. Bấm nâng cấp liên tục để tăng vọt lực chiến!</span>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded-md font-mono shrink-0">
                Lv.{selectedItem.level} ➔ Lv.{selectedItem.level + 1}
              </span>
            </div>
          ) : (
            <div
              className={`mb-3 p-2 rounded-xl flex items-center gap-2 text-xs font-bold ${
                !currentEquippedInSlot
                  ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                  : isSelectedAnUpgrade
                  ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-900/30'
                  : 'bg-slate-800/80 border border-slate-700 text-slate-300'
              }`}
            >
              <Award className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                {!currentEquippedInSlot
                  ? 'Vị trí này đang để trống! Hãy mặc ngay để kích hoạt các chỉ số chiến đấu.'
                  : isSelectedAnUpgrade
                  ? `ĐỀ XUẤT: Món này mạnh hơn trang bị đang dùng (+${powerDiff} điểm sức mạnh)!`
                  : `CÂN NHẮC: Món này có tổng sức mạnh thấp hơn món đang mặc (${powerDiff} điểm).`}
              </span>
            </div>
          )}

          {/* Side-by-Side Comparison Cards */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {/* Left Card: Current Level / Currently Equipped */}
            <div
              className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                isSelectedAlreadyEquipped
                  ? `${RARITY_CONFIG[selectedItem.rarity].bg} ${RARITY_CONFIG[selectedItem.rarity].border}`
                  : currentEquippedInSlot
                  ? `${RARITY_CONFIG[currentEquippedInSlot.rarity].bg} ${
                      RARITY_CONFIG[currentEquippedInSlot.rarity].border
                    }`
                  : 'bg-slate-950/70 border-dashed border-slate-800 text-slate-500'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 mb-1">
                  <span>{isSelectedAlreadyEquipped ? 'Cấp Hiện Tại' : 'Đang Mặc'}</span>
                  <span className="text-cyan-400 font-mono">
                    ⚡ {isSelectedAlreadyEquipped ? selectedPower : currentEquippedInSlot ? calculateItemPower(currentEquippedInSlot) : 0}
                  </span>
                </div>

                {(isSelectedAlreadyEquipped ? selectedItem : currentEquippedInSlot) ? (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl sm:text-3xl">
                      {(isSelectedAlreadyEquipped ? selectedItem : currentEquippedInSlot)?.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs text-slate-100 truncate">
                        {(isSelectedAlreadyEquipped ? selectedItem : currentEquippedInSlot)?.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
                        <span
                          className="font-bold"
                          style={{
                            color: RARITY_CONFIG[(isSelectedAlreadyEquipped ? selectedItem : currentEquippedInSlot)!.rarity].color,
                          }}
                        >
                          {RARITY_CONFIG[(isSelectedAlreadyEquipped ? selectedItem : currentEquippedInSlot)!.rarity].name}
                        </span>
                        <span className="font-mono text-slate-400">
                          Lv.{(isSelectedAlreadyEquipped ? selectedItem : currentEquippedInSlot)?.level}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-3 text-center text-xs text-slate-600">
                    Chưa có trang bị ở ô này
                  </div>
                )}
              </div>
            </div>

            {/* Right Card: Next Level (+1 Lv) or Selected Item from Bag */}
            <div
              className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                isSelectedAlreadyEquipped
                  ? `${RARITY_CONFIG[selectedItem.rarity].bg} border-amber-400/80 shadow-md shadow-amber-500/20`
                  : `${RARITY_CONFIG[selectedItem.rarity].bg} ${RARITY_CONFIG[selectedItem.rarity].border} ${
                      isSelectedAnUpgrade ? 'ring-2 ring-emerald-400/80 shadow-md shadow-emerald-500/20' : ''
                    }`
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 mb-1">
                  <span className={isSelectedAlreadyEquipped ? 'text-amber-300 font-black' : isSelectedAnUpgrade ? 'text-emerald-300 font-black' : ''}>
                    {isSelectedAlreadyEquipped ? 'Cấp Kế Tiếp (+1 Lv)' : 'Trong Rương'}
                  </span>
                  <span className="text-amber-300 font-mono font-bold">
                    ⚡ {isSelectedAlreadyEquipped ? nextPower : selectedPower}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl">
                    {isSelectedAlreadyEquipped ? nextLevelPreview?.icon : selectedItem.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-slate-100 truncate">
                      {isSelectedAlreadyEquipped ? nextLevelPreview?.name : selectedItem.name}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
                      <span
                        className="font-bold"
                        style={{
                          color: RARITY_CONFIG[
                            (isSelectedAlreadyEquipped ? nextLevelPreview : selectedItem)!.rarity
                          ].color,
                        }}
                      >
                        {RARITY_CONFIG[
                          (isSelectedAlreadyEquipped ? nextLevelPreview : selectedItem)!.rarity
                        ].name}
                      </span>
                      <span className="font-mono text-emerald-300 font-bold">
                        Lv.{isSelectedAlreadyEquipped ? nextLevelPreview?.level : selectedItem.level}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Stat-by-Stat Diff Table */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex flex-col gap-1.5 mb-3 text-xs">
            {/* Stat Row 1: Sát Thương Tap */}
            {(selectedItem.tapDmgBonus > 0 ||
              (currentEquippedInSlot && currentEquippedInSlot.tapDmgBonus > 0) ||
              (nextLevelPreview && nextLevelPreview.tapDmgBonus > 0)) && (
              <div className="flex items-center justify-between py-0.5 border-b border-white/5">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sát Thương Tap</span>
                </span>
                <div className="flex items-center gap-2 font-mono font-bold">
                  <span className="text-slate-500">
                    +{isSelectedAlreadyEquipped ? selectedItem.tapDmgBonus : currentEquippedInSlot?.tapDmgBonus || 0}%
                  </span>
                  <span className="text-slate-600">➔</span>
                  <span className="text-amber-300">
                    +{isSelectedAlreadyEquipped ? nextLevelPreview?.tapDmgBonus || 0 : selectedItem.tapDmgBonus || 0}%
                  </span>
                  {isSelectedAlreadyEquipped ? (
                    (nextLevelPreview?.tapDmgBonus || 0) > selectedItem.tapDmgBonus && (
                      <span className="text-[11px] px-1 rounded text-emerald-400 bg-emerald-950/80">
                        +{(nextLevelPreview?.tapDmgBonus || 0) - selectedItem.tapDmgBonus}%
                      </span>
                    )
                  ) : (
                    selectedItem.tapDmgBonus !== (currentEquippedInSlot?.tapDmgBonus || 0) && (
                      <span
                        className={`text-[11px] px-1 rounded ${
                          selectedItem.tapDmgBonus > (currentEquippedInSlot?.tapDmgBonus || 0)
                            ? 'text-emerald-400 bg-emerald-950/80'
                            : 'text-rose-400 bg-rose-950/80'
                        }`}
                      >
                        {selectedItem.tapDmgBonus > (currentEquippedInSlot?.tapDmgBonus || 0) ? '+' : ''}
                        {selectedItem.tapDmgBonus - (currentEquippedInSlot?.tapDmgBonus || 0)}%
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Stat Row 2: Hero DPS */}
            {(selectedItem.heroDmgBonus > 0 ||
              (currentEquippedInSlot && currentEquippedInSlot.heroDmgBonus > 0) ||
              (nextLevelPreview && nextLevelPreview.heroDmgBonus > 0)) && (
              <div className="flex items-center justify-between py-0.5 border-b border-white/5">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  <span>Đồng Đội DPS</span>
                </span>
                <div className="flex items-center gap-2 font-mono font-bold">
                  <span className="text-slate-500">
                    +{isSelectedAlreadyEquipped ? selectedItem.heroDmgBonus : currentEquippedInSlot?.heroDmgBonus || 0}%
                  </span>
                  <span className="text-slate-600">➔</span>
                  <span className="text-purple-300">
                    +{isSelectedAlreadyEquipped ? nextLevelPreview?.heroDmgBonus || 0 : selectedItem.heroDmgBonus || 0}%
                  </span>
                  {isSelectedAlreadyEquipped ? (
                    (nextLevelPreview?.heroDmgBonus || 0) > selectedItem.heroDmgBonus && (
                      <span className="text-[11px] px-1 rounded text-emerald-400 bg-emerald-950/80">
                        +{(nextLevelPreview?.heroDmgBonus || 0) - selectedItem.heroDmgBonus}%
                      </span>
                    )
                  ) : (
                    selectedItem.heroDmgBonus !== (currentEquippedInSlot?.heroDmgBonus || 0) && (
                      <span
                        className={`text-[11px] px-1 rounded ${
                          selectedItem.heroDmgBonus > (currentEquippedInSlot?.heroDmgBonus || 0)
                            ? 'text-emerald-400 bg-emerald-950/80'
                            : 'text-rose-400 bg-rose-950/80'
                        }`}
                      >
                        {selectedItem.heroDmgBonus > (currentEquippedInSlot?.heroDmgBonus || 0) ? '+' : ''}
                        {selectedItem.heroDmgBonus - (currentEquippedInSlot?.heroDmgBonus || 0)}%
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Stat Row 3: Tỉ Lệ Bạo Kích */}
            {(selectedItem.critRateBonus > 0 ||
              (currentEquippedInSlot && currentEquippedInSlot.critRateBonus > 0) ||
              (nextLevelPreview && nextLevelPreview.critRateBonus > 0)) && (
              <div className="flex items-center justify-between py-0.5 border-b border-white/5">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>Tỉ Lệ Chí Mạng</span>
                </span>
                <div className="flex items-center gap-2 font-mono font-bold">
                  <span className="text-slate-500">
                    +{isSelectedAlreadyEquipped ? selectedItem.critRateBonus : currentEquippedInSlot?.critRateBonus || 0}%
                  </span>
                  <span className="text-slate-600">➔</span>
                  <span className="text-rose-300">
                    +{isSelectedAlreadyEquipped ? nextLevelPreview?.critRateBonus || 0 : selectedItem.critRateBonus || 0}%
                  </span>
                  {isSelectedAlreadyEquipped ? (
                    (nextLevelPreview?.critRateBonus || 0) > selectedItem.critRateBonus && (
                      <span className="text-[11px] px-1 rounded text-emerald-400 bg-emerald-950/80">
                        +{(nextLevelPreview?.critRateBonus || 0) - selectedItem.critRateBonus}%
                      </span>
                    )
                  ) : (
                    selectedItem.critRateBonus !== (currentEquippedInSlot?.critRateBonus || 0) && (
                      <span
                        className={`text-[11px] px-1 rounded ${
                          selectedItem.critRateBonus > (currentEquippedInSlot?.critRateBonus || 0)
                            ? 'text-emerald-400 bg-emerald-950/80'
                            : 'text-rose-400 bg-rose-950/80'
                        }`}
                      >
                        {selectedItem.critRateBonus > (currentEquippedInSlot?.critRateBonus || 0) ? '+' : ''}
                        {selectedItem.critRateBonus - (currentEquippedInSlot?.critRateBonus || 0)}%
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Stat Row 4: Vàng Rơi */}
            {(selectedItem.goldBonus > 0 ||
              (currentEquippedInSlot && currentEquippedInSlot.goldBonus > 0) ||
              (nextLevelPreview && nextLevelPreview.goldBonus > 0)) && (
              <div className="flex items-center justify-between py-0.5 border-b border-white/5">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Vàng Rơi</span>
                </span>
                <div className="flex items-center gap-2 font-mono font-bold">
                  <span className="text-slate-500">
                    +{isSelectedAlreadyEquipped ? selectedItem.goldBonus : currentEquippedInSlot?.goldBonus || 0}%
                  </span>
                  <span className="text-slate-600">➔</span>
                  <span className="text-yellow-300">
                    +{isSelectedAlreadyEquipped ? nextLevelPreview?.goldBonus || 0 : selectedItem.goldBonus || 0}%
                  </span>
                  {isSelectedAlreadyEquipped ? (
                    (nextLevelPreview?.goldBonus || 0) > selectedItem.goldBonus && (
                      <span className="text-[11px] px-1 rounded text-emerald-400 bg-emerald-950/80">
                        +{(nextLevelPreview?.goldBonus || 0) - selectedItem.goldBonus}%
                      </span>
                    )
                  ) : (
                    selectedItem.goldBonus !== (currentEquippedInSlot?.goldBonus || 0) && (
                      <span
                        className={`text-[11px] px-1 rounded ${
                          selectedItem.goldBonus > (currentEquippedInSlot?.goldBonus || 0)
                            ? 'text-emerald-400 bg-emerald-950/80'
                            : 'text-rose-400 bg-rose-950/80'
                        }`}
                      >
                        {selectedItem.goldBonus > (currentEquippedInSlot?.goldBonus || 0) ? '+' : ''}
                        {selectedItem.goldBonus - (currentEquippedInSlot?.goldBonus || 0)}%
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Total Combat Power Row */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Tổng Điểm Sức Mạnh</span>
              </span>
              <div className="flex items-center gap-2 font-mono font-bold">
                <span className="text-slate-500">
                  {isSelectedAlreadyEquipped ? selectedPower : currentPower}
                </span>
                <span className="text-slate-600">➔</span>
                <span className="text-amber-300">
                  {isSelectedAlreadyEquipped ? nextPower : selectedPower}
                </span>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded font-bold ${
                    powerDiff > 0
                      ? 'text-emerald-300 bg-emerald-950/90 border border-emerald-500/40'
                      : powerDiff < 0
                      ? 'text-rose-300 bg-rose-950/90 border border-rose-500/40'
                      : 'text-slate-400 bg-slate-800'
                  }`}
                >
                  {powerDiff > 0 ? `▲ +${powerDiff}` : powerDiff < 0 ? `▼ ${powerDiff}` : '= 0'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Continuous Upgrade + Bulk Upgrade + Equip + Sell */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>Kho Vàng: <b className="text-amber-300 font-mono">{formatNumber(gold)}</b></span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap ml-auto">
              {/* Upgrade +1 Lv Button (Fast continuous clicks supported!) */}
              <button
                onClick={() => onUpgradeItem(selectedItem, 1)}
                disabled={!upgradeAffordability.can1}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all select-none ${
                  upgradeAffordability.can1
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/30 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
                title="Bấm liên tục để tăng cấp trang bị"
              >
                <ArrowUpCircle className="w-3.5 h-3.5" />
                <span>Nâng Cấp (+1 Lv: 💰 {formatNumber(selectedItem.upgradeCost)})</span>
              </button>

              {/* Upgrade +5 Lv Button */}
              {upgradeAffordability.levels5 > 1 && (
                <button
                  onClick={() => onUpgradeItem(selectedItem, upgradeAffordability.levels5)}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/30 flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-yellow-300" />
                  <span>+{upgradeAffordability.levels5} Lv (💰 {formatNumber(upgradeAffordability.cost5)})</span>
                </button>
              )}

              {/* Upgrade MAX Affordable Button */}
              {upgradeAffordability.levelsMax > 1 && (
                <button
                  onClick={() => onUpgradeItem(selectedItem, -1)}
                  className="px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 shadow-lg shadow-yellow-500/30 flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                  <span>MAX (+{upgradeAffordability.levelsMax} Lv: 💰 {formatNumber(upgradeAffordability.costMax)})</span>
                </button>
              )}

              {/* Equip Button (if in inventory) */}
              {!isSelectedAlreadyEquipped && (
                <button
                  onClick={() => {
                    onEquipItem(selectedItem);
                    setSelectedSlot(selectedItem.slot);
                    setSelectedItemId(selectedItem.id);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer ${
                    isSelectedAnUpgrade
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-300'
                      : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>MẶC NGAY</span>
                </button>
              )}

              {/* Sell Button (if in inventory) */}
              {!isSelectedAlreadyEquipped && (
                <button
                  onClick={() => {
                    onSellItem(selectedItem.id);
                    setSelectedSlot(null);
                    setSelectedItemId(null);
                  }}
                  className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-medium border border-rose-800 flex items-center gap-1 active:scale-95 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Bán (+💰 {formatNumber(selectedItem.sellValue)})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inventory Section (Classic RPG Grid Layout - Icon Only) */}
      <div className="flex flex-col gap-2.5">
        {/* Header & Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-slate-900/60 border border-white/5 p-2.5 rounded-xl">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Rương Đồ Quái Rơi</span>
              <span className="text-slate-400 font-mono text-[11px]">
                ({inventory.length} Món)
              </span>
            </h3>

            {recommendedCount > 0 && (
              <span className="text-[10px] bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1 animate-pulse">
                <span>✨</span>
                <span>{recommendedCount} đề xuất</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Slot Filters */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {(['all', 'weapon', 'armor', 'helmet', 'cloak', 'ring'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterSlot(s)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
                    filterSlot === s
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-800/90 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                >
                  {s === 'all' ? 'Tất cả' : SLOT_ICONS[s]}
                </button>
              ))}
            </div>

            {/* Quick Equip Best All Button */}
            {onEquipBestAll && recommendedCount > 0 && (
              <button
                onClick={onEquipBestAll}
                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-[11px] font-black shrink-0 flex items-center gap-1 active:scale-95 shadow-md shadow-emerald-500/20"
                title="Tự động mặc các trang bị mạnh nhất trong rương cho toàn bộ vị trí"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>Mặc Tốt Nhất</span>
              </button>
            )}
          </div>
        </div>

        {/* Clean Icon-Only Inventory Grid */}
        <div className="bg-slate-950/80 border border-slate-800 p-2.5 sm:p-3 rounded-2xl">
          {inventory.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
              <span className="text-3xl">🎒</span>
              <span>Rương đồ hiện đang trống.</span>
              <span className="text-slate-600 max-w-xs">
                Hãy tiếp tục tiêu diệt quái vật hoặc đánh bại Boss tầng để nhặt vũ khí và giáp quý hiếm!
              </span>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              Không có trang bị nào thuộc danh mục này trong rương.
            </div>
          ) : (
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-2">
              {filteredInventory.map((item) => {
                const rarity = RARITY_CONFIG[item.rarity];
                const isEquipped = equipped[item.slot]?.id === item.id;
                const isSelected = selectedItem?.id === item.id;
                const isUpgrade = !isEquipped && isBetterItem(item, equipped[item.slot]);

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedSlot(isEquipped ? item.slot : null);
                      setSelectedItemId(item.id);
                    }}
                    className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center p-1 border transition-all cursor-pointer select-none active:scale-95 group ${
                      rarity.bg
                    } ${rarity.border} ${
                      isSelected
                        ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950 scale-105 shadow-xl z-10'
                        : isUpgrade
                        ? 'hover:brightness-110 shadow-md shadow-emerald-950/40'
                        : 'hover:brightness-110'
                    }`}
                  >
                    {/* Recommendation Badge (Top-Right): Glows Green */}
                    {isUpgrade && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-lg shadow-emerald-500/50 flex items-center gap-0.5 animate-pulse z-10">
                        ▲
                      </span>
                    )}

                    {/* Currently Equipped Badge (Top-Left): Cyan */}
                    {isEquipped && (
                      <span className="absolute -top-1 -left-1 bg-cyan-500 text-slate-950 text-[8px] font-black px-1 py-0.2 rounded shadow z-10">
                        MẶC
                      </span>
                    )}

                    {/* Slot Type Mini Watermark (Top-Left if not equipped) */}
                    {!isEquipped && (
                      <span className="absolute top-1 left-1.5 text-[10px] opacity-40 select-none pointer-events-none">
                        {SLOT_ICONS[item.slot]}
                      </span>
                    )}

                    {/* Main Centered Icon */}
                    <span className="text-2xl sm:text-3xl select-none group-hover:scale-110 transition-transform filter drop-shadow">
                      {item.icon}
                    </span>

                    {/* Level Pill Badge at Bottom */}
                    <span
                      className="absolute bottom-1 px-1.5 py-0.2 rounded-full bg-black/80 text-[9px] font-mono font-bold tracking-tight border border-white/10"
                      style={{ color: rarity.color }}
                    >
                      Lv.{item.level}
                    </span>
                  </button>
                );
              })}

              {/* Decorative Empty Bag Slots for RPG Feel */}
              {Array.from({
                length: Math.max(0, 15 - filteredInventory.length),
              }).map((_, idx) => (
                <div
                  key={`empty-${idx}`}
                  className="aspect-square rounded-2xl border border-dashed border-slate-800/80 bg-slate-950/30 flex items-center justify-center text-slate-800 select-none"
                >
                  <span className="text-xs opacity-30 font-mono">+</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
};
