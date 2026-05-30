import Foundation

@MainActor
final class QuizStore: ObservableObject {
    private let storageKey = "yen-sense:quiz"
    private let defaults: UserDefaults

    @Published private(set) var progress: QuizProgress
    @Published private(set) var currentAmount: QuizAmount

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        let storedProgress = Self.readProgress(from: defaults, key: storageKey)
        self.progress = storedProgress
        self.currentAmount = Self.selectAmount(from: storedProgress)
    }

    var summary: QuizSummary {
        let stats = QuizAmount.all.map { progress[$0.id] ?? .empty }
        let now = Date()

        return QuizSummary(
            dueNow: stats.filter { $0.nextDueAt <= now }.count,
            practiced: stats.filter { $0.attempts > 0 }.count,
            mastered: stats.filter { $0.boxLevel >= 4 }.count,
            bestStreak: stats.map(\.streak).max() ?? 0
        )
    }

    func recordAnswer(guessUSD: Double, exactUSD: Double) -> QuizResult {
        let now = Date()
        let currentStats = progress[currentAmount.id] ?? .empty
        let errorPercent = exactUSD > 0 ? abs(guessUSD - exactUSD) / exactUSD * 100 : 0
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

        progress[currentAmount.id] = nextStats
        writeProgress(progress)

        return QuizResult(
            exactUSD: exactUSD,
            errorPercent: errorPercent,
            rating: rating,
            stats: nextStats
        )
    }

    func nextQuestion(excluding id: String? = nil) {
        currentAmount = Self.selectAmount(from: progress, excluding: id)
    }

    func reset() {
        progress = [:]
        writeProgress(progress)
        currentAmount = Self.selectAmount(from: progress)
    }

    private static func readProgress(from defaults: UserDefaults, key: String) -> QuizProgress {
        guard let data = defaults.data(forKey: key),
              let progress = try? JSONDecoder().decode(QuizProgress.self, from: data) else {
            return [:]
        }

        return progress
    }

    private static func selectAmount(from progress: QuizProgress, excluding excludedID: String? = nil) -> QuizAmount {
        let now = Date()
        let rows = QuizAmount.all
            .filter { $0.id != excludedID }
            .map { amount in
                (amount: amount, stats: progress[amount.id] ?? .empty)
            }
        let candidates = rows.isEmpty
            ? QuizAmount.all.map { amount in (amount: amount, stats: progress[amount.id] ?? .empty) }
            : rows
        let due = candidates.filter { $0.stats.nextDueAt <= now }
        let pool = due.isEmpty ? candidates : due

        return pool.sorted { first, second in
            if first.stats.boxLevel != second.stats.boxLevel {
                return first.stats.boxLevel < second.stats.boxLevel
            }

            if first.stats.nextDueAt != second.stats.nextDueAt {
                return first.stats.nextDueAt < second.stats.nextDueAt
            }

            return first.stats.attempts < second.stats.attempts
        }[0].amount
    }

    private func writeProgress(_ progress: QuizProgress) {
        guard let data = try? JSONEncoder().encode(progress) else {
            return
        }

        defaults.set(data, forKey: storageKey)
    }
}
