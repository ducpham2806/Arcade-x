import React from 'react';
export function MummySprite({kind}:{kind:'white'|'red'|'scorpion'}) {
  const red=kind==='red';
  return <svg className="mummy-sprite" viewBox="0 0 64 68" aria-hidden="true">
    <ellipse cx="32" cy="62" rx="21" ry="4" fill="#142538" opacity=".25"/>
    {kind==='scorpion'?<g fill="#8d4030" stroke="#f6bc65" strokeWidth="2" strokeLinejoin="round"><path d="M21 40L8 35L5 21L14 15L17 24L12 29L25 31M42 40L56 35L59 21L50 15L47 24L52 29L39 31"/><path d="M25 43Q12 54 23 60Q45 70 49 53L47 43" fill="none" strokeWidth="7"/><ellipse cx="32" cy="39" rx="12" ry="17"/><path d="M21 37L13 42M21 46L12 51M43 37L51 42M43 46L52 51"/><circle cx="28" cy="29" r="2" fill="#ffee9d"/><circle cx="36" cy="29" r="2" fill="#ffee9d"/></g>
      :<g stroke={red?'#9a485c':'#a9987d'} strokeWidth="1.5" strokeLinejoin="round">
        <path d="M19 34L9 43L13 49L22 44L21 61H29L32 47L35 61H43L42 44L51 49L55 43L45 34Z" fill={red?'#d4848e':'#d7c6a4'}/>
        <rect x="16" y="7" width="32" height="34" rx="13" fill={red?'#f0b7bb':'#f4e6c9'}/>
        <path d="M19 14L45 18M18 27L46 31M22 36L42 33M23 44L41 47M22 54L29 56M36 55L42 53" strokeWidth="3"/>
        <rect x="19" y="20" width="26" height="9" rx="4" fill="#172d3b" stroke="none"/>
        <path d="M24 24H28M36 24H40" stroke={red?'#ffcb79':'#6bddda'} strokeWidth="3" strokeLinecap="round"/>
        {red&&<path d="M18 39L32 43L45 38L51 45L35 47Z" fill="#a93252"/>}
      </g>}
  </svg>;
}

