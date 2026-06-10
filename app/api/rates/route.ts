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
const FRANKFURTER_JPY_RATES_URL = new URL("https://api.frankfurter.dev/v2/rates");
FRANKFURTER_JPY_RATES_URL.searchParams.set("base", "JPY");
FRANKFURTER_JPY_RATES_URL.searchParams.set("quotes", SYMBOLS.join(","));
const FRANKFURTER_RATE_BASE_URL = "https://api.frankfurter.dev/v2/rate/JPY";

type FrankfurterRateRow = {
  date?: string;
  base?: string;
  quote?: string;
  rate?: number;
};

type RatesPayload = {
  base: "JPY";
  rates: Record<string, number>;
  sourceDate: string | null;
  fetchedAt: number;
  provider: "frankfurter";
};

export const dynamic = "force-static";
export const revalidate = 43_200;

export async function GET() {
  const payload = await fetchMultiRatePayload() ?? await fetchPairRatePayload();

  if (!payload) {
    return Response.json(
      { error: "Rate response was missing rates." },
      { status: 502 },
    );
  }

  return Response.json(payload);
}

async function fetchMultiRatePayload(): Promise<RatesPayload | null> {
  const response = await fetch(FRANKFURTER_JPY_RATES_URL, {
    next: { revalidate: RATE_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as unknown;
  return payloadFromRows(data);
}

async function fetchPairRatePayload(): Promise<RatesPayload | null> {
  const rows = await Promise.all(
    SYMBOLS.map(async (symbol) => {
      const response = await fetch(`${FRANKFURTER_RATE_BASE_URL}/${symbol}`, {
        next: { revalidate: RATE_REVALIDATE_SECONDS },
      });

      if (!response.ok) {
        return null;
      }

      return (await response.json()) as FrankfurterRateRow;
    }),
  );

  if (rows.some((row) => row === null)) {
    return null;
  }

  return payloadFromRows(rows);
}

function payloadFromRows(data: unknown): RatesPayload | null {
  if (!Array.isArray(data)) {
    return null;
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
    return null;
  }

  return {
    base: "JPY",
    rates,
    sourceDate: (data[0] as FrankfurterRateRow | undefined)?.date ?? null,
    fetchedAt: Date.now(),
    provider: "frankfurter",
  };
}
