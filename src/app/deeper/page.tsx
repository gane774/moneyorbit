'use client';

import { useRouter } from 'next/navigation';

/**
 * Go Deeper (Section 29). The core run is kept to roughly 45 minutes on
 * purpose; this is where the material that would have bloated it lives.
 *
 * Listed honestly as not-yet-written rather than dressed up as a finished
 * section -- an empty page pretending to be full is worse than an empty page.
 */
const TOPICS = [
  { t: 'Credit scores, in detail', b: 'What actually moves the number, and what does nothing at all.' },
  { t: 'Tax, for a first salary', b: 'Slabs, TDS, and why your take-home is not your CTC.' },
  { t: 'How mutual funds are built', b: 'What a fund manager does, what an index fund does instead, and expense ratios.' },
  { t: 'Insurance, without the sales pitch', b: 'Term versus everything else, and why "investment-linked" usually is not.' },
  { t: 'Renting versus buying', b: 'The arithmetic people skip, including the costs that never show up in the EMI.' },
  { t: 'Reading a payslip', b: 'Every line on it, including the ones that are quietly yours.' },
];

export default function Deeper() {
  const router = useRouter();
  return (
    <main className="sheet">
      <button
        onClick={() => router.back()}
        className="backLink"
      >
        ← Back
      </button>

      <div className="kicker" style={{ color: 'var(--ink-35)' }}>Go deeper</div>
      <h1 className="h-mid" style={{ marginBottom: 8 }}>The parts the short course left out.</h1>
      <p className="body-s" style={{ marginTop: 0, marginBottom: 22 }}>
        The core run stays at about 45 minutes on purpose. These are the topics
        that would have made it longer without making it clearer. None of them
        are written yet — they are listed so you can see what is coming.
      </p>

      {TOPICS.map((x, i) => (
        <div className="jrow locked" key={x.t} style={i === TOPICS.length - 1 ? { border: 'none' } : undefined}>
          <span className="jdot" style={{ background: 'var(--ink-12)' }} />
          <span className="jt">
            {x.t}
            <span style={{ display: 'block', fontSize: 12.5, color: 'var(--ink-60)', fontWeight: 400, marginTop: 2 }}>
              {x.b}
            </span>
          </span>
          <span className="jm">Soon</span>
        </div>
      ))}
    </main>
  );
}
