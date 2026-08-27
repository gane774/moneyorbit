import Link from 'next/link';
import { TOTAL_JOURNEYS, TOTAL_MINUTES } from '@/content/journeys';
import FlowOfMoney from '@/components/FlowOfMoney';

/** Section 3: static hero first (light), then the animation (dark),
 *  which resolves into its own CTA. The light-dark-light transition
 *  is intentional. */
export default function Landing() {
  return (
    <>
      <section
        style={{
          minHeight: '100svh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          maxWidth: 720,
          margin: '0 auto',
          padding: '48px 24px',
          background: 'var(--canvas)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: '-.02em',
            marginBottom: 40,
          }}
        >
          MoneyOrbit
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(38px,8vw,68px)',
            lineHeight: 1.02,
            letterSpacing: '-.025em',
            maxWidth: '15ch',
          }}
        >
          Nobody teaches you what money actually does.
        </h1>

        <p
          style={{
            marginTop: 20,
            maxWidth: '46ch',
            fontSize: 17,
            color: 'var(--ink-60)',
            lineHeight: 1.5,
          }}
        >
          {TOTAL_JOURNEYS} short experiences, about {TOTAL_MINUTES} minutes in total.
          You will not read a textbook — you will make decisions and watch what they cost.
        </p>

        <div style={{ marginTop: 32, maxWidth: 260 }}>
          <Link href="/onboarding"><button className="btn">Start learning</button></Link>
        </div>

        <p
          style={{
            marginTop: 46,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '.14em',
            textTransform: 'uppercase',
            color: 'var(--ink-35)',
          }}
        >
          Scroll to see where money goes
        </p>
      </section>

      <FlowOfMoney />
    </>
  );
}
