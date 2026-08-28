'use client';

import { supabase } from './supabase/client';
import { bandForAge, type AgeBand } from '@/content/types';

/**
 * Accounts are username + password (Section 4). Supabase Auth is addressed by
 * email, so the username is mapped to a synthetic address inside a domain we
 * never send mail to. Two consequences worth stating:
 *
 *  - Username uniqueness comes free from the unique constraint on auth email,
 *    which matters because RLS deliberately prevents a client from reading any
 *    row but its own, so a "is this name taken?" lookup is impossible by design.
 *  - Nothing is ever delivered to these addresses. Real contact details are
 *    stored separately on student_identity, and account recovery has to run
 *    through that, not through this address.
 */
const SYNTHETIC_DOMAIN = 'users.moneyorbit.net';

export const USERNAME_RE = /^[a-z0-9_]{3,32}$/;

export function usernameToEmail(username: string) {
  return `${username.trim().toLowerCase()}@${SYNTHETIC_DOMAIN}`;
}

export interface SignUpInput {
  username: string;
  password: string;
  fullName: string;
  age: number;
  contactMethod: 'email' | 'phone';
  contactValue: string;
}

export type AuthResult =
  | { ok: true; studentId: string; ageBand: AgeBand }
  | { ok: false; error: string };

function lockedMessage(seconds: number): string {
  const mins = Math.max(1, Math.ceil(seconds / 60));
  return `Too many attempts. Try again in about ${mins} minute${mins === 1 ? '' : 's'}.`;
}

/** Maps Supabase's raw messages to something a 13-year-old can act on. */
function friendly(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('already registered') || m.includes('already been registered')) {
    return 'That username is taken. Try another one.';
  }
  if (m.includes('password')) return 'Password must be at least 8 characters.';
  if (m.includes('invalid login')) return 'Username or password is not right.';
  if (m.includes('email not confirmed')) {
    return 'This account is not confirmed yet. Email confirmation must be turned off for this project.';
  }
  return message;
}

export async function signUp(input: SignUpInput): Promise<AuthResult> {
  const sb = supabase();
  const username = input.username.trim().toLowerCase();

  const { data, error } = await sb.auth.signUp({
    email: usernameToEmail(username),
    password: input.password,
  });
  if (error) return { ok: false, error: friendly(error.message) };

  // No session means the project still requires email confirmation, which can
  // never arrive at a synthetic address. Fail loudly rather than leaving a
  // student with an account they can never sign in to.
  if (!data.session || !data.user) {
    return {
      ok: false,
      error: 'Account could not be activated. Email confirmation needs to be disabled for this project.',
    };
  }

  const ageBand = bandForAge(input.age);
  const { data: row, error: insErr } = await sb
    .from('student_identity')
    .insert({
      auth_user_id: data.user.id,
      username,
      full_name: input.fullName.trim(),
      age: input.age,
      age_band: ageBand,
      contact_method: input.contactMethod,
      contact_value: input.contactValue.trim(),
    })
    .select('id')
    .single();

  if (insErr || !row) {
    // The auth user exists but has no identity row. Sign out so the app does
    // not sit in a half-created state that looks signed in but has no profile.
    await sb.auth.signOut();
    return { ok: false, error: friendly(insErr?.message ?? 'Could not create your profile.') };
  }

  await logEvent('account_created', null, input.age);
  return { ok: true, studentId: row.id as string, ageBand };
}

export async function signIn(username: string, password: string): Promise<AuthResult> {
  const sb = supabase();
  const uname = username.trim().toLowerCase();

  /* Checked before the password is sent, so a locked account cannot be used to
     keep probing. Enforced in Postgres, not here -- a lockout the browser
     enforces is not a lockout, because the attacker controls the browser. */
  const { data: lockRows } = await sb.rpc('is_auth_locked', { p_username: uname });
  const lock = Array.isArray(lockRows) ? lockRows[0] : lockRows;
  if (lock?.locked) {
    return { ok: false, error: lockedMessage(lock.remaining_seconds as number) };
  }

  const { error } = await sb.auth.signInWithPassword({
    email: usernameToEmail(uname),
    password,
  });

  const { data: afterRows } = await sb.rpc('record_auth_attempt', {
    p_username: uname,
    p_succeeded: !error,
  });
  const after = Array.isArray(afterRows) ? afterRows[0] : afterRows;

  if (error) {
    if (after?.locked) return { ok: false, error: lockedMessage(after.remaining_seconds as number) };
    return { ok: false, error: friendly(error.message) };
  }

  const me = await currentStudent();
  if (!me) return { ok: false, error: 'Signed in, but your profile is missing.' };
  return { ok: true, studentId: me.id, ageBand: me.age_band as AgeBand };
}

export async function signOut() {
  await supabase().auth.signOut();
}

export interface StudentRow {
  id: string;
  username: string;
  full_name: string;
  age: number;
  age_band: string;
}

/** The signed-in student's profile, or null when signed out. */
export async function currentStudent(): Promise<StudentRow | null> {
  const sb = supabase();
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return null;
  const { data } = await sb
    .from('student_identity')
    .select('id, username, full_name, age, age_band')
    .eq('auth_user_id', session.user.id)
    .maybeSingle();
  return (data as StudentRow | null) ?? null;
}

/**
 * Appends to the activity stream that feeds the admin dashboard. Students can
 * insert but never read this table (RLS), so it is append-only from the client.
 * Deliberately non-throwing: a failed analytics write must never interrupt a
 * lesson the student is in the middle of.
 */
export async function logEvent(
  eventType: string,
  relatedId: string | null,
  age: number,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  try {
    const sb = supabase();
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return;
    const me = await currentStudent();
    if (!me) return;
    await sb.from('activity_events').insert({
      student_id: me.id,
      event_type: eventType,
      related_id: relatedId,
      is_minor: age < 18,   // privacy tag; unrelated to which content band they read
      metadata,
    });
  } catch {
    /* analytics is best-effort by design */
  }
}

/**
 * Recovery check (Section 4). The auth address is synthetic and receives no
 * mail, so recovery runs through the contact detail given at sign-up.
 *
 * The RPC returns only true/false: it never confirms whether a username exists
 * on its own, and never echoes the stored contact back, so this cannot be used
 * to enumerate accounts or harvest contact details.
 */
export async function verifyRecoveryContact(username: string, contact: string): Promise<boolean> {
  const { data } = await supabase().rpc('verify_recovery_contact', {
    p_username: username.trim().toLowerCase(),
    p_contact: contact.trim(),
  });
  return data === true;
}
