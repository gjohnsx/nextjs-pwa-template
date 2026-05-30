import SwiftUI

struct PracticeHistoryView: View {
    @ObservedObject var quizStore: QuizStore

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                ForEach(QuizAmount.all) { amount in
                    row(for: amount, stats: quizStore.stats(for: amount.id))
                }
            }
            .padding(18)
        }
        .background(Color.ysPaper)
        .navigationTitle("Progress")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func row(for amount: QuizAmount, stats: QuizStats) -> some View {
        HStack(alignment: .top, spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 6) {
                    Text(amount.label)
                        .font(.headline)
                        .foregroundStyle(Color.ysInk)
                    Text(amount.tier == .everyday ? "Free" : "Pro")
                        .font(.caption2.weight(.bold))
                        .textCase(.uppercase)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 3)
                        .foregroundStyle(Color.ysAccent)
                        .background(Color.ysAccentSoft)
                        .clipShape(Capsule())
                }
                Text("¥\(CurrencyText.yen(amount.yen))")
                    .font(.caption.weight(.bold))
                    .textCase(.uppercase)
                    .foregroundStyle(Color.ysMutedInk)
            }

            Spacer(minLength: 12)

            VStack(alignment: .trailing, spacing: 4) {
                Text("Box \(stats.boxLevel)")
                    .font(.caption.weight(.bold))
                    .textCase(.uppercase)
                    .foregroundStyle(Color.ysAccent)
                Text("streak \(stats.streak)")
                    .font(.caption2.weight(.bold))
                    .textCase(.uppercase)
                    .foregroundStyle(Color.ysMutedInk)
                Text(errorText(for: stats))
                    .font(.caption2.weight(.bold))
                    .textCase(.uppercase)
                    .foregroundStyle(Color.ysMutedInk)
            }
        }
        .panelCard()
    }

    private func errorText(for stats: QuizStats) -> String {
        guard let lastErrorPercent = stats.lastErrorPercent else {
            return "new"
        }

        return String(format: "+/-%.1f%%", lastErrorPercent)
    }
}

#Preview {
    NavigationStack {
        PracticeHistoryView(quizStore: QuizStore())
    }
}
