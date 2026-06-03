/* TripTrail — Reports. CSS-bar charts (no chart library), all from the data layer. */
(async function () {
  await TT.nav.render('reports');

  let all = [];
  try { all = await TT.api.listAllClaims(); }
  catch (e) { TT.toast.error('Could not load report data.'); console.error(e); return; }

  const spend = (c) => Number(c.grand_total || 0);
  const sum = (arr) => arr.reduce((s, c) => s + spend(c), 0);

  // ---- KPIs ----
  const totalSpend = sum(all);
  document.getElementById('k-total').textContent = all.length;
  document.getElementById('k-spend').textContent = TT.format.money(totalSpend);
  document.getElementById('k-avg').textContent = TT.format.money(all.length ? Math.round(totalSpend / all.length) : 0);
  document.getElementById('k-pending').textContent = all.filter(c => ['submitted', 'hod_approved', 'checked'].includes(c.status)).length;

  // ---- by department (horizontal bars) ----
  const byDept = {};
  all.forEach(c => { byDept[c.department] = (byDept[c.department] || 0) + spend(c); });
  const deptEntries = Object.entries(byDept).sort((a, b) => b[1] - a[1]);
  const deptMax = Math.max(1, ...deptEntries.map(e => e[1]));
  document.getElementById('by-dept').innerHTML = deptEntries.map(([d, v]) => `
    <div>
      <div class="flex justify-between text-sm mb-1"><span>${d}</span><span class="font-medium">${TT.format.money(v)}</span></div>
      <div class="h-3 rounded-full bg-slate-100 overflow-hidden">
        <div class="h-full rounded-full bg-primary" style="width:${Math.round(v / deptMax * 100)}%"></div>
      </div>
    </div>`).join('') || '<p class="text-on-surface-variant text-sm">No data.</p>';

  // ---- by month (vertical bars) ----
  const byMonth = {};
  all.forEach(c => {
    const m = (c.trip_from || '').slice(0, 7); if (!m) return;
    byMonth[m] = (byMonth[m] || 0) + spend(c);
  });
  const monthEntries = Object.entries(byMonth).sort();
  const monthMax = Math.max(1, ...monthEntries.map(e => e[1]));
  const monthLbl = (m) => { const [y, mo] = m.split('-'); return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][(+mo) - 1] + " '" + y.slice(2); };
  document.getElementById('by-month').innerHTML = monthEntries.map(([m, v]) => `
    <div class="flex-1 flex flex-col items-center justify-end h-full gap-1" title="${TT.format.money(v)}">
      <div class="w-full rounded-t bg-primary/80 hover:bg-primary transition-all" style="height:${Math.round(v / monthMax * 100)}%"></div>
      <span class="text-xs text-on-surface-variant">${monthLbl(m)}</span>
    </div>`).join('') || '<p class="text-on-surface-variant text-sm">No data.</p>';

  // ---- outstanding advances ----
  const adv = all.filter(c => Number(c.advance_received) > 0 && c.status !== 'paid');
  document.getElementById('advances').innerHTML = adv.length ? adv.map(c => `
    <div class="flex justify-between border-b border-slate-100 pb-1">
      <span>${c.employee_name} <span class="text-on-surface-variant">· ${c.purpose}</span></span>
      <span class="font-medium">${TT.format.money(c.advance_received)}</span>
    </div>`).join('') : '<p class="text-on-surface-variant">No outstanding advances. 🎉</p>';
})();
