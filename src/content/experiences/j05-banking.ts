import { COMMIT_OPTION_ID } from '../types';
import type { Experience, ScreenCopy } from '../types';

/**
 * Journey 5 — Banking. Replaces "Saving & Emergency Funds".
 *
 * Answers "what actually happens when I put money in a bank", not payment
 * safety — that content was deliberately retired with the old J4.
 *
 * The interest explanation stays qualitative on purpose: the compounding
 * maths already has a home in Journey 7, and repeating it here would be
 * duplication rather than depth.
 */

export interface BankOption {
  id: string;
  name: string;
  interest: string;
  minBalance: string;
  branches: string;
  digital: string;
  fees: string;
  bestFor: string;
  tradeoff: string;
}

export interface BankingParams {
  mode: 'deposit-flow' | 'account-match' | 'bank-choice';
  /** deposit-flow (12-14) */
  deposit?: { amount: number; ratePct: number; months: number };
  /** account-match (15-16) */
  people?: { id: string; label: string; detail: string; answer: 'savings' | 'current' ; why: string }[];
  /** bank-choice (17-18) */
  banks?: BankOption[];
}

const params1214: BankingParams = {
  mode: 'deposit-flow',
  deposit: { amount: 5_000, ratePct: 3.5, months: 12 },
};

const params1516: BankingParams = {
  mode: 'account-match',
  people: [
    { id: 'student', label: 'Meera, 16', detail: 'Gets ₹2,000 a month, saves most of it, spends a little.',
      answer: 'savings', why: 'Personal money, few transactions, and she wants it to earn a little while it sits. That is exactly what a savings account is for.' },
    { id: 'shop', label: 'A stationery shop', detail: 'Takes 200+ payments a month and pays suppliers weekly.',
      answer: 'current', why: 'High transaction volume with no monthly cap, and the money is working capital rather than savings. Current accounts are built for this and usually pay no interest at all.' },
    { id: 'freelancer', label: 'A freelance designer', detail: 'Gets paid by 4–5 clients a month, keeps a buffer aside.',
      answer: 'savings', why: 'A handful of payments a month sits comfortably inside a savings account, and the buffer benefits from earning interest. Many freelancers only need a current account once volume climbs.' },
    { id: 'family', label: 'A family household', detail: 'One salary in, bills and groceries out.',
      answer: 'savings', why: 'Ordinary personal banking. The balance between payday and month-end earns interest, which a current account would not give them.' },
  ],
};

const params1718: BankingParams = {
  mode: 'bank-choice',
  banks: [
    { id: 'a', name: 'Bank A', interest: '4.5% on savings', minBalance: '₹25,000 minimum balance',
      branches: 'Few branches, mostly metros', digital: 'Basic app', fees: 'Penalty if balance drops',
      bestFor: 'Someone who reliably keeps a large balance parked.',
      tradeoff: 'The best rate here, and the penalty makes it the worst choice if your balance ever dips.' },
    { id: 'b', name: 'Bank B', interest: '2.7% on savings', minBalance: 'No minimum balance',
      branches: 'Branches almost everywhere', digital: 'Decent app', fees: 'Very few',
      bestFor: 'Someone whose balance moves around a lot, or who is just starting out.',
      tradeoff: 'You give up interest for the freedom to run the account down to nothing without being charged.' },
    { id: 'c', name: 'Bank C', interest: '3.2% on savings', minBalance: 'No minimum balance',
      branches: 'Almost no branches', digital: 'Excellent app, instant support',
      fees: 'Higher charges on some services',
      bestFor: 'Someone who does everything on a phone and rarely needs a branch.',
      tradeoff: 'Convenience and speed, paid for in fees — and painful on the day you actually need a branch.' },
  ],
};

/* ---------------------------------------------------------------- 12-14 */
const copy1214: ScreenCopy = {
  hook: {
    kicker: 'Before we start',
    headline: 'Aarav keeps ₹5,000 in a bank instead of a box under his bed.',
    lines: [
      { text: 'A year later the box still holds exactly ₹5,000.' },
      { text: 'The bank account holds more. Nobody added anything. Where did it come from?', accent: true },
    ],
    cta: 'Find out',
  },
  explain: {
    kicker: 'What a bank actually does',
    headline: 'Your money does not sit in a box with your name on it.',
    body: [
      'A bank takes in deposits from lots of people. It uses those deposits to run its business — offering loans and services to other customers — and it earns money doing that.',
      'Some of what it earns comes back to you as **interest**, for keeping your money there. That is the deal: your money is available when you want it, and it earns a little while it waits.',
    ],
    cta: 'Watch it happen',
  },
  interact: {
    kicker: "Aarav's ₹5,000",
    headline: 'Follow the money for a year.',
    labels: {
      deposit: 'He deposits', working: 'The bank puts deposits to work',
      interest: 'Interest paid to Aarav', after: 'After one year',
      box: 'Same money in a box',
    },
    cta: 'I see it',
    lockedCta: 'Step through the year',
  },
  decide: {
    kicker: 'Your call',
    headline: 'You have ₹2,000 of saved-up money. Box under the bed, or bank account?',
    options: [
      { id: 'box',  title: 'Keep it in the box', subtitle: 'You can see it and touch it' },
      { id: 'bank', title: 'Put it in a bank account', subtitle: 'You cannot see it, but you can get it back' },
    ],
    cta: 'Lock it in',
  },
  feedback: {
    kicker: 'Both are safe. Only one grows.',
    verdicts: {
      box: {
        tone: 'cost',
        title: 'It will be exactly ₹2,000 forever.',
        body:
          'Nothing is stolen and nothing is added. Meanwhile prices creep up around it — which you already met in the very first journey. **Money that sits still slowly buys less.**',
      },
      bank: {
        tone: 'good',
        title: 'Still yours, and quietly earning.',
        body:
          'You can take it out whenever you want. While it waits, the bank pays you interest for letting it use deposits in its business. **You did nothing extra and ended up with more.**',
      },
    },
    myth: {
      struck: 'The bank keeps my exact notes locked in a safe for me.',
      correction:
        'Your money is not a bundle with your name on it. The bank owes you your balance and will pay it whenever you ask — but in the meantime, deposits are **put to work**, and that is why you get interest.',
    },
    vocab: {
      term: 'Interest',
      definition:
        'A payment for the use of money. The bank pays you interest for keeping your money there, and charges interest when it lends money out.',
    },
    cta: 'Got it',
  },
  practice: {
    kicker: 'Quick check',
    prompt:
      'Your friend says: "I do not trust banks. If I put ₹1,000 in, they might lend my exact ₹1,000 note to someone who never pays it back, and then it is gone."',
    options: [
      { id: 'right', title: 'He is right to worry', correct: false,
        rationale: 'Your balance is what the bank owes you, and it does not depend on any one loan being repaid. Banks hold reserves and are regulated precisely so ordinary depositors are not exposed like this.' },
      { id: 'owed', title: 'The bank owes him ₹1,000 whatever happens to any single loan', correct: true,
        rationale: 'Exactly. He has a claim on the bank for his balance, not a stake in one particular loan. That separation is the whole point of depositing money.' },
      { id: 'locked', title: 'The bank keeps his exact note untouched in a vault', correct: false,
        rationale: 'It does not — deposits get used in the bank’s business, which is how it can pay interest at all. What protects him is that the bank owes him the balance regardless.' },
    ],
    cta: 'Check answer',
  },
};

/* ---------------------------------------------------------------- 15-16 */
const copy1516: ScreenCopy = {
  hook: {
    kicker: 'Before we start',
    headline: 'A student and a shop owner both walk into a bank to open an account.',
    lines: [
      { text: 'They are offered different products, and the shop owner earns no interest at all.' },
      { text: 'Is the bank short-changing them?', accent: true },
    ],
    cta: 'Have a look',
  },
  explain: {
    kicker: 'Two accounts, two jobs',
    headline: 'Savings accounts hold money. Current accounts move it.',
    body: [
      'A **savings account** is built for individuals: relatively few transactions, a balance that mostly sits, and interest paid on what is sitting there.',
      'A **current account** is built for businesses: very high transaction volumes with no practical monthly limit, and usually **no interest**, because the money is not meant to sit — it is meant to move.',
    ],
    cta: 'Match them up',
  },
  interact: {
    kicker: 'Four customers',
    headline: 'Which account does each one actually need?',
    labels: { savings: 'Savings account', current: 'Current account', check: 'Check my answers' },
    cta: 'I see it',
    lockedCta: 'Match all four first',
  },
  decide: {
    kicker: 'Your call',
    headline: 'A bank pays you about 3% on savings and charges about 10% on a personal loan. Is that unfair?',
    body: ['This gap is where almost all of a bank’s money comes from.'],
    options: [
      { id: 'unfair', title: 'Unfair — they are profiting off both sides', subtitle: 'They pay little and charge a lot' },
      { id: 'fair',   title: 'That gap is what pays for the bank existing', subtitle: 'Staff, branches, apps, and bad loans' },
    ],
    cta: 'Lock it in',
  },
  feedback: {
    kicker: 'The gap has a job',
    verdicts: {
      unfair: {
        tone: 'cost',
        title: 'Understandable, and it misses what the gap covers.',
        body:
          'The bank is not pocketing all 7%. Out of it come branches, staff, apps, regulation — and crucially, **the loans that are never repaid**. Someone has to absorb those, and it is not the depositor.',
      },
      fair: {
        tone: 'good',
        title: 'That gap is the business model.',
        body:
          'Banks pay less on deposits than they charge on loans, and the difference funds the whole operation plus the losses on borrowers who default. **Your deposit is safe partly because that margin exists.**',
      },
    },
    myth: {
      struck: 'Interest rates are basically the same everywhere.',
      correction:
        'They vary a lot — by bank, by product, and by how risky the borrowing is. A savings rate and a personal-loan rate are not the same number and were never meant to be.',
    },
    vocab: {
      term: 'Current account',
      definition:
        'An account designed for high-volume business transactions. Typically no interest and no practical transaction cap — the opposite trade-off from a savings account.',
    },
    cta: 'Got it',
  },
  practice: {
    kicker: 'Quick check',
    prompt:
      'Your cousin starts selling handmade candles online. In month one he gets 8 orders. By month six he is getting 300 orders a month and paying three suppliers weekly.',
    options: [
      { id: 'savings-forever', title: 'A savings account is fine throughout', correct: false,
        rationale: 'It is fine at 8 orders a month. At 300 orders plus weekly supplier payments he is well past what savings accounts are designed to handle.' },
      { id: 'switch', title: 'Savings was fine at first; the volume now points to a current account', correct: true,
        rationale: 'Right. The account should follow how the money is actually used. Low volume and a resting balance suits savings; high volume and constant movement is what current accounts exist for.' },
      { id: 'current-always', title: 'He should have opened a current account on day one', correct: false,
        rationale: 'At 8 orders a month he would have given up interest for transaction capacity he was not using. The switch makes sense when volume justifies it, not before.' },
    ],
    cta: 'Check answer',
  },
};

/* ---------------------------------------------------------------- 17-18 */
const copy1718: ScreenCopy = {
  hook: {
    kicker: 'Before we start',
    headline: 'You are opening your first real bank account. Three banks want your business.',
    lines: [
      { text: 'One pays the most interest. One charges you almost nothing. One has a brilliant app.' },
      { text: 'There is no best bank here — only the best one for you.', accent: true },
    ],
    cta: 'Compare them',
  },
  explain: {
    kicker: 'What you are actually choosing between',
    headline: 'Every bank is a trade-off wearing a logo.',
    body: [
      'The headline interest rate is the easiest thing to compare and rarely the thing that matters most on a small balance — **a 2% difference on ₹20,000 is about ₹400 a year**.',
      'Minimum-balance penalties, transaction fees, branch access and app quality routinely cost or save more than the rate does. The right question is not "which is best" but **"which one fits how I actually bank"**.',
    ],
    cta: 'Look at all three',
  },
  interact: {
    kicker: 'Three banks',
    headline: 'Read what each one is really offering.',
    labels: { interest: 'Interest', minBalance: 'Minimum balance', branches: 'Branches',
              digital: 'App', fees: 'Fees', bestFor: 'Suits' },
    cta: 'I have compared them',
    lockedCta: 'Look at each bank first',
  },
  decide: {
    kicker: 'Your call',
    headline: 'First job, salary of about ₹30,000 a month, balance that will swing between ₹2,000 and ₹40,000. Which do you open?',
    body: ['All three are defensible. What matters is whether your reason matches your situation.'],
    options: [
      { id: 'a', title: 'Bank A', subtitle: 'Best rate, ₹25,000 minimum balance, few branches' },
      { id: 'b', title: 'Bank B', subtitle: 'Lowest rate, no minimum, branches everywhere' },
      { id: 'c', title: 'Bank C', subtitle: 'Middle rate, no minimum, superb app, higher fees' },
    ],
    cta: 'Lock it in',
  },
  feedback: {
    kicker: 'One of these fits the situation badly',
    verdicts: {
      a: {
        tone: 'cost',
        title: 'The best rate, on an account you will keep getting penalised on.',
        body:
          'Your balance dips to ₹2,000 some months and the minimum is ₹25,000. You would earn the top rate in the good months and pay penalties in the bad ones — **and the penalties will comfortably outweigh the extra interest on a balance this size**.',
      },
      b: {
        tone: 'good',
        title: 'Boring, and well matched to a swinging balance.',
        body:
          'You give up perhaps ₹400 a year in interest and buy the freedom to run the account down to ₹2,000 without being charged for it. On a small, moving balance **avoiding fees beats chasing rates** almost every time.',
      },
      c: {
        tone: 'good',
        title: 'Defensible — provided you genuinely never need a branch.',
        body:
          'No minimum balance suits your swings, and the app is worth real money if you live on your phone. The risk is the day you need something a branch does — a disputed transaction, a document — and there is no branch to walk into.',
      },
    },
    myth: {
      struck: 'Pick the bank with the highest interest rate.',
      correction:
        'On a small balance the rate is usually the **least** important line. Minimum-balance penalties and fees move more money than a 2% rate difference ever will.',
    },
    vocab: {
      term: 'Minimum balance',
      definition:
        'The amount a bank requires you to keep in the account. Drop below it and you are charged a penalty — often more than a year of the extra interest that attracted you.',
    },
    cta: 'Got it',
  },
  practice: {
    kicker: 'Quick check',
    prompt:
      'A friend picks the bank with the highest savings rate — 4.5%, with a ₹25,000 minimum balance. She is a student whose balance regularly falls to ₹3,000. The penalty is ₹500 a quarter.',
    options: [
      { id: 'good', title: 'Good choice — she is earning the best rate available', correct: false,
        rationale: 'She earns the top rate only on the balance she actually holds, which is small. Meanwhile the penalties are charged regardless.' },
      { id: 'penalties', title: 'The penalties will cost her more than the extra interest', correct: true,
        rationale: 'Right. ₹500 a quarter is ₹2,000 a year. On a balance averaging a few thousand rupees, the extra ~2% of interest is worth a tiny fraction of that — the rate attracted her to an account that charges her for existing.' },
      { id: 'switch-later', title: 'Fine for now — she can switch once she has more money', correct: false,
        rationale: 'She is being charged every quarter in the meantime. "Switch later" quietly accepts a cost she could avoid today by choosing an account that fits her actual balance.' },
    ],
    cta: 'Check answer',
  },
};

export const J05_BANKING: Experience = {
  id: 'e05',
  journeyId: 'j05',
  slug: 'how-does-a-bank-work',
  title: 'How Does a Bank Actually Work?',
  mechanicType: 'bank-choice',
  isCore: true,
  timeSensitive: false,
  concepts: ['how-banks-work', 'account-types', 'choosing-a-bank', 'interest'],
  availableTo: ['12-14', '15-16', '17-18'],
  ageVariants: {
    '12-14': { params: params1214 as unknown as Record<string, unknown>, copy: copy1214 },
    '15-16': { params: params1516 as unknown as Record<string, unknown>, copy: copy1516 },
    '17-18': { params: params1718 as unknown as Record<string, unknown>, copy: copy1718 },
  },
};
