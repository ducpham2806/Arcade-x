const fs = require('fs');
const content = `import React, { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useInventory } from '../context/InventoryContext';
import { useGame } from '../context/GameContext';
import { DAILY_LOGIN_REWARDS_LIST } from '../services/storage';
import { DailyLoginRewardItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Sparkles,
  Coins,
  Gem,
  Zap,
  CheckCircle2,
  X,
  Flame,
  Gift,
  Lock,
  Crown,
  Package,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface DailyLoginRewardModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const DailyLoginRewardModal: React.FC<DailyLoginRewardModalProps> = ({
  forceOpen = false,
  onClose,
}) => {
  const { profile, claimDailyLoginReward } = usePlayer();
  const { addChest, grantItemById } = useInventory();
  const { activeModal, setActiveModal, triggerConfetti } = useGame();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasAutoTriggered, setHasAutoTriggered] = useState<boolean>(false);
  const [justClaimedReward, setJustClaimedReward] = useState<DailyLoginRewardItem | null>(null);
  const [showClaimSuccess, setShowClaimSuccess] = useState<boolean>(false);

  const today = new Date().toISOString().split('T')[0];
  const isClaimedToday = profile.stats.lastLoginDate === today;
  const currentStreak = profile.stats.dailyStreak;
  
  // Calculate which day the user is targeting (1 to 7)
  let targetDay = 1;
  if (isClaimedToday) {
    targetDay = currentStreak % 7;
    if (targetDay === 0) targetDay = 7;
  } else {
    targetDay = (currentStreak + 1) % 7;
    if (targetDay === 0) targetDay = 7;
  }

  const currentReward =
    DAILY_LOGIN_REWARDS_LIST.find((r) => r.day === targetDay) || DAILY_LOGIN_REWARDS_LIST[0];

  // Auto popup on open if unclaimed
  useEffect(() => {
    if (!hasAutoTriggered && !isClaimedToday) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasAutoTriggered(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasAutoTriggered, isClaimedToday]);

  // Sync with activeModal
  useEffect(() => {
    if (activeModal === 'dailyReward' || forceOpen) {
      setIsOpen(true);
    } else if (!forceOpen && hasAutoTriggered) {
      // If modal was changed from outside
      if (activeModal !== 'none') {
        setIsOpen(false);
      }
    }
  }, [activeModal, forceOpen, hasAutoTriggered]);

  const handleClose = () => {
    setIsOpen(false);
    if (activeModal === 'dailyReward') {
      setActiveModal('none');
    }
    if (onClose) onClose();
  };

  const handleClaim = () => {
    if (isClaimedToday) return;

    // Distribute special items if configured
    if (currentReward.bonusItem) {
      if (currentReward.bonusItem.includes('chest')) {
        const rarity = currentReward.bonusItem.split('-')[0] as 'common' | 'rare' | 'epic' | 'legendary';
        addChest(rarity);
      } else {
        grantItemById(currentReward.bonusItem, 1);
      }
    }

    claimDailyLoginReward(currentReward.coins, currentReward.gems, currentReward.exp);
    setJustClaimedReward(currentReward);
    setShowClaimSuccess(true);
    triggerConfetti();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
      <div className="max-w-4xl w-full bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl relative my-auto overflow-hidden">
        
        {/* Header BG Banner */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-[#0a0a0a] border-b border-white/5 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 shadow-lg shadow-orange-500/20 flex items-center justify-center text-white shrink-0">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 uppercase tracking-tight mb-1 font-display">
                  Điểm Danh Bảy Ngày
                </h2>
                <p className="text-sm text-indigo-200 font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Đăng nhập liên tục để nhận thưởng siêu cấp!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-black/40 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Chuỗi Hiện Tại</span>
                <div className="flex items-center gap-1.5 text-xl font-black text-white font-mono">
                  <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                  {currentStreak} <span className="text-sm text-slate-500 font-medium">Ngày</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-transparent hover:border-rose-500/50 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Track View */}
        <div className="p-6 sm:p-8 relative">
           {/* Connection Line */}
           <div className="absolute top-1/2 left-8 right-8 h-2 bg-[#141414] rounded-full -translate-y-1/2 hidden md:block">
             <div 
                className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                style={{ width: \`\${(targetDay - (isClaimedToday ? 0 : 1)) / 7 * 100}%\` }}
             />
           </div>

           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4 relative z-10">
             {DAILY_LOGIN_REWARDS_LIST.map((item, idx) => {
                const isPast = isClaimedToday ? targetDay >= item.day : targetDay > item.day;
                const isToday = targetDay === item.day;
                const isClaimableNow = isToday && !isClaimedToday;
                const isMilestone = item.day === 7;

                return (
                  <motion.div
                    key={item.day}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className={\`relative rounded-2xl flex flex-col \${
                      isMilestone ? 'col-span-2 sm:col-span-3 md:col-span-1 md:row-span-1' : ''
                    }\`}
                  >
                    {/* Day Pill */}
                    <div className="flex justify-center mb-3">
                       <div className={\`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 \${
                         isPast ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                         isClaimableNow ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30' :
                         'bg-[#141414] text-slate-400 border border-white/10'
                       }\`}>
                         {isPast ? <CheckCircle2 className="w-3 h-3" /> : (isMilestone ? <Crown className="w-3 h-3" /> : <Calendar className="w-3 h-3" />)}
                         Ngày {item.day}
                       </div>
                    </div>

                    {/* Reward Card */}
                    <div className={\`flex-1 rounded-2xl p-4 border flex flex-col items-center text-center transition-transform \${
                      isClaimableNow
                        ? 'bg-gradient-to-b from-indigo-900/80 to-[#141414] border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.3)] scale-105 z-20'
                        : isPast
                        ? 'bg-[#0a0a0a] border-emerald-500/30 opacity-70'
                        : isMilestone
                        ? 'bg-gradient-to-b from-amber-900/30 to-[#141414] border-amber-500/30'
                        : 'bg-[#141414] border-white/5'
                    }\`}>
                       {/* Icon */}
                       <div className={\`w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-3 shadow-inner \${
                         isClaimableNow ? 'bg-indigo-500/20 border-2 border-indigo-400 animate-pulse' :
                         isMilestone ? 'bg-amber-500/20 border border-amber-500/50' :
                         'bg-[#0a0a0a] border border-white/10'
                       }\`}>
                         {item.icon}
                       </div>
                       
                       <h4 className={\`text-xs font-bold mb-3 h-8 flex items-center justify-center \${
                         isClaimableNow ? 'text-indigo-300' : isMilestone ? 'text-amber-400' : 'text-slate-300'
                       }\`}>
                         {item.title}
                       </h4>

                       <div className="space-y-1.5 w-full mt-auto">
                          <div className="flex justify-between items-center bg-[#050505] px-2 py-1 rounded border border-white/5">
                            <Coins className="w-3 h-3 text-yellow-500" />
                            <span className="text-[10px] font-mono text-yellow-400 font-bold">{item.coins}</span>
                          </div>
                          {item.gems > 0 && (
                            <div className="flex justify-between items-center bg-[#050505] px-2 py-1 rounded border border-white/5">
                              <Gem className="w-3 h-3 text-blue-400" />
                              <span className="text-[10px] font-mono text-blue-400 font-bold">{item.gems}</span>
                            </div>
                          )}
                          {item.bonusItem && (
                            <div className="flex justify-between items-center bg-[#050505] px-2 py-1 rounded border border-white/5">
                              <Package className="w-3 h-3 text-purple-400" />
                              <span className="text-[9px] font-mono text-purple-400 font-bold uppercase truncate max-w-[40px]">{item.bonusItem.split('-')[0]}</span>
                            </div>
                          )}
                       </div>
                    </div>
                  </motion.div>
                );
             })}
           </div>

           {/* Action Bottom */}
           <div className="mt-8 flex justify-center relative z-20">
             {isClaimedToday ? (
                <div className="px-6 py-3 rounded-xl bg-[#141414] border border-white/10 flex items-center gap-3 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                  Bạn đã nhận quà hôm nay. Hãy quay lại vào ngày mai!
                </div>
             ) : (
                <button
                  onClick={handleClaim}
                  className="px-10 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-black uppercase tracking-widest text-lg shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all hover:scale-105 flex items-center gap-3"
                >
                  <Gift className="w-6 h-6" />
                  Nhận Quà Ngay
                </button>
             )}
           </div>
        </div>

        {/* Claim Success Overlay */}
        <AnimatePresence>
          {showClaimSuccess && justClaimedReward && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.5, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                className="max-w-sm w-full bg-gradient-to-b from-[#1a1a2e] to-[#0a0a0a] rounded-3xl p-8 text-center border border-indigo-500/50 shadow-[0_0_50px_rgba(99,102,241,0.3)] relative overflow-hidden"
              >
                {/* FX */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-40 bg-indigo-500/20 blur-[50px] rounded-full pointer-events-none" />

                <motion.div 
                  animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="text-7xl mb-4 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]"
                >
                  {justClaimedReward.icon}
                </motion.div>
                <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-400 uppercase tracking-widest mb-1">
                  Đã Nhận Thưởng
                </h3>
                <p className="text-indigo-200 text-sm mb-6">{justClaimedReward.title}</p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-[#050505] p-3 rounded-xl border border-white/5 shadow-inner">
                    <Coins className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                    <div className="text-yellow-400 font-bold font-mono text-lg">+{justClaimedReward.coins}</div>
                  </div>
                  {justClaimedReward.gems > 0 && (
                    <div className="bg-[#050505] p-3 rounded-xl border border-white/5 shadow-inner">
                      <Gem className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                      <div className="text-blue-400 font-bold font-mono text-lg">+{justClaimedReward.gems}</div>
                    </div>
                  )}
                  <div className="bg-[#050505] p-3 rounded-xl border border-white/5 shadow-inner col-span-2">
                    <Zap className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                    <div className="text-emerald-400 font-bold font-mono text-lg">+{justClaimedReward.exp} EXP</div>
                  </div>
                  {justClaimedReward.bonusItem && (
                    <div className="bg-[#050505] p-3 rounded-xl border border-white/5 shadow-inner col-span-2 flex items-center justify-center gap-2">
                      <Package className="w-5 h-5 text-purple-400" />
                      <div className="text-purple-400 font-bold font-mono text-sm uppercase">{justClaimedReward.bonusItem.split('-')[0]} Box x1</div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowClaimSuccess(false)}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase text-sm tracking-widest shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-all"
                >
                  Xác Nhận
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
`
fs.writeFileSync('src/components/DailyLoginRewardModal.tsx', content);
