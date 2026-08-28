'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyRecoveryContact } from '@/lib/auth';

/**
 * Account recovery (Section 4).
 *
 * Honest about its own limits. Verifying the contact detail on file proves the
 * person is who they say they are as far as this app can tell -- but it is not
 * enough to hand out a new password on its own, because anyone who knew a
 * student's email could then take their account. So this confirms the match
 * and routes to a human step, rather than pretending to a security guarantee
 * it cannot make.
 *
 * The proper fix is a one-time code delivered to that contact, which needs an
 * email/SMS sender this project does not have yet.
 */
export default function Recover() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [contact, setContact] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<'match' | 'nomatch' | null>(null);

  const submit = async () => {
    setBusy(true);
    setResult(null);
    const ok = await verifyRecoveryContact(username, contact);
    setBusy(false);
    setResult(ok ? 'match' : 'nomatch');
  };

  return (
    <main className="player">
      <div className="stage">
        <div className="scr" style={{ paddingTop: 34 }}>
          <div className="kicker">Account recovery</div>
          <h1 className="h-big">Forgot your password?</h1>
          <p className="body-s">
            Your username is not an email address, so there is nothing to send a
            reset link to. Confirm the contact detail you signed up with instead.
          </p>

          <div className="field" style={{ marginTop: 20 }}>
            <label htmlFor="u">Username</label>
            <input id="u" value={username} autoCapitalize="none"
              onChange={(e) => { setUsername(e.target.value); setResult(null); }}
              placeholder="ganesh27" />
          </div>

          <div className="field" style={{ marginTop: 16 }}>
            <label htmlFor="c">Email or phone you signed up with</label>
            <input id="c" value={contact}
              onChange={(e) => { setContact(e.target.value); setResult(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter' && username && contact) submit(); }}
              placeholder="you@example.com" />
          </div>

          {result === 'match' && (
            <div className="verdict good" style={{ marginTop: 16 }}>
              <div className="vt">That matches our records.</div>
              <div className="vb">
                To actually reset the password we need to send a one-time code to
                that contact, and MoneyOrbit cannot send email or SMS yet. Until
                that is built, email <b>gtamagond27@gmail.com</b> from this address
                and the password will be reset manually.
              </div>
            </div>
          )}

          {result === 'nomatch' && (
            <div className="verdict" style={{ marginTop: 16 }}>
              <div className="vt">No match.</div>
              <div className="vb">
                That username and contact do not go together. Check both — and if
                you are not sure which contact you used, try the other one.
              </div>
            </div>
          )}

          <div className="spacer" />
          <button className="btn" disabled={busy || !username || !contact} onClick={submit}>
            {busy ? 'Checking…' : 'Check'}
          </button>
          <button className="btn ghost" style={{ marginTop: 10 }} onClick={() => router.push('/login')}>
            Back to sign in
          </button>
        </div>
      </div>
    </main>
  );
}
