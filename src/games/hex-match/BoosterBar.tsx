import React from 'react';
import { Booster, BoosterType } from './types';
import { Hammer, Zap, Sparkles, Shuffle, Plus, ShoppingBag } from 'lucide-react';

interface BoosterBarProps {
  boosters: Booster[];
  activeBooster: BoosterType | null;
  onSelectBooster: (type: BoosterType | null) => void;
  onOpenShop?: () => void;
  disabled?: boolean;
}

export const BoosterBar: React.FC<BoosterBarProps> = ({
  boosters,
  activeBooster,
  onSelectBooster,
  onOpenShop,
  disabled,
}) => {
  const getIcon = (type: BoosterType) => {
    switch (type) {
      case 'hammer':
        return <Hammer className="w-4 h-4 text-amber-400" />;
      case 'rocket':
        return <Zap className="w-4 h-4 text-cyan-400" />;
      case 'color_bomb':
        return <Sparkles className="w-4 h-4 text-rose-400" />;
      case 'shuffle':
        return <Shuffle className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-2 flex items-center justify-between gap-2 shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 pl-1">
        <span className="hidden sm:inline">Trợ lực:</span>
        {onOpenShop && (
          <button
            type="button"
            onClick={onOpenShop}
            title="Mua thêm Trợ Lực bằng Arcade Coins"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[10px] font-black transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            <ShoppingBag className="w-3 h-3 text-amber-400" />
            <span className="hidden xs:inline">Shop</span>
            <Plus className="w-2.5 h-2.5 text-amber-300" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-around w-full sm:w-auto gap-1.5 sm:gap-2">
        {boosters.map((b) => {
          const isActive = activeBooster === b.id;
          const isUsable = b.count > 0 && !disabled;

          return (
            <button
              key={b.id}
              type="button"
              disabled={!isUsable && !onOpenShop}
              onClick={() => {
                if (b.count <= 0 && onOpenShop) {
                  onOpenShop();
                  return;
                }
                if (isActive) {
                  onSelectBooster(null);
                } else {
                  onSelectBooster(b.id);
                }
              }}
              title={
                b.count > 0
                  ? `${b.name}: ${b.description}`
                  : `${b.name} (Đã hết - Bấm để nạp thêm trong Shop)`
              }
              className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105'
                  : isUsable
                  ? 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 hover:border-slate-600'
                  : 'bg-slate-950/40 text-slate-500 border border-slate-800/50 hover:border-amber-500/30 hover:text-amber-300'
              }`}
            >
              {getIcon(b.id)}
              <span className="hidden md:inline">{b.name}</span>

              {/* Count badge */}
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-black ${
                  isActive
                    ? 'bg-slate-950 text-amber-300'
                    : isUsable
                    ? 'bg-slate-700 text-slate-300 border border-slate-600'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {b.count > 0 ? b.count : '+'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
