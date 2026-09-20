import { Vehicle, LevelConfig } from './types';

const COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#84cc16', // lime-500
  '#6366f1', // indigo-500
  '#eab308'  // yellow-500
];

function encodeState(state: Vehicle[]): string {
  return state.map(v => v.isHorizontal ? v.col : v.row).join(',');
}

function getValidMoves(state: Vehicle[], size: number): Vehicle[][] {
  const nextStates: Vehicle[][] = [];
  
  for (let i = 0; i < state.length; i++) {
    const v = state[i];
    
    // Try move -1
    let canMoveNeg = true;
    if (v.isHorizontal) {
      if (v.col === 0) canMoveNeg = false;
      else {
        for (let j = 0; j < state.length; j++) {
          if (i === j) continue;
          const ov = state[j];
          if (ov.isHorizontal && ov.row === v.row && ov.col + ov.length - 1 === v.col - 1) canMoveNeg = false;
          if (!ov.isHorizontal && ov.col === v.col - 1 && ov.row <= v.row && ov.row + ov.length - 1 >= v.row) canMoveNeg = false;
        }
      }
    } else {
      if (v.row === 0) canMoveNeg = false;
      else {
        for (let j = 0; j < state.length; j++) {
          if (i === j) continue;
          const ov = state[j];
          if (!ov.isHorizontal && ov.col === v.col && ov.row + ov.length - 1 === v.row - 1) canMoveNeg = false;
          if (ov.isHorizontal && ov.row === v.row - 1 && ov.col <= v.col && ov.col + ov.length - 1 >= v.col) canMoveNeg = false;
        }
      }
    }
    
    if (canMoveNeg) {
      const nextSt = state.map((vx, idx) => idx === i ? { ...vx, col: v.isHorizontal ? v.col - 1 : v.col, row: v.isHorizontal ? v.row : v.row - 1 } : vx);
      nextStates.push(nextSt);
    }
    
    // Try move +1
    let canMovePos = true;
    if (v.isHorizontal) {
      if (v.col + v.length >= size) canMovePos = false; // don't let target go offboard during backward gen
      else {
        for (let j = 0; j < state.length; j++) {
          if (i === j) continue;
          const ov = state[j];
          if (ov.isHorizontal && ov.row === v.row && ov.col === v.col + v.length) canMovePos = false;
          if (!ov.isHorizontal && ov.col === v.col + v.length && ov.row <= v.row && ov.row + ov.length - 1 >= v.row) canMovePos = false;
        }
      }
    } else {
      if (v.row + v.length >= size) canMovePos = false;
      else {
        for (let j = 0; j < state.length; j++) {
          if (i === j) continue;
          const ov = state[j];
          if (!ov.isHorizontal && ov.col === v.col && ov.row === v.row + v.length) canMovePos = false;
          if (ov.isHorizontal && ov.row === v.row + v.length && ov.col <= v.col && ov.col + ov.length - 1 >= v.col) canMovePos = false;
        }
      }
    }
    
    if (canMovePos) {
      const nextSt = state.map((vx, idx) => idx === i ? { ...vx, col: v.isHorizontal ? v.col + 1 : v.col, row: v.isHorizontal ? v.row : v.row + 1 } : vx);
      nextStates.push(nextSt);
    }
  }
  
  return nextStates;
}

export function generatePuzzle(level: number): LevelConfig {
  let size = 4;
  if (level > 10) size = 5;
  if (level > 25) size = 6;
  if (level > 40) size = 7;
  if (level > 60) size = 8;
  if (level > 80) size = 9;
  if (level > 90) size = 10;
  
  const city = Math.floor((level - 1) / 10) + 1;
  
  // Complexity scaling - balanced vehicle count and depth for responsive generation
  let numVehicles = 4;
  let desiredDepth = 4;

  if (size === 4) {
    numVehicles = 4 + (level > 5 ? 1 : 0);
    desiredDepth = 3 + Math.min(level, 4);
  } else if (size === 5) {
    numVehicles = 5 + (level > 18 ? 2 : 1);
    desiredDepth = 5 + Math.floor((level - 10) * 0.35);
  } else if (size === 6) {
    numVehicles = 7 + (level > 33 ? 2 : 1);
    desiredDepth = 7 + Math.floor((level - 25) * 0.35);
  } else if (size === 7) {
    numVehicles = 10 + (level > 50 ? 2 : 1);
    desiredDepth = 9 + Math.floor((level - 40) * 0.3);
  } else if (size === 8) {
    numVehicles = 13 + (level > 70 ? 2 : 1);
    desiredDepth = 11 + Math.floor((level - 60) * 0.25);
  } else if (size >= 9) {
    numVehicles = 16 + Math.min(4, Math.floor((level - 80) * 0.25));
    desiredDepth = 13 + Math.floor((level - 80) * 0.25);
  }
  
  for (let attempt = 0; attempt < 35; attempt++) {
    const targetRow = Math.max(0, Math.min(size - 1, Math.floor(size / 2) - (size % 2 === 0 ? 1 : 0)));
    const targetLength = 2; // Xe chính size luôn luôn cố định là 2 ô.

    const state: Vehicle[] = [];
    state.push({
      id: 0,
      isTarget: true,
      isHorizontal: true,
      length: targetLength,
      row: targetRow,
      col: size - targetLength, // solved position (at the exit)
      color: '#ef4444' // red target
    });
    
    const grid: number[][] = Array(size).fill(0).map(() => Array(size).fill(-1));
    for (let l = 0; l < targetLength; l++) {
      grid[targetRow][size - targetLength + l] = 0;
    }
    
    // Add obstacles
    let colorIdx = 0;
    for (let i = 1; i <= numVehicles; i++) {
      for (let tr = 0; tr < 45; tr++) {
        const isHorizontal = Math.random() < 0.5;
        // Introduce 2-block and 3-block cars
        let length = 2;
        const rand = Math.random();
        if (rand > 0.7 && size >= 6) length = 3;

        const r = Math.floor(Math.random() * (isHorizontal ? size : size - length + 1));
        const c = Math.floor(Math.random() * (isHorizontal ? size - length + 1 : size));
        
        let overlap = false;
        for (let l = 0; l < length; l++) {
          if (isHorizontal) {
            if (grid[r][c + l] !== -1) overlap = true;
          } else {
            if (grid[r + l][c] !== -1) overlap = true;
          }
        }
        
        if (!overlap) {
          for (let l = 0; l < length; l++) {
            if (isHorizontal) grid[r][c + l] = i;
            else grid[r + l][c] = i;
          }
          state.push({
            id: i,
            isTarget: false,
            isHorizontal,
            length,
            row: r,
            col: c,
            color: COLORS[(colorIdx++) % COLORS.length]
          });
          break;
        }
      }
    }
    
    // BFS backward search with lean memory & fast bounds
    const visited = new Set<string>();
    const queue: { st: Vehicle[], depth: number }[] = [];
    
    visited.add(encodeState(state));
    queue.push({ st: state, depth: 0 });
    
    let head = 0;
    let maxDepth = 0;
    let bestState: { st: Vehicle[], depth: number } | null = null;
    
    while (head < queue.length && head < 4000) {
      const curr = queue[head++];
      
      // Ensure target is far away from the exit (at the very beginning)
      if (curr.st[0].col <= 1) {
        if (curr.depth > maxDepth) {
          maxDepth = curr.depth;
          bestState = curr;
        }
        if (curr.depth >= desiredDepth) {
          bestState = curr;
          break;
        }
      }
      
      const nextStates = getValidMoves(curr.st, size);
      for (const nextSt of nextStates) {
        const enc = encodeState(nextSt);
        if (!visited.has(enc)) {
          visited.add(enc);
          queue.push({ st: nextSt, depth: curr.depth + 1 });
        }
      }
    }
    
    // If we found a valid puzzle
    const minAcceptableDepth = Math.max(2, Math.floor(desiredDepth * 0.5));
    if (bestState && bestState.depth >= minAcceptableDepth) {
      return { size, vehicles: bestState.st, targetRow, city };
    }
  }
  
  // Guaranteed dynamically-sized fallback puzzle
  const targetRowFallback = Math.max(0, Math.min(size - 1, Math.floor(size / 2) - (size % 2 === 0 ? 1 : 0)));
  const fallbackVehicles: Vehicle[] = [
    { id: 0, isTarget: true, isHorizontal: true, length: 2, row: targetRowFallback, col: 0, color: '#ef4444' },
    { id: 1, isTarget: false, isHorizontal: false, length: 2, row: 0, col: 2, color: '#3b82f6' },
    { id: 2, isTarget: false, isHorizontal: true, length: 2, row: Math.min(size - 1, targetRowFallback + 1), col: 1, color: '#10b981' }
  ];

  if (size >= 5) {
    fallbackVehicles.push({ id: 3, isTarget: false, isHorizontal: false, length: 2, row: 1, col: size - 1, color: '#f59e0b' });
  }
  if (size >= 6) {
    fallbackVehicles.push({ id: 4, isTarget: false, isHorizontal: true, length: 2, row: 0, col: 0, color: '#8b5cf6' });
    fallbackVehicles.push({ id: 5, isTarget: false, isHorizontal: false, length: 3, row: 2, col: size - 2, color: '#06b6d4' });
  }
  if (size >= 7) {
    fallbackVehicles.push({ id: 6, isTarget: false, isHorizontal: false, length: 2, row: size - 3, col: 0, color: '#ec4899' });
  }

  return {
    size,
    targetRow: targetRowFallback,
    city,
    vehicles: fallbackVehicles
  };
}

export function generateBossPuzzle(): LevelConfig {
  const size = 10;
  const numVehicles = 18;
  const desiredDepth = 15;
  
  for (let attempt = 0; attempt < 25; attempt++) {
    const targetRow = 4;
    const targetLength = 3; // Boss is a 3-block ambulance
    const state: Vehicle[] = [];
    state.push({
      id: 0,
      isTarget: true,
      isHorizontal: true,
      length: targetLength,
      row: targetRow,
      col: size - targetLength,
      color: '#ef4444'
    });
    
    const grid: number[][] = Array(size).fill(0).map(() => Array(size).fill(-1));
    for (let l = 0; l < targetLength; l++) {
      grid[targetRow][size - targetLength + l] = 0;
    }
    
    let colorIdx = 0;
    for (let i = 1; i <= numVehicles; i++) {
      for (let tr = 0; tr < 40; tr++) {
        const isHorizontal = Math.random() < 0.5;
        let length = 2;
        const rand = Math.random();
        if (rand > 0.6) length = 3;
        
        const r = Math.floor(Math.random() * (isHorizontal ? size : size - length + 1));
        const c = Math.floor(Math.random() * (isHorizontal ? size - length + 1 : size));
        
        let overlap = false;
        for (let l = 0; l < length; l++) {
          if (isHorizontal) {
            if (grid[r][c + l] !== -1) overlap = true;
          } else {
            if (grid[r + l][c] !== -1) overlap = true;
          }
        }
        
        if (!overlap) {
          for (let l = 0; l < length; l++) {
            if (isHorizontal) grid[r][c + l] = i;
            else grid[r + l][c] = i;
          }
          state.push({
            id: i,
            isTarget: false,
            isHorizontal,
            length,
            row: r,
            col: c,
            color: COLORS[(colorIdx++) % COLORS.length]
          });
          break;
        }
      }
    }
    
    const visited = new Set<string>();
    const queue: { st: Vehicle[], depth: number }[] = [];
    visited.add(encodeState(state));
    queue.push({ st: state, depth: 0 });
    
    let head = 0;
    let maxDepth = 0;
    let bestState: { st: Vehicle[], depth: number } | null = null;
    
    while (head < queue.length && head < 5000) {
      const curr = queue[head++];
      
      if (curr.st[0].col <= 2) {
        if (curr.depth > maxDepth) {
          maxDepth = curr.depth;
          bestState = curr;
        }
        if (curr.depth >= desiredDepth) {
          bestState = curr;
          break;
        }
      }
      
      const nextStates = getValidMoves(curr.st, size);
      for (const nextSt of nextStates) {
        const enc = encodeState(nextSt);
        if (!visited.has(enc)) {
          visited.add(enc);
          queue.push({ st: nextSt, depth: curr.depth + 1 });
        }
      }
    }
    
    if (bestState && bestState.depth >= 8) {
      return { size, vehicles: bestState.st, targetRow, city: 999 };
    }
  }
  
  // Fallback for boss
  return {
    size: 10,
    targetRow: 4,
    city: 999,
    vehicles: [
      { id: 0, isTarget: true, isHorizontal: true, length: 3, row: 4, col: 0, color: '#ef4444' },
      { id: 1, isTarget: false, isHorizontal: false, length: 3, row: 3, col: 4, color: '#3b82f6' },
      { id: 2, isTarget: false, isHorizontal: false, length: 3, row: 5, col: 7, color: '#10b981' }
    ]
  };
}
