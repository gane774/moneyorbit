import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage, { CONTACT_EMAIL } from '@/components/legal/LegalPage';

export const metadata: Metadata = { title: 'Terms of Use · MoneyOrbit' };

export default function Terms() {
  return (
    <LegalPage title="Terms of Use">
      <p>
        By using MoneyOrbit you agree to these terms. They are short on purpose.
      </p>

      <h2>What MoneyOrbit is</h2>
      <p>
        A free educational tool that teaches how money works through short
        lessons, simulations and calculators. It costs nothing and there is
        nothing to buy.
      </p>

      <h2>It is not financial advice</h2>
      <p>
        Everything here is for learning. The numbers in lessons and in the
        Money Lab are worked examples, and interest rates, prices and rules
        change. Nothing on MoneyOrbit tells you to buy, sell or invest in
        anything. Before a real money decision, check current figures and talk
        to a parent, guardian or a qualified adviser.
      </p>

      <h2>Who can use it</h2>
      <p>
        MoneyOrbit is built for students aged 12 to 18. If you are under 18,
        use it with the knowledge of a parent or guardian.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>Give your real age, so you see the right version of each lesson.</li>
        <li>Keep your password to yourself. You are responsible for what happens on your account.</li>
        <li>One account per person. Do not sign up as someone else.</li>
      </ul>

      <h2>Fair use</h2>
      <p>
        Do not try to break the site, get into other people&rsquo;s accounts,
        or copy the lessons to pass off as your own. We may close accounts
        that do.
      </p>

      <h2>The content</h2>
      <p>
        The lessons, simulations and design belong to MoneyOrbit. You are
        welcome to share links to the site and talk about what you learned.
      </p>

      <h2>No guarantees</h2>
      <p>
        We work to keep the content accurate and the site running, but it is
        offered as it is. We may change, pause or remove lessons or features.
        We are not responsible for decisions you make based on it.
      </p>

      <h2>Your data</h2>
      <p>How we handle your information is in the <Link href="/privacy">Privacy Policy</Link>.</p>

      <h2>Changes and contact</h2>
      <p>
        If these terms change, the date at the top changes too.
        {CONTACT_EMAIL && <> Questions: <b>{CONTACT_EMAIL}</b></>}
      </p>
    </LegalPage>
  );
}
