import React from 'react';

export function OAnQuanArt() {
  const pockets = [131, 170, 209, 248, 287];
  const pebbles = [[-8, 5], [0, -4], [9, 3], [-7, -5], [2, 7]];

  return <g transform="rotate(-9 210 125)">
    <ellipse cx="210" cy="184" rx="145" ry="20" fill="#251717" opacity=".63"/>
    <rect x="65" y="68" width="290" height="116" rx="28" fill="#5e2c24"/>
    <rect x="65" y="58" width="290" height="116" rx="28" fill="#e6ab6a" stroke="#f6d4a3" strokeWidth="3"/>
    <path d="M85 77h250M88 157h243" stroke="#ac603d" strokeWidth="3" opacity=".45"/>
    <path d="M105 80H315M105 114H315M105 151H315" stroke="#925137" strokeWidth="2" opacity=".6"/>
    {[96, 324].map(x => <g key={x} transform={`translate(${x} 115)`}>
      <ellipse rx="22" ry="32" fill="#934932" stroke="#f1cd99" strokeWidth="2"/>
      <path d="M-13 1l6-12 11-3 10 9-2 12-11 6-12-4Z" fill="#f5b735" stroke="#fbe293" strokeWidth="2"/>
      <path d="M-5-6l8-3 5 5M-8 2l3 6" stroke="#fff2ba" strokeWidth="2.5" strokeLinecap="round"/>
    </g>)}
    {[93, 136].map(y => pockets.map((x, column) => <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
      <ellipse rx="16" ry="16" fill="#995237" stroke="#f0c18a" strokeWidth="2"/>
      {pebbles.map(([dx, dy], index) => <g key={index} transform={`translate(${dx} ${dy})`}>
        <path d="M-3-2l2-2 4 1 1 4-3 2-4-1Z" fill={(column + index) % 3 === 0 ? '#949e9e' : '#f3eadc'}/>
        <path d="M-1-2h2" stroke="#fff8e6" strokeWidth="1.3" strokeLinecap="round"/>
      </g>)}
    </g>))}
    <path d="M150 205q60 21 110-7m-17-6 20 5-10 16" fill="none" stroke="#f6dfad" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </g>;
}

// Draw the same single and double rows as the playable court, with a ceramic Chàm.
const hopTiles = [
  [1, 179, 191], [2, 179, 166], [3, 179, 141], [4, 148, 116], [5, 210, 116],
  [6, 179, 91], [7, 148, 66], [8, 210, 66], [9, 179, 41],
];

export function NhayLoCoArt() {
  return <g transform="rotate(-11 210 125)">
    <path d="M122 238l22-211h128l27 211Z" fill="#295546"/>
    <path d="M108 231l26-213h142l34 213Z" fill="#578773" stroke="#8bb69a" strokeWidth="2"/>
    <path d="M128 209l29-52 9 30-12 44m134-81-14-47 7-39" stroke="#3c6857" strokeWidth="2"/>
    <path d="M160 38q48-55 98 0Z" fill="#f4b86c" stroke="#fff1d0" strokeWidth="3"/>
    <text x="209" y="33" textAnchor="middle" fill="#493021" fontSize="13" fontWeight="800" fontFamily="sans-serif">10</text>
    {hopTiles.map(([number, x, y]) => <g key={number} transform={`translate(${x} ${y})`}>
      <rect width="60" height="25" fill={number === 4 || number === 5 ? '#c97754' : '#346a61'} stroke="#fff1d0" strokeWidth="3"/>
      <text x="9" y="17" fill="#fff1d0" fontSize="13" fontWeight="800" fontFamily="sans-serif">{number}</text>
    </g>)}
    <path d="M199 119l10-10 13 3 7 11-9 13-15 1-9-7Z" fill="#61b8dd" stroke="#e0f5ec" strokeWidth="3"/>
    <path d="M204 125l6-3 6 3 5-5m-10 11 5-2" stroke="#1b5675" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M271 106l12-9m-8 23 15-3M135 65l-12-6" stroke="#f6d9a0" strokeWidth="3" strokeLinecap="round"/>
  </g>;
}
