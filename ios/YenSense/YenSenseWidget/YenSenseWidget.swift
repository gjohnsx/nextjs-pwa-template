import WidgetKit
import SwiftUI

/// Must stay in sync with `WidgetRateSnapshot` in the app target's
/// `Services/SharedRateStore.swift`. Codable shape MUST match exactly so the
/// JSON the app writes decodes here.
struct WidgetRateSnapshot: Codable {
    var quoteCode: String
    var quoteSymbol: String
    var yenPerUnit: Double
    var fetchedAt: Date?
    var isPro: Bool
}

private enum SharedRateReader {
    static let appGroupID = "group.com.gregjohns.yensense"
    static let storageKey = "yen-sense:widget-rate"

    static func read() -> WidgetRateSnapshot? {
        guard let defaults = UserDefaults(suiteName: appGroupID),
              let data = defaults.data(forKey: storageKey),
              let snapshot = try? JSONDecoder().decode(WidgetRateSnapshot.self, from: data) else {
            return nil
        }
        return snapshot
    }
}

private extension Color {
    static let ysInk = Color(red: 33 / 255, green: 26 / 255, blue: 22 / 255)
    static let ysMutedInk = Color(red: 116 / 255, green: 108 / 255, blue: 98 / 255)
    static let ysPaper = Color(red: 246 / 255, green: 240 / 255, blue: 229 / 255)
    static let ysPanel = Color(red: 255 / 255, green: 251 / 255, blue: 243 / 255)
    static let ysAccent = Color(red: 201 / 255, green: 69 / 255, blue: 51 / 255)
}

struct YenSenseEntry: TimelineEntry {
    let date: Date
    let snapshot: WidgetRateSnapshot?
}

struct YenSenseProvider: TimelineProvider {
    func placeholder(in context: Context) -> YenSenseEntry {
        YenSenseEntry(
            date: Date(),
            snapshot: WidgetRateSnapshot(
                quoteCode: "USD",
                quoteSymbol: "$",
                yenPerUnit: 150,
                fetchedAt: Date(),
                isPro: true
            )
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (YenSenseEntry) -> Void) {
        completion(YenSenseEntry(date: Date(), snapshot: SharedRateReader.read()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<YenSenseEntry>) -> Void) {
        // No network here — the app refreshes the App Group on its 12h cadence.
        let entry = YenSenseEntry(date: Date(), snapshot: SharedRateReader.read())
        // Ask WidgetKit to reload roughly on the app's 12h refresh cadence.
        let next = Calendar.current.date(byAdding: .hour, value: 12, to: Date()) ?? Date().addingTimeInterval(12 * 60 * 60)
        completion(Timeline(entries: [entry], policy: .after(next)))
    }
}

struct YenSenseWidgetEntryView: View {
    var entry: YenSenseProvider.Entry

    var body: some View {
        if let snapshot = entry.snapshot, snapshot.isPro {
            ProRateView(snapshot: snapshot)
        } else {
            UnlockView()
        }
    }
}

private struct ProRateView: View {
    let snapshot: WidgetRateSnapshot

    private var rateText: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.maximumFractionDigits = snapshot.yenPerUnit >= 100 ? 0 : 2
        let value = formatter.string(from: NSNumber(value: snapshot.yenPerUnit)) ?? "\(Int(snapshot.yenPerUnit))"
        return "¥\(value)"
    }

    private var fetchedText: String {
        guard let fetchedAt = snapshot.fetchedAt else { return "estimate" }
        let formatter = DateFormatter()
        formatter.setLocalizedDateFormatFromTemplate("MMdd")
        return "fetched \(formatter.string(from: fetchedAt))"
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Yen Sense")
                .font(.caption2.weight(.semibold))
                .foregroundStyle(Color.ysMutedInk)
            Spacer(minLength: 0)
            Text(rateText)
                .font(.system(size: 30, weight: .heavy, design: .serif))
                .foregroundStyle(Color.ysInk)
                .minimumScaleFactor(0.6)
                .lineLimit(1)
            Text("= \(snapshot.quoteSymbol)1")
                .font(.headline)
                .foregroundStyle(Color.ysAccent)
            Spacer(minLength: 0)
            Text(fetchedText)
                .font(.caption2)
                .foregroundStyle(Color.ysMutedInk)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .padding(14)
        .containerBackground(Color.ysPaper, for: .widget)
    }
}

private struct UnlockView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Image(systemName: "lock.fill")
                .font(.title3)
                .foregroundStyle(Color.ysAccent)
            Spacer(minLength: 0)
            Text("Unlock Yen Sense Pro")
                .font(.system(size: 18, weight: .heavy, design: .serif))
                .foregroundStyle(Color.ysInk)
            Text("Live rate at a glance")
                .font(.caption)
                .foregroundStyle(Color.ysMutedInk)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .padding(14)
        .containerBackground(Color.ysPaper, for: .widget)
        .widgetURL(URL(string: "yensense://paywall"))
    }
}

struct YenSenseWidget: Widget {
    let kind: String = "YenSenseWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: YenSenseProvider()) { entry in
            YenSenseWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Yen Sense Rate")
        .description("The live yen exchange rate, one glance away.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

#Preview(as: .systemSmall) {
    YenSenseWidget()
} timeline: {
    YenSenseEntry(
        date: Date(),
        snapshot: WidgetRateSnapshot(quoteCode: "USD", quoteSymbol: "$", yenPerUnit: 150, fetchedAt: Date(), isPro: true)
    )
    YenSenseEntry(date: Date(), snapshot: nil)
}
