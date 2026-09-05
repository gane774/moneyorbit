import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

/**
 * The reference tables (journeys, experiences, concepts) are the ONLY place
 * the admin dashboard gets a topic name from, and they are populated from
 * this generated migration. When the curriculum was revised, the content was
 * rewritten but the migration was not regenerated and never re-applied, so
 * the dashboard went on naming five journeys that had already been deleted
 * for four days without anything failing.
 *
 * Regenerating is one command; noticing that you needed to is the hard part.
 * This test is the noticing.
 */
describe('seed migration', () => {
  it('matches what gen-seed.ts produces from the current content', () => {
    const generated = execFileSync('npx', ['tsx', 'scripts/gen-seed.ts'], {
      encoding: 'utf8',
      cwd: process.cwd(),
    });
    const committed = readFileSync('supabase/migrations/0003_seed_content.sql', 'utf8');
    expect(
      committed.trimEnd(),
      'Content changed without regenerating the seed. Run:\n' +
        '  npx tsx scripts/gen-seed.ts > supabase/migrations/0003_seed_content.sql\n' +
        'and remember the live database still has to have it applied.',
    ).toBe(generated.trimEnd());
  }, 60_000);

  it('has no concept that no experience teaches', () => {
    const sql = readFileSync('supabase/migrations/0003_seed_content.sql', 'utf8');
    const block = (start: string) =>
      sql.slice(sql.indexOf(start)).split('on conflict')[0];

    const declared = [...block('insert into concepts').matchAll(/^ {2}\('([a-z-]+)'/gm)]
      .map((m) => m[1]);
    const taught = new Set(
      [...block('insert into experience_concepts').matchAll(/, '([a-z-]+)'\)/g)]
        .map((m) => m[1]),
    );

    /* A concept nothing teaches cannot be reached, so it can only ever show
       up in the admin's difficulty table as a leftover from a retired
       lesson -- which is exactly how the three scam concepts survived.

       These four are known, so they are listed rather than quietly tolerated.
       Three are non-core -- no mastery machine, so an unreachable one costs
       nothing. `minimum-payment-trap` is core and still unreachable: no
       journey covers credit cards, the Credit journey being EMIs and loan
       tenure end to end. The homepage used to promise it twice; that copy is
       gone, so nothing now claims it is taught. It is kept in the content as
       vocabulary a future credit-cards lesson would want, and named here so
       that staying unreachable is a visible choice rather than an oversight. */
    const KNOWN_UNTAUGHT = [
      'gross-vs-net', 'fixed-vs-variable', 'minimum-payment-trap', 'sip',
    ];
    expect(declared.filter((c) => !taught.has(c)).sort())
      .toEqual([...KNOWN_UNTAUGHT].sort());
  });
});
