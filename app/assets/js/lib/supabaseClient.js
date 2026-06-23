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
  const nd = (v) => (v === '' || v === undefined ? null : v);   // '' → null for date/text cols

  async function saveClaim(claim) {
    const items = claim.line_items || [];
    const conv = claim.conveyance || [];
    // Whitelist ONLY real `claims` columns (claim object also carries employee_name/department/user,
    // which are not columns — sending them would fail the upsert). Totals are computed by trigger.
    const row = {
      id: claim.id,
      user_id: claim.user_id,
      purpose: nd(claim.purpose),
      place_of_visit: nd(claim.place_of_visit),
      trip_from: nd(claim.trip_from),
      trip_to: nd(claim.trip_to),
      advance_received: Number(claim.advance_received || 0),
      status: claim.status || 'draft',
    };
    if (claim.status === 'submitted') row.submitted_at = new Date().toISOString();
    const { error: e1 } = await client().from('claims').upsert(row); if (e1) throw e1;

    // replace children (simple, reliable strategy for a buildless app)
    await client().from('line_items').delete().eq('claim_id', row.id);
    await client().from('conveyance').delete().eq('claim_id', row.id);
    if (items.length) {
      const rows = items.map((x, i) => ({
        claim_id: row.id, item_date: nd(x.item_date), journey_particulars: nd(x.journey_particulars),
        mode_of_transport: nd(x.mode_of_transport), fare: Number(x.fare || 0),
        daily_allowance: Number(x.daily_allowance || 0), lodging: Number(x.lodging || 0),
        local_conveyance: Number(x.local_conveyance || 0), misc_details: nd(x.misc_details),
        misc_amount: Number(x.misc_amount || 0), sort_order: i,
      }));
      const { error } = await client().from('line_items').insert(rows); if (error) throw error;
    }
    if (conv.length) {
      const rows = conv.map((x, i) => ({
        claim_id: row.id, item_date: nd(x.item_date), from_place: nd(x.from_place), to_place: nd(x.to_place),
        mode: nd(x.mode), amount: Number(x.amount || 0), has_bill: !!x.has_bill, remarks: nd(x.remarks), sort_order: i,
      }));
      const { error } = await client().from('conveyance').insert(rows); if (error) throw error;
    }
    return getClaim(row.id);
  }
  async function setStatus(id, status, comment) {
    const patch = { status }; if (status === 'submitted') patch.submitted_at = new Date().toISOString();
    const { error } = await client().from('claims').update(patch).eq('id', id); if (error) throw error;
    const me = await currentUser();
    await client().from('approvals').insert({ claim_id: id, actor_id: me ? me.id : null, actor: me ? me.full_name : null, stage: status, action: status, comment });
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
    const me = await currentUser();
    await client().from('approvals').insert({ claim_id: id, actor_id: me ? me.id : null, actor: me ? me.full_name : null, stage: 'cashier', action: 'paid', comment: voucherRef ? 'Voucher ' + voucherRef : '' });
    syncToSheet(id);   // fire-and-forget
    return getClaim(id);
  }

  async function importUpdate(id, fields) {
    const { data, error } = await client().from('claims').update(fields).eq('id', id).select('id');
    if (error) throw error;
    return (data || []).length > 0;
  }

  // ---- receipts (Supabase Storage, private bucket 'receipts') ----
  async function uploadReceipt(claimId, file) {
    const safe = file.name.replace(/[^a-z0-9._-]+/gi, '_');
    const path = `claims/${claimId}/${Date.now()}_${safe}`;
    const { error: upErr } = await client().storage.from('receipts').upload(path, file, { upsert: false });
    if (upErr) throw upErr;
    const ftype = (file.type || '').includes('pdf') ? 'pdf' : 'image';
    const { data, error } = await client().from('receipts')
      .insert({ claim_id: claimId, name: file.name, storage_path: path, file_type: ftype }).select().single();
    if (error) throw error;
    return data;
  }
  async function listReceipts(claimId) {
    const { data, error } = await client().from('receipts').select('*').eq('claim_id', claimId).order('uploaded_at');
    if (error) throw error; return data || [];
  }
  async function getReceiptUrl(storagePath) {
    if (!storagePath) return null;
    const { data, error } = await client().storage.from('receipts').createSignedUrl(storagePath, 3600);
    if (error) throw error; return data.signedUrl;
  }
  async function deleteReceipt(id, storagePath) {
    if (storagePath) await client().storage.from('receipts').remove([storagePath]);
    const { error } = await client().from('receipts').delete().eq('id', id); if (error) throw error;
    return true;
  }

  return { client, sendMagicLink, signInPassword, signUp, signOut, currentUser, listMyClaims, listAllClaims, listApprovalQueue, getClaim, saveClaim, setStatus, markPaid, importUpdate, uploadReceipt, listReceipts, getReceiptUrl, deleteReceipt };
})();
