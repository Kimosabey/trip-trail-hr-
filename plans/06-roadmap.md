# 06 — Build Roadmap

Phased so you get a usable tool fast, then layer on tracking & polish. Each phase is shippable.

## Phase 0 — Setup (½ day)
- Create free Supabase project; create tables from `03-data-model.md`; enable RLS.
- Create Storage bucket for receipts.
- Scaffold the static HTML site + `tokens.css` design system (`08-ui-ux-design.md`).
- Free hosting on Cloudflare Pages / Netlify, HTTPS + link live.

## Phase 1 — MVP (employee submit + HR see) 🟢
- Login (company email, magic link).
- Claim Editor: header + line items + local conveyance + **auto totals**.
- Receipt upload.
- Submit → stored.
- My Claims list (employee).
- HR Dashboard: all claims, filters, status, **Export to Excel/CSV**.
- Basic approve/mark-paid by HR.
**Outcome:** employees stop filling Excel by hand; HR tracks everything in one place.

## Phase 2 — Workflow + Sheets sync 🟡
- Full approval chain (HOD → Checker → Approver → Paid) with audit trail.
- Approver inboxes + email notifications.
- **Auto-append approved claims into the Google Sheet** HR already uses.
- Drafts, duplicate-as-template, 3-day reminders.
- Reports: spend by person/dept/month, outstanding advances.

## Phase 3 — Polish & policy 🔵
- Eligibility limits per grade (DA/lodging) with on-form warnings.
- Policy flags (missing receipts, late submission, entertainment).
- Official-form PDF export for printing/signature.
- User & role management UI; per-department approval chains.
- Lighthouse a11y ≥95 + reduced-motion audit pass.

## Suggested first deliverable to review
A clickable **Claim Editor** prototype (static HTML, fake data, real design system &
auto-totals) so you can feel the UX before we wire the database.
