'use client';

import { JOURNEYS } from '@/content/journeys';

/**
 * The signature element (Section 2). Eleven segments, one per journey,
 * coloured after Indian banknote denominations. Simultaneously navigation,
 * progress indicator and brand identity. Never simplify to a generic bar.
 */
export default function DenominationStrip({
  completedSlugs,
  currentSlug,
  large = false,
  interactive = false,
  onSelect,
}: {
  completedSlugs: string[];
  currentSlug?: string;
  large?: boolean;
  interactive?: boolean;
  onSelect?: (slug: string) => void;
}) {
  const done = new Set(completedSlugs);

  return (
    <div
      className={`strip${large ? ' lg' : ''}`}
      role={interactive ? 'navigation' : 'img'}
      aria-label={`Course progress: ${done.size} of ${JOURNEYS.length} journeys complete`}
    >
      {JOURNEYS.map((j) => {
        const state = j.slug === currentSlug ? 'now' : done.has(j.slug) ? 'done' : '';
        const style = { background: `var(--${j.colorToken})` };

        if (interactive && onSelect) {
          return (
            <span key={j.id} className={state} style={style}>
              <button
                type="button"
                onClick={() => onSelect(j.slug)}
                title={`${j.orderIndex}. ${j.title}`}
                aria-label={`${j.title}${done.has(j.slug) ? ' — complete' : ''}`}
                style={{ background: 'transparent', width: '100%', height: '100%', display: 'block' }}
              />
            </span>
          );
        }
        return <span key={j.id} className={state} style={style} />;
      })}
    </div>
  );
}
