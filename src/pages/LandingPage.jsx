import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const G = '#1D9E75'
const GD = '#0F6E56'
const GL = '#E1F5EE'

export default function LandingPage() {
  const [mode, setMode] = useState(null) // null | 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function handleAuth(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // --- Replace this block with Clerk/Supabase auth when ready ---
    // For now: store email in localStorage to simulate separate users
    // New email = onboarding, known email = dashboard
    const knownUsers = JSON.parse(localStorage.getItem('guardly_users') || '[]')
    const isKnown = knownUsers.includes(email.toLowerCase())

    setTimeout(() => {
      setLoading(false)
      if (mode === 'signup') {
        if (isKnown) {
          setError('An account with this email already exists. Please sign in instead.')
          return
        }
        localStorage.setItem('guardly_users', JSON.stringify([...knownUsers, email.toLowerCase()]))
        localStorage.setItem('guardly_current_user', email.toLowerCase())
        navigate('/onboarding')
      } else {
        if (!isKnown) {
          setError('No account found with this email. Please sign up first.')
          return
        }
        localStorage.setItem('guardly_current_user', email.toLowerCase())
        navigate('/app')
      }
    }, 600)
    // --- End placeholder auth ---
  }

  if (mode) {
    return (
      <div style={{
        minHeight: '100vh', background: '#F7F7F5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Georgia', serif"
      }}>
        <div style={{
          background: '#fff', borderRadius: 16, border: '0.5px solid #E4E4E0',
          padding: '40px 48px', width: '100%', maxWidth: 420,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: G,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: '#fff'
            }}>🛡</div>
            <span style={{ fontWeight: 600, fontSize: 18, fontFamily: 'Georgia, serif', color: '#1A1A18' }}>Guardly</span>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 6, color: '#1A1A18', fontFamily: 'Georgia, serif' }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p style={{ fontSize: 14, color: '#6B6B68', marginBottom: 28, fontFamily: 'system-ui, sans-serif' }}>
            {mode === 'login'
              ? 'Sign in to manage your family profiles.'
              : 'Protect your children online in minutes.'}
          </p>

          {error && (
            <div style={{
              background: '#FCEBEB', border: '0.5px solid #F0A0A0',
              borderRadius: 8, padding: '10px 14px', marginBottom: 16,
              fontSize: 13, color: '#A32D2D', fontFamily: 'system-ui, sans-serif'
            }}>{error}</div>
          )}

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#6B6B68', display: 'block', marginBottom: 4, fontFamily: 'system-ui, sans-serif' }}>Your name</label>
                <input
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="Jane Smith" required
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    border: '0.5px solid #E4E4E0', fontSize: 14,
                    fontFamily: 'system-ui, sans-serif', outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            )}
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#6B6B68', display: 'block', marginBottom: 4, fontFamily: 'system-ui, sans-serif' }}>Email address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8,
                  border: '0.5px solid #E4E4E0', fontSize: 14,
                  fontFamily: 'system-ui, sans-serif', outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#6B6B68', display: 'block', marginBottom: 4, fontFamily: 'system-ui, sans-serif' }}>Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8,
                  border: '0.5px solid #E4E4E0', fontSize: 14,
                  fontFamily: 'system-ui, sans-serif', outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px', borderRadius: 8,
              background: loading ? '#5DCAA5' : G, color: '#fff',
              border: 'none', fontSize: 14, fontWeight: 600,
              cursor: loading ? 'default' : 'pointer', marginTop: 8,
              fontFamily: 'system-ui, sans-serif',
              transition: 'background 0.15s'
            }}>
              {loading ? 'Just a moment…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p style={{ fontSize: 13, color: '#9B9B97', marginTop: 24, textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null) }}
              style={{ background: 'none', border: 'none', color: G, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
          <p style={{ fontSize: 12, color: '#C0C0BB', marginTop: 8, textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
            {mode === 'signup' && 'Free 14-day trial · No credit card required'}
          </p>

          <button onClick={() => setMode(null)} style={{
            display: 'block', margin: '20px auto 0', background: 'none',
            border: 'none', color: '#C0C0BB', fontSize: 12, cursor: 'pointer',
            fontFamily: 'system-ui, sans-serif'
          }}>← Back</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Georgia, serif', background: '#fff', minHeight: '100vh' }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fade-1 { animation: fadeUp 0.6s ease forwards; }
        .fade-2 { animation: fadeUp 0.6s 0.15s ease both; }
        .fade-3 { animation: fadeUp 0.6s 0.3s ease both; }
        .fade-4 { animation: fadeUp 0.6s 0.45s ease both; }
        .feat:hover { border-color: #5DCAA5 !important; }
      `}</style>

      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: 60, borderBottom: '0.5px solid #F0F0EE',
        position: 'sticky', top: 0, background: '#fff', zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, background: G,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: '#fff'
          }}>🛡</div>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#1A1A18' }}>Guardly</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setMode('login')} style={{
            background: 'none', border: 'none', fontSize: 14, color: '#6B6B68',
            cursor: 'pointer', fontFamily: 'system-ui, sans-serif'
          }}>Sign in</button>
          <button onClick={() => setMode('signup')} style={{
            background: G, color: '#fff', border: 'none', borderRadius: 8,
            padding: '8px 20px', fontSize: 14, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'system-ui, sans-serif'
          }}>Start free trial</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        maxWidth: 820, margin: '0 auto', padding: '80px 48px 64px',
        textAlign: 'center'
      }}>
        <div className="fade-1" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: GL, color: GD, fontSize: 12, fontWeight: 500,
          padding: '6px 14px', borderRadius: 20, marginBottom: 28,
          fontFamily: 'system-ui, sans-serif'
        }}>
          ✓ Trusted by families across the UK
        </div>

        <h1 className="fade-2" style={{
          fontSize: 52, fontWeight: 700, lineHeight: 1.15,
          color: '#1A1A18', marginBottom: 20, letterSpacing: '-0.02em'
        }}>
          Keep your children safe<br />
          <span style={{ color: G }}>wherever they go online</span>
        </h1>

        <p className="fade-3" style={{
          fontSize: 18, color: '#6B6B68', lineHeight: 1.7, marginBottom: 36,
          fontFamily: 'system-ui, sans-serif', maxWidth: 560, margin: '0 auto 36px'
        }}>
          Guardly quietly filters the internet on every device your child uses —
          at home, at school, or at a friend's house. Set it up in minutes, forget about it.
        </p>

        <div className="fade-4" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setMode('signup')} style={{
            background: G, color: '#fff', border: 'none', borderRadius: 10,
            padding: '14px 32px', fontSize: 16, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'system-ui, sans-serif'
          }}>
            Start free — 14 days
          </button>
          <button onClick={() => setMode('login')} style={{
            background: '#fff', color: '#1A1A18', border: '0.5px solid #E4E4E0',
            borderRadius: 10, padding: '14px 32px', fontSize: 16,
            cursor: 'pointer', fontFamily: 'system-ui, sans-serif'
          }}>
            Sign in
          </button>
        </div>
        <p style={{ fontSize: 12, color: '#C0C0BB', marginTop: 12, fontFamily: 'system-ui, sans-serif' }}>
          No credit card required
        </p>
      </div>

      {/* How it works */}
      <div style={{ background: '#F7F7F5', padding: '64px 48px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', marginBottom: 8, color: '#1A1A18' }}>
            How it works
          </h2>
          <p style={{ fontSize: 15, color: '#6B6B68', textAlign: 'center', marginBottom: 48, fontFamily: 'system-ui, sans-serif' }}>
            Three steps from sign-up to protected
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { n: '1', title: 'Create a profile', desc: 'Set up a profile for each child with the content rules that work for your family.' },
              { n: '2', title: 'Install in 60 seconds', desc: 'Follow our step-by-step guide to put the Guardly profile on their iPhone, iPad or Mac.' },
              { n: '3', title: 'Protected everywhere', desc: "That's it. Guardly filters the internet silently on every network — no app running, no battery drain." },
            ].map(({ n, title, desc }) => (
              <div key={n} style={{
                background: '#fff', borderRadius: 12, padding: '28px 24px',
                border: '0.5px solid #E4E4E0'
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: GL,
                  color: GD, fontWeight: 700, fontSize: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16, fontFamily: 'system-ui, sans-serif'
                }}>{n}</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#1A1A18' }}>{title}</h3>
                <p style={{ fontSize: 14, color: '#6B6B68', lineHeight: 1.6, fontFamily: 'system-ui, sans-serif' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '64px 48px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', marginBottom: 8, color: '#1A1A18' }}>
            Everything parents need
          </h2>
          <p style={{ fontSize: 15, color: '#6B6B68', textAlign: 'center', marginBottom: 48, fontFamily: 'system-ui, sans-serif' }}>
            Powerful controls, zero technical knowledge required
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {[
              { icon: '🔞', title: 'Block adult content', desc: 'Adult sites, gambling, dating apps and more — blocked with a single toggle.' },
              { icon: '📱', title: 'Block specific apps', desc: 'TikTok, Roblox, Instagram, Snapchat — block any app by name, instantly.' },
              { icon: '📺', title: 'Control streaming', desc: 'Block Netflix, YouTube, Twitch or other streaming services during homework time.' },
              { icon: '🌍', title: 'Works everywhere', desc: "Home WiFi, school network, 4G — your child's device is always protected." },
              { icon: '👻', title: 'Invisible to children', desc: 'No app icon, no battery drain. The profile works silently in the background.' },
              { icon: '📊', title: 'See what they visit', desc: 'Check the activity log to see which sites were visited and what was blocked.' },
              { icon: '👨‍👩‍👧‍👦', title: 'Multiple children', desc: 'Create separate profiles for each child with different rules for different ages.' },
              { icon: '⚡', title: 'Instant changes', desc: 'Changes you make in the dashboard apply to all devices within seconds.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="feat" style={{
                display: 'flex', gap: 16, padding: '20px 24px',
                borderRadius: 12, border: '0.5px solid #E4E4E0',
                transition: 'border-color 0.15s'
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: GL,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0
                }}>{icon}</div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: '#1A1A18', fontFamily: 'system-ui, sans-serif' }}>{title}</h3>
                  <p style={{ fontSize: 13, color: '#6B6B68', lineHeight: 1.6, fontFamily: 'system-ui, sans-serif' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div style={{ background: '#F7F7F5', padding: '64px 48px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: '#1A1A18' }}>
            Simple pricing
          </h2>
          <p style={{ fontSize: 15, color: '#6B6B68', marginBottom: 40, fontFamily: 'system-ui, sans-serif' }}>
            One plan, unlimited children, all features included
          </p>
          <div style={{
            background: '#fff', borderRadius: 16, border: '0.5px solid #E4E4E0',
            padding: '40px 48px', display: 'inline-block', minWidth: 320
          }}>
            <div style={{ fontSize: 14, color: '#6B6B68', marginBottom: 8, fontFamily: 'system-ui, sans-serif' }}>Family plan</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, justifyContent: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 42, fontWeight: 700, color: '#1A1A18' }}>£3</span>
              <span style={{ fontSize: 16, color: '#6B6B68', fontFamily: 'system-ui, sans-serif' }}>/month</span>
            </div>
            <div style={{ fontSize: 13, color: '#9B9B97', marginBottom: 28, fontFamily: 'system-ui, sans-serif' }}>Billed annually at £36/year</div>
            {[
              'Unlimited children & devices',
              'All content categories',
              'App & site blocking',
              'Activity logs',
              'Works on iPhone, iPad, Mac & Android',
              'Email support',
            ].map(f => (
              <div key={f} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 0', borderBottom: '0.5px solid #F7F7F5',
                fontFamily: 'system-ui, sans-serif', fontSize: 14, color: '#1A1A18'
              }}>
                <span style={{ color: G, fontWeight: 700 }}>✓</span> {f}
              </div>
            ))}
            <button onClick={() => setMode('signup')} style={{
              width: '100%', marginTop: 28, padding: '14px',
              background: G, color: '#fff', border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'system-ui, sans-serif'
            }}>
              Start 14-day free trial
            </button>
            <p style={{ fontSize: 12, color: '#C0C0BB', marginTop: 10, fontFamily: 'system-ui, sans-serif' }}>
              No credit card required
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '0.5px solid #E4E4E0', padding: '24px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🛡</span>
          <span style={{ fontWeight: 600, fontSize: 15, color: '#1A1A18' }}>Guardly</span>
        </div>
        <div style={{ fontSize: 12, color: '#9B9B97', fontFamily: 'system-ui, sans-serif' }}>
          © 2026 Guardly · <a href="mailto:support@guardly.app" style={{ color: '#9B9B97' }}>support@guardly.app</a>
        </div>
      </div>
    </div>
  )
}
