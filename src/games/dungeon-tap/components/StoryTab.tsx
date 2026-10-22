import React from 'react';
import { STORY_CHAPTERS } from '../storyChapters';
import { BookOpen, Skull, CheckCircle, ChevronRight, Lock } from 'lucide-react';

interface StoryTabProps {
  currentStage: number;
  maxStageReached: number;
  onSelectStage: (stage: number) => void;
}

export const StoryTab: React.FC<StoryTabProps> = ({
  currentStage,
  maxStageReached,
  onSelectStage,
}) => {
  return (
    <div className="flex flex-col gap-3 p-3 text-slate-200">
      <div className="bg-slate-900/80 border border-amber-500/30 p-3 rounded-2xl shadow-lg">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <h3 className="text-base font-black text-amber-300">Cốt Truyện Tuyến Tính & Chương Hồi</h3>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Hành trình vượt qua hàng trăm tầng hầm ngục và đánh bại những Chúa Tể Titan cổ đại hùng mạnh.
          Cứ 10 tầng bạn sẽ giáp mặt một đại thủ lĩnh Titan!
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {STORY_CHAPTERS.map((chapter) => {
          const isUnlocked = maxStageReached >= chapter.startStage;
          const isCompleted = maxStageReached > chapter.endStage;
          const isCurrent = currentStage >= chapter.startStage && currentStage <= chapter.endStage;

          return (
            <div
              key={chapter.id}
              className={`p-3 rounded-2xl border transition-all ${
                isCurrent
                  ? 'bg-slate-900 border-amber-500 ring-1 ring-amber-400 shadow-xl'
                  : isUnlocked
                  ? 'bg-slate-950/80 border-slate-700/80'
                  : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl p-2 bg-black/40 rounded-xl border border-white/5">
                    {chapter.badge}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-100">{chapter.name}</h4>
                      {isCompleted ? (
                        <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-600/50 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Đã hoàn thành
                        </span>
                      ) : isCurrent ? (
                        <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-500/50 px-1.5 py-0.5 rounded font-bold animate-pulse">
                          Đang diễn ra
                        </span>
                      ) : !isUnlocked ? (
                        <span className="text-[10px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Mở ở Tầng {chapter.startStage}
                        </span>
                      ) : null}
                    </div>
                    <div className="text-xs text-amber-400/90 font-medium">{chapter.title}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Tầng {chapter.startStage} - Tầng {chapter.endStage}
                    </div>
                  </div>
                </div>

                {isUnlocked && (
                  <button
                    onClick={() => onSelectStage(chapter.startStage)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-600 active:scale-95"
                  >
                    Đến Tầng {chapter.startStage}
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-400 mt-2 leading-relaxed bg-black/30 p-2 rounded-xl border border-white/5">
                {chapter.lore}
              </p>

              <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-white/5 text-slate-400">
                <div className="flex items-center gap-1.5 text-rose-300 font-bold">
                  <Skull className="w-3.5 h-3.5 text-rose-400" />
                  <span>Trùm Tối Thượng:</span>
                  <span>{chapter.bossAvatar} {chapter.bossName}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
