# Guardly — Setup Guide (v0.2)

This batch is a big upgrade: commercial landing page, full design overhaul,
mobile-friendly everywhere, time limits + pause + activity reports, and real
sign-up/login with Supabase. Below is exactly what to do.

---

## 1. Upload the files to GitHub

Easiest route: delete the old `src` and `functions` folders in your repo and
upload these fresh. Or upload file by file using the table at the bottom.

The simplest of all: on GitHub click **Add file → Upload files**, then drag the
whole contents of this zip in. GitHub keeps the folder structure.

After uploading, Cloudflare auto-deploys in ~1 minute.

---

## 2. Set up Supabase (free) — gives you real accounts + per-customer separation

### a) Create the project
1. Go to https://supabase.com and sign up (free)
2. Click **New project**, give it a name (e.g. "guardly"), set a database password, pick a region near you
3. Wait ~2 minutes for it to provision

### b) Create the table that maps parents to their children's profiles
1. In Supabase, open the **SQL Editor** (left sidebar)
2. Paste this and click **Run**:

```sql
create table profiles_owned (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  profile_id text not null,
  created_at timestamptz default now()
);

alter table profiles_owned enable row level security;

create policy "owners can read their own"
  on profiles_owned for select
  using (auth.uid() = user_id);

create policy "owners can insert their own"
  on profiles_owned for insert
  with check (auth.uid() = user_id);

create policy "owners can delete their own"
  on profiles_owned for delete
  using (auth.uid() = user_id);
```

### c) Get your two keys
1. In Supabase go to **Project Settings → API**
2. Copy the **Project URL** (looks like `https://xxxx.supabase.co`)
3. Copy the **anon / public** key (a long string)

### d) Add the keys to Cloudflare
1. Cloudflare dashboard → **Workers & Pages → guardly → Settings → Variables**
2. Add two variables (Production AND Preview):

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | your Project URL |
| `VITE_SUPABASE_ANON_KEY` | your anon key |

3. Trigger a redeploy (push any change, or use Retry deployment)

> Until these keys are added, the site still works in "preview mode" using the
> old localStorage login — so nothing breaks while you set Supabase up.

### e) (Optional) turn off email confirmation while testing
Supabase → **Authentication → Providers → Email** → toggle "Confirm email" off
if you want instant signups during testing. Turn it back on for real launch.

---

## 3. What's new in this version

- **Landing page**: full commercial redesign, hand-drawn parent-and-child hero,
  "Why Guardly" section, pricing, mobile-friendly.
- **Design system**: new fonts (Fraunces + Plus Jakarta Sans), warm palette,
  soft cards, smooth animations — applied across every page.
- **Mobile**: sidebar collapses to a drawer, grids stack, touch-friendly.
- **Time limits**: ProfilePage → "Time limits" tab. Pick days + a block window.
- **Pause internet**: button on each profile — blocks everything instantly.
- **Activity**: "most blocked" bars + recent request log.
- **Auth + ownership**: each parent only sees their own children's profiles.
- **Engine stays hidden**: install links go through `/api/install/...` on your
  own domain. Works on any domain — if you move to guardly.app later, nothing
  to change in code.

---

## 4. File map (if uploading individually)

NEW files:
- `src/styles/global.css` (replace existing)
- `src/hooks/useMediaQuery.js`
- `src/lib/supabase.js`
- `src/lib/AuthContext.jsx`
- `functions/api/profiles/[profileId]/pause.js`

REPLACED files:
- `package.json`
- `src/api.js`
- `src/App.jsx`
- `src/main.jsx`
- `src/components/Layout.jsx`
- `src/pages/LandingPage.jsx`
- `src/pages/Dashboard.jsx`
- `src/pages/ProfilePage.jsx`
- `src/pages/InstallPage.jsx`
- `src/pages/SettingsPage.jsx`
- `src/onboarding/OnboardingFlow.jsx`
- `functions/api/analytics/[profileId].js`

Unchanged (already correct):
- `functions/api/install/[profileId].js`
- `functions/api/profiles/index.js`
- `functions/api/profiles/[profileId].js`
- `functions/api/dns/[profileId].js`
- `index.html`, `vite.config.js`, `_redirects`
