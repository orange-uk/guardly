import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'

/* ---------- Hand-built SVG: warm-skinned parent & child with a device ---------- */
function HeroArt() {
  return (
    <svg viewBox="0 0 460 420" className="gx-hero-art" style={{ width: '100%', maxWidth: 460 }} role="img" aria-label="A parent and child looking at a tablet together, protected by Guardly">
      <defs>
        <linearGradient id="bgblob" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E8F5EE" />
          <stop offset="100%" stopColor="#D4EFE0" />
        </linearGradient>
        <linearGradient id="shield" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#27B07A" />
          <stop offset="100%" stopColor="#1F9D6B" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background blob */}
      <path d="M230 20 C330 20 420 90 430 200 C440 310 360 400 230 400 C110 400 30 320 30 210 C30 90 130 20 230 20 Z" fill="url(#bgblob)" />
      <ellipse cx="230" cy="210" rx="200" ry="200" fill="url(#glow)" />

      {/* Floating shield badge */}
      <g style={{ transformOrigin: '370px 90px', animation: 'float 4s ease-in-out infinite' }}>
        <circle cx="370" cy="90" r="34" fill="#fff" opacity="0.9" />
        <path d="M370 66 L388 74 L388 96 C388 110 380 118 370 122 C360 118 352 110 352 96 L352 74 Z" fill="url(#shield)" />
        <path d="M363 92 l5 5 l10 -12" stroke="#fff" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Parent */}
      <g>
        {/* body */}
        <path d="M150 410 C150 340 175 300 215 300 C255 300 280 340 280 410 Z" fill="#E8795A" />
        {/* neck */}
        <rect x="200" y="262" width="30" height="40" rx="14" fill="#C68A63" />
        {/* head — warm/tan skin */}
        <circle cx="215" cy="232" r="42" fill="#D2A077" />
        {/* hair */}
        <path d="M174 228 C174 192 200 174 215 174 C230 174 256 192 256 228 C256 214 246 206 240 206 C238 192 226 186 215 186 C204 186 192 192 190 206 C184 206 174 214 174 228 Z" fill="#4A332A" />
        <path d="M174 230 C170 250 176 262 180 266 C176 246 180 234 184 228 Z" fill="#4A332A" />
        {/* face */}
        <circle cx="202" cy="232" r="3.4" fill="#3A2A22" />
        <circle cx="228" cy="232" r="3.4" fill="#3A2A22" />
        <path d="M208 246 q7 7 14 0" stroke="#9C5E3F" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      </g>

      {/* Child — leaning into parent */}
      <g>
        <path d="M250 410 C250 360 268 332 298 332 C328 332 346 360 346 410 Z" fill="#3E7CB1" />
        <rect x="288" y="306" width="24" height="32" rx="11" fill="#D9A878" />
        <circle cx="300" cy="284" r="33" fill="#E8B98C" />
        {/* hair */}
        <path d="M268 282 C268 254 286 240 300 240 C314 240 332 254 332 282 C332 270 324 262 314 262 C312 252 306 248 300 248 C294 248 288 252 286 262 C276 262 268 270 268 282 Z" fill="#5A4030" />
        <circle cx="290" cy="285" r="3" fill="#3A2A22" />
        <circle cx="311" cy="285" r="3" fill="#3A2A22" />
        <path d="M294 296 q6 6 12 0" stroke="#B57A4E" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </g>

      {/* Tablet they're looking at */}
      <g style={{ transformOrigin: '232px 350px' }}>
        <rect x="196" y="330" width="92" height="64" rx="9" fill="#1A2420" />
        <rect x="202" y="336" width="80" height="52" rx="5" fill="#E8F5EE" />
        {/* little shield on screen */}
        <path d="M242 346 L254 351 L254 366 C254 375 248 380 242 383 C236 380 230 375 230 366 L230 351 Z" fill="url(#shield)" />
        <path d="M237 365 l4 4 l7 -9" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* sparkles */}
      <g fill="#27B07A">
        <path d="M96 130 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 Z" opacity="0.5" />
        <path d="M400 250 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 Z" opacity="0.4" />
      </g>
    </svg>
  )
}

const FONT_D = "'Fraunces', Georgia, serif"
const FONT_B = "'Plus Jakarta Sans', sans-serif"

/* Supported-platform brand glyphs (inline SVG, monochrome, on-brand) */
function DeviceLogos() {
  const c = '#5B655F'
  const logos = [
    ['Apple', (
      <svg width="26" height="26" viewBox="0 0 24 24" fill={c}><path d="M17.05 12.54c-.02-2.05 1.68-3.04 1.75-3.09-.95-1.4-2.44-1.59-2.97-1.61-1.27-.13-2.47.74-3.11.74-.64 0-1.63-.72-2.68-.7-1.38.02-2.65.8-3.36 2.04-1.43 2.49-.37 6.17 1.03 8.19.68.99 1.5 2.1 2.57 2.06 1.03-.04 1.42-.67 2.67-.67 1.24 0 1.6.67 2.69.65 1.11-.02 1.81-1.01 2.49-2 .78-1.15 1.11-2.26 1.13-2.32-.02-.01-2.17-.83-2.2-3.29zM15.01 6.5c.57-.69.95-1.65.85-2.6-.82.03-1.81.54-2.39 1.23-.52.61-.98 1.58-.86 2.51.91.07 1.84-.46 2.4-1.14z"/></svg>
    )],
    ['Android', (
      <svg width="26" height="26" viewBox="0 0 24 24" fill={c}><path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24c-1.43-.65-3.03-1.01-4.71-1.01s-3.28.36-4.71 1.01L5.17 5.67c-.18-.28-.54-.37-.83-.22-.3.16-.42.54-.26.85L5.92 9.48C2.92 11.07.96 14.05.5 17.5h23c-.46-3.45-2.42-6.43-5.4-8.02zM7 15.25a1 1 0 110-2 1 1 0 010 2zm10 0a1 1 0 110-2 1 1 0 010 2z"/></svg>
    )],
    ['Chromebook', (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.5" stroke={c} strokeWidth="1.8"/><circle cx="12" cy="12" r="3.4" stroke={c} strokeWidth="1.8"/><path d="M12 8.6h8.4M8.9 13.7l-4 7M15.1 13.7l-4 7" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>
    )],
    ['Windows', (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={c}><path d="M3 5.7l7.2-1v6.6H3V5.7zm0 12.6l7.2 1v-6.5H3v5.5zm8.1 1.1L21 21V12.3h-9.9v6.1zm0-13.9v6.2H21V3l-9.9 1.4z"/></svg>
    )],
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
      {logos.map(([label, svg]) => (
        <div key={label} title={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, opacity: 0.85 }}>
          {svg}
          <span style={{ fontSize: 10.5, color: '#9AA39D', fontWeight: 600 }}>{label}</span>
        </div>
      ))}
    </div>
  )
}

/* ---------- Auth card ---------- */
function AuthCard({ mode, setMode, onClose }) {
  const navigate = useNavigate()
  const auth = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [checkInbox, setCheckInbox] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)

  async function handleForgot() {
    if (!email.trim()) { setError('Enter your email above first, then tap “Forgot password”.'); return }
    setLoading(true); setError(null)
    try {
      await auth.resetPassword(email)
      setForgotSent(true)
    } catch (err) { setError(err.message || 'Could not send reset email.') }
    finally { setLoading(false) }
  }

  async function submit(e) {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      if (isSupabaseConfigured()) {
        if (mode === 'signup') {
          const res = await auth.signUp(email, password, firstName.trim(), lastName.trim())
          if (res.needsConfirmation) {
            // Email confirmation is on — show the check-inbox screen instead
            // of bouncing to the landing page.
            setCheckInbox(true)
            setLoading(false)
            return
          }
          navigate('/onboarding')
        } else {
          await auth.signIn(email, password)
          navigate('/app')
        }
      } else {
        const known = JSON.parse(localStorage.getItem('guardly_users') || '[]')
        const isKnown = known.includes(email.toLowerCase())
        if (mode === 'signup') {
          if (isKnown) { setError('An account with this email already exists. Please sign in.'); setLoading(false); return }
          localStorage.setItem('guardly_users', JSON.stringify([...known, email.toLowerCase()]))
          localStorage.setItem('guardly_current_user', email.toLowerCase())
          navigate('/onboarding')
        } else {
          if (!isKnown) { setError('No account found with this email. Please sign up first.'); setLoading(false); return }
          localStorage.setItem('guardly_current_user', email.toLowerCase())
          navigate('/app')
        }
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(26,36,32,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="fade-up" style={{
        background: '#fff', borderRadius: 24, padding: '40px 40px', width: '100%', maxWidth: 420,
        boxShadow: '0 8px 40px rgba(26,36,32,0.18)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 26 }}>
          <Logo size={30} />
          <span style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: 19 }}>Guardly</span>
        </div>

        {checkInbox ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#E8F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, margin: '0 auto 18px' }}>✉️</div>
            <h1 style={{ fontFamily: FONT_D, fontSize: 24, marginBottom: 10 }}>Check your inbox</h1>
            <p style={{ color: '#5B655F', fontSize: 14.5, lineHeight: 1.65, marginBottom: 8 }}>
              We've sent a confirmation link to <strong>{email}</strong>.
            </p>
            <p style={{ color: '#5B655F', fontSize: 14.5, lineHeight: 1.65, marginBottom: 24 }}>
              Click the link in that email to activate your account, then come back and sign in.
            </p>
            <button onClick={() => { setCheckInbox(false); setMode('login') }} className="gx-btn" style={{ width: '100%' }}>
              Back to sign in
            </button>
            <p style={{ fontSize: 12.5, color: '#9AA39D', marginTop: 16, lineHeight: 1.6 }}>
              Didn't get it? Check your spam folder, or wait a minute and try again. Links expire after a while, so use the most recent email.
            </p>
          </div>
        ) : forgotSent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#E8F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, margin: '0 auto 18px' }}>🔑</div>
            <h1 style={{ fontFamily: FONT_D, fontSize: 24, marginBottom: 10 }}>Reset link sent</h1>
            <p style={{ color: '#5B655F', fontSize: 14.5, lineHeight: 1.65, marginBottom: 24 }}>
              We've emailed a password reset link to <strong>{email}</strong>. Click it to choose a new password.
            </p>
            <button onClick={() => { setForgotSent(false); setMode('login') }} className="gx-btn" style={{ width: '100%' }}>
              Back to sign in
            </button>
            <p style={{ fontSize: 12.5, color: '#9AA39D', marginTop: 16, lineHeight: 1.6 }}>
              Didn't get it? Check your spam folder. The link expires after a while, so use the most recent email.
            </p>
          </div>
        ) : (
        <>
        <h1 style={{ fontFamily: FONT_D, fontSize: 26, marginBottom: 6 }}>
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p style={{ color: '#5B655F', fontSize: 14, marginBottom: 24 }}>
          {mode === 'login' ? 'Sign in to manage your family.' : 'Protect your children in minutes.'}
        </p>

        {error && (
          <div style={{ background: '#FBEAE8', border: '1px solid #E9B5AF', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#C24238' }}>
            {error}
          </div>
        )}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'signup' && (
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <Field label="First name">
                  <input className="gx-input" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jane" required />
                </Field>
              </div>
              <div style={{ flex: 1 }}>
                <Field label="Last name">
                  <input className="gx-input" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Smith" required />
                </Field>
              </div>
            </div>
          )}
          <Field label="Email address">
            <input className="gx-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </Field>
          <Field label="Password">
            <input className="gx-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
          </Field>
          {mode === 'login' && (
            <button type="button" onClick={handleForgot} style={{ alignSelf: 'flex-start', fontSize: 13, color: '#1F9D6B', fontWeight: 600, marginTop: -4 }}>
              Forgot password?
            </button>
          )}
          <button type="submit" className="gx-btn" disabled={loading} style={{ marginTop: 6, width: '100%' }}>
            {loading ? 'Just a moment…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p style={{ fontSize: 13, color: '#9AA39D', marginTop: 22, textAlign: 'center' }}>
          {mode === 'login' ? "New to Guardly? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null) }}
            style={{ color: '#1F9D6B', fontWeight: 600, fontSize: 13 }}>
            {mode === 'login' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>
        {mode === 'signup' && (
          <p style={{ fontSize: 12, color: '#9AA39D', marginTop: 8, textAlign: 'center' }}>
            14-day free trial · No card required
          </p>
        )}
        </>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5B655F', marginBottom: 5 }}>{label}</span>
      {children}
    </label>
  )
}

function Logo({ size = 30 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.27,
      background: 'linear-gradient(160deg,#27B07A,#1F9D6B)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      boxShadow: '0 2px 8px rgba(31,157,107,0.35)'
    }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
        <path d="M12 2 L20 5.5 L20 12 C20 17 16.5 20.5 12 22 C7.5 20.5 4 17 4 12 L4 5.5 Z" fill="#fff" />
        <path d="M8.5 12 l2.5 2.5 l4.5 -5.5" stroke="#1F9D6B" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export default function LandingPage() {
  const [authMode, setAuthMode] = useState(null)
  const navigate = useNavigate()
  const auth = useAuth()

  return (
    <div style={{ background: '#FBF9F4', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* NAV */}
      <nav className="gx-section-pad" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: 68, position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(251,249,244,0.85)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #EAE5DA'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <Logo size={32} />
          <span style={{ fontFamily: FONT_D, fontWeight: 700, fontSize: 20 }}>Guardly</span>
        </div>
        <div className="gx-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 30, fontSize: 14, fontWeight: 500, color: '#5B655F' }}>
          <a href="#how">How it works</a>
          <a href="#why">Why Guardly</a>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {auth?.user ? (
            <button onClick={() => navigate('/app')} className="gx-btn" style={{ padding: '10px 20px', fontSize: 14 }}>Go to dashboard →</button>
          ) : (<>
            <button onClick={() => setAuthMode('login')} style={{ fontSize: 14, fontWeight: 600, color: '#1A2420', padding: '8px 4px' }}>Sign in</button>
            <button onClick={() => setAuthMode('signup')} className="gx-btn" style={{ padding: '10px 20px', fontSize: 14 }}>Start free</button>
          </>)}
        </div>
      </nav>

      {/* HERO */}
      <header className="gx-section-pad" style={{ maxWidth: 1140, margin: '0 auto', padding: '70px 48px 80px' }}>
        <div className="gx-hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 48, alignItems: 'center' }}>
          <div>
            <div className="fade-up gx-pill" style={{ background: '#E8F5EE', color: '#0E5E42', marginBottom: 22 }}>
              <span>🛡</span> Trusted by families across the UK
            </div>
            <h1 className="fade-up d1 gx-hero-h1" style={{ fontFamily: FONT_D, fontSize: 56, fontWeight: 600, lineHeight: 1.08, marginBottom: 22 }}>
              Keep your children safe <span style={{ color: '#1F9D6B', fontStyle: 'italic' }}>wherever</span> they go online
            </h1>
            <p className="fade-up d2" style={{ fontSize: 19, color: '#5B655F', lineHeight: 1.65, marginBottom: 32, maxWidth: 480 }}>
              Guardly quietly filters the internet on every device your child uses — at home, at school,
              or at a friend's house. Set it up once in minutes, then forget about it.
            </p>
            <div className="fade-up d3" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {auth?.user ? (
                <button onClick={() => navigate('/app')} className="gx-btn" style={{ padding: '15px 30px', fontSize: 16 }}>Go to your dashboard →</button>
              ) : (
                <button onClick={() => setAuthMode('signup')} className="gx-btn" style={{ padding: '15px 30px', fontSize: 16 }}>Start your free trial</button>
              )}
              <a href="#how" className="gx-btn-ghost" style={{ padding: '15px 30px', fontSize: 16 }}>See how it works</a>
            </div>
            <div className="fade-up d4" style={{ display: 'flex', gap: 22, marginTop: 28, fontSize: 13, color: '#5B655F', flexWrap: 'wrap' }}>
              <span>✓ No card required</span>
              <span>✓ Works on every device</span>
              <span>✓ Set up in 3 minutes</span>
            </div>
            <div className="fade-up d4" style={{ marginTop: 22 }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9AA39D', marginBottom: 12 }}>Protects every device your child uses</div>
              <DeviceLogos />
            </div>
          </div>
          <div className="fade-up d2"><HeroArt /></div>
        </div>
      </header>

      {/* TRUST STRIP */}
      <div style={{ borderTop: '1px solid #EAE5DA', borderBottom: '1px solid #EAE5DA', background: '#fff' }}>
        <div className="gx-section-pad gx-feat-grid" style={{
          maxWidth: 1000, margin: '0 auto', padding: '28px 48px',
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, textAlign: 'center'
        }}>
          {[['60s','Average setup time'],['Every','Network covered'],['0','Apps to uninstall'],['£3','Per month, all-in']].map(([big, small]) => (
            <div key={small}>
              <div style={{ fontFamily: FONT_D, fontSize: 30, fontWeight: 600, color: '#1F9D6B' }}>{big}</div>
              <div style={{ fontSize: 13, color: '#5B655F', marginTop: 2 }}>{small}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section id="how" className="gx-section-pad" style={{ maxWidth: 1000, margin: '0 auto', padding: '84px 48px' }}>
        <Centered eyebrow="How it works" title="Three steps to peace of mind" />
        <div className="gx-feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22, marginTop: 48 }}>
          {[
            ['1','Create a profile','Add each child and choose the content rules that suit their age. Sensible defaults are ready in one tap.'],
            ['2','Install in 60 seconds','Follow our plain-English guide to add the Guardly profile to their iPhone, iPad or Mac. No tech skills needed.'],
            ['3','Protected everywhere','That\'s it. Guardly filters the internet silently on every network — no app running, no battery drain, nothing to uninstall.'],
          ].map(([n, t, d]) => (
            <div key={n} className="gx-card" style={{ padding: '30px 26px' }}>
              <div style={{ width: 42, height: 42, borderRadius: 13, background: '#E8F5EE', color: '#0E5E42', fontFamily: FONT_D, fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>{n}</div>
              <h3 style={{ fontSize: 19, marginBottom: 8 }}>{t}</h3>
              <p style={{ fontSize: 14.5, color: '#5B655F', lineHeight: 1.65 }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY GUARDLY */}
      <section id="why" style={{ background: '#0E5E42', color: '#fff' }}>
        <div className="gx-section-pad" style={{ maxWidth: 1040, margin: '0 auto', padding: '84px 48px' }}>
          <div className="gx-hero-grid" style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 56, alignItems: 'center' }}>
            <div>
              <div className="gx-pill" style={{ background: 'rgba(255,255,255,0.12)', color: '#A9DCC2', marginBottom: 18 }}>Why Guardly</div>
              <h2 style={{ fontFamily: FONT_D, fontSize: 38, fontWeight: 600, lineHeight: 1.15, marginBottom: 18, color: '#fff' }}>
                Other controls break the moment your child leaves the house
              </h2>
              <p style={{ fontSize: 16.5, lineHeight: 1.7, color: '#C7E5D5' }}>
                Most parental controls live on the home router or in an app a curious child can delete.
                Guardly is different — protection lives on the device itself and travels with it everywhere.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                ['🌍','Works on every network','Home Wi-Fi, mobile data, school, a friend\'s house — the same rules apply everywhere, automatically.'],
                ['👻','Invisible & tamper-proof','No app icon to spot, nothing to uninstall. The profile is locked and can\'t be removed without your password.'],
                ['⚡','Instant control','Block a new app, force safe search, or set recreation hours — changes take effect in minutes.'],
                ['🔋','Nothing running','No background app draining the battery or slowing the device down. It just quietly works.'],
              ].map(([icon, t, d]) => (
                <div key={t} style={{ display: 'flex', gap: 16, padding: '18px 20px', background: 'rgba(255,255,255,0.07)', borderRadius: 16 }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15.5, marginBottom: 3 }}>{t}</div>
                    <div style={{ fontSize: 14, color: '#B5D9C6', lineHeight: 1.6 }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="gx-section-pad" style={{ maxWidth: 1040, margin: '0 auto', padding: '84px 48px' }}>
        <Centered eyebrow="Everything you need" title="Powerful controls, zero complexity" />
        <div className="gx-feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, marginTop: 48 }}>
          {[
            ['🔞','Block adult content','Adult sites, gambling, dating and more — off with a single toggle.'],
            ['📱','Block specific apps','TikTok, Roblox, Snapchat, Instagram — block any app by name, instantly.'],
            ['📺','Control streaming','Allow YouTube, Netflix or Twitch only during set recreation hours.'],
            ['⏰','Set time limits','Schedule downtime — block everything during school or after bedtime.'],
            ['🎮','Recreation time','Set the daily window when fun apps are allowed — blocked outside it.'],
            ['📊','See the activity','A clear, readable log of what was visited and what was blocked.'],
            ['👨‍👩‍👧‍👦','One profile per child','Different rules for different ages, all from one dashboard.'],
            ['🔒','Locked & private','Tamper-proof profiles. Your family\'s data stays yours.'],
          ].map(([icon, t, d]) => (
            <div key={t} className="gx-card" style={{ display: 'flex', gap: 16, padding: '22px 24px' }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: '#E8F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icon}</div>
              <div>
                <h3 style={{ fontSize: 16, marginBottom: 4 }}>{t}</h3>
                <p style={{ fontSize: 14, color: '#5B655F', lineHeight: 1.6 }}>{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ background: '#fff', borderTop: '1px solid #EAE5DA' }}>
        <div className="gx-section-pad" style={{ maxWidth: 560, margin: '0 auto', padding: '84px 48px', textAlign: 'center' }}>
          <Centered eyebrow="Simple pricing" title="One plan. Everything included." />
          <div className="gx-card" style={{ padding: '40px 44px', marginTop: 40, textAlign: 'left', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: FONT_D, fontSize: 17, fontWeight: 600 }}>Family plan</span>
              <span><span style={{ fontFamily: FONT_D, fontSize: 42, fontWeight: 600 }}>£3</span><span style={{ color: '#5B655F', fontSize: 15 }}>/mo</span></span>
            </div>
            <p style={{ fontSize: 13, color: '#9AA39D', marginBottom: 24 }}>Billed annually at £36/year · cancel anytime</p>
            {['Unlimited children & devices','All content categories','App & site blocking','Time limits & schedules','Safe search & YouTube restriction','Activity reports','iPhone, iPad, Mac, Android, Chromebook & Windows','Friendly email support'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', fontSize: 14.5 }}>
                <span style={{ color: '#1F9D6B', fontWeight: 700 }}>✓</span> {f}
              </div>
            ))}
            <button onClick={() => setAuthMode('signup')} className="gx-btn" style={{ width: '100%', marginTop: 26, padding: '15px' }}>
              Start 14-day free trial
            </button>
            <p style={{ fontSize: 12, color: '#9AA39D', marginTop: 10, textAlign: 'center' }}>No card required</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="gx-section-pad" style={{ maxWidth: 1040, margin: '0 auto', padding: '32px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo size={26} />
          <span style={{ fontFamily: FONT_D, fontWeight: 600 }}>Guardly</span>
        </div>
        <div style={{ fontSize: 13, color: '#9AA39D' }}>© 2026 Guardly · <a href="mailto:support@guardly.app" style={{ color: '#5B655F' }}>support@guardly.app</a></div>
      </footer>

      {authMode && <AuthCard mode={authMode} setMode={setAuthMode} onClose={() => setAuthMode(null)} />}
    </div>
  )
}

function Centered({ eyebrow, title }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="gx-pill" style={{ background: '#E8F5EE', color: '#0E5E42', marginBottom: 14 }}>{eyebrow}</div>
      <h2 style={{ fontFamily: FONT_D, fontSize: 36, fontWeight: 600 }}>{title}</h2>
    </div>
  )
}
