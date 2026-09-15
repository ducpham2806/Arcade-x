import React, { useState } from 'react';
import {
  HEX_BOOSTER_PRODUCTS,
  BoosterProduct,
  addBoostersToInventory,
  addBundleToInventory,
  getStoredHexBoosters,
} from './boosterData';
import { usePlayer } from '../../context/PlayerContext';
import { soundEngine } from '../../services/audio';
import { X, Coins, ShoppingBag, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface HexBoosterShopModalProps {
  onClose: () => void;
  onPurchased?: () => void;
}

export const HexBoosterShopModal: React.FC<HexBoosterShopModalProps> = ({
  onClose,
  onPurchased,
}) => {
  const { profile, spendCoins } = usePlayer();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [currentBoosters, setCurrentBoosters] = useState(getStoredHexBoosters());

  const handleBuy = (product: BoosterProduct) => {
    if (profile.coins < product.priceCoins) {
      soundEngine.play('error');
      setFeedback({
        type: 'error',
        text: `Bạn không đủ Arcade Coins! Cần thêm ${(
          product.priceCoins - profile.coins
        ).toLocaleString()} Xu.`,
      });
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
      setFeedback({
        type: 'success',
        text: `Đã mua thành công ${product.name}!`,
      });
      if (onPurchased) onPurchased();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white font-display">
                Cửa Hàng Trợ Lực Kẹo
              </h2>
              <p className="text-[11px] text-slate-400">
                Mua thêm Búa, Kẹo Sọc, Bom Cầu Vồng bằng Arcade Coins
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Player Coins */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 font-black text-xs text-amber-300 font-mono">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{profile.coins.toLocaleString()}</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current Inventory Summary Bar */}
        <div className="flex items-center justify-between py-2 px-3 bg-slate-950/70 border border-slate-800 rounded-2xl my-2 text-xs">
          <span className="text-slate-400 font-bold">Kho Trợ Lực Hiện Có:</span>
          <div className="flex items-center gap-3 font-mono font-bold text-slate-200">
            <span title="Búa Kẹo">🔨 {currentBoosters.hammer}</span>
            <span title="Kẹo Sọc">⚡ {currentBoosters.rocket}</span>
            <span title="Bom Cầu Vồng">💣 {currentBoosters.color_bomb}</span>
            <span title="Xáo Trộn">🔄 {currentBoosters.shuffle}</span>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold mb-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
            }`}
          >
            <div className="flex items-center gap-1.5">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-white text-xs ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Products List */}
        <div className="flex-1 overflow-y-auto py-1 space-y-2.5">
          {HEX_BOOSTER_PRODUCTS.map((prod) => {
            const canAfford = profile.coins >= prod.priceCoins;

            return (
              <div
                key={prod.id}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                  prod.isBundle
                    ? 'bg-gradient-to-r from-purple-950/40 via-indigo-950/50 to-slate-900 border-purple-500/40'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl shadow-inner shrink-0">
                    {prod.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs sm:text-sm font-black text-white truncate">
                        {prod.name}
                      </h4>
                      {prod.tag && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                          {prod.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                      {prod.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleBuy(prod)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-md ${
                    canAfford
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 active:scale-95 shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>{prod.priceCoins.toLocaleString()} Xu</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-800 text-center text-[10px] text-slate-400">
          💡 Bạn có thể kiếm thêm Arcade Coins khi chơi các màn, vượt ải và hoàn thành Nhiệm Vụ Hàng Ngày!
        </div>
      </div>
    </div>
  );
};
