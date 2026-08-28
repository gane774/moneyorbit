import type { Experience, ScreenCopy } from '../types';

export interface ChoiceFastforwardParams {
  itemLabel: string;
  itemCost: number;
  years: number;
  rate: number;
  /** The age the fast-forward lands on, for copy like "by the time you're 25". */
  landingAge: number;
}

const params1214: ChoiceFastforwardParams = {
  itemLabel: 'a new game', itemCost: 800, years: 12, rate: 8, landingAge: 25,
};
const params1516: ChoiceFastforwardParams = {
  itemLabel: 'wireless earbuds', itemCost: 3_000, years: 9, rate: 8, landingAge: 25,
};
const params1718: ChoiceFastforwardParams = {
  itemLabel: 'a weekend trip with friends', itemCost: 15_000, years: 12, rate: 10, landingAge: 30,
};

const copy1214: ScreenCopy = {
  hook: {
    kicker: 'Before we start',
    headline: "There's a game you want. ₹800. You've saved it up.",
    lines: [
      { text: 'Buy it today, or let that ₹800 sit and grow instead.' },
      { text: 'Which one actually costs you more?', accent: true },
    ],
    cta: "Let's see",
  },
  explain: {
    kicker: 'What waiting really means',
    headline: "Every rupee spent is a rupee that stops growing.",
    body: [
      "Money you don't spend doesn't just sit there — put it away and it **quietly grows** on its own.",
      'Buying something now is never free. You also give up whatever that money **could have become**.',
    ],
    cta: 'Try it yourself',
  },
  interact: {
    kicker: 'Your ₹800',
    headline: 'Pick your instinct, then fast-forward.',
    labels: {
      buy: 'Buy it now', wait: 'Wait and grow',
      fastForward: 'Fast-forward {{years}} years',
      buyOutcome: 'If you bought it', waitOutcome: 'If you waited',
    },
    cta: 'I see it',
    lockedCta: 'Pick one, then fast-forward',
  },
  decide: {
    kicker: 'Your call',
    headline: 'The ₹800 is still sitting there. What do you actually do?',
    options: [
      { id: 'buy', title: 'Buy the game today', subtitle: 'You get it right now', figure: '₹0 left growing' },
      { id: 'wait', title: 'Leave it to grow', subtitle: 'No game today', figure: '{{fv}} by {{landingAge}}' },
    ],
    cta: 'Lock it in',
  },
  feedback: {
    kicker: "Here's what happened",
    verdicts: {
      buy: {
        tone: 'cost',
        title: 'You have the game. That is it.',
        body:
          "₹800 well spent today — but that same ₹800, left alone, would have become **{{fv}}** by the time you're {{landingAge}}. That's the real price of buying now: not ₹800, but **{{growth}}** you'll never see.",
      },
      wait: {
        tone: 'good',
        title: "You'll thank yourself at {{landingAge}}.",
        body:
          "No game today. But that ₹800 grows quietly in the background, and by the time you're {{landingAge}} it's **{{fv}}** — **{{growth}}** more, for doing nothing at all.",
      },
    },
    myth: {
      struck: 'Waiting means missing out.',
      correction:
        "Waiting doesn't mean missing out — **spending now** is what you actually give up. **{{growth}}** of it, in this case.",
    },
    vocab: {
      term: 'Opportunity cost',
      definition:
        'What you give up by choosing one thing over another. Buying the game costs ₹800 — it also costs whatever that ₹800 would have grown into.',
    },
    cta: 'Got it',
  },
  practice: {
    kicker: 'Quick check',
    prompt:
      'Your friend has ₹500 saved. He can buy a football today, or leave it growing for 10 years — it would become about ₹1,080. His team needs a football for tomorrow’s match, and nobody else has one.',
    options: [
      { id: 'always-buy', title: 'Buying now is always the smart move', correct: false,
        rationale: 'Not always — most of the time, waiting wins. This is the exception, and it matters why.' },
      { id: 'depends', title: 'It depends what he actually needs it for', correct: true,
        rationale: "Exactly. A real, immediate need — a match tomorrow with no other ball — can be worth more than the growth he'd give up. Opportunity cost is a real cost, not an automatic ‘no’." },
      { id: 'always-wait', title: 'Waiting is always better', correct: false,
        rationale: 'If that were true, nobody would ever buy anything. The football has real value right now that ₹1,080 in ten years can’t replace this week.' },
    ],
    cta: 'Check answer',
  },
};

const copy1516: ScreenCopy = {
  hook: {
    kicker: 'Before we start',
    headline: "Wireless earbuds. ₹3,000. You've got the cash.",
    lines: [
      { text: 'Buy them today, or let that ₹3,000 sit and grow instead.' },
      { text: 'Which one actually costs you more?', accent: true },
    ],
    cta: "Let's see",
  },
  explain: {
    kicker: 'What waiting really means',
    headline: 'Every rupee spent is a rupee that stops growing.',
    body: [
      "Money you don't spend doesn't just sit there — put it away and it **quietly grows** on its own.",
      'Buying something now is never free. You also give up whatever that money **could have become**.',
    ],
    cta: 'Try it yourself',
  },
  interact: {
    kicker: 'Your ₹3,000',
    headline: 'Pick your instinct, then fast-forward.',
    labels: {
      buy: 'Buy it now', wait: 'Wait and grow',
      fastForward: 'Fast-forward {{years}} years',
      buyOutcome: 'If you bought it', waitOutcome: 'If you waited',
    },
    cta: 'I see it',
    lockedCta: 'Pick one, then fast-forward',
  },
  decide: {
    kicker: 'Your call',
    headline: 'The ₹3,000 is still sitting there. What do you actually do?',
    options: [
      { id: 'buy', title: 'Buy the earbuds today', subtitle: 'You get them right now', figure: '₹0 left growing' },
      { id: 'wait', title: 'Leave it to grow', subtitle: 'No earbuds today', figure: '{{fv}} by {{landingAge}}' },
    ],
    cta: 'Lock it in',
  },
  feedback: {
    kicker: "Here's what happened",
    verdicts: {
      buy: {
        tone: 'cost',
        title: 'You have the earbuds. That is it.',
        body:
          "₹3,000 well spent today — but that same ₹3,000, left alone, would have become **{{fv}}** by the time you're {{landingAge}}. That's the real price of buying now: not ₹3,000, but **{{growth}}** you'll never see.",
      },
      wait: {
        tone: 'good',
        title: "You'll thank yourself at {{landingAge}}.",
        body:
          "No earbuds today. But that ₹3,000 grows quietly in the background, and by the time you're {{landingAge}} it's **{{fv}}** — **{{growth}}** more, for doing nothing at all.",
      },
    },
    myth: {
      struck: 'Waiting means missing out.',
      correction:
        "Waiting doesn't mean missing out — **spending now** is what you actually give up. **{{growth}}** of it, in this case.",
    },
    vocab: {
      term: 'Opportunity cost',
      definition:
        'What you give up by choosing one thing over another. Buying the earbuds costs ₹3,000 — it also costs whatever that ₹3,000 would have grown into.',
    },
    cta: 'Got it',
  },
  practice: {
    kicker: 'Quick check',
    prompt:
      'Your friend has ₹2,000 saved. She can buy concert tickets today (the show is once, this weekend only), or leave the money growing for 8 years — it would become about ₹3,700.',
    options: [
      { id: 'always-buy', title: 'Buying now is always the smart move', correct: false,
        rationale: 'Not always — most of the time, waiting wins. This is the exception, and it matters why.' },
      { id: 'depends', title: 'It depends what she actually values here', correct: true,
        rationale: 'Exactly. A one-time experience that can’t be bought later is a real thing to weigh against the money it would have grown into — not an automatic mistake.' },
      { id: 'always-wait', title: 'Waiting is always better', correct: false,
        rationale: 'If that were true, nobody would ever buy anything. Some things — like a one-time concert — genuinely don’t come back.' },
    ],
    cta: 'Check answer',
  },
};

const copy1718: ScreenCopy = {
  hook: {
    kicker: 'Before we start',
    headline: 'A weekend trip with friends. ₹15,000. You can afford it.',
    lines: [
      { text: 'Book it today, or let that ₹15,000 sit and grow instead.' },
      { text: 'Which one actually costs you more?', accent: true },
    ],
    cta: "Let's see",
  },
  explain: {
    kicker: 'What waiting really means',
    headline: 'Every rupee spent is a rupee that stops growing.',
    body: [
      "Money you don't spend doesn't just sit there — invested, it **quietly grows** on its own.",
      'Spending something now is never free. You also give up whatever that money **could have become**.',
    ],
    cta: 'Try it yourself',
  },
  interact: {
    kicker: 'Your ₹15,000',
    headline: 'Pick your instinct, then fast-forward.',
    labels: {
      buy: 'Book it now', wait: 'Wait and grow',
      fastForward: 'Fast-forward {{years}} years',
      buyOutcome: 'If you booked it', waitOutcome: 'If you waited',
    },
    cta: 'I see it',
    lockedCta: 'Pick one, then fast-forward',
  },
  decide: {
    kicker: 'Your call',
    headline: 'The ₹15,000 is still sitting there. What do you actually do?',
    options: [
      { id: 'buy', title: 'Book the trip today', subtitle: 'You go this weekend', figure: '₹0 left growing' },
      { id: 'wait', title: 'Leave it to grow', subtitle: 'No trip this weekend', figure: '{{fv}} by {{landingAge}}' },
    ],
    cta: 'Lock it in',
  },
  feedback: {
    kicker: "Here's what happened",
    verdicts: {
      buy: {
        tone: 'cost',
        title: 'You went on the trip. That is it.',
        body:
          "₹15,000 well spent — but that same ₹15,000, invested, would have become **{{fv}}** by the time you're {{landingAge}}. That's the real price of booking now: not ₹15,000, but **{{growth}}** you'll never see.",
      },
      wait: {
        tone: 'good',
        title: "You'll thank yourself at {{landingAge}}.",
        body:
          "No trip this weekend. But that ₹15,000 grows in the background, and by the time you're {{landingAge}} it's **{{fv}}** — **{{growth}}** more, for doing nothing at all.",
      },
    },
    myth: {
      struck: 'Waiting means missing out.',
      correction:
        "Waiting doesn't mean missing out — **spending now** is what you actually give up. **{{growth}}** of it, in this case.",
    },
    vocab: {
      term: 'Opportunity cost',
      definition:
        'What you give up by choosing one thing over another. The trip costs ₹15,000 — it also costs whatever that ₹15,000 would have grown into.',
    },
    cta: 'Got it',
  },
  practice: {
    kicker: 'Quick check',
    prompt:
      'Your friend has ₹10,000 saved. He can buy a laptop upgrade today for a freelance gig starting Monday, or leave the money invested for 12 years — it would become about ₹31,000.',
    options: [
      { id: 'always-buy', title: 'Buying now is always the smart move', correct: false,
        rationale: 'Not always — most of the time, waiting wins. This is the exception, and it matters why.' },
      { id: 'depends', title: 'It depends whether the gig actually needs it', correct: true,
        rationale: 'Exactly. If the upgrade genuinely earns him more than he’d have made investing it, spending now is the correct call — opportunity cost cuts both ways.' },
      { id: 'always-wait', title: 'Waiting is always better', correct: false,
        rationale: 'If that were true, nobody would ever invest in their own income. Money that earns you more money is a real exception.' },
    ],
    cta: 'Check answer',
  },
};

export const J01_MINDSET: Experience = {
  id: 'e01',
  journeyId: 'j01',
  slug: 'buy-it-now-or-wait',
  title: 'Buy It Now, or Wait?',
  mechanicType: 'choice-fastforward',
  isCore: true,
  timeSensitive: false,
  concepts: ['opportunity-cost', 'delayed-gratification', 'needs-vs-wants'],
  availableTo: ['12-14', '15-16', '17-18'],
  ageVariants: {
    '12-14': { params: params1214 as unknown as Record<string, unknown>, copy: copy1214 },
    '15-16': { params: params1516 as unknown as Record<string, unknown>, copy: copy1516 },
    '17-18': { params: params1718 as unknown as Record<string, unknown>, copy: copy1718 },
  },
};
