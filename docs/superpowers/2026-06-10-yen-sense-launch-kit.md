# Yen Sense Community Launch Kit

Date: 2026-06-10
App: Yen Sense: Yen to USD — https://apps.apple.com/us/app/yen-sense-yen-to-usd/id6773776110
Web: https://yen-sense.vercel.app
Voice: Greg — traveler first, developer second. Honest, low-key, no growth-hacker tone.

---

## 0. Research caveat (read before posting)

Reddit blocks automated fetching of its rules pages, so the subreddit rules below are summarized from
secondary sources and well-established moderation reputations, not from a live read of each sub's rules
tab. **Before posting anything, open each subreddit's Rules tab in the app and re-read it.** Where a rule
summary below is uncertain, it's marked. The safest universal move — and the one strict subs explicitly
require — is to **message the moderators first** and ask. A mod pre-approval also protects the post from
drive-by removal.

---

## 1. REDDIT

### 1.1 Rules summary per subreddit

| Subreddit | Self-promo posture | Confidence | What to do |
|---|---|---|---|
| r/JapanTravel | Strictly moderated. Historically prohibits self-promotion, surveys, research requests, and product posts without **prior moderator approval**. App-promo posts are effectively banned; they get removed fast. | High (long-standing reputation; could not fetch live rules) | Do **not** post the app here. Compliant alternative: (a) message the mods asking if a free, no-ads travel tool post would be allowed; (b) otherwise participate in comments only, and only mention the app if someone directly asks for app recommendations. |
| r/JapanTravelTips | More casual than r/JapanTravel, but has a no-spam/no-self-promotion rule. Pure promo posts get removed; genuinely useful tips posts with a disclosed, single mention of your own app are sometimes tolerated — at mod discretion. | Medium (could not fetch live rules) | Message mods first with the draft below. If they say no, post the same content **without** the app mention (it stands alone as a tips post) and let the app live in your profile. Comments mentioning the app where directly relevant are generally fine. |
| r/SideProject | Self-promo friendly by design, but posts must tell a story: what you built, why, what stack, what feedback you want. Bare links are treated as spam. Same project max ~once every 3–4 weeks, and you must respond to comments (post-and-ghost gets removed). | High (verified via current third-party rules summaries) | Post the draft below. Stay in the thread all day answering. |
| r/iosapps | A discovery sub where developers sharing their own apps is normal. Typically requires honesty that you're the dev, and limits repeat posting of the same app; promo codes for paid features are appreciated. | Medium (promo-friendly purpose verified; exact current rules not fetched) | Post with a clear "I'm the developer" line and offer Pro promo codes in the comments. Check current flair requirements in-app first. |

**General Reddit norm to respect:** the old 10:1 guideline — for every self-promotional post or comment,
have ~10 genuine non-promotional contributions. Your account should look like a traveler who occasionally
mentions his app, not the reverse.

### 1.2 Japan-travel sub post (target: r/JapanTravelTips, after mod OK)

> **Title:** How I stopped doing phone math at vending machines (and what I learned about thinking in yen)
>
> Before my two-week trip last year I kept hearing "just divide by 150 in your head." That worked for
> about a day. Then I'm standing at a vending machine doing arithmetic while a line forms behind me.
>
> What actually fixed it wasn't a better conversion trick — it was learning the *prices* themselves.
> If you know a vending machine drink is ~¥130–180, a konbini onigiri is ~¥120–200, a bowl of ramen is
> ¥800–1,200, and a reasonable lunch set is ~¥1,000, you stop converting entirely. You just know whether
> something is cheap, normal, or expensive — the same way you do at home.
>
> A few things that helped me get there:
>
> - **Anchor on a handful of reference prices** before you go (drink, onigiri, ramen, train fare, taxi
>   start fare). Everything else gets judged against those.
> - **Quiz yourself.** Seeing ¥4,800 and guessing "about $32" before checking trains your gut fast.
> - **Stop converting small stuff.** Anything under ¥500, just buy it. The mental overhead costs more
>   than the rounding error.
> - **Keep a running total while shopping** (Don Quijote will get you), so the damage at the register
>   isn't a surprise.
>
> Full disclosure: I ended up building a small free iPhone app for my own trip that does this —
> a converter with a practice mode that drills you on real Japan prices until you think in yen. It's
> called Yen Sense (free, no ads, no tracking). Mentioning it because the practice-before-you-go idea
> genuinely changed my trip, app or no app. Happy to answer questions about either.

(If mods decline the app mention: delete the final paragraph. The post still works.)

### 1.3 r/SideProject post

> **Title:** I built a yen converter for my own Japan trip because I was sick of doing phone math at vending machines — it's now on the App Store
>
> Last year I had a two-week Japan trip coming up and every currency app I tried was either stuffed with
> ads, wanted a subscription, or wanted my location. All I needed was "what is ¥3,400 in dollars" and,
> ideally, to eventually not need the app at all.
>
> So I built Yen Sense. The core is boring on purpose: type yen, see USD, add up a shopping basket,
> works offline with a cached or manual rate. The part I actually care about is **Practice mode** — a
> deck of real Japan prices (vending machine drinks, konbini food, train fares, ramen) that quizzes you
> until you stop converting and start *thinking in yen*. By week two of my trip I wasn't opening the
> converter anymore, which I've decided is the success metric, even if it's a funny one for retention.
>
> Stack: SwiftUI + StoreKit 2 on iOS, Next.js on Vercel for the web version and the rate endpoint.
> Monetization is deliberately small: free with no ads and no tracking, an optional tip jar, and a $3.99
> one-time Pro unlock (full practice deck, more home currencies, widgets). No subscription — it's a
> trip app, you use it for two weeks.
>
> This is a validate-cheaply project, not a startup. What I'd love feedback on: does the "practice
> until you don't need me" angle land, or do people just want the converter? And has anyone here had
> luck with tip jars in practice?
>
> App Store: https://apps.apple.com/us/app/yen-sense-yen-to-usd/id6773776110
> Web (free, no install): https://yen-sense.vercel.app

### 1.4 Five value-first comment templates

Use only in threads where the answer genuinely fits. Templates 1 and 4 are pure value — no app mention.
Never paste verbatim twice; rephrase each time.

**A. "How much cash should I bring?" threads (soft mention)**

> Japan is way more cashless than it used to be, but you still want cash for small shrines, some ramen
> shops, markets, and rural anything. I carried about ¥20,000–30,000 at a time and topped up at 7-Eleven
> ATMs (they take basically every foreign card and the fees are reasonable). One thing that helped me
> budget: learn a few anchor prices before you go — drink ¥150, onigiri ¥150, ramen ¥1,000 — so cash
> amounts mean something. (I ended up building a little free app, Yen Sense, that drills those prices,
> but honestly even a sticky note of reference prices works.)

**B. IC card / payment questions (pure value, optional trailing mention)**

> Add Suica to Apple Wallet before you land — it takes two minutes, you top up from your phone, and it
> works on trains, buses, vending machines, and konbini nationwide (the regional cards are
> interoperable). You don't need the physical card anymore, and you skip the machine queues. Visa works
> almost everywhere touristy now; carry some cash for the exceptions. One mental trick: stop converting
> anything under ¥500 — the stress isn't worth the rounding error.

**C. Daily budget threads (soft mention)**

> Rough real-world numbers from my trip: konbini breakfast ¥400–600, lunch set ¥900–1,200, good casual
> dinner ¥1,500–3,000, train hopping around Tokyo ¥800ish/day. You can do a comfortable non-luxury day
> at ¥8,000–12,000 excluding hotel. The biggest budget leak is impulse Don Quijote/omiyage shopping —
> keep a running total as you put stuff in the basket. (Shameless plug, mine: I built a free converter
> app with a shopping-total feature for exactly this — Yen Sense — but a phone calculator does it too.)

**D. First-trip anxiety threads (pure value, no mention)**

> Totally normal to feel this. Three things that actually matter: (1) Japan is extremely forgiving of
> confused tourists — station staff and konbini clerks deal with us all day and are patient; (2) Google
> Maps handles trains nearly perfectly, including platform numbers; (3) get past day two and your brain
> adapts — prices, etiquette, train flow all click faster than you expect. Pre-learn maybe five phrases
> and five typical prices and you'll feel oriented instead of lost. You'll be planning trip two before
> you fly home.

**E. "Best apps for Japan" threads (natural mention, with disclosure)**

> My actual home screen for Japan: Google Maps (trains), Google Translate (camera mode for menus),
> Suica in Apple Wallet, and a currency app. For currency I'll disclose bias — I built my own, Yen
> Sense (free, no ads, no tracking, works offline) because everything else was ad-soup. Its whole
> gimmick is a practice mode that teaches you common Japan prices so you eventually stop needing a
> converter at all. Whatever app you use, the offline-rate part matters more than you'd think on the
> Shinkansen.

### 1.5 Posting cadence (comments before posts)

| Week | Action |
|---|---|
| Week 1 | No posts. 1–2 genuinely helpful comments/day in r/JapanTravel and r/JapanTravelTips using templates A–E (mostly the no-mention ones). Build comment karma and a normal-looking history. Message r/JapanTravelTips mods with the draft post and ask. |
| Week 2 | Post to **r/SideProject** (Tue–Thu morning US time). Stay in the thread all day. Continue 1 helpful comment/day elsewhere. |
| Week 3 | Post to **r/iosapps** with promo codes in comments. Post the tips post to **r/JapanTravelTips** if mods approved (without the app paragraph if they didn't). Keep commenting. |
| Week 4 | No new posts. Keep light comment participation; mention the app only when asked or squarely relevant. Reassess what worked. |

Rules of thumb: never two promotional posts in the same week; reply to every comment within a few hours
on launch days; if anything gets removed, don't repost — message the mods politely and ask what would
comply.

---

## 2. PRODUCT HUNT

**Tagline (≤60 chars):**
`Learn to think in yen — not just convert it` (43 chars)

Alternate: `The Japan currency app that teaches you to stop needing it` (59 chars)

**Short description:**

> Yen Sense is a free, private yen↔USD converter built for Japan trips: instant conversion, shopping
> totals, offline rates, no ads, no tracking. Its Practice mode drills you on real Japan prices —
> vending machines, konbini, ramen, train fares — until you think in yen and stop doing phone math.
> Optional tip jar and a $3.99 one-time Pro unlock. No subscription.

**Maker's first comment:**

> Hi PH — I'm Greg. I built Yen Sense for my own two-week Japan trip because every converter I tried
> had ads, tracking, or a subscription, and none of them solved the actual problem: standing at a
> vending machine doing arithmetic while a line forms behind you.
>
> The converter part is deliberately simple — type yen, see USD, add up a shopping basket, works
> offline with cached or manual rates. The part I'm proud of is Practice mode: a deck of real Japan
> prices that quizzes your gut ("¥4,800 — about how much?") until you stop converting entirely. By the
> end of my trip I wasn't opening the app, which I consider the app working as intended.
>
> It's free, no ads, no tracking — there's a tip jar and a $3.99 one-time Pro unlock (full practice
> deck, extra home currencies, widgets) if you want to support it. There's also a free web version if
> you don't want to install anything.
>
> I'd genuinely love to hear: did anything else fix the "phone math abroad" problem for you? And if
> you've got a Japan trip coming up, I'll happily share Pro promo codes for feedback.

**Gallery / asset checklist:**

- [ ] App icon at 240×240 (PH thumbnail) — use the final centered 1024 icon downscaled
- [ ] First gallery image: the "hook" — converter + Practice card side by side with the line "Learn to think in yen" (PH recommends 1270×760)
- [ ] 3–5 device screenshots reused from App Store set: Converter ("Yen to USD instantly / Add up your shopping"), Practice ("Learn to think in yen"), Offline rate ("Works offline")
- [ ] One image showing the privacy label: "No data collected. No tracking. No ads."
- [ ] Optional 30–60s screen recording: type a price → guess → reveal, in Practice mode (sound off, captioned)
- [ ] Pricing image or caption clarifying free vs $3.99 one-time Pro (no subscription)
- [ ] Links ready: App Store, web app, support page, privacy policy
- [ ] 5–10 Pro promo codes generated in App Store Connect for the comments

**Launch-day advice:**

- Launch 12:01 AM Pacific, Tuesday–Thursday (weekends and Mondays are quieter but more competitive per-vote; for a small indie app, a quieter Sunday launch can also place higher — pick one, don't agonize).
- Be present the entire day; reply to every comment. The maker comment thread is the product page.
- Don't beg for upvotes anywhere (PH penalizes vote rings). Do tell your real network "I launched today, feedback welcome" with the link.
- Cross-post the launch to r/SideProject only if it's a different week than your Reddit post there.
- Have the web version linked prominently — PH users love zero-install try-it links.
- Capture the day: whatever badge/ranking you get goes in the press kit and App Store promo text later.

---

## 3. SHOW HN

**Title:**
`Show HN: Yen Sense – iOS yen converter that teaches you to stop needing it`

**Post body:**

> I had a two-week Japan trip last year and got tired of doing phone math at vending machines, so I
> built a converter with the explicit goal of making itself unnecessary.
>
> The core converter is intentionally minimal: JPY→USD, a running shopping total, and offline support —
> the app caches the last fetched rate and also lets you pin a manual rate, since you're frequently
> underground or roaming-limited in Japan. Rates come from a small Next.js endpoint on Vercel that
> proxies/caches an upstream FX source, so the app isn't coupled to any one provider and I can swap
> sources without an app update.
>
> The interesting part to build was Practice mode: a deck of real Japan prices (vending machines,
> konbini items, train fares, ramen) that quizzes your gut — "¥4,800, roughly how many dollars?" — and
> scores you on closeness rather than exactness. The design problem was teaching *price intuition*
> rather than arithmetic: anchoring on reference items turned out to matter much more than conversion
> tricks. By the second week of my trip I'd stopped opening the converter, which I'm treating as the
> success metric even though it's hilariously anti-retention.
>
> Stack: SwiftUI, StoreKit 2 for a tip jar plus a $3.99 one-time non-consumable Pro unlock (full deck,
> extra home currencies, widgets). StoreKit 2's async/await APIs and local transaction verification
> made IAP far less painful than I remembered, though testing tip-jar consumables in sandbox is still
> clunky. No accounts, no analytics, no tracking — everything is on-device except the rate fetch.
>
> App Store: https://apps.apple.com/us/app/yen-sense-yen-to-usd/id6773776110
> Web version (no install): https://yen-sense.vercel.app
>
> Happy to answer questions about StoreKit 2, the offline-rate design, or whether "an app that
> obsoletes itself" is a viable thing to ship.

HN notes: post weekday morning US Eastern; don't ask for upvotes; answer technical questions fast and
honestly (including monetization numbers if asked — HN respects candor about small revenue).

---

## 4. PRESS / CREATOR PITCHES

### 4.1 Contact list

Verified = name + contact method confirmed via current web search results (June 2026). Re-verify the
contact page before sending; mark-up below is honest about uncertainty.

| # | Outlet / Creator | What they cover | Contact | Status |
|---|---|---|---|---|
| 1 | Tokyo Cheapo | Budget Tokyo travel; loves cheap/free tools | https://tokyocheapo.com/contact/ (advertising: https://tokyocheapo.com/advertise/) | Verified |
| 2 | Japan Cheapo | Same team, Japan-wide budget travel | https://japancheapo.com/contact/ | Verified |
| 3 | japan-guide.com | The reference Japan travel guide | https://www.japan-guide.com/e/e410.html | Verified |
| 4 | Unseen Japan | Japan news/culture site + free weekly newsletter; accepts pitches via form | https://unseen-japan.com/contact/ | Verified |
| 5 | JapanTravel.com | Tokyo-based inbound-tourism publisher with contributor community | https://en.japantravel.com/about/company (contact via site) | Verified (exact pitch email not found) |
| 6 | Tokyo Weekender | English lifestyle magazine, 300k+ monthly users | https://www.tokyoweekender.com/contact-us/ | Verified |
| 7 | GaijinPot / GaijinPot Travel | Work/study/travel in Japan; large blog | https://gaijinpot.com/contact | Verified |
| 8 | MATCHA (matcha-jp.com) | Japan travel web magazine, 3.3M monthly users, 10 languages | https://company.matcha-jp.com/en/ (marketing/advertising contact) | Verified; likely paid placement |
| 9 | The Real Japan (Rob Dyer) | Independent Japan travel guides + biweekly Japan Travel Bulletin newsletter | press@therealjapan.com | Verified |
| 10 | Abroad in Japan (Chris Broad, YouTube ~3M subs) | The biggest Japan-travel YouTube ecosystem; also a podcast | hello@abroadinjapan.com / partnerships@abroadinjapan.com | Verified |
| 11 | Paolo fromTOKYO (YouTube) | Tokyo travel guides, "things to do" — exactly your audience | business@tokyozebra.com | Verified |
| 12 | Currently Hannah (YouTube) | Japan travel/life films, Osaka-based | https://www.currentlyhannah.com/ (contact page, business only) | Verified |
| 13 | Tokyo Lens (Norm Nakamura, YouTube) | Japan life/travel storytelling | https://www.itstokyolens.com/contact | Verified |
| 14 | Krewe of Japan (podcast) | Weekly Japan culture/travel podcast | kreweofjapanpodcast@gmail.com | Verified |
| 15 | Japan Station / Japankyo (podcast) | Japanese culture & language podcast; covers tools for Japan-bound listeners | mail@japankyo.com | Verified |
| 16 | Letters from Japan (Burcu Basar, Substack) | Monthly Japan travel letters/photography | https://www.lettersfromjapan.com/ (Substack reply/about) | Verified site; pitch via Substack message |
| 17 | Japan Unravelled (Substack) | "Level up your Japan travel plan in 5 min/month" — ideal fit | https://japanunravelled.substack.com/ (Substack message) | Verified site; contact uncertain |
| 18 | Japan Experience | Tour operator with a monthly themed newsletter | https://www.japan-experience.com/newsletter | Verified site; editorial openness uncertain |
| 19 | Tofugu | Japanese learning/culture; "Consumer Reports of Japanese learning" — pitch the *practice/learning* angle | https://www.tofugu.com/ (contact via site) | Site verified; contact method uncertain |
| 20 | Savvy Tokyo (GPlusMedia, sister of GaijinPot) | Lifestyle in Japan, female-skewing audience | via https://gaijinpot.com/contact (GPlusMedia) | Uncertain — verify before sending |

Skip-list note: Mrs Eats could not be verified with a business contact; excluded. MATCHA and GaijinPot
lean commercial — expect "here's our media kit" replies; still worth one polite email.

### 4.2 Pitch email — blogs / newsletters (≤150 words)

> Subject: A free yen app that teaches travelers to stop needing it
>
> Hi [Name],
>
> I'm Greg, an indie developer. Before my own two-week Japan trip I built Yen Sense, an iPhone yen→USD
> converter, because everything on the App Store was ads, tracking, or subscriptions.
>
> The bit your readers might actually care about: Practice mode quizzes you on real Japan prices —
> vending machines, konbini, ramen, train fares — until you think in yen and stop doing phone math.
> It worked on me; by week two I'd stopped opening my own app.
>
> It's free, no ads, no tracking, works offline. There's an optional tip jar and a $3.99 one-time Pro
> unlock. Web version: https://yen-sense.vercel.app — App Store:
> https://apps.apple.com/us/app/yen-sense-yen-to-usd/id6773776110
>
> Happy to send App Store promo codes for Pro, screenshots, or answer anything. No pressure either way —
> I know you get a lot of these.
>
> Greg

### 4.3 Pitch email — YouTubers / podcasts (≤150 words)

> Subject: Free Japan-trip app for your "what to download" segments — promo codes inside
>
> Hi [Name],
>
> Long-time viewer — [one genuine specific line about their content]. I'm Greg, an indie dev. I built
> Yen Sense for my own two-week Japan trip: a free yen→USD converter with no ads, no tracking, and
> offline rates.
>
> The hook that might fit a video or episode: its Practice mode drills real Japan prices (vending
> machines, konbini, train fares) so travelers learn to *think in yen* and stop doing phone math at
> the register. An app whose goal is making itself unnecessary by week two.
>
> If you ever do "apps for Japan" content, I'd love to send App Store promo codes for the $3.99 Pro
> unlock — for you and some for your audience. Zero expectations; honest criticism is just as welcome.
>
> App Store: https://apps.apple.com/us/app/yen-sense-yen-to-usd/id6773776110 — Web:
> https://yen-sense.vercel.app
>
> Greg

Pitch hygiene: send individually (no BCC blasts), personalize the first line for real, follow up once
after ~10 days, then stop. Track sends/replies in a simple sheet.

---

## 5. PRESS KIT — one-page content block (reuse anywhere)

> ## Yen Sense — press kit
>
> **One-liner:** Yen Sense is a free, private yen→USD converter for Japan trips whose Practice mode
> teaches you to think in yen — so you stop doing phone math at vending machines.
>
> **The story:** Indie developer Greg Johns built Yen Sense for his own two-week Japan trip after
> finding every existing converter stuffed with ads, tracking, or subscriptions. By the second week of
> the trip, Practice mode had worked well enough that he stopped opening his own app — which he
> considers the point.
>
> **Features:**
> - Instant yen→USD conversion with a running shopping total (Don Quijote-proof)
> - Practice mode: a deck of real Japan prices — vending machines, konbini, train fares, ramen — that
>   quizzes your gut until you think in yen
> - Works offline: cached live rates or a manual pinned rate
> - Private by design: no accounts, no ads, no tracking, no data collected (App Store privacy label:
>   "Data Not Collected")
> - Home/Lock Screen rate widgets (Pro)
>
> **Pricing:** Free. Optional tip jar ($1.99 / $4.99 / $9.99) and a $3.99 one-time Yen Sense Pro
> unlock (full practice deck with history, extra home currencies, widgets). No subscription — it's a
> trip app.
>
> **Platform:** iOS (iPhone), built with SwiftUI and StoreKit 2. Free web version at
> https://yen-sense.vercel.app.
>
> **Links:**
> - App Store: https://apps.apple.com/us/app/yen-sense-yen-to-usd/id6773776110
> - Web app: https://yen-sense.vercel.app
> - Support: https://yen-sense.vercel.app/support
> - Privacy policy: https://yen-sense.vercel.app/privacy
>
> **Assets:** App icon (1024px), App Store screenshot set (Converter / Practice / Offline rate),
> promo codes available on request.
>
> **Contact:** Greg Johns — gj.tech@fastmail.com

---

## Appendix: source links used

- r/SideProject posting norms: https://www.mediafa.st/marketing-on-rsideproject , https://www.redditmaster.com/subreddit-rules/sideproject
- Reddit 10:1 self-promo norm discussion: https://news.ycombinator.com/item?id=25199030
- Tokyo Cheapo: https://tokyocheapo.com/contact/ ; Japan Cheapo: https://japancheapo.com/contact/
- japan-guide.com contact: https://www.japan-guide.com/e/e410.html
- Unseen Japan contact/submissions: https://unseen-japan.com/contact/ , https://unseen-japan.com/submissions/
- JapanTravel.com: https://en.japantravel.com/about/company
- Tokyo Weekender: https://www.tokyoweekender.com/contact-us/
- GaijinPot: https://gaijinpot.com/contact , https://gaijinpot.com/advertise/
- MATCHA: https://company.matcha-jp.com/en/
- The Real Japan: https://www.therealjapan.com/about/ (press@therealjapan.com)
- Abroad in Japan: https://www.abroadinjapan.com/partnerships
- Paolo fromTOKYO / Tokyo Zebra: https://www.tokyozebra.com/about
- Currently Hannah: https://www.currentlyhannah.com/
- Tokyo Lens: https://www.itstokyolens.com/contact
- Krewe of Japan: https://podcasts.apple.com/us/podcast/krewe-of-japan/id1549120168
- Japan Station / Japankyo: https://podcasts.apple.com/us/podcast/japan-station-a-podcast-about-japan-by-japankyo-com/id1440454968
- Letters from Japan: https://www.lettersfromjapan.com/ ; Japan Unravelled: https://japanunravelled.substack.com/
- Japan Experience: https://www.japan-experience.com/newsletter
