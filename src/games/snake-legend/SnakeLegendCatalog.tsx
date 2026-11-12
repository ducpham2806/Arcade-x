import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { GameComponentProps } from '../../types';
import banner from '../../preview/snake/art/banner.webp';
import SnakeLegend from './SnakeLegend';
import { snakeAccountStorage } from './integration/storage-scope';

const artwork = { banner };
const deviceStorage = {
  getItem: (key: string) => window.localStorage.getItem(key),
  setItem: (key: string, value: string) => window.localStorage.setItem(key, value),
};

export default function SnakeLegendCatalog(props: GameComponentProps) {
  const { currentUser, isGuest } = useAuth();
  const owner = isGuest ? undefined : currentUser?.id;
  const storage = useMemo(() => owner ? snakeAccountStorage(deviceStorage, owner) : undefined, [owner]);

  return <SnakeLegend key={owner ?? 'guest'} {...props} storage={storage} artwork={artwork} reviewTools={false} />;
}
