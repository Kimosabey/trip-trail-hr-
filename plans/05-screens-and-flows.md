# 05 — Screens & Flows

## Screens (HTML pages / views)
1. **Login** — company email, magic-link or Google sign-in.
2. **Home / My Claims** (employee) — list with status badges, "New Claim" button.
3. **Claim Editor** — the core form:
   - Header card: name/designation/emp-code/dept/place-of-work (auto), purpose, place of
     visit, trip from/to.
   - Line-items table: add/remove rows, inline totals.
   - Local Conveyance sub-table (collapsible) whose total feeds the line item.
   - Receipts dropzone (drag/photo/PDF) per row.
   - Sticky **totals bar**: Grand Total · Advance · Balance Due.
   - Actions: Save Draft · Submit.
4. **Claim Detail (read-only)** — what approvers and HR see; receipts viewer + audit trail.
5. **Approver Inbox** — claims at my stage; Approve / Reject / Return + comment.
6. **HR Dashboard** — all claims, filters, status board, Export, Mark Paid.
7. **Reports** (Phase 2) — spend charts, outstanding advances.
8. **Admin / Users** (Phase 2) — manage people, roles, approval chains, eligibility.
9. **Help** — Sheet 3 instructions, always reachable.

## Primary flow — submitting a claim
```
Login → My Claims → New Claim → fill header
   → add line items (totals auto) → add local conveyance rows
   → attach receipts → review totals bar → Submit
   → status: SUBMITTED
```

## Approval flow
```
SUBMITTED ──HOD approves──▶ HOD_APPROVED ──checker──▶ CHECKED
   ──approver──▶ APPROVED ──HR marks paid (voucher#)──▶ PAID
   (any stage: Reject → REJECTED, or Return → back to employee for edit)
On APPROVED → Edge Function appends row to Google Sheet.
```

## State rules
- Employee can edit only while `submitted`-not-yet or `returned`. Once it advances, it's read-only to them.
- Every stage transition writes an `approvals` audit row.
- Totals recompute on every line-item/conveyance change (DB trigger), never hand-typed.
