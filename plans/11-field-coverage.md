# 11 — Field Coverage Matrix (Excel → TripTrail)

Proof that **every field, table, and cross-reference** in
`Travel and Local Conveyance RD 4th & 5th March 2026.xlsx` maps into the app — flexibly,
with features. ✅ = built · 🟡 = in data model, surfaced in later phase.

## Sheet 1 — Travel Report → `claims` + `line_items`

### Header block
| Excel field | App field | Where | ✓ |
|-------------|-----------|-------|---|
| Name & Designation | `users.full_name` + `designation` (auto-filled) | Claim Editor header | ✅ |
| Place of Work | `users.place_of_work` | Claim Editor header | ✅ |
| Emp. Code | `users.emp_code` | Claim Editor header | ✅ |
| Dept. | `users.department` | Claim Editor header | ✅ |
| Purpose of Travel | `claims.purpose` | Claim Editor | ✅ |
| Place of Visit | `claims.place_of_visit` | Claim Editor | ✅ |
| Date From / To | `claims.trip_from` / `trip_to` | Claim Editor | ✅ |

### Line items (repeatable rows — flexible add/remove)
| Excel column | App field | ✓ |
|--------------|-----------|---|
| Date | `line_items.item_date` | ✅ |
| Journey Particulars | `journey_particulars` | ✅ |
| Mode of Transport | `mode_of_transport` (Flight/Train/Bus/Metro/Cab/Auto/Own/Other) | ✅ |
| Fares | `fare` | ✅ |
| Daily Allowance | `daily_allowance` | ✅ |
| Lodging Charges | `lodging` | ✅ |
| Local Conveyance | `local_conveyance` (auto = Sheet-2 total, cross-referenced) | ✅ |
| Miscellaneous — Details | `misc_details` | ✅ |
| Miscellaneous — Amount | `misc_amount` | ✅ |
| Total (row) | computed `row_total` | ✅ (auto) |

### Footer block
| Excel field | App field | ✓ |
|-------------|-----------|---|
| Grand Total | computed `claims.grand_total` | ✅ (auto) |
| Advance Received | `claims.advance_received` | ✅ |
| Balance due from/to company | computed `claims.balance_due` | ✅ (auto) |
| Signature of Traveller + Date | `approvals` row, stage `submitted` (actor + acted_at) | ✅ |
| HOD's Signature + Date | `approvals` stage `hod` | ✅ |
| Checked By + Date | `approvals` stage `checker` | ✅ |
| Approved by + Date | `approvals` stage `approver` | ✅ |
| Cash Section + "received/paid per voucher of even date" | `claims.voucher_ref` + `paid_at` + `approvals` stage `cashier` | ✅ (added) |

## Sheet 2 — Local Conveyance → `conveyance`
| Excel field | App field | ✓ |
|-------------|-----------|---|
| Name | `users.full_name` (claim owner) | ✅ |
| T. R. Date (cross-ref to Travel Report) | `conveyance.claim_id` → `claims` | ✅ (relationship) |
| Date | `item_date` | ✅ |
| From | `from_place` | ✅ |
| To | `to_place` | ✅ |
| Mode of Conveyance | `mode` (Auto/Metro/Bus/Cab/Rickshaw/Ola/Uber/Other) | ✅ |
| Amount | `amount` | ✅ |
| Remarks | `remarks` | ✅ |
| "Bill attached" / "No Bill" | `has_bill` (boolean toggle) | ✅ |
| Total | computed (conveyance total) | ✅ (auto) |
| HOD + Traveller signatures | `approvals` | ✅ |

## Sheet 3 — Instructions → rules enforced / shown
| Excel rule | How TripTrail honours it | ✓ |
|------------|--------------------------|---|
| 1. Pay in cash; don't sign bills unless authorized | Shown on Help page | 🟡 Help page |
| 2. Entertainment expenses only if authorized | Misc expense flag + Help note | 🟡 |
| 3. Obtain & attach receipts | Receipts upload + `has_bill` flag | ✅ |
| 4. Submit within 3 days of return | 3-day reminder (Phase 2) | 🟡 |
| 5. Repay balance owed to cashier immediately | "Mark Paid" + voucher capture | ✅ |
| 6. Show local conveyance cross-referenced | Sheet-2 linked to claim; total feeds Local Conveyance column | ✅ |
| Field guidance (per-field help text) | Inline helper text + Help page | 🟡 |

## Flexibility built in
- **Repeatable rows**: unlimited journey + conveyance rows, add/remove freely.
- **Configurable approval chain**: stages live in `approvals`; chain can be simplified
  (HR-only) or full (HOD→Checker→Approver→Cashier) per department (Phase 2).
- **Eligibility limits** (`users.grade`) for DA/lodging — optional, warn-only (Phase 3).
- **Auto-math everywhere** — row totals, grand total, balance, conveyance total — so the
  human arithmetic errors in the source sheet (grand total skipped a row; conveyance 977 ≠
  detail 405) cannot happen.

## Gaps closed by this review
1. Added `claims.voucher_ref` and `claims.paid_at` (Cash Section step).
2. Confirmed every signature maps to an `approvals` audit row (actor + date + comment).
3. Help/Instructions page (Sheet 3) scheduled — reproduces all 6 rules + field guidance.
