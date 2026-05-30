import Foundation

enum StoreProducts {
    static let proID = "com.gregjohns.yensense.pro"
    static let tipIDs = [
        "com.gregjohns.yensense.tip.coffee",
        "com.gregjohns.yensense.tip.bento",
        "com.gregjohns.yensense.tip.feast",
    ]
    static let all: [String] = [proID] + tipIDs

    /// Pure helper so entitlement logic is unit-testable without StoreKit.
    static func isProEntitled(from entitledProductIDs: some Sequence<String>) -> Bool {
        entitledProductIDs.contains(proID)
    }
}
