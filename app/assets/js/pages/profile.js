/* TripTrail — My Profile. Any signed-in user edits their own details (not role). */
(async function () {
  await TT.nav.render('');
  const fields = ['full_name', 'designation', 'emp_code', 'department', 'place_of_work'];
  let user;
  try { user = await TT.api.currentUser(); }
  catch (e) { TT.toast.error('Could not load profile.'); return; }
  if (!user) { location.replace('login.html'); return; }

  fields.forEach(k => { const el = document.getElementById(k); if (el) el.value = user[k] || ''; });
  document.getElementById('email').value = user.email || '';
  document.getElementById('role-pill').innerHTML =
    `<span class="tt-badge bg-primary-tint text-primary-dark"><span class="material-symbols-outlined" aria-hidden="true">badge</span>${roleLabel(user.role)}</span>`;

  document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const patch = {};
    fields.forEach(k => patch[k] = document.getElementById(k).value.trim());
    if (!patch.full_name) { TT.toast.error('Name is required.'); return; }
    const btn = e.submitter; const orig = btn.innerHTML; btn.disabled = true; btn.innerHTML = 'Saving…';
    try {
      await TT.api.updateMyProfile(patch);
      TT.toast.success('Profile updated');
    } catch (err) { console.error(err); TT.toast.error('Update failed.'); }
    finally { btn.disabled = false; btn.innerHTML = orig; }
  });

  function roleLabel(role) {
    return { hr_admin: 'HR Admin', hod: 'Head of Dept', checker: 'Checker', approver: 'Approver', employee: 'Employee' }[role] || 'Employee';
  }
})();
