import Foundation

struct QuizAmount: Codable, Hashable, Identifiable {
    enum Tier: String, Codable {
        case everyday
        case full
    }

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
