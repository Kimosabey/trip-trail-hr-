// TripTrail — Sheets Sync Edge Function (Supabase / Deno).
// Appends an approved claim as a row into the Google Sheet HR already uses, so HR keeps
// their familiar spreadsheet. Uses a Google service account (JWT → access token).
//
// Deploy:  npx supabase functions deploy sheets-sync
// Secrets (set once):
//   npx supabase secrets set GOOGLE_SA_EMAIL="...@...iam.gserviceaccount.com"
//   npx supabase secrets set GOOGLE_SA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
//   npx supabase secrets set SHEET_ID="<google sheet id>"
//   npx supabase secrets set SHEET_TAB="Claims"      // a tab/range to append to
// Share the Google Sheet with the service-account email (Editor).
//
// Call it from the app after an approval, or wire a DB webhook on claims.status='approved'.

import { create, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const SA_EMAIL = Deno.env.get("GOOGLE_SA_EMAIL")!;
const SA_KEY = (Deno.env.get("GOOGLE_SA_PRIVATE_KEY") ?? "").replace(/\\n/g, "\n");
const SHEET_ID = Deno.env.get("SHEET_ID")!;
const SHEET_TAB = Deno.env.get("SHEET_TAB") ?? "Claims";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function importKey(pem: string): Promise<CryptoKey> {
  const b64 = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const der = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    "pkcs8", der.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"],
  );
}

async function getAccessToken(): Promise<string> {
  const key = await importKey(SA_KEY);
  const jwt = await create({ alg: "RS256", typ: "JWT" }, {
    iss: SA_EMAIL,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: getNumericDate(3600),
    iat: getNumericDate(0),
  }, key);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const json = await res.json();
  if (!json.access_token) throw new Error("token: " + JSON.stringify(json));
  return json.access_token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const claim = await req.json(); // { id, employee_name, department, purpose, place_of_visit, trip_from, trip_to, grand_total, advance_received, balance_due, status, voucher_ref }
    const row = [[
      claim.id, claim.employee_name ?? "", claim.department ?? "", claim.purpose ?? "",
      claim.place_of_visit ?? "", claim.trip_from ?? "", claim.trip_to ?? "",
      claim.grand_total ?? 0, claim.advance_received ?? 0, claim.balance_due ?? 0,
      claim.status ?? "", claim.voucher_ref ?? "", new Date().toISOString(),
    ]];

    const token = await getAccessToken();
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(SHEET_TAB)}:append?valueInputOption=USER_ENTERED`;
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values: row }),
    });
    if (!res.ok) throw new Error("sheets append failed: " + (await res.text()));

    return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
