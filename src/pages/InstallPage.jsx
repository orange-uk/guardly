import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { getHousehold, addDevice } from '../lib/household'
import { DEVICE_GROUPS, DEVICES, deviceSteps } from '../lib/devices'

const FONT_D = "'Fraunces', Georgia, serif"

export default function InstallPage() {
  const { profileId } = useParams()
  const navigate = useNavigate()
  const auth = useAuth()
  const [platform, setPlatform] = useState('iphone')
  const [deviceName, setDeviceName] = useState('')
  const [saved, setSaved] = useState(false)
  const [householdId, setHouseholdId] = useState(null)

  useEffect(() => {
    if (auth?.user) getHousehold(auth.user.id).then(h => setHouseholdId(h?.id))
  }, [auth?.user])

  const configUrl = `${window.location.origin}/api/install/${profileId}`
  const dotHost = 'dns.guardly.app'
  const info = deviceSteps(platform, configUrl, dotHost, deviceName)

  async function saveDevice() {
    if (!deviceName.trim()) return
    if (auth?.user && householdId) await addDevice(householdId, profileId, deviceName.trim(), platform)
    setSaved(true)
    setTimeout(() => navigate(`/app/profile/${profileId}`), 900)
  }

  return (
    <div className="fade-up">
      <button onClick={() => navigate(`/app/profile/${profileId}`)} style={{ fontSize: 13, color: '#5B655F', marginBottom: 14 }}>← Back to profile</button>
      <h1 style={{ fontFamily: FONT_D, fontSize: 28, fontWeight: 600, marginBottom: 4 }}>Add a device</h1>
      <p style={{ color: '#5B655F', fontSize: 15, marginBottom: 22 }}>Pick the device type, give it a name, then follow the steps — about 60 seconds.</p>

      {/* Grouped device picker */}
      {DEVICE_GROUPS.map(g => (
        <div key={g.group} style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9AA39D', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{g.group}</div>
          <div style={{ fontSize: 12.5, color: '#9AA39D', marginBottom: 10 }}>{g.note}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 8 }}>
            {g.items.map(id => {
              const d = DEVICES[id]
              const on = platform === id
              return (
                <button key={id} onClick={() => setPlatform(id)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, textAlign: 'left',
                  border: '1.5px solid ' + (on ? '#1F9D6B' : '#EAE5DA'), background: on ? '#E8F5EE' : '#fff'
                }}>
                  <span style={{ fontSize: 20 }}>{d.icon}</span>
                  <span style={{ fontSize: 13.5, fontWeight: on ? 700 : 500, color: on ? '#0E5E42' : '#1A2420' }}>{d.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Name */}
      <div className="gx-card" style={{ padding: 20, marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#5B655F', marginBottom: 6 }}>Name this device</label>
        <input className="gx-input" value={deviceName} onChange={e => setDeviceName(e.target.value)} placeholder={DEVICES[platform].placeholder} />
        <p style={{ fontSize: 12, color: '#9AA39D', marginTop: 8 }}>Helps you tell this child's devices apart in activity logs.</p>
      </div>

      <div className="gx-card" style={{ background: '#E8F5EE', borderColor: '#A9DCC2', padding: '14px 18px', marginBottom: 18 }}>
        <p style={{ fontSize: 14, color: '#0E5E42' }}>🔒 Once set up, the device stays protected on every network — including school and friends' houses.</p>
      </div>

      {/* Steps */}
      <div className="gx-card" style={{ padding: 24, marginBottom: 16 }}>
        <h2 style={{ fontFamily: FONT_D, fontSize: 19, marginBottom: 18 }}>{DEVICES[platform].label}</h2>
        {info.steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 13, marginBottom: 14 }}>
            <div style={{ width: 25, height: 25, borderRadius: '50%', background: '#1F9D6B', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>{i + 1}</div>
            <div style={{ fontSize: 14.5, color: '#5B655F', lineHeight: 1.6 }}>{s}</div>
          </div>
        ))}
        <div style={{ marginTop: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5B655F', marginBottom: 4 }}>{info.valueLabel}</div>
          <code style={{ display: 'inline-block', padding: '8px 13px', background: '#F7F4ED', borderRadius: 10, fontSize: 12.5, border: '1px solid #EAE5DA', wordBreak: 'break-all', fontFamily: 'monospace' }}>{info.value}</code>
        </div>
        {info.warn && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: '#FBF1DD', borderRadius: 12, fontSize: 13, color: '#9A6B12' }}>⚠️ {info.warn}</div>
        )}
        {info.lockdown && (
          <div style={{ marginTop: 16, padding: '14px 16px', background: '#EAF6F0', borderRadius: 12, border: '1px solid #C2E6D5' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#177A53', marginBottom: 6 }}>🔒 Make it tamper-proof (recommended)</div>
            <div style={{ fontSize: 13, color: '#3F7A63', lineHeight: 1.6 }}>{info.lockdown.intro}</div>
            <ol style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 13, color: '#3F7A63', lineHeight: 1.7 }}>
              {info.lockdown.steps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
            {info.lockdown.note && (
              <div style={{ marginTop: 10, fontSize: 12, color: '#7A857E', fontStyle: 'italic' }}>{info.lockdown.note}</div>
            )}
          </div>
        )}
      </div>

      <button onClick={saveDevice} disabled={!deviceName.trim() || saved} className="gx-btn" style={{ width: '100%', opacity: (!deviceName.trim() || saved) ? 0.6 : 1 }}>
        {saved ? '✓ Device added' : 'Done — save this device'}
      </button>
    </div>
  )
}
