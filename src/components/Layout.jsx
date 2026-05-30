import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { getProfiles } from '../api'

const styles = {
  app: { display: 'flex', flexDirection: 'column', minHeight: '100vh' },
  topbar: {
    background: '#fff', borderBottom: '0.5px solid #E4E4E0',
    padding: '0 24px', height: 52, display: 'flex',
    alignItems: 'center', justifyContent: 'space-between', flexShrink: 0
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10, fontWeight: 500, fontSize: 16 },
  logoIcon: {
    width: 30, height: 30, borderRadius: 8, background: '#1D9E75',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: 15
  },
  body: { display: 'flex', flex: 1 },
  sidebar: {
    width: 210, background: '#fff', borderRight: '0.5px solid #E4E4E0',
    padding: '16px 10px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2
  },
  sectionLabel: {
    fontSize: 10, fontWeight: 500, textTransform: 'uppercase',
    letterSpacing: '0.08em', color: '#9B9B97', padding: '8px 8px 4px'
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '7px 10px', borderRadius: 6, fontSize: 13,
    color: '#6B6B68', cursor: 'pointer', border: 'none', background: 'none',
    width: '100%', textAlign: 'left'
  },
  main: { flex: 1, padding: '28px 32px', overflowY: 'auto' },
}

const AVATARS = ['👦', '👧', '🧒', '👨', '👩', '🧑']

export default function Layout() {
  const [profiles, setProfiles] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    getProfiles()
      .then(data => setProfiles(data.data || []))
      .catch(() => setProfiles([]))
  }, [])

  const activeStyle = { background: '#E1F5EE', color: '#0F6E56', fontWeight: 500 }
  const inactiveStyle = {}

  return (
    <div style={styles.app}>
      <div style={styles.topbar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>🛡</div>
          Guardly
        </div>
        <span style={{ fontSize: 12, color: '#9B9B97' }}>Family safety</span>
      </div>
      <div style={styles.body}>
        <div style={styles.sidebar}>
          <div style={styles.sectionLabel}>Overview</div>
          <NavLink to="/app" end style={({ isActive }) => ({
            ...styles.navItem, ...(isActive ? activeStyle : inactiveStyle)
          })}>
            🏠 Dashboard
          </NavLink>

          <div style={{ ...styles.sectionLabel, marginTop: 8 }}>Children</div>
          {profiles.map((p, i) => (
            <NavLink key={p.id} to={`/app/profile/${p.id}`} style={({ isActive }) => ({
              ...styles.navItem, ...(isActive ? activeStyle : inactiveStyle)
            })}>
              {AVATARS[i % AVATARS.length]} {p.name || 'Child ' + (i + 1)}
            </NavLink>
          ))}
          <button style={{ ...styles.navItem, color: '#1D9E75', marginTop: 2 }}
            onClick={() => navigate('/app')}>
            + Add child
          </button>

          <div style={{ flex: 1 }} />

          <div style={{ borderTop: '0.5px solid #E4E4E0', paddingTop: 8, marginTop: 8 }}>
            <NavLink to="/app/settings" style={({ isActive }) => ({
              ...styles.navItem, ...(isActive ? activeStyle : inactiveStyle)
            })}>
              ⚙️ Settings
            </NavLink>
          </div>
        </div>
        <main style={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
