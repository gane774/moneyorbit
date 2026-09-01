import { COMMIT_OPTION_ID } from '../types';
import type { Experience, ScreenCopy } from '../types';

/**
 * Journey 2 — Credit Score. Replaces "Earning & Income".
 *
 * CIBIL does not publish a point-by-point formula, so nothing here invents
 * one. Profiles resolve to a qualitative BAND on the real 300-900 scale, and
 * every factor is described by the DIRECTION of its effect, never a made-up
 * number of points. That constraint is the whole reason this is honest.
 *
 * Age progression: trust as an idea (12-14) -> the factors behind it (15-16)
 * -> how it changes what you do before borrowing (17-18).
 */

export interface CreditFactor { label: string; detail: string; good: boolean }
export interface CreditProfile {
  id: string;
  name: string;
  summary: string;
  factors: CreditFactor[];
  /** Qualitative band on the real CIBIL scale — never a fabricated number. */
  band: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  range: string;
  verdict: string;
}

export interface CreditProfileParams {
  question: string;
  profiles: CreditProfile[];
  /** Which profile a lender would actually prefer. */
  favouredId: string;
}

const params1214: CreditProfileParams = {
  question: 'Who would you lend your bike to?',
  favouredId: 'ravi',
  profiles: [
    {
      id: 'ravi', name: 'Ravi', summary: 'Borrowed your football four times.',
      factors: [
        { label: 'Returned it', detail: 'Every time, on the day he said', good: true },
        { label: 'Condition', detail: 'Same as he got it', good: true },
        { label: 'Had to be reminded', detail: 'Never', good: true },
      ],
      band: 'Excellent', range: 'Easy yes',
      verdict: 'Four times out of four, no reminders. You already know how this goes.',
    },
    {
      id: 'sam', name: 'Sam', summary: 'Borrowed your football four times.',
      factors: [
        { label: 'Returned it', detail: 'Twice late, once after a week', good: false },
        { label: 'Condition', detail: 'Fine', good: true },
        { label: 'Had to be reminded', detail: 'Most times', good: false },
      ],
      band: 'Fair', range: 'Probably not the bike',
      verdict: 'Nothing terrible happened. But you had to chase him, and that is the part you remember.',
    },
  ],
};

const params1516: CreditProfileParams = {
  question: 'Both apply for the same phone EMI. Who does the lender approve instantly?',
  favouredId: 'priya',
  profiles: [
    {
      id: 'priya', name: 'Priya', summary: 'Has had a credit card for 3 years.',
      factors: [
        { label: 'Payment history', detail: 'Paid in full, every month', good: true },
        { label: 'Credit utilisation', detail: 'Uses about ₹10,000 of a ₹50,000 limit — 20%', good: true },
        { label: 'Account age', detail: '3 years of history to look at', good: true },
      ],
      band: 'Excellent', range: '750–900',
      verdict: 'Three years of paying on time, and she never gets close to her limit. There is nothing here to worry a lender.',
    },
    {
      id: 'arjun', name: 'Arjun', summary: 'Has had a credit card for 3 years.',
      factors: [
        { label: 'Payment history', detail: 'Missed two payments last year', good: false },
        { label: 'Credit utilisation', detail: 'Usually near his full ₹50,000 limit — 90%+', good: false },
        { label: 'Account age', detail: '3 years of history to look at', good: true },
      ],
      band: 'Fair', range: '550–650',
      verdict: 'Same card, same three years. Missed payments and a card that stays nearly maxed both say the same thing: money is tight.',
    },
  ],
};

const params1718: CreditProfileParams = {
  question: 'All three want a home loan in six months. Whose position is strongest today?',
  favouredId: 'nikhil',
  profiles: [
    {
      id: 'nikhil', name: 'Nikhil', summary: 'Did nothing this year.',
      factors: [
        { label: 'Payment history', detail: 'On time throughout', good: true },
        { label: 'Utilisation', detail: 'Steady around 25%', good: true },
        { label: 'Oldest account', detail: 'Kept open — 6 years of history', good: true },
        { label: 'Recent applications', detail: 'None', good: true },
      ],
      band: 'Excellent', range: '750–900',
      verdict: 'Doing nothing was the strategy. Six years of history, low utilisation, no fresh inquiries — this is what a lender wants to see before a large loan.',
    },
    {
      id: 'divya', name: 'Divya', summary: 'Opened three new cards for the rewards.',
      factors: [
        { label: 'Payment history', detail: 'On time throughout', good: true },
        { label: 'Utilisation', detail: 'Low — big combined limit', good: true },
        { label: 'Oldest account', detail: 'Kept open', good: true },
        { label: 'Recent applications', detail: 'Three hard inquiries in two months', good: false },
      ],
      band: 'Good', range: '650–750',
      verdict: 'She has done nothing irresponsible. But a cluster of applications in a short window reads as someone suddenly needing credit — bad timing right before a home loan.',
    },
    {
      id: 'sameer', name: 'Sameer', summary: 'Closed his oldest card to "tidy up".',
      factors: [
        { label: 'Payment history', detail: 'On time throughout', good: true },
        { label: 'Utilisation', detail: 'Rose — he removed a chunk of his total limit', good: false },
        { label: 'Oldest account', detail: 'Closed — shortened his history', good: false },
        { label: 'Recent applications', detail: 'None', good: true },
      ],
      band: 'Good', range: '650–750',
      verdict: 'The most counter-intuitive one. Closing an old unused card removed both years of history and part of his available limit, which pushed his utilisation up without him spending a rupee more.',
    },
  ],
};

/* ---------------------------------------------------------------- 12-14 */
const copy1214: ScreenCopy = {
  hook: {
    kicker: 'Before we start',
    headline: 'Two friends have borrowed your football. One always brings it back on time.',
    lines: [
      { text: 'The other one brings it back eventually, after you ask twice.' },
      { text: 'Now one of them wants to borrow your bike. Which one gets it?', accent: true },
    ],
    cta: 'You already know',
  },
  explain: {
    kicker: 'How trust gets built',
    headline: 'You are keeping score without meaning to.',
    body: [
      'Nobody wrote anything down. You just **remember** who returned things and who had to be chased.',
      'Adults borrow money instead of footballs, from banks instead of friends. Banks cannot remember every person — so a score does the remembering for them.',
    ],
    cta: 'See how it works',
  },
  interact: {
    kicker: 'Two borrowers',
    headline: 'Look at the record. Then decide who gets the bike.',
    labels: { predict: 'Who would you trust?', reveal: 'See the record' },
    cta: 'I see it',
    lockedCta: 'Make a prediction first',
  },
  decide: {
    kicker: 'Your call',
    headline: 'Your friend borrowed ₹500 from three different people and paid two of them back late. He asks you for ₹500.',
    options: [
      { id: 'lend',   title: 'Lend it to him', subtitle: 'He did pay everyone back eventually' },
      { id: 'refuse', title: 'Not this time', subtitle: 'Late twice out of three' },
    ],
    cta: 'Lock it in',
  },
  feedback: {
    kicker: 'Either answer is defensible',
    verdicts: {
      lend: {
        tone: 'good',
        title: 'Generous — and you took on a known risk.',
        body:
          'He does pay people back, which counts for something. But you would probably expect to chase him, and that expectation is exactly what a credit score measures: **not whether someone is a good person, but how predictable they are**.',
      },
      refuse: {
        tone: 'good',
        title: 'This is how a bank thinks.',
        body:
          'Two late payments out of three is a pattern, not bad luck. A bank looking at that pattern would either say no or ask for something extra in return. **Your history follows you.**',
      },
    },
    myth: {
      struck: 'A credit score is about how rich you are.',
      correction:
        'It is about how **predictable** you are. Someone earning very little who always repays on time can score higher than someone wealthy who keeps forgetting.',
    },
    vocab: {
      term: 'Credit score',
      definition:
        'A number that sums up how reliably someone has repaid money in the past. In India the main one is called CIBIL, and it runs from 300 to 900.',
    },
    cta: 'Got it',
  },
  practice: {
    kicker: 'Quick check',
    prompt:
      'Two people want to borrow money. Aditi earns ₹20,000 a month and has repaid every loan on time for four years. Karan earns ₹2,00,000 a month and has missed payments on three loans.',
    options: [
      { id: 'karan', title: 'Karan — he earns ten times more', correct: false,
        rationale: 'Earning more means he can afford to repay. His record says he often does not, and that is what a lender is actually trying to predict.' },
      { id: 'aditi', title: 'Aditi — her record is spotless', correct: true,
        rationale: 'Exactly. A lender is asking "will this money come back?" Four years of on-time repayment answers that better than a large salary does.' },
      { id: 'same', title: 'They are equally risky', correct: false,
        rationale: 'One has a four-year record of repaying and one has three missed loans. Those are not the same risk, whatever the salaries say.' },
    ],
    cta: 'Check answer',
  },
};

/* ---------------------------------------------------------------- 15-16 */
const copy1516: ScreenCopy = {
  hook: {
    kicker: 'Before we start',
    headline: 'Two people apply for the same phone EMI on the same day.',
    lines: [
      { text: 'One is approved in under a minute. The other is asked for a guarantor.' },
      { text: 'They earn about the same. So what did the lender see?', accent: true },
    ],
    cta: 'Find out',
  },
  explain: {
    kicker: 'What CIBIL actually looks at',
    headline: 'Two things carry most of the weight.',
    body: [
      '**Payment history** — did you pay, and did you pay on time. This is the heaviest single factor there is.',
      '**Credit utilisation** — how much of your available limit you actually use. Sitting near your limit month after month reads as strain, even if you never miss a payment.',
      'Your score lands between 300 and 900. Above roughly 750 and lenders stop asking questions.',
    ],
    cta: 'Compare them',
  },
  interact: {
    kicker: 'Same card, same three years',
    headline: 'Predict who the lender prefers, then see why.',
    labels: { predict: 'Who gets approved?', reveal: 'See both records' },
    cta: 'I see it',
    lockedCta: 'Make a prediction first',
  },
  decide: {
    kicker: 'Your call',
    headline: 'You have a credit card with a ₹50,000 limit. You want to buy something for ₹45,000 on it and repay it fully next month.',
    body: ['You will not miss the payment. The money is there.'],
    options: [
      { id: 'full',  title: 'Put the whole ₹45,000 on the card', subtitle: 'You will clear it next month anyway' },
      { id: 'split', title: 'Put part on the card, pay the rest another way', subtitle: 'Keeps the card well under its limit' },
    ],
    cta: 'Lock it in',
  },
  feedback: {
    kicker: "Here's what the lender sees",
    verdicts: {
      full: {
        tone: 'cost',
        title: 'You repay fine. Your score still takes the hit.',
        body:
          '₹45,000 on a ₹50,000 limit is **90% utilisation**. Your score is usually calculated from the balance on your statement date — so even repaying in full the following month, the month you were at 90% is the month that gets reported. High utilisation looks like strain, whatever your intentions were.',
      },
      split: {
        tone: 'good',
        title: 'Same purchase, better-looking record.',
        body:
          'Keeping utilisation lower — generally under about 30% — leaves the same purchase without the signal of someone leaning hard on their limit. Nothing about your actual finances changed. What changed is **what gets reported**.',
      },
    },
    myth: {
      struck: 'As long as I never miss a payment, my score is fine.',
      correction:
        'Payment history is the biggest factor, not the only one. **Utilisation can drag a perfect payment record down** — you can pay every bill on time and still look stretched.',
    },
    vocab: {
      term: 'Credit utilisation',
      definition:
        'The share of your available credit limit you are actually using. ₹10,000 spent on a ₹50,000 limit is 20% utilisation — and lower is generally read as healthier.',
    },
    cta: 'Got it',
  },
  practice: {
    kicker: 'Quick check',
    prompt:
      'Rhea has two credit cards, ₹40,000 limit each — ₹80,000 in total. She spends ₹36,000 a month across them and clears both in full, every month, without fail.',
    options: [
      { id: 'perfect', title: 'Her score should be excellent — she never misses', correct: false,
        rationale: 'Her payment history is spotless, which matters most. But ₹36,000 of ₹80,000 is about 45% utilisation, which is high enough to weigh on the score anyway.' },
      { id: 'utilisation-drag', title: 'Good, but utilisation is holding it back', correct: true,
        rationale: 'Right. Perfect payment history plus ~45% utilisation is a good score that is not as good as it could be. Spreading the spend or asking for a higher limit would both lower the ratio.' },
      { id: 'bad', title: 'Her score will be poor', correct: false,
        rationale: 'Too harsh. Never missing a payment is the single strongest thing she can do — utilisation is a drag on a good score here, not a disaster.' },
    ],
    cta: 'Check answer',
  },
};

/* ---------------------------------------------------------------- 17-18 */
const copy1718: ScreenCopy = {
  hook: {
    kicker: 'Before we start',
    headline: 'You are applying for a home loan in six months. Three people give you advice.',
    lines: [
      { text: '"Open a few cards now, build more credit." "Close the old one you never use." "Change nothing."' },
      { text: 'Two of those will cost you. Which two?', accent: true },
    ],
    cta: 'Find out',
  },
  explain: {
    kicker: 'The factors nobody mentions',
    headline: 'History length, credit mix, and inquiries all move the number.',
    body: [
      'Every formal application creates a **hard inquiry**. One is nothing; several in a short window reads as someone who suddenly needs credit.',
      '**Length of history** matters too — and it is why closing your oldest card can backfire. You lose those years, and you lose that card’s limit, which pushes your utilisation up without you spending anything.',
      'Checking your own score is a **soft** inquiry. It does not count against you, and never has.',
    ],
    cta: 'See all three',
  },
  interact: {
    kicker: 'Three people, six months out',
    headline: 'Each did one thing differently. Predict who is strongest.',
    labels: { predict: 'Whose position is strongest?', reveal: 'See all three records' },
    cta: 'I see it',
    lockedCta: 'Make a prediction first',
  },
  decide: {
    kicker: 'Your call',
    headline: 'Six months from a home loan application. What do you actually do?',
    options: [
      { id: 'apply',   title: 'Apply for three new cards now', subtitle: 'More available credit, lower utilisation' },
      { id: 'close',   title: 'Close the old card you never use', subtitle: 'Tidy up before the lender looks' },
      { id: 'nothing', title: 'Nothing — keep paying on time', subtitle: 'Leave every account exactly as it is' },
    ],
    cta: 'Lock it in',
  },
  feedback: {
    kicker: 'Only one of these helps',
    verdicts: {
      apply: {
        tone: 'cost',
        title: 'Three hard inquiries, right before the one that matters.',
        body:
          'The extra limit would lower utilisation, which is real. But three applications in a short window sit on your report at exactly the moment a mortgage lender looks — and new accounts also drag your average account age down. **Right idea, worst possible timing.**',
      },
      close: {
        tone: 'cost',
        title: 'The most common well-intentioned mistake.',
        body:
          'Closing an old, unused card removes years of history **and** removes its limit from your total available credit — so your utilisation rises without you spending a rupee more. Tidiness is not a factor lenders score. That card was doing quiet work just by existing.',
      },
      nothing: {
        tone: 'good',
        title: 'Boring, and correct.',
        body:
          'No new inquiries, no lost history, no change in utilisation. Six months of continuing to pay on time is the strongest thing you can present. **Credit scores reward not doing anything interesting.**',
      },
    },
    myth: {
      struck: 'Checking your own credit score lowers it.',
      correction:
        'Checking your own is a **soft inquiry** and has no effect at all. Only formal applications create hard inquiries — so check yours as often as you like.',
    },
    vocab: {
      term: 'Hard inquiry',
      definition:
        'The record left when a lender checks your report because you applied for credit. A few over time is normal; a cluster in a short period suggests urgency, which lenders read as risk.',
    },
    cta: 'Got it',
  },
  practice: {
    kicker: 'Quick check',
    prompt:
      'Your friend is about to start his first job. He has no credit history at all — no cards, no loans, nothing. He assumes that means his score is excellent, because he has never done anything wrong.',
    options: [
      { id: 'excellent', title: 'He is right — a clean slate is the best position', correct: false,
        rationale: 'Nothing wrong is not the same as something good. With no history there is nothing to score, so lenders have no evidence either way — which makes a first loan harder, not easier.' },
      { id: 'no-history', title: 'He has no score to speak of, which is its own problem', correct: true,
        rationale: 'Exactly. A credit score is built from a track record; with no accounts there is no record. This is why a first card, used lightly and paid in full, is usually worth starting early.' },
      { id: 'poor', title: 'His score will be poor', correct: false,
        rationale: 'Not poor — absent. Poor means a record of problems. He has no record at all, and the fix is to start building one carefully rather than to repair anything.' },
    ],
    cta: 'Check answer',
  },
};

export const J02_CREDIT_SCORE: Experience = {
  id: 'e02',
  journeyId: 'j02',
  slug: 'the-number-behind-your-credit',
  title: 'The Number Behind Your Credit',
  mechanicType: 'credit-profiles',
  isCore: true,
  timeSensitive: false,
  concepts: ['credit-score', 'credit-history', 'payment-history', 'credit-utilisation', 'hard-inquiries'],
  availableTo: ['12-14', '15-16', '17-18'],
  ageVariants: {
    '12-14': { params: params1214 as unknown as Record<string, unknown>, copy: copy1214 },
    '15-16': { params: params1516 as unknown as Record<string, unknown>, copy: copy1516 },
    '17-18': { params: params1718 as unknown as Record<string, unknown>, copy: copy1718 },
  },
};
