import Foundation

struct SupportedCurrency: Identifiable, Hashable {
    let code: String
    let symbol: String
    let name: String
    let isFree: Bool

    var id: String { code }

    static let usd = SupportedCurrency(code: "USD", symbol: "$", name: "US Dollar", isFree: true)

    static let all: [SupportedCurrency] = [
        usd,
        .init(code: "EUR", symbol: "€", name: "Euro", isFree: false),
        .init(code: "GBP", symbol: "£", name: "British Pound", isFree: false),
        .init(code: "AUD", symbol: "A$", name: "Australian Dollar", isFree: false),
        .init(code: "CAD", symbol: "C$", name: "Canadian Dollar", isFree: false),
        .init(code: "KRW", symbol: "₩", name: "Korean Won", isFree: false),
        .init(code: "CNY", symbol: "¥", name: "Chinese Yuan", isFree: false),
        .init(code: "SGD", symbol: "S$", name: "Singapore Dollar", isFree: false),
        .init(code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", isFree: false),
        .init(code: "THB", symbol: "฿", name: "Thai Baht", isFree: false),
    ]

    static func find(_ code: String) -> SupportedCurrency {
        all.first { $0.code == code } ?? usd
    }
}
