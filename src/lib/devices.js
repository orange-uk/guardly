// src/lib/devices.js
// Single source of truth for supported device types + their setup steps,
// so the install screen and onboarding always match.

export const DEVICE_GROUPS = [
  {
    group: 'Apple devices',
    note: 'Protected everywhere — travels with the device, tamper-proof',
    items: ['iphone', 'mac'],
  },
  {
    group: 'Other devices',
    note: 'Set up via the device’s DNS settings',
    items: ['android', 'tablet', 'chromebook', 'windows'],
  },
]

export const DEVICES = {
  iphone:    { label: 'iPhone or iPad', icon: '📱', placeholder: "e.g. Emma's iPhone" },
  mac:       { label: 'Mac',            icon: '💻', placeholder: "e.g. Emma's MacBook" },
  android:   { label: 'Android phone',  icon: '🤖', placeholder: "e.g. Emma's phone" },
  tablet:    { label: 'Android / Fire tablet', icon: '📲', placeholder: "e.g. Emma's tablet" },
  chromebook:{ label: 'Chromebook',     icon: '🌐', placeholder: "e.g. Emma's Chromebook" },
  windows:   { label: 'Windows PC',     icon: '🖥️', placeholder: "e.g. Emma's laptop" },
}

// Returns ordered list of {id, label, icon} for pickers
export function deviceList() {
  return DEVICE_GROUPS.flatMap(g => g.items.map(id => ({ id, ...DEVICES[id] })))
}

// Setup steps for a device. configUrl = Guardly install link, dotHost = hostname.
export function deviceSteps(id, configUrl, dotHost, deviceName) {
  const name = deviceName || 'the device'
  switch (id) {
    case 'iphone':
      return {
        kind: 'link', value: configUrl, valueLabel: 'Guardly install link',
        steps: [
          `On ${name}, open Safari (must be Safari)`,
          'Go to the Guardly link below and tap Allow',
          'Open Settings → General → VPN & Device Management',
          'Tap the Guardly profile → Install',
          'Enter the device passcode to confirm',
        ],
        lockdown: {
          intro: "Without this step, a child can simply delete the Guardly profile and remove all protection. To stop that, lock the device so the profile can't be removed:",
          steps: [
            'Make sure the device is signed in with your child\'s own (child) Apple ID — set up through Family Sharing, not your adult account.',
            'On the device: Settings → Screen Time → turn it on and set a Screen Time passcode only you know (different from the unlock code).',
            'Go to Screen Time → Content & Privacy Restrictions → turn it on.',
            'Under "Allow Changes To", tap Accounts → set to Don\'t Allow.',
            'This greys out the Apple ID and blocks profile removal — now the child can\'t delete Guardly without your Screen Time passcode.',
          ],
        },
      }
    case 'mac':
      return {
        kind: 'link', value: configUrl, valueLabel: 'Guardly install link',
        steps: [
          `On ${name}, open Safari and go to the link below`,
          'Open the downloaded file when prompted',
          'Open System Settings → Privacy & Security → Profiles',
          'Click the Guardly profile → Install',
          "Enter your admin password (not the child's) to approve",
        ],
        warn: "Make sure the child's Mac account is a Standard user, not an Administrator (System Settings → Users & Groups).",
      }
    case 'android':
    case 'tablet':
      return {
        kind: 'host', value: dotHost, valueLabel: 'Private DNS hostname',
        steps: [
          `On ${name}, open Settings`,
          'Search for "Private DNS"',
          'Choose "Private DNS provider hostname"',
          'Enter the hostname below and tap Save',
        ],
        warn: id === 'tablet'
          ? 'Amazon Fire tablets: the steps are the same. If "Private DNS" isn’t in Settings, search for it in the settings search bar.'
          : 'Android’s Private DNS can be changed in Settings. Pair with Google Family Link to lock Settings down.',
      }
    case 'chromebook':
      return {
        kind: 'host', value: dotHost, valueLabel: 'Secure DNS hostname',
        steps: [
          `On ${name}, open Settings`,
          'Go to Security and Privacy → Use secure DNS',
          'Choose "With a custom provider"',
          'Enter the hostname below',
        ],
        warn: 'Sign-in to the Chromebook with the child’s managed Google account so the setting stays locked.',
      }
    case 'windows':
      return {
        kind: 'host', value: dotHost, valueLabel: 'DNS-over-HTTPS hostname',
        steps: [
          `On ${name}, open Settings → Network & Internet`,
          'Click your connection → Hardware properties',
          'Next to DNS server assignment, click Edit → Manual',
          'Turn on IPv4, set Preferred DNS encryption to "Encrypted only", and enter the hostname below',
        ],
        warn: 'Use a Standard (non-administrator) Windows account for the child so the setting can’t be changed.',
      }
    default:
      return { kind: 'host', value: dotHost, valueLabel: 'Hostname', steps: [] }
  }
}
