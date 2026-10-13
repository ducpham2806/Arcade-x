import React, { useState } from 'react';
import { CYBER_SLICE_STAGES, getUnlockedStage, getStageStars } from './stages';
import { StageConfig } from './types';
import { Star, Lock, X, Play, Target, Trophy, ChevronRight } from 'lucide-react';

interface StageSelectModalProps {
  onSelectStage: (stage: StageConfig) => void;
  onClose: () => void;
}

export const StageSelectModal: React.FC<StageSelectModalProps> = ({ onSelectStage, onClose }) => {
  const unlockedStage = getUnlockedStage();
  const stageStars = getStageStars();
  const [selectedStage, setSelectedStage] = useState<StageConfig | null>(null);

  const totalStars = Object.values(stageStars).reduce((sum, s) => sum + s, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">Chinh Phục 15 Màn Chơi</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-amber-300 font-bold flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-300" />
                  {totalStars} / 45 Sao
                </span>
                <span>•</span>
                <span>Mở khóa: {unlockedStage}/15</span>
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

        {/* Grid of Stages */}
        <div className="flex-1 overflow-y-auto py-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5 pr-1">
          {CYBER_SLICE_STAGES.map((stage) => {
            const isUnlocked = stage.id <= unlockedStage;
            const stars = stageStars[stage.id] || 0;

            return (
              <button
                key={stage.id}
                type="button"
                disabled={!isUnlocked}
                onClick={() => setSelectedStage(stage)}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                  isUnlocked
                    ? 'bg-slate-800/80 hover:bg-rose-950/40 border-slate-700 hover:border-rose-500 hover:scale-[1.02] shadow-md active:scale-95 text-white'
                    : 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed opacity-50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs sm:text-sm font-black font-mono">
                    {isUnlocked ? `Màn ${stage.id}` : <Lock className="w-3.5 h-3.5 text-slate-600" />}
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

                <div className="text-[11px] font-bold text-slate-200 truncate my-1.5">
                  {isUnlocked ? stage.name : 'Khóa'}
                </div>

                <div className="text-[9px] text-slate-400 truncate">
                  {isUnlocked ? stage.objectives.map((o) => `${o.icon} ${o.target}`).join(' ') : '---'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Preview & Launch Overlay */}
        {selectedStage && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 flex flex-col justify-between z-20 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400">
                  {selectedStage.chapter}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Màn {selectedStage.id}: {selectedStage.name}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStage(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 py-2 leading-relaxed">
              {selectedStage.description}
            </p>

            {/* Target Objectives Box */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-400" />
                <span>MỤC TIÊU CẦN HOÀN THÀNH (TARGETS):</span>
              </div>
              <div className="space-y-1.5">
                {selectedStage.objectives.map((obj, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <span>{obj.icon}</span>
                      <span>{obj.label}</span>
                    </span>
                    <span className="font-mono font-bold text-amber-300">
                      {obj.target} {obj.type === 'score' ? 'Điểm' : 'Quả'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Star Milestone Targets */}
            <div className="flex items-center justify-around py-2 bg-slate-900/40 rounded-xl border border-slate-800 text-xs">
              <span className="flex items-center gap-1 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" /> {selectedStage.starScores[0]}đ
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" /> {selectedStage.starScores[1]}đ
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" /> {selectedStage.starScores[2]}đ
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedStage(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Quay Lại
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectStage(selectedStage);
                  onClose();
                }}
                className="flex-2 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Bắt Đầu Màn Chơi</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

