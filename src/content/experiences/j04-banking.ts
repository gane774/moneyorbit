import { COMMIT_OPTION_ID } from '../types';
import type { Experience, ScreenCopy } from '../types';

/**
 * Banking & Digital Payments.
 *
 * Rewritten away from "watch ₹500 travel through five nodes". Knowing the
 * route a payment takes is trivia; a student is never asked to route a
 * payment. What they are asked, constantly, is whether to approve something.
 * So every situation here is a decision with a consequence, and the through
 * line is the one rule that survives contact with every scam in this journey:
 * a PIN authorises money LEAVING, never arriving.
 */

export interface PaymentCase {
  id: string;
  /** How the situation reaches them — a message, a call, an app screen. */
  channel: 'message' | 'call' | 'app';
  situation: string;
  detail: string;
  options: { id: string; label: string; safe: boolean; outcome: string }[];
}

export interface PaymentDecisionParams {
  cases: PaymentCase[];
}

/** One shared script: the decisions are the same at any age, and the amounts
 *  are small enough to stay concrete for a 12-year-old. */
const params: PaymentDecisionParams = {
  cases: [
    {
      id: 'collect-request',
      channel: 'message',
      situation: 'A buyer for your old cricket bat messages you.',
      detail: '“I’ve sent ₹800. Accept the request and enter your UPI PIN to receive it.”',
      options: [
        {
          id: 'enter-pin', label: 'Enter the PIN to collect it', safe: false,
          outcome: '₹800 leaves your account. That was a collect request — a request for money FROM you. Your PIN approved it going out.',
        },
        {
          id: 'check-app', label: 'Ignore it and open your bank app', safe: true,
          outcome: 'Nothing had arrived, because nothing was being sent. Money that is genuinely paid to you appears on its own, with no action from you.',
        },
        {
          id: 'ask-again', label: 'Ask them to send it again properly', safe: false,
          outcome: 'Polite, and still risky — you have kept the conversation open and they will simply send another request. There is nothing to fix: incoming money never needs your PIN.',
        },
      ],
    },
    {
      id: 'new-payee',
      channel: 'app',
      situation: 'You are paying ₹2,500 to someone for the first time.',
      detail: 'The app shows their UPI ID and the amount, and asks you to confirm.',
      options: [
        {
          id: 'check-name', label: 'Check the name the app shows against who you expect', safe: true,
          outcome: 'Right. UPI shows the registered name of whoever owns that ID. If it is not the person you think you are paying, stop there — this is the one check that catches a mistyped or swapped ID.',
        },
        {
          id: 'check-amount', label: 'Check the amount is right and confirm', safe: false,
          outcome: 'Worth doing, but the amount was never the risk. Sending the right amount to the wrong person is still gone.',
        },
        {
          id: 'send-one-rupee', label: 'Send ₹1 first to test', safe: false,
          outcome: 'A common habit, and mostly wasted. It proves the ID exists, not that it belongs to the right person — the name check does that, instantly and for free.',
        },
      ],
    },
    {
      id: 'failed-debit',
      channel: 'app',
      situation: 'Money left your account, but the payment says “failed”.',
      detail: '₹1,200 debited. The merchant says they received nothing.',
      options: [
        {
          id: 'pay-again', label: 'Pay again so the merchant is not left waiting', safe: false,
          outcome: 'Now you are ₹2,400 down. Failed UPI payments reverse on their own, usually within a few days — paying twice creates a second problem instead of solving the first.',
        },
        {
          id: 'wait-and-raise', label: 'Wait for the auto-reversal, and raise a complaint in the app', safe: true,
          outcome: 'Correct. A failed payment is reversed automatically, and the app’s own complaint flow is the record that matters if it is not. No one needs to be paid twice.',
        },
        {
          id: 'call-number', label: 'Search online for a helpline and call it', safe: false,
          outcome: 'This is how a lot of people get scammed. Numbers that rank highly for “UPI refund helpline” are often planted. Use the complaint option inside the app itself.',
        },
      ],
    },
    {
      id: 'wrong-id',
      channel: 'app',
      situation: 'You sent ₹3,000 to the wrong UPI ID.',
      detail: 'One character off. It went to a stranger.',
      options: [
        {
          id: 'raise-in-app', label: 'Raise it in the app immediately, then with your bank', safe: true,
          outcome: 'The right order, and speed matters. There is a real dispute process, and it works best before the money is moved onward — but recovery depends on the stranger agreeing, so this is not guaranteed.',
        },
        {
          id: 'message-them', label: 'Message the stranger and ask them to return it', safe: false,
          outcome: 'You can, and some people do return it. But it is not a process, there is no record, and it gives you nothing to escalate if they refuse.',
        },
        {
          id: 'nothing', label: 'Nothing — sent is sent', safe: false,
          outcome: 'Understandable, and wrong. There is a formal dispute route, and not using it guarantees the outcome you assumed.',
        },
      ],
    },
    {
      id: 'autopay',
      channel: 'message',
      situation: 'A payment request arrives from an app you tried once.',
      detail: '“Approve ₹499 — subscription renewal.” You do not remember agreeing to it.',
      options: [
        {
          id: 'approve', label: 'Approve it — cancelling later is easier', safe: false,
          outcome: 'Approving a UPI mandate is what makes it recurring. It is far easier to decline once than to unpick an autopay you agreed to.',
        },
        {
          id: 'decline-check', label: 'Decline it, then check your autopay list', safe: true,
          outcome: 'Right. Declining costs nothing if it was genuine — they will ask again. And the autopay list is where quiet renewals live; almost nobody looks at it.',
        },
        {
          id: 'ignore', label: 'Ignore it and let it expire', safe: false,
          outcome: 'Better than approving, but it leaves the mandate to try again next month. Declining and checking the list actually closes it.',
        },
      ],
    },
  ],
};

const copy: ScreenCopy = {
  hook: {
    kicker: 'Before we start',
    headline: 'You will approve or refuse hundreds of payments this year.',
    lines: [
      { text: 'Most take under three seconds and almost none of them go wrong.' },
      { text: 'The few that do go wrong all look ordinary first.', accent: true },
    ],
    cta: "Let's see them",
  },
  explain: {
    kicker: 'The one rule underneath all of it',
    headline: 'Your PIN moves money out. It never brings money in.',
    body: [
      'Anything genuinely being **paid to you** arrives on its own. You do not approve it, and you do not enter anything.',
      'So a request for your PIN, OTP or approval is always about money **leaving** — whatever the message says it is for.',
    ],
    cta: 'Try it yourself',
  },
  interact: {
    kicker: 'Five situations',
    headline: 'Decide what you would actually do.',
    labels: { next: 'Next situation', done: 'See how you did' },
    cta: "I've decided all five",
    lockedCta: 'Work through all five',
  },
  decide: {
    kicker: 'Lock it in',
    headline: 'That is how you would handle each one.',
    body: ['The habits underneath those choices are what you will actually use.'],
    cta: 'Lock it in',
  },
  feedback: {
    kicker: 'What holds all five together',
    verdicts: {
      [COMMIT_OPTION_ID]: {
        tone: 'good',
        title: 'Approving is the risky action. Receiving is not.',
        lines: [
          'A PIN or OTP request means money going **out** — always, whatever the reason given.',
          'Check the **name** the app shows, not the ID you typed.',
          'Failed payments reverse themselves. Never pay a second time.',
          'Use the complaint route **inside the app**, never a helpline number you searched for.',
          'Declining a request costs nothing. A genuine one comes back.',
        ],
        body:
          'None of these need you to know how UPI works underneath. They need you to notice **which direction the money is moving** — and to be suspicious of anything that hurries you past that question.',
      },
    },
    myth: {
      struck: 'If someone is paying me, I need to approve it.',
      correction:
        'Money coming **in** needs nothing from you. Every approval, PIN and OTP exists to let money **out** — which is exactly why scams are built around them.',
    },
    vocab: {
      term: 'Collect request',
      definition:
        'A UPI request asking YOU to pay someone. It looks almost identical to a notification about money arriving, and that resemblance is the entire trick.',
    },
    cta: 'Got it',
  },
  practice: {
    kicker: 'Quick check',
    prompt:
      'You are selling a phone. The buyer says: “I have transferred ₹12,000 but it is held. Approve the request on your app and it will release.” Your bank app shows nothing received.',
    options: [
      {
        id: 'approve', title: 'Approve the request to release it', correct: false,
        rationale: 'Approving sends ₹12,000 out. There is no such thing as an incoming payment "held" until you approve — that phrasing exists to make a collect request sound like a delivery.',
      },
      {
        id: 'refuse', title: 'Refuse, and go by what your own bank app shows', correct: true,
        rationale: 'Your app is the only account of what actually happened. It shows nothing received because nothing was sent, and the request is asking you to pay them.',
      },
      {
        id: 'screenshot', title: 'Ask for a screenshot of the transfer first', correct: false,
        rationale: 'A screenshot proves nothing — they are trivially faked, and plenty of these scams lead with one. Your own bank app is the only record that counts.',
      },
    ],
    cta: 'Check answer',
  },
};

export const J04_BANKING: Experience = {
  id: 'e04',
  journeyId: 'j04',
  slug: 'follow-the-500',
  title: 'Would You Approve This?',
  mechanicType: 'payment-decisions',
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
