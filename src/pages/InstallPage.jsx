import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

const card = {
  background: '#fff', border: '0.5px solid #E4E4E0',
  borderRadius: 12, padding: '20px 24px', marginBottom: 12
}

function Step({ n, children }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
      <div style={{
        width: 24, height: 24, borderRadius: '50%', background: '#1D9E75',
        color: '#fff', fontSize: 11, fontWeight: 500, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1
      }}>{n}</div>
      <div style={{ fontSize: 13, color: '#6B6B68', lineHeight: 1.6 }}>{children}</div>
    </div>
  )
}

export default function InstallPage() {
  const { profileId } = useParams()
  const [platform, setPlatform] = useState('iphone')

  // Guardly proxy URLs — engine is invisible to the user
  const configUrl = `${window.location.origin}/api/install/${profileId}`
  const dotHost = 'dns.guardly.app'

  const tabBtn = (p, label) => (
    <button onClick={() => setPlatform(p)} style={{
      padding: '8px 18px', fontSize: 13, cursor: 'pointer',
      border: 'none', background: 'none',
      color: platform === p ? '#1D9E75' : '#6B6B68',
      borderBottom: platform === p ? '2px solid #1D9E75' : '2px solid transparent',
      fontWeight: platform === p ? 500 : 400
    }}>{label}</button>
  )

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>Install on a device</h1>
        <p style={{ color: '#6B6B68', fontSize: 13 }}>
          Follow the steps for the device you want to protect. Takes about 60 seconds.
        </p>
      </div>

      <div style={{ ...card, background: '#E1F5EE', border: '0.5px solid #5DCAA5', marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: '#0F6E56' }}>
          🔒 Once installed, this profile cannot be removed without your admin/parent password.
          The device will be protected on any WiFi network — including at school or a friend's house.
        </p>
      </div>

      <div style={{ display: 'flex', borderBottom: '0.5px solid #E4E4E0', marginBottom: 20 }}>
        {tabBtn('iphone', 'iPhone / iPad')}
        {tabBtn('mac', 'Mac')}
        {tabBtn('android', 'Android')}
        {tabBtn('router', 'Home router')}
      </div>

      {platform === 'iphone' && (
        <div style={card}>
          <h2 style={{ fontSize: 15, fontWeight: 500, marginBottom: 18 }}>iPhone or iPad</h2>
          <Step n="1">On the child's device, open <strong>Safari</strong> (must be Safari, not Chrome or Firefox)</Step>
          <Step n="2">
            Navigate to this URL in Safari:<br />
            <code style={{
              display: 'inline-block', marginTop: 6, padding: '6px 12px',
              background: '#F7F7F5', borderRadius: 6, fontSize: 12,
              border: '0.5px solid #E4E4E0', wordBreak: 'break-all'
            }}>{configUrl}</code>
          </Step>
          <Step n="3">Safari will show a popup saying <strong>"Profile Downloaded"</strong> — tap <strong>Close</strong></Step>
          <Step n="4">Open the <strong>Settings app</strong> on the device</Step>
          <Step n="5">Tap <strong>General → VPN & Device Management</strong></Step>
          <Step n="6">Tap the <strong>Guardly profile</strong> and tap <strong>Install</strong></Step>
          <Step n="7">Enter the device passcode when prompted and tap <strong>Install</strong> again</Step>
          <Step n="8">Done! The device is now protected. All filtering rules apply immediately.</Step>
        </div>
      )}

      {platform === 'mac' && (
        <div style={card}>
          <h2 style={{ fontSize: 15, fontWeight: 500, marginBottom: 18 }}>Mac</h2>
          <Step n="1">On the child's Mac, open <strong>Safari</strong> and go to:<br />
            <code style={{
              display: 'inline-block', marginTop: 6, padding: '6px 12px',
              background: '#F7F7F5', borderRadius: 6, fontSize: 12,
              border: '0.5px solid #E4E4E0', wordBreak: 'break-all'
            }}>{configUrl}</code>
          </Step>
          <Step n="2">The profile file will download — open it when prompted</Step>
          <Step n="3">macOS will say <strong>"Profile Downloaded"</strong> in a notification</Step>
          <Step n="4">Open <strong>System Settings → Privacy & Security → Profiles</strong></Step>
          <Step n="5">Click the <strong>Guardly profile</strong> and click <strong>Install</strong></Step>
          <Step n="6">Enter <strong>your admin password</strong> (your password, not the child's) to approve</Step>
          <Step n="7">Done! The profile is locked — the child cannot remove it without your password.</Step>
          <div style={{
            marginTop: 16, padding: '12px 16px', background: '#FAEEDA',
            borderRadius: 8, fontSize: 12, color: '#854F0B'
          }}>
            ⚠️ Make sure the child's Mac account is a <strong>Standard user</strong>, not an Administrator.
            Go to <strong>System Settings → Users & Groups</strong> to check and change this.
            Admin accounts can remove profiles.
          </div>
        </div>
      )}

      {platform === 'android' && (
        <div style={card}>
          <h2 style={{ fontSize: 15, fontWeight: 500, marginBottom: 18 }}>Android</h2>
          <Step n="1">Open <strong>Settings</strong> on the Android device</Step>
          <Step n="2">Go to <strong>Network & Internet → Advanced → Private DNS</strong>
            <br />(exact path varies by device — search "Private DNS" in Settings if needed)
          </Step>
          <Step n="3">Select <strong>"Private DNS provider hostname"</strong></Step>
          <Step n="4">Enter this hostname:<br />
            <code style={{
              display: 'inline-block', marginTop: 6, padding: '6px 12px',
              background: '#F7F7F5', borderRadius: 6, fontSize: 12,
              border: '0.5px solid #E4E4E0'
            }}>{dotHost}</code>
          </Step>
          <Step n="5">Tap <strong>Save</strong>. The device is now protected.</Step>
          <div style={{
            marginTop: 16, padding: '12px 16px', background: '#FAEEDA',
            borderRadius: 8, fontSize: 12, color: '#854F0B'
          }}>
            ⚠️ Android's Private DNS can be disabled in Settings. For stronger protection,
            use Google Family Link to prevent Settings changes.
          </div>
        </div>
      )}

      {platform === 'router' && (
        <div style={card}>
          <h2 style={{ fontSize: 15, fontWeight: 500, marginBottom: 18 }}>Home router</h2>
          <p style={{ fontSize: 13, color: '#6B6B68', marginBottom: 18 }}>
            Setting up on your router protects every device on your home network — including
            games consoles, smart TVs, and any device that can't install a profile.
          </p>
          <Step n="1">Log into your router admin panel (usually <code>192.168.0.1</code> or <code>192.168.1.1</code>)</Step>
          <Step n="2">Find the <strong>DNS settings</strong> — usually under WAN, Internet, or Advanced settings</Step>
          <Step n="3">
            Set the <strong>DNS-over-TLS</strong> hostname to:<br />
            <code style={{
              display: 'inline-block', marginTop: 6, padding: '6px 12px',
              background: '#F7F7F5', borderRadius: 6, fontSize: 12,
              border: '0.5px solid #E4E4E0'
            }}>{dotHost}</code>
          </Step>
          <Step n="4">
            Or use plain DNS servers:<br />
            <code style={{
              display: 'inline-block', marginTop: 6, padding: '6px 12px',
              background: '#F7F7F5', borderRadius: 6, fontSize: 12,
              border: '0.5px solid #E4E4E0'
            }}>45.90.28.40 / 45.90.30.40</code>
          </Step>
          <Step n="5">Save settings and restart the router if prompted</Step>
        </div>
      )}
    </div>
  )
}
