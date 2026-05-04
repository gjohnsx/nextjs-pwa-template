"use client";

import {
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type TouchEvent as ReactTouchEvent,
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
  CircleX,
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
    label: "Tally 集計",
    note: "konbini math / コンビニ足し算",
    amounts: [25, 50, 100, 500],
  },
  {
    label: "Meals 食事",
    note: "cafes, transit / 喫茶と電車",
    amounts: [500, 780, 1200, 2300],
  },
  {
    label: "Trip 旅費",
    note: "shopping, tickets / 旅の大物",
    amounts: [5000, 10000, 20000, 50000],
  },
];

const STATUS_LABELS: Record<RateStatus, string> = {
  loading: "FETCH 取得中",
  live: "NEW 新着",
  cached: "SAVED 保存",
  fallback: "ROUGH 目安",
  error: "ALERT 注意",
};

function formatRateStatus({
  isManual,
  status,
}: {
  isManual: boolean;
  status: RateStatus;
}) {
  if (isManual) {
    return "SAVED 手入力";
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
    <div className="zine-meta flex items-center justify-between border-b bg-[var(--ink)] px-2 py-1 text-[10px] leading-none text-[var(--paper)]">
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
      className={`flex min-h-10 items-center justify-center gap-2 border px-2 py-2 text-xs font-bold transition-colors duration-100 ease-linear ${
        accent
          ? "bg-[var(--accent-pop)] text-[var(--paper)] hover:bg-[var(--ink)]"
          : "bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)]"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
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
    <section className="grid gap-2">
      <PanelMeta issue="P.03" label="PHONE APP 電話" />
      <div className="grid grid-cols-[78px_1fr] border bg-[var(--paper)]">
        <div className="grid place-items-center border-r p-2">
          <Smartphone className="size-8 text-[var(--accent-pop)]" />
        </div>
        <div className="p-2">
          <p className="font-serif text-2xl font-bold leading-none">
            Home Screen ホーム
          </p>
          <p className="zine-meta mt-2 text-[10px]">
            {isStandalone
              ? "RUNNING STANDALONE / 保存済"
              : "PWA READY / 追加可能"}
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
        <p className="zine-meta border px-2 py-1 text-[10px]">
          IOS SAFARI: SHARE THEN ADD / 共有から追加
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
    <section className="grid gap-2">
      <PanelMeta issue="P.02" label="RATE DESK レート" />
      <label htmlFor="manual-rate" className="zine-meta text-[10px]">
        Yen per dollar / 円ドル
      </label>
      <div className="grid grid-cols-[42px_1fr] border bg-[var(--paper)]">
        <span className="grid place-items-center border-r font-serif text-4xl font-bold text-[var(--accent-pop)]">
          ¥
        </span>
        <input
          id="manual-rate"
          inputMode="decimal"
          value={rateInput}
          onChange={(event) => setRateInput(event.target.value)}
          className="h-16 min-w-0 bg-transparent px-2 font-mono text-5xl font-bold leading-none text-[var(--ink)] outline-none"
        />
      </div>

      <div className="grid grid-cols-[1.25fr_0.75fr] gap-2">
        <ZineButton onClick={applyManualRate} accent>
          <Check className="size-4" />
          Use 採用
        </ZineButton>
        <ZineButton onClick={() => onManualRateChange(null)}>
          <RotateCcw className="size-4" />
          Live 生
        </ZineButton>
      </div>

      <div className="grid border bg-[var(--paper)]">
        <PanelMeta issue="SOURCE ID: FX-150" label={STATUS_LABELS[status]} />
        <p className="px-2 py-2 text-sm leading-tight">
          {liveRate
            ? `Last fetched rate / 取得値: ¥${formatYenPerUsd(liveRate)} = $1.`
            : `No live rate / オフライン目安: ¥${formatYenPerUsd(FALLBACK_YEN_PER_USD)} = $1.`}
        </p>
        {errorMessage ? (
          <p className="border-t px-2 py-2 text-sm font-bold text-[var(--accent-pop)]">
            {errorMessage}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ZineButton onClick={onRefresh}>
          <RefreshCw className="size-4" />
          Refresh 更新
        </ZineButton>
        <ZineButton onClick={onFallback}>
          ¥150 Mode 目安
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
    nailed: "NEW 新着",
    strong: "SAVED 保存",
    close: "CLOSE 近い",
    repeat: "REPEAT 復習",
  } as const;

  return (
    <section className="grid gap-2">
      <PanelMeta issue="P.01" label="MENTAL DRILL 暗算" />
      <div className="grid grid-cols-4 border bg-[var(--paper)] text-center">
        {[
          ["due", quiz.summary.dueNow],
          ["seen", quiz.summary.practiced],
          ["solid", quiz.summary.mastered],
          ["streak", quiz.summary.bestStreak],
        ].map(([label, value]) => (
          <div className="border-r p-2 last:border-r-0" key={label}>
            <p className="font-mono text-2xl leading-none">{value}</p>
            <p className="zine-meta mt-1 text-[9px]">{label} 件</p>
          </div>
        ))}
      </div>

      <div className="relative grid border bg-[var(--paper)] p-2">
        <span className="zine-sticker absolute right-2 top-2 px-2 py-1 text-[10px]">
          Quiz 問
        </span>
        <p className="zine-meta text-[10px]">{quiz.currentAmount.label}</p>
        <p className="mt-1 font-serif text-6xl font-bold leading-none">
          ¥{formatYen(quiz.currentAmount.yen)}
        </p>
      </div>

      <label htmlFor="quiz-guess" className="zine-meta text-[10px]">
        Your USD estimate / ドル予想
      </label>
      <div className="grid grid-cols-[42px_1fr] border bg-[var(--paper)]">
        <span className="grid place-items-center border-r font-serif text-4xl font-bold text-[var(--accent-pop)]">
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
          className="h-14 min-w-0 bg-transparent px-2 font-mono text-4xl text-[var(--ink)] outline-none placeholder:text-[var(--ink)]"
        />
      </div>

      {result ? (
        <div className="grid border bg-[var(--paper)]">
          <PanelMeta issue={`BOX ${result.stats.boxLevel}`} label={ratingCopy[result.rating]} />
          <p className="px-2 py-1 font-mono text-4xl leading-none">
            {formatUsdCompact(result.exactUsd)}
          </p>
          <p className="zine-meta border-t px-2 py-1 text-[10px]">
            {result.errorPercent.toFixed(1)}% AWAY / 誤差
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-[1.35fr_0.65fr] gap-2">
        <ZineButton onClick={result ? nextQuestion : submitGuess} accent>
          {result ? (
            <>
              <ChevronsRight className="size-4" />
              Next 次
            </>
          ) : (
            <>
              <Check className="size-4" />
              Check 確認
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
  const inputRef = useRef<HTMLInputElement>(null);
  const ignoreClickUntilRef = useRef(0);
  const touchActionLockRef = useRef(0);
  const [yenInput, setYenInput] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerView, setDrawerView] = useState<DrawerView>("practice");
  const [quickSetIndex, setQuickSetIndex] = useState(0);
  const [keyboardMode, setKeyboardMode] = useState(false);
  const rate = useYenRate();
  const yenAmount = parseYenInput(yenInput);
  const usdAmount = convertYenToUsd(yenAmount, rate.effectiveRate.yenPerUsd);
  const quickSet = QUICK_AMOUNT_SETS[quickSetIndex];
  const statusLabel = formatRateStatus({
    isManual: rate.effectiveRate.isManual,
    status: rate.status,
  });

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

  const focusYenInput = useCallback(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const runActionWithoutMovingFocus = useCallback(
    (action: () => void) => {
      action();
      focusYenInput();
      window.requestAnimationFrame(focusYenInput);
    },
    [focusYenInput],
  );

  const runPreservingInputFocus = useCallback(
    (
      event:
        | ReactMouseEvent<HTMLButtonElement>
        | ReactPointerEvent<HTMLButtonElement>
        | ReactTouchEvent<HTMLButtonElement>,
      action: () => void,
    ) => {
      event.preventDefault();
      event.stopPropagation();
      const now = Date.now();
      if (now < touchActionLockRef.current) {
        return;
      }
      touchActionLockRef.current = now + 80;
      ignoreClickUntilRef.current = Date.now() + 500;
      runActionWithoutMovingFocus(action);
    },
    [runActionWithoutMovingFocus],
  );

  const runFallbackClick = useCallback(
    (
      event: ReactMouseEvent<HTMLButtonElement>,
      action: () => void,
    ) => {
      event.preventDefault();
      event.stopPropagation();
      if (Date.now() < ignoreClickUntilRef.current) {
        return;
      }
      runActionWithoutMovingFocus(action);
    },
    [runActionWithoutMovingFocus],
  );

  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-[var(--paper)] text-[var(--ink)]">
      <section className="mx-auto grid min-h-dvh w-full max-w-[680px] grid-cols-[14px_1fr] gap-1.5 border-x px-1.5 py-1.5 sm:grid-cols-[18px_1fr] sm:gap-2 sm:px-2">
        <aside className="zine-vertical zine-meta border bg-[var(--ink)] px-0.5 py-2 text-[9px] leading-none text-[var(--paper)]">
          YEN SENSE / 東京換算
        </aside>

        <div className={`grid min-h-[calc(100dvh-0.75rem)] gap-1.5 sm:gap-2 ${keyboardMode ? "content-start" : ""}`}>
          <header className="border bg-[var(--paper)]">
            <PanelMeta issue="ISSUE 1998-04" label="TRAVEL MONEY 旅の円" />
            <div className="grid grid-cols-[1fr_auto] items-end gap-2 p-2">
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-1.5">
                  <span className="zine-sticker inline-block px-2 py-1 text-[10px]">
                    {statusLabel}
                  </span>
                  <span className="zine-meta text-[10px]">
                    JPY to USD / 東京メモ
                  </span>
                </div>
                <h1 className="font-serif text-[34px] font-extrabold leading-[0.85] sm:text-[44px]">
                  Yen Sense
                </h1>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="zine-meta border bg-[var(--accent-pop)] px-2 py-2 text-[10px] text-[var(--paper)] transition-colors hover:bg-[var(--ink)]"
              >
                Menu メニュー
              </button>
            </div>
          </header>

          <section className="grid grid-cols-[1fr_74px] gap-2 sm:grid-cols-[1.55fr_0.45fr]">
            <div className="grid border bg-[var(--paper)]">
              <PanelMeta issue="P.01 RESULT" label="USD 表示" />
              <div className="p-2">
                <p className="zine-meta text-[10px]">Dollar result / ドル</p>
                <output
                  aria-live="polite"
                  className={`block break-words font-serif font-extrabold leading-none ${
                    keyboardMode ? "text-5xl" : "text-[58px] sm:text-[88px]"
                  }`}
                >
                  {formatUsd(usdAmount)}
                </output>
              </div>
            </div>

            <div className="grid border bg-[var(--paper)] text-center">
              <PanelMeta issue="JPY/USD" label="RATE" />
              <div className="grid content-center p-1">
                <p className="font-mono text-3xl leading-none sm:text-4xl">
                  {formatYenPerUsd(rate.effectiveRate.yenPerUsd)}
                </p>
                <p className="zine-meta mt-1 text-[9px]">円/ドル</p>
              </div>
            </div>
          </section>

          <section className="grid gap-2 border bg-[var(--paper)] p-2">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="yen-input" className="zine-meta text-[10px]">
                Yen amount / 円を入力
              </label>
              <button
                type="button"
                aria-label="Clear yen amount"
                title="Clear yen amount"
                tabIndex={-1}
                onMouseDown={(event) =>
                  runPreservingInputFocus(event, clearYen)
                }
                onPointerDownCapture={(event) =>
                  runPreservingInputFocus(event, clearYen)
                }
                onTouchStart={(event) =>
                  runPreservingInputFocus(event, clearYen)
                }
                onClick={(event) => runFallbackClick(event, clearYen)}
                className={`grid size-8 place-items-center border bg-[var(--paper)] transition-colors hover:bg-[var(--accent-pop)] hover:text-[var(--paper)] ${
                  keyboardMode ? "" : "sm:hidden"
                }`}
              >
                <CircleX className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-[42px_1fr] border bg-[var(--paper)]">
              <span className="grid place-items-center border-r font-serif text-5xl font-bold text-[var(--accent-pop)]">
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
                className={`min-w-0 bg-transparent px-2 font-mono font-bold leading-none text-[var(--ink)] outline-none placeholder:text-[var(--ink)] ${
                  keyboardMode ? "h-16 text-5xl" : "h-20 text-6xl sm:text-7xl"
                }`}
              />
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-2">
              <div>
                <p className="zine-meta text-[10px]">Quick adds / 早足し</p>
                <p className="text-xs leading-tight">{quickSet.note}</p>
              </div>
              <div className="grid grid-cols-[32px_76px_32px] border bg-[var(--paper)]">
                <button
                  type="button"
                  aria-label="Use smaller quick amounts"
                  title="Smaller amounts"
                  disabled={quickSetIndex === 0}
                  tabIndex={-1}
                  onMouseDown={(event) =>
                    runPreservingInputFocus(event, () =>
                      setQuickSetIndex((currentIndex) =>
                        Math.max(0, currentIndex - 1),
                      ),
                    )
                  }
                  onPointerDownCapture={(event) =>
                    runPreservingInputFocus(event, () =>
                      setQuickSetIndex((currentIndex) =>
                        Math.max(0, currentIndex - 1),
                      ),
                    )
                  }
                  onTouchStart={(event) =>
                    runPreservingInputFocus(event, () =>
                      setQuickSetIndex((currentIndex) =>
                        Math.max(0, currentIndex - 1),
                      ),
                    )
                  }
                  onClick={(event) =>
                    runFallbackClick(event, () =>
                      setQuickSetIndex((currentIndex) =>
                        Math.max(0, currentIndex - 1),
                      ),
                    )
                  }
                  className="grid place-items-center border-r transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)] disabled:text-[var(--ink)]"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="zine-meta grid place-items-center border-r px-1 text-center text-[9px]">
                  {quickSet.label}
                </span>
                <button
                  type="button"
                  aria-label="Use larger quick amounts"
                  title="Larger amounts"
                  disabled={quickSetIndex === QUICK_AMOUNT_SETS.length - 1}
                  tabIndex={-1}
                  onMouseDown={(event) =>
                    runPreservingInputFocus(event, () =>
                      setQuickSetIndex((currentIndex) =>
                        Math.min(QUICK_AMOUNT_SETS.length - 1, currentIndex + 1),
                      ),
                    )
                  }
                  onPointerDownCapture={(event) =>
                    runPreservingInputFocus(event, () =>
                      setQuickSetIndex((currentIndex) =>
                        Math.min(QUICK_AMOUNT_SETS.length - 1, currentIndex + 1),
                      ),
                    )
                  }
                  onTouchStart={(event) =>
                    runPreservingInputFocus(event, () =>
                      setQuickSetIndex((currentIndex) =>
                        Math.min(QUICK_AMOUNT_SETS.length - 1, currentIndex + 1),
                      ),
                    )
                  }
                  onClick={(event) =>
                    runFallbackClick(event, () =>
                      setQuickSetIndex((currentIndex) =>
                        Math.min(QUICK_AMOUNT_SETS.length - 1, currentIndex + 1),
                      ),
                    )
                  }
                  className="grid place-items-center transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)] disabled:text-[var(--ink)]"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1">
              {quickSet.amounts.map((amount) => (
                <button
                  type="button"
                  key={amount}
                  tabIndex={-1}
                  onMouseDown={(event) =>
                    runPreservingInputFocus(event, () => addYen(amount))
                  }
                  onPointerDownCapture={(event) =>
                    runPreservingInputFocus(event, () => addYen(amount))
                  }
                  onTouchStart={(event) =>
                    runPreservingInputFocus(event, () => addYen(amount))
                  }
                  onClick={(event) =>
                    runFallbackClick(event, () => addYen(amount))
                  }
                  className="zine-meta h-10 border bg-[var(--paper)] text-[10px] transition-colors hover:bg-[var(--accent-pop)] hover:text-[var(--paper)]"
                >
                  +¥{formatYen(amount)}
                </button>
              ))}
            </div>
          </section>

          <footer
            className={`grid grid-cols-[1fr_auto] items-stretch gap-2 ${
              keyboardMode ? "hidden" : ""
            }`}
          >
            <div className="border bg-[var(--paper)] px-2 py-1">
              <p className="zine-meta text-[10px]">
                {rate.status === "loading"
                  ? "Refreshing rate / 更新中"
                  : "Ready offline / オフライン可"}
              </p>
              <p className="zine-meta text-[10px]">
                FETCHED: {formatMetaDate(rate.effectiveRate.fetchedAt)}
              </p>
              {rate.errorMessage ? (
                <p className="text-xs font-bold text-[var(--accent-pop)]">
                  {rate.errorMessage}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={(event) =>
                runPreservingInputFocus(event, clearYen)
              }
              onPointerDownCapture={(event) =>
                runPreservingInputFocus(event, clearYen)
              }
              onTouchStart={(event) =>
                runPreservingInputFocus(event, clearYen)
              }
              onClick={(event) => runFallbackClick(event, clearYen)}
              className="flex min-w-20 items-center justify-center gap-1 border bg-[var(--paper)] px-2 text-xs font-bold transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]"
            >
              <CircleX className="size-4" />
              Clear 消
            </button>
          </footer>
        </div>

      </section>

      <button
        type="button"
        aria-label="Open practice and rate drawer"
        onClick={() => setDrawerOpen(true)}
        className="fixed right-0 top-0 z-30 h-dvh w-8 bg-transparent text-transparent sm:hidden"
      >
        Open
      </button>

      <button
        type="button"
        aria-label="Close drawer"
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 z-40 bg-[var(--ink)] transition-transform duration-100 ease-linear ${
          drawerOpen ? "translate-x-0" : "pointer-events-none translate-x-full"
        }`}
      />

      <aside
        aria-hidden={!drawerOpen}
        className={`fixed right-0 top-0 z-50 flex h-dvh w-[min(100vw,430px)] flex-col border-l bg-[var(--paper)] transition-transform duration-100 ease-linear ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="grid grid-cols-[1fr_48px] border-b bg-[var(--paper)]">
          <div className="p-2">
            <p className="zine-meta text-[10px]">Yen Sense / 引き出し</p>
            <p className="font-serif text-3xl font-bold leading-none">
              {drawerView === "practice"
                ? "Practice 練習"
                : drawerView === "rate"
                  ? "Rate レート"
                  : "Phone 電話"}
            </p>
          </div>
          <button
            type="button"
            title="Close"
            onClick={() => setDrawerOpen(false)}
            className="grid place-items-center border-l bg-[var(--paper)] transition-colors hover:bg-[var(--accent-pop)] hover:text-[var(--paper)]"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 border-b bg-[var(--paper)]">
          {[
            { view: "practice" as const, label: "Practice 練", icon: Brain },
            { view: "rate" as const, label: "Rate 円", icon: Settings2 },
            { view: "phone" as const, label: "Phone 携", icon: Smartphone },
          ].map((item) => {
            const Icon = item.icon;
            const selected = drawerView === item.view;

            return (
              <button
                type="button"
                key={item.view}
                onClick={() => setDrawerView(item.view)}
                className={`zine-meta flex h-12 items-center justify-center gap-1 border-r text-[10px] transition-colors last:border-r-0 ${
                  selected
                    ? "bg-[var(--accent-pop)] text-[var(--paper)]"
                    : "bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)]"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          <div className="zine-vertical zine-meta float-right ml-2 border bg-[var(--ink)] px-1 py-2 text-[10px] leading-none text-[var(--paper)]">
            SIDE PAGE / 保存版
          </div>
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
