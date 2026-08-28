/**
 * Sound preference persistence. Same shape as lib/progress.ts on purpose
 * (load/save, guarded against private-mode / corrupt JSON) — this is a
 * separate localStorage key rather than a field on ProgressState because
 * it's a device/browser setting, not lesson progress: it shouldn't get
 * caught up in any future per-student sync of ProgressState.
 */

const KEY = 'moneyorbit.audio.v1';

export interface AudioPrefs {
  enabled: boolean;
  /** Master volume, 0-1. Multiplied by each event's own trim in events.ts. */
  volume: number;
}

/** Subtle by default (Section 12): on, but quiet. */
export const DEFAULT_AUDIO_PREFS: AudioPrefs = {
  enabled: true,
  volume: 0.6,
};

export function loadAudioPrefs(): AudioPrefs {
  if (typeof window === 'undefined') return DEFAULT_AUDIO_PREFS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_AUDIO_PREFS;
    const parsed = JSON.parse(raw) as Partial<AudioPrefs>;
    return {
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : DEFAULT_AUDIO_PREFS.enabled,
      volume: typeof parsed.volume === 'number' ? clamp01(parsed.volume) : DEFAULT_AUDIO_PREFS.volume,
    };
  } catch {
    // Private mode, cleared storage, or corrupt JSON — fall back quietly.
    return DEFAULT_AUDIO_PREFS;
  }
}

export function saveAudioPrefs(p: AudioPrefs): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable — the toggle still works for this page load,
       it just will not persist across a refresh */
  }
}

export function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}
