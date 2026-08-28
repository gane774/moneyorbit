import { audioManager } from './manager';
import type { AudioEvent } from './events';

export interface ScrollCue {
  /** 0-1 position along the scrubbed timeline. */
  progress: number;
  event: AudioEvent;
}

/**
 * Section 6: the homepage animation is scroll-scrubbed (progress 0-1), and
 * sounds must fire only when progress crosses a meaningful threshold — not
 * on every scroll-pixel, and not repeatedly while the user sits near one.
 *
 * This is direction-agnostic on purpose: crossing a cue while scrolling
 * down OR back up both count as "entering that state", and both play it
 * (Section 6's default: major narrative sounds may replay on intentional
 * re-entry). AudioManager's own per-event cooldown is what stops this from
 * turning into spam if the user's scroll position jitters right at a
 * boundary — this function only decides *whether* a crossing happened.
 *
 * `prev`/`curr` order doesn't matter — a fast scroll that jumps over more
 * than one cue in a single frame correctly fires all of them, once each.
 */
export function fireCrossedCues(prev: number, curr: number, cues: ScrollCue[]) {
  if (prev === curr) return;
  const lo = Math.min(prev, curr);
  const hi = Math.max(prev, curr);
  for (const cue of cues) {
    if (cue.progress > lo && cue.progress <= hi) {
      audioManager.play(cue.event);
    }
  }
}
