import React from 'react';
import { Activity, Swords, Users, Sparkles, Coins, Trophy, Flame } from 'lucide-react';
import { formatNumber } from '../utils/upgradeMath';

interface StatsTabProps {
  tapDamage: number;
  heroDps: number;
  critRate: number;
  critMultiplier: number;
  goldMultiplier: number;
  maxStageReached: number;
  bossesSlain: number;
  monstersSlain: number;
  heroLevel: number;
  onOpenLeaderboard?: () => void;
}

export const StatsTab: React.FC<StatsTabProps> = ({
  tapDamage,
  heroDps,
  critRate,
  critMultiplier,
  goldMultiplier,
  maxStageReached,
  bossesSlain,
  monstersSlain,
  heroLevel,
  onOpenLeaderboard,
}) => {
  return (
    <div className="flex flex-col gap-3 p-3 text-slate-200">
      <div className="bg-slate-900/80 border border-slate-700/80 p-3 rounded-2xl shadow-lg">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-base font-black text-cyan-300">Tổng Hợp Chỉ Số Chiến Đấu</h3>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Các chỉ số được tính toán tự động từ Cấp Kiếm Sĩ, Đồng Đội và Toàn Bộ Trang Bị đang mặc.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold mb-1">
            <Swords className="w-3.5 h-3.5" /> Sát Thương Tap
          </div>
          <div className="text-lg font-black font-mono text-amber-200">
            {formatNumber(tapDamage)}
          </div>
          <div className="text-[11px] text-slate-500">Mỗi cú chạm vào quái</div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs text-purple-400 font-bold mb-1">
            <Users className="w-3.5 h-3.5" /> Đồng Đội DPS
          </div>
          <div className="text-lg font-black font-mono text-purple-200">
            {formatNumber(heroDps)} / s
          </div>
          <div className="text-[11px] text-slate-500">Tự động chém mỗi giây</div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold mb-1">
            <Flame className="w-3.5 h-3.5" /> Tỉ Lệ Bạo Kích
          </div>
          <div className="text-lg font-black font-mono text-rose-200">{critRate}%</div>
          <div className="text-[11px] text-slate-500">Gây x{critMultiplier.toFixed(1)} sát thương</div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs text-yellow-400 font-bold mb-1">
            <Coins className="w-3.5 h-3.5" /> Hệ Số Vàng Rơi
          </div>
          <div className="text-lg font-black font-mono text-yellow-200">x{goldMultiplier.toFixed(2)}</div>
          <div className="text-[11px] text-slate-500">Nhân với vàng cơ bản</div>
        </div>

        <div
          onClick={onOpenLeaderboard}
          className={`bg-slate-950/80 border border-slate-800 p-3 rounded-xl transition-all ${
            onOpenLeaderboard
              ? 'hover:border-amber-500/50 hover:bg-slate-900 cursor-pointer active:scale-95 group'
              : ''
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" /> Tầng Cao Nhất
            </div>
            {onOpenLeaderboard && (
              <span className="text-[10px] text-amber-400 font-bold group-hover:underline">
                Xem BXH →
              </span>
            )}
          </div>
          <div className="text-lg font-black font-mono text-cyan-200">Tầng {formatNumber(maxStageReached)}</div>
          <div className="text-[11px] text-slate-500">Kỷ lục tiến trình cá nhân</div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Cấp Kiếm Sĩ
          </div>
          <div className="text-lg font-black font-mono text-indigo-200">Lv.{formatNumber(heroLevel)}</div>
          <div className="text-[11px] text-slate-500">Cấp độ nhân vật</div>
        </div>
      </div>

      {/* Record Stats */}
      <div className="bg-slate-900/60 border border-white/5 p-3 rounded-xl flex items-center justify-between text-xs text-slate-400">
        <div>
          <span>Quái vật đã hạ: </span>
          <span className="font-mono font-bold text-slate-200">{formatNumber(monstersSlain)}</span>
        </div>
        <div>
          <span>Boss đã tiêu diệt: </span>
          <span className="font-mono font-bold text-rose-300">{formatNumber(bossesSlain)}</span>
        </div>
      </div>
    </div>
  );
};

