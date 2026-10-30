import type { Metadata } from 'next';
import LegalPage, { CONTACT_EMAIL } from '@/components/legal/LegalPage';

export const metadata: Metadata = { title: 'Privacy Policy · MoneyOrbit' };

/* Every statement here is checked against what the code actually does
   (supabase/migrations/0001_init_schema.sql, src/lib/auth.ts,
   src/lib/progress.ts, src/lib/audio/prefs.ts). If the schema changes,
   change this page in the same commit. */
export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        MoneyOrbit is a free set of short lessons about money for students aged
        12 to 18 in India. This page says exactly what we store about you, why,
        and how to get it deleted. It is written to be read, not skimmed past.
      </p>

      <h2>What we ask for when you sign up</h2>
      <ul>
        <li><b>Your name.</b> So the app can greet you and so we know who an account belongs to.</li>
        <li><b>A username and password.</b> To sign you in. Your password is stored by our sign-in provider in a scrambled (hashed) form. We cannot see it.</li>
        <li><b>Your age.</b> Lessons come in three versions (12 to 14, 15 to 16, 17 to 18), and your age picks which one you see.</li>
        <li><b>An email address or phone number.</b> Only so you can get back into your account if you forget your password. We do not send marketing and we do not share it.</li>
      </ul>

      <h2>What we record while you use it</h2>
      <ul>
        <li><b>Your progress.</b> Which lessons you have started or finished, where you stopped, and the choices you made inside a lesson.</li>
        <li><b>Quiz answers.</b> Which option you picked and whether it was right.</li>
        <li><b>How well you know each idea</b>, from &ldquo;introduced&rdquo; up to &ldquo;mastered&rdquo;.</li>
        <li><b>A simple activity log</b>: when you created your account, started or finished a lesson, or finished the course. Each entry is marked as belonging to an under-18 or adult user.</li>
        <li><b>When you were last active.</b></li>
      </ul>
      <p>
        We do not use advertising, tracking pixels or third-party analytics,
        and we do not collect your location.
      </p>

      <h2>What stays on your device</h2>
      <p>
        Your browser keeps a copy of your lesson progress and your sound
        settings, plus the sign-in session that keeps you logged in. The
        Money Lab tools (budget planner, statement reader and the rest) run
        entirely in your browser. Nothing you type into them is sent to us.
      </p>

      <h2>Who can see it</h2>
      <ul>
        <li><b>You</b> can see your own progress. Other students cannot see anything about you.</li>
        <li><b>The MoneyOrbit team</b> (a small number of admin accounts) can see a dashboard of how lessons are going, to find out which ones are confusing and fix them.</li>
        <li><b>Our service providers</b> store the data for us: Supabase (database and sign-in) and Vercel (hosting the website). They process it only to run MoneyOrbit.</li>
      </ul>
      <p>We never sell your information, and we never use it for advertising.</p>

      <h2>Under-18s and parents</h2>
      <p>
        Most people using MoneyOrbit are under 18. Under India&rsquo;s Digital
        Personal Data Protection Act, a parent or guardian should agree before
        a child&rsquo;s data is collected. If you are a parent and want to know
        what we hold about your child, or want it removed, contact us and we
        will act on it.
      </p>

      <h2>Keeping and deleting your data</h2>
      <p>
        We keep your account for as long as it exists. To delete it, contact us
        from the email or phone you signed up with, or tell us your username.
        Deleting your account removes your name, contact detail, progress,
        quiz answers and mastery records. Activity log entries stay but lose
        any link to you.
      </p>

      {CONTACT_EMAIL && (
        <>
          <h2>Contact</h2>
          <p>Questions, corrections or deletion requests: <b>{CONTACT_EMAIL}</b></p>
        </>
      )}
      <p>If this policy changes, the date at the top of this page changes with it.</p>
    </LegalPage>
  );
}
