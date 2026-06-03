---
name: TripTrail
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#434655'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fc'
  on-secondary-container: '#57657a'
  tertiary: '#006329'
  on-tertiary: '#ffffff'
  tertiary-container: '#007f36'
  on-tertiary-container: '#c7ffca'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d5e3fc'
  secondary-fixed-dim: '#b9c7df'
  on-secondary-fixed: '#0d1c2e'
  on-secondary-fixed-variant: '#3a485b'
  tertiary-fixed: '#7ffc97'
  tertiary-fixed-dim: '#62df7d'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005320'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max-width: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  stack-gap: 16px
---

## Brand & Style
The design system for this product centers on a "Modern Corporate" aesthetic that balances the rigor of fintech with the approachability of a travel companion. The target audience consists of employees and finance administrators at RANGSONS LLP, requiring an interface that feels efficient, trustworthy, and error-proof.

The style is characterized by **Modern Soft-UI**: a refinement of traditional flat design that incorporates depth through subtle shadows and tonal layering rather than heavy gradients. It prioritizes clarity and generous whitespace to reduce cognitive load during the often-tedious task of expense reporting. The emotional response should be one of "organized calm"—transforming bureaucratic tasks into a fluid, frictionless experience.

## Colors
The palette is rooted in a professional "Enterprise Blue" to signal stability and authority. 

- **Primary & Tints:** The primary blue is used for critical actions and brand presence. The high-light tint (`#EFF6FF`) is reserved for selected states in lists or subtle background highlights behind icons.
- **Surface Strategy:** This design system uses a two-tier background approach. The global application background is a cool-gray (`#F8FAFC`), while all interactive content "floats" on pure white (`#FFFFFF`) cards to create a clear visual hierarchy.
- **Feedback Loop:** Success, Warning, and Danger colors are calibrated for high legibility against white backgrounds. Every status indicator must pair these colors with descriptive text or iconography to meet accessibility standards.

## Typography
The system utilizes **Inter** for its exceptional legibility in data-heavy environments. 

- **Hierarchy:** Headlines use a bold weight with slightly tighter letter spacing to create a strong anchor for page sections. 
- **Numerical Data:** For currency (₹) and expense amounts, use the medium or semi-bold weight of the body font to ensure financial figures are the first thing a user notices on a line item.
- **Localization:** Dates must consistently follow the `DD MMM YYYY` format (e.g., 14 OCT 2023) to avoid regional ambiguity.
- **Accessibility:** Minimum contrast ratios are maintained by using Primary Text (`#0F172A`) for all body content and Secondary Text (`#475569`) only for non-essential metadata.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid** model. On desktop, content is contained within a 1280px max-width 12-column grid to maintain readability. On mobile, the system shifts to a single-column fluid stack with 16px side margins.

A strict 4px base unit governs all spacing.
- **Vertical Rhythm:** Use 16px (`stack-gap`) between cards in a list and 24px between distinct logical sections.
- **Touch Targets:** All interactive elements (buttons, chevron icons, list items) must maintain a minimum height of 44px to ensure ease of use for employees recording expenses on the go.

## Elevation & Depth
Depth is created through **Tonal Layering and Soft Ambient Shadows**. 

The design system avoids heavy borders in favor of shadows that mimic a natural light source.
- **Level 0 (Background):** `#F8FAFC` — used for the "ground" of the application.
- **Level 1 (Cards):** `#FFFFFF` with a subtle 1px border of `#E2E8F0` and a soft shadow (e.g., `0px 1px 3px rgba(15, 23, 42, 0.05)`).
- **Level 2 (Active/Hover):** When a card or button is interacted with, the shadow becomes slightly more diffused (`0px 10px 15px -3px rgba(15, 23, 42, 0.1)`) to suggest the element is lifting toward the user.
- **Dividers:** Use 1px solid `#E2E8F0` for separating items within a single white card.

## Shapes
The shape language is "Approachable Geometric." 

- **Cards & Containers:** Use `rounded-lg` (16px) for main content cards to create a soft, modern feel.
- **Buttons & Inputs:** Use `rounded` (8px) for interactive elements to maintain a professional, slightly more structured appearance than the outer containers.
- **Status Pills:** Small chips or status indicators use a full pill radius to distinguish them from clickable buttons.

## Components
- **Buttons:** Primary buttons use a solid `#2563EB` background with white text. Secondary buttons use a white background with a `#E2E8F0` border and `#475569` text.
- **Expense Cards:** These are the core of the system. They must display the Category Icon, Date, Amount (in ₹), and Status Tag. The status tag must include both a background tint and an icon (e.g., a green check for "Paid").
- **Input Fields:** Fields should have a height of 48px, a 1px border (`#E2E8F0`), and use the `#F8FAFC` background when disabled. Labels are always persistent above the field.
- **Empty States:** When no reports are present, use a large, desaturated icon and a clear Primary Button to "Add Expense."
- **Receipt Upload:** A specialized component with a dashed border to signify a drop zone, providing clear visual feedback once a file is attached.