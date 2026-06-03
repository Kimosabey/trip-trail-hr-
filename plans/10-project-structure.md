# 10 — Project Folder Structure (modular, buildless)

TripTrail is a **buildless static web app**: plain HTML pages + Tailwind (CDN) + small
vanilla-JS modules, talking to **Supabase**. No bundler, no `npm run build` — Netlify/Vercel
just publish the `app/` folder. This keeps it "HTML way" while staying modular and clean.

## Tree
```
travel-app/
├─ app/                         ← DEPLOYABLE web app (Netlify/Vercel publish dir = app)
│  ├─ index.html                ← entry; routes to login or my-claims
│  ├─ pages/                    ← one HTML file per screen (thin; logic lives in js/pages)
│  │  ├─ login.html
│  │  ├─ my-claims.html
│  │  ├─ claim-editor.html
│  │  ├─ claim-detail.html
│  │  ├─ approvals.html
│  │  ├─ hr-dashboard.html
│  │  └─ reports.html
│  └─ assets/
│     ├─ css/
│     │  ├─ tokens.css          ← design tokens as CSS variables (colors/space/shadow)
│     │  └─ app.css             ← shared component styles on top of Tailwind
│     ├─ js/
│     │  ├─ tailwind-init.js    ← shared Tailwind config (colors/fonts) for the CDN
│     │  ├─ config.js           ← APP_CONFIG: Supabase URL + anon key, USE_MOCK flag
│     │  ├─ lib/
│     │  │  ├─ supabaseClient.js← initialises supabase-js (CDN)
│     │  │  ├─ api.js           ← DATA LAYER: claims/conveyance/receipts/approvals CRUD
│     │  │  ├─ mockData.js      ← sample data so the app runs with no backend
│     │  │  ├─ auth.js          ← session + role helpers (employee/hod/.../hr_admin)
│     │  │  └─ format.js        ← ₹ money, DD MMM YYYY dates, totals math
│     │  ├─ components/         ← reusable UI injected by JS (no framework)
│     │  │  ├─ nav.js           ← shared top navigation bar
│     │  │  ├─ statusBadge.js   ← status pill (color + text + icon)
│     │  │  ├─ toast.js         ← toast notifications (aria-live)
│     │  │  └─ totalsBar.js     ← sticky Grand/Advance/Balance bar
│     │  └─ pages/              ← per-page controllers (one file per screen)
│     │     ├─ my-claims.js
│     │     ├─ claim-editor.js
│     │     ├─ claim-detail.js
│     │     ├─ approvals.js
│     │     ├─ hr-dashboard.js
│     │     └─ reports.js
│     └─ img/
│        └─ logo.svg
│
├─ supabase/                    ← BACKEND definition (version-controlled, not deployed as static)
│  ├─ schema.sql               ← tables + indexes + triggers (from 03-data-model.md)
│  ├─ policies.sql             ← Row-Level Security policies
│  ├─ seed.sql                 ← optional demo data
│  └─ functions/
│     └─ sheets-sync/          ← Edge Function: append approved claim to Google Sheet
│        └─ index.ts
│
├─ design/stitch/...           ← Stitch mockups (visual reference — keep)
├─ plans/...                   ← these planning docs
├─ netlify.toml                ← publish = app (or vercel.json for Vercel)
├─ .gitignore
└─ README.md
```

## Modular principles
1. **Data layer is the only thing that knows about the backend.** Pages call
   `api.listClaims()`, `api.saveClaim()`, etc. Today `api.js` reads `mockData.js`; flipping
   `USE_MOCK=false` in `config.js` makes the same functions hit Supabase. **No page code
   changes** when we go live.
2. **Components are framework-free.** `nav.js`, `statusBadge.js`, etc. export functions that
   return HTML strings / DOM and are reused across pages → no copy-paste.
3. **Tokens in one place** (`tokens.css` + `tailwind-init.js`) → rebrand or theme-swap by
   editing one file. Matches the Stitch `DESIGN.md` exactly.
4. **One HTML page per screen, thin.** Markup adapted from the Stitch `code.html`; behavior
   lives in `js/pages/<screen>.js`. Easy to find things.
5. **Secrets never committed.** `config.js` holds only the **anon public** key (safe).
   Service keys live in Supabase/Netlify env vars; `.gitignore` covers local secrets.

## Deploy
- Netlify: `netlify.toml` → `[build] publish = "app"` (no build command).
- Vercel: `vercel.json` → static, output `app`.
- Push to GitHub → auto-deploy. Free tier.
```
