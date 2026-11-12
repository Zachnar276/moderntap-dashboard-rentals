// How-to guides shown on /howto.html. General instructions that fit most Outer Banks rentals.
// Equipment differs between houses: confirm each house's details (and edit HOUSE_TOPICS) before plaques go in.
// Static text only; nothing here comes from guests.
window.MTGuides = {
  TOPICS: {
    hottub: {
      title: 'Hot tub',
      intro: 'Most hot tubs are already heated and ready when you arrive.',
      steps: [
        'Unclip the cover and fold it back (or use the cover lifter if there is one). Never stand or sit on the cover.',
        'Press the jets button on the control panel at the edge of the tub. Jets usually run for about 15 minutes, then stop on their own; press again for more.',
        'The temperature is preset. If it feels cool, wait 30–60 minutes with the cover on; it heats slowly.',
        'Rinse off sand and sunscreen before getting in; it keeps the water clear.',
        'Put the cover back on and clip it when you’re done. It keeps the heat in and keeps children safe.',
      ],
      safety: 'Children must be supervised at all times. No glass in or near the tub. If the water looks cloudy, the panel shows an error, or it isn’t heating, don’t open any equipment panels; contact guest services.',
    },
    tv: {
      title: 'TV & streaming',
      intro: 'Use the TV’s own remote to turn it on, then pick the right input.',
      steps: [
        'Turn on the TV with its remote (not the cable box remote).',
        'If the screen says “No signal,” press Input or Source and choose the HDMI input the cable box or streaming device is plugged into.',
        'For cable, use the cable box remote to change channels.',
        'For Netflix and other apps, sign in with your own account.',
        'Sign out of your accounts before you check out.',
      ],
      safety: 'Still no picture? Unplug the cable box or streaming device for 30 seconds and plug it back in.',
    },
    thermostat: {
      title: 'Thermostat & AC',
      intro: 'Each floor may have its own thermostat.',
      steps: [
        'Set the mode to Cool or Heat, then set the temperature you want.',
        'Give it 20–30 minutes to change the room temperature.',
        'Keep doors and windows closed while the AC or heat is running.',
        'When cooling, keep it at 70°F or above. Lower settings can freeze the system and stop it cooling at all.',
        'Set it back to a moderate temperature when you leave for the day.',
      ],
      safety: 'If air isn’t coming out of the vents, or there is water dripping near the unit, turn the system off and contact guest services.',
    },
    laundry: {
      title: 'Washer & dryer',
      intro: 'Look for the HE symbol on the washer; most rentals use high-efficiency machines.',
      steps: [
        'Shake sand out of towels and swimsuits outside first. Sand can damage the washer.',
        'Use HE detergent if the washer has the HE symbol, and only the amount on the label.',
        'Don’t overfill: leave room for the clothes to move.',
        'Clean the dryer lint screen before every load.',
        'Beach towels dry best on medium heat in smaller loads.',
      ],
      safety: 'If the washer won’t drain or the dryer isn’t heating, stop using it and contact guest services.',
    },
    elevator: {
      title: 'Elevator',
      intro: 'The elevator serves every floor. Close both doors fully or it won’t move.',
      steps: [
        'Close the outer door and the inner gate completely.',
        'Press and hold the button for your floor if the car doesn’t start right away (some home elevators need a constant press).',
        'Stay within the weight limit posted inside the car.',
        'Open the gate only after the car has fully stopped.',
      ],
      safety: 'Children should not ride alone. If the elevator stops between floors, stay inside, use the phone or alarm button in the car, and call guest services. In an emergency, call 911.',
    },
  },

  // Topics per house, in the order shown. Default when a house isn't listed: DEFAULT.
  DEFAULT: ['hottub', 'tv', 'thermostat', 'laundry'],
  HOUSE_TOPICS: {
    'frw-001': ['hottub', 'tv', 'thermostat', 'laundry', 'elevator'],
    'rbh-001': ['tv', 'hottub', 'thermostat', 'laundry', 'elevator'],
    'rcb-001': ['hottub', 'tv', 'thermostat', 'laundry', 'elevator'],
    'ocf-001': ['hottub', 'tv', 'thermostat', 'laundry', 'elevator'],
  },

  // Which guide a plaque opens first, from the end of its chip ID (e.g. "sts-hottub").
  CHIP_TOPIC: { hottub: 'hottub', theater: 'tv', tv: 'tv', laundry: 'laundry', thermostat: 'thermostat', elevator: 'elevator' },

  topicsFor: function (pid) { return this.HOUSE_TOPICS[pid] || this.DEFAULT; },
};
