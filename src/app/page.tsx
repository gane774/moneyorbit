import { TOTAL_JOURNEYS, TOTAL_MINUTES } from '@/content/journeys';
import FlowOfMoney from '@/components/FlowOfMoney';
import HeroCta from '@/components/home/HeroCta';
import HomeSections from '@/components/home/HomeSections';

/** Section 3: static hero first (light), then the animation (dark),
 *  which resolves into its own CTA. The light-dark-light transition
 *  is intentional. */
export default function Landing() {
  return (
    <>
      <section className="hero">
        <div className="hero-mark rise">MoneyOrbit</div>

        <h1 className="hero-h rise" style={{ '--d': '80ms' } as React.CSSProperties}>
          Nobody teaches you what money <em>actually</em> does.
        </h1>

        <p className="hero-p rise" style={{ '--d': '180ms' } as React.CSSProperties}>
          {TOTAL_JOURNEYS} short experiences, about {TOTAL_MINUTES} minutes in total.
          You will not read a textbook. You will make decisions and watch what they cost.
        </p>

        <div className="hero-cta rise" style={{ '--d': '280ms' } as React.CSSProperties}>
          <HeroCta />
        </div>

        <p className="hero-hint rise" style={{ '--d': '420ms' } as React.CSSProperties}>
          Scroll to see where money goes
        </p>
      </section>

      <FlowOfMoney />
      <HomeSections />
    </>
  );
}
