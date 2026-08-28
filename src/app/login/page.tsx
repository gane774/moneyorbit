'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth';
import { pullProgress } from '@/lib/sync';

/**
 * Sign-in for a returning student. Signing in on a new device pulls that
 * account's progress down from Postgres, which is the whole point of having
 * accounts at all -- before this, progress lived only in one browser.
 */
export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setErr(null);
    const res = await signIn(username.trim().toLowerCase(), password);
    if (!res.ok) {
      setBusy(false);
      setErr(res.error);
      return;
    }
    await pullProgress();
    router.push('/home');
  };

  return (
    <main className="player">
      <div className="stage">
        <div className="scr" style={{ paddingTop: 34 }}>
          <div className="kicker">Welcome back</div>
          <h1 className="h-big">Sign in.</h1>

          <div className="field" style={{ marginTop: 22 }}>
            <label htmlFor="u">Username</label>
            <input
              id="u" value={username} autoComplete="username" autoCapitalize="none"
              onChange={(e) => { setUsername(e.target.value); setErr(null); }}
              placeholder="ganesh27"
            />
          </div>

          <div className="field" style={{ marginTop: 16 }}>
            <label htmlFor="p">Password</label>
            <input
              id="p" type="password" value={password} autoComplete="current-password"
              onChange={(e) => { setPassword(e.target.value); setErr(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter' && username && password) submit(); }}
              placeholder="Your password"
            />
            {err && <div className="err">{err}</div>}
          </div>

          <div className="spacer" />
          <button className="btn" disabled={busy || !username || !password} onClick={submit}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
          <button
            className="btn ghost"
            style={{ marginTop: 10 }}
            onClick={() => router.push('/onboarding')}
          >
            Create an account instead
          </button>
        </div>
      </div>
    </main>
  );
}
