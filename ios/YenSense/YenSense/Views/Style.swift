import SwiftUI

extension Color {
    static let ysInk = Color(red: 33 / 255, green: 26 / 255, blue: 22 / 255)
    static let ysMutedInk = Color(red: 116 / 255, green: 108 / 255, blue: 98 / 255)
    static let ysFaintInk = Color(red: 169 / 255, green: 159 / 255, blue: 145 / 255)
    static let ysPaper = Color(red: 246 / 255, green: 240 / 255, blue: 229 / 255)
    static let ysPanel = Color(red: 255 / 255, green: 251 / 255, blue: 243 / 255)
    static let ysField = Color(red: 255 / 255, green: 247 / 255, blue: 236 / 255)
    static let ysLine = Color(red: 222 / 255, green: 211 / 255, blue: 195 / 255)
    static let ysAccent = Color(red: 201 / 255, green: 69 / 255, blue: 51 / 255)
    static let ysAccentSoft = Color(red: 242 / 255, green: 215 / 255, blue: 205 / 255)
    static let ysSage = Color(red: 220 / 255, green: 233 / 255, blue: 226 / 255)
}

struct PanelCard: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding(16)
            .background(Color.ysPanel)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(Color.ysLine, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}

struct YenButtonStyle: ButtonStyle {
    var prominent = false

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .frame(maxWidth: .infinity, minHeight: 48)
            .font(.headline)
            .foregroundStyle(prominent ? Color.ysPanel : Color.ysInk)
            .background(prominent ? Color.ysAccent : Color.ysField)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(prominent ? Color.ysAccent : Color.ysLine, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
    }
}

extension View {
    func panelCard() -> some View {
        modifier(PanelCard())
    }
}

