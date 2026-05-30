import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const FONT_D = "'Fraunces', Georgia, serif"

const SECTIONS = [
  {
    icon: '📱', title: 'iPhone & iPad',
    body: [
      'The DNS filtering profile is installed at system level, so it applies to every app and browser — and it works across both WiFi and mobile data.',
      'Combined with Apple Screen Time, you can lock it down so it can\'t be removed:',
    ],
    bullets: [
      'Set a Screen Time passcode only you know (different from the unlock code).',
      'Lock "Account Changes" to "Don\'t Allow" — this stops iCloud switching and blocks installing VPN apps.',
      'The profile then runs silently in the background, everywhere.',
    ],
    result: 'A typical child cannot remove or bypass it without your Screen Time passcode.',
  },
  {
    icon: '💻', title: 'Mac',
    body: [
      'Like iPhone, the DNS profile installs at system level via System Settings. The key is account permissions:',
    ],
    bullets: [
      'Keep a separate admin account for yourself, and give your child a Standard (non-admin) account.',
      'A standard user cannot remove system profiles or change DNS settings.',
      'Use Screen Time on the Mac for additional content controls.',
    ],
    result: 'Without your admin credentials, your child cannot undo the filtering.',
  },
  {
    icon: '🤖', title: 'Android',
    body: [
      'Android varies a little by manufacturer. Filtering is applied through the device\'s Private DNS setting. To lock it down:',
    ],
    bullets: [
      'Use Google Family Link alongside Guardly — it lets you lock device settings and approve app installs.',
      'Family Link prevents children changing network / DNS settings without your approval.',
      'Works across most devices on Android 10 and newer.',
    ],
    result: 'With Family Link active, changes to DNS settings require your approval.',
  },
  {
    icon: '🎒', title: 'Chromebook',
    body: [
      'Chromebooks are managed through your child\'s Google account, so the controls live there:',
    ],
    bullets: [
      'Add your child through Google Family Link as a supervised account, then sign them into the Chromebook with it.',
      'A supervised account can\'t change network or DNS settings, and you approve which apps and extensions they can add.',
      'Family Link also lets you manage screen time and websites for the Chromebook.',
    ],
    result: 'On a supervised Google account, your child can\'t change the DNS or sideload a way around it.',
  },
  {
    icon: '🪟', title: 'Windows',
    body: [
      'On Windows, filtering is applied at the network level. Account type is what keeps it locked:',
    ],
    bullets: [
      'Set your child up with a child account via Microsoft Family Safety, not an administrator account.',
      'A standard Windows account can\'t change DNS settings or network adapters.',
      'Microsoft Family Safety adds app and content controls on top.',
    ],
    result: 'On a standard account, your child cannot modify the DNS settings.',
  },
  {
    icon: '🛡️', title: 'What about VPNs?',
    body: [
      'VPNs are the most common bypass attempt, because they reroute traffic around DNS filtering. The recommended setup makes them hard to install:',
    ],
    bullets: [
      'iPhone / iPad — Screen Time can block VPN app installation entirely.',
      'Mac — a standard (non-admin) account can\'t easily install a system-level VPN.',
      'Android — Family Link can restrict app installs, including VPN apps.',
      'Windows — a standard account can\'t easily install a network-level VPN.',
    ],
    result: 'Locked down per the steps above, the easy VPN routes are closed off. Determined, tech-savvy teens may still find browser-based workarounds — see the honesty note below.',
  },
  {
    icon: '🤝', title: "What it won't catch (our honest take)",
    body: [
      'No filter is 100% perfect, and we\'d rather tell you that plainly:',
    ],
    bullets: [
      'A child who knows your admin password or Screen Time passcode could make changes on any platform — keep those private.',
      'Content on a device outside your control (a friend\'s phone, a school computer) is beyond Guardly\'s reach.',
      'A few apps use their own internal browsing that may not pass through DNS filtering.',
      'Some browser extensions or lesser-known VPN tricks can sidestep DNS on desktop platforms.',
    ],
    result: 'For most families these edge cases are unlikely. For older teens, we\'d pair Guardly with open conversations about online safety — tools work best alongside trust.',
  },
]

function Accordion({ section, open, onToggle }) {
  return (
    <div style={{ borderRadius: 16, border: '1px solid #EAE5DA', background: 'var(--cream-card)', overflow: 'hidden', marginBottom: 12 }}>
      <button onClick={onToggle} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', textAlign: 'left' }}>
        <span style={{ fontSize: 22 }}>{section.icon}</span>
        <span style={{ flex: 1, fontFamily: FONT_D, fontSize: 18, fontWeight: 600 }}>{section.title}</span>
        <span style={{ fontSize: 20, color: '#9AA39D', transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>＋</span>
      </button>
      {open && (
        <div style={{ padding: '0 20px 20px 54px' }}>
          {section.body.map((p, i) => (
            <p key={i} style={{ fontSize: 14.5, color: '#5B655F', lineHeight: 1.6, marginBottom: 10 }}>{p}</p>
          ))}
          <ul style={{ margin: '0 0 14px', paddingLeft: 18 }}>
            {section.bullets.map((b, i) => (
              <li key={i} style={{ fontSize: 14, color: '#5B655F', lineHeight: 1.65, marginBottom: 6 }}>{b}</li>
            ))}
          </ul>
          <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', padding: '11px 14px', background: '#EAF6F0', borderRadius: 12, border: '1px solid #C2E6D5' }}>
            <span style={{ color: '#177A53', fontWeight: 700 }}>✓</span>
            <span style={{ fontSize: 13.5, color: '#177A53', lineHeight: 1.55, fontWeight: 500 }}>{section.result}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SecurityPage() {
  const [open, setOpen] = useState(0)
  const navigate = useNavigate()

  return (
    <div className="fade-up" style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', marginBottom: 24, background: 'linear-gradient(135deg, #EAF6EF 0%, #FBF4E6 60%, #FCEFE8 100%)', border: '1px solid #EAE5DA', padding: '32px' }}>
        <div style={{ position: 'absolute', right: -30, top: -30, width: 150, height: 150, borderRadius: '50%', background: '#1F9D6B', opacity: 0.06 }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 34, marginBottom: 10 }}>🔒</div>
          <h1 style={{ fontFamily: FONT_D, fontSize: 30, fontWeight: 600, marginBottom: 8, letterSpacing: '-0.01em' }}>How secure is Guardly?</h1>
          <p style={{ fontSize: 15.5, color: '#5B655F', lineHeight: 1.6, maxWidth: 540 }}>
            <strong>Is it easy for my child to get around? Short answer: no</strong> — if you follow our recommended setup for their device. On every platform the goal is the same: make the filtering part of the system, not something a child can simply delete or switch off.
          </p>
        </div>
      </div>

      {SECTIONS.map((s, i) => (
        <Accordion key={i} section={s} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
      ))}

      <div style={{ textAlign: 'center', padding: '26px 20px', marginTop: 6 }}>
        <p style={{ fontFamily: FONT_D, fontSize: 18, fontWeight: 600, marginBottom: 6 }}>The bottom line</p>
        <p style={{ fontSize: 14.5, color: '#5B655F', lineHeight: 1.65, maxWidth: 520, margin: '0 auto' }}>
          Set up correctly on each device, Guardly gives real, meaningful protection — and makes bypassing it genuinely difficult for the vast majority of children.
        </p>
      </div>
    </div>
  )
}
