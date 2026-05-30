import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Yen Sense.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-[var(--paper)] px-5 py-10 text-[var(--ink)]">
      <article className="mx-auto grid max-w-2xl gap-6 rounded-[8px] border border-[var(--line)] bg-[var(--panel)] p-5">
        <header className="grid gap-2">
          <p className="zine-meta text-[10px] text-[var(--muted-ink)]">
            Yen Sense
          </p>
          <h1 className="font-serif text-4xl font-extrabold leading-none">
            Privacy Policy
          </h1>
          <p className="text-sm text-[var(--muted-ink)]">
            Effective May 27, 2026
          </p>
        </header>

        <section className="grid gap-3 text-sm leading-6 text-[var(--muted-ink)]">
          <p>
            Yen Sense does not collect, sell, rent, or share personal data. The
            app stores your exchange-rate preference, selected home currency,
            Pro status cache, and practice progress only on your device.
          </p>
          <p>
            The app may contact the Yen Sense rate endpoint to refresh current
            JPY exchange rates for supported home currencies. This request is
            used only to provide the conversion feature.
          </p>
          <p>
            In-app purchases are handled by Apple through StoreKit. Yen Sense
            does not receive your payment details and does not include ads,
            tracking, or third-party analytics SDKs.
          </p>
          <p>
            If you contact support, any information you choose to include in
            that message is used only to respond to your request.
          </p>
        </section>
      </article>
    </main>
  );
}
