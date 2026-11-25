import { useState } from 'react';

export const BOARD_TERRAIN_NAMES = {
  chess: { citadel: 'Chính Điện Đá', ice: 'Pháo Đài Băng', desert: 'Sa Mạc Cổ', lava: 'Hắc Thành Dung Nham' },
  xiangqi: { river: 'Bến Sông Sở Hán', gate: 'Thành Môn', mountain: 'Sơn Ải', desert: 'Sa Mạc' },
  'o-an-quan': { grass: 'Đồng Cỏ Biên Ải', desert: 'Sa Mạc', mountain: 'Sơn Ải', fortress: 'Thành Trì', classic: 'Sân Đình' },
};

type BoardGame = keyof typeof BOARD_TERRAIN_NAMES;
export type TerrainId<Game extends BoardGame> = keyof typeof BOARD_TERRAIN_NAMES[Game] & string;

export function useBoardTerrain<Game extends BoardGame>(game: Game, initial: TerrainId<Game>) {
  const choices = Object.entries<string>(BOARD_TERRAIN_NAMES[game]);
  const key = `arcadex_${game}_terrain`;
  const [terrain, setTerrain] = useState<string>(() => {
    try {
      const value = localStorage.getItem(key);
      if (value && choices.some(([id]) => id === value)) return value;
    } catch {}
    return initial;
  });

  function select(value: string) {
    if (!choices.some(([id]) => id === value)) return;
    setTerrain(value);
    try { localStorage.setItem(key, value); } catch {}
  }

  return { terrain: terrain as TerrainId<Game>, choices, select };
}

export function BoardTerrainPicker({ terrain, choices, select, className, disabled }: {
  terrain: string;
  choices: [string, string][];
  select: (value: string) => void;
  className?: string;
  disabled?: boolean;
}) {
  return <select aria-label="Địa hình bàn cờ" value={terrain} disabled={disabled} onChange={event => select(event.currentTarget.value)} className={className}>
    {choices.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
  </select>;
}
