import { cache } from "react";
import { FALLBACK_YEN_PER_USD } from "@/components/yensense/currency";

// Same upstream as app/api/rates/jpy-usd — fetched directly so static pages
// never depend on the deployed API route at build time.
const FRANKFURTER_JPY_USD_URL = "https://api.frankfurter.dev/v2/rate/JPY/USD";
const RATE_REVALIDATE_SECONDS = 24 * 60 * 60;

type FrankfurterRateResponse = {
  date?: string;
  rate?: number;
};

export type ServerYenRate = {
  yenPerUsd: number;
  sourceDate: string | null;
  isFallback: boolean;
};

export const getServerYenRate = cache(async (): Promise<ServerYenRate> => {
  try {
    const response = await fetch(FRANKFURTER_JPY_USD_URL, {
      next: { revalidate: RATE_REVALIDATE_SECONDS },
    });

    if (response.ok) {
      const data = (await response.json()) as FrankfurterRateResponse;
      const usdPerYen = data.rate;

      if (typeof usdPerYen === "number" && usdPerYen > 0) {
        return {
          yenPerUsd: 1 / usdPerYen,
          sourceDate: data.date ?? null,
          isFallback: false,
        };
      }
    }
  } catch {
    // Fall through to the offline estimate so builds never fail.
  }

  return {
    yenPerUsd: FALLBACK_YEN_PER_USD,
    sourceDate: null,
    isFallback: true,
  };
});
