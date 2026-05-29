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
        <p style={{ color: '#6B6B68', fontSize: 13 }}>Manage your Guardly account and configuration.</p>
      </div>

      <div style={card}>
        <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>DNS filtering engine</h2>
        <p style={{ fontSize: 13, color: '#6B6B68', marginBottom: 12 }}>
          Your API key connects Guardly to its filtering engine. To update it, go to your
          Cloudflare Pages dashboard → Settings → Environment Variables and update{' '}
          <code style={{ background: '#F7F7F5', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>NEXTDNS_API_KEY</code>.
        </p>
        <a
          href="https://dash.cloudflare.com"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 8,
            border: '0.5px solid #E4E4E0', fontSize: 13, color: '#1A1A18'
          }}
        >
          Open Cloudflare dashboard ↗
        </a>
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
