# 07 — Decisions, Open Questions & Cost (all-free guarantee)

## 💸 Everything is FREE — no paid services anywhere
You asked for **all free, no paid, for now**. Confirmed. Every piece of the stack is
open source and used on its free tier:

| Thing | Service | Free tier | Open source? | Paid needed? |
|-------|---------|-----------|--------------|--------------|
| Database | Supabase (PostgreSQL) | 500 MB DB | ✅ Yes | ❌ No |
| Auth / login | Supabase Auth (GoTrue) | 50,000 users/mo | ✅ Yes | ❌ No |
| Receipt files | Supabase Storage | 1 GB | ✅ Yes | ❌ No |
| API | Supabase auto REST/Realtime | included | ✅ Yes | ❌ No |
| Sheets sync | Supabase Edge Functions / Google Apps Script | included / free | ✅ / free | ❌ No |
| Frontend | HTML + CSS + vanilla JS (+ optional Alpine.js, Pico.css, Inter font) | n/a | ✅ MIT/OFL | ❌ No |
| Hosting | Netlify **or** Vercel (auto-deploy from GitHub) | generous free | free | ❌ No |
| Tooling | VS Code, Git | free | ✅ | ❌ No |

**Cost today: ₹0 / month.** The only thing that ever *could* cost money later is a custom
domain name (optional — the free `*.pages.dev` / `*.netlify.app` link works fine), or
upgrading if you outgrow the free limits (thousands of claims + GBs of receipts), which is
far away. Nothing requires a credit card to start.

> Supabase is also fully self-hostable later (open source) — so even at scale you can run
> it on your own server for free instead of paying their cloud. No lock-in.

---

## ✅ Decided (baked into the plan)
- **Name:** TripTrail ✅
- **Hosting:** Netlify or Vercel ✅ · **Repo:** GitHub (SSH keys at `D:\Harshan\kimo-ssh-keys`) ✅
- **Stack:** Supabase + plain HTML/JS, free hosting. (See `02-architecture.md`.)
- **Theme:** modern light theme, no dark mode for now. (See `08-ui-ux-design.md`.)
- **Accessibility:** WCAG 2.1 AA target.
- **Sheets:** HR keeps Google Sheets via auto-sync of approved claims.
- **Receipts:** yes, uploadable.

## ❓ Open questions for you (answer when ready — none block starting Phase 0)
1. **Name** — keep "TripTrail" or pick from TripTrail / ClaimTrail / RangoTrip / your own?
2. **Login** — company-email magic link (no passwords) OK, or do you want Google sign-in,
   or a simple shared link for now?
3. **Approval chain** — full HOD → Checker → Approver → Paid, or simpler (just HR
   approves) for v1?
4. **Who are the approvers?** — names/emails of HOD, checker, approver so we set roles.
5. **Eligibility limits** — do DA/lodging caps per grade exist? If yes, share the table
   (can be Phase 3).
6. **Which Google Sheet** should approved claims write into — this same workbook, or a new
   master tracking sheet?
7. **Logo / brand color** — use the blue in the design system, or match RANGSONS branding?

## Next step
Say the word and I'll build the **Phase 0 setup + a clickable Claim Editor prototype**
(static HTML with the real design system and live auto-totals) so you can see and feel it
before we connect the database.
