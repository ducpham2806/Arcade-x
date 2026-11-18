import { useCallback, useRef, useState } from 'react';
import type { GameBridgeAPI } from '../../types';
import type { OaqState } from '../o-an-quan/rules.ts';
import type { NlcState } from '../nhay-lo-co/rules.ts';
import { loadFolkProfile, readFolkSave, writeFolkSave } from './economy.ts';

export type OfflineMode = 'bot_easy' | 'bot_hard' | 'local_2p';
export type OfflineMatch<T> = { version: 1; id: string; mode: OfflineMode; state: T };

const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const count = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const seatPair = (value: unknown) => object(value) && count(value.P1) && count(value.P2);
const seat = (value: unknown) => value === 'P1' || value === 'P2';

function matchState(value: unknown): value is Record<string, unknown> {
  return object(value) && seat(value.turn) && count(value.turnNumber) && value.turnNumber > 0 &&
    seatPair(value.scores) && typeof value.finished === 'boolean' &&
    (value.finished ? seat(value.winner) || value.winner === 'DRAW' : value.winner === null);
}

export function isOaqOfflineState(value: unknown): value is OaqState {
  return matchState(value) && Array.isArray(value.cells) && value.cells.length === 12 && value.cells.every(count) &&
    Array.isArray(value.quanAlive) && value.quanAlive.length === 2 && value.quanAlive.every(alive => typeof alive === 'boolean') &&
    seatPair(value.quanCaptured) && seatPair(value.debt) && count(value.lastCapturedPoints) && count(value.lastComboCount);
}

export function isNlcOfflineState(value: unknown): value is NlcState {
  return matchState(value) && object(value.level) && [value.level.P1, value.level.P2].every(level => count(level) && level >= 1 && level <= 9) &&
    object(value.houses) && Object.entries(value.houses).every(([box, owner]) => /^[1-9]$/.test(box) && seat(owner)) &&
    seatPair(value.perfectThrows) && value.maxHousesToWin === 3 && typeof value.lastSummary === 'string';
}

export function loadOfflineMatch<T>(bridge: GameBridgeAPI, validate: (value: unknown) => value is T): OfflineMatch<T> | null {
  const value = readFolkSave(bridge)?.offlineMatch;
  if (!object(value) || value.version !== 1 || typeof value.id !== 'string' || !/^[\w-]{1,80}$/.test(value.id) ||
    (value.mode !== 'bot_easy' && value.mode !== 'bot_hard' && value.mode !== 'local_2p') || !validate(value.state)) return null;
  return { version: 1, id: value.id, mode: value.mode, state: value.state };
}

export function saveOfflineMatch<T>(bridge: GameBridgeAPI, match: OfflineMatch<T>): boolean {
  return writeFolkSave(bridge, { ...readFolkSave(bridge), ...loadFolkProfile(bridge), offlineMatch: match });
}

export function useOfflineMatch<T extends { finished: boolean }>(bridge: GameBridgeAPI, initial: () => T, validate: (value: unknown) => value is T) {
  const [match, setMatch] = useState(() => loadOfflineMatch(bridge, validate));
  const [saved, setSaved] = useState(true);
  const current = useRef(match);
  const store = useCallback((next: OfflineMatch<T>) => {
    current.current = next;
    setMatch(next);
    setSaved(saveOfflineMatch(bridge, next));
  }, [bridge]);
  const update = useCallback((state: T) => {
    if (current.current) store({ ...current.current, state });
  }, [store]);
  const start = (mode: OfflineMode) => {
    if (current.current && !current.current.state.finished && !window.confirm('Bắt đầu ván mới sẽ thay ván đã lưu. Chơi ván mới?')) return false;
    store({ version: 1, id: crypto.randomUUID(), mode, state: initial() });
    return true;
  };
  return { match, start, update, saved, retry: () => { if (current.current) store(current.current); } };
}
