# 13 — Test Plan

How to test **everything** in TripTrail, step by step. Two phases:
- **Phase A — Mock mode:** click through all screens fast, no backend, no login. Best for UI/UX.
- **Phase B — Live mode:** the real Supabase flow with login + multi-user + HR tracking.

Tick the boxes as you go. Note anything odd and send it to me.

---

## Setup (once)

### Run the app
- In VS Code, open `app/index.html` (or any page) → **Open with Live Server** (Go Live).
- It serves at e.g. `http://127.0.0.1:5500/app/...`. Use `http://`, not double-click `file://`.

### Switch modes
Edit `app/assets/js/config.js`:
- **Mock mode:** `USE_MOCK: true`  → no login, sample data.
- **Live mode:** `USE_MOCK: false` → real Supabase (current setting).

---

## PHASE A — Mock mode (UI/UX smoke test)
Set `USE_MOCK: true`, save, reload. You are "Raghavendra D (HR)".

### A1. Landing page  → open `app/landing.html`
- [ ] Hero, features, "How it works" all show; animations play on scroll.
- [ ] "Sign in" button goes to the login page.
- [ ] Resize the window narrow (or phone view) — layout stacks cleanly.

### A2. Navigation & role
- [ ] Open `app/index.html` → lands on **HR Dashboard** (because mock user is HR).
- [ ] Top nav shows: Dashboard, My Trips, Reports, Approvals, Help.
- [ ] Click the avatar (top-right) → menu opens → "Sign out" goes to login.

### A3. HR Dashboard  (`pages/hr-dashboard.html`)
- [ ] 4 stat cards animate (count-up).
- [ ] Pipeline strip shows counts per stage; clicking a stage filters the table.
- [ ] Search box + Department + Status filters narrow the table.
- [ ] "Export to Excel" downloads a CSV that opens in Excel with the right columns.
- [ ] A claim with status "Approved" shows a **Mark Paid** action.

### A4. Claim Editor  (click "+ New Travel Report")
- [ ] Traveller details are pre-filled (name, dept, place of work).
- [ ] Add a journey row → enter Fare/DA/Lodging/Misc → **Row Total updates live**.
- [ ] Add Local Conveyance rows → **Local Conv. column + conveyance total update**.
- [ ] Sticky bottom bar shows Grand Total / Advance / Balance Due, all live.
- [ ] Change Advance → Balance Due updates.
- [ ] Click the receipts box → pick an image/PDF → a thumbnail appears; the ✕ removes it.
- [ ] Click **Submit** with a blank Purpose → it blocks and lists what's missing.
- [ ] Fill required fields → Submit → toast "submitted" → returns to My Claims.

### A5. My Claims  (`pages/my-claims.html`)
- [ ] List shows claims with status badges + totals.
- [ ] Status filter + search work.
- [ ] Click a row → opens Claim Detail.

### A6. Claim Detail  (`pages/claim-detail.html?id=TR-2026-03-882`)
- [ ] Header, journey table, conveyance table, totals, receipts all render.
- [ ] Approval timeline shows stages with the current one highlighted.
- [ ] (As HR) the bottom action bar shows Approve / Return / Reject.
- [ ] Reject with no comment → blocked; with a comment → works.

### A7. Approvals Inbox  (`pages/approvals.html`)
- [ ] Shows claims waiting; count badge matches.
- [ ] "Review" opens the claim; approving advances it to the next stage.

### A8. Reports  (`pages/reports.html`)
- [ ] Spend-by-department bars, spend-by-month bars, outstanding advances, KPIs all render.

### A9. Help  (`pages/help.html`)
- [ ] The 6 rules + field guidance from the original sheet are shown.

### A10. Accessibility & responsive
- [ ] Tab through a form with the keyboard — focus ring is visible, order is logical.
- [ ] Zoom to 200% — nothing breaks.
- [ ] Phone width — tables/cards stack, nav still usable.

---

## PHASE B — Live mode (real Supabase, the real test)
Set `USE_MOCK: false`, save, reload.

### B0. One-time Supabase auth config
In your Supabase project → **Authentication → URL Configuration**:
- [ ] **Site URL** = your Live Server URL, e.g. `http://127.0.0.1:5500`
- [ ] **Redirect URLs** → add `http://127.0.0.1:5500/**` (and later your Netlify URL `https://yoursite.netlify.app/**`).
- [ ] Save.

### B1. First sign-in (you = HR)
- [ ] Open `app/landing.html` → Sign in → enter **your** email → "Check your inbox".
- [ ] Open the email → click the magic link → you land back in the app.
- [ ] You appear as a logged-in user (default role = employee for now).

### B2. Make yourself HR
In Supabase → **SQL Editor**, run:
```sql
update public.users set role='hr_admin', designation='HR', department='HR',
       emp_code='EMP001', place_of_work='Mysuru'
 where email='YOUR_EMAIL';
```
- [ ] Reload the app → you now land on the **HR Dashboard** and see Dashboard/Reports tabs.

### B3. Submit a real claim
- [ ] New Travel Report → fill it → add rows → Submit.
- [ ] In Supabase → **Table Editor → claims** → your row exists with the right `grand_total`
      (computed by the DB trigger — verify the number matches the app).
- [ ] **line_items** and **conveyance** rows exist and link to the claim.

### B4. Approve flow
- [ ] Open the claim → Approve → status advances; an **approvals** row is added (check Table Editor).
- [ ] Mark Paid → enter a voucher ref → `claims.voucher_ref` + `paid_at` are set.

### B5. Multi-user isolation (the important one)
- [ ] In a **different browser / incognito**, sign in with a **second email** (a colleague or a test email).
- [ ] That user lands on **My Claims** (employee) and sees an **empty** list — NOT your claim. ✅ isolation works.
- [ ] Submit a claim as that employee.
- [ ] Back as **HR**, reload the Dashboard → you can see **both** users' claims. ✅ HR sees all.

### B6. Export & (optional) Sheets sync
- [ ] HR Dashboard → Export to Excel → CSV downloads with all claims.
- [ ] (Optional) If the `sheets-sync` function is deployed + `SHEETS_SYNC_URL` set in config:
      approving a claim appends a row to the Google Sheet.

---

## What to send me if something's off
For any failed checkbox, tell me:
1. Which step (e.g. "B5") and what you expected vs what happened.
2. Any red errors in the browser console (F12 → Console tab) — copy the text.
3. A screenshot if it's visual.

I'll fix and we re-run that section.
