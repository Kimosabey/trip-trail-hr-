# Going live on Supabase (free tier)

Do this when you're ready to switch off mock data. ~15 minutes, no credit card.

## 1. Create the project
1. Sign up at [supabase.com](https://supabase.com) → **New project** (free tier).
2. Pick a region close to India (e.g. Singapore). Save the DB password somewhere safe.

## 2. Create the database
In the dashboard → **SQL Editor**, run these files in order (paste & Run):
1. `schema.sql`  — tables, totals triggers, auto-profile on signup
2. `policies.sql` — Row-Level Security (HR sees all, employees see own)
3. `seed.sql`     — optional demo data (edit UUIDs first)

## 3. Phase-3 features — run `migrate-phase3.sql`
Run **`migrate-phase3.sql`** once in the SQL Editor (safe to re-run). It sets up everything
the newer features need:
- **Receipts:** private `receipts` Storage bucket + object policies + corrected receipts-table
  RLS (evidence can be attached after submit). Files live at `claims/<claim_id>/<filename>`,
  shown via short-lived signed URLs.
- **Users:** `guard_user_role` trigger (a non-HR user can't escalate their own role).
- **Eligibility:** `grade_limits` table + seed (E1/E2/M1/M2) for DA/Lodging caps.
- **Notifications:** `notifications` table + the `claims_notify` fan-out trigger.
- **3-day reminder (optional):** `remind_late_submissions()` — schedule via pg_cron (see the
  commented line at the end of the file).

## Avoiding email rate-limit errors (`429 email rate limit exceeded`)
These come ONLY from emails Supabase sends (magic link, signup confirmation, password reset);
the free built-in sender is capped at a few/hour. To avoid:
1. **Use password login + Auto-Confirm users** (default in this app) → no emails on normal sign-in.
2. **Authentication → Providers → Email → turn OFF "Confirm email"** → adding staff sends no email.
3. For real magic-link / password-reset at scale: **Authentication → SMTP Settings** → add a free
   provider (Resend 3k/mo, Brevo 300/day, SendGrid, Mailgun). Replaces the tiny shared sender.

## 4. Auth
- **Authentication → Providers → Email** is on by default (magic link). Done.
- To make someone HR: after they sign in once, run in SQL Editor:
  ```sql
  update public.users set role = 'hr_admin' where email = 'hr@rangsons.com';
  ```
  Roles: `employee`, `hod`, `checker`, `approver`, `hr_admin`.

## 5. Point the app at Supabase
Get the keys from **Settings → API**. Edit `app/assets/js/config.js`:
```js
USE_MOCK: false,
SUPABASE_URL: 'https://YOURPROJECT.supabase.co',
SUPABASE_ANON_KEY: 'eyJhbGc...the anon public key...',
```
> Only the **anon public** key goes here — never the service_role key.

## 6. Load the Supabase library on the pages
When `USE_MOCK=false`, each page needs the supabase-js bundle + the adapter, added
just before `config.js`:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="../assets/js/lib/supabaseClient.js"></script>
```
(They're harmless to add now; the client only connects when actually used.)

## 7. Deploy
Push to GitHub → connect the repo in **Netlify** or **Vercel** → publish dir = `app`
(see `netlify.toml`). Every push auto-deploys. Free.

## What's enforced for you
- **HR (`hr_admin`) can read every claim** across all employees — the core objective.
- Employees can only see/edit **their own** claims, and only while `draft`/`returned`.
- Totals (row, grand, balance, conveyance) are computed by DB triggers — no bad math.
