'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DARK_SCREENS, SCREEN_ORDER, variantHasPlaceholders,
  type AgeBand, type Experience, type ScreenType,
} from '@/content/types';
import { JOURNEY_BY_ID, nextJourney } from '@/content/journeys';
import { variantFor } from '@/content/experiences';
import {
  allocatePortfolioTokens, choiceFastforwardTokens, compareIncomeTokens, compoundCurveTokens,
  emiTokens,
} from '@/lib/tokens';
import type { ChoiceFastforwardParams } from '@/content/experiences/j01-mindset';
import type { CompareIncomeParams } from '@/content/experiences/j02-earning';
import type { PaymentDecisionParams } from '@/content/experiences/j04-banking';
import type { ParallelShockParams } from '@/content/experiences/j05-saving';
import type { AllocatePortfolioParams } from '@/content/experiences/j08-investing';
import type { MatchGoalParams } from '@/content/experiences/j09-destinations';
import type { GoalPlannerParams } from '@/content/experiences/j10-planning';
import type { SpotScamParams } from '@/content/experiences/j11-scams';
import type { CompoundCurveParams } from '@/content/experiences/j07-math';
import type { FindProblemParams } from '@/content/experiences/j03-budgeting';
import type { EmiParams } from '@/content/experiences/j06-credit';
import * as P from '@/lib/progress';
import { pushProgress } from '@/lib/sync';
import { logEvent } from '@/lib/auth';
import { useAudio } from '@/lib/audio/useAudio';
import { TopBar } from './PlayerChrome';
import {
  DecideScreen, ExplainScreen, FeedbackScreen, HookScreen, InteractScreen, PracticeScreen,
} from './Screens';
import FindProblem from './mechanics/FindProblem';
import ChoiceFastforward from './mechanics/ChoiceFastforward';
import CompareIncome from './mechanics/CompareIncome';
import PaymentDecisions from './mechanics/PaymentDecisions';
import AllocatePortfolio from './mechanics/AllocatePortfolio';
import GoalPlanner from './mechanics/GoalPlanner';
import SpotScam from './mechanics/SpotScam';
import MatchGoal from './mechanics/MatchGoal';
import CompoundCurve from './mechanics/CompoundCurve';
import ParallelShock from './mechanics/ParallelShock';
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
  const { play } = useAudio();
  const journey = JOURNEY_BY_ID.get(experience.journeyId)!;
  const variant = variantFor(experience, band);

  const [index, setIndex] = useState(0);
  const [decision, setDecision] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  /* Only used by allocate-events; harmless to hold for other mechanics. */
  const [allocation, setAllocation] = useState<Record<string, number>>({});

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
    void logEvent('experience_started', experience.id, P.load().age ?? 0);
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
    if (experience.mechanicType === 'choice-fastforward' && variant) {
      return choiceFastforwardTokens(variant.params as unknown as ChoiceFastforwardParams);
    }
    if (experience.mechanicType === 'compare-income' && variant) {
      return compareIncomeTokens(variant.params as unknown as CompareIncomeParams);
    }
    if (experience.mechanicType === 'compound-curve' && variant) {
      return compoundCurveTokens(variant.params as unknown as CompoundCurveParams);
    }
    if (experience.mechanicType === 'allocate-portfolio' && variant) {
      return allocatePortfolioTokens(variant.params as unknown as AllocatePortfolioParams);
    }
    return {};
  }, [experience.mechanicType, variant, allocation]);

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
    // Section 8: this is the one call site for "a lesson experience was
    // completed" — distinct from, and in addition to, the quiz_correct /
    // quiz_incorrect sound already played for the individual answer.
    play('task_complete');

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

    /* Persist to Postgres, but do not make the student wait on it: the local
       copy is already correct and authoritative for resuming. A network
       failure here costs an analytics row, never a completed lesson. */
    const age = P.load().age ?? 0;
    void pushProgress();
    void logEvent('experience_completed', experience.id, age, { correct });
    void logEvent('journey_completed', journey.id, age);

    /* Hand over to the next journey rather than dropping the student back on
       the dashboard: the fixed order is pedagogical, and the transition is
       where that relationship gets stated (Section 26). */
    const upcoming = nextJourney(journey.slug);
    if (!upcoming) void logEvent('course_completed', null, age);
    router.push(upcoming ? `/handoff?from=${journey.slug}` : '/complete');
  };

  /* Each mechanic receives the callback and decides for itself when the
     student has engaged enough to move on (see MechanicProps). */
  const renderMechanic = (onExplored: () => void) =>
    experience.mechanicType === 'emi-slider' ? (
      <EmiSlider
        params={variant.params as unknown as EmiParams}
        labels={copy.interact.labels}
        onExplored={onExplored}
      />
    ) : experience.mechanicType === 'find-problem' ? (
      <FindProblem
        params={variant.params as unknown as FindProblemParams}
        labels={copy.interact.labels}
        onExplored={onExplored}
      />
    ) : experience.mechanicType === 'choice-fastforward' ? (
      <ChoiceFastforward
        params={variant.params as unknown as ChoiceFastforwardParams}
        labels={copy.interact.labels}
        onExplored={onExplored}
      />
    ) : experience.mechanicType === 'compare-income' ? (
      <CompareIncome
        params={variant.params as unknown as CompareIncomeParams}
        labels={copy.interact.labels}
        onExplored={onExplored}
      />
    ) : experience.mechanicType === 'payment-decisions' ? (
      <PaymentDecisions
        params={variant.params as unknown as PaymentDecisionParams}
        labels={copy.interact.labels}
        onExplored={onExplored}
      />
    ) : experience.mechanicType === 'parallel-shock' ? (
      <ParallelShock
        params={variant.params as unknown as ParallelShockParams}
        labels={copy.interact.labels}
        onExplored={onExplored}
      />
    ) : experience.mechanicType === 'compound-curve' ? (
      <CompoundCurve
        params={variant.params as unknown as CompoundCurveParams}
        labels={copy.interact.labels}
        onExplored={onExplored}
      />
    ) : experience.mechanicType === 'allocate-portfolio' ? (
      <AllocatePortfolio
        params={variant.params as unknown as AllocatePortfolioParams}
        labels={copy.interact.labels}
        onExplored={onExplored}
      />
    ) : experience.mechanicType === 'match-goal' ? (
      <MatchGoal
        params={variant.params as unknown as MatchGoalParams}
        onExplored={onExplored}
      />
    ) : experience.mechanicType === 'goal-planner' ? (
      <GoalPlanner
        params={variant.params as unknown as GoalPlannerParams}
        onExplored={onExplored}
      />
    ) : experience.mechanicType === 'spot-scam' ? (
      <SpotScam
        params={variant.params as unknown as SpotScamParams}
        labels={copy.interact.labels}
        onExplored={onExplored}
      />
    ) : (
      <PlaceholderMechanic
        mechanicType={experience.mechanicType}
        onExplored={onExplored}
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
          <InteractScreen
            copy={copy.interact} tokens={tokens} placeholder={placeholder}
            onNext={next} renderMechanic={renderMechanic}
          />
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
