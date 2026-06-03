/* TripTrail — auth helpers (login/logout). Works in mock mode and real Supabase mode. */
window.TT = window.TT || {};

TT.auth = (function () {
  async function signOut(prefix = '') {
    try {
      if (!APP_CONFIG.USE_MOCK && TT.supa && TT.supa.signOut) {
        await TT.supa.signOut();
      }
    } catch (e) { console.error(e); }
    location.href = prefix + 'login.html';
  }

  /** Guard a page: redirect to login if not authenticated (real mode only). */
  async function requireAuth(prefix = '') {
    if (APP_CONFIG.USE_MOCK) return true;          // mock always "logged in"
    try {
      const user = await TT.api.currentUser();
      if (!user) { location.replace(prefix + 'login.html'); return false; }
      return true;
    } catch (e) {
      location.replace(prefix + 'login.html');
      return false;
    }
  }

  return { signOut, requireAuth };
})();
