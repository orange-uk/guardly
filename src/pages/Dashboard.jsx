import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfiles, createProfile, deleteProfile } from '../api'

const card = {
  background: '#fff', border: '0.5px solid #E4E4E0',
  borderRadius: 12, padding: '20px 24px', marginBottom: 12
}

const PROFILE_AVATARS = ['👦', '👧', '🧒', '👨', '👩', '🧑']
const PROFILE_COLORS = ['#E1F5EE', '#E6F1FB', '#FAEEDA', '#FBEAF0', '#EAF3DE', '#EEEDFE']
const PROFILE_TEXT_COLORS = ['#0F6E56', '#185FA5', '#854F0B', '#993556', '#3B6D11', '#534AB7']

function ProfileCard({ profile, index, onDelete, onClick }) {
  const [confirming, setConfirming] = useState(false)
  const avatar = PROFILE_AVATARS[index % PROFILE_AVATARS.length]
  const bg = PROFILE_COLORS[index % PROFILE_COLORS.length]
  const tc = PROFILE_TEXT_COLORS[index % PROFILE_TEXT_COLORS.length]

  function handleDelete(e) {
    e.stopPropagation()
    if (confirming) {
      onDelete(profile.id)
    } else {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 3000)
    }
  }

  return (
    <div
      onClick={onClick}
      style={{
        ...card, cursor: 'pointer', position: 'relative',
        transition: 'border-color 0.15s', marginBottom: 0
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#5DCAA5'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#E4E4E0'}
    >
      <button
        onClick={handleDelete}
        style={{
          position: 'absolute', top: 12, right: 12,
          background: confirming ? '#FCEBEB' : 'none',
          border: confirming ? '0.5px solid #F0A0A0' : 'none',
          borderRadius: 6, padding: '3px 8px',
          fontSize: 11, color: confirming ? '#A32D2D' : '#C0C0BB',
          cursor: 'pointer', fontWeight: confirming ? 500 : 400
        }}
      >
        {confirming ? 'Confirm delete' : '✕'}
      </button>

      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: bg, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 24, marginBottom: 12
      }}>
        {avatar}
      </div>

      <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 4 }}>
        {profile.name || 'Unnamed profile'}
      </div>

      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        marginTop: 8, padding: '3px 10px', borderRadius: 20,
        background: bg, fontSize: 11, fontWeight: 500, color: tc
      }}>
        ✓ Protected
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => { loadProfiles() }, [])

  async function loadProfiles() {
    try {
      const data = await getProfiles()
      setProfiles(data.data || [])
    } catch (e) {
      setError('Could not load profiles. Check your connection.')
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

  async function handleDelete(id) {
    try {
      await deleteProfile(id)
      setProfiles(profiles.filter(p => p.id !== id))
    } catch (e) {
      setError('Could not delete profile: ' + e.message)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>Your family</h1>
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
        <p style={{ color: '#9B9B97', fontSize: 13 }}>Loading…</p>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 12, marginBottom: 24
          }}>
            {profiles.map((p, i) => (
              <ProfileCard
                key={p.id}
                profile={p}
                index={i}
                onDelete={handleDelete}
                onClick={() => navigate(`/profile/${p.id}`)}
              />
            ))}

            <form onSubmit={handleCreate} style={{
              ...card, border: '0.5px dashed #C0C0BB',
              background: '#FAFAF8', marginBottom: 0
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>+</div>
              <div style={{ fontWeight: 500, marginBottom: 12, color: '#6B6B68', fontSize: 14 }}>
                Add a child
              </div>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Child's name"
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: 6,
                  border: '0.5px solid #E4E4E0', marginBottom: 8, fontSize: 13
                }}
              />
              <button type="submit" disabled={creating || !newName.trim()} style={{
                width: '100%', padding: '8px', borderRadius: 6,
                background: '#1D9E75', color: '#fff', border: 'none',
                fontWeight: 500, fontSize: 13, opacity: creating ? 0.7 : 1, cursor: 'pointer'
              }}>
                {creating ? 'Creating…' : 'Create profile'}
              </button>
            </form>
          </div>

          {profiles.length === 0 && (
            <div style={card}>
              <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Getting started</h2>
              {[
                ['1', 'Add a profile for each child above'],
                ['2', 'Click a profile and set up content filters'],
                ['3', 'Go to Install to put the profile on their devices'],
                ['4', 'Check Activity to see what\'s being blocked'],
              ].map(([n, text]) => (
                <div key={n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', background: '#1D9E75',
                    color: '#fff', fontSize: 11, fontWeight: 500,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>{n}</div>
                  <span style={{ fontSize: 13, color: '#6B6B68', paddingTop: 2 }}>{text}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
