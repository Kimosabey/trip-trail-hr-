/* TripTrail — Claim Detail / Review controller. Read-only body + approval timeline + actions. */
(async function () {
  await TT.nav.render('approvals');

  const id = new URLSearchParams(location.search).get('id');
  const body = document.getElementById('claim-body');
  const printBtn = document.getElementById('btn-print');
  if (printBtn) printBtn.addEventListener('click', () => window.print());

  // workflow stages in order
  const STAGES = [
    { key: 'submitted',    label: 'Submitted' },
    { key: 'hod_approved', label: 'HOD Approved' },
    { key: 'checked',      label: 'Checked' },
    { key: 'approved',     label: 'Approved' },
    { key: 'paid',         label: 'Paid' },
  ];
  // who acts on a claim currently in <status>, and what the next status is
  const NEXT = {
    submitted:    { role: ['hod', 'hr_admin'],      label: 'HOD Approve', next: 'hod_approved' },
    hod_approved: { role: ['checker', 'hr_admin'],  label: 'Mark Checked', next: 'checked' },
    checked:      { role: ['approver', 'hr_admin'], label: 'Approve',      next: 'approved' },
    approved:     { role: ['hr_admin'],             label: 'Mark Paid',    next: 'paid' },
  };

  let claim, user;
  try {
    [claim, user] = await Promise.all([TT.api.getClaim(id), TT.api.currentUser()]);
  } catch (e) { body.innerHTML = errCard('Could not load claim.'); console.error(e); return; }
  if (!claim) { body.innerHTML = errCard('Claim not found.'); return; }

  document.getElementById('bc-id').textContent = claim.id;

  // ---------- body ----------
  const grand = claim.line_items?.length ? TT.calc.grandTotal(claim.line_items) : (claim.grand_total || 0);
  const convTotal = TT.calc.conveyanceTotal(claim.conveyance);
  const balance = TT.calc.balanceDue(grand, claim.advance_received);
  const initials = (claim.employee_name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  body.innerHTML = `
    <!-- header card -->
    <div class="tt-card p-5">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3">
          <span class="w-11 h-11 rounded-full bg-primary text-white grid place-items-center font-semibold" aria-hidden="true">${initials}</span>
          <div>
            <p class="font-semibold text-lg">${claim.employee_name}</p>
            <p class="text-sm text-on-surface-variant">${claim.department} Department · ${claim.id}</p>
          </div>
        </div>
        ${TT.statusBadge.html(claim.status)}
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 text-sm">
        ${kv('Purpose', claim.purpose)}
        ${kv('Place of Visit', claim.place_of_visit)}
        ${kv('From', TT.format.date(claim.trip_from))}
        ${kv('To', TT.format.date(claim.trip_to))}
      </div>
    </div>

    <!-- journey & expenses -->
    ${claim.line_items?.length ? `
    <div class="tt-card p-5">
      <h2 class="font-semibold text-lg mb-3">Journey &amp; Expenses</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-sm min-w-[640px]">
          <thead><tr class="text-left text-xs uppercase text-on-surface-variant border-b border-slate-200">
            <th class="py-2 pr-2">Date</th><th class="py-2 pr-2">Particulars</th><th class="py-2 pr-2">Mode</th>
            <th class="py-2 pr-2 text-right">Fare</th><th class="py-2 pr-2 text-right">DA</th>
            <th class="py-2 pr-2 text-right">Lodging</th><th class="py-2 pr-2 text-right">Conv.</th>
            <th class="py-2 pr-2 text-right">Misc</th><th class="py-2 pr-2 text-right">Total</th>
          </tr></thead>
          <tbody>${claim.line_items.map(li => `<tr class="border-b border-slate-100">
            <td class="py-2 pr-2">${TT.format.date(li.item_date)}</td>
            <td class="py-2 pr-2">${li.journey_particulars || ''}</td>
            <td class="py-2 pr-2">${li.mode_of_transport || ''}</td>
            <td class="py-2 pr-2 text-right">${TT.format.moneyOrDash(li.fare)}</td>
            <td class="py-2 pr-2 text-right">${TT.format.moneyOrDash(li.daily_allowance)}</td>
            <td class="py-2 pr-2 text-right">${TT.format.moneyOrDash(li.lodging)}</td>
            <td class="py-2 pr-2 text-right">${TT.format.moneyOrDash(li.local_conveyance)}</td>
            <td class="py-2 pr-2 text-right">${li.misc_amount ? TT.format.money(li.misc_amount) + (li.misc_details ? ` <span class="text-on-surface-variant">(${li.misc_details})</span>` : '') : '—'}</td>
            <td class="py-2 pr-2 text-right font-semibold">${TT.format.money(TT.calc.rowTotal(li))}</td>
          </tr>`).join('')}</tbody>
        </table>
      </div>
    </div>` : ''}

    <!-- local conveyance -->
    ${claim.conveyance?.length ? `
    <div class="tt-card p-5">
      <div class="flex items-center justify-between mb-3">
        <h2 class="font-semibold text-lg">Local Conveyance</h2>
        <span class="text-sm font-semibold">Total: ${TT.format.money(convTotal)}</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm min-w-[560px]">
          <thead><tr class="text-left text-xs uppercase text-on-surface-variant border-b border-slate-200">
            <th class="py-2 pr-2">Date</th><th class="py-2 pr-2">From</th><th class="py-2 pr-2">To</th>
            <th class="py-2 pr-2">Mode</th><th class="py-2 pr-2 text-right">Amount</th><th class="py-2 pr-2">Bill</th><th class="py-2 pr-2">Remarks</th>
          </tr></thead>
          <tbody>${claim.conveyance.map(r => `<tr class="border-b border-slate-100">
            <td class="py-2 pr-2">${TT.format.date(r.item_date)}</td>
            <td class="py-2 pr-2">${r.from_place || ''}</td>
            <td class="py-2 pr-2">${r.to_place || ''}</td>
            <td class="py-2 pr-2">${r.mode || ''}</td>
            <td class="py-2 pr-2 text-right">${TT.format.money(r.amount)}</td>
            <td class="py-2 pr-2">${r.has_bill ? '<span class="tt-badge bg-success-tint text-success"><span class="material-symbols-outlined" aria-hidden="true">attachment</span>Bill</span>' : '<span class="text-on-surface-variant">No Bill</span>'}</td>
            <td class="py-2 pr-2 text-on-surface-variant">${r.remarks || '—'}</td>
          </tr>`).join('')}</tbody>
        </table>
      </div>
    </div>` : ''}

    <!-- totals -->
    <div class="tt-card p-5">
      <dl class="space-y-2 text-sm max-w-xs ml-auto">
        <div class="flex justify-between"><dt class="text-on-surface-variant">Total Expenses</dt><dd class="font-medium">${TT.format.money(grand)}</dd></div>
        <div class="flex justify-between"><dt class="text-on-surface-variant">Less Advance</dt><dd class="font-medium">− ${TT.format.money(claim.advance_received)}</dd></div>
        <div class="flex justify-between border-t border-slate-200 pt-2 text-base"><dt class="font-semibold">Balance Due</dt><dd class="font-bold text-primary">${TT.format.money(balance)}</dd></div>
      </dl>
    </div>

    <!-- receipts -->
    ${claim.receipts?.length ? `
    <div class="tt-card p-5">
      <h2 class="font-semibold text-lg mb-3">Attached Receipts</h2>
      <div class="flex flex-wrap gap-3">
        ${claim.receipts.map(r => {
          const pdf = r.file_type === 'pdf';
          return `<a class="receipt-link w-28 block group" data-path="${r.storage_path || ''}" target="_blank" rel="noopener" title="${r.name}">
            <div class="aspect-square rounded-md border border-slate-200 grid place-items-center ${pdf ? 'bg-danger-tint' : 'bg-slate-100'} group-hover:ring-2 group-hover:ring-primary transition">
              <span class="material-symbols-outlined text-3xl ${pdf ? 'text-danger' : 'text-slate-400'}">${pdf ? 'picture_as_pdf' : 'image'}</span>
            </div><p class="text-xs mt-1 truncate">${r.name}</p></a>`;
        }).join('')}
      </div>
    </div>` : ''}
  `;

  // ---------- receipts: resolve signed URLs (live mode) ----------
  document.querySelectorAll('.receipt-link').forEach(async (a) => {
    const path = a.dataset.path;
    if (!path) return;                       // mock mode / no file → not clickable
    try { const url = await TT.api.getReceiptUrl(path); if (url) a.href = url; } catch (e) { /* ignore */ }
  });

  // ---------- timeline ----------
  const curIdx = STAGES.findIndex(s => s.key === claim.status);
  const rejected = claim.status === 'rejected';
  document.getElementById('timeline').innerHTML = STAGES.map((s, i) => {
    let state = 'pending', icon = 'radio_button_unchecked', color = 'text-slate-300';
    if (!rejected && i < curIdx) { state = 'done'; icon = 'check_circle'; color = 'text-success'; }
    else if (!rejected && i === curIdx) { state = 'current'; icon = 'pending'; color = 'text-primary'; }
    const ap = (claim.approvals || []).find(a => a.stage === s.key);
    return `<li class="flex gap-3 ${i < STAGES.length - 1 ? 'pb-4' : ''} relative">
      <span class="material-symbols-outlined ${color}" aria-hidden="true">${icon}</span>
      <div>
        <p class="font-medium ${state === 'current' ? 'text-primary' : state === 'pending' ? 'text-slate-400' : ''}">${s.label}${state === 'current' ? ' · Current' : ''}</p>
        <p class="text-xs text-on-surface-variant">${ap ? (ap.actor || '') + (ap.acted_at ? ' · ' + TT.format.date(ap.acted_at) : '') : ''}</p>
      </div>
    </li>`;
  }).join('') + (rejected ? `<li class="flex gap-3"><span class="material-symbols-outlined text-danger">cancel</span><p class="font-medium text-danger">Rejected</p></li>` : '');

  // ---------- editable box (owner + draft/returned) ----------
  if (claim.user_id === user.id && ['draft', 'returned'].includes(claim.status)) {
    const box = document.getElementById('edit-box'); box.hidden = false;
    document.getElementById('edit-link').href = 'claim-editor.html?id=' + encodeURIComponent(claim.id);
  }

  // ---------- action bar (approvers / HR) ----------
  const step = NEXT[claim.status];
  const canAct = step && step.role.includes(user.role);
  if (canAct) {
    const bar = document.getElementById('action-bar'); bar.hidden = false;
    document.body.classList.add('pb-28');
    document.getElementById('approve-label').textContent = step.label;
    document.getElementById('actor-initials').textContent =
      (user.full_name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    const comment = document.getElementById('comment');
    const act = async (status, msg) => {
      try {
        await TT.api.setStatus(claim.id, status, comment.value.trim());
        TT.toast.success(msg);
        setTimeout(() => location.href = 'approvals.html', 700);
      } catch (e) { console.error(e); TT.toast.error('Action failed.'); }
    };
    document.getElementById('btn-approve').addEventListener('click', () => act(step.next, step.label + 'd'));
    document.getElementById('btn-reject').addEventListener('click', () => {
      if (!comment.value.trim()) { comment.focus(); TT.toast.error('Add a reason to reject.'); return; }
      act('rejected', 'Claim rejected');
    });
    document.getElementById('btn-return').addEventListener('click', () => act('returned', 'Returned for edit'));
  }

  // helpers
  function kv(k, v) { return `<div><dt class="text-on-surface-variant text-xs uppercase">${k}</dt><dd class="font-medium mt-0.5">${v || '—'}</dd></div>`; }
  function errCard(m) { return `<div class="tt-card p-12 text-center text-on-surface-variant">${m} <a href="my-claims.html" class="text-primary">Back</a></div>`; }
})();
