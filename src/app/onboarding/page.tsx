'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { bandForAge } from '@/content/types';
import * as P from '@/lib/progress';
import { signUp, USERNAME_RE } from '@/lib/auth';

/** Section 9: username, full name, exact age, and either email or phone.
 *  Split into three beats so it reads as a short flow, not a form.
 *  Step 4 is the consent slot — schema and UI exist, feature-flagged off. */
const CONSENT_STEP_ENABLED = false;

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const ageNum = parseInt(age, 10);

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.trim());
  const validPhone = /^[+]?[\d\s-]{10,15}$/.test(contact.trim());

  const finish = async () => {
    if (!validEmail && !validPhone) {
      setErr('Enter an email address or a phone number we can reach you on.');
      return;
    }
    if (password.length < 8) {
      setErr('Password must be at least 8 characters.');
      return;
    }
    setBusy(true);
    setErr(null);

    const res = await signUp({
      username: username.trim().toLowerCase(),
      password,
      fullName: fullName.trim(),
      age: ageNum,
      contactMethod: validEmail ? 'email' : 'phone',
      contactValue: contact.trim(),
    });

    if (!res.ok) {
      setBusy(false);
      setErr(res.error);
      return;
    }

    /* localStorage stays the source of truth for an in-progress lesson so a
       refresh resumes instantly without waiting on the network. It now also
       carries the studentId, which is what links this device's progress to the
       account when it syncs. */
    P.update((p) => ({
      ...p,
      studentId: res.studentId,
      fullName: fullName.trim(),
      username: username.trim().toLowerCase(),
      age: ageNum,
      ageBand: bandForAge(ageNum),
    }));
    router.push('/home');
  };

  return (
    <main className="player">
      <div className="stage">
        <div className="scr" style={{ paddingTop: 34 }}>
          {step === 0 && (
            <>
              <div className="kicker">First things first</div>
              <h1 className="h-big">What should we call you?</h1>

              <div style={{ marginTop: 26 }}>
                <div className="field">
                  <label htmlFor="fn">Your name</label>
                  <input
                    id="fn" value={fullName} autoComplete="name"
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ganesh Tamagond"
                  />
                </div>
                <div className="field">
                  <label htmlFor="un">Pick a username</label>
                  <input
                    id="un" value={username} autoComplete="username"
                    onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
                    placeholder="ganesh27"
                  />
                </div>
              </div>

              <div className="spacer" />
              <button
                className="btn"
                disabled={fullName.trim().length < 2 || username.trim().length < 3}
                onClick={() => { setErr(null); setStep(1); }}
              >
                Next
              </button>
            </>
          )}

          {step === 1 && (
            <>
              <div className="kicker">So we pitch it right</div>
              <h1 className="h-big">How old are you?</h1>
              <p className="body-s">
                The examples change with your age. A 13-year-old budgets pocket money;
                a 17-year-old budgets a salary.
              </p>

              <div className="field" style={{ marginTop: 22 }}>
                <label htmlFor="age">Age</label>
                <input
                  id="age" type="number" inputMode="numeric" min={12}
                  value={age} onChange={(e) => setAge(e.target.value)} placeholder="15"
                />
                {/* No upper bound: 17 and above all get the 17-18 content. */}
                {ageNum && ageNum < 12 ? (
                  <div className="err">This course starts at age 12.</div>
                ) : null}
              </div>

              <div className="spacer" />
              <button
                className="btn"
                disabled={!(ageNum >= 12)}
                onClick={() => { setErr(null); setStep(2); }}
              >
                Next
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="kicker">Last one</div>
              <h1 className="h-big">Where can we reach you?</h1>
              <p className="body-s">
                Email or phone, whichever you actually use. We use it to save your
                progress — nothing else.
              </p>

              <div className="field" style={{ marginTop: 22 }}>
                <label htmlFor="ct">Email or phone</label>
                <input
                  id="ct" value={contact} autoComplete="email"
                  onChange={(e) => { setContact(e.target.value); setErr(null); }}
                  placeholder="you@example.com"
                />
              </div>

              <div className="field" style={{ marginTop: 16 }}>
                <label htmlFor="pw">Pick a password</label>
                <input
                  id="pw" type="password" value={password} autoComplete="new-password"
                  onChange={(e) => { setPassword(e.target.value); setErr(null); }}
                  placeholder="At least 8 characters"
                />
                <div className="hint">
                  You will sign in with <b>{username.trim().toLowerCase() || 'your username'}</b> and this password.
                </div>
                {err && <div className="err">{err}</div>}
              </div>

              <div className="spacer" />
              <button
                className="btn"
                disabled={busy || password.length < 8}
                onClick={finish}
              >
                {busy ? 'Creating your account…' : 'Create account'}
              </button>
              <button
                className="btn ghost"
                style={{ marginTop: 10 }}
                onClick={() => router.push('/login')}
              >
                I already have an account
              </button>
            </>
          )}

          {CONSENT_STEP_ENABLED && step === 3 && (
            /* Verifiable parental consent flow lands here when built. */
            <div />
          )}
        </div>
      </div>
    </main>
  );
}
