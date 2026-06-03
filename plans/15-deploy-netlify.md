# 15 — Deploy to Netlify

TripTrail is a buildless static site → Netlify just serves the `app/` folder. No build step.
Free tier, HTTPS, global CDN, auto-deploy on every push.

## Pre-flight (already true)
- `netlify.toml` at the repo root sets `publish = "app"` (no build command).
- `.gitignore` excludes secrets (`supabase/credentials.local.md`, `.env`).
- `config.js` only holds the **public** Supabase URL + publishable key → safe to deploy.
- Auth uses email+password → no email/redirect dependency for normal login.

---

## Path A — GitHub + Netlify (recommended: auto-deploy on push)

### 1. Put the code on GitHub
From the project root (`d:\Harshan\travel-app`):
```powershell
git init
git add .
git commit -m "TripTrail: initial deploy"
git branch -M main
# create an EMPTY repo on github.com first (no README), then:
git remote add origin git@github.com:<your-username>/triptrail.git
git push -u origin main
```
> SSH keys are at `D:\Harshan\kimo-ssh-keys`. If `git push` can't find the key, run:
> `$env:GIT_SSH_COMMAND='ssh -i D:/Harshan/kimo-ssh-keys/<keyfile>'` before pushing,
> or use the HTTPS repo URL and sign in with a GitHub token.

### 2. Connect Netlify
1. [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**.
2. Choose **GitHub** → pick the `triptrail` repo.
3. Build settings: **Build command = (blank)**, **Publish directory = `app`** (netlify.toml sets this; confirm it).
4. **Deploy site**. You get a URL like `https://triptrail-xyz.netlify.app`.

### 3. (optional) Rename the site
Site settings → **Change site name** → e.g. `triptrail` → `https://triptrail.netlify.app`.

---

## Path B — Drag & drop (fastest, no git)
1. [app.netlify.com](https://app.netlify.com) → **Add new site → Deploy manually**.
2. Drag the **`app`** folder onto the drop zone.
3. Done — you get a live URL. (Re-drag to update; no auto-deploy.)

> Path B is great for a quick first live URL. Switch to Path A later for auto-deploys.

---

## 4. Point Supabase at the live URL (required after deploy)
Supabase → **Authentication → URL Configuration**:
- **Site URL** = `https://YOURSITE.netlify.app`
- **Redirect URLs** → add `https://YOURSITE.netlify.app/**`
  (keep the localhost one too for local testing)
- Save.

This matters for magic-link sign-in. (Password sign-in works regardless.)

---

## 5. Smoke test on the live URL
- [ ] Open `https://YOURSITE.netlify.app` → landing page loads.
- [ ] Sign in (raghavendra / 123456) → HR Dashboard.
- [ ] Create a claim, approve, mark paid — all persist (same Supabase DB).
- [ ] Open on your **phone** → works (accessible anywhere ✅).

---

## Notes / later hardening (not blockers)
- **Tailwind CDN warning** in console is harmless for an internal tool. To remove it later,
  precompile CSS with the Tailwind CLI and drop the CDN `<script>` — optional.
- **Custom domain** (e.g. `triptrail.rangsons.com`) can be added in Netlify free — optional.
- **Sheets sync**: deploy the Edge Function + set `SHEETS_SYNC_URL` in config when you want it.
- Every `git push` (Path A) redeploys automatically.
