import XCTest
@testable import YenSense

final class PracticeRoundTests: XCTestCase {
    private func makeResult(errorPercent: Double) -> QuizResult {
        QuizResult(
            exactUSD: 10,
            errorPercent: errorPercent,
            rating: QuizScoring.rating(for: errorPercent),
            stats: .empty
        )
    }

    func testRoundProgression() {
        var round = PracticeRound(cards: Array(QuizAmount.all.prefix(3)))

        XCTAssertEqual(round.count, 3)
        XCTAssertEqual(round.answeredCount, 0)
        XCTAssertFalse(round.isComplete)
        XCTAssertFalse(round.isOnLastCard)
        XCTAssertEqual(round.currentEntry?.id, QuizAmount.all[0].id)

        round.recordCurrent(guess: 9, result: makeResult(errorPercent: 10))
        XCTAssertEqual(round.answeredCount, 1)
        round.advance()
        XCTAssertEqual(round.currentEntry?.id, QuizAmount.all[1].id)

        round.recordCurrent(guess: 9, result: makeResult(errorPercent: 20))
        round.advance()
        XCTAssertTrue(round.isOnLastCard)

        round.recordCurrent(guess: 9, result: makeResult(errorPercent: 30))
        XCTAssertTrue(round.isComplete)
        XCTAssertEqual(round.averageErrorPercent ?? 0, 20, accuracy: 0.001)
        XCTAssertEqual(round.ratingCount(.strong), 1)
        XCTAssertEqual(round.ratingCount(.close), 1)
        XCTAssertEqual(round.ratingCount(.repeatPractice), 1)
    }

    func testAdvancePastEndAndEmptyRound() {
        var round = PracticeRound(cards: Array(QuizAmount.all.prefix(1)))
        round.recordCurrent(guess: 10, result: makeResult(errorPercent: 0))
        round.advance()
        XCTAssertNil(round.currentEntry)
        round.advance()
        round.recordCurrent(guess: 10, result: makeResult(errorPercent: 0))
        XCTAssertEqual(round.answeredCount, 1)

        let empty = PracticeRound(cards: [])
        XCTAssertNil(empty.currentEntry)
        XCTAssertFalse(empty.isComplete)
        XCTAssertNil(empty.averageErrorPercent)
    }
}
