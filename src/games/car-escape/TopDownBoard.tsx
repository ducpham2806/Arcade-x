import React, { useRef, useState } from "react";
import { bounds, type Move } from "./engine";
import type { Vehicle, LevelConfig } from "./types";
import { ToyCar } from "./ToyCar";
export const CAR_CELL = 64;
const MARGIN = 28;
export function TopDownBoard({
  config,
  vehicles,
  disabled,
  hint,
  onMove,
}: {
  config: LevelConfig;
  vehicles: Vehicle[];
  disabled: boolean;
  hint: Move | null;
  onMove: (move: Move) => void;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [destination, setDestination] = useState<number | null>(null);
  const [drag, setDrag] = useState<{
    id: number;
    x: number;
    y: number;
    from: number;
    to: number;
    pointer: number;
  } | null>(null);
  const dragRef = useRef(drag);
  dragRef.current = drag;
  const project = (x: number, y: number) => [
    MARGIN + x * CAR_CELL,
    MARGIN + y * CAR_CELL,
  ];
  const edge = config.size * CAR_CELL;
  const point = (e: React.PointerEvent) => {
    const p = svg.current!.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    return p.matrixTransform(svg.current!.getScreenCTM()!.inverse());
  };
  const current = vehicles.find((v) => v.id === selected),
    range = current ? bounds(current, vehicles, config.size) : null;
  const move = (m: Move) => {
    if (!disabled) onMove(m);
  };
  const finish = (e: React.PointerEvent) => {
    const d = dragRef.current;
    dragRef.current = null;
    setDrag(null);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    if (d && !disabled && d.from !== d.to) move({ vehicleId: d.id, to: d.to });
  };
  const cancel = () => {
    dragRef.current = null;
    setDrag(null);
  };
  React.useEffect(() => {
    if (disabled) cancel();
  }, [disabled]);
  return (
    <div className="car-board-shell">
      <svg
        id="car-board"
        data-cell-size={CAR_CELL}
        ref={svg}
        viewBox={`0 0 ${edge + MARGIN * 2} ${edge + MARGIN * 2}`}
        role="group"
        aria-label={`Bãi xe 2D ${config.size} nhân ${config.size}`}
        data-no-swipe="true"
        className="arcade-board car-topdown-board"
        onPointerMove={(e) => {
          const d = dragRef.current;
          if (!d || disabled) return;
          const v = vehicles.find((v) => v.id === d.id)!;
          const p = point(e),
            dx = p.x - d.x,
            dy = p.y - d.y,
            delta = v.isHorizontal ? dx / CAR_CELL : dy / CAR_CELL;
          const range = bounds(v, vehicles, config.size),
            to = Math.max(
              range.min,
              Math.min(range.max, d.from + Math.round(delta)),
            );
          const next = { ...d, to };
          dragRef.current = next;
          setDrag(next);
        }}
        onPointerUp={finish}
        onPointerCancel={cancel}
        onLostPointerCapture={cancel}
      >
        <defs>
          <linearGradient id="car-road" x2="0" y2="1">
            <stop stopColor="#566577" />
            <stop offset="1" stopColor="#374659" />
          </linearGradient>
          <pattern
            id="car-road-grain"
            width="13"
            height="17"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="3" cy="4" r=".7" fill="#e4ecf4" opacity=".12" />
            <circle cx="10" cy="12" r=".8" fill="#12202d" opacity=".18" />
          </pattern>
          <pattern
            id="car-sidewalk"
            width="16"
            height="16"
            patternUnits="userSpaceOnUse"
          >
            <rect width="16" height="16" fill="#dce3df" />
            <path d="M0 0H16V16" fill="none" stroke="#b2c4bc" />
          </pattern>
          <linearGradient id="car-glass" x2=".8" y2="1">
            <stop stopColor="#c3f3ff" />
            <stop offset=".35" stopColor="#4087a6" />
            <stop offset="1" stopColor="#16364e" />
          </linearGradient>
        </defs>
        <g aria-hidden="true" pointerEvents="none">
          <rect
            width={edge + MARGIN * 2}
            height={edge + MARGIN * 2}
            rx="20"
            fill="#86be99"
          />
          <rect
            x="13"
            y="13"
            width={edge + 30}
            height={edge + 30}
            rx="12"
            fill="url(#car-sidewalk)"
          />
          <rect
            x={MARGIN - 4}
            y={MARGIN - 4}
            width={edge + 8}
            height={edge + 8}
            rx="7"
            fill="#b3c1c6"
          />
          <rect
            x={MARGIN}
            y={MARGIN}
            width={edge}
            height={edge}
            fill="url(#car-road)"
          />
          <rect
            x={MARGIN}
            y={MARGIN}
            width={edge}
            height={edge}
            fill="url(#car-road-grain)"
          />
          {Array.from({ length: config.size + 1 }, (_, i) => (
            <g
              key={i}
              stroke="#b7c7d0"
              strokeWidth="1.3"
              strokeDasharray="4 5"
              opacity=".55"
            >
              <path d={`M${project(i, 0)}L${project(i, config.size)}`} />
              <path d={`M${project(0, i)}L${project(config.size, i)}`} />
            </g>
          ))}
          <rect
            x={MARGIN}
            y={MARGIN + config.targetRow * CAR_CELL + 2}
            width={edge}
            height={CAR_CELL - 4}
            fill="#ffc54c"
            opacity=".08"
          />
          {Array.from({ length: config.size }, (_, i) => (
            <g key={i}>
              <rect
                x={MARGIN + i * CAR_CELL + 10}
                y={MARGIN - 8}
                width="28"
                height="4"
                rx="1"
                fill={i % 2 ? "#fff8e4" : "#e8a553"}
              />
              <rect
                x={MARGIN + i * CAR_CELL + 10}
                y={MARGIN + edge + 4}
                width="28"
                height="4"
                rx="1"
                fill={i % 2 ? "#e8a553" : "#fff8e4"}
              />
            </g>
          ))}
          {[0.2, 0.72].map((p, i) => (
            <g key={p} transform={`translate(9 ${MARGIN + edge * p})`}>
              <ellipse cy="3" rx="9" ry="12" fill="#275c45" opacity=".2" />
              <circle r="8" fill={i ? "#3a9863" : "#287b50"} />
              <circle cx="-2" cy="-3" r="5" fill="#63b875" />
            </g>
          ))}
          <g transform={`translate(${edge * 0.6 + MARGIN} 10)`}>
            <rect x="-18" y="-4" width="36" height="9" rx="3" fill="#be7955" />
            <path d="M-13 -2H13M-13 2H13" stroke="#e9b985" strokeWidth="1.4" />
          </g>
          <g
            transform={`translate(${edge + MARGIN + 14} ${edge + MARGIN - 15})`}
          >
            <ellipse cy="3" rx="8" ry="3" fill="#223b40" opacity=".2" />
            <path d="M-5 4L0 -8L5 4Z" fill="#ff8c47" />
            <path d="M-3 0H3" stroke="#fff2d6" strokeWidth="3" />
          </g>
          <rect
            x={MARGIN + edge}
            y={MARGIN + config.targetRow * CAR_CELL + 4}
            width={MARGIN}
            height={CAR_CELL - 8}
            fill="#77dab4"
          />
          <path
            d={`M${MARGIN + edge + 5} ${MARGIN + (config.targetRow + 0.5) * CAR_CELL}h16m-6,-6l6,6l-6,6`}
            stroke="#155b4b"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        {[...vehicles]
          .sort((a, b) => Number(a.isTarget) - Number(b.isTarget))
          .map((v) => {
            const preview = drag?.id === v.id && !disabled ? drag.to : null;
            const col = v.isHorizontal && preview !== null ? preview : v.col,
              row = !v.isHorizontal && preview !== null ? preview : v.row;
            const length = v.length * CAR_CELL;
            const [x, y] = project(col, row);
            const highlighted = selected === v.id || hint?.vehicleId === v.id;
            return (
              <g
                key={v.id}
                data-car-id={v.id}
                data-position={v.isHorizontal ? v.col : v.row}
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-label={`${v.isTarget ? "Xe cứu hộ chính" : `Xe ${v.id}`} · ${v.isHorizontal ? "ngang" : "dọc"}`}
                aria-pressed={selected === v.id}
                className={`topdown-car ${v.isTarget ? "topdown-target" : ""} ${highlighted ? "topdown-selected" : ""}`}
                onKeyDown={(e) => {
                  if (disabled) return;
                  setSelected(v.id);
                  const negative = v.isHorizontal
                      ? e.key === "ArrowLeft"
                      : e.key === "ArrowUp",
                    positive = v.isHorizontal
                      ? e.key === "ArrowRight"
                      : e.key === "ArrowDown";
                  if (negative || positive) {
                    e.preventDefault();
                    const p = v.isHorizontal ? v.col : v.row,
                      r = bounds(v, vehicles, config.size);
                    move({
                      vehicleId: v.id,
                      to: e.shiftKey
                        ? negative
                          ? r.min
                          : r.max
                        : p + (negative ? -1 : 1),
                    });
                  }
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected(v.id);
                  }
                }}
                onPointerDown={(e) => {
                  if (disabled || dragRef.current) return;
                  e.preventDefault();
                  e.stopPropagation();
                  const p = point(e),
                    from = v.isHorizontal ? v.col : v.row;
                  setSelected(v.id);
                  setDestination(null);
                  const d = {
                    id: v.id,
                    x: p.x,
                    y: p.y,
                    from,
                    to: from,
                    pointer: e.pointerId,
                  };
                  dragRef.current = d;
                  setDrag(d);
                  svg.current!.setPointerCapture(e.pointerId);
                }}
              >
                <rect
                  x={x + 4}
                  y={y + 4}
                  width={(v.isHorizontal ? length : CAR_CELL) - 8}
                  height={(v.isHorizontal ? CAR_CELL : length) - 8}
                  rx="10"
                  fill="transparent"
                  pointerEvents="all"
                />
                <g
                  transform={
                    v.isHorizontal
                      ? `translate(${x} ${y})`
                      : `translate(${x + CAR_CELL} ${y}) rotate(90)`
                  }
                  pointerEvents="none"
                >
                  <ToyCar
                    vehicle={v}
                    length={length}
                    highlighted={highlighted}
                  />
                </g>
              </g>
            );
          })}
        {current &&
          range &&
          !disabled &&
          !drag &&
          Array.from(
            { length: range.max - range.min + 1 },
            (_, i) => range.min + i,
          )
            .filter(
              (p) => p !== (current.isHorizontal ? current.col : current.row),
            )
            .map((p) => {
              const c = current.isHorizontal ? p : current.col,
                r = current.isHorizontal ? current.row : p,
                [x, y] = project(
                  c + (current.isHorizontal ? current.length / 2 : 0.5),
                  r + (current.isHorizontal ? 0.5 : current.length / 2),
                );
              return (
                <g
                  key={p}
                  role="button"
                  tabIndex={0}
                  aria-label={`Trượt xe ${current.id} tới vị trí ${p + 1}`}
                  className="car-destination"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    move({ vehicleId: current.id, to: p });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      move({ vehicleId: current.id, to: p });
                    }
                  }}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r="11"
                    fill="#a8ffe0"
                    stroke="#123e36"
                    strokeWidth="2"
                  />
                  <text
                    x={x}
                    y={y + 3}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#123e36"
                  >
                    {p + 1}
                  </text>
                </g>
              );
            })}
      </svg>
      <div className="car-select-move-row">
        <div className="car-select-move">
          <select
            aria-label="Chọn xe để di chuyển"
            disabled={disabled}
            value={selected ?? ""}
            onChange={(e) => {
              setSelected(Number(e.target.value));
              setDestination(null);
            }}
          >
            <option value="" disabled>
              Chọn xe
            </option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.isTarget ? "Xe cứu hộ" : `Xe ${v.id}`}
              </option>
            ))}
          </select>
          <select
            aria-label="Điểm đến của xe đã chọn"
            disabled={disabled || !current || !range}
            value={
              destination ??
              (current
                ? current.isHorizontal
                  ? current.col
                  : current.row
                : "")
            }
            onChange={(e) => setDestination(Number(e.target.value))}
          >
            {current && range ? (
              Array.from(
                { length: range.max - range.min + 1 },
                (_, i) => range.min + i,
              ).map((p) => (
                <option key={p} value={p}>
                  Ô {p + 1}
                </option>
              ))
            ) : (
              <option value="">Điểm đến</option>
            )}
          </select>
          <button
            disabled={
              disabled ||
              !current ||
              destination === null ||
              destination === (current.isHorizontal ? current.col : current.row)
            }
            onClick={() => {
              if (current && destination !== null) {
                move({ vehicleId: current.id, to: destination });
                setDestination(null);
              }
            }}
          >
            Di chuyển
          </button>
        </div>
      </div>
      <p className="car-touch-tip">
        {selected === null
          ? "Kéo xe theo hàng hoặc cột · hoặc chạm xe rồi chọn điểm đến"
          : range && range.min === range.max
            ? "Xe đang bị chặn · cần dọn lối bằng xe khác"
            : `${current?.isTarget ? "Xe cứu hộ" : `Xe ${selected}`} đã chọn · chạm điểm xanh để trượt`}
      </p>
    </div>
  );
}
