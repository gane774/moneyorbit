'use client';

import { useState } from 'react';
import { rich } from '@/lib/rich';
import { resolveTokens } from '@/lib/tokens';
import { Kicker, PlaceholderBadge } from './PlayerChrome';
import { isPlaceholderText, stripPlaceholder } from '@/content/types';
import type {
  DecideCopy, ExplainCopy, FeedbackCopy, HookCopy, InteractCopy, PracticeCopy,
} from '@/content/types';

/** Strips the [PLACEHOLDER] marker for display and resolves {{tokens}}. */
function T(s: string, tokens: Record<string, string>): string {
  return resolveTokens(stripPlaceholder(s), tokens);
}

interface Base {
  tokens: Record<string, string>;
  placeholder: boolean;
  onNext: () => void;
}

/* ---------------- 01 · Hook · dark · ~15s ---------------- */

export function HookScreen({ copy, tokens, placeholder, onNext }: Base & { copy: HookCopy }) {
  return (
    <div className="scr">
      {placeholder && <PlaceholderBadge />}
      <Kicker>{T(copy.kicker, tokens)}</Kicker>
      <h1 className="h-big">{rich(T(copy.headline, tokens))}</h1>
      {copy.lines.map((l, i) => (
        <p
          key={i}
          className="body-s"
          style={l.accent ? { color: 'var(--n200)', fontWeight: 600 } : undefined}
        >
          {rich(T(l.text, tokens), `hl${i}`)}
        </p>
      ))}
      <div className="spacer" />
      <button className="btn" onClick={onNext}>{T(copy.cta, tokens)}</button>
    </div>
  );
}

/* ---------------- 02 · Explain · light · ~40s ---------------- */

export function ExplainScreen({ copy, tokens, placeholder, onNext }: Base & { copy: ExplainCopy }) {
  return (
    <div className="scr">
      {placeholder && <PlaceholderBadge />}
      <Kicker>{T(copy.kicker, tokens)}</Kicker>
      <h2 className="h-mid">{rich(T(copy.headline, tokens))}</h2>
      {copy.body.map((b, i) => (
        <p key={i} className="body-s">{rich(T(b, tokens), `eb${i}`)}</p>
      ))}
      <div className="spacer" />
      <button className="btn" onClick={onNext}>{T(copy.cta, tokens)}</button>
    </div>
  );
}

/* ---------------- 03 · Interact · light · ~90s ----------------
   This screen IS the lesson. The CTA stays disabled until the student
   has actually moved something — reading the simulator is not using it. */

export function InteractScreen({
  copy, tokens, placeholder, onNext, children,
}: Base & { copy: InteractCopy; children: React.ReactNode }) {
  const [explored, setExplored] = useState(false);

  return (
    <div className="scr">
      {placeholder && <PlaceholderBadge />}
      <Kicker>{T(copy.kicker, tokens)}</Kicker>
      <h2 className="h-mid" style={{ marginBottom: 16 }}>{rich(T(copy.headline, tokens))}</h2>

      {/* "Explored" means a value actually changed, not that a pointer went
          down — so this also unlocks for keyboard and assistive-tech users
          who adjust a slider without ever generating a pointer event. */}
      <div
        onInputCapture={() => setExplored(true)}
        onPointerDownCapture={() => setExplored(true)}
        onKeyDownCapture={() => setExplored(true)}
      >
        {children}
      </div>

      <div className="spacer" />
      <button className="btn" onClick={onNext} disabled={!explored}>
        {explored ? T(copy.cta ?? 'Continue', tokens) : 'Try moving a slider'}
      </button>
    </div>
  );
}

/* ---------------- 04 · Decide · light · ~20s ----------------
   A committed choice with a visible consequence, not a quiz.
   Nothing here is marked right or wrong. */

export function DecideScreen({
  copy, tokens, placeholder, onDecide,
}: Omit<Base, 'onNext'> & { copy: DecideCopy; onDecide: (optionId: string) => void }) {
  const [sel, setSel] = useState<string | null>(null);

  return (
    <div className="scr">
      {placeholder && <PlaceholderBadge />}
      <Kicker>{T(copy.kicker, tokens)}</Kicker>
      <h2 className="h-mid" style={{ marginBottom: 16 }}>{rich(T(copy.headline, tokens))}</h2>

      <div role="radiogroup" aria-label="Your choice">
        {copy.options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={sel === o.id}
            className={`choice${sel === o.id ? ' sel' : ''}`}
            onClick={() => setSel(o.id)}
          >
            <div className="ct">{rich(T(o.title, tokens), `dt${o.id}`)}</div>
            {o.subtitle && <div className="cs">{rich(T(o.subtitle, tokens), `ds${o.id}`)}</div>}
            {o.figure && <div className="cn">{T(o.figure, tokens)}</div>}
          </button>
        ))}
      </div>

      <div className="spacer" />
      <button className="btn" disabled={!sel} onClick={() => sel && onDecide(sel)}>
        {T(copy.cta, tokens)}
      </button>
    </div>
  );
}

/* ---------------- 05 · Feedback · dark · ~40s ----------------
   Consequence, then the misconception named and struck through,
   and only then the vocabulary card. */

export function FeedbackScreen({
  copy, tokens, placeholder, onNext, decision,
}: Base & { copy: FeedbackCopy; decision: string | null }) {
  const verdict = (decision && copy.verdicts[decision]) || Object.values(copy.verdicts)[0];

  return (
    <div className="scr" style={{ overflowY: 'auto' }}>
      {placeholder && <PlaceholderBadge />}
      <Kicker>{T(copy.kicker, tokens)}</Kicker>

      <div className={`verdict${verdict.tone === 'good' ? ' good' : ''}`}>
        <div className="vt">{rich(T(verdict.title, tokens), 'vt')}</div>
        <div className="vb">{rich(T(verdict.body, tokens), 'vb')}</div>
      </div>

      <div className="mythbox">
        <div className="ml">The myth this kills</div>
        <div className="mt">
          <s>{rich(T(copy.myth.struck, tokens), 'ms')}</s>
          <br />
          {rich(T(copy.myth.correction, tokens), 'mc')}
        </div>
      </div>

      <div className="vocab" style={{ marginTop: 14 }}>
        <div className="vw">{copy.vocab.term}</div>
        <div className="vd">{rich(T(copy.vocab.definition, tokens), 'vd')}</div>
      </div>

      <div className="spacer" />
      <button className="btn" onClick={onNext}>{T(copy.cta, tokens)}</button>
    </div>
  );
}

/* ---------------- 06 · Practice · light · ~30s ----------------
   Different context than Interact. Feedback explains reasoning,
   not just correctness — that is what drives completion. */

export function PracticeScreen({
  copy, tokens, placeholder, onComplete,
}: Omit<Base, 'onNext'> & {
  copy: PracticeCopy;
  onComplete: (optionId: string, correct: boolean) => void;
}) {
  const [sel, setSel] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const chosen = copy.options.find((o) => o.id === sel);

  const cls = (id: string) => {
    if (!checked) return sel === id ? 'choice sel' : 'choice';
    const o = copy.options.find((x) => x.id === id)!;
    if (o.correct) return 'choice correct';
    return id === sel ? 'choice wrong' : 'choice';
  };

  return (
    <div className="scr" style={{ overflowY: 'auto' }}>
      {placeholder && <PlaceholderBadge />}
      <Kicker>{T(copy.kicker, tokens)}</Kicker>
      <h2 className="h-mid" style={{ marginBottom: 16 }}>{rich(T(copy.prompt, tokens))}</h2>

      <div role="radiogroup" aria-label="Answer">
        {copy.options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={sel === o.id}
            className={cls(o.id)}
            disabled={checked}
            onClick={() => setSel(o.id)}
          >
            <div className="ct">{rich(T(o.title, tokens), `pt${o.id}`)}</div>
            {o.subtitle && <div className="cs">{rich(T(o.subtitle, tokens), `ps${o.id}`)}</div>}
          </button>
        ))}
      </div>

      {checked && chosen && (
        <div
          className={`verdict${chosen.correct ? ' good' : ''}`}
          style={{ marginTop: 6 }}
          role="status"
        >
          <div className="vt">{chosen.correct ? 'Correct' : 'Not quite'}</div>
          <div className="vb">{rich(T(chosen.rationale, tokens), 'pr')}</div>
        </div>
      )}

      <div className="spacer" />
      {!checked ? (
        <button className="btn" disabled={!sel} onClick={() => setChecked(true)}>
          {T(copy.cta, tokens)}
        </button>
      ) : (
        <button className="btn" onClick={() => onComplete(sel!, !!chosen?.correct)}>
          Finish
        </button>
      )}
    </div>
  );
}

export { isPlaceholderText };
