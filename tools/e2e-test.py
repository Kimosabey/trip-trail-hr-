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
gt_ok = gt is not None and abs(float(gt) - 1300) < 0.001   # compare numerically (API returns 1300.0)
check("trigger computed grand_total = 1300", gt_ok, gt)
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

skipped = []
def missing(status, body):
    """True if a table/relation isn't there yet (migrate-phase3.sql not run)."""
    return status == 404 or (isinstance(body, str) and ("does not exist" in body or "PGRST205" in body or "Could not find the table" in body))

print("\n5) PHASE-3 TABLES (need migrate-phase3.sql)")
s, gl = req("GET", "/rest/v1/grade_limits?select=grade,max_da,max_lodging&order=grade", token=hr_tok)
if missing(s, gl): skipped.append("grade_limits"); print("  SKIP grade_limits — run migrate-phase3.sql")
else: check("grade_limits readable + seeded", s == 200 and isinstance(gl, list) and len(gl) >= 1, s if s != 200 else len(gl))
s, nf = req("GET", "/rest/v1/notifications?select=id&limit=1", token=hr_tok)
notif_ok = not missing(s, nf)
if not notif_ok: skipped.append("notifications"); print("  SKIP notifications — run migrate-phase3.sql")
else: check("notifications table readable (own rows)", s == 200, s)

print("\n6) ROLE-ESCALATION GUARD (employee cannot make themselves HR)")
s, b = req("PATCH", "/rest/v1/users?id=eq." + emp_id, token=emp_tok, prefer="return=representation", body={"role": "hr_admin"})
new_role = (b[0]["role"] if isinstance(b, list) and b else None)
check("employee self role-change blocked (stays employee)", new_role == "employee", "role now=%s (status %s)" % (new_role, s))

print("\n7) RECEIPTS RLS (table-level; storage file tested in the browser)")
own_claim = emp_claims[0]["id"] if isinstance(emp_claims, list) and emp_claims else None
s0, _ = req("GET", "/rest/v1/receipts?select=id&limit=1", token=emp_tok)
if missing(s0, _): skipped.append("receipts-rls"); print("  SKIP receipts — run migrate-phase3.sql")
elif own_claim:
    s, b = req("POST", "/rest/v1/receipts", token=emp_tok, prefer="return=representation",
               body={"claim_id": own_claim, "name": "e2e.jpg", "storage_path": "claims/%s/e2e.jpg" % own_claim, "file_type": "image"})
    rid = (b[0]["id"] if isinstance(b, list) and b else None)
    check("employee attaches receipt to own claim", s in (200, 201) and rid, s)
    if hr_only:
        s2, b2 = req("POST", "/rest/v1/receipts", token=emp_tok, prefer="return=representation",
                     body={"claim_id": hr_only, "name": "x.jpg", "storage_path": "claims/%s/x.jpg" % hr_only, "file_type": "image"})
        blocked = (s2 in (401, 403)) or (isinstance(b2, list) and len(b2) == 0)
        check("employee CANNOT attach receipt to HR's claim (RLS)", blocked, "status=%s" % s2)
    if rid: req("DELETE", "/rest/v1/receipts?id=eq." + rid, token=emp_tok)
else:
    print("     (no employee-owned claim to test; run seed.sql)")

print("\n8) NOTIFICATIONS FAN-OUT (submit -> reviewers notified)")
if notif_ok:
    nid = "E2E-NOTIF-001"
    req("DELETE", "/rest/v1/claims?id=eq." + nid, token=emp_tok)
    req("POST", "/rest/v1/claims", token=emp_tok, prefer="return=representation",
        body={"id": nid, "user_id": emp_id, "purpose": "E2E notif", "place_of_visit": "T",
              "trip_from": "2026-04-01", "trip_to": "2026-04-02", "status": "draft"})
    req("PATCH", "/rest/v1/claims?id=eq." + nid, token=emp_tok, body={"status": "submitted"})
    s, nn = req("GET", "/rest/v1/notifications?select=id,kind,message&claim_id=eq." + nid, token=hr_tok)
    check("HR notified on submit (claims_notify trigger)", s == 200 and isinstance(nn, list) and len(nn) >= 1, "rows=%s" % (len(nn) if isinstance(nn, list) else nn))
    req("DELETE", "/rest/v1/claims?id=eq." + nid, token=emp_tok)  # cascade removes the notification
else:
    print("     (skipped — notifications table not present)")

print("\n================  %d passed, %d failed, %d skipped  ================" % (len(passed), len(failed), len(skipped)))
if skipped: print("SKIPPED (run supabase/migrate-phase3.sql):", ", ".join(skipped))
if failed: print("FAILED:", ", ".join(failed)); raise SystemExit(1)
print("All end-to-end API checks passed.")
