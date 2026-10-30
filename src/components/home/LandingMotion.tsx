'use client';

import { useEffect } from 'react';

/**
 * Landing-page motion, in one place so it can be reasoned about as a whole.
 *
 *  - Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger and the
 *    scroll position never disagree.
 *  - [data-reveal]: section intros rise in once as they enter. Siblings in
 *    the same section stagger.
 *  - [data-map]: the journey map is scrubbed by scroll. Stops light up in
 *    order and the rail fills, so the "44 minutes" reads as a path.
 *  - [data-count]: numbers count up the first time they are seen.
 *
 * Nothing here is required to read the page: every element is fully visible
 * in the server HTML, and reduced-motion users get none of it.
 */
export default function LandingMotion() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let killed = false;
    let cleanup = () => {};

    (async () => {
      const [{ gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
        import('gsap'), import('gsap/ScrollTrigger'), import('lenis'),
      ]);
      if (killed) return;
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.9 });
      lenis.on('scroll', ScrollTrigger.update);
      const tick = (t: number) => lenis.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      const ctx = gsap.context(() => {
        /* Section intros. Grouped by section so each one staggers on its own. */
        document.querySelectorAll<HTMLElement>('section').forEach((sec) => {
          const items = sec.querySelectorAll<HTMLElement>('[data-reveal]');
          if (!items.length) return;
          gsap.from(items, {
            y: 26, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08,
            scrollTrigger: { trigger: sec, start: 'top 78%', once: true },
          });
        });

        /* Journey map, scrubbed both ways. */
        const map = document.querySelector<HTMLElement>('[data-map]');
        if (map) {
          const stops = Array.from(map.querySelectorAll<HTMLElement>('li'));
          map.dataset.scrub = '1'; // dims unlit stops; only set when the scrub runs
          ScrollTrigger.create({
            trigger: map,
            start: 'top 80%',
            end: 'bottom 45%',
            scrub: true,
            onUpdate: (self) => {
              map.style.setProperty('--p', self.progress.toFixed(4));
              const lit = Math.round(self.progress * stops.length);
              stops.forEach((s, i) => s.toggleAttribute('data-lit', i < lit));
            },
          });
        }

        /* Count-ups. */
        document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
          const to = Number(el.dataset.count);
          const prefix = el.dataset.prefix ?? '';
          const obj = { v: 0 };
          el.textContent = prefix + '0';
          gsap.to(obj, {
            v: to, duration: 1.4, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            onUpdate: () => { el.textContent = prefix + Math.round(obj.v); },
          });
        });
      });

      cleanup = () => {
        ctx.revert();
        document.querySelector<HTMLElement>('[data-map]')?.removeAttribute('data-scrub');
        gsap.ticker.remove(tick);
        lenis.destroy();
      };
    })();

    return () => { killed = true; cleanup(); };
  }, []);

  return null;
}
