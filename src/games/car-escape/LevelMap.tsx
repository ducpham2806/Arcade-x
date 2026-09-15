import React, { useState } from 'react';
import { Lock, Play, Star, AlertCircle } from 'lucide-react';
import { soundEngine } from '../../services/audio';

interface LevelMapProps {
  maxCompletedLevel: number;
  onSelectLevel: (level: number) => void;
}

function getDifficultyInfo(level: number) {
  let size = 4;
  if (level > 10) size = 5;
  if (level > 25) size = 6;
  if (level > 40) size = 7;
  if (level > 60) size = 8;
  if (level > 80) size = 9;
  if (level > 90) size = 10;
  
  const numVehicles = Math.min(Math.floor(size * size * 0.45), 25 + Math.floor(level/2));
  
  let label = 'Dễ';
  let badgeColorClass = 'text-emerald-100/90';
  let lockedColorClass = 'text-emerald-700/50';

  if (size === 5) { 
    label = 'Vừa'; 
    badgeColorClass = 'text-blue-100/90'; 
    lockedColorClass = 'text-blue-700/50';
  } else if (size === 6) { 
    label = 'Khó'; 
    badgeColorClass = 'text-orange-100/90'; 
    lockedColorClass = 'text-orange-700/50';
  } else if (size >= 7) { 
    label = 'Cực Khó'; 
    badgeColorClass = 'text-red-100/90'; 
    lockedColorClass = 'text-red-700/50';
  }
  
  return { size, numVehicles, label, badgeColorClass, lockedColorClass };
}

export function LevelMap({ maxCompletedLevel, onSelectLevel }: LevelMapProps) {
  const [warningToast, setWarningToast] = useState<string | null>(null);
  const cities = Array.from({ length: 10 }).map((_, i) => i + 1);
  const levelsPerCity = 10;

  const handleBossClick = () => {
    if (maxCompletedLevel < 10) {
      try {
        soundEngine.play('error');
      } catch {}
      setWarningToast('Bạn chưa đủ điều kiện đấu Boss! Cần hoàn thành Level 10 để mở khóa.');
      setTimeout(() => {
        setWarningToast(null);
      }, 3500);
      return;
    }
    try {
      soundEngine.play('click');
    } catch {}
    onSelectLevel(999);
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 overflow-y-auto custom-scrollbar">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-white tracking-wide uppercase font-display mb-2 drop-shadow-md">
          Bản Đồ Giao Thông
        </h2>
        <p className="text-slate-300">Hoàn thành các thành phố để mở khóa các độ khó mới!</p>
      </div>

      <div className="space-y-12">
        {cities.map((city) => {
          const isCityUnlocked = maxCompletedLevel >= (city - 1) * levelsPerCity;
          
          return (
            <div key={`city-${city}`} className={`relative p-6 rounded-3xl border-2 transition-all duration-300 ${isCityUnlocked ? 'bg-slate-900/60 border-slate-700/50' : 'bg-slate-950/80 border-slate-800/30 grayscale opacity-80'}`}>
              
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-xl ${isCityUnlocked ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border border-indigo-400' : 'bg-slate-800 border-slate-700'}`}>
                  🏙️
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Thành phố {city}</h3>
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
                      onClick={() => isUnlocked && onSelectLevel(levelNum)}
                      disabled={!isUnlocked}
                      title={`Bản đồ ${diffInfo.size}x${diffInfo.size} - ${diffInfo.numVehicles} Xe`}
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
        
        {/* Boss Fight Section */}
        <div className={`relative p-6 rounded-3xl border-2 transition-all duration-300 ${maxCompletedLevel >= 10 ? 'bg-red-950/40 border-red-900/50' : 'bg-slate-950/80 border-slate-800/40'}`}>
          {warningToast && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-rose-200 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-bounce shadow-lg shadow-rose-950/50">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{warningToast}</span>
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-xl ${maxCompletedLevel >= 10 ? 'bg-gradient-to-br from-red-600 to-orange-600 border border-red-500 animate-pulse' : 'bg-slate-800/80 border border-slate-700 opacity-60'}`}>
              👹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-red-400">Chế độ Boss Fight</h3>
                {maxCompletedLevel < 10 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold uppercase">
                    Chưa Mở Khóa
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400">Bản đồ siêu lớn 12x12 (Yêu cầu hoàn thành Level 10)</p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleBossClick}
            className={`w-full py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              maxCompletedLevel >= 10 
                ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-900/50 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                : 'bg-slate-800/70 text-slate-400 border border-slate-700/60 cursor-not-allowed opacity-80 hover:border-rose-500/40'
            }`}
          >
            {maxCompletedLevel >= 10 ? (
              <>
                <Play className="w-5 h-5 fill-white text-white" />
                <span>Khiêu Chiến Ngay</span>
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 text-slate-400" />
                <span>Chưa Đủ Điều Kiện (Cần Vượt Qua Level 10)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
