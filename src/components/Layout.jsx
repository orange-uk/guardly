import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { getProfiles } from '../api'
import { useAuth } from '../lib/AuthContext'
import { getOwnedProfileIds } from '../lib/AuthContext'
import { useIsMobile } from '../hooks/useMediaQuery'

const FONT_D = "'Fraunces', Georgia, serif"
const AVATARS = ['🦊','🐻','🐼','🐰','🦁','🐨','🐸','🐯']

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

export default function Layout() {
  const [profiles, setProfiles] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const auth = useAuth()

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const data = await getProfiles()
      let list = data.data || []
      if (auth?.user) {
        const owned = await getOwnedProfileIds(auth.user.id)
        if (owned && owned.length) list = list.filter(p => owned.includes(p.id))
      }
      setProfiles(list)
    } catch (e) { setProfiles([]) }
  }

  const navItem = (isActive) => ({
    display: 'flex', alignItems: 'center', gap: 11, padding: '10px 13px',
    borderRadius: 12, fontSize: 14.5, fontWeight: isActive ? 600 : 500,
    color: isActive ? '#0E5E42' : '#5B655F',
    background: isActive ? '#E8F5EE' : 'transparent',
    width: '100%', textAlign: 'left', transition: 'background 0.12s'
  })

  function cleanName(p, i) {
    const n = (p.name || '').split(' | ')[0]
    return n || 'Child ' + (i + 1)
  }

  const SidebarInner = () => (
    <>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9AA39D', padding: '4px 13px 6px' }}>Overview</div>
      <NavLink to="/app" end onClick={() => setMenuOpen(false)} style={({ isActive }) => navItem(isActive)}>
        <span style={{ fontSize: 17 }}>🏠</span> Dashboard
      </NavLink>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9AA39D', padding: '14px 13px 6px' }}>Children</div>
      {profiles.map((p, i) => (
        <NavLink key={p.id} to={`/app/profile/${p.id}`} onClick={() => setMenuOpen(false)} style={({ isActive }) => navItem(isActive)}>
          <span style={{ fontSize: 17 }}>{AVATARS[i % AVATARS.length]}</span> {cleanName(p, i)}
        </NavLink>
      ))}
      <button onClick={() => { navigate('/app'); setMenuOpen(false) }} style={{ ...navItem(false), color: '#1F9D6B', fontWeight: 600 }}>
        <span style={{ fontSize: 17 }}>＋</span> Add child
      </button>
      <div style={{ flex: 1 }} />
      <div style={{ borderTop: '1px solid #EAE5DA', paddingTop: 8, marginTop: 8 }}>
        <NavLink to="/app/settings" onClick={() => setMenuOpen(false)} style={({ isActive }) => navItem(isActive)}>
          <span style={{ fontSize: 17 }}>⚙️</span> Settings
        </NavLink>
        {auth?.user && (
          <button onClick={() => { auth.signOut(); navigate('/') }} style={{ ...navItem(false) }}>
            <span style={{ fontSize: 17 }}>↩</span> Sign out
          </button>
        )}
      </div>
    </>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FBF9F4', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #EAE5DA', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', position: 'sticky', top: 0, zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          {isMobile && (
            <button onClick={() => setMenuOpen(true)} aria-label="Menu" style={{ fontSize: 22, padding: '4px 8px', color: '#1A2420' }}>☰</button>
          )}
          <button onClick={() => navigate('/')} title="Back to Guardly home" style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <Logo size={30} />
            <span style={{ fontFamily: FONT_D, fontWeight: 700, fontSize: 19 }}>Guardly</span>
          </button>
        </div>
        <span className="gx-only-desktop" style={{ fontFamily: FONT_D, fontStyle: 'italic', fontSize: 15, color: '#1F9D6B', fontWeight: 500 }}>
          Your family, safe online ✨
        </span>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Desktop sidebar */}
        {!isMobile && (
          <aside style={{
            width: 230, background: '#fff', borderRight: '1px solid #EAE5DA',
            padding: '16px 12px', display: 'flex', flexDirection: 'column', flexShrink: 0
          }}>
            <SidebarInner />
          </aside>
        )}

        {/* Mobile drawer */}
        {isMobile && menuOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
            <div onClick={() => setMenuOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(26,36,32,0.4)' }} />
            <aside className="fade-in" style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: 260, background: '#fff',
              padding: '16px 12px', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 24px rgba(0,0,0,0.12)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 13px 16px' }}>
                <Logo size={28} /><span style={{ fontFamily: FONT_D, fontWeight: 700, fontSize: 18 }}>Guardly</span>
              </div>
              <SidebarInner />
            </aside>
          </div>
        )}

        <main style={{ flex: 1, padding: isMobile ? '20px 18px 40px' : '32px 36px', maxWidth: 980, width: '100%', margin: '0 auto' }}>
          <Outlet context={{ reloadProfiles: load }} />
        </main>
      </div>
    </div>
  )
}
