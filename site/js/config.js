// Shared settings for every page on the site.
window.MODERNTAP = {
  // Apps Script web app URL (Deploy → Manage deployments keeps this the same across versions).
  API_URL: 'https://script.google.com/macros/s/AKfycbxpo3Lni1fMVFfewToYqoaKAHMJmHT3OweX_IQ0P9yQClE0q_pkAD0EpBFAOhk9UC4Hzg/exec',

  // Where a guest goes if a chip lookup fails. Keep in sync with FALLBACK_URL in Code.gs.
  FALLBACK_URL: 'https://example.com',

  // How long to wait for the API before forwarding the guest anyway (milliseconds).
  TAP_TIMEOUT_MS: 4000,
};
