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
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-7xl bg-[#0e1017] border border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[94vh] sm:h-[740px] sm:max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
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
          <div className="flex items-center gap-2 shrink-0">
            {/* Cloud Sync Button (Icon Only) */}
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
                  ? `Đã đồng bộ lên Firebase Cloud lúc ${new Date(lastCloudSyncTime).toLocaleTimeString('vi-VN')}. Bấm để đồng bộ ngay.`
                  : 'Tự động đồng bộ với Firebase Firestore'
              }
            >
              {cloudSyncStatus === 'syncing' ? (
                <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
              ) : (
                <Cloud className="w-4 h-4 text-emerald-400" />
              )}
            </button>

            {/* Shop Button (Icon Only) */}
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

        {/* Main Content Area: Persistent Top Equipment Section & Bottom Inventory List */}
        <div className="flex-1 flex flex-col gap-3 p-3 sm:p-5 overflow-y-auto bg-[#090a12]">
          
          {/* ========================================================================= */}
          {/* PERSISTENT TOP SECTION: ACTIVE GEAR (10 SLOTS) & CHARACTER STATS         */}
          {/* ========================================================================= */}
          <div className="bg-[#121522] rounded-2xl border border-white/10 p-3.5 sm:p-4 shadow-xl shrink-0 flex flex-col gap-3">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold" title="Trang Bị Đang Mặc (Active Gear)">
                  ⚔️
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-black/40 text-indigo-300 border border-indigo-500/30">
                    {profile.username} • Lv.{profile.level}
                  </span>
                </div>
              </div>

              {/* Combat Attributes Quick Summary (Icon Only) */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold w-full md:w-auto">
                <div className="bg-black/50 px-3 py-1.5 rounded-lg border border-white/5 flex items-center justify-center gap-1.5" title="Sức Tấn Công (ATK)">
                  <Sword className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="text-white font-mono">{stats.atk}</span>
                </div>
                <div className="bg-black/50 px-3 py-1.5 rounded-lg border border-white/5 flex items-center justify-center gap-1.5" title="Phòng Thủ (DEF)">
                  <Shield className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="text-white font-mono">{stats.def}</span>
                </div>
                <div className="bg-black/50 px-3 py-1.5 rounded-lg border border-white/5 flex items-center justify-center gap-1.5" title="Tốc Độ (+Speed%)">
                  <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-white font-mono">+{stats.speed}%</span>
                </div>
                <div className="bg-black/50 px-3 py-1.5 rounded-lg border border-white/5 flex items-center justify-center gap-1.5" title="May Mắn (+Luck%)">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-white font-mono">+{stats.luck}%</span>
                </div>
              </div>
            </div>

            {/* 10 Equipment Slots Horizontal / Grid Bar (Icon Focus, Tooltips) */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {[
                { name: 'Vũ Khí', item: equippedWeapon, icon: '⚔️', desc: 'Vũ khí chính' },
                { name: 'Y Phục', item: equippedArmor, icon: '🏃', desc: 'Trang phục & Giáp' },
                { name: 'Mũ/Nón', item: equippedHelmet, icon: '👑', desc: 'Mũ giáp chiến binh' },
                { name: 'Tàu Không Gian', item: equippedShip, icon: '🚀', desc: 'Phi thuyền chiến đấu' },
                { name: 'Kiếm Laser', item: equippedBlade, icon: '⚡', desc: 'Vũ khí năng lượng' },
                { name: 'Dây Chuyền', item: equippedNecklace, icon: '📿', desc: 'Dây chuyền & Bùa' },
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
                      borderColor: slot.item ? rarityInfo.hex : 'rgba(255,255,255,0.1)',
                    }}
                    className={`aspect-square rounded-xl bg-black/75 border-2 flex flex-col items-center justify-center p-1 relative transition-all group ${slot.item ? 'cursor-pointer hover:scale-105 hover:border-indigo-400 shadow-md' : 'opacity-60'}`}
                    title={`${slot.name}: ${slot.item?.name || slot.desc}`}
                  >
                    <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">
                      {slot.item?.icon || slot.icon}
                    </span>
                    {slot.item && (
                      <>
                        <span
                          className="absolute top-1 right-1 w-2 h-2 rounded-full shadow"
                          style={{ background: rarityInfo.hex }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            soundEngine.play('click');
                            unequipItem(slot.item.id);
                          }}
                          className="absolute bottom-1 left-1 right-1 bg-red-600/90 hover:bg-red-500 text-white font-black text-[9px] py-0.5 rounded shadow transition-all cursor-pointer flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 z-20"
                          title="Tháo nhanh"
                        >
                          <span>✕</span>
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* BOTTOM SECTION: INVENTORY LIST / OWNED ITEMS (HÀNH TRANG SỞ HỮU)          */}
          {/* ========================================================================= */}
          <div className="flex-1 bg-[#121522] rounded-2xl border border-white/10 p-4 flex flex-col gap-3 shadow-xl">
            {/* Top Toolbar: Categories & Sort & Slot Counter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              {/* Category Tabs: Grid layout, NO horizontal scroll */}
              <div className="grid grid-cols-6 gap-1 bg-[#0e1017] p-1 rounded-xl border border-white/10 w-full sm:w-auto">
                {[
                  { id: 'all' as FilterCategory, label: 'Tất Cả', icon: <Package className="w-4 h-4" />, count: counts.all },
                  { id: 'weapons' as FilterCategory, label: 'Trang Bị', icon: <Sword className="w-4 h-4 text-indigo-400" />, count: counts.weapons },
                  { id: 'skins' as FilterCategory, label: 'Skins', icon: <ShoppingBag className="w-4 h-4 text-amber-400" />, count: counts.skins },
                  { id: 'consumables' as FilterCategory, label: 'Tiêu Hao', icon: <FlaskConical className="w-4 h-4 text-amber-400" />, count: counts.consumables },
                  { id: 'materials' as FilterCategory, label: 'Vật Liệu', icon: <Layers className="w-4 h-4 text-purple-400" />, count: counts.materials },
                  { id: 'titles' as FilterCategory, label: 'Danh Hiệu', icon: <Award className="w-4 h-4 text-emerald-400" />, count: counts.titles },
                ].map(cat => (
                  <button
                    key={`inv-cat-${cat.id}`}
                    type="button"
                    title={`${cat.label} (${cat.count})`}
                    onClick={() => {
                      soundEngine.play('click');
                      setFilterCategory(cat.id);
                    }}
                    className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      filterCategory === cat.id
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                        : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-white/5'
                    }`}
                  >
                    {cat.icon}
                    <span className="text-[10px] px-1 py-0.2 rounded-full bg-black/40 text-slate-300 font-mono font-bold">
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Slot Counter & Icon Sort */}
              <div className="flex items-center gap-2 justify-end">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0e1017] border border-white/10 rounded-xl text-[11px] text-slate-300 font-mono">
                  <Package className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{chestVirtualItems.length + ownedItems.length}/100</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.play('click');
                    if (sortBy === 'rarity-desc') setSortBy('rarity-asc');
                    else if (sortBy === 'rarity-asc') setSortBy('name');
                    else setSortBy('rarity-desc');
                  }}
                  className="bg-[#0e1017] border border-white/10 hover:border-indigo-500 p-2 rounded-xl text-white transition-all cursor-pointer flex items-center justify-center shadow"
                  title={`Sắp xếp: ${sortBy === 'rarity-desc' ? 'Phẩm chất (Cao đến thấp)' : sortBy === 'rarity-asc' ? 'Phẩm chất (Thấp đến cao)' : 'Tên (A-Z)'}`}
                >
                  <ArrowUpDown className="w-4 h-4 text-indigo-400" />
                </button>
              </div>
            </div>

            {/* Inventory Items Grid */}
            <div className="flex-1 overflow-y-auto min-h-[260px] max-h-[420px] pr-1">
              {allGridItems.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
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
                        className={`p-1.5 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer group relative ${getRaritySlotStyle(item.rarity, false, isSkinEquipped)} ${isSkinEquipped ? 'border-indigo-400' : ''}`}
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

                        <div className="text-2xl my-0.5 group-hover:scale-110 transition-transform">
                          {item.icon}
                        </div>

                        <span className="text-[10px] font-bold text-white truncate w-full mt-0.5">
                          {item.name}
                        </span>

                        {isChestItem && (
                          <button
                            type="button"
                            className="mt-1 w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs py-0.5 rounded shadow transition-all flex items-center justify-center"
                            title="Mở Rương Vật Phẩm"
                          >
                            🎁
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
                            className="mt-1 w-full bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs py-0.5 rounded shadow transition-all cursor-pointer flex items-center justify-center"
                            title="Trang bị giao diện này"
                          >
                            🎨
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
                            className="mt-1 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-0.5 rounded shadow transition-all cursor-pointer flex items-center justify-center"
                            title="Sử dụng danh hiệu này"
                          >
                            👑
                          </button>
                        )}
                        {item.isTitleMilestone && item.equipped && (
                          <span
                            className="mt-1 w-full bg-indigo-600/50 text-indigo-200 font-extrabold text-xs py-0.5 rounded flex items-center justify-center mt-auto"
                            title="Đang Sử Dụng Danh Hiệu"
                          >
                            <Check className="w-3 h-3 text-emerald-300" />
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
                            className="mt-1 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-0.5 rounded shadow transition-all cursor-pointer flex items-center justify-center"
                            title="Mặc ngay"
                          >
                            ⚔️
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-12 rounded-2xl bg-[#0e1017] border border-white/5 text-slate-400 my-auto flex flex-col items-center justify-center h-full">
                  <Package className="w-10 h-10 text-slate-600 mb-2 animate-pulse" />
                  <p className="text-xs text-slate-500 max-w-xs">
                    Hành trang trống
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Currency & Quick Action Bar */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
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
                  className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 font-bold transition-all cursor-pointer flex items-center justify-center text-xs"
                  title="Đến Lò Rèn Thần Khí"
                >
                  <Hammer className="w-4 h-4 text-purple-400" />
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
