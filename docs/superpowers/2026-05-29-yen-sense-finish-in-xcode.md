# Yen Sense Pro — Finish-in-Xcode Checklist

The code (branch `yen-sense-monetization`, commit `3e044d3`) **compiles clean** but the runtime
pieces below need the Xcode GUI / App Store Connect / a device — an agent can't do them. Work
top to bottom; the app builds at every stage.

## 1. (Optional) Unit-test target
The plan's XCTest files live in `ios/YenSense/YenSenseTests/` but aren't wired to a target yet.
To run them: Xcode → File → New → Target → **Unit Testing Bundle** `YenSenseTests`, attached to
the YenSense app target. (They're already satisfied by the production code.) Never put an
`import XCTest` file inside `Models/`/`Services/`/`Views/` — it breaks the app build.

## 2. StoreKit config + scheme
- The file `ios/YenSense/YenSense/Yensense.storekit` exists (Pro $3.99 + 3 tips). Confirm its products.
- Edit the **YenSense scheme → Run → Options → StoreKit Configuration = Yensense.storekit**.
  Without this the simulator returns no products and the paywall/tip jar show only a spinner.

## 3. App Store Connect IAP + Small Business Program
Create 4 IAPs with matching IDs/prices/display names/review screenshots:
`com.gregjohns.yensense.pro` (Non-Consumable, $3.99); `…tip.coffee` $1.99, `…tip.bento` $4.99,
`…tip.feast` $9.99 (Consumables). Then enroll in the **Small Business Program** (15% commission).

## 4. App Group capability
Signing & Capabilities → **App Groups → `group.com.gregjohns.yensense`** on **both** the app
target and (after step 5) the widget target. Until this exists, `UserDefaults(suiteName:)` falls
back to `.standard`, so the app and widget won't share the rate snapshot (code still compiles/runs).

## 5. Create the Widget Extension target
Sources are generated in `ios/YenSense/YenSenseWidget/` but unwired (the app build ignores them).
- Xcode → File → New → Target → **Widget Extension**, name exactly `YenSenseWidget`,
  **uncheck** "Include Configuration App Intent" (static widget); Activate the scheme.
- Delete the two boilerplate files Xcode creates; add `YenSenseWidget.swift` and
  `YenSenseWidgetBundle.swift` to the **YenSenseWidget target only** (not the app). Keep exactly
  one `@main` (YenSenseWidgetBundle).
- Note: the widget re-declares `WidgetRateSnapshot`, a reader, and the `Color.ys*` palette because
  an extension can't see the app's internal types. Its `storageKey "yen-sense:widget-rate"` and
  `appGroupID "group.com.gregjohns.yensense"` must match `Services/SharedRateStore.swift`
  (or give `SharedRateStore.swift` + `Style.swift` widget target membership and delete the dupes).

## 6. Register the URL scheme (for the widget deep link)
App target → Info → URL Types → URL Schemes = **`yensense`**. `RootView` already handles
`yensense://paywall` via `.onOpenURL`.

## 7. Sandbox / device testing (the real verification)
On a device with a Sandbox Apple ID, confirm: buy a tip → "ありがとう — thank you!"; buy Pro →
`isPro` flips, sheet dismisses, full 13-amount Practice deck + History unlock; **Restore
Purchases** works; refund re-locks Pro; the **Home currency picker** switches the converter to
EUR/etc. The review prompt (after the 3rd Practice "Check") is StoreKit-rate-limited and won't show
reliably in Simulator. Add the widget: non-Pro shows the "Unlock Yen Sense Pro" placeholder;
after buying Pro and opening the app once, it shows the live rate.

## 8. Deploy + verify the endpoint
Deploy to Vercel, then `curl https://yen-sense.vercel.app/api/rates` and confirm
`{ base:"JPY", rates:{ USD,EUR,GBP,AUD,CAD,KRW,CNY,SGD,HKD,THB }, sourceDate, fetchedAt,
provider:"frankfurter" }` with all 10 symbols.

---

### Minor git note
Commit `23adc76` (baseline) carries the **final** `project.pbxproj`, which already registers the
monetization files added in `3e044d3`. So checking out `23adc76` *alone* would show missing-file
references in Xcode — harmless, since the branch HEAD (`3e044d3`) is complete and builds clean.
This was the trade for keeping the huge pbxproj diff out of the monetization review commit.
