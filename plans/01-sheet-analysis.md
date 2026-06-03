# 01 — Sheet Analysis

Source file: `Travel and Local Conveyance RD 4th & 5th March 2026.xlsx`
Company: **RANGSONS LLP**. Three sheets. This is a **travel-expense reimbursement
form** with an approval chain. Below is every field we must reproduce in the app.

---

## Sheet 1 — "Travel Report" (main claim)

### Header block (one per claim)
| Field | Example in file | Notes |
|-------|-----------------|-------|
| Name & Designation | `xyz, Hr` | Person submitting |
| Place of Work | `Mysuru` | Home base / headquarters |
| Emp. Code | (blank) | Employee ID |
| Dept. | `HR` | Department |
| Purpose of Travel | `Visit to CLIENT` | Free text |
| Place of Visit | `Whitefield` | Destination |
| Date — From / To | `2026-03-04` → `2026-03-05` | Trip date range |

### Line items (one row per journey leg)
Columns: **Date · Journey Particulars · Mode of Transport · Fares · Daily Allowance ·
Lodging Charges · Local Conveyance · Miscellaneous (Details + Amount) · Total**

Real rows from the file:
- `2026-02-20` · Mysore to Bengaluru · Cab · Fare — · DA 800 · Lodging — · Conv — · Misc "Driver breakfast" 427 · **Total 1227**
- `2026-03-04` · Mysore to Bengaluru · Bus · Fare 430 · DA 800 · Lodging 1214 · Conv 977 · **Total 3421**
- `2026-03-05` · Bengaluru to Mysore · Bus · Fare 401 · DA 800 · ... 

> Each row's **Total = Fares + Daily Allowance + Lodging + Local Conveyance + Misc Amount**.
> The "Local Conveyance" column number is the **grand total of Sheet 2** (cross-reference).

### Footer block
| Field | Example | Notes |
|-------|---------|-------|
| Grand Total | 4648 | Sum of all line Totals (auto) |
| Advance Received | 0 | Money paid to employee before trip |
| Balance due from / to company | 4648 | = Grand Total − Advance |
| Signature chain | Traveller → HOD → Checked By → Approved By → Cash Section | The **approval workflow** |

> Note on the file: "To be approved by the person who has approved their travel for its purpose."

---

## Sheet 2 — "Local Conveyance" (detailed sub-form)

Linked to Sheet 1's "Local Conveyance" column. One header + many rows.

| Field | Example |
|-------|---------|
| Name | `Raghavendra D` |
| T. R. Date | (Travel Report date this links to) |

Rows — columns: **Date · From · To · Mode of Conveyance · Amount · Remarks**
- `2026-03-04` · Kuvempunagar → KSRTC Bus stand · Auto · 120 · *No Bill*
- `2026-03-04` · Kengeri Metro → Majestic · Metro · 60 · *No Bill*
- `2026-03-04` · Majestic → Mindful TMS Hebbal · Cab · 225 · *Bill attached*
- **Total 405**

Footer: HOD's Signature + Signature of Traveller (with dates).

Modes seen: Bus / Metro / Auto / Rickshaw / Taxi (Ola / Uber) / Cab.

---

## Sheet 3 — "Instructions" (rules we must enforce / show)

Processing rules:
1. Pay business expenses in **cash**; don't sign bills to the company unless authorized.
2. **Entertainment** expenses only if authorized and tied to business discussion.
3. **Obtain receipts** for all expenses and attach them; unsupported expenses must be detailed in full.
4. **Submit within 3 days** of returning to headquarters.
5. If a balance is owed to the company, **repay the cashier immediately**.
6. Show **local conveyance** in the specified form, cross-referenced to the travel report.

Per-field guidance (mirrored into the app's helper text and validation):
- **Daily Allowance / Lodging** → "as per eligibility" (so app may hold per-grade limits later).
- **Miscellaneous** → "approval required".
- **Total** → auto-computed (row and column totals).

---

## What this tells us to build
1. A **two-part claim**: a Travel Report header + line items, with an embedded Local
   Conveyance list whose total feeds the "Local Conveyance" column.
2. **Auto-totals** everywhere (row totals, grand total, balance vs advance).
3. A **status / approval chain** (Submitted → HOD → Checked → Approved → Paid).
4. **Receipt attachments** + a "Bill attached / No Bill" flag (rule 3).
5. **Eligibility limits** per employee grade (future) for DA / lodging.
6. A **3-day submission reminder** (rule 4) — nice-to-have.
7. Output that **lands back in Google Sheets** so HR keeps their familiar view.
