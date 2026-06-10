import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AppStoreCallout,
  ConverterLink,
} from "@/components/yensense/seo-blocks";
import {
  formatUsd,
  formatUsdCompact,
  formatYen,
  formatYenPerUsd,
} from "@/components/yensense/currency";
import {
  CONVERT_AMOUNTS,
  getConvertAmount,
  getNeighborAmounts,
} from "@/lib/convert-amounts";
import { getServerYenRate } from "@/lib/rates-server";

export const revalidate = 86400;
export const dynamicParams = false;

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return CONVERT_AMOUNTS.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getConvertAmount(slug);
  if (!entry) {
    return {};
  }

  const rate = await getServerYenRate();
  const usd = formatUsd(entry.yen / rate.yenPerUsd);

  return {
    title: `${formatYen(entry.yen)} Yen to USD`,
    description: `¥${formatYen(entry.yen)} is about ${usd} — ${entry.hint}. See what it buys in Japan, with a live JPY to USD rate updated daily.`,
    alternates: {
      canonical: `/convert/${entry.slug}`,
    },
  };
}

export default async function ConvertPage({ params }: Props) {
  const { slug } = await params;
  const entry = getConvertAmount(slug);
  if (!entry) {
    notFound();
  }

  const rate = await getServerYenRate();
  const usdAmount = entry.yen / rate.yenPerUsd;
  const usdDisplay =
    usdAmount >= 100 ? formatUsd(usdAmount) : formatUsdCompact(usdAmount);
  const neighbors = getNeighborAmounts(entry.yen);

  return (
    <main className="min-h-dvh bg-[var(--paper)] px-5 py-10 text-[var(--ink)]">
      <article className="mx-auto grid max-w-2xl gap-6 rounded-[8px] border border-[var(--line)] bg-[var(--panel)] p-5">
        <header className="grid gap-2">
          <p className="zine-meta text-[10px] text-[var(--muted-ink)]">
            Yen Sense / Conversion
          </p>
          <h1 className="font-serif text-4xl font-extrabold leading-none">
            ¥{formatYen(entry.yen)} to USD
          </h1>
        </header>

        <section className="grid gap-3 rounded-[8px] border border-[var(--line)] bg-[var(--field)] p-4">
          <p className="zine-meta text-[10px] text-[var(--muted-ink)]">
            Dollar result
          </p>
          <p className="break-words font-serif text-5xl font-extrabold leading-none text-[var(--ink)]">
            {usdDisplay}
          </p>
          <p className="zine-meta border-t border-[var(--line)] pt-2 text-[10px] text-[var(--muted-ink)]">
            ¥{formatYenPerUsd(rate.yenPerUsd)} per $1 ·{" "}
            {rate.isFallback
              ? "offline estimate"
              : `rate from ${rate.sourceDate ?? "today"}, refreshed daily`}
          </p>
        </section>

        <section className="grid gap-3 text-sm leading-6 text-[var(--muted-ink)]">
          {entry.context.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>

        <ConverterLink />

        <AppStoreCallout location={`convert_${entry.yen}`} />

        <nav className="grid gap-2 border-t border-[var(--line)] pt-4">
          <p className="zine-meta text-[10px] text-[var(--muted-ink)]">
            Nearby amounts
          </p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {neighbors.map((neighbor) => (
              <li key={neighbor.slug}>
                <Link
                  href={`/convert/${neighbor.slug}`}
                  className="font-bold text-[var(--accent-pop)] underline"
                >
                  ¥{formatYen(neighbor.yen)} to USD
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </article>
    </main>
  );
}
