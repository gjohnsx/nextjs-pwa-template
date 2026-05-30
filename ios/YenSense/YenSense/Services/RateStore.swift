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
        self.status = cachedRate.liveYenPerUSD == nil ? .fallback : .cached
    }

    var effectiveRate: EffectiveRate {
        CurrencyMath.effectiveRate(from: storedRate)
    }

    func refreshRate(silent: Bool = false) async {
        if !silent {
            status = .loading
            errorMessage = nil
        }

        do {
            let response = try await service.fetchRateSnapshot()
            guard let usdPerYen = response.usdPerYen,
                  let yenPerUSD = response.yenPerUsd,
                  usdPerYen > 0,
                  yenPerUSD > 0 else {
                throw ExchangeRateServiceError.missingRate
            }

            let nextRate = StoredRate(
                liveUSDPerYen: usdPerYen,
                liveYenPerUSD: yenPerUSD,
                sourceDate: response.sourceDate,
                fetchedAt: response.fetchedAt.map { Date(timeIntervalSince1970: $0 / 1000) } ?? Date(),
                manualYenPerUSD: storedRate.manualYenPerUSD
            )

            storedRate = nextRate
            writeStoredRate(nextRate)
            status = .live
        } catch {
            let cachedRate = Self.readStoredRate(from: defaults, key: storageKey)
            storedRate = cachedRate

            if silent {
                status = cachedRate.liveYenPerUSD == nil ? .fallback : .cached
                return
            }

            status = cachedRate.liveYenPerUSD == nil ? .error : .cached
            errorMessage = cachedRate.liveYenPerUSD == nil
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

    func setManualRate(_ yenPerUSD: Double?) {
        var nextRate = storedRate
        nextRate.manualYenPerUSD = (yenPerUSD ?? 0) > 0 ? yenPerUSD : nil
        storedRate = nextRate
        writeStoredRate(nextRate)
    }

    func resetToFallback() {
        let nextRate = StoredRate(
            liveUSDPerYen: nil,
            liveYenPerUSD: nil,
            sourceDate: nil,
            fetchedAt: nil,
            manualYenPerUSD: CurrencyMath.fallbackYenPerUSD
        )

        storedRate = nextRate
        writeStoredRate(nextRate)
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

    private var shouldRefreshInBackground: Bool {
        guard storedRate.liveYenPerUSD != nil,
              let fetchedAt = storedRate.fetchedAt else {
            return true
        }

        return Date().timeIntervalSince(fetchedAt) > backgroundRefreshInterval
    }
}
