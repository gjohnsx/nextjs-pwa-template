import SwiftUI

struct PracticeHistoryView: View {
    @ObservedObject var quizStore: QuizStore

    @State private var showResetConfirmation = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                summaryGrid

                ForEach(QuizAmount.all) { amount in
                    row(for: amount, stats: quizStore.stats(for: amount.id))
                }

                Button(role: .destructive) {
                    showResetConfirmation = true
                } label: {
                    Label("Reset all progress", systemImage: "arrow.counterclockwise")
                        .foregroundStyle(Color.ysAccent)
                }
                .buttonStyle(YenButtonStyle())
                .padding(.top, 8)
            }
            .padding(18)
        }
        .background(Color.ysPaper)
        .navigationTitle("Progress")
        .navigationBarTitleDisplayMode(.inline)
        .confirmationDialog(
            "Reset all practice progress?",
            isPresented: $showResetConfirmation,
            titleVisibility: .visible
        ) {
            Button("Reset everything", role: .destructive) {
                quizStore.reset()
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("Box levels, streaks, and history go back to zero. This can't be undone.")
        }
    }

    private var summaryGrid: some View {
        let summary = quizStore.summary
        let cells: [(String, Int)] = [
            ("due", summary.dueNow),
            ("seen", summary.practiced),
            ("solid", summary.mastered),
            ("streak", summary.bestStreak),
        ]

        return HStack(spacing: 0) {
            ForEach(cells, id: \.0) { label, value in
                VStack(spacing: 4) {
                    Text("\(value)")
                        .font(.system(.title2, design: .monospaced).weight(.bold))
                        .foregroundStyle(Color.ysInk)
                    Text(label)
                        .font(.caption2.weight(.bold))
                        .textCase(.uppercase)
                        .foregroundStyle(Color.ysMutedInk)
                }
                .frame(maxWidth: .infinity)
            }
        }
        .panelCard()
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
