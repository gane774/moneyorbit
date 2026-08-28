'use client';

import { useState } from 'react';
import { useAudio } from '@/lib/audio/useAudio';

/**
 * Global sound control (Section 12/15): on/off plus a volume slider,
 * persisted (prefs.ts) and available from every page since it's mounted
 * once in the root layout. Deliberately small and low-contrast — it's a
 * utility control, not a feature.
 *
 * Rests as a single small icon (not a wider pill) so its default footprint
 * stays out of the way of the lesson chrome around it — .stage fills the
 * full viewport on mobile with no card margin, so anything wider here would
 * sit on top of the progress bar in TopBar. The mute button and volume
 * slider only appear once tapped open.
 */
export default function SoundToggle() {
  const { enabled, setEnabled, volume, setVolume } = useAudio();
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        position: 'fixed',
        // Top, not bottom: a bottom-anchored control would sit directly on
        // top of every screen's primary CTA button on narrow viewports.
        right: 'max(14px, env(safe-area-inset-right))',
        top: 'max(14px, env(safe-area-inset-top))',
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
        background: 'var(--paper)',
        border: '1px solid var(--ink-12)',
        borderRadius: 999,
        padding: 6,
        boxShadow: '0 2px 10px rgba(21,24,15,.08)',
      }}
    >
      {expanded && enabled && (
        <>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(+e.target.value)}
            aria-label="Sound volume"
            style={{ width: 64 }}
          />
          <button
            type="button"
            onClick={() => setEnabled(false)}
            aria-label="Mute sound"
            title="Mute"
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: 'none',
              background: 'transparent',
              color: 'var(--ink-35)',
              fontSize: 10,
              lineHeight: 1,
              flex: '0 0 auto',
            }}
          >
            ✕
          </button>
        </>
      )}
      <button
        type="button"
        onClick={() => {
          if (!enabled) { setEnabled(true); setExpanded(true); return; }
          setExpanded((v) => !v);
        }}
        onDoubleClick={() => setEnabled(!enabled)}
        aria-pressed={enabled}
        aria-label={enabled ? 'Sound on — tap to adjust, double-tap to mute' : 'Sound off — tap to unmute'}
        title={enabled ? 'Sound on' : 'Sound off'}
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: 'none',
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: '0 0 auto',
          color: enabled ? 'var(--ink)' : 'var(--ink-35)',
        }}
      >
        <SpeakerIcon on={enabled} />
      </button>
    </div>
  );
}

function SpeakerIcon({ on }: { on: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 9v6h4l5 4V5L8 9H4Z"
        fill="currentColor"
      />
      {on ? (
        <path
          d="M16.5 8.5a5 5 0 0 1 0 7"
          stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none"
        />
      ) : (
        <path
          d="M16 9l4 6M20 9l-4 6"
          stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
        />
      )}
    </svg>
  );
}
