import Foundation

@MainActor
final class QuizStore: ObservableObject {
    private let storageKey = "yen-sense:quiz"
    private let defaults: UserDefaults

    @Published private(set) var progress: QuizProgress
    @Published private(set) var isPro = false

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        self.progress = Self.readProgress(from: defaults, key: storageKey)
    }

    var summary: QuizSummary {
        let stats = QuizAmount.deck(isPro: isPro).map { progress[$0.id] ?? .empty }
        let now = Date()

        return QuizSummary(
            dueNow: stats.filter { $0.nextDueAt <= now }.count,
            practiced: stats.filter { $0.attempts > 0 }.count,
            mastered: stats.filter { $0.boxLevel >= 4 }.count,
            bestStreak: stats.map(\.streak).max() ?? 0
        )
    }

    func setPro(_ value: Bool) {
        guard value != isPro else {
            return
        }

        isPro = value
    }

    func stats(for id: String) -> QuizStats {
        progress[id] ?? .empty
    }

    /// Picks the cards for a practice round: due cards first, then lowest box,
    /// earliest due, fewest attempts — shuffled for presentation variety.
    func drawRound(of count: Int = PracticeRound.standardLength) -> [QuizAmount] {
        let deck = QuizAmount.deck(isPro: isPro)
        let now = Date()
        let picked = deck
            .map { amount in
                (amount: amount, stats: progress[amount.id] ?? .empty)
            }
            .sorted { first, second in
                let firstDue = first.stats.nextDueAt <= now
                let secondDue = second.stats.nextDueAt <= now
                if firstDue != secondDue {
                    return firstDue
                }

                if first.stats.boxLevel != second.stats.boxLevel {
                    return first.stats.boxLevel < second.stats.boxLevel
                }

                if first.stats.nextDueAt != second.stats.nextDueAt {
                    return first.stats.nextDueAt < second.stats.nextDueAt
                }

                return first.stats.attempts < second.stats.attempts
            }
            .prefix(max(0, min(count, deck.count)))
            .map(\.amount)

        return picked.shuffled()
    }

    func recordAnswer(for amount: QuizAmount, guess: Double, exact: Double) -> QuizResult {
        let now = Date()
        let currentStats = progress[amount.id] ?? .empty
        let errorPercent = exact > 0 ? abs(guess - exact) / exact * 100 : 0
        let rating = QuizScoring.rating(for: errorPercent)
        let nextBoxLevel = rating == .repeatPractice
            ? 1
            : min(QuizScoring.boxIntervals.count - 1, currentStats.boxLevel + 1)
        let dueInterval = rating == .repeatPractice ? 5 * 60 : QuizScoring.boxIntervals[nextBoxLevel]
        let nextStats = QuizStats(
            attempts: currentStats.attempts + 1,
            streak: rating == .repeatPractice ? 0 : currentStats.streak + 1,
            boxLevel: nextBoxLevel,
            lastErrorPercent: errorPercent,
            nextDueAt: now.addingTimeInterval(dueInterval)
        )

        progress[amount.id] = nextStats
        writeProgress(progress)

        return QuizResult(
            exactUSD: exact,
            errorPercent: errorPercent,
            rating: rating,
            stats: nextStats
        )
    }

    func reset() {
        progress = [:]
        writeProgress(progress)
    }

    private static func readProgress(from defaults: UserDefaults, key: String) -> QuizProgress {
        guard let data = defaults.data(forKey: key),
              let progress = try? JSONDecoder().decode(QuizProgress.self, from: data) else {
            return [:]
        }

        return progress
    }

    private func writeProgress(_ progress: QuizProgress) {
        guard let data = try? JSONEncoder().encode(progress) else {
            return
        }

        defaults.set(data, forKey: storageKey)
    }
}
