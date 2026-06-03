# TripTrail — Travel & Local Conveyance Tool — Planning Index

> ## 🎯 Core objective
> **TripTrail exists primarily for HR.** Today HR *manually maintains travel &
> local-conveyance expense sheets for every employee* and has no central way to track
> them. TripTrail gives **HR a single place to see, track, and keep a record of every
> employee's travel claims** — while employees submit their own claims online from
> anywhere, and the data still lands back in the Google Sheets HR trusts.
>
> - **HR is the hub:** sees ALL employees' claims/trips across all departments (not just their own).
> - **Employees self-serve:** they fill the Travel Report + Local Conveyance form themselves.
> - **HR tracks status end-to-end:** Submitted → HOD → Checked → Approved → Paid.
> - **HR keeps the record:** export to Excel + auto-sync approved claims into Google Sheets.
>
> The HR view is the product; the employee form is the feed into it.
> **100% free & open-source stack — no paid services.**

This `plans/` folder holds the full plan, split into focused documents. Read in order:

| # | File | What it covers |
|---|------|----------------|
| 00 | [00-README.md](00-README.md) | This index + the one-paragraph summary |
| 01 | [01-sheet-analysis.md](01-sheet-analysis.md) | What the existing Excel workbook contains, field by field |
| 02 | [02-architecture.md](02-architecture.md) | **Storage / DB / hosting decision** — name, "access anywhere", Supabase vs Mongo, open-source + free stack |
| 03 | [03-data-model.md](03-data-model.md) | Tables / columns the app stores |
| 04 | [04-features.md](04-features.md) | Every feature, grouped by user role (Employee, HR, Approver, Admin) |
| 05 | [05-screens-and-flows.md](05-screens-and-flows.md) | The HTML screens and how a claim moves through them |
| 06 | [06-roadmap.md](06-roadmap.md) | Phased build plan (what to build first → last) |
| 07 | [07-decisions-and-costs.md](07-decisions-and-costs.md) | **All-free guarantee** + decisions made + open questions for you |
| 08 | [08-ui-ux-design.md](08-ui-ux-design.md) | Modern light-theme design system, responsive layout, micro-animations, WCAG 2.1 AA |

## The summary in one paragraph

Today, travel claims are filled by hand into an Excel file (`Travel and Local
Conveyance RD 4th & 5th March 2026.xlsx`) with three sheets — a **Travel Report**,
a detailed **Local Conveyance** sub-form, and an **Instructions** sheet. HR collects
these manually and there is no central tracking. We will replace the manual filling
with a simple **HTML web form** an employee opens from any device. On submit, the
claim is validated and **saved to a database that also writes back into Google
Sheets**, so HR keeps the spreadsheet they already trust *and* gets a live dashboard
to track status (Submitted → HOD approved → Checked → Approved → Paid). Receipts can
be photographed and attached. Everything is reachable from a single shared link with
company-email login, so it works from office, home, or phone.

## Status

- [x] Analyzed the existing workbook (3 sheets) — see `01-sheet-analysis.md`
- [x] Drafted architecture options + recommendation — see `02-architecture.md`
- [ ] You confirm the architecture / storage choice — see `07-open-questions.md`
- [ ] Build Phase 1 (employee form + storage) — see `06-roadmap.md`
