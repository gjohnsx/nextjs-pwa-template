import SwiftUI
import StoreKit

struct PaywallView: View {
    @EnvironmentObject private var store: StoreManager
    @Environment(\.dismiss) private var dismiss

    private let features: [(String, String, String)] = [
        ("brain.head.profile", "Full Practice deck", "Master every price tier, with long-term progress & insights."),
        ("globe", "Your home currency", "Convert yen to EUR, GBP, AUD, KRW and more — not just USD."),
        ("rectangle.3.group", "Home Screen widget", "The live rate, one glance away."),
    ]
    private let privacyURL = URL(string: "https://yen-sense.vercel.app/privacy")!
    private let termsURL = URL(string: "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/")!

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                Text("Yen Sense Pro")
                    .font(.system(size: 34, weight: .heavy, design: .serif))
                    .foregroundStyle(Color.ysInk)
                Text("One purchase. Yours forever — including features we add later.")
                    .font(.callout)
                    .foregroundStyle(Color.ysMutedInk)

                ForEach(features, id: \.0) { icon, title, detail in
                    HStack(alignment: .top, spacing: 12) {
                        Image(systemName: icon)
                            .foregroundStyle(Color.ysAccent)
                            .frame(width: 28)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(title)
                                .font(.headline)
                                .foregroundStyle(Color.ysInk)
                            Text(detail)
                                .font(.subheadline)
                                .foregroundStyle(Color.ysMutedInk)
                        }
                        Spacer(minLength: 0)
                    }
                    .panelCard()
                }

                VStack(spacing: 6) {
                    Text("No ads. No tracking.")
                        .font(.caption.weight(.bold))
                        .textCase(.uppercase)
                        .foregroundStyle(Color.ysMutedInk)
                    HStack(spacing: 16) {
                        Link("Privacy", destination: privacyURL)
                        Link("Terms", destination: termsURL)
                    }
                    .font(.caption)
                    .foregroundStyle(Color.ysAccent)
                }
                .frame(maxWidth: .infinity)
            }
            .padding(18)
        }
        .background(Color.ysPaper)
        .safeAreaInset(edge: .bottom) {
            VStack(spacing: 12) {
                if let pro = store.proProduct {
                    Button {
                        Task {
                            if await store.purchase(pro), store.isPro { dismiss() }
                        }
                    } label: {
                        Label("Unlock for \(pro.displayPrice)", systemImage: "checkmark")
                    }
                    .buttonStyle(YenButtonStyle(prominent: true))
                } else if store.isLoading {
                    Button {
                    } label: {
                        HStack(spacing: 8) {
                            ProgressView()
                                .tint(Color.ysPanel)
                            Text("Unlock Pro")
                        }
                    }
                    .buttonStyle(YenButtonStyle(prominent: true))
                    .disabled(true)
                } else {
                    Button {
                        Task { await store.refresh() }
                    } label: {
                        Label("Try Again", systemImage: "arrow.clockwise")
                    }
                    .buttonStyle(YenButtonStyle(prominent: true))
                }

                Button("Restore Purchases") {
                    Task {
                        await store.restore()
                        if store.isPro { dismiss() }
                    }
                }
                .font(.subheadline)
                .foregroundStyle(Color.ysMutedInk)

                Text("One purchase. No subscription.")
                    .font(.caption.weight(.bold))
                    .textCase(.uppercase)
                    .foregroundStyle(Color.ysMutedInk)
            }
            .frame(maxWidth: .infinity)
            .padding(.horizontal, 18)
            .padding(.top, 12)
            .padding(.bottom, 8)
            .background(
                Color.ysPaper
                    .overlay(alignment: .top) {
                        Rectangle()
                            .fill(Color.ysLine)
                            .frame(height: 1)
                    }
                    .ignoresSafeArea(edges: .bottom)
            )
        }
        .navigationTitle("Yen Sense Pro")
        .navigationBarTitleDisplayMode(.inline)
        .alert("Store", isPresented: .constant(store.purchaseError != nil)) {
            Button("OK") { store.purchaseError = nil }
        } message: {
            Text(store.purchaseError ?? "")
        }
    }
}

#Preview {
    NavigationStack {
        PaywallView()
            .environmentObject(StoreManager())
    }
}
