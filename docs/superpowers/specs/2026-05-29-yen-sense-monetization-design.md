# Yen Sense — Monetization Design

**Date:** 2026-05-29
**Status:** Draft for review
**Author:** Gregory Johns (with Claude)
**App:** Yen Sense — native SwiftUI iOS app, `com.gregjohns.yensense`, Travel category, currently Free, at the App Store submission doorstep.

---

## 1. Goal & strategic frame

**Maker's posture (decided):** "Validate cheaply, keep the upside uncapped." Ambition sits between passive beer money and real side income, with portfolio/credibility value as a welcome bonus. Effort: light touch for now, willing to actively grow it **if** it gets traction.

**Honest reality check (this shapes everything):**

- Travel is the **single worst-monetizing App Store category** — median Travel app makes **~$35/month** a year post-launch; even a top-10% Travel app makes only **~$822/month** (RevenueCat 2026). Revenue per install ≈ **$0.10**.
- Travel retention is brutal (**~3.6% D30**) — people install for a trip, then delete. **One conversion shot per install.**
- **The binding constraint is download volume (ASO + seasonal timing + distribution), not the monetization mechanism.** The paywall moves the needle far less than installs do.
- Therefore: treat this as a polished portfolio piece + passion project with a tasteful paywall. **$50–$150 in a peak travel month is a genuine success.** "Real side income" requires a *portfolio* of apps + a distribution engine — out of scope for this one app.

**Why now is the best-ever window:** record **42.68M visitors to Japan in 2025** (+15.8%), weak **~¥150/USD** yen (cheapest for foreign travelers in ~20 years). Twin demand peaks: **spring (cherry blossom, Mar–May)** and **autumn (foliage, Sep–Nov)**. Spring 2026 is already missed; **autumn 2026 is the launch target** (push ASO + featuring nomination + outreach in **Jul–Aug 2026**).

**Competitive gap we exploit:** the closest direct app ("Fast Japanese Yen Converter") is ad-supported and **abandoned since Feb 2024**; the giants (XE, Currency Converter Plus) have users *begging* in reviews for the small/fast/offline app they lost to bloat + ads. **Nobody owns the "learn to think in yen" angle** (our Practice trainer), and nobody serves the *running-subtotal shopping* moment. Our edges: native craft, a genuine **"no tracking"** privacy label, and the Practice trainer as both **moat and paywall**.

---

## 2. Monetization model (decided)

Ship **free**, monetize with **native StoreKit 2** — **no ads, no subscription, no third-party SDK** (RevenueCat not needed for one non-consumable + a few consumables). Enroll in the **Apple Small Business Program** (15% commission, not 30% — must apply, not automatic).

| Layer | Mechanism | Price |
|---|---|---|
| **Free core (forever)** | Yen keypad + running subtotal, live/cached/manual rate, ¥→USD, a **generous Practice taste** | $0 |
| **Tip jar** | Consumable IAP — "buy the maker a coffee / bento / feast" | $1.99 / $4.99 / $9.99 |
| **Yen Sense Pro** | One-time **non-consumable** unlock (buy once, includes all current + future Pro features) | **$3.99** |

**Yen Sense Pro unlocks (all at launch — "Full Pro at launch" decided):**
1. **Unlimited Practice** — the full price deck + long-term progress history & insights.
2. **Multi-currency** — pick your home currency (¥→EUR/GBP/AUD/CAD/KRW/…); free stays ¥→USD.
3. **Widget** — Home/Lock Screen widget for the current rate + quick glance.

Pricing rationale: **$3.99** undercuts the validated indie comp (Price Translator, $6.99 one-time) and Currency+'s $19.99/yr, while sitting above the $1.99 race-to-bottom to signal quality. One-time fits a ~2-week-trip tool and **dodges the high subscription-rejection risk** that thin single-purpose utilities face under Guideline 3.1.2.

---

## 3. Free / Pro line — the anti-backlash contract

The #1 way utilities earn 1-star reviews is "features moved behind Pro." Because the app **hasn't launched yet**, we set the line cleanly now, and the rule is: **never gate core conversion; the free tier must be genuinely useful on its own.**

| Capability | Free | Pro |
|---|---|---|
| Yen keypad, quick-add, running subtotal | ✅ | ✅ |
| Live / cached / manual rate, offline fallback | ✅ | ✅ |
| ¥ → **USD** | ✅ | ✅ |
| ¥ → **other home currencies** (EUR, GBP, AUD, CAD, KRW, CNY, …) | — | ✅ |
| Practice trainer — **everyday tier** (vending machine → ramen, ~6 price points) | ✅ | ✅ |
| Practice — **full deck** (market, taxi, dinner, hotel, splurge tiers — all 13) | — | ✅ |
| Practice — **long-term progress history & insights** | — | ✅ |
| Home/Lock Screen **widget** | — | ✅ |
| Tip jar | ✅ (optional) | ✅ |

**Free Practice is a real, useful trainer** (the daily small-purchase amounts), not a crippled demo. Pro adds the bigger-ticket deck + the history/insights layer + multi-currency + widget. *(The exact everyday-vs-full split is an open question in §10.)*

---

## 4. Feature designs

### 4a. StoreKit 2 layer (greenfield — no IAP code exists today)

- **`StoreManager`** (`@MainActor final class … ObservableObject`, injected into `RootView` as a `@StateObject`, mirroring `RateStore`/`QuizStore`).
  - Loads `Product`s for the Pro non-consumable (`com.gregjohns.yensense.pro`) and 3 consumable tips (`…tip.coffee/bento/feast`).
  - `purchase(_:)`, `restore()` (StoreKit 2 `AppStore.sync()` / current entitlements), and a published `isPro: Bool` derived from `Transaction.currentEntitlements`.
  - Listens to `Transaction.updates` for out-of-band purchases/refunds; on refund of Pro, revoke entitlement.
  - Persists nothing sensitive; entitlement is the source of truth from StoreKit. Cache `isPro` in `UserDefaults` only as a launch-time optimization, re-verified on `Transaction.updates`.
- **`PaywallView`** (sheet): lead with the **Practice trainer** + multi-currency; list Pro features; `$3.99` buy button; **"Restore Purchases"** button (required, Guideline 3.1.1); links to Privacy + Terms. Reuses `Style.swift` tokens (`ysAccent`, `panelCard()`, `YenButtonStyle`).
- **`TipJarView`** (sheet/section in Rate settings): three tip buttons; a small thank-you on success.
- **Entitlement gating helper**: a single `isPro` check + a reusable "locked" treatment (lock badge + tap → `PaywallView`) so gates are consistent and easy to audit.
- **StoreKit configuration file** for Xcode local testing; sandbox test plan before submission.

### 4b. Pro: Practice depth + history

- `QuizAmount.all` (13 amounts) gains a **tier** distinction: `everyday` (free) vs `full` (Pro). **Everyday tier (free, 6 amounts):** `drink-140`, `snack-380`, `coffee-520`, `train-880`, `lunch-1200`, `ramen-1800`. **Full tier (Pro, remaining 7):** `market-3200`, `taxi-4800`, `dinner-7600`, `shopping-12000`, `activity-18000`, `hotel-28000`, `splurge-45000`. `QuizStore.selectAmount`/`summary` filter to the everyday tier when `!isPro`.
- **History/insights view** (Pro): per-amount mastery (box level), streak history, accuracy over time — built on the existing `QuizProgress`/`QuizStats` already persisted by `QuizStore`. Free users see the live session stats grid only (as today).
- Tapping a locked tier or the history entry point opens `PaywallView`.

### 4c. Pro: Multi-currency (base-JPY, selectable home currency)

**Product framing:** the app stays **yen-first** — you always enter ¥. Pro lets you change the **quote/home currency**. This expands the market to all inbound tourists without breaking the "dedicated" feel (it is *not* a general N×N converter).

**Server (Vercel / Next.js):**
- Add a multi-currency endpoint, e.g. `GET /api/rates?base=JPY&symbols=USD,EUR,GBP,AUD,CAD,KRW,CNY,SGD,HKD,THB` backed by Frankfurter `latest?base=JPY&symbols=…` (same provider as today; ~30 majors supported).
- Response: `{ base: "JPY", rates: { USD, EUR, … }, sourceDate, fetchedAt, provider }`. Keep `force-static` + 12h `revalidate`, and extend the existing `/api/cron/refresh-rate` cron to warm it.
- **Keep the existing `/api/rates/jpy-usd` endpoint** for backward compatibility with already-shipped/old app versions.

**iOS:**
- Generalize the rate model: `StoredRate`/`EffectiveRate` move from JPY→USD-only (`yenPerUSD`, `usdPerYen`) to a **selected quote currency + a map of `quote → ratePerJpy`** (or `jpyPerQuote`). `selectedQuote` defaults to `"USD"`; only changeable when `isPro`.
- `ExchangeRateService` points at the new endpoint; cache all fetched rates per currency for offline use.
- UI touch points to de-hardcode USD: `ConverterView` ("JPY to USD", "$" result via `CurrencyText.usd`, "per $1"), `RateSettingsView`, `PracticeView` (USD estimate field/labels). Drive currency symbol/formatting off `selectedQuote` (use `NumberFormatter` with `currencyCode`).
- A **currency picker** in Rate settings (Pro-gated): list supported home currencies; persists `selectedQuote`.
- Fallback estimate generalizes (today hardcodes ¥150/USD); store a per-currency fallback or fall back to last-cached.

### 4d. Pro: Widget (WidgetKit)

- New **Widget Extension** target. Small/medium widgets showing the current ¥→(home currency) rate + "fetched" timestamp; optional quick-amount glance (e.g., ¥1,000 → $X).
- Shares rate data with the app via an **App Group** (`group.com.gregjohns.yensense`) so the widget reads the last cached rate without its own network call (works offline; refreshes on the app's 12h cadence via `TimelineProvider`).
- Gated: if `!isPro`, the widget shows a tasteful **"Unlock Yen Sense Pro"** placeholder instead of live data — the empty widget itself advertises Pro. Tapping it deep-links into the app's paywall.

### 4e. Tip jar UI

- Entry point in **Rate settings** ("Support the maker") and optionally a subtle prompt after a milestone (e.g., a great Practice streak) — never blocking, never repeated aggressively.

---

## 5. ASO + launch workstream (non-code, highest ROI — do first)

These are mostly free and outrank the paywall as a revenue lever:

1. **Enroll in the Apple Small Business Program** now (accept latest Paid Apps agreement; apply) — 15% not 30%, effective ~15 days after the fiscal month of approval, so do it before any sales.
2. **Title → `Yen Sense: Yen to USD`** (a title keyword vastly outranks the keyword field). **Subtitle → `Japan Travel Currency Converter`.**
3. **Dedupe the keyword field** — current keywords repeat words that would now be in title/subtitle (wasted budget). Move freed space to `dollar,exchange,rate,calculator,shopping,trip,money,tokyo`. Drop spaces/plurals/"app"/category names.
4. **Keyword captions on screenshots** ("Yen to USD instantly", "Add up your shopping", "Works offline", "Learn to think in yen") — Apple OCRs screenshot text as a ranking signal since 2025. (`ios/AppStoreScreenshots/` already exists.)
5. **In-app review prompt** (`SKStoreReviewController` / `RequestReviewAction`) after a successful conversion or completed Practice session — climb to the 4.0+ rating floor that featuring + ranking reward.
6. **Lead the listing** with the Practice trainer + running-subtotal shopping workflow (the two things no competitor owns). Copy: "No ads. No tracking. No subscription. No bloat. Works offline."
7. **Autumn featuring push:** submit an **App Store Featuring Nomination** + email "best Japan travel apps" roundup authors (JRailPass, FlipJapanGuide, MyJapanAdvisor) **6–8 weeks before autumn foliage (Jul–Aug 2026)**. Native craft + no-4.2-risk helps the case.
8. **Free distribution flywheel:** value-first answers in r/JapanTravel money threads (name only, no links); the maker story in r/SideProject / r/iOSProgramming; faceless POV TikTok/Reels using the Practice price-quiz hook (#Japan is the top travel hashtag). Product Hunt = one-time badge/backlink, not a download engine.
9. **(If pursuing the global-tourist market via multi-currency):** localize the listing for inbound-tourist languages (Japanese, German, French, Korean, Chinese) — each localization grants a fresh 30/30/100 ASO budget; stale competitors don't do this.

---

## 6. Do-not-do (explicit non-goals)

- **No ads** — at low DAU banners earn ~$8/mo, intrusive formats wreck the fast UX, and any ad SDK forces dropping the "no data collected / no tracking" label (our single best differentiator).
- **No subscription** — wrong instrument for a ~2-week-trip tool; highest rejection risk; the #1 source of 1-star reviews across every converter competitor.
- **No paid-upfront at launch** — craters installs for an unknown app; we need the free funnel for reviews/ASO/featuring.
- **No gating the core converter** — keypad + subtotal + live/cached rate stay free forever.
- **No external (web) payment links** — despite the post-Epic 0%-commission US window, it's legally unstable (Supreme Court appeal pending). Keep everything in StoreKit at 15%.
- **No feature bloat in the free core** — bloat + offline-removal is exactly what turned XE into a 1-star magnet. Protect the focus.

---

## 7. Sequencing / milestones (detailed plan to follow in writing-plans)

- **M0 — Free wins (no code / non-blocking):** Small Business Program enrollment; ASO metadata (title/subtitle/keywords); screenshot captions.
- **M1 — StoreKit foundation:** `StoreManager`, products in App Store Connect, `PaywallView`, `TipJarView`, restore, sandbox testing. *(Tip jar is shippable on its own.)*
- **M2 — Practice Pro:** tier split (everyday/full) + history/insights view + gating.
- **M3 — Multi-currency:** server endpoint + cron; iOS rate-model generalization + currency picker + de-hardcode USD UI.
- **M4 — Widget:** extension target + App Group + timeline provider + gating.
- **M5 — Launch polish:** in-app review prompt; privacy label review (still "no tracking" — StoreKit purchases don't change it); final QA; autumn featuring nomination + outreach.

---

## 8. Risks

- **Base-rate risk:** most first niche utilities make $0–low hundreds/**year** regardless of execution. Revenue may simply not materialize; the portfolio/learning value is the floor.
- **Over-gating Practice** → "moved behind Pro" backlash. Mitigation: the §3 contract keeps free Practice genuinely useful.
- **Multi-currency scope creep** — generalizing the rate model touches several files; keep it bounded to "selectable quote currency," not a general converter.
- **StoreKit review friction** — missing Restore button or paywall disclosures → rejection. Mitigation: include Restore + sandbox-test the full purchase/restore/refund loop pre-submission.
- **Widget/App Group config** — provisioning + App Group entitlement are the fiddly bits; isolated to M4.

---

## 9. Resolved decisions (confirmed 2026-05-29)

1. **Free-vs-Pro Practice line:** Free = the 6 everyday amounts (vending→ramen); Pro = full 13-item deck + history/insights. (See §4b for exact tier membership.)
2. **Tip tiers:** **$1.99 / $4.99 / $9.99.**
3. **Multi-currency launch set:** USD (free default) + EUR, GBP, AUD, CAD, KRW, CNY, SGD, HKD, THB (Pro) — top inbound-to-Japan markets Frankfurter supports.
4. **Widget when not Pro:** show an **"Unlock Pro" placeholder** widget (it doubles as advertising); tap deep-links to the paywall.
5. **Listing localization:** **deferred to a fast-follow update (v1.1+)** — English reaches most travelers; each localization later = a fresh 30/30/100 ASO budget + a "What's New" beat.
6. **Git:** commit **this doc only** to a dedicated branch (`yen-sense-monetization`); do not touch the in-progress files already modified on `main`.
