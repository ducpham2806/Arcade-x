import React, { useState } from 'react';
import { HeroAlly, AllyEquipmentItem, AllyProfession, AllyEquipSlot } from '../types';
import { PROFESSION_METAS, calculateAllyItemPower } from '../allyEquipmentData';
import { RARITY_CONFIG } from '../equipmentData';
import { formatNumber } from '../utils/upgradeMath';
import {
  Shield,
  Swords,
  Sparkles,
  Check,
  ArrowUpCircle,
  Trash2,
  X,
  TrendingUp,
  Award,
} from 'lucide-react';

interface AllyEquipmentSubTabProps {
  allies: HeroAlly[];
  allyInventory: AllyEquipmentItem[];
  gold: number;
  onEquipAllyItem: (allyId: string, item: AllyEquipmentItem) => void;
  onUpgradeAllyItem: (allyId: string, slot: AllyEquipSlot) => void;
  onSellAllyItem: (itemId: string) => void;
  onEquipBestAllies: () => void;
}

export const AllyEquipmentSubTab: React.FC<AllyEquipmentSubTabProps> = ({
  allies,
  allyInventory,
  gold,
  onEquipAllyItem,
  onUpgradeAllyItem,
  onSellAllyItem,
  onEquipBestAllies,
}) => {
  const [selectedItem, setSelectedItem] = useState<AllyEquipmentItem | null>(null);
  const [filterProfession, setFilterProfession] = useState<AllyProfession | 'all'>('all');

  const filteredInventory =
    filterProfession === 'all'
      ? allyInventory
      : allyInventory.filter((item) => item.profession === filterProfession);

  // Find the matching ally for the selected item
  const matchingAlly = selectedItem
    ? allies.find((a) => a.profession === selectedItem.profession)
    : null;

  const currentEquippedOnAlly =
    selectedItem && matchingAlly
      ? selectedItem.slot === 'ally_weapon'
        ? matchingAlly.equippedWeapon
        : selectedItem.slot === 'ally_armor'
        ? matchingAlly.equippedArmor
        : matchingAlly.equippedAccessory
      : null;

  const isAlreadyEquipped = Boolean(
    selectedItem && currentEquippedOnAlly && currentEquippedOnAlly.id === selectedItem.id
  );

  const selectedPower = calculateAllyItemPower(selectedItem);
  const currentPower = calculateAllyItemPower(currentEquippedOnAlly);
  const powerDiff = selectedPower - currentPower;
  const isAnUpgrade = Boolean(
    selectedItem && !isAlreadyEquipped && (!currentEquippedOnAlly || powerDiff > 0)
  );

  return (
    <div className="flex flex-col gap-3 text-slate-200">
      {/* Header and Auto-Equip Best Button */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-purple-500/40 p-3 rounded-2xl shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="text-2xl p-2 bg-black/40 rounded-xl border border-purple-500/30">
            🛡️
          </div>
          <div>
            <h3 className="text-sm font-black text-purple-300">
              Trang Bị Chuyên Dụng Đồng Đội
            </h3>
            <p className="text-[11px] text-slate-400">
              Mỗi nghề nghiệp yêu cầu 3 slot: Vũ khí, Giáp & Phụ kiện phù hợp.
            </p>
          </div>
        </div>

        <button
          id="btn-auto-equip-allies"
          onClick={onEquipBestAllies}
          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-900/30 flex items-center gap-1.5 active:scale-95 transition-all shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>MẶC TỐT NHẤT</span>
        </button>
      </div>

      {/* Allies Equipment Grid: 6 allies with their 3 slots */}
      <div className="grid grid-cols-1 gap-2.5">
        {allies.map((ally) => {
          const profMeta = PROFESSION_METAS[ally.profession];
          const weapon = ally.equippedWeapon;
          const armor = ally.equippedArmor;
          const accessory = ally.equippedAccessory;
          const weaponRarity = weapon ? RARITY_CONFIG[weapon.rarity] : null;
          const armorRarity = armor ? RARITY_CONFIG[armor.rarity] : null;
          const accessoryRarity = accessory ? RARITY_CONFIG[accessory.rarity] : null;

          const weaponCanUpgrade = weapon && gold >= weapon.upgradeCost;
          const armorCanUpgrade = armor && gold >= armor.upgradeCost;
          const accessoryCanUpgrade = accessory && gold >= accessory.upgradeCost;

          const totalGearDps =
            (weapon?.dpsBonusPercent || 0) +
            (armor?.dpsBonusPercent || 0) +
            (accessory?.dpsBonusPercent || 0);

          return (
            <div
              key={ally.id}
              className={`p-3 rounded-2xl border transition-all ${
                ally.unlocked
                  ? 'bg-slate-900/80 border-purple-500/30 shadow-md'
                  : 'bg-slate-950/60 border-slate-800/80 opacity-60'
              }`}
            >
              {/* Ally Info Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-2xl p-1 bg-black/40 rounded-lg">{ally.avatar}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-white truncate">{ally.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700/50 font-medium">
                        {profMeta.icon} {profMeta.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {ally.unlocked ? `Cấp ${ally.level} • Kỹ năng Lv.${ally.skill?.level || 1}` : 'Chưa chiêu mộ'}
                    </span>
                  </div>
                </div>

                <div className="text-right text-[10px] font-mono text-purple-300">
                  {ally.unlocked && (
                    <span>
                      +{totalGearDps}% DPS từ Trang bị
                    </span>
                  )}
                </div>
              </div>

              {/* 3 Equipment Slots */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                {/* Weapon Slot */}
                <div
                  onClick={() => weapon && setSelectedItem(weapon)}
                  className={`p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    weapon
                      ? 'bg-slate-950/80 hover:bg-slate-900 border-purple-500/40'
                      : 'bg-slate-950/40 border-dashed border-slate-800 text-slate-600'
                  }`}
                  style={{ borderColor: weaponRarity?.color }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl p-1 bg-black/40 rounded">{weapon?.icon || profMeta.weaponIcon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold text-slate-200 truncate">
                        {weapon?.name || profMeta.weaponSlotName}
                      </div>
                      <div className="text-[10px] font-mono text-purple-400 truncate">
                        {weapon ? `+${weapon.dpsBonusPercent}% DPS • +${weapon.skillBonusPercent}% Skill` : 'Trống'}
                      </div>
                    </div>
                  </div>

                  {weapon && ally.unlocked && (
                    <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-slate-800 text-[10px]">
                      <span className="text-slate-400 font-mono">Lv.{weapon.level}</span>
                      <button
                        id={`btn-upg-ally-wpn-${ally.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpgradeAllyItem(ally.id, 'ally_weapon');
                        }}
                        disabled={!weaponCanUpgrade}
                        className={`px-2 py-0.5 rounded font-bold transition-all ${
                          weaponCanUpgrade
                            ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        Cường hóa (💰{formatNumber(weapon.upgradeCost)})
                      </button>
                    </div>
                  )}
                </div>

                {/* Armor Slot */}
                <div
                  onClick={() => armor && setSelectedItem(armor)}
                  className={`p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    armor
                      ? 'bg-slate-950/80 hover:bg-slate-900 border-purple-500/40'
                      : 'bg-slate-950/40 border-dashed border-slate-800 text-slate-600'
                  }`}
                  style={{ borderColor: armorRarity?.color }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl p-1 bg-black/40 rounded">{armor?.icon || profMeta.armorIcon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold text-slate-200 truncate">
                        {armor?.name || profMeta.armorSlotName}
                      </div>
                      <div className="text-[10px] font-mono text-cyan-400 truncate">
                        {armor
                          ? `+${armor.dpsBonusPercent}% DPS • -${armor.cooldownReductionSec}s Hồi`
                          : 'Trống'}
                      </div>
                    </div>
                  </div>

                  {armor && ally.unlocked && (
                    <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-slate-800 text-[10px]">
                      <span className="text-slate-400 font-mono">Lv.{armor.level}</span>
                      <button
                        id={`btn-upg-ally-arm-${ally.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpgradeAllyItem(ally.id, 'ally_armor');
                        }}
                        disabled={!armorCanUpgrade}
                        className={`px-2 py-0.5 rounded font-bold transition-all ${
                          armorCanUpgrade
                            ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        Cường hóa (💰{formatNumber(armor.upgradeCost)})
                      </button>
                    </div>
                  )}
                </div>

                {/* Accessory Slot */}
                <div
                  onClick={() => accessory && setSelectedItem(accessory)}
                  className={`p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    accessory
                      ? 'bg-slate-950/80 hover:bg-slate-900 border-purple-500/40'
                      : 'bg-slate-950/40 border-dashed border-slate-800 text-slate-600'
                  }`}
                  style={{ borderColor: accessoryRarity?.color }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl p-1 bg-black/40 rounded">{accessory?.icon || profMeta.accessoryIcon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold text-slate-200 truncate">
                        {accessory?.name || profMeta.accessorySlotName}
                      </div>
                      <div className="text-[10px] font-mono text-emerald-400 truncate">
                        {accessory
                          ? `+${accessory.dpsBonusPercent}% DPS • +${accessory.teamBuffBonusPercent}% Đội`
                          : 'Trống'}
                      </div>
                    </div>
                  </div>

                  {accessory && ally.unlocked && (
                    <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-slate-800 text-[10px]">
                      <span className="text-slate-400 font-mono">Lv.{accessory.level}</span>
                      <button
                        id={`btn-upg-ally-acc-${ally.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpgradeAllyItem(ally.id, 'ally_accessory');
                        }}
                        disabled={!accessoryCanUpgrade}
                        className={`px-2 py-0.5 rounded font-bold transition-all ${
                          accessoryCanUpgrade
                            ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        Cường hóa (💰{formatNumber(accessory.upgradeCost)})
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Item Modal / Inspector */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-sm p-4 shadow-2xl flex flex-col gap-3 relative"
            style={{
              borderColor: RARITY_CONFIG[selectedItem.rarity].color,
              boxShadow: `0 0 25px ${RARITY_CONFIG[selectedItem.rarity].color}25`,
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-3xl bg-slate-950/80 shadow-inner"
                style={{ borderColor: RARITY_CONFIG[selectedItem.rarity].color }}
              >
                {selectedItem.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className="text-[10px] font-black uppercase px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: `${RARITY_CONFIG[selectedItem.rarity].color}20`,
                      color: RARITY_CONFIG[selectedItem.rarity].color,
                      border: `1px solid ${RARITY_CONFIG[selectedItem.rarity].color}50`,
                    }}
                  >
                    {RARITY_CONFIG[selectedItem.rarity].name}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                    Cấp {selectedItem.level}
                  </span>
                </div>
                <h4 className="font-black text-base text-white truncate mt-1">
                  {selectedItem.name}
                </h4>
                <div className="text-[11px] text-purple-300 flex items-center gap-1 mt-0.5">
                  <span>Chuyên dụng:</span>
                  <span className="font-bold text-amber-300">
                    {PROFESSION_METAS[selectedItem.profession].name}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats List */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between items-center text-purple-300 font-mono">
                <span>⚡ Tăng Sát Thương DPS Đồng Đội:</span>
                <span className="font-bold text-white">+{selectedItem.dpsBonusPercent}%</span>
              </div>
              <div className="flex justify-between items-center text-amber-300 font-mono">
                <span>🔥 Tăng Sát Thương Skill Đồng Đội:</span>
                <span className="font-bold text-white">+{selectedItem.skillBonusPercent}%</span>
              </div>
              {selectedItem.cooldownReductionSec > 0 && (
                <div className="flex justify-between items-center text-cyan-300 font-mono">
                  <span>⏱️ Giảm Hồi Chiêu Tự Động:</span>
                  <span className="font-bold text-white">-{selectedItem.cooldownReductionSec}s</span>
                </div>
              )}
              {selectedItem.teamBuffBonusPercent > 0 && (
                <div className="flex justify-between items-center text-emerald-300 font-mono">
                  <span>✨ Thưởng Toàn Đội:</span>
                  <span className="font-bold text-white">+{selectedItem.teamBuffBonusPercent}%</span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-slate-400 italic bg-slate-950/40 p-2 rounded-lg border border-white/5">
              {selectedItem.description}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              {!isAlreadyEquipped && matchingAlly && (
                <button
                  id="btn-equip-ally-item-modal"
                  onClick={() => {
                    onEquipAllyItem(matchingAlly.id, selectedItem);
                    setSelectedItem(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>MẶC CHO {matchingAlly.name.toUpperCase()}</span>
                </button>
              )}

              {isAlreadyEquipped && (
                <div className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-purple-950/80 text-purple-300 border border-purple-700/50 flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>ĐANG ĐƯỢC TRANG BỊ</span>
                </div>
              )}

              <button
                id="btn-sell-ally-item-modal"
                onClick={() => {
                  onSellAllyItem(selectedItem.id);
                  setSelectedItem(null);
                }}
                disabled={isAlreadyEquipped}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all ${
                  isAlreadyEquipped
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                    : 'bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>Bán (💰{formatNumber(selectedItem.sellValue)})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ally Equipment Inventory Bag */}
      <div className="bg-slate-900/90 border border-slate-700/80 p-3 rounded-2xl shadow-lg flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Swords className="w-3.5 h-3.5 text-purple-400" />
            <span>Kho Đồ Nghề Nghiệp Đồng Đội ({filteredInventory.length})</span>
          </h4>
        </div>

        {/* Profession Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilterProfession('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all border ${
              filterProfession === 'all'
                ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            Tất Cả ({allyInventory.length})
          </button>
          {(['archer', 'mage', 'golem', 'assassin', 'priestess', 'dragon_knight'] as AllyProfession[]).map(
            (prof) => {
              const meta = PROFESSION_METAS[prof];
              const count = allyInventory.filter((i) => i.profession === prof).length;
              const isSelected = filterProfession === prof;
              return (
                <button
                  key={prof}
                  onClick={() => setFilterProfession(prof)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all border flex items-center gap-1 ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <span>{meta.icon}</span>
                  <span>{meta.name}</span>
                  <span className="text-[10px] opacity-70">({count})</span>
                </button>
              );
            }
          )}
        </div>

        {/* Inventory Items Grid */}
        {filteredInventory.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs flex flex-col items-center gap-1">
            <span>Chưa có trang bị phù hợp trong túi.</span>
            <span className="text-[11px] text-slate-400">
              Đánh quái hầm ngục và diệt Boss để rớt trang bị nghề nghiệp cho đồng đội!
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {filteredInventory.map((item) => {
              const rarity = RARITY_CONFIG[item.rarity];
              const ally = allies.find((a) => a.profession === item.profession);
              const equippedSlot =
                item.slot === 'ally_weapon'
                  ? ally?.equippedWeapon
                  : item.slot === 'ally_armor'
                  ? ally?.equippedArmor
                  : ally?.equippedAccessory;
              const isEquipped = equippedSlot?.id === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`aspect-square rounded-2xl border-2 p-1.5 flex flex-col items-center justify-center relative group transition-all active:scale-95 bg-slate-950/80 hover:bg-slate-900 ${
                    isEquipped ? 'ring-2 ring-purple-400' : ''
                  }`}
                  style={{ borderColor: rarity.color }}
                >
                  {isEquipped && (
                    <span className="absolute -top-1 -left-1 bg-purple-500 text-slate-950 text-[8px] font-black px-1 py-0.2 rounded shadow z-10">
                      MẶC
                    </span>
                  )}

                  <span className="text-2xl select-none group-hover:scale-110 transition-transform drop-shadow">
                    {item.icon}
                  </span>

                  <span
                    className="absolute bottom-1 px-1.5 py-0.2 rounded-full bg-black/80 text-[8px] font-mono font-bold tracking-tight border border-white/10"
                    style={{ color: rarity.color }}
                  >
                    Lv.{item.level}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
