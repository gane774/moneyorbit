'use client';

import { useEffect } from 'react';
import { audioManager } from '@/lib/audio/manager';
import SoundToggle from './SoundToggle';

/**
 * Mounted once in the root layout (Section 12: the setting must work
 * across every page). Two jobs:
 *
 *  1. Prime audio on the first real user gesture, since browsers block
 *     `.play()` before one (Section 13). Listens once, on the document,
 *     then removes itself — cheap and harmless if audio is muted or a
 *     page never triggers a sound at all.
 *  2. Render the persistent, global mute/volume control (Section 15).
 */
export default function AudioMount() {
  useEffect(() => {
    const unlock = () => audioManager.unlock();
    const opts: AddEventListenerOptions = { once: true, passive: true };
    window.addEventListener('pointerdown', unlock, opts);
    window.addEventListener('keydown', unlock, opts);
    window.addEventListener('touchstart', unlock, opts);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, []);

  return <SoundToggle />;
}
