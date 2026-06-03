# ✅ TEST — Phase B (Live mode: real Supabase + login + multi-user)

Do this **after** Phase A passes. This proves the core objective: employees enter their own
claims, **HR sees everyone's**.

---

## Step 0 — Switch to live mode
1. In `app/assets/js/config.js` set **`USE_MOCK: false`**, save.
2. (Keys are already filled in: your Supabase URL + publishable key.)

---

## Step 1 — One-time Supabase auth config
In your Supabase project → **Authentication → URL Configuration**:
- [ ] **Site URL** = `http://127.0.0.1:5500`
- [ ] **Redirect URLs** → add `http://127.0.0.1:5500/**`
      (later also add your Netlify URL, e.g. `https://triptrail.netlify.app/**`)
- [ ] Click **Save**.

> Also confirm **Authentication → Providers → Email** is enabled (it is by default).

---

## Step 2 — First sign-in (you)
- [ ] Open `app/landing.html` (Live Server) → **Sign in** → enter **your real email**.
- [ ] ✅ "Check your inbox" appears.
- [ ] Open the email → click the **magic link** → ✅ you return to the app, signed in.
      (You start as a normal employee → you'll land on **My Claims**.)

If the link doesn't return you cleanly, check Step 1 redirect URLs and try again.

---

## Step 3 — Make yourself HR
In Supabase → **SQL Editor** → New query → run (replace the email):
```sql
update public.users
   set role='hr_admin', designation='HR', department='HR', emp_code='EMP001', place_of_work='Mysuru'
 where email='YOUR_EMAIL@example.com';
```
- [ ] Reload the app → ✅ you now land on the **HR Dashboard** with Dashboard/Reports tabs.

---

## Step 4 — Submit a real claim
- [ ] **+ New Travel Report** → fill it → add journey + conveyance rows → **Submit**.
- [ ] In Supabase → **Table Editor → claims** → ✅ your row exists.
- [ ] ✅ `grand_total` in the table **matches** the total the app showed (DB computed it).
- [ ] **line_items** and **conveyance** tables have the child rows.

---

## Step 5 — Approve + Mark Paid
- [ ] Open the claim → **Approve** → status advances; ✅ an **approvals** row is added.
- [ ] Continue to **Mark Paid** → enter a voucher ref → ✅ `claims.voucher_ref` + `paid_at` set.

---

## Step 6 — Multi-user isolation (THE key test)
- [ ] Open an **incognito / different browser** window → `app/landing.html` → Sign in with a
      **second email** (a colleague, or another email you own).
- [ ] Click its magic link → ✅ that user lands on **My Claims** and the list is **empty**
      (they do NOT see your claim). ← isolation works.
- [ ] As that employee, **submit a claim**.
- [ ] Back in your **HR** window → reload the **Dashboard** → ✅ you now see **both** users'
      claims. ← HR sees everyone. 🎯

---

## Step 7 — Export
- [ ] HR Dashboard → **Export to Excel** → ✅ CSV downloads with all claims across users.

---

## Step 8 (optional) — Google Sheets sync
Only if you want approved claims to flow into a Google Sheet now:
- [ ] Deploy the function: `npx supabase functions deploy sheets-sync`
- [ ] Set its secrets (service account + SHEET_ID) per `supabase/functions/sheets-sync/index.ts`.
- [ ] Put the function URL in `config.js` → `SHEETS_SYNC_URL`.
- [ ] Approve a claim → ✅ a new row appears in the Google Sheet.

---

### ✅ Phase B done?
Tell me **"Phase B done"** (or send failures with the step # + console errors). Then we move
to: deploy to Netlify, the Admin→Users screen, and any polish you want.
