import React, { useState } from 'react';
import {
  Settings,
  Palette,
  Sparkles,
  Sliders,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Vibrate,
  ShieldAlert,
  Compass,
  Check,
  RotateCcw,
} from 'lucide-react';
import { GridPaletteId, GridPaletteTheme } from './types';
import { GRID_PALETTES, savePalettePreference, saveWatermarkPreference, saveScreenShakePreference } from './palettes';
import { MummyAdaptiveProfile, getSkillTierInfo, computeAdaptiveTuning, updateAdaptiveSettings } from './adaptiveDifficulty';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPaletteId: GridPaletteId;
  onSelectPalette: (id: GridPaletteId) => void;
  showWatermarks: boolean;
  onToggleWatermarks: (show: boolean) => void;
  showWarningPaths: boolean;
  onToggleWarningPaths: () => void;
  screenShakeEnabled: boolean;
  onToggleScreenShake: (enabled: boolean) => void;
  adaptiveProfile: MummyAdaptiveProfile;
  onUpdateAdaptiveProfile: (profile: MummyAdaptiveProfile) => void;
  currentLevelId: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentPaletteId,
  onSelectPalette,
  showWatermarks,
  onToggleWatermarks,
  showWarningPaths,
  onToggleWarningPaths,
  screenShakeEnabled,
  onToggleScreenShake,
  adaptiveProfile,
  onUpdateAdaptiveProfile,
  currentLevelId,
}) => {
  const [activeTab, setActiveTab] = useState<'display' | 'adaptive'>('display');

  if (!isOpen) return null;

  const currentTheme = GRID_PALETTES[currentPaletteId] || GRID_PALETTES.classic_sand;
  const tierInfo = getSkillTierInfo(adaptiveProfile.skillRating);
  const tuning = computeAdaptiveTuning(adaptiveProfile, currentLevelId);

  return (
    <div
      id="mummy-settings-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="mummy-settings-modal"
        className="w-full max-w-xl bg-gradient-to-b from-[#1c130a] to-[#120a04] border-2 border-[#8b6534] rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-stone-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-600/30 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 border border-yellow-300/60 flex items-center justify-center text-stone-950 font-black shadow">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-base font-black text-yellow-300 uppercase tracking-wide flex items-center gap-2">
                <span>CÀI ĐẶT TRÒ CHƠI (SETTINGS)</span>
              </h3>
              <p className="text-[10px] text-amber-200/70">
                Tùy chỉnh bảng màu lưới, giao diện hiển thị và hệ thống AI thích ứng
              </p>
            </div>
          </div>
          <button
            id="btn-close-settings-modal"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-amber-900/40 mb-4">
          <button
            id="tab-settings-display"
            type="button"
            onClick={() => setActiveTab('display')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'display'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-stone-950 font-black shadow-md'
                : 'text-stone-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>TÙY CHỌN HIỂN THỊ (DISPLAY)</span>
          </button>

          <button
            id="tab-settings-adaptive"
            type="button"
            onClick={() => setActiveTab('adaptive')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'adaptive'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-stone-950 font-black shadow-md'
                : 'text-stone-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI ĐỘ KHÓ THÍCH ỨNG</span>
          </button>
        </div>

        {/* Tab Content: Scrollable Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-thin">
          {activeTab === 'display' && (
            <div className="space-y-4">
              {/* DISPLAY SETTINGS SECTION */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-amber-400" />
                    <span>Bảng Màu Lưới Mộ (Grid Color Palettes)</span>
                  </label>
                  <span className="text-[10px] text-amber-200/60 font-mono">
                    Đang chọn: <span className="text-yellow-300 font-bold">{currentTheme.name}</span>
                  </span>
                </div>

                {/* Grid of 6 Palette Swatches */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(Object.keys(GRID_PALETTES) as GridPaletteId[]).map((paletteId) => {
                    const pal = GRID_PALETTES[paletteId];
                    const isSelected = currentPaletteId === paletteId;

                    return (
                      <button
                        key={`palette-choice-${paletteId}`}
                        id={`palette-btn-${paletteId}`}
                        type="button"
                        onClick={() => {
                          onSelectPalette(paletteId);
                          savePalettePreference(paletteId);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between gap-2.5 ${
                          isSelected
                            ? 'border-yellow-400 ring-2 ring-yellow-400/80 bg-[#281a0b] shadow-lg shadow-amber-600/30'
                            : 'border-[#5d3f1c] bg-[#1a1208] hover:bg-[#25190c] hover:border-amber-500/50'
                        }`}
                      >
                        {/* Top: Name & Selection Checkmark */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{pal.watermarkSymbol}</span>
                            <div>
                              <div className="text-xs font-black text-yellow-100">{pal.name}</div>
                              <div className="text-[10px] text-amber-300/80">{pal.nameVi}</div>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-yellow-400 text-stone-950 flex items-center justify-center font-black shadow">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>

                        {/* Interactive Visual Palette Preview Swatch */}
                        <div
                          className="w-full h-10 rounded-xl border p-1 flex items-center gap-1.5 overflow-hidden shadow-inner"
                          style={{
                            backgroundColor: pal.boardBg,
                            borderColor: pal.boardBorder,
                          }}
                        >
                          {/* Mini Tile Light */}
                          <div
                            className="flex-1 h-full rounded-md border flex items-center justify-center text-[9px] font-bold"
                            style={{
                              backgroundColor: pal.tileLight,
                              borderColor: pal.tileBorder,
                              color: pal.watermarkColor,
                            }}
                          >
                            <span>{pal.watermarkSymbol}</span>
                          </div>

                          {/* Mini Tile Dark */}
                          <div
                            className="flex-1 h-full rounded-md border flex items-center justify-center text-[9px] font-bold"
                            style={{
                              backgroundColor: pal.tileDark,
                              borderColor: pal.tileBorder,
                              color: pal.watermarkColor,
                            }}
                          >
                            <span>{pal.watermarkSymbol}</span>
                          </div>

                          {/* Mini Wall Bar Preview */}
                          <div
                            className="w-6 h-full rounded-md border flex items-center justify-center"
                            style={{
                              backgroundColor: pal.wallBg,
                              borderTop: `2px solid ${pal.wallHighlight}`,
                              borderBottom: `2px solid ${pal.wallShadow}`,
                            }}
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: pal.wallHighlight }}
                            />
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-[10px] text-stone-400 leading-tight">
                          {pal.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ADDITIONAL DISPLAY & VISUAL TOGGLES */}
              <div className="bg-[#140e06] border border-amber-900/40 rounded-2xl p-3.5 space-y-3">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hiệu Ứng Hình Ảnh & Hỗ Trợ Trực Quan</span>
                </h4>

                <div className="space-y-2 text-xs">
                  {/* Toggle 1: Warning Paths Radar */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-red-950/60 border border-red-500/40 text-red-400">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-white block">Tia Radar Cảnh Báo Nguy Hiểm</span>
                        <span className="text-[10px] text-stone-400">
                          Hiện đường mũi tên dự đoán 2 bước đi của các xác ướp
                        </span>
                      </div>
                    </div>
                    <button
                      id="toggle-radar-paths"
                      type="button"
                      onClick={onToggleWarningPaths}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        showWarningPaths
                          ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {showWarningPaths ? 'BẬT ✓' : 'TẮT ✕'}
                    </button>
                  </div>

                  {/* Toggle 2: Hieroglyphic Watermarks on tiles */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-400">
                        <Eye className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-white block">Ký Tự Chữ Tượng Hình Cổ</span>
                        <span className="text-[10px] text-stone-400">
                          Hiển thị ký hiệu Ai Cập cổ trên các góc và tâm gạch sàn
                        </span>
                      </div>
                    </div>
                    <button
                      id="toggle-watermark-glyphs"
                      type="button"
                      onClick={() => {
                        const next = !showWatermarks;
                        onToggleWatermarks(next);
                        saveWatermarkPreference(next);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        showWatermarks
                          ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {showWatermarks ? 'BẬT ✓' : 'TẮT ✕'}
                    </button>
                  </div>

                  {/* Toggle 3: Screen Shake Feedback */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-400">
                        <Vibrate className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-white block">Rung Lắc Màn Hình (Screen Shake)</span>
                        <span className="text-[10px] text-stone-400">
                          Hiệu ứng chấn động khi xác ướp va chạm hoặc sập bẫy
                        </span>
                      </div>
                    </div>
                    <button
                      id="toggle-screen-shake"
                      type="button"
                      onClick={() => {
                        const next = !screenShakeEnabled;
                        onToggleScreenShake(next);
                        saveScreenShakePreference(next);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        screenShakeEnabled
                          ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {screenShakeEnabled ? 'BẬT ✓' : 'TẮT ✕'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'adaptive' && (
            <div className="space-y-4">
              {/* ADAPTIVE DIFFICULTY TAB CONTENT */}
              <div className="p-4 rounded-2xl border bg-amber-500/10 border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Cấp Độ Kỹ Năng Hiện Tại</span>
                  <div className={`text-lg font-black ${tierInfo.color} flex items-center gap-1.5`}>
                    <span>
                      {tierInfo.icon} {tierInfo.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300/90 mt-0.5">{tuning.difficultyDescription}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Skill ELO</span>
                  <div className="text-2xl font-black font-mono text-white">{adaptiveProfile.skillRating}</div>
                </div>
              </div>

              {/* Player Key Metrics */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block">Tỉ Lệ Thắng</span>
                  <span className="text-sm font-black font-mono text-emerald-400">{adaptiveProfile.winRate}%</span>
                  <span className="text-[9px] text-slate-500 block">
                    {adaptiveProfile.totalLevelsCleared}/{adaptiveProfile.totalGamesPlayed} trận
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block">Chuỗi Thắng</span>
                  <span className="text-sm font-black font-mono text-amber-400">
                    {adaptiveProfile.currentWinStreak} 🔥
                  </span>
                  <span className="text-[9px] text-slate-500 block">Kỷ lục: {adaptiveProfile.highestWinStreak}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block">Xác Ướp Tiêu Diệt</span>
                  <span className="text-sm font-black font-mono text-rose-400">
                    {adaptiveProfile.totalMummiesTrapped}
                  </span>
                  <span className="text-[9px] text-slate-500 block">
                    TB: {adaptiveProfile.avgMovesPerGame.toFixed(1)} bước
                  </span>
                </div>
              </div>

              {/* Active Adaptive Tuning Factors */}
              <div className="p-3.5 rounded-2xl bg-[#140e06] border border-amber-900/40 space-y-2.5">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>Thông Số Cân Bằng Tự Động</span>
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-400">Kích thước bản đồ đề xuất:</span>
                    <span className="font-bold text-amber-200">
                      {tuning.adjustedGridSize} (
                      {tuning.appliedMultiplierPercent >= 0
                        ? `+${tuning.appliedMultiplierPercent}%`
                        : `${tuning.appliedMultiplierPercent}%`}
                      )
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-400">Tốc độ xuất hiện xác ướp (Spawn Multiplier):</span>
                    <span className="font-bold text-amber-200">
                      {Math.round(tuning.mummySpawnMultiplier * 100)}% (
                      {tuning.mummySpawnMultiplier > 1
                        ? 'Nhanh hơn'
                        : tuning.mummySpawnMultiplier < 1
                        ? 'Chậm rãi'
                        : 'Bình thường'}
                      )
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Lượt Hoàn Tác hỗ trợ (Revert Charges):</span>
                    <span className="font-bold text-amber-200">
                      {3 + tuning.bonusRevertCharges} lượt (
                      {tuning.bonusRevertCharges > 0 ? `+${tuning.bonusRevertCharges} trợ giúp` : 'Mặc định'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Toggle Adaptive Enabled */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/10">
                <div>
                  <span className="text-xs font-bold text-white block">Bật Tính Năng Thích Ứng Tự Động</span>
                  <span className="text-[10px] text-slate-400">Cân đối độ khó vô tận và bổ trợ dựa theo trình độ</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextEnabled = !adaptiveProfile.settings.enabled;
                    const updated = updateAdaptiveSettings({ enabled: nextEnabled });
                    onUpdateAdaptiveProfile(updated);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    adaptiveProfile.settings.enabled
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {adaptiveProfile.settings.enabled ? 'Đang Bật ✓' : 'Đã Tắt ✕'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-amber-600/30 mt-3 flex justify-between items-center">
          <button
            type="button"
            onClick={() => {
              onSelectPalette('classic_sand');
              savePalettePreference('classic_sand');
              onToggleWatermarks(true);
              saveWatermarkPreference(true);
              onToggleScreenShake(true);
              saveScreenShakePreference(true);
            }}
            className="text-[11px] text-stone-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Khôi phục mặc định</span>
          </button>

          <button
            id="btn-confirm-settings"
            type="button"
            onClick={onClose}
            className="py-2 px-6 rounded-xl font-black text-xs uppercase bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 shadow-md shadow-amber-500/30 cursor-pointer"
          >
            ĐÓNG (DONE)
          </button>
        </div>
      </div>
    </div>
  );
};

