# Yen Sense Growth Plan — 2026-06-09

Goal posture: validate cheaply, keep upside uncapped. The lever is **download volume**, not the paywall. Realistic success = 5–10 downloads/day by peak season; $50–150 in a peak travel month is a genuine win.

North-star metric: **App Store units/day** (App Store Connect → Analytics). Secondary: product-page conversion rate, web→store CTA clicks (Vercel Analytics).

## Where downloads come from for a niche utility

1. **App Store search (ASO)** — ~65–70% of installs for apps like this. Highest ROI, free.
2. **Web SEO → smart-banner funnel** — we already own a live PWA at yen-sense.vercel.app; it currently has **zero links to the App Store**. Compounds over 2–3 months.
3. **Communities** — r/JapanTravel, r/JapanTravelTips, Facebook Japan-travel groups, Product Hunt/HN. Spiky, free, needs Greg's face.
4. **Seasonality** — summer travel (now), autumn-leaves booking (Sept–Oct), cherry-blossom booking (Jan–Feb, the biggest spike).
5. **Optional paid** — Apple Search Ads at a tiny cap, purely to buy keyword data. Default: skip.

Competitive note: top results for "yen converter" are dated utilities (Fast Japanese Yen Converter, Japanese Yen To US Dollars). None have Practice mode, a widget, or a modern design. The niche is winnable on quality + ASO.

## Workstream 0 — Ship & instrument (this week)

| Task | Owner |
|---|---|
| Confirm v1.0 is actually live; grab the `apps.apple.com/.../id…` URL | Greg |
| Submit v1.0.1 (build 5, draft is ready) for review | Greg |
| Confirm Small Business Program enrollment | Greg |
| Add `apple-itunes-app` smart banner + App Store badge/CTA to the landing page, with click tracking | Claude |
| SKStoreReviewController prompt after a success moment (e.g., 3rd practice session) — ratings are the #1 ASO conversion factor | Claude (Swift), Greg (ship it in 1.0.2) |
| Seed 10+ honest ratings from real users (friends, Japan-trip companions) | Greg |

## Workstream 1 — ASO iteration

- **Claude:** keyword research from competitor metadata; draft 2–3 keyword-field variants (test "yen to dollar" phrasing, city terms, "travel budget"). Don't repeat words already in name/subtitle.
- **Claude:** extra-locale keyword fields (en-GB, en-AU, en-CA) — each localization adds another 100-char keyword field, and UK/AU/CA travelers are exactly the Pro multi-currency audience.
- **Claude:** Product Page Optimization (PPO) test plan — Apple's free built-in A/B tool. Icon variants already exist in `ios/AppIconCandidates/`. Test icon first, then screenshot 1.
- **Greg:** paste metadata into App Store Connect with each release; start PPO tests; review search-term impressions monthly.

## Workstream 2 — Web SEO funnel (Claude-heavy)

- **Claude:** programmatic conversion pages (`/convert/10000-yen-to-usd` for ~30 common amounts), Japan price-guide content pages reusing the Practice deck (ramen, vending machine, train fare costs), proper OG/meta + sitemap. Every page carries the smart banner + store CTA.
- **Greg (decision):** buy a real domain (~$15/yr, e.g. yensense.app) — ranks better than vercel.app and looks legit in Reddit posts; then connect Google Search Console.
- Honest expectation: traffic starts compounding in 2–3 months. Cheap because Claude writes all of it.

## Workstream 3 — Community distribution (Greg fronts, Claude drafts)

- **Reddit:** value-first comments in r/JapanTravel / r/JapanTravelTips money threads; one honest "I built this for my own trip" post in r/JapanTravelTips, plus r/SideProject and r/iosapps. Claude drafts every post/comment; Greg posts over several weeks (these subs ban drive-by self-promo).
- **Facebook:** Japan Travel Planning groups (1M+ members) — same playbook.
- **Launch beats:** Product Hunt + Show HN — Claude preps the gallery, tagline, first comment; Greg launches. Expect a modest dev-audience spike, useful for backlinks.
- **Press/bloggers:** Claude researches a 15–20 contact list (Tokyo Cheapo, japan-guide, Japan travel newsletters/YouTubers) and drafts pitches offering App Store promo codes (100 free per version); Greg sends from his email.
- **Video (optional, highest ceiling):** "stop doing mental math wrong in Japan" TikTok/Shorts angle. Claude scripts; only if Greg enjoys making them.

## Workstream 4 — Seasonal cadence & review

- Refresh promotional text + "What's New" to match travel seasons (free to change anytime, no review needed for promo text).
- Big pushes: **Sept–Oct** (autumn booking) and **Jan–Feb** (cherry-blossom booking — the spike).
- Monthly 30-min review with Claude: ASC funnel (impressions → page views → units), search terms, iterate keywords/screenshots.
- **Optional paid experiment:** Apple Search Ads, $5/day cap, exact-match "yen converter" terms, 2 weeks. CPI will be ~$2–4 so it won't ROI directly — it's a keyword-data purchase. Default skip.

## Kill / downshift criteria

If by end of October, after executing W0–W3, downloads are still <5/day, downshift to maintenance mode and put energy into the next portfolio app. The cherry-blossom season (Jan–Feb) gets one last seasonal push either way.

## Immediate next actions

1. Greg: confirm live listing + send Claude the App Store URL.
2. Greg: submit v1.0.1.
3. Claude: smart banner + CTA + SEO pages (blocked only on the URL).
4. Claude: ASO keyword research + review-prompt Swift code (not blocked, can start now).
