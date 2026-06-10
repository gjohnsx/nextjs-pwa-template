import Foundation

/// Input model for the practice guess keypad. Keeps the formatting rules
/// (single decimal separator, two decimal places, digit limit) out of the view.
struct GuessInput: Equatable {
    static let integerDigitLimit = 7

    private(set) var text = ""

    var value: Double {
        CurrencyMath.parseDecimalInput(text)
    }

    var isEmpty: Bool {
        text.isEmpty
    }

    /// Display string with the integer part grouped (e.g. "12,500.5").
    var display: String {
        guard !text.isEmpty else {
            return ""
        }

        let parts = text.split(separator: ".", omittingEmptySubsequences: false)
        let grouped = CurrencyText.yen(Int(parts[0]) ?? 0)
        guard parts.count > 1 else {
            return grouped
        }

        return "\(grouped).\(parts[1])"
    }

    mutating func appendDigit(_ digit: String) {
        guard digit.count == 1, digit.first?.isNumber == true else {
            return
        }

        if let separatorIndex = text.firstIndex(of: ".") {
            let decimals = text[text.index(after: separatorIndex)...]
            guard decimals.count < 2 else {
                return
            }

            text.append(digit)
            return
        }

        if text == "0" {
            text = digit
            return
        }

        guard text.count < Self.integerDigitLimit else {
            return
        }

        text.append(digit)
    }

    mutating func appendDecimalSeparator() {
        guard !text.contains(".") else {
            return
        }

        text = text.isEmpty ? "0." : text + "."
    }

    mutating func backspace() {
        guard !text.isEmpty else {
            return
        }

        text.removeLast()
    }

    mutating func clear() {
        text = ""
    }
}
