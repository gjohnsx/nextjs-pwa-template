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
    var unitsPerYen: [String: Double]   // units of the quote currency per 1 JPY
    var selectedQuote: String
    var manualYenPerUnit: Double?       // applies to the selected quote
    var sourceDate: String?
    var fetchedAt: Date?

    static let empty = StoredRate(
        unitsPerYen: [:],
        selectedQuote: "USD",
        manualYenPerUnit: nil,
        sourceDate: nil,
        fetchedAt: nil
    )
}

struct EffectiveRate {
    var quote: SupportedCurrency
    var yenPerUnit: Double
    var unitPerYen: Double
    var sourceDate: String?
    var fetchedAt: Date?
    var isManual: Bool
    var isFallback: Bool
}

enum CurrencyMath {
    static let digitLimit = 9
    static let maxYenAmount = 999_999_999

    // Rough offline fallbacks (yen per 1 unit) for the launch currencies.
    private static let fallbackYenPerUnitTable: [String: Double] = [
        "USD": 150, "EUR": 165, "GBP": 190, "AUD": 100, "CAD": 110,
        "KRW": 0.11, "CNY": 21, "SGD": 112, "HKD": 19, "THB": 4.3,
    ]

    /// Kept for any legacy reference; prefer `fallbackYenPerUnit(for:)`.
    static let fallbackYenPerUSD = 150.0

    static func fallbackYenPerUnit(for code: String) -> Double {
        fallbackYenPerUnitTable[code] ?? fallbackYenPerUSD
    }

    static func parseYenInput(_ value: String) -> Int {
        let digits = value.filter { $0.isNumber }
        return Int(digits) ?? 0
    }

    static func parseDecimalInput(_ value: String) -> Double {
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

    /// Legacy alias retained for callers that parse a decimal amount.
    static func parseUSDInput(_ value: String) -> Double {
        parseDecimalInput(value)
    }

    static func effectiveRate(from storedRate: StoredRate) -> EffectiveRate {
        let quote = SupportedCurrency.find(storedRate.selectedQuote)
        let manualRate = storedRate.manualYenPerUnit
        let liveUnit = storedRate.unitsPerYen[quote.code]
        let yenPerUnit: Double
        let isFallback: Bool

        if let manualRate, manualRate > 0 {
            yenPerUnit = manualRate
            isFallback = false
        } else if let liveUnit, liveUnit > 0 {
            yenPerUnit = 1 / liveUnit
            isFallback = false
        } else {
            yenPerUnit = fallbackYenPerUnit(for: quote.code)
            isFallback = true
        }

        return EffectiveRate(
            quote: quote,
            yenPerUnit: yenPerUnit,
            unitPerYen: 1 / yenPerUnit,
            sourceDate: storedRate.sourceDate,
            fetchedAt: storedRate.fetchedAt,
            isManual: (manualRate ?? 0) > 0,
            isFallback: isFallback
        )
    }

    static func convertYen(_ yen: Int, yenPerUnit: Double) -> Double {
        guard yenPerUnit > 0 else {
            return 0
        }

        return Double(yen) / yenPerUnit
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

    /// Currency-aware amount formatter. Uses the currency `code` for grouping/decimals
    /// and prefixes the quote `symbol` so non-locale currencies still read naturally.
    static func amount(_ value: Double, code: String, symbol: String) -> String {
        let roundedAmount = max(0, value)
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.usesGroupingSeparator = true
        formatter.minimumFractionDigits = roundedAmount >= 100 ? 0 : 2
        formatter.maximumFractionDigits = roundedAmount >= 100 ? 0 : 2
        let number = formatter.string(from: NSNumber(value: roundedAmount)) ?? String(format: "%.2f", roundedAmount)
        return "\(symbol)\(number)"
    }

    static func amount(_ value: Double, currency: SupportedCurrency) -> String {
        amount(value, code: currency.code, symbol: currency.symbol)
    }

    static func amountCompact(_ value: Double, code: String, symbol: String) -> String {
        let roundedAmount = max(0, value)
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.usesGroupingSeparator = true
        formatter.minimumFractionDigits = 2
        formatter.maximumFractionDigits = 2
        let number = formatter.string(from: NSNumber(value: roundedAmount)) ?? String(format: "%.2f", roundedAmount)
        return "\(symbol)\(number)"
    }

    static func amountCompact(_ value: Double, currency: SupportedCurrency) -> String {
        amountCompact(value, code: currency.code, symbol: currency.symbol)
    }

    /// Legacy USD wrappers retained for any remaining callers.
    static func usd(_ amount: Double) -> String {
        self.amount(amount, currency: .usd)
    }

    static func usdCompact(_ amount: Double) -> String {
        amountCompact(amount, currency: .usd)
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
