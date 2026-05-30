import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getProfileSection, updateProfileSection, updateProfile, addToList,
  getLogs, getAnalytics, updateSchedule, getProfiles
} from '../api'
import { friendlyDomain, groupActivity } from '../lib/friendlyDomains'
import { useAuth } from '../lib/AuthContext'
import { getHousehold, getDevices, removeDevice } from '../lib/household'

const FONT_D = "'Fraunces', Georgia, serif"
const AVATARS = ['🦊','🐻','🐼','🐰','🦁','🐨','🐸','🐯']
const TINTS = ['#E8F5EE','#E9F1F8','#FBF1DD','#FCEDE7','#EFEAF8','#FBEFF4']
const TINT_TEXT = ['#0E5E42','#3E7CB1','#9A6B12','#C2502F','#6B4D9E','#A33866']

const CATEGORIES = [
  { id: 'porn', label: 'Adult content', desc: 'Explicit & adult sites', icon: '🔞' },
  { id: 'gambling', label: 'Gambling', desc: 'Betting & casino', icon: '🎰' },
  { id: 'dating', label: 'Dating', desc: 'Dating apps & sites', icon: '💘' },
  { id: 'piracy', label: 'Piracy', desc: 'Torrent & piracy', icon: '🏴‍☠️' },
  { id: 'socialNetworks', label: 'Social media', desc: 'Instagram, TikTok, X', icon: '📱' },
  { id: 'videoStreaming', label: 'Video streaming', desc: 'YouTube, Netflix', icon: '📺' },
  { id: 'gaming', label: 'Gaming', desc: 'Games & platforms', icon: '🎮' },
  { id: 'drugs', label: 'Drugs', desc: 'Drug-related content', icon: '⚠️' },
]

const SERVICES = [
  { group: 'Social media', items: [
    ['instagram','Instagram','📸'],['tiktok','TikTok','🎵'],['snapchat','Snapchat','👻'],
    ['twitter','X / Twitter','🐦'],['facebook','Facebook','👤'],['reddit','Reddit','🟠'],
    ['pinterest','Pinterest','📌'],['discord','Discord','💬'],['whatsapp','WhatsApp','💬'],
    ['telegram','Telegram','✈️'],['bereal','BeReal','📷'],
  ]},
  { group: 'Video & streaming', items: [
    ['youtube','YouTube','▶️'],['netflix','Netflix','🎬'],['disneyplus','Disney+','✨'],
    ['twitch','Twitch','🟣'],['primevideo','Prime Video','📦'],['spotify','Spotify','🎧'],
  ]},
  { group: 'Gaming', items: [
    ['roblox','Roblox','🧱'],['fortnite','Fortnite','🔫'],['minecraft','Minecraft','⛏️'],
    ['steam','Steam','🎮'],['epicgames','Epic Games','🎮'],['xbox','Xbox','🟢'],['playstation','PlayStation','🎮'],
  ]},
  { group: 'Other', items: [
    ['onlyfans','OnlyFans','🔞'],['9gag','9GAG','😂'],['vk','VK','👤'],['dailymotion','Dailymotion','▶️'],
  ]},
]

const DAYS = [['Mon','MO'],['Tue','TU'],['Wed','WE'],['Thu','TH'],['Fri','FR'],['Sat','SA'],['Sun','SU']]

function Toggle({ on, onClick, busy }) {
  return <button className={'gx-toggle' + (on ? ' on' : '')} onClick={onClick} style={{ opacity: busy ? 0.5 : 1 }} aria-pressed={on} />
}

function Card({ children, style }) {
  return <div className="gx-card" style={{ padding: 22, marginBottom: 14, ...style }}>{children}</div>
}

export default function ProfilePage() {
  const { profileId } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('filters')
  const [categories, setCategories] = useState({})
  const [services, setServices] = useState({})
  const [denylist, setDenylist] = useState([])
  const [allowlist, setAllowlist] = useState([])
  const [logs, setLogs] = useState([])
  const [activityRows, setActivityRows] = useState([])
  const [topBlocked, setTopBlocked] = useState([])

  useEffect(() => {
    // Reset everything when switching to a different child so one profile's
    // data never bleeds into another's view.
    setTab('filters')
    setCategories({}); setServices({}); setDenylist([]); setAllowlist([])
    setLogs([]); setActivityRows([]); setTopBlocked([])
    setError(null); setEditing(false)
    setName(''); setDevice(''); setSearch(''); setDeviceList([])
    setSchedDays([])
    setSafeSearch(false); setYoutubeRestricted(false)
    loadAll()
    loadDevices()
  }, [profileId])

  async function loadDevices() {
    try {
      const d = await getDevices(profileId)
      setDeviceList(d)
    } catch { setDeviceList([]) }
  }

  async function deleteDevice(id) {
    try { await removeDevice(id); setDeviceList(deviceList.filter(d => d.id !== id)) } catch {}
  }

  async function loadAll() {
    setLoading(true)
    setError(null)
    // Resilient: each call is independent, so one failure doesn't blank the page.
    const results = await Promise.allSettled([
      getProfileSection(profileId, 'parentalControl'),
      getProfileSection(profileId, 'denylist'),
      getProfileSection(profileId, 'allowlist'),
      getProfiles(),
    ])
    const [pcR, denyR, allowR, allR] = results

    if (pcR.status === 'fulfilled') {
      const pc = pcR.value
      const cats = {}; (pc.data?.categories || []).forEach(c => cats[c.id] = true); setCategories(cats)
      const svcs = {}; (pc.data?.services || []).forEach(s => svcs[s.id] = true); setServices(svcs)
      setSafeSearch(!!pc.data?.safeSearch)
      setYoutubeRestricted(!!pc.data?.youtubeRestrictedMode)
    }
    if (denyR.status === 'fulfilled') {
      const dl = denyR.value.data || []
      setDenylist(dl.filter(d => d.id !== '*'))
    }
    if (allowR.status === 'fulfilled') {
      setAllowlist(allowR.value.data || [])
    }
    if (allR.status === 'fulfilled') {
      const profiles = allR.value.data || []
      const i = profiles.findIndex(p => p.id === profileId); setIdx(i >= 0 ? i : 0)
      const found = profiles.find(p => p.id === profileId)
      const raw = found?.name || profileId
      const parts = raw.split(' | ')
      setName(parts[0]); setDevice(parts[1] || '')
    }
    // Only show an error if the core settings genuinely failed to load.
    if (pcR.status === 'rejected') setError('Some settings could not load. Pull to refresh or try again.')
    setLoading(false)
  }
  const [loading, setLoading] = useState(true)
  const [safeSearch, setSafeSearch] = useState(false)
  const [youtubeRestricted, setYoutubeRestricted] = useState(false)
  const [savingSafe, setSavingSafe] = useState(null)
  const [denyInput, setDenyInput] = useState('')
  const [allowInput, setAllowInput] = useState('')
  const [saving, setSaving] = useState(null)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [name, setName] = useState('')
  const [device, setDevice] = useState('')
  const [deviceList, setDeviceList] = useState([])
  const auth = useAuth()
  const [idx, setIdx] = useState(0)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDevice, setEditDevice] = useState('')
  // schedule
  const [schedDays, setSchedDays] = useState([])
  const [schedFrom, setSchedFrom] = useState('21:00')
  const [schedTo, setSchedTo] = useState('07:00')
  const [schedSaving, setSchedSaving] = useState(false)
  const [schedSaved, setSchedSaved] = useState(false)

  async function loadActivity() {
    try {
      const [l, tb] = await Promise.all([getLogs(profileId), getAnalytics(profileId, 'topBlocked')])
      const rawLogs = l.data || []
      setLogs(rawLogs)
      setActivityRows(groupActivity(rawLogs))
      setTopBlocked(tb.data || [])
    } catch (e) { setLogs([]); setActivityRows([]); setTopBlocked([]) }
  }

  async function save(cats, svcs) {
    await updateProfileSection(profileId, 'parentalControl', {
      categories: Object.entries(cats).filter(([,v]) => v).map(([k]) => ({ id: k, active: true })),
      services: Object.entries(svcs).filter(([,v]) => v).map(([k]) => ({ id: k, active: true })),
    })
  }
  async function toggleCat(id) {
    const u = { ...categories, [id]: !categories[id] }; setCategories(u); setSaving(id)
    try { await save(u, services) } catch { setCategories(categories); setError('Could not save.') } finally { setSaving(null) }
  }
  async function toggleSvc(id) {
    const u = { ...services, [id]: !services[id] }; setServices(u); setSaving(id)
    try { await save(categories, u) } catch { setServices(services); setError('Could not save.') } finally { setSaving(null) }
  }
  async function addDomain(type) {
    const val = (type === 'deny' ? denyInput : allowInput).trim(); if (!val) return
    try {
      await addToList(profileId, type === 'deny' ? 'denylist' : 'allowlist', { id: val, active: true })
      if (type === 'deny') { setDenylist([...denylist, { id: val }]); setDenyInput('') }
      else { setAllowlist([...allowlist, { id: val }]); setAllowInput('') }
    } catch (e) { setError('Could not add: ' + e.message) }
  }
  async function saveEdit() {
    if (!editName.trim()) return
    try { await updateProfile(profileId, { name: editName.trim() }); setName(editName.trim()); setEditing(false) }
    catch { setError('Could not save name.') }
  }
  async function toggleSafeSearch() {
    const v = !safeSearch; setSafeSearch(v); setSavingSafe('safe')
    try { await updateProfileSection(profileId, 'parentalControl', { safeSearch: v }) }
    catch { setSafeSearch(!v); setError('Could not save.') } finally { setSavingSafe(null) }
  }
  async function toggleYoutube() {
    const v = !youtubeRestricted; setYoutubeRestricted(v); setSavingSafe('yt')
    try { await updateProfileSection(profileId, 'parentalControl', { youtubeRestrictedMode: v }) }
    catch { setYoutubeRestricted(!v); setError('Could not save.') } finally { setSavingSafe(null) }
  }
  async function saveScheduleNow() {
    setSchedSaving(true); setSchedSaved(false)
    try {
      // Map to engine recreation format: block during the window on chosen days
      const times = {}
      const dayMap = { MO:'monday',TU:'tuesday',WE:'wednesday',TH:'thursday',FR:'friday',SA:'saturday',SU:'sunday' }
      Object.values(dayMap).forEach(d => { times[d] = [] })
      schedDays.forEach(code => {
        const day = dayMap[code]
        times[day] = [{ start: schedFrom, end: schedTo }]
      })
      await updateSchedule(profileId, { times })
      setSchedSaved(true); setTimeout(() => setSchedSaved(false), 2500)
    } catch (e) { setError('Could not save schedule.') } finally { setSchedSaving(false) }
  }

  const tab_ = (t, label, badge) => (
    <button onClick={() => { setTab(t); if (t === 'activity') loadActivity() }} style={{
      padding: '9px 15px', fontSize: 14, whiteSpace: 'nowrap',
      color: tab === t ? '#0E5E42' : '#5B655F', fontWeight: tab === t ? 600 : 500,
      borderBottom: tab === t ? '2px solid #1F9D6B' : '2px solid transparent'
    }}>
      {label}{badge > 0 && <span style={{ marginLeft: 6, background: '#1F9D6B', color: '#fff', fontSize: 10, padding: '1px 6px', borderRadius: 999 }}>{badge}</span>}
    </button>
  )

  const filtered = SERVICES.map(g => ({ ...g, items: g.items.filter(([,l]) => l.toLowerCase().includes(search.toLowerCase())) })).filter(g => g.items.length)
  const blockedSvc = Object.values(services).filter(Boolean).length
  const tint = TINTS[idx % TINTS.length], tintText = TINT_TEXT[idx % TINT_TEXT.length]

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 22, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, flexShrink: 0 }}>
            {AVATARS[idx % AVATARS.length]}
          </div>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input className="gx-input" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Child's name" style={{ fontWeight: 600 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={saveEdit} className="gx-btn" style={{ padding: '7px 16px', fontSize: 13 }}>Save</button>
                <button onClick={() => setEditing(false)} className="gx-btn-ghost" style={{ padding: '7px 16px', fontSize: 13 }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <h1 style={{ fontFamily: FONT_D, fontSize: 26, fontWeight: 600 }}>{name}</h1>
                <button onClick={() => { setEditName(name); setEditing(true) }} style={{ color: '#C9CFC9', fontSize: 15, padding: '2px 6px' }}>✏️</button>
              </div>
              {deviceList.length
                ? <div style={{ fontSize: 13.5, color: '#5B655F', marginTop: 3, display: 'flex', alignItems: 'center', gap: 8 }}>📱 {deviceList.length} device{deviceList.length > 1 ? 's' : ''} <span className="gx-pill" style={{ background: tint, color: tintText }}>Protected</span></div>
                : <div style={{ fontSize: 13.5, color: '#9AA39D', marginTop: 3 }}>No devices yet — <button onClick={() => navigate(`/app/profile/${profileId}/install`)} style={{ color: '#1F9D6B', fontWeight: 600 }}>add a device</button></div>}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => navigate(`/app/profile/${profileId}/install`)} className="gx-btn" style={{ padding: '10px 18px', fontSize: 14 }}>＋ Add device</button>
        </div>
      </div>

      {error && (
        <div className="gx-card" style={{ background: '#FBEAE8', borderColor: '#E9B5AF', padding: '12px 18px', marginBottom: 14 }}>
          <p style={{ fontSize: 14, color: '#C24238' }}>⚠️ {error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="gx-scroll-x" style={{ display: 'flex', gap: 4, borderBottom: '1px solid #EAE5DA', marginBottom: 20 }}>
        {tab_('filters','Categories')}
        {tab_('services','Apps & sites', blockedSvc)}
        {tab_('devices','Devices', deviceList.length)}
        {tab_('schedule','Recreation time')}
        {tab_('deny','Block list')}
        {tab_('allow','Allow list')}
        {tab_('activity','Activity')}
      </div>

      {loading ? <p style={{ color: '#9AA39D' }}>Loading…</p> : (
        <>
          {tab === 'filters' && (
            <>
            <Card>
              <h2 style={{ fontFamily: FONT_D, fontSize: 18, marginBottom: 4 }}>Safe browsing</h2>
              <p style={{ fontSize: 13, color: '#9AA39D', marginBottom: 16 }}>Force safe modes on search and YouTube, even if the child turns them off themselves.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px', borderRadius: 14, border: '1px solid ' + (safeSearch ? '#A9DCC2' : '#EAE5DA'), background: safeSearch ? '#E8F5EE' : '#fff', marginBottom: 10 }}>
                <span style={{ fontSize: 21 }}>🔍</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>SafeSearch</div>
                  <div style={{ fontSize: 12, color: '#9AA39D' }}>Filters explicit results on Google, Bing &amp; more</div>
                </div>
                <Toggle on={safeSearch} busy={savingSafe === 'safe'} onClick={toggleSafeSearch} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px', borderRadius: 14, border: '1px solid ' + (youtubeRestricted ? '#A9DCC2' : '#EAE5DA'), background: youtubeRestricted ? '#E8F5EE' : '#fff' }}>
                <span style={{ fontSize: 21 }}>▶️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>YouTube Restricted Mode</div>
                  <div style={{ fontSize: 12, color: '#9AA39D' }}>Hides mature videos on YouTube</div>
                </div>
                <Toggle on={youtubeRestricted} busy={savingSafe === 'yt'} onClick={toggleYoutube} />
              </div>
              {youtubeRestricted && (
                <p style={{ fontSize: 12, color: '#9AA39D', marginTop: 10 }}>Note: YouTube also hides comments and watch history while Restricted Mode is on — that's YouTube's own behaviour.</p>
              )}
            </Card>
            <Card>
              <h2 style={{ fontFamily: FONT_D, fontSize: 18, marginBottom: 4 }}>Content categories</h2>
              <p style={{ fontSize: 13, color: '#9AA39D', marginBottom: 16 }}>Block whole categories with one tap.</p>
              <div className="gx-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {CATEGORIES.map(c => {
                  const on = !!categories[c.id]
                  return (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px', borderRadius: 14, border: '1px solid ' + (on ? '#A9DCC2' : '#EAE5DA'), background: on ? '#E8F5EE' : '#fff', transition: 'all 0.15s' }}>
                      <span style={{ fontSize: 21 }}>{c.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{c.label}</div>
                        <div style={{ fontSize: 12, color: '#9AA39D' }}>{c.desc}</div>
                      </div>
                      <Toggle on={on} busy={saving === c.id} onClick={() => toggleCat(c.id)} />
                    </div>
                  )
                })}
              </div>
            </Card>
            </>
          )}

          {tab === 'services' && (
            <>
              <Card style={{ marginBottom: 12 }}>
                <h2 style={{ fontFamily: FONT_D, fontSize: 18, marginBottom: 4 }}>Apps & sites</h2>
                <p style={{ fontSize: 13, color: '#9AA39D', marginBottom: 12 }}>Block specific apps by name — more precise than categories.</p>
                <input className="gx-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search apps & sites…" />
              </Card>
              {filtered.map(g => (
                <Card key={g.group} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9AA39D', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{g.group}</div>
                  <div className="gx-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {g.items.map(([id, label, icon]) => {
                      const on = !!services[id]
                      return (
                        <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', borderRadius: 12, border: '1px solid ' + (on ? '#E9B5AF' : '#EAE5DA'), background: on ? '#FBEAE8' : '#fff', transition: 'all 0.15s' }}>
                          <span style={{ fontSize: 18 }}>{icon}</span>
                          <span style={{ flex: 1, fontSize: 14, fontWeight: on ? 600 : 500 }}>{label}</span>
                          <Toggle on={on} busy={saving === id} onClick={() => toggleSvc(id)} />
                        </div>
                      )
                    })}
                  </div>
                </Card>
              ))}
            </>
          )}

          {tab === 'devices' && (
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <h2 style={{ fontFamily: FONT_D, fontSize: 18 }}>{name}'s devices</h2>
                <button onClick={() => navigate(`/app/profile/${profileId}/install`)} className="gx-btn" style={{ padding: '8px 16px', fontSize: 13 }}>＋ Add device</button>
              </div>
              <p style={{ fontSize: 13, color: '#9AA39D', marginBottom: 16 }}>Each device {name} uses is protected individually, everywhere it goes.</p>
              {!deviceList.length ? (
                <p style={{ fontSize: 14, color: '#C9CFC9' }}>No devices added yet. Tap “Add device” to protect {name}'s first device.</p>
              ) : deviceList.map(d => {
                const icon = d.platform === 'mac' ? '💻' : d.platform === 'android' ? '🤖' : '📱'
                return (
                  <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #F2EEE6' }}>
                    <span style={{ fontSize: 22 }}>{icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 600 }}>{d.name}</div>
                      <div style={{ fontSize: 12, color: '#9AA39D' }}>{d.platform === 'mac' ? 'Mac' : d.platform === 'android' ? 'Android' : 'iPhone / iPad'}</div>
                    </div>
                    <span className="gx-pill" style={{ background: '#E8F5EE', color: '#0E5E42' }}>Protected</span>
                    <button onClick={() => deleteDevice(d.id)} style={{ color: '#C9CFC9', fontSize: 15, padding: '2px 8px' }} title="Remove device">✕</button>
                  </div>
                )
              })}
            </Card>
          )}

          {tab === 'schedule' && (
            <Card>
              <h2 style={{ fontFamily: FONT_D, fontSize: 18, marginBottom: 4 }}>Recreation time</h2>
              <p style={{ fontSize: 13, color: '#9AA39D', marginBottom: 18 }}>Set the daily window when the apps you've blocked are <strong>allowed</strong>. Outside this window they stay blocked. Great for "social media only after 4pm".</p>
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#5B655F', marginBottom: 8 }}>Apply on these days</div>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  {DAYS.map(([label, code]) => {
                    const on = schedDays.includes(code)
                    return (
                      <button key={code} onClick={() => setSchedDays(on ? schedDays.filter(d => d !== code) : [...schedDays, code])}
                        style={{ padding: '9px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                          border: '1px solid ' + (on ? '#1F9D6B' : '#EAE5DA'),
                          background: on ? '#1F9D6B' : '#fff', color: on ? '#fff' : '#5B655F' }}>{label}</button>
                    )
                  })}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#5B655F', marginBottom: 6 }}>Allowed from</div>
                  <input type="time" className="gx-input" value={schedFrom} onChange={e => setSchedFrom(e.target.value)} style={{ width: 140 }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#5B655F', marginBottom: 6 }}>Until</div>
                  <input type="time" className="gx-input" value={schedTo} onChange={e => setSchedTo(e.target.value)} style={{ width: 140 }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button onClick={saveScheduleNow} disabled={schedSaving || !schedDays.length} className="gx-btn" style={{ opacity: (schedSaving || !schedDays.length) ? 0.6 : 1 }}>
                  {schedSaving ? 'Saving…' : 'Save recreation time'}
                </button>
                {schedSaved && <span style={{ fontSize: 13, color: '#1F9D6B', fontWeight: 600 }}>✓ Saved</span>}
                {!schedDays.length && <span style={{ fontSize: 13, color: '#9AA39D' }}>Pick at least one day</span>}
              </div>
              <div style={{ marginTop: 18, padding: '12px 16px', background: '#F7F4ED', borderRadius: 12, fontSize: 13, color: '#5B655F' }}>
                💡 The apps allowed during recreation time are the ones you've blocked under Categories and Apps &amp; sites. One window per day is supported.
              </div>
            </Card>
          )}

          {tab === 'deny' && (
            <Card>
              <h2 style={{ fontFamily: FONT_D, fontSize: 18, marginBottom: 4 }}>Block list</h2>
              <p style={{ fontSize: 13, color: '#9AA39D', marginBottom: 16 }}>Specific sites always blocked.</p>
              {!denylist.length && <p style={{ fontSize: 14, color: '#C9CFC9', marginBottom: 12 }}>Nothing here yet.</p>}
              {denylist.map((it, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid #F2EEE6' }}>
                  <span className="gx-pill" style={{ background: '#FBEAE8', color: '#C24238' }}>Blocked</span>
                  <span style={{ flex: 1, fontFamily: 'monospace', fontSize: 13 }}>{it.id}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <input className="gx-input" value={denyInput} onChange={e => setDenyInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addDomain('deny')} placeholder="e.g. example.com" />
                <button onClick={() => addDomain('deny')} className="gx-btn" style={{ background: '#C24238', boxShadow: 'none', whiteSpace: 'nowrap' }}>Block</button>
              </div>
            </Card>
          )}

          {tab === 'allow' && (
            <Card>
              <h2 style={{ fontFamily: FONT_D, fontSize: 18, marginBottom: 4 }}>Allow list</h2>
              <p style={{ fontSize: 13, color: '#9AA39D', marginBottom: 16 }}>Always-allowed sites, even if a category blocks them.</p>
              {!allowlist.length && <p style={{ fontSize: 14, color: '#C9CFC9', marginBottom: 12 }}>Nothing here yet.</p>}
              {allowlist.map((it, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid #F2EEE6' }}>
                  <span className="gx-pill" style={{ background: '#E8F5EE', color: '#0E5E42' }}>Allowed</span>
                  <span style={{ flex: 1, fontFamily: 'monospace', fontSize: 13 }}>{it.id}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <input className="gx-input" value={allowInput} onChange={e => setAllowInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addDomain('allow')} placeholder="e.g. bbc.co.uk" />
                <button onClick={() => addDomain('allow')} className="gx-btn" style={{ whiteSpace: 'nowrap' }}>Allow</button>
              </div>
            </Card>
          )}

          {tab === 'activity' && (
            <>
              {topBlocked.length > 0 && (
                <Card>
                  <h2 style={{ fontFamily: FONT_D, fontSize: 18, marginBottom: 14 }}>Most blocked</h2>
                  {topBlocked.slice(0, 6).map((d, i) => {
                    const f = friendlyDomain(d.domain || d.name)
                    const max = topBlocked[0]?.queries || 1
                    const pct = Math.round(((d.queries || 0) / max) * 100)
                    return (
                      <div key={i} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 4 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span>{f.icon}</span> {f.name}</span>
                          <span style={{ color: '#9AA39D' }}>{d.queries || 0} tries</span>
                        </div>
                        <div style={{ height: 6, background: '#F2EEE6', borderRadius: 999 }}>
                          <div style={{ height: '100%', width: pct + '%', background: '#C24238', borderRadius: 999 }} />
                        </div>
                      </div>
                    )
                  })}
                </Card>
              )}
              <Card>
                <h2 style={{ fontFamily: FONT_D, fontSize: 18, marginBottom: 4 }}>Recent activity</h2>
                <p style={{ fontSize: 13, color: '#9AA39D', marginBottom: 16 }}>What {name || 'this device'} has been using, in plain English.</p>
                {!activityRows.length ? <p style={{ fontSize: 14, color: '#C9CFC9' }}>No recent activity yet.</p> : activityRows.slice(0, 40).map((row, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid #F2EEE6' }}>
                    <span style={{ fontSize: 20, width: 26, textAlign: 'center' }}>{row.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 600 }}>{row.name}</div>
                      <div style={{ fontSize: 12, color: '#9AA39D' }}>
                        {row.count} visit{row.count !== 1 ? 's' : ''}{row.blocked > 0 ? ` · ${row.blocked} blocked` : ''}
                      </div>
                    </div>
                    {row.blocked > 0 && row.allowed === 0
                      ? <span className="gx-pill" style={{ background: '#FBEAE8', color: '#C24238' }}>Blocked</span>
                      : row.blocked > 0
                        ? <span className="gx-pill" style={{ background: '#FBF1DD', color: '#9A6B12' }}>Mixed</span>
                        : <span className="gx-pill" style={{ background: '#E8F5EE', color: '#0E5E42' }}>Allowed</span>}
                  </div>
                ))}
              </Card>
            </>
          )}
        </>
      )}
    </div>
  )
}
