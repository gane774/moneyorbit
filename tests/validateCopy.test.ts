import { describe, it, expect } from 'vitest';
import { validateScreenCopy } from '@/lib/validateCopy';
import { variantFor, EXPERIENCES } from '@/content/experiences';

const good = () => JSON.parse(JSON.stringify(variantFor(EXPERIENCES.find(e => e.id === 'e01')!, '15-16')!.copy));

describe('CMS validation — the guard between an editor and a broken lesson', () => {
  it('accepts real shipping content', () => {
    expect(validateScreenCopy(good()).ok).toBe(true);
  });

  it('rejects a Decide option with no matching verdict', () => {
    // The failure a student actually experiences: choose, then a blank screen.
    const c = good();
    const id = c.decide.options[0].id;          // derived, not hardcoded
    delete c.feedback.verdicts[id];
    const r = validateScreenCopy(c);
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toContain(`missing a verdict for decide option "${id}"`);
  });

  it('rejects a quiz with no correct answer, and one with several', () => {
    const none = good();
    none.practice.options.forEach((o: { correct: boolean }) => { o.correct = false; });
    expect(validateScreenCopy(none).errors.join(' ')).toContain('exactly one correct option (found 0)');

    const many = good();
    many.practice.options.forEach((o: { correct: boolean }) => { o.correct = true; });
    expect(validateScreenCopy(many).errors.join(' ')).toContain('exactly one correct option (found 3)');
  });

  it('rejects empty required text rather than rendering a blank screen', () => {
    const c = good();
    c.hook.headline = '   ';
    expect(validateScreenCopy(c).errors.join(' ')).toContain('hook.headline');
  });

  it('requires the interact lockedCta, which has no safe default', () => {
    const c = good();
    delete c.interact.lockedCta;
    expect(validateScreenCopy(c).errors.join(' ')).toContain('interact.lockedCta');
  });

  it('requires a valid verdict tone', () => {
    const c = good();
    c.feedback.verdicts[c.decide.options[0].id].tone = 'neutral';
    expect(validateScreenCopy(c).errors.join(' ')).toContain('tone must be');
  });

  it('allows a committing Decide screen with no options', () => {
    const c = good();
    delete c.decide.options;
    c.feedback.verdicts = { commit: { tone: 'good', title: 'Done', body: 'Body text.' } };
    expect(validateScreenCopy(c).ok).toBe(true);
  });

  it('never throws on junk input', () => {
    for (const junk of [null, undefined, 42, 'string', [], {}]) {
      expect(() => validateScreenCopy(junk)).not.toThrow();
      expect(validateScreenCopy(junk).ok).toBe(false);
    }
  });
});
