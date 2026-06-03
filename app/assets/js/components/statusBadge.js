/* TripTrail — status badge. Color + label + icon together (WCAG 1.4.1: never color-only). */
window.TT = window.TT || {};

TT.statusBadge = (function () {
  const MAP = {
    submitted:    { label: 'Submitted',    icon: 'schedule',      cls: 'bg-slate-100 text-slate-600' },
    hod_approved: { label: 'HOD Approved',  icon: 'done',          cls: 'bg-primary-tint text-primary-dark' },
    checked:      { label: 'Checked',       icon: 'fact_check',    cls: 'bg-info-tint text-info' },
    approved:     { label: 'Approved',      icon: 'verified',      cls: 'bg-success-tint text-success' },
    paid:         { label: 'Paid',          icon: 'paid',          cls: 'bg-teal-tint text-teal' },
    rejected:     { label: 'Rejected',      icon: 'cancel',        cls: 'bg-danger-tint text-danger' },
    draft:        { label: 'Draft',         icon: 'edit_note',     cls: 'bg-slate-100 text-slate-500' },
  };

  /** Returns HTML string for a status pill. */
  function html(status) {
    const s = MAP[status] || MAP.submitted;
    return `<span class="tt-badge ${s.cls}">
      <span class="material-symbols-outlined" aria-hidden="true">${s.icon}</span>${s.label}
    </span>`;
  }
  return { html, MAP };
})();
