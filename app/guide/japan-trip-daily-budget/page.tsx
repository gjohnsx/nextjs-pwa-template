import type { Metadata } from "next";
import Link from "next/link";
import { GuideShell } from "../guide-shell";

export const metadata: Metadata = {
  title: "Japan Trip Daily Budget: Real Numbers",
  description:
    "What a day in Japan actually costs in 2026 — lean, comfortable, and splurge daily budgets in yen and USD, built from real prices for meals, trains, and hotels.",
  alternates: { canonical: "/guide/japan-trip-daily-budget" },
};

export default function DailyBudgetPage() {
  return (
    <GuideShell
      title="What does a day in Japan actually cost?"
      kicker="Money"
      location="guide_budget"
    >
      <p>
        Ignore the scary averages. A day in Japan, excluding your hotel, costs
        about <Link href="/convert/6000-yen-to-usd">¥6,000</Link> if you are
        careful, <Link href="/convert/10000-yen-to-usd">¥10,000</Link> if you
        are comfortable, and{" "}
        <Link href="/convert/20000-yen-to-usd">¥20,000</Link>+ if you are
        treating yourself. At roughly ¥150 to the dollar, that is about $40,
        $67, and $135. Here is where those numbers come from.
      </p>

      <h2>The lean day: around ¥6,000</h2>
      <p>
        Konbini breakfast (¥380 for an onigiri and something warm), a quick
        lunch like a beef bowl or station soba (about ¥1,200), ramen with a
        side for dinner (<Link href="/convert/2000-yen-to-usd">¥1,800</Link>),
        a coffee stop (¥520), a couple of vending machine drinks (¥140 each —
        see the{" "}
        <Link href="/guide/vending-machines-japan">vending machine guide</Link>
        ), and ¥1,500–2,000 of city trains. That is a genuinely good day, not
        a deprivation day. Japan is one of the few places where the cheap food
        is also some of the best food.
      </p>

      <h2>The comfortable day: around ¥10,000</h2>
      <p>
        Same structure, better choices: a sit-down lunch, a casual izakaya or
        teishoku dinner that runs{" "}
        <Link href="/convert/8000-yen-to-usd">¥3,000–4,000</Link> per person
        with a drink, one paid attraction (museums and gardens are usually
        ¥500–2,000), a dessert you photograph before eating, and taxis when
        your feet give out (a short hop is about ¥4,800). One{" "}
        <Link href="/convert/10000-yen-to-usd">¥10,000 note</Link> per day is
        the classic planning unit for a reason.
      </p>

      <h2>The splurge day: ¥20,000 and up</h2>
      <p>
        A family activity like a theme park, aquarium, or ballgame runs about
        ¥18,000 for a family once tickets and snacks are counted. For couples
        or solo travelers, ¥20,000 covers a serious dinner — a casual
        kaiseki, good sushi, or wagyu — plus everything else. True splurges
        (kaiseki for two, a ryokan dinner upgrade) live around{" "}
        <Link href="/convert/50000-yen-to-usd">¥45,000–50,000</Link>.
      </p>

      <h2>Hotels: the variable that swamps everything</h2>
      <p>
        Lodging is the budget item that varies most. Business hotels in
        regional cities can be ¥8,000–12,000 a night; a mid-range city hotel
        is around <Link href="/convert/30000-yen-to-usd">¥28,000</Link>;
        high-end ryokan start near ¥80,000. Whatever your style, add hotels
        separately rather than folding them into a daily number — it keeps
        both figures honest.
      </p>

      <h2>The big one-offs</h2>
      <p>
        A Tokyo–Kyoto Shinkansen ticket is about ¥14,000 each way, so a round
        trip is close to{" "}
        <Link href="/convert/30000-yen-to-usd">¥30,000</Link>. Airport
        transfers run ¥1,500–3,500 each way depending on the train you pick.
        Budget these as line items, not daily spending, or your daily average
        will look worse than your trip actually is.
      </p>

      <h2>Putting it together</h2>
      <p>
        A week of comfortable solo travel — mid-range hotel, ¥10,000 days, one
        splurge dinner — lands near{" "}
        <Link href="/convert/150000-yen-to-usd">¥150,000</Link> on the ground,
        before flights. Two people sharing a room spend meaningfully less than
        double that; a week for two often comes in around{" "}
        <Link href="/convert/200000-yen-to-usd">¥200,000</Link>. These are
        planning numbers, not promises — Kyoto in cherry-blossom season and
        Takamatsu in November are different planets, price-wise.
      </p>
      <p>
        The skill that makes all of this easier is converting in your head at
        the moment of purchase: is this ¥3,800 souvenir a $25 purchase or a
        $38 one? The{" "}
        <Link href="/">free converter</Link> answers it instantly, and the
        practice mode in the app trains you to not need it. Also read the{" "}
        <Link href="/guide/cash-in-japan">cash guide</Link> before you land —
        how you pay in Japan still matters.
      </p>
    </GuideShell>
  );
}
