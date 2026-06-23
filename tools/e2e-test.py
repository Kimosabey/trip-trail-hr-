#!/usr/bin/env python3
"""
TripTrail end-to-end API test (run on a machine with internet).

    python tools/e2e-test.py

Tests the LIVE Supabase API exactly as the app uses it:
  1. Auth: password sign-in for HR + employee
  2. RLS: HR sees ALL claims; employee sees only own
  3. user-join select (employee_name/department) works (no 500)
  4. Write path: employee inserts claim + line item -> trigger computes grand_total -> cleanup
  5. Isolation: employee cannot modify HR's claim

Prereqs: run supabase/fix-recursion.sql + seed.sql first, and the two test accounts exist
(passwords '123456'): raghavendra.d@lingotran.com (hr_admin), harshan.aiyappa@gmail.com (employee).
"""
import json, urllib.request, urllib.error
from collections import Counter

URL = "https://ldggpxqvxtzwclplpbro.supabase.co"
KEY = "sb_publishable_p2ApN0-eh4FsChDxbWc1zQ_AxeYsBfW"
HR = ("raghavendra.d@lingotran.com", "123456")
EMP = ("harshan.aiyappa@gmail.com", "123456")

passed = []; failed = []
def check(name, ok, detail=""):
    (passed if ok else failed).append(name)
    print(("  PASS " if ok else "  FAIL ") + name + (("  -> " + str(detail)) if detail else ""))

def req(method, path, token=None, body=None, prefer=None):
    h = {"apikey": KEY, "Content-Type": "application/json"}
    if token: h["Authorization"] = "Bearer " + token
    if prefer: h["Prefer"] = prefer
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(URL + path, data=data, headers=h, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            t = resp.read().decode(); return resp.status, (json.loads(t) if t else None)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()[:200]

def signin(email, pw):
    s, b = req("POST", "/auth/v1/token?grant_type=password", body={"email": email, "password": pw})
    return (b.get("access_token"), b["user"]["id"]) if s == 200 and isinstance(b, dict) else (None, "%s %s" % (s, b))

print("\n1) AUTH")
hr_tok, hr_id = signin(*HR);   check("HR password sign-in", bool(hr_tok), "" if hr_tok else hr_id)
emp_tok, emp_id = signin(*EMP); check("Employee password sign-in", bool(emp_tok), "" if emp_tok else emp_id)
if not (hr_tok and emp_tok):
    print("\nCannot continue — fix sign-in first (accounts/passwords)."); raise SystemExit(1)

print("\n2) RLS READ + user-join")
s, hr_claims = req("GET", "/rest/v1/claims?select=id,status,grand_total,user:users(full_name,department)&order=created_at.desc", token=hr_tok)
check("HR can read claims (no 500/RLS recursion)", s == 200, s if s != 200 else "")
check("user-join returns employee name", isinstance(hr_claims, list) and (not hr_claims or hr_claims[0].get("user") is not None))
s, emp_claims = req("GET", "/rest/v1/claims?select=id,user_id", token=emp_tok)
hr_n = len(hr_claims) if isinstance(hr_claims, list) else -1
emp_n = len(emp_claims) if isinstance(emp_claims, list) else -1
print("     HR sees %d claims | employee sees %d" % (hr_n, emp_n))
check("HR sees >= employee (HR sees everyone)", hr_n >= emp_n and hr_n >= 0)
check("employee rows are all their own", isinstance(emp_claims, list) and all(c["user_id"] == emp_id for c in emp_claims))
if isinstance(hr_claims, list) and hr_claims:
    print("     status spread:", dict(Counter(c["status"] for c in hr_claims)))

print("\n3) WRITE PATH (employee insert -> trigger total -> cleanup)")
cid = "E2E-TEST-001"
req("DELETE", "/rest/v1/claims?id=eq." + cid, token=emp_tok)
s, _ = req("POST", "/rest/v1/claims", token=emp_tok, prefer="return=representation",
           body={"id": cid, "user_id": emp_id, "purpose": "E2E", "place_of_visit": "Test",
                 "trip_from": "2026-04-01", "trip_to": "2026-04-02", "status": "draft"})
check("employee insert claim", s in (200, 201), s)
s, _ = req("POST", "/rest/v1/line_items", token=emp_tok, prefer="return=representation",
           body={"claim_id": cid, "item_date": "2026-04-01", "journey_particulars": "A-B",
                 "mode_of_transport": "Bus", "fare": 500, "daily_allowance": 800})
check("employee insert line_item", s in (200, 201), s)
s, b = req("GET", "/rest/v1/claims?id=eq." + cid + "&select=grand_total", token=emp_tok)
gt = (b[0]["grand_total"] if isinstance(b, list) and b else None)
check("trigger computed grand_total = 1300", str(gt) in ("1300", "1300.00"), gt)
s, _ = req("DELETE", "/rest/v1/claims?id=eq." + cid, token=emp_tok)
check("cleanup delete", s in (200, 204), s)

print("\n4) ISOLATION (employee must NOT change HR's claim)")
hr_only = next((c["id"] for c in (hr_claims or []) if c["id"] not in [x["id"] for x in (emp_claims or [])]), None)
if hr_only:
    s, b = req("PATCH", "/rest/v1/claims?id=eq." + hr_only, token=emp_tok, prefer="return=representation", body={"status": "approved"})
    rows = len(b) if isinstance(b, list) else b
    check("employee PATCH of HR claim changes 0 rows", s in (200, 204) and (rows == 0 or b == []), "status=%s rows=%s" % (s, rows))
else:
    print("     (no HR-only claim to test; seed data recommended)")

print("\n================  %d passed, %d failed  ================" % (len(passed), len(failed)))
if failed: print("FAILED:", ", ".join(failed)); raise SystemExit(1)
print("All end-to-end API checks passed.")
