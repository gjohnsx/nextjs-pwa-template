import SwiftUI
import StoreKit

struct TipJarView: View {
    @EnvironmentObject private var store: StoreManager
    @State private var thanked = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                heroCard

                if store.tipProducts.isEmpty {
                    emptyStoreState
                } else {
                    VStack(alignment: .leading, spacing: 10) {
                        ForEach(store.tipProducts, id: \.id) { tip in
                            TipTierButton(product: tip, tone: tone(for: tip)) {
                                Task {
                                    thanked = await store.purchase(tip)
                                }
                            }
                        }
                    }
                }

                if let purchaseError = store.purchaseError {
                    Text(purchaseError)
                        .font(.callout.weight(.semibold))
                        .foregroundStyle(Color.ysAccent)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .panelCard()
                }

                if thanked {
                    thankYouCard
                }
            }
            .padding(18)
        }
        .background(Color.ysPaper)
        .navigationTitle("Tip Jar")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var heroCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .top, spacing: 14) {
                VStack(alignment: .leading, spacing: 10) {
                    Text("Support Yen Sense")
                        .font(.system(size: 29, weight: .heavy, design: .serif))
                        .foregroundStyle(Color.ysInk)
                        .fixedSize(horizontal: false, vertical: true)

                    Text("Tips help keep Yen Sense free, private, and refreshingly uncluttered.")
                        .font(.callout)
                        .foregroundStyle(Color.ysMutedInk)
                        .fixedSize(horizontal: false, vertical: true)
                }

                Spacer(minLength: 4)

                Image("TipJarHost")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 108, height: 108)
                    .accessibilityHidden(true)
            }

            HStack(spacing: 8) {
                TipJarBadge(title: "No ads", systemImage: "eye.slash")
                TipJarBadge(title: "No tracking", systemImage: "lock")
            }
        }
        .padding(18)
        .background(Color.ysPanel)
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(Color.ysLine, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }

    @ViewBuilder
    private var emptyStoreState: some View {
        if store.isLoading {
            HStack(spacing: 10) {
                ProgressView()
                Text("Loading tips...")
                    .font(.callout)
                    .foregroundStyle(Color.ysMutedInk)
            }
            .frame(maxWidth: .infinity, minHeight: 52)
            .panelCard()
        } else {
            VStack(alignment: .leading, spacing: 12) {
                Text("Couldn't load tips right now.")
                    .font(.headline)
                    .foregroundStyle(Color.ysInk)

                Text("The jar is still here. Try again when StoreKit is ready.")
                    .font(.callout)
                    .foregroundStyle(Color.ysMutedInk)

                Button {
                    Task {
                        await store.refresh()
                    }
                } label: {
                    Label("Try again", systemImage: "arrow.clockwise")
                }
                .buttonStyle(YenButtonStyle())
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .panelCard()
        }
    }

    private var thankYouCard: some View {
        HStack(spacing: 14) {
            Image("TipJarThanks")
                .resizable()
                .scaledToFit()
                .frame(width: 74, height: 74)
                .accessibilityHidden(true)

            VStack(alignment: .leading, spacing: 4) {
                Text("ありがとう — thank you!")
                    .font(.headline)
                    .foregroundStyle(Color.ysInk)

                Text("That little boost helps keep this travel tool quiet, useful, and independent.")
                    .font(.caption)
                    .foregroundStyle(Color.ysMutedInk)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .background(Color.ysAccentSoft.opacity(0.65))
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(Color.ysAccent.opacity(0.18), lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }

    private func tone(for product: Product) -> TipTierTone {
        switch product.id {
        case "com.gregjohns.yensense.tip.coffee":
            return TipTierTone(
                assetName: "CoffeeTipIcon",
                tint: Color.ysAccent,
                caption: "A warm nod for a no-ad app."
            )
        case "com.gregjohns.yensense.tip.bento":
            return TipTierTone(
                assetName: "BentoTipIcon",
                tint: Color(red: 69 / 255, green: 90 / 255, blue: 126 / 255),
                caption: "A tiny travel snack for the road."
            )
        default:
            return TipTierTone(
                assetName: "FeastTipIcon",
                tint: Color(red: 127 / 255, green: 139 / 255, blue: 98 / 255),
                caption: "A generous sendoff for future polish."
            )
        }
    }
}

private struct TipJarBadge: View {
    let title: String
    let systemImage: String

    var body: some View {
        Label(title, systemImage: systemImage)
            .font(.caption.weight(.bold))
            .foregroundStyle(Color.ysInk)
            .padding(.horizontal, 10)
            .padding(.vertical, 7)
            .background(Color.ysField)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(Color.ysLine, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}

private struct TipTierTone {
    let assetName: String
    let tint: Color
    let caption: String
}

private struct TipTierButton: View {
    let product: Product
    let tone: TipTierTone
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 13) {
                ZStack {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(tone.tint.opacity(0.08))
                    Image(tone.assetName)
                        .resizable()
                        .scaledToFit()
                        .padding(3)
                        .accessibilityHidden(true)
                }
                .frame(width: 54, height: 54)

                VStack(alignment: .leading, spacing: 3) {
                    Text(product.displayName)
                        .font(.headline)
                        .foregroundStyle(Color.ysInk)

                    Text(tone.caption)
                        .font(.caption)
                        .foregroundStyle(Color.ysMutedInk)
                        .fixedSize(horizontal: false, vertical: true)
                }

                Spacer(minLength: 8)

                Text(product.displayPrice)
                    .font(.headline.weight(.bold))
                    .foregroundStyle(Color.ysInk)
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.ysPanel)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(Color.ysLine, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 8))
        }
        .buttonStyle(.plain)
        .accessibilityHint("Purchases \(product.displayName) through StoreKit.")
    }
}

#Preview {
    NavigationStack {
        TipJarView()
            .environmentObject(StoreManager())
    }
}
