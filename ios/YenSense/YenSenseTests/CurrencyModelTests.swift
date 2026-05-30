import XCTest
@testable import YenSense

final class CurrencyModelTests: XCTestCase {
    func testEffectiveRateUsesSelectedQuote() {
        let stored = StoredRate(
            unitsPerYen: ["USD": 0.0066, "EUR": 0.0060],
            selectedQuote: "EUR",
            manualYenPerUnit: nil,
            sourceDate: nil,
            fetchedAt: nil
        )
        let effectiveRate = CurrencyMath.effectiveRate(from: stored)

        XCTAssertEqual(effectiveRate.quote.code, "EUR")
        XCTAssertEqual(effectiveRate.yenPerUnit, 1 / 0.0060, accuracy: 0.01)
    }

    func testManualOverrideWins() {
        let stored = StoredRate(
            unitsPerYen: ["USD": 0.0066],
            selectedQuote: "USD",
            manualYenPerUnit: 152,
            sourceDate: nil,
            fetchedAt: nil
        )

        XCTAssertEqual(CurrencyMath.effectiveRate(from: stored).yenPerUnit, 152, accuracy: 0.01)
    }

    func testFallbackWhenNoRate() {
        let stored = StoredRate.empty

        XCTAssertEqual(
            CurrencyMath.effectiveRate(from: stored).yenPerUnit,
            CurrencyMath.fallbackYenPerUnit(for: "USD"),
            accuracy: 0.01
        )
    }
}
