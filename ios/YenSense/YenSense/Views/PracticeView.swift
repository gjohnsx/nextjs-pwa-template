import SwiftUI
import StoreKit

struct PracticeView: View {
    @ObservedObject var quizStore: QuizStore
    var yenPerUnit: Double
    var quote: SupportedCurrency
    @Binding var sheetDestination: SheetDestination?

    @EnvironmentObject private var store: StoreManager
    @Environment(\.requestReview) private var requestReview

    @State private var guessInput = ""
    @State private var result: QuizResult?
    @State private var showHistory = false

    private var exactAmount: Double {
        CurrencyMath.convertYen(quizStore.currentAmount.yen, yenPerUnit: yenPerUnit)
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
                    Text("\(quote.code) estimate")
                        .font(.caption.weight(.bold))
                        .textCase(.uppercase)
                        .foregroundStyle(Color.ysMutedInk)

                    HStack(spacing: 0) {
                        Text(quote.symbol)
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

                        Text(CurrencyText.amountCompact(result.exactUSD, currency: quote))
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

                if !store.isPro {
                    unlockCTA
                }
            }
            .padding(18)
        }
        .background(Color.ysPaper)
        .navigationTitle("Practice")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    if store.isPro {
                        showHistory = true
                    } else {
                        sheetDestination = .paywall
                    }
                } label: {
                    Label("History", systemImage: store.isPro ? "clock.arrow.circlepath" : "lock")
                }
            }
        }
        .navigationDestination(isPresented: $showHistory) {
            PracticeHistoryView(quizStore: quizStore)
        }
    }

    private var unlockCTA: some View {
        Button {
            sheetDestination = .paywall
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
        let guess = CurrencyMath.parseDecimalInput(guessInput)
        guard guess > 0 else {
            return
        }

        let answeredResult = quizStore.recordAnswer(guessUSD: guess, exactUSD: exactAmount)
        result = answeredResult
        maybeRequestReview(after: answeredResult)
    }

    /// Ask for an App Store review once per install, after the user has had a
    /// few successful Practice sessions. Guarded by a UserDefaults counter.
    private func maybeRequestReview(after result: QuizResult) {
        guard result.rating != .repeatPractice else {
            return
        }

        let defaults = UserDefaults.standard
        guard !defaults.bool(forKey: Self.reviewRequestedKey) else {
            return
        }

        let count = defaults.integer(forKey: Self.successfulSessionCountKey) + 1
        defaults.set(count, forKey: Self.successfulSessionCountKey)

        if count >= 3 {
            defaults.set(true, forKey: Self.reviewRequestedKey)
            requestReview()
        }
    }

    private static let successfulSessionCountKey = "practice.successfulSessionCount"
    private static let reviewRequestedKey = "practice.reviewRequested"

    private func nextQuestion() {
        quizStore.nextQuestion(excluding: quizStore.currentAmount.id)
        guessInput = ""
        result = nil
    }
}

#Preview {
    NavigationStack {
        PracticeView(quizStore: QuizStore(), yenPerUnit: 150, quote: .usd, sheetDestination: .constant(nil))
            .environmentObject(StoreManager())
    }
}
