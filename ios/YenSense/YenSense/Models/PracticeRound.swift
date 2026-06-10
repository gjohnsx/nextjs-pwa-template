import Foundation

/// One practice session: a short run of cards answered in sequence.
struct PracticeRound {
    static let standardLength = 5

    struct Entry: Identifiable {
        let amount: QuizAmount
        var guess: Double?
        var result: QuizResult?

        var id: String {
            amount.id
        }
    }

    private(set) var entries: [Entry]
    private(set) var currentIndex = 0

    init(cards: [QuizAmount]) {
        entries = cards.map { Entry(amount: $0) }
    }

    var count: Int {
        entries.count
    }

    var currentEntry: Entry? {
        entries.indices.contains(currentIndex) ? entries[currentIndex] : nil
    }

    var isOnLastCard: Bool {
        currentIndex >= entries.count - 1
    }

    var answeredCount: Int {
        entries.filter { $0.result != nil }.count
    }

    var isComplete: Bool {
        !entries.isEmpty && answeredCount == entries.count
    }

    var averageErrorPercent: Double? {
        let errors = entries.compactMap { $0.result?.errorPercent }
        guard !errors.isEmpty else {
            return nil
        }

        return errors.reduce(0, +) / Double(errors.count)
    }

    func ratingCount(_ rating: QuizRating) -> Int {
        entries.filter { $0.result?.rating == rating }.count
    }

    mutating func recordCurrent(guess: Double, result: QuizResult) {
        guard entries.indices.contains(currentIndex) else {
            return
        }

        entries[currentIndex].guess = guess
        entries[currentIndex].result = result
    }

    mutating func advance() {
        guard currentIndex < entries.count else {
            return
        }

        currentIndex += 1
    }
}
