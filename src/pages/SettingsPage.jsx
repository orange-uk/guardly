import React from 'react'

const card = {
  background: '#fff', border: '0.5px solid #E4E4E0',
  borderRadius: 12, padding: '20px 24px', marginBottom: 12
}

export default function SettingsPage() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>Settings</h1>
        <p style={{ color: '#6B6B68', fontSize: 13 }}>Manage your Guardly account.</p>
      </div>

      <div style={card}>
        <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Account</h2>
        <p style={{ fontSize: 13, color: '#6B6B68', marginBottom: 16 }}>
          Your Guardly subscription keeps all your family profiles active and protected.
          Contact us at <a href="mailto:support@guardly.app" style={{ color: '#1D9E75' }}>support@guardly.app</a> for
          any account changes.
        </p>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 20,
          background: '#E1F5EE', fontSize: 12, fontWeight: 500, color: '#0F6E56'
        }}>
          ✓ Active
        </div>
      </div>

      <div style={card}>
        <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>How Guardly works</h2>
        <p style={{ fontSize: 13, color: '#6B6B68', lineHeight: 1.7 }}>
          Guardly works by installing a lightweight security profile on your child's device.
          This profile quietly filters DNS requests — the tiny lookups every app makes before
          loading any content. Blocked content simply never loads, on any network, anywhere in the world.
          No app is running in the background and nothing slows the device down.
        </p>
      </div>

      <div style={card}>
        <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>About Guardly</h2>
        <p style={{ fontSize: 13, color: '#6B6B68' }}>
          Guardly makes it simple for parents to keep their children safe online —
          on any device, at home or away. Filters apply instantly across all protected devices.
        </p>
        <p style={{ fontSize: 12, color: '#9B9B97', marginTop: 8 }}>Version 0.1.0</p>
      </div>
    </div>
  )
}
