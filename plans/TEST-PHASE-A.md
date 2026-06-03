# ✅ TEST — Phase A (Mock mode UI walkthrough)

No login, no backend. You are "Raghavendra D (HR)" with sample data.
**Config is already set to `USE_MOCK: true` for this phase.**

> Tick each box. If a ✅ "you should see" doesn't happen, note the step number + open the
> browser console (F12 → Console) and copy any red text to me.

---

## Step 0 — Start the app
1. In VS Code, open `app/landing.html`.
2. Click **Go Live** (bottom-right) / right-click → **Open with Live Server**.
3. Browser opens at `http://127.0.0.1:5500/app/landing.html`.

✅ You should see: the TripTrail **landing page** with a blue hero and a floating card.

---

## Step 1 — Landing page
- [ ] Scroll down — feature cards and "How it works" **fade/slide in** as you scroll.
- [ ] Narrow the browser window — layout **stacks** neatly (mobile look).
- [ ] Click **Sign in** (top-right).

✅ You should see: the **login** screen.

---

## Step 2 — Login (mock)
- [ ] Type any email (e.g. `test@rangsons.com`) → click **Send magic link**.

✅ You should see: it jumps straight into the app and lands on the **HR Dashboard**
(because the mock user is HR).

---

## Step 3 — HR Dashboard (the tracker)
- [ ] The 4 stat cards **count up** from 0.
- [ ] The **pipeline strip** shows counts per stage (Submitted / HOD / Checked / Approved / Paid / Rejected).
- [ ] Click a pipeline stage (e.g. **Submitted**) → the table **filters** to that status.
- [ ] Use the **Search**, **Department**, **Status** filters → table narrows.
- [ ] Click **Export to Excel** → a `triptrail-claims.csv` downloads (open it — columns look right).
- [ ] Find a row with status **Approved** → it shows a **Mark Paid** link.

---

## Step 4 — Create a claim (the hero screen)
- [ ] Click **+ New Travel Report**.
- [ ] Traveller details are **pre-filled** (name, dept, place of work).
- [ ] Fill Purpose + Place of Visit + Date From/To.
- [ ] In **Journey & Expenses**: type Fare `430`, DA `800`, Lodging `1214`.
      ✅ The **Row Total** updates instantly.
- [ ] Click **Add journey row** → a second row appears.
- [ ] In **Local Conveyance**: add a row, Mode `Auto`, Amount `120`, toggle **Bill**.
      ✅ The **Local Conv.** column (first journey row) + **conveyance total** update.
- [ ] Watch the **sticky bottom bar**: Grand Total / Advance / Balance Due — all live.
- [ ] Change **Advance Received** to `500` → **Balance Due** drops by 500.
- [ ] Click the **receipts** box → pick any image/PDF → a thumbnail appears; the ✕ removes it.
- [ ] Click **Submit** with Purpose **blank** → ✅ it blocks and lists what's missing.
- [ ] Fill the blanks → **Submit** → ✅ toast "submitted", returns to **My Claims**.

---

## Step 4b — 🎯 Other employees add → HR sees (the core test, no login needed)
In mock mode there's a **demo user switcher** in the top-right of the nav (icon: 👤↔).
- [ ] Switch the demo user to **Amit Sharma · Employee**.
      ✅ The app reloads as Amit; the nav now shows only **My Trips** + **Help** (employee view).
- [ ] Open **My Claims** → ✅ Amit sees **only his own** claim(s), not everyone's.
- [ ] Click **+ New Travel Report** → fill it (Purpose, Place, dates, one expense row) → **Submit**.
- [ ] Switch the demo user back to **Raghavendra D · HR Admin**.
- [ ] Go to **HR Dashboard** → ✅ you can see **Amit's new claim** in the list (owner = Amit Sharma).
- [ ] Switch to **Priya Desai · Approver** → ✅ she lands on **Approvals** and can review/approve.

> This proves the whole point: each employee enters their own claims; **HR sees everyone's**.
> (Submitted claims persist in your browser. To wipe demo data, run `TT.api.resetMockData()`
> in the console, or clear site data.)

## Step 5 — My Claims
- [ ] Your list shows claims with **status badges** + totals.
- [ ] Status filter + search work.
- [ ] Click a row → opens **Claim Detail**.

---

## Step 6 — Claim Detail + approval
- [ ] Header, journey table, conveyance, totals, receipts all render.
- [ ] **Approval timeline** on the right shows stages, current one highlighted.
- [ ] (As HR) bottom bar shows **Approve / Return / Reject**.
- [ ] Click **Reject** with no comment → ✅ blocked ("add a reason"); add a comment → works.

---

## Step 7 — Approvals inbox
- [ ] Open **Approvals** in the nav → claims waiting; count badge matches.
- [ ] **Review** → opens a claim → **Approve** advances it a stage.

---

## Step 8 — Reports
- [ ] Open **Reports** → spend-by-department bars, spend-by-month bars, outstanding advances, KPIs.

---

## Step 9 — Help
- [ ] Open **Help** → the 6 rules + field guidance from the original sheet are shown.

---

## Step 10 — Sign out + accessibility
- [ ] Click the **avatar** (top-right) → menu → **Sign out** → back to login.
- [ ] On any form, press **Tab** repeatedly → a visible **focus ring** moves logically.
- [ ] Zoom to 200% (Ctrl +) → nothing breaks.

---

### ✅ Phase A done?
When all boxes pass, tell me **"Phase A done"** and we switch to **Phase B** (live Supabase
+ real login + multi-user). See `TEST-PHASE-B.md`.
