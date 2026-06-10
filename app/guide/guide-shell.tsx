import Link from "next/link";
import {
  AppStoreCallout,
  ConverterLink,
} from "@/components/yensense/seo-blocks";

export function GuideShell({
  title,
  kicker,
  location,
  children,
}: {
  title: string;
  kicker: string;
  location: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-dvh bg-[var(--paper)] px-5 py-10 text-[var(--ink)]">
      <article className="mx-auto grid max-w-2xl gap-6 rounded-[8px] border border-[var(--line)] bg-[var(--panel)] p-5">
        <header className="grid gap-2">
          <p className="zine-meta text-[10px] text-[var(--muted-ink)]">
            Yen Sense / Field guide — {kicker}
          </p>
          <h1 className="font-serif text-4xl font-extrabold leading-none">
            {title}
          </h1>
        </header>

        <section className="grid gap-3 text-sm leading-6 text-[var(--muted-ink)] [&_a]:font-bold [&_a]:text-[var(--accent-pop)] [&_a]:underline [&_h2]:mt-2 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-none [&_h2]:text-[var(--ink)]">
          {children}
        </section>

        <ConverterLink />

        <AppStoreCallout location={location} />

        <nav className="flex flex-wrap gap-x-4 gap-y-1 border-t border-[var(--line)] pt-4 text-sm">
          <Link
            href="/guide"
            className="font-bold text-[var(--accent-pop)] underline"
          >
            All field guides
          </Link>
          <Link
            href="/"
            className="font-bold text-[var(--accent-pop)] underline"
          >
            Yen converter
          </Link>
        </nav>
      </article>
    </main>
  );
}
