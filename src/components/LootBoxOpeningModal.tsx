import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Sparkles, Coins, Gem, Trophy, ArrowRight, Shield, Sword, Star } from 'lucide-react';
import { ChestOpenResult } from '../context/InventoryContext';
import { soundEngine } from '../services/audio';
import { hapticService } from '../services/haptics';
import { getRarityInfo, RarityBadge } from '../utils/rarity';
import confetti from 'canvas-confetti';

interface LootBoxOpeningModalProps {
  chestType: 'common' | 'rare' | 'epic' | 'legendary' | null;
  result: ChestOpenResult | null;
  remainingChestsCount?: number;
  onOpenNext?: () => void;
  onClose: () => void;
}

export const LootBoxOpeningModal: React.FC<LootBoxOpeningModalProps> = ({
  chestType,
  result,
  remainingChestsCount = 0,
  onOpenNext,
  onClose,
}) => {
  const [phase, setPhase] = useState<'inspect' | 'shaking' | 'revealed'>('inspect');
  
  const [skipAnimation, setSkipAnimation] = useState<boolean>(() => {
    try { return localStorage.getItem('arcadex_skip_chest_anim') === 'true'; } catch { return false; }
  });

  const previousResultRef = React.useRef<ChestOpenResult | null>(null);

  useEffect(() => {
    if (chestType && result) {
      if (result !== previousResultRef.current) {
        previousResultRef.current = result;
        if (skipAnimation) {
          setPhase('revealed');
          setTimeout(() => {
            soundEngine.play('win');
            confetti({
              particleCount: 100,
              spread: 80,
              origin: { y: 0.5 },
            });
          }, 50);
        } else {
          setPhase('inspect');
        }
      }
    }
  }, [chestType, result, skipAnimation]);

  if (!chestType) return null;

  const handleSkipAnimationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setSkipAnimation(isChecked);
    try {
      if (isChecked) localStorage.setItem('arcadex_skip_chest_anim', 'true');
      else localStorage.removeItem('arcadex_skip_chest_anim');
    } catch {}
  };

  const handleStartOpening = () => {
    soundEngine.play('powerup');
    hapticService.claimReward();
    
    if (skipAnimation) {
      setPhase('revealed');
      soundEngine.play('win');
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    } else {
      setPhase('shaking');
      // After 2.2 seconds of shaking/aura buildup, reveal reward
      setTimeout(() => {
        setPhase('revealed');
        soundEngine.play('win');
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        });
      }, 2200);
    }
  };

  const chestNames = {
    common: 'Rương Thường',
    rare: 'Rương Hiếm',
    epic: 'Rương Sử Thi',
    legendary: 'Rương Huyền Thoại',
  };

  const chestGlows = {
    common: 'from-slate-500/30 to-blue-500/20 border-slate-400/40',
    rare: 'from-blue-600/40 to-cyan-500/30 border-blue-400/50',
    epic: 'from-purple-600/40 to-indigo-500/30 border-purple-400/60',
    legendary: 'from-amber-500/50 via-orange-600/40 to-purple-600/40 border-amber-400/80',
  };

  const isHighRarity = phase === 'revealed' && result?.item && (result.item.rarity === 'epic' || result.item.rarity === 'legendary');

  return (
    <div
      onClick={() => {
        if (phase === 'revealed') {
          soundEngine.play('click');
          onClose();
        }
      }}
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg overflow-y-auto animate-in fade-in duration-200"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md h-[460px] sm:h-[480px] bg-gradient-to-b ${chestGlows[chestType]} border-2 rounded-3xl shadow-2xl p-5 sm:p-6 text-center overflow-hidden flex flex-col justify-between items-center select-none`}
      >
        {/* Background Light Rays */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none animate-pulse" />
        
        {/* High Rarity Background Glow */}
        {isHighRarity && (
          <div className="absolute inset-0 bg-gradient-to-t from-amber-500/30 via-orange-500/10 to-transparent blur-xl pointer-events-none animate-pulse z-0" />
        )}

        {phase === 'inspect' && (
          <div className="relative z-10 w-full h-full flex flex-col justify-between items-center py-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white font-bold text-xs border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 pointer-events-none" />
              <span>SẴN SÀNG MỞ HỘP</span>
            </div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-3xl bg-black/50 border-2 border-white/20 flex items-center justify-center text-4xl sm:text-5xl shadow-2xl shadow-indigo-500/30"
            >
              📦
            </motion.div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-display uppercase tracking-wide">
                {chestNames[chestType]}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-1 max-w-xs mx-auto px-4">
                Nhấn vào nút bên dưới để khởi động nghi thức mở rương và nhận phần thưởng quý hiếm!
              </p>
            </div>

            <button
              type="button"
              onClick={handleStartOpening}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-orange-600/40 transition-colors cursor-pointer flex items-center justify-center gap-2 active:scale-95 touch-manipulation select-none"
            >
              <Sparkles className="w-4 h-4 pointer-events-none" />
              <span className="pointer-events-none">Mở Ngay Lập Tức</span>
            </button>
          </div>
        )}

        {phase === 'shaking' && (
          <div className="relative z-10 w-full h-full flex flex-col justify-center items-center py-6">
            <motion.div
              animate={{
                rotate: [-8, 8, -8, 8, -12, 12, 0],
                scale: [1, 1.1, 1, 1.15, 1.2, 1],
              }}
              transition={{ repeat: Infinity, duration: 0.3 }}
              className="w-28 h-28 sm:w-32 sm:h-32 mx-auto rounded-3xl bg-black/60 border-2 border-amber-400 flex items-center justify-center text-5xl sm:text-6xl shadow-[0_0_50px_rgba(245,158,11,0.6)]"
            >
              🎁
            </motion.div>
            <div className="text-amber-300 font-black text-base animate-pulse uppercase tracking-wider font-display mt-6">
              Đang mở khóa năng lượng rương...
            </div>
          </div>
        )}

        {phase === 'revealed' && result && (
          <div className="relative z-10 w-full h-full flex flex-col justify-between py-1">
            {/* Top Status Badge */}
            <div className="flex justify-center">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs border ${isHighRarity ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'}`}>
                <Sparkles className={`w-3.5 h-3.5 pointer-events-none ${isHighRarity ? 'text-amber-400' : 'text-emerald-400'}`} />
                <span className="pointer-events-none">{isHighRarity ? 'VẬT PHẨM SIÊU HIẾM!' : 'MỞ RƯƠNG THÀNH CÔNG!'}</span>
              </div>
            </div>
            
            {/* Currencies Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 sm:p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 sm:gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                  <Coins className="w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-[9px] sm:text-[10px] text-amber-300 font-semibold truncate">Arcade Coins</div>
                  <div className="text-sm sm:text-base font-extrabold font-mono text-amber-400 truncate">+{result.coins}</div>
                </div>
              </div>
              
              <div className="p-2.5 sm:p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center gap-2 sm:gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
                  <Gem className="w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-[9px] sm:text-[10px] text-blue-300 font-semibold truncate">Kim Cương</div>
                  <div className="text-sm sm:text-base font-extrabold font-mono text-blue-400 truncate">+{result.gems}</div>
                </div>
              </div>
            </div>

            {/* Dedicated Fixed Item Slot (Consistent 76px height prevents popup resizing / jumping) */}
            <div className="w-full h-[76px] flex items-center shrink-0">
              {result.item ? (
                <div className={`w-full h-full p-2.5 sm:p-3 rounded-xl bg-black/60 border flex items-center gap-3 text-left shadow-xl ${isHighRarity ? 'border-amber-500/50 shadow-amber-500/20 bg-gradient-to-r from-amber-500/10 to-transparent' : 'border-white/20'}`}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-indigo-400/40 flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-inner">
                    {result.item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <RarityBadge rarity={result.item.rarity} />
                      {result.isNewItem && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-black text-[9px] border border-rose-500/40 shrink-0">
                          MỚI!
                        </span>
                      )}
                    </div>
                    <h4 className="text-[13px] sm:text-sm font-extrabold text-white truncate">{result.item.name}</h4>
                    <p className="text-[10px] sm:text-[11px] text-slate-300 line-clamp-1 leading-snug">{result.item.description}</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full p-2.5 sm:p-3 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center gap-2.5 text-center">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 shrink-0">
                    <Package className="w-5 h-5 text-slate-500 pointer-events-none" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-300">Không có trang bị bổ sung</div>
                    <div className="text-[10px] text-slate-400">Lần mở này chỉ nhận Vàng & Kim Cương</div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 w-full">
              {remainingChestsCount > 0 && onOpenNext && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    soundEngine.play('click');
                    onOpenNext();
                  }}
                  className="w-full py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 active:scale-95 text-slate-950 font-extrabold text-[13px] sm:text-sm shadow-lg shadow-orange-600/40 transition-colors cursor-pointer flex items-center justify-center gap-2 touch-manipulation select-none"
                >
                  <Sparkles className="w-4 h-4 pointer-events-none" />
                  <span className="pointer-events-none">Mở tiếp ({remainingChestsCount})</span>
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  soundEngine.play('click');
                  onClose();
                }}
                className={`w-full py-3 sm:py-3.5 rounded-xl active:scale-95 font-extrabold text-[13px] sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 touch-manipulation select-none ${
                  remainingChestsCount > 0 && onOpenNext
                  ? 'bg-black/40 hover:bg-black/60 text-slate-300 border border-white/10'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                }`}
              >
                <span className="pointer-events-none">Thu Thập Phần Thưởng</span>
                <ArrowRight className="w-4 h-4 pointer-events-none" />
              </button>
            </div>

            {/* Checkbox */}
            <label className="flex items-center justify-center gap-2 pt-0.5 cursor-pointer group touch-manipulation select-none">
              <input
                type="checkbox"
                checked={skipAnimation}
                onChange={handleSkipAnimationChange}
                className="w-4 h-4 rounded bg-black/50 border-white/20 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-[11px] sm:text-xs text-slate-300 group-hover:text-white transition-colors select-none">
                Bỏ qua hiệu ứng mở rương
              </span>
            </label>
          </div>
        )}
      </motion.div>
    </div>
  );
};
