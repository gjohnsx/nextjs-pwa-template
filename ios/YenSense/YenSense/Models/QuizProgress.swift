import Foundation

typealias QuizProgress = [String: QuizStats]

struct QuizStats: Codable, Equatable {
    var attempts: Int
    var streak: Int
    var boxLevel: Int
    var lastErrorPercent: Double?
    var nextDueAt: Date

    static let empty = QuizStats(
        attempts: 0,
        streak: 0,
        boxLevel: 1,
        lastErrorPercent: nil,
        nextDueAt: .distantPast
    )
}

enum QuizRating: String {
    case nailed
    case strong
    case close
    case repeatPractice

    var label: String {
        switch self {
        case .nailed:
            "Nailed"
        case .strong:
            "Strong"
        case .close:
            "Close"
        case .repeatPractice:
            "Repeat"
        }
    }
}

struct QuizResult {
    var exactUSD: Double
    var errorPercent: Double
    var rating: QuizRating
    var stats: QuizStats
}

struct QuizSummary {
    var dueNow: Int
    var practiced: Int
    var mastered: Int
    var bestStreak: Int
}

enum QuizScoring {
    static let boxIntervals: [TimeInterval] = [
        0,
        10 * 60,
        2 * 60 * 60,
        24 * 60 * 60,
        3 * 24 * 60 * 60,
        7 * 24 * 60 * 60,
    ]

    static func rating(for errorPercent: Double) -> QuizRating {
        if errorPercent <= 5 {
            return .nailed
        }

        if errorPercent <= 10 {
            return .strong
        }

        if errorPercent <= 20 {
            return .close
        }

        return .repeatPractice
    }
}
