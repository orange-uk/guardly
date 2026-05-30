import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProfileSection, updateProfileSection, updateProfile, addToList, getLogs, getProfiles } from '../api'

const card = {
  background: '#fff', border: '0.5px solid #E4E4E0',
  borderRadius: 12, padding: '20px 24px', marginBottom: 12
}

const CATEGORIES = [
  { id: 'porn',            label: 'Adult content',    desc: 'Explicit & adult sites',        icon: '🔞' },
  { id: 'gambling',        label: 'Gambling',         desc: 'Betting & casino sites',        icon: '🎰' },
  { id: 'dating',          label: 'Dating',           desc: 'Dating apps & sites',           icon: '💘' },
  { id: 'piracy',          label: 'Piracy',           desc: 'Torrent & piracy sites',        icon: '🏴‍☠️' },
  { id: 'socialNetworks',  label: 'Social media',     desc: 'Instagram, TikTok, X & more',  icon: '📱' },
  { id: 'videoStreaming',  label: 'Video streaming',  desc: 'YouTube, Netflix, Disney+',     icon: '📺' },
  { id: 'gaming',          label: 'Gaming',           desc: 'Games & gaming platforms',      icon: '🎮' },
  { id: 'drugs',           label: 'Drugs',            desc: 'Drug-related content',          icon: '⚠️' },
]

const SERVICES = [
  { group: 'Social media', items: [
    { id: 'instagram', label: 'Instagram', icon: '📸' },
    { id: 'tiktok', label: 'TikTok', icon: '🎵' },
    { id: 'snapchat', label: 'Snapchat', icon: '👻' },
    { id: 'twitter', label: 'X / Twitter', icon: '🐦' },
    { id: 'facebook', label: 'Facebook', icon: '👤' },
    { id: 'reddit', label: 'Reddit', icon: '🟠' },
    { id: 'pinterest', label: 'Pinterest', icon: '📌' },
    { id: 'discord', label: 'Discord', icon: '💬' },
    { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
    { id: 'telegram', label: 'Telegram', icon: '✈️' },
    { id: 'bereal', label: 'BeReal', icon: '📷' },
  ]},
  { group: 'Video & streaming', items: [
    { id: 'youtube', label: 'YouTube', icon: '▶️' },
    { id: 'netflix', label: 'Netflix', icon: '🎬' },
    { id: 'disneyplus', label: 'Disney+', icon: '✨' },
    { id: 'twitch', label: 'Twitch', icon: '🟣' },
    { id: 'primevideo', label: 'Prime Video', icon: '📦' },
    { id: 'spotify', label: 'Spotify', icon: '🎧' },
    { id: 'soundcloud', label: 'SoundCloud', icon: '🎵' },
  ]},
  { group: 'Gaming', items: [
    { id: 'roblox', label: 'Roblox', icon: '🧱' },
    { id: 'fortnite', label: 'Fortnite', icon: '🔫' },
    { id: 'minecraft', label: 'Minecraft', icon: '⛏️' },
    { id: 'steam', label: 'Steam', icon: '🎮' },
    { id: 'epicgames', label: 'Epic Games', icon: '🎮' },
    { id: 'xbox', label: 'Xbox', icon: '🟢' },
    { id: 'playstation', label: 'PlayStation', icon: '🎮' },
  ]},
  { group: 'Other', items: [
    { id: 'onlyfans', label: 'OnlyFans', icon: '🔞' },
    { id: '9gag', label: '9GAG', icon: '😂' },
    { id: 'vk', label: 'VK', icon: '👤' },
    { id: 'dailymotion', label: 'Dailymotion', icon: '▶️' },
  ]},
]

const AVATARS = ['👦', '👧', '🧒', '👨', '👩', '🧑']
const COLORS = ['#E1F5EE','#E6F1FB','#FAEEDA','#FBEAF0','#EAF3DE','#EEEDFE']
const TEXT_COLORS = ['#0F6E56','#185FA5','#854F0B','#993556','#3B6D11','#534AB7']

export default function ProfilePage() {
  const { profileId } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('filters')
  const [categories, setCategories] = useState({})
  const [services, setServices] = useState({})
  const [denylist, setDenylist] = useState([])
  const [allowlist, setAllowlist] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [denyInput, setDenyInput] = useState('')
  const [allowInput, setAllowInput] = useState('')
  const [saving, setSaving] = useState(null)
  const [error, setError] = useState(null)
  const [serviceSearch, setServiceSearch] = useState('')
  const [profileName, setProfileName] = useState('')
  const [profileIndex, setProfileIndex] = useState(0)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDevice, setEditDevice] = useState('')
  const [deviceName, setDeviceName] = useState('')

  useEffect(() => { loadAll() }, [profileId])

  async function loadAll() {
    setLoading(true)
    try {
      const [pc, deny, allow, allProfiles] = await Promise.all([
        getProfileSection(profileId, 'parentalControl'),
        getProfileSection(profileId, 'denylist'),
        getProfileSection(profileId, 'allowlist'),
        getProfiles(),
      ])
      const cats = {}
      ;(pc.data?.categories || []).forEach(c => { cats[c.id] = true })
      setCategories(cats)
      const svcs = {}
      ;(pc.data?.services || []).forEach(s => { svcs[s.id] = true })
      setServices(svcs)
      setDenylist(deny.data || [])
      setAllowlist(allow.data || [])
      const profiles = allProfiles.data || []
      const idx = profiles.findIndex(p => p.id === profileId)
      setProfileIndex(idx >= 0 ? idx : 0)
      const found = profiles.find(p => p.id === profileId)
      const name = found?.name || profileId
      setProfileName(name)
      // Extract device name from profile name if stored as "Name | Device"
      if (name.includes(' | ')) {
        const parts = name.split(' | ')
        setProfileName(parts[0])
        setDeviceName(parts[1])
      } else {
        setProfileName(name)
        setDeviceName('')
      }
    } catch (e) {
      setError('Could not load profile settings.')
    } finally {
      setLoading(false)
    }
  }

  async function loadLogs() {
    try {
      const data = await getLogs(profileId)
      setLogs(data.data || [])
    } catch (e) { setLogs([]) }
  }

  async function saveParentalControl(updatedCats, updatedSvcs) {
    const activeCategories = Object.entries(updatedCats).filter(([,v]) => v).map(([k]) => ({ id: k, active: true }))
    const activeServices = Object.entries(updatedSvcs).filter(([,v]) => v).map(([k]) => ({ id: k, active: true }))
    await updateProfileSection(profileId, 'parentalControl', {
      categories: activeCategories,
      services: activeServices
    })
  }

  async function toggleCategory(catId) {
    const updated = { ...categories, [catId]: !categories[catId] }
    setCategories(updated)
    setSaving(catId)
    try { await saveParentalControl(updated, services) }
    catch (e) { setCategories(categories); setError('Could not save.') }
    finally { setSaving(null) }
  }

  async function toggleService(svcId) {
    const updated = { ...services, [svcId]: !services[svcId] }
    setServices(updated)
    setSaving(svcId)
    try { await saveParentalControl(categories, updated) }
    catch (e) { setServices(services); setError('Could not save.') }
    finally { setSaving(null) }
  }

  async function addDomain(type) {
    const val = type === 'deny' ? denyInput.trim() : allowInput.trim()
    if (!val) return
    try {
      await addToList(profileId, type === 'deny' ? 'denylist' : 'allowlist', { id: val, active: true })
      if (type === 'deny') { setDenylist([...denylist, { id: val }]); setDenyInput('') }
      else { setAllowlist([...allowlist, { id: val }]); setAllowInput('') }
    } catch (e) { setError('Could not add domain: ' + e.message) }
  }

  async function saveEdit() {
    if (!editName.trim()) return
    const combined = editDevice.trim() ? editName.trim() + ' | ' + editDevice.trim() : editName.trim()
    try {
      await updateProfile(profileId, { name: combined })
      setProfileName(editName.trim())
      setDeviceName(editDevice.trim())
      setEditing(false)
    } catch (e) {
      setError('Could not save name.')
    }
  }

  const tabStyle = (t) => ({
    padding: '8px 14px', fontSize: 13, cursor: 'pointer',
    border: 'none', background: 'none',
    color: tab === t ? '#1D9E75' : '#6B6B68',
    borderBottom: tab === t ? '2px solid #1D9E75' : '2px solid transparent',
    fontWeight: tab === t ? 500 : 400
  })

  const Toggle = ({ isOn, onToggle, id }) => (
    <button onClick={onToggle} style={{
      width: 36, height: 20, borderRadius: 10, border: 'none',
      background: isOn ? '#1D9E75' : '#C8C8C4', cursor: 'pointer',
      position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      opacity: saving === id ? 0.6 : 1
    }}>
      <span style={{
        position: 'absolute', width: 16, height: 16, borderRadius: '50%',
        background: '#fff', top: 2, left: isOn ? 18 : 2, transition: 'left 0.2s'
      }} />
    </button>
  )

  const filteredServices = SERVICES.map(g => ({
    ...g, items: g.items.filter(s => s.label.toLowerCase().includes(serviceSearch.toLowerCase()))
  })).filter(g => g.items.length > 0)

  const blockedServiceCount = Object.values(services).filter(Boolean).length
  const bgColor = COLORS[profileIndex % COLORS.length]
  const textColor = TEXT_COLORS[profileIndex % TEXT_COLORS.length]
  const avatar = AVATARS[profileIndex % AVATARS.length]

  return (
    <div>
      {/* Profile header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: bgColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0
          }}>{avatar}</div>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                value={editName} onChange={e => setEditName(e.target.value)}
                placeholder="Child's name"
                style={{ padding: '6px 10px', borderRadius: 6, border: '0.5px solid #E4E4E0', fontSize: 15, fontWeight: 500 }}
              />
              <input
                value={editDevice} onChange={e => setEditDevice(e.target.value)}
                placeholder="Device name (e.g. Emma's iPhone)"
                style={{ padding: '6px 10px', borderRadius: 6, border: '0.5px solid #E4E4E0', fontSize: 13 }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={saveEdit} style={{
                  padding: '6px 14px', borderRadius: 6, background: '#1D9E75',
                  color: '#fff', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer'
                }}>Save</button>
                <button onClick={() => setEditing(false)} style={{
                  padding: '6px 14px', borderRadius: 6, background: '#fff',
                  color: '#6B6B68', border: '0.5px solid #E4E4E0', fontSize: 13, cursor: 'pointer'
                }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ fontSize: 22, fontWeight: 600, color: '#1A1A18', margin: 0 }}>{profileName}</h1>
                <button onClick={() => { setEditName(profileName); setEditDevice(deviceName); setEditing(true) }} style={{
                  background: 'none', border: 'none', color: '#C0C0BB', cursor: 'pointer', fontSize: 13, padding: '2px 6px'
                }}>✏️</button>
              </div>
              {deviceName ? (
                <div style={{ fontSize: 13, color: '#6B6B68', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                  📱 {deviceName}
                  <span style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 20,
                    background: bgColor, color: textColor, fontWeight: 500
                  }}>Protected</span>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: '#C0C0BB', marginTop: 3 }}>
                  No device added yet —{' '}
                  <button onClick={() => navigate('/app/profile/' + profileId + '/install')}
                    style={{ background: 'none', border: 'none', color: '#1D9E75', cursor: 'pointer', fontSize: 13, padding: 0 }}>
                    install on a device
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <button onClick={() => navigate('/app/profile/' + profileId + '/install')} style={{
          padding: '8px 16px', borderRadius: 8, background: '#1D9E75',
          color: '#fff', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', flexShrink: 0
        }}>
          + Add device
        </button>
      </div>

      {error && (
        <div style={{ ...card, background: '#FCEBEB', border: '0.5px solid #F0A0A0', marginBottom: 12 }}>
          <p style={{ color: '#A32D2D', fontSize: 13 }}>⚠️ {error}</p>
        </div>
      )}

      <div style={{ display: 'flex', borderBottom: '0.5px solid #E4E4E0', marginBottom: 20, overflowX: 'auto' }}>
        <button style={tabStyle('filters')} onClick={() => setTab('filters')}>Categories</button>
        <button style={tabStyle('services')} onClick={() => setTab('services')}>
          Apps & sites {blockedServiceCount > 0 && (
            <span style={{ marginLeft: 5, background: '#1D9E75', color: '#fff', fontSize: 10, padding: '1px 6px', borderRadius: 10 }}>
              {blockedServiceCount}
            </span>
          )}
        </button>
        <button style={tabStyle('deny')} onClick={() => setTab('deny')}>Block list</button>
        <button style={tabStyle('allow')} onClick={() => setTab('allow')}>Allow list</button>
        <button style={tabStyle('activity')} onClick={() => { setTab('activity'); loadLogs() }}>Activity</button>
      </div>

      {loading ? <p style={{ color: '#9B9B97', fontSize: 13 }}>Loading…</p> : (
        <>
          {tab === 'filters' && (
            <div style={card}>
              <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Content categories</h2>
              <p style={{ fontSize: 12, color: '#9B9B97', marginBottom: 16 }}>Block entire categories with one toggle.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {CATEGORIES.map(cat => {
                  const isOn = !!categories[cat.id]
                  return (
                    <div key={cat.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 8,
                      border: '0.5px solid ' + (isOn ? '#5DCAA5' : '#E4E4E0'),
                      background: isOn ? '#E1F5EE' : '#fff', transition: 'all 0.15s'
                    }}>
                      <span style={{ fontSize: 20 }}>{cat.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{cat.label}</div>
                        <div style={{ fontSize: 11, color: '#9B9B97' }}>{cat.desc}</div>
                      </div>
                      <Toggle isOn={isOn} id={cat.id} onToggle={() => toggleCategory(cat.id)} />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {tab === 'services' && (
            <div>
              <div style={{ ...card, paddingBottom: 12 }}>
                <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Apps & sites</h2>
                <p style={{ fontSize: 12, color: '#9B9B97', marginBottom: 12 }}>Block specific apps and websites by name.</p>
                <input value={serviceSearch} onChange={e => setServiceSearch(e.target.value)}
                  placeholder="Search…" style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: '0.5px solid #E4E4E0', fontSize: 13, boxSizing: 'border-box'
                  }} />
              </div>
              {filteredServices.map(group => (
                <div key={group.group} style={{ ...card, marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: '#9B9B97', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {group.group}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {group.items.map(svc => {
                      const isOn = !!services[svc.id]
                      return (
                        <div key={svc.id} style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8,
                          border: '0.5px solid ' + (isOn ? '#F0A0A0' : '#E4E4E0'),
                          background: isOn ? '#FCEBEB' : '#fff', transition: 'all 0.15s'
                        }}>
                          <span style={{ fontSize: 18 }}>{svc.icon}</span>
                          <span style={{ flex: 1, fontSize: 13, fontWeight: isOn ? 500 : 400 }}>{svc.label}</span>
                          <Toggle isOn={isOn} id={svc.id} onToggle={() => toggleService(svc.id)} />
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'deny' && (
            <div style={card}>
              <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Block list</h2>
              <p style={{ fontSize: 12, color: '#9B9B97', marginBottom: 16 }}>Specific domains always blocked regardless of other settings.</p>
              {denylist.length === 0 && <p style={{ fontSize: 13, color: '#C0C0BB', marginBottom: 12 }}>No sites added yet.</p>}
              {denylist.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '0.5px solid #F0F0EE' }}>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#FCEBEB', color: '#A32D2D', fontWeight: 500 }}>Blocked</span>
                  <span style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }}>{item.id}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <input value={denyInput} onChange={e => setDenyInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addDomain('deny')}
                  placeholder="e.g. example.com"
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '0.5px solid #E4E4E0', fontSize: 13 }} />
                <button onClick={() => addDomain('deny')} style={{
                  padding: '8px 16px', borderRadius: 6, background: '#A32D2D',
                  color: '#fff', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer'
                }}>Block site</button>
              </div>
            </div>
          )}

          {tab === 'allow' && (
            <div style={card}>
              <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Allow list</h2>
              <p style={{ fontSize: 12, color: '#9B9B97', marginBottom: 16 }}>Sites always accessible even if a category blocks them.</p>
              {allowlist.length === 0 && <p style={{ fontSize: 13, color: '#C0C0BB', marginBottom: 12 }}>No sites added yet.</p>}
              {allowlist.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '0.5px solid #F0F0EE' }}>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#E1F5EE', color: '#0F6E56', fontWeight: 500 }}>Allowed</span>
                  <span style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }}>{item.id}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <input value={allowInput} onChange={e => setAllowInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addDomain('allow')}
                  placeholder="e.g. bbc.co.uk"
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '0.5px solid #E4E4E0', fontSize: 13 }} />
                <button onClick={() => addDomain('allow')} style={{
                  padding: '8px 16px', borderRadius: 6, background: '#1D9E75',
                  color: '#fff', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer'
                }}>Allow site</button>
              </div>
            </div>
          )}

          {tab === 'activity' && (
            <div style={card}>
              <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Activity log</h2>
              <p style={{ fontSize: 12, color: '#9B9B97', marginBottom: 16 }}>Recent DNS requests from devices using this profile.</p>
              {logs.length === 0
                ? <p style={{ fontSize: 13, color: '#C0C0BB' }}>No recent activity.</p>
                : logs.slice(0, 50).map((log, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '0.5px solid #F0F0EE', fontSize: 12 }}>
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 500,
                      background: log.blocked ? '#FCEBEB' : '#E1F5EE',
                      color: log.blocked ? '#A32D2D' : '#0F6E56'
                    }}>{log.blocked ? 'Blocked' : 'Allowed'}</span>
                    <span style={{ flex: 1, fontFamily: 'monospace' }}>{log.domain || log.name}</span>
                    <span style={{ color: '#9B9B97' }}>{log.device?.name || deviceName || '—'}</span>
                  </div>
                ))
              }
            </div>
          )}
        </>
      )}
    </div>
  )
}
