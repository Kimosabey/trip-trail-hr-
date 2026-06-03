# ✅ Live role-by-role test (single email, flip roles)

You're signed in live. We'll test all 5 roles by changing YOUR role in SQL between rounds.
Replace `ME` with your real email in each SQL snippet. After each SQL, **reload the app**.

> Keep two tabs open: the **app** and Supabase **SQL Editor**.

---

## Round 1 — EMPLOYEE (create & submit)
```sql
update public.users set role='employee' where email='ME';
```
Reload the app.
- [ ] You land on **My Claims**; nav shows only **My Trips** + **Help** (no Dashboard).
- [ ] **+ New Travel Report** → header pre-filled.
- [ ] Add a journey row (Fare 430, DA 800, Lodging 1214) → Row Total updates.
- [ ] Add a conveyance row (Auto, 120, Bill on) → conveyance total + Local Conv. update.
- [ ] Add a receipt file → thumbnail shows.
- [ ] **Submit** → toast "submitted", back on My Claims, status = **Submitted**.
- [ ] In Supabase → Table Editor → **claims**: your row exists, `grand_total` matches the app.

➡️ Tell me "Round 1 done".

---

## Round 2 — HOD (first approval)
```sql
update public.users set role='hod' where email='ME';
```
Reload.
- [ ] Nav now shows **Approvals**; you land there.
- [ ] Your submitted claim is in the queue → **Review**.
- [ ] Timeline shows current stage = HOD; you see all rows/receipts/totals (read-only).
- [ ] Try **Reject** with no comment → blocked. Add a comment is required.
- [ ] Click **HOD Approve** → status → **HOD Approved**.

➡️ "Round 2 done".

---

## Round 3 — CHECKER
```sql
update public.users set role='checker' where email='ME';
```
Reload → Approvals.
- [ ] The HOD-approved claim appears in your queue → Review → **Mark Checked**.
- [ ] Status → **Checked**.

➡️ "Round 3 done".

---

## Round 4 — APPROVER
```sql
update public.users set role='approver' where email='ME';
```
Reload → Approvals.
- [ ] The checked claim appears → Review → **Approve**.
- [ ] Status → **Approved**.

➡️ "Round 4 done".

---

## Round 5 — HR ADMIN (track, pay, export)
```sql
update public.users set role='hr_admin', designation='HR', department='HR',
       emp_code='EMP001', place_of_work='Mysuru' where email='ME';
```
Reload → you land on **HR Dashboard**.
- [ ] Stat cards count up; pipeline strip shows counts; clicking a stage filters.
- [ ] Your claim shows status **Approved** with a **Mark Paid** action.
- [ ] **Mark Paid** → enter a voucher ref (e.g. `V-1001`) → status → **Paid**.
      In Table Editor → claims: `voucher_ref` + `paid_at` are set.
- [ ] **Export to Excel** → CSV downloads with your claim.
- [ ] Open **Reports** → charts + KPIs render.
- [ ] Open the claim detail → **Approval timeline** shows the full chain you walked:
      Submitted → HOD → Checked → Approved → Paid, each with a name + time.

➡️ "Round 5 done".

---

## Round 6 — Audit trail check
- [ ] In Supabase → Table Editor → **approvals**: one row per stage you actioned,
      with `stage`, `action`, `actor`, `acted_at`.

---

### After all rounds
Leave yourself as **hr_admin** (that's your real role). Tell me "all roles done" or send any
failures: which Round/step + console error (F12). Then we deploy to Netlify + (optionally)
build the Admin→Users screen so real approvers can be added with clicks.
