-- Accounts are username + password. Supabase Auth is addressed by email, so a
-- username maps to a synthetic address at users.moneyorbit.net -- a domain that
-- receives no mail, by design. With email confirmation enabled project-wide,
-- every such account would be created and then be permanently unable to sign
-- in, because the confirmation mail can never arrive. Verified against the
-- live project before writing this: signup returned no access_token.
--
-- This confirms ONLY that synthetic domain. Any real email address signing up
-- later still goes through normal confirmation, so this is not a blanket
-- weakening of verification -- it is scoped to addresses that exist solely to
-- satisfy the auth schema's email column and that nobody can receive mail at.
-- The actual credential is the password; real contact details live separately
-- on student_identity.

create or replace function private.autoconfirm_synthetic_email()
returns trigger
language plpgsql
security definer
set search_path = auth, public
as $$
begin
  if new.email like '%@users.moneyorbit.net' then
    new.email_confirmed_at := coalesce(new.email_confirmed_at, now());
  end if;
  return new;
end;
$$;

drop trigger if exists autoconfirm_synthetic on auth.users;
create trigger autoconfirm_synthetic
  before insert on auth.users
  for each row execute function private.autoconfirm_synthetic_email();
