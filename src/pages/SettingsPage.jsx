import React from 'react'
import { useAuth } from '../lib/AuthContext'
import { useNavigate } from 'react-router-dom'

const FONT_D = "'Fraunces', Georgia, serif"

function Card({ children }) {
  return <div className="gx-card" style={{ padding: 24, marginBottom: 14 }}>{children}</div>
}

export default function SettingsPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  return (
    <div className="fade-up">
      <h1 style={{ fontFamily: FONT_D, fontSize: 28, fontWeight: 600, marginBottom: 4 }}>Settings</h1>
      <p style={{ color: '#5B655F', fontSize: 15, marginBottom: 22 }}>Manage your Guardly account.</p>

      <Card>
        <h2 style={{ fontFamily: FONT_D, fontSize: 18, marginBottom: 8 }}>Account</h2>
        {auth?.user ? (
          <p style={{ fontSize: 14.5, color: '#5B655F', marginBottom: 16 }}>Signed in as <strong>{auth.user.email}</strong></p>
        ) : (
          <p style={{ fontSize: 14.5, color: '#5B655F', marginBottom: 16 }}>You're using Guardly in preview mode.</p>
        )}
        <span className="gx-pill" style={{ background: '#E8F5EE', color: '#0E5E42' }}>✓ Active</span>
      </Card>

      <Card>
        <h2 style={{ fontFamily: FONT_D, fontSize: 18, marginBottom: 8 }}>How Guardly works</h2>
        <p style={{ fontSize: 14.5, color: '#5B655F', lineHeight: 1.7 }}>
          Guardly installs a lightweight security profile on each child's device. It quietly filters the
          tiny lookups every app makes before loading content, so blocked material never appears — on any
          network, anywhere. Nothing runs in the background and nothing slows the device down.
        </p>
      </Card>

      <Card>
        <h2 style={{ fontFamily: FONT_D, fontSize: 18, marginBottom: 8 }}>Support</h2>
        <p style={{ fontSize: 14.5, color: '#5B655F', marginBottom: 16 }}>Questions or trouble? We're happy to help.</p>
        <a href="mailto:support@guardly.app" className="gx-btn-ghost" style={{ display: 'inline-flex' }}>Email support@guardly.app</a>
      </Card>

      {auth?.user && (
        <button onClick={() => { auth.signOut(); navigate('/') }} className="gx-btn-ghost" style={{ marginTop: 4 }}>Sign out</button>
      )}
    </div>
  )
}
