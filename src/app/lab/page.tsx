'use client';

import { useRouter } from 'next/navigation';

/**
 * Money Lab (Section 30): tools you can pick up without a lesson around them.
 * Everything is fictional and illustrative — this is an educational sandbox,
 * not an invitation for a minor to put real money anywhere.
 */
const TOOLS = [
  { id: 'emi',       name: 'Loan & EMI',        blurb: 'Push the amount, rate and tenure around and watch the total move.' },
  { id: 'compound',  name: 'Compounding',       blurb: 'One amount, left alone, over years.' },
  { id: 'sip',       name: 'Monthly investing', blurb: 'A fixed amount every month, compounding as it goes.' },
  { id: 'inflation', name: 'Inflation',         blurb: 'What money you have today will actually buy later.' },
  { id: 'card',      name: 'Credit card',       blurb: 'How long a balance takes to clear — and when it never does.' },
];

export default function Lab() {
  const router = useRouter();

  return (
    <main className="sheet">
      <button
        onClick={() => router.push('/home')}
        className="backLink"
      >
        ← Home
      </button>

      <div className="kicker" style={{ color: 'var(--ink-35)' }}>Money Lab</div>
      <h1 className="h-mid" style={{ marginBottom: 8 }}>Play with the numbers.</h1>
      <p className="body-s" style={{ marginTop: 0, marginBottom: 20 }}>
        No lesson, no right answer. Everything here is a worked example — real
        rates and terms vary, and nothing recommends a product.
      </p>

      <button className="labCard" onClick={() => router.push('/lab/life')}>
        <div className="lt">Life simulator</div>
        <div className="lb">
          Start at 18 on ₹35,000 a month. Make the calls, meet the surprises,
          see what they cost.
        </div>
      </button>

      <div className="sectionLabel">Calculators</div>
      {TOOLS.map((t) => (
        <button key={t.id} className="labCard" onClick={() => router.push(`/lab/tools?t=${t.id}`)}>
          <div className="lt">{t.name}</div>
          <div className="lb">{t.blurb}</div>
        </button>
      ))}

      <div className="sectionLabel">Still to come</div>
      <div className="jrow locked" style={{ border: 'none' }}>
        <span className="jdot" style={{ background: 'var(--ink-12)' }} />
        <span className="jt">
          Budget simulator
          <span style={{ display: 'block', fontSize: 12.5, color: 'var(--ink-60)', fontWeight: 400, marginTop: 2 }}>
            Bank statement explorer
          </span>
        </span>
        <span className="jm">Soon</span>
      </div>
    </main>
  );
}
