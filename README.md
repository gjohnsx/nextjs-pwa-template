# Next.js PWA Template (Vercel + Bun)

Clone/fork/template this repo and get a phone-installable Next.js PWA fast.

## What You Get

- App Router + Next.js `16.1.6`
- PWA manifest + app icons + install UX
- Service worker for web push notifications
- Optional push notification flow via Server Actions
- shadcn/ui setup
- Geist fonts (`GeistSans`, `GeistMono`, `GeistPixelSquare`)
- Vercel-friendly defaults and security headers
- Bun-first scripts

## 1. Create Your Copy

Use either:

- GitHub `Use this template`
- GitHub `Fork`
- Or clone directly:

```bash
git clone <your-repo-url>
cd nextjs-pwa-template
bun install
```

## 2. Configure Environment Variables (All Optional)

Copy the template env file:

```bash
cp .env.example .env.local
```

Icon generation (optional):
- set `OPENAI_API_KEY` in `.env.local`

Web push notifications (optional):
- generate keys and paste them into `.env.local`:

```bash
bun run vapid:generate
```

If you skip these, the app is still installable as a PWA.
Only icon generation and/or push features are affected.

## 3. Run Locally (HTTPS)

```bash
bun run dev:https
```

Open `https://localhost:3000`.

HTTPS is required for realistic PWA/push testing.

## UI Stack (shadcn + Sonner + Geist)

- `shadcn` is installed and already integrated with Tailwind v4.
- Sonner toast notifications are mounted globally and used for install/push feedback.
- Home page UI is built with shadcn primitives.
- Shared UI defaults are set to square corners for buttons and cards.
- Fonts come from the `geist` package (`GeistSans`, `GeistMono`, `GeistPixelSquare`).

If you add new UI, prefer extending `components/ui/*` primitives instead of per-page one-off classes.

## 4. Deploy to Vercel

1. Push your repo to GitHub.
2. In Vercel, click `Add New > Project` and import the repo.
3. Keep the default Next.js build settings.
4. Add the same env vars from `.env.local` in Project Settings > Environment Variables.
5. Deploy.

CLI alternative:

```bash
bunx vercel@latest login
bunx vercel@latest link
bunx vercel@latest
bunx vercel@latest --prod
```

Deploy button (recommended for template repos):

```md
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/your-repo)
```

## 5. Install On Phone

- Android (Chrome): use the browser install prompt/menu.
- iOS (Safari): tap `Share` then `Add to Home Screen`.

After deployment, open your Vercel URL on your phone and install.

## Project Structure

- `app/`: App Router pages/layout, manifest, and Server Actions
- `components/ui/`: Shared shadcn UI primitives
- `public/sw.js`: Service worker
- `next.config.ts`: Security and service-worker headers
- `scripts/generate-vapid-keys.mjs`: VAPID key generator

## Notes

- Push subscriptions are stored in an HTTP-only cookie in this starter to keep setup simple.
- For multi-user production apps, store subscriptions in a real database.
- Replace icons/branding and app metadata before shipping.

## Icon Generation (favicon-generator skill)

This repo includes an agent skill (`.agents/skills/favicon-generator/`) forked from the [OpenAI Image Generation skill](https://github.com/openai/codex/tree/main/codex-rs/skills/openai-imagegen), customized for PWA app icon generation. It generates a 1024x1024 master icon via the OpenAI Image API (`gpt-image-1.5`), then exports all required favicon and PWA icon sizes.

### Prerequisites

- `OPENAI_API_KEY` set in `.env.local`
- Python 3 with `openai` and `pillow` (`python3 -m pip install openai pillow`)

### Usage

**With Codex CLI:** Ask Codex to generate an app icon. You'll need `/approvals full-access` so the agent can hit the OpenAI API and write icon files.

**With Claude Code:** Ask Claude to generate an app icon or run `/favicon-generator`. The skill handles prompt construction, API calls, and size exports automatically.

**With your own source image:** Skip generation entirely — drop your image in and ask the agent to export the PWA sizes, or run the export commands from the skill's Workflow B.

### What it produces

| File | Size | Purpose |
|:-----|:-----|:--------|
| `public/icon-512x512.png` | 512x512 | Standard PWA icon |
| `public/icon-192x192.png` | 192x192 | Standard PWA icon |
| `public/icon-maskable-512x512.png` | 512x512 | Android adaptive icon (maskable) |
| `public/icon-maskable-192x192.png` | 192x192 | Android adaptive icon (maskable) |
| `public/apple-touch-icon.png` | 180x180 | iOS home screen |
| `public/badge-72x72.png` | 72x72 | Notification badge |
| `app/favicon.ico` | 16–64 | Browser tab favicon |
