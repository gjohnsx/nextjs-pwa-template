import Foundation

struct QuizAmount: Codable, Hashable, Identifiable {
    var id: String
    var yen: Int
    var label: String

    static let all: [QuizAmount] = [
        QuizAmount(id: "drink-140", yen: 140, label: "vending machine drink"),
        QuizAmount(id: "snack-380", yen: 380, label: "konbini snack"),
        QuizAmount(id: "coffee-520", yen: 520, label: "coffee stop"),
        QuizAmount(id: "train-880", yen: 880, label: "city train ride"),
        QuizAmount(id: "lunch-1200", yen: 1_200, label: "quick lunch"),
        QuizAmount(id: "ramen-1800", yen: 1_800, label: "ramen plus side"),
        QuizAmount(id: "market-3200", yen: 3_200, label: "market run"),
        QuizAmount(id: "taxi-4800", yen: 4_800, label: "short taxi"),
        QuizAmount(id: "dinner-7600", yen: 7_600, label: "casual dinner"),
        QuizAmount(id: "shopping-12000", yen: 12_000, label: "shopping stop"),
        QuizAmount(id: "activity-18000", yen: 18_000, label: "family activity"),
        QuizAmount(id: "hotel-28000", yen: 28_000, label: "hotel night"),
        QuizAmount(id: "splurge-45000", yen: 45_000, label: "trip splurge"),
    ]
}
