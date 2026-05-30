import SwiftUI

struct PracticeView: View {
    @ObservedObject var quizStore: QuizStore
    var yenPerUSD: Double

    @State private var guessInput = ""
    @State private var result: QuizResult?

    private var exactUSD: Double {
        CurrencyMath.convertYenToUSD(quizStore.currentAmount.yen, yenPerUSD: yenPerUSD)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                summaryGrid

                VStack(alignment: .leading, spacing: 10) {
                    Text(quizStore.currentAmount.label)
                        .font(.caption.weight(.bold))
                        .textCase(.uppercase)
                        .foregroundStyle(Color.ysMutedInk)
                    Text("¥\(CurrencyText.yen(quizStore.currentAmount.yen))")
                        .font(.system(size: 58, weight: .heavy, design: .serif))
                        .foregroundStyle(Color.ysInk)
                }
                .panelCard()

                VStack(alignment: .leading, spacing: 8) {
                    Text("USD estimate")
                        .font(.caption.weight(.bold))
                        .textCase(.uppercase)
                        .foregroundStyle(Color.ysMutedInk)

                    HStack(spacing: 0) {
                        Text("$")
                            .font(.system(size: 34, weight: .bold, design: .serif))
                            .foregroundStyle(Color.ysAccent)
                            .frame(width: 48)
                        TextField("0.00", text: $guessInput)
                            .keyboardType(.decimalPad)
                            .font(.system(size: 40, weight: .bold, design: .monospaced))
                    }
                    .padding(.vertical, 8)
                    .background(Color.ysField)
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(Color.ysLine, lineWidth: 1)
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                }

                if let result {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text("Box \(result.stats.boxLevel)")
                            Spacer()
                            Text(result.rating.label)
                        }
                        .font(.caption.weight(.bold))
                        .textCase(.uppercase)
                        .foregroundStyle(Color.ysMutedInk)

                        Text(CurrencyText.usdCompact(result.exactUSD))
                            .font(.system(size: 42, weight: .bold, design: .monospaced))
                            .foregroundStyle(Color.ysInk)

                        Text("\(result.errorPercent, specifier: "%.1f")% away")
                            .font(.caption.weight(.bold))
                            .textCase(.uppercase)
                            .foregroundStyle(Color.ysMutedInk)
                    }
                    .panelCard()
                }

                HStack(spacing: 8) {
                    Button {
                        result == nil ? submitGuess() : nextQuestion()
                    } label: {
                        Label(result == nil ? "Check" : "Next", systemImage: result == nil ? "checkmark" : "chevron.forward.2")
                    }
                    .buttonStyle(YenButtonStyle(prominent: true))

                    Button {
                        quizStore.reset()
                        guessInput = ""
                        result = nil
                    } label: {
                        Label("Reset", systemImage: "arrow.counterclockwise")
                    }
                    .buttonStyle(YenButtonStyle())
                }
            }
            .padding(18)
        }
        .background(Color.ysPaper)
        .navigationTitle("Practice")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var summaryGrid: some View {
        let summary = quizStore.summary
        let rows: [(String, Int)] = [
            ("due", summary.dueNow),
            ("seen", summary.practiced),
            ("solid", summary.mastered),
            ("streak", summary.bestStreak),
        ]

        return HStack(spacing: 0) {
            ForEach(rows, id: \.0) { label, value in
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

    private func submitGuess() {
        let guessUSD = CurrencyMath.parseUSDInput(guessInput)
        guard guessUSD > 0 else {
            return
        }

        result = quizStore.recordAnswer(guessUSD: guessUSD, exactUSD: exactUSD)
    }

    private func nextQuestion() {
        quizStore.nextQuestion(excluding: quizStore.currentAmount.id)
        guessInput = ""
        result = nil
    }
}

#Preview {
    NavigationStack {
        PracticeView(quizStore: QuizStore(), yenPerUSD: 150)
    }
}
