/* TripTrail — Supabase client + data adapter (TT.supa).
   Loaded only matters when APP_CONFIG.USE_MOCK = false. Mirrors the TT.api surface so
   api.js can delegate to it with no page changes.
   Requires the supabase-js UMD bundle loaded before this file (see pages that set USE_MOCK=false):
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
*/
window.TT = window.TT || {};

TT.supa = (function () {
  let _client = null;
  function client() {
    if (_client) return _client;
    if (!window.supabase || !APP_CONFIG.SUPABASE_URL) {
      throw new Error('Supabase not configured. Set SUPABASE_URL/ANON_KEY in config.js and load supabase-js.');
    }
    _client = window.supabase.createClient(APP_CONFIG.SUPABASE_URL, APP_CONFIG.SUPABASE_ANON_KEY);
    return _client;
  }

  // ---- auth ----
  async function sendMagicLink(email) {
    const { error } = await client().auth.signInWithOtp({ email, options: { emailRedirectTo: location.href.split('#')[0] } });
    if (error) throw error;
  }
  async function signInPassword(email, password) {
    const { error } = await client().auth.signInWithPassword({ email, password });
    if (error) throw error;
  }
  async function signUp(email, password, fullName) {
    const { error } = await client().auth.signUp({ email, password, options: { data: { full_name: fullName || '' } } });
    if (error) throw error;
  }
  async function signOut() { await client().auth.signOut(); }

  async function currentUser() {
    const { data: { user } } = await client().auth.getUser();
    if (!user) return null;
    const { data: profile } = await client().from('users').select('*').eq('id', user.id).single();
    return profile || { id: user.id, email: user.email, full_name: user.email, role: 'employee' };
  }

  // ---- claims ----
  // Join the owner so the UI gets employee_name + department (they live on `users`).
  const LIST_SELECT = '*, user:users(full_name, department)';
  const CLAIM_SELECT = '*, user:users(full_name, department), line_items(*), conveyance(*), receipts(*), approvals(*)';

  /** Flatten the joined user onto the claim so pages can read c.employee_name / c.department. */
  function flatten(c) {
    if (c && c.user) { c.employee_name = c.user.full_name; c.department = c.user.department; }
    return c;
  }

  async function listMyClaims() {
    const { data: { user } } = await client().auth.getUser();
    const { data, error } = await client().from('claims').select(LIST_SELECT).eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) throw error; return (data || []).map(flatten);
  }
  async function listAllClaims(filters = {}) {
    let q = client().from('claims').select(LIST_SELECT).order('created_at', { ascending: false });
    if (filters.status) q = q.eq('status', filters.status);
    const { data, error } = await q;
    if (error) throw error; return (data || []).map(flatten);
  }
  async function listApprovalQueue(stage) {
    const map = { hod: 'submitted', checker: 'hod_approved', approver: 'checked' };
    return listAllClaims({ status: map[stage] || 'submitted' });
  }
  async function getClaim(id) {
    const { data, error } = await client().from('claims').select(CLAIM_SELECT).eq('id', id).single();
    if (error) throw error; return flatten(data);
  }
  async function saveClaim(claim) {
    const c = { ...claim }; const items = c.line_items || []; const conv = c.conveyance || [];
    delete c.line_items; delete c.conveyance; delete c.receipts; delete c.approvals;
    const { error: e1 } = await client().from('claims').upsert(c); if (e1) throw e1;
    // replace children (simple strategy for buildless app)
    await client().from('line_items').delete().eq('claim_id', c.id);
    await client().from('conveyance').delete().eq('claim_id', c.id);
    if (items.length) { const { error } = await client().from('line_items').insert(items.map((x, i) => ({ ...stripId(x), claim_id: c.id, sort_order: i }))); if (error) throw error; }
    if (conv.length) { const { error } = await client().from('conveyance').insert(conv.map((x, i) => ({ ...stripId(x), claim_id: c.id, sort_order: i }))); if (error) throw error; }
    return getClaim(c.id);
  }
  async function setStatus(id, status, comment) {
    const patch = { status }; if (status === 'submitted') patch.submitted_at = new Date().toISOString();
    const { error } = await client().from('claims').update(patch).eq('id', id); if (error) throw error;
    await client().from('approvals').insert({ claim_id: id, stage: status, action: status, comment });
    if (status === 'approved') syncToSheet(id);   // fire-and-forget
    return getClaim(id);
  }

  /** Optional: push an approved/paid claim into HR's Google Sheet via the Edge Function. */
  async function syncToSheet(id) {
    if (!APP_CONFIG.SHEETS_SYNC_URL) return;
    try {
      const c = await getClaim(id);
      await fetch(APP_CONFIG.SHEETS_SYNC_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(c),
      });
    } catch (e) { console.warn('Sheets sync skipped:', e); }
  }
  async function markPaid(id, voucherRef) {
    const { error } = await client().from('claims').update({ status: 'paid', voucher_ref: voucherRef, paid_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
    await client().from('approvals').insert({ claim_id: id, stage: 'cashier', action: 'paid', comment: voucherRef ? 'Voucher ' + voucherRef : '' });
    syncToSheet(id);   // fire-and-forget
    return getClaim(id);
  }

  function stripId(o) { const x = { ...o }; delete x.id; return x; }

  return { client, sendMagicLink, signInPassword, signUp, signOut, currentUser, listMyClaims, listAllClaims, listApprovalQueue, getClaim, saveClaim, setStatus, markPaid };
})();
