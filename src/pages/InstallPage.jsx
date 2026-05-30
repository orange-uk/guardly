import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const FONT_D = "'Fraunces', Georgia, serif"

function Step({ n, children }) {
  return (
    <div style={{ display: 'flex', gap: 13, marginBottom: 15 }}>
      <div style={{ width: 25, height: 25, borderRadius: '50%', background: '#1F9D6B', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>{n}</div>
      <div style={{ fontSize: 14.5, color: '#5B655F', lineHeight: 1.6 }}>{children}</div>
    </div>
  )
}

export default function InstallPage() {
  const { profileId } = useParams()
  const navigate = useNavigate()
  const [platform, setPlatform] = useState('iphone')

  const configUrl = `${window.location.origin}/api/install/${profileId}`
  const dotHost = 'dns.guardly.app'

  const tab = (p, label) => (
    <button onClick={() => setPlatform(p)} style={{
      padding: '9px 17px', fontSize: 14, whiteSpace: 'nowrap',
      color: platform === p ? '#0E5E42' : '#5B655F', fontWeight: platform === p ? 600 : 500,
      borderBottom: platform === p ? '2px solid #1F9D6B' : '2px solid transparent'
    }}>{label}</button>
  )

  const Code = ({ children }) => (
    <code style={{ display: 'inline-block', marginTop: 7, padding: '8px 13px', background: '#F7F4ED', borderRadius: 10, fontSize: 12.5, border: '1px solid #EAE5DA', wordBreak: 'break-all', fontFamily: 'monospace' }}>{children}</code>
  )

  return (
    <div className="fade-up">
      <button onClick={() => navigate(`/app/profile/${profileId}`)} style={{ fontSize: 13, color: '#5B655F', marginBottom: 14 }}>← Back to profile</button>
      <h1 style={{ fontFamily: FONT_D, fontSize: 28, fontWeight: 600, marginBottom: 4 }}>Add a device</h1>
      <p style={{ color: '#5B655F', fontSize: 15, marginBottom: 22 }}>Protection installs per device. Pick the device type and follow the steps — about 60 seconds.</p>

      <div className="gx-card" style={{ background: '#E8F5EE', borderColor: '#A9DCC2', padding: '14px 18px', marginBottom: 22 }}>
        <p style={{ fontSize: 14, color: '#0E5E42' }}>🔒 Once installed, the profile can't be removed without your password — and the device stays protected on every network, including school and friends' houses.</p>
      </div>

      <div className="gx-scroll-x" style={{ display: 'flex', gap: 4, borderBottom: '1px solid #EAE5DA', marginBottom: 22 }}>
        {tab('iphone','iPhone / iPad')}{tab('mac','Mac')}{tab('android','Android')}{tab('router','Home router')}
      </div>

      <div className="gx-card" style={{ padding: 24 }}>
        {platform === 'iphone' && (<>
          <h2 style={{ fontFamily: FONT_D, fontSize: 19, marginBottom: 18 }}>iPhone or iPad</h2>
          <Step n="1">On the child's device, open <strong>Safari</strong> (must be Safari)</Step>
          <Step n="2">Go to this address:<br /><Code>{configUrl}</Code></Step>
          <Step n="3">Tap <strong>Allow</strong> when asked to download a configuration profile</Step>
          <Step n="4">Open <strong>Settings → General → VPN & Device Management</strong></Step>
          <Step n="5">Tap the <strong>Guardly profile</strong> and tap <strong>Install</strong></Step>
          <Step n="6">Enter the device passcode to confirm. Done — it's protected.</Step>
        </>)}
        {platform === 'mac' && (<>
          <h2 style={{ fontFamily: FONT_D, fontSize: 19, marginBottom: 18 }}>Mac</h2>
          <Step n="1">On the child's Mac, open <strong>Safari</strong> and go to:<br /><Code>{configUrl}</Code></Step>
          <Step n="2">Open the downloaded file when prompted</Step>
          <Step n="3">Open <strong>System Settings → Privacy & Security → Profiles</strong></Step>
          <Step n="4">Click the <strong>Guardly profile</strong> and click <strong>Install</strong></Step>
          <Step n="5">Enter <strong>your admin password</strong> (yours, not the child's) to approve</Step>
          <div style={{ marginTop: 16, padding: '12px 16px', background: '#FBF1DD', borderRadius: 12, fontSize: 13, color: '#9A6B12' }}>
            ⚠️ Make sure the child's Mac account is a <strong>Standard user</strong>, not an Administrator (System Settings → Users & Groups).
          </div>
        </>)}
        {platform === 'android' && (<>
          <h2 style={{ fontFamily: FONT_D, fontSize: 19, marginBottom: 18 }}>Android</h2>
          <Step n="1">Open <strong>Settings</strong> and search for <strong>Private DNS</strong></Step>
          <Step n="2">Select <strong>Private DNS provider hostname</strong></Step>
          <Step n="3">Enter this hostname:<br /><Code>{dotHost}</Code></Step>
          <Step n="4">Tap <strong>Save</strong>. Done — it's protected.</Step>
          <div style={{ marginTop: 16, padding: '12px 16px', background: '#FBF1DD', borderRadius: 12, fontSize: 13, color: '#9A6B12' }}>
            ⚠️ Android's Private DNS can be changed in Settings. Pair with Google Family Link to lock Settings down.
          </div>
        </>)}
        {platform === 'router' && (<>
          <h2 style={{ fontFamily: FONT_D, fontSize: 19, marginBottom: 18 }}>Home router</h2>
          <p style={{ fontSize: 14, color: '#5B655F', marginBottom: 18 }}>Covers every device on your home network — consoles, smart TVs, and anything that can't take a profile.</p>
          <Step n="1">Log into your router (usually <code>192.168.0.1</code> or <code>192.168.1.1</code>)</Step>
          <Step n="2">Find the <strong>DNS settings</strong> (WAN / Internet / Advanced)</Step>
          <Step n="3">Set the DNS-over-TLS hostname to:<br /><Code>{dotHost}</Code></Step>
          <Step n="4">Save and restart the router if prompted</Step>
        </>)}
      </div>
    </div>
  )
}
