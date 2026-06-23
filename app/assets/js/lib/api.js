/* TripTrail — DATA LAYER. The ONLY module that knows whether we're on mock or Supabase.
   Pages/components call these functions and never touch the backend directly.
   Flip APP_CONFIG.USE_MOCK to switch — no page code changes. */
window.TT = window.TT || {};

TT.api = (function () {
  const mock = () => APP_CONFIG.USE_MOCK;
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const delay = (ms = 120) => new Promise(r => setTimeout(r, ms)); // mimic network for realistic UX

  // ---- mock localStorage-backed store (so submissions survive a user switch / reload) ----
  const LS_CLAIMS = 'tt_mock_claims', LS_USER = 'tt_demo_user';
  let _store = null;
  function store() {
    if (_store) return _store;
    try { _store = JSON.parse(localStorage.getItem(LS_CLAIMS)); } catch (e) { _store = null; }
    if (!_store) { _store = clone(TT.mock.seedClaims); persist(); }
    return _store;
  }
  function persist() { try { localStorage.setItem(LS_CLAIMS, JSON.stringify(_store)); } catch (e) {} }
  function curId() { try { return localStorage.getItem(LS_USER) || TT.mock.users[0].id; } catch (e) { return TT.mock.users[0].id; } }
  function curUser() { return TT.mock.users.find(u => u.id === curId()) || TT.mock.users[0]; }

  return {
    // ---- demo helpers (mock mode only) ----
    listDemoUsers() { return clone(TT.mock.users); },
    setDemoUser(id) { try { localStorage.setItem(LS_USER, id); } catch (e) {} },
    resetMockData() { try { localStorage.removeItem(LS_CLAIMS); } catch (e) {} _store = null; },

    // ---- session ----
    async currentUser() {
      if (mock()) { await delay(); return clone(curUser()); }
      return TT.supa.currentUser();
    },

    // ---- claims ----
    async listMyClaims() {
      if (mock()) {
        await delay();
        const me = curId();
        return clone(store().filter(c => c.user_id === me));
      }
      return TT.supa.listMyClaims();
    },

    async listAllClaims(filters = {}) {
      if (mock()) {
        await delay();
        let rows = clone(store());
        if (filters.status) rows = rows.filter(c => c.status === filters.status);
        if (filters.department) rows = rows.filter(c => c.department === filters.department);
        if (filters.q) {
          const q = filters.q.toLowerCase();
          rows = rows.filter(c => (c.employee_name + c.purpose + c.place_of_visit).toLowerCase().includes(q));
        }
        return rows;
      }
      return TT.supa.listAllClaims(filters);
    },

    async listApprovalQueue(stage) {
      if (mock()) {
        await delay();
        const map = { hod: 'submitted', checker: 'hod_approved', approver: 'checked' };
        const want = map[stage] || 'submitted';
        return clone(store().filter(c => c.status === want));
      }
      return TT.supa.listApprovalQueue(stage);
    },

    async getClaim(id) {
      if (mock()) { await delay(); return clone(store().find(c => c.id === id) || null); }
      return TT.supa.getClaim(id);
    },

    async saveClaim(claim) {
      if (mock()) {
        await delay(200);
        const me = curUser();
        // stamp ownership from the current demo user (so HR can see who submitted)
        if (!claim.user_id) claim.user_id = me.id;
        claim.employee_name = claim.employee_name || me.full_name;
        claim.department = claim.department || me.department;
        claim.grand_total = TT.calc.grandTotal(claim.line_items);
        claim.balance_due = TT.calc.balanceDue(claim.grand_total, claim.advance_received);
        if (claim.status === 'submitted' && !claim.submitted_at) claim.submitted_at = new Date().toISOString();
        const s = store();
        const idx = s.findIndex(c => c.id === claim.id);
        if (idx >= 0) s[idx] = claim; else s.unshift(claim);
        persist();
        return clone(claim);
      }
      return TT.supa.saveClaim(claim);
    },

    async setStatus(id, status, comment) {
      if (mock()) {
        await delay();
        const c = store().find(x => x.id === id);
        if (c) { c.status = status; (c.approvals = c.approvals || []).push({ stage: status, comment, actor: curUser().full_name }); persist(); }
        return clone(c);
      }
      return TT.supa.setStatus(id, status, comment);
    },

    // ---- receipts ----
    async uploadReceipt(claimId, file) {
      if (mock()) {
        await delay(150);
        const c = store().find(x => x.id === claimId);
        if (c) { (c.receipts = c.receipts || []).push({ id: 'r' + Date.now() + Math.floor(performance.now()), name: file.name, file_type: (file.type || '').includes('pdf') ? 'pdf' : 'image', storage_path: null }); persist(); }
        return true;
      }
      return TT.supa.uploadReceipt(claimId, file);
    },
    async listReceipts(claimId) {
      if (mock()) { await delay(); const c = store().find(x => x.id === claimId); return clone((c && c.receipts) || []); }
      return TT.supa.listReceipts(claimId);
    },
    async getReceiptUrl(storagePath) {
      if (mock()) return null;                 // mock keeps metadata only (no real file)
      return TT.supa.getReceiptUrl(storagePath);
    },
    async deleteReceipt(id, storagePath) {
      if (mock()) {
        await delay();
        for (const c of store()) { const i = (c.receipts || []).findIndex(r => r.id === id); if (i >= 0) { c.receipts.splice(i, 1); persist(); break; } }
        return true;
      }
      return TT.supa.deleteReceipt(id, storagePath);
    },

    /** Round-trip CSV import: update editable header fields of an existing claim. Returns true if found. */
    async importUpdate(id, fields) {
      if (mock()) {
        await delay();
        const c = store().find(x => x.id === id);
        if (!c) return false;
        Object.assign(c, fields);
        c.balance_due = TT.calc.balanceDue(c.grand_total, c.advance_received);
        persist();
        return true;
      }
      return TT.supa.importUpdate(id, fields);
    },

    /** Cash Section step: mark Paid and record the voucher reference (Sheet-1 footer). */
    async markPaid(id, voucherRef) {
      if (mock()) {
        await delay();
        const c = store().find(x => x.id === id);
        if (c) {
          c.status = 'paid'; c.voucher_ref = voucherRef || '';
          (c.approvals = c.approvals || []).push({ stage: 'cashier', comment: voucherRef ? 'Voucher ' + voucherRef : '', actor: curUser().full_name });
          persist();
        }
        return clone(c);
      }
      return TT.supa.markPaid(id, voucherRef);
    },

    // ---- stats for HR dashboard ----
    async stats() {
      const all = await this.listAllClaims();
      const sum = (arr) => arr.reduce((s, c) => s + Number(c.grand_total || 0), 0);
      return {
        total: all.length,
        pending: all.filter(c => ['submitted', 'hod_approved', 'checked'].includes(c.status)).length,
        approved: all.filter(c => ['approved', 'paid'].includes(c.status)).length,
        reimbursed: sum(all.filter(c => c.status === 'paid')),
      };
    },
  };
})();
