/* TripTrail — shared top navigation bar. Injected into <header id="tt-nav"> on every page.
   Role-aware: HR sees Dashboard/Reports; everyone with approval power sees Approvals.
   Logo links to the role's home (HR → Dashboard). Includes an accessible Sign-out menu. */
window.TT = window.TT || {};

TT.nav = (function () {
  const ITEMS = [
    { key: 'dashboard',  label: 'Dashboard',  href: 'hr-dashboard.html', roles: ['hr_admin'] },
    { key: 'my-claims',  label: 'My Trips',   href: 'my-claims.html',    roles: ['employee', 'hod', 'checker', 'approver', 'hr_admin'] },
    { key: 'reports',    label: 'Reports',    href: 'reports.html',      roles: ['hr_admin'] },
    { key: 'approvals',  label: 'Approvals',  href: 'approvals.html',    roles: ['hod', 'checker', 'approver', 'hr_admin'] },
    { key: 'admin',      label: 'Admin',      href: 'admin-users.html',  roles: ['hr_admin'] },
    { key: 'help',       label: 'Help',       href: 'help.html',         roles: ['employee', 'hod', 'checker', 'approver', 'hr_admin'] },
  ];

  async function render(activeKey) {
    const host = document.getElementById('tt-nav');
    if (!host) return;
    const user = await TT.api.currentUser();
    const role = user.role || 'employee';
    const home = (TT.session ? TT.session.homeFor(role) : 'my-claims.html');
    const initials = (user.full_name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    const tab = (i) => {
      const active = i.key === activeKey;
      return `<a href="${i.href}" class="tt-navlink px-1 py-2 text-sm font-medium border-b-2 ${active
        ? 'text-primary border-primary'
        : 'text-on-surface-variant border-transparent hover:text-on-surface hover:border-slate-200'}"
        ${active ? 'aria-current="page"' : ''}>${i.label}</a>`;
    };
    const tabs = ITEMS.filter(i => i.roles.includes(role)).map(tab).join('');

    host.innerHTML = `
      <nav class="bg-surface/90 backdrop-blur border-b border-slate-200 sticky top-0 z-30" aria-label="Primary">
        <div class="max-w-container mx-auto px-4 sm:px-8 flex items-center justify-between h-16">
          <div class="flex items-center gap-8">
            <a href="${home}" class="flex items-center gap-2 font-bold text-lg text-primary group">
              <span class="material-symbols-outlined transition-transform group-hover:rotate-12" aria-hidden="true">trip_origin</span>TripTrail
            </a>
            <div class="hidden sm:flex items-center gap-6">${tabs}</div>
          </div>
          <div class="flex items-center gap-3">
            ${demoSwitcherHtml(user)}
            <button class="relative text-on-surface-variant hover:text-on-surface tt-press" aria-label="Notifications">
              <span class="material-symbols-outlined">notifications</span>
            </button>
            <div class="relative">
              <button id="tt-profile-btn" class="flex items-center gap-2 tt-press" aria-haspopup="true" aria-expanded="false" aria-controls="tt-profile-menu">
                <span class="w-8 h-8 rounded-full bg-primary text-white grid place-items-center text-xs font-semibold" aria-hidden="true">${initials}</span>
                <span class="hidden sm:block text-sm font-medium">${user.full_name} <span class="text-on-surface-variant">(${user.designation})</span></span>
                <span class="material-symbols-outlined text-base text-on-surface-variant" aria-hidden="true">expand_more</span>
              </button>
              <div id="tt-profile-menu" role="menu" class="hidden absolute right-0 mt-2 w-52 tt-card p-1 shadow-lift origin-top-right" style="animation: tt-fade-in 120ms ease both;">
                <div class="px-3 py-2 border-b border-slate-100">
                  <p class="text-sm font-medium">${user.full_name}</p>
                  <p class="text-xs text-on-surface-variant">${roleLabel(role)}</p>
                </div>
                <a href="profile.html" role="menuitem" class="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-slate-50"><span class="material-symbols-outlined text-base" aria-hidden="true">account_circle</span>My profile</a>
                <a href="my-claims.html" role="menuitem" class="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-slate-50"><span class="material-symbols-outlined text-base" aria-hidden="true">luggage</span>My Trips</a>
                <button id="tt-signout" role="menuitem" class="w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-danger-tint text-danger"><span class="material-symbols-outlined text-base" aria-hidden="true">logout</span>Sign out</button>
              </div>
            </div>
          </div>
        </div>
        <div class="sm:hidden flex items-center gap-4 px-4 pb-2 overflow-x-auto">${tabs}</div>
      </nav>`;

    // profile menu open/close (accessible)
    const btn = document.getElementById('tt-profile-btn');
    const menu = document.getElementById('tt-profile-menu');
    const close = () => { menu.classList.add('hidden'); btn.setAttribute('aria-expanded', 'false'); };
    const toggle = () => {
      const open = menu.classList.toggle('hidden');
      btn.setAttribute('aria-expanded', String(!open));
    };
    btn.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
    document.addEventListener('click', (e) => { if (!menu.contains(e.target) && e.target !== btn) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    document.getElementById('tt-signout').addEventListener('click', () => TT.auth.signOut(''));

    // demo user switcher (mock mode only)
    const demoSel = document.getElementById('tt-demo-user');
    if (demoSel) demoSel.addEventListener('change', () => { TT.api.setDemoUser(demoSel.value); location.reload(); });
  }

  /** Mock-only: a dropdown to act as different users, to test "employee submits → HR sees". */
  function demoSwitcherHtml(user) {
    if (!APP_CONFIG.USE_MOCK || !TT.api.listDemoUsers) return '';
    const opts = TT.api.listDemoUsers().map(u =>
      `<option value="${u.id}" ${u.id === user.id ? 'selected' : ''}>${u.full_name} · ${roleLabel(u.role)}</option>`).join('');
    return `<label class="hidden md:flex items-center gap-1 text-xs text-on-surface-variant" title="Demo only: switch acting user">
      <span class="material-symbols-outlined text-base" aria-hidden="true">switch_account</span>
      <select id="tt-demo-user" class="text-xs rounded-md border border-slate-200 bg-surface py-1 pl-1 pr-6">${opts}</select>
    </label>`;
  }

  function roleLabel(role) {
    return { hr_admin: 'HR Admin', hod: 'Head of Dept', checker: 'Checker', approver: 'Approver', employee: 'Employee' }[role] || 'Employee';
  }

  return { render };
})();
