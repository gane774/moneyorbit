'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { resolveStartDestination } from '@/lib/startDestination';

/**
 * The hero CTA was a hardcoded link to /onboarding, so a student who had
 * already started was sent back to sign-up from the front page.
 *
 * The label is resolved in an effect rather than during render: it reads
 * localStorage, which does not exist on the server, so rendering it directly
 * would mismatch during hydration. The server-safe default is the same words
 * a first-time visitor should see, which is also the common case.
 */
export default function HeroCta() {
  const router = useRouter();
  const [label, setLabel] = useState('Start your MoneyOrbit');

  useEffect(() => { setLabel(resolveStartDestination().label); }, []);

  return (
    <button className="btn" onClick={() => router.push(resolveStartDestination().href)}>
      {label}
    </button>
  );
}
