-- Re-sync the reference tables to the revised curriculum.
--
-- 0003 is generated from the TypeScript content and is idempotent, but it was
-- only ever APPLIED once, at Phase 2. Three content updates, the scams
-- retirement and the curriculum revision all changed the content without the
-- database being re-seeded, so every admin panel that names a journey or a
-- concept was still reporting the old course: Money Mindset, Earning &
-- Income, Banking & Digital Payments, Saving & Emergency Funds and Don't Get
-- Scammed. Those are read straight out of `journeys` and `concepts` by
-- admin_journey_funnel() and admin_concept_difficulty().
--
-- Two things 0003 alone could not fix, which is why this migration exists:
--
--   1. It upserts and never deletes. Journey and experience ids are stable
--      (j01..j11, e01..e11) so those rows simply update in place -- and
--      because they do, no progress row is touched. Concepts are keyed by
--      slug, so a retired concept has no new row to be overwritten by and
--      would have survived for ever.
--   2. experience_concepts inserts `on conflict do nothing`, so a pair whose
--      lesson has been rewritten is never cleaned up.
--
-- Deleting the eight retired concepts cascades 21 mastery rows. Every one
-- predates the 2026-09-01 revision, i.e. each records understanding of a
-- lesson no student can reach any more. Snapshot taken first:
-- supabase/backups/2026-09-02_pre_curriculum_resync.sql
--
-- Applied to the live project on 2026-09-02. Re-running it is safe.

insert into journeys (id, slug, title, short_title, order_index, color_token, est_minutes) values
  ('j01', 'inflation', 'Inflation', 'Inflation', 1, 'n10', 4),
  ('j02', 'credit-score', 'Credit Score', 'Credit Score', 2, 'n20', 4),
  ('j03', 'budgeting', 'Budgeting & Cash-Flow', 'Budgeting', 3, 'n50', 4),
  ('j04', 'investments', 'Investments', 'Investments', 4, 'n100', 4),
  ('j05', 'banking', 'Banking', 'Banking', 5, 'n200', 4),
  ('j06', 'credit-debt', 'Credit, Loans & Debt', 'Credit & Debt', 6, 'n2000', 4),
  ('j07', 'money-math', 'The Math Behind Money', 'Money Math', 7, 'n500', 4),
  ('j08', 'investing-basics', 'Investing Basics', 'Investing', 8, 'n10', 4),
  ('j09', 'destinations', 'Where Can Your Money Actually Go?', 'Destinations', 9, 'n50', 4),
  ('j10', 'planning', 'Planning Your Money Life', 'Planning', 10, 'n100', 4),
  ('j11', 'final-challenge', 'Run a Financial Life', 'Final', 11, 'n200', 4)
on conflict (id) do update set
  slug=excluded.slug, title=excluded.title, short_title=excluded.short_title,
  order_index=excluded.order_index, color_token=excluded.color_token, est_minutes=excluded.est_minutes;

insert into concepts (slug, title, is_core_concept) values
  ('purchasing-power', 'Purchasing power', true),
  ('inflation-rate', 'Inflation rate', true),
  ('real-vs-nominal', 'Real vs nominal return', true),
  ('credit-history', 'Credit history', true),
  ('payment-history', 'Payment history', true),
  ('credit-utilisation', 'Credit utilisation', true),
  ('hard-inquiries', 'Hard inquiries', false),
  ('needs-vs-wants', 'Needs vs wants', true),
  ('gross-vs-net', 'Gross vs net pay', false),
  ('budgeting', 'Budgeting', true),
  ('cash-flow', 'Cash flow', true),
  ('fixed-vs-variable', 'Fixed vs variable costs', false),
  ('equity-ownership', 'Owning equity', true),
  ('mutual-funds', 'Mutual funds', true),
  ('instrument-types', 'Types of investment', true),
  ('expense-ratio', 'Expense ratio', false),
  ('how-banks-work', 'How banks actually work', true),
  ('account-types', 'Savings vs current accounts', true),
  ('choosing-a-bank', 'Choosing a bank', true),
  ('saving-vs-investing', 'Saving vs investing', true),
  ('emergency-fund', 'Emergency fund', true),
  ('principal', 'Principal', true),
  ('interest', 'Interest', true),
  ('emi-true-cost', 'What an EMI really costs', true),
  ('loan-tenure', 'Loan tenure', true),
  ('credit-score', 'Credit score', true),
  ('minimum-payment-trap', 'The minimum payment trap', true),
  ('compounding', 'Compounding', true),
  ('simple-vs-compound', 'Simple vs compound interest', true),
  ('inflation', 'Inflation', true),
  ('time-value', 'Time value of money', true),
  ('risk-return', 'Risk and return', true),
  ('diversification', 'Diversification', true),
  ('volatility', 'Volatility', false),
  ('sip', 'Systematic investing', false),
  ('liquidity', 'Liquidity', true),
  ('time-horizon', 'Matching money to time horizon', true),
  ('goal-setting', 'Financial goal setting', true),
  ('net-worth', 'Net worth', true)
on conflict (slug) do update set
  title=excluded.title, is_core_concept=excluded.is_core_concept;

insert into experiences (id, journey_id, slug, title, mechanic_type, is_core, time_sensitive) values
  ('e01', 'j01', 'why-money-loses-value', 'Why Does Money Lose Value?', 'inflation-basket', true, true),
  ('e02', 'j02', 'the-number-behind-your-credit', 'The Number Behind Your Credit', 'credit-profiles', true, false),
  ('e03', 'j03', 'can-you-survive-the-month', 'What''s Wrong With This Budget?', 'find-problem', true, false),
  ('e04', 'j04', 'what-are-you-investing-in', 'What Are You Actually Investing In?', 'match-instrument', true, false),
  ('e05', 'j05', 'how-does-a-bank-work', 'How Does a Bank Actually Work?', 'bank-choice', true, false),
  ('e06', 'j06', 'what-does-this-loan-really-cost', 'What Does This Loan Really Cost?', 'emi-slider', true, false),
  ('e07', 'j07', 'watch-10000-grow', 'Watch ₹10,000 Grow', 'compound-curve', true, true),
  ('e08', 'j08', 'pick-your-risk', 'Pick Your Risk', 'allocate-portfolio', true, false),
  ('e09', 'j09', 'match-the-goal', 'Match the Goal', 'match-goal', true, false),
  ('e10', 'j10', 'your-money-map', 'Your Money Map', 'goal-planner', true, false),
  ('e11', 'j11', 'final-challenge', 'Run a Financial Life', 'final-challenge', true, false)
on conflict (id) do update set
  journey_id=excluded.journey_id, slug=excluded.slug, title=excluded.title,
  mechanic_type=excluded.mechanic_type, is_core=excluded.is_core, time_sensitive=excluded.time_sensitive;

-- Pairs before concepts, so a stale (experience, concept) link cannot outlive
-- the lesson that created it.
delete from experience_concepts where (experience_id, concept_slug) not in (
  ('e01','inflation'),('e01','purchasing-power'),('e01','inflation-rate'),('e01','real-vs-nominal'),
  ('e02','credit-score'),('e02','credit-history'),('e02','payment-history'),
  ('e02','credit-utilisation'),('e02','hard-inquiries'),
  ('e03','budgeting'),('e03','cash-flow'),('e03','needs-vs-wants'),
  ('e04','equity-ownership'),('e04','mutual-funds'),('e04','instrument-types'),('e04','expense-ratio'),
  ('e05','how-banks-work'),('e05','account-types'),('e05','choosing-a-bank'),('e05','interest'),
  ('e06','principal'),('e06','interest'),('e06','emi-true-cost'),('e06','loan-tenure'),
  ('e07','compounding'),('e07','simple-vs-compound'),('e07','inflation'),('e07','time-value'),
  ('e08','risk-return'),('e08','diversification'),('e08','volatility'),
  ('e09','liquidity'),('e09','time-horizon'),('e09','saving-vs-investing'),
  ('e10','goal-setting'),('e10','net-worth'),('e10','time-horizon'),
  ('e11','budgeting'),('e11','emergency-fund'),('e11','net-worth')
);

insert into experience_concepts (experience_id, concept_slug) values
  ('e01', 'inflation'), ('e01', 'purchasing-power'), ('e01', 'inflation-rate'), ('e01', 'real-vs-nominal'),
  ('e02', 'credit-score'), ('e02', 'credit-history'), ('e02', 'payment-history'),
  ('e02', 'credit-utilisation'), ('e02', 'hard-inquiries'),
  ('e03', 'budgeting'), ('e03', 'cash-flow'), ('e03', 'needs-vs-wants'),
  ('e04', 'equity-ownership'), ('e04', 'mutual-funds'), ('e04', 'instrument-types'), ('e04', 'expense-ratio'),
  ('e05', 'how-banks-work'), ('e05', 'account-types'), ('e05', 'choosing-a-bank'), ('e05', 'interest'),
  ('e06', 'principal'), ('e06', 'interest'), ('e06', 'emi-true-cost'), ('e06', 'loan-tenure'),
  ('e07', 'compounding'), ('e07', 'simple-vs-compound'), ('e07', 'inflation'), ('e07', 'time-value'),
  ('e08', 'risk-return'), ('e08', 'diversification'), ('e08', 'volatility'),
  ('e09', 'liquidity'), ('e09', 'time-horizon'), ('e09', 'saving-vs-investing'),
  ('e10', 'goal-setting'), ('e10', 'net-worth'), ('e10', 'time-horizon'),
  ('e11', 'budgeting'), ('e11', 'emergency-fund'), ('e11', 'net-worth')
on conflict do nothing;

delete from concepts where slug in (
  'opportunity-cost', 'delayed-gratification', 'active-income', 'passive-income',
  'upi-safety', 'scam-red-flags', 'guaranteed-returns', 'phishing-otp'
);
