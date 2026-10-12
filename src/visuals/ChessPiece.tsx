import React, { useId } from 'react';
import type { PieceSymbol, Color } from 'chess.js';

/** Six readable silhouettes, shaded locally instead of relying on platform emoji/fonts. */
export function ChessPiece({type,color}:{type:PieceSymbol;color:Color}) {
  const id=useId().replace(/:/g,'');const white=color==='w';
  const outlines: Record<PieceSymbol,React.ReactNode>={
    p:<><circle cx="24" cy="14" r="7"/><path d="M19 21H29L27 26L30 35H18L21 26Z"/></>,
    r:<path d="M12 9H18V15H21V9H27V15H30V9H36V21L31 25L30 35H18L17 25L12 21Z"/>,
    n:<><path d="M13 35L17 27L24 22L18 23L13 20L17 11L24 7L26 11L30 10Q37 23 31 35Z"/><path d="M18 14L23 13M17 19L22 18" fill="none" stroke={white?'#765d40':'#c4d8ef'} strokeWidth="1.6"/></>,
    b:<><path d="M24 5Q9 18 20 25L18 35H30L28 25Q39 18 24 5Z"/><path d="M24 11L28 17" fill="none" stroke={white?'#765d40':'#c4d8ef'} strokeWidth="2"/></>,
    q:<><path d="M12 13L18 20L24 10L30 20L36 13L31 29H17Z"/><path d="M18 29H30L31 35H17Z"/>{[12,24,36].map((x,i)=><circle key={x} cx={x} cy={i===1?8:11} r="2.5"/>)}</>,
    k:<><path d="M21 5H27V10H31V15H27V18H21V15H17V10H21Z"/><path d="M16 20Q24 16 32 20L28 29L30 35H18L20 29Z"/></>,
  };
  return <svg viewBox="0 0 48 48" className="chess-piece-art" aria-hidden="true" focusable="false">
    <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2=".7"><stop stopColor={white?'#fff8df':'#8296b7'}/><stop offset=".45" stopColor={white?'#eddfb7':'#34465f'}/><stop offset="1" stopColor={white?'#bfa678':'#14253b'}/></linearGradient></defs>
    <ellipse cx="24" cy="42" rx="16" ry="3" fill="#000" opacity=".23"/>
    <g fill={`url(#${id})`} stroke={white?'#685541':'#a4b8d1'} strokeWidth="1.2" strokeLinejoin="round">
      {outlines[type]}<path d="M17 34H31L34 38V41H14V38Z"/><path d="M14 38H34" strokeOpacity=".65"/>
    </g>
  </svg>;
}
