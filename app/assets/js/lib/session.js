/* TripTrail — session & role-based routing.
   HR-CENTRIC: HR lands on the all-claims Dashboard (the product's centerpiece);
   approvers land on their inbox; employees on their own claims. */
window.TT = window.TT || {};

TT.session = (function () {
  /** The home page for a role. HR's home is the tracking Dashboard. */
  function homeFor(role) {
    switch (role) {
      case 'hr_admin': return 'hr-dashboard.html';   // HR = the hub: see & track everyone
      case 'hod':
      case 'checker':
      case 'approver': return 'approvals.html';
      default: return 'my-claims.html';              // employees
    }
  }

  /** Redirect to the right home for the signed-in user. `prefix` = path to pages/ folder. */
  async function goHome(prefix = '') {
    try {
      const user = await TT.api.currentUser();
      location.replace(prefix + homeFor(user.role || 'employee'));
    } catch (e) {
      location.replace(prefix + 'login.html');
    }
  }

  return { homeFor, goHome };
})();
