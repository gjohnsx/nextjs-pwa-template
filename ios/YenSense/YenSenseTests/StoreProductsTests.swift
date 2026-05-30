import XCTest
@testable import YenSense

final class StoreProductsTests: XCTestCase {
    func testProIDIsStable() {
        XCTAssertEqual(StoreProducts.proID, "com.gregjohns.yensense.pro")
    }

    func testTipIDsAreOrderedLowToHigh() {
        XCTAssertEqual(StoreProducts.tipIDs, [
            "com.gregjohns.yensense.tip.coffee",
            "com.gregjohns.yensense.tip.bento",
            "com.gregjohns.yensense.tip.feast",
        ])
    }

    func testEntitlementFromIDs() {
        XCTAssertTrue(StoreProducts.isProEntitled(from: ["com.gregjohns.yensense.pro"]))
        XCTAssertFalse(StoreProducts.isProEntitled(from: ["com.gregjohns.yensense.tip.coffee"]))
        XCTAssertFalse(StoreProducts.isProEntitled(from: []))
    }
}
