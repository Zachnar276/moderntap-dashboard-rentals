// Sign in with Google + calls to the signed-in API. Used by every dashboard page.
// The Google ID token lives in sessionStorage only (cleared when the tab closes) and expires after ~1 hour.
(function () {
  var cfg = window.MODERNTAP;
  var KEY = 'mt_id_token';

  function getToken() {
    try { return sessionStorage.getItem(KEY); } catch (e) { return null; }
  }
  function setToken(t) {
    try { sessionStorage.setItem(KEY, t); } catch (e) { /* private mode: stays signed in for this page only */ }
  }
  function signOut() {
    try { sessionStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    if (window.google && google.accounts && google.accounts.id) google.accounts.id.disableAutoSelect();
    location.href = '/';
  }

  /** POST to the Apps Script API with the token in the body (never in the address). */
  function api(action, params) {
    var token = getToken();
    if (!token) { signOut(); return Promise.reject(new Error('signed_out')); }
    var body = Object.assign({ action: action, token: token }, params || {});
    return fetch(cfg.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },   // avoids a CORS preflight
      body: JSON.stringify(body),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.ok && (data.error === 'signed_out' || data.error === 'not_authorized')) {
          signOut();
          throw new Error(data.error);
        }
        return data;
      });
  }

  /** Pages that need a signed-in user call this first. */
  function requireSignIn() {
    if (!getToken()) { location.replace('/'); return false; }
    return true;
  }

  window.MTAuth = { getToken: getToken, setToken: setToken, signOut: signOut, api: api, requireSignIn: requireSignIn };
})();
