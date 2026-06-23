/* TripTrail — formatting & totals helpers (pure functions, no backend). */
window.TT = window.TT || {};

TT.format = {
  /** ₹ with Indian grouping, no decimals unless present. e.g. 124300 -> "₹1,24,300" */
  money(n) {
    const v = Number(n || 0);
    return (APP_CONFIG.CURRENCY || '₹') + v.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  },
  /** Date -> "04 Mar 2026" */
  date(d) {
    if (!d) return '—';
    const dt = (d instanceof Date) ? d : new Date(d);
    if (isNaN(dt)) return String(d);
    return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  },
  /** "04 Mar 2026 – 05 Mar 2026" */
  dateRange(from, to) {
    return `${TT.format.date(from)} – ${TT.format.date(to)}`;
  },
  /** dash for empty money cells */
  moneyOrDash(n) {
    return (n === null || n === undefined || n === '' || Number(n) === 0) ? '—' : TT.format.money(n);
  },
};

TT.csv = {
  /** Escape one CSV field. */
  esc(v) { return `"${String(v == null ? '' : v).replace(/"/g, '""')}"`; },
  /** Build CSV text from headers + array-of-arrays. */
  build(headers, rows) {
    return [headers.map(TT.csv.esc).join(',')].concat(rows.map(r => r.map(TT.csv.esc).join(','))).join('\n');
  },
  /** Trigger a browser download of CSV text (UTF-8 BOM so ₹/names open cleanly in Excel). */
  download(name, csv) {
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name; a.click();
    URL.revokeObjectURL(a.href);
  },
  /** Parse CSV text → array of row objects keyed by header. Handles quotes, "" escapes, commas, newlines. */
  parse(text) {
    const rows = []; let field = '', row = [], inQ = false;
    text = String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inQ) {
        if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else { inQ = false; } }
        else field += ch;
      } else {
        if (ch === '"') inQ = true;
        else if (ch === ',') { row.push(field); field = ''; }
        else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
        else field += ch;
      }
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    if (!rows.length) return [];
    const headers = rows.shift().map(h => h.trim());
    return rows
      .filter(r => r.some(c => (c || '').trim() !== ''))
      .map(r => { const o = {}; headers.forEach((h, i) => o[h] = (r[i] !== undefined ? r[i] : '')); return o; });
  },
};

TT.ui = {
  /** one shimmer bar */
  skel(w, h) { return `<span class="tt-skel" style="display:block;width:${w || '100%'};height:${h || 14}px"></span>`; },
  /** N skeleton table rows (string of <tr>) */
  tableRows(cols, rows) {
    rows = rows || 5; let out = '';
    for (let r = 0; r < rows; r++) {
      out += '<tr>';
      for (let c = 0; c < cols; c++) out += `<td class="px-4 py-3">${TT.ui.skel(c === 0 ? '70%' : '50%')}</td>`;
      out += '</tr>';
    }
    return out;
  },
  /** N skeleton cards (string) */
  cards(n) {
    n = n || 4; let out = '';
    for (let i = 0; i < n; i++) out += `<div class="tt-card p-4 mb-3">${TT.ui.skel('40%', 14)}<div style="height:8px"></div>${TT.ui.skel('70%', 12)}</div>`;
    return out;
  },
  /** consistent empty state */
  empty(icon, title) { return `<div class="tt-empty"><span class="material-symbols-outlined" aria-hidden="true">${icon}</span><p class="mt-2">${title}</p></div>`; },
};

TT.anim = {
  /** Animate an element's text from 0 to value. money=true → ₹ formatted. Respects reduced-motion. */
  countUp(el, value, money) {
    if (!el) return;
    const fmt = (n) => money ? TT.format.money(Math.round(n)) : String(Math.round(n));
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !value) { el.textContent = fmt(value); return; }
    const dur = 600, start = performance.now();
    function step(now) {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);      // ease-out cubic
      el.textContent = fmt(value * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  },
};

TT.calc = {
  /** Row total = fare + DA + lodging + local conveyance + misc amount. */
  rowTotal(item) {
    return ['fare', 'daily_allowance', 'lodging', 'local_conveyance', 'misc_amount']
      .reduce((s, k) => s + Number(item[k] || 0), 0);
  },
  /** Grand total = sum of all line-item row totals. */
  grandTotal(items) {
    return (items || []).reduce((s, it) => s + TT.calc.rowTotal(it), 0);
  },
  /** Local conveyance total = sum of conveyance amounts. */
  conveyanceTotal(rows) {
    return (rows || []).reduce((s, r) => s + Number(r.amount || 0), 0);
  },
  balanceDue(grand, advance) {
    return Number(grand || 0) - Number(advance || 0);
  },
};
