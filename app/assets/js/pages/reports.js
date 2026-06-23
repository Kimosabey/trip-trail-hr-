/* TripTrail — Reports. Apache ECharts charts + date-range filter + per-employee totals +
   advances aging + CSV export. Charts respect prefers-reduced-motion and resize responsively. */
(async function () {
  await TT.nav.render('reports');

  const PALETTE = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#4f46e5', '#0d9488', '#64748b', '#9333ea'];
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animate = !reduce;
  const spend = (c) => Number(c.grand_total || 0);
  const monthLbl = (m) => { const [y, mo] = m.split('-'); return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][(+mo) - 1] + " '" + y.slice(2); };

  let all = [];
  try { all = await TT.api.listAllClaims(); }
  catch (e) { TT.toast.error('Could not load report data.'); console.error(e); return; }

  const fromEl = document.getElementById('from'), toEl = document.getElementById('to');

  // chart instances
  const charts = {};
  function chart(id) { if (!charts[id]) charts[id] = echarts.init(document.getElementById(id)); return charts[id]; }
  window.addEventListener('resize', () => Object.values(charts).forEach(c => c.resize()));

  function view() {
    const f = fromEl.value, t = toEl.value;
    return all.filter(c => (!f || (c.trip_from || '') >= f) && (!t || (c.trip_from || '') <= t));
  }

  function groupSum(rows, keyFn) {
    const m = {}; rows.forEach(r => { const k = keyFn(r) || '—'; m[k] = (m[k] || 0) + spend(r); }); return m;
  }

  function render() {
    const rows = view();

    // KPIs
    const total = rows.reduce((s, c) => s + spend(c), 0);
    TT.anim.countUp(document.getElementById('k-total'), rows.length, false);
    TT.anim.countUp(document.getElementById('k-spend'), total, true);
    TT.anim.countUp(document.getElementById('k-avg'), rows.length ? Math.round(total / rows.length) : 0, true);
    TT.anim.countUp(document.getElementById('k-pending'), rows.filter(c => ['submitted', 'hod_approved', 'checked'].includes(c.status)).length, false);

    // by month (bar)
    const byMonth = {};
    rows.forEach(c => { const m = (c.trip_from || '').slice(0, 7); if (m) byMonth[m] = (byMonth[m] || 0) + spend(c); });
    const months = Object.keys(byMonth).sort();
    chart('chart-month').setOption({
      animation: animate, color: PALETTE,
      tooltip: { trigger: 'axis', valueFormatter: v => TT.format.money(v) },
      grid: { left: 60, right: 16, top: 16, bottom: 40 },
      xAxis: { type: 'category', data: months.map(monthLbl) },
      yAxis: { type: 'value', axisLabel: { formatter: v => '₹' + v } },
      series: [{ type: 'bar', data: months.map(m => byMonth[m]), itemStyle: { borderRadius: [6, 6, 0, 0] }, barMaxWidth: 48 }],
    });

    // by department (horizontal bar)
    const byDept = groupSum(rows, c => c.department);
    const deptKeys = Object.keys(byDept).sort((a, b) => byDept[a] - byDept[b]);
    chart('chart-dept').setOption({
      animation: animate, color: PALETTE,
      tooltip: { trigger: 'axis', valueFormatter: v => TT.format.money(v) },
      grid: { left: 110, right: 24, top: 16, bottom: 30 },
      xAxis: { type: 'value', axisLabel: { formatter: v => '₹' + v } },
      yAxis: { type: 'category', data: deptKeys },
      series: [{ type: 'bar', data: deptKeys.map(k => byDept[k]), itemStyle: { borderRadius: [0, 6, 6, 0] }, barMaxWidth: 28 }],
    });

    // status breakdown (donut)
    const byStatus = {};
    rows.forEach(c => byStatus[c.status] = (byStatus[c.status] || 0) + 1);
    chart('chart-status').setOption({
      animation: animate, color: PALETTE,
      tooltip: { trigger: 'item' }, legend: { bottom: 0, type: 'scroll' },
      series: [{ type: 'pie', radius: ['45%', '70%'], avoidLabelOverlap: true,
        itemStyle: { borderColor: '#fff', borderWidth: 2 },
        label: { show: false }, data: Object.keys(byStatus).map(k => ({ name: k, value: byStatus[k] })) }],
    });

    // top spenders (bar)
    const byEmp = groupSum(rows, c => c.employee_name);
    const empSorted = Object.keys(byEmp).sort((a, b) => byEmp[b] - byEmp[a]).slice(0, 8);
    chart('chart-emp').setOption({
      animation: animate, color: PALETTE,
      tooltip: { trigger: 'axis', valueFormatter: v => TT.format.money(v) },
      grid: { left: 120, right: 24, top: 16, bottom: 30 },
      xAxis: { type: 'value', axisLabel: { formatter: v => '₹' + v } },
      yAxis: { type: 'category', data: empSorted.slice().reverse() },
      series: [{ type: 'bar', data: empSorted.slice().reverse().map(k => byEmp[k]), itemStyle: { borderRadius: [0, 6, 6, 0], color: '#2563eb' }, barMaxWidth: 24 }],
    });

    // per-employee totals table
    const empAgg = {};
    rows.forEach(c => { const k = c.employee_name || '—'; (empAgg[k] = empAgg[k] || { dept: c.department, n: 0, total: 0 }); empAgg[k].n++; empAgg[k].total += spend(c); });
    document.getElementById('emp-rows').innerHTML = Object.keys(empAgg).sort((a, b) => empAgg[b].total - empAgg[a].total).map(k => `
      <tr class="border-b border-slate-100"><td class="py-2 pr-2 font-medium">${k}</td>
      <td class="py-2 pr-2 text-on-surface-variant">${empAgg[k].dept || '—'}</td>
      <td class="py-2 pr-2 text-right">${empAgg[k].n}</td>
      <td class="py-2 pr-2 text-right font-semibold">${TT.format.money(empAgg[k].total)}</td></tr>`).join('')
      || '<tr><td class="py-3 text-on-surface-variant">No data.</td></tr>';

    // outstanding advances aging
    const adv = rows.filter(c => Number(c.advance_received) > 0 && c.status !== 'paid');
    const days = (d) => d ? Math.max(0, Math.floor((Date.now() - new Date(d).getTime()) / 86400000)) : 0;
    document.getElementById('advances').innerHTML = adv.length ? adv
      .sort((a, b) => days(b.trip_to) - days(a.trip_to))
      .map(c => { const ag = days(c.trip_to); const cls = ag > 30 ? 'text-danger-text' : ag > 7 ? 'text-warning-text' : 'text-on-surface-variant';
        return `<div class="flex justify-between border-b border-slate-100 pb-1">
          <span>${c.employee_name} <span class="text-on-surface-variant">· ${c.purpose}</span></span>
          <span class="flex items-center gap-3"><span class="${cls} text-xs">${ag}d</span><span class="font-medium">${TT.format.money(c.advance_received)}</span></span></div>`;
      }).join('') : '<p class="text-on-surface-variant">No outstanding advances. 🎉</p>';
  }

  fromEl.addEventListener('change', render);
  toEl.addEventListener('change', render);
  document.getElementById('clear').addEventListener('click', () => { fromEl.value = ''; toEl.value = ''; render(); });
  render();

  // export report (per-employee totals) as CSV
  document.getElementById('export-report').addEventListener('click', () => {
    const rows = view();
    const empAgg = {};
    rows.forEach(c => { const k = c.employee_name || '—'; (empAgg[k] = empAgg[k] || { dept: c.department, n: 0, total: 0 }); empAgg[k].n++; empAgg[k].total += spend(c); });
    const data = Object.keys(empAgg).sort((a, b) => empAgg[b].total - empAgg[a].total)
      .map(k => [k, empAgg[k].dept || '', empAgg[k].n, empAgg[k].total]);
    const csv = TT.csv.build(['Employee', 'Department', 'Claims', 'Total Spend'], data);
    TT.csv.download('triptrail-report.csv', csv);
    TT.toast.success('Report exported');
  });
})();
