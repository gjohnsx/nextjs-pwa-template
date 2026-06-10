import SwiftUI

/// The practice question card. The reveal happens in place: the card tints by
/// rating, the true amount counts up, and the accuracy meter springs in below.
struct PracticeCardView: View {
    var entry: PracticeRound.Entry
    var quote: SupportedCurrency

    @State private var displayedExact: Double = 0

    private var result: QuizResult? {
        entry.result
    }

    private var cardBackground: Color {
        switch result?.rating {
        case .nailed, .strong:
            Color.ysSage.opacity(0.6)
        case .close:
            Color.ysAccentSoft.opacity(0.5)
        case .repeatPractice:
            Color.ysAccentSoft.opacity(0.8)
        case nil:
            Color.ysPanel
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            VStack(alignment: .leading, spacing: 8) {
                Text(entry.amount.label)
                    .font(.caption.weight(.bold))
                    .textCase(.uppercase)
                    .foregroundStyle(Color.ysMutedInk)
                Text("¥\(CurrencyText.yen(entry.amount.yen))")
                    .font(.system(size: 54, weight: .heavy, design: .serif))
                    .minimumScaleFactor(0.5)
                    .lineLimit(1)
                    .foregroundStyle(Color.ysInk)
            }

            if let result {
                revealBlock(result)
                    .transition(.opacity.combined(with: .move(edge: .bottom)))
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .panelCard(background: cardBackground)
        .animation(.spring(duration: 0.45), value: result?.rating)
    }

    private func revealBlock(_ result: QuizResult) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Rectangle()
                .fill(Color.ysLine)
                .frame(height: 1)

            HStack {
                Text(ratingHeadline(result.rating))
                    .font(.caption.weight(.bold))
                    .textCase(.uppercase)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .foregroundStyle(Color.ysPanel)
                    .background(ratingColor(result.rating))
                    .clipShape(Capsule())

                Spacer()

                Text("\(result.errorPercent, specifier: "%.1f")% away")
                    .font(.caption.weight(.bold))
                    .textCase(.uppercase)
                    .foregroundStyle(Color.ysMutedInk)
            }

            Text(CurrencyText.amountCompact(displayedExact, currency: quote))
                .font(.system(size: 40, weight: .bold, design: .monospaced))
                .minimumScaleFactor(0.5)
                .lineLimit(1)
                .foregroundStyle(Color.ysInk)
                .contentTransition(.numericText(value: displayedExact))
                .onAppear {
                    displayedExact = result.exactUSD * 0.4
                    withAnimation(.easeOut(duration: 0.7)) {
                        displayedExact = result.exactUSD
                    }
                }

            if let guess = entry.guess {
                Text("your guess \(CurrencyText.amountCompact(guess, currency: quote))")
                    .font(.caption.weight(.bold))
                    .textCase(.uppercase)
                    .foregroundStyle(Color.ysMutedInk)
            }

            AccuracyMeter(errorPercent: result.errorPercent)
                .padding(.top, 2)
        }
    }

    private func ratingHeadline(_ rating: QuizRating) -> String {
        switch rating {
        case .nailed:
            "Nailed it"
        case .strong:
            "Strong"
        case .close:
            "Close"
        case .repeatPractice:
            "We'll repeat this one"
        }
    }

    private func ratingColor(_ rating: QuizRating) -> Color {
        switch rating {
        case .nailed, .strong:
            .ysSageDeep
        case .close, .repeatPractice:
            .ysAccent
        }
    }
}

#Preview("Question") {
    PracticeCardView(
        entry: PracticeRound.Entry(amount: QuizAmount.all[5]),
        quote: .usd
    )
    .padding(18)
    .background(Color.ysPaper)
}

#Preview("Revealed") {
    PracticeCardView(
        entry: PracticeRound.Entry(
            amount: QuizAmount.all[5],
            guess: 11.5,
            result: QuizResult(
                exactUSD: 12.0,
                errorPercent: 4.2,
                rating: .nailed,
                stats: .empty
            )
        ),
        quote: .usd
    )
    .padding(18)
    .background(Color.ysPaper)
}
