'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { JOURNEYS } from '@/content/journeys';
import { experienceForJourney } from '@/content/experiences';
import * as P from '@/lib/progress';

/** Section 8: knowledge, never fictional wealth and never peer ranking.
 *  Dots render only for journeys actually attempted — a long row of empty
 *  circles for untouched journeys is discouraging, not informative. */
export default function Progress() {
  const router = useRouter();
  const [p, setP] = useState<P.ProgressState | null>(null);

  useEffect(() => {
    const s = P.load();
    if (!s.username) { router.replace('/onboarding'); return; }
    setP(s);
  }, [router]);

  if (!p) return <main className="sheet" />;

  const rows = JOURNEYS
    .map((j) => ({ j, exp: experienceForJourney(j.id) }))
    .filter(({ exp }) => exp && P.hasAttempted(p, exp.concepts));

  return (
    <main className="sheet">
      <div className="kicker" style={{ color: 'var(--ink-35)' }}>Your progress</div>
      <h1 className="h-mid" style={{ marginBottom: 16 }}>What you actually know</h1>

      {rows.length === 0 ? (
        <p className="body-s">
          Nothing here yet. Finish your first experience and this fills in.
        </p>
      ) : (
        rows.map(({ j, exp }, i) => {
          const dots = P.masteryDots(p, exp!.concepts);
          const colour = dots >= 4 ? 'var(--good)' : dots >= 2 ? 'var(--n200)' : 'var(--ink-35)';
          return (
            <div
              key={j.id}
              className="stat"
              style={i < rows.length - 1 ? { borderBottom: '1px solid var(--ink-12)' } : undefined}
            >
              <span>{j.title}</span>
              <span className="dots" style={{ color: colour }} aria-label={`${dots} of 5`}>
                {'●'.repeat(dots)}{'○'.repeat(5 - dots)}
              </span>
            </div>
          );
        })
      )}

      <div className="spacer" style={{ height: 28 }} />
      <button className="btn ghost" onClick={() => router.push('/home')}>Back to home</button>
    </main>
  );
}
