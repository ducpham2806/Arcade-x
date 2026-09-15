import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { PlayerStats } from '../types';
import { getRecent7DaysScoreHistory, DailyScorePoint } from '../services/storage';
import { TrendingUp, Award, Calendar, Zap } from 'lucide-react';

interface ScoreProgressChartProps {
  stats: PlayerStats;
}

export const ScoreProgressChart: React.FC<ScoreProgressChartProps> = ({ stats }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedPoint, setSelectedPoint] = useState<DailyScorePoint | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  const data: DailyScorePoint[] = getRecent7DaysScoreHistory(stats);

  const total7Days = data.reduce((sum, d) => sum + d.score, 0);
  const maxScore = Math.max(...data.map(d => d.score), 100);
  const todayPoint = data[data.length - 1];
  const yesterdayPoint = data[data.length - 2];
  const dayOverDayGrowth = yesterdayPoint && yesterdayPoint.score > 0
    ? Math.round(((todayPoint.score - yesterdayPoint.score) / yesterdayPoint.score) * 100)
    : 0;

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth || 500;
    const height = 210;
    const margin = { top: 25, right: 25, bottom: 35, left: 45 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', '100%').attr('height', height);

    // Defs: Gradients & Filters
    const defs = svg.append('defs');

    // Area Gradient
    const areaGradient = defs
      .append('linearGradient')
      .attr('id', 'area-gradient-d3')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient.append('stop').attr('offset', '0%').attr('stop-color', '#6366f1').attr('stop-opacity', 0.45);
    areaGradient.append('stop').attr('offset', '75%').attr('stop-color', '#818cf8').attr('stop-opacity', 0.08);
    areaGradient.append('stop').attr('offset', '100%').attr('stop-color', '#0e0e0e').attr('stop-opacity', 0.0);

    // Line Gradient
    const lineGradient = defs
      .append('linearGradient')
      .attr('id', 'line-gradient-d3')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    lineGradient.append('stop').attr('offset', '0%').attr('stop-color', '#38bdf8');
    lineGradient.append('stop').attr('offset', '60%').attr('stop-color', '#6366f1');
    lineGradient.append('stop').attr('offset', '100%').attr('stop-color', '#c084fc');

    // Scales
    const xScale = d3
      .scalePoint<string>()
      .domain(data.map(d => d.dayLabel))
      .range([margin.left, width - margin.right])
      .padding(0.15);

    const yScale = d3
      .scaleLinear()
      .domain([0, Math.ceil(maxScore * 1.25)])
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
      .area<DailyScorePoint>()
      .x(d => xScale(d.dayLabel)!)
      .y0(yScale(0))
      .y1(d => yScale(d.score))
      .curve(d3.curveMonotoneX);

    // Line Generator
    const lineGenerator = d3
      .line<DailyScorePoint>()
      .x(d => xScale(d.dayLabel)!)
      .y(d => yScale(d.score))
      .curve(d3.curveMonotoneX);

    // Draw Area
    svg
      .append('path')
      .datum(data)
      .attr('d', areaGenerator)
      .attr('fill', 'url(#area-gradient-d3)');

    // Draw Line
    const path = svg
      .append('path')
      .datum(data)
      .attr('d', lineGenerator)
      .attr('fill', 'none')
      .attr('stroke', 'url(#line-gradient-d3)')
      .attr('stroke-width', 3)
      .attr('stroke-linecap', 'round');

    // Animate line stroke drawing
    const totalLength = path.node()?.getTotalLength() || 0;
    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(900)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0);

    // X Axis
    const xAxisGroup = svg.append('g').attr('transform', `translate(0, ${height - margin.bottom})`);

    data.forEach((d, index) => {
      const xPos = xScale(d.dayLabel)!;
      const isToday = index === data.length - 1;

      xAxisGroup
        .append('text')
        .attr('x', xPos)
        .attr('y', 18)
        .attr('text-anchor', 'middle')
        .attr('font-size', isToday ? '11px' : '10px')
        .attr('font-weight', isToday ? 'bold' : 'normal')
        .attr('fill', isToday ? '#a5b4fc' : '#64748b')
        .attr('font-family', 'sans-serif')
        .text(d.dayLabel);
    });

    // Y Axis labels
    const yAxisGroup = svg.append('g');
    yTicks.forEach(tickVal => {
      yAxisGroup
        .append('text')
        .attr('x', margin.left - 8)
        .attr('y', yScale(tickVal) + 3.5)
        .attr('text-anchor', 'end')
        .attr('font-size', '9px')
        .attr('font-family', 'monospace')
        .attr('fill', '#64748b')
        .text(tickVal >= 1000 ? `${(tickVal / 1000).toFixed(1)}k` : tickVal);
    });

    // Interactive Dots & Hover areas
    const dotsGroup = svg.append('g').attr('class', 'data-points');

    data.forEach((d, index) => {
      const cx = xScale(d.dayLabel)!;
      const cy = yScale(d.score);
      const isToday = index === data.length - 1;

      // Pulse ring for today
      if (isToday) {
        dotsGroup
          .append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', 8)
          .attr('fill', 'none')
          .attr('stroke', '#818cf8')
          .attr('stroke-width', 1.5)
          .attr('opacity', 0.6)
          .attr('class', 'animate-ping origin-center');
      }

      // Outer circle
      dotsGroup
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', isToday ? 5 : 4)
        .attr('fill', isToday ? '#fbbf24' : '#6366f1')
        .attr('stroke', '#0a0a0a')
        .attr('stroke-width', 2);

      // Inner dot
      dotsGroup
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 2)
        .attr('fill', '#ffffff');

      // Transparent hover hit area
      dotsGroup
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 16)
        .attr('fill', 'transparent')
        .attr('cursor', 'pointer')
        .on('mouseenter', (event) => {
          setSelectedPoint(d);
          const rect = container.getBoundingClientRect();
          setHoverPos({
            x: cx,
            y: cy,
          });
        })
        .on('mouseleave', () => {
          // Keep selected or clear
        });
    });

  }, [stats, data, maxScore]);

  return (
    <div className="p-4 rounded-2xl bg-[#141414] border border-white/5 space-y-3">
      {/* Header with Title & Stat Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Tiến Độ Điểm Số 7 Ngày</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
                D3.js
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">Theo dõi sự bứt phá kỹ năng qua các ngày</p>
          </div>
        </div>

        {/* Quick summary metrics */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-2 py-1 rounded-lg bg-[#0a0a0a] border border-white/5 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="text-slate-400 text-[10px]">Tổng 7 ngày:</span>
            <span className="font-mono font-bold text-amber-400">{total7Days.toLocaleString()}</span>
          </div>
          {dayOverDayGrowth !== 0 && (
            <div className={`px-2 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 ${
              dayOverDayGrowth > 0
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              <span>{dayOverDayGrowth > 0 ? `+${dayOverDayGrowth}%` : `${dayOverDayGrowth}%`}</span>
              <span>vs hôm qua</span>
            </div>
          )}
        </div>
      </div>

      {/* D3 Chart Canvas Container */}
      <div ref={containerRef} className="relative w-full h-[210px] select-none">
        <svg ref={svgRef} className="w-full h-full overflow-visible" />

        {/* Floating Tooltip if selected */}
        {selectedPoint && hoverPos && (
          <div
            className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-2 rounded-xl bg-[#0a0a0a]/95 border border-indigo-500/40 shadow-xl shadow-indigo-950/40 backdrop-blur-md text-center min-w-[120px]"
            style={{ left: hoverPos.x, top: hoverPos.y }}
          >
            <div className="text-[10px] text-slate-400 font-medium">{selectedPoint.fullDateLabel}</div>
            <div className="text-sm font-extrabold text-white font-mono flex items-center justify-center gap-1 my-0.5">
              <span className="text-amber-400">★</span>
              <span>{selectedPoint.score.toLocaleString()} pts</span>
            </div>
            <div className="text-[9px] text-indigo-300">
              {selectedPoint.gamesPlayed > 0 ? `${selectedPoint.gamesPlayed} ván đã đấu` : 'Chưa ghi nhận ván đấu'}
            </div>
          </div>
        )}
      </div>

      {/* Chart Legend / Footnote */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-white/5">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
            <span>Điểm số đạt được</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            <span>Hôm nay</span>
          </span>
        </div>
        <span className="text-slate-400">Chạm hoặc di chuột vào các điểm mốc để xem chi tiết</span>
      </div>
    </div>
  );
};
