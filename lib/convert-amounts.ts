// Price anchors mirror the practice deck in components/yensense/use-quiz-progress.ts:
// vending drink ¥140, konbini snack ¥380, coffee ¥520, city train ¥880,
// quick lunch ¥1,200, ramen + side ¥1,800, market run ¥3,200, short taxi ¥4,800,
// casual dinner ¥7,600, shopping stop ¥12,000, family activity ¥18,000,
// hotel night ¥28,000, trip splurge ¥45,000.

export type ConvertAmount = {
  yen: number;
  slug: string;
  hint: string;
  context: string[];
};

function amount(yen: number, hint: string, context: string[]): ConvertAmount {
  return { yen, slug: `${yen}-yen-to-usd`, hint, context };
}

export const CONVERT_AMOUNTS: ConvertAmount[] = [
  amount(100, "one coin, almost a vending drink", [
    "The ¥100 coin is the workhorse of a Japan trip — it feeds gachapon capsule machines, coin lockers, and the 100-yen shops where a surprising amount of useful travel gear lives.",
    "It is just shy of a vending machine drink, which usually runs about ¥140, so keep a couple in your pocket at all times.",
  ]),
  amount(200, "a vending machine drink with change", [
    "Two ¥100 coins covers a vending machine drink (around ¥140) with change left over, or a single ride on some local buses.",
    "It is the kind of amount you stop converting in your head after a few days — roughly the price of feeling refreshed on a hot Tokyo sidewalk.",
  ]),
  amount(300, "a drink plus a small snack", [
    "¥300 buys a vending machine drink (about ¥140) and a small candy or onigiri-adjacent snack, or one spin of a nicer gachapon machine.",
    "It is also a common price band for temple entry in smaller towns.",
  ]),
  amount(500, "the famous one-coin price point", [
    "The ¥500 coin is one of the highest-value circulating coins anywhere, and Japan has a whole culture of 'one coin' (ワンコイン) pricing built around it — lunches, lockers, small souvenirs.",
    "It covers a konbini snack (around ¥380) with change, or a basic coin locker at many stations.",
  ]),
  amount(800, "a train hop or snack-and-drink run", [
    "¥800 covers most single city train rides — a longer hop across Tokyo runs about ¥880 — or a konbini snack (around ¥380) plus a drink with change to spare.",
    "If you ride trains a lot, amounts like this are what quietly add up across a day.",
  ]),
  amount(1000, "the smallest bill, a cheap lunch", [
    "¥1,000 is the smallest Japanese banknote and a meaningful unit of mental math: it is a beef-bowl or station-soba lunch, or a coffee stop (about ¥520) plus a vending drink with room to spare.",
    "ATMs dispense these alongside ¥10,000 notes, and you will burn through them faster than you expect.",
  ]),
  amount(1500, "lunch plus a drink", [
    "¥1,500 is a quick sit-down lunch (around ¥1,200) plus a drink, or most of the way to a good ramen bowl with a side (about ¥1,800).",
    "It is a comfortable per-meal budget outside of fancy neighborhoods.",
  ]),
  amount(2000, "ramen with a side, comfortably", [
    "¥2,000 covers a proper ramen bowl plus gyoza or a beer (about ¥1,800 together), or two quick lunches.",
    "There is a ¥2,000 banknote, but it is rare enough that handing one over feels like a magic trick.",
  ]),
  amount(3000, "a market run or a day of small spends", [
    "¥3,000 is about what a market or depachika food-hall run costs (the practice deck pegs it at ¥3,200), or a full day of small spends: lunch, coffee, train rides, and a snack.",
    "It is also a common price for casual izakaya dinners per person before drinks.",
  ]),
  amount(4000, "most short taxi rides", [
    "¥4,000 covers most short taxi hops — a typical short ride lands around ¥4,800, so this gets you most of the way across a neighborhood or home from a late dinner.",
    "It is also roughly lunch and a casual dinner combined on a normal day.",
  ]),
  amount(5000, "a taxi or a modest dinner", [
    "¥5,000 is the second-smallest bill and covers a short taxi (about ¥4,800) or a modest dinner for one with a drink.",
    "Museums, gardens, and most paid attractions cost well under this, so a ¥5,000 note goes further than its dollar value suggests.",
  ]),
  amount(6000, "a lean full day of food", [
    "¥6,000 funds a lean but happy full day of eating: quick lunch (about ¥1,200), ramen and a side for dinner (about ¥1,800), coffee (about ¥520), plus snacks and vending drinks in between.",
    "Alternatively, it is one nicer dinner for one.",
  ]),
  amount(8000, "a casual dinner out", [
    "¥8,000 covers a casual dinner out — the practice deck pegs a relaxed dinner at about ¥7,600 — with a vending drink left over for the walk home.",
    "It is also a realistic full-day food-and-trains budget if you eat well at every meal.",
  ]),
  amount(10000, "the big bill", [
    "The ¥10,000 note is the unit Japan trips are actually budgeted in. It covers a casual dinner (about ¥7,600) plus the train rides home, or a full lean day in Tokyo: three meals, transit, coffee, and snacks.",
    "ATMs hand these out by default, and breaking one is never a problem — cash is still completely normal here.",
  ]),
  amount(15000, "a shopping stop plus lunch", [
    "¥15,000 absorbs a shopping stop (about ¥12,000 in the practice deck — think a few souvenirs or one mid-size purchase) plus lunch.",
    "In smaller cities it can also be a business-hotel night, though big-city hotels run higher.",
  ]),
  amount(20000, "a family activity day", [
    "¥20,000 covers a family activity like an aquarium, theme park, or baseball game (about ¥18,000 for a family in the practice deck) with snack money left over.",
    "For a solo traveler it is a generous full day: meals, transit, one paid attraction, and a souvenir.",
  ]),
  amount(25000, "most of a hotel night", [
    "¥25,000 is most of the way to a mid-range city hotel night (about ¥28,000), or a family activity (about ¥18,000) plus dinner.",
    "It is a useful threshold to know when you are eyeing same-day hotel deals.",
  ]),
  amount(30000, "a mid-range hotel night", [
    "¥30,000 covers a mid-range hotel night (about ¥28,000) with change for a konbini breakfast.",
    "It is also roughly a one-way Shinkansen fare between Tokyo and Kyoto plus lunch on the platform.",
  ]),
  amount(40000, "hotel plus a full day", [
    "¥40,000 is a hotel night (about ¥28,000) plus a full day of meals, trains, and coffee — in other words, one complete mid-range travel day for one person.",
    "It is also a serious shopping-day budget in Shibuya or Shinsaibashi.",
  ]),
  amount(50000, "trip-splurge territory", [
    "¥50,000 is trip-splurge territory — the practice deck pegs a splurge like a kaiseki dinner for two or a ryokan upgrade at about ¥45,000.",
    "It is also close to a Tokyo–Kyoto Shinkansen round trip for one person.",
  ]),
  amount(70000, "several days of ground costs", [
    "¥70,000 covers two to three mid-range hotel nights (about ¥28,000 each), or several days of on-the-ground costs — food, transit, attractions — for one person.",
    "Carrying this much cash is normal in Japan; it is still a cash-friendly country.",
  ]),
  amount(100000, "a chunk of real trip budget", [
    "¥100,000 is real trip-budget money: three to four mid-range hotel nights, or roughly a week of food, transit, and activities for one person if hotels are already paid.",
    "Many travelers withdraw in chunks like this to minimize ATM fees.",
  ]),
  amount(150000, "about a week, all-in, for one", [
    "¥150,000 is in the range of a week of mid-range solo travel including hotels (about ¥28,000 a night) and daily spending, depending heavily on the city and season.",
    "It is the kind of number worth sanity-checking against a live rate rather than a remembered one.",
  ]),
  amount(200000, "a comfortable week for two on the ground", [
    "¥200,000 approaches a comfortable week on the ground for two people — shared hotel nights, casual dinners (about ¥7,600), day trips, and a family activity or two — excluding flights.",
    "At this size, a few yen of rate movement changes the dollar figure noticeably, so check the live rate.",
  ]),
  amount(300000, "a long trip or a family week", [
    "¥300,000 is long-trip money: roughly two weeks of mid-range solo travel, or about a week for a family once hotels, meals, transit, and an ¥18,000-class family activity day or two are tallied.",
    "It is also where travel-card foreign-transaction fees start to matter in real dollars.",
  ]),
  amount(500000, "luxury territory", [
    "¥500,000 reaches luxury territory — high-end ryokan stays can run ¥80,000–150,000 per night, so this might be three or four nights of the best accommodation in Japan, or a very comfortable two-week trip for two.",
    "At this scale, compare the live mid-market rate against what your bank actually charges.",
  ]),
  amount(1000000, "a serious trip budget", [
    "¥1,000,000 is a serious budget: a long luxury trip for two, or months of modest travel.",
    "Few people convert this on a whim — if you are moving money at this size, the spread between the mid-market rate and your bank's rate is worth real dollars.",
  ]),
];

const AMOUNTS_BY_SLUG = new Map(
  CONVERT_AMOUNTS.map((entry) => [entry.slug, entry]),
);

export function getConvertAmount(slug: string) {
  return AMOUNTS_BY_SLUG.get(slug) ?? null;
}

export function getNeighborAmounts(yen: number, count = 4) {
  const index = CONVERT_AMOUNTS.findIndex((entry) => entry.yen === yen);
  if (index === -1) {
    return [];
  }

  const neighbors: ConvertAmount[] = [];
  for (
    let offset = 1;
    neighbors.length < count &&
    (index - offset >= 0 || index + offset < CONVERT_AMOUNTS.length);
    offset += 1
  ) {
    if (index - offset >= 0) {
      neighbors.push(CONVERT_AMOUNTS[index - offset]);
    }
    if (neighbors.length < count && index + offset < CONVERT_AMOUNTS.length) {
      neighbors.push(CONVERT_AMOUNTS[index + offset]);
    }
  }

  return neighbors.sort((first, second) => first.yen - second.yen);
}
