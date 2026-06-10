import SwiftUI

private enum GuessKey: Hashable {
    case digit(String)
    case decimal
    case backspace
}

private let guessKeys: [GuessKey] = [
    .digit("7"), .digit("8"), .digit("9"),
    .digit("4"), .digit("5"), .digit("6"),
    .digit("1"), .digit("2"), .digit("3"),
    .decimal, .digit("0"), .backspace,
]

struct GuessKeypad: View {
    @Binding var input: GuessInput
    var symbol: String
    var onSubmit: () -> Void

    @State private var keyTaps = 0
    @State private var lastKeyWasBackspace = false

    private var canSubmit: Bool {
        input.value > 0
    }

    var body: some View {
        VStack(spacing: 10) {
            displayRow

            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 3), spacing: 8) {
                ForEach(guessKeys, id: \.self) { key in
                    keyButton(for: key)
                }
            }

            Button {
                onSubmit()
            } label: {
                Label("Check", systemImage: "checkmark")
            }
            .buttonStyle(YenButtonStyle(prominent: true))
            .disabled(!canSubmit)
            .opacity(canSubmit ? 1 : 0.45)
            .sensoryFeedback(.impact(weight: .medium), trigger: canSubmit) { _, newValue in
                newValue
            }
        }
        .sensoryFeedback(trigger: keyTaps) { _, _ in
            lastKeyWasBackspace ? .impact(flexibility: .rigid) : .impact(weight: .light)
        }
    }

    private var displayRow: some View {
        HStack(spacing: 0) {
            Text(symbol)
                .font(.system(size: 30, weight: .bold, design: .serif))
                .foregroundStyle(Color.ysAccent)
                .frame(width: 48, height: 58)
                .overlay(alignment: .trailing) {
                    Rectangle().fill(Color.ysLine).frame(width: 1)
                }

            Text(input.isEmpty ? "0" : input.display)
                .font(.system(size: 34, weight: .bold, design: .monospaced))
                .minimumScaleFactor(0.5)
                .lineLimit(1)
                .foregroundStyle(input.isEmpty ? Color.ysFaintInk : Color.ysInk)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 12)
                .contentTransition(.numericText())
        }
        .frame(height: 58)
        .background(Color.ysField)
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(Color.ysLine, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }

    private func keyButton(for key: GuessKey) -> some View {
        Button {
            withAnimation(.snappy(duration: 0.18)) {
                switch key {
                case .digit(let digit):
                    input.appendDigit(digit)
                case .decimal:
                    input.appendDecimalSeparator()
                case .backspace:
                    input.backspace()
                }
            }
            lastKeyWasBackspace = key == .backspace
            keyTaps += 1
        } label: {
            switch key {
            case .digit(let digit):
                Text(digit)
                    .font(.system(size: 24, weight: .bold, design: .monospaced))
            case .decimal:
                Text(".")
                    .font(.system(size: 24, weight: .bold, design: .monospaced))
            case .backspace:
                Image(systemName: "delete.left")
                    .font(.title3.weight(.bold))
            }
        }
        .buttonStyle(YenButtonStyle())
    }
}

#Preview {
    struct KeypadPreview: View {
        @State private var input = GuessInput()

        var body: some View {
            GuessKeypad(input: $input, symbol: "$") {}
                .padding(18)
                .background(Color.ysPaper)
        }
    }

    return KeypadPreview()
}
