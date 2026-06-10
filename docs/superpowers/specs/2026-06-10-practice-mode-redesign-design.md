# Practice Mode Redesign — Design Spec

**Date:** 2026-06-10
**Scope:** iOS app (`ios/YenSense`) only. Web app untouched.
**Goal:** Replace the cramped, keyboard-fighting practice screen with a delightful, discoverable, full-screen card experience — without changing the spaced-repetition engine.

## Problems with the current implementation

- Practice opens in a `.medium`/`.large` sheet; the system decimal-pad keyboard covers half of it, leaving almost no room for the card.
- The system `TextField` clashes with the app's paper-and-ink aesthetic, has no submit key, and causes layout jumps when the result card appears.
- The 4-cell stats grid occupies prime space above the question.
- "Reset" (which wipes all progress, no confirmation) sits next to "Check" as a peer button.
- No haptics, no animation, no session arc — nothing to celebrate.
- The Pro unlock banner permanently clutters the play area.

## Flow & presentation

Practice opens as a **full-screen cover** (`fullScreenCover`), not a sheet. Three states:

1. **Playing** — a round of 5 cards, one at a time. Top bar: close button (✕, leading) and 5 progress segments that fill as cards are answered. The card (big serif yen amount + context label, e.g. "¥1,800 — ramen plus side") and the guess keypad are the entire screen. No stats grid, no banners.
2. **Reveal** — in place on the same card, no layout jump: the card tints, shows the true amount (counting up via `.contentTransition(.numericText())`), the user's guess, the rating label, and an animated accuracy meter. One button: **Next card** ("See results" on card 5).
3. **Round summary** — average accuracy for the round, per-card mini results, streak / newly-"solid" callouts. Buttons: **Another round** (primary) and **Done**. Free users see one Pro unlock card here. The review prompt (`practiceSessionCompleted`) registers here instead of after every answer.

Closing mid-round (✕) is allowed and loses no persisted progress — answered cards are already recorded; unanswered cards simply weren't practiced.

## Input: custom guess keypad

`GuessKeypad` — a custom decimal keypad styled with the existing `YenButtonStyle` language, mirroring the converter's keypad:

```
7 8 9
4 5 6
1 2 3
. 0 ⌫
```

- A prominent full-width **Check** button below the grid (`YenButtonStyle(prominent: true)`), disabled/dimmed until the guess parses > 0.
- The guess renders in a fixed-height display row (`$ 12.50` style, quote-currency symbol in accent color) so nothing reflows while typing.
- Input rules: max 2 decimal places, single decimal separator, no leading zeros (a bare "." reads as "0."), digit limit consistent with `CurrencyMath`.
- The system keyboard never appears anywhere in practice mode.

## Delight details

- **Haptics** (SwiftUI `.sensoryFeedback`, deployment target is iOS 17.0):
  - light impact on every keypad key, rigid on backspace, medium on Check
  - reveal: `.success` for Nailed/Strong, soft impact for Close, gentle (non-punishing) feedback for Repeat
- **Accuracy meter** (`AccuracyMeter`): horizontal track spanning 0→25%+ error with rating zones (Nailed ≤5, Strong ≤10, Close ≤20, Repeat >20) in muted sage→accent tints; a needle springs to the user's error position on reveal.
- **Motion**: asymmetric spring slide between cards; reveal tint animates (sage for good results, soft accent for misses). No confetti, no sound — understated, consistent with the paper/ink palette.

## What moves where

- **Stats grid** (due / seen / solid / streak) → top of `PracticeHistoryView` (which keeps its per-card rows).
- **Reset** → bottom of `PracticeHistoryView` as a destructive "Reset all progress" button with a confirmation dialog. Removed from the play screen.
- **Pro CTA** → round summary only ("Unlock all 13 price tiers + history"). The History toolbar button stays Pro-gated as today.

## Architecture

The spaced-repetition engine (Leitner boxes, intervals, `QuizScoring` ratings, persistence) is **unchanged**. `QuizStore` gains a small API:

- `drawRound(of count: Int) -> [QuizAmount]` — picks `count` distinct cards using the existing due-first / lowest-box-first selection ordering (free deck has 6 cards, so a round of 5 always fits).
- `recordAnswer(for amount: QuizAmount, guessUSD: Double, exactUSD: Double) -> QuizResult` — same scoring path, but takes the card explicitly instead of relying on `currentAmount`. The old `currentAmount`-based flow and `nextQuestion(excluding:)` are removed once the new view lands.

### Files

| File | Role |
|---|---|
| `Views/Practice/PracticeView.swift` | rewritten orchestrator (playing → reveal → summary), owns `PracticeRound` state |
| `Views/Practice/PracticeCardView.swift` | question card + in-place reveal |
| `Views/Practice/GuessKeypad.swift` | custom decimal keypad + guess display row |
| `Views/Practice/AccuracyMeter.swift` | animated rating gauge |
| `Views/Practice/RoundSummaryView.swift` | end-of-round screen incl. Pro CTA slot |
| `Models/PracticeRound.swift` | round state: cards, current index, per-card results |
| `Views/RootView.swift` | practice moves from `.sheet` to `.fullScreenCover`; `SheetDestination.practice` removed |
| `Views/ConverterView.swift` | Practice button triggers the new `showPractice` binding instead of `sheetDestination = .practice` |
| `Views/PracticeHistoryView.swift` | gains stats grid (top) + reset with confirmation (bottom) |

`PracticeView` continues to receive `yenPerUnit` and `quote` from `RateStore` via `RootView`, and `StoreManager` via the environment, as today.

## Error handling

- Guess parsing reuses `CurrencyMath.parseDecimalInput`; Check is disabled for non-positive input, so there is no error state to render.
- `drawRound` clamps `count` to the deck size.
- Pro/free deck switching mid-round is not a concern: the deck is drawn at round start; a purchase completed from the summary's Pro CTA takes effect on the next round.

## Testing

- `PracticeRound` / `drawRound`: returns 5 distinct cards; due-first ordering respected; works with the 6-card free deck; clamps when `count` exceeds deck size.
- Scoring regression: existing `QuizScoring` / box-level tests stay green (engine untouched); `recordAnswer(for:)` covered by adapting existing `QuizStoreDeckTests`.
- Keypad input model: digit append, single decimal separator, max 2 decimals, backspace, leading-zero handling.
