import SwiftUI
import StoreKit

struct TipJarView: View {
    @EnvironmentObject private var store: StoreManager
    @State private var thanked = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                Text("Support the maker")
                    .font(.system(size: 28, weight: .heavy, design: .serif))
                    .foregroundStyle(Color.ysInk)
                Text("Yen Sense is free with no ads or tracking. Tips keep it that way.")
                    .font(.callout)
                    .foregroundStyle(Color.ysMutedInk)

                if store.tipProducts.isEmpty {
                    ProgressView()
                        .frame(maxWidth: .infinity)
                        .padding(.top, 8)
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
