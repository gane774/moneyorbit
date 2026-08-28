import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/** Contrast maths, so the design tokens are checked rather than eyeballed. */
function lin(c: number) { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }
function L([r, g, b]: number[]) { return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); }
function ratio(a: number[], b: number[]) {
  const [x, y] = [L(a), L(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
const hex = (h: string) => {
  const s = h.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
};
const over = (fg: number[], bg: number[], a: number) => fg.map((c, i) => c * a + bg[i] * (1 - a));

const INK = hex('15180F');
const CANVAS = hex('EFF0EA');
const PAPER = hex('FBFBF8');
const PAPER_C = hex('FBFBF8');
const FLOW_INK = hex('121316');

const css = fs.readFileSync(path.resolve(__dirname, '../src/app/globals.css'), 'utf8');

describe('accessibility — colour contrast (WCAG AA, 4.5:1 for body text)', () => {
  it('--ink-60 passes on both light surfaces', () => {
    const m = css.match(/--ink-60:rgba\(21,24,15,\.(\d+)\)/);
    expect(m, '--ink-60 not found').toBeTruthy();
    const a = Number(`0.${m![1]}`);
    expect(ratio(over(INK, CANVAS, a), CANVAS)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(over(INK, PAPER, a), PAPER)).toBeGreaterThanOrEqual(4.5);
  });

  it('--ink-35 passes on both light surfaces', () => {
    // This one failed at 2.12:1 for several releases. It is a regression guard.
    const m = css.match(/--ink-35:rgba\(21,24,15,\.(\d+)\)/);
    expect(m).toBeTruthy();
    const a = Number(`0.${m![1]}`);
    expect(ratio(over(INK, CANVAS, a), CANVAS)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(over(INK, PAPER, a), PAPER)).toBeGreaterThanOrEqual(4.5);
  });

  it('the two tiers stay visually distinct', () => {
    const a60 = Number(`0.${css.match(/--ink-60:rgba\(21,24,15,\.(\d+)\)/)![1]}`);
    const a35 = Number(`0.${css.match(/--ink-35:rgba\(21,24,15,\.(\d+)\)/)![1]}`);
    expect(a60 - a35).toBeGreaterThan(0.1);
  });

  it('paper text passes on the dark lesson and animation surfaces', () => {
    expect(ratio(PAPER_C, INK)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(PAPER_C, FLOW_INK)).toBeGreaterThanOrEqual(4.5);
  });

  it('the lifted dark-surface tokens pass, since the base ones do not', () => {
    expect(ratio(hex('E4897A'), INK)).toBeGreaterThanOrEqual(4.5); // --danger-lift
    expect(ratio(PAPER_C, hex('3D4490'))).toBeGreaterThanOrEqual(4.5); // paper on --indigo-lift
  });
});

describe('accessibility — motion and focus', () => {
  it('honours prefers-reduced-motion', () => {
    expect(css).toMatch(/prefers-reduced-motion/);
  });
  it('defines a visible focus style', () => {
    expect(css).toMatch(/:focus-visible/);
  });
});
