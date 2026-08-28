/**
 * Centralized audio playback (Section 2: an "audio manager/service", one of
 * the suggested architectures — chosen over a Context/Provider because
 * nothing else in MoneyOrbit uses Context; every other bit of client state
 * here is a plain module singleton read from components, same as
 * lib/progress.ts). Nothing outside this file ever touches an
 * HTMLAudioElement directly.
 *
 * This is the single source of truth. `useAudio()` (useAudio.ts) is a thin
 * React wrapper around this same instance for components that need to
 * re-render on mute/volume changes; purely imperative code (the homepage
 * scroll-driven GSAP loop) calls `audioManager.play()` on this instance
 * directly, since it isn't React state and has no stale-closure risk.
 *
 * Design notes:
 *  - SSR-safe: every method no-ops when `window`/`Audio` aren't available.
 *  - Autoplay-safe (Section 13): `.play()` promises are always caught, so a
 *    browser blocking audio before a user gesture never throws or logs an
 *    uncaught rejection. `unlock()` is called on the first pointer/key/touch
 *    event to prime playback as early as legally possible.
 *  - Never throws into a caller (Section 14): a failure here is invisible
 *    to the rest of the app, by design.
 *  - Central conflict management (Section 18/19): each event has its own
 *    cooldown from the manifest; a call inside that window is dropped, not
 *    queued or stacked. That's the one policy, applied uniformly, rather
 *    than a different bespoke rule per component.
 */

import { AUDIO_MANIFEST, type AudioEvent } from './events';
import { DEFAULT_AUDIO_PREFS, loadAudioPrefs, saveAudioPrefs, clamp01, type AudioPrefs } from './prefs';

type Listener = () => void;

const isBrowser = typeof window !== 'undefined' && typeof Audio !== 'undefined';
const DEV = process.env.NODE_ENV !== 'production';

class AudioManager {
  private prefs: AudioPrefs = DEFAULT_AUDIO_PREFS;
  private elements = new Map<AudioEvent, HTMLAudioElement>();
  private lastPlayedAt = new Map<AudioEvent, number>();
  private listeners = new Set<Listener>();
  private unlocked = false;
  private hydrated = false;

  /** Reads localStorage once on first real use — kept out of the
   *  constructor so this class is safe to instantiate at module-eval
   *  time on the server (SSR) without touching localStorage there. */
  private hydrate() {
    if (this.hydrated) return;
    this.hydrated = true;
    this.prefs = loadAudioPrefs();
    if (isBrowser) this.preloadCritical();
  }

  private preloadCritical() {
    for (const [event, spec] of Object.entries(AUDIO_MANIFEST) as [AudioEvent, typeof AUDIO_MANIFEST[AudioEvent]][]) {
      if (spec.preload) this.getElement(event);
    }
  }

  private getElement(event: AudioEvent): HTMLAudioElement | null {
    if (!isBrowser) return null;
    let el = this.elements.get(event);
    if (!el) {
      const spec = AUDIO_MANIFEST[event];
      try {
        el = new Audio(spec.src);
        el.preload = 'auto';
        this.elements.set(event, el);
      } catch {
        return null; // Never let asset construction crash the app.
      }
    }
    return el;
  }

  /** Call once on the first user gesture (pointerdown/keydown/touchstart).
   *  Primes the browser's autoplay permission as early as possible; safe
   *  to call more than once. Failure here is expected and silent — it just
   *  means playback stays gated until a later real event triggers it. */
  unlock() {
    if (!isBrowser || this.unlocked) return;
    this.unlocked = true;
    this.hydrate();
    // Priming a real (silent) play/pause on the flow_start element tends to
    // be more reliable across mobile Safari/Chrome than a synthetic beep.
    const el = this.getElement('ui_tap');
    if (!el) return;
    const prevVolume = el.volume;
    el.volume = 0;
    const p = el.play();
    if (p && typeof p.then === 'function') {
      p.then(() => {
        el.pause();
        el.currentTime = 0;
        el.volume = prevVolume;
      }).catch(() => {
        el.volume = prevVolume;
      });
    }
  }

  /** Play a named event. Never throws; never blocks the caller. */
  play(event: AudioEvent) {
    this.hydrate();
    if (!isBrowser) return;
    if (!this.prefs.enabled) return;

    const spec = AUDIO_MANIFEST[event];
    if (!spec) return;

    const now = Date.now();
    const last = this.lastPlayedAt.get(event) ?? 0;
    if (now - last < spec.cooldownMs) return; // central anti-spam guard

    const el = this.getElement(event);
    if (!el) return;

    try {
      el.currentTime = 0;
      el.volume = clamp01(this.prefs.volume * spec.volume);
      const p = el.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          /* Autoplay blocked, or interrupted by a rapid re-trigger.
             Silent by design — audio is an enhancement (Section 14). */
        });
      }
      this.lastPlayedAt.set(event, now);
      if (DEV) {
        console.debug(`[audio] ${event} -> ${spec.src}`);
      }
    } catch {
      /* Never let a playback failure reach the caller. */
    }
  }

  getPrefs(): AudioPrefs {
    this.hydrate();
    return this.prefs;
  }

  setEnabled(enabled: boolean) {
    this.hydrate();
    this.prefs = { ...this.prefs, enabled };
    saveAudioPrefs(this.prefs);
    this.notify();
  }

  setVolume(volume: number) {
    this.hydrate();
    this.prefs = { ...this.prefs, volume: clamp01(volume) };
    saveAudioPrefs(this.prefs);
    this.notify();
  }

  /* ---- subscription, for useAudio()'s useSyncExternalStore ---- */

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private notify() {
    for (const l of this.listeners) l();
  }
}

/** The one instance the whole app shares. */
export const audioManager = new AudioManager();
