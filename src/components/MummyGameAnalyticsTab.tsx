import React, { useState, useEffect } from 'react';
import {
  MummyAdaptiveProfile,
  loadAdaptiveProfile,
  saveAdaptiveProfile,
  updateAdaptiveSettings,
  computeAdaptiveTuning,
  getSkillTierInfo,
} from '../games/mummy-escape/adaptiveDifficulty';
import { soundEngine } from '../services/audio';
import {
  Trophy,
  Flame,
  Footprints,
  Skull,
  Activity,
  Sliders,
  Sparkles,
  ShieldCheck,
  Zap,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  Compass,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell,
} from 'recharts';

export const MummyGameAnalyticsTab: React.FC = () => {
  const [profile, setProfile] = useState<MummyAdaptiveProfile>(loadAdaptiveProfile());
  const [activeSubView, setActiveSubView] = useState<'overview' | 'settings'>('overview');

  useEffect(() => {
    setProfile(loadAdaptiveProfile());
  }, []);

  const tuning = computeAdaptiveTuning(profile);
  const tierInfo = getSkillTierInfo(profile.skillRating);

  const handleToggleAdaptive = () => {
    soundEngine.play('click');
    const updated = updateAdaptiveSettings({ enabled: !profile.settings.enabled });
    setProfile({ ...updated });
  };

  const handleSettingChange = (key: keyof typeof profile.settings) => {
    soundEngine.play('click');
    const updated = updateAdaptiveSettings({
      [key]: !profile.settings[key],
    });
    setProfile({ ...updated });
  };

  // Format matches for Move History Chart (Turns vs Par)
  const moveHistoryData = (profile.history || [])
    .slice(0, 15)
    .reverse()
    .map((m, idx) => ({
      game: `#${idx + 1}`,
      turns: m.turnsTaken,
      par: m.parTurns,
      won: m.won ? 1 : 0,
      stars: m.starsEarned,
      mode: m.mode,
    }));

  // Fallback demo data if user has played very few matches yet
  const displayMoveData =
    moveHistoryData.length >= 2
      ? moveHistoryData
      : [
          { game: '#1', turns: 14, par: 12, won: 1, stars: 2, mode: 'campaign' },
          { game: '#2', turns: 9, par: 10, won: 1, stars: 3, mode: 'campaign' },
          { game: '#3', turns: 16, par: 15, won: 1, stars: 2, mode: 'turn_limit' },
          { game: '#4', turns: 8, par: 8, won: 1, stars: 3, mode: 'time_attack' },
          { game: '#5', turns: 12, par: 11, won: 1, stars: 2, mode: 'endless' },
        ];

  // Mode Breakdown Data for Chart
  const modeChartData = [
    {
      name: 'Chiến Dịch',
      played: profile.modeBreakdown.campaign?.played || 0,
      won: profile.modeBreakdown.campaign?.won || 0,
      rate:
        profile.modeBreakdown.campaign?.played > 0
          ? Math.round(
              (profile.modeBreakdown.campaign.won / profile.modeBreakdown.campaign.played) * 100
            )
          : 0,
    },
    {
      name: 'Giới Hạn Bước',
      played: profile.modeBreakdown.turn_limit?.played || 0,
      won: profile.modeBreakdown.turn_limit?.won || 0,
      rate:
        profile.modeBreakdown.turn_limit?.played > 0
          ? Math.round(
              (profile.modeBreakdown.turn_limit.won / profile.modeBreakdown.turn_limit.played) * 100
            )
          : 0,
    },
    {
      name: 'Đua Thời Gian',
      played: profile.modeBreakdown.time_attack?.played || 0,
      won: profile.modeBreakdown.time_attack?.won || 0,
      rate:
        profile.modeBreakdown.time_attack?.played > 0
          ? Math.round(
              (profile.modeBreakdown.time_attack.won / profile.modeBreakdown.time_attack.played) * 100
            )
          : 0,
    },
    {
      name: 'Mê Cung Vô Tận',
      played: profile.modeBreakdown.endless?.played || 0,
      won: profile.modeBreakdown.endless?.won || 0,
      rate:
        profile.modeBreakdown.endless?.played > 0
          ? Math.round(
              (profile.modeBreakdown.endless.won / profile.modeBreakdown.endless.played) * 100
            )
          : 0,
    },
  ];

  // Star Rating Breakdown
  const starData = [
    { name: '3 Sao (Hoàn Hảo)', count: profile.starDistribution.threeStars || 0, color: '#f59e0b' },
    { name: '2 Sao (Khá)', count: profile.starDistribution.twoStars || 0, color: '#38bdf8' },
    { name: '1 Sao (Vượt Qua)', count: profile.starDistribution.oneStar || 0, color: '#a855f7' },
    { name: 'Thất Bại (Bị Bắt)', count: profile.starDistribution.defeats || 0, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Skill Tier & MMR Header Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1c150c] via-[#16120e] to-[#0c0906] border border-amber-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-amber-500/20 border-2 border-amber-400/40 text-3xl flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0">
              {tierInfo.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Mummy Escape Tactical Analytics
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${tierInfo.badgeClass}`}
                >
                  {tierInfo.title}
                </span>
              </div>
              <h3 className="text-lg font-black text-white font-display flex items-center gap-2 mt-0.5">
                Elo Rating: <span className="text-amber-400">{profile.skillRating} MMR</span>
              </h3>
              <p className="text-xs text-stone-400">
                Thắng gần đây: <strong className="text-emerald-400">{profile.recentWinRate}%</strong> •
                Tổng ván: <strong className="text-stone-200">{profile.totalGamesPlayed}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={handleToggleAdaptive}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                profile.settings.enabled
                  ? 'bg-amber-600/30 border-amber-500/50 text-amber-300 hover:bg-amber-600/40'
                  : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{profile.settings.enabled ? 'Tự Cân Bằng: BẬT' : 'Tự Cân Bằng: TẮT'}</span>
            </button>
          </div>
        </div>

        {/* Adaptive Difficulty Status Callout */}
        <div className="mt-3.5 pt-3 border-t border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-stone-300">
            <Compass className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Trạng thái thích ứng: <strong className="text-amber-300">{tuning.difficultyLabel}</strong> ({tuning.appliedMultiplierPercent >= 0 ? `+${tuning.appliedMultiplierPercent}%` : `${tuning.appliedMultiplierPercent}%`})
            </span>
          </div>
          <span className="text-[11px] text-stone-400 italic">{tuning.difficultyDescription}</span>
        </div>
      </div>

      {/* 4 Top Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Cleared */}
        <div className="p-3.5 rounded-xl bg-[#141414] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Đã Vượt Qua</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-white font-display">
              {profile.totalLevelsCleared}
            </span>
            <span className="text-[10px] text-stone-500 block">màn chơi / tầng</span>
          </div>
        </div>

        {/* Win Streak */}
        <div className="p-3.5 rounded-xl bg-[#141414] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Chuỗi Thắng</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-orange-400 font-display">
                {profile.currentWinStreak}
              </span>
              <span className="text-[10px] text-stone-400">
                (Kỷ lục: <strong className="text-white">{profile.highestWinStreak}</strong>)
              </span>
            </div>
            <span className="text-[10px] text-stone-500 block">trận liên tiếp</span>
          </div>
        </div>

        {/* Avg Moves */}
        <div className="p-3.5 rounded-xl bg-[#141414] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>TB Bước Đi</span>
            <Footprints className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-sky-300 font-display">
              {profile.avgMovesPerGame || '--'}
            </span>
            <span className="text-[10px] text-stone-400 block">
              {profile.avgMovesDeltaVsPar <= 0
                ? `${Math.abs(profile.avgMovesDeltaVsPar)} bước dưới chuẩn (Nhanh)`
                : `+${profile.avgMovesDeltaVsPar} so với Par chuẩn`}
            </span>
          </div>
        </div>

        {/* Mummies Trapped */}
        <div className="p-3.5 rounded-xl bg-[#141414] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Xác Ướp Đã Bẫy</span>
            <Skull className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-rose-300 font-display">
              {profile.totalMummiesTrapped}
            </span>
            <span className="text-[10px] text-stone-500 block">tiêu diệt & sập bẫy</span>
          </div>
        </div>
      </div>

      {/* Chart 1: Moves Taken vs Par Turns (Tactical Efficiency) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#141414] border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            Hiệu Suất Số Bước Đi vs Chuẩn Par (15 Trận Gần Nhất)
          </h4>
          <span className="text-[10px] text-stone-400">Đường thấp hơn Par = Tối ưu sao</span>
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayMoveData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="game" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0c0a09',
                  border: '1px solid rgba(245,158,11,0.3)',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
                formatter={(val, name) => [
                  `${val} bước`,
                  name === 'turns' ? 'Bước của bạn' : 'Chuẩn Par 3 Sao',
                ]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
              <Line
                name="Bước của bạn"
                type="monotone"
                dataKey="turns"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#fbbf24' }}
              />
              <Line
                name="Chuẩn Par"
                type="monotone"
                dataKey="par"
                stroke="#38bdf8"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ fill: '#38bdf8', strokeWidth: 1, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2 & 3: Mode Win Rate & Star Rating Distribution */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Mode Win Rates */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#141414] border border-white/5 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Tỷ Lệ Chiến Thắng Theo Chế Độ
          </h4>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} unit="%" />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{
                    backgroundColor: '#0c0a09',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '11px',
                  }}
                  formatter={(val) => [`${val}%`, 'Tỷ Lệ Thắng']}
                />
                <Bar dataKey="rate" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Star Rating Distribution */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#141414] border border-white/5 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Phân Bố Kết Quả & Đánh Giá Sao
          </h4>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={starData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} width={80} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{
                    backgroundColor: '#0c0a09',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '11px',
                  }}
                  formatter={(val) => [`${val} lần`, 'Số lượng']}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {starData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Adaptive Algorithm Parameter Toggles */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#141414] border border-white/5 space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          Tùy Chỉnh Thuật Toán Thích Ứng (Adaptive Parameters)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <label className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
            <div>
              <span className="text-xs font-bold text-stone-200 block">Tự Động Mở Rộng Kích Thước Bản Đồ</span>
              <span className="text-[10px] text-stone-400 block">Mở rộng 7x7 hoặc 8x8 khi người chơi đạt chuỗi thắng cao</span>
            </div>
            <input
              type="checkbox"
              checked={profile.settings.dynamicGridScaling}
              onChange={() => handleSettingChange('dynamicGridScaling')}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
            <div>
              <span className="text-xs font-bold text-stone-200 block">Điều Tiết Tốc Độ & Số Xác Ướp</span>
              <span className="text-[10px] text-stone-400 block">Tăng tần suất xuất hiện Xác Ướp Đỏ khi người chơi giải quá nhanh</span>
            </div>
            <input
              type="checkbox"
              checked={profile.settings.dynamicMummyPacing}
              onChange={() => handleSettingChange('dynamicMummyPacing')}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
            <div>
              <span className="text-xs font-bold text-stone-200 block">Trợ Lực Hoàn Tác Khi Bế Tắc</span>
              <span className="text-[10px] text-stone-400 block">Tặng thêm +1 lượt Revert Turn khi thua liên tiếp</span>
            </div>
            <input
              type="checkbox"
              checked={profile.settings.assistBonusReverts}
              onChange={() => handleSettingChange('assistBonusReverts')}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
            <div>
              <span className="text-xs font-bold text-stone-200 block">Tinh Chỉnh Chuẩn Par Linh Hoạt</span>
              <span className="text-[10px] text-stone-400 block">Tự động nới lỏng hoặc siết chặt Par Turns cho 3 sao</span>
            </div>
            <input
              type="checkbox"
              checked={profile.settings.subtleParTuning}
              onChange={() => handleSettingChange('subtleParTuning')}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
