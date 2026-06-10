import SwiftUI
import StoreKit

/// Full-screen practice experience: a round of cards (playing → in-card
/// reveal), ending in a round summary.
struct PracticeView: View {
    @ObservedObject var quizStore: QuizStore
    var yenPerUnit: Double
    var quote: SupportedCurrency

    @EnvironmentObject private var store: StoreManager
    @Environment(\.requestReview) private var requestReview
    @Environment(\.dismiss) private var dismiss

    @State private var round = PracticeRound(cards: [])
    @State private var guessInput = GuessInput()
    @State private var showSummary = false
    @State private var showHistory = false
    @State private var showPaywall = false
    @State private var revealCount = 0
    @State private var lastRating: QuizRating?

    private let reviewPrompter = ReviewPrompter()

    var body: some View {
        VStack(spacing: 0) {
            topBar
                .padding(.horizontal, 18)
                .padding(.top, 8)

            if showSummary {
                RoundSummaryView(
                    round: round,
                    quote: quote,
                    summary: quizStore.summary,
                    isPro: store.isPro,
                    onAnotherRound: startRound,
                    onDone: { dismiss() },
                    onUnlock: { showPaywall = true }
                )
                .transition(.opacity.combined(with: .move(edge: .bottom)))
            } else {
                playArea
            }
        }
        .background(Color.ysPaper.ignoresSafeArea())
        .toolbar(.hidden, for: .navigationBar)
        .navigationDestination(isPresented: $showHistory) {
            PracticeHistoryView(quizStore: quizStore)
        }
        .sheet(isPresented: $showPaywall) {
            NavigationStack {
                PaywallView()
            }
            .environmentObject(store)
        }
        .sensoryFeedback(trigger: revealCount) { _, _ in
            switch lastRating {
            case .nailed, .strong:
                .success
            case .close:
                .impact(flexibility: .soft)
            case .repeatPractice, nil:
                .impact(weight: .light, intensity: 0.6)
            }
        }
        .onAppear {
            if round.count == 0 {
                startRound()
            }
        }
    }

    private var playArea: some View {
        VStack(alignment: .leading, spacing: 14) {
            if let entry = round.currentEntry {
                Spacer(minLength: 0)

                PracticeCardView(entry: entry, quote: quote)
                    .id(entry.id)
                    .transition(.asymmetric(
                        insertion: .move(edge: .trailing).combined(with: .opacity),
                        removal: .move(edge: .leading).combined(with: .opacity)
                    ))

                Spacer(minLength: 0)

                if entry.result == nil {
                    GuessKeypad(input: $guessInput, symbol: quote.symbol, onSubmit: submitGuess)
                        .transition(.opacity)
                } else {
                    Button {
                        advance()
                    } label: {
                        Label(
                            round.isOnLastCard ? "See results" : "Next card",
                            systemImage: round.isOnLastCard ? "flag.checkered" : "chevron.forward.2"
                        )
                    }
                    .buttonStyle(YenButtonStyle(prominent: true))
                    .transition(.opacity)
                }
            }
        }
        .padding(18)
        .frame(maxWidth: 540)
        .frame(maxWidth: .infinity)
        .animation(.spring(duration: 0.45), value: round.currentIndex)
        .animation(.spring(duration: 0.45), value: round.answeredCount)
    }

    private var topBar: some View {
        HStack(spacing: 12) {
            Button {
                dismiss()
            } label: {
                Image(systemName: "xmark")
                    .font(.body.weight(.bold))
                    .frame(width: 44, height: 44)
            }
            .foregroundStyle(Color.ysInk)
            .background(Color.ysPanel)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(Color.ysLine, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 8))

            Spacer()

            if !showSummary {
                progressSegments
            }

            Spacer()

            Button {
                if store.isPro {
                    showHistory = true
                } else {
                    showPaywall = true
                }
            } label: {
                Image(systemName: store.isPro ? "clock.arrow.circlepath" : "lock")
                    .font(.body.weight(.bold))
                    .frame(width: 44, height: 44)
            }
            .foregroundStyle(Color.ysInk)
            .background(Color.ysPanel)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(Color.ysLine, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 8))
        }
    }

    private var progressSegments: some View {
        HStack(spacing: 5) {
            ForEach(0..<max(round.count, 1), id: \.self) { index in
                Capsule()
                    .fill(index < round.answeredCount ? Color.ysAccent : Color.ysLine)
                    .frame(width: 22, height: 5)
            }
        }
        .animation(.spring(duration: 0.4), value: round.answeredCount)
    }

    private func startRound() {
        withAnimation(.spring(duration: 0.45)) {
            round = PracticeRound(cards: quizStore.drawRound())
            guessInput.clear()
            showSummary = false
        }
    }

    private func submitGuess() {
        guard let entry = round.currentEntry, guessInput.value > 0 else {
            return
        }

        let exact = CurrencyMath.convertYen(entry.amount.yen, yenPerUnit: yenPerUnit)
        let result = quizStore.recordAnswer(for: entry.amount, guess: guessInput.value, exact: exact)
        lastRating = result.rating
        revealCount += 1
        withAnimation(.spring(duration: 0.45)) {
            round.recordCurrent(guess: guessInput.value, result: result)
        }
    }

    private func advance() {
        if round.isOnLastCard {
            withAnimation(.spring(duration: 0.45)) {
                showSummary = true
            }
            reviewPrompter.registerEvent(.practiceSessionCompleted) {
                requestReview()
            }
            return
        }

        guessInput.clear()
        withAnimation(.spring(duration: 0.45)) {
            round.advance()
        }
    }
}

#Preview {
    NavigationStack {
        PracticeView(quizStore: QuizStore(), yenPerUnit: 150, quote: .usd)
            .environmentObject(StoreManager())
    }
}
