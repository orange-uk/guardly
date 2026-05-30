import React, { useState, useEffect } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { getProfiles, createProfile, deleteProfile } from '../api'
import { useAuth, getOwnedProfiles, linkProfileToUser, unlinkProfileForUser } from '../lib/AuthContext'
import { getDevicesForProfiles } from '../lib/household'

const FONT_D = "'Fraunces', Georgia, serif"
const AVATARS = ['🦊','🐻','🐼','🐰','🦁','🐨','🐸','🐯']
const TINTS = ['#E8F5EE','#E9F1F8','#FBF1DD','#FCEDE7','#EFEAF8','#FBEFF4']
const TINT_TEXT = ['#0E5E42','#3E7CB1','#9A6B12','#C2502F','#6B4D9E','#A33866']

function ProfileCard({ profile, index, devices, onDelete, onClick }) {
  const [confirm, setConfirm] = useState(false)
  const name = profile.name || 'Child ' + (index + 1)
  const tint = TINTS[index % TINTS.length]
  const tintText = TINT_TEXT[index % TINT_TEXT.length]
  const devList = devices || []

  return (
    <div onClick={onClick} className="gx-card" style={{ padding: 22, cursor: 'pointer', position: 'relative', transition: 'transform 0.15s, box-shadow 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}>
      <button onClick={e => { e.stopPropagation(); if (confirm) onDelete(profile.profile_id); else { setConfirm(true); setTimeout(() => setConfirm(false), 3000) } }}
        style={{ position: 'absolute', top: 14, right: 14, fontSize: confirm ? 11 : 16, fontWeight: confirm ? 700 : 400,
          color: confirm ? '#C24238' : '#C9CFC9', background: confirm ? '#FBEAE8' : 'transparent',
          padding: confirm ? '4px 9px' : '2px 6px', borderRadius: 8 }}>
        {confirm ? 'Delete?' : '✕'}
      </button>
      <div style={{ width: 54, height: 54, borderRadius: 16, background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 14 }}>
        {AVATARS[index % AVATARS.length]}
      </div>
      <div style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: 19, marginBottom: 6 }}>{name}</div>
      {devList.length ? (
        <div style={{ fontSize: 13, color: '#5B655F', marginBottom: 10, lineHeight: 1.5 }}>
          📱 {devList.map(d => d.name).join(', ')}
        </div>
      ) : (
        <div style={{ fontSize: 13, color: '#9AA39D', marginBottom: 10 }}>No devices yet</div>
      )}
      <span className="gx-pill" style={{ background: tint, color: tintText }}>
        ✓ {devList.length ? `${devList.length} device${devList.length > 1 ? 's' : ''} protected` : 'Ready'}
      </span>
    </div>
  )
}

export default function Dashboard() {
  const [profiles, setProfiles] = useState([])
  const [devicesByProfile, setDevicesByProfile] = useState({})
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const auth = useAuth()
  const ctx = useOutletContext()
  const meta = auth?.user?.user_metadata || {}
  const firstName = meta.first_name || (meta.full_name || '').trim().split(' ')[0] || ''

  useEffect(() => { load() }, [])

  async function load() {
    try {
      let list = []
      if (auth?.user) {
        // Source of truth for children + names is our own database.
        const owned = await getOwnedProfiles(auth.user.id)
        list = owned || []
      } else {
        // No auth (dev mode): fall back to the engine's list.
        const data = await getProfiles()
        list = (data.data || []).map(p => ({ profile_id: p.id, name: (p.name || '').split(' | ')[0] }))
      }
      setProfiles(list)
      if (list.length) {
        const map = await getDevicesForProfiles(list.map(p => p.profile_id))
        setDevicesByProfile(map)
      } else {
        setDevicesByProfile({})
      }
    } catch (e) { setError('Could not load your children. Check your connection.') }
    finally { setLoading(false) }
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    setError(null)
    try {
      // The engine only needs a unique code as the profile name — the human
      // name lives in our database, so duplicate names never clash.
      const code = 'gdly-' + Math.random().toString(36).slice(2, 8)
      const result = await createProfile({ name: code })
      const id = result.data?.id
      if (!id) throw new Error('No profile id returned')
      if (auth?.user) await linkProfileToUser(auth.user.id, id, newName.trim())
      setNewName('')
      await load(); ctx?.reloadProfiles?.()
      navigate(`/app/profile/${id}/install`)
    } catch (e) { setError('Could not create profile: ' + e.message) }
    finally { setCreating(false) }
  }

  async function handleDelete(id) {
    setError(null)
    try {
      // Delete the NextDNS profile FIRST. If this fails, we abort and leave
      // everything intact — no partial state, no orphans.
      await deleteProfile(id)
    } catch (e) {
      setError('Could not remove this child right now. Nothing was changed — please try again. (' + e.message + ')')
      return
    }
    // NextDNS profile is gone — now remove the household link and its devices.
    // (unlinkProfileForUser removes both the household_profiles row and the
    // devices rows for this profile.)
    try {
      if (auth?.user) await unlinkProfileForUser(auth.user.id, id)
    } catch (e) {
      // The profile is gone but the link cleanup hiccupped — surface it so the
      // dashboard can be refreshed rather than silently leaving a stale link.
      setError('Child removed, but tidying up took a moment. Refresh if it still shows.')
    }
    setProfiles(profiles.filter(p => p.profile_id !== id))
    setDevicesByProfile(prev => { const c = { ...prev }; delete c[id]; return c })
    ctx?.reloadProfiles?.()
  }

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 26 }}>
        {firstName && <p style={{ color: '#1F9D6B', fontSize: 15, fontWeight: 600, marginBottom: 2 }}>Hi {firstName} 👋</p>}
        <h1 style={{ fontFamily: FONT_D, fontSize: 30, fontWeight: 600, marginBottom: 4 }}>Your family</h1>
        <p style={{ color: '#5B655F', fontSize: 15 }}>Add each child, then add the devices they use. Every device is protected at home and everywhere else.</p>
      </div>

      {error && (
        <div className="gx-card" style={{ background: '#FBEAE8', borderColor: '#E9B5AF', padding: '14px 18px', marginBottom: 18 }}>
          <p style={{ color: '#C24238', fontSize: 14 }}>⚠️ {error}</p>
        </div>
      )}

      {loading ? <p style={{ color: '#9AA39D' }}>Loading…</p> : (
        <div className="gx-feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 16 }}>
          {profiles.map((p, i) => (
            <ProfileCard key={p.profile_id} profile={p} index={i} devices={devicesByProfile[p.profile_id]} onDelete={handleDelete} onClick={() => navigate(`/app/profile/${p.profile_id}`)} />
          ))}
          <form onSubmit={handleCreate} className="gx-card" style={{ padding: 22, border: '1.5px dashed #CFD8D2', background: '#FCFBF7' }}>
            <div style={{ width: 54, height: 54, borderRadius: 16, background: '#F3EEE4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: '#9AA39D', marginBottom: 14 }}>＋</div>
            <div style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: 17, marginBottom: 4 }}>Add a child</div>
            <p style={{ fontSize: 12.5, color: '#9AA39D', marginBottom: 12 }}>You'll add their device next.</p>
            <input className="gx-input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Child's name" style={{ marginBottom: 10 }} />
            <button type="submit" className="gx-btn" disabled={creating || !newName.trim()} style={{ width: '100%', opacity: (creating || !newName.trim()) ? 0.6 : 1 }}>
              {creating ? 'Creating…' : 'Add child & device'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
