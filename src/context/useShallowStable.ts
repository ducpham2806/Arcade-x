import { useRef } from 'react';

/** Returns the previous object while every field is still identical (Object.is). */
export function useShallowStable<T extends object>(value: T): T {
  const ref = useRef(value);
  const prev = ref.current as Record<string, unknown>;
  const next = value as Record<string, unknown>;
  const keys = Object.keys(next);
  if (keys.length !== Object.keys(prev).length || keys.some(k => !Object.is(prev[k], next[k]))) ref.current = value;
  return ref.current;
}
