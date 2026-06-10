import SwiftUI

/// End-of-round screen: overall accuracy, per-card results, streak callouts,
/// and (for free users) the single Pro unlock slot.
struct RoundSummaryView: View {
    var round: PracticeRound
    var quote: SupportedCurrency
    var summary: QuizSummary
    var isPro: Bool
    var onAnotherRound: () -> Void
    var onDone: () -> Void
    var onUnlock: () -> Void

    private var averageError: Double {
        round.averageErrorPercent ?? 0
    }

    private var headline: String {
        switch QuizScoring.rating(for: averageError) {
        case .nailed:
            "Sharp yen sense"
        case .strong:
            "Strong round"
        case .close:
            "Getting close"
        case .repeatPractice:
            "Keep practicing"
        }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                header

                VStack(spacing: 8) {
                    ForEach(round.entries) { entry in
                        entryRow(entry)
                    }
                }

                streakStrip

                if !isPro {
                    unlockCard
                }

                Button {
                    onAnotherRound()
                } label: {
                    Label("Another round", systemImage: "arrow.clockwise")
                }
                .buttonStyle(YenButtonStyle(prominent: true))

                Button {
                    onDone()
                } label: {
                    Text("Done")
                }
                .buttonStyle(YenButtonStyle())
            }
            .padding(18)
        }
        .background(Color.ysPaper)
        .sensoryFeedback(.success, trigger: round.isComplete) { _, newValue in
            newValue
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Round complete")
                .font(.caption.weight(.bold))
                .textCase(.uppercase)
                .foregroundStyle(Color.ysMutedInk)
            Text(headline)
                .font(.system(size: 40, weight: .heavy, design: .serif))
                .minimumScaleFactor(0.6)
                .lineLimit(1)
                .foregroundStyle(Color.ysInk)
            Text(averageError <= 20
                ? "Within \(averageError, specifier: "%.1f")% on average"
                : "Off by \(averageError, specifier: "%.0f")% on average")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(Color.ysMutedInk)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .panelCard(background: averageError <= 10 ? Color.ysSage.opacity(0.6) : .ysPanel)
    }

    private func entryRow(_ entry: PracticeRound.Entry) -> some View {
        HStack(alignment: .center, spacing: 12) {
            VStack(alignment: .leading, spacing: 2) {
                Text(entry.amount.label)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Color.ysInk)
                Text("¥\(CurrencyText.yen(entry.amount.yen))")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(Color.ysMutedInk)
            }

            Spacer(minLength: 12)

            if let result = entry.result, let guess = entry.guess {
                VStack(alignment: .trailing, spacing: 2) {
                    Text("\(CurrencyText.amountCompact(guess, currency: quote)) → \(CurrencyText.amountCompact(result.exactUSD, currency: quote))")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(Color.ysInk)
                    Text(result.rating.label)
                        .font(.caption2.weight(.bold))
                        .textCase(.uppercase)
                        .foregroundStyle(result.rating == .repeatPractice ? Color.ysAccent : Color.ysMutedInk)
                }
            } else {
                Text("skipped")
                    .font(.caption2.weight(.bold))
                    .textCase(.uppercase)
                    .foregroundStyle(Color.ysFaintInk)
            }
        }
        .panelCard()
    }

    private var streakStrip: some View {
        HStack {
            Label("best streak \(summary.bestStreak)", systemImage: "flame")
            Spacer()
            Label("\(summary.mastered) solid", systemImage: "checkmark.seal")
        }
        .font(.caption.weight(.bold))
        .textCase(.uppercase)
        .foregroundStyle(Color.ysMutedInk)
        .padding(12)
        .background(Color.ysSage)
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }

    private var unlockCard: some View {
        Button {
            onUnlock()
        } label: {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: "lock.open")
                    .foregroundStyle(Color.ysAccent)
                    .frame(width: 24)
                VStack(alignment: .leading, spacing: 2) {
                    Text("Unlock the full deck + history")
                        .font(.headline)
                        .foregroundStyle(Color.ysInk)
                    Text("Practice all 13 price tiers and track your progress over time.")
                        .font(.subheadline)
                        .foregroundStyle(Color.ysMutedInk)
                        .multilineTextAlignment(.leading)
                }
                Spacer(minLength: 0)
            }
            .panelCard()
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    var round = PracticeRound(cards: Array(QuizAmount.deck(isPro: false).prefix(5)))
    for _ in 0..<5 {
        round.recordCurrent(
            guess: 10,
            result: QuizResult(exactUSD: 11, errorPercent: 9.1, rating: .strong, stats: .empty)
        )
        round.advance()
    }

    return RoundSummaryView(
        round: round,
        quote: .usd,
        summary: QuizSummary(dueNow: 1, practiced: 5, mastered: 2, bestStreak: 4),
        isPro: false,
        onAnotherRound: {},
        onDone: {},
        onUnlock: {}
    )
}
