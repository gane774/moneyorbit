'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { JOURNEYS, TOTAL_JOURNEYS } from '@/content/journeys';
import { experienceForJourney, isAvailable } from '@/content/experiences';
import * as P from '@/lib/progress';
import DenominationStrip from '@/components/DenominationStrip';

function greeting(d = new Date()): string {
  const h = d.getHours();
  const day = d.toLocaleDateString('en-IN', { weekday: 'long' });
  if (h < 12) return `${day} morning`;
  if (h < 17) return `${day} afternoon`;
  return `${day} evening`;
}

export default function Home() {
  const router = useRouter();
  const [p, setP] = useState<P.ProgressState | null>(null);

  useEffect(() => {
    const s = P.load();
    if (!s.username) { router.replace('/onboarding'); return; }
    setP(s);
  }, [router]);

  if (!p) return <main className="sheet" />;

  const done = new Set(p.completed);
  const upNext = JOURNEYS.find((j) => !done.has(j.slug));
  const remaining = JOURNEYS.filter((j) => !done.has(j.slug));
  const minutesLeft = remaining.reduce((a, j) => a + j.estimatedMinutes, 0);
  const rest = remaining.filter((j) => j.slug !== upNext?.slug).slice(0, 4);

  return (
    <main className="sheet">
      <div className="kicker" style={{ color: 'var(--ink-35)' }}>{greeting()}</div>
      <h1 className="h-mid" style={{ marginBottom: 4 }}>
        {p.completed.length === 0 ? `Welcome, ${p.fullName.split(' ')[0]}.` : `Welcome back, ${p.fullName.split(' ')[0]}.`}
      </h1>
      <p className="body-s" style={{ marginTop: 4, marginBottom: 12 }}>
        {p.completed.length} of {TOTAL_JOURNEYS} done · about {minutesLeft} minutes left
      </p>

      <DenominationStrip
        completedSlugs={p.completed}
        currentSlug={upNext?.slug}
        interactive
        onSelect={(slug) => router.push(`/learn/${slug}`)}
      />

      {upNext && (
        <button className="hero-card" onClick={() => router.push(`/learn/${upNext.slug}`)}>
          <div className="hl">Up next · {upNext.estimatedMinutes} min</div>
          <div className="hh">{experienceForJourney(upNext.id)?.title ?? upNext.title}</div>
          <div className="hb">Continue →</div>
        </button>
      )}

      {rest.map((j, i) => {
        const exp = experienceForJourney(j.id);
        const locked = exp ? !isAvailable(exp, p.ageBand) : true;
        return (
          <button
            key={j.id}
            className={`jrow${locked ? ' locked' : ''}`}
            style={i === rest.length - 1 ? { border: 'none' } : undefined}
            disabled={locked}
            onClick={() => router.push(`/learn/${j.slug}`)}
          >
            <span className="jdot" style={{ background: locked ? 'var(--ink-12)' : `var(--${j.colorToken})` }} />
            <span className="jt">{j.title}</span>
            <span className="jm">{locked ? '15+' : `${j.estimatedMinutes} min`}</span>
          </button>
        );
      })}

      <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
        <Link href="/progress" style={{ flex: 1 }}>
          <button className="btn ghost">Your progress</button>
        </Link>
        <Link href="/lab" style={{ flex: 1 }}>
          <button className="btn ghost">Money Lab</button>
        </Link>
      </div>
    </main>
  );
}
