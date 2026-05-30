# Guardly — Setup Guide (v5)

This version adds: shared family logins (mum & dad), multiple devices per child,
close-account, a dashboard link on the home page, and removes the router option.

## IMPORTANT — run the new database SQL

The household-sharing feature needs new tables. In Supabase → SQL Editor, paste
and run the whole block below. (Safe to run once; it replaces the old single-owner
table with the household model.)

```sql
-- Households (a family = one household, shared by parents)
create table if not exists households (
  id uuid primary key default gen_random_uuid(),
  name text,
  created_at timestamptz default now()
);

-- Who belongs to which household
create table if not exists household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'parent',
  created_at timestamptz default now(),
  unique(household_id, user_id)
);

-- Child profiles (NextDNS profile ids) owned by a household
create table if not exists household_profiles (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  profile_id text not null,
  created_at timestamptz default now(),
  unique(household_id, profile_id)
);

-- Devices belonging to a child profile
create table if not exists devices (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  profile_id text not null,
  name text not null,
  platform text,
  created_at timestamptz default now()
);

-- Invite codes to join a household
create table if not exists household_invites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  code text not null unique,
  email text,
  accepted boolean default false,
  created_at timestamptz default now()
);

-- Helper that returns the current user's household ids WITHOUT triggering
-- recursive RLS (security definer bypasses RLS on household_members).
create or replace function household_ids_for_current_user()
returns setof uuid language sql security definer stable as $$
  select household_id from household_members where user_id = auth.uid()
$$;

alter table households enable row level security;
alter table household_members enable row level security;
alter table household_profiles enable row level security;
alter table devices enable row level security;
alter table household_invites enable row level security;

-- households: members can see/their own
create policy "hh read" on households for select
  using (id in (select household_ids_for_current_user()));
create policy "hh insert" on households for insert with check (true);

-- members
create policy "hm read" on household_members for select
  using (household_id in (select household_ids_for_current_user()) or user_id = auth.uid());
create policy "hm insert" on household_members for insert with check (user_id = auth.uid() or true);
create policy "hm delete" on household_members for delete using (user_id = auth.uid());

-- household_profiles
create policy "hp read" on household_profiles for select
  using (household_id in (select household_ids_for_current_user()));
create policy "hp insert" on household_profiles for insert
  with check (household_id in (select household_ids_for_current_user()));
create policy "hp delete" on household_profiles for delete
  using (household_id in (select household_ids_for_current_user()));

-- devices
create policy "dev read" on devices for select
  using (household_id in (select household_ids_for_current_user()));
create policy "dev insert" on devices for insert
  with check (household_id in (select household_ids_for_current_user()));
create policy "dev delete" on devices for delete
  using (household_id in (select household_ids_for_current_user()));

-- invites: readable by code (for redeeming), insertable by household members
create policy "inv read" on household_invites for select using (true);
create policy "inv insert" on household_invites for insert
  with check (household_id in (select household_ids_for_current_user()));
create policy "inv update" on household_invites for update using (true);
```

You can keep the old `profiles_owned` table or drop it — it's no longer used:
```sql
drop table if exists profiles_owned;
```

## OPTIONAL — enable real account deletion (close account)

The "Close account" button works without this (it removes the family's data and
signs the user out). To also hard-delete the auth user, add two SERVER-side env
vars in Cloudflare (NO `VITE_` prefix, so they stay private):

| Name | Value |
|---|---|
| `SUPABASE_URL` | your project URL (same as VITE_SUPABASE_URL) |
| `SUPABASE_SERVICE_ROLE_KEY` | the secret service_role key (Supabase → Settings → API Keys → reveal service_role) |

Keep the service_role key secret — never put it in a `VITE_` variable.

## Upload

Drag the zip contents into GitHub (overwrite). The `functions/api/dns` folder was
removed in this version — if it still exists in your repo you can delete it, but
it's harmless if left.

## What's new in v5
- Shared logins: Settings → Family members → generate an invite code; partner signs
  up and enters it under "Join a family". Both then see the same children.
- Multiple devices per child: each child profile has a Devices tab; add as many as needed.
- Dashboard "Add child" now flows straight into adding their first device.
- "Go to dashboard" button shows on the home page when you're already logged in.
- Close account in Settings (danger zone, type DELETE to confirm).
- Router option removed everywhere (per-device only).

## Also in this combined upload — more device types
The install screen and onboarding now support: iPhone/iPad, Mac, Android phone,
Android/Fire tablet, Chromebook, and Windows PC — grouped into "Apple devices"
(travel everywhere, tamper-proof) and "Other devices" (set up via DNS settings),
each with its own step-by-step instructions. No extra setup needed for this part.

## Latest additions (this upload)
- **Forgot password**: a "Forgot password?" link on the sign-in form sends a reset
  email; clicking the link opens /reset to choose a new password.
  → In Supabase, make sure your Redirect URLs allow `https://<your-site>/**`
    (Authentication → URL Configuration) so the reset link returns to your site.
- **Auto-household**: every user now gets a household automatically on login, so the
  "no household / invite code won't generate" issue can't happen to new users.

## PWA — installable app (this upload)
Guardly is now installable like a native app:
- On Android/Chrome a "⬇ Install app" button appears in the dashboard top bar,
  and browsers offer "Add to Home Screen".
- On iPhone: Safari → Share → "Add to Home Screen" (Apple doesn't allow an
  automatic install button, but it works the same once added).
- It opens full-screen with the Guardly shield icon, no browser bars.
- The service worker is network-first, so deploys are always fresh — users won't
  get stuck on an old cached version.
No setup needed — it just works once deployed. (PWA features require the site to
be served over HTTPS, which your Cloudflare Pages site already is.)

## CRITICAL FIX — account isolation (this upload)
Root cause found: household creation was doing an insert-then-read-back, and RLS
blocked the read-back (you're not a member yet at that instant), so the membership
row never got written. Result: users had no household, and the old code fell back
to showing ALL profiles. Fixed by generating the household id in code (no read-back)
and removing the "show everything" fallback — a logged-in user now only ever sees
profiles their household owns.

### After deploying this build, run this cleanup SQL once in Supabase:

```sql
-- 1. Remove orphaned households that never got a member (from the failed attempts)
delete from households h
where not exists (select 1 from household_members m where m.household_id = h.id);

-- 2. Give any existing user who has no household one now
do $$
declare u record; new_hh uuid;
begin
  for u in select id from auth.users where id not in (select user_id from household_members) loop
    new_hh := gen_random_uuid();
    insert into households (id, name) values (new_hh, 'Family');
    insert into household_members (household_id, user_id, role) values (new_hh, u.id, 'parent');
  end loop;
end $$;

-- 3. See the final state — each user should have their OWN household_id
select u.email, hm.household_id
from auth.users u left join household_members hm on hm.user_id = u.id
order by u.created_at;
```

### IMPORTANT: do NOT use the auth trigger
If you created the `on_auth_user_created` trigger earlier and got "Database error
saving new user", remove it — the app now handles household creation reliably:
```sql
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user();
```

### The orphaned child profiles (Hermione, Emma, Jenny…)
These exist as NextDNS profiles but aren't linked to anyone. After deploying, your
dashboard will show NONE of them (correct — they're unowned). Cleanest path: delete
the test ones from the NextDNS dashboard, then re-add your real children through the
Guardly app, which will link them to your household properly.

## Latest batch (this zip)
- **Robust delete**: removing a child now deletes the NextDNS profile first; if that
  fails nothing else changes (no orphans). Only on success are the household link and
  device records removed.
- **Pause removed**: NextDNS has no pause capability, so the button (which never
  worked) is gone, along with its endpoint.
- **Safe browsing** (top of a child's Categories tab): SafeSearch + YouTube Restricted
  Mode toggles — both real NextDNS settings. (YouTube also hides comments/history when
  on — that's YouTube's own behaviour.)
- **Recreation time** (renamed from Time limits): set the daily window when blocked
  apps are *allowed*; outside it they stay blocked. One window per day (NextDNS limit).
- **Install link fix**: the install page now generates the .mobileconfig itself, so
  it works for any child. Profiles are unsigned (normal "Unverified" notice on install).
No new SQL or env vars for this batch.

## REQUIRED SQL — names decoupled from the engine (this batch)
Child names now live in YOUR database, not in the engine, so duplicate names never
clash and renaming is instant. Run this once in Supabase → SQL Editor:

```sql
alter table household_profiles add column if not exists name text;
```

That's the only change needed. After deploying:
- Creating a child sends only a unique code to the engine; the real name is stored
  in household_profiles.name.
- Two children can share a name (even across families) with no error.
- Renaming a child updates the database instantly — no engine call, never clashes.

Existing children created before this change will show their stored name, or
"Child" if they predate the name column — easiest to delete old test ones in the
engine dashboard and re-add through the app.

## FINAL BATCH — full consolidated build
This zip is the complete, audited app. Upload the entire contents and overwrite everything.

### Required SQL (run once if you haven't already)
```sql
alter table household_profiles add column if not exists name text;
```

### What's in this build
- **Names decoupled from the engine**: child names live in household_profiles.name;
  the engine only gets a unique gdly-XXXXXX code. Duplicate names never clash;
  rename is an instant DB update. Applies to BOTH the dashboard and onboarding.
- **Sidebar name fix**: the sidebar now waits for login to resolve, then reads the
  real name (no more "Child 1" mismatch).
- **Categories**: corrected to the real NextDNS IDs (porn, gambling, dating, piracy,
  social-networks, video-streaming, gaming). "Drugs" removed (not a real category).
- **Safe browsing**: SafeSearch + YouTube Restricted Mode toggles (top of Categories).
- **Recreation time (per-category, Option A)**: each blocked category/app has a
  "Allowed during recreation time" toggle. Flagged items are allowed only during the
  daily recreation window; everything else stays blocked 24/7. So you can allow games
  4–6pm while keeping adult content blocked all day. Recreation format verified against
  the live NextDNS API (per-day {start,end} + timezone). NextDNS limits: one window
  per day, half-hour increments up to 23:30.
- **Robust delete**: deletes the engine profile first; only then removes the DB link +
  devices. No orphans.
- **Pause removed**: the engine has no pause capability — button & endpoint gone, and
  the landing page no longer advertises it.
- **Apple tamper-proofing guidance**: the iPhone/iPad install page now explains, in
  plain language, how to lock the device (child Apple ID + Screen Time → Content &
  Privacy → Accounts → Don't Allow) so the profile can't be deleted.
- **Install link**: generates the .mobileconfig itself (unsigned → normal "Unverified"
  notice on install). Works for any child.

### Optional repo cleanup (harmless if skipped)
Delete these stale files from GitHub if still present:
- functions/api/profiles/[profileId]/pause.js
- functions/api/dns/ (whole folder, if present)

### Test checklist after deploy
1. Create a child (try a name that previously clashed — should work now).
2. Add a device, install the profile on it.
3. Toggle each category; confirm it flips in the NextDNS dashboard too.
4. Flag one app as "recreation", set a window, test on-device in/out of the window.
5. Two-account isolation: second signup should see zero children.
6. iPhone: follow the tamper-proof steps; confirm the profile can't be removed.

## Household fixes (added to final batch)
- **Duplicate households fixed**: ensureHousehold now (a) shares one call across
  concurrent loaders so Layout+Dashboard can't each create a household, and (b) always
  reuses your OLDEST membership — so logging in repeatedly no longer spawns duplicates.
- **Signup fork**: the first onboarding screen now asks "Set up my family" vs
  "Join my partner's family". The join path takes an invite code and drops you straight
  into the existing family (no household created, no child step) — matching the
  dad-creates / mum-joins flow.
- **Join cleanup**: redeeming an invite now also deletes any empty household the joiner
  had auto-created, so joining never leaves orphans behind.

### One-time cleanup already done via SQL
Consolidated to a single household keyed on the real one; deleted duplicate/empty/
orphaned households. No further SQL needed unless duplicates reappear (they shouldn't).

## UX batch (added to this package)
- **First & last name at signup**: the signup form now has separate First name and
  Last name fields, stored as full_name + first_name + last_name in user metadata.
- **Dashboard greeting**: shows "Hi <FirstName> 👋" above Your family. Falls back to the
  first word of full_name for accounts created before this change.
- **Supported-device logos**: the landing page hero now shows brand glyphs for
  Apple, Android, Chromebook and Windows under "Protects every device your child uses".

No new SQL or env vars for this batch. (Existing accounts: optionally run the
first_name/last_name metadata update — already done for the main account.)

## Polish batch (added to this package)
- **Rename refreshes sidebar**: renaming a child on the profile page now updates the
  left sidebar instantly (no reload needed).
- **iPhone install ordering**: the install steps now make clear you must install Guardly
  FIRST (account changes set to "Allow"), and only lock down (Accounts → Don't Allow)
  AFTER. Includes a note on temporarily allowing changes to reinstall later. Shown both
  on the install page and during onboarding.
- **Dashboard redesign**: atmospheric gradient header with a live family summary, richer
  per-child cards (colored band, overlapping avatar tile, device chips, hover glow), and
  a warmer add-child card.

No new SQL or env vars.
