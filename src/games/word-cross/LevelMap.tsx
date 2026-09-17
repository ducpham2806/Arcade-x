import React, { useState } from 'react';
import { Lock, Play, Star, Calendar, Trophy, Sparkles, Flame, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../../services/audio';
import { StorageService } from '../../services/storage';

interface LevelMapProps {
  maxCompletedLevel: number;
  onSelectLevel: (level: number, mode: 'classic' | 'mystery') => void;
  onSelectDailyPuzzle: () => void;
  onOpenDailyLeaderboard: () => void;
  hasPlayedDailyToday?: boolean;
  dailyScoreToday?: number | null;
}

function getDifficultyInfo(level: number) {
  let size = 8;
  let label = 'Dễ';
  let badgeColorClass = 'text-emerald-100/90';
  let lockedColorClass = 'text-emerald-700/50';

  if (level > 30 && level <= 70) {
    size = 10;
    label = 'Vừa';
    badgeColorClass = 'text-blue-100/90';
    lockedColorClass = 'text-blue-700/50';
  } else if (level > 70) {
    size = 14;
    label = 'Khó';
    badgeColorClass = 'text-orange-100/90';
    lockedColorClass = 'text-orange-700/50';
  }
  
  return { size, label, badgeColorClass, lockedColorClass };
}

export function LevelMap({
  maxCompletedLevel,
  onSelectLevel,
  onSelectDailyPuzzle,
  onOpenDailyLeaderboard,
  hasPlayedDailyToday = false,
  dailyScoreToday = null,
}: LevelMapProps) {
  const [selectedLevelNum, setSelectedLevelNum] = useState<number | null>(null);
  const cities = Array.from({ length: 10 }).map((_, i) => i + 1);
  const levelsPerCity = 10;
  const todayDateStr = StorageService.getTodayDateString();
  const formattedToday = todayDateStr.split('-').reverse().join('/');

  if (selectedLevelNum !== null) {
    return (
      <div className="flex-1 w-full max-w-sm mx-auto p-4 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-200">
        <div className="bg-white rounded-3xl p-6 shadow-2xl w-full flex flex-col items-center border border-slate-100 text-slate-800">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 mb-4">
            <span className="text-4xl text-white font-black">{selectedLevelNum}</span>
          </div>
          <h2 className="text-2xl font-bold mb-1">Cấp Độ {selectedLevelNum}</h2>
          <p className="text-slate-500 mb-8 text-sm">Chọn chế độ chơi bạn muốn thử thách</p>
          
          <div className="w-full space-y-3">
            <button 
              onClick={() => onSelectLevel(selectedLevelNum - 1, 'classic')}
              className="w-full bg-slate-900 text-white rounded-2xl py-4 font-bold text-lg hover:bg-slate-800 transition-colors shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-white" /> Chơi Cổ Điển
            </button>
            <button 
              onClick={() => onSelectLevel(selectedLevelNum - 1, 'mystery')}
              className="w-full bg-indigo-600 text-white rounded-2xl py-4 font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg active:scale-95 flex flex-col items-center justify-center"
            >
              <span className="flex items-center gap-2"><Play className="w-5 h-5 fill-white" /> Chơi Ẩn Danh (Khó)</span>
              <span className="text-xs font-medium text-indigo-200 mt-1">Không hiện danh sách từ</span>
            </button>
            
            <button
              onClick={() => setSelectedLevelNum(null)}
              className="w-full py-3 mt-2 text-slate-400 font-medium hover:text-slate-600 transition-colors"
            >
              Quay lại bản đồ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 overflow-y-auto custom-scrollbar bg-slate-950 text-white">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-black text-white tracking-wide uppercase font-display mb-2 drop-shadow-md">
          Bản Đồ Cấp Độ
        </h2>
        <p className="text-slate-300">Vượt qua các màn chơi để chinh phục kho từ vựng khổng lồ!</p>
      </div>

      {/* DAILY PUZZLE HIGHLIGHT BANNER */}
      <div className="mb-8 relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-purple-900/80 via-indigo-950 to-slate-900 border-2 border-purple-500/40 shadow-2xl shadow-purple-950/50">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30 shrink-0">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> THỬ THÁCH MỖI NGÀY
                </span>
                <span className="text-xs text-purple-200 font-mono">
                  {formattedToday}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Ma Trận Từ Vựng Hôm Nay
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mt-0.5">
                Cùng 1 bảng giải đố duy nhất cho tất cả người chơi toàn cầu! Cạnh tranh điểm số và leo Top 1.
              </p>
              {hasPlayedDailyToday && dailyScoreToday !== null && (
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-emerald-300 font-semibold bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-600/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Hôm nay bạn đạt: {dailyScoreToday} điểm
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
            <button
              onClick={() => {
                soundEngine.play('click');
                onOpenDailyLeaderboard();
              }}
              className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Bảng Vàng</span>
            </button>
            <button
              onClick={() => {
                soundEngine.play('click');
                onSelectDailyPuzzle();
              }}
              className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>{hasPlayedDailyToday ? 'Chơi Lại' : 'Chơi Ngay'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-12 pb-12">
        {cities.map((city) => {
          const isCityUnlocked = maxCompletedLevel >= (city - 1) * levelsPerCity;
          
          return (
            <div key={`city-${city}`} className={`relative p-6 rounded-3xl border-2 transition-all duration-300 ${isCityUnlocked ? 'bg-slate-900/60 border-slate-700/50' : 'bg-slate-950/80 border-slate-800/30 grayscale opacity-80'}`}>
              
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-xl ${isCityUnlocked ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border border-indigo-400' : 'bg-slate-800 border-slate-700'}`}>
                  📚
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Chương {city}</h3>
                  <p className="text-sm text-slate-400">Các cấp độ {(city-1)*10 + 1} - {city*10}</p>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-3 sm:gap-4">
                {Array.from({ length: levelsPerCity }).map((_, idx) => {
                  const levelNum = (city - 1) * levelsPerCity + idx + 1;
                  const isUnlocked = levelNum <= maxCompletedLevel + 1;
                  const isCompleted = levelNum <= maxCompletedLevel;
                  const diffInfo = getDifficultyInfo(levelNum);
                  
                  return (
                    <button
                      key={`level-${levelNum}`}
                      onClick={() => {
                        if (isUnlocked) {
                          soundEngine.play('click');
                          setSelectedLevelNum(levelNum);
                        }
                      }}
                      disabled={!isUnlocked}
                      className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center font-bold text-lg sm:text-xl transition-all duration-300 ${
                        isCompleted
                          ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 border-b-4 border-emerald-700'
                          : isUnlocked
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 border-b-4 border-blue-800 animate-pulse'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      {isCompleted ? (
                        <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-yellow-300 text-yellow-300 drop-shadow-md mb-0.5" />
                      ) : !isUnlocked ? (
                        <Lock className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 opacity-50" />
                      ) : (
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white mb-0.5" />
                      )}
                      <span>{levelNum}</span>
                      <span className={`text-[9px] sm:text-[10px] mt-0.5 font-medium uppercase tracking-wider ${isUnlocked ? diffInfo.badgeColorClass : diffInfo.lockedColorClass}`}>
                        {diffInfo.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

