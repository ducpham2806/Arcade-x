import type { StorageLike } from '../src/story-save';

export function snakeAccountStorage(store: StorageLike, owner: string): StorageLike {
  const prefix = 'snake-legend:account:' + owner + ':';
  return {
    getItem: key => store.getItem(prefix + key),
    setItem: (key, value) => store.setItem(prefix + key, value),
  };
}
