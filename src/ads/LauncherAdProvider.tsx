import React from 'react';
import {useGameSession, useLauncherUi} from '../context/GameContext';
import {useLauncher} from '../launcher/LauncherContext';
import {AdProvider} from './AdProvider';
import {readAdsConfig} from './config';
const config = readAdsConfig(import.meta.env);
export function LauncherAdProvider({children, blocked}: {children:React.ReactNode; blocked:boolean}) {
  const {activeGameId} = useGameSession();
  const {activeModal, isChatOpen} = useLauncherUi();
  const {busy, catalog, notice} = useLauncher();
  // Consent intentionally remains unknown until a reviewed CMP integration supplies it.
  return <AdProvider config={config} activeGameId={activeGameId} hasContent={catalog.games.length > 0} blocked={blocked || busy || !!notice || activeModal !== 'none' || isChatOpen}>{children}</AdProvider>;
}
