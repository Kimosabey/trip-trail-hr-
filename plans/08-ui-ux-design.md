# 08 — UI / UX Design System

Goal: a **modern, clean, light-theme** web app that feels effortless on phone and desktop,
with tasteful **micro-animations** and **full WCAG 2.1 AA** accessibility. No dark theme
for now (light only). Plain HTML/CSS/JS — no heavy framework.

---

## 1. Design language
- **Style:** modern, soft-UI / "calm productivity" — generous whitespace, rounded corners
  (8–12px), subtle shadows, card-based layout. Not skeuomorphic, not flat-boring.
- **Density:** comfortable. Forms breathe; tables stay scannable.
- **Tone:** trustworthy + simple (it's finance/HR). Clear labels over clever icons.

## 2. Color system (light theme)
Modern, accessible palette. All text/background pairs meet **WCAG AA (≥4.5:1)**.

| Token | Hex | Use |
|-------|-----|-----|
| `--brand` | `#2563EB` (blue 600) | primary actions, links, focus |
| `--brand-hover` | `#1D4ED8` | hover/active |
| `--brand-tint` | `#EFF6FF` | selected rows, info banners |
| `--bg` | `#F8FAFC` (slate 50) | app background |
| `--surface` | `#FFFFFF` | cards, inputs |
| `--border` | `#E2E8F0` | dividers, input borders |
| `--text` | `#0F172A` (slate 900) | primary text (15.8:1 on white) |
| `--text-muted` | `#475569` (slate 600) | secondary text (7.5:1) |
| `--success` | `#16A34A` | approved / paid |
| `--warning` | `#D97706` | pending / needs receipt |
| `--danger` | `#DC2626` | rejected / errors |

**Status badge colors** (with text label, never color-only — WCAG 1.4.1):
Submitted = slate · HOD = blue · Checked = indigo · Approved = green · Paid = teal ·
Rejected = red.

## 3. Typography
- System font stack (fast, native): `-apple-system, "Segoe UI", Roboto, Inter, sans-serif`.
  Optionally bundle **Inter** (open source, OFL).
- Scale: 32 / 24 / 20 / 16 (body) / 14 / 12 px. Line-height 1.5 body, 1.25 headings.
- Min body size **16px** (avoids mobile zoom + readability).

## 4. Layout & responsiveness
- **Mobile-first**, fluid up through breakpoints: `<640` phone · `640–1024` tablet · `>1024` desktop.
- **CSS Grid + Flexbox**; no fixed pixel widths. Container max ~1200px, centered.
- Navigation: top bar on desktop, bottom tab bar / hamburger on mobile.
- **Claim editor on mobile:** the line-items table collapses into stacked **cards** (each
  row becomes a labeled card) so no horizontal scrolling.
- **Sticky totals bar** pinned to the bottom on mobile, side panel on desktop.
- Tap targets **≥44×44px** (WCAG 2.5.5).

## 5. Micro-animations (subtle, purposeful)
- Buttons: 150ms ease background + slight scale on press.
- Cards/rows: fade-and-slide-in (120–200ms) when added; smooth height collapse for sub-tables.
- Totals: count-up tween when a number changes, so the user *sees* the total update.
- Save/Submit: inline spinner → green check confirmation.
- Toasts slide in from bottom, auto-dismiss, dismissible.
- Page transitions: gentle fade.
- **Respect `prefers-reduced-motion`** — disable/shorten all animation for users who ask (WCAG 2.3.3).

## 6. Accessibility (WCAG 2.1 AA) — built in, not bolted on
- **Semantic HTML**: real `<form>`, `<label for>`, `<table>`/`<th scope>`, `<button>`, headings in order.
- **Keyboard:** every action reachable by Tab/Enter/Space; logical focus order; visible
  focus ring (2px brand outline). No keyboard traps (2.1.1/2.1.2).
- **Contrast:** all pairs ≥4.5:1 (text), ≥3:1 (UI/icons) — see palette.
- **Color independence:** status/validation always paired with text + icon, never color alone (1.4.1).
- **Forms:** inline error text tied via `aria-describedby`; `aria-invalid`; errors summarized
  at top and focus jumps to first error (3.3.1/3.3.3).
- **Live regions:** totals + toasts announced via `aria-live="polite"`.
- **Images/receipts:** alt text; uploaded receipts get a meaningful label.
- **Zoom:** layout works at 200% zoom and 320px width (1.4.10 reflow).
- **Labels:** placeholders are never the only label.
- **Skip link** to main content; landmark roles (`<header><nav><main>`).
- Target: passes axe-core / Lighthouse a11y ≥ 95.

## 7. Components to build (small, reusable)
Buttons (primary/secondary/ghost/danger) · Text/number/date inputs with label + error ·
Select / mode-picker · File-upload dropzone with preview · Card · Data table → responsive
cards · Status badge · Toast · Modal/confirm · Tabs · Sticky totals bar · Empty states ·
Loading skeletons.

## 8. Implementation notes
- One `tokens.css` holding the variables above → easy rebrand and a trivial future dark
  theme (just swap token values).
- Keep CSS in a small hand-written sheet (or Pico.css / Open Props — both open source — as
  a base) so it stays "HTML way" with no build pipeline.
- Animations via CSS transitions + a few lines of JS for count-ups; no animation library needed.
