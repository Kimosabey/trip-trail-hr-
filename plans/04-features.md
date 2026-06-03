# 04 — Features (by role)

Legend: 🟢 Phase 1 (MVP) · 🟡 Phase 2 · 🔵 Phase 3 (nice-to-have)

## Employee (end user)
- 🟢 Log in with company email.
- 🟢 **New Travel Report**: header (purpose, place of visit, dates) auto-filled with
  their profile (name, designation, emp code, dept, place of work).
- 🟢 **Add line items**: date, journey, mode, fare, DA, lodging, misc; **row total auto**.
- 🟢 **Local Conveyance** rows nested in the claim (date, from, to, mode, amount, bill?,
  remarks); their total flows into the line item's Local Conveyance column.
- 🟢 **Live totals**: grand total, advance, balance due — all auto, like the sheet.
- 🟢 **Upload receipts** (camera/photo/PDF) per expense; mark "Bill attached / No Bill".
- 🟢 **Submit** → status becomes *Submitted*; can't edit after (until returned).
- 🟢 **My Claims** list with status badges and totals.
- 🟡 **Save as draft** and resume later.
- 🟡 **Duplicate a past claim** as a template (frequent same trips).
- 🟡 **3-day reminder** (rule 4) nudging to submit after a trip end date.
- 🔵 PDF export of a claim that looks like the official form (for printing/signature).

## HOD / Checker / Approver
- 🟢 **Inbox** of claims waiting at their stage.
- 🟢 Open a claim, see all line items, conveyance, receipts, totals.
- 🟢 **Approve / Reject / Return** with a comment → moves to next stage or back to employee.
- 🟢 Full **audit trail** (who did what, when) on each claim.
- 🟡 Email/notification when a claim arrives at their stage.

## HR Admin (the person who wants the tracker)
- 🟢 **All-claims dashboard**: every claim, any status, with filters (person, dept, date
  range, status, place of visit) and search.
- 🟢 **Status tracking** at a glance (kanban or table: Submitted / HOD / Checked / Approved / Paid).
- 🟢 **Mark Paid** + record voucher reference and date (the "Cash Section" step).
- 🟢 **Export to Excel/CSV** matching the current sheet layout.
- 🟢 **Auto-write approved claims into the Google Sheet** HR already uses.
- 🟡 **Totals & reports**: spend by employee / department / month; advances outstanding;
  average approval time.
- 🟡 **Manage users & roles**; set the approval chain per department.
- 🔵 **Eligibility limits** per grade (max DA, max lodging) with warnings on the form (rule: "as per eligibility").
- 🔵 **Policy flags**: highlight missing receipts, entertainment expenses (rule 2), late submissions (rule 4).

## System / cross-cutting
- 🟢 Auto-calculation engine (row totals, grand total, balance) enforced in the DB.
- 🟢 Receipt storage with secure, role-gated access.
- 🟢 Mobile-friendly (employees often submit from phones).
- 🟡 Instructions/help panel reproducing Sheet 3 guidance inline next to each field.
- 🔵 Multi-currency / multi-company (if RANGSONS grows the tool).
