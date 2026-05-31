# CLAUDE.md — Guardly project context

Read this fully before making changes. It captures hard-won context, especially
about the filtering engine (NextDNS), so you don't repeat mistakes that have
already been found and fixed.

## What Guardly is
A parent-friendly family internet-safety web app. Parents add their children and
the devices each child uses, then Guardly filters the internet on those devices
(blocking adult content, apps, etc.) at home and on every network.

**White-label principle:** Guardly is a friendly layer on top of NextDNS (the
filtering engine). The engine is NEVER named to users. Users only ever see
"Guardly". Keep it that way in all UI copy.

## Who you're working with
The owner is **non-technical**. When giving instructions, use exact click-paths,
name required SQL/env steps explicitly, and avoid jargon. Verify builds before
presenting work. Be honest about limitations rather than over-promising — this
project has been burned repeatedly by confident-but-wrong claims about the engine.

## Tech stack
- **Frontend:** React + Vite (plain JS, no TypeScript). Inline styles + a small
  design system in `src/styles/global.css`.
- **Hosting:** Cloudflare Pages. Repo: github.com/orange-uk/guardly.
  Live: guardly-4d3.pages.dev. Landing at `/`, app at `/app`.
- **Serverless:** Cloudflare Pages Functions in `functions/api/*` — these proxy
  the NextDNS API so the API key never reaches the browser.
- **Auth + DB:** Supabase (free tier). Auth + Postgres with row-level security.
- Build check before every delivery: `npm install && npm run build` (≈91 modules).

## Environment variables (Cloudflare Pages → Settings → Variables)
- `NEXTDNS_API_KEY` — used by the Worker proxies (server-side only).
- `VITE_SUPABASE_URL` — BARE url (no trailing /rest/v1/ — that broke it once).
- `VITE_SUPABASE_ANON_KEY` — the publishable key (sb_publishable_...).
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — optional, server-side only, only
  for the close-account hard-delete. No VITE_ prefix.

## Design system
Warm/natural aesthetic. Green #1F9D6B; cream backgrounds; Fraunces (display serif)
+ Plus Jakarta Sans (body). Soft shadows, rounded corners, animal-avatar tints per
child. Keep it warm and premium, not corporate. Tokens live in global.css.

## Data model (Supabase, RLS enabled)
Household-based. Tables:
- `households` (id, name, created_at)
- `household_members` (household_id, user_id, role) — links users to a household
- `household_profiles` (household_id, profile_id, **name**, created_at) — maps a
  household to a NextDNS profile. **The child's human name lives HERE**, not in the
  engine (see "Name decoupling" below).
- `devices` (id, household_id, profile_id, name, platform)
- `household_invites` (code, email, accepted, household_id)

Helper SQL fn `household_ids_for_current_user()` is SECURITY DEFINER (avoids RLS
recursion). RLS policies reference it. **household_profiles needs select/insert/
update/delete policies** — the UPDATE one was missing originally and silently broke
renaming; all four must exist.

Household creation happens in app code (`ensureHousehold`), NOT via an auth trigger
(a trigger was tried and caused "Database error saving new user" — abandoned).

## CRITICAL: NextDNS engine facts (verified — do not "improve" without checking)
This is the area that has caused the most pain. The engine has specific, sometimes
counter-intuitive limits. Verify against https://nextdns.github.io/api/ before
changing anything engine-related.

- **No pause feature.** NextDNS has NO way to instantly pause/disable a profile.
  The `*`-denylist trick does NOT work. A pause button was built, never worked, and
  was removed. Do not re-add an instant-pause feature.
- **Category IDs are a fixed small set with exact strings:** `porn`, `gambling`,
  `dating`, `piracy`, `social-networks`, `video-streaming`, `gaming`. Note: the one
  the dashboard *displays* as "Online Gaming" has API id `gaming` (NOT
  `online-gaming`). "Drugs" is NOT a category. Invented IDs silently fail.
- **Category/service PATCH format:** `{ id, active, recreation }` in arrays under
  `parentalControl`. e.g. `{"id":"porn","active":true,"recreation":false}`.
- **Safe browsing:** `parentalControl.safeSearch` and
  `parentalControl.youtubeRestrictedMode` are real booleans. They work.
- **Recreation time** (when blocked apps are ALLOWED): real feature, but limited.
  - Format: `parentalControl.recreation = { times: {...}, timezone: "..." }` where
    each day is a SINGLE object: `monday: { start: "16:00", end: "18:00" }` (NOT an
    array). Plus a `timezone`.
  - Each category/service that should follow the window must be individually flagged
    `recreation: true`. Without that flag, the window governs nothing.
  - Limits (engine, can't code around): ONE window per day; times on the half-hour
    up to 23:30 (not midnight).
- **Install profile (.mobileconfig):** There is NO API endpoint that serves a signed
  profile. NextDNS's signed one comes only from apple.nextdns.io. Guardly GENERATES
  the .mobileconfig XML itself in `functions/api/install/[profileId].js`, with
  ServerURL = https://apple.dns.nextdns.io/{profileId}/{deviceName}. It is UNSIGNED,
  so iOS shows a normal "Unverified" notice on install (expected). Don't try to fetch
  it from an API endpoint — that path does not exist.
- **Verify/"Check protection":** `functions/api/verify/[profileId].js` reads recent
  logs to confirm a profile is active. Active = activity within last 24h. Framing is
  deliberately honest: green when active; calm "may be idle" when not — NEVER a false
  "not protected" alarm. Depends on NextDNS logs being on (the default).

## Name decoupling (important architecture)
NextDNS rejects creating a second profile with a duplicate name. So the child's human
name lives in `household_profiles.name`, and the engine profile is created with a
unique code like `gdly-xxxxxx`. Dashboard/sidebar/profile read the name from the DB.
Rename = a DB update (instant, never clashes). Both the dashboard create flow AND the
onboarding flow must do this (both were fixed).

## Household gotcha (fixed — keep it fixed)
`ensureHousehold` must NOT create duplicate households. It caches an in-flight promise
(so Layout + Dashboard loading at once don't each create one) and reuses the OLDEST
membership. Earlier this leaked and one user ended up in 8 households. Sidebar reads
profiles only after auth resolves (don't guess names before `auth.user` is ready).

## Signup fork
Onboarding step 0 offers "Set up my family" vs "Join my partner's family". Join takes
an invite code and joins an existing household (no household/child created). Matches
the dad-creates / mum-joins real-world flow. `redeemInvite` also cleans up any empty
household the joiner had auto-created.

## Key files
- `functions/api/profiles/index.js` — list/create profiles
- `functions/api/profiles/[profileId].js` — get/patch/delete profile sections
- `functions/api/analytics/[profileId].js` — logs / domains
- `functions/api/install/[profileId].js` — generates the Apple .mobileconfig
- `functions/api/verify/[profileId].js` — checks recent activity
- `functions/api/account/close.js` — admin delete via service role (optional)
- `src/lib/AuthContext.jsx` — auth + getOwnedProfiles/linkProfileToUser/rename/etc.
- `src/lib/household.js` — ensureHousehold, profiles, devices, invites
- `src/lib/devices.js` — device types + per-platform install steps (incl. iPhone
  tamper-proofing lockdown guidance)
- `src/pages/Dashboard.jsx`, `ProfilePage.jsx`, `InstallPage.jsx`, `SettingsPage.jsx`,
  `LandingPage.jsx`, `SecurityPage.jsx`, `ResetPasswordPage.jsx`
- `src/onboarding/OnboardingFlow.jsx`
- `src/components/Layout.jsx` — sidebar + header

## Working style that works here
- Verify `npm run build` passes before presenting anything.
- For NextDNS behaviour: search the official docs / confirm, don't assume.
- Deliver small changed files for small changes; the owner reviews + merges.
- Be honest about what the engine can and can't do.
- Don't name the engine to end users anywhere in the UI.

## Parked / future ideas (not built)
- Stripe billing (pricing shown as £3/mo but not wired).
- "Block until morning" as an honest alternative to pause (built on recreation).
- Per-device (vs per-child) settings — decided against; per-child is the model.
- Verify lookback window is currently 24h / last 50 log entries — tunable.
