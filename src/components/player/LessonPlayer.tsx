'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DARK_SCREENS, SCREEN_ORDER, variantHasPlaceholders,
  type AgeBand, type Experience, type ScreenType,
} from '@/content/types';
import { JOURNEY_BY_ID, nextJourney } from '@/content/journeys';
import { variantFor } from '@/content/experiences';
import { allocateTokens, emiTokens } from '@/lib/tokens';
import type { AllocateParams } from '@/content/experiences/j03-budgeting';
import type { EmiParams } from '@/content/experiences/j06-credit';
import * as P from '@/lib/progress';
import { TopBar } from './PlayerChrome';
import {
  DecideScreen, ExplainScreen, FeedbackScreen, HookScreen, InteractScreen, PracticeScreen,
} from './Screens';
import EmiSlider from './mechanics/EmiSlider';
import PlaceholderMechanic from './mechanics/PlaceholderMechanic';

export default function LessonPlayer({
  experience,
  band,
}: {
  experience: Experience;
  band: AgeBand;
}) {
  const router = useRouter();
  const journey = JOURNEY_BY_ID.get(experience.journeyId)!;
  const variant = variantFor(experience, band);

  const [index, setIndex] = useState(0);
  const [decision, setDecision] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  /* Resume an interrupted lesson rather than restarting it. */
  useEffect(() => {
    const saved = P.load().resume[journey.slug];
    if (saved) {
      setIndex(Math.min(saved.screenIndex, SCREEN_ORDER.length - 1));
      setDecision(saved.decision);
    }
    setHydrated(true);
  }, [journey.slug]);

  /* Mark concepts introduced as soon as the lesson opens. */
  useEffect(() => {
    if (!hydrated) return;
    P.update((p) => P.advanceMany(
      { ...p, startedAt: p.startedAt ?? new Date().toISOString() },
      experience.concepts,
      'introduced',
    ));
  }, [hydrated, experience.concepts]);

  const persist = (screenIndex: number, dec: string | null) => {
    P.update((p) => ({
      ...p,
      resume: { ...p.resume, [journey.slug]: { screenIndex, decision: dec } },
    }));
  };

  const tokens = useMemo(() => {
    if (experience.mechanicType === 'emi-slider' && variant) {
      return emiTokens(variant.params as unknown as EmiParams);
    }
    if (experience.mechanicType === 'allocate-events' && variant) {
      return allocateTokens(variant.params as unknown as AllocateParams);
    }
    return {};
  }, [experience.mechanicType, variant]);

  if (!variant) {
    return (
      <main className="player">
        <div className="stage">
          <div className="scr">
            <h2 className="h-mid">Not available yet</h2>
            <p className="body-s">
              This experience does not have a version for your age group yet.
            </p>
            <div className="spacer" />
            <button className="btn" onClick={() => router.push('/home')}>Back to home</button>
          </div>
        </div>
      </main>
    );
  }

  const screen: ScreenType = SCREEN_ORDER[index];
  const isDark = DARK_SCREENS.includes(screen);
  const placeholder = variantHasPlaceholders(variant);
  const copy = variant.copy;

  const go = (n: number, dec: string | null = decision) => {
    setIndex(n);
    persist(n, dec);
  };

  const next = () => go(Math.min(index + 1, SCREEN_ORDER.length - 1));
  const back = index > 0 ? () => go(index - 1) : () => router.push('/home');

  const onDecide = (optionId: string) => {
    setDecision(optionId);
    // Attempting the interaction and committing to a choice = practising.
    P.update((p) => P.advanceMany(p, experience.concepts, 'practicing'));
    go(index + 1, optionId);
  };

  const onComplete = (_optionId: string, correct: boolean) => {
    P.update((p) => {
      const withMastery = correct
        ? P.advanceMany(p, experience.concepts, 'understood')
        : p;
      const completed = withMastery.completed.includes(journey.slug)
        ? withMastery.completed
        : [...withMastery.completed, journey.slug];
      const resume = { ...withMastery.resume };
      delete resume[journey.slug];
      return { ...withMastery, completed, resume };
    });

    const upcoming = nextJourney(journey.slug);
    router.push(upcoming ? `/home?done=${journey.slug}` : '/complete');
  };

  const mechanic =
    experience.mechanicType === 'emi-slider' ? (
      <EmiSlider
        params={variant.params as unknown as EmiParams}
        labels={copy.interact.labels}
      />
    ) : (
      <PlaceholderMechanic
        mechanicType={experience.mechanicType}
        /* For an unwritten experience the headline IS the mechanic note. Once
           real copy lands the headline is the student's instruction, so
           repeating it here would just echo the line above it. */
        note={
          placeholder
            ? copy.interact.headline.replace('[PLACEHOLDER]', '').trim()
            : 'This interaction is not built yet. The copy around it is final.'
        }
      />
    );

  const progressPct = ((index + 1) / SCREEN_ORDER.length) * 100;

  return (
    <main className={`player${isDark ? ' dark' : ''}`}>
      <div className={`stage${isDark ? ' dark' : ''}`}>
        <TopBar journeyName={journey.shortTitle} progressPct={progressPct} onBack={back} />

        {screen === 'hook' && (
          <HookScreen copy={copy.hook} tokens={tokens} placeholder={placeholder} onNext={next} />
        )}
        {screen === 'explain' && (
          <ExplainScreen copy={copy.explain} tokens={tokens} placeholder={placeholder} onNext={next} />
        )}
        {screen === 'interact' && (
          <InteractScreen copy={copy.interact} tokens={tokens} placeholder={placeholder} onNext={next}>
            {mechanic}
          </InteractScreen>
        )}
        {screen === 'decide' && (
          <DecideScreen copy={copy.decide} tokens={tokens} placeholder={placeholder} onDecide={onDecide} />
        )}
        {screen === 'feedback' && (
          <FeedbackScreen
            copy={copy.feedback} tokens={tokens} placeholder={placeholder}
            decision={decision} onNext={next}
          />
        )}
        {screen === 'practice' && (
          <PracticeScreen
            copy={copy.practice} tokens={tokens} placeholder={placeholder}
            onComplete={onComplete}
          />
        )}
      </div>
    </main>
  );
}
