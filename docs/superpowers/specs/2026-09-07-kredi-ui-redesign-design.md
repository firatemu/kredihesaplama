# Kredi Hesaplama UI Redesign — “Şube masası”

**Date:** 2026-09-07  
**Status:** Approved (conversation) — awaiting spec file review  
**Surface:** `http://localhost:4000/` (and production equivalent)  
**Approach:** Net banking / “Şube masası” (option B visual + A layout + A secondary metrics)

## Goal

Redesign the credit calculator page so it feels like a calm digital banking desk: light surfaces, deep teal accent, clear hierarchy. Monthly installment is the hero; the payment schedule fits full width without horizontal scroll. Calculation engine, exports, and data model stay unchanged.

## Non-goals

- Dark mode
- Marketing landing / promotional hero
- New product features or formula changes
- Purple/glow “AI default” aesthetics, cream+terracotta, or broadsheet newspaper layouts

## Visual system

### Color

| Token | Value | Use |
|-------|--------|-----|
| Background | `#F4F7F6` with subtle teal radial tint | Page |
| Surface | `#FFFFFF` | Cards |
| Border | `#E2E8F0` | Card/table borders |
| Primary | `#0F766E` | Buttons, focus, key accents |
| Primary hover | `#0D9488` | Interactive hover |
| Foreground | `#0F172A` | Body text |
| Muted | `#64748B` | Labels, secondary |
| Chart 1–5 | teal / amber / rose / slate / muted teal | Charts (no purple glow) |

### Typography

- **UI + numbers:** IBM Plex Sans (tabular nums for money)
- **No Inter / Roboto / Arial as primary**
- Page title ~28–32px semibold; hero KPI ~36–48px semibold; table ~13–14px

### Shape & elevation

- Radius ~10px (`rounded-lg`)
- Minimal card shadow; prefer border over heavy elevation
- Focus ring: teal 2px

### Motion (2–3 intentional)

1. After calculate: hero KPI value crossfade / slight rise (~200ms)
2. Table row hover background
3. Sticky table header while scrolling schedule

## Layout

### Desktop

```
Header: brand “Kredi Hesaplama” + one supporting sentence
┌─────────────────┬──────────────────────────────────┐
│ Input form      │ Hero: Aylık taksit (large)        │
│ (sticky, ~380px)│ + 4 mini metrics                 │
└─────────────────┴──────────────────────────────────┘
Full width: Ödeme Planı (table-fixed, no horizontal scroll)
Charts row: maliyet dağılımı | kalan anapara
Footer: disclaimer
```

### Mobile

Form → hero KPI → mini metrics → schedule (cards) → charts → disclaimer.

### Mini metrics (under hero)

1. Toplam geri ödeme  
2. Toplam faiz  
3. Toplam vergi (KKDF+BSMV)  
4. Yıllık maliyet oranı (or aylık maliyet %)

## Components (behavior unchanged, skin updated)

- `CreditInputPanel` — teal primary CTA, ghost reset  
- `CreditSummary` / hero — single dominant monthly payment  
- `PaymentSchedule` — full-bleed under top grid; `table-fixed`; export actions top-right  
- Charts — palette remapped to teal system  
- Shared UI primitives (`button`, `card`, `input`, …) consume new CSS tokens  

## Technical notes

- Update `globals.css` tokens + `layout.tsx` font (IBM Plex Sans via `next/font`)
- Keep full-width payment schedule outside the form|KPI grid (already started in page structure)
- Preserve PDF/Excel export and print CSS
- Verify at ~1280px and ~390px: no horizontal scroll on schedule

## Success criteria

- [ ] First viewport reads as one banking composition (brand + form + hero taksit), not a generic dashboard dump
- [ ] Brand name is a clear top signal
- [ ] All schedule columns (including Kalan Anapara) visible without horizontal scrollbar on desktop
- [ ] Teal net-banking look; no Inter; no purple glow theme
- [ ] Existing Vitest calculation/export tests still pass
- [ ] Manual check on `:4000` after rebuild

## Out of scope follow-ups

- Coolify redeploy (only if user asks)
- Brand logo asset / illustration
