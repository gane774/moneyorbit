'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser Supabase client. Uses the publishable (anon) key, which is safe to
 * ship: every table has RLS enabled, so this key grants nothing on its own.
 * Authorization is enforced in Postgres, never by hiding routes.
 */
let cached: ReturnType<typeof createBrowserClient> | null = null;

export function supabase() {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Supabase environment variables are missing.');
  cached = createBrowserClient(url, key);
  return cached;
}
