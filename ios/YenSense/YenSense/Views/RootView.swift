import SwiftUI

enum SheetDestination: String, Identifiable {
    case practice
    case rate

    var id: String {
        rawValue
    }
}

struct RootView: View {
    @StateObject private var rateStore = RateStore()
    @StateObject private var quizStore = QuizStore()
    @State private var sheetDestination: SheetDestination?

    var body: some View {
        ConverterView(rateStore: rateStore, sheetDestination: $sheetDestination)
            .sheet(item: $sheetDestination) { destination in
                NavigationStack {
                    switch destination {
                    case .practice:
                        PracticeView(
                            quizStore: quizStore,
                            yenPerUSD: rateStore.effectiveRate.yenPerUSD
                        )
                    case .rate:
                        RateSettingsView(rateStore: rateStore)
                    }
                }
                .presentationDetents([.medium, .large])
            }
            .task {
                await rateStore.refreshIfStale()
            }
    }
}

#Preview {
    RootView()
}
