/**
 * Audio event catalogue — the ONE file to edit when swapping a placeholder
 * sound for a final one.
 *
 * Every event the app can play is declared here with its asset path, its
 * own volume trim (relative to the user's master volume), and a cooldown
 * that stops it from stacking if triggered rapidly (Section 18/19: one
 * logical action -> one sound, never a pile of overlapping audio).
 *
 * To replace a placeholder: change the `src` string below to point at the
 * new file (e.g. drop `correct.mp3` into public/sounds/feedback/ and change
 * `src: '/sounds/feedback/correct-placeholder.wav'` to
 * `src: '/sounds/feedback/correct.mp3'`). Nothing else in the app —
 * no component, hook, or the manager itself — needs to change.
 */

export type AudioEvent =
  // UI
  | 'ui_tap'
  | 'ui_flip'
  | 'ui_drag_snap'
  | 'ui_slider_tick'
  // Feedback
  | 'quiz_correct'
  | 'quiz_incorrect'
  | 'task_complete'
  // Homepage "Flow of Money" animation milestones
  | 'flow_start'
  | 'node_arrive'
  | 'branch'
  | 'payment'
  | 'saving'
  | 'credit'
  | 'compounding'
  | 'investing'
  | 'warning'
  | 'finale';

export interface AudioEventSpec {
  /** Path under /public. */
  src: string;
  /** 0-1, this event's own trim relative to the user's master volume. */
  volume: number;
  /** Minimum ms between two actual plays of this event — the central
   *  anti-spam guard (Section 18). A call inside the cooldown is dropped
   *  silently, not queued. */
  cooldownMs: number;
  /** Eagerly created + `.load()`-ed on startup instead of on first play
   *  (Section 17). Reserved for the handful of sounds that fire on a
   *  direct, latency-sensitive user action. `.load()` alone needs no user
   *  gesture — only `.play()` does — so this is safe to do unconditionally. */
  preload?: boolean;
}

export const AUDIO_MANIFEST: Record<AudioEvent, AudioEventSpec> = {
  // ---------------- UI ----------------
  ui_tap: {
    src: '/sounds/ui/tap-placeholder.wav', volume: 0.5, cooldownMs: 60,
  },
  ui_flip: {
    src: '/sounds/ui/flip-placeholder.wav', volume: 0.55, cooldownMs: 120, preload: true,
  },
  ui_drag_snap: {
    src: '/sounds/ui/drag-snap-placeholder.wav', volume: 0.6, cooldownMs: 120, preload: true,
  },
  ui_slider_tick: {
    src: '/sounds/ui/slider-placeholder.wav', volume: 0.35, cooldownMs: 70,
  },

  // ---------------- Feedback ----------------
  quiz_correct: {
    src: '/sounds/feedback/correct-placeholder.wav', volume: 0.7, cooldownMs: 500, preload: true,
  },
  quiz_incorrect: {
    src: '/sounds/feedback/incorrect-placeholder.wav', volume: 0.55, cooldownMs: 500, preload: true,
  },
  task_complete: {
    src: '/sounds/feedback/complete-placeholder.wav', volume: 0.75, cooldownMs: 800, preload: true,
  },

  // ---------------- Animation ----------------
  flow_start: {
    src: '/sounds/animation/flow-start-placeholder.wav', volume: 0.5, cooldownMs: 800,
  },
  node_arrive: {
    src: '/sounds/animation/node-arrive-placeholder.wav', volume: 0.45, cooldownMs: 400,
  },
  branch: {
    src: '/sounds/animation/branch-placeholder.wav', volume: 0.45, cooldownMs: 400,
  },
  payment: {
    src: '/sounds/animation/payment-placeholder.wav', volume: 0.45, cooldownMs: 400,
  },
  saving: {
    src: '/sounds/animation/saving-placeholder.wav', volume: 0.45, cooldownMs: 400,
  },
  credit: {
    src: '/sounds/animation/credit-placeholder.wav', volume: 0.45, cooldownMs: 400,
  },
  compounding: {
    src: '/sounds/animation/compounding-placeholder.wav', volume: 0.45, cooldownMs: 400,
  },
  investing: {
    src: '/sounds/animation/investing-placeholder.wav', volume: 0.45, cooldownMs: 400,
  },
  warning: {
    src: '/sounds/animation/warning-placeholder.wav', volume: 0.5, cooldownMs: 400,
  },
  finale: {
    src: '/sounds/animation/finale-placeholder.wav', volume: 0.55, cooldownMs: 1000,
  },
};
