import SwiftUI

private enum KeypadKey: Hashable {
    case digit(String)
    case quick(Int)
    case plus
}

private let keypadKeys: [KeypadKey] = [
    .digit("7"), .digit("8"), .digit("9"), .quick(500),
    .digit("4"), .digit("5"), .digit("6"), .quick(100),
    .digit("1"), .digit("2"), .digit("3"), .quick(50),
    .digit("00"), .digit("0"), .plus, .quick(25),
]

struct ConverterView: View {
    @ObservedObject var rateStore: RateStore
    @Binding var sheetDestination: SheetDestination?

    @State private var yenInput = ""
    @State private var storedYenTotal = 0

    private var currentYenEntry: Int {
        CurrencyMath.parseYenInput(yenInput)
    }

    private var yenAmount: Int {
        min(storedYenTotal + currentYenEntry, CurrencyMath.maxYenAmount)
    }

    private var quote: SupportedCurrency {
        rateStore.effectiveRate.quote
    }

    private var convertedAmount: Double {
        CurrencyMath.convertYen(yenAmount, yenPerUnit: rateStore.effectiveRate.yenPerUnit)
    }

    private var displayYenInput: String {
        yenInput.isEmpty ? CurrencyText.yenInput(storedYenTotal) : yenInput
    }

    private var statusLabel: String {
        rateStore.effectiveRate.isManual ? "Manual" : rateStore.status.label
    }

    var body: some View {
        ZStack {
            Color.ysPaper.ignoresSafeArea()

            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    header
                    resultPanel
                    keypadPanel
                    footerPanel
                }
                .padding(18)
                .frame(maxWidth: 540)
                .frame(maxWidth: .infinity)
            }
        }
    }

    private var header: some View {
        HStack(alignment: .center) {
            VStack(alignment: .leading, spacing: 4) {
                Text("Tokyo pocket converter")
                    .font(.caption.weight(.bold))
                    .textCase(.uppercase)
                    .foregroundStyle(Color.ysMutedInk)
                Text("Yen Sense")
                    .font(.system(size: 42, weight: .heavy, design: .serif))
                    .foregroundStyle(Color.ysInk)
            }

            Spacer()

            Button {
                sheetDestination = .rate
            } label: {
                Image(systemName: "slider.horizontal.3")
                    .frame(width: 42, height: 42)
            }
            .foregroundStyle(Color.ysInk)
            .background(Color.ysPanel)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(Color.ysLine, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 8))
        }
    }

    private var resultPanel: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Text(statusLabel)
                    .font(.caption.weight(.bold))
                    .textCase(.uppercase)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .foregroundStyle(Color.ysAccent)
                    .background(Color.ysAccentSoft)
                    .clipShape(Capsule())

                Spacer()

                Text("JPY to \(quote.code)")
                    .font(.caption.weight(.bold))
                    .textCase(.uppercase)
                    .foregroundStyle(Color.ysMutedInk)
            }

            VStack(alignment: .leading, spacing: 6) {
                Text("\(quote.name) result")
                    .font(.caption.weight(.bold))
                    .textCase(.uppercase)
                    .foregroundStyle(Color.ysMutedInk)
                Text(CurrencyText.amount(convertedAmount, currency: quote))
                    .font(.system(size: 64, weight: .heavy, design: .serif))
                    .minimumScaleFactor(0.45)
                    .lineLimit(1)
                    .foregroundStyle(Color.ysInk)
            }

            HStack {
                Text("¥\(CurrencyText.rate(rateStore.effectiveRate.yenPerUnit))")
                    .font(.system(.title3, design: .monospaced).weight(.bold))
                Spacer()
                Text("per \(quote.symbol)1")
                    .font(.caption.weight(.bold))
                    .textCase(.uppercase)
                    .foregroundStyle(Color.ysMutedInk)
            }
            .padding(12)
            .background(Color.ysSage)
            .clipShape(RoundedRectangle(cornerRadius: 8))
        }
        .panelCard()
    }

    private var keypadPanel: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Yen amount")
                    .font(.caption.weight(.bold))
                    .textCase(.uppercase)
                    .foregroundStyle(Color.ysMutedInk)
                Spacer()
                Text("keypad")
                    .font(.caption2.weight(.bold))
                    .textCase(.uppercase)
                    .foregroundStyle(Color.ysFaintInk)
            }

            HStack(spacing: 0) {
                Text("¥")
                    .font(.system(size: 38, weight: .bold, design: .serif))
                    .foregroundStyle(Color.ysAccent)
                    .frame(width: 52, height: 66)
                    .overlay(alignment: .trailing) {
                        Rectangle().fill(Color.ysLine).frame(width: 1)
                    }

                Text(displayYenInput.isEmpty ? "0" : displayYenInput)
                    .font(.system(size: 44, weight: .bold, design: .monospaced))
                    .minimumScaleFactor(0.5)
                    .lineLimit(1)
                    .foregroundStyle(displayYenInput.isEmpty ? Color.ysFaintInk : Color.ysInk)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 12)

                Button {
                    backspaceYen()
                } label: {
                    Image(systemName: "delete.left")
                        .frame(width: 46, height: 66)
                }
                .foregroundStyle(Color.ysMutedInk)
                .overlay(alignment: .leading) {
                    Rectangle().fill(Color.ysLine).frame(width: 1)
                }
            }
            .background(Color.ysField)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(Color.ysLine, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 8))

            if storedYenTotal > 0 {
                HStack {
                    Text("Subtotal ¥\(CurrencyText.yen(storedYenTotal))")
                    Spacer()
                    Text(currentYenEntry > 0 ? "Total ¥\(CurrencyText.yen(yenAmount))" : "+ next")
                }
                .font(.caption.weight(.bold))
                .textCase(.uppercase)
                .foregroundStyle(Color.ysMutedInk)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(Color.ysSage)
                .clipShape(RoundedRectangle(cornerRadius: 8))
            }

            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 4), spacing: 8) {
                ForEach(keypadKeys, id: \.self) { key in
                    keypadButton(for: key)
                }
            }

            HStack(spacing: 8) {
                Button {
                    sheetDestination = .practice
                } label: {
                    Label("Practice", systemImage: "brain.head.profile")
                }
                .buttonStyle(YenButtonStyle())

                Button {
                    clearYen()
                } label: {
                    Label("Clear", systemImage: "xmark.circle")
                }
                .buttonStyle(YenButtonStyle())
            }
        }
        .panelCard()
    }

    private var footerPanel: some View {
        VStack(spacing: 6) {
            HStack {
                Text(rateStore.status == .loading ? "Refreshing rate" : "Ready offline")
                Spacer()
                Text("Fetched: \(CurrencyText.metaDate(rateStore.effectiveRate.fetchedAt))")
            }
            .font(.caption.weight(.bold))
            .textCase(.uppercase)
            .foregroundStyle(Color.ysMutedInk)

            if let errorMessage = rateStore.errorMessage {
                Text(errorMessage)
                    .font(.caption.weight(.bold))
                    .foregroundStyle(Color.ysAccent)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .panelCard()
    }

    private func keypadButton(for key: KeypadKey) -> some View {
        Button {
            switch key {
            case .digit(let digits):
                appendYenDigits(digits)
            case .quick(let amount):
                addYen(amount)
            case .plus:
                commitAddition()
            }
        } label: {
            switch key {
            case .digit(let digits):
                Text(digits)
                    .font(.system(size: 26, weight: .bold, design: .monospaced))
            case .quick(let amount):
                Text("+¥\(CurrencyText.yen(amount))")
                    .font(.caption.weight(.bold))
            case .plus:
                Image(systemName: "plus")
                    .font(.title3.weight(.bold))
            }
        }
        .buttonStyle(YenButtonStyle(prominent: key == .plus))
    }

    private func appendYenDigits(_ digits: String) {
        let currentDigits = yenInput.filter { $0.isNumber }
        let nextDigits = String((currentDigits + digits)
            .drop { $0 == "0" }
            .prefix(CurrencyMath.digitLimit))
        let nextAmount = Int(nextDigits) ?? 0
        yenInput = CurrencyText.yenInput(nextAmount)
    }

    private func backspaceYen() {
        if yenInput.isEmpty {
            let nextStoredDigits = String(storedYenTotal).dropLast()
            storedYenTotal = Int(nextStoredDigits) ?? 0
            return
        }

        let nextDigits = yenInput.filter { $0.isNumber }.dropLast()
        let nextAmount = Int(nextDigits) ?? 0
        yenInput = CurrencyText.yenInput(nextAmount)
    }

    private func addYen(_ amount: Int) {
        storedYenTotal = min(yenAmount + amount, CurrencyMath.maxYenAmount)
        yenInput = ""
    }

    private func commitAddition() {
        guard currentYenEntry > 0 else {
            return
        }

        storedYenTotal = yenAmount
        yenInput = ""
    }

    private func clearYen() {
        yenInput = ""
        storedYenTotal = 0
    }
}

#Preview {
    ConverterView(rateStore: RateStore(), sheetDestination: .constant(nil))
}

