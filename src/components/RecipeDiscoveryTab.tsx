import React, { useState, useMemo } from 'react';
import { InventoryItem, LegendaryBlueprint, Rarity } from '../types';
import { useInventory, RecipeDiscoveryResult } from '../context/InventoryContext';
import { usePlayer } from '../context/PlayerContext';
import { DEFAULT_LEGENDARY_BLUEPRINTS } from '../services/storage';
import { soundEngine } from '../services/audio';
import { motion, AnimatePresence } from 'motion/react';
import {
  FlaskConical,
  Sparkles,
  Crown,
  Coins,
  Gem,
  Plus,
  X,
  Layers,
  Dices,
  CheckCircle2,
  Lock,
  ArrowRight,
  History,
  AlertTriangle,
  Flame,
  Zap,
  Search,
} from 'lucide-react';
import { getRarityInfo, getRaritySlotBoxStyle } from '../utils/rarity';

interface RecipeDiscoveryTabProps {
  onNavigateToLog: () => void;
}

export const RecipeDiscoveryTab: React.FC<RecipeDiscoveryTabProps> = ({ onNavigateToLog }) => {
  const {
    items,
    forgeMastery,
    discoveredBlueprintIds,
    discoverRecipe,
  } = useInventory();
  const { profile, spendCoins } = usePlayer();

  // 3 Discovery Crucible Slots
  const [discoverySlots, setDiscoverySlots] = useState<(InventoryItem | null)[]>([null, null, null]);
  const [activeSlotIdx, setActiveSlotIdx] = useState<number>(0);
  const [isDiscoveringAnim, setIsDiscoveringAnim] = useState<boolean>(false);
  const [discoveryResult, setDiscoveryResult] = useState<RecipeDiscoveryResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedBlueprint, setSelectedBlueprint] = useState<LegendaryBlueprint | null>(null);
  const [searchBlueprint, setSearchBlueprint] = useState<string>('');
  const [blueprintFilter, setBlueprintFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  // Filtered blueprints list (100 total)
  const filteredBlueprints = useMemo(() => {
    return DEFAULT_LEGENDARY_BLUEPRINTS.filter(bp => {
      const isUnlocked = discoveredBlueprintIds.includes(bp.id);
      if (blueprintFilter === 'unlocked' && !isUnlocked) return false;
      if (blueprintFilter === 'locked' && isUnlocked) return false;
      if (searchBlueprint.trim()) {
        const q = searchBlueprint.toLowerCase();
        const matchName = bp.name.toLowerCase().includes(q);
        const matchDesc = bp.description.toLowerCase().includes(q);
        const matchItem = bp.craftedItemPreview.name.toLowerCase().includes(q);
        const matchType = bp.craftedItemPreview.type.toLowerCase().includes(q);
        const matchStat = bp.craftedItemPreview.statPreview.toLowerCase().includes(q);
        return matchName || matchDesc || matchItem || matchType || matchStat;
      }
      return true;
    });
  }, [discoveredBlueprintIds, blueprintFilter, searchBlueprint]);

  // Eligible low-tier items from inventory: Common, Uncommon, Rare
  const availableLowTierItems = useMemo(() => {
    return items
      .filter(
        item =>
          item.count > 0 &&
          (item.rarity === 'common' || item.rarity === 'uncommon' || item.rarity === 'rare')
      )
      .map(item => {
        const usedCount = discoverySlots.reduce((acc, slot, idx) => {
          if (idx !== activeSlotIdx && slot?.id === item.id) return acc + 1;
          return acc;
        }, 0);
        return {
          ...item,
          availableCount: Math.max(0, item.count - usedCount),
        };
      })
      .filter(item => item.availableCount > 0);
  }, [items, discoverySlots, activeSlotIdx]);

  // Total low-tier items pool in inventory
  const totalLowTierCount = useMemo(() => {
    return items
      .filter(
        item =>
          item.count > 0 &&
          (item.rarity === 'common' || item.rarity === 'uncommon' || item.rarity === 'rare')
      )
      .reduce((acc, i) => acc + i.count, 0);
  }, [items]);

  // Filled slots count
  const filledSlots = discoverySlots.filter(s => s !== null) as InventoryItem[];
  const isEligibleToDiscover = filledSlots.length >= 2;
  const DISCOVERY_FEE = 200;
  const hasEnoughCoins = profile.coins >= DISCOVERY_FEE;

  // Chance Calculation
  const chanceBreakdown = useMemo(() => {
    if (filledSlots.length < 2) {
      return { base: 25, uncommonBonus: 0, rareBonus: 0, masteryBonus: 0, total: 0 };
    }
    const base = 25;
    let uncommonBonus = 0;
    let rareBonus = 0;
    filledSlots.forEach(item => {
      if (item.rarity === 'uncommon') uncommonBonus += 10;
      if (item.rarity === 'rare') rareBonus += 20;
    });
    const masteryBonus = (forgeMastery.level || 1) * 3;
    const total = Math.min(85, base + uncommonBonus + rareBonus + masteryBonus);
    return { base, uncommonBonus, rareBonus, masteryBonus, total };
  }, [filledSlots, forgeMastery.level]);

  // Auto-fill random low tier items from inventory
  const handleAutoFillRandom = () => {
    soundEngine.play('click');
    setErrorMessage(null);

    // Expand items into a flat pool
    const pool: InventoryItem[] = [];
    items.forEach(item => {
      if (
        item.count > 0 &&
        (item.rarity === 'common' || item.rarity === 'uncommon' || item.rarity === 'rare')
      ) {
        for (let c = 0; c < item.count; c++) {
          pool.push(item);
        }
      }
    });

    if (pool.length < 2) {
      setErrorMessage('Cần ít nhất 2 vật phẩm phẩm cấp Thường/Hiếm/Quý trong rương để thử nghiệm!');
      return;
    }

    // Shuffle and pick 3 random items
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    setDiscoverySlots([selected[0] || null, selected[1] || null, selected[2] || null]);
  };

  const handleSelectCandidateItem = (item: InventoryItem) => {
    soundEngine.play('click');
    setErrorMessage(null);

    const newSlots = [...discoverySlots];
    newSlots[activeSlotIdx] = item;
    setDiscoverySlots(newSlots);

    // Advance to next empty slot
    const nextEmpty = newSlots.findIndex((s, i) => i > activeSlotIdx && s === null);
    if (nextEmpty !== -1) {
      setActiveSlotIdx(nextEmpty);
    } else {
      const anyEmpty = newSlots.findIndex(s => s === null);
      if (anyEmpty !== -1) {
        setActiveSlotIdx(anyEmpty);
      }
    }
  };

  const handleRemoveSlotItem = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.play('click');
    const newSlots = [...discoverySlots];
    newSlots[idx] = null;
    setDiscoverySlots(newSlots);
    setActiveSlotIdx(idx);
  };

  const handleExecuteDiscovery = async () => {
    if (!isEligibleToDiscover) {
      setErrorMessage('Cần đặt ít nhất 2 vật phẩm bậc thấp vào bình luyện kim!');
      return;
    }
    if (!hasEnoughCoins) {
      setErrorMessage(`Không đủ Xu! Cần 🪙 ${DISCOVERY_FEE} Xu để tiến hành thử nghiệm.`);
      return;
    }

    const ingredientIds = filledSlots.map(i => i.id);

    // Deduct fee and start animation
    const spentSuccess = spendCoins(DISCOVERY_FEE);
    if (!spentSuccess) return;

    soundEngine.play('craft');
    setIsDiscoveringAnim(true);
    setErrorMessage(null);

    // Animation vortex duration
    setTimeout(() => {
      const res = discoverRecipe(ingredientIds);
      setIsDiscoveringAnim(false);
      setDiscoverySlots([null, null, null]);
      setActiveSlotIdx(0);
      if (res) {
        setDiscoveryResult(res);
      }
    }, 1600);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 bg-[#090a14]">
      {/* LEFT / TOP: DISCOVERY CRUCIBLE & LOW-TIER SHELF */}
      <div className="flex-1 flex flex-col overflow-y-auto p-3 sm:p-5 scrollbar-thin border-b lg:border-b-0 lg:border-r border-white/10">
        
        {/* Crucible Card */}
        <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#161828] via-[#0f101c] to-[#0a0b12] border-2 border-purple-500/40 p-4 sm:p-5 shadow-2xl relative overflow-hidden mb-4">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-purple-500 to-amber-400" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                  Bình Luyện Kim Khám Phá Công Thức
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Dung hợp 2-3 vật phẩm bậc thấp (Thường / Hiếm / Quý) để có cơ hội mở khóa Bản Thiết Kế Huyền Thoại.
              </p>
            </div>

            {/* Auto-fill Button */}
            <button
              id="btn-discovery-auto-fill"
              type="button"
              onClick={handleAutoFillRandom}
              className="px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 active:scale-95 text-purple-200 text-xs font-bold border border-purple-500/40 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Tự động bốc ngẫu nhiên vật phẩm bậc thấp từ rương"
            >
              <Dices className="w-3.5 h-3.5 text-purple-400" />
              <span>Tự Động Nạp Đồ</span>
            </button>
          </div>

          {/* CRUCIBLE SLOTS / ALCHEMY VORTEX */}
          <div className="my-3 py-4 px-2 rounded-2xl bg-[#06070d]/80 border border-white/5 relative min-h-[140px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {!isDiscoveringAnim ? (
                <div className="grid grid-cols-3 gap-3 sm:gap-6 w-full max-w-md mx-auto">
                  {[0, 1, 2].map(slotIdx => {
                    const item = discoverySlots[slotIdx];
                    const isFocused = activeSlotIdx === slotIdx;
                    return (
                      <div
                        key={`discovery-slot-${slotIdx}`}
                        onClick={() => {
                          soundEngine.play('click');
                          setActiveSlotIdx(slotIdx);
                        }}
                        className={`relative rounded-2xl border-2 p-2 sm:p-3 flex flex-col items-center justify-center transition-all cursor-pointer aspect-square ${
                          item
                            ? 'bg-purple-950/30 border-purple-400/80 shadow-lg shadow-purple-500/20'
                            : isFocused
                              ? 'border-purple-400 bg-purple-500/10 ring-2 ring-purple-400/40'
                              : 'border-dashed border-white/15 bg-white/5 hover:border-white/30'
                        }`}
                      >
                        {item ? (
                          <>
                            <span className="text-3xl sm:text-4xl drop-shadow-md">{item.icon}</span>
                            <span className="text-[10px] font-bold text-white truncate max-w-[80px] mt-1">
                              {item.name}
                            </span>
                            <span className="text-[9px] text-purple-300 uppercase font-mono mt-0.5">
                              {item.rarity}
                            </span>
                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={e => handleRemoveSlotItem(slotIdx, e)}
                              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110"
                              title="Gỡ vật phẩm"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <div className="text-center p-1">
                            <div
                              className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center mb-1 ${
                                isFocused ? 'bg-purple-500/30 text-purple-300' : 'bg-white/5 text-slate-500'
                              }`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </div>
                            <span
                              className={`text-[9px] font-bold uppercase ${
                                isFocused ? 'text-purple-300 font-black' : 'text-slate-500'
                              }`}
                            >
                              Ô {slotIdx + 1}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Alchemy Spinning Vortex Animation */
                <div className="relative h-28 w-full flex items-center justify-center">
                  {[0, 1, 2].map(idx => {
                    const slot = discoverySlots[idx];
                    if (!slot) return null;
                    const angle = idx * (360 / 3) * (Math.PI / 180);
                    const radius = 50;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    return (
                      <motion.div
                        key={`disc-spin-${idx}`}
                        initial={{ x, y, scale: 1, opacity: 1 }}
                        animate={{
                          x: 0,
                          y: 0,
                          scale: [1, 1.4, 0],
                          opacity: [1, 1, 0],
                          rotate: [0, 240, 480],
                        }}
                        transition={{ duration: 1.5, ease: 'easeInOut' }}
                        className="absolute w-14 h-14 rounded-2xl border-2 border-purple-400 bg-purple-950 flex items-center justify-center text-3xl shadow-xl shadow-purple-500/50"
                      >
                        {slot.icon}
                      </motion.div>
                    );
                  })}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 2.5, 5], opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, delay: 0.7, ease: 'easeOut' }}
                    className="absolute w-28 h-28 rounded-full bg-gradient-to-r from-amber-400 via-purple-500 to-pink-500 blur-2xl mix-blend-screen"
                  />
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* CHANCE METER & BREAKDOWN */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 mb-3">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Tỷ Lệ Khám Phá Thành Công:
              </span>
              <span
                className={`font-mono text-sm ${
                  chanceBreakdown.total > 0 ? 'text-amber-400 font-black' : 'text-slate-500'
                }`}
              >
                {chanceBreakdown.total}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-amber-400 to-yellow-400 transition-all duration-300"
                style={{ width: `${chanceBreakdown.total}%` }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[9.5px] text-slate-400">
              <span className="bg-white/5 px-2 py-0.5 rounded">Cơ bản: +25%</span>
              <span className="bg-white/5 px-2 py-0.5 rounded text-cyan-300">
                Hiếm (Uncommon): +{chanceBreakdown.uncommonBonus}%
              </span>
              <span className="bg-white/5 px-2 py-0.5 rounded text-blue-300">
                Quý (Rare): +{chanceBreakdown.rareBonus}%
              </span>
              <span className="bg-white/5 px-2 py-0.5 rounded text-purple-300">
                Lò rèn Lv.{forgeMastery.level}: +{chanceBreakdown.masteryBonus}%
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-3 p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ACTION BUTTON */}
          <button
            id="btn-execute-recipe-discovery"
            type="button"
            disabled={!isEligibleToDiscover || isDiscoveringAnim || !hasEnoughCoins}
            onClick={handleExecuteDiscovery}
            className={`w-full py-3.5 rounded-2xl font-black uppercase text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
              !isEligibleToDiscover
                ? 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed'
                : !hasEnoughCoins
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 via-purple-600 to-amber-500 hover:from-amber-400 hover:to-purple-500 text-white shadow-[0_0_25px_rgba(245,158,11,0.4)] active:scale-95'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {isDiscoveringAnim
                ? 'Đang Khám Phá Công Thức...'
                : !isEligibleToDiscover
                  ? `Cần Chọn Ít Nhất 2 Đồ Bậc Thấp (Đã Chọn ${filledSlots.length}/3)`
                  : !hasEnoughCoins
                    ? `Không Đủ Xu (Cần 🪙 ${DISCOVERY_FEE} Xu - Có 🪙 ${profile.coins.toLocaleString()} Xu)`
                    : `Khai Hỏa Bình Luyện Kim (Phí: 🪙 ${DISCOVERY_FEE} Xu)`}
            </span>
          </button>
        </div>

        {/* MATERIAL SHELF FOR THE ACTIVE SLOT */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Vật Phẩm Bậc Thấp Khả Dụng (Ô {activeSlotIdx + 1})
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                {availableLowTierItems.length} món ({totalLowTierCount} tổng)
              </span>
            </div>
          </div>

          {availableLowTierItems.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 pb-4">
              {availableLowTierItems.map(item => {
                const rInfo = getRarityInfo(item.rarity);
                return (
                  <div
                    key={`disc-pick-${item.id}`}
                    onClick={() => handleSelectCandidateItem(item)}
                    style={getRaritySlotBoxStyle(item.rarity, false, false)}
                    className="p-2.5 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer hover:scale-105 active:scale-95 relative group"
                  >
                    <div className="absolute top-1 right-1 bg-black/90 border border-white/20 text-white text-[9px] font-black px-1.5 py-0.2 rounded-md">
                      x{item.availableCount}
                    </div>
                    <span className="text-2xl sm:text-3xl mb-1 mt-1 drop-shadow-md">{item.icon}</span>
                    <span className="text-[10px] font-bold text-white truncate w-full">{item.name}</span>
                    <span style={{ color: rInfo.hex }} className="text-[9px] font-bold mt-0.5">
                      {rInfo.nameVi}
                    </span>
                    <span className="text-[8px] text-purple-300 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      + Chọn Vào Ô {activeSlotIdx + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-6 rounded-2xl bg-[#111220] border border-white/5 text-slate-400">
              <FlaskConical className="w-8 h-8 mx-auto text-slate-600 mb-1" />
              <p className="text-xs font-bold text-slate-300">Không còn vật phẩm bậc thấp khả dụng</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Chơi các mini-game hoặc mở rương đồng để nhận thêm nguyên liệu Thường, Hiếm và Quý.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: LEGENDARY BLUEPRINTS SHOWCASE & GALLERY */}
      <div className="w-full lg:w-96 p-3 sm:p-5 flex flex-col bg-[#07080f] overflow-y-auto scrollbar-thin shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
              Bản Thiết Kế Huyền Thoại
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-lg">
            {discoveredBlueprintIds.length}/{DEFAULT_LEGENDARY_BLUEPRINTS.length} Đã Mở
          </span>
        </div>

        <p className="text-[11px] text-slate-400 mb-2.5 leading-relaxed">
          100 bản thiết kế thất truyền rèn đúc trang bị tối thượng trong vũ trụ ArcadeX.
        </p>

        {/* Blueprint Search & Filter Bar */}
        <div className="flex flex-col gap-2 mb-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchBlueprint}
              onChange={(e) => setSearchBlueprint(e.target.value)}
              placeholder="Tìm kiếm trong 100 bản thiết kế..."
              className="w-full pl-8 pr-7 py-1.5 bg-[#0b0c16] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
            />
            {searchBlueprint && (
              <button
                type="button"
                onClick={() => setSearchBlueprint('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setBlueprintFilter('all')}
              className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                blueprintFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              Tất cả ({DEFAULT_LEGENDARY_BLUEPRINTS.length})
            </button>
            <button
              type="button"
              onClick={() => setBlueprintFilter('unlocked')}
              className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                blueprintFilter === 'unlocked'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              Đã mở ({discoveredBlueprintIds.length})
            </button>
            <button
              type="button"
              onClick={() => setBlueprintFilter('locked')}
              className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                blueprintFilter === 'locked'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              Chưa mở ({DEFAULT_LEGENDARY_BLUEPRINTS.length - discoveredBlueprintIds.length})
            </button>
          </div>
        </div>

        {/* Blueprint List (Scrollable) */}
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 mb-3 scrollbar-thin">
          {filteredBlueprints.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 bg-[#0c0d18]/50 rounded-2xl border border-white/5">
              Không tìm thấy bản thiết kế phù hợp
            </div>
          ) : (
            filteredBlueprints.map(bp => {
              const isUnlocked = discoveredBlueprintIds.includes(bp.id);
              return (
                <div
                  key={bp.id}
                  onClick={() => setSelectedBlueprint(bp)}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    isUnlocked
                      ? 'bg-gradient-to-r from-amber-950/40 via-[#181510] to-[#0f0e0c] border-amber-400/60 hover:border-amber-300 shadow-md shadow-amber-500/10'
                      : 'bg-[#0e0e16]/60 border-white/10 hover:border-white/20 opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xl shrink-0 ${
                        isUnlocked
                          ? 'border-amber-400/80 bg-amber-500/20 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                          : 'border-white/10 bg-white/5 text-slate-500'
                      }`}
                    >
                      {isUnlocked ? bp.icon : <Lock className="w-4 h-4 text-slate-500" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-bold truncate ${
                            isUnlocked ? 'text-amber-200' : 'text-slate-300'
                          }`}
                        >
                          {bp.name}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {bp.craftedItemPreview.statPreview}
                      </div>

                      <div className="mt-1 flex items-center gap-1.5 text-[9px]">
                        {isUnlocked ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Đã Khai Phá
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium">Chưa Mở Khóa • Cần Thử Nghiệm</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* View Log Button */}
        <button
          id="btn-goto-discovery-log"
          type="button"
          onClick={onNavigateToLog}
          className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
        >
          <History className="w-4 h-4 text-purple-400" />
          <span>Xem Lịch Sử Nhật Ký Thử Nghiệm</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1 text-slate-500" />
        </button>
      </div>

      {/* DISCOVERY RESULT CELEBRATION MODAL */}
      <AnimatePresence>
        {discoveryResult && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`max-w-md w-full rounded-3xl p-6 text-center border-2 shadow-2xl relative overflow-hidden ${
                discoveryResult.success
                  ? 'bg-gradient-to-b from-[#20180a] via-[#140e06] to-[#0a0703] border-amber-400 shadow-amber-500/30'
                  : 'bg-gradient-to-b from-[#181024] via-[#0f0918] to-[#07040c] border-purple-400/60 shadow-purple-500/20'
              }`}
            >
              {/* Header Icon */}
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-5xl mb-3 shadow-xl">
                {discoveryResult.success ? (discoveryResult.blueprint?.icon || '🌟') : '🧪'}
              </div>

              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 border ${
                  discoveryResult.success
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                }`}
              >
                {discoveryResult.success ? (
                  <>
                    <Crown className="w-3.5 h-3.5" />
                    <span>MỞ KHÓA BẢN THIẾT KẾ HUYỀN THOẠI</span>
                  </>
                ) : (
                  <>
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>HỢP THÀNH TINH HOA GIẢ KIM</span>
                  </>
                )}
              </div>

              <h3 className="text-xl font-black text-white mb-2">
                {discoveryResult.success
                  ? discoveryResult.blueprint?.name
                  : 'Tinh Hoa Luyện Kim Huyền Bí'}
              </h3>

              <p className="text-xs text-slate-300 mb-4 leading-relaxed max-w-sm mx-auto">
                {discoveryResult.message}
              </p>

              {/* Rewards */}
              <div className="p-3 rounded-2xl bg-black/60 border border-white/10 grid grid-cols-3 gap-2 mb-5">
                <div className="text-center">
                  <div className="text-amber-400 font-mono font-bold text-sm">+{discoveryResult.coinsEarned}</div>
                  <div className="text-[9.5px] text-slate-400">Xu Vàng</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-400 font-mono font-bold text-sm">+{discoveryResult.gemsEarned}</div>
                  <div className="text-[9.5px] text-slate-400">Kim Cương</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-400 font-mono font-bold text-sm">+{discoveryResult.expEarned}</div>
                  <div className="text-[9.5px] text-slate-400">EXP</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDiscoveryResult(null)}
                className={`w-full py-3 rounded-xl font-bold uppercase text-xs tracking-wider transition-all cursor-pointer ${
                  discoveryResult.success
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/30'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30'
                }`}
              >
                Tiếp Tục
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BLUEPRINT DETAIL INSPECTOR POPUP */}
      <AnimatePresence>
        {selectedBlueprint && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
            onClick={() => setSelectedBlueprint(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="max-w-md w-full bg-[#121422] border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setSelectedBlueprint(null)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-4xl text-center mb-3">{selectedBlueprint.icon}</div>

              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/40 mb-1">
                  👑 Bản Thiết Kế Huyền Thoại
                </div>
                <h3 className="text-lg font-black text-white">{selectedBlueprint.name}</h3>
                <p className="text-xs text-slate-300 mt-1">{selectedBlueprint.description}</p>
              </div>

              <div className="p-3 rounded-2xl bg-black/50 border border-white/10 mb-4 text-xs">
                <div className="font-bold text-amber-300 mb-1">Cổ thư ghi chép:</div>
                <p className="text-slate-400 italic text-[11px] leading-relaxed">{selectedBlueprint.lore}</p>
                <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Hiệu ứng thành phẩm:</span>
                  <span className="text-amber-400 font-bold">{selectedBlueprint.craftedItemPreview.statPreview}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBlueprint(null)}
                className="w-full py-2.5 rounded-xl bg-amber-500 text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer hover:bg-amber-400"
              >
                Đã Rõ
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
