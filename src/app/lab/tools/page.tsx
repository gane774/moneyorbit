'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { computeLoan, compound, futureValueMonthly, realValue, inr } from '@/lib/money';

/**
 * Money Lab tools (Section 30).
 *
 * Every tool runs on the same functions the lessons use -- computeLoan,
 * compound, realValue -- rather than re-deriving the maths. A tool that
 * disagreed with the lesson it came from would quietly teach that neither can
 * be trusted.
 *
 * All figures are illustrative. Nothing here recommends a product, quotes a
 * real rate, or invites anyone to invest actual money (Section 30).
 */

function Row({ label, value, hero }: { label: string; value: string; hero?: boolean }) {
  return (
    <div className={`readline${hero ? ' hero' : ''}`}>
      <span>{label}</span><b>{value}</b>
    </div>
  );
}

function Slider({
  id, label, value, min, max, step, onChange, display,
}: {
  id: string; label: string; value: number; min: number; max: number;
  step: number; onChange: (n: number) => void; display: string;
}) {
  return (
    <div className="ctrl">
      <div className="lab"><label htmlFor={id}>{label}</label><b>{display}</b></div>
      <input id={id} type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(+e.target.value)} aria-valuetext={display} />
    </div>
  );
}

function EmiTool() {
  const [amt, setAmt] = useState(300_000);
  const [rate, setRate] = useState(11);
  const [yrs, setYrs] = useState(5);
  const l = computeLoan(amt, rate, yrs);
  return (
    <>
      <Slider id="a" label="Loan amount" value={amt} min={10_000} max={2_000_000} step={10_000}
        onChange={setAmt} display={inr(amt)} />
      <Slider id="r" label="Interest rate" value={rate} min={5} max={24} step={0.5}
        onChange={setRate} display={`${rate}%`} />
      <Slider id="y" label="Repay over" value={yrs} min={1} max={20} step={1}
        onChange={setYrs} display={`${yrs} ${yrs === 1 ? 'year' : 'years'}`} />
      <div className="readout">
        <Row label="Every month" value={inr(l.emi)} />
        <div className="stackbar" aria-hidden="true">
          <div className="p" style={{ width: `${l.principalPct}%` }} />
          <div className="i" style={{ width: `${100 - l.principalPct}%` }} />
        </div>
        <div className="legend">
          <span><i style={{ background: 'var(--indigo)' }} />What you borrowed</span>
          <span><i style={{ background: 'var(--danger)' }} />Extra you pay</span>
        </div>
        <Row label="Total repaid" value={inr(l.totalPaid)} />
        <Row label="Extra you pay" value={inr(l.totalInterest)} hero />
      </div>
    </>
  );
}

function CompoundTool() {
  const [amt, setAmt] = useState(10_000);
  const [rate, setRate] = useState(8);
  const [yrs, setYrs] = useState(20);
  const fv = compound(amt, rate, yrs);
  return (
    <>
      <Slider id="ca" label="Starting amount" value={amt} min={1_000} max={500_000} step={1_000}
        onChange={setAmt} display={inr(amt)} />
      <Slider id="cr" label="Growth rate" value={rate} min={1} max={15} step={0.5}
        onChange={setRate} display={`${rate}%`} />
      <Slider id="cy" label="Left alone for" value={yrs} min={1} max={45} step={1}
        onChange={setYrs} display={`${yrs} years`} />
      <div className="readout">
        <Row label="You put in" value={inr(amt)} />
        <Row label="It becomes" value={inr(fv)} hero />
        <Row label="Growth alone" value={inr(fv - amt)} />
      </div>
    </>
  );
}

function SipTool() {
  const [monthly, setMonthly] = useState(2_000);
  const [rate, setRate] = useState(10);
  const [yrs, setYrs] = useState(15);
  const fv = futureValueMonthly(monthly, rate, yrs);
  const paid = monthly * yrs * 12;
  return (
    <>
      <Slider id="sm" label="Every month" value={monthly} min={100} max={50_000} step={100}
        onChange={setMonthly} display={inr(monthly)} />
      <Slider id="sr" label="Growth rate" value={rate} min={1} max={15} step={0.5}
        onChange={setRate} display={`${rate}%`} />
      <Slider id="sy" label="For" value={yrs} min={1} max={40} step={1}
        onChange={setYrs} display={`${yrs} years`} />
      <div className="readout">
        <Row label="You put in, in total" value={inr(paid)} />
        <Row label="It becomes" value={inr(fv)} hero />
        <Row label="Growth alone" value={inr(fv - paid)} />
      </div>
    </>
  );
}

function InflationTool() {
  const [amt, setAmt] = useState(100_000);
  const [rate, setRate] = useState(6);
  const [yrs, setYrs] = useState(15);
  const real = realValue(amt, rate, yrs);
  return (
    <>
      <Slider id="ia" label="Amount today" value={amt} min={1_000} max={1_000_000} step={1_000}
        onChange={setAmt} display={inr(amt)} />
      <Slider id="ir" label="Inflation" value={rate} min={1} max={12} step={0.5}
        onChange={setRate} display={`${rate}%`} />
      <Slider id="iy" label="In" value={yrs} min={1} max={40} step={1}
        onChange={setYrs} display={`${yrs} years`} />
      <div className="readout">
        <Row label="The number stays" value={inr(amt)} />
        <Row label="What it will buy" value={inr(real)} hero />
        <Row label="Quietly lost" value={inr(amt - real)} />
      </div>
    </>
  );
}

function CreditCardTool() {
  const [balance, setBalance] = useState(30_000);
  const [apr, setApr] = useState(42);
  const [pctPaid, setPctPaid] = useState(5);

  /* Minimum-payment maths: pay a percentage of the balance each month while
     interest accrues. Capped at 600 months so a balance that never clears
     reports honestly instead of hanging. */
  let bal = balance, months = 0, interestPaid = 0;
  const monthlyRate = apr / 100 / 12;
  while (bal > 1 && months < 600) {
    const interest = bal * monthlyRate;
    const pay = Math.max(bal * (pctPaid / 100), 100);
    if (pay <= interest) { months = 600; break; }
    interestPaid += interest;
    bal = bal + interest - pay;
    months++;
  }
  const never = months >= 600;

  return (
    <>
      <Slider id="cb" label="Balance" value={balance} min={1_000} max={200_000} step={1_000}
        onChange={setBalance} display={inr(balance)} />
      <Slider id="cap" label="Interest rate a year" value={apr} min={12} max={48} step={1}
        onChange={setApr} display={`${apr}%`} />
      <Slider id="cp" label="You pay each month" value={pctPaid} min={1} max={30} step={1}
        onChange={setPctPaid} display={`${pctPaid}% of the balance`} />
      <div className="readout">
        {never ? (
          <>
            <Row label="Time to clear it" value="Never" hero />
            <p style={{ fontSize: 13, color: 'var(--ink-60)', lineHeight: 1.5, marginTop: 8 }}>
              At this rate the payment does not even cover the interest, so the
              balance grows every month no matter how long you keep paying.
            </p>
          </>
        ) : (
          <>
            <Row label="Time to clear it" value={`${Math.floor(months / 12)}y ${months % 12}m`} />
            <Row label="Interest paid" value={inr(interestPaid)} hero />
            <Row label="Total paid" value={inr(balance + interestPaid)} />
          </>
        )}
      </div>
    </>
  );
}

const TOOLS = [
  { id: 'emi',       name: 'Loan & EMI',        blurb: 'What a loan really costs by the end.',        el: <EmiTool /> },
  { id: 'compound',  name: 'Compounding',       blurb: 'One amount, left alone, over time.',          el: <CompoundTool /> },
  { id: 'sip',       name: 'Monthly investing', blurb: 'A fixed amount every month, compounding.',    el: <SipTool /> },
  { id: 'inflation', name: 'Inflation',         blurb: 'What today’s money will actually buy later.', el: <InflationTool /> },
  { id: 'card',      name: 'Credit card',       blurb: 'How long a balance takes to clear.',          el: <CreditCardTool /> },
];

function Tools() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = TOOLS.find((t) => t.id === params.get('t'))?.id ?? 'emi';
  const [active, setActive] = useState(initial);
  const tool = TOOLS.find((t) => t.id === active)!;

  return (
    <main className="sheet">
      <button
        onClick={() => router.push('/lab')}
        className="backLink"
      >
        ← Money Lab
      </button>

      <div className="kicker" style={{ color: 'var(--ink-35)' }}>Tools · illustrative figures</div>
      <h1 className="h-mid" style={{ marginBottom: 14 }}>{tool.name}</h1>

      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 22 }}>
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            aria-pressed={t.id === active}
            className="chip"
            style={{
              border: `1px solid ${t.id === active ? 'var(--ink)' : 'var(--ink-12)'}`,
              background: t.id === active ? 'var(--ink)' : 'var(--paper)',
              color: t.id === active ? 'var(--paper)' : 'var(--ink-60)',
            }}
          >
            {t.name}
          </button>
        ))}
      </div>

      <p className="body-s" style={{ marginTop: 0, marginBottom: 18 }}>{tool.blurb}</p>
      {tool.el}

      <p style={{ marginTop: 24, fontSize: 12.5, color: 'var(--ink-60)', fontStyle: 'italic', lineHeight: 1.5 }}>
        These are worked examples, not offers or advice. Real rates and terms vary,
        and nothing here recommends any product.
      </p>
    </main>
  );
}

export default function ToolsPage() {
  return <Suspense fallback={<main className="sheet" />}><Tools /></Suspense>;
}
