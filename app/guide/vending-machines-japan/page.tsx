import type { Metadata } from "next";
import Link from "next/link";
import { GuideShell } from "../guide-shell";

export const metadata: Metadata = {
  title: "Japan's Vending Machines: Prices & What to Try",
  description:
    "What drinks cost in Japan's vending machines (¥100–200), how to pay, the hot-drink trick, and which buttons are actually worth pressing.",
  alternates: { canonical: "/guide/vending-machines-japan" },
};

export default function VendingMachinesPage() {
  return (
    <GuideShell
      title="Japan's vending machines, explained"
      kicker="Street level"
      location="guide_vending"
    >
      <p>
        Japan has one vending machine for roughly every 25 people — several
        million of them, humming on mountain trails, in temple parking lots,
        and every fifty meters of city sidewalk. The standard drink costs
        ¥110–160, with most landing around ¥140 — about 90 cents to a dollar
        at a rate near ¥150 per dollar. Check{" "}
        <Link href="/convert/100-yen-to-usd">what ¥100 is worth</Link> today
        and you have priced most of the machine.
      </p>

      <h2>What things cost</h2>
      <p>
        Water and basic teas sit at the bottom, ¥110–130. Coffee in the small
        squat cans is ¥130–160. Sports drinks like Pocari Sweat run ¥150–170.
        Bottled specialty drinks and anything in a tall bottle reach ¥160–200.
        Machines inside tourist attractions, ski resorts, and highway rest
        stops mark up ¥30–50; machines in random residential backstreets are
        often the cheapest, sometimes ¥100 flat. Two drinks a day for a week
        is about <Link href="/convert/2000-yen-to-usd">¥2,000</Link> — a
        rounding error in a{" "}
        <Link href="/guide/japan-trip-daily-budget">daily budget</Link>, and
        one of the trip&rsquo;s reliable small pleasures.
      </p>

      <h2>The hot and cold trick</h2>
      <p>
        From roughly October to April, machines split their rows: blue tags
        (つめた〜い, &ldquo;cold&rdquo;) and red tags (あったか〜い,
        &ldquo;warm&rdquo;). A hot can of milk coffee or corn soup from a
        red-tag row on a cold night is a genuine Japan experience that costs{" "}
        <Link href="/convert/200-yen-to-usd">under ¥200</Link>. The cans come
        out hot enough to double as hand warmers, which locals absolutely use
        them for.
      </p>

      <h2>How to pay</h2>
      <p>
        Every machine takes ¥10, ¥50, ¥100, and ¥500 coins, and nearly all
        take ¥1,000 bills (larger bills are usually rejected — another reason
        to keep small money, per the{" "}
        <Link href="/guide/cash-in-japan">cash guide</Link>). The modern fleet
        also takes IC transit cards: tap your Suica or phone and the buttons
        light up. Vending machines are also the universal change-makers of
        Japan — buy a ¥140 tea with a ¥1,000 note and you have coins for the
        ramen ticket machine.
      </p>

      <h2>Worth pressing</h2>
      <p>
        Royal Milk Tea and the seasonal limited flavors rotate constantly;
        part of the fun is that the lineup in April is gone by June. Reliable
        hits: BOSS or Georgia canned coffee (the salaryman fuel), CC Lemon,
        Calpis Water, and in winter the hot corn potage with actual corn
        kernels in the bottom of the can. The famous weird machines — fresh
        bananas, hot ramen in a can, mystery boxes — exist but are a tiny
        novelty fringe around Akihabara and tourist districts. The everyday
        drink machine is the real attraction.
      </p>

      <h2>Machine manners</h2>
      <p>
        One quirk first-timers miss: Japanese streets have almost no public
        trash cans, but most vending machines have a recycling bin for cans
        and bottles right beside them. The etiquette is to drink your purchase
        standing near the machine and bin the empty before walking on —
        eating and drinking while walking is mildly frowned upon. It turns
        the machine into a thirty-second rest stop, which, on a long walking
        day, is exactly what it should be.
      </p>
      <p>
        Each purchase is also a free mental-math rep: ¥140 — is that 90
        cents or 95? The <Link href="/">converter</Link> settles it when the
        rate moves, and the Yen Sense practice deck uses the vending machine
        drink as its very first drill amount, because it is the price you
        will see more than any other in Japan.
      </p>
    </GuideShell>
  );
}
