// Plaque types: one list for every dashboard page, in the fixed color order
// (colors live in css/dash.css as --type-<id>).
window.MTTypes = {
  ORDER: ['rebook', 'wifi', 'guide', 'howto', 'review', 'local', 'other'],
  LABELS: { rebook: 'Rebooking', wifi: 'Wi-Fi', guide: 'Guidebook', howto: 'How-to', review: 'Review', local: 'Local tips', other: 'Other' },
  // Help plaques ask guests "Did this solve it?"
  SURVEY: ['howto', 'wifi', 'guide'],
  label: function (t) { return this.LABELS[t] || t; },
};
