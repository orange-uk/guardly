import React, { useState, useEffect } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { getProfiles, createProfile, deleteProfile } from '../api'
import { useAuth, getOwnedProfileIds, linkProfileToUser, unlinkProfile } from '../lib/AuthContext'

const FONT_D = "'Fraunces', Georgia, serif"
const AVATARS = ['🦊','🐻','🐼','🐰','🦁','🐨','🐸','🐯']
const TINTS = ['#E8F5EE','#E9F1F8','#FBF1DD','#FCEDE7','#EFEAF8','#FBEFF4']
const TINT_TEXT = ['#0E5E42','#3E7CB1','#9A6B12','#C2502F','#6B4D9E','#A33866']

function ProfileCard({ profile, index, onDelete, onClick }) {
  const [confirm, setConfirm] = useState(false)
  const name = (profile.name || '').split(' | ')[0] || 'Child ' + (index + 1)
  const device = (profile.name || '').split(' | ')[1]
  const tint = TINTS[index % TINTS.length]
  const tintText = TINT_TEXT[index % TINT_TEXT.length]

  return (
    <div onClick={onClick} className="gx-card" style={{ padding: 22, cursor: 'pointer', position: 'relative', transition: 'transform 0.15s, box-shadow 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}>
      <button onClick={e => { e.stopPropagation(); if (confirm) onDelete(profile.id); else { setConfirm(true); setTimeout(() => setConfirm(false), 3000) } }}
        style={{ position: 'absolute', top: 14, right: 14, fontSize: confirm ? 11 : 16, fontWeight: confirm ? 700 : 400,
          color: confirm ? '#C24238' : '#C9CFC9', background: confirm ? '#FBEAE8' : 'transparent',
          padding: confirm ? '4px 9px' : '2px 6px', borderRadius: 8 }}>
        {confirm ? 'Delete?' : '✕'}
      </button>
      <div style={{ width: 54, height: 54, borderRadius: 16, background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 14 }}>
        {AVATARS[index % AVATARS.length]}
      </div>
      <div style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: 19, marginBottom: device ? 2 : 8 }}>{name}</div>
      {device
        ? <div style={{ fontSize: 13, color: '#5B655F', marginBottom: 10 }}>📱 {device}</div>
        : <div style={{ fontSize: 13, color: '#9AA39D', marginBottom: 10 }}>No device yet</div>}
      <span className="gx-pill" style={{ background: tint, color: tintText }}>✓ Protected</span>
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
  const auth = useAuth()
  const ctx = useOutletContext()

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
    } catch (e) { setError('Could not load your children. Check your connection.') }
    finally { setLoading(false) }
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      const result = await createProfile({ name: newName.trim() })
      const id = result.data?.id
      if (auth?.user && id) await linkProfileToUser(auth.user.id, id)
      setNewName('')
      await load(); ctx?.reloadProfiles?.()
      if (id) navigate(`/app/profile/${id}`)
    } catch (e) { setError('Could not create profile: ' + e.message) }
    finally { setCreating(false) }
  }

  async function handleDelete(id) {
    try {
      await deleteProfile(id)
      if (auth?.user) await unlinkProfile(auth.user.id, id)
      setProfiles(profiles.filter(p => p.id !== id)); ctx?.reloadProfiles?.()
    } catch (e) { setError('Could not delete profile: ' + e.message) }
  }

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 26 }}>
        <h1 style={{ fontFamily: FONT_D, fontSize: 30, fontWeight: 600, marginBottom: 4 }}>Your family</h1>
        <p style={{ color: '#5B655F', fontSize: 15 }}>Each child has a profile that protects their devices — at home and everywhere else.</p>
      </div>

      {error && (
        <div className="gx-card" style={{ background: '#FBEAE8', borderColor: '#E9B5AF', padding: '14px 18px', marginBottom: 18 }}>
          <p style={{ color: '#C24238', fontSize: 14 }}>⚠️ {error}</p>
        </div>
      )}

      {loading ? <p style={{ color: '#9AA39D' }}>Loading…</p> : (
        <div className="gx-feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 16 }}>
          {profiles.map((p, i) => (
            <ProfileCard key={p.id} profile={p} index={i} onDelete={handleDelete} onClick={() => navigate(`/app/profile/${p.id}`)} />
          ))}
          <form onSubmit={handleCreate} className="gx-card" style={{ padding: 22, border: '1.5px dashed #CFD8D2', background: '#FCFBF7' }}>
            <div style={{ width: 54, height: 54, borderRadius: 16, background: '#F3EEE4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: '#9AA39D', marginBottom: 14 }}>＋</div>
            <div style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: 17, marginBottom: 12 }}>Add a child</div>
            <input className="gx-input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Child's name" style={{ marginBottom: 10 }} />
            <button type="submit" className="gx-btn" disabled={creating || !newName.trim()} style={{ width: '100%', opacity: (creating || !newName.trim()) ? 0.6 : 1 }}>
              {creating ? 'Creating…' : 'Create profile'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
