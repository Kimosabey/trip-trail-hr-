# 03 — Data Model

Relational (PostgreSQL / Supabase). Five core tables. IDs are UUIDs. Money is `numeric(12,2)`.

## `users` (synced from Supabase Auth)
| column | type | notes |
|--------|------|-------|
| id | uuid (PK) | = auth user id |
| full_name | text | e.g. "Raghavendra D" |
| designation | text | e.g. "HR" |
| emp_code | text | |
| department | text | |
| place_of_work | text | home base, e.g. "Mysuru" |
| role | text | `employee` \| `hod` \| `checker` \| `approver` \| `hr_admin` |
| grade | text | for future eligibility limits (DA/lodging) |
| created_at | timestamptz | |

## `claims` (one Travel Report)
| column | type | notes |
|--------|------|-------|
| id | uuid (PK) | |
| user_id | uuid → users | submitter |
| purpose | text | "Visit to CLIENT" |
| place_of_visit | text | "Whitefield" |
| trip_from | date | |
| trip_to | date | |
| advance_received | numeric | default 0 |
| grand_total | numeric | computed from line_items (cached) |
| balance_due | numeric | grand_total − advance_received |
| status | text | `submitted`→`hod_approved`→`checked`→`approved`→`paid` (+ `rejected`) |
| submitted_at | timestamptz | |
| created_at / updated_at | timestamptz | |

## `line_items` (rows of the Travel Report)
| column | type | notes |
|--------|------|-------|
| id | uuid (PK) | |
| claim_id | uuid → claims | |
| item_date | date | |
| journey_particulars | text | "Mysore to Bengaluru" |
| mode_of_transport | text | Flight/Train/Bus/Metro/Cab/… |
| fare | numeric | |
| daily_allowance | numeric | |
| lodging | numeric | |
| local_conveyance | numeric | = sum of this claim's conveyance rows (auto) |
| misc_details | text | "Driver breakfast" |
| misc_amount | numeric | |
| row_total | numeric | fare+da+lodging+conveyance+misc (auto) |
| sort_order | int | |

## `conveyance` (Local Conveyance sub-form rows)
| column | type | notes |
|--------|------|-------|
| id | uuid (PK) | |
| claim_id | uuid → claims | cross-reference |
| item_date | date | |
| from_place | text | |
| to_place | text | |
| mode | text | Auto/Metro/Cab/Bus/Rickshaw/Ola/Uber |
| amount | numeric | |
| has_bill | bool | "Bill attached" vs "No Bill" |
| remarks | text | |

## `receipts` (uploaded bills)
| column | type | notes |
|--------|------|-------|
| id | uuid (PK) | |
| claim_id | uuid → claims | |
| line_item_id | uuid → line_items | nullable (which expense it backs) |
| storage_path | text | path in Supabase Storage |
| file_type | text | image/pdf |
| uploaded_at | timestamptz | |

## `approvals` (audit trail of the chain)
| column | type | notes |
|--------|------|-------|
| id | uuid (PK) | |
| claim_id | uuid → claims | |
| actor_id | uuid → users | who acted |
| stage | text | hod / checker / approver / cashier |
| action | text | `approved` \| `rejected` \| `returned` |
| comment | text | reason / note |
| acted_at | timestamptz | |

### Derived / computed
- `line_items.row_total`, `claims.grand_total`, `claims.balance_due` — kept correct by a
  DB trigger so totals never drift (mirrors the spreadsheet formulas).
- `line_items.local_conveyance` = SUM(`conveyance.amount`) for the claim.

### Row-Level Security (RLS) summary
- `employee`: SELECT/INSERT/UPDATE only rows where `user_id = auth.uid()` and status = `submitted`.
- `hod`/`checker`/`approver`: SELECT all; UPDATE only the status field at their stage.
- `hr_admin`: full read; manage users, export, configure eligibility.
