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

const RATE_REFRESH_ENDPOINT = "/api/rates/jpy-usd";
const BACKGROUND_RATE_REFRESH_INTERVAL_MS = 12 * 60 * 60 * 1000;

type RateSnapshotResponse = {
  usdPerYen?: number;
  yenPerUsd?: number;
  sourceDate?: string | null;
  fetchedAt?: number;
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

function shouldRefreshInBackground(rate: StoredRate) {
  if (!rate.liveYenPerUsd || !rate.fetchedAt) {
    return true;
  }

  return Date.now() - rate.fetchedAt > BACKGROUND_RATE_REFRESH_INTERVAL_MS;
}

export function useYenRate() {
  const [storedRate, setStoredRate] = useState<StoredRate>(defaultStoredRate);
  const [status, setStatus] = useState<RateStatus>("fallback");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshRate = useCallback(async (options?: { silent?: boolean }) => {
    const isSilent = options?.silent ?? false;

    if (!isSilent) {
      setStatus("loading");
      setErrorMessage(null);
    }

    try {
      const response = await fetch(RATE_REFRESH_ENDPOINT, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Rate request failed.");
      }

      const data = (await response.json()) as RateSnapshotResponse;
      const usdPerYen = data.usdPerYen;
      const yenPerUsd = data.yenPerUsd;
      if (
        typeof usdPerYen !== "number" ||
        usdPerYen <= 0 ||
        typeof yenPerUsd !== "number" ||
        yenPerUsd <= 0
      ) {
        throw new Error("Rate response was missing USD.");
      }

      setStoredRate((currentRate) => {
        const nextRate: StoredRate = {
          liveUsdPerYen: usdPerYen,
          liveYenPerUsd: yenPerUsd,
          sourceDate: data.sourceDate ?? null,
          fetchedAt: typeof data.fetchedAt === "number" ? data.fetchedAt : Date.now(),
          manualYenPerUsd: currentRate.manualYenPerUsd,
        };
        writeStoredRate(nextRate);
        return nextRate;
      });
      setStatus("live");
    } catch {
      const cachedRate = readStoredRate();
      setStoredRate(cachedRate);

      if (isSilent) {
        setStatus(cachedRate.liveYenPerUsd ? "cached" : "fallback");
        return;
      }

      setStatus(cachedRate.liveYenPerUsd ? "cached" : "error");
      setErrorMessage(
        cachedRate.liveYenPerUsd
          ? "Could not refresh. Using your cached rate."
          : "Could not refresh. Using the offline estimate.",
      );
    }
  }, []);

  useEffect(() => {
    const cachedRate = readStoredRate();
    setStoredRate(cachedRate);
    setStatus(cachedRate.liveYenPerUsd ? "cached" : "fallback");

    if (!shouldRefreshInBackground(cachedRate)) {
      return;
    }

    const refreshTimer = window.setTimeout(() => {
      void refreshRate({ silent: true });
    }, 750);

    return () => window.clearTimeout(refreshTimer);
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
