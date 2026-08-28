'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { JOURNEYS } from '@/content/journeys';
import { experienceForJourney, isAvailable } from '@/content/experiences';
import { CONCEPTS } from '@/content/concepts';
import { MASTERY_ORDER } from '@/content/types';
import * as P from '@/lib/progress';

/**
 * Course completion (Section 49). Not "11/11 complete" -- that is a score, and
 * a score is the least interesting thing that just happened. This shows the
 * system they can now see, names what they understand, and opens the two doors
 * that come next.
 */
export default function Complete() {
  const router = useRouter();
  const [p, setP] = useState<P.ProgressState | null>(null);

  useEffect(() => {
    const s = P.load();
    if (!s.username) { router.replace('/onboarding'); return; }
    setP(s);
  }, [router]);

  if (!p) return <main className="sheet" />;

  const openToThem = JOURNEYS.filter((j) => {
    const exp = experienceForJourney(j.id);
    return exp ? isAvailable(exp, p.ageBand) : false;
  });
  const understood = CONCEPTS.filter(
    (c) => c.isCoreConcept && p.mastery[c.slug] &&
      MASTERY_ORDER.indexOf(p.mastery[c.slug]) >= MASTERY_ORDER.indexOf('understood'),
  );

  return (
    <main className="sheet" style={{ paddingTop: 44 }}>
      <div className="kicker" style={{ color: 'var(--ink-35)' }}>You finished</div>
      <h1 className="h-big" style={{ marginBottom: 12 }}>You understand the system.</h1>
      <p className="body-s" style={{ marginTop: 0, marginBottom: 26 }}>
        Not every answer — nobody has those. But you have seen how the pieces
        connect, and you made the decisions yourself rather than reading about them.
      </p>

      <div className="sectionLabel">What you went through</div>
      {openToThem.map((j, i) => (
        <div className="jrow" key={j.id} style={i === openToThem.length - 1 ? { border: 'none' } : undefined}>
          <span className="jdot" style={{ background: `var(--${j.colorToken})` }} />
          <span className="jt">{j.title}</span>
          <span className="jm">✓</span>
        </div>
      ))}

      {understood.length > 0 && (
        <>
          <div className="sectionLabel">Ideas you can now use</div>
          <p className="body-s" style={{ marginTop: 0, marginBottom: 10 }}>
            {understood.map((c) => c.title).join(' · ')}
          </p>
        </>
      )}

      <div className="sectionLabel">Where to go next</div>
      <button className="labCard" onClick={() => router.push('/lab')}>
        <div className="lt">Money Lab</div>
        <div className="lb">
          Play with the numbers directly — a life to simulate, loans and
          compounding to push around. No lesson attached.
        </div>
      </button>
      <button className="labCard" onClick={() => router.push('/deeper')}>
        <div className="lt">Go deeper</div>
        <div className="lb">
          The things the core run deliberately left out, so it could stay short.
        </div>
      </button>

      <div style={{ marginTop: 26 }}>
        <button className="btn ghost" onClick={() => router.push('/home')}>Back to home</button>
      </div>
    </main>
  );
}
