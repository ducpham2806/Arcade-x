const fs = require('fs');

const content = `
import React, { useState, useEffect } from 'react';
import { useInventory, ChestOpenResult } from '../context/InventoryContext';
import { usePlayer } from '../context/PlayerContext';
import { useGame } from '../context/GameContext';
import { CHEST_TYPES } from '../services/storage';
import { Rarity, ItemType, InventoryItem } from '../types';
import {
  Package, Sparkles, Coins, Gem, Zap, X, Lock, Shield,
  Hammer, ArrowRight, Info
} from 'lucide-react';

export const InventoryModal: React.FC = () => {
  const { items, chestCounts, openChest, equipItem, unequipItem, craftItems } = useInventory();
  const { setActiveModal } = useGame();
  
  const [selectedItemType, setSelectedItemType] = useState<ItemType | 'all'>('all');
  const [openingResult, setOpeningResult] = useState<ChestOpenResult | null>(null);
  
  // Virtual items representing chests
  const chestTypes = ['common', 'rare', 'epic', 'legendary'] as const;
  const chestVirtualItems = chestTypes.filter(type => chestCounts[type] > 0).map(type => ({
    id: \`chest-\${type}\`,
    name: \`Rương \${type === 'common' ? 'Thường' : type === 'rare' ? 'Hiếm' : type === 'epic' ? 'Sử Thi' : 'Huyền Thoại'}\`,
    type: 'crate' as ItemType,
    rarity: type,
    description: 'Mở để nhận vàng, ngọc và cơ hội nhận trang bị.',
    icon: '📦',
    count: chestCounts[type],
    isChest: true,
    chestType: type
  }));
  
  // Filtered real items
  const ownedItems = items.filter(i => i.count > 0);
  const allGridItems = [...chestVirtualItems, ...ownedItems].filter(item => {
    if (selectedItemType !== 'all' && item.type !== selectedItemType) return false;
    return true;
  });
  
  const MIN_SLOTS = 25;
  const gridSlots = [...allGridItems];
  while (gridSlots.length < MIN_SLOTS) {
    gridSlots.push(null as any);
  }
  
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [craftingSlots, setCraftingSlots] = useState<(any | null)[]>([null, null, null]);
  const [isCraftingAnim, setIsCraftingAnim] = useState(false);
  const [craftedResult, setCraftedResult] = useState<InventoryItem | null>(null);
  
  const getRarityColor = (rarity: Rarity) => {
    switch (rarity) {
      case 'common': return 'border-slate-500 bg-slate-900/50 text-slate-300';
      case 'rare': return 'border-blue-500 bg-blue-900/50 text-blue-300';
      case 'epic': return 'border-purple-500 bg-purple-900/50 text-purple-300';
      case 'legendary': return 'border-yellow-500 bg-yellow-900/50 text-yellow-300';
      default: return 'border-white/10 bg-black/50 text-white';
    }
  };

  const getRarityBadge = (rarity: Rarity) => {
    const colors = {
      common: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      rare: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      epic: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      legendary: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30 shadow-lg shadow-yellow-500/20',
    };
    const labels = {
      common: 'Thường',
      rare: 'Hiếm',
      epic: 'Sử Thi',
      legendary: 'Huyền Thoại',
    };
    return (
      <span className={\`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border \${colors[rarity]}\`}>
        {labels[rarity]}
      </span>
    );
  };
  
  const handleOpenChest = (type: 'common' | 'rare' | 'epic' | 'legendary') => {
    const result = openChest(type);
    if (result) {
      setOpeningResult(result);
      setSelectedSlot(null); // refresh
    }
  };
  
  const handleAddToCraft = (item: any) => {
    if (item.isChest) return;
    if (item.rarity === 'legendary') return; // Cannot craft legendary
    
    // Check if we already have items in craft slots of a different rarity
    const currentRarity = craftingSlots.find(s => s !== null)?.rarity;
    if (currentRarity && currentRarity !== item.rarity) {
       // Clear slots if different rarity
       setCraftingSlots([item, null, null]);
       return;
    }
    
    // Count how many of this item are already in crafting slots
    const inCraftCount = craftingSlots.filter(s => s && s.id === item.id).length;
    if (inCraftCount >= item.count) {
       // Cannot add more than owned
       return;
    }
    
    // Add to first empty slot
    const newSlots = [...craftingSlots];
    const emptyIdx = newSlots.findIndex(s => s === null);
    if (emptyIdx !== -1) {
       newSlots[emptyIdx] = item;
       setCraftingSlots(newSlots);
    }
  };
  
  const handleRemoveFromCraft = (index: number) => {
    const newSlots = [...craftingSlots];
    newSlots[index] = null;
    setCraftingSlots(newSlots);
  };
  
  const handleCraft = () => {
    if (craftingSlots.includes(null)) return;
    setIsCraftingAnim(true);
    
    setTimeout(() => {
      const itemIds = craftingSlots.map(s => s.id);
      const result = craftItems(itemIds);
      setIsCraftingAnim(false);
      setCraftingSlots([null, null, null]);
      if (result) {
        setCraftedResult(result);
        setSelectedSlot(null);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-[#0a0a0a] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col h-[95vh] sm:h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                Kho Đồ & Chế Tạo
              </h2>
              <p className="text-xs text-slate-400">Quản lý trang bị và rương báu</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-transparent hover:border-rose-500/50 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Layout: RPG Grid on left, details on right */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          
          {/* Left: Inventory Grid */}
          <div className="flex-1 border-r border-white/5 p-4 flex flex-col overflow-hidden">
            {/* Filters */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none shrink-0">
              {[
                { id: 'all', label: 'Tất Cả' },
                { id: 'crate', label: 'Rương' },
                { id: 'skin', label: 'Trang Phục' },
                { id: 'weapon', label: 'Vũ Khí' },
                { id: 'avatar', label: 'Avatar' },
                { id: 'title', label: 'Danh Hiệu' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedItemType(f.id as ItemType | 'all')}
                  className={\`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all \${
                    selectedItemType === f.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-[#141414] text-slate-400 hover:text-white border border-white/5'
                  }\`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto scrollbar-thin pr-2">
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2">
                {gridSlots.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => item && setSelectedSlot(item)}
                    className={\`aspect-square rounded-xl border-2 flex items-center justify-center relative cursor-pointer transition-transform hover:scale-105 \${
                      item ? getRarityColor(item.rarity) : 'border-white/5 bg-[#141414] cursor-default hover:scale-100'
                    } \${selectedSlot?.id === item?.id ? 'ring-2 ring-white scale-105 z-10' : ''}\`}
                  >
                    {item ? (
                      <>
                        <div className="text-2xl sm:text-3xl drop-shadow-md">{item.icon}</div>
                        <div className="absolute -bottom-1 -right-1 bg-black/80 border border-white/20 text-white text-[10px] font-bold px-1.5 rounded-md min-w-[20px] text-center">
                          {item.count}
                        </div>
                        {item.equipped && !item.isChest && (
                          <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                        )}
                      </>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Details & Crafting */}
          <div className="w-full md:w-80 lg:w-96 bg-[#0e0e0e] flex flex-col shrink-0 overflow-y-auto">
            {selectedSlot ? (
              <div className="p-5 flex flex-col h-full animate-in fade-in slide-in-from-right-4">
                <div className="flex-1">
                  <div className={\`w-24 h-24 mx-auto rounded-2xl border-2 flex items-center justify-center text-5xl mb-4 shadow-xl \${getRarityColor(selectedSlot.rarity)}\`}>
                    {selectedSlot.icon}
                  </div>
                  <div className="text-center mb-6">
                    <div className="mb-2">{getRarityBadge(selectedSlot.rarity)}</div>
                    <h3 className="text-lg font-bold text-white mb-1">{selectedSlot.name}</h3>
                    <p className="text-xs text-slate-400 mb-2">{selectedSlot.description}</p>
                    {!selectedSlot.isChest && selectedSlot.bonusDescription && (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold mt-2">
                        <Zap className="w-3 h-3" />
                        <span>{selectedSlot.bonusDescription}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    {selectedSlot.isChest ? (
                      <button
                        onClick={() => handleOpenChest(selectedSlot.chestType)}
                        className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-lg shadow-amber-900/20 transition-all flex items-center justify-center gap-2"
                      >
                        <Package className="w-4 h-4" /> Mở Rương
                      </button>
                    ) : (
                      <>
                        {selectedSlot.equipped ? (
                          <button
                            onClick={() => { unequipItem(selectedSlot.id); setSelectedSlot({...selectedSlot, equipped: false}); }}
                            className="w-full py-2.5 rounded-xl bg-white/10 text-slate-300 text-sm font-semibold hover:bg-white/20 transition-colors"
                          >
                            Gỡ Trang Bị
                          </button>
                        ) : (
                          <button
                            onClick={() => { equipItem(selectedSlot.id); setSelectedSlot({...selectedSlot, equipped: true}); }}
                            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-900/20 transition-all"
                          >
                            Trang Bị Ngay
                          </button>
                        )}
                        
                        {selectedSlot.rarity !== 'legendary' && (
                          <button
                            onClick={() => handleAddToCraft(selectedSlot)}
                            className="w-full py-2.5 rounded-xl bg-[#1a1a2e] border border-indigo-500/30 text-indigo-300 text-sm font-semibold hover:bg-[#20203a] transition-colors flex items-center justify-center gap-2 mt-2"
                          >
                            <Hammer className="w-4 h-4" /> Thêm vào Bàn Chế Tạo
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Crafting Anvil Area */}
                <div className="mt-6 pt-6 border-t border-white/5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Hammer className="w-3.5 h-3.5" /> Bàn Chế Tạo (Cùng Độ Hiếm)
                  </h4>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    {craftingSlots.map((slot, idx) => (
                      <div
                        key={idx}
                        onClick={() => slot && handleRemoveFromCraft(idx)}
                        className={\`w-14 h-14 rounded-xl border-2 flex items-center justify-center relative transition-all \${
                          slot ? getRarityColor(slot.rarity) + ' cursor-pointer hover:scale-105' : 'border-white/5 bg-[#0a0a0a] border-dashed'
                        } \${isCraftingAnim && slot ? 'animate-ping' : ''}\`}
                      >
                        {slot ? (
                          <span className="text-2xl">{slot.icon}</span>
                        ) : (
                          <span className="text-white/10 text-xl">+</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    disabled={craftingSlots.includes(null) || isCraftingAnim}
                    onClick={handleCraft}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black uppercase text-sm tracking-widest shadow-xl transition-all"
                  >
                    {isCraftingAnim ? 'Đang Chế Tạo...' : 'Tiến Hành Dung Hợp'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center opacity-50">
                <Package className="w-12 h-12 text-slate-500 mb-3" />
                <p className="text-sm text-slate-400">Chọn một vật phẩm trong lưới để xem chi tiết hoặc bắt đầu chế tạo.</p>
              </div>
            )}
          </div>
        </div>

        {/* Overlays */}
        {/* Chest Open Result */}
        {openingResult && (
          <div className="absolute inset-0 bg-black/90 z-60 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#0e0e0e] border border-amber-500/30 rounded-2xl p-6 text-center shadow-2xl relative animate-scale-up">
              <div className="text-5xl mb-2 animate-bounce">🎁</div>
              <h3 className="text-xl font-extrabold text-white font-display mb-1">
                KHAI MỞ THÀNH CÔNG!
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-4 mt-4">
                <div className="bg-[#141414] border border-white/5 rounded-xl p-3 flex items-center justify-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-bold text-yellow-400 font-mono">+{openingResult.coins} Xu</span>
                </div>
                <div className="bg-[#141414] border border-white/5 rounded-xl p-3 flex items-center justify-center gap-2">
                  <Gem className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-bold text-blue-400 font-mono">+{openingResult.gems} KC</span>
                </div>
              </div>
              {openingResult.item ? (
                <div className="bg-[#141414] border border-indigo-500/30 rounded-xl p-4 mb-6 text-left flex items-center gap-4">
                  <div className={\`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-3xl shrink-0 \${getRarityColor(openingResult.item.rarity)}\`}>
                    {openingResult.item.icon}
                  </div>
                  <div>
                    <div className="mb-1">{getRarityBadge(openingResult.item.rarity)}</div>
                    <h4 className="text-sm font-bold text-white leading-tight">{openingResult.item.name}</h4>
                  </div>
                </div>
              ) : (
                <div className="bg-[#141414] border border-white/5 rounded-xl p-3 mb-6 text-xs text-slate-400">
                  Lần này chưa rơi trang bị hiếm. Hãy thử lại nhé!
                </div>
              )}
              <button
                onClick={() => setOpeningResult(null)}
                className="w-full py-3 rounded-xl bg-white text-black hover:bg-amber-400 font-bold uppercase text-xs tracking-tight shadow-lg transition-all"
              >
                Tiếp Tục
              </button>
            </div>
          </div>
        )}

        {/* Crafted Result */}
        {craftedResult && (
          <div className="absolute inset-0 bg-black/95 z-60 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#0e0e0e] border border-purple-500/50 rounded-3xl p-8 text-center shadow-[0_0_50px_rgba(168,85,247,0.2)] relative animate-scale-up">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-7xl animate-bounce">
                ✨
              </div>
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 uppercase tracking-widest mb-2 mt-4">
                DUNG HỢP THÀNH CÔNG
              </h3>
              <p className="text-xs text-slate-400 mb-8">Bạn đã chế tạo ra một vật phẩm phẩm cấp cao hơn!</p>
              
              <div className="flex justify-center mb-8">
                <div className={\`w-32 h-32 rounded-2xl border-4 flex items-center justify-center text-6xl shadow-2xl animate-pulse-slow \${getRarityColor(craftedResult.rarity)}\`}>
                  {craftedResult.icon}
                </div>
              </div>

              <div className="mb-8">
                <div className="mb-2">{getRarityBadge(craftedResult.rarity)}</div>
                <h4 className="text-xl font-bold text-white mb-2">{craftedResult.name}</h4>
                <p className="text-sm text-slate-400">{craftedResult.description}</p>
              </div>

              <button
                onClick={() => setCraftedResult(null)}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black uppercase text-sm tracking-widest shadow-xl transition-all"
              >
                Tuyệt Vời!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
`
fs.writeFileSync('src/components/InventoryModal.tsx', content);
