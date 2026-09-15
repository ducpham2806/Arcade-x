import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { soundEngine } from '../services/audio';
import {
  History,
  Trash2,
  Filter,
  Sparkles,
  FlaskConical,
  Crown,
  Coins,
  Gem,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Search,
} from 'lucide-react';
import { getRarityInfo } from '../utils/rarity';
import { DEFAULT_LEGENDARY_BLUEPRINTS } from '../data/legendaryBlueprints';

interface DiscoveryLogTabProps {
  onBackToLab: () => void;
}

export const DiscoveryLogTab: React.FC<DiscoveryLogTabProps> = ({ onBackToLab }) => {
  const { discoveryLog, clearDiscoveryLog, discoveredBlueprintIds } = useInventory();
  const [filterType, setFilterType] = useState<'all' | 'success' | 'failure'>('all');
  const [showConfirmClear, setShowConfirmClear] = useState<boolean>(false);

  const filteredEntries = discoveryLog.filter(entry => {
    if (filterType === 'success') return entry.success;
    if (filterType === 'failure') return !entry.success;
    return true;
  });

  const totalTrials = discoveryLog.length;
  const successTrials = discoveryLog.filter(e => e.success).length;
  const successRate = totalTrials > 0 ? Math.round((successTrials / totalTrials) * 100) : 0;

  const handleClearHistory = () => {
    soundEngine.play('click');
    clearDiscoveryLog();
    setShowConfirmClear(false);
  };

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds} - ${day}/${month}/${year}`;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-[#07080f] p-3 sm:p-5">
      {/* HEADER BAR & METRICS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <button
            id="btn-back-to-discovery-lab"
            type="button"
            onClick={onBackToLab}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 active:scale-90 text-slate-300 hover:text-white flex items-center justify-center border border-white/10 cursor-pointer transition-all"
            title="Quay lại Phòng Khám Phá"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                Nhật Ký Thử Nghiệm Khám Phá
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Lịch sử ghi chép toàn bộ các thí nghiệm kết hợp vật phẩm bậc thấp và cổ thư huyền thoại.
            </p>
          </div>
        </div>

        {/* Action: Clear Log */}
        {discoveryLog.length > 0 && (
          <div className="flex items-center gap-2">
            {!showConfirmClear ? (
              <button
                id="btn-clear-discovery-log"
                type="button"
                onClick={() => setShowConfirmClear(true)}
                className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-950/70 text-rose-300 text-xs font-bold border border-rose-500/30 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa Nhật Ký</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-rose-950/80 p-1 rounded-xl border border-rose-500/50">
                <span className="text-[10px] text-rose-200 px-1 font-bold">Xác nhận xóa?</span>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold cursor-pointer"
                >
                  Có
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmClear(false)}
                  className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] font-bold cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* METRIC STRIP */}
      <div className="grid grid-cols-3 gap-2.5 my-3 shrink-0">
        <div className="p-3 rounded-2xl bg-[#0f101c] border border-white/5 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Tổng Lần Thử</span>
          <div className="text-base sm:text-lg font-mono font-black text-white mt-0.5">{totalTrials}</div>
        </div>

        <div className="p-3 rounded-2xl bg-[#0f101c] border border-white/5 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Tỷ Lệ Thành Công</span>
          <div className="text-base sm:text-lg font-mono font-black text-amber-400 mt-0.5">{successRate}%</div>
        </div>

        <div className="p-3 rounded-2xl bg-[#0f101c] border border-white/5 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Bản Thiết Kế Đã Có</span>
          <div className="text-base sm:text-lg font-mono font-black text-purple-400 mt-0.5">
            {discoveredBlueprintIds.length}/{DEFAULT_LEGENDARY_BLUEPRINTS.length}
          </div>
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex items-center gap-1.5 mb-3 shrink-0">
        <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-1">
          <Filter className="w-3 h-3" /> Lọc:
        </span>
        <button
          id="filter-log-all"
          type="button"
          onClick={() => setFilterType('all')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            filterType === 'all'
              ? 'bg-purple-600 text-white shadow'
              : 'bg-white/5 text-slate-400 hover:text-white'
          }`}
        >
          Tất Cả ({totalTrials})
        </button>

        <button
          id="filter-log-success"
          type="button"
          onClick={() => setFilterType('success')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            filterType === 'success'
              ? 'bg-amber-500 text-black shadow'
              : 'bg-white/5 text-slate-400 hover:text-white'
          }`}
        >
          🌟 Mở Khóa ({successTrials})
        </button>

        <button
          id="filter-log-failure"
          type="button"
          onClick={() => setFilterType('failure')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            filterType === 'failure'
              ? 'bg-slate-700 text-white shadow'
              : 'bg-white/5 text-slate-400 hover:text-white'
          }`}
        >
          🧪 Tinh Hoa ({totalTrials - successTrials})
        </button>
      </div>

      {/* SCROLLABLE LOG ENTRIES */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2.5 pr-1">
        {filteredEntries.length > 0 ? (
          filteredEntries.map(entry => (
            <div
              key={entry.id}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                entry.success
                  ? 'bg-gradient-to-r from-[#1c160b]/90 via-[#120f09] to-[#0a0805] border-amber-500/40 shadow-sm shadow-amber-500/5'
                  : 'bg-[#0c0d16]/80 border-white/5'
              }`}
            >
              {/* Top Row: Timestamp & Status Badge */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono text-slate-400">
                  {formatTimestamp(entry.timestamp)}
                </span>

                <div
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    entry.success
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  }`}
                >
                  {entry.success ? (
                    <>
                      <Crown className="w-3 h-3 text-amber-400" />
                      <span>Khai Phá Thành Công</span>
                    </>
                  ) : (
                    <>
                      <FlaskConical className="w-3 h-3 text-purple-400" />
                      <span>Ngưng Tụ Tinh Hoa</span>
                    </>
                  )}
                </div>
              </div>

              {/* Middle Row: Ingredients Combined */}
              <div className="mb-2.5">
                <div className="text-[10px] font-bold text-slate-400 mb-1">Nguyên liệu đã dùng:</div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {entry.ingredients.map((ing, ingIdx) => {
                    const rInfo = getRarityInfo(ing.rarity);
                    return (
                      <div
                        key={`log-ing-${entry.id}-${ingIdx}`}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-xl bg-black/50 border border-white/10 text-xs"
                      >
                        <span className="text-base">{ing.icon}</span>
                        <span className="text-white font-medium truncate max-w-[120px]">{ing.name}</span>
                        <span style={{ color: rInfo.hex }} className="text-[9px] font-bold">
                          ({rInfo.shortCode})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Row: Outcome & Rewards */}
              <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="text-slate-300 flex items-center gap-1.5 font-medium">
                  {entry.success && entry.discoveredBlueprint && (
                    <span className="text-base">{entry.discoveredBlueprint.icon}</span>
                  )}
                  <span>{entry.rewardDescription}</span>
                </div>

                {/* Reward amounts */}
                <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] font-bold">
                  {entry.rewardCoins > 0 && (
                    <span className="text-amber-400 flex items-center gap-0.5">
                      <Coins className="w-3 h-3" /> +{entry.rewardCoins}
                    </span>
                  )}
                  {entry.rewardGems > 0 && (
                    <span className="text-blue-400 flex items-center gap-0.5">
                      <Gem className="w-3 h-3" /> +{entry.rewardGems}
                    </span>
                  )}
                  {entry.rewardExp > 0 && (
                    <span className="text-purple-400 flex items-center gap-0.5">
                      <Sparkles className="w-3 h-3" /> +{entry.rewardExp} EXP
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-8 rounded-2xl bg-[#0c0d16] border border-white/5 my-auto">
            <History className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-bold text-slate-300">Không có bản ghi nhật ký phù hợp</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Hãy đặt các vật phẩm bậc thấp vào Bình Luyện Kim để tiến hành thí nghiệm khám phá công thức đầu tiên!
            </p>
            <button
              type="button"
              onClick={onBackToLab}
              className="mt-4 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Vào Phòng Khám Phá Ngay
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
