# Kredi UI Redesign (“Şube masası”) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the credit calculator page as a calm net-banking desk: IBM Plex Sans, deep teal accents, hero monthly payment beside the form, full-width payment schedule, charts below.

**Architecture:** Keep the existing feature structure under `src/features/credit-calculator/`. Drive the look via CSS tokens in `globals.css` + `next/font` (IBM Plex Sans). Reshape `CreditSummary` into a hero + four mini metrics. Keep page layout: form | summary on top, schedule full width, charts under. No calculation/export logic changes.

**Tech Stack:** Next.js App Router, React 19, Tailwind v4 (`@theme inline`), Lucide, Recharts, Vitest.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-09-07-kredi-ui-redesign-design.md`
- Primary `#0F766E`, hover `#0D9488`; background `#F4F7F6`; no Inter as primary font
- No purple glow / cream-terracotta / broadsheet aesthetics; no dark mode
- Payment schedule: all columns visible without horizontal scroll on desktop (~1280px)
- Do not change calculation formulas, PDF/Excel payload, or Zod schemas
- Verify with `npm run test` and visual check on `http://localhost:4000/` (rebuild if prod)

## File map

| File | Responsibility |
|------|----------------|
| `src/app/globals.css` | Design tokens, page background tint, radius |
| `src/app/layout.tsx` | IBM Plex Sans via `next/font/google` |
| `src/features/.../CreditCalculatorPage.tsx` | Header brand + layout sections |
| `src/features/.../CreditSummary.tsx` | Hero monthly payment + 4 mini metrics |
| `src/features/.../SummaryMetricCard.tsx` | Compact metric styling for mini row |
| `src/features/.../PaymentScheduleTable.tsx` | Full-width table skin (teal-neutral header) |
| `src/features/.../CreditInputPanel.tsx` | Optional spacing polish only |
| `src/features/.../PaymentBreakdownChart.tsx` | Uses chart tokens (no code change if tokens OK) |
| `src/features/.../RemainingPrincipalChart.tsx` | Chart stroke colors from tokens |
| `src/components/ui/button.tsx` | Already uses `primary-*` tokens — no change if tokens remap |

---

### Task 1: Design tokens + IBM Plex Sans

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css` `@theme` `--font-sans`

**Interfaces:**
- Consumes: next/font Google fonts API
- Produces: CSS variables `--color-primary-*`, `--color-background`, `--font-sans` → IBM Plex Sans

- [ ] **Step 1: Swap font in layout**

In `src/app/layout.tsx`, replace Inter with:

```tsx
import { IBM_Plex_Sans } from "next/font/google";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
```

Apply `ibmPlexSans.variable` on `<html>` instead of Inter. Set `themeColor` to `#0F766E`.

- [ ] **Step 2: Remap tokens in `globals.css`**

Update `:root` (exact values from spec):

```css
--color-primary-50: #f0fdfa;
--color-primary-100: #ccfbf1;
--color-primary-200: #99f6e4;
--color-primary-300: #5eead4;
--color-primary-400: #2dd4bf;
--color-primary-500: #14b8a6;
--color-primary-600: #0f766e;
--color-primary-700: #0d9488;
--color-primary-800: #115e59;
--color-primary-900: #134e4a;
--color-primary-950: #042f2e;

--color-background: #f4f7f6;
--color-ring: #0f766e;

--color-chart-1: #0f766e;
--color-chart-2: #d97706;
--color-chart-3: #e11d48;
--color-chart-4: #0e7490;
--color-chart-5: #64748b;

--radius-lg: 0.625rem; /* ~10px */
```

Fix primary hover semantics: buttons use `hover:bg-primary-700` — set `--color-primary-700: #0d9488` (hover) and keep `--color-primary-600: #0f766e` (default). (Adjust scale so 600=default teal, 700=hover teal as listed.)

Body background: keep `background-color: var(--color-background)` and add a subtle radial:

```css
body {
  background-color: var(--color-background);
  background-image: radial-gradient(
    ellipse 120% 80% at 50% -20%,
    rgba(15, 118, 110, 0.08),
    transparent 55%
  );
  background-attachment: fixed;
}
```

`@theme inline` `--font-sans`:

```css
--font-sans: var(--font-ibm-plex-sans), ui-sans-serif, system-ui, sans-serif;
```

- [ ] **Step 3: Smoke check**

Run: `npm run typecheck`  
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "style: teal tokens and IBM Plex Sans"
```

---

### Task 2: Page header + layout shell

**Files:**
- Modify: `src/features/credit-calculator/components/CreditCalculatorPage.tsx`

**Interfaces:**
- Consumes: `CreditInputPanel`, `CreditSummary`, `PaymentSchedule`, charts, `ExportActions`
- Produces: Desktop layout matching spec ASCII (form | summary → schedule → charts)

- [ ] **Step 1: Ensure structure matches spec**

Page must already (or be updated to):

1. Header with brand **Kredi Hesaplama** as primary title (text-3xl / semibold), one supporting sentence  
2. Grid `lg:grid-cols-[minmax(0,380px)_1fr]`: sticky form | `CreditSummary`  
3. Full-width `PaymentSchedule` below  
4. Charts `xl:grid-cols-2` below schedule  
5. Disclaimer footer  

Remove Calculator icon in a blue box if it fights the new brand; replace with a small teal wordmark/dot or plain text brand only (brand-first, no dashboard chrome).

Use `max-w-[1400px]` container.

- [ ] **Step 2: Visual check at 1280px**

Open `http://localhost:3001/` (dev) or rebuild `:4000`. Confirm first viewport shows brand + form + hero area without chart clutter.

- [ ] **Step 3: Commit**

```bash
git add src/features/credit-calculator/components/CreditCalculatorPage.tsx
git commit -m "style: banking desk page layout and header"
```

---

### Task 3: Hero summary (monthly payment + 4 minis)

**Files:**
- Modify: `src/features/credit-calculator/components/CreditSummary.tsx`
- Modify: `src/features/credit-calculator/components/SummaryMetricCard.tsx` (if needed for compact variant)

**Interfaces:**
- Consumes: `CreditCalculationResult` (`monthlyPayment`, `totalRepayment`, `totalInterest`, `totalKkdf`, `totalBsmv`, `annualEffectiveCostRate`, `input.creditType`)
- Produces: Hero UI; empty state skeleton with same structure

- [ ] **Step 1: Rewrite `CreditSummary` layout**

When `result` is set:

```tsx
<div className="rounded-lg border border-border bg-surface p-5 sm:p-6 shadow-[var(--shadow-card)]">
  <p className="text-xs font-medium uppercase tracking-wide text-primary-600">
    {creditLabel}
  </p>
  <p className="mt-2 text-sm text-foreground-muted">Aylık taksit</p>
  <p className="mt-1 text-4xl sm:text-5xl font-semibold tracking-tight text-foreground tabular-nums transition-all duration-200">
    {formatCurrency(result.monthlyPayment)}
    <span className="ml-2 text-lg font-medium text-foreground-muted">₺ / ay</span>
  </p>
  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
    {/* 4 minis: Toplam geri ödeme, Toplam faiz, Toplam vergi, Yıllık maliyet */}
  </div>
</div>
```

Mini metric values:

- Toplam geri ödeme → `formatCurrency(result.totalRepayment) + " ₺"`
- Toplam faiz → `formatCurrency(result.totalInterest) + " ₺"`
- Toplam vergi → `formatCurrency(result.totalKkdf + result.totalBsmv) + " ₺"`
- Yıllık maliyet → `%` + `formatPercent(result.annualEffectiveCostRate * 100, 2)`

Empty state: same shell with pulse placeholders for hero + 4 cells (not 8 KPI cards).

Remove the old 8-card dense grid and unused Separator/icon imports if unused.

- [ ] **Step 2: Compact mini cell styling**

Each mini: label `text-xs text-foreground-muted`, value `text-sm font-semibold tabular-nums`, light `bg-surface-muted/50` or border-only — not competing with hero size.

- [ ] **Step 3: Commit**

```bash
git add src/features/credit-calculator/components/CreditSummary.tsx src/features/credit-calculator/components/SummaryMetricCard.tsx
git commit -m "feat: hero monthly payment summary with mini metrics"
```

---

### Task 4: Payment schedule + form polish

**Files:**
- Modify: `src/features/credit-calculator/components/PaymentScheduleTable.tsx`
- Modify: `src/features/credit-calculator/components/CreditInputPanel.tsx` (spacing/copy only if needed)

**Interfaces:**
- Consumes: existing `PaymentScheduleItem[]`
- Produces: `table-fixed` full-width table; thead `bg-surface-muted` (not loud primary fill); no `overflow-x-auto` / no `min-w-[820px]`

- [ ] **Step 1: Confirm schedule table constraints**

Table wrapper: `w-full max-w-full min-w-0`.  
Table: `w-full table-fixed text-sm`.  
Headers keep full Turkish labels including **Kalan Anapara**.  
CardBody: `overflow-x-hidden`.

- [ ] **Step 2: Measure overflow**

Playwright or DevTools at 1280×900: `scrollWidth <= clientWidth` on schedule table wrapper. Expected: no horizontal scroll; last header “Kalan Anapara” inside card.

- [ ] **Step 3: Commit**

```bash
git add src/features/credit-calculator/components/PaymentScheduleTable.tsx src/features/credit-calculator/components/CreditInputPanel.tsx
git commit -m "style: payment schedule fits full width without scroll"
```

---

### Task 5: Charts + verification

**Files:**
- Modify: `src/features/credit-calculator/components/RemainingPrincipalChart.tsx` only if hard-coded blue hex exists
- Modify: `src/features/credit-calculator/components/PaymentBreakdownChart.tsx` only if hard-coded colors bypass tokens

**Interfaces:**
- Consumes: `var(--color-chart-*)`  
- Produces: charts visually teal-system aligned

- [ ] **Step 1: Grep hard-coded chart blues**

Run: `rg -n "#[0-9A-Fa-f]{3,8}|blue-|indigo-|violet-|purple-" src/features/credit-calculator/components/*Chart*`  
Replace any leftover primary blues with `var(--color-chart-1)` or primary tokens.

- [ ] **Step 2: Run automated tests**

Run: `npm run test && npm run typecheck && npm run lint`  
Expected: all PASS (calc/export unchanged).

- [ ] **Step 3: Rebuild prod preview if using `:4000`**

```bash
npm run build && # restart next start -p 4000
```

Manual: brand visible, teal CTAs, hero taksit, schedule no H-scroll, charts under plan.

- [ ] **Step 4: Final commit**

```bash
git add -A src/
git commit -m "style: finish şube masası redesign verification"
```

---

## Spec coverage checklist

| Spec item | Task |
|-----------|------|
| Teal tokens + background tint | 1 |
| IBM Plex Sans (no Inter) | 1 |
| Brand header + form \| hero layout | 2 |
| Hero aylık taksit + 4 minis | 3 |
| Full-width schedule, no H-scroll | 2, 4 |
| Charts under schedule, teal palette | 2, 5 |
| No formula/export changes; tests pass | 5 |

## Placeholder scan

None intentional — all token values and layout steps are concrete.
