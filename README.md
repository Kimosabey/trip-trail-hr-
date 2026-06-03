# TripTrail

Travel & local-conveyance expense reporting tool for **RANGSONS LLP**. Employees submit
travel claims online; HR/approvers track, approve, and mirror approved claims into Google
Sheets. Buildless static web app (HTML + Tailwind CDN + vanilla JS) backed by Supabase.
100% free & open-source stack.

## Run locally
No build step. Serve the `app/` folder with any static server:

```powershell
# from the project root
python -m http.server 5173 --directory app
# then open http://localhost:5173
```

The app runs entirely on **mock data** out of the box (`APP_CONFIG.USE_MOCK = true` in
`app/assets/js/config.js`) — no backend needed to click around.

## Going live (Supabase)
1. Create a free Supabase project; run `supabase/schema.sql` then `supabase/policies.sql`.
2. Put the project URL + **anon public** key in `app/assets/js/config.js` and set
   `USE_MOCK = false`.
3. Deploy `app/` to Netlify or Vercel (auto-deploy from GitHub). See `netlify.toml`.

## Where things are
- `app/` — the deployable web app. See `plans/10-project-structure.md` for the full map.
- `plans/` — analysis, architecture, data model, features, roadmap, UI/UX, Stitch brief.
- `design/stitch/` — Stitch AI visual mockups (reference).
- `supabase/` — database schema, RLS policies, Edge Functions (added in Phase 1/2).

## Status
- [x] Plan + design system + Stitch mockups
- [x] Project scaffold, data layer (mock↔Supabase), shared nav/components
- [x] **My Claims** page
- [ ] Claim Editor, Claim Detail, Approvals, HR Dashboard, Reports
- [ ] Supabase schema + wiring
