/* TripTrail — HR Dashboard. Stats, filters, all-claims table, Mark Paid, CSV export. */
(async function () {
  await TT.nav.render('dashboard');

  const rowsEl = document.getElementById('rows');
  const countEl = document.getElementById('count');
  const qEl = document.getElementById('q');
  const deptEl = document.getElementById('dept');
  const statusEl = document.getElementById('status');

  let all = [];

  // stats
  try {
    const s = await TT.api.stats();
    TT.anim.countUp(document.getElementById('s-total'), s.total, false);
    TT.anim.countUp(document.getElementById('s-pending'), s.pending, false);
    TT.anim.countUp(document.getElementById('s-approved'), s.approved, false);
    TT.anim.countUp(document.getElementById('s-reimbursed'), s.reimbursed, true);
  } catch (e) { console.error(e); }

  try {
    all = await TT.api.listAllClaims();
  } catch (e) { TT.toast.error('Could not load claims.'); console.error(e); }

  // ---- tracking pipeline (per-stage counts; click to filter) ----
  const STAGES = [
    { key: 'submitted', label: 'Submitted', icon: 'schedule', cls: 'bg-slate-100 text-slate-600' },
    { key: 'hod_approved', label: 'HOD Approved', icon: 'done', cls: 'bg-primary-tint text-primary-dark' },
    { key: 'checked', label: 'Checked', icon: 'fact_check', cls: 'bg-info-tint text-info' },
    { key: 'approved', label: 'Approved', icon: 'verified', cls: 'bg-success-tint text-success' },
    { key: 'paid', label: 'Paid', icon: 'paid', cls: 'bg-teal-tint text-teal' },
    { key: 'rejected', label: 'Rejected', icon: 'cancel', cls: 'bg-danger-tint text-danger' },
  ];
  const pipeEl = document.getElementById('pipeline');
  if (pipeEl) {
    pipeEl.innerHTML = STAGES.map((s, i) => {
      const n = all.filter(c => c.status === s.key).length;
      const arrow = i < STAGES.length - 1 && s.key !== 'paid' ? '' : '';
      return `<li class="flex-1 min-w-[120px]">
        <button data-stage="${s.key}" class="tt-press w-full text-left rounded-md border border-slate-200 p-3 hover:shadow-card transition-shadow ${s.cls}">
          <span class="material-symbols-outlined" aria-hidden="true">${s.icon}</span>
          <p class="text-2xl font-bold leading-tight">${n}</p>
          <p class="text-xs font-medium">${s.label}</p>
        </button>${arrow}</li>`;
    }).join('');
    pipeEl.querySelectorAll('[data-stage]').forEach(b => b.addEventListener('click', () => {
      statusEl.value = b.dataset.stage; render();
      document.getElementById('rows').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }));
  }

  // populate department filter
  [...new Set(all.map(c => c.department).filter(Boolean))].sort().forEach(d => {
    const o = document.createElement('option'); o.value = d; o.textContent = d; deptEl.appendChild(o);
  });

  function filtered() {
    const q = qEl.value.trim().toLowerCase(), dept = deptEl.value, st = statusEl.value;
    return all.filter(c =>
      (!st || c.status === st) &&
      (!dept || c.department === dept) &&
      (!q || (c.employee_name + c.purpose + c.place_of_visit).toLowerCase().includes(q))
    );
  }

  function render() {
    const list = filtered();
    countEl.textContent = `Showing ${list.length} of ${all.length} claims`;
    rowsEl.innerHTML = list.map(c => `
      <tr class="tt-row-enter border-b border-slate-100 hover:bg-slate-50">
        <td class="px-4 py-3 font-medium">${c.employee_name}</td>
        <td class="px-4 py-3 text-on-surface-variant">${c.department}</td>
        <td class="px-4 py-3">${c.purpose}</td>
        <td class="px-4 py-3 text-on-surface-variant">${c.place_of_visit}</td>
        <td class="px-4 py-3 text-on-surface-variant">${TT.format.dateRange(c.trip_from, c.trip_to)}</td>
        <td class="px-4 py-3 text-right font-semibold">${TT.format.money(c.grand_total)}</td>
        <td class="px-4 py-3">${TT.statusBadge.html(c.status)}</td>
        <td class="px-4 py-3 whitespace-nowrap">
          <a href="claim-detail.html?id=${encodeURIComponent(c.id)}" class="text-primary font-medium hover:underline">View</a>
          ${c.status === 'approved' ? `<button class="ml-3 text-teal font-medium hover:underline" data-pay="${c.id}">Mark Paid</button>` : ''}
        </td>
      </tr>`).join('');

    rowsEl.querySelectorAll('[data-pay]').forEach(btn => btn.addEventListener('click', async () => {
      const voucher = window.prompt('Enter voucher reference (Cash Section):', '');
      if (voucher === null) return;   // cancelled
      try {
        await TT.api.markPaid(btn.dataset.pay, voucher.trim());
        const c = all.find(x => x.id === btn.dataset.pay); if (c) { c.status = 'paid'; c.voucher_ref = voucher.trim(); }
        TT.toast.success('Marked as Paid' + (voucher.trim() ? ' · voucher ' + voucher.trim() : ''));
        render();
      } catch (e) { TT.toast.error('Could not update.'); }
    }));
  }

  qEl.addEventListener('input', render);
  deptEl.addEventListener('change', render);
  statusEl.addEventListener('change', render);
  render();

  // ---- CSV export (opens in Excel) ----
  document.getElementById('export').addEventListener('click', () => {
    const list = filtered();
    const headers = ['Claim ID', 'Employee', 'Department', 'Purpose', 'Place of Visit', 'From', 'To', 'Grand Total', 'Advance', 'Balance Due', 'Status'];
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = list.map(c => [c.id, c.employee_name, c.department, c.purpose, c.place_of_visit,
      c.trip_from, c.trip_to, c.grand_total, c.advance_received, c.balance_due, c.status].map(esc).join(','));
    const csv = headers.map(esc).join(',') + '\n' + rows.join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'triptrail-claims.csv';
    a.click();
    URL.revokeObjectURL(a.href);
    TT.toast.success('Exported ' + list.length + ' claims');
  });

  // ---- CSV import (round-trip: update existing claims from an exported file) ----
  const VALID_STATUS = ['draft', 'submitted', 'hod_approved', 'checked', 'approved', 'paid', 'rejected', 'returned'];
  const importBtn = document.getElementById('import');
  const importFile = document.getElementById('import-file');
  importBtn.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', () => {
    const file = importFile.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      let rows;
      try { rows = TT.csv.parse(reader.result); }
      catch (e) { TT.toast.error('Could not read CSV.'); return; }
      if (!rows.length) { TT.toast.error('CSV has no data rows.'); return; }
      if (!('Claim ID' in rows[0])) { TT.toast.error('CSV must have a "Claim ID" column (use an exported file).'); return; }

      let updated = 0, skipped = 0, bad = 0;
      importBtn.disabled = true; const orig = importBtn.innerHTML; importBtn.innerHTML = 'Importing…';
      for (const r of rows) {
        const id = (r['Claim ID'] || '').trim();
        if (!id) { bad++; continue; }
        const fields = {};
        if (r['Purpose'] !== undefined) fields.purpose = r['Purpose'] || null;
        if (r['Place of Visit'] !== undefined) fields.place_of_visit = r['Place of Visit'] || null;
        if (r['From']) fields.trip_from = r['From'];
        if (r['To']) fields.trip_to = r['To'];
        if (r['Advance'] !== undefined && r['Advance'] !== '') fields.advance_received = Number(r['Advance']) || 0;
        const st = (r['Status'] || '').trim();
        if (st) { if (VALID_STATUS.includes(st)) fields.status = st; else { bad++; continue; } }
        try {
          const ok = await TT.api.importUpdate(id, fields);
          ok ? updated++ : skipped++;
        } catch (e) { console.error(e); bad++; }
      }
      importBtn.disabled = false; importBtn.innerHTML = orig;
      importFile.value = '';
      TT.toast.success(`Imported: ${updated} updated, ${skipped} not found${bad ? ', ' + bad + ' invalid' : ''}`);
      // refresh the table + stats
      all = await TT.api.listAllClaims();
      render();
    };
    reader.readAsText(file);
  });
})();
