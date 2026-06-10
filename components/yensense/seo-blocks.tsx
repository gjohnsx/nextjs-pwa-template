import Link from "next/link";
import { AppStoreBadge } from "./app-store-badge";

export function AppStoreCallout({ location }: { location: string }) {
  return (
    <section className="grid gap-3 rounded-[8px] border border-[var(--line)] bg-[var(--field)] p-4">
      <div className="zine-meta flex items-center justify-between gap-3 text-[10px] leading-none text-[var(--muted-ink)]">
        <span>Yen Sense</span>
        <span>iPhone</span>
      </div>
      <p className="text-sm leading-6 text-[var(--muted-ink)]">
        Take the converter with you. The Yen Sense iOS app works offline with a
        saved rate, drills your mental math with the practice deck, and puts
        the current rate on your home screen.
      </p>
      <AppStoreBadge location={location} className="justify-self-start" />
    </section>
  );
}

export function ConverterLink() {
  return (
    <p className="text-sm leading-6 text-[var(--muted-ink)]">
      Need a different amount?{" "}
      <Link
        href="/"
        className="font-bold text-[var(--accent-pop)] underline"
      >
        Use the free live converter
      </Link>{" "}
      — it works offline once loaded.
    </p>
  );
}
