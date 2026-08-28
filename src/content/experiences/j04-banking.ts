import type { Experience, ScreenCopy } from '../types';

export interface FlowTraceParams {
  amount: number;
  recipientLabel: string;
  steps: { label: string; detail: string }[];
}

/** Same script for all three bands (per author decision). */
const params: FlowTraceParams = {
  amount: 500,
  recipientLabel: 'your friend',
  steps: [
    { label: 'You send ₹500', detail: 'UPI app, your friend’s ID, ₹500, your PIN' },
    { label: 'Your bank checks your balance', detail: 'Confirms you actually have ₹500 to send' },
    { label: 'Routed through the UPI network', detail: 'The layer that connects every bank to every other bank' },
    { label: 'Reaches your friend’s bank', detail: 'Their bank credits the account' },
    { label: '₹500 lands — both phones ping', detail: 'Done. The whole trip took under five seconds.' },
  ],
};

const copy: ScreenCopy = {
  hook: {
    kicker: 'Before we start',
    headline: "You're sending your friend ₹500 for movie tickets.",
    lines: [
      { text: 'Watch where it actually goes.' },
      { text: 'It is not as simple as "money teleports."', accent: true },
    ],
    cta: "Let's trace it",
  },
  explain: {
    kicker: 'How UPI actually moves money',
    headline: 'Every payment takes the same path, whether you notice it or not.',
    body: [
      'Your ₹500 doesn’t jump straight into your friend’s account.',
      'It passes through **your bank**, the **UPI network**, and **their bank** — in under five seconds.',
    ],
    cta: 'Trace it yourself',
  },
  interact: {
    kicker: 'Sending ₹500',
    headline: 'Step through where your money actually goes.',
    labels: { next: 'Next step', done: 'It landed' },
    cta: 'I see the whole trip',
    lockedCta: 'Step through the trace',
  },
  decide: {
    kicker: 'A twist',
    headline: 'Now you’re selling an old cricket bat online. A "buyer" messages you:',
    body: [
      '"Hi! I’ve sent ₹500 for the bat. Just accept the payment request and enter your UPI PIN to receive it — thanks!"',
    ],
    options: [
      { id: 'enter-pin', title: 'Enter your PIN to collect the ₹500', subtitle: 'They said it’s needed to receive the payment' },
      { id: 'ignore', title: 'Ignore it, check your bank app directly', subtitle: 'See if the ₹500 actually landed first' },
    ],
    cta: 'Lock it in',
  },
  feedback: {
    kicker: "Here's what happened",
    verdicts: {
      'enter-pin': {
        tone: 'cost',
        title: '₹500 just left your account.',
        body:
          'That was never a payment arriving. It was a **collect request** — a request for money to leave your account. Entering your PIN approved it going **out**, not in.',
      },
      ignore: {
        tone: 'good',
        title: 'Your ₹500 is exactly where it was.',
        body:
          'You checked your bank app directly and found nothing had actually landed — because nothing was ever being sent to you. The "buyer" was hoping you’d never check.',
      },
    },
    myth: {
      struck: 'If someone is paying me, they need my PIN to send it.',
      correction:
        'Your PIN only ever authorizes money **leaving** your account. Nobody, ever, needs it to send you money.',
    },
    vocab: {
      term: 'UPI',
      definition:
        'Unified Payments Interface — the system that moves money between any two Indian bank accounts in seconds, using just a phone number or ID instead of full account details.',
    },
    cta: 'Got it',
  },
  practice: {
    kicker: 'Quick check',
    prompt:
      'You get a call: "This is Priya from the electricity board. You overpaid last month — to refund the ₹340, we just need you to verify your account by entering the OTP we’re sending you now."',
    options: [
      { id: 'give-otp', title: 'Give the OTP — it’s just to verify', correct: false,
        rationale: 'A real refund never needs your OTP. That OTP is the only thing standing between the caller and your money.' },
      { id: 'refuse', title: 'Refuse, and check your account directly', correct: true,
        rationale: 'Exactly. Refunds land on their own. Nobody needs a code from you to give you money back — that request only ever protects money leaving.' },
      { id: 'ask-amount', title: 'Ask them to confirm the amount first, then give it', correct: false,
        rationale: 'The amount being right or wrong changes nothing — the OTP itself is the red flag, no matter what number they quote.' },
    ],
    cta: 'Check answer',
  },
};

export const J04_BANKING: Experience = {
  id: 'e04',
  journeyId: 'j04',
  slug: 'follow-the-500',
  title: 'Follow the ₹500',
  mechanicType: 'flow-trace',
  isCore: true,
  timeSensitive: false,
  concepts: ['how-banks-work', 'upi-safety'],
  availableTo: ['12-14', '15-16', '17-18'],
  ageVariants: {
    '12-14': { params: params as unknown as Record<string, unknown>, copy },
    '15-16': { params: params as unknown as Record<string, unknown>, copy },
    '17-18': { params: params as unknown as Record<string, unknown>, copy },
  },
};
