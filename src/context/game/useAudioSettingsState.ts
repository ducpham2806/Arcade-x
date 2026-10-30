import { useCallback, useEffect, useState } from 'react';
import { audioManager, MusicTheme } from '../../services/audio';
import type { AudioSettingsSlice } from '../GameContext';

/** Sound/music preferences mirrored from the shared audioManager. */
export function useAudioSettingsState(): AudioSettingsSlice {
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(() => audioManager.getIsMuted());
  const [isMusicMuted, setIsMusicMuted] = useState<boolean>(() => audioManager.getIsMusicMuted());
  const [soundVolume, setSoundVolumeState] = useState<number>(() => audioManager.getSoundVolume());
  const [musicVolume, setMusicVolumeState] = useState<number>(() => audioManager.getMusicVolume());
  const [musicTheme, setMusicThemeState] = useState<MusicTheme>(() => audioManager.getMusicTheme());

  // Listen to centralized audio manager state changes (syncs across all UI)
  useEffect(() => {
    const handleAudioChange = (e: Event) => {
      const custom = e as CustomEvent<{
        isSoundMuted: boolean;
        isMusicMuted: boolean;
        soundVolume: number;
        musicVolume: number;
        currentTheme?: MusicTheme;
      }>;
      if (custom.detail) {
        setIsSoundMuted(custom.detail.isSoundMuted);
        setIsMusicMuted(custom.detail.isMusicMuted);
        setSoundVolumeState(custom.detail.soundVolume);
        setMusicVolumeState(custom.detail.musicVolume);
        if (custom.detail.currentTheme) {
          setMusicThemeState(custom.detail.currentTheme);
        }
      }
    };
    window.addEventListener('arcadex_audio_state_changed', handleAudioChange as EventListener);
    return () => window.removeEventListener('arcadex_audio_state_changed', handleAudioChange as EventListener);
  }, []);

  const toggleSound = useCallback(() => {
    const next = audioManager.toggleSound();
    setIsSoundMuted(next);
  }, []);

  const toggleMusic = useCallback(() => {
    const next = audioManager.toggleMusic();
    setIsMusicMuted(next);
  }, []);

  const setSoundVolume = useCallback((val: number) => {
    audioManager.setSoundVolume(val);
    setSoundVolumeState(val);
  }, []);

  const setMusicVolume = useCallback((val: number) => {
    audioManager.setMusicVolume(val);
    setMusicVolumeState(val);
  }, []);

  const setMusicTheme = useCallback((theme: MusicTheme) => {
    audioManager.setMusicTheme(theme);
    setMusicThemeState(theme);
  }, []);

  const playBGM = useCallback((theme?: MusicTheme) => {
    audioManager.playMusic(theme);
  }, []);

  const stopBGM = useCallback(() => {
    audioManager.stopMusic();
  }, []);

  const playTestTone = useCallback(() => {
    audioManager.playTestTone();
  }, []);

  return {
    isSoundMuted, toggleSound, soundVolume, setSoundVolume, isMusicMuted, toggleMusic,
    musicVolume, setMusicVolume, musicTheme, setMusicTheme, playBGM, stopBGM, playTestTone,
  };
}
