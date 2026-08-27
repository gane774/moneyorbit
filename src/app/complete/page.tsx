'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as P from '@/lib/progress';
import DenominationStrip from '@/components/DenominationStrip';

export default function Complete() {
  const router = useRouter();
  const [p, setP] = useState<P.ProgressState | null>(null);

  useEffect(() => { setP(P.load()); }, []);
  if (!p) return <main className="player dark"><div className="stage dark" /></main>;

  const minutes = p.startedAt
    ? Math.max(1, Math.round((Date.now() - new Date(p.startedAt).getTime()) / 60000))
    : null;

  return (
    <main className="player dark">
      <div className="stage dark">
        <div className="scr" style={{ paddingTop: 30 }}>
          <div className="kicker">Core run complete</div>
          <h1 className="h-big" style={{ marginBottom: 16 }}>
            {minutes ? `You did the whole thing in ${minutes} minutes.` : 'You did the whole thing.'}
          </h1>

          <DenominationStrip completedSlugs={p.completed} large />

          <p className="body-s">
            You can now read a bank statement, work out what a loan really costs,
            and spot four kinds of scam.
          </p>

          <div className="spacer" />
          <button className="btn" onClick={() => router.push('/lab')}>Open the Money Lab</button>
        </div>
      </div>
    </main>
  );
}
