import React from 'react';
import { X, BookOpen, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import { WordDefinition, getWordDefinition } from './definitions';
import { soundEngine } from '../../services/audio';

interface WordDefinitionModalProps {
  word: string | null;
  onClose: () => void;
}

export const WordDefinitionModal: React.FC<WordDefinitionModalProps> = ({ word, onClose }) => {
  if (!word) return null;

  const def: WordDefinition = getWordDefinition(word);

  const handleSpeak = () => {
    try {
      soundEngine.play('click');
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(def.word.toLowerCase());
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    } catch {}
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-sm bg-slate-900 border border-indigo-500/30 rounded-3xl shadow-2xl overflow-hidden p-6 text-white animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            soundEngine.play('click');
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Word Header */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black tracking-wide text-white font-display uppercase">
                {def.word}
              </h3>
              <button
                onClick={handleSpeak}
                title="Phát âm từ"
                className="p-1.5 rounded-full bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 hover:text-white transition-all active:scale-95"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            {def.phonetic && (
              <span className="text-xs font-mono text-indigo-300">
                {def.phonetic}
              </span>
            )}
            <div className="text-[11px] font-semibold text-emerald-400 mt-0.5">
              {def.partOfSpeech}
            </div>
          </div>
        </div>

        {/* Definition Sections */}
        <div className="space-y-4 text-sm">
          {/* Vietnamese meaning */}
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Ý nghĩa tiếng Việt
            </div>
            <p className="text-slate-100 font-medium leading-relaxed">
              {def.meaningVi}
            </p>
          </div>

          {/* English description */}
          {def.meaningEn && (
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> English Meaning
              </div>
              <p className="text-slate-300 text-xs italic leading-relaxed">
                {def.meaningEn}
              </p>
            </div>
          )}

          {/* Example */}
          {def.example && (
            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-xs">
              <div className="font-semibold text-indigo-300 mb-1">Ví dụ minh họa:</div>
              <p className="text-white font-medium mb-1">"{def.example}"</p>
              {def.exampleVi && (
                <p className="text-slate-400 italic text-[11px]">↳ {def.exampleVi}</p>
              )}
            </div>
          )}
        </div>

        {/* Bottom dismiss */}
        <button
          onClick={() => {
            soundEngine.play('click');
            onClose();
          }}
          className="w-full mt-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-sm text-slate-200 hover:text-white transition-colors"
        >
          Đã hiểu & Đóng
        </button>
      </div>
    </div>
  );
};
