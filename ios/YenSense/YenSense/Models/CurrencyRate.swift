import Foundation

enum RateStatus: String {
    case loading
    case live
    case cached
    case fallback
    case error

    var label: String {
        switch self {
        case .loading:
            "Updating"
        case .live:
            "Live"
        case .cached:
            "Saved"
        case .fallback:
            "Estimate"
        case .error:
            "Check rate"
        }
    }
}

struct StoredRate: Codable, Equatable {
    var liveUSDPerYen: Double?
    var liveYenPerUSD: Double?
    var sourceDate: String?
    var fetchedAt: Date?
    var manualYenPerUSD: Double?

    static let empty = StoredRate(
        liveUSDPerYen: nil,
        liveYenPerUSD: nil,
        sourceDate: nil,
        fetchedAt: nil,
        manualYenPerUSD: nil
    )
}

struct EffectiveRate {
    var usdPerYen: Double
    var yenPerUSD: Double
    var sourceDate: String?
    var fetchedAt: Date?
    var isManual: Bool
    var isFallback: Bool
}

enum CurrencyMath {
    static let fallbackYenPerUSD = 150.0
    static let digitLimit = 9
    static let maxYenAmount = 999_999_999

    static func parseYenInput(_ value: String) -> Int {
        let digits = value.filter { $0.isNumber }
        return Int(digits) ?? 0
    }

    static func parseUSDInput(_ value: String) -> Double {
        var sawDot = false
        let normalized = value.filter { character in
            if character.isNumber {
                return true
            }

            if character == ".", !sawDot {
                sawDot = true
                return true
            }

            return false
        }

        return Double(normalized) ?? 0
    }

    static func effectiveRate(from storedRate: StoredRate) -> EffectiveRate {
        let manualRate = storedRate.manualYenPerUSD
        let liveRate = storedRate.liveYenPerUSD
        let yenPerUSD: Double

        if let manualRate, manualRate > 0 {
            yenPerUSD = manualRate
        } else if let liveRate, liveRate > 0 {
            yenPerUSD = liveRate
        } else {
            yenPerUSD = fallbackYenPerUSD
        }

        return EffectiveRate(
            usdPerYen: 1 / yenPerUSD,
            yenPerUSD: yenPerUSD,
            sourceDate: storedRate.sourceDate,
            fetchedAt: storedRate.fetchedAt,
            isManual: (manualRate ?? 0) > 0,
            isFallback: liveRate == nil && manualRate == nil
        )
    }

    static func convertYenToUSD(_ yen: Int, yenPerUSD: Double) -> Double {
        Double(yen) / yenPerUSD
    }
}

enum CurrencyText {
    static func yen(_ amount: Int) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSNumber(value: max(0, amount))) ?? "\(amount)"
    }

    static func yenInput(_ amount: Int) -> String {
        guard amount > 0 else {
            return ""
        }

        return yen(amount)
    }

    static func usd(_ amount: Double) -> String {
        let roundedAmount = max(0, amount)
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "USD"
        formatter.minimumFractionDigits = roundedAmount >= 100 ? 0 : 2
        formatter.maximumFractionDigits = roundedAmount >= 100 ? 0 : 2
        return formatter.string(from: NSNumber(value: roundedAmount)) ?? "$0.00"
    }

    static func usdCompact(_ amount: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "USD"
        formatter.minimumFractionDigits = 2
        formatter.maximumFractionDigits = 2
        return formatter.string(from: NSNumber(value: max(0, amount))) ?? "$0.00"
    }

    static func rate(_ amount: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.minimumFractionDigits = 1
        formatter.maximumFractionDigits = 1
        return formatter.string(from: NSNumber(value: amount)) ?? String(format: "%.1f", amount)
    }

    static func metaDate(_ date: Date?) -> String {
        guard let date else {
            return "NO SIGNAL"
        }

        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US")
        formatter.setLocalizedDateFormatFromTemplate("MMddHHmm")
        return formatter.string(from: date)
    }
}

