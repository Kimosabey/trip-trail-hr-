/* TripTrail — Admin → Users. HR-only: list staff, edit profile fields + role inline. */
(async function () {
  const user = await TT.api.currentUser();
  if (!user || user.role !== 'hr_admin') {           // HR-only guard
    TT.toast && TT.toast.error('HR access only.');
    location.replace(TT.session.homeFor(user ? user.role : 'employee'));
    return;
  }
  await TT.nav.render('admin');

  const ROLES = ['employee', 'hod', 'checker', 'approver', 'hr_admin'];
  const rowsEl = document.getElementById('rows');
  const qEl = document.getElementById('q');
  const countEl = document.getElementById('count');
  let users = [];

  try { users = await TT.api.listUsers(); }
  catch (e) { TT.toast.error('Could not load users.'); console.error(e); return; }

  function rowHtml(u) {
    const inp = (k, v, ph) => `<input data-k="${k}" value="${v || ''}" placeholder="${ph || ''}" class="w-full h-9 rounded-md border border-slate-200 bg-surface px-2" />`;
    return `<tr class="border-b border-slate-100" data-id="${u.id}">
      <td class="px-4 py-2 min-w-[160px]">${inp('full_name', u.full_name, 'Name')}</td>
      <td class="px-4 py-2 text-on-surface-variant">${u.email || '—'}</td>
      <td class="px-4 py-2 w-28">${inp('emp_code', u.emp_code, 'EMP…')}</td>
      <td class="px-4 py-2 w-36">${inp('department', u.department, 'Dept')}</td>
      <td class="px-4 py-2 w-24">${inp('grade', u.grade, 'Grade')}</td>
      <td class="px-4 py-2 w-40">
        <select data-k="role" class="w-full h-9 rounded-md border border-slate-200 bg-surface px-2">
          ${ROLES.map(r => `<option value="${r}" ${r === u.role ? 'selected' : ''}>${r}</option>`).join('')}
        </select>
      </td>
      <td class="px-4 py-2">
        <button data-save class="tt-press inline-flex items-center gap-1 px-3 h-9 rounded-md bg-primary hover:bg-primary-dark text-white text-sm font-semibold">
          <span class="material-symbols-outlined text-base" aria-hidden="true">save</span>Save
        </button>
      </td>
    </tr>`;
  }

  function render(list) {
    countEl.textContent = `${list.length} user${list.length === 1 ? '' : 's'}`;
    rowsEl.innerHTML = list.map(rowHtml).join('');
    rowsEl.querySelectorAll('tr[data-id]').forEach(tr => {
      tr.querySelector('[data-save]').addEventListener('click', async () => {
        const fields = {};
        tr.querySelectorAll('[data-k]').forEach(el => fields[el.dataset.k] = el.value.trim());
        const btn = tr.querySelector('[data-save]'); const orig = btn.innerHTML;
        btn.disabled = true; btn.innerHTML = 'Saving…';
        try {
          await TT.api.updateUser(tr.dataset.id, fields);
          const u = users.find(x => x.id === tr.dataset.id); if (u) Object.assign(u, fields);
          TT.toast.success('Saved ' + (fields.full_name || ''));
        } catch (e) { console.error(e); TT.toast.error('Save failed.'); }
        finally { btn.disabled = false; btn.innerHTML = orig; }
      });
    });
  }

  qEl.addEventListener('input', () => {
    const q = qEl.value.trim().toLowerCase();
    render(users.filter(u => ((u.full_name || '') + (u.email || '')).toLowerCase().includes(q)));
  });
  render(users);
})();
