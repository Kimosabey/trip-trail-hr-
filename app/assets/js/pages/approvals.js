/* TripTrail — Approvals Inbox. Shows claims waiting at the current user's stage. */
(async function () {
  await TT.nav.render('approvals');
  const listEl = document.getElementById('list');
  const emptyEl = document.getElementById('empty');
  const countEl = document.getElementById('count');

  const user = await TT.api.currentUser();
  // map role -> the stage queue they handle. hr_admin sees everything pending.
  const stageForRole = { hod: 'hod', checker: 'checker', approver: 'approver', hr_admin: null };
  const role = user.role;

  let claims = [];
  listEl.innerHTML = TT.ui.cards(3);            // skeleton while loading
  try {
    if (role === 'hr_admin') {
      const all = await TT.api.listAllClaims();
      claims = all.filter(c => ['submitted', 'hod_approved', 'checked', 'approved'].includes(c.status));
    } else {
      claims = await TT.api.listApprovalQueue(stageForRole[role] || 'hod');
    }
  } catch (e) { TT.toast.error('Could not load approvals.'); console.error(e); }

  countEl.textContent = claims.length;
  emptyEl.classList.toggle('hidden', claims.length > 0);

  listEl.innerHTML = claims.map(c => {
    const initials = (c.employee_name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return `<div class="tt-card p-4 flex flex-wrap items-center gap-4">
      <span class="w-11 h-11 rounded-full bg-primary text-white grid place-items-center font-semibold" aria-hidden="true">${initials}</span>
      <div class="flex-1 min-w-[180px]">
        <p class="font-semibold">${c.employee_name} <span class="font-normal text-on-surface-variant">· ${c.department}</span></p>
        <p class="text-sm text-on-surface-variant">${c.purpose} · ${c.place_of_visit} · ${TT.format.dateRange(c.trip_from, c.trip_to)}</p>
      </div>
      <div class="text-right">
        <p class="font-semibold">${TT.format.money(c.grand_total)}</p>
        ${TT.statusBadge.html(c.status)}
      </div>
      <a href="claim-detail.html?id=${encodeURIComponent(c.id)}" class="tt-tap tt-press inline-flex items-center gap-2 px-4 rounded-md bg-primary hover:bg-primary-dark text-white font-semibold">
        <span class="material-symbols-outlined" aria-hidden="true">visibility</span>Review
      </a>
    </div>`;
  }).join('');
  TT.anim && TT.anim.enter(listEl.children);
})();
