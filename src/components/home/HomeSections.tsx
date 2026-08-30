'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { JOURNEYS, TOTAL_JOURNEYS, TOTAL_MINUTES, journeyColorVar } from '@/content/journeys';
import { computeLoan, inr } from '@/lib/money';
import { resolveStartDestination } from '@/lib/startDestination';
import styles from './HomeSections.module.css';

/**
 * The five motivation sections (Sections 14-20), written as one narrative
 * rather than five interchangeable card decks:
 *
 *   what can go wrong  ->  what you were never taught  ->  it only takes 45
 *   minutes  ->  here is one question  ->  here is what you already believe
 *   that is wrong  ->  start
 *
 * Every section is something you DO, not something you read: the fix for
 * "the homepage feels empty" is interaction, not more copy (Section 21).
 */

/* ------------------------------------------------------------------ *
 * Section 15 - what happens if you don't know
 * Cause -> effect. Consequences are concrete and non-dramatic: the tone
 * is "worth knowing before you need it", never a scare tactic.
 * ------------------------------------------------------------------ */
const CONSEQUENCES = [
  {
    q: "You don't understand EMIs?",
    a: 'You compare the monthly payment and miss the total. The cheaper-looking loan is often the one that costs more by the end.',
  },
  {
    q: "You don't understand credit cards?",
    a: 'Paying the "minimum due" clears the warning, not the balance. What is left keeps growing while it waits.',
  },
  {
    q: "You don't understand how payments work?",
    a: 'A convincing message is designed to look convincing. The tell is almost never how it feels — it is which direction the money is actually moving.',
  },
  {
    q: "You don't understand inflation?",
    a: 'The number in your account stays the same. What it buys quietly shrinks, year after year, without anything appearing to happen.',
  },
];

/* ------------------------------------------------------------------ *
 * Section 17 - things nobody teaches you
 * Each line is a true, checkable claim -- nothing sensational, because
 * an overstated hook undermines the lesson it is selling.
 * ------------------------------------------------------------------ */
const UNTAUGHT = [
  {
    q: 'A lower EMI can cost you more.',
    a: 'Stretching a loan over more months shrinks each payment and grows the total. You pay interest for longer.',
  },
  {
    q: "₹100 doesn't stay ₹100 forever.",
    a: 'At around 6% inflation, today\'s ₹100 buys roughly what ₹56 buys in ten years. The note is unchanged; its power is not.',
  },
  {
    q: "A minimum payment isn't paying the bill.",
    a: 'It keeps the account in good standing. The rest of the balance stays, and interest keeps accruing on it.',
  },
  {
    q: '"Guaranteed return" is a warning sign.',
    a: 'Genuine returns vary. A promised, fixed, unusually high number is describing something that does not exist.',
  },
  {
    q: 'Starting earlier can beat starting bigger.',
    a: 'Compounding rewards time more than size. Ten extra years often outruns a better rate you found later.',
  },
];

/* ------------------------------------------------------------------ *
 * Section 19 - myth vs reality
 * ------------------------------------------------------------------ */
const MYTHS = [
  { myth: 'Higher return means a better investment.', reality: 'A higher potential return also widens the range of bad outcomes. The two arrive together.' },
  { myth: 'Lower EMI means a cheaper loan.', reality: 'The monthly figure is not the price. Total repayment is, and a smaller EMI usually raises it.' },
  { myth: "Mutual funds can't lose money.", reality: 'They hold real assets, so they rise and fall with them. Over long periods they have tended to grow — that is not a guarantee.' },
  { myth: 'You need to be good at maths to understand money.', reality: 'Almost all of it is addition and patience. Understanding the idea matters far more than the arithmetic.' },
];

/** Section 18: real figures, computed — never invented. */
const LOAN_PRINCIPAL = 100_000;
const LOAN_RATE = 12;
const SHORT_YEARS = 2;
const LONG_YEARS = 5;

function Disclosure({
  items, idPrefix,
}: { items: { q: string; a: string }[]; idPrefix: string }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      {items.map((it, i) => (
        <button
          key={it.q}
          type="button"
          className={styles.row}
          aria-expanded={open === i}
          aria-controls={`${idPrefix}-${i}`}
          onClick={() => setOpen(open === i ? null : i)}
        >
          <span className={styles.rowHead}>
            <span className={styles.rowQ}>{it.q}</span>
            <span className={styles.rowMark} aria-hidden="true">+</span>
          </span>
          <span className={styles.rowBody} id={`${idPrefix}-${i}`}>
            <span className={styles.rowBodyInner}>{it.a}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

export default function HomeSections() {
  const router = useRouter();
  const [picked, setPicked] = useState<'short' | 'long' | null>(null);
  const [flipped, setFlipped] = useState<Set<number>>(new Set());

  const short = computeLoan(LOAN_PRINCIPAL, LOAN_RATE, SHORT_YEARS);
  const long = computeLoan(LOAN_PRINCIPAL, LOAN_RATE, LONG_YEARS);
  /* Round each total BEFORE subtracting. inr() rounds for display, so taking
     the raw difference can print a number that is one rupee off from what the
     two figures shown above it actually subtract to. A student checking the
     arithmetic on a page arguing "the monthly number is not the price" must
     not find the page's own arithmetic wrong. */
  const extra = Math.round(long.totalPaid) - Math.round(short.totalPaid);

  const go = () => router.push(resolveStartDestination().href);

  const toggleMyth = (i: number) => {
    const next = new Set(flipped);
    if (next.has(i)) next.delete(i); else next.add(i);
    setFlipped(next);
  };

  return (
    <div className={styles.wrap}>
      {/* ---------------- Section 15 ---------------- */}
      <section className={styles.sec}>
        <div className={styles.kicker}>What can go wrong</div>
        <h2 className={styles.h2}>Most money mistakes are just things nobody explained.</h2>
        <p className={styles.lede}>
          Not carelessness. Four ordinary gaps, and what each one actually costs.
        </p>
        <Disclosure items={CONSEQUENCES} idPrefix="cons" />
      </section>

      {/* ---------------- Section 17 ---------------- */}
      <section className={styles.sec}>
        <div className={styles.kicker}>Things nobody teaches you</div>
        <h2 className={styles.h2}>Five things that are true and sound wrong.</h2>
        <p className={styles.lede}>Open any one of them.</p>
        <Disclosure items={UNTAUGHT} idPrefix="unt" />
      </section>

      {/* ---------------- Section 16 ---------------- */}
      <section className={styles.sec}>
        <div className={styles.kicker}>How long this takes</div>
        <h2 className={styles.h2}>You are about {TOTAL_MINUTES} minutes away.</h2>
        <p className={styles.lede}>
          Not a course you have to finish over months. {TOTAL_JOURNEYS} short experiences,
          in order, each one building on the last. You can do it in a sitting.
        </p>

        <div className={styles.mapMeta}>
          <div className={styles.mapStat}>
            <b>{TOTAL_JOURNEYS}</b>
            <span>experiences</span>
          </div>
          <div className={styles.mapStat}>
            <b>~{TOTAL_MINUTES}</b>
            <span>minutes total</span>
          </div>
          <div className={styles.mapStat}>
            <b>0</b>
            <span>textbooks</span>
          </div>
        </div>

        <ol className={styles.map}>
          {JOURNEYS.map((j, i) => (
            <li key={j.id} className={styles.stop}>
              <span className={styles.stopDot} style={{ background: journeyColorVar(j) }} />
              <span className={styles.stopNum}>{String(i + 1).padStart(2, '0')}</span>
              <span className={styles.stopName}>{j.shortTitle}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------- Section 18 ---------------- */}
      <section className={styles.sec}>
        <div className={styles.kicker}>One question</div>
        <h2 className={styles.h2}>You need {inr(LOAN_PRINCIPAL)}. Which loan do you take?</h2>
        <p className={styles.lede}>Pick one. No wrong answer yet — just pick the one that looks better.</p>

        <div className={styles.opts} role="group" aria-label="Choose a loan">
          <button
            type="button"
            className={`${styles.opt}${picked === 'short' ? ' ' + styles.picked : ''}`}
            onClick={() => setPicked('short')}
          >
            <div className={styles.optLabel}>OPTION A</div>
            <div className={styles.optEmi}>{inr(short.emi)}<span style={{ fontSize: 14 }}>/mo</span></div>
            <div className={styles.optTerm}>for {SHORT_YEARS} years</div>
          </button>
          <button
            type="button"
            className={`${styles.opt}${picked === 'long' ? ' ' + styles.picked : ''}`}
            onClick={() => setPicked('long')}
          >
            <div className={styles.optLabel}>OPTION B</div>
            <div className={styles.optEmi}>{inr(long.emi)}<span style={{ fontSize: 14 }}>/mo</span></div>
            <div className={styles.optTerm}>for {LONG_YEARS} years</div>
          </button>
        </div>

        {picked && (
          <div className={styles.reveal}>
            <div className={styles.revealTitle}>
              {picked === 'long'
                ? 'Option B is easier every month — and costs more in the end.'
                : 'Option A is the harder monthly payment, and the cheaper loan.'}
            </div>
            <div className={styles.revealRow}>
              <span>Option A — {inr(short.emi)}/mo for {SHORT_YEARS} years</span>
              <b>{inr(short.totalPaid)}</b>
            </div>
            <div className={styles.revealRow}>
              <span>Option B — {inr(long.emi)}/mo for {LONG_YEARS} years</span>
              <b>{inr(long.totalPaid)}</b>
            </div>
            <p className={styles.revealPunch}>
              Same {inr(LOAN_PRINCIPAL)} borrowed. Option B costs <b>{inr(extra)} more</b> —
              because you pay interest for three extra years. The monthly number is not the price.
            </p>
            <p className={styles.note}>
              Illustrative example at {LOAN_RATE}% a year, calculated with the same
              formula a lender uses. Real offers vary.
            </p>
            <div style={{ marginTop: 18 }}>
              <button className="btn" style={{ maxWidth: 300 }} onClick={() => router.push('/learn/credit-debt')}>
                See how loans really work →
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ---------------- Section 19 ---------------- */}
      <section className={styles.sec}>
        <div className={styles.kicker}>Myth vs reality</div>
        <h2 className={styles.h2}>Four things most people believe.</h2>
        <p className={styles.lede}>Tap each one to turn it over.</p>

        <div className={styles.myths}>
          {MYTHS.map((m, i) => {
            const on = flipped.has(i);
            return (
              <button
                key={m.myth}
                type="button"
                className={styles.myth}
                aria-pressed={on}
                onClick={() => toggleMyth(i)}
              >
                <div className={styles.mythTag}>{on ? 'Reality' : 'Myth'}</div>
                <div className={styles.mythText}>{on ? m.reality : m.myth}</div>
                <div className={styles.mythFlip}>{on ? 'Tap to flip back' : 'Tap to reveal'}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ---------------- Close ---------------- */}
      <section className={styles.close}>
        <div className={styles.closeInner}>
          <h2 className={styles.closeH}>You will not be an expert. You will not be guessing either.</h2>
          <p className={styles.closeP}>
            {TOTAL_JOURNEYS} experiences. About {TOTAL_MINUTES} minutes. You make the decisions
            and watch what they cost — before it is your actual money.
          </p>
          <button className={styles.closeBtn} onClick={go}>Start your MoneyOrbit</button>
          <div className={styles.closeSub}>No payment. Nothing to install.</div>
        </div>
      </section>
    </div>
  );
}
