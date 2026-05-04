"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QUIZ_STORAGE_KEY } from "./currency";

export type QuizAmount = {
  id: string;
  yen: number;
  label: string;
};

type QuizStats = {
  attempts: number;
  streak: number;
  boxLevel: number;
  lastErrorPercent: number | null;
  nextDueAt: number;
};

type QuizProgress = Record<string, QuizStats>;

export type QuizResult = {
  exactUsd: number;
  errorPercent: number;
  rating: "nailed" | "strong" | "close" | "repeat";
  stats: QuizStats;
};

export const QUIZ_AMOUNTS: QuizAmount[] = [
  { id: "drink-140", yen: 140, label: "vending machine drink" },
  { id: "snack-380", yen: 380, label: "konbini snack" },
  { id: "coffee-520", yen: 520, label: "coffee stop" },
  { id: "train-880", yen: 880, label: "city train ride" },
  { id: "lunch-1200", yen: 1200, label: "quick lunch" },
  { id: "ramen-1800", yen: 1800, label: "ramen plus side" },
  { id: "market-3200", yen: 3200, label: "market run" },
  { id: "taxi-4800", yen: 4800, label: "short taxi" },
  { id: "dinner-7600", yen: 7600, label: "casual dinner" },
  { id: "shopping-12000", yen: 12000, label: "shopping stop" },
  { id: "activity-18000", yen: 18000, label: "family activity" },
  { id: "hotel-28000", yen: 28000, label: "hotel night" },
  { id: "splurge-45000", yen: 45000, label: "trip splurge" },
];

const BOX_INTERVALS = [
  0,
  10 * 60 * 1000,
  2 * 60 * 60 * 1000,
  24 * 60 * 60 * 1000,
  3 * 24 * 60 * 60 * 1000,
  7 * 24 * 60 * 60 * 1000,
];

function defaultStats(): QuizStats {
  return {
    attempts: 0,
    streak: 0,
    boxLevel: 1,
    lastErrorPercent: null,
    nextDueAt: 0,
  };
}

function readQuizProgress(): QuizProgress {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const rawValue = window.localStorage.getItem(QUIZ_STORAGE_KEY);
    if (!rawValue) {
      return {};
    }

    return JSON.parse(rawValue) as QuizProgress;
  } catch {
    return {};
  }
}

function writeQuizProgress(progress: QuizProgress) {
  window.localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(progress));
}

function getStats(progress: QuizProgress, id: string) {
  return progress[id] ?? defaultStats();
}

function selectAmount(progress: QuizProgress, excludeId?: string) {
  const now = Date.now();
  const rows = QUIZ_AMOUNTS.map((amount) => ({
    amount,
    stats: getStats(progress, amount.id),
  })).filter((row) => row.amount.id !== excludeId);

  const candidates = rows.length
    ? rows
    : QUIZ_AMOUNTS.map((amount) => ({
        amount,
        stats: getStats(progress, amount.id),
      }));

  const due = candidates.filter((row) => row.stats.nextDueAt <= now);
  const pool = due.length ? due : candidates;

  return [...pool].sort((first, second) => {
    if (first.stats.boxLevel !== second.stats.boxLevel) {
      return first.stats.boxLevel - second.stats.boxLevel;
    }

    if (first.stats.nextDueAt !== second.stats.nextDueAt) {
      return first.stats.nextDueAt - second.stats.nextDueAt;
    }

    return first.stats.attempts - second.stats.attempts;
  })[0].amount;
}

function scoreError(errorPercent: number): QuizResult["rating"] {
  if (errorPercent <= 5) {
    return "nailed";
  }

  if (errorPercent <= 10) {
    return "strong";
  }

  if (errorPercent <= 20) {
    return "close";
  }

  return "repeat";
}

export function useQuizProgress() {
  const [progress, setProgress] = useState<QuizProgress>({});
  const [currentAmount, setCurrentAmount] = useState<QuizAmount>(QUIZ_AMOUNTS[0]);
  const [now, setNow] = useState(0);
  const progressRef = useRef<QuizProgress>({});

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedProgress = readQuizProgress();
      progressRef.current = storedProgress;
      setProgress(storedProgress);
      setCurrentAmount(selectAmount(storedProgress));
      setNow(Date.now());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const recordAnswer = useCallback(
    (amount: QuizAmount, guessUsd: number, exactUsd: number): QuizResult => {
      const now = Date.now();
      const currentStats = getStats(progressRef.current, amount.id);
      const errorPercent =
        exactUsd > 0 ? Math.abs(guessUsd - exactUsd) / exactUsd * 100 : 0;
      const rating = scoreError(errorPercent);
      const nextBoxLevel =
        rating === "repeat"
          ? 1
          : Math.min(BOX_INTERVALS.length - 1, currentStats.boxLevel + 1);
      const nextDueAt =
        rating === "repeat"
          ? now + 5 * 60 * 1000
          : now + BOX_INTERVALS[nextBoxLevel];
      const nextStats: QuizStats = {
        attempts: currentStats.attempts + 1,
        streak: rating === "repeat" ? 0 : currentStats.streak + 1,
        boxLevel: nextBoxLevel,
        lastErrorPercent: errorPercent,
        nextDueAt,
      };
      const nextProgress = {
        ...progressRef.current,
        [amount.id]: nextStats,
      };

      progressRef.current = nextProgress;
      writeQuizProgress(nextProgress);
      setProgress(nextProgress);
      setNow(now);

      return {
        exactUsd,
        errorPercent,
        rating,
        stats: nextStats,
      };
    },
    [],
  );

  const nextQuestion = useCallback((excludeId?: string) => {
    setCurrentAmount(selectAmount(progressRef.current, excludeId));
  }, []);

  const resetProgress = useCallback(() => {
    progressRef.current = {};
    writeQuizProgress({});
    setProgress({});
    setNow(Date.now());
    setCurrentAmount(selectAmount({}));
  }, []);

  const summary = useMemo(() => {
    const stats = QUIZ_AMOUNTS.map((amount) => getStats(progress, amount.id));
    return {
      practiced: stats.filter((item) => item.attempts > 0).length,
      mastered: stats.filter((item) => item.boxLevel >= 4).length,
      dueNow: stats.filter((item) => item.nextDueAt <= now).length,
      bestStreak: Math.max(0, ...stats.map((item) => item.streak)),
    };
  }, [now, progress]);

  return {
    currentAmount,
    progress,
    summary,
    recordAnswer,
    nextQuestion,
    resetProgress,
  };
}
