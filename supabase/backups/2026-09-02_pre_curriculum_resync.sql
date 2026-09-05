-- Snapshot of the live reference tables taken 2026-09-02, immediately BEFORE
-- migration 0005 re-synced them to the revised curriculum.
--
-- The reference tables had never been re-seeded after the three content
-- updates or the curriculum revision, so the admin dashboard was still naming
-- Money Mindset, Earning & Income, Banking & Digital Payments, Saving &
-- Emergency Funds and Don't Get Scammed — journeys that had already been
-- removed from the app.
--
-- Kept because the re-sync deletes eight concepts and, by cascade, the 21
-- mastery rows recorded against them. Every one of those rows predates the
-- 2026-09-01 revision, i.e. they record understanding of lessons no student
-- can reach any more. This file exists so that is reversible, not because it
-- is expected to be reversed.

-- ---------------------------------------------------------------- journeys
insert into journeys (id, slug, title, short_title, order_index, color_token, est_minutes) values
  ('j01', 'money-mindset', 'Money Mindset', 'Mindset', 1, 'n10', 4),
  ('j02', 'earning-income', 'Earning & Income', 'Earning', 2, 'n20', 4),
  ('j03', 'budgeting', 'Budgeting & Cash-Flow', 'Budgeting', 3, 'n50', 4),
  ('j04', 'banking-payments', 'Banking & Digital Payments', 'Banking', 4, 'n100', 4),
  ('j05', 'saving', 'Saving & Emergency Funds', 'Saving', 5, 'n200', 4),
  ('j06', 'credit-debt', 'Credit, Loans & Debt', 'Credit & Debt', 6, 'n2000', 4),
  ('j07', 'money-math', 'The Math Behind Money', 'Money Math', 7, 'n500', 4),
  ('j08', 'investing-basics', 'Investing Basics', 'Investing', 8, 'n10', 4),
  ('j09', 'destinations', 'Where Can Your Money Actually Go?', 'Destinations', 9, 'n50', 4),
  ('j10', 'planning', 'Planning Your Money Life', 'Planning', 10, 'n100', 4),
  ('j11', 'scams', 'Don''t Get Scammed', 'Scams', 11, 'n200', 4)
on conflict (id) do update set
  slug=excluded.slug, title=excluded.title, short_title=excluded.short_title,
  order_index=excluded.order_index, color_token=excluded.color_token, est_minutes=excluded.est_minutes;

-- ------------------------------------------------------------- experiences
insert into experiences (id, journey_id, slug, title, mechanic_type, is_core, time_sensitive) values
  ('e01', 'j01', 'buy-it-now-or-wait', 'Buy It Now, or Wait?', 'choice-fastforward', true, false),
  ('e02', 'j02', 'two-ways-to-get-paid', 'Two Ways to Get Paid', 'compare-income', true, false),
  ('e03', 'j03', 'can-you-survive-the-month', 'Can You Survive the Month?', 'allocate-events', true, false),
  ('e04', 'j04', 'follow-the-500', 'Follow the ₹500', 'flow-trace', true, false),
  ('e05', 'j05', 'the-rainy-day-test', 'The Rainy Day Test', 'parallel-shock', true, false),
  ('e06', 'j06', 'what-does-this-loan-really-cost', 'What Does This Loan Really Cost?', 'emi-slider', true, false),
  ('e07', 'j07', 'watch-10000-grow', 'Watch ₹10,000 Grow', 'compound-curve', true, true),
  ('e08', 'j08', 'pick-your-risk', 'Pick Your Risk', 'allocate-portfolio', true, false),
  ('e09', 'j09', 'match-the-goal', 'Match the Goal', 'match-goal', true, false),
  ('e10', 'j10', 'your-money-map', 'Your Money Map', 'goal-planner', true, false),
  ('e11', 'j11', 'spot-the-scam', 'Spot the Scam', 'spot-scam', true, false)
on conflict (id) do update set
  journey_id=excluded.journey_id, slug=excluded.slug, title=excluded.title,
  mechanic_type=excluded.mechanic_type, is_core=excluded.is_core, time_sensitive=excluded.time_sensitive;

-- ---------------------------------------------------------------- concepts
insert into concepts (slug, title, is_core_concept) values
  ('opportunity-cost', 'Opportunity cost', true),
  ('delayed-gratification', 'Delayed gratification', true),
  ('needs-vs-wants', 'Needs vs wants', true),
  ('active-income', 'Active income', true),
  ('passive-income', 'Passive income', true),
  ('gross-vs-net', 'Gross vs net pay', false),
  ('budgeting', 'Budgeting', true),
  ('cash-flow', 'Cash flow', true),
  ('fixed-vs-variable', 'Fixed vs variable costs', false),
  ('how-banks-work', 'How banks actually work', true),
  ('upi-safety', 'UPI and payment safety', true),
  ('account-types', 'Account types', false),
  ('emergency-fund', 'Emergency fund', true),
  ('saving-vs-investing', 'Saving vs investing', true),
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
  ('net-worth', 'Net worth', true),
  ('scam-red-flags', 'Scam red flags', true),
  ('guaranteed-returns', 'The "guaranteed returns" lie', true),
  ('phishing-otp', 'OTP and phishing fraud', true)
on conflict (slug) do update set
  title=excluded.title, is_core_concept=excluded.is_core_concept;

-- ----------------------------------------------------- experience_concepts
insert into experience_concepts (experience_id, concept_slug) values
  ('e01', 'opportunity-cost'), ('e01', 'delayed-gratification'), ('e01', 'needs-vs-wants'),
  ('e02', 'active-income'), ('e02', 'passive-income'),
  ('e03', 'budgeting'), ('e03', 'cash-flow'), ('e03', 'needs-vs-wants'),
  ('e04', 'how-banks-work'), ('e04', 'upi-safety'),
  ('e05', 'emergency-fund'), ('e05', 'saving-vs-investing'),
  ('e06', 'principal'), ('e06', 'interest'), ('e06', 'emi-true-cost'), ('e06', 'loan-tenure'),
  ('e07', 'compounding'), ('e07', 'simple-vs-compound'), ('e07', 'inflation'), ('e07', 'time-value'),
  ('e08', 'risk-return'), ('e08', 'diversification'), ('e08', 'volatility'),
  ('e09', 'liquidity'), ('e09', 'time-horizon'), ('e09', 'saving-vs-investing'),
  ('e10', 'goal-setting'), ('e10', 'net-worth'), ('e10', 'time-horizon'),
  ('e11', 'scam-red-flags'), ('e11', 'guaranteed-returns'), ('e11', 'phishing-otp')
on conflict do nothing;

-- ----------------------------------------- mastery rows lost to the cascade
insert into mastery (student_id, concept_slug, state, last_updated) values
  ('3727e8c9-3bd9-4f2a-9e37-8ddc06ec7318', 'opportunity-cost',      'understood', '2026-08-30T13:48:49.556+00'),
  ('3727e8c9-3bd9-4f2a-9e37-8ddc06ec7318', 'delayed-gratification', 'understood', '2026-08-30T13:48:49.556+00'),
  ('3727e8c9-3bd9-4f2a-9e37-8ddc06ec7318', 'active-income',         'understood', '2026-08-30T13:48:49.556+00'),
  ('3727e8c9-3bd9-4f2a-9e37-8ddc06ec7318', 'passive-income',        'understood', '2026-08-30T13:48:49.556+00'),
  ('3727e8c9-3bd9-4f2a-9e37-8ddc06ec7318', 'upi-safety',            'understood', '2026-08-30T13:48:49.556+00'),
  ('3727e8c9-3bd9-4f2a-9e37-8ddc06ec7318', 'scam-red-flags',        'understood', '2026-08-30T13:48:49.556+00'),
  ('3727e8c9-3bd9-4f2a-9e37-8ddc06ec7318', 'guaranteed-returns',    'understood', '2026-08-30T13:48:49.556+00'),
  ('3727e8c9-3bd9-4f2a-9e37-8ddc06ec7318', 'phishing-otp',          'understood', '2026-08-30T13:48:49.556+00'),
  ('0da804e2-6b42-47f3-a9c5-1b8a22f443e0', 'opportunity-cost',      'understood', '2026-08-28T19:04:10.06+00'),
  ('0da804e2-6b42-47f3-a9c5-1b8a22f443e0', 'delayed-gratification', 'understood', '2026-08-28T19:04:10.06+00'),
  ('587922c0-4ee2-4f80-93e0-7ec9c1d2b731', 'opportunity-cost',      'understood', '2026-08-30T14:51:59.168+00'),
  ('587922c0-4ee2-4f80-93e0-7ec9c1d2b731', 'delayed-gratification', 'understood', '2026-08-30T14:51:59.168+00'),
  ('23a1caba-3811-43e4-ac0a-48402fc6f33e', 'opportunity-cost',      'understood', '2026-08-30T15:08:48.881+00'),
  ('23a1caba-3811-43e4-ac0a-48402fc6f33e', 'delayed-gratification', 'understood', '2026-08-30T15:08:48.881+00'),
  ('96a5374f-84b1-41ce-8d75-3e634f2f1711', 'opportunity-cost',      'understood', '2026-08-31T05:54:23.656+00'),
  ('96a5374f-84b1-41ce-8d75-3e634f2f1711', 'delayed-gratification', 'understood', '2026-08-31T05:54:23.656+00'),
  ('b2084cbc-94a0-43fe-8429-367909b6e480', 'opportunity-cost',      'practicing', '2026-08-31T07:43:00.469+00'),
  ('b2084cbc-94a0-43fe-8429-367909b6e480', 'delayed-gratification', 'practicing', '2026-08-31T07:43:00.469+00'),
  ('b2084cbc-94a0-43fe-8429-367909b6e480', 'active-income',         'understood', '2026-08-31T07:43:00.469+00'),
  ('b2084cbc-94a0-43fe-8429-367909b6e480', 'passive-income',        'understood', '2026-08-31T07:43:00.469+00'),
  ('b2084cbc-94a0-43fe-8429-367909b6e480', 'upi-safety',            'understood', '2026-08-31T07:43:00.469+00')
on conflict (student_id, concept_slug) do nothing;

-- ============================================================================
-- Appended 2026-09-04, before migration 0006 cleared the misattributed
-- progress rows.
--
-- e01-e05 and e11 kept their ids through the curriculum revision but got
-- entirely new lessons, so a row recorded against them BEFORE the revision
-- credits a student with a lesson they never saw. Fourteen such rows, five
-- students. Restoring this block puts them back exactly as they were.
--
-- The seven other pre-revision rows (e06-e10) are untouched and stay: those
-- lessons did not change, so those completions are real.
-- ============================================================================
insert into progress (student_id, experience_id, status, screen_index, decision, completed_at, updated_at) values
  ('587922c0-4ee2-4f80-93e0-7ec9c1d2b731', 'e01', 'complete', 5, null, '2026-08-30 14:51:59.112+00', '2026-08-30 14:51:59.112+00'), -- a1620
  ('96a5374f-84b1-41ce-8d75-3e634f2f1711', 'e01', 'complete', 5, null, '2026-08-31 05:54:23.483+00', '2026-08-31 05:54:23.483+00'), -- cesnova
  ('b2084cbc-94a0-43fe-8429-367909b6e480', 'e01', 'complete', 5, null, '2026-08-31 07:43:00.365+00', '2026-08-31 07:43:00.365+00'), -- ganesh!
  ('0da804e2-6b42-47f3-a9c5-1b8a22f443e0', 'e01', 'complete', 5, null, '2026-08-28 19:04:09.827+00', '2026-08-28 19:04:09.827+00'), -- ganesh's_ajji_is_best
  ('3727e8c9-3bd9-4f2a-9e37-8ddc06ec7318', 'e01', 'complete', 5, null, '2026-08-30 13:48:49.483+00', '2026-08-30 13:48:49.484+00'), -- kushli
  ('b2084cbc-94a0-43fe-8429-367909b6e480', 'e02', 'complete', 5, null, '2026-08-31 07:43:00.365+00', '2026-08-31 07:43:00.365+00'),
  ('3727e8c9-3bd9-4f2a-9e37-8ddc06ec7318', 'e02', 'complete', 5, null, '2026-08-30 13:48:49.484+00', '2026-08-30 13:48:49.484+00'),
  ('b2084cbc-94a0-43fe-8429-367909b6e480', 'e03', 'complete', 5, null, '2026-08-31 07:43:00.365+00', '2026-08-31 07:43:00.365+00'),
  ('3727e8c9-3bd9-4f2a-9e37-8ddc06ec7318', 'e03', 'complete', 5, null, '2026-08-30 13:48:49.484+00', '2026-08-30 13:48:49.484+00'),
  ('b2084cbc-94a0-43fe-8429-367909b6e480', 'e04', 'complete', 5, null, '2026-08-31 07:43:00.365+00', '2026-08-31 07:43:00.365+00'),
  ('3727e8c9-3bd9-4f2a-9e37-8ddc06ec7318', 'e04', 'complete', 5, null, '2026-08-30 13:48:49.484+00', '2026-08-30 13:48:49.484+00'),
  ('b2084cbc-94a0-43fe-8429-367909b6e480', 'e05', 'complete', 5, null, '2026-08-31 07:43:00.365+00', '2026-08-31 07:43:00.365+00'),
  ('3727e8c9-3bd9-4f2a-9e37-8ddc06ec7318', 'e05', 'complete', 5, null, '2026-08-30 13:48:49.484+00', '2026-08-30 13:48:49.484+00'),
  ('3727e8c9-3bd9-4f2a-9e37-8ddc06ec7318', 'e11', 'complete', 5, null, '2026-08-30 13:48:49.484+00', '2026-08-30 13:48:49.484+00')
on conflict (student_id, experience_id) do nothing;
