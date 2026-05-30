# Yen Sense Monetization — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Monetize the native iOS app Yen Sense with a free core, a tip jar, and a single $3.99 one-time "Pro" unlock (Practice depth + history, multi-currency, widget) — without ads or subscriptions — plus the ASO/App Store work to actually get downloaded.

**Architecture:** Native SwiftUI + StoreKit 2 (no third-party IAP SDK). One `StoreManager` (`ObservableObject`, injected like `RateStore`/`QuizStore`) owns entitlement state; a small `isPro` flag gates Pro features behind a `PaywallView`. Multi-currency keeps the app yen-first (base = JPY) with a selectable quote/home currency, fed by extending the existing Frankfurter-backed Vercel endpoint. A WidgetKit extension shares the cached rate via an App Group.

**Tech Stack:** Swift 5.9+/SwiftUI, StoreKit 2 (iOS 15+), WidgetKit, XCTest, Next.js 16 route handler (Frankfurter API), Vercel.

**Source spec:** `docs/superpowers/specs/2026-05-29-yen-sense-monetization-design.md`

---

## Conventions & Pre-Flight

**Repo paths:**
- iOS project root: `ios/YenSense/YenSense.xcodeproj`
- iOS sources: `ios/YenSense/YenSense/` (`Views/`, `Services/`, `Models/`)
- Server: `app/api/rates/` (Next.js route handlers)
- Existing patterns to mirror: stores are `@MainActor final class … ObservableObject` injected as `@StateObject` in `RootView` (see `Services/RateStore.swift`, `Services/QuizStore.swift`); styling via `Views/Style.swift` (`Color.ys*`, `panelCard()`, `YenButtonStyle`).

**How to build/verify iOS (no CI exists; run locally on macOS):**
- Build: `cd ios/YenSense && xcodebuild -scheme YenSense -destination 'platform=iOS Simulator,name=iPhone 16' build`
- Unit tests (after Task 1 creates the target): `cd ios/YenSense && xcodebuild test -scheme YenSense -destination 'platform=iOS Simulator,name=iPhone 16'`
- IAP behavior is verified with the **StoreKit configuration file** (Task 3) in the simulator, then **sandbox** on a device before submission. There is no way to unit-test a real purchase; logic around entitlements IS unit-tested by injecting state.

**Commit discipline:** one commit per task (or per green test). Work on branch `yen-sense-monetization` (already created). Prefix commits `feat:`/`test:`/`docs:`/`chore:`.

**Milestone shippability:**
- **M0** (App Store Connect / ASO) — no code; do anytime, ideally first.
- **M1** (StoreKit foundation + tip jar + paywall shell) — shippable alone as "free app + tip jar."
- **M2** (Practice Pro), **M3** (multi-currency), **M4** (widget) — each a clean add-on gated by `isPro`.
- **M5** (launch polish) — last.

---

## Milestone M0 — App Store Connect & ASO (no code)

### Task 0.1: Enroll in the Small Business Program & set product metadata

**Files:** none (App Store Connect web UI). Update `ios/AppStoreMetadata.md` to record final values.

- [ ] **Step 1: Enroll in the Apple Small Business Program**
  - In App Store Connect → Agreements: accept the latest Paid Applications agreement.
  - Apply to the App Store Small Business Program. (15% commission; effective ~15 days after the fiscal month of approval — do this before any sales.)

- [ ] **Step 2: Update App Store listing metadata** (in App Store Connect, and mirror into `ios/AppStoreMetadata.md`):
  - Name: `Yen Sense: Yen to USD`
  - Subtitle: `Japan Travel Currency Converter`
  - Keywords (deduped, no spaces, no words already in name/subtitle): `dollar,exchange,rate,calculator,shopping,trip,money,tokyo,offline,jpy`
  - Promotional text: lead with the Practice trainer + "add up your shopping" + "no ads, no tracking, works offline."

- [ ] **Step 3: Add keyword-rich screenshot captions** to the images in `ios/AppStoreScreenshots/` (Apple OCRs them): "Yen to USD instantly", "Add up your shopping", "Works offline", "Learn to think in yen". Re-export.

- [ ] **Step 4: Commit the metadata record**
```bash
git add ios/AppStoreMetadata.md
git commit -m "docs: finalize App Store listing metadata for ASO"
```

---

## Milestone M1 — StoreKit 2 foundation, tip jar, paywall shell

### Task 1.1: Create a unit-test target

**Files:**
- Create: `ios/YenSense/YenSenseTests/YenSenseTests.swift`
- Modify: `ios/YenSense/YenSense.xcodeproj/project.pbxproj` (Xcode adds the target)

- [ ] **Step 1:** In Xcode, File → New → Target → **Unit Testing Bundle** named `YenSenseTests`, attached to the `YenSense` app target. Ensure `@testable import YenSense` resolves (app target must build for testing).

- [ ] **Step 2: Add one trivial passing test** to confirm the target runs:
```swift
import XCTest
@testable import YenSense

final class YenSenseTests: XCTestCase {
    func testHarnessRuns() {
        XCTAssertEqual(1 + 1, 2)
    }
}
```

- [ ] **Step 3: Run tests, verify pass**
Run: `cd ios/YenSense && xcodebuild test -scheme YenSense -destination 'platform=iOS Simulator,name=iPhone 16'`
Expected: `testHarnessRuns` PASSES.

- [ ] **Step 4: Commit**
```bash
git add ios/YenSense
git commit -m "test: add YenSenseTests unit-test target"
```

### Task 1.2: Define product identifiers & a pure entitlement model (TDD)

**Files:**
- Create: `ios/YenSense/YenSense/Services/StoreProducts.swift`
- Test: `ios/YenSense/YenSenseTests/StoreProductsTests.swift`

- [ ] **Step 1: Write the failing test**
```swift
import XCTest
@testable import YenSense

final class StoreProductsTests: XCTestCase {
    func testProIDIsStable() {
        XCTAssertEqual(StoreProducts.proID, "com.gregjohns.yensense.pro")
    }
    func testTipIDsAreOrderedLowToHigh() {
        XCTAssertEqual(StoreProducts.tipIDs, [
            "com.gregjohns.yensense.tip.coffee",
            "com.gregjohns.yensense.tip.bento",
            "com.gregjohns.yensense.tip.feast",
        ])
    }
    func testEntitlementFromIDs() {
        XCTAssertTrue(StoreProducts.isProEntitled(from: ["com.gregjohns.yensense.pro"]))
        XCTAssertFalse(StoreProducts.isProEntitled(from: ["com.gregjohns.yensense.tip.coffee"]))
        XCTAssertFalse(StoreProducts.isProEntitled(from: []))
    }
}
```

- [ ] **Step 2: Run, verify it fails** (type `StoreProducts` not found).

- [ ] **Step 3: Implement**
```swift
import Foundation

enum StoreProducts {
    static let proID = "com.gregjohns.yensense.pro"
    static let tipIDs = [
        "com.gregjohns.yensense.tip.coffee",
        "com.gregjohns.yensense.tip.bento",
        "com.gregjohns.yensense.tip.feast",
    ]
    static let all: [String] = [proID] + tipIDs

    /// Pure helper so entitlement logic is unit-testable without StoreKit.
    static func isProEntitled(from entitledProductIDs: some Sequence<String>) -> Bool {
        entitledProductIDs.contains(proID)
    }
}
```

- [ ] **Step 4: Run tests, verify pass.**

- [ ] **Step 5: Commit**
```bash
git add ios/YenSense
git commit -m "feat: add StoreProducts identifiers and entitlement helper"
```

### Task 1.3: Implement `StoreManager` (StoreKit 2)

**Files:**
- Create: `ios/YenSense/YenSense/Services/StoreManager.swift`

> No unit test for the live StoreKit calls (they require the StoreKit test host); the *logic* (`isProEntitled`) is already tested in 1.2. Behavior is verified via the StoreKit config file in Task 1.4.

- [ ] **Step 1: Implement the manager**
```swift
import Foundation
import StoreKit

@MainActor
final class StoreManager: ObservableObject {
    @Published private(set) var products: [Product] = []
    @Published private(set) var isPro: Bool = false
    @Published private(set) var isLoading = false
    @Published var purchaseError: String?

    private var updatesTask: Task<Void, Never>?

    init() {
        updatesTask = listenForTransactions()
        Task { await refresh() }
    }

    deinit { updatesTask?.cancel() }

    var proProduct: Product? { products.first { $0.id == StoreProducts.proID } }
    var tipProducts: [Product] {
        StoreProducts.tipIDs.compactMap { id in products.first { $0.id == id } }
    }

    func refresh() async {
        await loadProducts()
        await updateEntitlements()
    }

    func loadProducts() async {
        isLoading = true
        defer { isLoading = false }
        do {
            products = try await Product.products(for: StoreProducts.all)
        } catch {
            purchaseError = "Couldn't load the store. Check your connection."
        }
    }

    func purchase(_ product: Product) async {
        do {
            let result = try await product.purchase()
            switch result {
            case .success(let verification):
                _ = try checkVerified(verification)
                await updateEntitlements()
                await transactionFinish(verification)
            case .userCancelled, .pending:
                break
            @unknown default:
                break
            }
        } catch {
            purchaseError = "Purchase didn't complete. You weren't charged."
        }
    }

    func restore() async {
        do {
            try await AppStore.sync()
            await updateEntitlements()
        } catch {
            purchaseError = "Couldn't restore purchases."
        }
    }

    private func updateEntitlements() async {
        var entitled: Set<String> = []
        for await result in Transaction.currentEntitlements {
            if let transaction = try? checkVerified(result) {
                entitled.insert(transaction.productID)
            }
        }
        isPro = StoreProducts.isProEntitled(from: entitled)
    }

    private func listenForTransactions() -> Task<Void, Never> {
        Task(priority: .background) { [weak self] in
            for await update in Transaction.updates {
                guard let self else { continue }
                if let transaction = try? await self.checkVerified(update) {
                    await transaction.finish()
                    await self.updateEntitlements()
                }
            }
        }
    }

    private func transactionFinish(_ verification: VerificationResult<Transaction>) async {
        if let transaction = try? checkVerified(verification) {
            await transaction.finish()
        }
    }

    private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .verified(let safe): return safe
        case .unverified: throw StoreError.failedVerification
        }
    }

    enum StoreError: Error { case failedVerification }
}
```

- [ ] **Step 2: Build, verify it compiles**
Run: `cd ios/YenSense && xcodebuild -scheme YenSense -destination 'platform=iOS Simulator,name=iPhone 16' build`
Expected: BUILD SUCCEEDED.

- [ ] **Step 3: Commit**
```bash
git add ios/YenSense
git commit -m "feat: add StoreManager (StoreKit 2 products, purchase, restore, entitlements)"
```

### Task 1.4: Add StoreKit configuration file & App Store Connect products

**Files:**
- Create: `ios/YenSense/YenSense/Yensense.storekit` (Xcode StoreKit config)

- [ ] **Step 1:** In Xcode, File → New → File → **StoreKit Configuration File** (`Yensense.storekit`). Add:
  - Non-Consumable: `com.gregjohns.yensense.pro`, "Yen Sense Pro", $3.99
  - Consumable: `…tip.coffee` $1.99, `…tip.bento` $4.99, `…tip.feast` $9.99

- [ ] **Step 2:** Edit the `YenSense` scheme → Run → Options → **StoreKit Configuration** = `Yensense.storekit` (so the simulator serves these products).

- [ ] **Step 3:** In **App Store Connect**, create the same 4 in-app purchases with matching product IDs, prices, display names, and review screenshots. (Non-consumable for Pro; consumables for tips.)

- [ ] **Step 4: Commit**
```bash
git add ios/YenSense
git commit -m "chore: add StoreKit configuration for local IAP testing"
```

### Task 1.5: Inject `StoreManager` and build `PaywallView` + `TipJarView`

**Files:**
- Create: `ios/YenSense/YenSense/Views/PaywallView.swift`
- Create: `ios/YenSense/YenSense/Views/TipJarView.swift`
- Modify: `ios/YenSense/YenSense/Views/RootView.swift`

- [ ] **Step 1: Inject the manager + add paywall/tip sheet destinations in `RootView.swift`**
```swift
struct RootView: View {
    @StateObject private var rateStore = RateStore()
    @StateObject private var quizStore = QuizStore()
    @StateObject private var store = StoreManager()
    @State private var sheetDestination: SheetDestination?

    var body: some View {
        ConverterView(rateStore: rateStore, sheetDestination: $sheetDestination)
            .environmentObject(store)
            .sheet(item: $sheetDestination) { destination in
                NavigationStack {
                    switch destination {
                    case .practice:
                        PracticeView(quizStore: quizStore, yenPerUnit: rateStore.effectiveRate.yenPerUnit)
                            .environmentObject(store)
                    case .rate:
                        RateSettingsView(rateStore: rateStore).environmentObject(store)
                    case .paywall:
                        PaywallView()
                    case .tips:
                        TipJarView()
                    }
                }
                .presentationDetents([.medium, .large])
            }
            .task { await rateStore.refreshIfStale() }
    }
}
```
And extend `SheetDestination`:
```swift
enum SheetDestination: String, Identifiable {
    case practice, rate, paywall, tips
    var id: String { rawValue }
}
```
> Note: `yenPerUnit` replaces `yenPerUSD` here in anticipation of M3. If implementing M1 before M3, temporarily keep `yenPerUSD`/`effectiveRate.yenPerUSD` and rename in M3 Task 3.3. Pick one and stay consistent.

- [ ] **Step 2: Implement `PaywallView`** (leads with Practice + multi-currency; required **Restore** button):
```swift
import SwiftUI
import StoreKit

struct PaywallView: View {
    @EnvironmentObject private var store: StoreManager
    @Environment(\.dismiss) private var dismiss

    private let features = [
        ("brain.head.profile", "Full Practice deck", "Master every price tier, with long-term progress & insights."),
        ("globe", "Your home currency", "Convert yen to EUR, GBP, AUD, KRW and more — not just USD."),
        ("rectangle.3.group", "Home Screen widget", "The live rate, one glance away."),
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                Text("Yen Sense Pro")
                    .font(.system(size: 34, weight: .heavy, design: .serif))
                    .foregroundStyle(Color.ysInk)
                Text("One purchase. Yours forever — including features we add later.")
                    .font(.callout).foregroundStyle(Color.ysMutedInk)

                ForEach(features, id: \.0) { icon, title, body in
                    HStack(alignment: .top, spacing: 12) {
                        Image(systemName: icon).foregroundStyle(Color.ysAccent).frame(width: 28)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(title).font(.headline).foregroundStyle(Color.ysInk)
                            Text(body).font(.subheadline).foregroundStyle(Color.ysMutedInk)
                        }
                    }.panelCard()
                }

                if let pro = store.proProduct {
                    Button { Task { await store.purchase(pro); if store.isPro { dismiss() } } }
                        label: { Label("Unlock for \(pro.displayPrice)", systemImage: "checkmark") }
                        .buttonStyle(YenButtonStyle(prominent: true))
                } else {
                    ProgressView()
                }

                Button("Restore Purchases") { Task { await store.restore(); if store.isPro { dismiss() } } }
                    .font(.subheadline).foregroundStyle(Color.ysMutedInk)
                    .frame(maxWidth: .infinity)
            }
            .padding(18)
        }
        .background(Color.ysPaper)
        .alert("Store", isPresented: .constant(store.purchaseError != nil)) {
            Button("OK") { store.purchaseError = nil }
        } message: { Text(store.purchaseError ?? "") }
    }
}
```

- [ ] **Step 3: Implement `TipJarView`** (three consumables; thank-you on success):
```swift
import SwiftUI
import StoreKit

struct TipJarView: View {
    @EnvironmentObject private var store: StoreManager
    @State private var thanked = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                Text("Support the maker")
                    .font(.system(size: 28, weight: .heavy, design: .serif))
                    .foregroundStyle(Color.ysInk)
                Text("Yen Sense is free with no ads or tracking. Tips keep it that way.")
                    .font(.callout).foregroundStyle(Color.ysMutedInk)

                ForEach(store.tipProducts, id: \.id) { tip in
                    Button { Task { await store.purchase(tip); thanked = true } } label: {
                        HStack { Text(tip.displayName); Spacer(); Text(tip.displayPrice) }
                    }.buttonStyle(YenButtonStyle())
                }

                if thanked {
                    Text("ありがとう — thank you!").font(.headline).foregroundStyle(Color.ysAccent)
                }
            }.padding(18)
        }.background(Color.ysPaper)
    }
}
```

- [ ] **Step 4: Add entry points** — a "Support the maker" row in `RateSettingsView` opening `.tips`. (Pass a binding or use a callback; simplest: give `RateSettingsView` an `onOpenTips` closure or read `sheetDestination`. Add a `@State` and a button that sets the destination via an injected closure.)

- [ ] **Step 5: Build & verify in simulator with the StoreKit config**
Run the app in the simulator; open Rate → "Support the maker" → buy a tip → confirm the thank-you appears. Open the paywall, buy Pro, confirm `store.isPro` flips (add a temporary debug label if needed).
Expected: purchases complete against the local StoreKit config; Restore works.

- [ ] **Step 6: Commit**
```bash
git add ios/YenSense
git commit -m "feat: add paywall + tip jar UI and inject StoreManager"
```

---

## Milestone M2 — Practice Pro (tiering + history)

### Task 2.1: Add `tier` to `QuizAmount` (TDD)

**Files:**
- Modify: `ios/YenSense/YenSense/Models/QuizAmount.swift`
- Test: `ios/YenSense/YenSenseTests/QuizAmountTests.swift`

- [ ] **Step 1: Write the failing test**
```swift
import XCTest
@testable import YenSense

final class QuizAmountTests: XCTestCase {
    func testEverydayTierIsTheSixSmallAmounts() {
        let everyday = QuizAmount.all.filter { $0.tier == .everyday }.map(\.id)
        XCTAssertEqual(everyday, ["drink-140","snack-380","coffee-520","train-880","lunch-1200","ramen-1800"])
    }
    func testFreeDeckIsEverydayOnly() {
        XCTAssertEqual(QuizAmount.deck(isPro: false).count, 6)
        XCTAssertEqual(QuizAmount.deck(isPro: true).count, QuizAmount.all.count)
    }
}
```

- [ ] **Step 2: Run, verify it fails.**

- [ ] **Step 3: Implement** — add a `Tier` enum, tag each amount, add `deck(isPro:)`:
```swift
struct QuizAmount: Codable, Hashable, Identifiable {
    enum Tier: String, Codable { case everyday, full }
    var id: String
    var yen: Int
    var label: String
    var tier: Tier

    static let all: [QuizAmount] = [
        QuizAmount(id: "drink-140", yen: 140, label: "vending machine drink", tier: .everyday),
        QuizAmount(id: "snack-380", yen: 380, label: "konbini snack", tier: .everyday),
        QuizAmount(id: "coffee-520", yen: 520, label: "coffee stop", tier: .everyday),
        QuizAmount(id: "train-880", yen: 880, label: "city train ride", tier: .everyday),
        QuizAmount(id: "lunch-1200", yen: 1_200, label: "quick lunch", tier: .everyday),
        QuizAmount(id: "ramen-1800", yen: 1_800, label: "ramen plus side", tier: .everyday),
        QuizAmount(id: "market-3200", yen: 3_200, label: "market run", tier: .full),
        QuizAmount(id: "taxi-4800", yen: 4_800, label: "short taxi", tier: .full),
        QuizAmount(id: "dinner-7600", yen: 7_600, label: "casual dinner", tier: .full),
        QuizAmount(id: "shopping-12000", yen: 12_000, label: "shopping stop", tier: .full),
        QuizAmount(id: "activity-18000", yen: 18_000, label: "family activity", tier: .full),
        QuizAmount(id: "hotel-28000", yen: 28_000, label: "hotel night", tier: .full),
        QuizAmount(id: "splurge-45000", yen: 45_000, label: "trip splurge", tier: .full),
    ]

    static func deck(isPro: Bool) -> [QuizAmount] {
        isPro ? all : all.filter { $0.tier == .everyday }
    }
}
```

- [ ] **Step 4: Run tests, verify pass.**

- [ ] **Step 5: Commit**
```bash
git add ios/YenSense
git commit -m "feat: tier QuizAmount into free everyday and Pro full decks"
```

### Task 2.2: Make `QuizStore` deck-aware (TDD)

**Files:**
- Modify: `ios/YenSense/YenSense/Services/QuizStore.swift`
- Test: `ios/YenSense/YenSenseTests/QuizStoreDeckTests.swift`

- [ ] **Step 1: Write the failing test** — a non-Pro store only ever surfaces everyday amounts:
```swift
import XCTest
@testable import YenSense

@MainActor
final class QuizStoreDeckTests: XCTestCase {
    func testFreeStoreNeverPicksFullTierAmount() {
        let store = QuizStore(defaults: UserDefaults(suiteName: "test-\(UUID())")!)
        store.setPro(false)
        let everydayIDs = Set(QuizAmount.deck(isPro: false).map(\.id))
        for _ in 0..<50 {
            XCTAssertTrue(everydayIDs.contains(store.currentAmount.id))
            store.nextQuestion(excluding: store.currentAmount.id)
        }
    }
}
```

- [ ] **Step 2: Run, verify it fails** (`setPro` undefined).

- [ ] **Step 3: Implement** — add `private(set) var isPro` and `setPro(_:)`, and replace `QuizAmount.all` references inside `selectAmount`/`summary` with `QuizAmount.deck(isPro:)`:
```swift
@Published private(set) var isPro = false

func setPro(_ value: Bool) {
    guard value != isPro else { return }
    isPro = value
    currentAmount = Self.selectAmount(from: progress, deck: QuizAmount.deck(isPro: isPro))
}
```
Change `summary` to iterate `QuizAmount.deck(isPro: isPro)`, and `selectAmount` to take a `deck: [QuizAmount]` parameter (replace the two `QuizAmount.all` uses). Update `init` and `nextQuestion`/`reset` call sites to pass `QuizAmount.deck(isPro: isPro)`.

- [ ] **Step 4: Run tests, verify pass.**

- [ ] **Step 5: Sync `isPro` from `StoreManager`** in `RootView` (so the store reflects entitlement):
```swift
.onChange(of: store.isPro) { _, pro in quizStore.setPro(pro) }
.task { quizStore.setPro(store.isPro) }
```

- [ ] **Step 6: Commit**
```bash
git add ios/YenSense
git commit -m "feat: gate QuizStore deck by Pro entitlement"
```

### Task 2.3: Practice UI — locked full-tier prompt + history entry

**Files:**
- Modify: `ios/YenSense/YenSense/Views/PracticeView.swift`
- Create: `ios/YenSense/YenSense/Views/PracticeHistoryView.swift`

- [ ] **Step 1:** In `PracticeView`, read `@EnvironmentObject var store: StoreManager`. Below the trainer, when `!store.isPro`, show a `panelCard()` CTA: "Unlock the full deck + progress history" → button opens the paywall (via an injected `onUnlock` closure or a `sheetDestination` binding). Add a "History" toolbar button that is enabled only when `store.isPro`, else taps to the paywall.

- [ ] **Step 2: Implement `PracticeHistoryView`** — list `QuizAmount.all` with each amount's `QuizStats` (box level, streak, last error %) from a `QuizStore` accessor. Add a read accessor to `QuizStore`:
```swift
func stats(for id: String) -> QuizStats { progress[id] ?? .empty }
```
Render a simple `List`/`VStack` of rows (label, "Box N", "best streak N", "±X.X%"). Keep styling consistent with `panelCard()`.

- [ ] **Step 3: Build & verify in simulator** — as free: only 6 amounts cycle, the unlock CTA shows, History routes to paywall. Buy Pro via StoreKit config → all 13 amounts cycle, History opens.

- [ ] **Step 4: Commit**
```bash
git add ios/YenSense
git commit -m "feat: Practice Pro gating UI + progress history view"
```

---

## Milestone M3 — Multi-currency (server + iOS)

### Task 3.1: Extend the rate endpoint to multi-currency

**Files:**
- Create: `app/api/rates/route.ts`
- Modify: `app/api/cron/refresh-rate/route.ts`

- [ ] **Step 1: Implement the multi-symbol endpoint** (mirror the existing `jpy-usd` route's caching; Frankfurter supports `base`+`symbols`):
```ts
const RATE_REVALIDATE_SECONDS = 12 * 60 * 60;
const SYMBOLS = ["USD","EUR","GBP","AUD","CAD","KRW","CNY","SGD","HKD","THB"];
const URL = `https://api.frankfurter.dev/v1/latest?base=JPY&symbols=${SYMBOLS.join(",")}`;

export const dynamic = "force-static";
export const revalidate = 43_200;

export async function GET() {
  const response = await fetch(URL, { next: { revalidate: RATE_REVALIDATE_SECONDS } });
  if (!response.ok) {
    return Response.json({ error: "Rate request failed." }, { status: 502 });
  }
  const data = (await response.json()) as { date?: string; rates?: Record<string, number> };
  if (!data.rates || typeof data.rates.USD !== "number") {
    return Response.json({ error: "Rate response was missing rates." }, { status: 502 });
  }
  return Response.json({
    base: "JPY",
    rates: data.rates,        // units of quote currency per 1 JPY, e.g. { USD: 0.0066, EUR: 0.0061 }
    sourceDate: data.date ?? null,
    fetchedAt: Date.now(),
    provider: "frankfurter",
  });
}
```
> Confirm the exact Frankfurter v1 path/param names against current docs during implementation (the existing route uses `frankfurter.dev/v2/rate/...`; v1 `latest?base=&symbols=` is the multi-symbol form). Adjust if the API shape differs.

- [ ] **Step 2: Warm the new endpoint in cron** — in `app/api/cron/refresh-rate/route.ts`, also `fetch` `/api/rates` alongside `/api/rates/jpy-usd`.

- [ ] **Step 3: Verify locally** — `bun run dev`, then open `http://localhost:3000/api/rates` and confirm a JSON `rates` map with all 10 symbols.

- [ ] **Step 4: Commit**
```bash
git add app/api
git commit -m "feat: add multi-currency JPY rates endpoint"
```

### Task 3.2: Generalize the iOS currency model (TDD)

**Files:**
- Modify: `ios/YenSense/YenSense/Models/CurrencyRate.swift`
- Create: `ios/YenSense/YenSense/Models/SupportedCurrency.swift`
- Test: `ios/YenSense/YenSenseTests/CurrencyModelTests.swift`

- [ ] **Step 1: Write the failing test**
```swift
import XCTest
@testable import YenSense

final class CurrencyModelTests: XCTestCase {
    func testEffectiveRateUsesSelectedQuote() {
        let stored = StoredRate(unitsPerYen: ["USD": 0.0066, "EUR": 0.0060],
                                selectedQuote: "EUR", manualYenPerUnit: nil,
                                sourceDate: nil, fetchedAt: nil)
        let eff = CurrencyMath.effectiveRate(from: stored)
        XCTAssertEqual(eff.quote.code, "EUR")
        XCTAssertEqual(eff.yenPerUnit, 1/0.0060, accuracy: 0.01)   // ~166.7 yen per EUR
    }
    func testManualOverrideWins() {
        let stored = StoredRate(unitsPerYen: ["USD": 0.0066], selectedQuote: "USD",
                                manualYenPerUnit: 152, sourceDate: nil, fetchedAt: nil)
        XCTAssertEqual(CurrencyMath.effectiveRate(from: stored).yenPerUnit, 152, accuracy: 0.01)
    }
    func testFallbackWhenNoRate() {
        let stored = StoredRate.empty
        XCTAssertEqual(CurrencyMath.effectiveRate(from: stored).yenPerUnit,
                       CurrencyMath.fallbackYenPerUnit(for: "USD"), accuracy: 0.01)
    }
}
```

- [ ] **Step 2: Run, verify it fails.**

- [ ] **Step 3: Implement `SupportedCurrency`**
```swift
import Foundation

struct SupportedCurrency: Identifiable, Hashable {
    let code: String
    let symbol: String
    let name: String
    let isFree: Bool
    var id: String { code }

    static let usd = SupportedCurrency(code: "USD", symbol: "$", name: "US Dollar", isFree: true)
    static let all: [SupportedCurrency] = [
        usd,
        .init(code: "EUR", symbol: "€", name: "Euro", isFree: false),
        .init(code: "GBP", symbol: "£", name: "British Pound", isFree: false),
        .init(code: "AUD", symbol: "A$", name: "Australian Dollar", isFree: false),
        .init(code: "CAD", symbol: "C$", name: "Canadian Dollar", isFree: false),
        .init(code: "KRW", symbol: "₩", name: "Korean Won", isFree: false),
        .init(code: "CNY", symbol: "¥", name: "Chinese Yuan", isFree: false),
        .init(code: "SGD", symbol: "S$", name: "Singapore Dollar", isFree: false),
        .init(code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", isFree: false),
        .init(code: "THB", symbol: "฿", name: "Thai Baht", isFree: false),
    ]
    static func find(_ code: String) -> SupportedCurrency { all.first { $0.code == code } ?? usd }
}
```

- [ ] **Step 4: Rewrite `StoredRate`/`EffectiveRate`/`CurrencyMath`** in `CurrencyRate.swift`:
```swift
struct StoredRate: Codable, Equatable {
    var unitsPerYen: [String: Double]   // quote per 1 JPY
    var selectedQuote: String
    var manualYenPerUnit: Double?       // applies to selectedQuote
    var sourceDate: String?
    var fetchedAt: Date?

    static let empty = StoredRate(unitsPerYen: [:], selectedQuote: "USD",
                                  manualYenPerUnit: nil, sourceDate: nil, fetchedAt: nil)
}

struct EffectiveRate {
    var quote: SupportedCurrency
    var yenPerUnit: Double
    var unitPerYen: Double
    var sourceDate: String?
    var fetchedAt: Date?
    var isManual: Bool
    var isFallback: Bool
}

enum CurrencyMath {
    static let digitLimit = 9
    static let maxYenAmount = 999_999_999

    // Rough offline fallbacks (yen per 1 unit) for the launch currencies.
    private static let fallbackYenPerUnitTable: [String: Double] = [
        "USD": 150, "EUR": 165, "GBP": 190, "AUD": 100, "CAD": 110,
        "KRW": 0.11, "CNY": 21, "SGD": 112, "HKD": 19, "THB": 4.3,
    ]
    static func fallbackYenPerUnit(for code: String) -> Double { fallbackYenPerUnitTable[code] ?? 150 }
    static let fallbackYenPerUSD = 150.0  // kept for any legacy reference; prefer fallbackYenPerUnit

    static func effectiveRate(from stored: StoredRate) -> EffectiveRate {
        let quote = SupportedCurrency.find(stored.selectedQuote)
        let liveUnit = stored.unitsPerYen[quote.code]
        let yenPerUnit: Double
        let isManual = (stored.manualYenPerUnit ?? 0) > 0
        let isFallback: Bool
        if let manual = stored.manualYenPerUnit, manual > 0 {
            yenPerUnit = manual; isFallback = false
        } else if let unit = liveUnit, unit > 0 {
            yenPerUnit = 1 / unit; isFallback = false
        } else {
            yenPerUnit = fallbackYenPerUnit(for: quote.code); isFallback = true
        }
        return EffectiveRate(quote: quote, yenPerUnit: yenPerUnit, unitPerYen: 1 / yenPerUnit,
                             sourceDate: stored.sourceDate, fetchedAt: stored.fetchedAt,
                             isManual: isManual, isFallback: isFallback)
    }

    static func convertYen(_ yen: Int, yenPerUnit: Double) -> Double { Double(yen) / yenPerUnit }
    // keep parseYenInput / parseUSDInput as-is (rename parseUSDInput → parseDecimalInput optionally)
}
```
Update `CurrencyText.usd(...)`/`usdCompact(...)` to take a currency code (`func amount(_ value: Double, code: String)`) using `NumberFormatter.currencyCode = code`. Keep a thin `usd` wrapper if convenient.

- [ ] **Step 5: Run tests, verify pass.**

- [ ] **Step 6: Commit**
```bash
git add ios/YenSense
git commit -m "feat: generalize currency model to selectable home currency"
```

### Task 3.3: Wire the model through `RateStore`, service, and views

**Files:**
- Modify: `ios/YenSense/YenSense/Services/ExchangeRateService.swift`, `Services/RateStore.swift`, `Views/ConverterView.swift`, `Views/RateSettingsView.swift`, `Views/PracticeView.swift`

- [ ] **Step 1: Update `ExchangeRateService`** to GET `https://yen-sense.vercel.app/api/rates` and decode `{ base, rates: [String:Double], sourceDate, fetchedAt }`. Keep a typed `MultiRateResponse`.

- [ ] **Step 2: Update `RateStore`** — store `unitsPerYen` map; `effectiveRate` already derives from `selectedQuote`. Add:
```swift
func setSelectedQuote(_ code: String) {
    var next = storedRate; next.selectedQuote = code; next.manualYenPerUnit = nil
    storedRate = next; writeStoredRate(next)
}
```
`setManualRate` now sets `manualYenPerUnit`. `resetToFallback` sets `unitsPerYen = [:]`, keeps `selectedQuote`.

- [ ] **Step 3: De-hardcode USD in the views** — replace `effectiveRate.yenPerUSD`→`yenPerUnit`, `"JPY to USD"`→`"JPY to \(effectiveRate.quote.code)"`, `"$"`/`CurrencyText.usd`→ currency-aware formatting and `effectiveRate.quote.symbol`, `"per $1"`→`"per \(quote.symbol)1"`. In `PracticeView` the USD estimate field label/symbol become quote-aware (`yenPerUnit` already passed from `RootView`).

- [ ] **Step 4: Add the currency picker (Pro-gated)** in `RateSettingsView` — a row "Home currency: USD" that, when `store.isPro`, opens a picker over `SupportedCurrency.all`; when `!store.isPro`, opens the paywall. Calls `rateStore.setSelectedQuote(code)`.

- [ ] **Step 5: Build & verify** — free user sees USD only; after Pro unlock, switching to EUR re-labels the converter and recomputes from the live EUR rate.

- [ ] **Step 6: Commit**
```bash
git add ios/YenSense app/api
git commit -m "feat: multi-currency wiring + Pro-gated home currency picker"
```

---

## Milestone M4 — Home/Lock Screen widget

### Task 4.1: App Group + shared rate snapshot

**Files:**
- Create: `ios/YenSense/YenSense/Services/SharedRateStore.swift`
- Modify: `Services/RateStore.swift`; enable **App Group** `group.com.gregjohns.yensense` on the app target (Signing & Capabilities).

- [ ] **Step 1:** Add the App Group capability to the app target. Implement a tiny shared writer/reader using `UserDefaults(suiteName: "group.com.gregjohns.yensense")` that stores a `WidgetRateSnapshot` (`quoteCode`, `yenPerUnit`, `fetchedAt`).

- [ ] **Step 2:** In `RateStore`, after a successful refresh / quote change, write the current `EffectiveRate` to `SharedRateStore`. Verify it persists (read it back in a quick simulator run).

- [ ] **Step 3: Commit**
```bash
git add ios/YenSense
git commit -m "feat: share rate snapshot with App Group for the widget"
```

### Task 4.2: Widget extension

**Files:**
- Create widget target: `ios/YenSense/YenSenseWidget/` (`YenSenseWidget.swift`, `Provider`, `Entry`, views)

- [ ] **Step 1:** File → New → Target → **Widget Extension** (`YenSenseWidget`), add it to the App Group. Implement a `TimelineProvider` that reads `SharedRateStore` (no network), producing entries on the 12h cadence; if no snapshot or `!isPro` flag in the App Group, render the "Unlock Yen Sense Pro" placeholder with a `widgetURL(URL(string: "yensense://paywall"))` deep link.

- [ ] **Step 2:** Write the Pro flag into the App Group from `StoreManager.updateEntitlements()` so the widget knows entitlement. Small/medium views show "¥150 = $1 · fetched 05-29" styled with the shared `Color.ys*` (move `Style.swift` colors into a shared file/target membership so the widget can use them).

- [ ] **Step 3:** Handle the `yensense://paywall` deep link in `RootView` (`.onOpenURL`) to set `sheetDestination = .paywall`.

- [ ] **Step 4: Build & verify on a simulator** — add the widget to the Home Screen; free shows the unlock placeholder, Pro shows the live rate; tapping deep-links to the paywall.

- [ ] **Step 5: Commit**
```bash
git add ios/YenSense
git commit -m "feat: add Pro Home/Lock Screen widget with unlock placeholder"
```

---

## Milestone M5 — Launch polish

### Task 5.1: In-app review prompt

**Files:** Modify `ConverterView.swift` (after a conversion) or `PracticeView.swift` (after a session).

- [ ] **Step 1:** Use `@Environment(\.requestReview)` and fire it sparingly (e.g., once after the 3rd successful Practice session in a launch, guarded by a `UserDefaults` counter so it never nags). Build & confirm no crash.

- [ ] **Step 2: Commit**
```bash
git add ios/YenSense
git commit -m "feat: request App Store review after a few successful sessions"
```

### Task 5.2: Pre-submission verification pass

- [ ] **Step 1: Sandbox test on a device** — sign in with a Sandbox Apple ID; verify: buy Pro, all gates unlock; Restore on a fresh install re-grants Pro; buy each tip; refund simulation revokes Pro (via `Transaction.updates`).
- [ ] **Step 2: Privacy label** — confirm it stays "Data Not Collected" (StoreKit purchases don't change it; no analytics/ads added). Verify `PrivacyInfo.xcprivacy` is unchanged.
- [ ] **Step 3: Full `xcodebuild test`** green; **build for release**; archive.
- [ ] **Step 4: Featuring + outreach** (Jul–Aug 2026, ~6–8 wks before autumn): submit an App Store **Featuring Nomination**; email "best Japan travel apps" roundup authors; queue r/JapanTravel value-first posts and Practice-quiz TikToks.
- [ ] **Step 5: Final commit / tag**
```bash
git add -A && git commit -m "chore: pre-submission polish for Yen Sense Pro v1.0"
```

---

## Self-Review (completed by author)

- **Spec coverage:** model (§2) → M1; free/Pro line (§3) → M2/M3/M4 gating; StoreKit (§4a) → M1; Practice depth/history (§4b) → M2; multi-currency (§4c) → M3; widget (§4d) → M4; tip jar (§4e) → M1; ASO (§5) → M0 + M5.4; do-not-do (§6) honored (no ads/subs/upfront/external links). Resolved decisions (§9) reflected (6-amount free deck in 2.1; tip tiers in 1.4; currency set in 3.1/3.2; placeholder widget in 4.2; localization deferred — not in this plan by design).
- **Type consistency:** `isPro`, `StoreProducts.proID`, `QuizAmount.tier`/`deck(isPro:)`, `StoredRate.unitsPerYen`/`selectedQuote`/`manualYenPerUnit`, `EffectiveRate.yenPerUnit`/`quote`, `SupportedCurrency.code/symbol/isFree` used consistently across tasks. Note flagged in 1.5/3.3 about `yenPerUSD`→`yenPerUnit` rename ordering.
- **Open implementation confirmations (verify against live docs at execution):** Frankfurter v1 `latest?base=JPY&symbols=` shape (Task 3.1); StoreKit 2 API names are stable since iOS 15 but confirm `Transaction.currentEntitlements`/`AppStore.sync()` signatures.
