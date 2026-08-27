'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Experience } from '@/content/types';
import { isAvailable } from '@/content/experiences';
import * as P from '@/lib/progress';
import LessonPlayer from '@/components/player/LessonPlayer';

/** Reads the student's age band on the client, then gates or renders.
 *  Kept separate from the server page so the route can stay static. */
export default function LessonGate({ experience }: { experience: Experience }) {
  const router = useRouter();
  const [state, setState] = useState<P.ProgressState | null>(null);

  useEffect(() => {
    const p = P.load();
    if (!p.username) { router.replace('/onboarding'); return; }
    setState(p);
  }, [router]);

  if (!state) return <main className="player"><div className="stage" /></main>;

  if (!isAvailable(experience, state.ageBand)) {
    return (
      <main className="player">
        <div className="stage">
          <div className="scr">
            <div className="kicker">Not yet</div>
            <h2 className="h-mid">This one opens up a bit later.</h2>
            <p className="body-s">
              {experience.title} covers borrowing decisions written for 15 and above.
              Everything else in the course is open to you now.
            </p>
            <div className="spacer" />
            <button className="btn" onClick={() => router.push('/home')}>Back to home</button>
          </div>
        </div>
      </main>
    );
  }

  return <LessonPlayer experience={experience} band={state.ageBand} />;
}
