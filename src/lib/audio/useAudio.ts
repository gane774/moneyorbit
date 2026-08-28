'use client';

import { useSyncExternalStore } from 'react';
import { audioManager } from './manager';
import { DEFAULT_AUDIO_PREFS } from './prefs';
import type { AudioEvent } from './events';

/**
 * The hook components use to play sounds and read/change the global sound
 * setting. Backed by the AudioManager singleton (manager.ts) via
 * useSyncExternalStore, so the mute toggle re-renders correctly wherever
 * it's used without needing a Context provider anywhere in the tree.
 *
 *   const { play } = useAudio();
 *   play('quiz_correct');
 */
export function useAudio() {
  const prefs = useSyncExternalStore(
    audioManager.subscribe,
    () => audioManager.getPrefs(),
    // Server snapshot: SSR always renders the (subtle) default, then
    // reconciles with the real localStorage value after hydration.
    () => DEFAULT_AUDIO_PREFS,
  );

  return {
    play: (event: AudioEvent) => audioManager.play(event),
    enabled: prefs.enabled,
    setEnabled: (enabled: boolean) => audioManager.setEnabled(enabled),
    volume: prefs.volume,
    setVolume: (volume: number) => audioManager.setVolume(volume),
  };
}
