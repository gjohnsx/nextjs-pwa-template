import SwiftUI

enum SheetDestination: String, Identifiable {
    case practice
    case rate
    case paywall
    case tips

    var id: String {
        rawValue
    }
}

struct RootView: View {
    @StateObject private var rateStore = RateStore()
    @StateObject private var quizStore = QuizStore()
    @StateObject private var store = StoreManager()
    @State private var sheetDestination: SheetDestination?

    var body: some View {
        ConverterView(rateStore: rateStore, sheetDestination: $sheetDestination)
            .environmentObject(store)
            .sheet(item: $sheetDestination) { destination in
                NavigationStack {
                    switch destination {
                    case .practice:
                        PracticeView(
                            quizStore: quizStore,
                            yenPerUnit: rateStore.effectiveRate.yenPerUnit,
                            quote: rateStore.effectiveRate.quote,
                            sheetDestination: $sheetDestination
                        )
                        .environmentObject(store)
                    case .rate:
                        RateSettingsView(
                            rateStore: rateStore,
                            sheetDestination: $sheetDestination
                        )
                        .environmentObject(store)
                    case .paywall:
                        PaywallView()
                            .environmentObject(store)
                    case .tips:
                        TipJarView()
                            .environmentObject(store)
                    }
                }
                .presentationDetents([.medium, .large])
            }
            .task {
                await rateStore.refreshIfStale()
            }
            .task {
                quizStore.setPro(store.isPro)
                if !store.isPro {
                    rateStore.setSelectedQuote(SupportedCurrency.usd.code)
                }
            }
            .onChange(of: store.isPro) { _, isPro in
                quizStore.setPro(isPro)
                if !isPro {
                    rateStore.setSelectedQuote(SupportedCurrency.usd.code)
                }
            }
            .onOpenURL { url in
                if url.scheme == "yensense", url.host == "paywall" {
                    sheetDestination = .paywall
                }
            }
    }
}

#Preview {
    RootView()
}
