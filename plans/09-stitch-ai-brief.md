# 09 — Stitch AI Brief (UI Prototype Prompts)

Paste these into **Stitch AI** (stitch.withgoogle.com) to generate the TripTrail UI
prototypes. Generate **one screen per prompt**. Each prompt already includes the realistic
sample data from the RANGSONS sheet so the mockups look authentic.

> **How to use:** First set the global style (Section A) — in Stitch, put it in the theme/
> style settings or prepend it to each prompt. Then run each screen prompt in Section B.
> Generate both **web (desktop)** and **mobile** variants where noted. Export to Figma/code
> and drop the links/screenshots back here so I can match them when I build.

---

## A. GLOBAL STYLE (use for every screen)

```
App name: TripTrail — a travel & local-conveyance expense reporting tool for a company
(RANGSONS LLP). Modern, clean, professional, trustworthy fintech/HR feel.

THEME: Light theme only (no dark mode).
STYLE: Modern soft-UI, card-based, generous whitespace, rounded corners 8–12px, subtle
soft shadows, clean and uncluttered. Not flat-boring, not skeuomorphic.

COLORS:
- Primary / brand: #2563EB (blue), hover #1D4ED8
- Brand tint / selected: #EFF6FF
- App background: #F8FAFC
- Cards/surfaces: #FFFFFF
- Borders/dividers: #E2E8F0
- Primary text: #0F172A
- Secondary/muted text: #475569
- Success (approved/paid): #16A34A
- Warning (pending/needs receipt): #D97706
- Danger (rejected/error): #DC2626

TYPOGRAPHY: Inter or system sans-serif. Headings bold. Body 16px. Clear hierarchy.

LAYOUT: Mobile-first and fully responsive. Comfortable density. Max content width ~1200px,
centered. Top navigation bar on desktop; bottom tab bar on mobile.

ACCESSIBILITY (WCAG 2.1 AA): High contrast text, visible focus states, large tap targets
(min 44px), status shown with BOTH color AND a text label/icon (never color alone), clear
form labels above inputs with inline error text.

CURRENCY: Indian Rupees (₹). Dates in DD MMM YYYY.
```

---

## B. SCREEN PROMPTS

### 1) Login screen
```
Design a clean, centered login screen for TripTrail. A white card on the light background
with: the TripTrail logo/wordmark at top (a small route/trail pin icon + "TripTrail"),
a heading "Sign in to TripTrail", subtext "Travel & expense reporting for RANGSONS LLP",
a single email input labeled "Company email", and a primary blue button "Send magic link".
Below it small muted text "We'll email you a secure sign-in link — no password needed."
Minimal, modern, friendly. Mobile and desktop.
```

### 2) My Claims — employee home
```
Design the employee home screen "My Claims" for TripTrail. Top nav bar with TripTrail logo
left, and avatar "Raghavendra D (HR)" right. A page heading "My Claims" with a prominent
primary button "+ New Travel Report" on the right. Below, a list/table of the user's claims
as cards/rows, each showing: Purpose ("Visit to CLIENT"), Place of Visit ("Whitefield"),
trip dates ("04 Mar 2026 – 05 Mar 2026"), Grand Total ("₹4,648"), and a STATUS BADGE with
text + color (e.g. "Submitted" slate, "Approved" green, "Paid" teal, "Rejected" red).
Include 4–5 sample rows with different statuses. Add a filter row (status dropdown, date
range, search). Empty-state illustration variant optional. Responsive: rows become stacked
cards on mobile.
```

### 3) Claim Editor — THE core screen (most important)
```
Design the main "New Travel Report" editor screen for TripTrail — a form to submit a
business travel expense claim. Layout top to bottom:

1) HEADER CARD titled "Travel Report" with fields in a 2-column grid:
   Name & Designation ("Raghavendra D, HR"), Place of Work ("Mysuru"), Emp. Code,
   Department ("HR"), Purpose of Travel ("Visit to CLIENT"), Place of Visit ("Whitefield"),
   Date From ("04 Mar 2026"), Date To ("05 Mar 2026"). Profile fields look pre-filled/muted.

2) LINE ITEMS CARD titled "Journey & Expenses" — an editable table with columns:
   Date | Journey Particulars | Mode of Transport | Fare ₹ | Daily Allowance ₹ |
   Lodging ₹ | Local Conveyance ₹ | Miscellaneous (Details + Amount) | Row Total ₹ |
   (delete row icon). Show 3 sample rows:
   - 04 Mar 2026 | Mysore to Bengaluru | Bus | 430 | 800 | 1,214 | 977 | — | 3,421
   - 05 Mar 2026 | Bengaluru to Mysore | Bus | 401 | 800 | — | — | — | 1,201
   - 20 Feb 2026 | Mysore to Bengaluru | Cab | — | 800 | — | — | "Driver breakfast" 427 | 1,227
   A "+ Add journey row" button below. Row Total column looks auto-calculated (subtle tint).

3) LOCAL CONVEYANCE CARD (collapsible, titled "Local Conveyance details") — small editable
   table: Date | From | To | Mode | Amount ₹ | Bill? (toggle "Bill attached"/"No Bill") |
   Remarks. Sample rows:
   - 04 Mar 2026 | Kuvempunagar | KSRTC Bus stand | Auto | 120 | No Bill
   - 04 Mar 2026 | Kengeri Metro | Majestic | Metro | 60 | No Bill
   - 04 Mar 2026 | Majestic | Mindful TMS Hebbal | Cab | 225 | Bill attached
   Footer "Local Conveyance Total: ₹405". "+ Add conveyance row" button.

4) RECEIPTS CARD titled "Receipts / Bills" — a drag-and-drop upload zone "Drop photos or
   PDFs here, or tap to upload", showing 2 uploaded receipt thumbnails with file names.

5) STICKY TOTALS BAR pinned at the bottom showing: Grand Total ₹4,648 | Advance Received
   ₹0 | Balance Due ₹4,648, with two buttons "Save Draft" (secondary) and "Submit" (primary
   blue). On mobile the line-items table becomes stacked labeled cards.

Modern, clean, spacious, professional. This is the hero screen — make it polished.
```

### 4) Claim Detail — read-only (approver / HR view)
```
Design a read-only "Claim Detail" screen for TripTrail used by approvers and HR. Show the
full travel report nicely formatted (not editable): header info, the journey/expenses table,
the local conveyance table, totals (Grand Total ₹4,648, Advance ₹0, Balance Due ₹4,648),
and a "Receipts" gallery of thumbnail images that can be clicked to enlarge. On the right
side (or below on mobile) an "Approval timeline" / audit trail vertical stepper showing:
Submitted by Raghavendra D (done, green check) → HOD Approved (done) → Checked (current,
highlighted) → Approved (pending) → Paid (pending), each with name and date. At the bottom
an action bar with buttons: "Approve" (green), "Return for edit" (secondary), "Reject"
(red), and a comment text box. Clean, scannable, professional.
```

### 5) Approver Inbox
```
Design an "Approvals Inbox" screen for TripTrail for a manager/approver. A heading "Waiting
for your approval" with a count badge "3". A list of claim cards, each showing employee name
+ avatar, purpose ("Visit to CLIENT"), trip dates, total ("₹4,648"), how long it's been
waiting ("2 days"), current stage badge, and quick action buttons "Review", "Approve",
"Reject". Tabs at top: "Pending (3)", "Approved", "Rejected". Clean, fast to scan, mobile
responsive.
```

### 6) HR Dashboard — the tracker (key for HR)
```
Design the "HR Dashboard" screen for TripTrail — the central tracking view for an HR admin.
Top: a row of 4 summary stat cards: "Total Claims this month: 28", "Pending approval: 6",
"Approved: 18", "Total reimbursed: ₹1,24,300". Below: a powerful filter bar (search box,
Employee dropdown, Department dropdown, Status dropdown, Date range picker, and an "Export
to Excel" button on the right). Then a large data table of ALL claims with columns:
Employee | Department | Purpose | Place of Visit | Trip Dates | Grand Total ₹ | Status badge
| Submitted On | Actions ("View", "Mark Paid"). Show ~6 sample rows across different statuses
and people. Optionally a small status breakdown (Submitted / HOD / Checked / Approved / Paid)
as a segmented bar. Professional admin dashboard look, dense but clean, responsive.
```

### 7) HR Dashboard — Kanban variant (optional, nice for tracking)
```
Design an alternative "Status Board" (kanban) view for TripTrail HR dashboard with 5
columns: "Submitted", "HOD Approved", "Checked", "Approved", "Paid". Each column has claim
cards (employee name, purpose, total ₹, dates) that visually sit under their status. Color-
code column headers subtly. Modern, clean, draggable feel. Responsive (columns scroll
horizontally on mobile).
```

### 8) Reports (Phase 2, optional)
```
Design a "Reports" screen for TripTrail showing travel-spend analytics: a bar chart of
spend by month, a horizontal bar chart of spend by department, a list of "Outstanding
advances" by employee, and a stat "Average approval time: 2.3 days". Clean, light, modern
dashboard with the blue accent color. Responsive.
```

---

## C. Logo / brand note for Stitch
```
TripTrail logo concept: a minimal route/trail line with a location pin at the end, paired
with the wordmark "TripTrail" in a modern geometric sans-serif. Primary color blue #2563EB.
Simple, friendly, works small (favicon) and on a white nav bar.
```

---

## D. After you generate
1. Export each screen (Figma link or PNG) and save into a new folder `design/stitch/`.
2. Drop the links/screenshots in chat, or just save them in that folder and tell me.
3. I'll use them as the visual reference and build the real HTML/CSS to match — so the
   final TripTrail looks exactly like the approved Stitch mockups.
