# ServeIQ — Claude Code Guide

This file is written for future Claude Code (and human) sessions. Read it first — it will save you 15 minutes of codebase archaeology.

## What this app is

**ServeIQ** is a SaaS product that gives small home-service businesses (pest control, pool cleaning, pool repair, lawn care) an AI lead-response assistant. The AI replies to incoming SMS and email leads in under 60 seconds in the owner's voice, follows up on cold quotes, and re-engages lapsed customers. The goal: never lose a lead to a slow reply.

The app is a Next.js 14 App Router project with a client-side configuration model (stored in `localStorage`, no auth or backend database) and a single streaming API route (`/api/respond`) that proxies to Anthropic's Claude for AI replies.

## Tech stack

- **Framework:** Next.js 14.2.15 (App Router, server + client components)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS 3 + a small set of shadcn/ui primitives in `src/components/ui/`
- **Icons:** `lucide-react`
- **Charts:** `recharts` (dashboard response-speed area chart)
- **AI:** `@anthropic-ai/sdk` — streaming with `client.messages.stream`, model `claude-sonnet-4-6`
- **Package manager:** npm (lockfile committed)
- **Deploy target:** Vercel (see `DEPLOY.md`)

No database, no auth, no tRPC, no RSC data fetching. Server is intentionally thin — one API route.

## File structure

```
leadbot/
├── public/
│   ├── serveiq-logo.svg         # Full horizontal wordmark (speech bubble + "ServeIQ")
│   └── serveiq-mark.svg         # Speech-bubble mark only (used in sidebar, topbar, small slots)
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout + metadata (title, description, theme color)
│   │   ├── globals.css          # Tailwind base + a few keyframe helpers (pulse-dot, fade-in)
│   │   ├── page.tsx             # Public landing page ("/") with header, hero, feature grid
│   │   ├── not-found.tsx        # 404 page
│   │   ├── icon.svg             # Favicon (auto-wired by Next.js)
│   │   ├── dashboard/page.tsx   # Stats, response-speed chart, activity feed, escalation alerts
│   │   ├── leads/page.tsx       # Leads inbox — filter tabs + shadcn Table with 8 mock leads
│   │   ├── follow-ups/page.tsx  # Follow-up queue — 6 scheduled/sent/opened follow-ups
│   │   ├── pricing/page.tsx     # Pricing page — 3 tiers + FAQ
│   │   ├── demo/page.tsx        # Live chat demo — streams from /api/respond
│   │   ├── setup/page.tsx       # Business configuration form (saved to localStorage)
│   │   └── api/
│   │       └── respond/route.ts # POST endpoint, streams Claude responses
│   ├── components/
│   │   ├── AppShell.tsx         # <SidebarProvider> + <Sidebar/> + <TopBar/> + <main>
│   │   ├── Sidebar.tsx          # Dark sidebar with logo, nav, "Try the demo" CTA
│   │   ├── TopBar.tsx           # White top bar — business name + "AI Active" indicator
│   │   └── ui/                  # shadcn primitives: card, button, badge, table, input, …
│   ├── hooks/
│   │   └── use-mobile.tsx       # Viewport hook used by shadcn sidebar
│   └── lib/
│       ├── types.ts             # BusinessConfig, ServiceKey, STORAGE_KEY
│       ├── useBusinessConfig.ts # Reads/writes BusinessConfig to localStorage
│       ├── prompt.ts            # buildSystemPrompt() + buildVoicePreview()
│       ├── events.ts            # Demo events log, also in localStorage, with useEvents()
│       ├── escalation.ts        # Keyword-based escalation detection
│       └── utils.ts             # cn() class helper (clsx + tailwind-merge)
├── CLAUDE.md                    # This file
├── DEPLOY.md                    # Vercel deployment walkthrough
├── OVERNIGHT_SUMMARY.md         # Notes from the overnight Claude Code session
├── vercel.json                  # Vercel project config
├── .env.example                 # Template for required env vars
└── .env.local                   # Real API keys (gitignored)
```

Key files to know by heart:

- `src/app/api/respond/route.ts` — the only server code. Validates the request, runs keyword-based escalation detection, calls `client.messages.stream({ model: "claude-sonnet-4-6", … })`, and streams text back. Escalation keywords are surfaced via the `X-ServeIQ-Escalation` response header.
- `src/lib/prompt.ts` — builds the system prompt sent to Claude. This is where the owner's voice examples get stitched in.
- `src/components/AppShell.tsx` — every "app" page (dashboard, leads, follow-ups, pricing, demo, setup) wraps its content in `<AppShell title="…">`. The landing page (`/`) and `not-found` do not use AppShell.
- `src/lib/useBusinessConfig.ts` — client-only hook backed by `localStorage`. `setConfig` is the save function.

## localStorage keys

The app has no backend, so everything is in the browser:

| Key                   | Owner            | Shape                                 | Purpose                                                                  |
|-----------------------|------------------|---------------------------------------|--------------------------------------------------------------------------|
| `serveiq.config.v1`   | `useBusinessConfig`  | `BusinessConfig` JSON                 | The owner's business name, services, pricing, tone, and voice examples   |
| `serveiq.events.v1`   | `useEvents`          | `DemoEvent[]` JSON (capped at 50)     | Every demo conversation — powers the dashboard chart and activity feed   |

Both are bumped to `v1` so migrations are easy if the shape changes. The events store emits a custom `serveiq:events-changed` window event plus a standard `storage` event so open tabs stay in sync.

**Note:** these keys used to be `leadbot.*` before the rebrand. Any browser that had the old keys will effectively start fresh after update — this is intentional for a pre-launch product.

## Anthropic API setup

1. Grab a key at https://console.anthropic.com → API Keys.
2. Put it in `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
3. The key is only used server-side in `src/app/api/respond/route.ts`. Never read it in a client component.
4. The route returns a `503` with a friendly message if the key is missing, so you can develop UI without a real key.
5. The current model is `claude-sonnet-4-6` with `max_tokens: 512`. Streaming is on. Requests are bounded by `ANTHROPIC_TIMEOUT_MS = 25_000` and the route exports `maxDuration = 30` for Vercel.
6. Escalation detection runs **before** the AI call (see `src/lib/escalation.ts`). If the customer message includes any of the keywords, the header `X-ServeIQ-Escalation: keyword1,keyword2` is set so the client can show an urgent alert without waiting for the model.

## Running locally

```bash
npm install
cp .env.example .env.local   # then paste your real ANTHROPIC_API_KEY
npm run dev                  # http://localhost:3000
```

Useful routes:

- `/` — landing page
- `/dashboard` — stats and activity (auto-populates with demo chat data)
- `/demo` — try the AI live. This is the fastest way to see end-to-end behavior.
- `/setup` — fill out the business profile to see the voice change in the demo
- `/leads`, `/follow-ups`, `/pricing` — the other app pages

## Continuing development — ground rules

- **No new backend.** The whole architecture assumes client-only state. Adding a DB or auth is a much bigger rewrite than it looks; only do it if you have a concrete reason.
- **Stay in the existing design system.** Use the shadcn primitives in `src/components/ui/`, Tailwind utility classes, and Lucide icons. Indigo is the primary brand accent inside the app; amber highlights "IQ" in the logo and pricing "Most Popular" accents.
- **New pages go under `src/app/<slug>/page.tsx`** and start with `"use client";` + `<AppShell title="…">`. Static/server pages are fine too, but every authenticated-feeling page currently uses the shell.
- **Don't move the logo files.** `public/serveiq-logo.svg` and `public/serveiq-mark.svg` are imported by `Sidebar.tsx`, `TopBar.tsx`, `not-found.tsx`, and `src/app/page.tsx`. A PNG variant (`public/serveiq-logo.png`) can be dropped in later and swapped via Image `src=…`.
- **Add nav links in `src/components/Sidebar.tsx` → `NAV`.** Order there controls order in the sidebar.
- **Run `npm run build` before shipping.** The typecheck during build is strict and catches recharts/radix issues that `tsc` alone sometimes misses.
- **Escalation keywords live in `src/lib/escalation.ts`** and are intentionally small and high-precision. Add more only if you also update the unit of test — currently there is no automated test, so add one alongside any change.
- **API costs.** Each `/api/respond` call is streamed at `max_tokens: 512`. If you raise this, also raise `ANTHROPIC_TIMEOUT_MS` and audit the landing page for token-usage surprises.

## Common tasks, cheatsheet

| I want to…                          | Touch                                         |
|-------------------------------------|-----------------------------------------------|
| Add a new nav item                  | `src/components/Sidebar.tsx` → `NAV` array   |
| Change the model or system prompt   | `src/app/api/respond/route.ts`, `src/lib/prompt.ts` |
| Change the logo                     | `public/serveiq-logo.svg`, `public/serveiq-mark.svg`, `src/app/icon.svg` |
| Change brand metadata / page title  | `src/app/layout.tsx`                         |
| Edit pricing copy                   | `src/app/pricing/page.tsx` → `TIERS` / `FAQS` |
| Edit mock leads / follow-ups        | `src/app/leads/page.tsx` → `LEADS`, `src/app/follow-ups/page.tsx` → `FOLLOW_UPS` |
| Add a new escalation keyword        | `src/lib/escalation.ts` → `ESCALATION_KEYWORDS` |

## Known limitations

- **No auth.** Anyone can hit `/dashboard`, `/leads`, etc. For a real deploy, gate everything behind Clerk, NextAuth, or a custom middleware.
- **No persistence across devices.** Config and event history live in one browser. Adding a backend is a bigger migration than it looks — pick carefully.
- **Mock data in Leads / Follow-Ups.** These pages render deterministic sample data. They do not read from the events log. When a real backend lands, replace the `LEADS` / `FOLLOW_UPS` consts with real fetches.
- **Next.js 14.2.15 has an advisory.** `npm install` prints a security-update warning. Upgrade to a patched 14.x (or 15.x) before a real production launch.

Good luck — the codebase is small and intentional. Read `api/respond/route.ts` and `lib/prompt.ts` first and everything else follows.
