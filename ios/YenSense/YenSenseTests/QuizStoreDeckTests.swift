import XCTest
@testable import YenSense

@MainActor
final class QuizStoreDeckTests: XCTestCase {
    func testFreeStoreNeverPicksFullTierAmount() {
        let suiteName = "test-\(UUID())"
        let defaults = UserDefaults(suiteName: suiteName)!
        defaults.removePersistentDomain(forName: suiteName)

        let store = QuizStore(defaults: defaults)
        store.setPro(false)
        let everydayIDs = Set(QuizAmount.deck(isPro: false).map(\.id))

        for _ in 0..<50 {
            XCTAssertTrue(everydayIDs.contains(store.currentAmount.id))
            store.nextQuestion(excluding: store.currentAmount.id)
        }
    }

}
