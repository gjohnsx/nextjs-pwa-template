export const FALLBACK_YEN_PER_USD = 150;
export const RATE_STORAGE_KEY = "yen-sense:rate";
export const QUIZ_STORAGE_KEY = "yen-sense:quiz";

export type StoredRate = {
  liveUsdPerYen: number | null;
  liveYenPerUsd: number | null;
  sourceDate: string | null;
  fetchedAt: number | null;
  manualYenPerUsd: number | null;
};

export type RateStatus = "loading" | "live" | "cached" | "fallback" | "error";

export type EffectiveRate = {
  usdPerYen: number;
  yenPerUsd: number;
  sourceDate: string | null;
  fetchedAt: number | null;
  isManual: boolean;
  isFallback: boolean;
};

export function defaultStoredRate(): StoredRate {
  return {
    liveUsdPerYen: null,
    liveYenPerUsd: null,
    sourceDate: null,
    fetchedAt: null,
    manualYenPerUsd: null,
  };
}

export function parseYenInput(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) {
    return 0;
  }

  return Number.parseInt(digits, 10);
}

export function parseUsdInput(value: string) {
  const normalized = value.replace(/[^\d.]/g, "");
  const firstDot = normalized.indexOf(".");
  const safeValue =
    firstDot === -1
      ? normalized
      : `${normalized.slice(0, firstDot + 1)}${normalized
          .slice(firstDot + 1)
          .replace(/\./g, "")}`;

  return Number.parseFloat(safeValue) || 0;
}

export function formatYen(amount: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(amount)));
}

export function formatYenInput(amount: number) {
  if (!amount) {
    return "";
  }

  return formatYen(amount);
}

export function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: amount >= 100 ? 0 : 2,
    maximumFractionDigits: amount >= 100 ? 0 : 2,
  }).format(Math.max(0, amount));
}

export function formatUsdCompact(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.max(0, amount));
}

export function formatYenPerUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

export function getEffectiveRate(storedRate: StoredRate): EffectiveRate {
  const liveYenPerUsd = storedRate.liveYenPerUsd;
  const manualYenPerUsd = storedRate.manualYenPerUsd;
  const yenPerUsd =
    manualYenPerUsd && manualYenPerUsd > 0
      ? manualYenPerUsd
      : liveYenPerUsd && liveYenPerUsd > 0
        ? liveYenPerUsd
        : FALLBACK_YEN_PER_USD;

  return {
    yenPerUsd,
    usdPerYen: 1 / yenPerUsd,
    sourceDate: storedRate.sourceDate,
    fetchedAt: storedRate.fetchedAt,
    isManual: Boolean(manualYenPerUsd && manualYenPerUsd > 0),
    isFallback: !liveYenPerUsd && !manualYenPerUsd,
  };
}

export function convertYenToUsd(yen: number, yenPerUsd: number) {
  return yen / yenPerUsd;
}
