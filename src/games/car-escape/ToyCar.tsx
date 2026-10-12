import React, { useId } from "react";
import type { Vehicle } from "./types";

/** Original vector toy cars. All artwork faces right; the board rotates vertical cars. */
export function ToyCar({
  vehicle: v,
  length,
  highlighted,
}: {
  vehicle: Vehicle;
  length: number;
  highlighted: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const paint = v.isTarget ? "#ffc531" : v.color;
  const truck = v.length === 3;
  const front = length - 7;
  const roofStart = truck ? length - 65 : length * 0.29;
  const roofEnd = truck ? length - 30 : length * 0.68;
  return (
    <g className="car-art">
      <defs>
        <linearGradient id={`paint-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#fff" stopOpacity=".85" />
          <stop offset=".13" stopColor={paint} />
          <stop offset=".66" stopColor={paint} />
          <stop offset="1" stopColor="#142230" stopOpacity=".85" />
        </linearGradient>
      </defs>
      <rect
        x="8"
        y="12"
        width={length - 13}
        height="47"
        rx="14"
        fill="#152332"
        opacity=".35"
      />
      {[19, length - 30].map((x) => (
        <g key={x}>
          <rect x={x} y="7" width="18" height="12" rx="4" fill="#15212d" />
          <rect x={x} y="45" width="18" height="12" rx="4" fill="#15212d" />
          <path
            d={`M${x + 3} 10h12M${x + 3} 54h12`}
            stroke="#637585"
            strokeWidth="2"
          />
        </g>
      ))}
      <path
        d={`M17 12H${length - 22}Q${front} 12 ${front} 26V38Q${front} 52 ${length - 22} 52H17Q7 52 7 42V22Q7 12 17 12Z`}
        fill={`url(#paint-${id})`}
        stroke={highlighted ? "#d4ffee" : v.isTarget ? "#fff2b0" : "#142f43"}
        strokeWidth={highlighted ? 3 : 1.4}
      />
      <path
        d={`M18 16H${length - 24}`}
        stroke="#fff"
        opacity=".5"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d={`M18 48H${length - 24}`}
        stroke="#152638"
        opacity=".3"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {truck ? (
        <g>
          <rect
            x="14"
            y="17"
            width={length - 86}
            height="30"
            rx="4"
            fill={paint}
            stroke="#203344"
            strokeOpacity=".3"
          />
          {Array.from({ length: 6 }, (_, i) => (
            <path
              key={i}
              d={`M${21 + (i * (length - 99)) / 5} 20v24`}
              stroke="#fff"
              strokeOpacity=".25"
              strokeWidth="2"
            />
          ))}
          <path
            d={`M${length - 71} 15v34`}
            stroke="#16354b"
            strokeOpacity=".5"
            strokeWidth="2"
          />
        </g>
      ) : (
        <g>
          <path
            d={`M${roofStart - 11} 20L${roofStart - 3} 17V47L${roofStart - 11} 44Z`}
            fill="url(#car-glass)"
            stroke="#17354a"
          />
          <path
            d={`M${roofStart + 2} 15H${roofEnd - 3}L${roofEnd - 6} 20H${roofStart + 5}Z`}
            fill="#1b4056"
          />
          <path
            d={`M${roofStart + 2} 49H${roofEnd - 3}L${roofEnd - 6} 44H${roofStart + 5}Z`}
            fill="#1b4056"
          />
        </g>
      )}
      <rect
        x={roofStart}
        y="20"
        width={roofEnd - roofStart}
        height="24"
        rx="5"
        fill={paint}
      />
      <path
        d={`M${roofEnd} 17L${roofEnd + 11} 21V43L${roofEnd} 47Z`}
        fill="url(#car-glass)"
        stroke="#15374d"
        strokeWidth="1.2"
      />
      <path
        d={`M${roofEnd + 3} 20L${roofEnd + 8} 23V35`}
        fill="none"
        stroke="#e4faff"
        strokeWidth="2"
        opacity=".6"
      />
      <rect
        x={roofEnd + 1}
        y="10"
        width="8"
        height="5"
        rx="2"
        fill={paint}
        stroke="#1e3b4d"
      />
      <rect
        x={roofEnd + 1}
        y="49"
        width="8"
        height="5"
        rx="2"
        fill={paint}
        stroke="#1e3b4d"
      />
      <path
        d={`M${front - 7} 19v7m0 12v7`}
        stroke="#fff7c4"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M10 20v7m0 10v7"
        stroke="#ff6561"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d={`M${front - 2} 29v6`} stroke="#163040" strokeWidth="3" />
      <path d={`M${front - 11} 27v10`} stroke="#fff" strokeOpacity=".3" />
      {v.isTarget ? (
        <g>
          <circle
            cx={roofStart + (roofEnd - roofStart) / 2}
            cy="32"
            r="10"
            fill="#fff9e7"
          />
          <path
            d={`M${roofStart + (roofEnd - roofStart) / 2 - 5} 32h10m-5,-5v10`}
            stroke="#eb4754"
            strokeWidth="3.5"
          />
          <rect
            className="car-beacon"
            x={roofEnd - 7}
            y="24"
            width="5"
            height="16"
            rx="2"
            fill="#ff5269"
          />
          <path
            d={`M${length - 23} 29l4 3l-4 3`}
            fill="none"
            stroke="#89521a"
            strokeWidth="2"
          />
        </g>
      ) : (
        <text
          x={roofStart + (roofEnd - roofStart) / 2}
          y="36"
          textAnchor="middle"
          fontSize="12"
          fontWeight="900"
          fill="#fff"
          stroke="#17374c"
          strokeWidth="2"
          paintOrder="stroke"
        >
          {v.id}
        </text>
      )}
    </g>
  );
}
