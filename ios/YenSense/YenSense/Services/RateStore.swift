import Foundation

@MainActor
final class RateStore: ObservableObject {
    private let storageKey = "yen-sense:rate"
    private let backgroundRefreshInterval: TimeInterval = 12 * 60 * 60
    private let defaults: UserDefaults
    private let service: ExchangeRateService

    @Published private(set) var storedRate: StoredRate
    @Published private(set) var status: RateStatus
    @Published private(set) var errorMessage: String?

    init(
        defaults: UserDefaults = .standard,
        service: ExchangeRateService = ExchangeRateService()
    ) {
        self.defaults = defaults
        self.service = service

        let cachedRate = Self.readStoredRate(from: defaults, key: storageKey)
        self.storedRate = cachedRate
        self.status = cachedRate.unitsPerYen.isEmpty ? .fallback : .cached
    }

    var effectiveRate: EffectiveRate {
        CurrencyMath.effectiveRate(from: storedRate)
    }

    private var hasLiveRate: Bool {
        !storedRate.unitsPerYen.isEmpty
    }

    func refreshRate(silent: Bool = false) async {
        if !silent {
            status = .loading
            errorMessage = nil
        }

        do {
            let response = try await service.fetchRates()
            guard let rates = response.rates,
                  rates.values.contains(where: { $0 > 0 }) else {
                throw ExchangeRateServiceError.missingRate
            }

            var nextRate = storedRate
            nextRate.unitsPerYen = rates
            nextRate.sourceDate = response.sourceDate
            nextRate.fetchedAt = response.fetchedAt.map { Date(timeIntervalSince1970: $0 / 1000) } ?? Date()

            storedRate = nextRate
            writeStoredRate(nextRate)
            writeWidgetSnapshot()
            status = .live
        } catch {
            let cachedRate = Self.readStoredRate(from: defaults, key: storageKey)
            storedRate = cachedRate

            if silent {
                status = cachedRate.unitsPerYen.isEmpty ? .fallback : .cached
                return
            }

            status = cachedRate.unitsPerYen.isEmpty ? .error : .cached
            errorMessage = cachedRate.unitsPerYen.isEmpty
                ? "Could not refresh. Using the offline estimate."
                : "Could not refresh. Using your cached rate."
        }
    }

    func refreshIfStale() async {
        guard shouldRefreshInBackground else {
            return
        }

        try? await Task.sleep(for: .milliseconds(750))
        await refreshRate(silent: true)
    }

    func setSelectedQuote(_ code: String) {
        var nextRate = storedRate
        nextRate.selectedQuote = SupportedCurrency.find(code).code
        nextRate.manualYenPerUnit = nil
        storedRate = nextRate
        writeStoredRate(nextRate)
        writeWidgetSnapshot()
    }

    func setManualRate(_ yenPerUnit: Double?) {
        var nextRate = storedRate
        nextRate.manualYenPerUnit = (yenPerUnit ?? 0) > 0 ? yenPerUnit : nil
        storedRate = nextRate
        writeStoredRate(nextRate)
        writeWidgetSnapshot()
    }

    func resetToFallback() {
        var nextRate = storedRate
        nextRate.unitsPerYen = [:]
        nextRate.manualYenPerUnit = nil
        nextRate.sourceDate = nil
        nextRate.fetchedAt = nil

        storedRate = nextRate
        writeStoredRate(nextRate)
        writeWidgetSnapshot()
        status = .fallback
    }

    private static func readStoredRate(from defaults: UserDefaults, key: String) -> StoredRate {
        guard let data = defaults.data(forKey: key),
              let storedRate = try? JSONDecoder().decode(StoredRate.self, from: data) else {
            return .empty
        }

        return storedRate
    }

    private func writeStoredRate(_ rate: StoredRate) {
        guard let data = try? JSONEncoder().encode(rate) else {
            return
        }

        defaults.set(data, forKey: storageKey)
    }

    /// Pushes the current effective rate into the App Group so the widget can
    /// render it without its own network call. Preserves the `isPro` flag that
    /// `StoreManager` writes separately.
    private func writeWidgetSnapshot() {
        let rate = effectiveRate
        let isPro = SharedRateStore.read()?.isPro ?? false
        SharedRateStore.write(
            WidgetRateSnapshot(
                quoteCode: rate.quote.code,
                quoteSymbol: rate.quote.symbol,
                yenPerUnit: rate.yenPerUnit,
                fetchedAt: rate.fetchedAt,
                isPro: isPro
            )
        )
    }

    private var shouldRefreshInBackground: Bool {
        guard hasLiveRate,
              let fetchedAt = storedRate.fetchedAt else {
            return true
        }

        return Date().timeIntervalSince(fetchedAt) > backgroundRefreshInterval
    }
}
