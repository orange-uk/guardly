import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

const FONT_D = "'Fraunces', Georgia, serif"

function Logo({ size = 30 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.27, background: 'linear-gradient(160deg,#27B07A,#1F9D6B)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
        <path d="M12 2 L20 5.5 L20 12 C20 17 16.5 20.5 12 22 C7.5 20.5 4 17 4 12 L4 5.5 Z" fill="#fff" />
        <path d="M8.5 12 l2.5 2.5 l4.5 -5.5" stroke="#1F9D6B" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export default function ResetPasswordPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)

  async function submit(e) {
    e.preventDefault()
    if (password !== confirm) { setError('The two passwords don’t match.'); return }
    if (password.length < 6) { setError('Use at least 6 characters.'); return }
    setLoading(true); setError(null)
    try {
      await auth.updatePassword(password)
      setDone(true)
      setTimeout(() => navigate('/app'), 1500)
    } catch (err) {
      setError(err.message || 'Could not update password. The reset link may have expired — request a new one.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FBF9F4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 18px' }}>
      <div className="gx-card fade-up" style={{ padding: 40, width: '100%', maxWidth: 420, boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 26 }}>
          <Logo size={30} />
          <span style={{ fontFamily: FONT_D, fontWeight: 700, fontSize: 19 }}>Guardly</span>
        </div>

        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#E8F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, margin: '0 auto 18px' }}>✓</div>
            <h1 style={{ fontFamily: FONT_D, fontSize: 24, marginBottom: 10 }}>Password updated</h1>
            <p style={{ color: '#5B655F', fontSize: 14.5 }}>Taking you to your dashboard…</p>
          </div>
        ) : (
          <>
            <h1 style={{ fontFamily: FONT_D, fontSize: 25, marginBottom: 6 }}>Choose a new password</h1>
            <p style={{ color: '#5B655F', fontSize: 14, marginBottom: 22 }}>Enter a new password for your account.</p>
            {error && (
              <div style={{ background: '#FBEAE8', border: '1px solid #E9B5AF', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#C24238' }}>{error}</div>
            )}
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <label style={{ display: 'block' }}>
                <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5B655F', marginBottom: 5 }}>New password</span>
                <input className="gx-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
              </label>
              <label style={{ display: 'block' }}>
                <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5B655F', marginBottom: 5 }}>Confirm new password</span>
                <input className="gx-input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" required minLength={6} />
              </label>
              <button type="submit" className="gx-btn" disabled={loading} style={{ marginTop: 6, width: '100%' }}>
                {loading ? 'Updating…' : 'Update password'}
              </button>
            </form>
            <button onClick={() => navigate('/')} style={{ display: 'block', margin: '18px auto 0', fontSize: 13, color: '#9AA39D' }}>← Back to home</button>
          </>
        )}
      </div>
    </div>
  )
}
