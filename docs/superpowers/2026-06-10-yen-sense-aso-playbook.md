# Yen Sense ASO Playbook

**Date:** 2026-06-10
**App:** Yen Sense: Yen to USD (id6773776110, Travel, free + $3.99 Pro + tip jar)
**Scope:** US keyword field, name/subtitle assessment, extra-locale plan, PPO test plan, seasonal promo text, monitoring shortlist.

All recommendations below are paste-ready for App Store Connect. Character counts were verified with `wc -c`. Where data is thin (search volumes, conversion rates), it is flagged — Apple does not expose keyword volume, so popularity claims are inferred from competitor metadata and travel-demand news, not measured.

---

## 1. Competitor metadata table (live listings, fetched 2026-06-10)

| App (App Store ID) | Exact name | Subtitle | Inferred keyword targets | Weaknesses Yen Sense can exploit |
|---|---|---|---|---|
| Fast Japanese Yen converter (1458690197) | "Fast Japanese Yen converter" | "JPY currency converter" | japanese yen, jpy, converter, calculator, shopping calculator, discount, offline rates | Finance category (not Travel); dated UI; "converter" duplicated across name+subtitle wastes indexing; no widget, no practice angle |
| Japanese Yen To US Dollars (1086978195) | "Japanese Yen To US Dollars" | "USD to JPY Currency Converter" | japanese yen, us dollars, usd to jpy, currency converter | Paid up front ($0.99) suppresses downloads; Utilities category; single pair only; heavy word duplication (yen/converter twice) |
| Yen to USD: Currency Converter (6743403284) | "Yen to USD: Currency Converter" | "Japan Travel. Yen Conversion" | yen to usd, currency converter, japan travel | Only 29 ratings; thin feature set (single pair, no offline claim, no widget); closest direct rival for the exact-match "yen to usd" query — Yen Sense already contests this head-on |
| Currency (284220417, Jeffrey Grossman) | "Currency" | "Offline currency converter" | currency, offline, converter, exchange rates, 160 currencies | Generic — never mentions Japan/yen; $19.99/yr subscription + ads in free tier; Yen Sense wins on Japan-specific queries and one-time pricing |
| Xe Money Transfer & Currency (315241195) | "Xe Money Transfer & Currency" | "Send Money Abroad in Minutes" | money transfer, send money, exchange rates, currency | Pivoted to remittance; brand-query traffic only; bloated for a traveler who just wants to read a price tag in Tokyo |
| Elk Currency Converter (1189748820) | "Elk Currency Converter" | "Award-Winning Travel Converter" | travel converter, currency, trips, apple watch | 4.1 stars with 1.2K ratings (subscription backlash: $1.99/mo / $9.99/yr); subtitle spends 13 chars on "Award-Winning" instead of keywords |
| Yen to Dollars Converter (6754408338) | "Yen to Dollars Converter" | (minimal listing) | yen to dollars | Brand-new, near-zero ratings; signal that the "yen to dollars" phrasing is contested ground worth indexing |

**Takeaways:** (1) No Japan-specific competitor combines Travel category + offline + widget + practice mode — Yen Sense's differentiators are genuinely unique in this niche. (2) The two strongest generic apps (Currency, Xe) don't index Japan terms at all. (3) Several competitors waste characters duplicating "converter"/"yen" across fields — avoid that mistake.

---

## 2. Keyword field — 3 candidate variants (US, en-US)

**Rules applied** (per current ASO guidance from AppTweak/AppFollow/MobileAction, 2025–2026): comma-separated, no spaces; never repeat words already in the name or subtitle (Apple combines name + subtitle + keyword field into one index, so repeats are pure waste); prefer singular — Apple's stemming usually matches plurals; Apple builds phrase combinations across fields, so `dollar` + name's "Yen to USD" + subtitle's "Japan Currency Converter" yields combinations like "yen to dollar", "japan exchange rate", "tokyo currency calculator".

**Words banned from the field** (already indexed via name/subtitle): yen, sense, usd, japan, currency, converter.

**Current field (for reference):** `dollar,exchange,rate,calculator,shopping,trip,money,tokyo,offline,jpy` (70 chars — 30 chars left unused).

### Variant A — Travel-intent + city terms (RECOMMENDED) — 91 chars
```
dollar,exchange,rate,calculator,jpy,offline,travel,trip,tokyo,kyoto,osaka,money,vacation,fx
```
Rationale: keeps everything that currently ranks, adds `travel`/`vacation` (matches the Travel category and the weak-yen US travel boom — US–Japan summer seats up 9% YoY) and `kyoto`/`osaka` city long-tails no competitor indexes. Lowest-risk upgrade; drops only `shopping` (partially covered by promo text and screenshots, which don't index, but the tally feature is a conversion message more than a search query).

### Variant B — Shopping/price-utility intent — 97 chars
```
dollar,exchange,rate,calculator,jpy,shopping,tip,tax,price,offline,travel,money,budget,trip,tokyo
```
Rationale: chases "how much does X cost in japan" utility queries (`price`, `tax` — Japan's tax-free shopping is a real traveler concern, `tip`, `budget`). Better matched to the shopping-tally differentiator; weaker on city long-tails.

### Variant C — "Japanese" stem bet + cities — 91 chars
```
dollar,jpy,exchange,rate,calculator,japanese,tokyo,osaka,kyoto,travel,offline,trip,money,fx
```
Rationale: explicitly indexes `japanese` to contest "japanese yen converter" (the #1 competitor's exact name). Honest caveat: Apple's stemmer likely already maps subtitle's "Japan" → "japanese", so this may be a wasted 9 characters — this is the experiment, and it's unverifiable without rank tracking.

**Recommendation: ship Variant A now.** It strictly adds coverage versus the current field. After 4–6 weeks of App Store Connect search-terms data, if "japanese yen" impressions are weak, swap to Variant C. Keyword-field changes require a version submission (binary or metadata-with-version), so batch with the next build.

---

## 3. Should the name/subtitle change?

**Name "Yen Sense: Yen to USD" — keep it.** Honest assessment:

- It already indexes the highest-intent exact queries: "yen", "yen to usd", "usd". The duplicate "Yen" is mildly wasteful but the brand requires it, and "Yen to USD" as a contiguous phrase is the single most valuable string in the niche (a competitor built their entire app name around it).
- App Review friction is real: name changes go through review, and Guideline 2.3.7 rejections for keyword-stuffy names ("Japan Travel Currency Exchange Rate...") are common. A rejection stalls the whole release.
- Renaming also risks losing accumulated ranking history on current terms for an unproven gain. Not worth it at this traffic level.

**Subtitle "Japan Currency Converter" — keep for now; one candidate worth testing later.**

- Current subtitle indexes `japan`, `currency`, `converter` — all high-value, zero overlap with the name. It is genuinely good.
- The only credible alternative angle: `Japan Travel Money Converter` (28 chars) — trades `currency` for `travel`+`money`. But Variant A already adds `travel` and `money` via the keyword field at zero risk, so the subtitle swap buys little. Revisit only if ASC data later shows "japan travel" driving impressions while "currency" doesn't.
- Note: subtitle changes also require a version submission but are low rejection-risk if descriptive. Do NOT change name and subtitle and keywords simultaneously — you'll never know what moved rankings.

---

## 4. Extra-locale plan (paste into App Store Connect > App Information > localizations)

How indexing works (per AppTweak/MobileAction cross-localization research): every localization gets its own 100-char keyword field, and several storefronts index a *secondary* locale on top of their primary one. Crucially, **the US storefront also indexes Spanish (Mexico) metadata**, and **English (UK) is indexed as a secondary locale across a large majority of English-speaking and international storefronts**. Keywords do NOT combine across locales (an en-GB word won't form phrases with en-US words), but each field ranks independently. Keep the app **name identical** in all locales (brand consistency, no review friction); localize subtitle + keywords.

The GBP/AUD/CAD travelers below are exactly the Pro multi-currency audience — these locales advertise the Pro pair directly in the subtitle.

### English (U.K.) — indexes in UK + secondary in many territories
- **Subtitle (29 chars):** `Yen to Pound Travel Converter`
- **Keywords (83 chars):** `gbp,sterling,exchange,rate,calculator,jpy,japanese,holiday,trip,tokyo,offline,money`
- Rationale: `holiday` is the UK search term Americans never use; `sterling`/`gbp` cover the pair (`pound` is intentionally excluded — it is already indexed via the subtitle); subtitle phrase "yen to pound" mirrors the proven "yen to usd" pattern.

### English (Australia) — indexes in Australia
- **Subtitle (27 chars):** `Yen to AUD Travel Converter`
- **Keywords (87 chars):** `aud,dollar,exchange,rate,calculator,jpy,japanese,holiday,trip,tokyo,offline,money,osaka`
- Rationale: Australia is per-capita one of the biggest Japan-travel markets (ski season + weak yen); `holiday` again; `dollar` is safe here because the en-AU subtitle uses "AUD" not "dollar".

### English (Canada) — indexes in Canada
- **Subtitle (28 chars):** `Yen to CAD: Japan Trip Money`
- **Keywords (88 chars):** `cad,dollar,exchange,rate,calculator,jpy,japanese,trip,tokyo,offline,money,vacation,kyoto`
- Rationale: deliberately varies the subtitle pattern to index `trip`+`money` as subtitle-weighted terms in one market — a cheap structural experiment. Note Canada also indexes fr-CA; a French (Canada) localization (`yen,japon,taux,change,calculatrice,voyage,devise`) is a future option, lower priority.

### Spanish (Mexico) — BONUS, highest leverage: indexes directly into the US storefront
- **Subtitle (30 chars):** `Convertidor yen japonés a USD`
- **Keywords (95 chars):** `japanese,vacation,kyoto,osaka,shopping,price,tip,tax,budget,fx,exchange,rate,calculator,offline`
- Rationale: this is the standard trick — the es-MX keyword field is indexed for US searches, effectively doubling the US keyword budget to ~200 chars. Filling it with the English terms that didn't fit in Variant A (the entire Variant B shopping cluster plus `japanese`) gets US coverage of BOTH variants at once. The Spanish subtitle keeps the listing legitimate for actual es-MX users. Honest caveat: secondary-locale terms generally rank somewhat weaker than primary-locale terms.

Priority order if doing these incrementally: **es-MX first** (boosts the US, your main market), then en-GB, then en-AU, then en-CA.

---

## 5. Product Page Optimization (PPO) A/B test plan

Assets reviewed in repo at `/Users/gregjohns/code/personal/currency-converter/ios/AppIconCandidates/`:

- **Current shipped icon** (`ios/YenSense/YenSense/Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png`) is visually identical to `yen-sense-app-icon-v5-centered.png`: black ¥ with red dot, enclosed in a red circular two-arrow ring, cream background. Clean, balanced, reads as "currency exchange" instantly.
- **v2:** ¥ + rising sun + red swoosh arrows + Tokyo Tower silhouette. Most "Japan" signal, but busiest — the tower may turn to noise at 60px home-screen size.
- **v3:** same composition as v2 minus the tower. Strong rising-sun-behind-¥ motif, larger and bolder than current.
- **v4:** same motif as v3 but smaller/lighter glyph with more padding. Too close to v3 to produce a differentiated learning.

**Test 1 — Icon (run first, biggest CVR lever):**
Control = current (v5-centered). Treatments = **v2** and **v3** only. Skip v4 — testing two near-identical variants (v3 vs v4) at low traffic burns statistical power for no insight. The hypothesis being tested: does adding explicit Japan iconography (rising sun, tower) beat the cleaner "exchange ring"?

**Test 2 — Screenshot 1 messaging (after icon winner is applied):**
Three caption variants on the first screenshot (first screenshot dominates search-result tap-through):
- A (control): current practice-mode framing — "Learn to think in yen"
- B (utility): "Japan prices in dollars, instantly — even offline"
- C (trust): "No ads. No tracking. No subscription."

**Duration and honest math:** Apple allows up to 3 treatments, 90 days max per test. PPO needs very roughly ~1,000+ impressions *per arm* for even a directional read at typical effect sizes; a low-traffic niche app may see only tens of impressions/day. **Plan: run each test the full 90 days with traffic split 3 ways (control + 2 treatments), and treat anything short of a large gap as noise.** Time the icon test to start late June so it spans the summer travel-planning peak (more impressions = faster significance). Sequencing: icon test (Jun–Sep) → screenshot test (Sep–Dec, catching autumn planning traffic). Do not change other metadata mid-test.

---

## 6. Promotional text — seasonal variants (170-char limit, no review needed, swap anytime)

**Summer / NOW (weak-yen boom — yen near multi-year lows, US–Japan summer airline capacity up 9% YoY) — 170 chars:**
```
Yen near multi-year lows means your dollars go further in Japan this summer. Convert prices instantly, tally shopping totals, and practice thinking in yen before you fly.
```

**Autumn (set ~Sept 1; koyo/foliage trips + autumn trip planning) — 160 chars:**
```
Booking autumn leaves season? Learn to think in yen before Kyoto and Tokyo. Practice real Japan prices, add up shopping totals, and convert offline with no ads.
```

**Cherry blossom (set ~Jan 5; hanami booking window runs Jan–Feb, March arrivals hit record 3.6M in 2026) — 156 chars:**
```
Planning cherry blossom season? Practice real Japan prices before you book, then convert yen fast on the ground with offline rates, no ads, and no tracking.
```

Calendar: Jan 5 → cherry blossom · Apr 15 → summer/weak-yen · Sep 1 → autumn · Nov 15 → back to summer-style evergreen or a winter/ski variant. Reminder: promo text is NOT indexed for search — it's pure conversion copy, so lead with the seasonal hook and the no-ads trust signal.

---

## 7. Search terms to monitor (App Store Connect > Analytics > Acquisition > search terms, plus manual rank checks)

Core (expect to rank; watch weekly):
- `yen to usd` · `yen converter` · `yen to dollars` · `jpy to usd` · `yen calculator`

Category (the growth frontier; watch after Variant A ships):
- `japan currency converter` · `japanese yen` · `japan currency` · `currency converter japan` · `japan travel app`

Long-tail / seasonal (low volume, low competition — directional only):
- `100 yen to usd` (numbers index poorly; tracked for curiosity) · `tokyo currency` · `japan trip` · `yen exchange rate` · `japan shopping calculator`

Competitor brand (measure spillover):
- `xe currency` · `elk converter` · `currency app`

Honest note: ASC only shows terms that already drive impressions to you, so it under-reports terms you don't rank for. For true rank tracking on the category terms, a free-tier AppTweak/AppFigures/Astro account is the cheap fix — consistent with the "validate cheaply" posture.

---

## Execution checklist (in order)

1. Paste Variant A into the en-US keyword field; bundle with the next build submission.
2. Add es-MX localization (subtitle + keywords above) in the same submission — doubles US keyword coverage.
3. Swap promo text to the summer variant today (no review needed).
4. Start PPO icon test (current vs v2 vs v3) when the new version is live; run 90 days.
5. Add en-GB, en-AU, en-CA localizations in the following release.
6. Set calendar reminders: Sep 1 (autumn promo + screenshot PPO test), Jan 5 (cherry blossom promo).
7. Check ASC search terms monthly; revisit Variant C (`japanese`) if "japanese yen" impressions stay flat by late July.
