import { COMMIT_OPTION_ID } from '../types';
import type { Experience, ScreenCopy } from '../types';

export interface ScamOffer { id: string; message: string; isScam: boolean; redFlag: string }
export interface SpotScamParams { offers: ScamOffer[] }

/** Same script for all three bands (per author decision). */
const params: SpotScamParams = {
  offers: [
    {
      id: 'fd-renewal', isScam: false,
      message: 'Your ₹10,000 fixed deposit is up for renewal — visit your bank branch or the official app to renew and claim your ₹2,000 loyalty cashback.',
      redFlag: 'No urgency, no PIN or OTP request, and it points you to your own bank’s branch or app — not a link in the message.',
    },
    {
      id: 'lucky-draw', isScam: true,
      message: '🎉 You’ve WON ₹50,000 in our Lucky Draw! Click the link within 30 minutes and enter your UPI PIN to claim your prize.',
      redFlag: 'An unearned prize, a countdown, and a PIN request to "receive" money — three classic scam signals stacked together.',
    },
    {
      id: 'electricity-bill', isScam: false,
      message: 'Your electricity bill of ₹850 is due on the 30th. Pay via your bank’s bill-pay section or the official utility app.',
      redFlag: 'A real, expected expense, no pressure, and no request for a PIN or OTP over chat.',
    },
    {
      id: 'fraud-dept', isScam: true,
      message: 'This is the bank’s fraud department. We’ve detected suspicious activity — please read out the OTP you just received to secure your account.',
      redFlag: 'No genuine bank or fraud team will ever ask you to read an OTP aloud. That request IS the fraud.',
    },
  ],
};

const copy: ScreenCopy = {
  hook: {
    kicker: 'Before we start',
    headline: 'Four messages just landed on your phone.',
    lines: [
      { text: 'One prize. One bill. One renewal. One "fraud department."' },
      { text: 'Which ones are actually real?', accent: true },
    ],
    cta: "Let's find out",
  },
  explain: {
    kicker: 'What actually matters',
    headline: 'Real requests for money never come with urgency, prizes, or a PIN.',
    body: [
      'A genuine bank, biller, or company will never rush you, promise you something you didn’t earn, or ask for your **PIN or OTP** over chat or a call.',
      'Everything else in the message is noise. The PIN or OTP request is the one detail that matters.',
    ],
    cta: 'Try it yourself',
  },
  interact: {
    kicker: 'Four messages',
    headline: 'Read each one. Mark it Legit or Scam.',
    labels: { legit: 'Legit', scam: 'Scam' },
    cta: "I've judged them all",
    lockedCta: 'Judge all four',
  },
  decide: {
    kicker: 'Lock it in',
    headline: 'That’s your read on all four.',
    cta: 'Lock it in',
  },
  feedback: {
    kicker: "Here's the score",
    verdicts: {
      [COMMIT_OPTION_ID]: {
        tone: 'good',
        title: 'Two were real. Two were after your PIN.',
        lines: [
          'The FD renewal and the electricity bill — real. No urgency, no PIN, no OTP.',
          'The lucky draw and the "fraud department" call — scams. Both wanted a PIN or OTP.',
        ],
        body:
          'The one thing every scam here had in common: **a request for your PIN or OTP.** Nothing else about the message matters nearly as much as that one detail.',
      },
    },
    myth: {
      struck: "Scams are obvious. That won't be me.",
      correction:
        'The good ones don’t look obvious — that’s the whole design. The giveaway isn’t how the message feels, it’s **whether it asks for your PIN or OTP**.',
    },
    vocab: {
      term: 'Red flag',
      definition:
        'A specific, nameable detail that reliably signals a scam — not a gut feeling. Urgency, an unearned prize, and a PIN or OTP request are the three that matter most.',
    },
    cta: 'Got it',
  },
  practice: {
    kicker: 'Quick check',
    prompt:
      'You get a call: "This is your bank. We’re processing a refund for a duplicate payment — just confirm the OTP we’re sending now so we can credit your account."',
    options: [
      { id: 'confirm', title: 'Confirm the OTP — it’s just to receive the refund', correct: false,
        rationale: 'A refund landing in your account never needs an OTP from you. That OTP is the only thing protecting money from leaving, not arriving.' },
      { id: 'refuse', title: 'Refuse, and check your account directly for the refund', correct: true,
        rationale: 'Exactly the same pattern as the fraud-department call. Real refunds show up on their own — nobody needs a code from you to give you money.' },
      { id: 'ask-details', title: 'Ask for the transaction ID first, then give the OTP', correct: false,
        rationale: 'A convincing transaction ID doesn’t change what the OTP protects. The request itself is the red flag, no matter how legitimate the rest of the call sounds.' },
    ],
    cta: 'Check answer',
  },
};

export const J11_SCAMS: Experience = {
  id: 'e11',
  journeyId: 'j11',
  slug: 'spot-the-scam',
  title: 'Spot the Scam',
  mechanicType: 'spot-scam',
  isCore: true,
  timeSensitive: false,
  concepts: ['scam-red-flags', 'guaranteed-returns', 'phishing-otp'],
  availableTo: ['12-14', '15-16', '17-18'],
  ageVariants: {
    '12-14': { params: params as unknown as Record<string, unknown>, copy },
    '15-16': { params: params as unknown as Record<string, unknown>, copy },
    '17-18': { params: params as unknown as Record<string, unknown>, copy },
  },
};
