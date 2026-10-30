import React from 'react';
import { AppModal } from '../../components/common/AppModal';
import { GameMode } from './types';
import { Trophy, Flame, Wind, Clock, X, Sliders, CheckCircle2, ChevronRight, ShieldAlert, Swords } from 'lucide-react';

interface ModeSelectModalProps {
  currentMode: GameMode;
  speedMultiplier: number;
  onSelectMode: (mode: GameMode) => void;
  onSelectSpeed: (speed: number) => void;
  onOpenStageSelect: () => void;
  onClose: () => void;
}

export const ModeSelectModal: React.FC<ModeSelectModalProps> = ({
  currentMode,
  speedMultiplier,
  onSelectMode,
  onSelectSpeed,
  onOpenStageSelect,
  onClose,
}) => {
  const modes: {
    id: GameMode;
    title: string;
    badge: string;
    icon: React.ReactNode;
    color: string;
    borderColor: string;
    bgColor: string;
    description: string;
    subtext: string;
  }[] = [
    {
      id: 'stage',
      title: 'Chinh Phục Màn (Mục Tiêu Target)',
      badge: '15 Màn Chơi',
      icon: <Trophy className="w-5 h-5 text-amber-400" />,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/50',
      bgColor: 'bg-amber-500/10',
      description: 'Chém đúng loại quả theo Mục Tiêu để hoàn thành màn chơi, nhận 3 Sao và thưởng Xu!',
      subtext: 'Mục tiêu: Đủ số quả, điểm số, combo, né bom',
    },
    {
      id: 'classic',
      title: 'Cổ Điển (Classic Arcade)',
      badge: 'Bất Tận',
      icon: <Flame className="w-5 h-5 text-rose-400" />,
      color: 'text-rose-400',
      borderColor: 'border-rose-500/50',
      bgColor: 'bg-rose-500/10',
      description: '3 mạng, cẩn thận với bom đỏ tử thần, tích lũy năng lượng FEVER MODE nhân đôi điểm số.',
      subtext: 'Tranh tài điểm kỷ lục trên Bảng Xếp Hạng',
    },
    {
      id: 'zen',
      title: 'Chế Độ Zen (Thư Giãn / Không Bom)',
      badge: 'Chill Out',
      icon: <Wind className="w-5 h-5 text-emerald-400" />,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/50',
      bgColor: 'bg-emerald-500/10',
      description: 'Hoàn toàn KHÔNG CÓ BOM, KHÔNG BỊ TRỪ MẠNG! Thư giãn chém hoa quả và luyện chuỗi Combo.',
      subtext: 'Dành cho người chơi muốn thư giãn nhẹ nhàng',
    },
    {
      id: 'time_attack',
      title: 'Đua Thời Gian (Time Attack 60s)',
      badge: '60 Giây',
      icon: <Clock className="w-5 h-5 text-cyan-400" />,
      color: 'text-cyan-400',
      borderColor: 'border-cyan-500/50',
      bgColor: 'bg-cyan-500/10',
      description: '60 giây đếm ngược rực lửa! Xuất hiện liên tục các quả Đóng Băng, Bão Táp và Trái Hoàng Kim.',
      subtext: 'Chém càng nhanh điểm càng bùng nổ',
    },
    {
      id: 'boss_rush',
      title: 'Đại Chiến Trùm (Boss Rush)',
      badge: 'Thử Thách Khó',
      icon: <Swords className="w-5 h-5 text-rose-500" />,
      color: 'text-rose-400',
      borderColor: 'border-rose-500/60',
      bgColor: 'bg-rose-500/15',
      description: 'Đối đầu liên hoàn 3 Siêu Trùm Cyber bọc giáp titan trong thời gian giới hạn! Bão item chém khó liên tục, hiệu ứng bạo kích rung chuyển màn hình!',
      subtext: 'Vượt qua 3 Tầng Trùm để hoàn thành màn chơi và nhận Đại Thưởng!',
    },
  ];

  const speedOptions = [
    { label: 'Thong Thả (75%)', value: 0.75, desc: 'Bay chậm, dễ nhìn, tha hồ vuốt' },
    { label: 'Tiêu Chuẩn (100%)', value: 1.0, desc: 'Cân bằng, mượt mà chuẩn Arcade' },
    { label: 'Nhanh (125%)', value: 1.25, desc: 'Tốc độ cao cho cao thủ phản xạ' },
  ];

  return (
    <AppModal
      bare
      onClose={onClose}
      label="Chọn chế độ Cyber Slice"
      closeOnBackdrop={false}
      overlayClassName="select-none"
      className="bg-slate-900 border border-slate-700 p-4 sm:p-6 shadow-2xl"
    >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>Chế Độ Chơi Cyber Blade</span>
            </h2>
            <p className="text-xs text-slate-400">Chọn phong cách kiếm thuật bạn yêu thích</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Speed Adjustment Control */}
        <div className="my-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-black text-slate-200">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>TỐC ĐỘ BAY CỦA HOA QUẢ (SPEED)</span>
            </div>
            <span className="text-[11px] font-bold text-cyan-300">
              {speedMultiplier === 0.75 ? '75% (Dễ Nhìn)' : speedMultiplier === 1.0 ? '100% (Chuẩn)' : '125% (Nhanh)'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {speedOptions.map((opt) => {
              const isActive = Math.abs(speedMultiplier - opt.value) < 0.05;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onSelectSpeed(opt.value)}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/20 border-cyan-400 text-white font-black shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 font-medium'
                  }`}
                >
                  <div className="text-xs font-bold">{opt.label.split(' ')[0]}</div>
                  <div className="text-[9px] opacity-80">{opt.label.split(' ')[1]}</div>
                </button>
              );
            })}
          </div>
          <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Nếu thấy hoa quả bay quá nhanh, hãy chọn <b>Thong Thả (75%)</b> để có góc nhìn thư thả nhất!</span>
          </div>
        </div>

        {/* Modes List */}
        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar space-y-2.5 pr-1">
          {modes.map((m) => {
            const isSelected = currentMode === m.id;
            return (
              <div
                key={m.id}
                onClick={() => {
                  onSelectMode(m.id);
                  if (m.id === 'stage') {
                    onOpenStageSelect();
                  } else {
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col gap-1.5 ${
                  isSelected
                    ? `${m.bgColor} ${m.borderColor} shadow-lg ring-1 ring-white/10`
                    : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-900 border border-white/10 shadow-inner">
                      {m.icon}
                    </div>
                    <div>
                      <h3 className={`text-sm font-black ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                        {m.title}
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400">{m.subtext}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${m.borderColor} ${m.color}`}>
                      {m.badge}
                    </span>
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300 pl-11">{m.description}</p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
          >
            Đóng
          </button>
        </div>
    </AppModal>
  );
};

