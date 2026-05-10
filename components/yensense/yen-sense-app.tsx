"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Brain,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  CircleX,
  Delete,
  Plus,
  RefreshCw,
  RotateCcw,
  Settings2,
  Smartphone,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  convertYenToUsd,
  FALLBACK_YEN_PER_USD,
  formatUsd,
  formatUsdCompact,
  formatYen,
  formatYenInput,
  formatYenPerUsd,
  parseUsdInput,
  parseYenInput,
  type RateStatus,
} from "./currency";
import { useQuizProgress, type QuizResult } from "./use-quiz-progress";
import { useYenRate } from "./use-yen-rate";

type DrawerView = "practice" | "rate" | "phone";

const QUICK_AMOUNT_SETS = [
  {
    label: "Small",
    note: "Konbini math",
    amounts: [25, 50, 100, 500],
  },
  {
    label: "Meals",
    note: "Cafes and transit",
    amounts: [500, 780, 1200, 2300],
  },
  {
    label: "Trip",
    note: "Shopping and tickets",
    amounts: [5000, 10000, 20000, 50000],
  },
];

const STATUS_LABELS: Record<RateStatus, string> = {
  loading: "Updating",
  live: "Live",
  cached: "Saved",
  fallback: "Estimate",
  error: "Check rate",
};

const DIGIT_LIMIT = 9;
const MAX_YEN_AMOUNT = 10 ** DIGIT_LIMIT - 1;

const KEYPAD_ROWS = [
  ["7", "8", "9", 500],
  ["4", "5", "6", 100],
  ["1", "2", "3", 50],
  ["00", "0", "plus", 25],
] as const;

function formatRateStatus({
  isManual,
  status,
}: {
  isManual: boolean;
  status: RateStatus;
}) {
  if (isManual) {
    return "Manual";
  }

  return STATUS_LABELS[status];
}

function formatMetaDate(value: number | null) {
  if (!value) {
    return "NO SIGNAL";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function registerAppShell() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) =>
        Promise.all(
          registrations.map((registration) => registration.unregister()),
        ),
      )
      .catch(() => {});

    if ("caches" in window) {
      caches
        .keys()
        .then((cacheNames) =>
          Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName))),
        )
        .catch(() => {});
    }

    return;
  }

  navigator.serviceWorker.register("/sw.js", {
    scope: "/",
    updateViaCache: "none",
  }).catch(() => {
    toast.error("Offline mode could not start.");
  });
}

function PanelMeta({
  issue,
  label,
}: {
  issue: string;
  label: string;
}) {
  return (
    <div className="zine-meta flex items-center justify-between gap-3 text-[10px] leading-none text-[var(--muted-ink)]">
      <span>{issue}</span>
      <span>{label}</span>
    </div>
  );
}

function ZineButton({
  children,
  className = "",
  accent = false,
  ...props
}: React.ComponentProps<"button"> & {
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      className={`flex min-h-11 items-center justify-center gap-2 rounded-[8px] border px-3 py-2 text-sm font-bold shadow-[0_1px_0_rgba(33,26,22,0.04)] transition-colors ${
        accent
          ? "border-[var(--accent-pop)] bg-[var(--accent-pop)] text-[var(--panel)] hover:border-[var(--ink)] hover:bg-[var(--ink)]"
          : "border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] hover:border-[var(--ink)] hover:bg-[var(--field)]"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(
    target.closest("input, textarea, select, [contenteditable='true']"),
  );
}

function InstallPanel() {
  const [isIOS] = useState(
    () =>
      typeof navigator !== "undefined" &&
      /iPad|iPhone|iPod/.test(navigator.userAgent),
  );
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const displayModeQuery = window.matchMedia("(display-mode: standalone)");

    const syncDisplayMode = () => {
      setIsStandalone(
        displayModeQuery.matches ||
          Boolean((navigator as Navigator & { standalone?: boolean }).standalone),
      );
    };

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      toast.success("Yen Sense installed.");
    };

    syncDisplayMode();
    displayModeQuery.addEventListener("change", syncDisplayMode);
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      displayModeQuery.removeEventListener("change", syncDisplayMode);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstallClick() {
    if (!deferredPrompt) {
      toast.info(
        isIOS
          ? "Share, then Add to Home Screen."
          : "Use the browser install option.",
      );
      return;
    }

    await deferredPrompt.prompt();
    const userChoice = await deferredPrompt.userChoice;
    toast[userChoice.outcome === "accepted" ? "success" : "warning"](
      userChoice.outcome === "accepted"
        ? "Install accepted."
        : "Install dismissed.",
    );
    setDeferredPrompt(null);
  }

  return (
    <section className="grid gap-4">
      <PanelMeta issue="Phone" label="Install" />
      <div className="grid grid-cols-[68px_1fr] overflow-hidden rounded-[8px] border border-[var(--line)] bg-[var(--field)]">
        <div className="grid place-items-center border-r border-[var(--line)] bg-[var(--sage)] p-3">
          <Smartphone className="size-7 text-[var(--ink)]" />
        </div>
        <div className="p-3">
          <p className="font-serif text-2xl font-bold leading-none text-[var(--ink)]">
            Home Screen
          </p>
          <p className="zine-meta mt-2 text-[10px] text-[var(--muted-ink)]">
            {isStandalone
              ? "Running standalone"
              : "PWA ready"}
          </p>
        </div>
      </div>

      {!isStandalone ? (
        <ZineButton onClick={handleInstallClick} accent>
          <Check className="size-4" />
          Add 追加
        </ZineButton>
      ) : null}

      {isIOS && !isStandalone ? (
        <p className="zine-meta rounded-[8px] border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-[10px] text-[var(--muted-ink)]">
          iOS Safari: Share, then Add to Home Screen.
        </p>
      ) : null}
    </section>
  );
}

function RatePanel({
  currentRate,
  liveRate,
  status,
  errorMessage,
  onManualRateChange,
  onRefresh,
  onFallback,
}: {
  currentRate: number;
  liveRate: number | null;
  status: RateStatus;
  errorMessage: string | null;
  onManualRateChange: (rate: number | null) => void;
  onRefresh: () => void;
  onFallback: () => void;
}) {
  const [rateInput, setRateInput] = useState(formatYenPerUsd(currentRate));

  useEffect(() => {
    setRateInput(formatYenPerUsd(currentRate));
  }, [currentRate]);

  function applyManualRate() {
    const nextRate = Number.parseFloat(rateInput.replace(/[^\d.]/g, ""));
    if (!nextRate || nextRate <= 0) {
      toast.error("Enter a valid yen per dollar rate.");
      return;
    }

    onManualRateChange(nextRate);
    toast.success(`Using ¥${formatYenPerUsd(nextRate)} = $1.`);
  }

  return (
    <section className="grid gap-4">
      <PanelMeta issue="Rate" label="Exchange" />
      <label
        htmlFor="manual-rate"
        className="zine-meta text-[10px] text-[var(--muted-ink)]"
      >
        Yen per dollar
      </label>
      <div className="grid grid-cols-[44px_1fr] overflow-hidden rounded-[8px] border border-[var(--line)] bg-[var(--field)]">
        <span className="grid place-items-center border-r border-[var(--line)] font-serif text-3xl font-bold text-[var(--accent-pop)]">
          ¥
        </span>
        <input
          id="manual-rate"
          inputMode="decimal"
          value={rateInput}
          onChange={(event) => setRateInput(event.target.value)}
          className="h-16 min-w-0 bg-transparent px-3 font-mono text-5xl font-bold leading-none text-[var(--ink)] outline-none placeholder:text-[var(--faint-ink)]"
        />
      </div>

      <div className="grid grid-cols-[1.25fr_0.75fr] gap-2">
        <ZineButton onClick={applyManualRate} accent>
          <Check className="size-4" />
          Use
        </ZineButton>
        <ZineButton onClick={() => onManualRateChange(null)}>
          <RotateCcw className="size-4" />
          Live
        </ZineButton>
      </div>

      <div className="grid gap-2 rounded-[8px] border border-[var(--line)] bg-[var(--panel)] p-3">
        <PanelMeta issue="Source" label={STATUS_LABELS[status]} />
        <p className="text-sm leading-tight text-[var(--muted-ink)]">
          {liveRate
            ? `Last fetched: ¥${formatYenPerUsd(liveRate)} = $1.`
            : `Offline estimate: ¥${formatYenPerUsd(FALLBACK_YEN_PER_USD)} = $1.`}
        </p>
        {errorMessage ? (
          <p className="border-t border-[var(--line)] pt-2 text-sm font-bold text-[var(--accent-pop)]">
            {errorMessage}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ZineButton onClick={onRefresh}>
          <RefreshCw className="size-4" />
          Refresh
        </ZineButton>
        <ZineButton onClick={onFallback}>
          ¥150
        </ZineButton>
      </div>
    </section>
  );
}

function PracticePanel({
  yenPerUsd,
}: {
  yenPerUsd: number;
}) {
  const quiz = useQuizProgress();
  const [guessInput, setGuessInput] = useState("");
  const [result, setResult] = useState<QuizResult | null>(null);
  const exactUsd = useMemo(
    () => convertYenToUsd(quiz.currentAmount.yen, yenPerUsd),
    [quiz.currentAmount.yen, yenPerUsd],
  );

  function submitGuess() {
    const guessUsd = parseUsdInput(guessInput);
    if (!guessUsd) {
      toast.error("Enter your USD estimate.");
      return;
    }

    setResult(quiz.recordAnswer(quiz.currentAmount, guessUsd, exactUsd));
  }

  function nextQuestion() {
    quiz.nextQuestion(quiz.currentAmount.id);
    setGuessInput("");
    setResult(null);
  }

  const ratingCopy = {
    nailed: "Nailed",
    strong: "Strong",
    close: "Close",
    repeat: "Repeat",
  } as const;

  return (
    <section className="grid gap-4">
      <PanelMeta issue="Practice" label="Mental math" />
      <div className="grid grid-cols-4 overflow-hidden rounded-[8px] border border-[var(--line)] bg-[var(--panel)] text-center">
        {[
          ["due", quiz.summary.dueNow],
          ["seen", quiz.summary.practiced],
          ["solid", quiz.summary.mastered],
          ["streak", quiz.summary.bestStreak],
        ].map(([label, value]) => (
          <div className="border-r border-[var(--line)] p-3 last:border-r-0" key={label}>
            <p className="font-mono text-2xl leading-none text-[var(--ink)]">
              {value}
            </p>
            <p className="zine-meta mt-1 text-[9px] text-[var(--muted-ink)]">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid rounded-[8px] border border-[var(--line)] bg-[var(--field)] p-4">
        <p className="zine-meta text-[10px] text-[var(--muted-ink)]">
          {quiz.currentAmount.label}
        </p>
        <p className="mt-2 font-serif text-6xl font-bold leading-none text-[var(--ink)]">
          ¥{formatYen(quiz.currentAmount.yen)}
        </p>
      </div>

      <label
        htmlFor="quiz-guess"
        className="zine-meta text-[10px] text-[var(--muted-ink)]"
      >
        USD estimate
      </label>
      <div className="grid grid-cols-[44px_1fr] overflow-hidden rounded-[8px] border border-[var(--line)] bg-[var(--field)]">
        <span className="grid place-items-center border-r border-[var(--line)] font-serif text-3xl font-bold text-[var(--accent-pop)]">
          $
        </span>
        <input
          id="quiz-guess"
          value={guessInput}
          onChange={(event) => setGuessInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !result) {
              submitGuess();
            }
          }}
          inputMode="decimal"
          placeholder="0.00"
          className="h-14 min-w-0 bg-transparent px-3 font-mono text-4xl text-[var(--ink)] outline-none placeholder:text-[var(--faint-ink)]"
        />
      </div>

      {result ? (
        <div className="grid gap-2 rounded-[8px] border border-[var(--line)] bg-[var(--panel)] p-3">
          <PanelMeta issue={`BOX ${result.stats.boxLevel}`} label={ratingCopy[result.rating]} />
          <p className="font-mono text-4xl leading-none text-[var(--ink)]">
            {formatUsdCompact(result.exactUsd)}
          </p>
          <p className="zine-meta border-t border-[var(--line)] pt-2 text-[10px] text-[var(--muted-ink)]">
            {result.errorPercent.toFixed(1)}% away
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-[1.35fr_0.65fr] gap-2">
        <ZineButton onClick={result ? nextQuestion : submitGuess} accent>
          {result ? (
            <>
              <ChevronsRight className="size-4" />
              Next
            </>
          ) : (
            <>
              <Check className="size-4" />
              Check
            </>
          )}
        </ZineButton>
        <ZineButton
          onClick={() => {
            quiz.resetProgress();
            setGuessInput("");
            setResult(null);
          }}
        >
          <RotateCcw className="size-4" />
          Reset
        </ZineButton>
      </div>
    </section>
  );
}

export function YenSenseApp() {
  const [yenInput, setYenInput] = useState("");
  const [storedYenTotal, setStoredYenTotal] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerView, setDrawerView] = useState<DrawerView>("practice");
  const [quickSetIndex, setQuickSetIndex] = useState(0);
  const rate = useYenRate();
  const currentYenEntry = parseYenInput(yenInput);
  const yenAmount = Math.min(storedYenTotal + currentYenEntry, MAX_YEN_AMOUNT);
  const usdAmount = convertYenToUsd(yenAmount, rate.effectiveRate.yenPerUsd);
  const quickSet = QUICK_AMOUNT_SETS[quickSetIndex];
  const statusLabel = formatRateStatus({
    isManual: rate.effectiveRate.isManual,
    status: rate.status,
  });
  const displayYenInput = yenInput || formatYenInput(storedYenTotal);
  const hasAddition = storedYenTotal > 0;

  useEffect(() => {
    registerAppShell();
  }, []);

  const appendYenDigits = useCallback((digits: string) => {
    setYenInput((currentValue) => {
      const currentDigits = currentValue.replace(/\D/g, "");
      const nextDigits = `${currentDigits}${digits}`
        .replace(/^0+(?=\d)/, "")
        .slice(0, DIGIT_LIMIT);
      const nextAmount = Number.parseInt(nextDigits, 10) || 0;

      return formatYenInput(nextAmount);
    });
  }, []);

  const backspaceYen = useCallback(() => {
    if (!yenInput) {
      const nextStoredDigits = String(storedYenTotal).slice(0, -1);
      setStoredYenTotal(Number.parseInt(nextStoredDigits, 10) || 0);
      return;
    }

    setYenInput((currentValue) => {
      const nextDigits = currentValue.replace(/\D/g, "").slice(0, -1);
      const nextAmount = Number.parseInt(nextDigits, 10) || 0;

      return formatYenInput(nextAmount);
    });
  }, [storedYenTotal, yenInput]);

  const addYen = useCallback((amount: number) => {
    setStoredYenTotal(Math.min(yenAmount + amount, MAX_YEN_AMOUNT));
    setYenInput("");
  }, [yenAmount]);

  const commitAddition = useCallback(() => {
    if (!currentYenEntry) {
      return;
    }

    setStoredYenTotal(yenAmount);
    setYenInput("");
  }, [currentYenEntry, yenAmount]);

  const clearYen = useCallback(() => {
    setYenInput("");
    setStoredYenTotal(0);
  }, []);

  const stepQuickSet = useCallback((direction: -1 | 1) => {
    setQuickSetIndex((currentIndex) =>
      Math.min(
        QUICK_AMOUNT_SETS.length - 1,
        Math.max(0, currentIndex + direction),
      ),
    );
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDrawerOpen(false);
      }

      if (
        drawerOpen ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        isEditableTarget(event.target)
      ) {
        return;
      }

      if (/^\d$/.test(event.key)) {
        event.preventDefault();
        appendYenDigits(event.key);
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        backspaceYen();
        return;
      }

      if (event.key === "+" || event.key === "Enter") {
        event.preventDefault();
        commitAddition();
        return;
      }

      if (event.key === "Delete") {
        event.preventDefault();
        clearYen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [appendYenDigits, backspaceYen, clearYen, commitAddition, drawerOpen]);

  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let tracking = false;

    const handlePointerDown = (event: PointerEvent) => {
      const startsAtRightEdge = event.clientX > window.innerWidth - 34;
      if (!drawerOpen && !startsAtRightEdge) {
        return;
      }

      startX = event.clientX;
      startY = event.clientY;
      tracking = true;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!tracking) {
        return;
      }

      const horizontalDelta = event.clientX - startX;
      const verticalDelta = Math.abs(event.clientY - startY);
      if (verticalDelta > 60) {
        tracking = false;
        return;
      }

      if (!drawerOpen && horizontalDelta < -42) {
        setDrawerOpen(true);
        tracking = false;
      }

      if (drawerOpen && horizontalDelta > 64) {
        setDrawerOpen(false);
        tracking = false;
      }
    };

    const stopTracking = () => {
      tracking = false;
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopTracking);
    window.addEventListener("pointercancel", stopTracking);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopTracking);
      window.removeEventListener("pointercancel", stopTracking);
    };
  }, [drawerOpen]);

  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-[var(--paper)] text-[var(--ink)]">
      <section className="mx-auto flex min-h-dvh w-full max-w-[540px] flex-col px-4 py-4 sm:px-6 sm:py-6">
        <div className="grid flex-1 content-start gap-3 sm:gap-4">
          <header className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="zine-meta text-[10px] text-[var(--muted-ink)]">
                Tokyo pocket converter
              </p>
              <h1 className="mt-1 font-serif text-[34px] font-extrabold leading-none text-[var(--ink)] sm:text-[42px]">
                Yen Sense
              </h1>
            </div>
            <button
              type="button"
              aria-label="Open menu"
              title="Open menu"
              onClick={() => setDrawerOpen(true)}
              className="grid size-10 shrink-0 place-items-center rounded-[8px] border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] shadow-[0_1px_0_rgba(33,26,22,0.04)] transition-colors hover:border-[var(--ink)] hover:bg-[var(--field)]"
            >
              <Settings2 className="size-4" />
            </button>
          </header>

          <section className="grid gap-4 rounded-[8px] border border-[var(--line)] bg-[var(--panel)] p-4 shadow-[0_16px_45px_rgba(33,26,22,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <span className="zine-sticker inline-flex px-2.5 py-1 text-[10px]">
                {statusLabel}
              </span>
              <span className="zine-meta text-[10px] text-[var(--muted-ink)]">
                JPY to USD
              </span>
            </div>
            <div>
              <p className="zine-meta text-[10px] text-[var(--muted-ink)]">
                Dollar result
              </p>
              <output
                aria-live="polite"
                className="mt-2 block break-words font-serif text-[56px] font-extrabold leading-[0.9] text-[var(--ink)] sm:text-[76px]"
              >
                {formatUsd(usdAmount)}
              </output>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-[8px] bg-[var(--sage)] px-3 py-2 text-sm text-[var(--ink)]">
              <span className="font-mono text-lg leading-none">
                ¥{formatYenPerUsd(rate.effectiveRate.yenPerUsd)}
              </span>
              <span className="zine-meta text-[10px] text-[var(--muted-ink)]">
                per $1
              </span>
            </div>
          </section>

          <section className="grid gap-3 rounded-[8px] border border-[var(--line)] bg-[var(--panel)] p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="zine-meta text-[10px] text-[var(--muted-ink)]">
                Yen amount
              </p>
              <span className="zine-meta text-[9px] text-[var(--faint-ink)]">
                keypad
              </span>
            </div>

            <div className="grid grid-cols-[46px_minmax(0,1fr)_44px] overflow-hidden rounded-[8px] border border-[var(--line)] bg-[var(--field)]">
              <span className="grid place-items-center border-r border-[var(--line)] font-serif text-4xl font-bold text-[var(--accent-pop)]">
                ¥
              </span>
              <output
                id="yen-display"
                aria-live="polite"
                className={`flex h-16 min-w-0 items-center overflow-hidden px-3 font-mono text-[clamp(2rem,9vw,46px)] font-bold leading-none ${
                  displayYenInput ? "text-[var(--ink)]" : "text-[var(--faint-ink)]"
                }`}
              >
                {displayYenInput || "0"}
              </output>
              <button
                type="button"
                aria-label="Backspace yen amount"
                title="Backspace"
                onClick={backspaceYen}
                className="grid place-items-center border-l border-[var(--line)] text-[var(--muted-ink)] transition-colors hover:bg-[var(--sage)] hover:text-[var(--ink)]"
              >
                <Delete className="size-4" />
              </button>
            </div>

            {hasAddition ? (
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-[8px] bg-[var(--sage)] px-3 py-2 text-[var(--muted-ink)]">
                <span className="zine-meta text-[9px]">
                  Subtotal ¥{formatYen(storedYenTotal)}
                </span>
                <span className="zine-meta text-[9px]">
                  {currentYenEntry
                    ? `Total ¥${formatYen(yenAmount)}`
                    : "+ next"}
                </span>
              </div>
            ) : null}

            <div className="grid grid-cols-[1fr_auto] gap-2">
              <div>
                <p className="zine-meta text-[10px] text-[var(--muted-ink)]">
                  Quick adds
                </p>
                <p className="text-xs leading-tight text-[var(--muted-ink)]">
                  {quickSet.note}
                </p>
              </div>
              <div className="grid grid-cols-[32px_108px_32px] overflow-hidden rounded-[8px] border border-[var(--line)] bg-[var(--field)]">
                <button
                  type="button"
                  aria-label="Use smaller quick amounts"
                  title="Smaller amounts"
                  disabled={quickSetIndex === 0}
                  onClick={() => stepQuickSet(-1)}
                  className="grid place-items-center border-r border-[var(--line)] text-[var(--muted-ink)] transition-colors hover:bg-[var(--sage)] hover:text-[var(--ink)] disabled:text-[var(--faint-ink)]"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="zine-meta grid place-items-center border-r border-[var(--line)] px-1 text-center text-[9px] text-[var(--muted-ink)]">
                  {quickSet.label}
                </span>
                <button
                  type="button"
                  aria-label="Use larger quick amounts"
                  title="Larger amounts"
                  disabled={quickSetIndex === QUICK_AMOUNT_SETS.length - 1}
                  onClick={() => stepQuickSet(1)}
                  className="grid place-items-center text-[var(--muted-ink)] transition-colors hover:bg-[var(--sage)] hover:text-[var(--ink)] disabled:text-[var(--faint-ink)]"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {KEYPAD_ROWS.map((row) =>
                row.map((key) => {
                  if (typeof key === "number") {
                    return (
                      <button
                        type="button"
                        key={`quick-${key}`}
                        onClick={() => addYen(key)}
                        className="zine-meta h-[52px] rounded-[8px] border border-[var(--line)] bg-[var(--field)] text-[10px] text-[var(--ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] transition-colors hover:border-[var(--accent-pop)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent-pop)]"
                      >
                        +¥{formatYen(key)}
                      </button>
                    );
                  }

                  if (key === "plus") {
                    return (
                      <button
                        type="button"
                        key={key}
                        aria-label="Add current yen item"
                        title="Add current yen item"
                        onClick={commitAddition}
                        className="grid h-[52px] place-items-center rounded-[8px] border border-[var(--accent-pop)] bg-[var(--accent-soft)] text-[var(--accent-pop)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_1px_0_rgba(33,26,22,0.04)] transition-colors hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--panel)]"
                      >
                        <Plus className="size-5" />
                      </button>
                    );
                  }

                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => appendYenDigits(key)}
                      className="h-[52px] rounded-[8px] border border-[var(--line)] bg-[var(--field)] font-mono text-2xl font-bold leading-none text-[var(--ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_1px_0_rgba(33,26,22,0.04)] transition-colors hover:border-[var(--ink)] hover:bg-[var(--panel)]"
                    >
                      {key}
                    </button>
                  );
                }),
              )}
            </div>

            <button
              type="button"
              onClick={clearYen}
              className="flex h-11 items-center justify-center gap-2 rounded-[8px] border border-[var(--line)] bg-[var(--panel)] text-sm font-bold text-[var(--ink)] transition-colors hover:border-[var(--accent-pop)] hover:text-[var(--accent-pop)]"
            >
              <CircleX className="size-4" />
              Clear
            </button>
          </section>

          <footer className="rounded-[8px] border border-[var(--line)] bg-[var(--panel)] px-3 py-2">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <p className="zine-meta text-[10px] text-[var(--muted-ink)]">
                {rate.status === "loading"
                  ? "Refreshing rate"
                  : "Ready offline"}
              </p>
              <p className="zine-meta text-[10px] text-[var(--muted-ink)]">
                FETCHED: {formatMetaDate(rate.effectiveRate.fetchedAt)}
              </p>
            </div>
            {rate.errorMessage ? (
              <p className="mt-1 text-xs font-bold text-[var(--accent-pop)]">
                {rate.errorMessage}
              </p>
            ) : null}
          </footer>
        </div>
      </section>

      <button
        type="button"
        aria-label="Close drawer"
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 z-40 bg-[rgba(33,26,22,0.28)] backdrop-blur-[1px] transition-opacity duration-200 ${
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-hidden={!drawerOpen}
        className={`fixed right-0 top-0 z-50 flex h-dvh w-[min(100vw,430px)] flex-col border-l border-[var(--line)] bg-[var(--drawer)] shadow-[-24px_0_60px_rgba(33,26,22,0.14)] transition-transform duration-200 ease-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="grid grid-cols-[1fr_48px] border-b border-[var(--line)] bg-[var(--drawer)]">
          <div className="p-4">
            <p className="zine-meta text-[10px] text-[var(--muted-ink)]">
              Yen Sense
            </p>
            <p className="mt-1 font-serif text-3xl font-bold leading-none text-[var(--ink)]">
              {drawerView === "practice"
                ? "Practice"
                : drawerView === "rate"
                  ? "Rate"
                  : "Phone"}
            </p>
          </div>
          <button
            type="button"
            title="Close"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="grid place-items-center border-l border-[var(--line)] bg-[var(--drawer)] text-[var(--muted-ink)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent-pop)]"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 border-b border-[var(--line)] bg-[var(--drawer)] p-3">
          {[
            { view: "practice" as const, label: "Practice", icon: Brain },
            { view: "rate" as const, label: "Rate", icon: Settings2 },
            { view: "phone" as const, label: "Phone", icon: Smartphone },
          ].map((item) => {
            const Icon = item.icon;
            const selected = drawerView === item.view;

            return (
              <button
                type="button"
                key={item.view}
                onClick={() => setDrawerView(item.view)}
                className={`zine-meta flex h-10 items-center justify-center gap-1 rounded-[8px] border text-[10px] transition-colors ${
                  selected
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--panel)]"
                    : "border-[var(--line)] bg-[var(--panel)] text-[var(--muted-ink)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {drawerView === "practice" ? (
            <PracticePanel yenPerUsd={rate.effectiveRate.yenPerUsd} />
          ) : null}

          {drawerView === "rate" ? (
            <RatePanel
              currentRate={rate.effectiveRate.yenPerUsd}
              liveRate={rate.storedRate.liveYenPerUsd}
              status={rate.status}
              errorMessage={rate.errorMessage}
              onManualRateChange={rate.setManualYenPerUsd}
              onRefresh={() => void rate.refreshRate()}
              onFallback={rate.resetToFallback}
            />
          ) : null}

          {drawerView === "phone" ? <InstallPanel /> : null}
        </div>
      </aside>
    </main>
  );
}
