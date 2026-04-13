# Deploying ServeIQ to Vercel

ServeIQ is a standard Next.js 14 App Router app. There is no database, no auth provider, and only one server route (`/api/respond`), so deployment is intentionally simple — the only thing you need to configure is the Anthropic API key.

## Prerequisites

- A GitHub / GitLab / Bitbucket repo with this project pushed to it
- A Vercel account (https://vercel.com/signup)
- An Anthropic API key (https://console.anthropic.com/settings/keys)

## One-time setup

### 1. Verify the build passes locally

```bash
npm install
npm run build
```

You should see all routes (including `/pricing`, `/leads`, `/follow-ups`, `/dashboard`, `/demo`, `/setup`, `/api/respond`) build without errors.

### 2. Confirm the env file is ignored

`.env.local` must never land in git. Check `.gitignore` — it should already contain:

```
.env
.env.local
.vercel
```

If you see your real key in `git status`, stop and remove it before continuing:

```bash
git rm --cached .env.local
```

### 3. Push to your git host

```bash
git add .
git commit -m "ServeIQ: production-ready deploy"
git push origin main
```

## Deploying on Vercel

### Option A — Vercel dashboard (first deploy)

1. Go to https://vercel.com/new and import the repo.
2. Framework preset will auto-detect as **Next.js** — leave it alone. `vercel.json` in this repo pins the framework, build command, and region (`iad1`) so you shouldn't have to touch anything.
3. Under **Environment Variables**, add:
   - `ANTHROPIC_API_KEY` = your real `sk-ant-…` key
   - Apply it to **Production**, **Preview**, and **Development**.
4. Click **Deploy**. First build takes ~60–90 seconds.

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel login
vercel link           # one time per machine
vercel env add ANTHROPIC_API_KEY
# paste your key, select Production + Preview + Development
vercel --prod
```

## Post-deploy checklist

After the first deploy, visit these routes and confirm they all return 200:

- `/` (landing)
- `/dashboard`
- `/leads`
- `/follow-ups`
- `/pricing`
- `/demo`
- `/setup`
- `/this-page-does-not-exist` → should render the 404

Then open `/demo`, type any message, and confirm you get a streamed AI reply. If you see "The AI service is not configured," your `ANTHROPIC_API_KEY` env var is missing or misspelled in the Vercel project settings.

## Updating the deployment

Every push to the production branch automatically deploys. Pull requests get preview deployments with their own URL. No further configuration needed.

## Rolling back

From the Vercel dashboard → **Deployments** → click any previous successful deploy → **Promote to Production**. Rollback is instant.

## Troubleshooting

| Symptom                                             | Likely cause                                                      |
|-----------------------------------------------------|-------------------------------------------------------------------|
| `/demo` replies with "AI service is not configured" | `ANTHROPIC_API_KEY` missing in Vercel env                         |
| 503 on `/api/respond`                               | Same as above                                                     |
| 429 on `/api/respond`                               | Hit Anthropic rate limits — wait or raise your plan               |
| 500 on `/api/respond`                               | Usually Anthropic server trouble — check https://status.anthropic.com |
| Broken logo / favicon                               | `public/serveiq-logo.svg` missing — run `ls public/` on the deploy |
| Fonts look wrong                                    | App uses system fonts only, no Google Fonts — nothing to fix      |

## What `vercel.json` does

The committed `vercel.json` explicitly sets:

- `framework: nextjs` — avoids any guessing on first deploy
- `regions: ["iad1"]` — pins the function to a US-East region
- `functions["src/app/api/respond/route.ts"].maxDuration = 30` — matches the route's own `export const maxDuration = 30`, so Vercel won't cut streaming off at 10 seconds on the free plan
- Long cache headers on the two brand SVGs so they're never re-fetched by returning visitors

Change `regions` if most of your customers are not on the US East Coast.

## Custom domain

In Vercel → project → **Settings** → **Domains** → add your domain. DNS instructions (A/ALIAS/CNAME) will appear inline. SSL is automatic.
