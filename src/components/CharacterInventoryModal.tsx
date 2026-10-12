import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useInventory, ChestOpenResult } from '../context/InventoryContext';
import { usePlayer } from '../context/PlayerContext';
import { useGame } from '../context/GameContext';
import { InventoryItem, ItemType, Rarity, EquipmentSlot } from '../types';
import { SHOP_THEMES, ShopTheme } from '../data/shopThemes';
import { soundEngine } from '../services/audio';
import { CloseButton } from './common/CloseButton';
import {
  Package, Sparkles, Coins, Gem, Zap, X, Shield,
  Hammer, Search, Sword, Check, Flame,
  Layers, Plus, ChevronRight, ChevronDown, Award, Info,
  FlaskConical, Wrench, RotateCcw, Wand2, AlertCircle, ArrowRight,
  History, Crown, ShieldCheck, User, Gamepad2, ArrowUpDown,
  ShoppingBag, Cloud, RefreshCw, CheckCircle2,
} from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';
import { getRarityInfo, getRaritySlotBoxStyle, RARITIES, RARITY_ORDER, getRaritySlotStyle, RarityBadge, getItemSlot, SLOT_INFO, isItemRecommended } from '../utils/rarity';
import { getUnlockedTitles, calculateOverallPlayerElo } from '../utils/eloRankSystem';
import { LootBoxOpeningModal } from './LootBoxOpeningModal';
import { EmptyState } from './common/EmptyState';

type FilterCategory = 'all' | 'weapons' | 'skins' | 'consumables' | 'materials' | 'titles';

export const CharacterInventoryModal: React.FC = () => {
  useScrollLock(true);
  const {
    items,
    chestCounts,
    openChest,
    equipItem,
    unequipItem,
    isItemOwned,
    cloudSyncStatus,
    manualSyncInventory,
    lastCloudSyncTime,
  } = useInventory();
  const { profile, spendCoins, updateTitle } = usePlayer();
  const { setActiveModal, reportQuestProgress } = useGame();

  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rarity-desc' | 'rarity-asc' | 'name'>('rarity-desc');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | any | null>(null);
  const [selectedChest, setSelectedChest] = useState<any | null>(null);
  const [hoveredItem, setHoveredItem] = useState<any | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [openingResult, setOpeningResult] = useState<ChestOpenResult | null>(null);

  const [mobileView, setMobileView] = useState<'bag' | 'character'>('bag');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-Equip Best Gear across all eligible slots
  const handleAutoEquipBest = () => {
    soundEngine.play('powerup');
    const targetSlots: EquipmentSlot[] = ['weapon', 'armor', 'helmet', 'ship', 'blade', 'necklace', 'ringLeft', 'ringRight'];
    let equippedCount = 0;

    targetSlots.forEach((slot) => {
      const candidates = ownedItems.filter((item) => getItemSlot(item) === slot);
      if (candidates.length > 0) {
        candidates.sort((a, b) => {
          const tierA = RARITY_ORDER.indexOf(a.rarity as any);
          const tierB = RARITY_ORDER.indexOf(b.rarity as any);
          return tierB - tierA;
        });
        const best = candidates[0];
        if (best && !best.equipped) {
          equipItem(best.id);
          equippedCount++;
        }
      }
    });

    setToastMessage(equippedCount > 0 ? `Đã tự động trang bị ${equippedCount} vật phẩm tối ưu!` : 'Tất cả vị trí đã là trang bị mạnh nhất!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedItem) {
          setSelectedItem(null);
        } else if (openingResult) {
          setOpeningResult(null);
        } else {
          soundEngine.play('click');
          setActiveModal('none');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, openingResult, setActiveModal]);

  // Virtual items representing chests
  const chestTypes = ['common', 'rare', 'epic', 'legendary'] as const;
  const chestVirtualItems = useMemo(() => {
    return chestTypes
      .filter(type => chestCounts[type] > 0)
      .map(type => ({
        id: `chest-${type}`,
        name: `Rương ${type === 'common' ? 'Thường' : type === 'rare' ? 'Hiếm' : type === 'epic' ? 'Sử Thi' : 'Huyền Thoại'}`,
        type: 'crate' as ItemType,
        rarity: type,
        description: 'Chứa Xu vàng, Kim Cương quý giá và tỷ lệ mở khóa trang bị đặc biệt.',
        icon: '📦',
        count: chestCounts[type],
        isChest: true,
        chestType: type,
        equipped: false,
        unlockedAt: Date.now(),
      }));
  }, [chestCounts]);

  const totalChests = useMemo(() => chestVirtualItems.reduce((acc, c) => acc + (c.count || 0), 0), [chestVirtualItems]);

  // Filtered owned real items
  const ownedItems = useMemo(() => items.filter(i => i.count > 0), [items]);

  // Counts for Segmented Control in Inventory
  const counts = useMemo(() => {
    const peakElo = calculateOverallPlayerElo(profile.stats);
    const titlesList = getUnlockedTitles(peakElo);
    const weaponsCount = ownedItems.filter(i => i.type === 'weapon' || i.type === 'avatar' || i.type === 'title').length;
    const skinsCount = SHOP_THEMES.filter(t => isItemOwned(t.id)).length;
    const consumablesCount = chestVirtualItems.length + ownedItems.filter(i => i.type === 'crate' || i.type === 'boost').length;
    const materialsCount = ownedItems.filter(i => i.type === 'material').length;
    const titlesCount = titlesList.length;
    const allCount = chestVirtualItems.length + ownedItems.length + titlesCount;

    return {
      all: allCount,
      weapons: weaponsCount,
      skins: skinsCount,
      consumables: consumablesCount,
      materials: materialsCount,
      titles: titlesCount,
    };
  }, [chestVirtualItems, ownedItems, items, isItemOwned, profile.stats]);

  // Combined grid items based on active segmented filter & search
  const allGridItems = useMemo(() => {
    let list: (InventoryItem | any)[] = [];

    switch (filterCategory) {
      case 'weapons':
        list = ownedItems.filter(i => i.type === 'weapon' || i.type === 'avatar' || i.type === 'title');
        break;
      case 'skins':
        list = SHOP_THEMES.filter(t => isItemOwned(t.id));
        break;
      case 'consumables':
        list = [...chestVirtualItems, ...ownedItems.filter(i => i.type === 'crate' || i.type === 'boost')];
        break;
      case 'materials':
        list = ownedItems.filter(i => i.type === 'material');
        break;
      case 'titles':
        {
          const peak = calculateOverallPlayerElo(profile.stats);
          list = getUnlockedTitles(peak).map(t => ({
            id: t.id,
            name: t.title,
            type: 'title' as ItemType,
            slot: 'title' as EquipmentSlot,
            rarity: t.rarity,
            description: t.description,
            icon: t.badge,
            minElo: t.minElo,
            equipped: profile.equippedTitle === t.title || profile.currentTitle === t.title,
            count: 1,
            unlockedAt: Date.now(),
            isTitleMilestone: true,
          }));
        }
        break;
      case 'all':
      default:
        {
          const peak = calculateOverallPlayerElo(profile.stats);
          const titlesList = getUnlockedTitles(peak).map(t => ({
            id: t.id,
            name: t.title,
            type: 'title' as ItemType,
            slot: 'title' as EquipmentSlot,
            rarity: t.rarity,
            description: t.description,
            icon: t.badge,
            minElo: t.minElo,
            equipped: profile.equippedTitle === t.title || profile.currentTitle === t.title,
            count: 1,
            unlockedAt: Date.now(),
            isTitleMilestone: true,
          }));
          list = [...chestVirtualItems, ...ownedItems, ...titlesList];
        }
        break;
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(i => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }

    const getRarityTier = (rarity: string) => {
      const idx = RARITY_ORDER.indexOf(rarity as any);
      return idx !== -1 ? idx : 0;
    };

    list.sort((a, b) => {
      if (sortBy === 'rarity-desc') {
        return getRarityTier(b.rarity) - getRarityTier(a.rarity);
      }
      if (sortBy === 'rarity-asc') {
        return getRarityTier(a.rarity) - getRarityTier(b.rarity);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return list;
  }, [filterCategory, ownedItems, chestVirtualItems, searchQuery, sortBy]);

  // Equipped items mapping for the 10 slots
  const equippedWeapon = useMemo(() => items.find(i => getItemSlot(i) === 'weapon' && i.equipped), [items]);
  const equippedArmor = useMemo(() => items.find(i => getItemSlot(i) === 'armor' && i.equipped), [items]);
  const equippedHelmet = useMemo(() => items.find(i => getItemSlot(i) === 'helmet' && i.equipped), [items]);
  const equippedShip = useMemo(() => items.find(i => getItemSlot(i) === 'ship' && i.equipped), [items]);
  const equippedBlade = useMemo(() => items.find(i => getItemSlot(i) === 'blade' && i.equipped), [items]);
  const equippedNecklace = useMemo(() => items.find(i => getItemSlot(i) === 'necklace' && i.equipped), [items]);
  const equippedRingLeft = useMemo(() => items.find(i => getItemSlot(i) === 'ringLeft' && i.equipped), [items]);
  const equippedRingRight = useMemo(() => items.find(i => getItemSlot(i) === 'ringRight' && i.equipped), [items]);
  const equippedAvatar = useMemo(() => items.find(i => getItemSlot(i) === 'avatar' && i.equipped), [items]);
  const equippedTitle = useMemo(() => items.find(i => getItemSlot(i) === 'title' && i.equipped), [items]);

  // Calculate combat stats based on equipped items
  const stats = useMemo(() => {
    let baseAtk = 50 + profile.level * 10;
    let baseDef = 30 + profile.level * 6;
    let speedBonus = 0;
    let luckBonus = profile.stats.dailyStreak * 2;

    const allEquipped = items.filter(i => i.equipped);
    allEquipped.forEach(item => {
      if (item.rarity === 'common') { baseAtk += 5; baseDef += 3; }
      else if (item.rarity === 'uncommon') { baseAtk += 12; baseDef += 8; speedBonus += 2; }
      else if (item.rarity === 'rare') { baseAtk += 25; baseDef += 15; speedBonus += 5; luckBonus += 3; }
      else if (item.rarity === 'epic') { baseAtk += 50; baseDef += 30; speedBonus += 10; luckBonus += 5; }
      else if (item.rarity === 'legendary') { baseAtk += 100; baseDef += 60; speedBonus += 18; luckBonus += 10; }
      else if (item.rarity === 'mythic') { baseAtk += 200; baseDef += 120; speedBonus += 30; luckBonus += 20; }
    });

    return {
      atk: baseAtk,
      def: baseDef,
      speed: speedBonus,
      luck: luckBonus,
    };
  }, [items, profile.level, profile.stats.dailyStreak]);

  const handleOpenChest = (chestType: 'common' | 'rare' | 'epic' | 'legendary') => {
    soundEngine.play('chestOpen');
    const result = openChest(chestType);
    if (result) {
      setOpeningResult(result);
      setSelectedChest(null);
      reportQuestProgress('craft_or_open', 1);
    }
  };

  const equippedCounterpart = useMemo(() => {
    if (!selectedItem || (selectedItem as any).isChest) return null;
    const targetSlot = getItemSlot(selectedItem);
    return items.find(i => getItemSlot(i) === targetSlot && i.equipped);
  }, [selectedItem, items]);

  return (
    <div
      onClick={() => {
        soundEngine.play('click');
        setActiveModal('none');
      }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 overflow-hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="arcade-inventory-panel w-full sm:max-w-4xl lg:max-w-5xl bg-[#0e1017] border border-white/15 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-full sm:h-[92vh] sm:max-h-[900px] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-[#141726] via-[#1a1e33] to-[#141726] px-3.5 sm:px-6 py-2.5 sm:py-3 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-lg shrink-0 text-sm sm:text-base" title="Nhân Vật & Hành Trang">
              🛡️
            </div>
            <div className="min-w-0 flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-mono font-black px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                Lv.{profile.level}
              </span>
              <span className="text-xs sm:text-sm font-bold text-white truncate">
                {profile.username}
              </span>
            </div>
          </div>

          {/* Mobile View Switcher (Hidden on Desktop) */}
          <div role="tablist" aria-label="Chế độ hiển thị" className="flex lg:hidden bg-black/50 p-1 rounded-xl border border-white/10 shrink-0 select-none">
            <button
              id="tab-mobile-view-bag"
              type="button"
              role="tab"
              aria-selected={mobileView === 'bag'}
              onClick={() => {
                soundEngine.play('click');
                setMobileView('bag');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer touch-manipulation select-none flex items-center gap-1.5 border ${
                mobileView === 'bag'
                  ? 'bg-indigo-600 text-white border-indigo-400/50 shadow'
                  : 'text-slate-400 hover:text-white border-transparent'
              }`}
            >
              <motion.span
                animate={{ scale: mobileView === 'bag' ? 1.15 : 1 }}
                transition={{ type: 'spring', stiffness: 450, damping: 15 }}
                className="pointer-events-none inline-block text-sm"
              >
                🎒
              </motion.span>
              <span className="pointer-events-none">Túi Đồ</span>
              {totalChests > 0 && (
                <span className="pointer-events-none text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 text-amber-300 font-mono font-bold">
                  {totalChests}
                </span>
              )}
            </button>
            <button
              id="tab-mobile-view-char"
              type="button"
              role="tab"
              aria-selected={mobileView === 'character'}
              onClick={() => {
                soundEngine.play('click');
                setMobileView('character');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer touch-manipulation select-none flex items-center gap-1.5 border ${
                mobileView === 'character'
                  ? 'bg-indigo-600 text-white border-indigo-400/50 shadow'
                  : 'text-slate-400 hover:text-white border-transparent'
              }`}
            >
              <motion.span
                animate={{ scale: mobileView === 'character' ? 1.15 : 1 }}
                transition={{ type: 'spring', stiffness: 450, damping: 15 }}
                className="pointer-events-none inline-block text-sm"
              >
                ⚔️
              </motion.span>
              <span className="pointer-events-none">Nhân Vật</span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Cloud Sync Button */}
            <button
              type="button"
              onClick={() => manualSyncInventory()}
              disabled={cloudSyncStatus === 'syncing'}
              className={`p-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer shadow-sm flex items-center justify-center ${
                cloudSyncStatus === 'syncing'
                  ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                  : cloudSyncStatus === 'error'
                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
              }`}
              title={
                lastCloudSyncTime
                  ? `Đã đồng bộ lên Supabase Cloud lúc ${new Date(lastCloudSyncTime).toLocaleTimeString('vi-VN')}. Bấm để đồng bộ ngay.`
                  : 'Tự động đồng bộ với Supabase'
              }
            >
              {cloudSyncStatus === 'syncing' ? (
                <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
              ) : (
                <Cloud className="w-4 h-4 text-emerald-400" />
              )}
            </button>

            {/* Shop Button */}
            <button
              type="button"
              onClick={() => setActiveModal('shop')}
              className="p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center justify-center"
              title="Mở Cửa Hàng Arcade Skins"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
            </button>
            <CloseButton onClick={() => setActiveModal('none')} />
          </div>
        </div>

        {/* Floating Feedback Toast */}
        {toastMessage && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-4 py-2 rounded-xl shadow-2xl font-bold text-xs flex items-center gap-2 border border-indigo-400 animate-in fade-in slide-in-from-top-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Main Content Area: Responsive 2-Column Split (Desktop) or View Tab (Mobile) */}
        <div className="flex-1 flex flex-col lg:flex-row gap-3.5 p-3 sm:p-5 overflow-y-auto bg-[#090a12] min-h-0">
          
          {/* ========================================================================= */}
          {/* COLUMN 1: CHARACTER LOADOUT, STATS & 10 GEAR SLOTS                        */}
          {/* ========================================================================= */}
          <div className={`bg-[#121522] rounded-2xl border border-white/10 p-3.5 sm:p-4 shadow-xl shrink-0 flex flex-col gap-3 ${
            mobileView === 'character' ? 'flex w-full' : 'hidden lg:flex lg:w-[340px] xl:w-[380px]'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold" title="Trang Bị Đang Mặc">
                  ⚔️
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Trang Bị Đang Mặc</h3>
                  <p className="text-[10px] text-slate-400">10 vị trí cường hóa</p>
                </div>
              </div>

              {/* Quick Auto-Equip Button */}
              <button
                type="button"
                onClick={handleAutoEquipBest}
                className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-md shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
                title="Tự động tìm và mặc những vật phẩm có chỉ số cao nhất trong túi"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Mặc Tốt Nhất</span>
              </button>
            </div>

            {/* Combat Attributes Quick Summary */}
            <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-bold">
              <div className="bg-black/50 p-2 rounded-xl border border-white/5 flex flex-col items-center justify-center" title="Sức Tấn Công (ATK)">
                <div className="flex items-center gap-1 text-[10px] text-rose-400 mb-0.5">
                  <Sword className="w-3 h-3" />
                  <span>ATK</span>
                </div>
                <span className="text-white font-mono font-extrabold">{stats.atk}</span>
              </div>
              <div className="bg-black/50 p-2 rounded-xl border border-white/5 flex flex-col items-center justify-center" title="Phòng Thủ (DEF)">
                <div className="flex items-center gap-1 text-[10px] text-blue-400 mb-0.5">
                  <Shield className="w-3 h-3" />
                  <span>DEF</span>
                </div>
                <span className="text-white font-mono font-extrabold">{stats.def}</span>
              </div>
              <div className="bg-black/50 p-2 rounded-xl border border-white/5 flex flex-col items-center justify-center" title="Tốc Độ (+Speed%)">
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 mb-0.5">
                  <Zap className="w-3 h-3" />
                  <span>SPD</span>
                </div>
                <span className="text-white font-mono font-extrabold">+{stats.speed}%</span>
              </div>
              <div className="bg-black/50 p-2 rounded-xl border border-white/5 flex flex-col items-center justify-center" title="May Mắn (+Luck%)">
                <div className="flex items-center gap-1 text-[10px] text-amber-400 mb-0.5">
                  <Sparkles className="w-3 h-3" />
                  <span>LUCK</span>
                </div>
                <span className="text-white font-mono font-extrabold">+{stats.luck}%</span>
              </div>
            </div>

            {/* 10 Equipment Slots (2 columns of 5 slots) */}
            <div className="grid grid-cols-2 gap-2 flex-1 overflow-y-auto pr-1">
              {[
                { name: 'Vũ Khí', item: equippedWeapon, icon: '⚔️', desc: 'Vũ khí chính' },
                { name: 'Y Phục', item: equippedArmor, icon: '🏃', desc: 'Trang phục & Giáp' },
                { name: 'Mũ/Nón', item: equippedHelmet, icon: '👑', desc: 'Mũ giáp chiến binh' },
                { name: 'Phi Thuyền', item: equippedShip, icon: '🚀', desc: 'Tàu chiến không gian' },
                { name: 'Kiếm Laser', item: equippedBlade, icon: '⚡', desc: 'Vũ khí năng lượng' },
                { name: 'Dây Chuyền', item: equippedNecklace, icon: '📿', desc: 'Dây chuyền ma thuật' },
                { name: 'Nhẫn Trái', item: equippedRingLeft, icon: '💍', desc: 'Nhẫn ngón trái' },
                { name: 'Nhẫn Phải', item: equippedRingRight, icon: '💍', desc: 'Nhẫn ngón phải' },
                { name: 'Avatar', item: equippedAvatar, icon: profile.avatar, desc: 'Ảnh đại diện' },
                { name: 'Danh Hiệu', item: equippedTitle, icon: '🏷️', desc: profile.currentTitle },
              ].map((slot, idx) => {
                const rarityInfo = slot.item ? getRarityInfo(slot.item.rarity) : { hex: '#475569', nameVi: 'Trống' };
                return (
                  <div
                    key={`eq-slot-${idx}`}
                    onClick={() => {
                      if (slot.item) {
                        soundEngine.play('click');
                        setSelectedItem(slot.item);
                      }
                    }}
                    style={{
                      borderColor: slot.item ? rarityInfo.hex : 'rgba(255,255,255,0.08)',
                    }}
                    className={`p-2 rounded-xl bg-black/60 border flex items-center gap-2.5 transition-all group relative ${
                      slot.item
                        ? 'cursor-pointer hover:border-indigo-400 hover:bg-black/90 shadow'
                        : 'border-dashed opacity-70'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-black/50 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                      {slot.item?.icon || slot.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] text-slate-400 font-bold uppercase truncate">{slot.name}</div>
                      <div className="text-xs font-bold text-white truncate" style={{ color: slot.item ? rarityInfo.hex : '#94a3b8' }}>
                        {slot.item?.name || 'Chưa trang bị'}
                      </div>
                    </div>
                    {slot.item && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          soundEngine.play('click');
                          unequipItem(slot.item.id);
                        }}
                        className="w-5 h-5 rounded bg-rose-600/80 hover:bg-rose-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 transition-opacity"
                        title="Tháo trang bị"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* COLUMN 2: BAG, QUICK CHESTS & INVENTORY ITEMS GRID                        */}
          {/* ========================================================================= */}
          <div className={`flex-1 bg-[#121522] rounded-2xl border border-white/10 p-3.5 sm:p-4 shadow-xl flex flex-col gap-3 min-w-0 ${
            mobileView === 'bag' ? 'flex' : 'hidden lg:flex'
          }`}>
            
            {/* Quick Chests Banner (Displays when user has chests to open) */}
            {totalChests > 0 && (
              <div className="bg-gradient-to-r from-amber-950/60 via-amber-900/30 to-[#161426] border border-amber-500/40 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-lg shadow-amber-500/5 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shrink-0 animate-bounce">
                    🎁
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-amber-300">
                      Bạn có {totalChests} Rương Báu đang chờ mở!
                    </h4>
                    <p className="text-[11px] text-amber-200/80">
                      Mở để nhận Vàng, Kim Cương và trang bị hiếm
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto justify-end">
                  {chestVirtualItems.map((chest) => (
                    <button
                      key={`quick-chest-${chest.id}`}
                      type="button"
                      onClick={() => setSelectedChest(chest)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-extrabold text-xs flex items-center gap-1 transition-colors cursor-pointer active:scale-95 touch-manipulation select-none"
                      title={`Mở ${chest.name}`}
                    >
                      <span className="pointer-events-none">{chest.icon}</span>
                      <span className="pointer-events-none">x{chest.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category Segmented Tabs Bar: Fixed 6-column Grid on all devices (No cut-off, No side-scroll jump) */}
            <div className="flex flex-col gap-2 pb-2.5 border-b border-white/10 shrink-0">
              {/* 6-Column Icon-First Grid */}
              <div
                role="tablist"
                aria-label="Phân loại rương đồ"
                className="grid grid-cols-6 gap-1 sm:gap-1.5 bg-[#0a0c16] p-1 sm:p-1.5 rounded-2xl border border-white/10 shadow-inner w-full shrink-0"
              >
                {[
                  {
                    id: 'all' as FilterCategory,
                    label: 'Tất Cả',
                    icon: <Package className="w-4 h-4 pointer-events-none" />,
                    activeStyle: 'bg-indigo-600 text-white border-indigo-400/60 shadow-md shadow-indigo-600/30',
                    iconColor: 'text-indigo-400',
                    count: counts.all,
                  },
                  {
                    id: 'weapons' as FilterCategory,
                    label: 'Trang Bị',
                    icon: <Sword className="w-4 h-4 pointer-events-none" />,
                    activeStyle: 'bg-blue-600 text-white border-blue-400/60 shadow-md shadow-blue-600/30',
                    iconColor: 'text-blue-400',
                    count: counts.weapons,
                  },
                  {
                    id: 'skins' as FilterCategory,
                    label: 'Skins',
                    icon: <ShoppingBag className="w-4 h-4 pointer-events-none" />,
                    activeStyle: 'bg-amber-600 text-white border-amber-400/60 shadow-md shadow-amber-600/30',
                    iconColor: 'text-amber-400',
                    count: counts.skins,
                  },
                  {
                    id: 'consumables' as FilterCategory,
                    label: 'Tiêu Hao',
                    icon: <FlaskConical className="w-4 h-4 pointer-events-none" />,
                    activeStyle: 'bg-emerald-600 text-white border-emerald-400/60 shadow-md shadow-emerald-600/30',
                    iconColor: 'text-emerald-400',
                    count: counts.consumables,
                  },
                  {
                    id: 'materials' as FilterCategory,
                    label: 'Vật Liệu',
                    icon: <Layers className="w-4 h-4 pointer-events-none" />,
                    activeStyle: 'bg-purple-600 text-white border-purple-400/60 shadow-md shadow-purple-600/30',
                    iconColor: 'text-purple-400',
                    count: counts.materials,
                  },
                  {
                    id: 'titles' as FilterCategory,
                    label: 'Danh Hiệu',
                    icon: <Award className="w-4 h-4 pointer-events-none" />,
                    activeStyle: 'bg-rose-600 text-white border-rose-400/60 shadow-md shadow-rose-600/30',
                    iconColor: 'text-rose-400',
                    count: counts.titles,
                  },
                ].map((cat) => {
                  const isActive = filterCategory === cat.id;
                  return (
                    <button
                      key={`inv-cat-${cat.id}`}
                      id={`inv-cat-tab-${cat.id}`}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      title={`${cat.label} (${cat.count})`}
                      onClick={() => {
                        soundEngine.play('click');
                        setFilterCategory(cat.id);
                      }}
                      className={`min-h-[46px] sm:min-h-[48px] flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-1 sm:px-2 py-1 sm:py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border select-none touch-manipulation relative ${
                        isActive
                          ? cat.activeStyle
                          : 'bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08] border-transparent'
                      }`}
                    >
                      <motion.div
                        animate={{
                          scale: isActive ? 1.15 : 1,
                        }}
                        transition={{ type: 'spring', stiffness: 450, damping: 15 }}
                        className="relative flex items-center justify-center pointer-events-none"
                      >
                        <span className={isActive ? 'text-white' : cat.iconColor}>
                          {cat.icon}
                        </span>
                        {/* Mobile Micro Count Badge on Icon */}
                        <span
                          className={`sm:hidden absolute -top-1.5 -right-2.5 text-[8px] font-mono font-black px-1 py-0 rounded-full border leading-tight ${
                            isActive
                              ? 'bg-black/60 text-white border-white/30'
                              : 'bg-[#151726] text-slate-300 border-white/10'
                          }`}
                        >
                          {cat.count}
                        </span>
                      </motion.div>
                      <span className="pointer-events-none text-[9px] sm:text-xs font-bold truncate max-w-full leading-tight">
                        {cat.label}
                      </span>
                      {/* Desktop Pill Count Badge */}
                      <span
                        className={`hidden sm:inline-block pointer-events-none text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold border ${
                          isActive
                            ? 'bg-black/40 text-white border-white/20'
                            : 'bg-black/30 text-slate-400 border-white/5'
                        }`}
                      >
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Secondary Sub-toolbar: Search Input & Item Counter & Sort Button */}
              <div className="flex items-center justify-between gap-2">
                {/* Search Input */}
                <div className="relative flex-1 max-w-[200px] sm:max-w-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm trong rương..."
                    className="w-full bg-[#0a0c16] border border-white/10 focus:border-indigo-500 rounded-xl pl-8 pr-6 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs px-0.5 touch-manipulation cursor-pointer"
                      title="Xóa tìm kiếm"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Counter & Sort Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0a0c16] border border-white/10 rounded-xl text-[11px] text-slate-300 font-mono">
                    <Package className="w-3.5 h-3.5 text-indigo-400 pointer-events-none" />
                    <span className="pointer-events-none font-bold">{allGridItems.length} món</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.play('click');
                      if (sortBy === 'rarity-desc') setSortBy('rarity-asc');
                      else if (sortBy === 'rarity-asc') setSortBy('name');
                      else setSortBy('rarity-desc');
                    }}
                    className="bg-[#0a0c16] border border-white/10 hover:border-indigo-500 px-2.5 py-1.5 rounded-xl text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow touch-manipulation select-none"
                    title={`Sắp xếp: ${sortBy === 'rarity-desc' ? 'Phẩm chất (Cao đến thấp)' : sortBy === 'rarity-asc' ? 'Phẩm chất (Thấp đến cao)' : 'Tên (A-Z)'}`}
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400 pointer-events-none" />
                    <span className="hidden sm:inline pointer-events-none text-xs font-bold text-slate-300">
                      {sortBy === 'rarity-desc' ? 'Phẩm chất ↓' : sortBy === 'rarity-asc' ? 'Phẩm chất ↑' : 'Tên A-Z'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Inventory Items Grid */}
            <div className="flex-1 overflow-y-auto min-h-[260px] pr-1">
              {allGridItems.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                  {allGridItems.map((item: any) => {
                    const isChestItem = item.isChest;
                    const isSkinTheme = filterCategory === 'skins' || item.previewType;
                    const isSkinEquipped = isSkinTheme ? items.some(i => i.id === item.id && i.equipped) : item.equipped;
                    const recommended = !isChestItem && !isSkinTheme && isItemRecommended(item, items);
                    return (
                      <div
                        key={`inv-item-${item.id}`}
                        onClick={() => {
                          soundEngine.play('click');
                          if (isChestItem) {
                            setSelectedChest(item);
                          } else {
                            setSelectedItem(item);
                          }
                        }}
                        style={getRaritySlotBoxStyle(item.rarity, false, isSkinEquipped)}
                        className={`p-2 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer group relative ${getRaritySlotStyle(item.rarity, false, isSkinEquipped)} ${isSkinEquipped ? 'border-indigo-400' : ''}`}
                      >
                        {isSkinEquipped && (
                          <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md z-20" title="Đang sử dụng">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                        {!isSkinEquipped && recommended && (
                          <div className="absolute top-1 left-1 z-20 bg-emerald-500 text-slate-950 font-black text-[8px] px-1.5 py-0.5 rounded-full shadow-lg animate-pulse flex items-center gap-0.5" title="Đề xuất trang bị mạnh hơn hoặc slot trống!">
                            <span>💡 Đề Xuất</span>
                          </div>
                        )}
                        {item.gameTitle && (
                          <div className="absolute top-1 right-1 z-20 bg-indigo-500/20 text-indigo-300 text-[7px] font-black px-1 py-0.2 rounded font-mono truncate max-w-[55px]">
                            {item.gameTitle}
                          </div>
                        )}
                        {!isChestItem && !isSkinTheme && (
                          <div className="absolute top-1 right-1 z-20 bg-black/80 text-white text-[8px] font-black px-1 py-0.2 rounded font-mono">
                            x{item.count}
                          </div>
                        )}
                        {isChestItem && (
                          <div className="absolute top-1 right-1 z-20 bg-amber-500/20 text-amber-300 text-[8px] font-black px-1 py-0.2 rounded font-mono">
                            x{item.count}
                          </div>
                        )}

                        <div className="text-3xl my-1 group-hover:scale-110 transition-transform">
                          {item.icon}
                        </div>

                        <span className="text-[11px] font-bold text-white truncate w-full mt-0.5">
                          {item.name}
                        </span>

                        {isChestItem && (
                          <button
                            type="button"
                            className="mt-1.5 w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[10px] py-1 rounded shadow transition-all flex items-center justify-center gap-1"
                            title="Mở Rương Vật Phẩm"
                          >
                            <span>Mở Rương</span>
                          </button>
                        )}

                        {isSkinTheme && !isSkinEquipped && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              soundEngine.play('powerup');
                              equipItem(item.id);
                            }}
                            className="mt-1.5 w-full bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-[10px] py-1 rounded shadow transition-all cursor-pointer flex items-center justify-center gap-1"
                            title="Trang bị giao diện này"
                          >
                            <span>Dùng Skin</span>
                          </button>
                        )}

                        {item.isTitleMilestone && !item.equipped && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              soundEngine.play('powerup');
                              updateTitle(item.name);
                            }}
                            className="mt-1.5 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] py-1 rounded shadow transition-all cursor-pointer flex items-center justify-center gap-1"
                            title="Sử dụng danh hiệu này"
                          >
                            <span>Đeo Danh Hiệu</span>
                          </button>
                        )}
                        {item.isTitleMilestone && item.equipped && (
                          <span
                            className="mt-1.5 w-full bg-indigo-600/50 text-indigo-200 font-extrabold text-[10px] py-1 rounded flex items-center justify-center"
                            title="Đang Sử Dụng Danh Hiệu"
                          >
                            <Check className="w-3 h-3 text-emerald-300 mr-1" /> Đang Dùng
                          </span>
                        )}

                        {!isChestItem && !isSkinTheme && recommended && !item.equipped && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              soundEngine.play('powerup');
                              equipItem(item.id);
                            }}
                            className="mt-1.5 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] py-1 rounded shadow transition-all cursor-pointer flex items-center justify-center gap-1"
                            title="Mặc ngay"
                          >
                            <span>Mặc Ngay</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center py-4">
                  {searchQuery ? (
                    <EmptyState
                      id="empty-inventory-search"
                      icon={<Search className="w-8 h-8 text-indigo-400" />}
                      badge="TÌM KIẾM"
                      badgeColor="text-indigo-300 border-indigo-500/30 bg-indigo-500/15"
                      title="Không Tìm Thấy Vật Phẩm"
                      description={`Không có vật phẩm nào khớp với từ khóa "${searchQuery}". Hãy thử tìm kiếm với tên khác hoặc xóa từ khóa.`}
                      primaryAction={{
                        label: 'Xóa Tìm Kiếm',
                        onClick: () => setSearchQuery(''),
                        icon: <RotateCcw className="w-3.5 h-3.5" />,
                        variant: 'indigo',
                      }}
                      secondaryAction={{
                        label: 'Xem Tất Cả',
                        onClick: () => {
                          setSearchQuery('');
                          setFilterCategory('all');
                        },
                      }}
                    />
                  ) : filterCategory === 'weapons' ? (
                    <EmptyState
                      id="empty-inventory-weapons"
                      icon={<Sword className="w-8 h-8 text-blue-400" />}
                      badge="KHO TRANG BỊ"
                      badgeColor="text-blue-300 border-blue-500/30 bg-blue-500/15"
                      title="Chưa Có Trang Bị Vũ Khí"
                      description="Túi trang bị chiến đấu của bạn hiện đang trống. Hãy mở Rương Báu hoặc Dung Hợp trang bị tại Lò Rèn Ma Thuật!"
                      tip="Mẹo: Đạt điểm số cao hoặc chuỗi thắng trong trò chơi để nhận miễn phí rương Sử Thi & Huyền Thoại."
                      primaryAction={{
                        label: 'Đến Lò Rèn Ma Thuật',
                        onClick: () => setActiveModal('crafting'),
                        icon: <Hammer className="w-3.5 h-3.5" />,
                        variant: 'purple',
                      }}
                      secondaryAction={{
                        label: 'Xem Tất Cả Vật Phẩm',
                        onClick: () => setFilterCategory('all'),
                      }}
                    />
                  ) : filterCategory === 'skins' ? (
                    <EmptyState
                      id="empty-inventory-skins"
                      icon={<ShoppingBag className="w-8 h-8 text-amber-400" />}
                      badge="BỘ SƯU TẬP SKINS"
                      badgeColor="text-amber-300 border-amber-500/30 bg-amber-500/15"
                      title="Chưa Mở Khóa Skin Nào"
                      description="Khám phá các trang phục và hiệu ứng độc quyền trong Cửa Hàng Arcade hoặc quay thưởng mỗi ngày!"
                      tip="Mẹo: Đổi Arcade Coins tích lũy qua từng trận đấu để mở khóa bộ skin chủ đề yêu thích."
                      primaryAction={{
                        label: 'Ghé Cửa Hàng Arcade',
                        onClick: () => setActiveModal('shop'),
                        icon: <ShoppingBag className="w-3.5 h-3.5" />,
                        variant: 'amber',
                      }}
                      secondaryAction={{
                        label: 'Xem Tất Cả Vật Phẩm',
                        onClick: () => setFilterCategory('all'),
                      }}
                    />
                  ) : filterCategory === 'consumables' ? (
                    <EmptyState
                      id="empty-inventory-consumables"
                      icon={<FlaskConical className="w-8 h-8 text-emerald-400" />}
                      badge="DƯỢC PHẨM & BÙA CHÚ"
                      badgeColor="text-emerald-300 border-emerald-500/30 bg-emerald-500/15"
                      title="Túi Dược Phẩm Trống"
                      description="Thuốc tăng EXP, hồi sinh và bình thể lực có thể nhận qua Sổ Nhiệm Vụ Hàng Ngày hoặc đổi tại Cửa Hàng."
                      tip="Mẹo: Đăng nhập đều đặn 7 ngày liên tiếp để nhận Gói Dược Phẩm Thần Thánh miễn phí."
                      primaryAction={{
                        label: 'Xem Sổ Nhiệm Vụ',
                        onClick: () => setActiveModal('quests'),
                        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
                        variant: 'emerald',
                      }}
                      secondaryAction={{
                        label: 'Xem Tất Cả Vật Phẩm',
                        onClick: () => setFilterCategory('all'),
                      }}
                    />
                  ) : filterCategory === 'materials' ? (
                    <EmptyState
                      id="empty-inventory-materials"
                      icon={<Layers className="w-8 h-8 text-purple-400" />}
                      badge="NGUYÊN LIỆU LUYỆN KIM"
                      badgeColor="text-purple-300 border-purple-500/30 bg-purple-500/15"
                      title="Chưa Có Đá & Vật Liệu Rèn"
                      description="Đá cường hóa, phôi kim loại và cuộn bảo hộ dùng để dung hợp nâng cấp trang bị tại Lò Rèn."
                      tip="Mẹo: Mở rương đồng và bạc để thu thập đá nguyên liệu cơ bản dồi dào nhất."
                      primaryAction={{
                        label: 'Đến Lò Rèn Ma Thuật',
                        onClick: () => setActiveModal('crafting'),
                        icon: <Hammer className="w-3.5 h-3.5" />,
                        variant: 'purple',
                      }}
                      secondaryAction={{
                        label: 'Xem Tất Cả Vật Phẩm',
                        onClick: () => setFilterCategory('all'),
                      }}
                    />
                  ) : filterCategory === 'titles' ? (
                    <EmptyState
                      id="empty-inventory-titles"
                      icon={<Award className="w-8 h-8 text-rose-400" />}
                      badge="DANH HIỆU CAO QUÝ"
                      badgeColor="text-rose-300 border-rose-500/30 bg-rose-500/15"
                      title="Chưa Mở Khóa Danh Hiệu"
                      description="Hoàn thành các chiến tích arcade phi thường để mở khóa danh hiệu hiển thị vinh danh trên hồ sơ của bạn!"
                      tip="Mẹo: Thắng 5 trận liên tiếp hoặc leo Top Bảng Xếp Hạng tuần để nhận danh hiệu Độc Bản."
                      primaryAction={{
                        label: 'Xem Bảng Thành Tựu',
                        onClick: () => setActiveModal('achievements'),
                        icon: <Crown className="w-3.5 h-3.5" />,
                        variant: 'amber',
                      }}
                      secondaryAction={{
                        label: 'Xem Tất Cả Vật Phẩm',
                        onClick: () => setFilterCategory('all'),
                      }}
                    />
                  ) : (
                    <EmptyState
                      id="empty-inventory-all"
                      icon={<Package className="w-8 h-8 text-indigo-400" />}
                      badge="KHO ĐỒ TÂN THỦ"
                      badgeColor="text-indigo-300 border-indigo-500/30 bg-indigo-500/15"
                      title="Kho Đồ Đang Trống"
                      description="Hãy bắt đầu chơi các tựa game arcade vui nhộn để kiếm Rương Kho Báu và tích lũy trang bị đầu tiên!"
                      tip="Mẹo: Mỗi trận đấu đều đem lại điểm kinh nghiệm, Vàng và cơ hội nhận Rương Báu ngẫu nhiên."
                      primaryAction={{
                        label: 'Khám Phá Trò Chơi Ngay',
                        onClick: () => setActiveModal('none'),
                        icon: <Gamepad2 className="w-3.5 h-3.5" />,
                        variant: 'indigo',
                      }}
                      secondaryAction={{
                        label: 'Nhận Quà Điểm Danh',
                        onClick: () => setActiveModal('dailyReward'),
                        icon: <Sparkles className="w-3.5 h-3.5" />,
                      }}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Bottom Currency & Quick Action Bar */}
            <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-1.5 bg-[#0e1017] px-2.5 sm:px-3 py-1.5 rounded-xl border border-amber-500/30 text-amber-400 font-mono font-bold" title="Arcade Coins">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>{profile.coins.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#0e1017] px-2.5 sm:px-3 py-1.5 rounded-xl border border-cyan-500/30 text-cyan-400 font-mono font-bold" title="Kim Cương">
                  <Gem className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{profile.gems.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('crafting')}
                  className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 font-bold transition-all cursor-pointer flex items-center justify-center text-xs gap-1.5"
                  title="Đến Lò Rèn Ma Thuật"
                >
                  <Hammer className="w-3.5 h-3.5 text-purple-400" />
                  <span className="hidden sm:inline">Lò Rèn</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* ITEM INSPECT MODAL (Popup when clicking an item)                          */}
      {/* ========================================================================= */}
      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#141726] border border-white/20 rounded-3xl p-5 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#090a12] border border-white/20 flex items-center justify-center text-3xl shadow-inner">
                  {selectedItem.icon}
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-white">{selectedItem.name}</h4>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <RarityBadge rarity={selectedItem.rarity} />
                    <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30 uppercase font-mono">
                      Slot: {SLOT_INFO[getItemSlot(selectedItem)]?.name || 'Trang Bị'}
                    </span>
                  </div>
                </div>
              </div>
              <CloseButton onClick={() => setSelectedItem(null)} />
            </div>

            <p className="text-xs text-slate-300 bg-black/40 p-3 rounded-xl border border-white/5 mb-4 leading-relaxed">
              {selectedItem.description}
            </p>

            {selectedItem.bonusDescription && (
              <div className="mb-4 text-xs text-indigo-300 font-medium bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/30 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>{selectedItem.bonusDescription}</span>
              </div>
            )}

            {!(selectedItem as any).isChest && selectedItem.type && !['material', 'consumable', 'boost', 'crate'].includes(selectedItem.type) && (() => {
              const selRarityInfo = getRarityInfo(selectedItem.rarity);
              const eqRarityInfo = equippedCounterpart ? getRarityInfo(equippedCounterpart.rarity) : null;
              const selTier = selRarityInfo.tier;
              const eqTier = eqRarityInfo ? eqRarityInfo.tier : 0;
              const tierDiff = selTier - eqTier;
              const selBonus = selectedItem.bonusValue || 0;
              const eqBonus = equippedCounterpart ? (equippedCounterpart.bonusValue || 0) : 0;
              const bonusDiff = selBonus - eqBonus;

              return (
                <div className="bg-[#0b0c16] rounded-2xl p-3 border border-white/10 mb-4 shadow-inner">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>So Sánh (Đang Xem vs Đang Dùng)</span>
                    {equippedCounterpart ? (
                      <span className="text-indigo-300 font-bold truncate max-w-[140px]">{equippedCounterpart.name}</span>
                    ) : (
                      <span className="text-amber-400 font-bold">Slot Trống (Chưa có)</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-black/40 p-2 rounded-xl border border-white/5 text-center">
                      <div className="text-[9px] text-slate-400 uppercase">Phẩm Cấp</div>
                      <div className="font-bold text-white mt-0.5" style={{ color: selRarityInfo.hex }}>
                        {selRarityInfo.nameVi}
                      </div>
                      {equippedCounterpart && (
                        <div className={`text-[10px] font-mono mt-1 font-bold ${tierDiff > 0 ? 'text-emerald-400' : tierDiff < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                          {tierDiff > 0 ? `+${tierDiff} Cấp ⬆` : tierDiff < 0 ? `${tierDiff} Cấp ⬇` : '= Ngang cấp'}
                        </div>
                      )}
                    </div>
                    <div className="bg-black/40 p-2 rounded-xl border border-white/5 text-center">
                      <div className="text-[9px] text-slate-400 uppercase">Hiệu Suất / Chỉ Số</div>
                      <div className="font-bold text-white mt-0.5">
                        {selBonus ? `+${(selBonus * 100).toFixed(0)}%` : 'Chuẩn'}
                      </div>
                      {equippedCounterpart && (
                        <div className={`text-[10px] font-mono mt-1 font-bold ${bonusDiff > 0 ? 'text-emerald-400' : bonusDiff < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                          {bonusDiff > 0 ? `+${(bonusDiff * 100).toFixed(0)}% ⬆` : bonusDiff < 0 ? `${(bonusDiff * 100).toFixed(0)}% ⬇` : '= Cân bằng'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              {selectedItem.type && !['material', 'consumable', 'boost', 'crate'].includes(selectedItem.type) && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.play('powerup');
                    if (selectedItem.isTitleMilestone || selectedItem.type === 'title') {
                      updateTitle(selectedItem.name);
                    } else if (selectedItem.equipped) {
                      unequipItem(selectedItem.id);
                    } else {
                      equipItem(selectedItem.id);
                    }
                    setSelectedItem(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-lg ${
                    selectedItem.equipped
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                  }`}
                >
                  {selectedItem.equipped ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Tháo Trang Bị</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Mặc / Trang Bị</span>
                    </>
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHEST DETAIL POPUP (LOCKED SIZE)                                          */}
      {/* ========================================================================= */}
      {selectedChest && !openingResult && (
        <div
          onClick={() => setSelectedChest(null)}
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md h-[460px] bg-[#141726] border border-amber-500/40 rounded-3xl p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400" />
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xl">📦</span>
                <h3 className="text-sm font-extrabold text-white uppercase">{selectedChest.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedChest(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center my-auto">
              <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-4xl mb-3 shadow-lg animate-pulse">
                {selectedChest.icon}
              </div>
              <div className="text-sm font-bold text-amber-300 mb-1">
                Số lượng hiện có: <span className="font-mono text-white text-base font-extrabold">x{chestCounts[selectedChest.chestType] || 0}</span>
              </div>
              <p className="text-xs text-slate-300 px-4 mt-1">
                {selectedChest.description}
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-white/10">
              <button
                type="button"
                disabled={(chestCounts[selectedChest.chestType] || 0) <= 0}
                onClick={() => handleOpenChest(selectedChest.chestType)}
                className={`w-full py-3 rounded-xl font-extrabold text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                  (chestCounts[selectedChest.chestType] || 0) > 0
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>🎁 Mở Rương ({chestCounts[selectedChest.chestType] || 0})</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedChest(null)}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* IMMERSIVE ANIMATED LOOT BOX OPENING OVERLAY                                */}
      {/* ========================================================================= */}
      {openingResult && (
        <LootBoxOpeningModal
          chestType={openingResult.chestType}
          result={openingResult}
          remainingChestsCount={chestCounts[openingResult.chestType] || 0}
          onOpenNext={() => handleOpenChest(openingResult.chestType)}
          onClose={() => {
            setOpeningResult(null);
            setSelectedChest(null);
          }}
        />
      )}
    </div>
  );
};
