# 14 — Test Cases (all roles & scenarios)

Formal test cases for live mode (Supabase). Each has **ID · Role · Precondition · Steps ·
Expected**. Tick Pass/Fail. For a failure, note the TC-ID + console error (F12) and send it.

> Legend roles: **EMP** employee · **HOD** · **CHK** checker · **APP** approver · **HR** hr_admin

---

## Setup — create test users & roles
You need a few accounts to exercise every role. Sign each email in once (magic link), then
set roles in Supabase → SQL Editor:
```sql
-- after each person has signed in once:
update public.users set role='hr_admin',  department='HR'          where email='hr@you.com';
update public.users set role='hod',       department='Sales'       where email='hod@you.com';
update public.users set role='checker',   department='Finance'     where email='checker@you.com';
update public.users set role='approver',  department='Management'  where email='approver@you.com';
-- employees need no change (default role = employee)
```
Tip: if you only have one email, test EMP + HR first (assign/unassign hr_admin to flip
between roles), and treat HOD/CHK/APP as the HR acting at each stage (HR can act at any stage).

---

## A. Authentication & session
| ID | Role | Precondition | Steps | Expected | P/F |
|----|------|--------------|-------|----------|-----|
| A1 | any | Logged out | Open `landing.html` → Sign in → enter email → submit | "Check your inbox" message; email arrives | ☐ |
| A2 | any | Got the email | Click the magic link | Returns to app, signed in, lands on role home | ☐ |
| A3 | any | Logged in | Reload the page | Stays logged in (session persists) | ☐ |
| A4 | any | Logged in | Avatar menu → Sign out | Returns to login; protected pages redirect to login | ☐ |
| A5 | any | Logged out | Open `pages/hr-dashboard.html` directly | Redirected to login (no data leak) | ☐ |
| A6 | any | Bad email | Enter `notanemail` → submit | Inline validation error, no send | ☐ |

## B. Employee — create & submit
| ID | Role | Precondition | Steps | Expected | P/F |
|----|------|--------------|-------|----------|-----|
| B1 | EMP | Logged in | Lands on **My Claims** | Sees only own claims; nav shows My Trips + Help only (no Dashboard/Reports) | ☐ |
| B2 | EMP | — | New Travel Report → header auto-fills name/dept/place | Profile fields pre-filled & read-only | ☐ |
| B3 | EMP | In editor | Add journey row, type Fare 430, DA 800, Lodging 1214 | Row Total = ₹2,444 live | ☐ |
| B4 | EMP | In editor | Add 3 conveyance rows 120/60/225, toggle 1 bill | Conveyance Total ₹405; first journey's Local Conv. = ₹405 | ☐ |
| B5 | EMP | In editor | Watch sticky bar; set Advance 500 | Grand Total live; Balance Due = Grand − 500 | ☐ |
| B6 | EMP | In editor | Add a receipt image/PDF | Thumbnail shows; ✕ removes it | ☐ |
| B7 | EMP | Purpose blank | Click Submit | Blocked; lists missing required fields | ☐ |
| B8 | EMP | Valid form | Submit | Toast "submitted"; returns to My Claims; status = Submitted | ☐ |
| B9 | EMP | DB check | Supabase → Table Editor → claims | Row exists; `grand_total` matches app (DB-computed) | ☐ |
| B10 | EMP | Save Draft | New report → fill partial → Save Draft | Saved as Draft; editable later | ☐ |

## C. Employee — visibility & permissions (RLS)
| ID | Role | Precondition | Steps | Expected | P/F |
|----|------|--------------|-------|----------|-----|
| C1 | EMP | 2 employees exist | As EMP-B, open My Claims | Sees ONLY own claims, never EMP-A's | ☐ |
| C2 | EMP | Knows another claim id | Open `claim-detail.html?id=<other's id>` | "Claim not found"/blocked (RLS denies) | ☐ |
| C3 | EMP | Own claim is Submitted | Try to edit it | Read-only (can't edit after submit) | ☐ |
| C4 | EMP | Claim was Returned | Open it | Editable again; can resubmit | ☐ |

## D. Approval chain (HOD → Checker → Approver)
| ID | Role | Precondition | Steps | Expected | P/F |
|----|------|--------------|-------|----------|-----|
| D1 | HOD | A claim is Submitted | Open Approvals | Claim appears in HOD queue | ☐ |
| D2 | HOD | Reviewing claim | Open it; read all rows/receipts/totals | All visible read-only; timeline shows current = HOD | ☐ |
| D3 | HOD | — | Approve | Status → HOD Approved; approvals row added with actor+time | ☐ |
| D4 | HOD | — | Reject with NO comment | Blocked ("add a reason") | ☐ |
| D5 | HOD | — | Reject WITH comment | Status → Rejected; reason stored | ☐ |
| D6 | HOD | — | Return for edit | Status → Returned; goes back to employee | ☐ |
| D7 | CHK | Claim HOD-approved | Approvals queue → approve | Status → Checked | ☐ |
| D8 | APP | Claim Checked | Approvals queue → approve | Status → Approved | ☐ |
| D9 | any approver | Not their stage | Open a claim not at their stage | No action bar / cannot act | ☐ |

## E. HR Admin — track everything
| ID | Role | Precondition | Steps | Expected | P/F |
|----|------|--------------|-------|----------|-----|
| E1 | HR | Logged in | Lands on **HR Dashboard** | Sees ALL claims, all employees, all departments | ☐ |
| E2 | HR | — | Stat cards | Count up; numbers match the data | ☐ |
| E3 | HR | — | Pipeline strip → click "Submitted" | Table filters to Submitted | ☐ |
| E4 | HR | — | Use Search / Department / Status filters | Table narrows correctly | ☐ |
| E5 | HR | — | Export to Excel | CSV downloads; opens in Excel with all columns & all users | ☐ |
| E6 | HR | Claim is Approved | Click Mark Paid → enter voucher ref | Status → Paid; `voucher_ref` + `paid_at` set in DB | ☐ |
| E7 | HR | — | Open any employee's claim detail | Full read access + can act at any stage | ☐ |
| E8 | HR | — | Open Reports | Spend by dept/month, outstanding advances, KPIs render | ☐ |

## F. Cross-cutting
| ID | Area | Steps | Expected | P/F |
|----|------|-------|----------|-----|
| F1 | Totals | Compare any claim's app total vs DB `grand_total` | Identical (trigger computes) | ☐ |
| F2 | Conveyance link | Conveyance total = Local Conv. shown on the report | Equal (cross-reference) | ☐ |
| F3 | Responsive | Open each page at phone width | Tables stack to cards; nav usable | ☐ |
| F4 | Accessibility | Tab through a form; zoom 200% | Visible focus, logical order, no breakage | ☐ |
| F5 | Help | Open Help page | 6 rules + field guidance present | ☐ |
| F6 | Sheets sync | (If deployed) Approve a claim | New row appended to Google Sheet | ☐ |
| F7 | Landing | Logged out → open `index.html` | Redirects to landing; logged in → role home | ☐ |

---

## Quick role-coverage checklist
- [ ] **Employee** — B1–B10, C1–C4
- [ ] **HOD** — D1–D6
- [ ] **Checker** — D7
- [ ] **Approver** — D8, D9
- [ ] **HR Admin** — E1–E8
- [ ] **Auth & cross-cutting** — A1–A6, F1–F7

When a section passes, tell me e.g. "B done, C done". For fails: TC-ID + what happened + console error.
