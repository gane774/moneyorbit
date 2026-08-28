'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminSignIn } from '@/lib/admin';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true); setErr(null);
    const e = await adminSignIn(email, password);
    if (e) { setBusy(false); setErr(e); return; }
    router.push('/admin');
  };

  return (
    <main className="player">
      <div className="stage">
        <div className="scr" style={{ paddingTop: 34 }}>
          <div className="kicker">MoneyOrbit</div>
          <h1 className="h-big">Admin.</h1>

          <div className="field" style={{ marginTop: 22 }}>
            <label htmlFor="e">Email</label>
            <input id="e" value={email} autoComplete="username"
              onChange={(ev) => { setEmail(ev.target.value); setErr(null); }} />
          </div>
          <div className="field" style={{ marginTop: 16 }}>
            <label htmlFor="p">Password</label>
            <input id="p" type="password" value={password} autoComplete="current-password"
              onChange={(ev) => { setPassword(ev.target.value); setErr(null); }}
              onKeyDown={(ev) => { if (ev.key === 'Enter' && email && password) submit(); }} />
            {err && <div className="err">{err}</div>}
          </div>

          <div className="spacer" />
          <button className="btn" disabled={busy || !email || !password} onClick={submit}>
            {busy ? 'Checking…' : 'Sign in'}
          </button>
        </div>
      </div>
    </main>
  );
}
