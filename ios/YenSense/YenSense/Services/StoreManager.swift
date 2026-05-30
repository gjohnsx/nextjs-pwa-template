import Foundation
import StoreKit

@MainActor
final class StoreManager: ObservableObject {
    private let proCacheKey = "yen-sense:store:isPro"
    private let defaults: UserDefaults

    @Published private(set) var products: [Product] = []
    @Published private(set) var isPro: Bool = false
    @Published private(set) var isLoading = false
    @Published var purchaseError: String?

    private var updatesTask: Task<Void, Never>?

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        self.isPro = defaults.bool(forKey: proCacheKey)
        updatesTask = listenForTransactions()
        Task { await refresh() }
    }

    deinit {
        updatesTask?.cancel()
    }

    var proProduct: Product? {
        products.first { $0.id == StoreProducts.proID }
    }

    var tipProducts: [Product] {
        StoreProducts.tipIDs.compactMap { id in products.first { $0.id == id } }
    }

    func refresh() async {
        await loadProducts()
        await updateEntitlements()
    }

    func loadProducts() async {
        isLoading = true
        defer { isLoading = false }
        do {
            products = try await Product.products(for: StoreProducts.all)
        } catch {
            purchaseError = "Couldn't load the store. Check your connection."
        }
    }

    @discardableResult
    func purchase(_ product: Product) async -> Bool {
        do {
            let result = try await product.purchase()
            switch result {
            case .success(let verification):
                _ = try checkVerified(verification)
                await updateEntitlements()
                await transactionFinish(verification)
                return true
            case .userCancelled, .pending:
                return false
            @unknown default:
                return false
            }
        } catch {
            purchaseError = "Purchase didn't complete. You weren't charged."
            return false
        }
    }

    func restore() async {
        do {
            try await AppStore.sync()
            await updateEntitlements()
        } catch {
            purchaseError = "Couldn't restore purchases."
        }
    }

    private func updateEntitlements() async {
        var entitled: Set<String> = []
        for await result in Transaction.currentEntitlements {
            if let transaction = try? checkVerified(result) {
                entitled.insert(transaction.productID)
            }
        }
        let nextIsPro = StoreProducts.isProEntitled(from: entitled)
        isPro = nextIsPro
        defaults.set(nextIsPro, forKey: proCacheKey)
        SharedRateStore.setPro(nextIsPro)
    }

    private func listenForTransactions() -> Task<Void, Never> {
        Task(priority: .background) { [weak self] in
            for await update in Transaction.updates {
                guard let self else { continue }
                if let transaction = try? self.checkVerified(update) {
                    await transaction.finish()
                    await self.updateEntitlements()
                }
            }
        }
    }

    private func transactionFinish(_ verification: VerificationResult<Transaction>) async {
        if let transaction = try? checkVerified(verification) {
            await transaction.finish()
        }
    }

    private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .verified(let safe):
            return safe
        case .unverified:
            throw StoreError.failedVerification
        }
    }

    enum StoreError: Error {
        case failedVerification
    }
}
