import SwiftUI

struct RateSettingsView: View {
    @ObservedObject var rateStore: RateStore
    @Binding var sheetDestination: SheetDestination?
    @EnvironmentObject private var store: StoreManager

    @State private var rateInput: String
    @State private var showCurrencyPicker = false

    init(rateStore: RateStore, sheetDestination: Binding<SheetDestination?>) {
        self.rateStore = rateStore
        _sheetDestination = sheetDestination
        _rateInput = State(initialValue: CurrencyText.rate(rateStore.effectiveRate.yenPerUnit))
    }

    private var quote: SupportedCurrency {
        rateStore.effectiveRate.quote
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                homeCurrencyRow

                VStack(alignment: .leading, spacing: 8) {
                    Text("Yen per \(quote.name.lowercased())")
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
                        rateInput = CurrencyText.rate(rateStore.effectiveRate.yenPerUnit)
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

                    Text(sourceDetail)
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
                            rateInput = CurrencyText.rate(rateStore.effectiveRate.yenPerUnit)
                        }
                    } label: {
                        Label("Refresh", systemImage: "arrow.clockwise")
                    }
                    .buttonStyle(YenButtonStyle())

                    Button {
                        rateStore.resetToFallback()
                        rateInput = CurrencyText.rate(rateStore.effectiveRate.yenPerUnit)
                    } label: {
                        Text("Reset")
                    }
                    .buttonStyle(YenButtonStyle())
                }
            }
            .padding(18)
        }
        .background(Color.ysPaper)
        .navigationTitle("Rate")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    sheetDestination = .tips
                } label: {
                    Image(systemName: "heart")
                }
                .tint(Color.ysAccent)
                .accessibilityLabel("Support the maker")
            }
        }
        .confirmationDialog("Home currency", isPresented: $showCurrencyPicker, titleVisibility: .visible) {
            ForEach(SupportedCurrency.all) { currency in
                Button("\(currency.name) (\(currency.symbol))") {
                    rateStore.setSelectedQuote(currency.code)
                    rateInput = CurrencyText.rate(rateStore.effectiveRate.yenPerUnit)
                }
            }
            Button("Cancel", role: .cancel) {}
        }
        .onChange(of: rateStore.effectiveRate.yenPerUnit) { _, nextRate in
            rateInput = CurrencyText.rate(nextRate)
        }
    }

    private var homeCurrencyRow: some View {
        Button {
            if store.isPro {
                showCurrencyPicker = true
            } else {
                sheetDestination = .paywall
            }
        } label: {
            HStack(spacing: 12) {
                Image(systemName: "globe")
                    .foregroundStyle(Color.ysAccent)
                    .frame(width: 24)
                VStack(alignment: .leading, spacing: 2) {
                    Text("Home currency")
                        .font(.headline)
                        .foregroundStyle(Color.ysInk)
                    Text("\(quote.name) (\(quote.code))")
                        .font(.subheadline)
                        .foregroundStyle(Color.ysMutedInk)
                }
                Spacer(minLength: 0)
                Image(systemName: store.isPro ? "chevron.right" : "lock")
                    .foregroundStyle(Color.ysMutedInk)
            }
            .panelCard()
        }
        .buttonStyle(.plain)
    }

    private var sourceDetail: String {
        if rateStore.effectiveRate.isFallback {
            return "Offline estimate: ¥\(CurrencyText.rate(rateStore.effectiveRate.yenPerUnit)) = \(quote.symbol)1."
        }

        return "Last rate: ¥\(CurrencyText.rate(rateStore.effectiveRate.yenPerUnit)) = \(quote.symbol)1."
    }

    private func applyManualRate() {
        let nextRate = CurrencyMath.parseDecimalInput(rateInput)
        guard nextRate > 0 else {
            return
        }

        rateStore.setManualRate(nextRate)
        rateInput = CurrencyText.rate(nextRate)
    }
}

#Preview {
    NavigationStack {
        RateSettingsView(rateStore: RateStore(), sheetDestination: .constant(nil))
            .environmentObject(StoreManager())
    }
}
