import SwiftUI

struct RateSettingsView: View {
    @ObservedObject var rateStore: RateStore
    @State private var rateInput: String

    init(rateStore: RateStore) {
        self.rateStore = rateStore
        _rateInput = State(initialValue: CurrencyText.rate(rateStore.effectiveRate.yenPerUSD))
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Yen per dollar")
                        .font(.caption.weight(.bold))
                        .textCase(.uppercase)
                        .foregroundStyle(Color.ysMutedInk)

                    HStack(spacing: 0) {
                        Text("¥")
                            .font(.system(size: 34, weight: .bold, design: .serif))
                            .foregroundStyle(Color.ysAccent)
                            .frame(width: 48)
                        TextField("150.0", text: $rateInput)
                            .keyboardType(.decimalPad)
                            .font(.system(size: 44, weight: .bold, design: .monospaced))
                            .foregroundStyle(Color.ysInk)
                    }
                    .padding(.vertical, 8)
                    .background(Color.ysField)
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(Color.ysLine, lineWidth: 1)
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                }

                HStack(spacing: 8) {
                    Button {
                        applyManualRate()
                    } label: {
                        Label("Use", systemImage: "checkmark")
                    }
                    .buttonStyle(YenButtonStyle(prominent: true))

                    Button {
                        rateStore.setManualRate(nil)
                        rateInput = CurrencyText.rate(rateStore.effectiveRate.yenPerUSD)
                    } label: {
                        Label("Live", systemImage: "arrow.counterclockwise")
                    }
                    .buttonStyle(YenButtonStyle())
                }

                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text("Source")
                        Spacer()
                        Text(rateStore.status.label)
                    }
                    .font(.caption.weight(.bold))
                    .textCase(.uppercase)
                    .foregroundStyle(Color.ysMutedInk)

                    Text(rateStore.storedRate.liveYenPerUSD.map {
                        "Last fetched: ¥\(CurrencyText.rate($0)) = $1."
                    } ?? "Offline estimate: ¥\(CurrencyText.rate(CurrencyMath.fallbackYenPerUSD)) = $1.")
                    .font(.callout)
                    .foregroundStyle(Color.ysMutedInk)

                    if let errorMessage = rateStore.errorMessage {
                        Text(errorMessage)
                            .font(.callout.weight(.bold))
                            .foregroundStyle(Color.ysAccent)
                    }
                }
                .panelCard()

                HStack(spacing: 8) {
                    Button {
                        Task {
                            await rateStore.refreshRate()
                            rateInput = CurrencyText.rate(rateStore.effectiveRate.yenPerUSD)
                        }
                    } label: {
                        Label("Refresh", systemImage: "arrow.clockwise")
                    }
                    .buttonStyle(YenButtonStyle())

                    Button {
                        rateStore.resetToFallback()
                        rateInput = CurrencyText.rate(CurrencyMath.fallbackYenPerUSD)
                    } label: {
                        Text("¥150")
                    }
                    .buttonStyle(YenButtonStyle())
                }
            }
            .padding(18)
        }
        .background(Color.ysPaper)
        .navigationTitle("Rate")
        .navigationBarTitleDisplayMode(.inline)
        .onChange(of: rateStore.effectiveRate.yenPerUSD) { _, nextRate in
            rateInput = CurrencyText.rate(nextRate)
        }
    }

    private func applyManualRate() {
        let nextRate = CurrencyMath.parseUSDInput(rateInput)
        guard nextRate > 0 else {
            return
        }

        rateStore.setManualRate(nextRate)
        rateInput = CurrencyText.rate(nextRate)
    }
}

#Preview {
    NavigationStack {
        RateSettingsView(rateStore: RateStore())
    }
}
