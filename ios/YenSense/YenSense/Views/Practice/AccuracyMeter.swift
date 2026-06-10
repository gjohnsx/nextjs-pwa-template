import SwiftUI

/// Horizontal gauge showing how far a guess was from the true amount.
/// The track spans 0–25%+ error, split into the four rating zones; a needle
/// springs to the user's error position when the meter appears.
struct AccuracyMeter: View {
    var errorPercent: Double

    @State private var needleProgress: CGFloat = 0

    private static let span: Double = 25
    private static let zones: [(width: Double, color: Color)] = [
        (5, .ysSageDeep),
        (5, .ysSage),
        (10, .ysAccentSoft),
        (5, .ysAccent),
    ]

    private var targetProgress: CGFloat {
        CGFloat(min(errorPercent, Self.span * 0.98) / Self.span)
    }

    var body: some View {
        VStack(spacing: 6) {
            GeometryReader { proxy in
                ZStack(alignment: .leading) {
                    HStack(spacing: 2) {
                        ForEach(Array(Self.zones.enumerated()), id: \.offset) { _, zone in
                            zone.color
                                .frame(width: max(0, (proxy.size.width - 6) * zone.width / Self.span))
                        }
                    }
                    .frame(height: 10)
                    .clipShape(Capsule())

                    Circle()
                        .fill(Color.ysInk)
                        .stroke(Color.ysPanel, lineWidth: 2)
                        .frame(width: 16, height: 16)
                        .offset(x: needleProgress * (proxy.size.width - 16))
                }
                .frame(maxHeight: .infinity, alignment: .center)
            }
            .frame(height: 16)

            HStack {
                Text("nailed")
                Spacer()
                Text("close")
                Spacer()
                Text("off")
            }
            .font(.caption2.weight(.bold))
            .textCase(.uppercase)
            .foregroundStyle(Color.ysMutedInk)
        }
        .onAppear {
            withAnimation(.spring(duration: 0.8, bounce: 0.35).delay(0.15)) {
                needleProgress = targetProgress
            }
        }
    }
}

#Preview {
    VStack(spacing: 24) {
        AccuracyMeter(errorPercent: 2)
        AccuracyMeter(errorPercent: 8)
        AccuracyMeter(errorPercent: 15)
        AccuracyMeter(errorPercent: 40)
    }
    .padding(18)
    .background(Color.ysPaper)
}
