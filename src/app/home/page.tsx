'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { JOURNEYS, TOTAL_JOURNEYS } from '@/content/journeys';
import { experienceForJourney, isAvailable } from '@/content/experiences';
import { CONCEPTS } from '@/content/concepts';
import { MASTERY_ORDER } from '@/content/types';
import * as P from '@/lib/progress';
import { signOut } from '@/lib/auth';
import { pushProgress, pullProgress } from '@/lib/sync';
import DenominationStrip from '@/components/DenominationStrip';

function greeting(d = new Date()): string {
  const h = d.getHours();
  const day = d.toLocaleDateString('en-IN', { weekday: 'long' });
  if (h < 12) return `${day} morning`;
  if (h < 17) return `${day} afternoon`;
  return `${day} evening`;
}

/**
 * Student dashboard (Section 8). It answers four questions and nothing else:
 * where am I, what have I learned, what do I do next, what can I explore.
 *
 * Deliberately NOT an analytics view. Numbers a student cannot act on are
 * demotivating; that material belongs in the admin dashboard.
 */
export default function Home() {
  const router = useRouter();
  const [p, setP] = useState<P.ProgressState | null>(null);

  useEffect(() => {
    const s = P.load();
    if (!s.username) { router.replace('/onboarding'); return; }
    setP(s);
    (async () => {
      await pullProgress();
      await pushProgress();
      setP(P.load());
    })();
  }, [router]);

  if (!p) return <main className="sheet" />;

  const done = new Set(p.completed);

  /* Only journeys this student can actually open count toward their total.
     A 13-year-old cannot reach Credit or Investing, so showing them "9 of 11"
     would describe them as permanently incomplete for no reason. */
  const openToThem = JOURNEYS.filter((j) => {
    const exp = experienceForJourney(j.id);
    return exp ? isAvailable(exp, p.ageBand) : false;
  });
  const total = openToThem.length;
  const completedCount = openToThem.filter((j) => done.has(j.slug)).length;
  const pct = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  const upNext = openToThem.find((j) => !done.has(j.slug));
  const remaining = openToThem.filter((j) => !done.has(j.slug));
  const minutesLeft = remaining.reduce((a, j) => a + j.estimatedMinutes, 0);
  const rest = remaining.filter((j) => j.slug !== upNext?.slug).slice(0, 4);

  /* Recently mastered: core concepts that have actually moved past being
     merely introduced. Sorted by how far they have come. */
  const mastered = CONCEPTS
    .filter((c) => c.isCoreConcept)
    .map((c) => ({ c, state: p.mastery[c.slug] }))
    .filter((x) => x.state && MASTERY_ORDER.indexOf(x.state) >= MASTERY_ORDER.indexOf('understood'))
    .slice(0, 4);

  /* Practice next: a concept started but not yet understood — the honest
     answer to "what should I work on", rather than a random suggestion. */
  const practiceNext = CONCEPTS
    .filter((c) => c.isCoreConcept)
    .map((c) => ({ c, state: p.mastery[c.slug] }))
    .find((x) => x.state && MASTERY_ORDER.indexOf(x.state) < MASTERY_ORDER.indexOf('understood'));

  const R = 30, C = 2 * Math.PI * R;

  return (
    <main className="sheet">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
        <div className="kicker" style={{ color: 'var(--ink-35)' }}>{greeting()}</div>
        <button
          onClick={async () => { await pushProgress(); await signOut(); P.clear(); router.replace('/login'); }}
          style={{
            background: 'none', border: 'none', padding: '16px 0 16px 16px', margin: '-16px 0',
            cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11,
            letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-35)',
          }}
        >
          Sign out
        </button>
      </div>

      <h1 className="h-mid" style={{ marginBottom: 4 }}>
        {completedCount === 0
          ? `Welcome, ${p.fullName.split(' ')[0]}.`
          : `Welcome back, ${p.fullName.split(' ')[0]}.`}
      </h1>

      <div className="ringWrap">
        <svg width="72" height="72" viewBox="0 0 72 72" role="img"
             aria-label={`${completedCount} of ${total} journeys complete`}>
          <circle cx="36" cy="36" r={R} fill="none" stroke="var(--ink-12)" strokeWidth="7" />
          <circle
            cx="36" cy="36" r={R} fill="none" stroke="var(--indigo)" strokeWidth="7"
            strokeLinecap="round" strokeDasharray={C}
            strokeDashoffset={C * (1 - pct / 100)}
            transform="rotate(-90 36 36)"
            style={{ transition: 'stroke-dashoffset .5s ease' }}
          />
        </svg>
        <div>
          <div className="ringN">{completedCount} <span style={{ color: 'var(--ink-35)' }}>/ {total}</span></div>
          <div className="ringL">
            {completedCount === 0
              ? `About ${minutesLeft} minutes for the whole thing.`
              : remaining.length === 0
                ? 'You have finished everything open to you.'
                : `About ${minutesLeft} minutes left.`}
          </div>
        </div>
      </div>

      <DenominationStrip
        completedSlugs={p.completed}
        currentSlug={upNext?.slug}
        interactive
        onSelect={(slug) => router.push(`/learn/${slug}`)}
      />

      {upNext ? (
        <button className="hero-card" onClick={() => router.push(`/learn/${upNext.slug}`)}>
          <div className="hl">
            {p.resume[upNext.slug] ? 'Pick up where you left off' : 'Up next'} · {upNext.estimatedMinutes} min
          </div>
          <div className="hh">{experienceForJourney(upNext.id)?.title ?? upNext.title}</div>
          <div className="hb">Continue →</div>
        </button>
      ) : (
        <button className="hero-card" onClick={() => router.push('/complete')}>
          <div className="hl">All done</div>
          <div className="hh">You understand the system.</div>
          <div className="hb">See what you know →</div>
        </button>
      )}

      {rest.length > 0 && (
        <>
          <div className="sectionLabel">Then</div>
          {rest.map((j, i) => (
            <button
              key={j.id}
              className="jrow"
              style={i === rest.length - 1 ? { border: 'none' } : undefined}
              onClick={() => router.push(`/learn/${j.slug}`)}
            >
              <span className="jdot" style={{ background: `var(--${j.colorToken})` }} />
              <span className="jt">{j.title}</span>
              <span className="jm">{j.estimatedMinutes} min</span>
            </button>
          ))}
        </>
      )}

      {mastered.length > 0 && (
        <>
          <div className="sectionLabel">Recently understood</div>
          {mastered.map(({ c, state }) => {
            const filled = MASTERY_ORDER.indexOf(state!) + 1;
            return (
              <div className="masteryRow" key={c.slug}>
                <span className="masteryName">{c.title}</span>
                <span className="dots" aria-label={`${state} — ${filled} of ${MASTERY_ORDER.length}`}>
                  {MASTERY_ORDER.map((_, i) => (
                    <span key={i} className={`dot${i < filled ? ' on' : ''}`} />
                  ))}
                </span>
              </div>
            );
          })}
        </>
      )}

      {practiceNext && (
        <>
          <div className="sectionLabel">Worth another look</div>
          <div className="masteryRow">
            <span className="masteryName">{practiceNext.c.title}</span>
            <span style={{ fontSize: 12.5, color: 'var(--ink-60)' }}>{practiceNext.state}</span>
          </div>
        </>
      )}

      <div className="sectionLabel">Explore</div>
      <button className="labCard" onClick={() => router.push('/lab')}>
        <div className="lt">Money Lab</div>
        <div className="lb">Free-play tools and the life simulator. No lesson attached.</div>
      </button>
      <button className="labCard" onClick={() => router.push('/progress')}>
        <div className="lt">Your progress</div>
        <div className="lb">Every concept you have touched, and how far each one has come.</div>
      </button>
    </main>
  );
}
