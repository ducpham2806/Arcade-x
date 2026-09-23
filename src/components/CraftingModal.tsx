import confetti from 'canvas-confetti';
import React, { useState, useMemo, useEffect } from 'react';
import { useInventory, ChestOpenResult } from '../context/InventoryContext';
import { usePlayer } from '../context/PlayerContext';
import { useGame } from '../context/GameContext';
import { Rarity, ItemType, InventoryItem, CraftResult } from '../types';
import { soundEngine } from '../services/audio';
import { motion, AnimatePresence } from 'motion/react';
import { CloseButton } from './common/CloseButton';
import {
  Package, Sparkles, Coins, Gem, Zap, X, Shield,
  Hammer, Search, Sword, Check, Flame,
  Layers, Plus, ChevronRight, ChevronDown, Award, Info,
  FlaskConical, Wrench, RotateCcw, Wand2, AlertCircle, ArrowRight,
  History, Crown, ShieldCheck, ShoppingBag
, Gamepad2 } from 'lucide-react';
import { getRarityInfo, getRaritySlotBoxStyle, RARITIES, RARITY_ORDER, getRaritySlotStyle, RarityBadge } from '../utils/rarity';
import { RecipeDiscoveryTab } from './RecipeDiscoveryTab';
import { DiscoveryLogTab } from './DiscoveryLogTab';
import { EmptyState } from './common/EmptyState';

type InventoryTab = 'forge' | 'discovery' | 'log';
type FilterCategory = 'all' | 'weapons' | 'consumables' | 'materials';

export const CraftingModal: React.FC<{ initialTab?: InventoryTab }> = ({ initialTab = 'forge' }) => {
  const { items, chestCounts, forgeMastery, openChest, equipItem, unequipItem, craftItems } = useInventory();
  const { profile, spendCoins } = usePlayer();
  const { setActiveModal, reportQuestProgress } = useGame();
  
  const [activeTab, setActiveTab] = useState<InventoryTab>(initialTab || 'forge');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [inventoryViewMode, setInventoryViewMode] = useState<'grid' | 'slots'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rarity-desc' | 'rarity-asc' | 'name'>('rarity-desc');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | any | null>(null);
  const [hoveredItem, setHoveredItem] = useState<any | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHeroMobileExpanded, setIsHeroMobileExpanded] = useState(false);

  const equippedCounterpart = useMemo(() => {
    if (!selectedItem || (selectedItem as any).isChest) return null;
    if (selectedItem.type === 'weapon') {
      return items.find(i => i.type === 'weapon' && i.equipped);
    }
    if (selectedItem.type === 'skin') {
      return items.find(i => i.gameId === selectedItem.gameId && i.type === 'skin' && i.equipped);
    }
    if (selectedItem.type === 'avatar') {
      return items.find(i => i.type === 'avatar' && i.equipped);
    }
    if (selectedItem.type === 'title') {
      return items.find(i => i.type === 'title' && i.equipped);
    }
    return null;
  }, [selectedItem, items]);
  
  // Chest opening result
  const [openingResult, setOpeningResult] = useState<ChestOpenResult | null>(null);

  // =========================================================================
  // FORGE STATE & LOGIC
  // =========================================================================
  const [craftingSlots, setCraftingSlots] = useState<(InventoryItem | null)[]>([null, null, null]);
  const [auxSlot, setAuxSlot] = useState<InventoryItem | null>(null);
  const [activeForgeSlot, setActiveForgeSlot] = useState<number | 'aux'>(0);
  const [forgeRarityFilter, setForgeRarityFilter] = useState<Rarity | 'all'>('all');
  const [isCraftingAnim, setIsCraftingAnim] = useState(false);
  const [craftedResult, setCraftedResult] = useState<CraftResult | null>(null);
  const [forgeErrorNotice, setForgeErrorNotice] = useState<string | null>(null);
  const [showTierCostGuide, setShowTierCostGuide] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedItem) {
          setSelectedItem(null);
        } else if (openingResult) {
          setOpeningResult(null);
        } else if (craftedResult) {
          setCraftedResult(null);
        } else {
          soundEngine.play('click');
          setActiveModal('none');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, openingResult, craftedResult, setActiveModal]);

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

  const totalChests = chestCounts.common + chestCounts.rare + chestCounts.epic + chestCounts.legendary;

  // Filtered owned real items
  const ownedItems = useMemo(() => items.filter(i => i.count > 0), [items]);

  // Counts for Segmented Control in Inventory
  const counts = useMemo(() => {
    const weaponsCount = ownedItems.filter(i => i.type === 'weapon' || i.type === 'skin' || i.type === 'avatar' || i.type === 'title').length;
    const consumablesCount = chestVirtualItems.length + ownedItems.filter(i => i.type === 'crate' || i.type === 'boost').length;
    const materialsCount = ownedItems.filter(i => i.type === 'material').length;
    const allCount = chestVirtualItems.length + ownedItems.length;

    return {
      all: allCount,
      weapons: weaponsCount,
      consumables: consumablesCount,
      materials: materialsCount,
    };
  }, [chestVirtualItems, ownedItems]);

  // Combined grid items based on active segmented filter & search
  const allGridItems = useMemo(() => {
    let list: (InventoryItem | any)[] = [];

    switch (filterCategory) {
      case 'weapons':
        list = ownedItems.filter(i => i.type === 'weapon' || i.type === 'skin' || i.type === 'avatar' || i.type === 'title');
        break;
      case 'consumables':
        list = [...chestVirtualItems, ...ownedItems.filter(i => i.type === 'crate' || i.type === 'boost')];
        break;
      case 'materials':
        list = ownedItems.filter(i => i.type === 'material');
        break;
      case 'all':
      default:
        list = [...chestVirtualItems, ...ownedItems];
        break;
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(item => 
        item.name.toLowerCase().includes(q) || 
        (item.description && item.description.toLowerCase().includes(q))
      );
    }

    return list;
  }, [chestVirtualItems, ownedItems, filterCategory, searchQuery]);

  // Target grid slots: at least 24 slots (4x6 or 6x4)
  const TOTAL_SLOTS = Math.max(24, Math.ceil(Math.max(1, allGridItems.length) / 6) * 6);
  const gridSlots = useMemo(() => {
    const slots = [...allGridItems];
    while (slots.length < TOTAL_SLOTS) {
      slots.push(null as any);
    }
    return slots;
  }, [allGridItems, TOTAL_SLOTS]);

  // Calculate equipped items
  const equippedWeapon = ownedItems.find(i => i.type === 'weapon' && i.equipped);
  const equippedSkinRunner = ownedItems.find(i => i.gameId === 'neon-runner' && i.equipped);
  const equippedSkinShip = ownedItems.find(i => i.gameId === 'cosmic-defense' && i.equipped);
  const equippedSkinBlade = ownedItems.find(i => i.gameId === 'cyber-slice' && i.equipped);
  const equippedAvatar = ownedItems.find(i => i.type === 'avatar' && i.equipped);
  const equippedTitle = ownedItems.find(i => i.type === 'title' && i.equipped);

  // RPG stats calculation
  const stats = useMemo(() => {
    const baseAtk = 200 + profile.level * 25;
    const weaponAtk = equippedWeapon ? (equippedWeapon.rarity === 'legendary' ? 350 : equippedWeapon.rarity === 'epic' ? 220 : 100) : 50;
    const baseDef = 150 + profile.level * 18;
    const skinDef = (equippedSkinRunner ? 80 : 0) + (equippedSkinShip ? 90 : 0) + (equippedSkinBlade ? 70 : 0);
    const speedBonus = (equippedSkinRunner?.bonusValue || 0) * 100 + (equippedTitle?.rarity === 'legendary' ? 20 : 5);
    const luckBonus = (equippedAvatar?.rarity === 'legendary' ? 25 : equippedAvatar?.rarity === 'rare' ? 10 : 5);

    return {
      atk: baseAtk + weaponAtk,
      def: baseDef + skinDef,
      speed: Math.round(speedBonus),
      luck: Math.round(luckBonus)
    };
  }, [profile.level, equippedWeapon, equippedSkinRunner, equippedSkinShip, equippedSkinBlade, equippedAvatar, equippedTitle]);

  // Game-specific stylized borders & frames for 9-tier rarities
  
  
  const handleOpenChest = (type: 'common' | 'rare' | 'epic' | 'legendary') => {
    const result = openChest(type);
    if (result) {
      setOpeningResult(result);
      setSelectedItem(null);
      reportQuestProgress('quest-open-chest', 1);
    }
  };

  // =========================================================================
  // FORGE MECHANICS: COST, AVAILABILITY, DEDUPLICATION, AND INTERACTION
  // =========================================================================
  
  // Gold cost tiered by rarity: Higher rarity costs more gold!
  const getCraftGoldCost = (rarity: Rarity | null): number => {
    if (!rarity) return 0;
    return RARITIES[rarity]?.craftCost || 0;
  };

  // Base list of items eligible for forge (excluding max tier eternal items, crates, titles)
  const allForgeableBaseItems = useMemo(() => {
    return ownedItems.filter(i => 
      i.rarity !== 'eternal' && 
      i.type !== 'crate' && 
      i.type !== 'title'
    );
  }, [ownedItems]);

  // Locked rarity determined by other filled slots (excluding the currently active slot)
  const lockedRarity = useMemo(() => {
    if (activeForgeSlot === 'aux') return null; // Aux slot doesn't lock rarity
    for (let i = 0; i < 3; i++) {
      if (i !== activeForgeSlot && craftingSlots[i] !== null) {
        return craftingSlots[i]!.rarity;
      }
    }
    const anyFilled = craftingSlots.find(s => s !== null);
    return anyFilled ? anyFilled.rarity : null;
  }, [craftingSlots, activeForgeSlot]);

  // Current active fusion rarity
  const currentCraftRarity = useMemo(() => {
    const filled = craftingSlots.find(s => s !== null);
    return filled ? filled.rarity : null;
  }, [craftingSlots]);

  // Calculated Gold Cost for the current craft
  const currentCraftCost = getCraftGoldCost(currentCraftRarity);
  const hasEnoughCoins = profile.coins >= currentCraftCost;
  const isAllSlotsFilled = craftingSlots.every(s => s !== null);

  const baseSuccessRates: Record<Rarity, number> = {
    'common': 100,
    'uncommon': 80,
    'rare': 60,
    'epic': 40,
    'legendary': 25,
    'mythic': 10,
    'relic': 5,
    'masterwork': 1,
    'eternal': 0
  };
  const baseRate = currentCraftRarity ? (baseSuccessRates[currentCraftRarity] ?? 100) : 100;
  const auxBonus = auxSlot && (auxSlot as any).bonusValue ? (auxSlot as any).bonusValue : 0;
  const finalSuccessRate = Math.min(100, baseRate + auxBonus);

  // Calculate available candidate items for the currently selected slot
  // Rule: If an item is already placed in other slots and its remaining count <= 0, HIDE IT completely!
  const availableForgeCandidates = useMemo(() => {
    if (activeForgeSlot === 'aux') {
      return allForgeableBaseItems
        .filter(item => item.type === 'consumable')
        .map(item => {
           let availableCount = item.count;
           if (auxSlot && auxSlot.id === item.id) {
               availableCount -= 1;
           }
           return { ...item, availableCount };
        })
        .filter(item => item.availableCount > 0);
    }
    
    return allForgeableBaseItems
      .filter(item => item.type !== 'consumable')
      .map(item => {
        // Count how many copies are currently used in the OTHER 2 slots
        const usedInOtherSlots = craftingSlots.reduce((acc, slotItem, idx) => {
          if (idx !== activeForgeSlot && slotItem && slotItem.id === item.id) {
            return acc + 1;
          }
          return acc;
        }, 0);
        
        const availableCount = item.count - usedInOtherSlots;
        return {
          ...item,
          availableCount,
        };
      })
      .filter(item => {
        // 1. MUST have available count > 0 (completely hide if fully consumed)
        if (item.availableCount <= 0) return false;

        // 2. If other slots dictate a locked rarity, only show items with matching rarity
        if (lockedRarity && item.rarity !== lockedRarity) return false;

        // 3. Optional manual rarity filter if no locked rarity
        if (!lockedRarity && forgeRarityFilter !== 'all' && item.rarity !== forgeRarityFilter) return false;

        return true;
      });
  }, [allForgeableBaseItems, craftingSlots, activeForgeSlot, lockedRarity, forgeRarityFilter, auxSlot]);

  // Handle clicking an item from the shelf to assign to the active slot
  const handleSelectItemForForge = (item: InventoryItem) => {
    if (item.rarity === 'eternal') return;
    soundEngine.play('click');
    setForgeErrorNotice(null);

    if (activeForgeSlot === 'aux') {
      setAuxSlot(item);
      const anyEmptyIdx = craftingSlots.findIndex(s => s === null);
      if (anyEmptyIdx !== -1) {
        setActiveForgeSlot(anyEmptyIdx);
      } else {
        setActiveForgeSlot(0); // fallback
      }
      return;
    }

    // If there's a rarity conflict with other slots, reset other slots to match this new item's rarity
    const otherSlotRarity = craftingSlots.find((s, idx) => idx !== activeForgeSlot && s !== null)?.rarity;
    
    const newSlots = [...craftingSlots];
    if (otherSlotRarity && otherSlotRarity !== item.rarity) {
      newSlots[0] = null;
      newSlots[1] = null;
      newSlots[2] = null;
    }

    // Assign to the active slot
    newSlots[activeForgeSlot] = item;
    setCraftingSlots(newSlots);

    // Auto-advance to next empty slot for seamless UX
    const nextEmptyIdx = newSlots.findIndex((s, idx) => idx > activeForgeSlot && s === null);
    if (nextEmptyIdx !== -1) {
      setActiveForgeSlot(nextEmptyIdx);
    } else {
      const anyEmptyIdx = newSlots.findIndex(s => s === null);
      if (anyEmptyIdx !== -1) {
        setActiveForgeSlot(anyEmptyIdx);
      }
    }
  };

  const handleRemoveAuxSlot = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundEngine.play('click');
    setForgeErrorNotice(null);
    setAuxSlot(null);
    setActiveForgeSlot('aux');
  };

  // Handle removing an item from a slot
  const handleRemoveFromForgeSlot = (index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundEngine.play('click');
    setForgeErrorNotice(null);

    const newSlots = [...craftingSlots];
    newSlots[index] = null;
    setCraftingSlots(newSlots);
    setActiveForgeSlot(index);
  };

  // Auto-Fill Helper: Finds 3 items of the same rarity and places them in the slots
  const handleAutoFill = () => {
    soundEngine.play('click');
    setForgeErrorNotice(null);

    const rarities: Rarity[] = ['masterwork', 'relic', 'mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'];
    for (const r of rarities) {
      const itemsOfRarity = allForgeableBaseItems.filter(i => i.rarity === r);
      const totalCount = itemsOfRarity.reduce((acc, i) => acc + i.count, 0);
      
      if (totalCount >= 3) {
        const picked: InventoryItem[] = [];
        for (const item of itemsOfRarity) {
          for (let c = 0; c < item.count; c++) {
            if (picked.length < 3) {
              picked.push(item);
            }
          }
          if (picked.length >= 3) break;
        }

        if (picked.length === 3) {
          setCraftingSlots([picked[0], picked[1], picked[2]]);
          setActiveForgeSlot(2);
          return;
        }
      }
    }

    setForgeErrorNotice('Bạn cần ít nhất 3 vật phẩm cùng phẩm cấp để tự động điền!');
  };

  // Clear all slots
  const handleClearAllForge = () => {
    soundEngine.play('click');
    setCraftingSlots([null, null, null]);
    setAuxSlot(null);
    setActiveForgeSlot(0);
    setForgeErrorNotice(null);
  };

  // Execute Forge Transmutation
  const handleExecuteCraft = () => {
    if (!isAllSlotsFilled || isCraftingAnim) return;
    if (!hasEnoughCoins) {
      soundEngine.play('gameOver');
      setForgeErrorNotice(`Không đủ Xu Vàng! Bạn cần 🪙 ${currentCraftCost.toLocaleString()} Xu nhưng hiện chỉ có 🪙 ${profile.coins.toLocaleString()} Xu.`);
      return;
    }

    // Deduct coins first
    const deducted = spendCoins(currentCraftCost);
    if (!deducted) {
      setForgeErrorNotice('Giao dịch vàng thất bại. Vui lòng kiểm tra lại số dư.');
      return;
    }

    setIsCraftingAnim(true);
    soundEngine.play('powerup');
    setForgeErrorNotice(null);

    setTimeout(() => {
      const itemIds = craftingSlots.map(s => s!.id);
      const result = craftItems(itemIds, auxSlot?.id);
      setIsCraftingAnim(false);
      setCraftingSlots([null, null, null]);
      setAuxSlot(null);
      setActiveForgeSlot(0);
      if (result) {
        setCraftedResult(result);
        reportQuestProgress('quest-craft', 1);
      }
    }, 1800);
  };

  return (
    <div
      onClick={() => {
        soundEngine.play('click');
        setActiveModal('none');
      }}
      className="arcadex-modal-overlay"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="arcadex-modal-container bg-[#0b0c14] border border-white/10"
      >
        
        {/* HEADER TOP BAR */}
        <div className="p-3 sm:p-4 border-b border-white/10 flex items-center justify-between bg-[#11121d] shrink-0 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-inner shrink-0">
              {activeTab === 'forge' ? (
                <Hammer className="w-5 h-5 text-purple-400" />
              ) : activeTab === 'discovery' ? (
                <FlaskConical className="w-5 h-5 text-amber-400" />
              ) : activeTab === 'log' ? (
                <History className="w-5 h-5 text-slate-300" />
              ) : (
                <Package className="w-5 h-5 text-indigo-400" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider font-display truncate">
                  {activeTab === 'forge' ? 'Lò Rèn Ma Thuật' : activeTab === 'discovery' ? 'Khám Phá Công Thức' : activeTab === 'log' ? 'Nhật Ký Lò Rèn' : 'Rương Đồ Của Tôi'}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 hidden xs:inline-block">
                  {activeTab === 'forge' ? 'Alchemy' : activeTab === 'discovery' ? 'Recipes' : activeTab === 'log' ? 'Logs' : 'Inventory'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block truncate">
                {activeTab === 'forge' ? 'Chạm vào ô để chọn vật phẩm và dung hợp nâng cấp' : activeTab === 'discovery' ? 'Thử nghiệm công thức bí mật để tìm bảo vật' : activeTab === 'log' ? 'Lịch sử chế tác và đột biến trang bị' : 'Quản lý trang bị, rương báu, nguyên liệu và cuộn giấy rèn'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Hidden on Mobile) */}
          <div className="hidden md:flex bg-[#08090f] p-1 rounded-xl border border-white/10 shadow-inner">
            <button
              id="tab-btn-forge"
              type="button"
              onClick={() => {
                soundEngine.play('click');
                setActiveTab('forge');
                setSelectedItem(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap touch-manipulation select-none ${
                activeTab === 'forge'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <motion.div
                animate={{ scale: activeTab === 'forge' ? 1.15 : 1 }}
                transition={{ type: 'spring', stiffness: 450, damping: 15 }}
                className="flex items-center justify-center pointer-events-none"
              >
                <Hammer className="w-3.5 h-3.5" />
              </motion.div>
              <span className="pointer-events-none">Lò Rèn</span>
            </button>

            <button
              id="tab-btn-discovery"
              type="button"
              onClick={() => {
                soundEngine.play('click');
                setActiveTab('discovery');
                setSelectedItem(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap touch-manipulation select-none ${
                activeTab === 'discovery'
                  ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <motion.div
                animate={{ scale: activeTab === 'discovery' ? 1.15 : 1 }}
                transition={{ type: 'spring', stiffness: 450, damping: 15 }}
                className="flex items-center justify-center pointer-events-none"
              >
                <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
              </motion.div>
              <span className="pointer-events-none">Khám Phá</span>
            </button>

            <button
              id="tab-btn-log"
              type="button"
              onClick={() => {
                soundEngine.play('click');
                setActiveTab('log');
                setSelectedItem(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap touch-manipulation select-none ${
                activeTab === 'log'
                  ? 'bg-gradient-to-r from-purple-700 to-slate-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <motion.div
                animate={{ scale: activeTab === 'log' ? 1.15 : 1 }}
                transition={{ type: 'spring', stiffness: 450, damping: 15 }}
                className="flex items-center justify-center pointer-events-none"
              >
                <History className="w-3.5 h-3.5 text-slate-300" />
              </motion.div>
              <span className="pointer-events-none">Nhật Ký</span>
            </button>
          </div>

          {/* Right Area: Player Coins & Permanent Close Button */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Player Coins Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold font-mono">
              <Coins className="w-3.5 h-3.5 text-yellow-500" />
              <span>{profile.coins.toLocaleString()}</span>
            </div>

            {/* Standardized Close Button */}
            <CloseButton
              id="btn-close-inventory-modal"
              onClose={() => setActiveModal('none')}
              ariaLabel="Đóng kho đồ"
            />
          </div>
        </div>

        {/* Mobile Navigation Tabs Strip (Dedicated 3-col grid on mobile, NO horizontal scroll) */}
        <div className="md:hidden grid grid-cols-3 bg-[#0c0d18] px-2 py-1.5 border-b border-white/10 shrink-0 gap-1.5">
          <button
            id="tab-btn-forge-mobile"
            type="button"
            onClick={() => {
              soundEngine.play('click');
              setActiveTab('forge');
              setSelectedItem(null);
            }}
            className={`min-h-[42px] flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer touch-manipulation select-none border ${
              activeTab === 'forge'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500 shadow-md'
                : 'text-slate-400 hover:text-white bg-white/5 border-transparent'
            }`}
          >
            <motion.div
              animate={{ scale: activeTab === 'forge' ? 1.15 : 1 }}
              transition={{ type: 'spring', stiffness: 450, damping: 15 }}
              className="flex items-center justify-center pointer-events-none"
            >
              <Hammer className="w-3.5 h-3.5" />
            </motion.div>
            <span className="pointer-events-none">Lò Rèn</span>
          </button>

          <button
            id="tab-btn-discovery-mobile"
            type="button"
            onClick={() => {
              soundEngine.play('click');
              setActiveTab('discovery');
              setSelectedItem(null);
            }}
            className={`min-h-[42px] flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer touch-manipulation select-none border ${
              activeTab === 'discovery'
                ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white border-amber-400 shadow-md'
                : 'text-slate-400 hover:text-white bg-white/5 border-transparent'
            }`}
          >
            <motion.div
              animate={{ scale: activeTab === 'discovery' ? 1.15 : 1 }}
              transition={{ type: 'spring', stiffness: 450, damping: 15 }}
              className="flex items-center justify-center pointer-events-none"
            >
              <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
            </motion.div>
            <span className="pointer-events-none">Khám Phá</span>
          </button>

          <button
            id="tab-btn-log-mobile"
            type="button"
            onClick={() => {
              soundEngine.play('click');
              setActiveTab('log');
              setSelectedItem(null);
            }}
            className={`min-h-[42px] flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer touch-manipulation select-none border ${
              activeTab === 'log'
                ? 'bg-gradient-to-r from-purple-700 to-slate-700 text-white border-purple-400 shadow-md'
                : 'text-slate-400 hover:text-white bg-white/5 border-transparent'
            }`}
          >
            <motion.div
              animate={{ scale: activeTab === 'log' ? 1.15 : 1 }}
              transition={{ type: 'spring', stiffness: 450, damping: 15 }}
              className="flex items-center justify-center pointer-events-none"
            >
              <History className="w-3.5 h-3.5 text-slate-300" />
            </motion.div>
            <span className="pointer-events-none">Nhật Ký</span>
          </button>
        </div>

        {/* TAB CONTENT */}
        {activeTab === 'forge' ? (
          <div className="flex-1 flex flex-col overflow-y-auto scrollbar-thin bg-[#090a12] p-3 sm:p-5">
            {/* TOP INFO & SUMMARY BAR */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 mb-4 pb-3 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-black text-white uppercase tracking-wider font-display flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" /> Bàn Dung Hợp Lò Rèn
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    3 Cùng Cấp ➔ 1 Cấp Cao
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Chạm vào từng ô để chọn vật phẩm từ kho đồ. Vật phẩm đã chọn sẽ tự động ẩn đi.
                </p>
              </div>

              {/* Player Gold Balance */}
              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs font-mono">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span>Số dư: {profile.coins.toLocaleString()} Xu</span>
                </div>
              </div>
            </div>

            {/* Error / Instruction Notice */}
            {forgeErrorNotice && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span className="flex-1">{forgeErrorNotice}</span>
                <button type="button" onClick={() => setForgeErrorNotice(null)} className="text-rose-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* ===================================================================== */}
            {/* FORGE MASTERY & CRITICAL CRAFTING STATUS BAR                          */}
            {/* ===================================================================== */}
            <div className="mb-4 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 via-[#131428] to-indigo-950/30 border border-purple-500/30 shadow-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 font-black text-sm shrink-0">
                    Lv.{forgeMastery.level}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-white uppercase tracking-wider font-display">
                        Đẳng Cấp Lò Rèn: {forgeMastery.title}
                      </h3>
                      {forgeMastery.criticalUnlocked ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-400" />
                          Chế Tác Chí Mạng {(forgeMastery.criticalRate * 100).toFixed(0)}%
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/10 text-[10px] font-medium">
                          Chí Mạng: Khóa (Cần Lv.3)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300">
                      {forgeMastery.criticalUnlocked
                        ? `Đã kích hoạt Chế Tác Chí Mạng! Có ${(forgeMastery.criticalRate * 100).toFixed(0)}% cơ hội bùng nổ nhận ngay trang bị Huyền Thoại (Legendary) khi đúc!`
                        : 'Dung hợp trang bị để tích lũy EXP. Đạt Cấp 3 để mở khóa Chế Tác Chí Mạng (Đột biến nhận đồ Huyền Thoại)!'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 self-end sm:self-auto">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Tiến Độ Cấp</div>
                    <span className="font-mono text-purple-300 font-bold">
                      {forgeMastery.exp} / {forgeMastery.expNeeded} EXP
                    </span>
                  </div>
                </div>
              </div>

              {/* EXP Bar */}
              <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, (forgeMastery.exp / forgeMastery.expNeeded) * 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 font-mono">
                <span>Tổng chế tác: <strong>{forgeMastery.totalCrafts}</strong> lần</span>
                <span>Chí mạng thành công: <strong className="text-amber-300">{forgeMastery.criticalCraftsCount}</strong></span>
              </div>
            </div>

            {/* ===================================================================== */}
            {/* THE 3 FORGE PEDESTALS / SLOTS CONTAINER (CLICK TO FOCUS & SELECT)     */}
            {/* ===================================================================== */}
            <div className="bg-[#121424] border border-purple-500/20 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-lg relative mb-4">
              
              {/* Newbie Quick Tip & Auto-Fill Banner */}
              <div className="mb-3 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-[#121424] border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-indigo-200">
                  <span className="text-base shrink-0">💡</span>
                  <span><strong>Quy tắc đơn giản:</strong> Đặt 3 vật phẩm cùng phẩm cấp để hợp nhất thành 1 trang bị cấp cao hơn!</span>
                </div>
                <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={handleAutoFill}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[11px] flex items-center gap-1 shadow cursor-pointer transition-all active:scale-95"
                    title="Tự động tìm 3 món cùng phẩm cấp để điền nhanh"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                    <span>Điền Nhanh</span>
                  </button>
                  {craftingSlots.some(s => s !== null) && (
                    <button
                      type="button"
                      onClick={handleClearAllForge}
                      className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[11px] font-bold transition-all cursor-pointer"
                      title="Xóa cả 3 ô để chọn lại"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>

              {/* Consolidated Success Forecast Bar */}
              <div className="mx-1 sm:mx-2 mb-3 p-2.5 sm:p-3 rounded-2xl bg-black/50 border border-purple-500/30 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 text-xs">
                    <div className="font-bold text-slate-300">
                      {currentCraftRarity ? (
                        <span className="flex items-center gap-1.5 flex-wrap">
                          <span>Dung hợp phẩm cấp:</span>
                          <RarityBadge rarity={currentCraftRarity} />
                          {auxSlot && (
                            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30 text-[10px]">
                              +{(auxSlot as any).bonusValue}% (Cuộn)
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-slate-400">Chọn 3 vật phẩm cùng phẩm cấp để xem tỷ lệ</span>
                      )}
                    </div>
                    {forgeMastery.criticalUnlocked && currentCraftRarity && (
                      <div className="text-[10px] text-amber-300 mt-0.5 font-medium">
                        ⚡ Cơ hội bạo kích nhận đồ Huyền Thoại: {(forgeMastery.criticalRate * 100).toFixed(0)}%
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0 pl-2">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Xác Suất</div>
                  <div className="text-base sm:text-xl font-black text-amber-300 font-mono tracking-tight">
                    {currentCraftRarity ? `${finalSuccessRate}%` : '---'}
                  </div>
                </div>
              </div>

              {/* 3 Interactive Slots + Aux Slot (Responsive Mobile Layout) */}
              <div className="flex items-center justify-center my-2 w-full overflow-hidden">
                <AnimatePresence>
                  {!isCraftingAnim ? (
                    <div className="flex items-start justify-center gap-1.5 sm:gap-3 w-full max-w-md px-0.5">
                      {[0, 1, 2].map((slotIdx) => {
                        const item = craftingSlots[slotIdx];
                        const isFocused = activeForgeSlot === slotIdx;
                        const itemRarityInfo = item ? getRarityInfo(item.rarity) : null;

                        return (
                          <div key={`forge-slot-${slotIdx}`} className="flex-1 flex flex-col items-center min-w-0">
                            
                            {/* Slot Box */}
                            <div
                              id={`forge-slot-box-${slotIdx}`}
                              onClick={() => {
                                soundEngine.play('click');
                                setActiveForgeSlot(slotIdx);
                              }}
                              style={item ? getRaritySlotBoxStyle(item.rarity, false, isFocused) : undefined}
                              className={`w-full aspect-square max-w-[70px] sm:max-w-[80px] rounded-xl sm:rounded-2xl border-2 flex flex-col items-center justify-center relative transition-all cursor-pointer select-none ${
                                item
                                  ? getRaritySlotStyle(item.rarity, false, false)
                                  : isFocused
                                    ? 'border-purple-400 bg-purple-950/30 shadow-[0_0_20px_rgba(168,85,247,0.4)] scale-105'
                                    : 'border-dashed border-white/20 bg-[#090a12]/80 hover:border-purple-500/40'
                              } ${isFocused ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-[#121424]' : ''}`}
                            >
                              {item && itemRarityInfo ? (
                                <>
                                  <span 
                                    className="absolute top-1 left-1 text-[7.5px] sm:text-[8px] font-black font-mono px-1 py-0.2 rounded shadow-sm leading-none"
                                    style={{ 
                                      color: itemRarityInfo.hex, 
                                      backgroundColor: 'rgba(0,0,0,0.85)', 
                                      border: `1px solid ${itemRarityInfo.hex}70` 
                                    }}
                                  >
                                    {itemRarityInfo.shortCode}
                                  </span>

                                  <span className="text-2xl sm:text-4xl drop-shadow-md">{item.icon}</span>
                                  
                                  {/* Remove Button */}
                                  <button
                                    id={`btn-remove-forge-slot-${slotIdx}`}
                                    type="button"
                                    onClick={(e) => handleRemoveFromForgeSlot(slotIdx, e)}
                                    className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-[10px] sm:text-xs flex items-center justify-center shadow-md font-bold transition-all hover:scale-110 cursor-pointer z-10"
                                    title="Gỡ vật phẩm này ra"
                                  >
                                    ×
                                  </button>

                                  {/* Slot Number Pill */}
                                  <span className="absolute bottom-1 right-1 bg-black/80 text-[7px] sm:text-[8px] font-bold px-1 rounded text-slate-300">
                                    Ô {slotIdx + 1}
                                  </span>
                                </>
                              ) : (
                                <div className="flex flex-col items-center justify-center text-center p-0.5">
                                  <div className={`w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center mb-0.5 sm:mb-1 ${
                                    isFocused ? 'bg-purple-500/30 text-purple-300' : 'bg-white/5 text-slate-500'
                                  }`}>
                                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                  </div>
                                  <span className={`text-[8px] sm:text-[9px] font-bold uppercase ${
                                    isFocused ? 'text-purple-300 font-black' : 'text-slate-500'
                                  }`}>
                                    Ô {slotIdx + 1}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Slot Item Label / Status */}
                            <div className="mt-1 text-center w-full px-0.5 flex flex-col items-center">
                              {item ? (
                                <>
                                  <div className="text-[9px] sm:text-[10px] font-bold text-white truncate max-w-[68px] sm:max-w-[85px] leading-tight" title={item.name}>
                                    {item.name}
                                  </div>
                                  <div className="mt-0.5">
                                    <RarityBadge rarity={item.rarity} compact />
                                  </div>
                                </>
                              ) : (
                                <span className={`text-[8.5px] sm:text-[10px] font-bold ${isFocused ? 'text-purple-400 animate-pulse' : 'text-slate-500'}`}>
                                  {isFocused ? '● Chọn' : 'Trống'}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      <div className="text-white/30 text-base sm:text-xl font-black mt-5 sm:mt-6 shrink-0">+</div>

                      <div className="flex flex-col items-center shrink-0 min-w-0">
                         {/* Aux Slot Box */}
                         <div
                            id={`forge-slot-box-aux`}
                            onClick={() => {
                              soundEngine.play('click');
                              setActiveForgeSlot('aux');
                            }}
                            className={`w-12 h-12 sm:w-16 sm:h-16 aspect-square rounded-xl border-2 flex flex-col items-center justify-center relative transition-all cursor-pointer select-none ${
                              auxSlot
                                ? getRaritySlotStyle(auxSlot.rarity, false, false)
                                : activeForgeSlot === 'aux'
                                  ? 'border-emerald-400 bg-emerald-950/30 shadow-[0_0_20px_rgba(52,211,153,0.4)] scale-105'
                                  : 'border-dashed border-white/20 bg-[#090a12]/80 hover:border-emerald-500/40'
                            } ${activeForgeSlot === 'aux' ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#121424]' : ''}`}
                            style={auxSlot ? getRaritySlotBoxStyle(auxSlot.rarity, false, activeForgeSlot === 'aux') : undefined}
                          >
                            {auxSlot ? (
                              <>
                                <span className="text-xl sm:text-2xl drop-shadow-md">{auxSlot.icon}</span>
                                <button
                                  type="button"
                                  onClick={handleRemoveAuxSlot}
                                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-[10px] flex items-center justify-center shadow-md font-bold transition-all hover:scale-110 cursor-pointer z-10"
                                >
                                  ×
                                </button>
                                <span className="absolute bottom-1 right-1 bg-black/80 text-[7px] sm:text-[8px] font-bold px-1 rounded text-emerald-300">
                                  +{(auxSlot as any).bonusValue}%
                                </span>
                              </>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center p-0.5">
                                  <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center mb-0.5 ${
                                    activeForgeSlot === 'aux' ? 'bg-emerald-500/30 text-emerald-300' : 'bg-white/5 text-slate-500'
                                  }`}>
                                    <Plus className="w-3 h-3" />
                                  </div>
                                </div>
                            )}
                         </div>
                         <div className="mt-1 text-center w-full px-0.5 flex flex-col items-center">
                              {auxSlot ? (
                                <div className="text-[8.5px] sm:text-[9px] font-bold text-emerald-400 truncate max-w-[58px] sm:max-w-[70px]">
                                  +{(auxSlot as any).bonusValue}% Tỉ lệ
                                </div>
                              ) : (
                                <span className={`text-[8.5px] sm:text-[9px] font-bold whitespace-nowrap ${activeForgeSlot === 'aux' ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`}>
                                  Cuộn Giấy
                                </span>
                              )}
                         </div>
                      </div>
                    </div>
                  ) : (
                    /* Crafting Alchemy Vortex Animation */
                    <div className="relative h-28 w-full flex items-center justify-center">
                      {[0, 1, 2].map((idx) => {
                        const slot = craftingSlots[idx];
                        if (!slot) return null;
                        const angle = (idx * (360 / 3)) * (Math.PI / 180);
                        const radius = 55;
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;
                        return (
                          <motion.div
                            key={`craft-spin-${idx}`}
                            initial={{ x, y, scale: 1, opacity: 1 }}
                            animate={{
                              x: 0,
                              y: 0,
                              scale: [1, 1.3, 0],
                              opacity: [1, 1, 0],
                              rotate: [0, 180, 360]
                            }}
                            transition={{ duration: 1.6, ease: "easeInOut" }}
                            style={getRaritySlotBoxStyle(slot.rarity, false, false)}
                            className={`absolute w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-3xl ${getRaritySlotStyle(slot.rarity, false, false)}`}
                          >
                            {slot.icon}
                          </motion.div>
                        );
                      })}
                      
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 2.5, 5], opacity: [0, 1, 0] }}
                        transition={{ duration: 1.6, delay: 0.8, ease: "easeOut" }}
                        className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 blur-2xl mix-blend-screen"
                      />
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* CRAFT EXECUTION BUTTON WITH COIN FEE */}
              <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                <button
                  id="btn-forge-execute"
                  type="button"
                  disabled={!isAllSlotsFilled || isCraftingAnim || !hasEnoughCoins}
                  onClick={handleExecuteCraft}
                  className={`w-full py-3 sm:py-3.5 rounded-2xl font-black uppercase text-xs sm:text-sm tracking-wider transition-colors relative overflow-hidden flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                    !isAllSlotsFilled
                      ? 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed'
                      : !hasEnoughCoins
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50 cursor-not-allowed shadow-rose-950/50'
                        : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_25px_rgba(124,58,237,0.5)]'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isCraftingAnim
                      ? 'Đang Dung Hợp Bí Thuật...'
                      : !isAllSlotsFilled
                        ? `Cần Chọn Đủ 3 Vật Phẩm (Đã Chọn ${craftingSlots.filter(s => s !== null).length}/3)`
                        : !hasEnoughCoins
                          ? `Không Đủ Vàng (Cần 🪙 ${currentCraftCost.toLocaleString()} Xu - Có 🪙 ${profile.coins.toLocaleString()} Xu)`
                          : `Tiến Hành Dung Hợp (Phí: 🪙 ${currentCraftCost.toLocaleString()} Xu)`}
                  </span>
                </button>
              </div>

              {/* Fee Tier Guide Collapsible Accordion */}
              <div className="mt-2.5 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowTierCostGuide(!showTierCostGuide)}
                  className="w-full text-[10px] font-bold text-slate-400 hover:text-slate-200 py-1 flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-1">
                    <Info className="w-3 h-3 text-purple-400" />
                    <span>Bảng Phí Nâng Cấp 9 Cấp Phẩm Chất</span>
                  </span>
                  <span className="text-[9px] text-purple-300">
                    {showTierCostGuide ? '▲ Thu gọn' : '▼ Xem chi tiết'}
                  </span>
                </button>

                {showTierCostGuide && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[9.5px] mt-2 animate-in fade-in">
                    {[
                      { from: 'common' as Rarity, to: 'uncommon' as Rarity },
                      { from: 'uncommon' as Rarity, to: 'rare' as Rarity },
                      { from: 'rare' as Rarity, to: 'epic' as Rarity },
                      { from: 'epic' as Rarity, to: 'legendary' as Rarity },
                      { from: 'legendary' as Rarity, to: 'mythic' as Rarity },
                      { from: 'mythic' as Rarity, to: 'relic' as Rarity },
                      { from: 'relic' as Rarity, to: 'masterwork' as Rarity },
                      { from: 'masterwork' as Rarity, to: 'eternal' as Rarity },
                    ].map(({ from, to }) => {
                      const fromInfo = getRarityInfo(from);
                      const toInfo = getRarityInfo(to);
                      const isCurrent = currentCraftRarity === from;
                      return (
                        <div
                          key={`tier-cost-${from}`}
                          className={`p-1.5 rounded-xl border transition-all text-center ${
                            isCurrent
                              ? 'bg-purple-950/60 border-purple-400 text-purple-200 font-bold ring-1 ring-purple-400'
                              : 'bg-black/40 border-white/5 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span style={{ color: fromInfo.hex }} className="font-bold">{fromInfo.shortHand}</span>
                            <span className="text-slate-500">➔</span>
                            <span style={{ color: toInfo.hex }} className="font-bold">{toInfo.shortHand}</span>
                          </div>
                          <div className="text-amber-400 font-bold font-mono text-[9px] mt-0.5">
                            🪙 {fromInfo.craftCost.toLocaleString()} Xu
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ===================================================================== */}
            {/* MATERIAL SELECTION SHELF FOR THE ACTIVE SLOT                          */}
            {/* ===================================================================== */}
            <div className="flex-1 flex flex-col min-h-0">
              
              {/* Shelf Header & Filter Options */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2 px-1">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {activeForgeSlot === 'aux' ? 'Vật Phẩm Khả Dụng Cho Ô Phụ Trợ' : `Vật Phẩm Khả Dụng Cho Ô ${activeForgeSlot + 1}`}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                    {availableForgeCandidates.length} món
                  </span>
                </div>

                {/* Filter / Notice for Locked Rarity */}
                {lockedRarity ? (
                  <div className="text-[11px] text-slate-300 flex items-center gap-1.5 bg-purple-950/50 px-2.5 py-1 rounded-xl border border-purple-500/30">
                    <span>Đang lọc theo phẩm cấp:</span>
                    <RarityBadge rarity={lockedRarity} />
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-1 bg-[#131522] p-1 rounded-lg border border-white/10 max-w-full">
                    {(['all', 'common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'relic', 'masterwork'] as const).map(r => {
                      const rInfo = r !== 'all' ? getRarityInfo(r) : null;
                      return (
                        <button
                          key={`forge-filter-${r}`}
                          type="button"
                          onClick={() => setForgeRarityFilter(r)}
                          className={`px-1.5 sm:px-2 py-0.5 text-[9.5px] font-bold rounded transition-colors cursor-pointer whitespace-nowrap ${
                            forgeRarityFilter === r
                              ? 'bg-purple-600 text-white shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {r === 'all' ? 'Tất Cả' : rInfo?.shortHand}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* CANDIDATE ITEMS GRID (CLICK TO ASSIGN TO ACTIVE SLOT) */}
              {availableForgeCandidates.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-2.5 pb-6">
                  {availableForgeCandidates.map(item => {
                    const candidateRarityInfo = getRarityInfo(item.rarity);
                    return (
                      <div
                        key={`forge-pick-${item.id}`}
                        onClick={() => handleSelectItemForForge(item)}
                        style={getRaritySlotBoxStyle(item.rarity, false, false)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-colors cursor-pointer group relative ${getRaritySlotStyle(item.rarity, false, false)}`}
                      >
                        {/* Shorthand Tag */}
                        <span 
                          className="absolute top-1 left-1 text-[8px] font-black font-mono px-1 py-0.2 rounded shadow-sm z-10 leading-none"
                          style={{ 
                            color: candidateRarityInfo.hex, 
                            backgroundColor: 'rgba(0,0,0,0.85)', 
                            border: `1px solid ${candidateRarityInfo.hex}70` 
                          }}
                        >
                          {candidateRarityInfo.shortCode}
                        </span>

                        {/* Remaining Count Badge */}
                        <div className="absolute top-1 right-1 bg-black/90 border border-white/20 text-white text-[9px] font-black px-1.5 py-0.2 rounded-md min-w-[18px] text-center backdrop-blur-sm shadow z-10">
                          x{item.availableCount}
                        </div>

                        {/* Icon */}
                        <div className="text-2xl sm:text-3xl mb-1 mt-1 drop-shadow-md group-hover:scale-110 transition-transform">
                          {item.icon}
                        </div>

                        {/* Name */}
                        <span className="text-[10px] font-bold text-white truncate w-full">
                          {item.name}
                        </span>

                        {/* Badge */}
                        <div className="mt-1">
                          <RarityBadge rarity={item.rarity} />
                        </div>

                        {/* Quick Select Tag */}
                        <span className="text-[8px] text-purple-300 uppercase font-semibold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          + Chọn Vào Ô {typeof activeForgeSlot === 'number' ? activeForgeSlot + 1 : 'Phụ'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-2">
                  <EmptyState
                    id="empty-forge-candidates"
                    compact
                    icon={<Hammer className="w-6 h-6 text-purple-400" />}
                    badge="LÒ RÈN MA THUẬT"
                    badgeColor="text-purple-300 border-purple-500/30 bg-purple-500/15"
                    title={lockedRarity ? 'Hết Vật Phẩm Cùng Cấp' : 'Không Có Vật Phẩm Khả Dụng'}
                    description={
                      lockedRarity
                        ? `Bạn đang chọn phẩm cấp ${getRarityInfo(lockedRarity).nameVi}, nhưng trong kho không còn món nào cùng bậc để gán tiếp.`
                        : 'Toàn bộ vật phẩm đủ điều kiện đã được đặt vào lò rèn hoặc kho đồ chưa có trang bị cùng phẩm cấp để dung hợp.'
                    }
                    tip="Quy tắc: Cần ghép đủ 3 vật phẩm cùng phẩm cấp để thăng hạng trang bị lên cấp kế tiếp."
                    primaryAction={
                      lockedRarity
                        ? {
                            label: 'Làm Mới Lò Rèn',
                            onClick: handleClearAllForge,
                            icon: <RotateCcw className="w-3.5 h-3.5" />,
                            variant: 'purple',
                          }
                        : {
                            label: 'Mở Rương Báu',
                            onClick: () => setActiveModal('inventory'),
                            icon: <Package className="w-3.5 h-3.5" />,
                            variant: 'indigo',
                          }
                    }
                    secondaryAction={
                      lockedRarity
                        ? {
                            label: 'Mở Kho Đồ',
                            onClick: () => setActiveModal('inventory'),
                            icon: <Package className="w-3.5 h-3.5" />,
                          }
                        : {
                            label: 'Ghé Cửa Hàng',
                            onClick: () => setActiveModal('shop'),
                            icon: <ShoppingBag className="w-3.5 h-3.5" />,
                          }
                    }
                  />
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'discovery' ? (
          <RecipeDiscoveryTab onNavigateToLog={() => setActiveTab('log')} />
        ) : (
          <DiscoveryLogTab onBackToLab={() => setActiveTab('discovery')} />
        )}

        {/* ========================================================================= */}
        {/* ISOLATED ITEM INFORMATION INSPECTOR (EASY TO DISMISS)                    */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {selectedItem && (
            <div 
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
              onClick={() => setSelectedItem(null)}
            >
              <motion.div
                initial={{ y: 20, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 20, opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-[#121422] border border-white/15 rounded-3xl p-5 shadow-2xl relative overflow-hidden"
              >
                {/* Header with Badges & Close Button */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <RarityBadge rarity={selectedItem.rarity} />
                    {selectedItem.gameId && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10 uppercase flex items-center gap-1">
                        <Gamepad2 className="w-3 h-3" /> {selectedItem.gameId}
                      </span>
                    )}
                  </div>
                  <button
                    id="btn-close-item-inspector"
                    type="button"
                    onClick={() => {
                      soundEngine.play('click');
                      setSelectedItem(null);
                    }}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Main Item Visual */}
                <div className="flex flex-col items-center text-center mb-5">
                  <div 
                    style={getRaritySlotBoxStyle(selectedItem.rarity, false, false)}
                    className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center text-4xl mb-3 shadow-xl ${getRaritySlotStyle(selectedItem.rarity, false, false)}`}
                  >
                    {selectedItem.icon}
                  </div>
                  <h3 className="text-xl font-black text-white mb-1.5">{selectedItem.name}</h3>
                  <p className="text-[11px] text-slate-400 max-w-[260px] leading-relaxed">{selectedItem.description}</p>
                </div>

                {/* Additional Info Details */}
                <div className="bg-black/30 rounded-xl p-3 border border-white/5 mb-5 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-bold uppercase tracking-wider">Phân loại</span>
                    <span className="text-slate-200 font-medium">
                      {selectedItem.type === 'weapon' ? 'Vũ Khí' : 
                       selectedItem.type === 'skin' ? 'Skin' : 
                       selectedItem.type === 'avatar' ? 'Ảnh Đại Diện' : 
                       selectedItem.type === 'title' ? 'Danh Hiệu' : 'Vật Phẩm'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-bold uppercase tracking-wider">Sử dụng cho</span>
                    <span className="text-slate-200 font-medium">
                      {selectedItem.gameId ? `Mini-game: ${selectedItem.gameId}` : 'Hồ Sơ Toàn Cầu'}
                    </span>
                  </div>
                  {!(selectedItem as any).isChest && selectedItem.bonusDescription && (
                    <div className="pt-2.5 mt-2.5 border-t border-white/10">
                      <div className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" /> Đặc tính / Hiệu ứng
                      </div>
                      <div className="text-indigo-300 text-[11px] font-bold leading-relaxed bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
                        {selectedItem.bonusDescription}
                      </div>
                    </div>
                  )}
                </div>

                {/* Comparison View with Equipped Item */}
                {!(selectedItem as any).isChest && (selectedItem.type === 'weapon' || selectedItem.type === 'skin' || selectedItem.type === 'avatar' || selectedItem.type === 'title') && (() => {
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
                          <span className="text-amber-400 font-bold">Trống (Chưa có)</span>
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

                {/* Actions */}
                <div className="space-y-2">
                  {(selectedItem as any).isChest ? (
                    <button
                      id="btn-open-chest-action"
                      type="button"
                      onClick={() => handleOpenChest((selectedItem as any).chestType)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold text-sm shadow-[0_0_15px_rgba(217,119,6,0.4)] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Package className="w-4 h-4" /> Mở Rương Ngay
                    </button>
                  ) : (
                    <>
                      {/* Equip / Unequip Button for weapons, skins, avatars, titles */}
                      {(selectedItem.type === 'weapon' || selectedItem.type === 'skin' || selectedItem.type === 'avatar' || selectedItem.type === 'title') && (
                        (selectedItem as any).equipped ? (
                          <button
                            id="btn-unequip-item-action"
                            type="button"
                            onClick={() => {
                              soundEngine.play('click');
                              unequipItem(selectedItem.id);
                              setSelectedItem(null);
                            }}
                            className="w-full py-3 rounded-xl bg-white/10 text-slate-200 text-sm font-bold hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Shield className="w-4 h-4" /> Gỡ Trang Bị
                          </button>
                        ) : (
                          <button
                            id="btn-equip-item-action"
                            type="button"
                            onClick={() => {
                              soundEngine.play('powerup');
                              confetti({
                                particleCount: 50,
                                spread: 60,
                                origin: { y: 0.8 },
                                zIndex: 9999
                              });
                              equipItem(selectedItem.id);
                              setSelectedItem(null);
                            }}
                            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-colors cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Check className="w-4 h-4" /> Trang Bị Ngay
                          </button>
                        )
                      )}

                      {/* Transmute in forge shortcut */}
                      {selectedItem.rarity !== 'eternal' && selectedItem.type !== 'crate' && (
                        <button
                          id="btn-send-to-forge"
                          type="button"
                          onClick={() => {
                            handleSelectItemForForge(selectedItem);
                            setActiveTab('forge');
                            setSelectedItem(null);
                          }}
                          className="w-full py-2.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Hammer className="w-3.5 h-3.5" /> Đưa Đến Lò Rèn Để Nâng Cấp
                        </button>
                      )}
                    </>
                  )}

                  {/* Explicit Dismiss Button */}
                  <button
                    id="btn-dismiss-inspector"
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="w-full py-2.5 rounded-xl bg-transparent hover:bg-white/5 text-slate-400 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    Bỏ Chọn / Đóng
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* CHEST OPENING REWARD POPUP */}
        {openingResult && (
          <div 
            className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4"
            onClick={() => setOpeningResult(null)}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full bg-[#121424] border border-amber-500/40 rounded-3xl p-6 text-center shadow-[0_0_50px_rgba(217,119,6,0.25)] relative pr-6"
            >
              {/* Standardized Close Button top-right */}
              <div className="absolute top-4 right-4 z-20">
                <CloseButton
                  id="btn-close-chest-popup-x"
                  onClose={() => setOpeningResult(null)}
                  size="sm"
                  ariaLabel="Đóng phần thưởng"
                />
              </div>

              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl mb-3 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]"
              >
                🎁
              </motion.div>
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 font-display mb-1 tracking-wider">
                MỞ RƯƠNG THÀNH CÔNG!
              </h3>
              <p className="text-xs text-slate-400">
                Chúc mừng bạn đã nhận được phần thưởng báu vật
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-4 mt-4">
                <div className="bg-black/50 border border-yellow-500/20 rounded-xl p-3 flex items-center justify-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-black text-yellow-400 font-mono">+{openingResult.coins} Xu</span>
                </div>
                <div className="bg-black/50 border border-blue-500/20 rounded-xl p-3 flex items-center justify-center gap-2">
                  <Gem className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-black text-blue-400 font-mono">+{openingResult.gems} KC</span>
                </div>
              </div>

              {openingResult.item ? (
                <div className="bg-black/60 border border-indigo-500/40 rounded-2xl p-4 mb-5 text-left flex items-center gap-4">
                  <div 
                    style={getRaritySlotBoxStyle(openingResult.item.rarity, false, false)}
                    className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center text-4xl shrink-0 ${getRaritySlotStyle(openingResult.item.rarity, false, false)}`}
                  >
                    {openingResult.item.icon}
                  </div>
                  <div>
                    <div className="mb-1"><RarityBadge rarity={openingResult.item.rarity} /></div>
                    <h4 className="text-sm font-bold text-white leading-tight">{openingResult.item.name}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{openingResult.item.description}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-black/40 border border-white/5 rounded-xl p-3 mb-5 text-xs text-slate-400">
                  Lần này nhận Xu & Kim Cương. Hãy tiếp tục tích lũy rương báu nhé!
                </div>
              )}

              {/* Requirement: "nên đổi thành nút Tiếp tục mở vì số lượng rương vẫn còn. Nếu số lượng đã hết thì hiển thị nút Đóng." */}
              {(chestCounts[openingResult.chestType] || 0) > 0 ? (
                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                  <button
                    id="btn-chest-open-continue"
                    type="button"
                    onClick={() => {
                      soundEngine.play('powerup');
                      handleOpenChest(openingResult.chestType);
                    }}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black uppercase text-xs sm:text-sm tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>🎁 Tiếp Tục Mở (Còn {chestCounts[openingResult.chestType]})</span>
                  </button>
                  <button
                    id="btn-close-chest-reward"
                    type="button"
                    onClick={() => {
                      soundEngine.play('click');
                      setOpeningResult(null);
                    }}
                    className="w-full sm:w-auto py-3 px-5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white font-bold text-xs sm:text-sm border border-white/10 transition-colors cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              ) : (
                <button
                  id="btn-close-chest-reward"
                  type="button"
                  onClick={() => {
                    soundEngine.play('click');
                    setOpeningResult(null);
                  }}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold uppercase text-xs sm:text-sm tracking-wider border border-slate-600 shadow-lg transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              )}
            </motion.div>
          </div>
        )}

        {/* FORGE CRAFTED RESULT CELEBRATION */}
        {craftedResult && (
          <div 
            className="fixed inset-0 bg-black/95 z-[70] flex items-center justify-center p-4 backdrop-blur-md"
            onClick={() => setCraftedResult(null)}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className={`max-w-md w-full rounded-3xl p-8 text-center shadow-[0_0_60px_rgba(168,85,247,0.4)] relative overflow-hidden border ${
                craftedResult.isCritical 
                  ? 'bg-gradient-to-b from-[#1c142b] to-[#0a0814] border-amber-400/80 shadow-[0_0_60px_rgba(251,191,36,0.5)]' 
                  : 'bg-[#121424] border-purple-500/60'
              }`}
            >
              {/* Standardized Close Button top-right */}
              <div className="absolute top-4 right-4 z-20">
                <CloseButton
                  id="btn-close-crafted-popup-x"
                  onClose={() => setCraftedResult(null)}
                  size="sm"
                  ariaLabel="Đóng kết quả chế tác"
                />
              </div>

              <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/30 blur-3xl rounded-full" />
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-500/30 blur-3xl rounded-full" />

              {craftedResult.isCritical && (
                <div className="mb-3 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-amber-500/30 border border-amber-400 text-amber-300 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 animate-pulse">
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>ĐỘT BIẾN CHÍ MẠNG: NHẬN TRANG BỊ HUYỀN THOẠI!</span>
                </div>
              )}
              
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 uppercase tracking-widest mb-1 mt-1 font-display">
                {craftedResult.success ? (craftedResult.isCritical ? 'CHẾ TÁC CHÍ MẠNG!' : 'DUNG HỢP THÀNH CÔNG!') : 'DUNG HỢP THẤT BẠI'}
              </h3>
              <p className="text-xs text-slate-300 mb-5">
                {craftedResult.success 
                  ? (craftedResult.isCritical 
                    ? 'Vận may ngút trời! Lò rèn bùng nổ năng lượng tạo ra một bảo vật Huyền Thoại quý hiếm!' 
                    : 'Bạn đã chế tạo thành công trang bị phẩm cấp cao hơn!')
                  : 'Rất tiếc! Tỷ lệ dung hợp không thành công. Nguyên liệu đã tiêu hao nhưng bạn vẫn tích lũy được EXP Lò Rèn.'}
              </p>
              
               <div className="flex justify-center mb-4">
                {craftedResult.success && craftedResult.item ? (
                  <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                    style={getRaritySlotBoxStyle(craftedResult.item.rarity, false, false)}
                    className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 flex items-center justify-center text-5xl sm:text-6xl shadow-2xl ${getRaritySlotStyle(craftedResult.item.rarity, false, false)}`}
                  >
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {craftedResult.item.icon}
                    </motion.div>
                  </motion.div>
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-rose-500/40 bg-rose-950/30 flex items-center justify-center text-5xl shadow-2xl">
                    💥
                  </div>
                )}
              </div>

              {craftedResult.success && craftedResult.item ? (
                <div className="mb-5 bg-black/60 border border-indigo-500/40 rounded-2xl p-4 text-left shadow-inner">
                  <div className="flex items-center justify-between mb-2">
                    <RarityBadge rarity={craftedResult.item.rarity} />
                    <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/15 px-2 py-0.5 rounded border border-indigo-500/30 uppercase">
                      Loại: {craftedResult.item.type}
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white mb-1 leading-snug">{craftedResult.item.name}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{craftedResult.item.description}</p>
                  {craftedResult.item.bonusDescription && (
                    <div className="mt-2.5 text-[11px] text-indigo-300 font-semibold bg-indigo-500/10 px-2.5 py-1.5 rounded-xl border border-indigo-500/20 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{craftedResult.item.bonusDescription}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mb-5 bg-black/60 border border-rose-500/40 rounded-2xl p-4 text-left shadow-inner flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-2xl shrink-0">
                    🛡️
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Thất Bại Dung Hợp</div>
                    <div className="text-xs font-bold text-white mt-0.5">Mục Tiêu: {getRarityInfo(craftedResult.baseUpgradedRarity).nameVi}</div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Nguyên liệu đã tiêu hao nhưng nhận được EXP Lò Rèn tích lũy.</p>
                  </div>
                </div>
              )}

              {/* Forge Mastery EXP gain & Level up indicator */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                <div className="bg-black/40 p-2.5 rounded-xl border border-white/10 text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">EXP Lò Rèn</div>
                  <div className="text-purple-300 font-mono font-black text-sm">+{craftedResult.masteryExpGained} EXP</div>
                </div>
                <div className="bg-black/40 p-2.5 rounded-xl border border-white/10 text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Cấp Lò Rèn</div>
                  <div className="text-amber-300 font-mono font-black text-sm">
                    {craftedResult.didLevelUpMastery ? `Lv.${craftedResult.newMasteryLevel} (UP!)` : `Lv.${craftedResult.newMasteryLevel}`}
                  </div>
                </div>
              </div>

              <button
                id="btn-close-crafted-celebration"
                type="button"
                onClick={() => {
                  soundEngine.play('click');
                  setCraftedResult(null);
                }}
                className={`w-full py-3.5 rounded-xl font-black uppercase text-sm tracking-widest transition-all cursor-pointer ${
                  craftedResult.success
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(124,58,237,0.4)]'
                    : 'bg-[#1a1d2e] hover:bg-[#23273e] text-slate-200 border border-white/10 shadow-md'
                }`}
              >
                {craftedResult.success ? 'Tuyệt Vời!' : 'Đã Hiểu (Thử Lại Sau)'}
              </button>
            </motion.div>
          </div>
        )}

        {/* Dynamic Floating Tooltip */}
        <AnimatePresence>
          {hoveredItem && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'fixed',
                left: Math.min(window.innerWidth - 240, Math.max(10, tooltipPos.x - 110)),
                top: Math.max(10, tooltipPos.y - 140),
                zIndex: 99999,
                pointerEvents: 'none',
                borderColor: getRarityInfo(hoveredItem.rarity).hex,
                boxShadow: `0 0 25px ${getRarityInfo(hoveredItem.rarity).glowColor}`,
                background: 'rgba(18, 20, 34, 0.96)',
              }}
              className="w-56 border-2 rounded-2xl p-3 shadow-2xl backdrop-blur-md"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="text-2xl">{hoveredItem.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-white truncate">{hoveredItem.name}</div>
                  <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: getRarityInfo(hoveredItem.rarity).hex }}>
                    {getRarityInfo(hoveredItem.rarity).nameVi} ({hoveredItem.type})
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-300 leading-tight mb-2 line-clamp-2">{hoveredItem.description}</p>
              {hoveredItem.bonusDescription && (
                <div className="text-[9px] text-indigo-300 font-semibold bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                  ✨ {hoveredItem.bonusDescription}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
