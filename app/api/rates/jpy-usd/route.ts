const RATE_REVALIDATE_SECONDS = 12 * 60 * 60;
const FRANKFURTER_JPY_USD_URL = "https://api.frankfurter.dev/v2/rate/JPY/USD";

type FrankfurterRateResponse = {
  date?: string;
  rate?: number;
};

export const dynamic = "force-static";
export const revalidate = 43_200;

export async function GET() {
  const response = await fetch(FRANKFURTER_JPY_USD_URL, {
    next: { revalidate: RATE_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    return Response.json(
      { error: "Rate request failed." },
      { status: 502 },
    );
  }

  const data = (await response.json()) as FrankfurterRateResponse;
  const usdPerYen = data.rate;

  if (typeof usdPerYen !== "number" || usdPerYen <= 0) {
    return Response.json(
      { error: "Rate response was missing USD." },
      { status: 502 },
    );
  }

  return Response.json({
    base: "JPY",
    quote: "USD",
    usdPerYen,
    yenPerUsd: 1 / usdPerYen,
    sourceDate: data.date ?? null,
    fetchedAt: Date.now(),
    provider: "frankfurter",
  });
}
