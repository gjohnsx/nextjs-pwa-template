import XCTest
@testable import YenSense

final class GuessInputTests: XCTestCase {
    func testAppendsDigitsAndParses() {
        var input = GuessInput()
        input.appendDigit("1")
        input.appendDigit("2")
        XCTAssertEqual(input.display, "12")
        XCTAssertEqual(input.value, 12)
    }

    func testSingleDecimalSeparatorAndTwoDecimalLimit() {
        var input = GuessInput()
        input.appendDigit("3")
        input.appendDecimalSeparator()
        input.appendDecimalSeparator()
        input.appendDigit("5")
        input.appendDigit("7")
        input.appendDigit("9")
        XCTAssertEqual(input.display, "3.57")
        XCTAssertEqual(input.value, 3.57, accuracy: 0.0001)
    }

    func testLeadingDecimalReadsAsZeroPoint() {
        var input = GuessInput()
        input.appendDecimalSeparator()
        input.appendDigit("5")
        XCTAssertEqual(input.display, "0.5")
        XCTAssertEqual(input.value, 0.5, accuracy: 0.0001)
    }

    func testNoLeadingZeros() {
        var input = GuessInput()
        input.appendDigit("0")
        input.appendDigit("0")
        XCTAssertEqual(input.display, "0")
        input.appendDigit("7")
        XCTAssertEqual(input.display, "7")
    }

    func testBackspaceAndClear() {
        var input = GuessInput()
        input.appendDigit("4")
        input.appendDecimalSeparator()
        input.appendDigit("2")
        input.backspace()
        XCTAssertEqual(input.display, "4.")
        input.backspace()
        input.backspace()
        XCTAssertTrue(input.isEmpty)
        input.backspace()
        XCTAssertTrue(input.isEmpty)

        input.appendDigit("9")
        input.clear()
        XCTAssertTrue(input.isEmpty)
        XCTAssertEqual(input.value, 0)
    }

    func testIntegerDigitLimitAndGrouping() {
        var input = GuessInput()
        for _ in 0..<10 {
            input.appendDigit("9")
        }
        XCTAssertEqual(input.display, "9,999,999")
        XCTAssertEqual(input.value, 9_999_999)
    }
}
