/* TripTrail — runtime configuration.
   Only the PUBLIC (publishable/anon) Supabase key belongs here — safe to ship to the browser.
   Service/secret keys live in Supabase/Netlify env vars, never in this file. */
window.APP_CONFIG = {
  // false = live on Supabase. true = run fully on mock data, no backend.
  // NOTE: set to true for Phase A UI testing; set back to false for Phase B (live).
  USE_MOCK: false,

  SUPABASE_URL: 'https://ldggpxqvxtzwclplpbro.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_p2ApN0-eh4FsChDxbWc1zQ_AxeYsBfW',  // publishable (public) key

  APP_NAME: 'TripTrail',
  COMPANY: 'RANGSONS LLP',
  CURRENCY: '₹',

  // Optional: paste the deployed sheets-sync Edge Function URL to auto-append
  // approved claims into HR's Google Sheet. Leave '' to disable.
  SHEETS_SYNC_URL: '',
};
