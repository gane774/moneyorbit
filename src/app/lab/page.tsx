'use client';

import { useRouter } from 'next/navigation';

/** Section 11: route and index page only. The individual simulators are
 *  post-MVP and are not built until the core 11-journey run is stable. */
export default function Lab() {
  const router = useRouter();
  const tools = [
    'Budget simulator', 'EMI calculator', 'Compounding', 'Inflation',
    'Credit card', 'Investment', 'Bank statement explorer',
  ];

  return (
    <main className="sheet">
      <div className="kicker" style={{ color: 'var(--ink-35)' }}>Money Lab</div>
      <h1 className="h-mid" style={{ marginBottom: 8 }}>Free-play tools, coming soon.</h1>
      <p className="body-s" style={{ marginBottom: 20 }}>
        The Lab opens once the core run is stable. Everything here will be a tool
        you can pick up on its own, without a lesson around it.
      </p>

      {tools.map((t, i) => (
        <div
          key={t}
          className="jrow locked"
          style={i === tools.length - 1 ? { border: 'none' } : undefined}
        >
          <span className="jdot" style={{ background: 'var(--ink-12)' }} />
          <span className="jt">{t}</span>
          <span className="jm">Soon</span>
        </div>
      ))}

      <div className="spacer" style={{ height: 28 }} />
      <button className="btn ghost" onClick={() => router.push('/home')}>Back to home</button>
    </main>
  );
}
