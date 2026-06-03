/* TripTrail — toast notifications. Announced to screen readers via aria-live. */
window.TT = window.TT || {};

TT.toast = (function () {
  function container() {
    let el = document.getElementById('tt-toasts');
    if (!el) {
      el = document.createElement('div');
      el.id = 'tt-toasts';
      el.setAttribute('aria-live', 'polite');
      el.setAttribute('aria-atomic', 'true');
      document.body.appendChild(el);
    }
    return el;
  }
  function show(message, type = '') {
    const t = document.createElement('div');
    t.className = 'tt-toast ' + type;
    const icon = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info';
    t.innerHTML = `<span class="material-symbols-outlined" aria-hidden="true">${icon}</span><span>${message}</span>`;
    container().appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 250); }, 3000);
  }
  return {
    show,
    success: (m) => show(m, 'success'),
    error: (m) => show(m, 'error'),
  };
})();
