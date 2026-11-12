// Sign in with Google + calls to the signed-in API. Used by every dashboard page.
// The Google ID token lives in sessionStorage only (cleared when the tab closes) and expires after ~1 hour.
(function () {
  var cfg = window.MODERNTAP;
  var KEY = 'mt_id_token';
  var VIEW_KEY = 'mt_view_as';   // admin-only "View as" preview (read-only, checked again on the server)

  function getToken() {
    try { return sessionStorage.getItem(KEY); } catch (e) { return null; }
  }
  function setToken(t) {
    try { sessionStorage.setItem(KEY, t); } catch (e) { /* private mode: stays signed in for this page only */ }
  }
  function getViewAs() {
    try { return sessionStorage.getItem(VIEW_KEY) || ''; } catch (e) { return ''; }
  }
  function setViewAs(email) {
    try { if (email) sessionStorage.setItem(VIEW_KEY, email); else sessionStorage.removeItem(VIEW_KEY); } catch (e) { /* ignore */ }
  }
  function signOut() {
    try { sessionStorage.removeItem(KEY); sessionStorage.removeItem(VIEW_KEY); } catch (e) { /* ignore */ }
    if (window.google && google.accounts && google.accounts.id) google.accounts.id.disableAutoSelect();
    location.href = '/';
  }

  /** POST to the Apps Script API with the token in the body (never in the address). */
  function api(action, params) {
    var token = getToken();
    if (!token) { signOut(); return Promise.reject(new Error('signed_out')); }
    var body = Object.assign({ action: action, token: token }, params || {});
    var viewAs = getViewAs();
    if (viewAs && !body.noViewAs) body.viewAs = viewAs;
    delete body.noViewAs;
    return fetch(cfg.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },   // avoids a CORS preflight
      body: JSON.stringify(body),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.ok && body.viewAs && (data.error === 'view_as_unknown' || data.error === 'admin_only')) {
          // The preview target was removed or isn't allowed: drop the preview instead of signing out.
          setViewAs('');
          location.reload();
          throw new Error('view_as_ended');
        }
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

  /** Shows "Viewing as NAME (role) · read-only · Exit" when an admin is previewing someone else. */
  function showViewAs(user) {
    var old = document.getElementById('viewas-banner');
    if (old) old.remove();
    if (!user || !user.viewingAsBy) return;
    var bar = document.createElement('div');
    bar.id = 'viewas-banner';
    bar.className = 'viewas-banner';
    bar.setAttribute('role', 'status');
    var t = document.createElement('span');
    t.textContent = 'Viewing as ' + (user.name || user.email) + ' (' + user.role + ') · read-only preview';
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = 'Exit preview';
    b.addEventListener('click', function () { setViewAs(''); location.href = '/admin.html'; });
    bar.appendChild(t); bar.appendChild(b);
    document.body.insertBefore(bar, document.body.firstChild);
  }

  window.MTAuth = { getToken: getToken, setToken: setToken, signOut: signOut, api: api, requireSignIn: requireSignIn,
                    getViewAs: getViewAs, setViewAs: setViewAs, showViewAs: showViewAs };
})();
