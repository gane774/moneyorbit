'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { resolveStartDestination } from '@/lib/startDestination';
import { fireCrossedCues, type ScrollCue } from '@/lib/audio/scrollCues';
import type { AudioEvent } from '@/lib/audio/events';
import { JOURNEYS, journeyColorVar } from '@/content/journeys';
import styles from './FlowOfMoney.module.css';

/**
 * Section 3, "Flow of Money", rebuilt (Oct 2026).
 *
 * Same idea as the original: one scroll-scrubbed walk through all eleven
 * journeys, each with a small working demonstration, ending on the CTA.
 * The wireframe map is replaced by chapters: a headline on the left and a
 * live, real-numbers visual on the right, with a progress rail in the
 * journeys' own colours. Every number shown is computed here, not typed in.
 *
 * Mechanics kept from the original on purpose:
 *  - progress = scrolled / scrollable within this section (sticky stage),
 *    eased toward the target each frame;
 *  - audio cues fire on crossing the same named milestones;
 *  - GSAP is imported lazily so it never blocks first paint.
 */

/* ---------- numbers the visuals draw (computed once, module level) ---------- */

const INFL_ITEMS = [
  { name: 'Cutting chai', from: 10, to: 15 },
  { name: 'Bus ticket', from: 15, to: 25 },
  { name: 'Notebook', from: 30, to: 45 },
  { name: 'Samosa', from: 12, to: 20 },
];
const INFL_FROM = INFL_ITEMS.reduce((s, i) => s + i.from, 0);
const INFL_TO = INFL_ITEMS.reduce((s, i) => s + i.to, 0);

const SALARY = 30_000;

/* Credit card at 3.5% a month, paying the larger of 5% or ₹500. */
const CARD = (() => {
  let bal = 20_000, interest = 0;
  const pts: number[] = [bal];
  for (let m = 1; m <= 60; m++) {
    const i = bal * 0.035;
    interest += i;
    bal = Math.max(0, bal + i - Math.max(bal * 0.05, 500));
    pts.push(bal);
  }
  return { pts, interest: Math.round(interest), left: Math.round(bal) };
})();

/* ₹10,000 compounding at 12% for 30 years, against simple interest. */
const COMP = Array.from({ length: 31 }, (_, y) => 10_000 * Math.pow(1.12, y));
const SIMPLE = Array.from({ length: 31 }, (_, y) => 10_000 * (1 + 0.12 * y));

/* A deterministic bumpy index path (illustrative): quarterly steps with
   real swings and one crash that takes it below savings for a while,
   before it ends ahead. Against a flat savings path. */
const MARKET = (() => {
  let s = 11, v = 100;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: 41 }, (_, i) => {
    if (i) v *= 1 + 0.034 + (rnd() - 0.5) * 0.18;
    if (i === 13) v *= 0.76;
    return v;
  });
})();
const SAVINGS = Array.from({ length: 41 }, (_, i) => 100 * Math.pow(1.009, i));

const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

function linePath(vals: number[], x0: number, x1: number, y0: number, y1: number, max: number) {
  return vals.map((v, i) => {
    const x = x0 + ((x1 - x0) * i) / (vals.length - 1);
    const y = y0 - ((y0 - y1) * v) / max;
    return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join('');
}

/* ---------- the chapter copy, in journey order ---------- */

const CHAPTERS: { slug: string; head: string; line: string; cue: AudioEvent }[] = [
  { slug: 'inflation', head: 'Same ₹100. It buys less every year.', line: 'Prices creep up, so the note in your pocket quietly covers less.', cue: 'warning' },
  { slug: 'credit-score', head: 'A number that remembers every payment.', line: 'On time, it climbs slowly. Miss one, and it drops fast.', cue: 'branch' },
  { slug: 'budgeting', head: 'Decide where it goes before it goes.', line: 'Split the month first, spend second.', cue: 'node_arrive' },
  { slug: 'investments', head: 'More return means bigger swings.', line: 'Every place money can grow sits somewhere on this line.', cue: 'saving' },
  { slug: 'banking', head: 'One tap, two banks, two seconds.', line: 'This is the route a UPI payment actually takes.', cue: 'payment' },
  { slug: 'credit-debt', head: 'The minimum payment is a trap.', line: 'Pay only the minimum and the balance barely moves.', cue: 'credit' },
  { slug: 'money-math', head: 'Growth on top of growth.', line: 'Slow for years, then suddenly steep. That is compounding.', cue: 'compounding' },
  { slug: 'investing-basics', head: 'Bumpy, then ahead.', line: 'Markets swing along the way. Time is what smooths them out.', cue: 'investing' },
  { slug: 'destinations', head: 'Every rupee ends up somewhere.', line: 'Spend, save, invest, lend or give. You choose the split.', cue: 'node_arrive' },
  { slug: 'planning', head: 'Give a goal a date.', line: 'Then the monthly number works itself out.', cue: 'node_arrive' },
  { slug: 'final-challenge', head: 'Now run a whole life.', line: 'A salary, surprises and choices, year after year.', cue: 'node_arrive' },
];

/* Stage geometry (SVG units). */
const W = 560, H = 420;

export default function FlowOfMoney({ onStart }: { onStart?: () => void }) {
  const router = useRouter();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  const start = onStart ?? (() => router.push(resolveStartDestination().href));

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    if (mq.matches) return;

    let raf = 0, killed = false, cleanup = () => {};
    let target = 0, current = 0, prevProgress = 0;

    (async () => {
      const { gsap } = await import('gsap');
      const root = sectionRef.current;
      if (killed || !root) return;
      const q = gsap.utils.selector(root);
      /* GSAP cannot interpolate var(--x), so colours are resolved to real values. */
      const css = getComputedStyle(root);
      const cv = (name: string) => css.getPropertyValue(name).trim();
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });

      /* Counter helper: tweens a number into an element's text. */
      const count = (sel: string, from: number, to: number, at: number | string, dur: number, fmt = inr) => {
        const el = q(sel)[0] as Element | undefined;
        if (!el) return;
        const o = { v: from };
        el.textContent = fmt(from);
        tl.to(o, { v: to, duration: dur, ease: 'none', onUpdate: () => { el.textContent = fmt(o.v); } }, at);
      };
      const draw = (sel: string) => q(sel).forEach((p) => {
        const len = (p as unknown as SVGPathElement).getTotalLength?.() ?? 1000;
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });

      /* ---------- initial state ---------- */
      gsap.set(q('[data-ch]'), { autoAlpha: 0, y: 40 });
      gsap.set(q('[data-scene]'), { autoAlpha: 0, scale: 0.96, transformOrigin: '50% 50%' });
      gsap.set(q('[data-rail-fill]'), { scaleX: 0, transformOrigin: 'left center' });
      gsap.set(q('[data-chrome]'), { autoAlpha: 0 });
      gsap.set(q('[data-finale] > *'), { autoAlpha: 0, y: 30 });
      draw('[data-draw]');
      gsap.set(q('[data-rdot]'), { scale: 0.4, transformOrigin: '50% 50%' });
      gsap.set(q('[data-udone]'), { scale: 0.6, transformOrigin: '50% 50%' });

      /* ---------- intro ---------- */
      tl.addLabel('intro', 0)
        .fromTo(q('[data-coin]'), { scale: 0.4, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1, ease: 'back.out(1.6)' }, 0)
        .fromTo(q('[data-intro-a]'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.2)
        .fromTo(q('[data-intro-b]'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 1.1)
        .to(q('[data-intro]'), { autoAlpha: 0, y: -60, duration: 0.8 }, 2.4)
        .to(q('[data-coin]'), { scale: 0.18, x: () => -window.innerWidth * 0.36, y: () => window.innerHeight * 0.4, autoAlpha: 0, duration: 0.9 }, 2.4)
        .to(q('[data-chrome]'), { autoAlpha: 1, duration: 0.6 }, 2.8);

      /* ---------- chapters ---------- */
      const SPAN = 3.4; // timeline units per chapter
      let t = 3.2;
      CHAPTERS.forEach((ch, i) => {
        const label = `ch${i}`;
        tl.addLabel(label, t);
        const chEl = q(`[data-ch="${i}"]`), sc = q(`[data-scene="${i}"]`);
        tl.to(chEl, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, t)
          .to(sc, { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'power3.out' }, t + 0.1)
          .to(q(`[data-rail-fill="${i}"]`), { scaleX: 1, duration: SPAN, ease: 'none' }, t);
        if (i < CHAPTERS.length - 1) {
          tl.to(chEl, { autoAlpha: 0, y: -40, duration: 0.5, ease: 'power2.in' }, t + SPAN - 0.5)
            .to(sc, { autoAlpha: 0, scale: 1.03, duration: 0.5, ease: 'power2.in' }, t + SPAN - 0.5);
        }
        const a = t + 0.6; // action starts once the scene has landed

        switch (ch.slug) {
          case 'inflation': {
            count('[data-yr]', 2015, 2025, a, 1.8, (v) => String(Math.round(v)));
            INFL_ITEMS.forEach((it, k) => count(`[data-ip="${k}"]`, it.from, it.to, a, 1.8));
            count('[data-itot]', INFL_FROM, INFL_TO, a, 1.8);
            tl.fromTo(q('[data-ibar]'), { attr: { width: (INFL_FROM / 120) * 440 } }, { attr: { width: (INFL_TO / 120) * 440 }, duration: 1.8, ease: 'none' }, a)
              // The moment the basket passes ₹100 (computed, not eyeballed).
              .to(q('[data-ibar]'), { fill: cv('--danger-lift'), duration: 0.15 }, a + 1.8 * ((100 - INFL_FROM) / (INFL_TO - INFL_FROM)))
              .to(q('[data-iover]'), { autoAlpha: 1, duration: 0.3 }, a + 1.8 * ((100 - INFL_FROM) / (INFL_TO - INFL_FROM)) + 0.1);
            break;
          }
          case 'credit-score': {
            const seq = [650, 668, 684, 699, 712, 724, 735, 746, 688, 697, 706, 715];
            const ang = (s: number) => ((s - 300) / 600) * 180 - 90;
            const arcLen = Math.PI * 150;
            seq.forEach((s, k) => {
              const at = a + k * 0.16;
              const bad = k === 8;
              tl.to(q(`[data-cm="${k}"]`), { fill: bad ? cv('--danger-lift') : cv('--good-lift'), scale: 1.25, duration: 0.12, transformOrigin: '50% 50%' }, at)
                .to(q(`[data-cm="${k}"]`), { scale: 1, duration: 0.12 }, at + 0.12)
                .to(q('[data-needle]'), { rotation: ang(s), svgOrigin: '280 260', duration: 0.16, ease: bad ? 'power3.in' : 'power1.out' }, at)
                .to(q('[data-garc]'), { strokeDashoffset: arcLen * (1 - (s - 300) / 600), stroke: bad ? cv('--danger-lift') : cv('--n20'), duration: 0.16 }, at);
              if (k === 9) tl.to(q('[data-garc]'), { stroke: cv('--n20'), duration: 0.3 }, at);
            });
            gsap.set(q('[data-needle]'), { rotation: ang(650), svgOrigin: '280 260' });
            gsap.set(q('[data-garc]'), { strokeDasharray: arcLen, strokeDashoffset: arcLen * (1 - 350 / 600) });
            count('[data-score]', 650, 746, a, 8 * 0.16, (v) => String(Math.round(v)));
            count('[data-score]', 746, 688, a + 8 * 0.16, 0.16, (v) => String(Math.round(v)));
            count('[data-score]', 688, 715, a + 9 * 0.16, 3 * 0.16, (v) => String(Math.round(v)));
            tl.to(q('[data-miss]'), { autoAlpha: 1, duration: 0.2 }, a + 8 * 0.16);
            break;
          }
          case 'budgeting': {
            tl.to(q('[data-bseg="0"]'), { attr: { x: 40, width: 236 }, duration: 0.8 }, a)
              .to(q('[data-bseg="1"]'), { attr: { x: 284, width: 140 }, duration: 0.8 }, a)
              .to(q('[data-bseg="2"]'), { attr: { x: 432, width: 88 }, duration: 0.8 }, a)
              .to(q('[data-blab]'), { autoAlpha: 1, y: 0, stagger: 0.12, duration: 0.4 }, a + 0.6);
            count('[data-bv="0"]', 0, SALARY * 0.5, a + 0.6, 0.8);
            count('[data-bv="1"]', 0, SALARY * 0.3, a + 0.7, 0.8);
            count('[data-bv="2"]', 0, SALARY * 0.2, a + 0.8, 0.8);
            break;
          }
          case 'investments': {
            tl.to(q('[data-rtrend]'), { strokeDashoffset: 0, duration: 1, ease: 'none' }, a)
              .to(q('[data-rdot]'), { autoAlpha: 1, scale: 1, stagger: 0.22, duration: 0.3, ease: 'back.out(2)' }, a + 0.2);
            break;
          }
          case 'banking': {
            tl.to(q('[data-upath]'), { strokeDashoffset: 0, duration: 1.4, ease: 'none' }, a)
              .to(q('[data-upkt]'), { autoAlpha: 1, duration: 0.1 }, a);
            [0, 1, 2, 3].forEach((k) => tl.to(q(`[data-unode="${k}"]`), { stroke: cv('--n200'), fill: 'rgba(229,163,43,.14)', duration: 0.2 }, a + k * 0.45));
            tl.to(q('[data-upkt]'), { attr: { cx: 470 }, duration: 1.4, ease: 'none' }, a)
              .to(q('[data-upkt]'), { autoAlpha: 0, duration: 0.1 }, a + 1.4)
              .to(q('[data-udone]'), { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, a + 1.45);
            break;
          }
          case 'credit-debt': {
            tl.to(q('[data-cline]'), { strokeDashoffset: 0, duration: 2, ease: 'none' }, a);
            count('[data-cint]', 0, CARD.interest, a, 2);
            count('[data-cleft]', 20_000, CARD.left, a, 2);
            break;
          }
          case 'money-math': {
            /* One tween drives the year; the rupee value is derived from it,
               so the counter always matches the tip of the curve. */
            tl.to(q('[data-mcomp]'), { strokeDashoffset: 0, duration: 2, ease: 'none' }, a)
              .to(q('[data-msimp]'), { strokeDashoffset: 0, duration: 2, ease: 'none' }, a);
            const yrEl = q('[data-myr]')[0], valEl = q('[data-mval]')[0];
            const o = { y: 0 };
            tl.to(o, { y: 30, duration: 2, ease: 'none', onUpdate: () => {
              yrEl.textContent = `Year ${Math.round(o.y)}`;
              valEl.textContent = inr(10_000 * Math.pow(1.12, Math.round(o.y)));
            } }, a);
            break;
          }
          case 'investing-basics': {
            tl.to(q('[data-ksav]'), { strokeDashoffset: 0, duration: 2, ease: 'none' }, a)
              .to(q('[data-kmkt]'), { strokeDashoffset: 0, duration: 2, ease: 'none' }, a)
              .to(q('[data-kend]'), { autoAlpha: 1, duration: 0.3 }, a + 1.9);
            break;
          }
          case 'destinations': {
            tl.to(q('[data-dflow]'), { strokeDashoffset: 0, stagger: 0.15, duration: 0.9 }, a)
              .to(q('[data-dlab]'), { autoAlpha: 1, x: 0, stagger: 0.15, duration: 0.4 }, a + 0.5);
            break;
          }
          case 'planning': {
            tl.to(q('[data-paxis]'), { strokeDashoffset: 0, duration: 0.6, ease: 'none' }, a);
            [0, 1, 2].forEach((k) => tl.to(q(`[data-goal="${k}"]`), { autoAlpha: 1, y: 0, duration: 0.45, ease: 'back.out(1.6)' }, a + 0.5 + k * 0.4));
            break;
          }
          case 'final-challenge': {
            tl.to(q('[data-lline]'), { strokeDashoffset: 0, duration: 2, ease: 'none' }, a);
            [0, 1, 2].forEach((k) => tl.to(q(`[data-lev="${k}"]`), { autoAlpha: 1, y: 0, duration: 0.3 }, a + 0.35 + k * 0.6));
            break;
          }
        }
        t += SPAN;
      });

      /* ---------- finale ---------- */
      tl.addLabel('finale', t)
        .to(q(`[data-ch="${CHAPTERS.length - 1}"], [data-scene="${CHAPTERS.length - 1}"]`), { autoAlpha: 0, y: -30, duration: 0.6 }, t)
        .to(q('[data-stage]'), { autoAlpha: 0, scale: 0.97, duration: 0.6 }, t)
        .to(q('[data-finale] > *'), { autoAlpha: 1, y: 0, stagger: 0.15, duration: 0.7, ease: 'power3.out' }, t + 0.4)
        .set(q('[data-finale]'), { pointerEvents: 'auto' }, t + 0.8)
        .to({}, { duration: 1.2 }, t + 1.2); // hold on the CTA

      const duration = tl.duration();
      const at = (label: string) => (tl.labels[label] ?? 0) / duration;
      const cues: ScrollCue[] = [
        { progress: 0.001, event: 'flow_start' as AudioEvent },
        ...CHAPTERS.map((ch, i) => ({ progress: at(`ch${i}`), event: ch.cue })),
        { progress: at('finale'), event: 'finale' as AudioEvent },
      ].sort((x, y) => x.progress - y.progress);

      const onScroll = () => {
        const el = sectionRef.current;
        if (!el) return;
        const scrollable = el.offsetHeight - window.innerHeight;
        if (scrollable <= 0) return;
        target = Math.max(0, Math.min(1, -el.getBoundingClientRect().top / scrollable));
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      const ro = new ResizeObserver(onScroll);
      ro.observe(root);
      onScroll();

      const render = () => {
        const diff = target - current;
        if (Math.abs(diff) > 0.00005) {
          current += diff * 0.1;
          tl.progress(current);
        }
        fireCrossedCues(prevProgress, current, cues);
        prevProgress = current;
        raf = requestAnimationFrame(render);
      };
      render();

      cleanup = () => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
        ro.disconnect();
        cancelAnimationFrame(raf);
        tl.kill();
      };
    })();

    return () => { killed = true; cleanup(); };
  }, []);

  if (reduced) {
    return (
      <section className={styles.reducedWrap}>
        <h2 className={styles.reducedTitle}>Now you see how money moves.</h2>
        <p className={styles.reducedBody}>Eleven ideas, one path. Every choice changes where your money goes.</p>
        <ol className={styles.reducedList}>
          {CHAPTERS.map((ch, i) => (
            <li key={ch.slug}><span style={{ color: journeyColorVar(JOURNEYS[i]) }}>{String(i + 1).padStart(2, '0')}</span> {ch.head}</li>
          ))}
        </ol>
        <button className={styles.cta} onClick={start}>Start your first lesson</button>
      </section>
    );
  }

  const mono = { fontFamily: 'var(--font-mono)' } as const;
  const disp = { fontFamily: 'var(--font-display)' } as const;

  return (
    <section ref={sectionRef} className={styles.section} aria-label="How money moves, in eleven steps">
      <div className={styles.sticky}>
        {/* ---------- intro ---------- */}
        <div className={styles.intro} data-intro>
          <h2 className={styles.introA} data-intro-a>Money is everywhere.</h2>
          <p className={styles.introB} data-intro-b>But where does it actually go?</p>
        </div>
        <svg className={styles.coin} data-coin viewBox="0 0 200 200" aria-hidden="true">
          <defs>
            <radialGradient id="fm-coin" cx="38%" cy="32%" r="75%">
              <stop offset="0" stopColor="#F6CF76" /><stop offset="1" stopColor="#B87A14" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="92" fill="url(#fm-coin)" />
          <circle cx="100" cy="100" r="78" fill="none" stroke="rgba(80,48,4,.35)" strokeWidth="4" />
          <text x="100" y="128" textAnchor="middle" fontSize="92" fontWeight="800" fill="rgba(80,48,4,.6)" style={disp}>₹</text>
        </svg>

        {/* ---------- chapter copy ---------- */}
        <div className={styles.copy} data-chrome>
          {CHAPTERS.map((ch, i) => {
            const j = JOURNEYS[i];
            return (
              <article key={ch.slug} className={styles.ch} data-ch={i}>
                <div className={styles.chKicker} style={{ color: journeyColorVar(j) }}>
                  {String(i + 1).padStart(2, '0')} · {j.shortTitle}
                </div>
                <h3 className={styles.chHead}>{ch.head}</h3>
                <p className={styles.chLine}>{ch.line}</p>
              </article>
            );
          })}
        </div>

        {/* ---------- visual stage ---------- */}
        <div className={styles.stageWrap} data-chrome data-stage>
          <svg className={styles.stage} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
            {/* 1. Inflation */}
            <g data-scene="0">
              <text x="40" y="58" fontSize="13" fill="var(--paper-45)" style={mono}>PRICES IN</text>
              <text x="40" y="98" fontSize="40" fontWeight="500" fill="var(--paper)" style={mono} data-yr>2015</text>
              {INFL_ITEMS.map((it, k) => (
                <g key={it.name} transform={`translate(0 ${140 + k * 44})`}>
                  <line x1="40" x2="520" y1="18" y2="18" stroke="var(--paper-18)" />
                  <text x="40" y="8" fontSize="17" fill="var(--paper)">{it.name}</text>
                  <text x="520" y="8" fontSize="17" textAnchor="end" fill="var(--paper)" style={mono} data-ip={k}>{inr(it.from)}</text>
                </g>
              ))}
              <text x="40" y="346" fontSize="13" fill="var(--paper-45)" style={mono}>BASKET</text>
              <text x="520" y="346" fontSize="13" textAnchor="end" fill="var(--paper)" style={mono} data-itot>{inr(INFL_FROM)}</text>
              <rect x="40" y="358" width="440" height="14" rx="7" fill="rgba(251,251,248,.08)" />
              <rect x="40" y="358" height="14" rx="7" fill="var(--n10)" data-ibar width={(INFL_FROM / 120) * 440} />
              <line x1={40 + (100 / 120) * 440} x2={40 + (100 / 120) * 440} y1="350" y2="380" stroke="var(--paper)" strokeWidth="2" />
              <text x={40 + (100 / 120) * 440} y="398" fontSize="12" textAnchor="middle" fill="var(--paper-60)" style={mono}>your ₹100</text>
              <text x="40" y="398" fontSize="12" fill="var(--danger-lift)" style={mono} data-iover opacity="0">₹100 no longer covers it</text>
            </g>

            {/* 2. Credit score */}
            <g data-scene="1">
              <path d="M130,260 A150,150 0 0 1 430,260" fill="none" stroke="rgba(251,251,248,.1)" strokeWidth="18" strokeLinecap="round" />
              <path d="M130,260 A150,150 0 0 1 430,260" fill="none" stroke="var(--n20)" strokeWidth="18" strokeLinecap="round" data-garc />
              <g data-needle><line x1="280" y1="132" x2="280" y2="98" stroke="var(--paper)" strokeWidth="4" strokeLinecap="round" /></g>
              <text x="122" y="290" fontSize="12" textAnchor="middle" fill="var(--paper-45)" style={mono}>300</text>
              <text x="438" y="290" fontSize="12" textAnchor="middle" fill="var(--paper-45)" style={mono}>900</text>
              <text x="280" y="250" fontSize="52" fontWeight="500" textAnchor="middle" fill="var(--paper)" style={mono} data-score>650</text>
              {Array.from({ length: 12 }, (_, k) => (
                <circle key={k} cx={104 + k * 32} cy="340" r="8" fill="rgba(251,251,248,.12)" data-cm={k} />
              ))}
              <text x="104" y="374" fontSize="12" fill="var(--paper-45)" style={mono}>12 months of payments</text>
              <text x="456" y="374" fontSize="12" textAnchor="end" fill="var(--danger-lift)" style={mono} data-miss opacity="0">missed: −58</text>
            </g>

            {/* 3. Budgeting */}
            <g data-scene="2">
              <text x="40" y="70" fontSize="13" fill="var(--paper-45)" style={mono}>MONTHLY INCOME</text>
              <text x="40" y="112" fontSize="40" fontWeight="500" fill="var(--paper)" style={mono}>{inr(SALARY)}</text>
              <rect data-bseg="0" x="40" y="170" width="480" height="64" rx="10" fill="var(--n50)" />
              <rect data-bseg="1" x="40" y="170" width="0" height="64" rx="10" fill="var(--n200)" />
              <rect data-bseg="2" x="40" y="170" width="0" height="64" rx="10" fill="var(--good-lift)" />
              {[
                { x: 40, t: 'Needs', s: 'rent, food, travel' },
                { x: 284, t: 'Wants', s: 'outings, shopping' },
                { x: 432, t: 'Savings', s: 'first, not last' },
              ].map((l, k) => (
                <g key={l.t} data-blab opacity="0" transform="translate(0 10)">
                  <text x={l.x} y="276" fontSize="13" fill="var(--paper-60)" style={mono}>{l.t.toUpperCase()}</text>
                  <text x={l.x} y="306" fontSize="22" fontWeight="500" fill="var(--paper)" style={mono} data-bv={k}>₹0</text>
                  <text x={l.x} y="330" fontSize="13" fill="var(--paper-45)">{l.s}</text>
                </g>
              ))}
            </g>

            {/* 4. Investments: risk vs return */}
            <g data-scene="3">
              <line x1="70" y1="360" x2="520" y2="360" stroke="var(--paper-18)" />
              <line x1="70" y1="60" x2="70" y2="360" stroke="var(--paper-18)" />
              <text x="520" y="390" fontSize="12" textAnchor="end" fill="var(--paper-45)" style={mono}>MORE UPS AND DOWNS →</text>
              <text x="58" y="70" fontSize="12" textAnchor="end" fill="var(--paper-45)" style={mono} transform="rotate(-90 58 70)">RETURN →</text>
              <path d="M90,340 C200,300 330,200 500,80" fill="none" stroke="var(--n100)" strokeWidth="2" strokeDasharray="6 6" opacity=".6" data-rtrend data-draw />
              {[
                { x: 110, y: 330, t: 'Savings account' },
                { x: 190, y: 300, t: 'Fixed deposit' },
                { x: 280, y: 250, t: 'Gold' },
                { x: 370, y: 180, t: 'Index fund' },
                { x: 470, y: 100, t: 'Single stocks' },
              ].map((d) => (
                <g key={d.t} data-rdot opacity="0">
                  <circle cx={d.x} cy={d.y} r="9" fill="var(--n100)" />
                  <circle cx={d.x} cy={d.y} r="16" fill="none" stroke="var(--n100)" opacity=".35" />
                  <text x={d.x + (d.x > 400 ? -22 : 22)} y={d.y + 5} fontSize="14" textAnchor={d.x > 400 ? 'end' : 'start'} fill="var(--paper)">{d.t}</text>
                </g>
              ))}
            </g>

            {/* 5. Banking: UPI route */}
            <g data-scene="4">
              <rect x="40" y="70" width="480" height="76" rx="14" fill="rgba(251,251,248,.05)" stroke="var(--paper-18)" />
              <text x="64" y="102" fontSize="13" fill="var(--paper-45)" style={mono}>PAY</text>
              <text x="64" y="128" fontSize="20" fill="var(--paper)">Chai Point</text>
              <text x="496" y="124" fontSize="28" fontWeight="500" textAnchor="end" fill="var(--paper)" style={mono}>₹250</text>
              <path d="M90,250 L470,250" stroke="rgba(251,251,248,.12)" strokeWidth="2" />
              <path d="M90,250 L470,250" stroke="var(--n200)" strokeWidth="2" data-upath data-draw />
              {['Your app', 'Your bank', 'UPI switch', 'Their bank'].map((n, k) => {
                const x = 90 + k * (380 / 3);
                return (
                  <g key={n}>
                    <circle cx={x} cy="250" r="16" fill="#16181d" stroke="var(--paper-18)" strokeWidth="2" data-unode={k} />
                    <text x={x} y="296" fontSize="13" textAnchor="middle" fill="var(--paper-60)">{n}</text>
                  </g>
                );
              })}
              <circle cx="90" cy="250" r="6" fill="var(--paper)" data-upkt opacity="0" />
              <g data-udone opacity="0">
                <rect x="190" y="326" width="180" height="46" rx="23" fill="rgba(110,201,152,.14)" stroke="var(--good-lift)" />
                <text x="280" y="355" fontSize="15" textAnchor="middle" fill="var(--good-lift)" style={mono}>✓ Paid · 2 sec</text>
              </g>
            </g>

            {/* 6. Credit & debt: minimum payments */}
            <g data-scene="5">
              <text x="40" y="58" fontSize="13" fill="var(--paper-45)" style={mono}>₹20,000 ON A CARD · MINIMUM ONLY</text>
              <line x1="40" y1="300" x2="520" y2="300" stroke="var(--paper-18)" />
              <path d={linePath(CARD.pts, 40, 520, 300, 90, 20_000)} fill="none" stroke="var(--n2000)" strokeWidth="3" data-cline data-draw />
              <text x="40" y="322" fontSize="12" fill="var(--paper-45)" style={mono}>month 0</text>
              <text x="520" y="322" fontSize="12" textAnchor="end" fill="var(--paper-45)" style={mono}>month 60</text>
              <text x="40" y="364" fontSize="13" fill="var(--paper-60)" style={mono}>INTEREST PAID</text>
              <text x="40" y="394" fontSize="24" fontWeight="500" fill="var(--danger-lift)" style={mono} data-cint>₹0</text>
              <text x="520" y="364" fontSize="13" textAnchor="end" fill="var(--paper-60)" style={mono}>STILL OWED</text>
              <text x="520" y="394" fontSize="24" fontWeight="500" textAnchor="end" fill="var(--paper)" style={mono} data-cleft>₹20,000</text>
            </g>

            {/* 7. Money math: compounding */}
            <g data-scene="6">
              <text x="40" y="58" fontSize="13" fill="var(--paper-45)" style={mono} data-myr>Year 0</text>
              <text x="40" y="98" fontSize="40" fontWeight="500" fill="var(--paper)" style={mono} data-mval>₹10,000</text>
              <line x1="40" y1="370" x2="520" y2="370" stroke="var(--paper-18)" />
              <path d={linePath(SIMPLE, 40, 520, 370, 130, COMP[30])} fill="none" stroke="var(--paper-45)" strokeWidth="2" strokeDasharray="4 6" data-msimp data-draw />
              <path d={linePath(COMP, 40, 520, 370, 130, COMP[30])} fill="none" stroke="var(--good-lift)" strokeWidth="3.5" data-mcomp data-draw />
              <text x="500" y="128" fontSize="12" textAnchor="end" fill="var(--good-lift)" style={mono}>interest on interest</text>
              <text x="520" y="318" fontSize="12" textAnchor="end" fill="var(--paper-45)" style={mono}>interest on ₹10,000 only</text>
              <text x="40" y="398" fontSize="12" fill="var(--paper-45)" style={mono}>12% a year, 30 years</text>
            </g>

            {/* 8. Investing basics */}
            <g data-scene="7">
              <line x1="40" y1="350" x2="520" y2="350" stroke="var(--paper-18)" />
              <path d={linePath(MARKET, 40, 520, 350, 70, Math.max(...MARKET) * 1.05)} fill="none" stroke="var(--paper)" strokeWidth="2.5" strokeLinejoin="round" data-kmkt data-draw />
              <path d={linePath(SAVINGS, 40, 520, 350, 70, Math.max(...MARKET) * 1.05)} fill="none" stroke="var(--good-lift)" strokeWidth="2" data-ksav data-draw />
              <g data-kend opacity="0">
                <text x="520" y={350 - ((350 - 70) * MARKET[40]) / (Math.max(...MARKET) * 1.05) - 14} fontSize="14" textAnchor="end" fill="var(--paper)">Index fund</text>
                <text x="520" y={350 - ((350 - 70) * SAVINGS[40]) / (Math.max(...MARKET) * 1.05) - 12} fontSize="14" textAnchor="end" fill="var(--good-lift)">Savings account</text>
              </g>
              <text x="40" y="378" fontSize="12" fill="var(--paper-45)" style={mono}>10 years, illustrative</text>
            </g>

            {/* 9. Destinations: flow split */}
            <g data-scene="8">
              <circle cx="90" cy="210" r="34" fill="url(#fm-coin)" />
              <text x="90" y="223" fontSize="34" fontWeight="800" textAnchor="middle" fill="rgba(80,48,4,.6)" style={disp}>₹</text>
              {[
                { t: 'Spend', y: 70, w: 22, c: 'var(--n50)' },
                { t: 'Save', y: 140, w: 12, c: 'var(--good-lift)' },
                { t: 'Invest', y: 210, w: 14, c: 'var(--n100)' },
                { t: 'Lend', y: 280, w: 6, c: 'var(--n200)' },
                { t: 'Give', y: 350, w: 5, c: 'var(--n2000)' },
              ].map((d) => (
                <g key={d.t}>
                  <path d={`M124,210 C260,210 300,${d.y} 410,${d.y}`} fill="none" stroke={d.c} strokeWidth={d.w} strokeLinecap="round" opacity=".85" data-dflow data-draw />
                  <text x="430" y={d.y + 6} fontSize="17" fill="var(--paper)" data-dlab opacity="0" transform="translate(-10 0)">{d.t}</text>
                </g>
              ))}
            </g>

            {/* 10. Planning */}
            <g data-scene="9">
              <path d="M40,330 L520,330" stroke="var(--paper-45)" strokeWidth="2" data-paxis data-draw />
              <text x="40" y="358" fontSize="12" fill="var(--paper-45)" style={mono}>now</text>
              <text x="520" y="358" fontSize="12" textAnchor="end" fill="var(--paper-45)" style={mono}>6 years</text>
              {[
                { t: 'Phone', when: '6 months', amt: 15_000, months: 6, x: 80 },
                { t: 'Laptop', when: '2 years', amt: 60_000, months: 24, x: 200 },
                { t: 'College fund', when: '6 years', amt: 300_000, months: 72, x: 360 },
              ].map((g, k) => {
                const mx = 40 + (480 * g.months) / 72; // true position on the 6-year axis
                const cx = [40, 205, 370][k], cy = 196 - k * 62;
                return (
                  <g key={g.t} data-goal={k} opacity="0" transform="translate(0 20)">
                    <line x1={mx} x2={mx} y1={cy + 104} y2="330" stroke="var(--n100)" strokeDasharray="3 4" />
                    <circle cx={mx} cy="330" r="5" fill="var(--n100)" />
                    <rect x={cx} y={cy} width="150" height="104" rx="12" fill="#1b1d22" stroke="var(--paper-18)" />
                    <text x={cx + 16} y={cy + 26} fontSize="12" fill="var(--n100)" style={mono}>{g.when.toUpperCase()}</text>
                    <text x={cx + 16} y={cy + 52} fontSize="17" fill="var(--paper)">{g.t}</text>
                    <text x={cx + 16} y={cy + 86} fontSize="15" fill="var(--paper)" style={mono}>{inr(g.amt / g.months)}/mo</text>
                  </g>
                );
              })}
            </g>

            {/* 11. Final challenge: a life */}
            <g data-scene="10">
              <text x="40" y="58" fontSize="13" fill="var(--paper-45)" style={mono}>NET WORTH, AGE 22 → 35</text>
              <line x1="40" y1="330" x2="520" y2="330" stroke="var(--paper-18)" />
              <path d="M40,320 C90,318 110,300 150,296 L170,312 C220,300 260,270 300,240 C330,220 350,226 370,240 C420,200 470,130 520,96" fill="none" stroke="var(--n200)" strokeWidth="3.5" data-lline data-draw />
              {[
                { x: 170, y: 312, t: 'First EMI' },
                { x: 370, y: 240, t: 'Job loss: savings hold' },
                { x: 500, y: 110, t: '10 years of investing' },
              ].map((e, k) => (
                <g key={e.t} data-lev={k} opacity="0" transform="translate(0 8)">
                  <circle cx={e.x} cy={e.y} r="6" fill="var(--paper)" />
                  <text x={e.x + (k === 2 ? -12 : 0)} y={e.y - 18} fontSize="13" textAnchor={k === 2 ? 'end' : 'middle'} fill="var(--paper)">{e.t}</text>
                </g>
              ))}
              <text x="40" y="358" fontSize="12" fill="var(--paper-45)" style={mono}>22</text>
              <text x="520" y="358" fontSize="12" textAnchor="end" fill="var(--paper-45)" style={mono}>35</text>
            </g>
          </svg>
        </div>

        {/* ---------- progress rail ---------- */}
        <ol className={styles.rail} data-chrome data-rail aria-hidden="true">
          {JOURNEYS.map((j, i) => (
            <li key={j.id}>
              <span className={styles.railFill} data-rail-fill={i} style={{ background: journeyColorVar(j) }} />
            </li>
          ))}
        </ol>

        {/* ---------- finale ---------- */}
        <div className={styles.finale} data-finale>
          <h2 className={styles.finaleH}>Now you see how money moves.</h2>
          <p className={styles.finaleP}>Eleven short experiences. You make the choices and watch what they cost.</p>
          <button className={styles.cta} onClick={start}>Start your first lesson</button>
        </div>
      </div>
    </section>
  );
}
