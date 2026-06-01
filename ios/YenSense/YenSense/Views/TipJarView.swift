import SwiftUI
import StoreKit

struct TipJarView: View {
    @EnvironmentObject private var store: StoreManager
    @State private var thanked = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                Text("Support the maker")
                    .font(.system(size: 26, weight: .heavy, design: .serif))
                    .foregroundStyle(Color.ysInk)
                Text("Yen Sense is free, with no ads or tracking. Tips are optional and keep it that way.")
                    .font(.callout)
                    .foregroundStyle(Color.ysMutedInk)

                if store.tipProducts.isEmpty {
                    if store.isLoading {
                        HStack(spacing: 10) {
                            ProgressView()
                            Text("Loading tips...")
                                .font(.callout)
                                .foregroundStyle(Color.ysMutedInk)
                        }
                        .frame(maxWidth: .infinity, minHeight: 48)
                        .panelCard()
                    } else {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Couldn't load tips right now.")
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
                } else {
                    ForEach(store.tipProducts, id: \.id) { tip in
                        Button {
                            Task {
                                thanked = await store.purchase(tip)
                            }
                        } label: {
                            HStack {
                                Text(tip.displayName)
                                Spacer()
                                Text(tip.displayPrice)
                            }
                            .padding(.horizontal, 16)
                        }
                        .buttonStyle(YenButtonStyle())
                    }
                }

                if thanked {
                    Text("ありがとう — thank you!")
                        .font(.headline)
                        .foregroundStyle(Color.ysAccent)
                }
            }
            .padding(18)
        }
        .background(Color.ysPaper)
        .navigationTitle("Tip Jar")
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    NavigationStack {
        TipJarView()
            .environmentObject(StoreManager())
    }
}
