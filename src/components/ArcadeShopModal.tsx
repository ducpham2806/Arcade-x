import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useInventory } from '../context/InventoryContext';
import { usePlayer } from '../context/PlayerContext';
import { CloseButton } from './common/CloseButton';
import { SHOP_THEMES, ShopTheme } from '../data/shopThemes';
import {
  HEX_BOOSTER_PRODUCTS,
  BoosterProduct,
  addBoostersToInventory,
  addBundleToInventory,
  getStoredHexBoosters,
} from '../games/hex-match/boosterData';
import { getRarityInfo, RarityBadge } from '../utils/rarity';
import { soundEngine } from '../services/audio';
import {
  ShoppingBag,
  Coins,
  Sparkles,
  Check,
  Eye,
  Gamepad2,
  Filter,
  Tag,
  Flame,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
} from 'lucide-react';

export interface ForgeScrollProduct {
  id: string;
  name: string;
  rarity: string;
  description: string;
  bonusDescription: string;
  bonusValue: number;
  icon: string;
  priceCoins?: number;
  priceGems?: number;
  tag?: string;
}

export const FORGE_SCROLL_PRODUCTS: ForgeScrollProduct[] = [
  {
    id: 'scroll-basic',
    name: 'Cuộn Giấy Rèn Sơ Cấp',
    rarity: 'rare',
    description: 'Tăng 10% tỷ lệ dung hợp thành công khi rèn trang bị tại Lò Rèn.',
    bonusDescription: '+10% Thành Công',
    bonusValue: 10,
    icon: '📜',
    priceGems: 15,
    tag: 'Sơ Cấp',
  },
  {
    id: 'scroll-medium',
    name: 'Cuộn Giấy Rèn Trung Cấp',
    rarity: 'epic',
    description: 'Tăng 25% tỷ lệ dung hợp thành công khi rèn trang bị tại Lò Rèn.',
    bonusDescription: '+25% Thành Công',
    bonusValue: 25,
    icon: '🧧',
    priceGems: 35,
    tag: 'Trung Cấp',
  },
  {
    id: 'scroll-advanced',
    name: 'Cuộn Giấy Rèn Cao Cấp',
    rarity: 'legendary',
    description: 'Tăng 50% tỷ lệ dung hợp thành công khi rèn trang bị tại Lò Rèn.',
    bonusDescription: '+50% Thành Công',
    bonusValue: 50,
    icon: '🎫',
    priceGems: 75,
    tag: 'Cao Cấp',
  },
  {
    id: 'scroll-mythic',
    name: 'Cuộn Giấy Rèn Thần Thoại',
    rarity: 'mythic',
    description: 'Tăng 75% tỷ lệ dung hợp thành công, tối ưu hóa đột phá trang bị cao cấp.',
    bonusDescription: '+75% Thành Công',
    bonusValue: 75,
    icon: '📜✨',
    priceGems: 150,
    tag: 'Thần Thoại',
  },
  {
    id: 'scroll-relic',
    name: 'Cuộn Giấy Cổ Vật Tối Thượng',
    rarity: 'relic',
    description: 'Tuyệt kỹ rèn thần thánh: Đảm bảo 100% thành công và kích hoạt bạo kích siêu cấp!',
    bonusDescription: '+100% Thành Công (Tuyệt Đối)',
    bonusValue: 100,
    icon: '🌟📜',
    priceGems: 300,
    tag: 'Tối Thượng',
  },
];

export const ArcadeShopModal: React.FC = () => {
  const { setActiveModal, launchGame } = useGame();
  const { profile, spendCoins, spendGems } = usePlayer();
  const { items, grantItemById, isItemOwned, equipItem, unequipItem, purchaseShopTheme, getEquippedSkinForGame } = useInventory();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<'recommended' | 'price-asc' | 'price-desc' | 'rarity'>('recommended');
  const [previewTheme, setPreviewTheme] = useState<ShopTheme | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [currentBoosters, setCurrentBoosters] = useState(getStoredHexBoosters());

  // Listen for booster updates
  useEffect(() => {
    const handleUpdate = () => {
      setCurrentBoosters(getStoredHexBoosters());
    };
    window.addEventListener('arcadex_hex_boosters_updated', handleUpdate);
    return () => window.removeEventListener('arcadex_hex_boosters_updated', handleUpdate);
  }, []);

  // Categories list
  const categories = useMemo(() => {
    return [
      { id: 'all', label: 'Tất Cả Skins', icon: '🛍️', count: SHOP_THEMES.length },
      { id: 'scrolls', label: 'Cuộn Giấy Rèn', icon: '📜', count: FORGE_SCROLL_PRODUCTS.length },
      { id: 'boosters', label: 'Trợ Lực', icon: '⚡', count: HEX_BOOSTER_PRODUCTS.length },
      { id: 'eat-em-all', label: "Eat 'Em All", icon: '😋', count: SHOP_THEMES.filter(t => t.gameId === 'eat-em-all').length },
      { id: 'scoodoku', label: 'Scoodoku', icon: '🔢', count: SHOP_THEMES.filter(t => t.gameId === 'scoodoku').length },
      { id: 'shikaku', label: 'Shikaku', icon: '🟥', count: SHOP_THEMES.filter(t => t.gameId === 'shikaku').length },
      { id: 'neon-runner', label: 'Neon Runner', icon: '🏃', count: SHOP_THEMES.filter(t => t.gameId === 'neon-runner').length },
      { id: 'cosmic-defense', label: 'Cosmic Defense', icon: '🚀', count: SHOP_THEMES.filter(t => t.gameId === 'cosmic-defense').length },
      { id: 'cyber-slice', label: 'Cyber Slice', icon: '🗡️', count: SHOP_THEMES.filter(t => t.gameId === 'cyber-slice').length },
      { id: 'caro-gomoku', label: 'Cờ Caro', icon: '❌', count: SHOP_THEMES.filter(t => t.gameId === 'caro-gomoku').length },
      { id: 'blocker', label: 'Block Puzzle', icon: '🧱', count: SHOP_THEMES.filter(t => t.gameId === 'blocker').length },
      { id: 'car-escape', label: 'Car Escape', icon: '🚗', count: SHOP_THEMES.filter(t => t.gameId === 'car-escape').length },
    ];
  }, []);

  const [scrollQuantities, setScrollQuantities] = useState<Record<string, number>>({
    'scroll-basic': 1,
    'scroll-medium': 1,
    'scroll-advanced': 1,
    'scroll-mythic': 1,
    'scroll-relic': 1,
  });
  const [confirmPurchaseData, setConfirmPurchaseData] = useState<{ product: ForgeScrollProduct; qty: number } | null>(null);
  const [infoModalProduct, setInfoModalProduct] = useState<ForgeScrollProduct | null>(null);

  const handleQtyChange = (productId: string, delta: number) => {
    setScrollQuantities(prev => {
      const current = prev[productId] || 1;
      const next = Math.max(1, Math.min(99, current + delta));
      return { ...prev, [productId]: next };
    });
  };

  // Handle Scroll Purchase with quantity and confirmation
  const executePurchaseScroll = (product: ForgeScrollProduct, qty: number) => {
    setPurchasingId(product.id);
    const unitPrice = product.priceGems || 50;
    const totalPrice = unitPrice * qty;

    if (profile.gems < totalPrice) {
      soundEngine.play('error');
      setFeedbackMessage({
        type: 'error',
        text: `Bạn không đủ Kim Cương! Cần thêm ${(totalPrice - profile.gems).toLocaleString()} 💎 để mua x${qty} ${product.name}.`,
      });
      setPurchasingId(null);
      setConfirmPurchaseData(null);
      return;
    }

    const success = spendGems(totalPrice);
    if (success) {
      grantItemById(product.id, qty);
      soundEngine.play('powerup');
      setFeedbackMessage({
        type: 'success',
        text: `Mua thành công x${qty} ${product.name} với giá ${totalPrice.toLocaleString()} 💎! Đã nạp vào kho.`,
      });
    } else {
      setFeedbackMessage({
        type: 'error',
        text: 'Giao dịch không thành công, vui lòng thử lại.',
      });
    }
    setTimeout(() => {
      setPurchasingId(null);
      setConfirmPurchaseData(null);
    }, 400);
  };

  // Handle Booster Purchase
  const handlePurchaseBooster = (product: BoosterProduct) => {
    setPurchasingId(product.id);
    if (profile.coins < product.priceCoins) {
      soundEngine.play('error');
      setFeedbackMessage({
        type: 'error',
        text: `Bạn không đủ Arcade Coins! Cần thêm ${(product.priceCoins - profile.coins).toLocaleString()} Xu để mua ${product.name}.`,
      });
      setPurchasingId(null);
      return;
    }

    const success = spendCoins(product.priceCoins);
    if (success) {
      if (product.isBundle && product.bundleContents) {
        addBundleToInventory(product.bundleContents);
      } else if (product.boosterType) {
        addBoostersToInventory(product.boosterType, product.count);
      }
      soundEngine.play('coin');
      setCurrentBoosters(getStoredHexBoosters());
      setFeedbackMessage({
        type: 'success',
        text: `Mua thành công ${product.name}! Đã nạp vào kho vật phẩm.`,
      });
    } else {
      setFeedbackMessage({
        type: 'error',
        text: 'Giao dịch không thành công, vui lòng thử lại.',
      });
    }
    setTimeout(() => {
      setPurchasingId(null);
    }, 400);
  };

  // Filtered & Sorted Themes
  const displayedThemes = useMemo(() => {
    let list = SHOP_THEMES.filter((theme) => {
      if (selectedCategory === 'all') return true;
      return theme.gameId === selectedCategory;
    });

    switch (selectedSort) {
      case 'price-asc':
        list = [...list].sort((a, b) => a.priceCoins - b.priceCoins);
        break;
      case 'price-desc':
        list = [...list].sort((a, b) => b.priceCoins - a.priceCoins);
        break;
      case 'rarity': {
        const rarityWeights: Record<string, number> = {
          common: 1,
          uncommon: 2,
          rare: 3,
          epic: 4,
          legendary: 5,
          mythic: 6,
          relic: 7,
          masterwork: 8,
          eternal: 9,
        };
        list = [...list].sort((a, b) => (rarityWeights[b.rarity] || 0) - (rarityWeights[a.rarity] || 0));
        break;
      }
      default:
        // 'recommended' keeps default curated order
        break;
    }

    return list;
  }, [selectedCategory, selectedSort]);

  // Handle Buy
  const handlePurchase = (theme: ShopTheme) => {
    setPurchasingId(theme.id);
    const res = purchaseShopTheme(theme.id);
    if (res.success) {
      setFeedbackMessage({ type: 'success', text: res.message });
      // If preview is currently open for this theme, update
      if (previewTheme?.id === theme.id) {
        setPreviewTheme(theme);
      }
    } else {
      setFeedbackMessage({ type: 'error', text: res.message });
    }
    setTimeout(() => {
      setPurchasingId(null);
    }, 400);
  };

  // Handle Equip Toggle
  const handleEquipToggle = (theme: ShopTheme) => {
    const currentSkin = getEquippedSkinForGame(theme.gameId);
    if (currentSkin?.id === theme.id) {
      unequipItem(theme.id);
      soundEngine.play('click');
      setFeedbackMessage({
        type: 'success',
        text: `Đã gỡ trang bị theme "${theme.name}".`,
      });
    } else {
      equipItem(theme.id);
      soundEngine.play('click');
      setFeedbackMessage({
        type: 'success',
        text: `Đã trang bị thành công "${theme.name}" cho ${theme.gameTitle}!`,
      });
    }
  };

  // Launch game with this theme
  const handlePlayNow = (theme: ShopTheme) => {
    // Ensure equipped
    equipItem(theme.id);
    launchGame(theme.gameId);
    setActiveModal('none');
  };

  return (
    <div
      id="arcade-shop-modal-overlay"
      className="arcadex-modal-overlay"
    >
      <div
        id="arcade-shop-modal-container"
        className="arcadex-modal-container bg-[#0d0d16] border border-amber-500/20 text-slate-100"
      >
        {/* Top Decorative Banner */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-cyan-400 to-fuchsia-500" />

        {/* Modal Header */}
        <header className="flex items-center justify-between gap-1.5 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3 border-b border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center shadow-md shadow-amber-500/10 shrink-0" title="Cửa Hàng Arcade Skins">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            </div>
          </div>

          {/* Right Header: Coins Balance & Close */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Player Coins Wallet - Compact on mobile */}
            <div
              id="shop-player-coins"
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 shadow-inner"
              title="Số dư Arcade Coins của bạn"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-xs sm:text-sm font-black text-amber-300 font-mono">
                {profile.coins.toLocaleString()}
              </span>
            </div>

            {/* Player Gems Wallet */}
            <div
              id="shop-player-gems"
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 shadow-inner"
              title="Số dư Kim Cương của bạn"
            >
              <span className="text-xs sm:text-sm shrink-0">💎</span>
              <span className="text-xs sm:text-sm font-black text-cyan-300 font-mono">
                {profile.gems.toLocaleString()}
              </span>
            </div>

            {/* Quick Earn Coins shortcut button */}
            <button
              type="button"
              onClick={() => setActiveModal('quests')}
              className="p-1.5 sm:p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center"
              title="Kiếm thêm Xu qua Nhiệm Vụ Hàng Ngày"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            </button>

            {/* Close Button */}
            <CloseButton
              id="btn-close-shop-modal"
              onClick={() => setActiveModal('none')}
              className="hover:bg-white/10"
            />
          </div>
        </header>

        {/* Feedback Alert Banner */}
        {feedbackMessage && (
          <div
            className={`flex items-center justify-between px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold animate-in fade-in duration-150 shrink-0 ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border-b border-emerald-500/30'
                : 'bg-rose-950/80 text-rose-300 border-b border-rose-500/30'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              {feedbackMessage.type === 'success' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              )}
              <span className="truncate">{feedbackMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackMessage(null)}
              className="text-xs opacity-70 hover:opacity-100 px-2 py-0.5 shrink-0"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filter Bar & Sort Controls */}
        <div className="flex items-center justify-between gap-2 px-3 sm:px-6 py-2 border-b border-white/5 bg-[#0a0a10] shrink-0">
          {/* Categories Pill - Icon Only + Count */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-nowrap touch-pan-x py-0.5 min-w-0 flex-1">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  title={cat.label}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer border shrink-0 ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-md shadow-amber-500/20'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/5'
                  }`}
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span
                    className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-black/20 text-stone-900 font-bold' : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 shrink-0 pl-1 border-l border-white/10">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as any)}
              className="bg-[#141420] text-slate-200 border border-white/10 text-[11px] sm:text-xs rounded-lg sm:rounded-xl px-2 py-1 sm:py-1.5 outline-none cursor-pointer focus:border-amber-500/50"
            >
              <option value="recommended">⭐</option>
              <option value="price-asc">💰 ↑</option>
              <option value="price-desc">💰 ↓</option>
              <option value="rarity">💎</option>
            </select>
          </div>
        </div>

        {/* Main Content Area: Products Grid or Booster Section */}
        <div className="arcadex-modal-body p-4 sm:p-6 space-y-4 custom-scrollbar">
          {selectedCategory === 'boosters' ? (
            <div className="space-y-3">
              {/* Inventory overview header - compact */}
              <div className="bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-slate-900 border border-amber-500/30 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shadow-inner shrink-0">
                    ⚡
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                      <span>Vật Phẩm Trợ Lực Hex Puzzle</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      Sử dụng trong game Hex Collapse Puzzle để vượt qua các thế cờ hiểm
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-950/80 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-200 shrink-0 self-end sm:self-auto">
                  <span className="text-slate-400 text-[10px] font-sans font-semibold">Kho đồ:</span>
                  <span title="Búa Kẹo">🔨 {currentBoosters.hammer}</span>
                  <span title="Kẹo Sọc">⚡ {currentBoosters.rocket}</span>
                  <span title="Bom Cầu Vồng">💣 {currentBoosters.color_bomb}</span>
                  <span title="Xáo Trộn">🔄 {currentBoosters.shuffle}</span>
                </div>
              </div>

              {/* Booster Packs Compact 2-3 Columns Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-3">
                {HEX_BOOSTER_PRODUCTS.map((prod) => {
                  const canAfford = profile.coins >= prod.priceCoins;
                  const isPurchasing = purchasingId === prod.id;

                  return (
                    <div
                      key={prod.id}
                      className={`relative flex flex-col justify-between p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 shadow-sm ${
                        prod.isBundle
                          ? 'col-span-2 sm:col-span-2 md:col-span-3 bg-gradient-to-r from-purple-950/70 via-indigo-950/50 to-[#0e0e18] border-purple-500/50 shadow-md shadow-purple-500/10 ring-1 ring-purple-500/30'
                          : 'bg-[#12121e] border-white/10 hover:border-amber-500/40 hover:bg-[#151524]'
                      }`}
                    >
                      {/* Top: Icon & Name & Tag */}
                      <div className="flex items-start gap-2 sm:gap-2.5 mb-1.5">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-xl sm:text-2xl shadow-inner shrink-0">
                          {prod.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1 flex-wrap">
                            <h4 className="text-xs sm:text-sm font-black text-white truncate">
                              {prod.name}
                            </h4>
                            {prod.tag && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {prod.tag}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] sm:text-[11px] font-bold text-amber-400 block truncate">
                            +{prod.count} vật phẩm
                          </span>
                        </div>
                      </div>

                      {/* Description: concise 1-line */}
                      <p className="text-[10px] sm:text-[11px] text-slate-400 truncate mb-2">
                        {prod.description}
                      </p>

                      {/* Bottom Row: Price & Buy Button */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-auto">
                        <div className="flex items-center gap-1 font-mono font-black text-amber-300 text-xs sm:text-sm">
                          <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{prod.priceCoins.toLocaleString()}</span>
                          <span className="text-[9px] text-amber-400/80 font-sans font-semibold hidden xs:inline">Xu</span>
                        </div>

                        <button
                          type="button"
                          disabled={!canAfford || isPurchasing}
                          onClick={() => handlePurchaseBooster(prod)}
                          className={`px-2.5 sm:px-3 py-1 rounded-xl text-[10px] sm:text-xs font-black flex items-center gap-1 transition-all cursor-pointer shadow-sm whitespace-nowrap active:scale-95 ${
                            canAfford
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/20'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          }`}
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>{isPurchasing ? 'Mua...' : 'Mua'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : selectedCategory === 'scrolls' ? (
            <div className="space-y-3">
              {/* Inventory overview header - compact */}
              <div className="bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-slate-900 border border-amber-500/30 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shadow-inner shrink-0">
                    📜
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                      <span>Cuộn Giấy Rèn Tăng Tỷ Lệ Rèn</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      Tăng tỷ lệ thành công (+10% đến +50%) khi rèn và dung hợp trang bị tại Lò Rèn
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-950/80 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-200 shrink-0 self-end sm:self-auto">
                  <span className="text-slate-400 text-[10px] font-sans font-semibold">Kho đồ:</span>
                  <span title="Cuộn Sơ Cấp">📜 {items.find(i => i.id === 'scroll-basic')?.count || 0}</span>
                  <span title="Cuộn Trung Cấp">🧧 {items.find(i => i.id === 'scroll-medium')?.count || 0}</span>
                  <span title="Cuộn Cao Cấp">🎫 {items.find(i => i.id === 'scroll-advanced')?.count || 0}</span>
                  <span title="Cuộn Thần Thoại">✨ {items.find(i => i.id === 'scroll-mythic')?.count || 0}</span>
                  <span title="Cuộn Cổ Vật">🌟 {items.find(i => i.id === 'scroll-relic')?.count || 0}</span>
                </div>
              </div>

              {/* Scrolls Products Compact 2-3 Columns Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-3">
                {FORGE_SCROLL_PRODUCTS.map((prod) => {
                  const qty = scrollQuantities[prod.id] || 1;
                  const unitPrice = prod.priceGems || 50;
                  const totalPrice = unitPrice * qty;
                  const canAfford = profile.gems >= totalPrice;
                  const ownedCount = items.find(i => i.id === prod.id)?.count || 0;

                  return (
                    <div
                      key={prod.id}
                      className="flex flex-col justify-between p-2.5 sm:p-3 rounded-2xl bg-[#12121e] border border-white/10 hover:border-cyan-500/40 hover:bg-[#151524] transition-all gap-2 shadow-sm"
                    >
                      {/* Top: Icon, Name, Tag & Bonus */}
                      <div className="flex items-start gap-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-xl shadow-inner shrink-0">
                          {prod.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1 flex-wrap">
                            <h4 className="text-xs sm:text-sm font-black text-white truncate">{prod.name}</h4>
                            <span className="text-[8px] sm:text-[9px] font-black uppercase px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              {prod.tag}
                            </span>
                          </div>
                          <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400 block truncate mt-0.5">
                            {prod.bonusDescription}
                          </span>
                          <div className="text-[9px] sm:text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                            Có: <strong className="text-amber-300">x{ownedCount}</strong> • <strong className="text-cyan-300">{unitPrice} 💎</strong>
                          </div>
                        </div>
                      </div>

                      {/* Bottom: Quantity Selector & Buy Button */}
                      <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-white/5 mt-auto">
                        {/* Quantity Selector */}
                        <div className="flex items-center bg-slate-950 border border-white/10 rounded-lg overflow-hidden shrink-0">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(prod.id, -1)}
                            className="px-1.5 py-0.5 text-slate-300 hover:bg-white/10 font-mono text-xs cursor-pointer transition-colors"
                          >
                            -
                          </button>
                          <span className="px-1.5 py-0.5 font-mono text-xs font-bold text-white min-w-[20px] text-center">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(prod.id, 1)}
                            className="px-1.5 py-0.5 text-slate-300 hover:bg-white/10 font-mono text-xs cursor-pointer transition-colors"
                          >
                            +
                          </button>
                        </div>

                        {/* Total Price */}
                        <div className="font-mono font-black text-cyan-300 text-xs truncate">
                          {totalPrice.toLocaleString()} 💎
                        </div>

                        {/* Buy Button */}
                        <button
                          type="button"
                          disabled={!canAfford}
                          onClick={() => setConfirmPurchaseData({ product: prod, qty })}
                          className={`px-2.5 sm:px-3 py-1 rounded-xl text-[10px] sm:text-xs font-black flex items-center gap-1 transition-all cursor-pointer shadow-sm whitespace-nowrap shrink-0 active:scale-95 ${
                            canAfford
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-400 hover:from-cyan-400 hover:to-blue-300 text-slate-950 shadow-cyan-500/25'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          }`}
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Mua</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
              {displayedThemes.map((theme) => {
                const owned = isItemOwned(theme.id);
                const currentEquippedSkin = getEquippedSkinForGame(theme.gameId);
                const isEquipped = currentEquippedSkin?.id === theme.id;
                const canAfford = profile.coins >= theme.priceCoins;
                const rarityInfo = getRarityInfo(theme.rarity);

                return (
                  <div
                    key={theme.id}
                    id={`shop-item-${theme.id}`}
                    className={`group relative flex flex-col justify-between p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ${
                      isEquipped
                        ? 'bg-gradient-to-b from-indigo-950/80 via-[#131326] to-[#0e0e18] border-indigo-500/70 shadow-lg shadow-indigo-500/15 ring-1 ring-indigo-500/40'
                        : owned
                        ? 'bg-[#11111d] border-white/10 hover:border-emerald-500/40 hover:bg-[#141424]'
                        : 'bg-[#0f0f18] border-white/5 hover:border-amber-500/40 hover:bg-[#131322]'
                    }`}
                  >
                    {/* Top Game Tag & Rarity */}
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-black/50 text-slate-300 border border-white/10 truncate max-w-[62%]">
                        <span className="shrink-0">{theme.gameIcon}</span>
                        <span className="truncate">{theme.gameTitle}</span>
                      </span>
                      <RarityBadge rarity={theme.rarity} />
                    </div>

                    {/* Center Icon Showcase / Interactive Preview Trigger */}
                    <div
                      onClick={() => setPreviewTheme(theme)}
                      className="relative flex flex-col items-center justify-center py-2.5 sm:py-3 rounded-xl border border-white/5 cursor-pointer group-hover:border-white/15 transition-all mb-2"
                      style={{
                        background: `radial-gradient(circle at center, ${theme.accentColor}25 0%, rgba(15,15,24,0.4) 75%)`,
                      }}
                      title="Chạm để xem thử giao diện động"
                    >
                      <div
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-lg border border-white/15 transition-transform duration-200 group-hover:scale-105"
                        style={{
                          backgroundColor: `${theme.accentColor}30`,
                          boxShadow: `0 6px 16px ${theme.accentColor}30`,
                        }}
                      >
                        {theme.icon}
                      </div>

                      {/* Single Eye Preview Button (Top-Right) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewTheme(theme);
                        }}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg bg-black/60 hover:bg-amber-500/25 text-slate-400 hover:text-amber-300 border border-white/10 flex items-center justify-center transition-all cursor-pointer shadow-sm"
                        title="Xem thử giao diện"
                      >
                        <Eye className="w-3 h-3 text-amber-400" />
                      </button>

                      {theme.tag && (
                        <span className={`mt-1.5 text-[8px] sm:text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${theme.badgeBg}`}>
                          {theme.tag}
                        </span>
                      )}
                    </div>

                    {/* Theme Name & Concise Feature (Reduced text) */}
                    <div className="mb-2">
                      <h4
                        onClick={() => setPreviewTheme(theme)}
                        className="text-xs sm:text-sm font-black text-white truncate cursor-pointer group-hover:text-amber-300 transition-colors"
                        title={theme.name}
                      >
                        {theme.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {theme.features?.[0] || theme.description}
                      </p>
                    </div>

                    {/* Bottom Row: Price & Action */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-1.5 mt-auto">
                      {/* Price / Owned status */}
                      <div className="font-mono min-w-0">
                        {owned ? (
                          <span className="text-emerald-400 text-[10px] sm:text-[11px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 shrink-0" />
                            <span className="truncate">Đã Có</span>
                          </span>
                        ) : (
                          <div className="flex items-center gap-0.5 font-mono">
                            <Coins className="w-3 h-3 text-amber-400 shrink-0" />
                            <span className={`text-[11px] sm:text-xs font-black truncate ${canAfford ? 'text-amber-300' : 'text-slate-400'}`}>
                              {theme.priceCoins.toLocaleString()}
                            </span>
                            <span className="text-[9px] text-amber-400/80 font-semibold hidden xs:inline">Xu</span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div>
                        {isEquipped ? (
                          <button
                            type="button"
                            onClick={() => handleEquipToggle(theme)}
                            className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95"
                            title="Đang sử dụng (Bấm để gỡ)"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        ) : owned ? (
                          <button
                            type="button"
                            onClick={() => handleEquipToggle(theme)}
                            className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-100 text-xs font-bold border border-white/10 transition-all cursor-pointer whitespace-nowrap active:scale-95 flex items-center justify-center"
                            title="Trang bị giao diện này"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={!canAfford || purchasingId === theme.id}
                            onClick={() => handlePurchase(theme)}
                            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl text-xs font-black flex items-center justify-center transition-all cursor-pointer whitespace-nowrap shadow-sm active:scale-95 ${
                              canAfford
                                ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/20'
                                : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                            }`}
                            title={`Mua với ${theme.priceCoins.toLocaleString()} Xu`}
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Help / Info box at bottom */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">Skins lưu vĩnh viễn trong kho đồ</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveModal('inventory')}
              className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-all flex items-center justify-center cursor-pointer shrink-0"
              title="Xem Túi Đồ"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <footer className="px-4 sm:px-6 py-2.5 sm:py-3 border-t border-white/10 bg-[#0a0a10] flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px] text-slate-400 truncate">Cập nhật mỗi tuần</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveModal('none')}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center"
            title="Đóng Cửa Hàng"
          >
            ✕
          </button>
        </footer>

        {/* ======================================================== */}
        {/* CONFIRM PURCHASE MODAL */}
        {/* ======================================================== */}
        {confirmPurchaseData && (
          <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#12121e] border border-cyan-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-3xl shadow-inner">
                  {confirmPurchaseData.product.icon}
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Xác Nhận Mua Hàng</h3>
                  <p className="text-xs text-slate-400">Kiểm tra thông tin giao dịch trước khi thanh toán</p>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between">
                  <span>Vật phẩm:</span>
                  <strong className="text-white font-sans">{confirmPurchaseData.product.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Số lượng:</span>
                  <strong className="text-amber-300">x{confirmPurchaseData.qty}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Hiệu ứng rèn:</span>
                  <strong className="text-emerald-400 font-sans">{confirmPurchaseData.product.bonusDescription}</strong>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/10 text-sm">
                  <span>Tổng thanh toán:</span>
                  <strong className="text-cyan-300 font-bold">{( (confirmPurchaseData.product.priceGems || 50) * confirmPurchaseData.qty ).toLocaleString()} 💎 Kim Cương</strong>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmPurchaseData(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-slate-200 transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={() => executePurchaseScroll(confirmPurchaseData.product, confirmPurchaseData.qty)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-500 to-blue-400 hover:from-cyan-400 hover:to-blue-300 text-slate-950 transition-all cursor-pointer shadow-lg shadow-cyan-500/30"
                >
                  Xác Nhận Mua
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ITEM INFO MODAL ((i)) */}
        {/* ======================================================== */}
        {infoModalProduct && (
          <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#12121e] border border-cyan-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-3xl shadow-xl">
                    {infoModalProduct.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">{infoModalProduct.name}</h3>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {infoModalProduct.tag}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInfoModalProduct(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-white/10">
                <div>
                  <span className="text-slate-400 block mb-1 font-bold">Mô tả vật phẩm:</span>
                  <p>{infoModalProduct.description}</p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1 font-bold">Hiệu ứng Lò Rèn:</span>
                  <span className="text-emerald-400 font-bold text-sm">{infoModalProduct.bonusDescription}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1 font-bold">Giá niêm yết:</span>
                  <span className="text-cyan-300 font-mono font-bold text-sm">{infoModalProduct.priceGems} 💎 Kim Cương / cái</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setInfoModalProduct(null)}
                  className="w-full py-2.5 rounded-xl text-xs font-black bg-white/10 hover:bg-white/15 text-white transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* INTERACTIVE LIVE PREVIEW DIALOG */}
        {/* ======================================================== */}
        {previewTheme && (
          <ThemePreviewDialog
            theme={previewTheme}
            isOwned={isItemOwned(previewTheme.id)}
            isEquipped={getEquippedSkinForGame(previewTheme.gameId)?.id === previewTheme.id}
            canAfford={profile.coins >= previewTheme.priceCoins}
            userCoins={profile.coins}
            onClose={() => setPreviewTheme(null)}
            onPurchase={() => handlePurchase(previewTheme)}
            onEquip={() => handleEquipToggle(previewTheme)}
            onPlayNow={() => handlePlayNow(previewTheme)}
          />
        )}
      </div>
    </div>
  );
};

// ========================================================
// THEME PREVIEW DIALOG (LIVE INTERACTIVE SHOWCASE)
// ========================================================
interface ThemePreviewDialogProps {
  theme: ShopTheme;
  isOwned: boolean;
  isEquipped: boolean;
  canAfford: boolean;
  userCoins: number;
  onClose: () => void;
  onPurchase: () => void;
  onEquip: () => void;
  onPlayNow: () => void;
}

const ThemePreviewDialog: React.FC<ThemePreviewDialogProps> = ({
  theme,
  isOwned,
  isEquipped,
  canAfford,
  userCoins,
  onClose,
  onPurchase,
  onEquip,
  onPlayNow,
}) => {
  return (
    <div
      id="theme-preview-overlay"
      className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
    >
      <div
        id="theme-preview-box"
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#11111c] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.03]">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{theme.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">{theme.name}</h3>
                <RarityBadge rarity={theme.rarity} />
              </div>
              <p className="text-xs text-slate-400">
                Giao diện độc quyền cho {theme.gameIcon} <strong>{theme.gameTitle}</strong>
              </p>
            </div>
          </div>
          <CloseButton onClick={onClose} />
        </div>

        {/* Interactive Visual Canvas Showcase */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-inner flex items-center justify-center min-h-[260px] sm:min-h-[300px]">
            {theme.previewType.startsWith('scoodoku') ? (
              <ScoodokuThemeLivePreview theme={theme} />
            ) : theme.previewType.startsWith('eat-em-all') ? (
              <EatEmAllThemeLivePreview theme={theme} />
            ) : theme.previewType.startsWith('shikaku') ? (
              <ShikakuThemeLivePreview theme={theme} />
            ) : (
              <GenericThemeLivePreview theme={theme} />
            )}
          </div>

          {/* Description & Features List */}
          <div className="space-y-3">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {theme.fullDescription}
            </p>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Chi Tiết Hiệu Ứng:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {theme.features.map((feat, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-xs text-slate-300 leading-tight"
                  >
                    <span className="text-emerald-400 font-black">✓</span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-white/10 bg-[#0a0a10]">
          <div>
            {isOwned ? (
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{isEquipped ? 'Đang được trang bị' : 'Đã có trong rương đồ'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-base font-black text-amber-300 font-mono">
                  {theme.priceCoins.toLocaleString()} Xu
                </span>
                {!canAfford && (
                  <span className="text-[11px] text-rose-400 font-semibold">
                    (Thiếu {(theme.priceCoins - userCoins).toLocaleString()} Xu)
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isOwned ? (
              <>
                <button
                  type="button"
                  onClick={onEquip}
                  title={isEquipped ? 'Gỡ Trang Bị' : 'Trang Bị Ngay'}
                  aria-label={isEquipped ? 'Gỡ Trang Bị' : 'Trang Bị Ngay'}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    isEquipped
                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onPlayNow}
                  title="Chơi Ngay"
                  aria-label="Chơi Ngay"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={!canAfford}
                onClick={onPurchase}
                title={canAfford ? 'Mua Theme Này' : 'Không Đủ Xu'}
                aria-label={canAfford ? 'Mua Theme Này' : 'Không Đủ Xu'}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${
                  canAfford
                    ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-lg shadow-amber-500/20'
                    : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================================
// LIVE INTERACTIVE PREVIEW FOR SCOODOKU THEMES
// ========================================================
const ScoodokuThemeLivePreview: React.FC<{ theme: ShopTheme }> = ({ theme }) => {
  const isRetro = theme.id === 'skin-scoodoku-retro';
  const isCyber = theme.id === 'skin-scoodoku-cyberpunk';
  const isZen = theme.id === 'skin-scoodoku-zen';

  const [selectedIdx, setSelectedIdx] = useState<number>(4);

  // Sample 4x4 Mini-Grid
  const sampleGrid = [
    [1, 2, 3, 4],
    [3, 4, 1, 2],
    [2, 1, 4, 3],
    [4, 3, 2, 1],
  ];

  return (
    <div
      className={`relative w-full max-w-xs p-4 rounded-2xl flex flex-col items-center justify-center select-none shadow-2xl transition-all ${
        isRetro
          ? 'bg-[#0a180a] border-4 border-emerald-500/80 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
          : isCyber
          ? 'bg-[#0f0b1e] border-2 border-fuchsia-500/70 shadow-[0_0_30px_rgba(217,70,239,0.3)]'
          : 'bg-[#f4ebd0] border-4 border-[#8c5a32] shadow-[0_10px_25px_rgba(0,0,0,0.5)]'
      }`}
    >
      {/* CRT Scanline Overlay for Retro */}
      {isRetro && (
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl opacity-35 z-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.75) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
            backgroundSize: '100% 4px, 6px 100%',
          }}
        />
      )}

      {/* Cyber Neon Glow Rays */}
      {isCyber && (
        <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-t from-fuchsia-500/10 via-transparent to-cyan-500/10" />
      )}

      {/* Header Pill on Board */}
      <div className="mb-2 text-center">
        <span
          className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
            isRetro
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50 font-mono animate-pulse'
              : isCyber
              ? 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/40'
              : 'bg-[#4a2e1b] text-[#eedec5]'
          }`}
        >
          {isRetro ? 'ARCADE 8-BIT CRT' : isCyber ? 'CYBER MATRIX 2077' : 'THIỀN ĐỊNH BÚT TÀU'}
        </span>
      </div>

      {/* 4x4 Cells */}
      <div
        className={`grid grid-cols-4 gap-1 p-2 rounded-xl w-full max-w-[220px] aspect-square ${
          isRetro
            ? 'bg-black/80 border border-emerald-500/30'
            : isCyber
            ? 'bg-black/70 border border-fuchsia-500/30'
            : 'bg-[#3b2010]'
        }`}
      >
        {sampleGrid.flat().map((val, i) => {
          const isSelected = selectedIdx === i;
          let cellStyle = '';

          if (isRetro) {
            cellStyle = isSelected
              ? 'bg-emerald-500 text-black font-black font-mono shadow-[0_0_15px_#10b981]'
              : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 font-mono font-bold border border-emerald-500/20';
          } else if (isCyber) {
            cellStyle = isSelected
              ? 'bg-fuchsia-600 text-white font-black shadow-[0_0_20px_#d946ef] ring-2 ring-cyan-400'
              : 'bg-purple-950/40 hover:bg-purple-900/50 text-cyan-300 font-black border border-purple-500/30';
          } else {
            cellStyle = isSelected
              ? 'bg-amber-400 text-stone-900 font-black ring-2 ring-amber-600'
              : 'bg-[#faf5eb] hover:bg-amber-50 text-stone-800 font-serif font-bold';
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                setSelectedIdx(i);
                soundEngine.play('click');
              }}
              className={`flex items-center justify-center rounded-lg text-lg transition-all cursor-pointer active:scale-95 ${cellStyle}`}
            >
              {val}
            </button>
          );
        })}
      </div>

      <span className="mt-2 text-[10px] text-slate-400 font-medium">
        (Nhấn vào các ô để thử hiệu ứng giao diện)
      </span>
    </div>
  );
};

// ========================================================
// LIVE INTERACTIVE PREVIEW FOR EAT 'EM ALL THEMES
// ========================================================
const EatEmAllThemeLivePreview: React.FC<{ theme: ShopTheme }> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isNeon = theme.id === 'skin-eat-em-all-neon';
  const isCyber = theme.id === 'skin-eat-em-all-cyber';
  const isDragon = theme.id === 'skin-eat-em-all-dragon';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;
    const trail: Array<{ x: number; y: number; time: number }> = [];
    const particles: Array<{ x: number; y: number; vx: number; vy: number; color: string; life: number }> = [];

    const render = () => {
      t += 0.04;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Path equation (figure 8 loop)
      const cx = w / 2 + Math.sin(t * 1.5) * (w * 0.3);
      const cy = h / 2 + Math.cos(t * 3) * (h * 0.22);

      trail.unshift({ x: cx, y: cy, time: Date.now() });
      if (trail.length > 25) trail.pop();

      // Spawn ambient particles
      if (Math.random() < 0.4) {
        let pColor = '#06b6d4';
        if (isNeon) pColor = Math.random() > 0.5 ? '#06b6d4' : '#ec4899';
        else if (isCyber) pColor = '#10b981';
        else if (isDragon) pColor = Math.random() > 0.5 ? '#f59e0b' : '#ef4444';

        particles.push({
          x: cx + (Math.random() - 0.5) * 12,
          y: cy + (Math.random() - 0.5) * 12,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 - 0.5,
          color: pColor,
          life: 1,
        });
      }

      // Draw Trail Ribbon
      if (trail.length > 1) {
        for (let i = 0; i < trail.length - 1; i++) {
          const p1 = trail[i];
          const p2 = trail[i + 1];
          const alpha = (1 - i / trail.length) * 0.8;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);

          if (isNeon) {
            ctx.strokeStyle = i % 2 === 0 ? `rgba(6, 182, 212, ${alpha})` : `rgba(236, 72, 153, ${alpha})`;
            ctx.lineWidth = (1 - i / trail.length) * 20;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#06b6d4';
          } else if (isCyber) {
            ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
            ctx.lineWidth = (1 - i / trail.length) * 16;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#10b981';
          } else if (isDragon) {
            ctx.strokeStyle = `rgba(245, 158, 11, ${alpha})`;
            ctx.lineWidth = (1 - i / trail.length) * 22;
            ctx.shadowBlur = 16;
            ctx.shadowColor = '#f59e0b';
          }
          ctx.lineCap = 'round';
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
      }

      // Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 0.03;
        if (pt.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.life;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Draw Character Head / Blob
      ctx.save();
      ctx.translate(cx, cy);

      // Outer Aura
      const aura = ctx.createRadialGradient(0, 0, 10, 0, 0, 32);
      if (isNeon) {
        aura.addColorStop(0, 'rgba(6, 182, 212, 0.7)');
        aura.addColorStop(1, 'rgba(236, 72, 153, 0)');
      } else if (isCyber) {
        aura.addColorStop(0, 'rgba(16, 185, 129, 0.7)');
        aura.addColorStop(1, 'rgba(16, 185, 129, 0)');
      } else {
        aura.addColorStop(0, 'rgba(245, 158, 11, 0.8)');
        aura.addColorStop(1, 'rgba(239, 68, 68, 0)');
      }
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, 32, 0, Math.PI * 2);
      ctx.fill();

      // Main Body
      ctx.fillStyle = isNeon ? '#06b6d4' : isCyber ? '#10b981' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-5, -3, 4, 0, Math.PI * 2);
      ctx.arc(5, -3, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0a0a10';
      ctx.beginPath();
      ctx.arc(-4, -3, 2, 0, Math.PI * 2);
      ctx.arc(6, -3, 2, 0, Math.PI * 2);
      ctx.fill();

      // Happy Smile
      ctx.strokeStyle = '#0a0a10';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 4, 6, 0.2, Math.PI - 0.2);
      ctx.stroke();

      // Custom Headwear
      if (isDragon) {
        // Crown
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(-10, -14);
        ctx.lineTo(-6, -22);
        ctx.lineTo(0, -16);
        ctx.lineTo(6, -22);
        ctx.lineTo(10, -14);
        ctx.closePath();
        ctx.fill();
      } else if (isCyber) {
        // Cyber Visor
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, -3, 9, Math.PI, 0);
        ctx.stroke();
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isNeon, isCyber, isDragon]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <canvas
        ref={canvasRef}
        width={400}
        height={240}
        className="w-full max-w-sm h-[200px] object-contain rounded-xl"
      />
      <div className="absolute bottom-2 inset-x-0 text-center">
        <span className="text-[10px] text-cyan-300/80 font-mono bg-black/60 px-2 py-0.5 rounded-full border border-white/10">
          Mô phỏng chuyển động thực tế trong game
        </span>
      </div>
    </div>
  );
};

// ========================================================
// SHIKAKU THEME LIVE PREVIEW
// ========================================================
const ShikakuThemeLivePreview: React.FC<{ theme: ShopTheme }> = ({ theme }) => {
  const isNeon = theme.id === 'skin-shikaku-neon';
  const isPastel = theme.id === 'skin-shikaku-pastel';

  const bgClass = isNeon ? 'bg-[#0a0a1a] border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 
                  (isPastel ? 'bg-[#fdf2f8] border-pink-200' : 'bg-slate-200 border-slate-400');

  const rects = [
    { id: '1', r: 0, c: 0, w: 2, h: 2, color: isNeon ? '#06b6d4' : (isPastel ? '#f9a8d4' : '#60a5fa'), hint: 4 },
    { id: '2', r: 0, c: 2, w: 2, h: 1, color: isNeon ? '#ec4899' : (isPastel ? '#fcd34d' : '#f472b6'), hint: 2 },
    { id: '3', r: 1, c: 2, w: 2, h: 3, color: isNeon ? '#10b981' : (isPastel ? '#86efac' : '#34d399'), hint: 6 },
    { id: '4', r: 2, c: 0, w: 2, h: 2, color: isNeon ? '#8b5cf6' : (isPastel ? '#d8b4fe' : '#a78bfa'), hint: 4 },
  ];

  return (
    <div className={`relative w-full max-w-[200px] aspect-square rounded-xl border-4 overflow-hidden ${bgClass} p-0`}>
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className={`border ${isNeon ? 'border-cyan-900/30' : (isPastel ? 'border-pink-300/30' : 'border-slate-300/80')}`} />
        ))}
      </div>
      
      {rects.map(r => (
        <div key={r.id} className="absolute flex items-center justify-center font-black text-xl" style={{
          top: `${(r.r / 4) * 100}%`,
          left: `${(r.c / 4) * 100}%`,
          width: `${(r.w / 4) * 100}%`,
          height: `${(r.h / 4) * 100}%`,
          backgroundColor: r.color,
          opacity: 0.9,
          border: isNeon ? '2px solid rgba(255,255,255,0.7)' : (isPastel ? '3px solid rgba(255,255,255,0.8)' : '2px solid rgba(0,0,0,0.3)'),
          borderRadius: isPastel ? '8px' : '4px',
          boxShadow: isNeon ? `0 0 10px ${r.color}` : 'none',
          color: isPastel ? 'white' : 'white',
          textShadow: isNeon ? '0 0 4px rgba(255,255,255,0.5)' : '0 1px 2px rgba(0,0,0,0.3)'
        }}>
          {r.hint}
        </div>
      ))}
    </div>
  );
};

// ========================================================
// GENERIC THEME PREVIEW
// ========================================================
const GenericThemeLivePreview: React.FC<{ theme: ShopTheme }> = ({ theme }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div
        className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-2xl border border-white/20 animate-pulse"
        style={{
          backgroundColor: `${theme.accentColor}30`,
          boxShadow: `0 0 40px ${theme.accentColor}50`,
        }}
      >
        {theme.icon}
      </div>
      <div className="text-center space-y-1">
        <h4 className="text-lg font-black text-white">{theme.name}</h4>
        <p className="text-xs text-slate-400 max-w-xs">{theme.description}</p>
      </div>
    </div>
  );
};
