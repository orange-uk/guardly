import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProfileSection, updateProfileSection, addToList, getLogs } from '../api'

const card = {
  background: '#fff', border: '0.5px solid #E4E4E0',
  borderRadius: 12, padding: '20px 24px', marginBottom: 12
}

const CATEGORIES = [
  { id: 'porn',       label: 'Adult content',  desc: 'Explicit & adult sites',       icon: '🔞' },
  { id: 'gambling',   label: 'Gambling',        desc: 'Betting & casino sites',       icon: '🎰' },
  { id: 'dating',     label: 'Dating',          desc: 'Dating apps & sites',          icon: '💘' },
  { id: 'piracy',     label: 'Piracy',          desc: 'Torrent & piracy sites',       icon: '🏴‍☠️' },
  { id: 'socialNetworks', label: 'Social media', desc: 'Instagram, TikTok, X',       icon: '📱' },
  { id: 'vpn',        label: 'VPN sites',       desc: 'Block VPN download sites',     icon: '🔒' },
  { id: 'gaming',     label: 'Gaming',          desc: 'Games & gaming platforms',     icon: '🎮' },
  { id: 'drugs',      label: 'Drugs',           desc: 'Drug-related content',         icon: '⚠️' },
]

export default function ProfilePage() {
  const { profileId } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('filters')
  const [categories, setCategories] = useState({})
  const [denylist, setDenylist] = useState([])
  const [allowlist, setAllowlist] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [denyInput, setDenyInput] = useState('')
  const [allowInput, setAllowInput] = useState('')
  const [saving, setSaving] = useState(null)
  const [error, setError] = useState(null)

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
    } catch (e) {
      setLogs([])
    }
  }

  async function toggleCategory(catId) {
    const isOn = categories[catId]
    const updated = { ...categories, [catId]: !isOn }
    setCategories(updated)
    setSaving(catId)
    try {
      const activeIds = Object.entries(updated).filter(([,v]) => v).map(([k]) => k)
      await updateProfileSection(profileId, 'parentalControl', {
        categories: activeIds.map(id => ({ id, active: true }))
      })
    } catch (e) {
      setCategories(categories)
      setError('Could not save change.')
    } finally {
      setSaving(null)
    }
  }

  async function addDomain(type) {
    const val = type === 'deny' ? denyInput.trim() : allowInput.trim()
    if (!val) return
    try {
      await addToList(profileId, type === 'deny' ? 'denylist' : 'allowlist', {
        id: val, active: true
      })
      if (type === 'deny') { setDenylist([...denylist, { id: val, active: true }]); setDenyInput('') }
      else { setAllowlist([...allowlist, { id: val, active: true }]); setAllowInput('') }
    } catch (e) {
      setError('Could not add domain: ' + e.message)
    }
  }

  const tabStyle = (t) => ({
    padding: '8px 16px', fontSize: 13, cursor: 'pointer',
    border: 'none', background: 'none',
    color: tab === t ? '#1D9E75' : '#6B6B68',
    borderBottom: tab === t ? '2px solid #1D9E75' : '2px solid transparent',
    fontWeight: tab === t ? 500 : 400
  })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>Profile: {profileId}</h1>
          <p style={{ color: '#6B6B68', fontSize: 13 }}>Configure filters and manage devices for this profile.</p>
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

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '0.5px solid #E4E4E0', marginBottom: 20 }}>
        <button style={tabStyle('filters')} onClick={() => setTab('filters')}>Filters</button>
        <button style={tabStyle('deny')} onClick={() => setTab('deny')}>Always block</button>
        <button style={tabStyle('allow')} onClick={() => setTab('allow')}>Always allow</button>
        <button style={tabStyle('activity')} onClick={() => { setTab('activity'); loadLogs() }}>Activity</button>
      </div>

      {loading ? <p style={{ color: '#9B9B97', fontSize: 13 }}>Loading…</p> : (
        <>
          {tab === 'filters' && (
            <div>
              <div style={{ ...card }}>
                <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Content categories</h2>
                <p style={{ fontSize: 12, color: '#9B9B97', marginBottom: 16 }}>
                  Toggle categories to block entire groups of sites and apps instantly.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {CATEGORIES.map(cat => {
                    const isOn = !!categories[cat.id]
                    return (
                      <div key={cat.id} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 14px', borderRadius: 8,
                        border: `0.5px solid ${isOn ? '#5DCAA5' : '#E4E4E0'}`,
                        background: isOn ? '#E1F5EE' : '#fff',
                        transition: 'all 0.15s'
                      }}>
                        <span style={{ fontSize: 20 }}>{cat.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{cat.label}</div>
                          <div style={{ fontSize: 11, color: '#9B9B97' }}>{cat.desc}</div>
                        </div>
                        <button onClick={() => toggleCategory(cat.id)} style={{
                          width: 36, height: 20, borderRadius: 10, border: 'none',
                          background: isOn ? '#1D9E75' : '#C8C8C4', cursor: 'pointer',
                          position: 'relative', transition: 'background 0.2s',
                          opacity: saving === cat.id ? 0.6 : 1
                        }}>
                          <span style={{
                            position: 'absolute', width: 16, height: 16, borderRadius: '50%',
                            background: '#fff', top: 2, left: isOn ? 18 : 2,
                            transition: 'left 0.2s'
                          }} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {tab === 'deny' && (
            <div style={card}>
              <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Always blocked</h2>
              <p style={{ fontSize: 12, color: '#9B9B97', marginBottom: 16 }}>
                These specific sites are always blocked, regardless of category settings.
              </p>
              {denylist.length === 0 && (
                <p style={{ fontSize: 13, color: '#C0C0BB', marginBottom: 12 }}>No sites blocked yet.</p>
              )}
              {denylist.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0', borderBottom: '0.5px solid #F0F0EE'
                }}>
                  <span style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 20,
                    background: '#FCEBEB', color: '#A32D2D', fontWeight: 500
                  }}>Blocked</span>
                  <span style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }}>{item.id}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <input
                  value={denyInput}
                  onChange={e => setDenyInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addDomain('deny')}
                  placeholder="e.g. roblox.com"
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 6,
                    border: '0.5px solid #E4E4E0', fontSize: 13
                  }}
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
                These sites are always accessible, even if a category blocks them.
              </p>
              {allowlist.length === 0 && (
                <p style={{ fontSize: 13, color: '#C0C0BB', marginBottom: 12 }}>No sites whitelisted yet.</p>
              )}
              {allowlist.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0', borderBottom: '0.5px solid #F0F0EE'
                }}>
                  <span style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 20,
                    background: '#E1F5EE', color: '#0F6E56', fontWeight: 500
                  }}>Allowed</span>
                  <span style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }}>{item.id}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <input
                  value={allowInput}
                  onChange={e => setAllowInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addDomain('allow')}
                  placeholder="e.g. bbc.co.uk"
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 6,
                    border: '0.5px solid #E4E4E0', fontSize: 13
                  }}
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
              <p style={{ fontSize: 12, color: '#9B9B97', marginBottom: 16 }}>
                DNS queries from devices using this profile.
              </p>
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
