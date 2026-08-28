'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { JOURNEY_BY_SLUG, nextJourney } from '@/content/journeys';
import { experienceForJourney, isAvailable, variantFor } from '@/content/experiences';
import * as P from '@/lib/progress';

/**
 * Between-journey transition (Section 26). A stronger beat than the
 * screen-to-screen fade inside a lesson: it names what was just learned, then
 * hands over to what comes next and why it follows.
 *
 * It reinforces the relationship between topics, which is the entire reason
 * the eleven are in a fixed order rather than a menu.
 */
function Handoff() {
  const router = useRouter();
  const params = useSearchParams();
  const fromSlug = params.get('from') ?? '';
  const [band, setBand] = useState<P.ProgressState['ageBand'] | null>(null);

  useEffect(() => {
    const s = P.load();
    if (!s.username) { router.replace('/onboarding'); return; }
    setBand(s.ageBand);
  }, [router]);

  const from = JOURNEY_BY_SLUG.get(fromSlug);

  useEffect(() => {
    if (!from) router.replace('/home');
  }, [from, router]);

  if (!band || !from) return <main className="player"><div className="stage dark" /></main>;

  /* Skip any journey this student cannot open, so a 13-year-old is never
     handed over to Credit or Investing and told it is next. */
  let next = nextJourney(from.slug);
  while (next) {
    const exp = experienceForJourney(next.id);
    if (exp && isAvailable(exp, band)) break;
    next = nextJourney(next.slug);
  }

  const nextExp = next ? experienceForJourney(next.id) : undefined;
  const nextVariant = nextExp && next ? variantFor(nextExp, band) : undefined;

  return (
    <main className="player">
      <div className="stage dark">
        <div className="scr" style={{ justifyContent: 'center' }}>
          <div className="handoff">
            <div className="handoffDone">{from.title} ✓</div>

            {next && nextVariant ? (
              <>
                <div className="handoffLine">{closingLine(from.slug)}</div>
                <div className="handoffNext">Next up</div>
                <div className="handoffTitle">{next.title}</div>
                <div className="handoffHook">{nextVariant.copy.hook.headline}</div>
              </>
            ) : (
              <div className="handoffLine">That was the last one open to you.</div>
            )}
          </div>

          <div className="spacer" />
          {next ? (
            <button className="btn" onClick={() => router.push(`/learn/${next!.slug}`)}>
              Start {next.shortTitle}
            </button>
          ) : (
            <button className="btn" onClick={() => router.push('/complete')}>See what you know</button>
          )}
          <button
            className="btn ghost"
            style={{ marginTop: 10 }}
            onClick={() => router.push('/home')}
          >
            Stop here for now
          </button>
        </div>
      </div>
    </main>
  );
}

/** One line naming what the finished journey actually established. */
function closingLine(slug: string): string {
  const lines: Record<string, string> = {
    'money-mindset':    'You know what spending now really costs.',
    'earning-income':   'You know money can arrive without your time attached.',
    'budgeting':        'You know where your money goes before it goes there.',
    'banking-payments': 'You know the path your money takes, and who never needs your PIN.',
    'saving':           'You know what a cushion is actually for.',
    'credit-debt':      'You know the monthly number is not the price.',
    'money-math':       'You know why starting early beats starting big.',
    'investing-basics': 'You know that the same choice can end two different ways.',
    'destinations':     'You know the right place depends on when you need it back.',
    'planning':         'You know how to turn a wish into a monthly number.',
  };
  return lines[slug] ?? 'That one is done.';
}

export default function HandoffPage() {
  return (
    <Suspense fallback={<main className="player"><div className="stage dark" /></main>}>
      <Handoff />
    </Suspense>
  );
}
