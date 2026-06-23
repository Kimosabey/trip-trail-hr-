/* TripTrail — Claim Editor controller. Add/remove rows, live auto-totals, validation, save. */
(async function () {
  await TT.nav.render('my-claims');

  const TRANSPORT = ['Flight', 'Train', 'Bus', 'Metro', 'Cab', 'Auto', 'Own Vehicle', 'Other'];
  const CONV_MODES = ['Auto', 'Metro', 'Bus', 'Cab', 'Rickshaw', 'Ola', 'Uber', 'Other'];

  const params = new URLSearchParams(location.search);
  const editId = params.get('id');

  let claim = null;
  let recId = 0;

  // ---------- load (edit existing or fresh) ----------
  const user = await TT.api.currentUser();
  let limits = null;
  try { limits = await TT.api.getLimits(user.grade); } catch (e) { /* non-fatal */ }
  if (limits) {
    const h = document.getElementById('limit-hint');
    if (h) { h.querySelector('span:last-child').textContent =
      `Daily Allowance over ₹${limits.max_da} or Lodging over ₹${limits.max_lodging} (your ${user.grade} eligibility) are highlighted.`;
      h.classList.remove('hidden'); }
  }
  if (editId) {
    claim = await TT.api.getClaim(editId);
    document.getElementById('page-title').textContent = 'Edit Travel Report';
    document.getElementById('status-pill').innerHTML = TT.statusBadge.html(claim.status);
  }
  if (!claim) {
    claim = {
      id: 'TR-NEW', user_id: user.id, employee_name: user.full_name, department: user.department,
      purpose: '', place_of_visit: '', trip_from: '', trip_to: '', advance_received: 0,
      status: 'draft', line_items: [], conveyance: [], receipts: [],
    };
    document.getElementById('status-pill').innerHTML = TT.statusBadge.html('draft');
  }

  // ---------- header fields ----------
  document.getElementById('f-name').value = `${user.full_name}, ${user.designation}`;
  document.getElementById('f-pow').value = user.place_of_work || '';
  document.getElementById('f-emp').value = user.emp_code || '';
  document.getElementById('f-dept').value = user.department || '';
  const purposeEl = document.getElementById('f-purpose'); purposeEl.value = claim.purpose || '';
  const visitEl = document.getElementById('f-visit'); visitEl.value = claim.place_of_visit || '';
  const fromEl = document.getElementById('f-from'); fromEl.value = claim.trip_from || '';
  const toEl = document.getElementById('f-to'); toEl.value = claim.trip_to || '';
  const advEl = document.getElementById('f-advance'); advEl.value = claim.advance_received || 0;

  // ---------- line items ----------
  const liBody = document.getElementById('li-rows');

  function liRow(it = {}) {
    const tr = document.createElement('tr');
    tr.className = 'tt-row-enter border-b border-slate-100';
    tr.innerHTML = `
      <td class="px-2 py-1" data-label="Date"><input type="date" class="cell-txt" data-k="item_date" value="${it.item_date || ''}"></td>
      <td class="px-2 py-1" data-label="Journey"><input class="cell-txt" data-k="journey_particulars" placeholder="From → To" value="${it.journey_particulars || ''}"></td>
      <td class="px-2 py-1" data-label="Mode">
        <select class="cell-txt" data-k="mode_of_transport">
          ${TRANSPORT.map(m => `<option ${m === it.mode_of_transport ? 'selected' : ''}>${m}</option>`).join('')}
        </select>
      </td>
      <td class="px-2 py-1" data-label="Fare ₹"><input type="number" min="0" class="cell-num" data-k="fare" value="${it.fare || ''}"></td>
      <td class="px-2 py-1" data-label="Daily Allowance ₹"><input type="number" min="0" class="cell-num" data-k="daily_allowance" value="${it.daily_allowance || ''}"></td>
      <td class="px-2 py-1" data-label="Lodging ₹"><input type="number" min="0" class="cell-num" data-k="lodging" value="${it.lodging || ''}"></td>
      <td class="px-2 py-1 text-right text-on-surface-variant" data-label="Local Conv. ₹" data-conv>—</td>
      <td class="px-2 py-1" data-label="Misc Details"><input class="cell-txt" data-k="misc_details" placeholder="Details" value="${it.misc_details || ''}"></td>
      <td class="px-2 py-1" data-label="Misc ₹"><input type="number" min="0" class="cell-num" data-k="misc_amount" value="${it.misc_amount || ''}"></td>
      <td class="px-2 py-1 text-right font-semibold" data-label="Row Total ₹" data-rowtotal>₹0</td>
      <td class="px-2 py-1 text-center" data-label="">
        <button class="text-on-surface-variant hover:text-danger" aria-label="Remove row" data-remove>
          <span class="material-symbols-outlined">delete</span>
        </button>
      </td>`;
    tr.querySelectorAll('input,select').forEach(el => el.addEventListener('input', recalc));
    tr.querySelector('[data-remove]').addEventListener('click', () => { tr.remove(); recalc(); });
    liBody.appendChild(tr);
    return tr;
  }

  // ---------- conveyance ----------
  const cvBody = document.getElementById('cv-rows');

  function cvRow(r = {}) {
    const tr = document.createElement('tr');
    tr.className = 'tt-row-enter border-b border-slate-100';
    tr.innerHTML = `
      <td class="px-2 py-1" data-label="Date"><input type="date" class="cell-txt" data-k="item_date" value="${r.item_date || ''}"></td>
      <td class="px-2 py-1" data-label="From"><input class="cell-txt" data-k="from_place" placeholder="From" value="${r.from_place || ''}"></td>
      <td class="px-2 py-1" data-label="To"><input class="cell-txt" data-k="to_place" placeholder="To" value="${r.to_place || ''}"></td>
      <td class="px-2 py-1" data-label="Mode">
        <select class="cell-txt" data-k="mode">${CONV_MODES.map(m => `<option ${m === r.mode ? 'selected' : ''}>${m}</option>`).join('')}</select>
      </td>
      <td class="px-2 py-1" data-label="Amount ₹"><input type="number" min="0" class="cell-num" data-k="amount" value="${r.amount || ''}"></td>
      <td class="px-2 py-1 text-center" data-label="Bill?">
        <label class="inline-flex items-center gap-1 cursor-pointer text-xs">
          <input type="checkbox" data-k="has_bill" ${r.has_bill ? 'checked' : ''} class="rounded border-slate-300 text-primary">
          <span>Bill</span>
        </label>
      </td>
      <td class="px-2 py-1" data-label="Remarks"><input class="cell-txt" data-k="remarks" placeholder="Remarks" value="${r.remarks || ''}"></td>
      <td class="px-2 py-1 text-center" data-label="">
        <button class="text-on-surface-variant hover:text-danger" aria-label="Remove row" data-remove>
          <span class="material-symbols-outlined">delete</span>
        </button>
      </td>`;
    tr.querySelectorAll('input,select').forEach(el => el.addEventListener('input', recalc));
    tr.querySelector('[data-remove]').addEventListener('click', () => { tr.remove(); recalc(); });
    cvBody.appendChild(tr);
    return tr;
  }

  // ---------- read DOM -> data ----------
  function readRow(tr) {
    const o = {};
    tr.querySelectorAll('[data-k]').forEach(el => {
      const k = el.dataset.k;
      o[k] = el.type === 'checkbox' ? el.checked : (el.type === 'number' ? Number(el.value || 0) : el.value);
    });
    return o;
  }
  function readLineItems() { return [...liBody.querySelectorAll('tr')].map(readRow); }
  function readConveyance() { return [...cvBody.querySelectorAll('tr')].map(readRow); }

  // ---------- recalc (the spreadsheet engine) ----------
  function recalc() {
    const convTotal = TT.calc.conveyanceTotal(readConveyance());
    document.getElementById('conv-total').textContent = TT.format.money(convTotal);

    const liTrs = [...liBody.querySelectorAll('tr')];
    let grand = 0;
    liTrs.forEach((tr, i) => {
      const it = readRow(tr);
      // conveyance total attaches to the FIRST line item (matches the sheet's single column)
      it.local_conveyance = (i === 0) ? convTotal : 0;
      tr.querySelector('[data-conv]').textContent = (i === 0) ? TT.format.money(convTotal) : '—';
      const rt = TT.calc.rowTotal(it);
      tr.querySelector('[data-rowtotal]').textContent = TT.format.money(rt);
      grand += rt;
      markLimit(tr, it);
    });

    const adv = Number(advEl.value || 0);
    document.getElementById('t-grand').textContent = TT.format.money(grand);
    document.getElementById('t-adv').textContent = TT.format.money(adv);
    document.getElementById('t-bal').textContent = TT.format.money(TT.calc.balanceDue(grand, adv));
  }
  // flag DA / lodging cells that exceed the employee's grade eligibility (non-blocking)
  function markLimit(tr, it) {
    if (!limits) return;
    const set = (k, max) => {
      const el = tr.querySelector(`[data-k="${k}"]`); if (!el) return;
      const over = max != null && Number(it[k] || 0) > Number(max);
      el.classList.toggle('limit-warn', over);
      el.title = over ? `Exceeds eligibility (max ₹${max})` : '';
    };
    set('daily_allowance', limits.max_da);
    set('lodging', limits.max_lodging);
  }

  advEl.addEventListener('input', recalc);

  // ---------- receipts ----------
  const recList = document.getElementById('rec-list');
  const pendingFiles = [];   // new files to upload AFTER the claim is saved (need its id)

  function receiptTile({ name, file_type, onRemove }) {
    const isPdf = file_type === 'pdf' || /\.pdf$/i.test(name);
    const div = document.createElement('div');
    div.className = 'tt-row-enter relative w-28';
    div.innerHTML = `
      <div class="aspect-square rounded-md border border-slate-200 grid place-items-center ${isPdf ? 'bg-danger-tint' : 'bg-slate-100'}">
        <span class="material-symbols-outlined text-3xl ${isPdf ? 'text-danger' : 'text-slate-400'}">${isPdf ? 'picture_as_pdf' : 'image'}</span>
      </div>
      <p class="text-xs mt-1 truncate" title="${name}">${name}</p>
      <button type="button" class="absolute -top-2 -right-2 bg-surface border border-slate-200 rounded-full w-6 h-6 grid place-items-center hover:text-danger" aria-label="Remove ${name}">
        <span class="material-symbols-outlined text-base">close</span>
      </button>`;
    div.querySelector('button').addEventListener('click', async () => {
      if (onRemove) { try { await onRemove(); } catch (e) { TT.toast.error('Could not remove receipt.'); return; } }
      div.remove();
    });
    recList.appendChild(div);
    return div;
  }

  document.getElementById('f-receipts').addEventListener('change', (e) => {
    [...e.target.files].forEach(f => {
      pendingFiles.push(f);
      receiptTile({
        name: f.name, file_type: (f.type || '').includes('pdf') ? 'pdf' : 'image',
        onRemove: () => { const i = pendingFiles.indexOf(f); if (i >= 0) pendingFiles.splice(i, 1); },
      });
    });
    e.target.value = '';
  });

  // existing receipts (when editing) load from the data layer, with delete wired
  async function loadExistingReceipts() {
    if (!claim.id || claim.id === 'TR-NEW') return;
    try {
      const existing = await TT.api.listReceipts(claim.id);
      existing.forEach(r => receiptTile({ name: r.name, file_type: r.file_type, onRemove: () => TT.api.deleteReceipt(r.id, r.storage_path) }));
    } catch (e) { /* non-fatal */ }
  }

  // ---------- prefill existing ----------
  (claim.line_items || []).forEach(liRow);
  (claim.conveyance || []).forEach(cvRow);
  loadExistingReceipts();
  if (!claim.line_items?.length) liRow();        // start with one empty row
  if (!claim.conveyance?.length) cvRow();
  recalc();

  document.getElementById('add-li').addEventListener('click', () => { liRow(); recalc(); });
  document.getElementById('add-cv').addEventListener('click', () => { cvRow(); recalc(); });

  // ---------- validation + save ----------
  function collect() {
    return {
      ...claim,
      purpose: purposeEl.value.trim(),
      place_of_visit: visitEl.value.trim(),
      trip_from: fromEl.value,
      trip_to: toEl.value,
      advance_received: Number(advEl.value || 0),
      line_items: readLineItems(),
      conveyance: readConveyance(),
    };
  }

  function validate(c) {
    const errs = [];
    if (!c.purpose) errs.push('Purpose of Travel');
    if (!c.place_of_visit) errs.push('Place of Visit');
    if (!c.trip_from) errs.push('Date From');
    if (!c.trip_to) errs.push('Date To');
    if (c.trip_from && c.trip_to && c.trip_to < c.trip_from) errs.push('Date To must be after Date From');
    if (!c.line_items.some(li => TT.calc.rowTotal(li) > 0)) errs.push('At least one expense row');
    return errs;
  }

  async function save(status) {
    const c = collect();
    if (status === 'submitted') {
      const errs = validate(c);
      if (errs.length) { TT.toast.error('Please complete: ' + errs.join(', ')); return; }
    }
    c.status = status;
    if (c.id === 'TR-NEW') c.id = 'TR-' + (fromEl.value || '2026').slice(0, 7).replace('-', '-') + '-' + Math.floor(100 + Math.abs(hashStr(c.purpose)) % 900);
    const btn = status === 'submitted' ? subBtn : draftBtn;
    const old = btn.innerHTML; btn.disabled = true; btn.innerHTML = 'Saving…';
    try {
      const saved = await TT.api.saveClaim(c);
      const claimId = (saved && saved.id) || c.id;
      // upload any newly attached receipts now that the claim row exists
      for (const f of pendingFiles) {
        try { await TT.api.uploadReceipt(claimId, f); }
        catch (err) { console.error('receipt upload failed', err); TT.toast.error('A receipt failed to upload: ' + f.name); }
      }
      pendingFiles.length = 0;
      TT.toast.success(status === 'submitted' ? 'Claim submitted for approval' : 'Draft saved');
      setTimeout(() => location.href = 'my-claims.html', 700);
    } catch (e) {
      console.error(e); TT.toast.error('Save failed. Try again.');
      btn.disabled = false; btn.innerHTML = old;
    }
  }
  // tiny deterministic hash (no Math.random — keeps ids stable)
  function hashStr(s) { let h = 0; for (let i = 0; i < (s || '').length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }

  const draftBtn = document.getElementById('btn-draft');
  const subBtn = document.getElementById('btn-submit');
  draftBtn.addEventListener('click', () => save('draft'));
  subBtn.addEventListener('click', () => save('submitted'));
})();
