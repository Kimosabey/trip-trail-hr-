# 02 — Architecture, Storage & Hosting

**Product name: _TripTrail_** ✅ chosen
> Trip + trail — the trail/track of every business trip and its expenses. Easy to say,
> easy to brand.

**Hosting decision: Netlify _or_ Vercel** ✅ chosen (both free tier, either works).
**Code repo: GitHub** ✅ (account exists; SSH keys at `D:\Harshan\kimo-ssh-keys`).

Hard requirements you gave:
- ✅ **Access anywhere** — open in any browser, office / home / phone.
- ✅ **HTML way** — plain HTML + JavaScript front end, no heavy framework.
- ✅ **Open source** tech only.
- ✅ **Free tier** storage / hosting — no bill.
- ✅ HR can **track** and data can **land in Google Sheets**.
- ✅ Receipts can be **uploaded**.

---

## TL;DR — Recommended stack (open source + free)

| Layer | Choice | Why | Cost |
|-------|--------|-----|------|
| **Frontend** | Plain **HTML + CSS + vanilla JS** (optionally [Alpine.js](https://alpinejs.dev), MIT) | "HTML way" as you asked; no build step; loads anywhere | Free |
| **Frontend hosting** | **Netlify** *or* **Vercel** (chosen) | Static hosting, global CDN, HTTPS, auto-deploy from GitHub | Free |
| **Database + API** | **Supabase** (PostgreSQL + auto REST/realtime API) | Open source, real relational DB, **no backend code to write** — the HTML talks to it directly via a client library | Free tier: 500 MB DB |
| **Auth (login + roles)** | **Supabase Auth** (GoTrue, open source) | Company-email login, magic links or Google sign-in; HR/approver roles via a flag | Free: 50k monthly users |
| **Receipt file storage** | **Supabase Storage** (S3-compatible, open source) | Photos/PDFs of bills attached to each claim | Free: 1 GB |
| **HR keeps sheets** | **Supabase Edge Function** → Google Sheets API (or a free Apps Script) | On each approved claim, append a row to the Google Sheet HR already uses | Free |

**Everything above is open source and free-tier.** Supabase is the keystone: it gives
us database + auth + file storage + an auto-generated API in one free project, and it's
fully open source (you can even self-host it later on your own server with zero code
changes). That means the front end is *just HTML* — no separate backend server to build,
pay for, or maintain.

---

## Why Supabase over MongoDB (you asked about Mongo)

Both are valid and both have free tiers. Here's the honest comparison **for this app**:

| | **Supabase (Postgres)** ✅ recommended | **MongoDB Atlas (M0 free)** |
|---|---|---|
| Open source | ✅ Fully (DB, auth, storage) | Core server is source-available (SSPL); Atlas cloud is proprietary |
| Free tier | 500 MB DB, 1 GB files, 50k auth users | 512 MB storage, shared cluster |
| Backend code needed | **None** — HTML calls it directly, security via Row-Level Security | **Yes** — Mongo has no safe browser-direct access; you must build & host a Node/Express API |
| Auth built in | ✅ Yes | ❌ No — bring your own |
| File storage built in | ✅ Yes (receipts) | ❌ No — add S3/Cloudinary separately |
| Data shape | Relational — perfect for "a claim has many line items has many receipts" + reporting/totals | Document — flexible, but joins/reporting are more work |
| HR-style tabular export | Trivial (SQL → CSV → Sheets) | Doable but more glue code |

**Verdict:** Our data is naturally relational (claim → line items → local-conveyance rows
→ receipts, plus an approval chain and totals). Postgres fits it cleanly, and Supabase
removes the entire backend server. Mongo would force us to build and host an API server
just to keep the database safe from the browser — more code, more to break, no upside here.

> If you specifically want Mongo later (e.g. existing team expertise), the same front end
> can point at a small Node API + MongoDB Atlas instead. See "Alternative B" below. But for
> "best + open source + free + HTML way", **Supabase wins.**

---

## How it works (the "how we do it")

```
                ┌─────────────────────────────────────────────┐
                │        Browser (any device, anywhere)         │
                │   Plain HTML + JS  →  "TripTrail" web app        │
                └───────────────┬──────────────┬───────────────┘
                                │              │
              login / read-write│              │upload receipt photo
                                ▼              ▼
                ┌───────────────────────────────────────────────┐
                │                 SUPABASE (free)                 │
                │  Auth (company email)                           │
                │  PostgreSQL  ── claims, line_items, conveyance, │
                │                 receipts, approvals, users      │
                │  Storage     ── receipt images / PDFs           │
                │  Row-Level Security: employees see only their   │
                │     own claims; HR/approvers see all            │
                └───────────────┬─────────────────────────────────┘
                                │ on "Approved"
                                ▼
                ┌───────────────────────────────────────────────┐
                │  Edge Function → Google Sheets API              │
                │  Appends the approved claim as a row, so HR     │
                │  keeps the spreadsheet they already trust       │
                └───────────────────────────────────────────────┘
```

1. Employee opens the link, logs in with company email.
2. Fills the **Travel Report** form + **Local Conveyance** rows; totals auto-calculate.
3. Attaches receipt photos → stored in Supabase Storage.
4. Hits Submit → a `claim` row + child rows are written to Postgres (status = *Submitted*).
5. HR/approvers open their dashboard (same app, more permissions), see all claims, filter
   by person/date/status, review receipts, and move the claim through the chain
   (HOD → Checked → Approved → Paid).
6. On **Approved**, an Edge Function appends the claim to the **Google Sheet** so HR's
   existing sheet stays current. (HR can also "Export to Excel" any time.)

Security is enforced by Postgres **Row-Level Security** policies, so even though the HTML
talks to the database directly, an employee can only ever read/write their own claims.

---

## Alternative A — Firebase (also open-ish, free)
Firestore + Firebase Auth + Storage + Hosting, all free tier. Very capable and also
needs no backend. Downsides vs Supabase: Firestore is a proprietary Google document DB
(not open source, harder to leave), and tabular reporting/export for HR is clunkier.
Pick this only if you're already in the Google ecosystem and want Hosting+everything from one vendor.

## Alternative B — MongoDB + Node API (if you insist on Mongo)
`HTML front end → Node/Express API (hosted free on Render or Railway) → MongoDB Atlas M0`.
Fully open-source-able, free tier exists, but it's **more moving parts**: you build and
maintain the API, handle auth yourself, and add a separate file store for receipts.

## Alternative C — Google Sheets + Apps Script only (simplest, HR-native)
No real database — the HTML form posts straight into Google Sheets via a free Apps Script
web app. **Cheapest and most HR-familiar**, accessible anywhere, zero hosting. Limits:
weak access control, no proper auth/roles, gets slow/fragile past a few thousand rows, no
clean receipt handling. Good as a **Phase-0 prototype**; not the long-term tool.

---

## Recommendation
Build **TripTrail on Supabase** (open source, free tier, no backend) with a **plain HTML/JS**
front end hosted free on **Cloudflare Pages**, and **mirror approved claims into Google
Sheets** so HR keeps their spreadsheet. This satisfies every requirement you listed.
