// Shared settings for every page on the site.
// Nothing here is secret: the API address and the Google client ID are meant to be public.
// Access to stats is controlled by Sign in with Google + the Users tab in the Sheet.
window.MODERNTAP = {
  // Apps Script web app URL (Deploy → Manage deployments keeps this the same across versions).
  API_URL: 'https://script.google.com/macros/s/AKfycbxpo3Lni1fMVFfewToYqoaKAHMJmHT3OweX_IQ0P9yQClE0q_pkAD0EpBFAOhk9UC4Hzg/exec',

  // OAuth client for Sign in with Google (Google Cloud project "ModernTap Dashboard").
  GOOGLE_CLIENT_ID: '738140668443-le3dhuc3ujmg9r51rmd6j2djlsgfei50.apps.googleusercontent.com',

  // ModernTap's own website, linked from the guest page.
  SITE_URL: 'https://modern-tap.com/',
  SITE_URL_IS_PLACEHOLDER: false,
};
