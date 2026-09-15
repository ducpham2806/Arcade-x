import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { PlayerStats } from '../types';
import { getRecent7DaysEloProgression, DailyEloPoint, getLienQuanRankInfo, LienQuanRankInfo } from '../utils/eloRankSystem';
import { RankBadge } from './RankBadge';
import { TrendingUp, Zap, Trophy, Target, Shield, ChevronRight, Award, Sparkles, Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface EloProgressionChartProps {
  stats: PlayerStats;
  className?: string;
}

export const EloProgressionChart: React.FC<EloProgressionChartProps> = ({ stats, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedPoint, setSelectedPoint] = useState<DailyEloPoint | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(500);

  const data: DailyEloPoint[] = getRecent7DaysEloProgression(stats);
  const currentPoint = data[data.length - 1];
  const startPoint = data[0];
  const net7DayEloDelta = currentPoint ? currentPoint.elo - startPoint.elo : 0;
  const peakElo = Math.max(...data.map(d => d.elo), 100);
  const currentRankInfo: LienQuanRankInfo = currentPoint ? currentPoint.rankInfo : getLienQuanRankInfo(1200);

  // ResizeObserver for responsive canvas sizing
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // D3 Render Effect
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    const width = containerWidth || 500;
    const height = 230;
    const margin = { top: 28, right: 30, bottom: 38, left: 52 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', '100%').attr('height', height);

    // Defs: Gradients & Filters
    const defs = svg.append('defs');

    // Luminous Area Gradient
    const areaGradient = defs
      .append('linearGradient')
      .attr('id', 'elo-area-gradient-d3')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient.append('stop').attr('offset', '0%').attr('stop-color', currentRankInfo.theme.hexPrimary).attr('stop-opacity', 0.45);
    areaGradient.append('stop').attr('offset', '60%').attr('stop-color', currentRankInfo.theme.hexSecondary).attr('stop-opacity', 0.12);
    areaGradient.append('stop').attr('offset', '100%').attr('stop-color', '#0a0a0a').attr('stop-opacity', 0.0);

    // Multi-tier Line Gradient
    const lineGradient = defs
      .append('linearGradient')
      .attr('id', 'elo-line-gradient-d3')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    lineGradient.append('stop').attr('offset', '0%').attr('stop-color', '#38bdf8'); // sky
    lineGradient.append('stop').attr('offset', '40%').attr('stop-color', '#818cf8'); // indigo
    lineGradient.append('stop').attr('offset', '75%').attr('stop-color', '#c084fc'); // purple
    lineGradient.append('stop').attr('offset', '100%').attr('stop-color', currentRankInfo.theme.hexPrimary); // dynamic tier

    // Glow filter
    const filter = defs.append('filter').attr('id', 'glow-d3').attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur');
    filter.append('feMerge').selectAll('feMergeNode').data(['blur', 'SourceGraphic']).enter().append('feMergeNode').attr('in', (d) => d);

    // Scales
    const minEloVal = Math.min(...data.map(d => d.elo));
    const maxEloVal = Math.max(...data.map(d => d.elo));
    const yMin = Math.max(0, Math.floor(minEloVal * 0.85 / 100) * 100);
    const yMax = Math.ceil(maxEloVal * 1.15 / 100) * 100;

    const xScale = d3
      .scalePoint<string>()
      .domain(data.map(d => d.dayLabel))
      .range([margin.left, width - margin.right])
      .padding(0.18);

    const yScale = d3
      .scaleLinear()
      .domain([yMin, yMax])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Grid lines (Horizontal)
    const yTicks = yScale.ticks(4);
    const gridGroup = svg.append('g').attr('class', 'grid-lines').attr('stroke', '#ffffff').attr('stroke-opacity', 0.07);

    yTicks.forEach(tickVal => {
      gridGroup
        .append('line')
        .attr('x1', margin.left)
        .attr('x2', width - margin.right)
        .attr('y1', yScale(tickVal))
        .attr('y2', yScale(tickVal))
        .attr('stroke-dasharray', '3,3');
    });

    // Area Generator
    const areaGenerator = d3
      .area<DailyEloPoint>()
      .x(d => xScale(d.dayLabel)!)
      .y0(yScale(yMin))
      .y1(d => yScale(d.elo))
      .curve(d3.curveMonotoneX);

    // Line Generator
    const lineGenerator = d3
      .line<DailyEloPoint>()
      .x(d => xScale(d.dayLabel)!)
      .y(d => yScale(d.elo))
      .curve(d3.curveMonotoneX);

    // Draw Area under curve
    svg
      .append('path')
      .datum(data)
      .attr('d', areaGenerator)
      .attr('fill', 'url(#elo-area-gradient-d3)');

    // Draw Line
    const path = svg
      .append('path')
      .datum(data)
      .attr('d', lineGenerator)
      .attr('fill', 'none')
      .attr('stroke', 'url(#elo-line-gradient-d3)')
      .attr('stroke-width', 3.5)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('filter', 'url(#glow-d3)');

    // Animate line stroke entrance
    const totalLength = path.node()?.getTotalLength() || 0;
    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(850)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0);

    // X Axis Labels
    const xAxisGroup = svg.append('g').attr('transform', `translate(0, ${height - margin.bottom})`);

    data.forEach((d, index) => {
      const xPos = xScale(d.dayLabel)!;
      const isToday = index === data.length - 1;

      xAxisGroup
        .append('text')
        .attr('x', xPos)
        .attr('y', 19)
        .attr('text-anchor', 'middle')
        .attr('font-size', isToday ? '11px' : '10px')
        .attr('font-weight', isToday ? 'bold' : '600')
        .attr('fill', isToday ? '#fbbf24' : '#64748b')
        .attr('font-family', 'sans-serif')
        .text(d.dayLabel);
    });

    // Y Axis Labels (with ELO values)
    const yAxisGroup = svg.append('g');
    yTicks.forEach(tickVal => {
      yAxisGroup
        .append('text')
        .attr('x', margin.left - 10)
        .attr('y', yScale(tickVal) + 3.5)
        .attr('text-anchor', 'end')
        .attr('font-size', '9.5px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .attr('fill', '#64748b')
        .text(tickVal >= 1000 ? `${(tickVal / 1000).toFixed(1)}k` : `${tickVal}`);
    });

    // Data Points & Interactive Hit Areas
    const dotsGroup = svg.append('g').attr('class', 'data-points');

    data.forEach((d, index) => {
      const cx = xScale(d.dayLabel)!;
      const cy = yScale(d.elo);
      const isToday = index === data.length - 1;
      const pointColor = d.rankInfo.theme.hexPrimary;

      // Pulse ring for today's data point
      if (isToday) {
        dotsGroup
          .append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', 9)
          .attr('fill', 'none')
          .attr('stroke', pointColor)
          .attr('stroke-width', 2)
          .attr('opacity', 0.7)
          .attr('class', 'animate-ping origin-center');
      }

      // Outer Glow Dot
      dotsGroup
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', isToday ? 6 : 4.5)
        .attr('fill', pointColor)
        .attr('stroke', '#0d0d12')
        .attr('stroke-width', 2)
        .attr('filter', 'drop-shadow(0 0 4px rgba(255,255,255,0.3))');

      // Inner Core Dot
      dotsGroup
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', isToday ? 2.5 : 2)
        .attr('fill', '#ffffff');

      // Transparent interactive hover hit area
      dotsGroup
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 20)
        .attr('fill', 'transparent')
        .attr('cursor', 'pointer')
        .on('mouseenter', () => {
          setSelectedPoint(d);
          setHoverPos({ x: cx, y: cy });
        })
        .on('click', () => {
          setSelectedPoint(d);
          setHoverPos({ x: cx, y: cy });
        });
    });

  }, [data, currentRankInfo, containerWidth]);

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-[#121218] border border-white/10 space-y-4 shadow-xl ${className}`}>
      {/* Header: Title, Liên Quân Rank Badge, and Key Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-white uppercase tracking-wider font-display">
                TIẾN TRÌNH ELO 7 NGÀY
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 font-mono">
                D3.js
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Xếp hạng Liên Quân Mobile theo mốc điểm ELO tích luỹ
            </p>
          </div>
        </div>

        {/* Current Active Rank Badge with Tooltip */}
        <div className="flex items-center gap-2">
          <RankBadge elo={currentPoint?.elo || 1200} size="md" showTooltip={true} pulse={true} />
        </div>
      </div>

      {/* Summary Stat Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Metric 1: Current ELO */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-[#0a0a0f] border border-white/5">
          <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>ELO Hiện Tại</span>
          </div>
          <div className={`text-base sm:text-lg font-black font-mono mt-0.5 ${currentRankInfo.theme.textColor}`}>
            {(currentPoint?.elo || 0).toLocaleString()}
          </div>
        </div>

        {/* Metric 2: 7-Day Trend (+Δ ELO) */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-[#0a0a0f] border border-white/5">
          <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>Biến Động 7 Ngày</span>
          </div>
          <div className={`text-base sm:text-lg font-black font-mono mt-0.5 ${
            net7DayEloDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {net7DayEloDelta >= 0 ? `+${net7DayEloDelta.toLocaleString()}` : net7DayEloDelta.toLocaleString()} ELO
          </div>
        </div>

        {/* Metric 3: 7-Day Peak ELO */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-[#0a0a0f] border border-white/5">
          <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
            <Trophy className="w-3 h-3 text-yellow-400" />
            <span>Đỉnh Cao 7 Ngày</span>
          </div>
          <div className="text-base sm:text-lg font-black font-mono text-yellow-400 mt-0.5">
            {peakElo.toLocaleString()}
          </div>
        </div>

        {/* Metric 4: Next Rank Goal */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-[#0a0a0f] border border-white/5">
          <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
            <Target className="w-3 h-3 text-indigo-400" />
            <span>Mục Tiêu Kế Tiếp</span>
          </div>
          <div className="text-xs sm:text-sm font-black text-indigo-300 truncate mt-0.5">
            {currentRankInfo.nextRankName ? (
              <span className="flex items-center gap-1">
                <span>{currentRankInfo.nextRankName}</span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  (+{currentRankInfo.eloToNextRank})
                </span>
              </span>
            ) : (
              <span className="text-amber-300 font-mono">Đỉnh Thách Đấu</span>
            )}
          </div>
        </div>
      </div>

      {/* D3 Interactive SVG Canvas */}
      <div ref={containerRef} className="relative w-full h-[230px] select-none bg-[#0a0a0e] rounded-xl border border-white/5 p-1">
        <svg ref={svgRef} className="w-full h-full overflow-visible" />

        {/* Floating D3 Tooltip */}
        {selectedPoint && hoverPos && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute z-40 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 px-3.5 py-2.5 rounded-2xl bg-[#0d0d14]/95 border border-white/20 shadow-2xl backdrop-blur-xl text-center min-w-[150px]"
            style={{
              left: Math.min(Math.max(hoverPos.x, 80), containerWidth - 80),
              top: hoverPos.y,
              boxShadow: `0 10px 25px -5px ${selectedPoint.rankInfo.theme.hexPrimary}50, 0 0 20px rgba(0,0,0,0.9)`,
            }}
          >
            <div className="text-[10px] text-slate-400 font-semibold">{selectedPoint.fullDateLabel}</div>
            
            <div className="flex items-center justify-center gap-1.5 my-1">
              <span className={`text-base font-black font-mono ${selectedPoint.rankInfo.theme.textColor}`}>
                {selectedPoint.elo.toLocaleString()} ELO
              </span>
              {selectedPoint.deltaElo !== 0 && (
                <span className={`text-[10px] font-bold font-mono px-1 rounded ${
                  selectedPoint.deltaElo > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {selectedPoint.deltaElo > 0 ? `+${selectedPoint.deltaElo}` : selectedPoint.deltaElo}
                </span>
              )}
            </div>

            {/* Rank badge inside tooltip */}
            <div className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-lg bg-black/60 border border-white/10 text-[10px] font-bold">
              <span>{selectedPoint.rankInfo.badgeEmoji}</span>
              <span className={selectedPoint.rankInfo.theme.textColor}>{selectedPoint.rankInfo.divisionName}</span>
            </div>

            <div className="text-[9px] text-slate-400 mt-1">
              {selectedPoint.gamesPlayed > 0 ? `${selectedPoint.gamesPlayed} ván đã đấu` : 'Không có ván đấu mới'}
            </div>

            {/* Tooltip Downward Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-5 border-x-transparent border-t-5 border-t-[#0d0d14]/95" />
          </motion.div>
        )}
      </div>

      {/* Progress towards next rank bar */}
      <div className="p-3 rounded-xl bg-[#0a0a0f] border border-white/5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-300">
            <span>Tiến độ thăng hạng:</span>
            <span className={`font-mono ${currentRankInfo.theme.textColor}`}>{currentRankInfo.divisionName}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-emerald-400 font-mono">
              {currentRankInfo.nextRankName || 'Vinh Quang Thách Đấu'}
            </span>
          </div>
          <span className="font-mono font-black text-amber-400">
            {currentRankInfo.tierId === 'challenger' ? 'MAX RANK' : `${currentRankInfo.progressPercent}%`}
          </span>
        </div>

        <div className="w-full h-2.5 bg-[#050505] rounded-full overflow-hidden border border-white/10 relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${currentRankInfo.progressPercent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`h-full bg-gradient-to-r ${currentRankInfo.theme.gradientClass} rounded-full`}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>{currentRankInfo.minElo.toLocaleString()} ELO</span>
          {currentRankInfo.nextRankElo ? (
            <span className="text-emerald-400 font-semibold">
              Cần thêm +{currentRankInfo.eloToNextRank.toLocaleString()} ELO để lên cấp
            </span>
          ) : (
            <span className="text-amber-300 font-semibold">Bậc Hạng Cao Nhất Server</span>
          )}
          <span>{currentRankInfo.nextRankElo ? `${currentRankInfo.nextRankElo.toLocaleString()} ELO` : '∞'}</span>
        </div>
      </div>

      {/* Chart Legend & Footnote */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-slate-400 pt-1 border-t border-white/5">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
            <span>Đường biểu diễn ELO</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            <span>Mốc hôm nay</span>
          </span>
        </div>
        <span className="text-slate-400 italic">
          💡 Rà chuột hoặc chạm vào các điểm mốc để xem chi tiết từng ngày
        </span>
      </div>
    </div>
  );
};
