import Foundation

struct MultiRateResponse: Decodable {
    var base: String?
    var rates: [String: Double]?
    var sourceDate: String?
    var fetchedAt: Double?
}

enum ExchangeRateServiceError: Error {
    case invalidResponse
    case missingRate
}

struct ExchangeRateService {
    var endpointURL = URL(string: "https://yen-sense.vercel.app/api/rates")!

    func fetchRates() async throws -> MultiRateResponse {
        let (data, response) = try await URLSession.shared.data(from: endpointURL)

        guard let httpResponse = response as? HTTPURLResponse,
              (200..<300).contains(httpResponse.statusCode) else {
            throw ExchangeRateServiceError.invalidResponse
        }

        let decoded = try JSONDecoder().decode(MultiRateResponse.self, from: data)

        guard let rates = decoded.rates,
              !rates.isEmpty,
              rates.values.contains(where: { $0 > 0 }) else {
            throw ExchangeRateServiceError.missingRate
        }

        return decoded
    }
}
