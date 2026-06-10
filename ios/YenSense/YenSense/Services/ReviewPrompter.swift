import Foundation

/// Decides when to ask for an App Store review at a success moment.
///
/// Counts practice-session completions and converter uses in UserDefaults and
/// fires the review request once the user completes their 3rd practice
/// session or their 10th converter use — whichever happens first. Prompts at
/// most once per app version and never re-prompts a version that already
/// prompted.
struct ReviewPrompter {
    enum Event {
        case practiceSessionCompleted
        case converterUsed
    }

    static let practiceSessionThreshold = 3
    static let converterUseThreshold = 10

    private static let practiceCountKey = "yen-sense:review:practice-session-count"
    private static let converterCountKey = "yen-sense:review:converter-use-count"
    private static let lastPromptedVersionKey = "yen-sense:review:last-prompted-version"

    /// Legacy once-per-install flag from the first review-prompt implementation.
    private static let legacyPromptedKey = "practice.reviewRequested"

    /// Delay between the triggering event and the review sheet so it doesn't
    /// interrupt the interaction that earned it.
    private static let promptDelay: Duration = .seconds(1.5)

    private let defaults: UserDefaults
    private let currentVersion: String

    init(
        defaults: UserDefaults = .standard,
        currentVersion: String = Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "unknown"
    ) {
        self.defaults = defaults
        self.currentVersion = currentVersion
    }

    /// Records a success moment and, if a threshold has been crossed and this
    /// app version hasn't prompted yet, requests a review after a short delay.
    func registerEvent(_ event: Event, requestReview: @escaping @MainActor () -> Void) {
        migrateLegacyFlagIfNeeded()

        let countKey = switch event {
        case .practiceSessionCompleted: Self.practiceCountKey
        case .converterUsed: Self.converterCountKey
        }
        defaults.set(defaults.integer(forKey: countKey) + 1, forKey: countKey)

        guard defaults.string(forKey: Self.lastPromptedVersionKey) != currentVersion else {
            return
        }

        let practiceCount = defaults.integer(forKey: Self.practiceCountKey)
        let converterCount = defaults.integer(forKey: Self.converterCountKey)
        guard practiceCount >= Self.practiceSessionThreshold
            || converterCount >= Self.converterUseThreshold else {
            return
        }

        defaults.set(currentVersion, forKey: Self.lastPromptedVersionKey)

        Task { @MainActor in
            try? await Task.sleep(for: Self.promptDelay)
            requestReview()
        }
    }

    /// Users who saw the prompt under the old once-per-install scheme on this
    /// version shouldn't be asked again until the next version ships.
    private func migrateLegacyFlagIfNeeded() {
        guard defaults.bool(forKey: Self.legacyPromptedKey) else {
            return
        }

        if defaults.string(forKey: Self.lastPromptedVersionKey) == nil {
            defaults.set(currentVersion, forKey: Self.lastPromptedVersionKey)
        }

        defaults.removeObject(forKey: Self.legacyPromptedKey)
    }
}
