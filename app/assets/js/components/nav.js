/* TripTrail — shared top app bar. Modern + fully responsive:
   - md+   : brand · horizontal tabs · bell · profile
   - < md  : brand · bell · profile · hamburger → slide-down menu with the tabs
   Role-aware (HR sees Dashboard/Reports/Admin); accessible (aria-expanded, Esc, click-out). */
window.TT = window.TT || {};

TT.nav = (function () {
  const ITEMS = [
    { key: 'dashboard',  label: 'Dashboard', icon: 'dashboard',     href: 'hr-dashboard.html', roles: ['hr_admin'] },
    { key: 'my-claims',  label: 'My Trips',  icon: 'luggage',       href: 'my-claims.html',    roles: ['employee', 'hod', 'checker', 'approver', 'hr_admin'] },
    { key: 'reports',    label: 'Reports',   icon: 'monitoring',    href: 'reports.html',      roles: ['hr_admin'] },
    { key: 'approvals',  label: 'Approvals', icon: 'approval',      href: 'approvals.html',    roles: ['hod', 'checker', 'approver', 'hr_admin'] },
    { key: 'admin',      label: 'Admin',     icon: 'group',         href: 'admin-users.html',  roles: ['hr_admin'] },
    { key: 'help',       label: 'Help',      icon: 'help',          href: 'help.html',         roles: ['employee', 'hod', 'checker', 'approver', 'hr_admin'] },
  ];

  async function render(activeKey) {
    const host = document.getElementById('tt-nav');
    if (!host) return;
    const user = await TT.api.currentUser();
    const role = user.role || 'employee';
    const home = (TT.session ? TT.session.homeFor(role) : 'my-claims.html');
    const initials = (user.full_name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const items = ITEMS.filter(i => i.roles.includes(role));

    const desktopTab = (i) => {
      const active = i.key === activeKey;
      return `<a href="${i.href}" ${active ? 'aria-current="page"' : ''}
        class="tt-navlink inline-flex items-center gap-1.5 px-3 h-9 rounded-full text-sm font-medium transition-colors
        ${active ? 'bg-primary-tint text-primary-dark' : 'text-on-surface-variant hover:bg-slate-100 hover:text-on-surface'}">
        <span class="material-symbols-outlined text-[20px]" aria-hidden="true">${i.icon}</span>${i.label}</a>`;
    };
    const mobileLink = (i) => {
      const active = i.key === activeKey;
      return `<a href="${i.href}" ${active ? 'aria-current="page"' : ''}
        class="flex items-center gap-3 px-3 h-12 rounded-lg text-sm font-medium
        ${active ? 'bg-primary-tint text-primary-dark' : 'text-on-surface hover:bg-slate-100'}">
        <span class="material-symbols-outlined" aria-hidden="true">${i.icon}</span>${i.label}</a>`;
    };

    host.innerHTML = `
      <nav class="bg-surface/90 backdrop-blur border-b border-slate-200 sticky top-0 z-30" aria-label="Primary">
        <div class="max-w-container mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center gap-2">
          <button id="tt-burger" class="md:hidden tt-press p-2 rounded-md text-on-surface-variant hover:bg-slate-100"
            aria-label="Open menu" aria-expanded="false" aria-controls="tt-mobile-menu">
            <span class="material-symbols-outlined">menu</span>
          </button>

          <a href="${home}" class="flex items-center gap-2 font-bold text-lg text-primary group shrink-0">
            <span class="material-symbols-outlined transition-transform group-hover:rotate-12" aria-hidden="true">trip_origin</span>TripTrail
          </a>

          <div class="hidden md:flex items-center gap-1 ml-3">${items.map(desktopTab).join('')}</div>

          <div class="flex items-center gap-1 sm:gap-2 ml-auto">
            ${demoSwitcherHtml(user)}
            <div class="relative">
              <button id="tt-bell-btn" class="relative p-2 rounded-md text-on-surface-variant hover:bg-slate-100 tt-press"
                aria-haspopup="true" aria-expanded="false" aria-controls="tt-bell-menu" aria-label="Notifications">
                <span class="material-symbols-outlined">notifications</span>
                <span id="tt-bell-badge" class="hidden absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-danger text-white text-[10px] font-bold grid place-items-center">0</span>
              </button>
              <div id="tt-bell-menu" role="menu" class="hidden absolute right-0 mt-2 w-80 max-w-[92vw] tt-card p-0 shadow-lift origin-top-right" style="animation: tt-fade-in 120ms ease both;">
                <div class="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                  <p class="text-sm font-semibold">Notifications</p>
                  <button id="tt-bell-readall" class="text-xs text-primary hover:underline">Mark all read</button>
                </div>
                <div id="tt-bell-list" class="max-h-80 overflow-y-auto"></div>
              </div>
            </div>
            <div class="relative">
              <button id="tt-profile-btn" class="flex items-center gap-2 p-1 sm:pr-2 rounded-full hover:bg-slate-100 tt-press" aria-haspopup="true" aria-expanded="false" aria-controls="tt-profile-menu">
                <span class="w-8 h-8 rounded-full bg-primary text-white grid place-items-center text-xs font-semibold shrink-0" aria-hidden="true">${initials}</span>
                <span class="hidden sm:block text-sm font-medium max-w-[140px] truncate">${user.full_name}</span>
                <span class="material-symbols-outlined text-base text-on-surface-variant hidden sm:block" aria-hidden="true">expand_more</span>
              </button>
              <div id="tt-profile-menu" role="menu" class="hidden absolute right-0 mt-2 w-56 tt-card p-1 shadow-lift origin-top-right" style="animation: tt-fade-in 120ms ease both;">
                <div class="px-3 py-2 border-b border-slate-100">
                  <p class="text-sm font-medium truncate">${user.full_name}</p>
                  <p class="text-xs text-on-surface-variant">${roleLabel(role)}</p>
                </div>
                <a href="profile.html" role="menuitem" class="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-slate-50"><span class="material-symbols-outlined text-base" aria-hidden="true">account_circle</span>My profile</a>
                <a href="my-claims.html" role="menuitem" class="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-slate-50"><span class="material-symbols-outlined text-base" aria-hidden="true">luggage</span>My Trips</a>
                <button id="tt-signout" role="menuitem" class="w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-danger-tint text-danger-text"><span class="material-symbols-outlined text-base" aria-hidden="true">logout</span>Sign out</button>
                <p class="px-3 py-2 border-t border-slate-100 text-[11px] text-on-surface-variant">Built by <span class="tt-gradient-text font-semibold">Harshan Aiyappa</span></p>
              </div>
            </div>
          </div>
        </div>

        <!-- mobile slide-down menu -->
        <div id="tt-mobile-menu" class="md:hidden hidden border-t border-slate-200 bg-surface">
          <div class="px-3 py-3 flex flex-col gap-1">${items.map(mobileLink).join('')}</div>
        </div>
      </nav>`;

    wireMenus();
    wireBell();
  }

  function wireMenus() {
    // generic dropdown toggler with click-out + Esc
    function bind(btnId, menuId) {
      const btn = document.getElementById(btnId), menu = document.getElementById(menuId);
      if (!btn || !menu) return null;
      const close = () => { menu.classList.add('hidden'); btn.setAttribute('aria-expanded', 'false'); };
      btn.addEventListener('click', (e) => { e.stopPropagation(); const open = menu.classList.toggle('hidden'); btn.setAttribute('aria-expanded', String(!open)); });
      document.addEventListener('click', (e) => { if (!menu.contains(e.target) && !btn.contains(e.target)) close(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
      return close;
    }
    bind('tt-profile-btn', 'tt-profile-menu');
    // hamburger toggles the mobile menu (swap icon)
    const burger = document.getElementById('tt-burger'), mobile = document.getElementById('tt-mobile-menu');
    if (burger && mobile) {
      burger.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = mobile.classList.toggle('hidden');
        burger.setAttribute('aria-expanded', String(!open));
        burger.querySelector('.material-symbols-outlined').textContent = open ? 'menu' : 'close';
      });
    }
    const so = document.getElementById('tt-signout');
    if (so) so.addEventListener('click', () => TT.auth.signOut(''));
    const demoSel = document.getElementById('tt-demo-user');
    if (demoSel) demoSel.addEventListener('change', () => { TT.api.setDemoUser(demoSel.value); location.reload(); });
  }

  async function wireBell() {
    const btn = document.getElementById('tt-bell-btn'), menu = document.getElementById('tt-bell-menu');
    const listEl = document.getElementById('tt-bell-list'), badge = document.getElementById('tt-bell-badge');
    if (!btn || !TT.api.listNotifications) return;
    async function refresh() {
      let items = [];
      try { items = await TT.api.listNotifications(); } catch (e) { return; }
      const unread = items.filter(n => !n.read).length;
      badge.textContent = unread > 9 ? '9+' : unread;
      badge.classList.toggle('hidden', unread === 0);
      const icon = { review: 'rate_review', approved: 'verified', rejected: 'cancel', returned: 'undo', paid: 'paid', reminder: 'alarm' };
      listEl.innerHTML = items.length ? items.map(n => `
        <button data-id="${n.id}" data-claim="${n.claim_id || ''}" role="menuitem"
          class="w-full text-left flex gap-2 px-3 py-2 border-b border-slate-50 hover:bg-slate-50 ${n.read ? '' : 'bg-primary-tint/40'}">
          <span class="material-symbols-outlined text-base text-primary" aria-hidden="true">${icon[n.kind] || 'notifications'}</span>
          <span class="min-w-0"><span class="block text-sm ${n.read ? 'text-on-surface-variant' : 'font-medium'}">${n.message || ''}</span>
          <span class="block text-xs text-on-surface-variant">${TT.format.date(n.created_at)}</span></span>
        </button>`).join('') : '<p class="px-3 py-6 text-center text-sm text-on-surface-variant">No notifications.</p>';
      listEl.querySelectorAll('[data-id]').forEach(b => b.addEventListener('click', async () => {
        try { await TT.api.markRead(b.dataset.id); } catch (e) {}
        if (b.dataset.claim) location.href = 'claim-detail.html?id=' + encodeURIComponent(b.dataset.claim); else refresh();
      }));
    }
    const close = () => { menu.classList.add('hidden'); btn.setAttribute('aria-expanded', 'false'); };
    btn.addEventListener('click', (e) => { e.stopPropagation(); const open = menu.classList.toggle('hidden'); btn.setAttribute('aria-expanded', String(!open)); });
    document.addEventListener('click', (e) => { if (!menu.contains(e.target) && !btn.contains(e.target)) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    const readAll = document.getElementById('tt-bell-readall');
    if (readAll) readAll.addEventListener('click', async (e) => { e.stopPropagation(); try { await TT.api.markAllRead(); } catch (er) {} refresh(); });
    refresh();
  }

  function demoSwitcherHtml(user) {
    if (!APP_CONFIG.USE_MOCK || !TT.api.listDemoUsers) return '';
    const opts = TT.api.listDemoUsers().map(u => `<option value="${u.id}" ${u.id === user.id ? 'selected' : ''}>${u.full_name} · ${roleLabel(u.role)}</option>`).join('');
    return `<label class="hidden lg:flex items-center gap-1 text-xs text-on-surface-variant" title="Demo only: switch acting user">
      <span class="material-symbols-outlined text-base" aria-hidden="true">switch_account</span>
      <select id="tt-demo-user" class="text-xs rounded-md border border-slate-200 bg-surface py-1 pl-1 pr-6">${opts}</select></label>`;
  }

  function roleLabel(role) {
    return { hr_admin: 'HR Admin', hod: 'Head of Dept', checker: 'Checker', approver: 'Approver', employee: 'Employee' }[role] || 'Employee';
  }

  return { render };
})();
