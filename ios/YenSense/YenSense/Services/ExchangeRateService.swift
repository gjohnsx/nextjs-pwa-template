import Foundation

struct RateSnapshotResponse: Decodable {
    var sourceDate: String?
    var usdPerYen: Double?
    var yenPerUsd: Double?
    var fetchedAt: Double?
}

enum ExchangeRateServiceError: Error {
    case invalidResponse
    case missingRate
}

struct ExchangeRateService {
    var endpointURL = URL(string: "https://yen-sense.vercel.app/api/rates/jpy-usd")!

    func fetchRateSnapshot() async throws -> RateSnapshotResponse {
        let (data, response) = try await URLSession.shared.data(from: endpointURL)

        guard let httpResponse = response as? HTTPURLResponse,
              (200..<300).contains(httpResponse.statusCode) else {
            throw ExchangeRateServiceError.invalidResponse
        }

        let decoded = try JSONDecoder().decode(RateSnapshotResponse.self, from: data)

        guard let usdPerYen = decoded.usdPerYen,
              let yenPerUsd = decoded.yenPerUsd,
              usdPerYen > 0,
              yenPerUsd > 0 else {
            throw ExchangeRateServiceError.missingRate
        }

        return decoded
    }
}
