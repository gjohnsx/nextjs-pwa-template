import type { Metadata } from "next";
import Link from "next/link";
import { GuideShell } from "../guide-shell";

export const metadata: Metadata = {
  title: "Do You Still Need Cash in Japan?",
  description:
    "Yes, you still need some cash in Japan in 2026. Where cards and IC cards work, where they don't, how much yen to carry, and the cheapest ways to get it.",
  alternates: { canonical: "/guide/cash-in-japan" },
};

export default function CashInJapanPage() {
  return (
    <GuideShell
      title="Do you still need cash in Japan?"
      kicker="Money"
      location="guide_cash"
    >
      <p>
        Yes — but less than the old guidebooks say. Cards and phone payments
        now work at chains, hotels, department stores, and most restaurants in
        big cities. Cash still rules at ramen ticket machines, small izakaya,
        temple entries, market stalls, coin lockers, some taxis outside the
        big cities, and a long tail of beloved little places that are
        precisely why you came. A good rule: carry{" "}
        <Link href="/convert/20000-yen-to-usd">¥10,000–20,000</Link> at all
        times and you will almost never be caught out.
      </p>

      <h2>Know the money</h2>
      <p>
        Bills come in ¥1,000, ¥5,000, and ¥10,000 (the ¥2,000 note exists but
        is rare). Coins run ¥1, ¥5, ¥10, ¥50, ¥100, and ¥500 — and the ¥500
        coin is worth about $3.30, one of the most valuable circulating coins
        in the world. Treat coins as real money: a pocket of change can pay
        for a <Link href="/guide/vending-machines-japan">vending machine</Link>{" "}
        run, a coin locker, and a shrine offering. A small coin pouch is the
        single most underrated piece of Japan travel gear.
      </p>

      <h2>Getting yen: skip the airport exchange desk</h2>
      <p>
        The cheapest yen for most travelers comes out of an ATM with a
        no-foreign-fee debit card. 7-Eleven ATMs (in nearly every konbini) and
        Japan Post ATMs reliably take foreign cards, have English menus, and
        are everywhere. Withdraw in larger chunks —{" "}
        <Link href="/convert/50000-yen-to-usd">¥50,000</Link> or{" "}
        <Link href="/convert/100000-yen-to-usd">¥100,000</Link> at a time — to
        amortize any per-withdrawal fee. Airport currency desks and
        buy-yen-at-home services typically cost 3–8% more than the mid-market
        rate; the ATM route usually costs under 1–2%.
      </p>
      <p>
        If an ATM or card terminal offers to charge you in dollars instead of
        yen, decline. That option — dynamic currency conversion — carries a
        markup of several percent. Always pay in yen and let your bank do the
        conversion.
      </p>

      <h2>The IC card is the real cash killer</h2>
      <p>
        Suica and its regional siblings (Pasmo, ICOCA) are prepaid transit
        cards that also pay at konbini, vending machines, station shops, and
        many cafes. You can add Suica to Apple Wallet before you even land and
        top it up from your phone. For sub-¥1,000 purchases, tapping an IC
        card is faster than cash and accepted in most of the places that
        refuse credit cards. Between an IC card and a modest cash reserve, you
        are covered for essentially everything.
      </p>

      <h2>Cash etiquette, quickly</h2>
      <p>
        Use the small tray by the register for handing over money rather than
        passing bills hand-to-hand; take your change and receipt from the tray
        too. There is no tipping anywhere — not restaurants, not taxis, not
        hotels — and attempting it creates polite confusion. Counting your
        change is fine; short-changing tourists is virtually nonexistent.
      </p>

      <h2>How much for the whole trip?</h2>
      <p>
        For a one-week trip, most people are comfortable cycling through{" "}
        <Link href="/convert/70000-yen-to-usd">¥50,000–70,000</Link> in cash,
        with cards and IC payments carrying the rest — see the{" "}
        <Link href="/guide/japan-trip-daily-budget">daily budget guide</Link>{" "}
        for the full math. Carrying ¥100,000 in a wallet feels alarming to
        Americans and completely normal to locals; Japan&rsquo;s street safety
        makes cash a low-stress affair.
      </p>
      <p>
        The last piece is knowing what the yen in your hand are worth. Check
        the <Link href="/">live converter</Link> when rates move, and use
        amounts like <Link href="/convert/5000-yen-to-usd">¥5,000</Link> and{" "}
        <Link href="/convert/10000-yen-to-usd">¥10,000</Link> as anchors until
        the conversion happens in your head automatically.
      </p>
    </GuideShell>
  );
}
