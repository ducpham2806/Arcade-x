import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Sparkles, CheckCircle2, Flame, Gift, Crown, Trophy, Coins, Gem, ArrowRight, ShieldCheck } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useGame } from '../context/GameContext';
import { CloseButton } from './common/CloseButton';
import { soundEngine } from '../services/audio';

export const MonthlyLoginCalendarModal: React.FC = () => {
  const { profile } = usePlayer();
  const { activeModal, setActiveModal } = useGame();

  const [currentDate, setCurrentDate] = useState(() => new Date());

  if (activeModal !== 'monthlyLogin') return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0 - 11

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  // Calculate days in month
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  let startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const loginDates = profile.stats.loginHistoryDates || [];
  const todayStr = new Date().toISOString().split('T')[0];

  // Count check-ins in this month
  const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const checkInsThisMonth = loginDates.filter(d => d.startsWith(currentMonthPrefix)).length;

  const handlePrevMonth = () => {
    soundEngine.play('click');
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    soundEngine.play('click');
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div
      onClick={() => {
        soundEngine.play('click');
        setActiveModal('none');
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-[#0e0e14] border border-indigo-500/30 rounded-3xl shadow-2xl shadow-indigo-950/60 overflow-hidden flex flex-col my-auto max-h-[90vh]"
      >
        {/* Header Banner */}
        <div className="relative p-5 sm:p-6 pr-14 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-[#0e0e14] border-b border-white/10 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 flex items-center justify-center text-white shrink-0 text-2xl">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-purple-200 to-white uppercase tracking-tight font-display">
                  Lịch Điểm Danh Tháng
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-extrabold text-[10px]">
                  {checkInsThisMonth} Ngày Đã Điểm Danh
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium flex items-center gap-1.5 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Theo dõi lịch sử đăng nhập và nhận mốc thưởng độc quyền mỗi tháng!
              </p>
            </div>
          </div>

          {/* Month Switcher & Close */}
          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
            <div className="flex items-center bg-black/50 rounded-xl p-1 border border-white/10">
              <button
                onClick={handlePrevMonth}
                className="px-2.5 py-1 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                ◀
              </button>
              <span className="px-3 text-xs font-black text-indigo-300">
                {monthNames[month]} {year}
              </span>
              <button
                onClick={handleNextMonth}
                className="px-2.5 py-1 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                ▶
              </button>
            </div>

            <div className="shrink-0 pl-1">
              <CloseButton
                id="btn-close-monthly-login"
                onClose={() => {
                  soundEngine.play('click');
                  setActiveModal('none');
                }}
                ariaLabel="Đóng lịch"
              />
            </div>
          </div>
        </div>

        {/* Content Body: Calendar Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Streak Overview Widget */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Flame className="w-5 h-5 fill-amber-500" />
              </div>
              <div>
                <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Chuỗi Liên Tục</div>
                <div className="text-lg font-black text-white font-mono">{profile.stats.dailyStreak} Ngày</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Tháng Này</div>
                <div className="text-lg font-black text-white font-mono">{checkInsThisMonth} Ngày Điểm Danh</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Mốc Thưởng Tiếp Theo</div>
                <div className="text-sm font-black text-white">Rương Thần Thoại (Ngày 7/14/28)</div>
              </div>
            </div>
          </div>

          {/* Calendar Grid Header (Mon - Sun) */}
          <div className="bg-[#121218] border border-white/10 rounded-2xl p-3 sm:p-4 overflow-hidden">
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center mb-3">
              {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'].map((dayName, idx) => (
                <div key={idx} className="text-[11px] font-black text-slate-400 uppercase tracking-wider py-1">
                  {dayName}
                </div>
              ))}
            </div>

            {/* Calendar Days Matrix */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {/* Padding empty slots for start of month */}
              {Array.from({ length: startDayOfWeek }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-16 sm:h-20 rounded-xl bg-black/20 border border-white/5 opacity-30" />
              ))}

              {/* Days of month */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const formattedDay = String(dayNum).padStart(2, '0');
                const formattedMonth = String(month + 1).padStart(2, '0');
                const dateKey = `${year}-${formattedMonth}-${formattedDay}`;

                const isCheckedIn = loginDates.includes(dateKey);
                const isToday = dateKey === todayStr;
                const isMilestoneDay = dayNum % 7 === 0 || dayNum === 1;

                return (
                  <div
                    key={dateKey}
                    className={`h-16 sm:h-20 rounded-xl p-1.5 sm:p-2 flex flex-col justify-between border transition-all relative overflow-hidden ${
                      isCheckedIn
                        ? 'bg-emerald-950/40 border-emerald-500/50 shadow-sm shadow-emerald-950/50'
                        : isToday
                        ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/40'
                        : isMilestoneDay
                        ? 'bg-purple-950/30 border-purple-500/40'
                        : 'bg-black/40 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black font-mono ${isToday ? 'text-amber-300' : isCheckedIn ? 'text-emerald-300' : 'text-slate-300'}`}>
                        {dayNum}
                      </span>
                      {isCheckedIn && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                      {isMilestoneDay && !isCheckedIn && (
                        <Crown className="w-3 h-3 text-purple-400 shrink-0" />
                      )}
                    </div>

                    <div className="flex flex-col items-center justify-center my-auto">
                      {isCheckedIn ? (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                          ✓ Đã nhận
                        </span>
                      ) : isMilestoneDay ? (
                        <span className="text-[9px] font-bold text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded border border-purple-500/30">
                          Quà Mốc
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-500">
                          {isToday ? 'Hôm nay' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-black/60 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>💡 Điểm danh đều đặn mỗi ngày để nhận hệ số nhân x2.5 phần thưởng và Rương Huyền Thoại!</span>
          <button
            onClick={() => {
              soundEngine.play('click');
              setActiveModal('dailyReward');
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center gap-1.5 shadow-md"
          >
            <span>Điểm Danh Ngay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
