import Link from 'next/link';
import type { ReactNode } from 'react';

/** Shared shell for /privacy and /terms. Server component: no JS shipped. */

/* Set this to the address students and parents should write to. While it is
   null, both pages hide every line that would show it. */
export const CONTACT_EMAIL: string | null = null;
export const LAST_UPDATED = '30 October 2026';

export default function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="sheet legal">
      <Link href="/" className="backLink">← MoneyOrbit</Link>
      <div className="kicker" style={{ color: 'var(--ink-35)' }}>Last updated {LAST_UPDATED}</div>
      <h1 className="h-mid" style={{ marginBottom: 18 }}>{title}</h1>
      {children}
    </main>
  );
}
