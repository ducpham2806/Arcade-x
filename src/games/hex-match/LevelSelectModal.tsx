import React, { useState } from 'react';
import { HEX_LEVELS } from './levels';
import { LevelConfig } from './types';
import { LevelMiniLeaderboard } from './LevelMiniLeaderboard';
import {
  Star,
  Lock,
  X,
  Trophy,
  Clock,
  Gift,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Play,
  Target,
} from 'lucide-react';

interface LevelSelectModalProps {
  unlockedLevel: number;
  levelStars: Record<number, number>;
  onSelectLevel: (level: LevelConfig) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  unlockedLevel,
  levelStars,
  onSelectLevel,
  onClose,
}) => {
  // Current active chapter page (10 levels per page, 15 pages total)
  const [activeChapter, setActiveChapter] = useState(
    Math.min(14, Math.floor((unlockedLevel - 1) / 10))
  );

  // Selected level for detail view & mini leaderboard
  const [previewLevel, setPreviewLevel] = useState<LevelConfig | null>(null);

  const totalStars = Object.values(levelStars).reduce((a, b) => a + b, 0);
  const chapterLevels = HEX_LEVELS.slice(activeChapter * 10, (activeChapter + 1) * 10);

  const CHAPTER_NAMES = [
    '1. Vườn Kẹo Ngọt',
    '2. Băng Bắc Cực',
    '3. Xưởng Chocolate',
    '4. Lâu Đài Quà Tặng',
    '5. Đua Tốc Độ Kẹo',
    '6. Đảo Cầu Vồng',
    '7. Hẻm Núi Ngọt Ngào',
    '8. Đầm Lầy Thạch Dẻo',
    '9. Lâu Đài Pha Lê',
    '10. Đỉnh Núi Kẹo Bông',
    '11. Rừng Kẹo Thần Bí',
    '12. Thung Lũng Núi Lửa',
    '13. Vương Quốc Hoàng Gia',
    '14. Vũ Trụ Kẹo Ngọt',
    '15. Thử Thách Tối Thượng',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/40">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white font-display">
                150 Màn Chinh Phục
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-amber-300 font-bold flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-300" />
                  {totalStars} / 450 Sao
                </span>
                <span>•</span>
                <span>Mở: {unlockedLevel}/150</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chapter Navigator Slider */}
        <div className="flex items-center justify-between py-2 px-1 bg-slate-950/60 rounded-2xl my-2 border border-slate-800">
          <button
            type="button"
            disabled={activeChapter === 0}
            onClick={() => setActiveChapter((p) => Math.max(0, p - 1))}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-center">
            <div className="text-xs font-black text-pink-300 uppercase tracking-wider">
              {CHAPTER_NAMES[activeChapter]}
            </div>
            <div className="text-[10px] text-slate-400">
              Màn {activeChapter * 10 + 1} - {Math.min(150, (activeChapter + 1) * 10)}
            </div>
          </div>

          <button
            type="button"
            disabled={activeChapter === 14}
            onClick={() => setActiveChapter((p) => Math.min(14, p + 1))}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Chapter Levels Grid */}
        <div className="flex-1 overflow-y-auto py-2 grid grid-cols-2 sm:grid-cols-2 gap-2.5">
          {chapterLevels.map((lvl) => {
            const isUnlocked = lvl.id <= unlockedLevel;
            const stars = levelStars[lvl.id] || 0;

            return (
              <button
                key={lvl.id}
                type="button"
                disabled={!isUnlocked}
                onClick={() => {
                  setPreviewLevel(lvl);
                }}
                className={`flex flex-col justify-between p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  isUnlocked
                    ? 'bg-slate-800/80 hover:bg-indigo-900/40 border-slate-700 hover:border-pink-500 hover:scale-[1.02] shadow-md active:scale-95 text-white'
                    : 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-black font-mono">
                    {isUnlocked ? `Màn ${lvl.id}` : <Lock className="w-4 h-4 text-slate-600" />}
                  </span>

                  {/* Mode Icon */}
                  {isUnlocked && (
                    <span className="text-[11px]">
                      {lvl.gameplayType === 'time' && <span title="Đua giờ">🕒</span>}
                      {lvl.gameplayType === 'rescue' && <span title="Cứu gấu">🧊🐻</span>}
                      {lvl.gameplayType === 'chocolate' && <span title="Chocolate">🍫</span>}
                      {lvl.gameplayType === 'gift' && <span title="Nơ quà">🎁</span>}
                      {lvl.gameplayType === 'boss' && <span title="Đại thử thách">👑</span>}
                      {lvl.gameplayType === 'moves' && <span title="Lượt đi">🎯</span>}
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-300 font-medium truncate my-1">
                  {isUnlocked ? lvl.subtitle : 'Chưa mở khóa'}
                </div>

                {/* Stars and Moves/Time info */}
                <div className="flex items-center justify-between w-full pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
                  <span>
                    {lvl.gameplayType === 'time'
                      ? `${lvl.timeLimit}s`
                      : `${lvl.moves} lượt`}
                  </span>

                  {isUnlocked && (
                    <div className="flex items-center gap-0.5">
                      <Star
                        className={`w-3 h-3 ${
                          stars >= 1 ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                        }`}
                      />
                      <Star
                        className={`w-3 h-3 ${
                          stars >= 2 ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                        }`}
                      />
                      <Star
                        className={`w-3 h-3 ${
                          stars >= 3 ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                        }`}
                      />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-800 text-center text-[11px] text-slate-400">
          💡 Nhấn vào màn chơi để xem chi tiết mục tiêu & Bảng Xếp Hạng Top 3 Cao Thủ!
        </div>

        {/* Level Detail & Mini Leaderboard Modal */}
        {previewLevel && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 flex flex-col justify-between z-20 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>Màn {previewLevel.id}: {previewLevel.name}</span>
                </h3>
                <p className="text-xs text-pink-300 font-medium">{previewLevel.subtitle}</p>
              </div>

              <button
                type="button"
                onClick={() => setPreviewLevel(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Level Targets info */}
            <div className="py-2 space-y-2">
              <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 text-xs">
                <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-amber-400" /> Mục tiêu:
                </span>
                <span className="font-bold text-white">
                  {previewLevel.targets.map((t) => `${t.label} (${t.target})`).join(', ')}
                </span>
              </div>

              {/* Mini Leaderboard Top 3 for this Level */}
              <LevelMiniLeaderboard levelId={previewLevel.id} />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPreviewLevel(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Quay Lại
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectLevel(previewLevel);
                  onClose();
                }}
                className="flex-2 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-pink-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Bắt Đầu Chơi</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
