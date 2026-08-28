'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { resolveStartDestination } from '@/lib/startDestination';
import styles from './FlowOfMoney.module.css';

/**
 * Section 3: the existing scroll-driven animation, integrated not rebuilt.
 * The GSAP timeline and the SVG scene markup below are the original file's,
 * unchanged except for the palette swap (every hardcoded hex now routes
 * through a MoneyOrbit token).
 *
 * One necessary adaptation: the original measured scroll against the whole
 * document, because it WAS the whole document. Here it sits below a static
 * hero, so progress is measured against this section's own bounds instead.
 * Same formula (scrolled / scrollable), different reference element.
 *
 * GSAP is imported dynamically so it does not block first paint of the hero
 * (Section 16).
 */
export default function FlowOfMoney({ onStart }: { onStart?: () => void }) {
  const router = useRouter();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);

  /* Always route through resolveStartDestination so the CTA is correct for a
     returning student, not just a first-time visitor. Resolved on click rather
     than at render: it reads localStorage, which is not available during SSR
     and would otherwise hydrate with the wrong destination. */
  const start = onStart ?? (() => router.push(resolveStartDestination().href));

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    if (mq.matches) return;

    let raf = 0;
    let killed = false;
    let cleanup = () => {};
    let target = 0;
    let current = 0;

    (async () => {
      const { gsap } = await import('gsap');
      if (killed) return;

  const tl = gsap.timeline({ paused: true });

  // Helpers for camera positioning
  const W = 1920, H = 1080;
  const cx = (x: number) => W / 2 - x;
  const cy = (y: number) => H / 2 - y;

  const p = "#protagonist";
  const c = "#camera";
  const pCore = "#p-core";

  // Initialize positions
  gsap.set(p, { x: 960, y: 300, scale: 0 });
  gsap.set(c, { x: cx(960), y: cy(300), scale: 1 });
  gsap.set("#active-path", { strokeDasharray: 6000, strokeDashoffset: 6000 });

  // ==========================================
  // BUILD THE MASTER TIMELINE
  // We use arbitrary durations (e.g., 1, 2, 3)
  // because the whole timeline will be scrubbed 0 to 1.
  // ==========================================

  // 1. START
  tl.to(p, { scale: 1, duration: 1, ease: "back.out(1.5)" }, 0)
  .to("#start-t1", { opacity: 0, y: -50, duration: 1 }, 0.5)
  .to("#start-t2", { opacity: 1, y: -20, duration: 1 }, 0.5)
  .to("#start-t2", { opacity: 0, duration: 1 }, 2)
  .to("#active-path", { strokeDashoffset: 5800, duration: 1 }, 1);

  // 2. EARNING -> Move to (1420, 300)
  tl.to(p, { x: 1420, y: 300, duration: 3, ease: "power1.inOut" }, "earn")
  .to(c, { x: cx(1420), y: cy(300), duration: 3, ease: "power1.inOut" }, "earn")
  .to("#scene-earn", { opacity: 1, duration: 1 }, "earn+=0.5")
  .to("#active-path", { strokeDashoffset: 5340, duration: 3 }, "earn");

  // Earning particles animation
  tl.to("#earn-p1", { opacity: 1, duration: 0.2 }, "earn+=1.5")
  .to("#earn-p1", { x: 170, y: 150, duration: 1, ease: "power1.in" }, "earn+=1.7")
  .to("#earn-p1", { opacity: 0, duration: 0.1 }, "earn+=2.6");
  tl.to("#earn-p2", { opacity: 1, duration: 0.2 }, "earn+=1.6")
  .to("#earn-p2", { x: -170, y: 150, duration: 1, ease: "power1.in" }, "earn+=1.8")
  .to("#earn-p2", { opacity: 0, duration: 0.1 }, "earn+=2.7");
  tl.to("#earn-p3", { opacity: 1, duration: 0.2 }, "earn+=1.7")
  .to("#earn-p3", { x: 170, y: -150, duration: 1, ease: "power1.in" }, "earn+=1.9")
  .to("#earn-p3", { opacity: 0, duration: 0.1 }, "earn+=2.8");
  tl.to("#earn-p4", { opacity: 1, duration: 0.2 }, "earn+=1.8")
  .to("#earn-p4", { x: -170, y: -150, duration: 1, ease: "power1.in" }, "earn+=2.0")
  .to("#earn-p4", { opacity: 0, duration: 0.1 }, "earn+=2.9");

  tl.to(pCore, { scale: 1.2, duration: 0.3, yoyo: true, repeat: 1 }, "earn+=2.7");

  // 3. MINDSET -> Move to (1520, 600)
  tl.to(p, { x: 1520, y: 600, duration: 3, ease: "power1.inOut" }, "mindset")
  .to(c, { x: cx(1520), y: cy(600), duration: 3, ease: "power1.inOut" }, "mindset")
  .to("#scene-mindset", { opacity: 1, duration: 1 }, "mindset+=0.5")
  .to("#scene-earn", { opacity: 0.3, duration: 1 }, "mindset")
  .to("#active-path", { strokeDashoffset: 4940, duration: 3 }, "mindset");

  // Mindset action: Ghost particle splits right
  tl.to("#mindset-ghost", { opacity: 1, duration: 0.2 }, "mindset+=2.5")
  .to("#mindset-ghost", { x: 230, duration: 1, ease: "power1.out" }, "mindset+=2.7")
  .to("#mindset-ghost", { opacity: 0, duration: 0.5 }, "mindset+=3.5");

  // 4. BUDGETING -> Move to (1000, 800)
  tl.to(p, { x: 1000, y: 800, duration: 4, ease: "power1.inOut" }, "budget")
  .to(c, { x: cx(1000), y: cy(800), duration: 4, ease: "power1.inOut" }, "budget")
  .to("#scene-budget", { opacity: 1, duration: 1 }, "budget+=1")
  .to("#scene-mindset", { opacity: 0.3, duration: 1 }, "budget")
  .to("#active-path", { strokeDashoffset: 4340, duration: 4 }, "budget");

  // Budgeting action: Fill buckets
  tl.to("#bp1", { opacity: 1, duration: 0.1 }, "budget+=3")
  .to("#bp1", { x: -110, duration: 0.5, ease: "power2.out" }, "budget+=3.1")
  .to("#bp1", { y: 150, duration: 0.5, ease: "power2.in" }, "budget+=3.1")
  .to("#bp1", { opacity: 0, duration: 0.1 }, "budget+=3.6")
  .to("#fill-needs", { height: 60, y: 58, duration: 0.5 }, "budget+=3.6")
  .to("#txt-needs", { innerHTML: "50%", snap: { innerHTML: 1 }, duration: 0.5 }, "budget+=3.6");

  tl.to("#bp2", { opacity: 1, duration: 0.1 }, "budget+=3.2")
  .to("#bp2", { x: 0, duration: 0.5, ease: "power2.out" }, "budget+=3.3")
  .to("#bp2", { y: 150, duration: 0.5, ease: "power2.in" }, "budget+=3.3")
  .to("#bp2", { opacity: 0, duration: 0.1 }, "budget+=3.8")
  .to("#fill-wants", { height: 36, y: 82, duration: 0.5 }, "budget+=3.8")
  .to("#txt-wants", { innerHTML: "30%", snap: { innerHTML: 1 }, duration: 0.5 }, "budget+=3.8");

  tl.to("#bp3", { opacity: 1, duration: 0.1 }, "budget+=3.4")
  .to("#bp3", { x: 110, duration: 0.5, ease: "power2.out" }, "budget+=3.5")
  .to("#bp3", { y: 150, duration: 0.5, ease: "power2.in" }, "budget+=3.5")
  .to("#bp3", { opacity: 0, duration: 0.1 }, "budget+=4.0")
  .to("#fill-save", { height: 24, y: 94, duration: 0.5 }, "budget+=4.0")
  .to("#txt-save", { innerHTML: "20%", snap: { innerHTML: 1 }, duration: 0.5 }, "budget+=4.0");

  // 5. BANKING -> Move to (500, 800)
  tl.to(p, { x: 500, y: 800, duration: 3, ease: "power1.inOut" }, "bank")
  .to(c, { x: cx(500), y: cy(800), duration: 3, ease: "power1.inOut" }, "bank")
  .to("#scene-bank", { opacity: 1, duration: 1 }, "bank+=0.5")
  .to("#scene-budget", { opacity: 0.3, duration: 1 }, "bank")
  .to("#active-path", { strokeDashoffset: 3840, duration: 3 }, "bank");

  // Banking action: Network ping
  tl.to("#upi-particle", { opacity: 1, duration: 0.1 }, "bank+=2.5")
  .to("#upi-particle", { x: -100, y: -100, duration: 0.2 }, "bank+=2.6")
  .to("#upi-particle", { x: -200, y: -50, duration: 0.2 }, "bank+=2.8")
  .to("#upi-particle", { x: 100, y: -80, duration: 0.2 }, "bank+=3.0")
  .to("#upi-particle", { x: 200, y: 0, duration: 0.2 }, "bank+=3.2")
  .to("#upi-particle", { x: 0, y: 0, duration: 0.2 }, "bank+=3.4")
  .to("#upi-particle", { opacity: 0, duration: 0.1 }, "bank+=3.6");

  // 6. SAVING -> Move to (400, 1100)
  tl.to(p, { x: 400, y: 1100, duration: 3, ease: "power1.inOut" }, "save")
  .to(c, { x: cx(400), y: cy(1100), duration: 3, ease: "power1.inOut" }, "save")
  .to("#scene-save", { opacity: 1, duration: 1 }, "save+=0.5")
  .to("#scene-bank", { opacity: 0.3, duration: 1 }, "save")
  .to("#active-path", { strokeDashoffset: 3500, duration: 3 }, "save");

  // Saving action: Expense hits reserve
  tl.to("#expense-group", { x: 300, duration: 0.5, ease: "power2.in" }, "save+=2.5")
  .to("#reserve-shield", { scale: 0.9, opacity: 1, stroke: "#F26D7D", duration: 0.1 }, "save+=3")
  .to("#expense-group", { opacity: 0, scale: 0, duration: 0.2 }, "save+=3")
  .to("#reserve-shield", { scale: 1, stroke: "#58C7F3", opacity: 0.5, duration: 0.5, ease: "elastic.out(1, 0.3)" }, "save+=3.1");

  // 7. CREDIT -> Move to (1000, 1300)
  tl.to(p, { x: 1000, y: 1300, duration: 4, ease: "power1.inOut" }, "credit")
  .to(c, { x: cx(1000), y: cy(1300), duration: 4, ease: "power1.inOut" }, "credit")
  .to("#scene-credit", { opacity: 1, duration: 1 }, "credit+=1")
  .to("#scene-save", { opacity: 0.3, duration: 1 }, "credit")
  .to("#active-path", { strokeDashoffset: 2800, duration: 4 }, "credit");

  // Credit action: Borrow enters, Repay leaves
  tl.to("#credit-in-p", { opacity: 1, duration: 0.1 }, "credit+=1.5")
  .to("#credit-in-p", { x: 150, y: 100, duration: 0.8, ease: "power1.in" }, "credit+=1.6")
  .to("#credit-in-p", { opacity: 0, duration: 0.1 }, "credit+=2.4")
  .to(pCore, { scale: 1.6, fill: "#F4B860", duration: 0.5 }, "credit+=2.4")

  .to(pCore, { scale: 0.8, fill: "#111318", duration: 0.5 }, "credit+=3.5")
  .to("#credit-msg", { opacity: 1, y: -20, duration: 0.5 }, "credit+=3.5");

  // 8. MATH -> Move to (1420, 1300)
  tl.to(p, { x: 1420, y: 1300, duration: 3, ease: "power1.inOut" }, "math")
  .to(c, { x: cx(1420), y: cy(1300), duration: 3, ease: "power1.inOut" }, "math")
  .to("#scene-math", { opacity: 1, duration: 1 }, "math+=0.5")
  .to("#scene-credit", { opacity: 0.3, duration: 1 }, "math")
  .to("#active-path", { strokeDashoffset: 2380, duration: 3 }, "math");

  // Math action: Compounding
  tl.to("#exp-curve", { strokeDashoffset: 0, duration: 2, ease: "power2.inOut" }, "math+=2")
  .to(".mc", { opacity: 1, stagger: 0.2, duration: 0.5 }, "math+=2");

  // 9. INVESTING -> Move to (1520, 1600)
  tl.to(p, { x: 1520, y: 1600, duration: 3, ease: "power1.inOut" }, "invest")
  .to(c, { x: cx(1520), y: cy(1600), duration: 3, ease: "power1.inOut" }, "invest")
  .to("#scene-invest", { opacity: 1, duration: 1 }, "invest+=0.5")
  .to("#scene-math", { opacity: 0.3, duration: 1 }, "invest")
  .to("#active-path", { strokeDashoffset: 2000, duration: 3 }, "invest");

  // Invest action: Split and traverse
  tl.to("#inv-p1", { opacity: 1, duration: 0.2 }, "invest+=2")
  .to("#inv-p2", { opacity: 1, duration: 0.2 }, "invest+=2")
  .to("#inv-p3", { opacity: 1, duration: 0.2 }, "invest+=2")
  .to(p, { opacity: 0, duration: 0.2 }, "invest+=2") // Hide main temporarily

  // Move ghost particles along paths
  .to("#inv-p1", { x: 0, y: 100, duration: 0.5, ease: "sine.inOut" }, "invest+=2.2")
  .to("#inv-p1", { x: -100, y: 200, duration: 0.5, ease: "power1.inOut" }, "invest+=2.7")
  .to("#inv-p1", { x: -100, y: 300, duration: 0.5, ease: "power1.inOut" }, "invest+=3.2")

  .to("#inv-p2", { x: -70, y: 150, duration: 1, ease: "none" }, "invest+=2.2")
  .to("#inv-p2", { x: -100, y: 300, duration: 0.5, ease: "none" }, "invest+=3.2")

  .to("#inv-p3", { x: 30, y: 150, duration: 1, ease: "power1.inOut" }, "invest+=2.2")
  .to("#inv-p3", { x: -100, y: 300, duration: 0.5, ease: "power1.inOut" }, "invest+=3.2")

  // Recombine
  .to(p, { x: 1420, y: 1800, duration: 0.01 }, "invest+=3.7") // Snap main particle to end
  .to(c, { x: cx(1420), y: cy(1800), duration: 0.5 }, "invest+=3.7")
  .to(p, { opacity: 1, duration: 0.2 }, "invest+=3.7")
  .to(["#inv-p1", "#inv-p2", "#inv-p3"], { opacity: 0, duration: 0.2 }, "invest+=3.7")
  .to("#active-path", { strokeDashoffset: 1700, duration: 1 }, "invest+=3.7");

  // 10. DESTINATIONS -> Move to (1000, 1800)
  tl.to(p, { x: 1000, y: 1800, duration: 3, ease: "power1.inOut" }, "dest")
  .to(c, { x: cx(1000), y: cy(1800), duration: 3, ease: "power1.inOut" }, "dest")
  .to("#scene-dest", { opacity: 1, duration: 1 }, "dest+=0.5")
  .to("#scene-invest", { opacity: 0.3, duration: 1 }, "dest")
  .to("#active-path", { strokeDashoffset: 1280, duration: 3 }, "dest");

  // Dest action: Orbit nodes
  tl.to("#dest-nodes", { rotation: 360, transformOrigin: "1000px 1800px", duration: 4, ease: "power1.inOut" }, "dest+=1");

  // 11. SCAMS -> Move to (600, 1800)
  tl.to(p, { x: 600, y: 1800, duration: 3, ease: "power1.inOut" }, "scam")
  .to(c, { x: cx(600), y: cy(1800), duration: 3, ease: "power1.inOut" }, "scam")
  .to("#scene-scam", { opacity: 1, duration: 1 }, "scam+=0.5")
  .to("#scene-dest", { opacity: 0.3, duration: 1 }, "scam")
  .to("#active-path", { strokeDashoffset: 880, duration: 3 }, "scam");

  // Scam action: Dip, warn, retreat
  tl.to(p, { x: 580, y: 1850, duration: 0.5, ease: "power1.in" }, "scam+=2.5")
  .to(c, { x: cx(580), y: cy(1850), duration: 0.5, ease: "power1.in" }, "scam+=2.5")
  .to("#scam-warnings", { opacity: 1, duration: 0.2 }, "scam+=2.8")
  .to("#scam-warnings", { opacity: 0, duration: 0.2 }, "scam+=3.2")
  .to("#scam-warnings", { opacity: 1, duration: 0.2 }, "scam+=3.4")
  .to(p, { x: 600, y: 1800, duration: 0.5, ease: "power2.out" }, "scam+=3.6")
  .to(c, { x: cx(600), y: cy(1800), duration: 0.5, ease: "power2.out" }, "scam+=3.6")
  .to("#scam-warnings", { opacity: 0, duration: 0.2 }, "scam+=3.8");

  // Move past scam
  tl.to(p, { x: 500, y: 1800, duration: 1, ease: "power1.inOut" }, "scam+=4.2")
  .to(c, { x: cx(500), y: cy(1800), duration: 1, ease: "power1.inOut" }, "scam+=4.2")
  .to("#active-path", { strokeDashoffset: 780, duration: 1 }, "scam+=4.2");

  // 12. FINAL -> Move to (400, 2100)
  tl.to(p, { x: 400, y: 2100, duration: 3, ease: "power1.inOut" }, "final")
  .to(c, { x: cx(400), y: cy(2100), duration: 3, ease: "power1.inOut" }, "final")
  .to("#scene-scam", { opacity: 0.3, duration: 1 }, "final")
  .to("#active-path", { strokeDashoffset: 0, duration: 3 }, "final");

  // BIG ZOOM OUT
  tl.to(c, { x: cx(960), y: cy(1200), scale: 0.45, transformOrigin: "960px 1200px", duration: 4, ease: "power2.inOut" }, "zoom")
  .to("#final-ui", { opacity: 1, pointerEvents: "auto", duration: 2 }, "zoom+=2")
  ;

  // Make all scenes fully visible again for the overview
  tl.to(["#scene-earn", "#scene-mindset", "#scene-budget", "#scene-bank", "#scene-save", "#scene-credit", "#scene-math", "#scene-invest", "#scene-dest", "#scene-scam"], { opacity: 0.8, duration: 3 }, "zoom");
      const onScroll = () => {
        const el = sectionRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        // Scrollable distance = section height minus one viewport.
        const scrollable = el.offsetHeight - window.innerHeight;
        // Immediately after hydration the section can still measure 0 for a
        // frame. Leave the last good value alone rather than clobbering it
        // to 0 — the ResizeObserver below re-runs this once layout settles.
        if (scrollable <= 0) return;
        const scrolled = -rect.top;
        target = Math.max(0, Math.min(1, scrolled / scrollable));
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);

      // Re-measure whenever the spacer's height actually changes: after
      // hydration, after fonts load, and on orientation change.
      const ro = new ResizeObserver(onScroll);
      if (sectionRef.current) ro.observe(sectionRef.current);

      onScroll();

      const render = () => {
        const diff = target - current;
        if (Math.abs(diff) > 0.0001) {
          current += diff * 0.08;
          tl.progress(current);
        }
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

  /* Reduced motion: no scroll-scrub, no tall spacer. The section still
     conveys its content and its CTA — it just does not move. */
  if (reduced) {
    return (
      <section className={styles.reducedWrap}>
        <h2 className={styles.reducedTitle}>Now you see how money moves.</h2>
        <p className={styles.reducedBody}>
          Everything is connected. Your choices shape the flow.
        </p>
        <button className={styles.reducedCta} onClick={start}>Start learning</button>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.sticky}>
<svg id="main-svg" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
            <defs>
                {/* Grid Pattern */}
                <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                    <path d="M 100 0 L 0 0 0 100" fill="none" stroke="var(--flow-border)" strokeWidth="1"/>
                    <circle cx="0" cy="0" r="1.5" fill="var(--flow-border)" />
                </pattern>

                {/* Glow Filters */}
                <filter id="glow-primary" x="-200%" y="-200%" width="500%" height="500%">
                    <feGaussianBlur stdDeviation="12" result="blur1" />
                    <feGaussianBlur stdDeviation="24" result="blur2" />
                    <feMerge>
                        <feMergeNode in="blur2" />
                        <feMergeNode in="blur1" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <filter id="glow-red" x="-125%" y="-125%" width="350%" height="350%">
                    <feGaussianBlur stdDeviation="10" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="glow-green" x="-125%" y="-125%" width="350%" height="350%">
                    <feGaussianBlur stdDeviation="10" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="glow-cyan" x="-175%" y="-175%" width="450%" height="450%">
                    <feGaussianBlur stdDeviation="15" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>

                {/* Gradients */}
                <linearGradient id="grad-budget" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="var(--n2000)" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="var(--n2000)" stopOpacity="0.1"/>
                </linearGradient>
            </defs>

            {/* Background */}
            <rect width="100%" height="100%" fill="var(--ink)" />
            
            {/* Camera Group (Moves inverse to particle to keep it centered) */}
            <g id="camera">
                {/* Massive Grid Background */}
                <rect id="bg-grid" x="-2000" y="-1000" width="6000" height="5000" fill="url(#grid)" />

                {/* The Main Circuit Path */}
                <path id="base-path" d="
                    M 960 300 
                    L 1420 300 Q 1520 300, 1520 400 
                    L 1520 700 Q 1520 800, 1420 800 
                    L 500 800 Q 400 800, 400 900 
                    L 400 1200 Q 400 1300, 500 1300 
                    L 1420 1300 Q 1520 1300, 1520 1400 
                    L 1520 1700 Q 1520 1800, 1420 1800 
                    L 500 1800 Q 400 1800, 400 1900 
                    L 400 2100
                " stroke="var(--flow-border)" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                
                {/* Active Path Overlay (Revealed over time) */}
                <path id="active-path" d="
                    M 960 300 
                    L 1420 300 Q 1520 300, 1520 400 
                    L 1520 700 Q 1520 800, 1420 800 
                    L 500 800 Q 400 800, 400 900 
                    L 400 1200 Q 400 1300, 500 1300 
                    L 1420 1300 Q 1520 1300, 1520 1400 
                    L 1520 1700 Q 1520 1800, 1420 1800 
                    L 500 1800 Q 400 1800, 400 1900 
                    L 400 2100
                " stroke="var(--n2000)" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>

                {/* ================= SCENES CONTENT ================= */}

                {/* Scene 1: START */}
                <g id="scene-start">
                    <text id="start-t1" x="960" y="150" textAnchor="middle" fill="var(--paper)" fontSize="72" fontWeight="800" letterSpacing="-2">MONEY IS EVERYWHERE.</text>
                    <text id="start-t2" x="960" y="220" textAnchor="middle" fill="var(--paper-60)" fontSize="52" opacity="0">But where does it actually go?</text>
                </g>

                {/* Scene 2: EARNING */}
                <g id="scene-earn" opacity="0.3">
                    <text x="1420" y="200" textAnchor="middle" fill="var(--paper)" fontSize="44" fontWeight="bold">EARNING</text>
                    <text x="1420" y="230" textAnchor="middle" fill="var(--paper-60)" fontSize="24">The sources of flow</text>
                    
                    {/* Inflow branches */}
                    <path d="M 1250 150 Q 1420 150, 1420 300" stroke="var(--good)" strokeWidth="2" fill="none" strokeDasharray="4,4"/>
                    <path d="M 1590 150 Q 1420 150, 1420 300" stroke="var(--good)" strokeWidth="2" fill="none" strokeDasharray="4,4"/>
                    <path d="M 1250 450 Q 1420 450, 1420 300" stroke="var(--good)" strokeWidth="2" fill="none" strokeDasharray="4,4"/>
                    <path d="M 1590 450 Q 1420 450, 1420 300" stroke="var(--good)" strokeWidth="2" fill="none" strokeDasharray="4,4"/>
                    
                    <text x="1240" y="145" textAnchor="end" fill="var(--paper-60)" fontSize="22">Work</text>
                    <text x="1600" y="145" textAnchor="start" fill="var(--paper-60)" fontSize="22">Skills</text>
                    <text x="1240" y="460" textAnchor="end" fill="var(--paper-60)" fontSize="22">Business</text>
                    <text x="1600" y="460" textAnchor="start" fill="var(--paper-60)" fontSize="22">Assets</text>

                    {/* Particles for inflow */}
                    <circle id="earn-p1" cx="1250" cy="150" r="4" fill="var(--good)" opacity="0"/>
                    <circle id="earn-p2" cx="1590" cy="150" r="4" fill="var(--good)" opacity="0"/>
                    <circle id="earn-p3" cx="1250" cy="450" r="4" fill="var(--good)" opacity="0"/>
                    <circle id="earn-p4" cx="1590" cy="450" r="4" fill="var(--good)" opacity="0"/>
                </g>

                {/* Scene 3: MINDSET */}
                <g id="scene-mindset" opacity="0.3">
                    <text x="1520" y="520" textAnchor="middle" fill="var(--paper)" fontSize="44" fontWeight="bold">THE FIRST CHOICE</text>
                    
                    {/* Split paths */}
                    <path id="path-now" d="M 1520 600 L 1750 600" stroke="var(--danger)" strokeWidth="4" fill="none" strokeDasharray="6,6"/>
                    <circle cx="1750" cy="600" r="12" fill="var(--ink-surface)" stroke="var(--danger)" strokeWidth="3"/>
                    <text x="1750" y="570" textAnchor="middle" fill="var(--danger)" fontSize="28" fontWeight="bold">NOW</text>
                    <text x="1750" y="635" textAnchor="middle" fill="var(--paper-60)" fontSize="22">Immediate Spend</text>
                    
                    <text x="1450" y="680" textAnchor="end" fill="var(--good)" fontSize="28" fontWeight="bold">LATER</text>
                    <text x="1450" y="705" textAnchor="end" fill="var(--paper-60)" fontSize="22">Accumulate</text>

                    <circle id="mindset-ghost" cx="1520" cy="600" r="15" fill="var(--danger)" opacity="0" filter="url(#glow-red)"/>
                </g>

                {/* Scene 4: BUDGETING */}
                <g id="scene-budget" opacity="0.3">
                    <text x="1000" y="700" textAnchor="middle" fill="var(--paper)" fontSize="44" fontWeight="bold">BUDGETING</text>
                    <text x="1000" y="730" textAnchor="middle" fill="var(--paper-60)" fontSize="24">Directing the flow</text>

                    {/* Buckets */}
                    <g transform="translate(850, 850)">
                        <rect x="0" y="0" width="80" height="120" rx="4" fill="none" stroke="var(--flow-border)" strokeWidth="2"/>
                        <rect id="fill-needs" x="2" y="118" width="76" height="0" rx="2" fill="url(#grad-budget)"/>
                        <text x="40" y="-15" textAnchor="middle" fill="var(--paper-60)" fontSize="22" fontWeight="500">NEEDS</text>
                        <text id="txt-needs" x="40" y="145" textAnchor="middle" fill="var(--paper)" fontSize="24" fontWeight="bold">0%</text>
                    </g>
                    <g transform="translate(960, 850)">
                        <rect x="0" y="0" width="80" height="120" rx="4" fill="none" stroke="var(--flow-border)" strokeWidth="2"/>
                        <rect id="fill-wants" x="2" y="118" width="76" height="0" rx="2" fill="url(#grad-budget)"/>
                        <text x="40" y="-15" textAnchor="middle" fill="var(--paper-60)" fontSize="22" fontWeight="500">WANTS</text>
                        <text id="txt-wants" x="40" y="145" textAnchor="middle" fill="var(--paper)" fontSize="24" fontWeight="bold">0%</text>
                    </g>
                    <g transform="translate(1070, 850)">
                        <rect x="0" y="0" width="80" height="120" rx="4" fill="none" stroke="var(--flow-border)" strokeWidth="2"/>
                        <rect id="fill-save" x="2" y="118" width="76" height="0" rx="2" fill="url(#grad-budget)"/>
                        <text x="40" y="-15" textAnchor="middle" fill="var(--paper-60)" fontSize="22" fontWeight="500">SAVINGS</text>
                        <text id="txt-save" x="40" y="145" textAnchor="middle" fill="var(--paper)" fontSize="24" fontWeight="bold">0%</text>
                    </g>

                    {/* Mini particles */}
                    <circle id="bp1" cx="1000" cy="800" r="6" fill="var(--n2000)" opacity="0"/>
                    <circle id="bp2" cx="1000" cy="800" r="6" fill="var(--n2000)" opacity="0"/>
                    <circle id="bp3" cx="1000" cy="800" r="6" fill="var(--n2000)" opacity="0"/>
                </g>

                {/* Scene 5: BANKING */}
                <g id="scene-bank" opacity="0.3">
                    <text x="500" y="560" textAnchor="middle" fill="var(--paper)" fontSize="44" fontWeight="bold">THE NETWORK</text>
                    <text x="500" y="602" textAnchor="middle" fill="var(--paper-60)" fontSize="24">Where your money actually travels</text>
                    
                    {/* Abstract Network */}
                    <path d="M 500 800 L 400 700 L 300 750 L 500 800 L 600 720 L 700 800 L 500 800" stroke="var(--flow-border)" strokeWidth="2" fill="none"/>
                    
                    {/* Nodes */}
                    <circle cx="400" cy="700" r="20" fill="var(--ink-surface)" stroke="var(--n50)" strokeWidth="2"/>
                    <text x="400" y="662" textAnchor="middle" fill="var(--n50)" fontSize="30" fontWeight="500">BANK</text>
                    
                    <circle cx="600" cy="720" r="20" fill="var(--ink-surface)" stroke="var(--n50)" strokeWidth="2"/>
                    <text x="632" y="728" textAnchor="start" fill="var(--n50)" fontSize="30" fontWeight="500">PAYMENTS</text>
                    
                    <circle cx="300" cy="750" r="15" fill="var(--ink-surface)" stroke="var(--paper-60)" strokeWidth="2"/>
                    <text x="272" y="757" textAnchor="end" fill="var(--paper-60)" fontSize="30" fontWeight="500">MERCHANT</text>

                    {/* Fast moving particle for UPI effect */}
                    <circle id="upi-particle" cx="500" cy="800" r="8" fill="var(--n50)" opacity="0" filter="url(#glow-cyan)"/>
                </g>

                {/* Scene 6: SAVING */}
                <g id="scene-save" opacity="0.3">
                    {/* The Reserve Shield */}
                    <circle id="reserve-shield" cx="400" cy="1100" r="80" fill="var(--ink-surface)" stroke="var(--n50)" strokeWidth="4" filter="url(#glow-cyan)" opacity="0.5"/>
                    <text x="400" y="1090" textAnchor="middle" fill="var(--paper)" fontSize="28" fontWeight="bold">EMERGENCY</text>
                    <text x="400" y="1115" textAnchor="middle" fill="var(--paper)" fontSize="28" fontWeight="bold">FUND</text>

                    {/* Expense Spike */}
                    <g id="expense-group" transform="translate(100, 1100)">
                        <path d="M 0 0 L 60 -15 L 120 0 L 60 15 Z" fill="var(--danger)" filter="url(#glow-red)"/>
                        <text x="60" y="-30" textAnchor="middle" fill="var(--danger)" fontSize="24" fontWeight="bold">₹12,000 EXPENSE</text>
                    </g>
                </g>

                {/* Scene 7: CREDIT */}
                <g id="scene-credit" opacity="0.3">
                    <text x="1000" y="1180" textAnchor="middle" fill="var(--paper)" fontSize="44" fontWeight="bold">CREDIT</text>
                    
                    {/* Borrow In */}
                    <path d="M 800 1200 Q 900 1200, 950 1300" stroke="var(--n200)" strokeWidth="6" fill="none" strokeDasharray="8,8"/>
                    <text x="800" y="1180" textAnchor="middle" fill="var(--n200)" fontSize="26">BORROW</text>
                    <circle id="credit-in-p" cx="800" cy="1200" r="8" fill="var(--n200)" opacity="0"/>

                    {/* Repay Out */}
                    <path d="M 1050 1300 Q 1150 1300, 1200 1400" stroke="var(--danger)" strokeWidth="10" fill="none" strokeDasharray="8,8"/>
                    <text x="1200" y="1430" textAnchor="middle" fill="var(--danger)" fontSize="26">REPAY + INTEREST</text>
                    
                    <text id="credit-msg" x="1000" y="1400" textAnchor="middle" fill="var(--paper-60)" fontSize="28" opacity="0">Money now = Obligation later.</text>
                </g>

                {/* Scene 8: MATH */}
                <g id="scene-math" opacity="0.3">
                    <text x="1420" y="1150" textAnchor="middle" fill="var(--paper)" fontSize="44" fontWeight="bold">MONEY MATH</text>
                    <text x="1420" y="1180" textAnchor="middle" fill="var(--paper-60)" fontSize="24">Time & Compounding</text>

                    {/* Axes */}
                    <line x1="1250" y1="1400" x2="1600" y2="1400" stroke="var(--flow-border)" strokeWidth="2"/>
                    <line x1="1250" y1="1400" x2="1250" y2="1150" stroke="var(--flow-border)" strokeWidth="2"/>
                    <text x="1620" y="1405" fill="var(--paper-60)" fontSize="22">TIME</text>

                    {/* Exponential Curve */}
                    <path id="exp-curve" d="M 1250 1400 Q 1500 1400, 1550 1150" stroke="var(--n200)" strokeWidth="4" fill="none" strokeDasharray="500" strokeDashoffset="500" filter="url(#glow-primary)"/>

                    {/* Clones (Hidden initially) */}
                    <g id="math-clones">
                        {/* We will generate these dynamically or just place a few */}
                        <circle cx="1300" cy="1380" r="10" fill="var(--n2000)" opacity="0" className="mc"/>
                        <circle cx="1350" cy="1350" r="12" fill="var(--n2000)" opacity="0" className="mc"/>
                        <circle cx="1400" cy="1300" r="15" fill="var(--n2000)" opacity="0" className="mc"/>
                        <circle cx="1450" cy="1220" r="18" fill="var(--n2000)" opacity="0" className="mc"/>
                        <circle cx="1500" cy="1100" r="22" fill="var(--n2000)" opacity="0" className="mc"/>
                    </g>
                </g>

                {/* Scene 9: INVESTING */}
                <g id="scene-invest" opacity="0.3">
                    <text x="1520" y="1480" textAnchor="middle" fill="var(--paper)" fontSize="44" fontWeight="bold">INVESTING</text>
                    
                    {/* Branches */}
                    {/* Equity (Volatile) */}
                    <path d="M 1520 1500 Q 1600 1550, 1520 1600 T 1520 1700 L 1420 1800" stroke="var(--danger)" strokeWidth="3" fill="none"/>
                    <text x="1620" y="1600" fill="var(--danger)" fontSize="22">EQUITY (High Risk)</text>
                    
                    {/* Fixed (Straight) */}
                    <path d="M 1520 1500 L 1450 1650 L 1420 1800" stroke="var(--n50)" strokeWidth="3" fill="none"/>
                    <text x="1350" y="1650" fill="var(--n50)" fontSize="22">FIXED (Steady)</text>
                    
                    {/* Gold (Gentle) */}
                    <path d="M 1520 1500 Q 1550 1650, 1420 1800" stroke="var(--n200)" strokeWidth="3" fill="none"/>
                    <text x="1500" y="1680" fill="var(--n200)" fontSize="22">GOLD (Stable)</text>

                    {/* Portfolio Recombine */}
                    <circle cx="1420" cy="1800" r="30" fill="none" stroke="var(--good)" strokeWidth="4" strokeDasharray="8,4"/>
                    <text x="1420" y="1750" textAnchor="middle" fill="var(--good)" fontSize="24" fontWeight="bold">PORTFOLIO</text>

                    {/* Ghost particles for branches */}
                    <circle id="inv-p1" cx="1520" cy="1500" r="8" fill="var(--danger)" opacity="0"/>
                    <circle id="inv-p2" cx="1520" cy="1500" r="8" fill="var(--n50)" opacity="0"/>
                    <circle id="inv-p3" cx="1520" cy="1500" r="8" fill="var(--n200)" opacity="0"/>
                </g>

                {/* Scene 10: DESTINATIONS */}
                <g id="scene-dest" opacity="0.3">
                    <text x="1000" y="1650" textAnchor="middle" fill="var(--paper)" fontSize="44" fontWeight="bold">DESTINATIONS</text>
                    
                    {/* Orbit Rings */}
                    <circle cx="1000" cy="1800" r="100" fill="none" stroke="var(--flow-border)" strokeWidth="1"/>
                    <circle cx="1000" cy="1800" r="150" fill="none" stroke="var(--flow-border)" strokeWidth="1"/>

                    {/* Nodes */}
                    <g id="dest-nodes">
                        <g transform="translate(1000, 1700)"><circle r="15" fill="var(--ink-surface)" stroke="var(--n50)" strokeWidth="2"/><text y="30" textAnchor="middle" fill="var(--n50)" fontSize="20">STOCKS</text></g>
                        <g transform="translate(1100, 1800)"><circle r="15" fill="var(--ink-surface)" stroke="var(--n200)" strokeWidth="2"/><text y="30" textAnchor="middle" fill="var(--n200)" fontSize="20">GOLD</text></g>
                        <g transform="translate(1000, 1900)"><circle r="15" fill="var(--ink-surface)" stroke="var(--good)" strokeWidth="2"/><text y="30" textAnchor="middle" fill="var(--good)" fontSize="20">MUTUAL FUNDS</text></g>
                        <g transform="translate(850, 1800)"><circle r="15" fill="var(--ink-surface)" stroke="var(--n2000)" strokeWidth="2"/><text y="30" textAnchor="middle" fill="var(--n2000)" fontSize="20">FD / RD</text></g>
                    </g>
                </g>

                {/* Scene 11: SCAMS */}
                <g id="scene-scam" opacity="0.3">
                    <text x="500" y="1700" textAnchor="middle" fill="var(--paper)" fontSize="44" fontWeight="bold">PROTECT YOUR FLOW</text>
                    
                    {/* Scam Branch */}
                    <path d="M 600 1800 L 580 1850 L 620 1890 L 570 1940 L 600 1980" stroke="var(--danger)" strokeWidth="6" fill="none" filter="url(#glow-red)"/>
                    <text x="630" y="1850" fill="var(--danger)" fontSize="26" fontWeight="bold">"30% GUARANTEED"</text>
                    
                    {/* Warning Signs */}
                    <g id="scam-warnings" opacity="0">
                        <rect x="650" y="1880" width="120" height="30" rx="4" fill="var(--danger)"/>
                        <text x="710" y="1900" textAnchor="middle" fill="var(--ink-surface)" fontSize="22" fontWeight="bold">URGENCY!</text>
                        
                        <rect x="620" y="1930" width="140" height="30" rx="4" fill="var(--danger)"/>
                        <text x="690" y="1950" textAnchor="middle" fill="var(--ink-surface)" fontSize="22" fontWeight="bold">UNKNOWN SOURCE</text>
                    </g>
                </g>

                {/* FINAL SCENE MARKER */}
                <g id="scene-final">
                    <circle cx="400" cy="2100" r="40" fill="var(--ink-surface)" stroke="var(--n2000)" strokeWidth="4"/>
                    <circle cx="400" cy="2100" r="20" fill="var(--n2000)" filter="url(#glow-primary)"/>
                </g>

                {/* THE PROTAGONIST PARTICLE */}
                <g id="protagonist" transform="translate(960, 300)">
                    <circle id="p-core" r="24" fill="var(--ink-surface)" stroke="var(--n2000)" strokeWidth="6" filter="url(#glow-primary)"/>
                    <text textAnchor="middle" dominantBaseline="central" fill="var(--paper)" fontSize="44" fontWeight="bold" y="2">₹</text>
                </g>
            </g> {/* End Camera */}

            {/* Fixed UI Layer (Appears at the end) */}
            <g id="final-ui" opacity="0" pointerEvents="none">
                <rect width="1920" height="1080" fill="var(--ink)" opacity="0.6"/>
                <text x="960" y="450" textAnchor="middle" fill="var(--paper)" fontSize="72" fontWeight="800" letterSpacing="-1">NOW YOU SEE HOW MONEY MOVES.</text>
                <text x="960" y="520" textAnchor="middle" fill="var(--paper-60)" fontSize="32">Everything is connected. Your choices shape the flow.</text>
                
                {/* CTA Button */}
                <g transform="translate(810, 600)" className={styles.btnInteractive} onClick={start} role="button" tabIndex={0}>
                    <rect width="300" height="80" rx="40" fill="var(--n2000)" />
                    <text x="150" y="48" textAnchor="middle" fill="var(--ink-surface)" fontSize="32" fontWeight="bold">START LEARNING</text>
                </g>
            </g>

        </svg>      </div>
    </section>
  );
}
