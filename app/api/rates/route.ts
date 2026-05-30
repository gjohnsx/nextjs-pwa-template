const RATE_REVALIDATE_SECONDS = 12 * 60 * 60;
const SYMBOLS = [
  "USD",
  "EUR",
  "GBP",
  "AUD",
  "CAD",
  "KRW",
  "CNY",
  "SGD",
  "HKD",
  "THB",
];
const FRANKFURTER_JPY_RATES_URL = `https://api.frankfurter.dev/v2/rates?base=JPY&quotes=${SYMBOLS.join(",")}`;

type FrankfurterRateRow = {
  date?: string;
  base?: string;
  quote?: string;
  rate?: number;
};

export const dynamic = "force-static";
export const revalidate = 43_200;

export async function GET() {
  const response = await fetch(FRANKFURTER_JPY_RATES_URL, {
    next: { revalidate: RATE_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    return Response.json(
      { error: "Rate request failed." },
      { status: 502 },
    );
  }

  const data = (await response.json()) as unknown;
  if (!Array.isArray(data)) {
    return Response.json(
      { error: "Rate response was missing rates." },
      { status: 502 },
    );
  }

  const rates: Record<string, number> = {};
  for (const row of data as FrankfurterRateRow[]) {
    if (
      row.base === "JPY" &&
      typeof row.quote === "string" &&
      SYMBOLS.includes(row.quote) &&
      typeof row.rate === "number"
    ) {
      rates[row.quote] = row.rate;
    }
  }
  const missingSymbols = SYMBOLS.filter((symbol) => typeof rates[symbol] !== "number");

  if (
    missingSymbols.length > 0 ||
    Object.values(rates).some((rate) => typeof rate !== "number" || rate <= 0)
  ) {
    return Response.json(
      { error: "Rate response was missing rates." },
      { status: 502 },
    );
  }

  return Response.json({
    base: "JPY",
    rates,
    sourceDate: (data[0] as FrankfurterRateRow | undefined)?.date ?? null,
    fetchedAt: Date.now(),
    provider: "frankfurter",
  });
}
