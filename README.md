# Guardly

A parent-friendly family internet safety dashboard, powered by NextDNS.

## What it does

- Create and manage DNS filtering profiles for each child
- Toggle content categories (adult, gambling, social media, gaming, etc.)
- Block or allow specific sites
- Step-by-step install guides for iPhone, iPad, Mac, Android, and router
- View activity logs per profile

## Tech stack

- **Frontend**: React + Vite → Cloudflare Pages
- **Backend**: Cloudflare Pages Functions (serverless, runs at the edge)
- **DNS backbone**: NextDNS API
- **Deployment**: GitHub → Cloudflare Pages (auto-deploys on push)

## Setup

### 1. Fork or clone this repo to GitHub

### 2. Connect to Cloudflare Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Pages → Create a project → Connect to Git
3. Select your GitHub repo
4. Build settings:
   - **Framework preset**: None (or Vite)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`

### 3. Add your NextDNS API key

In Cloudflare Pages → your project → Settings → Environment Variables:

| Variable | Value |
|---|---|
| `NEXTDNS_API_KEY` | Your NextDNS API key (find it at nextdns.io → Account) |

Set this for both **Production** and **Preview** environments.

### 4. Deploy

Push to `main` — Cloudflare Pages will build and deploy automatically.

## Local development

```bash
npm install
npm run dev
```

For the API functions locally, you need [Wrangler](https://developers.cloudflare.com/workers/wrangler/):

```bash
npm install -g wrangler
wrangler pages dev dist --compatibility-date=2024-01-01
```

Set your API key locally:
```bash
# .env.local (never commit this)
NEXTDNS_API_KEY=your_key_here
```

## Project structure

```
guardly/
├── functions/           # Cloudflare Pages Functions (backend API)
│   └── api/
│       ├── profiles/    # NextDNS profile CRUD
│       └── analytics/   # Logs and stats
├── src/                 # React frontend
│   ├── pages/           # Dashboard, ProfilePage, InstallPage, Settings
│   ├── components/      # Layout, shared components
│   ├── api.js           # API helper
│   └── styles/
├── index.html
├── vite.config.js
└── wrangler.toml
```

## Roadmap

- [ ] User authentication (Cloudflare Access or Clerk)
- [ ] Multi-family support
- [ ] Stripe billing for SaaS version
- [ ] Weekly email digests
- [ ] Push notifications for blocked attempts
- [ ] Cloudflare D1 database for user/family data
