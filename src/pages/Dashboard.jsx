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
  const [hover, setHover] = useState(false)
  const name = profile.name || 'Child ' + (index + 1)
  const tint = TINTS[index % TINTS.length]
  const tintText = TINT_TEXT[index % TINT_TEXT.length]
  const devList = devices || []

  return (
    <div onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', cursor: 'pointer', borderRadius: 22, overflow: 'hidden',
        background: 'var(--cream-card)', border: '1px solid ' + (hover ? tintText + '33' : '#EDE8DD'),
        boxShadow: hover ? '0 14px 34px ' + tintText + '22, 0 4px 12px rgba(26,36,32,0.05)' : 'var(--shadow-sm)',
        transform: hover ? 'translateY(-4px)' : 'none', transition: 'all 0.22s cubic-bezier(.2,.7,.3,1)',
      }}>
      {/* colored top band with soft gradient */}
      <div style={{ height: 64, background: `linear-gradient(135deg, ${tint}, ${tint}dd)`, position: 'relative' }}>
        <div style={{ position: 'absolute', right: -14, top: -14, width: 70, height: 70, borderRadius: '50%', background: tintText, opacity: 0.07 }} />
        <div style={{ position: 'absolute', right: 16, bottom: -22, width: 64, height: 64, borderRadius: 20, background: '#fff', boxShadow: '0 4px 12px rgba(26,36,32,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 33, transform: hover ? 'scale(1.06) rotate(-4deg)' : 'none', transition: 'transform 0.22s' }}>
          {AVATARS[index % AVATARS.length]}
        </div>
      </div>
      <button onClick={e => { e.stopPropagation(); if (confirm) onDelete(profile.profile_id); else { setConfirm(true); setTimeout(() => setConfirm(false), 3000) } }}
        style={{ position: 'absolute', top: 12, right: 12, fontSize: confirm ? 11 : 15, fontWeight: confirm ? 700 : 400, lineHeight: 1,
          color: confirm ? '#fff' : tintText, background: confirm ? '#C24238' : 'rgba(255,255,255,0.55)',
          padding: confirm ? '5px 10px' : '5px 8px', borderRadius: 9, backdropFilter: 'blur(4px)', transition: 'all 0.15s' }}>
        {confirm ? 'Delete?' : '✕'}
      </button>

      <div style={{ padding: '16px 20px 20px' }}>
        <div style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: 21, marginBottom: 10, paddingRight: 70 }}>{name}</div>
        {devList.length ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {devList.slice(0, 4).map((d, i) => (
              <span key={i} style={{ fontSize: 12, fontWeight: 500, color: '#5B655F', background: '#F5F2EA', borderRadius: 8, padding: '4px 9px' }}>
                {d.name}
              </span>
            ))}
            {devList.length > 4 && <span style={{ fontSize: 12, color: '#9AA39D', padding: '4px 4px' }}>+{devList.length - 4}</span>}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: '#9AA39D', marginBottom: 14 }}>No devices yet — tap to add one</div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 600, color: tintText, background: tint, borderRadius: 999, padding: '5px 11px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: devList.length ? '#1F9D6B' : tintText, display: 'inline-block' }} />
            {devList.length ? `${devList.length} device${devList.length > 1 ? 's' : ''} protected` : 'Ready to protect'}
          </span>
        </div>
      </div>
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
      <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', marginBottom: 26, background: 'linear-gradient(135deg, #EAF6EF 0%, #FBF4E6 60%, #FCEFE8 100%)', border: '1px solid #EAE5DA', padding: '30px 32px' }}>
        <div style={{ position: 'absolute', right: -30, top: -30, width: 150, height: 150, borderRadius: '50%', background: '#1F9D6B', opacity: 0.06 }} />
        <div style={{ position: 'absolute', right: 70, bottom: -50, width: 110, height: 110, borderRadius: '50%', background: '#E2A03F', opacity: 0.07 }} />
        <div style={{ position: 'relative' }}>
          {firstName && <p style={{ color: '#177A53', fontSize: 17, fontWeight: 600, marginBottom: 6 }}>Hi {firstName} 👋</p>}
          <h1 style={{ fontFamily: FONT_D, fontSize: 32, fontWeight: 600, marginBottom: 6, letterSpacing: '-0.01em' }}>Your family</h1>
          <p style={{ color: '#5B655F', fontSize: 14.5, maxWidth: 460, lineHeight: 1.55 }}>Add each child, then the devices they use. Protection follows every device — at home, school, anywhere.</p>
          {!loading && profiles.length > 0 && (
            <div style={{ display: 'flex', gap: 22, marginTop: 18 }}>
              <div><span style={{ fontFamily: FONT_D, fontSize: 22, fontWeight: 600, color: '#177A53' }}>{profiles.length}</span> <span style={{ fontSize: 13, color: '#5B655F' }}>{profiles.length === 1 ? 'child' : 'children'}</span></div>
              {(() => { const dc = Object.values(devicesByProfile).reduce((n, d) => n + (d?.length || 0), 0); return (
                <div><span style={{ fontFamily: FONT_D, fontSize: 22, fontWeight: 600, color: '#177A53' }}>{dc}</span> <span style={{ fontSize: 13, color: '#5B655F' }}>{dc === 1 ? 'device' : 'devices'} protected</span></div>
              ) })()}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="gx-card" style={{ background: '#FBEAE8', borderColor: '#E9B5AF', padding: '14px 18px', marginBottom: 18 }}>
          <p style={{ color: '#C24238', fontSize: 14 }}>⚠️ {error}</p>
        </div>
      )}

      {loading ? <p style={{ color: '#9AA39D' }}>Loading…</p> : (
        <div className="gx-feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 18 }}>
          {profiles.map((p, i) => (
            <ProfileCard key={p.profile_id} profile={p} index={i} devices={devicesByProfile[p.profile_id]} onDelete={handleDelete} onClick={() => navigate(`/app/profile/${p.profile_id}`)} />
          ))}
          <form onSubmit={handleCreate}
            style={{ borderRadius: 22, border: '2px dashed #D6DED7', background: 'linear-gradient(160deg,#FCFBF7,#F7F4ED)', padding: '24px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'center', transition: 'border-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#1F9D6B'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#D6DED7'}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: '#fff', border: '1px solid #EAE5DA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: '#1F9D6B', marginBottom: 14, boxShadow: 'var(--shadow-sm)' }}>＋</div>
            <div style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: 18, marginBottom: 4 }}>Add a child</div>
            <p style={{ fontSize: 12.5, color: '#9AA39D', marginBottom: 14 }}>You'll add their device next.</p>
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
