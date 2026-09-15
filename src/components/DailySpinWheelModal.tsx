import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, Coins, Gem, Gift, RotateCw, CheckCircle2, ArrowRight } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useGame } from '../context/GameContext';
import { CloseButton } from './common/CloseButton';
import { soundEngine } from '../services/audio';

interface WheelSlice {
  id: number;
  label: string;
  coins: number;
  gems: number;
  color: string;
  textColor: string;
}

const SLICES: WheelSlice[] = [
  { id: 0, label: '500 Coins', coins: 500, gems: 0, color: '#f59e0b', textColor: '#000000' },
  { id: 1, label: '20 Gems', coins: 0, gems: 20, color: '#3b82f6', textColor: '#ffffff' },
  { id: 2, label: '200 Coins', coins: 200, gems: 0, color: '#10b981', textColor: '#ffffff' },
  { id: 3, label: '50 Gems', coins: 0, gems: 50, color: '#8b5cf6', textColor: '#ffffff' },
  { id: 4, label: '1000 Coins', coins: 1000, gems: 0, color: '#ef4444', textColor: '#ffffff' },
  { id: 5, label: '10 Gems', coins: 0, gems: 10, color: '#06b6d4', textColor: '#ffffff' },
  { id: 6, label: '300 Coins', coins: 300, gems: 0, color: '#ec4899', textColor: '#ffffff' },
  { id: 7, label: '100 Gems', coins: 0, gems: 100, color: '#f97316', textColor: '#ffffff' },
];

export const DailySpinWheelModal: React.FC = () => {
  const { profile, spinDailyWheel } = usePlayer();
  const { activeModal, setActiveModal } = useGame();

  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [wonPrize, setWonPrize] = useState<WheelSlice | null>(null);

  if (activeModal !== 'spinWheel') return null;

  const today = new Date().toISOString().split('T')[0];
  const hasSpunToday = profile.stats.lastSpinDate === today;

  const handleSpin = () => {
    if (isSpinning || hasSpunToday) return;

    soundEngine.play('click');
    setIsSpinning(true);
    setWonPrize(null);

    // Random prize index (0 to SLICES.length - 1)
    const prizeIndex = Math.floor(Math.random() * SLICES.length);
    const sliceAngle = 360 / SLICES.length;
    // Calculate target rotation: 5 full spins (1800 deg) + target slice center angle
    const targetDeg = 1800 + (SLICES.length - prizeIndex) * sliceAngle - sliceAngle / 2;

    setRotation(targetDeg);

    setTimeout(() => {
      setIsSpinning(false);
      const prize = SLICES[prizeIndex];
      setWonPrize(prize);
      spinDailyWheel(prize);
    }, 4000);
  };

  return (
    <div
      onClick={() => {
        if (!isSpinning) {
          soundEngine.play('click');
          setActiveModal('none');
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#0e0e14] border border-amber-500/30 rounded-3xl shadow-2xl shadow-amber-950/50 overflow-hidden flex flex-col my-auto p-6 text-center"
      >
        <div className="absolute top-4 right-4 z-20">
          <CloseButton
            id="btn-close-spin-wheel"
            onClose={() => {
              if (!isSpinning) {
                soundEngine.play('click');
                setActiveModal('none');
              }
            }}
            ariaLabel="Đóng vòng quay"
          />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30 mx-auto mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>VÒNG QUAY MAY MẮN MỖI NGÀY</span>
        </div>

        <h2 className="text-2xl font-black text-white font-display uppercase tracking-wide mb-1">
          Quay Thưởng Miễn Phí
        </h2>
        <p className="text-xs text-slate-300 mb-6">
          {hasSpunToday ? 'Bạn đã quay hôm nay rồi. Hãy quay lại vào ngày mai nhé!' : 'Thử vận may mỗi ngày để nhận Coins và Kim Cương cực khủng!'}
        </p>

        {/* Wheel Container */}
        <div className="relative w-72 h-72 mx-auto mb-6 flex items-center justify-center">
          {/* Pointer Arrow */}
          <div className="absolute -top-3 z-30 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-400 drop-shadow-md" />

          {/* Wheel Disc */}
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 4, ease: [0.15, 0.85, 0.25, 1] }}
            className="w-full h-full rounded-full border-4 border-amber-400/80 shadow-2xl shadow-amber-500/30 relative overflow-hidden bg-black"
            style={{
              background: 'conic-gradient(from 0deg, #f59e0b 0deg 45deg, #3b82f6 45deg 90deg, #10b981 90deg 135deg, #8b5cf6 135deg 180deg, #ef4444 180deg 225deg, #06b6d4 225deg 270deg, #ec4899 270deg 315deg, #f97316 315deg 360deg)'
            }}
          >
            {/* Slice Labels */}
            {SLICES.map((slice, idx) => {
              const angle = idx * (360 / SLICES.length) + (360 / SLICES.length) / 2;
              return (
                <div
                  key={slice.id}
                  className="absolute inset-0 flex items-start justify-center pt-3 text-[11px] font-black uppercase text-white drop-shadow"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: '50% 50%',
                  }}
                >
                  <span className="bg-black/40 px-2 py-0.5 rounded-full border border-white/20">
                    {slice.label}
                  </span>
                </div>
              );
            })}
          </motion.div>

          {/* Center Hub Button */}
          <button
            type="button"
            disabled={isSpinning || hasSpunToday}
            onClick={handleSpin}
            className={`absolute z-20 w-16 h-16 rounded-full border-4 border-amber-300 font-extrabold text-xs uppercase shadow-xl flex items-center justify-center transition-all cursor-pointer ${
              hasSpunToday
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-br from-amber-400 to-orange-600 text-black hover:scale-105 active:scale-95 shadow-amber-500/50'
            }`}
          >
            {hasSpunToday ? 'Đã Quay' : isSpinning ? 'Đang...' : 'QUAY!'}
          </button>
        </div>

        {/* Won Prize Popup / Result Banner */}
        {wonPrize && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-4 rounded-2xl bg-amber-500/20 border border-amber-400/60 mb-4 shadow-lg"
          >
            <div className="text-xs text-amber-300 font-bold uppercase">Chúc mừng bạn nhận được:</div>
            <div className="text-xl font-black text-white font-display mt-0.5">{wonPrize.label}!</div>
          </motion.div>
        )}

        <button
          type="button"
          onClick={() => {
            soundEngine.play('click');
            setActiveModal('none');
          }}
          className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm transition cursor-pointer"
        >
          Đóng
        </button>
      </motion.div>
    </div>
  );
};
