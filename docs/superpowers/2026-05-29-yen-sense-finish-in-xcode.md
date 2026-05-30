# Yen Sense Pro — Submission Checklist

The branch `yen-sense-monetization` contains the native app, monetization layer, tests, StoreKit configuration, multi-currency endpoint, and widget target. This checklist reflects the current Xcode project state, not the earlier plan draft.

## Already Wired In The Repo

- `YenSenseTests` target exists and is included in the `YenSense` scheme.
- `Yensense.storekit` exists and is assigned in the scheme Run options.
- `YenSenseWidget` target exists, is embedded in the app, and builds with the app.
- `yensense://paywall` is registered in `YenSense/Info.plist`.
- App and widget entitlement files include `group.com.gregjohns.yensense`.
- `/api/rates` returns the JPY multi-currency map used by the native app.

## App Store Connect

Observed during the finishing pass:

- App Store Connect shows Yen Sense iOS 1.0 as `Waiting for Review`.
- App Privacy is published as `Data Not Collected` with privacy URL `https://yen-sense.vercel.app/privacy`.
- App Information currently shows name `Yen Sense` and subtitle `Pocket yen converter for Japan`; the ASO metadata in `ios/AppStoreMetadata.md` has not been applied in App Store Connect yet.
- The In-App Purchases list is empty. Apple shows the first IAP notice: the first in-app purchase must be created and selected on an app version before that version is submitted for review.
- Business shows the Paid Apps Agreement as `New`, so paid apps and in-app purchases are not ready for sale until the agreement is accepted.
- Digital Services Act compliance still needs setup for EU availability.

1. In App Store Connect, confirm the latest Paid Applications agreement is accepted.
2. Apply for or confirm Apple Small Business Program enrollment before the first sale.
3. Create these in-app purchases:
   - `com.gregjohns.yensense.pro`, Non-Consumable, $3.99, display name `Yen Sense Pro`
   - `com.gregjohns.yensense.tip.coffee`, Consumable, $1.99, display name `Coffee Tip`
   - `com.gregjohns.yensense.tip.bento`, Consumable, $4.99, display name `Bento Tip`
   - `com.gregjohns.yensense.tip.feast`, Consumable, $9.99, display name `Feast Tip`
4. Enter the final title, subtitle, keywords, description, privacy posture, and screenshot captions from `ios/AppStoreMetadata.md`.
5. Confirm the privacy label remains `Data Not Collected` and tracking remains `No`.
6. Because iOS 1.0 is already in review, remove it from review or prepare a follow-up version before attaching the first IAP for review.

## Apple Developer / Xcode Signing

1. Confirm App Group `group.com.gregjohns.yensense` exists in the Apple Developer portal.
2. Confirm the App Group capability is enabled for both bundle IDs:
   - `com.gregjohns.yensense`
   - `com.gregjohns.yensense.YenSenseWidget`
3. Open the app target and widget target in Xcode Signing & Capabilities and verify the App Group checkbox is selected for both.

## Simulator Checks

1. Build: `cd ios/YenSense && xcodebuild -scheme YenSense -destination 'platform=iOS Simulator,name=iPhone 17' build`
2. Test: `cd ios/YenSense && xcodebuild test -scheme YenSense -destination 'platform=iOS Simulator,name=iPhone 17'`
3. Run the app with the StoreKit config. Confirm products load, Pro purchase unlocks gates, tips can be purchased, and Restore Purchases calls StoreKit successfully.
4. Add the widget in Simulator. Without Pro it shows the unlock placeholder; after Pro and opening the app once, it shows the live rate snapshot.

## Device Sandbox Script

1. Install on a physical device signed with the same App Group provisioning.
2. Sign out of Media & Purchases and sign in with a Sandbox Apple ID when prompted.
3. Buy Pro. Confirm:
   - Paywall dismisses.
   - Practice uses all 13 amounts.
   - Practice History opens.
   - Home currency picker unlocks EUR/GBP/AUD/CAD/KRW/CNY/SGD/HKD/THB.
   - Widget shows the live rate after opening the app once.
4. Fresh install or delete/reinstall, then Restore Purchases. Confirm Pro re-unlocks.
5. Buy each tip and confirm the thank-you state appears.
6. Use App Store Connect sandbox/refund tools to revoke/refund Pro. Confirm `Transaction.updates` eventually re-locks Pro.

## Vercel / API

1. Deploy the branch to Vercel.
2. Verify:
   - `curl https://yen-sense.vercel.app/api/rates/jpy-usd`
   - `curl https://yen-sense.vercel.app/api/rates`
3. `/api/rates` should return `{ base:"JPY", rates:{ USD,EUR,GBP,AUD,CAD,KRW,CNY,SGD,HKD,THB }, sourceDate, fetchedAt, provider:"frankfurter" }`.
4. Confirm the Vercel Cron job hits `/api/cron/refresh-rate` daily after deployment.

## Outreach Timing

Schedule the autumn launch push for July-August 2026: App Store featuring nomination, Japan travel roundup outreach, r/JapanTravel value-first posts, and short Practice quiz videos.
