import XCTest
@testable import YenSense

final class QuizAmountTests: XCTestCase {
    func testEverydayTierIsTheSixSmallAmounts() {
        let everyday = QuizAmount.all.filter { $0.tier == .everyday }.map(\.id)
        XCTAssertEqual(everyday, [
            "drink-140",
            "snack-380",
            "coffee-520",
            "train-880",
            "lunch-1200",
            "ramen-1800",
        ])
    }

    func testFreeDeckIsEverydayOnly() {
        XCTAssertEqual(QuizAmount.deck(isPro: false).count, 6)
        XCTAssertEqual(QuizAmount.deck(isPro: true).count, QuizAmount.all.count)
    }
}
