"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FALLBACK_YEN_PER_USD,
  RATE_STORAGE_KEY,
  RateStatus,
  StoredRate,
  defaultStoredRate,
  getEffectiveRate,
} from "./currency";

type FrankfurterRateResponse = {
  date?: string;
  rate?: number;
};

function readStoredRate(): StoredRate {
  if (typeof window === "undefined") {
    return defaultStoredRate();
  }

  try {
    const rawValue = window.localStorage.getItem(RATE_STORAGE_KEY);
    if (!rawValue) {
      return defaultStoredRate();
    }

    const parsed = JSON.parse(rawValue) as Partial<StoredRate>;
    return {
      liveUsdPerYen:
        typeof parsed.liveUsdPerYen === "number" ? parsed.liveUsdPerYen : null,
      liveYenPerUsd:
        typeof parsed.liveYenPerUsd === "number" ? parsed.liveYenPerUsd : null,
      sourceDate:
        typeof parsed.sourceDate === "string" ? parsed.sourceDate : null,
      fetchedAt: typeof parsed.fetchedAt === "number" ? parsed.fetchedAt : null,
      manualYenPerUsd:
        typeof parsed.manualYenPerUsd === "number"
          ? parsed.manualYenPerUsd
          : null,
    };
  } catch {
    return defaultStoredRate();
  }
}

function writeStoredRate(rate: StoredRate) {
  window.localStorage.setItem(RATE_STORAGE_KEY, JSON.stringify(rate));
}

export function useYenRate() {
  const [storedRate, setStoredRate] = useState<StoredRate>(defaultStoredRate);
  const [status, setStatus] = useState<RateStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const cachedRate = readStoredRate();
    setStoredRate(cachedRate);
    setStatus(cachedRate.liveYenPerUsd ? "cached" : "fallback");
  }, []);

  const refreshRate = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("https://api.frankfurter.dev/v2/rate/JPY/USD", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Rate request failed.");
      }

      const data = (await response.json()) as FrankfurterRateResponse;
      const usdPerYen = data.rate;
      if (typeof usdPerYen !== "number" || usdPerYen <= 0) {
        throw new Error("Rate response was missing USD.");
      }

      setStoredRate((currentRate) => {
        const nextRate: StoredRate = {
          liveUsdPerYen: usdPerYen,
          liveYenPerUsd: 1 / usdPerYen,
          sourceDate: data.date ?? null,
          fetchedAt: Date.now(),
          manualYenPerUsd: currentRate.manualYenPerUsd,
        };
        writeStoredRate(nextRate);
        return nextRate;
      });
      setStatus("live");
    } catch {
      const cachedRate = readStoredRate();
      setStoredRate(cachedRate);
      setStatus(cachedRate.liveYenPerUsd ? "cached" : "error");
      setErrorMessage(
        cachedRate.liveYenPerUsd
          ? "Could not refresh. Using your cached rate."
          : "Could not refresh. Using the offline estimate.",
      );
    }
  }, []);

  useEffect(() => {
    void refreshRate();
  }, [refreshRate]);

  const setManualYenPerUsd = useCallback((yenPerUsd: number | null) => {
    setStoredRate((currentRate) => {
      const nextRate: StoredRate = {
        ...currentRate,
        manualYenPerUsd:
          yenPerUsd && yenPerUsd > 0 ? yenPerUsd : null,
      };
      writeStoredRate(nextRate);
      return nextRate;
    });
  }, []);

  const resetToFallback = useCallback(() => {
    const nextRate: StoredRate = {
      liveUsdPerYen: null,
      liveYenPerUsd: null,
      sourceDate: null,
      fetchedAt: null,
      manualYenPerUsd: FALLBACK_YEN_PER_USD,
    };
    writeStoredRate(nextRate);
    setStoredRate(nextRate);
    setStatus("fallback");
  }, []);

  const effectiveRate = useMemo(
    () => getEffectiveRate(storedRate),
    [storedRate],
  );

  return {
    storedRate,
    effectiveRate,
    status,
    errorMessage,
    refreshRate,
    setManualYenPerUsd,
    resetToFallback,
  };
}
