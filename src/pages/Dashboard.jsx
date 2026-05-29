import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfiles, createProfile } from '../api'

const card = {
  background: '#fff', border: '0.5px solid #E4E4E0',
  borderRadius: 12, padding: '20px 24px', marginBottom: 12
}

export default function Dashboard() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadProfiles()
  }, [])

  async function loadProfiles() {
    try {
      const data = await getProfiles()
      setProfiles(data.data || [])
    } catch (e) {
      setError('Could not load profiles. Check your API key in Cloudflare settings.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      const result = await createProfile({ name: newName.trim() })
      setNewName('')
      await loadProfiles()
      if (result.data?.id) navigate(`/profile/${result.data.id}`)
    } catch (e) {
      setError('Could not create profile: ' + e.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>Your family profiles</h1>
        <p style={{ color: '#6B6B68', fontSize: 13 }}>
          Each profile controls what a child can access online — on any device, anywhere.
        </p>
      </div>

      {error && (
        <div style={{ ...card, background: '#FCEBEB', border: '0.5px solid #F0A0A0', marginBottom: 16 }}>
          <p style={{ color: '#A32D2D', fontSize: 13 }}>⚠️ {error}</p>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#9B9B97', fontSize: 13 }}>Loading profiles…</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 24 }}>
            {profiles.map(p => (
              <button key={p.id} onClick={() => navigate(`/profile/${p.id}`)} style={{
                ...card, textAlign: 'left', cursor: 'pointer', border: '0.5px solid #E4E4E0',
                transition: 'border-color 0.15s'
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#5DCAA5'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#E4E4E0'}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>👤</div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>{p.name || p.id}</div>
                <div style={{ fontSize: 12, color: '#9B9B97' }}>ID: {p.id}</div>
                <div style={{
                  marginTop: 12, display: 'inline-block',
                  background: '#E1F5EE', color: '#0F6E56',
                  fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 500
                }}>
                  Active
                </div>
              </button>
            ))}

            {/* Create new profile card */}
            <form onSubmit={handleCreate} style={{ ...card, border: '0.5px dashed #C0C0BB', background: '#FAFAF8' }}>
              <div style={{ fontSize: 24, marginBottom: 8, color: '#C0C0BB' }}>+</div>
              <div style={{ fontWeight: 500, marginBottom: 12, color: '#6B6B68' }}>New profile</div>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Kids, Teenager"
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: 6,
                  border: '0.5px solid #E4E4E0', marginBottom: 8, fontSize: 13
                }}
              />
              <button type="submit" disabled={creating || !newName.trim()} style={{
                width: '100%', padding: '8px', borderRadius: 6,
                background: '#1D9E75', color: '#fff', border: 'none',
                fontWeight: 500, fontSize: 13, opacity: creating ? 0.7 : 1
              }}>
                {creating ? 'Creating…' : 'Create profile'}
              </button>
            </form>
          </div>

          <div style={card}>
            <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Getting started</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['1', 'Create a profile for each child above'],
                ['2', 'Click a profile and configure the content filters'],
                ['3', 'Go to Install to put the profile on their devices'],
                ['4', 'Check the Activity tab to see what\'s being blocked'],
              ].map(([n, text]) => (
                <div key={n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', background: '#1D9E75',
                    color: '#fff', fontSize: 11, fontWeight: 500,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>{n}</div>
                  <span style={{ fontSize: 13, color: '#6B6B68', paddingTop: 2 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
