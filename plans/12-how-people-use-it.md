# 12 — How everyone uses TripTrail (multi-user flow)

**Yes — it's one app, one link, the same UI for everyone.** What each person *sees and can
do* adapts to their **role**. That's how employees enter their claims and HR sees them all.

## One link for the whole company
You deploy TripTrail once (Netlify/Vercel) → everyone opens the **same URL**. No installs.

## How a person gets in
1. They open the link → **landing page** → click **Sign in**.
2. They enter their **company email** → get a **magic link** by email → click it → they're in.
3. On first sign-in, Supabase **auto-creates their profile** (role = `employee` by default).
4. They complete their profile (name, emp code, dept) once.

## Same UI, different view (role-based)
| Role | Lands on | Can see | Can do |
|------|----------|---------|--------|
| **Employee** | My Claims | **only their own** claims | create/submit claims, attach receipts, track their status |
| **HOD / Checker / Approver** | Approvals | all claims (read) + their queue | approve / return / reject at their stage |
| **HR Admin** | **Dashboard** | **everyone's** claims, all departments | track everything, filter, export, Mark Paid, manage roles |

The screens are identical code — the nav, the dashboard access, and the data each person
gets are gated by role + **Row-Level Security** in the database. An employee literally
*cannot* fetch someone else's claim; HR fetches them all. (See `supabase/policies.sql`.)

## So the flow you asked about
```
Employee A  ─┐
Employee B  ─┤  each signs in → fills their Travel Report + Local Conveyance → Submit
Employee C  ─┘                                  │
                                                ▼
                                   stored in the shared database
                                                │
                                                ▼
            HR opens the Dashboard ──► sees A, B, C and everyone else in one place,
                                       tracks status, approves, marks paid, exports/sync
```

## Onboarding people (HR's setup)
- **Add an employee:** just share the link — they self-register by signing in. Nothing to pre-create.
- **Make someone an approver / HR:** set their role. Either:
  - Quick (now): run one line in Supabase SQL Editor —
    `update public.users set role='hr_admin' where email='person@rangsons.com';`
    (roles: `employee`, `hod`, `checker`, `approver`, `hr_admin`)
  - Later (Phase 2): a small **Admin → Users** screen so HR sets roles with clicks, no SQL.

## Security recap
- Everyone shares one app, but each only touches what their role allows.
- Employees: own claims only. HR: all claims. Enforced in the database, not just the UI.
