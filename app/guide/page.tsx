import type { Metadata } from "next";
import Link from "next/link";
import {
  AppStoreCallout,
  ConverterLink,
} from "@/components/yensense/seo-blocks";

export const metadata: Metadata = {
  title: "Japan Travel Money Field Guides",
  description:
    "Short, honest guides to Japan travel money — what ramen costs, daily budgets, whether you need cash, and the vending machine economy — with live yen-to-USD conversions.",
  alternates: { canonical: "/guide" },
};

const GUIDES = [
  {
    href: "/guide/ramen-cost-in-japan",
    title: "How much does ramen cost in Japan?",
    blurb: "Real bowl prices from ¥900 to ¥2,000, and the ticket-machine ritual.",
  },
  {
    href: "/guide/japan-trip-daily-budget",
    title: "What does a day in Japan actually cost?",
    blurb: "Lean, comfortable, and splurge days priced from real anchors.",
  },
  {
    href: "/guide/cash-in-japan",
    title: "Do you still need cash in Japan?",
    blurb: "Yes — here's how much, where to get it cheaply, and where cards fail.",
  },
  {
    href: "/guide/vending-machines-japan",
    title: "Japan's vending machines, explained",
    blurb: "¥140 drinks, the hot-can trick, and the buttons worth pressing.",
  },
];

export default function GuideIndexPage() {
  return (
    <main className="min-h-dvh bg-[var(--paper)] px-5 py-10 text-[var(--ink)]">
      <article className="mx-auto grid max-w-2xl gap-6 rounded-[8px] border border-[var(--line)] bg-[var(--panel)] p-5">
        <header className="grid gap-2">
          <p className="zine-meta text-[10px] text-[var(--muted-ink)]">
            Yen Sense / Field guides
          </p>
          <h1 className="font-serif text-4xl font-extrabold leading-none">
            Japan travel money, at street level
          </h1>
          <p className="text-sm leading-6 text-[var(--muted-ink)]">
            Short guides built from real prices — the same anchors the Yen
            Sense practice deck uses.
          </p>
        </header>

        <nav className="grid gap-3">
          {GUIDES.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="grid gap-1 rounded-[8px] border border-[var(--line)] bg-[var(--field)] p-4 transition-colors hover:border-[var(--accent-pop)]"
            >
              <span className="font-serif text-xl font-bold leading-tight text-[var(--ink)]">
                {guide.title}
              </span>
              <span className="text-sm leading-6 text-[var(--muted-ink)]">
                {guide.blurb}
              </span>
            </Link>
          ))}
        </nav>

        <ConverterLink />

        <AppStoreCallout location="guide_index" />
      </article>
    </main>
  );
}
