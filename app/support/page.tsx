import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support",
  description: "Support for Yen Sense.",
};

export default function SupportPage() {
  return (
    <main className="min-h-dvh bg-[var(--paper)] px-5 py-10 text-[var(--ink)]">
      <article className="mx-auto grid max-w-2xl gap-6 rounded-[8px] border border-[var(--line)] bg-[var(--panel)] p-5">
        <header className="grid gap-2">
          <p className="zine-meta text-[10px] text-[var(--muted-ink)]">
            Yen Sense
          </p>
          <h1 className="font-serif text-4xl font-extrabold leading-none">
            Support
          </h1>
        </header>

        <section className="grid gap-3 text-sm leading-6 text-[var(--muted-ink)]">
          <p>
            Yen Sense is a simple pocket converter for Japan travel. It works
            offline with your saved rate, can refresh JPY rates when a network
            connection is available, and offers an optional one-time Pro unlock
            for deeper Practice, extra home currencies, and the rate widget.
          </p>
          <p>
            For help, bug reports, or feedback, email
            {" "}
            <a
              className="font-bold text-[var(--accent-pop)] underline"
              href="mailto:gjohns7@yahoo.com"
            >
              gjohns7@yahoo.com
            </a>
            .
          </p>
        </section>
      </article>
    </main>
  );
}
