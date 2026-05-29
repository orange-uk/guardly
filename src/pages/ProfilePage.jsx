import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProfileSection, updateProfileSection, addToList, getLogs } from '../api'

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

// Full NextDNS services list grouped by category
const SERVICES = [
  {
    group: 'Social media',
    items: [
      { id: 'instagram',  label: 'Instagram',   icon: '📸' },
      { id: 'tiktok',     label: 'TikTok',      icon: '🎵' },
      { id: 'snapchat',   label: 'Snapchat',    icon: '👻' },
      { id: 'twitter',    label: 'X / Twitter', icon: '🐦' },
      { id: 'facebook',   label: 'Facebook',    icon: '👤' },
      { id: 'reddit',     label: 'Reddit',      icon: '🟠' },
      { id: 'pinterest',  label: 'Pinterest',   icon: '📌' },
      { id: 'tumblr',     label: 'Tumblr',      icon: '📝' },
      { id: 'discord',    label: 'Discord',     icon: '💬' },
      { id: 'whatsapp',   label: 'WhatsApp',    icon: '💬' },
      { id: 'telegram',   label: 'Telegram',    icon: '✈️' },
      { id: 'signal',     label: 'Signal',      icon: '🔒' },
      { id: 'linkedin',   label: 'LinkedIn',    icon: '💼' },
      { id: 'bereal',     label: 'BeReal',      icon: '📷' },
    ]
  },
  {
    group: 'Video & streaming',
    items: [
      { id: 'youtube',    label: 'YouTube',     icon: '▶️' },
      { id: 'netflix',    label: 'Netflix',     icon: '🎬' },
      { id: 'disneyplus', label: 'Disney+',     icon: '✨' },
      { id: 'twitch',     label: 'Twitch',      icon: '🟣' },
      { id: 'primevideo', label: 'Prime Video', icon: '📦' },
      { id: 'hulu',       label: 'Hulu',        icon: '🟩' },
      { id: 'appletv',    label: 'Apple TV+',   icon: '🍎' },
      { id: 'spotify',    label: 'Spotify',     icon: '🎧' },
      { id: 'soundcloud', label: 'SoundCloud',  icon: '🎵' },
      { id: 'deezer',     label: 'Deezer',      icon: '🎵' },
    ]
  },
  {
    group: 'Gaming',
    items: [
      { id: 'roblox',     label: 'Roblox',      icon: '🧱' },
      { id: 'fortnite',   label: 'Fortnite',    icon: '🔫' },
      { id: 'minecraft',  label: 'Minecraft',   icon: '⛏️' },
      { id: 'steam',      label: 'Steam',       icon: '🎮' },
      { id: 'epicgames',  label: 'Epic Games',  icon: '🎮' },
      { id: 'xbox',       label: 'Xbox',        icon: '🟢' },
      { id: 'playstation',label: 'PlayStation', icon: '🎮' },
      { id: 'leagueoflegends', label: 'League of Legends', icon: '⚔️' },
    ]
  },
  {
    group: 'Other apps & sites',
    items: [
      { id: 'google',     label: 'Google',      icon: '🔍' },
      { id: 'amazon',     label: 'Amazon',      icon: '📦' },
      { id: 'ebay',       label: 'eBay',        icon: '🏷️' },
      { id: 'onlyfans',   label: 'OnlyFans',    icon: '🔞' },
      { id: 'vk',         label: 'VK',          icon: '👤' },
      { id: 'dailymotion',label: 'Dailymotion', icon: '▶️' },
      { id: '9gag',       label: '9GAG',        icon: '😂' },
      { id: 'quora',      label: 'Quora',       icon: '❓' },
    ]
  }
]

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

  useEffect(() => {
    loadAll()
  }, [profileId])

  async function loadAll() {
    setLoading(true)
    try {
      const [pc, deny, allow] = await Promise.all([
        getProfileSection(profileId, 'parentalControl'),
        getProfileSection(profileId, 'denylist'),
        getProfileSection(profileId, 'allowlist'),
      ])
      const cats = {}
      ;(pc.data?.categories || []).forEach(c => { cats[c.id] = true })
      setCategories(cats)
      const svcs = {}
      ;(pc.data?.services || []).forEach(s => { svcs[s.id] = true })
      setServices(svcs)
      setDenylist(deny.data || [])
      setAllowlist(allow.data || [])
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

  const tabStyle = (t) => ({
    padding: '8px 16px', fontSize: 13, cursor: 'pointer',
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

  const filteredServices = SERVICES.map(group => ({
    ...group,
    items: group.items.filter(s =>
      s.label.toLowerCase().includes(serviceSearch.toLowerCase())
    )
  })).filter(g => g.items.length > 0)

  const blockedServiceCount = Object.values(services).filter(Boolean).length
  const blockedCatCount = Object.values(categories).filter(Boolean).length

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>Profile: {profileId}</h1>
          <p style={{ color: '#6B6B68', fontSize: 13 }}>
            {blockedCatCount} categories · {blockedServiceCount} apps & sites blocked
          </p>
        </div>
        <button onClick={() => navigate(`/profile/${profileId}/install`)} style={{
          padding: '8px 16px', borderRadius: 8, background: '#1D9E75',
          color: '#fff', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer'
        }}>
          + Install on device
        </button>
      </div>

      {error && (
        <div style={{ ...card, background: '#FCEBEB', border: '0.5px solid #F0A0A0', marginBottom: 12 }}>
          <p style={{ color: '#A32D2D', fontSize: 13 }}>⚠️ {error}</p>
        </div>
      )}

      <div style={{ display: 'flex', borderBottom: '0.5px solid #E4E4E0', marginBottom: 20 }}>
        <button style={tabStyle('filters')} onClick={() => setTab('filters')}>Categories</button>
        <button style={tabStyle('services')} onClick={() => setTab('services')}>
          Apps & sites {blockedServiceCount > 0 && <span style={{
            marginLeft: 6, background: '#1D9E75', color: '#fff',
            fontSize: 10, padding: '1px 6px', borderRadius: 10
          }}>{blockedServiceCount}</span>}
        </button>
        <button style={tabStyle('deny')} onClick={() => setTab('deny')}>Always block</button>
        <button style={tabStyle('allow')} onClick={() => setTab('allow')}>Always allow</button>
        <button style={tabStyle('activity')} onClick={() => { setTab('activity'); loadLogs() }}>Activity</button>
      </div>

      {loading ? <p style={{ color: '#9B9B97', fontSize: 13 }}>Loading…</p> : (
        <>
          {tab === 'filters' && (
            <div style={card}>
              <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Content categories</h2>
              <p style={{ fontSize: 12, color: '#9B9B97', marginBottom: 16 }}>
                Block entire categories of websites and apps in one toggle.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {CATEGORIES.map(cat => {
                  const isOn = !!categories[cat.id]
                  return (
                    <div key={cat.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 8,
                      border: `0.5px solid ${isOn ? '#5DCAA5' : '#E4E4E0'}`,
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
                <p style={{ fontSize: 12, color: '#9B9B97', marginBottom: 12 }}>
                  Block specific apps and websites by name. More precise than categories.
                </p>
                <input
                  value={serviceSearch}
                  onChange={e => setServiceSearch(e.target.value)}
                  placeholder="Search apps & sites…"
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: '0.5px solid #E4E4E0', fontSize: 13, marginBottom: 4
                  }}
                />
              </div>

              {filteredServices.map(group => (
                <div key={group.group} style={{ ...card, marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#9B9B97', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {group.group}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {group.items.map(svc => {
                      const isOn = !!services[svc.id]
                      return (
                        <div key={svc.id} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 12px', borderRadius: 8,
                          border: `0.5px solid ${isOn ? '#F0A0A0' : '#E4E4E0'}`,
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
              <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Always blocked</h2>
              <p style={{ fontSize: 12, color: '#9B9B97', marginBottom: 16 }}>
                Specific domains that are always blocked, regardless of other settings.
              </p>
              {denylist.length === 0 && (
                <p style={{ fontSize: 13, color: '#C0C0BB', marginBottom: 12 }}>No sites added yet.</p>
              )}
              {denylist.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0', borderBottom: '0.5px solid #F0F0EE'
                }}>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#FCEBEB', color: '#A32D2D', fontWeight: 500 }}>Blocked</span>
                  <span style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }}>{item.id}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <input value={denyInput} onChange={e => setDenyInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addDomain('deny')}
                  placeholder="e.g. example.com"
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '0.5px solid #E4E4E0', fontSize: 13 }}
                />
                <button onClick={() => addDomain('deny')} style={{
                  padding: '8px 16px', borderRadius: 6, background: '#A32D2D',
                  color: '#fff', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer'
                }}>Block site</button>
              </div>
            </div>
          )}

          {tab === 'allow' && (
            <div style={card}>
              <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Always allowed</h2>
              <p style={{ fontSize: 12, color: '#9B9B97', marginBottom: 16 }}>
                Sites that are always accessible, even if a category blocks them.
              </p>
              {allowlist.length === 0 && (
                <p style={{ fontSize: 13, color: '#C0C0BB', marginBottom: 12 }}>No sites added yet.</p>
              )}
              {allowlist.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0', borderBottom: '0.5px solid #F0F0EE'
                }}>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#E1F5EE', color: '#0F6E56', fontWeight: 500 }}>Allowed</span>
                  <span style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }}>{item.id}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <input value={allowInput} onChange={e => setAllowInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addDomain('allow')}
                  placeholder="e.g. bbc.co.uk"
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '0.5px solid #E4E4E0', fontSize: 13 }}
                />
                <button onClick={() => addDomain('allow')} style={{
                  padding: '8px 16px', borderRadius: 6, background: '#1D9E75',
                  color: '#fff', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer'
                }}>Allow site</button>
              </div>
            </div>
          )}

          {tab === 'activity' && (
            <div style={card}>
              <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Recent activity</h2>
              <p style={{ fontSize: 12, color: '#9B9B97', marginBottom: 16 }}>DNS queries from devices using this profile.</p>
              {logs.length === 0 ? (
                <p style={{ fontSize: 13, color: '#C0C0BB' }}>No recent activity found.</p>
              ) : (
                logs.slice(0, 50).map((log, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '7px 0', borderBottom: '0.5px solid #F0F0EE', fontSize: 12
                  }}>
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 500,
                      background: log.blocked ? '#FCEBEB' : '#E1F5EE',
                      color: log.blocked ? '#A32D2D' : '#0F6E56'
                    }}>{log.blocked ? 'Blocked' : 'Allowed'}</span>
                    <span style={{ flex: 1, fontFamily: 'monospace' }}>{log.domain || log.name}</span>
                    <span style={{ color: '#9B9B97' }}>{log.device?.name || '—'}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
