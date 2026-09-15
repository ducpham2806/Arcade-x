import React from 'react';
import { Rarity } from '../types';
import { getRarityInfo } from '../utils/rarity';

export const getRaritySlotStyle = (rarity: Rarity, isEquipped: boolean, isSelected: boolean) => {
  let base = 'relative group transition-all duration-200 aspect-square rounded-xl flex items-center justify-center select-none ';
  
  if (isSelected) {
    base += 'ring-2 ring-white scale-105 z-20 shadow-[0_0_20px_rgba(255,255,255,0.5)] ';
  } else {
    base += 'hover:scale-[1.04] active:scale-95 cursor-pointer ';
  }

  return base;
};

export const RarityBadge = ({ rarity }: { rarity: Rarity }) => {
  const info = getRarityInfo(rarity);
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full border shadow-sm backdrop-blur-sm"
      style={{
        backgroundColor: info.badgeBg,
        color: info.badgeText,
        borderColor: info.badgeBorder,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ backgroundColor: info.hex }}
      />
      <span className="font-mono text-[9px] font-black opacity-90">{info.shortHand}</span>
      <span>{info.nameVi}</span>
    </span>
  );
};
