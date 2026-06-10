import XCTest
@testable import YenSense

@MainActor
final class QuizStoreDeckTests: XCTestCase {
    private func makeStore() -> QuizStore {
        let suiteName = "test-\(UUID())"
        let defaults = UserDefaults(suiteName: suiteName)!
        defaults.removePersistentDomain(forName: suiteName)
        return QuizStore(defaults: defaults)
    }

    func testFreeStoreNeverDrawsFullTierAmount() {
        let store = makeStore()
        store.setPro(false)
        let everydayIDs = Set(QuizAmount.deck(isPro: false).map(\.id))

        for _ in 0..<20 {
            let round = store.drawRound(of: 5)
            XCTAssertEqual(round.count, 5)
            XCTAssertEqual(Set(round.map(\.id)).count, 5, "round cards must be distinct")
            for amount in round {
                XCTAssertTrue(everydayIDs.contains(amount.id))
            }

            for amount in round {
                _ = store.recordAnswer(for: amount, guess: 100, exact: 100)
            }
        }
    }

    func testDrawRoundClampsToDeckSize() {
        let store = makeStore()
        store.setPro(false)
        XCTAssertEqual(store.drawRound(of: 99).count, QuizAmount.deck(isPro: false).count)

        store.setPro(true)
        XCTAssertEqual(store.drawRound(of: 99).count, QuizAmount.all.count)
    }

    func testDrawRoundPrefersDueCards() {
        let store = makeStore()
        store.setPro(false)
        let deck = QuizAmount.deck(isPro: false)

        // Answer every card except the first perfectly, pushing them out of the
        // due window; the untouched card is the only one still due.
        for amount in deck.dropFirst() {
            _ = store.recordAnswer(for: amount, guess: 100, exact: 100)
        }

        XCTAssertEqual(store.drawRound(of: 1).first?.id, deck.first?.id)
    }

    func testRecordAnswerScoresAndPersists() {
        let store = makeStore()
        let amount = QuizAmount.all[0]

        let result = store.recordAnswer(for: amount, guess: 96, exact: 100)
        XCTAssertEqual(result.rating, .nailed)
        XCTAssertEqual(result.errorPercent, 4, accuracy: 0.001)
        XCTAssertEqual(store.stats(for: amount.id).attempts, 1)
        XCTAssertEqual(store.stats(for: amount.id).streak, 1)
        XCTAssertEqual(store.stats(for: amount.id).boxLevel, 2)

        let miss = store.recordAnswer(for: amount, guess: 50, exact: 100)
        XCTAssertEqual(miss.rating, .repeatPractice)
        XCTAssertEqual(store.stats(for: amount.id).streak, 0)
        XCTAssertEqual(store.stats(for: amount.id).boxLevel, 1)
    }
}
