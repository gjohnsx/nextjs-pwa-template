"use client";

import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Brain,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Eraser,
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
} from "./currency";
import { useQuizProgress, QuizResult } from "./use-quiz-progress";
import { useYenRate } from "./use-yen-rate";

type DrawerView = "practice" | "rate" | "phone";

const QUICK_AMOUNT_SETS = [
  {
    label: "Tally",
    note: "tiny nudges for adding store items",
    amounts: [25, 50, 100, 500],
  },
  {
    label: "Meals",
    note: "cafes, transit, casual food",
    amounts: [500, 780, 1200, 2300],
  },
  {
    label: "Trip",
    note: "shopping, tickets, hotel math",
    amounts: [5000, 10000, 20000, 50000],
  },
];

function registerAppShell() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  navigator.serviceWorker.register("/sw.js", {
    scope: "/",
    updateViaCache: "none",
  }).catch(() => {
    toast.error("Offline mode could not start.");
  });
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
      toast.info(isIOS ? "Use Share, then Add to Home Screen." : "Use the browser install option.");
      return;
    }

    await deferredPrompt.prompt();
    const userChoice = await deferredPrompt.userChoice;
    toast[userChoice.outcome === "accepted" ? "success" : "warning"](
      userChoice.outcome === "accepted" ? "Install accepted." : "Install dismissed.",
    );
    setDeferredPrompt(null);
  }

  return (
    <div className="space-y-4">
      <div className="border border-[color:var(--line)] bg-[var(--paper)] p-4">
        <div className="flex items-start gap-3">
          <Smartphone className="mt-0.5 size-5 text-[var(--vermilion)]" />
          <div>
            <p className="text-sm font-semibold text-[var(--ink)]">
              Phone app
            </p>
            <p className="mt-1 text-sm text-[var(--muted-ink)]">
              {isStandalone
                ? "Running from your home screen."
                : "Ready to install as a standalone PWA."}
            </p>
          </div>
        </div>
      </div>

      {!isStandalone ? (
        <button
          type="button"
          onClick={handleInstallClick}
          className="flex h-12 w-full items-center justify-center gap-2 border border-[var(--ink)] bg-[var(--ink)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--vermilion)]"
        >
          <Check className="size-4" />
          Add to Home Screen
        </button>
      ) : null}

      {isIOS && !isStandalone ? (
        <p className="text-sm text-[var(--muted-ink)]">
          iOS Safari: Share, then Add to Home Screen.
        </p>
      ) : null}
    </div>
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
  status: string;
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
    <div className="space-y-5">
      <div>
        <label
          htmlFor="manual-rate"
          className="text-sm font-semibold text-[var(--ink)]"
        >
          Yen per dollar
        </label>
        <div className="mt-2 flex items-center border border-[color:var(--line)] bg-white">
          <span className="px-3 text-sm font-semibold text-[var(--muted-ink)]">
            ¥
          </span>
          <input
            id="manual-rate"
            inputMode="decimal"
            value={rateInput}
            onChange={(event) => setRateInput(event.target.value)}
            className="h-14 min-w-0 flex-1 bg-transparent pr-3 font-mono text-3xl text-[var(--ink)] outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={applyManualRate}
          className="flex h-11 items-center justify-center gap-2 border border-[var(--vermilion)] bg-[var(--vermilion)] px-3 text-sm font-semibold text-white transition hover:bg-[var(--ink)]"
        >
          <Check className="size-4" />
          Use rate
        </button>
        <button
          type="button"
          onClick={() => onManualRateChange(null)}
          className="flex h-11 items-center justify-center gap-2 border border-[color:var(--line)] bg-white px-3 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--ink)]"
        >
          <RotateCcw className="size-4" />
          Use live
        </button>
      </div>

      <div className="space-y-3 border border-[color:var(--line)] bg-[var(--paper)] p-4">
        <p className="text-sm font-semibold text-[var(--ink)]">
          Live source
        </p>
        <p className="text-sm text-[var(--muted-ink)]">
          {liveRate
            ? `Last fetched rate is ¥${formatYenPerUsd(liveRate)} = $1.`
            : `No live rate yet. The offline estimate is ¥${formatYenPerUsd(FALLBACK_YEN_PER_USD)} = $1.`}
        </p>
        <p className="text-xs uppercase text-[var(--pine)]">
          {status === "loading" ? "Refreshing" : status}
        </p>
        {errorMessage ? (
          <p className="text-sm text-[var(--vermilion)]">{errorMessage}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onRefresh}
          className="flex h-11 items-center justify-center gap-2 border border-[color:var(--line)] bg-white px-3 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--ink)]"
        >
          <RefreshCw className="size-4" />
          Refresh
        </button>
        <button
          type="button"
          onClick={onFallback}
          className="flex h-11 items-center justify-center border border-[color:var(--line)] bg-white px-3 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--ink)]"
        >
          ¥150 mode
        </button>
      </div>
    </div>
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
    nailed: "Nailed it",
    strong: "Strong estimate",
    close: "Close enough",
    repeat: "Repeat soon",
  } as const;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 border border-[color:var(--line)] bg-[var(--paper)] text-center">
        <div className="border-r border-[color:var(--line)] p-3">
          <p className="font-mono text-xl font-semibold text-[var(--ink)]">
            {quiz.summary.dueNow}
          </p>
          <p className="text-xs text-[var(--muted-ink)]">due</p>
        </div>
        <div className="border-r border-[color:var(--line)] p-3">
          <p className="font-mono text-xl font-semibold text-[var(--ink)]">
            {quiz.summary.practiced}
          </p>
          <p className="text-xs text-[var(--muted-ink)]">seen</p>
        </div>
        <div className="border-r border-[color:var(--line)] p-3">
          <p className="font-mono text-xl font-semibold text-[var(--ink)]">
            {quiz.summary.mastered}
          </p>
          <p className="text-xs text-[var(--muted-ink)]">solid</p>
        </div>
        <div className="p-3">
          <p className="font-mono text-xl font-semibold text-[var(--ink)]">
            {quiz.summary.bestStreak}
          </p>
          <p className="text-xs text-[var(--muted-ink)]">streak</p>
        </div>
      </div>

      <div className="border border-[color:var(--line)] bg-white p-5">
        <p className="text-sm text-[var(--muted-ink)]">
          {quiz.currentAmount.label}
        </p>
        <p className="mt-2 font-mono text-5xl font-semibold text-[var(--ink)]">
          ¥{formatYen(quiz.currentAmount.yen)}
        </p>
      </div>

      <div>
        <label
          htmlFor="quiz-guess"
          className="text-sm font-semibold text-[var(--ink)]"
        >
          Your USD estimate
        </label>
        <div className="mt-2 flex items-center border border-[color:var(--line)] bg-white">
          <span className="px-3 text-sm font-semibold text-[var(--muted-ink)]">
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
            className="h-14 min-w-0 flex-1 bg-transparent pr-3 font-mono text-3xl text-[var(--ink)] outline-none placeholder:text-[var(--faint-ink)]"
          />
        </div>
      </div>

      {result ? (
        <div className="space-y-2 border border-[color:var(--line)] bg-[var(--paper)] p-4">
          <p className="text-sm font-semibold text-[var(--vermilion)]">
            {ratingCopy[result.rating]}
          </p>
          <p className="font-mono text-3xl font-semibold text-[var(--ink)]">
            {formatUsdCompact(result.exactUsd)}
          </p>
          <p className="text-sm text-[var(--muted-ink)]">
            {result.errorPercent.toFixed(1)}% away. Box {result.stats.boxLevel}.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={result ? nextQuestion : submitGuess}
          className="flex h-12 items-center justify-center gap-2 border border-[var(--vermilion)] bg-[var(--vermilion)] px-3 text-sm font-semibold text-white transition hover:bg-[var(--ink)]"
        >
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
        </button>
        <button
          type="button"
          onClick={() => {
            quiz.resetProgress();
            setGuessInput("");
            setResult(null);
          }}
          className="flex h-12 items-center justify-center gap-2 border border-[color:var(--line)] bg-white px-3 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--ink)]"
        >
          <RotateCcw className="size-4" />
          Reset
        </button>
      </div>
    </div>
  );
}

export function YenSenseApp() {
  const inputRef = useRef<HTMLInputElement>(null);
  const ignoreClickUntilRef = useRef(0);
  const [yenInput, setYenInput] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerView, setDrawerView] = useState<DrawerView>("practice");
  const [quickSetIndex, setQuickSetIndex] = useState(0);
  const [keyboardMode, setKeyboardMode] = useState(false);
  const rate = useYenRate();
  const yenAmount = parseYenInput(yenInput);
  const usdAmount = convertYenToUsd(yenAmount, rate.effectiveRate.yenPerUsd);

  useEffect(() => {
    registerAppShell();
    window.setTimeout(() => inputRef.current?.focus(), 200);
  }, []);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) {
      return;
    }

    const syncKeyboardMode = () => {
      setKeyboardMode(viewport.height < window.innerHeight * 0.78);
    };

    syncKeyboardMode();
    viewport.addEventListener("resize", syncKeyboardMode);
    viewport.addEventListener("scroll", syncKeyboardMode);

    return () => {
      viewport.removeEventListener("resize", syncKeyboardMode);
      viewport.removeEventListener("scroll", syncKeyboardMode);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDrawerOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  const addYen = useCallback((amount: number) => {
    setYenInput((currentValue) => {
      const nextValue = parseYenInput(currentValue) + amount;
      return formatYenInput(nextValue);
    });
  }, []);

  const clearYen = useCallback(() => {
    setYenInput("");
  }, []);

  const runPreservingInputFocus = useCallback(
    (
      event: ReactPointerEvent<HTMLButtonElement>,
      action: () => void,
    ) => {
      event.preventDefault();
      ignoreClickUntilRef.current = Date.now() + 500;
      action();
    },
    [],
  );

  const shouldIgnoreClick = useCallback(
    () => Date.now() < ignoreClickUntilRef.current,
    [],
  );

  const quickSet = QUICK_AMOUNT_SETS[quickSetIndex];

  return (
    <main className="relative min-h-dvh overflow-x-hidden overflow-y-auto px-5 py-4 text-[var(--ink)]">
      <section
        className={`mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-md flex-col ${
          keyboardMode ? "gap-4" : "gap-6"
        }`}
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[var(--vermilion)]">
              Yen Sense
            </p>
            <h1
              className={`mt-1 font-semibold text-[var(--ink)] ${
                keyboardMode ? "text-xl" : "text-2xl"
              }`}
            >
              Japan pocket rate
            </h1>
          </div>
          <div className="border border-[color:var(--line)] bg-white px-3 py-2 text-right">
            <p className="text-xs text-[var(--muted-ink)]">JPY/USD</p>
            <p className="font-mono text-lg font-semibold text-[var(--pine)]">
              {formatYenPerUsd(rate.effectiveRate.yenPerUsd)}
            </p>
          </div>
        </header>

        <section
          className={`border-y border-[color:var(--line)] ${
            keyboardMode ? "py-3" : "py-5"
          }`}
        >
          <p className="text-sm font-semibold text-[var(--muted-ink)]">USD</p>
          <output
            aria-live="polite"
            className={`mt-2 block break-words font-mono font-semibold leading-none text-[var(--ink)] ${
              keyboardMode ? "text-5xl" : "text-6xl sm:text-7xl"
            }`}
          >
            {formatUsd(usdAmount)}
          </output>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor="yen-input"
              className="text-sm font-semibold text-[var(--muted-ink)]"
            >
              Yen amount
            </label>
            <button
              type="button"
              aria-label="Clear yen amount"
              title="Clear yen amount"
              onPointerDown={(event) =>
                runPreservingInputFocus(event, clearYen)
              }
              onClick={() => {
                if (shouldIgnoreClick()) {
                  return;
                }
                clearYen();
              }}
              className={`size-10 place-items-center border border-[color:var(--line)] bg-white text-[var(--ink)] transition hover:border-[var(--vermilion)] ${
                keyboardMode ? "grid" : "hidden"
              }`}
            >
              <Eraser className="size-5" />
              <span className="sr-only">Clear</span>
            </button>
          </div>
          <div className="flex items-end border-b-2 border-[var(--ink)] pb-3">
            <span className="mb-2 mr-2 text-4xl font-semibold text-[var(--vermilion)]">
              ¥
            </span>
            <input
              ref={inputRef}
              id="yen-input"
              value={yenInput}
              onChange={(event) => {
                const yen = parseYenInput(event.target.value);
                setYenInput(formatYenInput(yen));
              }}
              inputMode="numeric"
              autoComplete="off"
              autoCorrect="off"
              placeholder="0"
              className={`min-w-0 flex-1 bg-transparent font-mono font-semibold leading-none text-[var(--ink)] outline-none placeholder:text-[var(--faint-ink)] ${
                keyboardMode ? "text-5xl" : "text-6xl sm:text-7xl"
              }`}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-[var(--muted-ink)]">
                Quick adds
              </p>
              <p className="text-xs text-[var(--muted-ink)]">
                {quickSet.note}
              </p>
            </div>
            <div className="flex h-9 items-center border border-[color:var(--line)] bg-white">
              <button
                type="button"
                aria-label="Use smaller quick amounts"
                title="Smaller amounts"
                disabled={quickSetIndex === 0}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() =>
                  setQuickSetIndex((currentIndex) =>
                    Math.max(0, currentIndex - 1),
                  )
                }
                className="grid size-9 place-items-center text-[var(--ink)] transition hover:text-[var(--vermilion)] disabled:opacity-25"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="min-w-14 border-x border-[color:var(--line)] px-2 text-center text-xs font-semibold text-[var(--ink)]">
                {quickSet.label}
              </span>
              <button
                type="button"
                aria-label="Use larger quick amounts"
                title="Larger amounts"
                disabled={quickSetIndex === QUICK_AMOUNT_SETS.length - 1}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() =>
                  setQuickSetIndex((currentIndex) =>
                    Math.min(QUICK_AMOUNT_SETS.length - 1, currentIndex + 1),
                  )
                }
                className="grid size-9 place-items-center text-[var(--ink)] transition hover:text-[var(--vermilion)] disabled:opacity-25"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {quickSet.amounts.map((amount) => (
              <button
                type="button"
                key={amount}
                onPointerDown={(event) =>
                  runPreservingInputFocus(event, () => addYen(amount))
                }
                onClick={() => {
                  if (shouldIgnoreClick()) {
                    return;
                  }
                  addYen(amount);
                }}
                className="h-9 border border-[color:var(--line)] bg-white font-mono text-xs font-semibold text-[var(--ink)] transition hover:border-[var(--vermilion)] hover:text-[var(--vermilion)]"
              >
                +¥{formatYen(amount)}
              </button>
            ))}
          </div>
        </section>

        <footer
          className={`mt-auto flex items-center justify-between gap-3 border-t border-[color:var(--line)] pt-4 ${
            keyboardMode ? "hidden" : ""
          }`}
        >
          <div>
            <p className="text-xs text-[var(--muted-ink)]">
              {rate.status === "loading" ? "Refreshing rate" : "Ready offline"}
            </p>
            {rate.errorMessage ? (
              <p className="text-xs text-[var(--vermilion)]">
                {rate.errorMessage}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onPointerDown={(event) =>
              runPreservingInputFocus(event, clearYen)
            }
            onClick={() => {
              if (shouldIgnoreClick()) {
                return;
              }
              clearYen();
            }}
            className="flex h-10 items-center gap-2 border border-[color:var(--line)] bg-white px-3 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--vermilion)]"
          >
            <Eraser className="size-4" />
            Clear
          </button>
        </footer>
      </section>

      <button
        type="button"
        aria-label="Open practice and rate drawer"
        onClick={() => setDrawerOpen(true)}
        className="fixed right-0 top-0 z-30 h-dvh w-7 opacity-0"
      />

      <button
        type="button"
        aria-label="Close drawer"
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 z-40 bg-[rgba(23,29,28,0.22)] transition-opacity duration-200 ${
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-hidden={!drawerOpen}
        className={`fixed right-0 top-0 z-50 flex h-dvh w-[min(100vw,430px)] flex-col border-l border-[color:var(--line)] bg-[var(--drawer)] shadow-[-22px_0_60px_rgba(23,29,28,0.18)] transition-transform duration-300 ease-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[color:var(--line)] px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-[var(--vermilion)]">
              Yen Sense
            </p>
            <p className="text-lg font-semibold text-[var(--ink)]">
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
            onClick={() => setDrawerOpen(false)}
            className="grid size-10 place-items-center border border-[color:var(--line)] bg-white text-[var(--ink)] transition hover:border-[var(--vermilion)] hover:text-[var(--vermilion)]"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 border-b border-[color:var(--line)] bg-white">
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
                className={`flex h-14 items-center justify-center gap-2 border-r border-[color:var(--line)] text-sm font-semibold transition last:border-r-0 ${
                  selected
                    ? "bg-[var(--ink)] text-white"
                    : "bg-white text-[var(--ink)] hover:bg-[var(--paper)]"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
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
