import SwiftUI

enum SheetDestination: String, Identifiable {
    case rate
    case paywall
    case tips

    var id: String {
        rawValue
    }

    var detents: Set<PresentationDetent> {
        switch self {
        case .paywall, .tips:
            return [.large]
        case .rate:
            return [.medium, .large]
        }
    }
}

struct RootView: View {
    @StateObject private var rateStore = RateStore()
    @StateObject private var quizStore = QuizStore()
    @StateObject private var store = StoreManager()
    @State private var sheetDestination: SheetDestination?
    @State private var showPractice = false

    var body: some View {
        ConverterView(rateStore: rateStore, sheetDestination: $sheetDestination, showPractice: $showPractice)
            .environmentObject(store)
            .fullScreenCover(isPresented: $showPractice) {
                NavigationStack {
                    PracticeView(
                        quizStore: quizStore,
                        yenPerUnit: rateStore.effectiveRate.yenPerUnit,
                        quote: rateStore.effectiveRate.quote
                    )
                }
                .environmentObject(store)
            }
            .sheet(item: $sheetDestination) { destination in
                NavigationStack {
                    switch destination {
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
                .presentationDetents(destination.detents)
                .presentationDragIndicator(.visible)
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
                guard url.scheme == "yensense" else { return }
                switch url.host {
                case "paywall":
                    sheetDestination = .paywall
                case "rate":
                    sheetDestination = .rate
                case "tips":
                    sheetDestination = .tips
                default:
                    break
                }
            }
    }
}

#Preview {
    RootView()
}
