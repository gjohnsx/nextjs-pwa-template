import Foundation

struct WidgetRateSnapshot: Codable, Equatable {
    var quoteCode: String
    var quoteSymbol: String
    var yenPerUnit: Double
    var fetchedAt: Date?
    var isPro: Bool
}

enum SharedRateStore {
    static let appGroupID = "group.com.gregjohns.yensense"

    private static let storageKey = "yen-sense:widget-rate"

    static func read() -> WidgetRateSnapshot? {
        guard let data = defaults.data(forKey: storageKey) else {
            return nil
        }

        return try? JSONDecoder().decode(WidgetRateSnapshot.self, from: data)
    }

    static func write(_ snapshot: WidgetRateSnapshot) {
        guard let data = try? JSONEncoder().encode(snapshot) else {
            return
        }

        defaults.set(data, forKey: storageKey)
    }

    static func setPro(_ isPro: Bool) {
        let current = read() ?? WidgetRateSnapshot(
            quoteCode: "USD",
            quoteSymbol: "$",
            yenPerUnit: CurrencyMath.fallbackYenPerUSD,
            fetchedAt: nil,
            isPro: isPro
        )

        write(
            WidgetRateSnapshot(
                quoteCode: current.quoteCode,
                quoteSymbol: current.quoteSymbol,
                yenPerUnit: current.yenPerUnit,
                fetchedAt: current.fetchedAt,
                isPro: isPro
            )
        )
    }

    private static var defaults: UserDefaults {
        UserDefaults(suiteName: appGroupID) ?? .standard
    }
}
