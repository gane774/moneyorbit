'use client';

import { useRef } from 'react';
import { audioManager } from './manager';

/**
 * Section 11: sliders must not play a sound on every pixel of movement.
 * This buckets a slider's range into a fixed number of steps and plays
 * `ui_slider_tick` only when the value crosses into a new bucket — so a
 * smooth 0-100 drag plays a handful of subtle ticks, not a hundred.
 *
 * Usage, inside a mechanic that owns a <input type="range">:
 *   const tickAmount = useSliderTick(params.amount.min, params.amount.max);
 *   ...
 *   onChange={(e) => { setAmount(+e.target.value); tickAmount(+e.target.value); }}
 */
export function useSliderTick(min: number, max: number, buckets = 12) {
  const lastBucket = useRef<number | null>(null);

  return (value: number) => {
    const span = max - min || 1;
    const bucket = Math.round(((value - min) / span) * buckets);
    if (bucket !== lastBucket.current) {
      lastBucket.current = bucket;
      audioManager.play('ui_slider_tick');
    }
  };
}
