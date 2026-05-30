import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProfile } from '../api'
import { useAuth, linkProfileToUser } from '../lib/AuthContext'

const FONT_D = "'Fraunces', Georgia, serif"
const G = '#1F9D6B', GL = '#E8F5EE', GD = '#0E5E42'
const STEPS = ['Welcome', 'Your child', 'Their device', 'Done']

function Bar({ step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 38 }}>
      {STEPS.map((label, i) => {
        const done = i < step, active = i === step
        return (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: done ? G : active ? GL : '#F2EEE6', border: '2px solid ' + (done || active ? G : '#EAE5DA'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: done ? '#fff' : active ? GD : '#C9CFC9' }}>{done ? '✓' : i + 1}</div>
              <span style={{ fontSize: 11, color: active ? GD : done ? '#5B655F' : '#C9CFC9', fontWeight: active ? 700 : 500, whiteSpace: 'nowrap' }}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: done ? G : '#EAE5DA', margin: '-14px 4px 0' }} />}
          </React.Fragment>
        )
      })}
    </div>
  )
}

const label = { display: 'block', fontSize: 12, fontWeight: 600, color: '#5B655F', marginBottom: 6 }

function Step0({ onNext, userName }) {
  return (
    <div>
      <div style={{ fontSize: 38, marginBottom: 14 }}>👋</div>
      <h2 style={{ fontFamily: FONT_D, fontSize: 27, marginBottom: 8 }}>Welcome{userName ? ', ' + userName.split(' ')[0] : ''}!</h2>
      <p style={{ fontSize: 15, color: '#5B655F', lineHeight: 1.7, marginBottom: 26 }}>Let's get your child protected in about 3 minutes. Guardly works at the <strong>device level</strong> — protection travels with the device wherever it goes.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 30 }}>
        {[['👤','Create a profile for your child'],['📱','Install a profile on their specific device'],['🌍','Protected on every network — home, school, anywhere']].map(([i, t]) => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14, background: '#F7F4ED', fontSize: 14.5 }}><span style={{ fontSize: 19 }}>{i}</span> {t}</div>
        ))}
      </div>
      <button onClick={onNext} className="gx-btn" style={{ width: '100%' }}>Let's get started →</button>
    </div>
  )
}

function Step1({ onNext }) {
  const [name, setName] = useState(''), [age, setAge] = useState(''), [busy, setBusy] = useState(false), [err, setErr] = useState(null)
  const auth = useAuth()
  const ages = [['Under 8','7','Strictest filters'],['8–11','10','Balanced for primary'],['12–15','13','Secondary school'],['16+','16','Lighter touch']]
  async function go() {
    if (!name.trim() || !age) return
    setBusy(true); setErr(null)
    try {
      const r = await createProfile({ name: name.trim() })
      const id = r.data?.id
      if (auth?.user && id) await linkProfileToUser(auth.user.id, id)
      onNext({ profileId: id, childName: name.trim() })
    } catch (e) { setErr('Could not create profile.'); setBusy(false) }
  }
  return (
    <div>
      <h2 style={{ fontFamily: FONT_D, fontSize: 27, marginBottom: 8 }}>Your child</h2>
      <p style={{ fontSize: 14, color: '#5B655F', marginBottom: 22 }}>We'll set sensible defaults for their age — adjust anything later.</p>
      <label style={label}>Child's first name</label>
      <input className="gx-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Emma" style={{ marginBottom: 20 }} />
      <label style={label}>Age group</label>
      <div className="gx-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 26 }}>
        {ages.map(([l, v, d]) => (
          <button key={v} onClick={() => setAge(v)} style={{ padding: '13px', borderRadius: 14, textAlign: 'left', border: '1.5px solid ' + (age === v ? G : '#EAE5DA'), background: age === v ? GL : '#fff' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: age === v ? GD : '#1A2420' }}>{l}</div>
            <div style={{ fontSize: 12, color: '#9AA39D', marginTop: 2 }}>{d}</div>
          </button>
        ))}
      </div>
      {err && <p style={{ color: '#C24238', fontSize: 13, marginBottom: 12 }}>{err}</p>}
      <button onClick={go} disabled={!name.trim() || !age || busy} className="gx-btn" style={{ width: '100%', opacity: (!name.trim() || !age || busy) ? 0.5 : 1 }}>{busy ? 'Creating…' : 'Next →'}</button>
    </div>
  )
}

function Step2({ profileId, childName, onNext }) {
  const [platform, setPlatform] = useState(null), [deviceName, setDeviceName] = useState(''), [phase, setPhase] = useState('pick')
  const plats = [['iphone','iPhone or iPad','📱',"e.g. Emma's iPhone"],['mac','Mac','💻',"e.g. Emma's MacBook"],['android','Android phone','🤖',"e.g. Emma's Samsung"]]
  const configUrl = window.location.origin + '/api/install/' + profileId
  const dotHost = 'dns.guardly.app'
  const steps = {
    iphone: ['On ' + deviceName + ', open Safari', 'Go to the Guardly link below and tap Allow', 'Open Settings → General → VPN & Device Management', 'Tap the Guardly profile → Install', 'Enter the device passcode to confirm'],
    mac: ['On ' + deviceName + ', open Safari and go to the link below', 'Open System Settings → Privacy & Security → Profiles', 'Click the Guardly profile → Install', "Enter your admin password (not the child's)"],
    android: ['Open Settings on ' + deviceName, 'Search for "Private DNS"', 'Choose "Private DNS provider hostname"', 'Enter the hostname below and Save'],
  }

  if (phase === 'pick') return (
    <div>
      <h2 style={{ fontFamily: FONT_D, fontSize: 25, marginBottom: 8 }}>Which device does {childName} use?</h2>
      <p style={{ fontSize: 14, color: '#5B655F', marginBottom: 6 }}>Protection installs <strong>per device</strong>. Add more later.</p>
      <div className="gx-card" style={{ background: GL, borderColor: '#A9DCC2', padding: '12px 16px', marginBottom: 22, fontSize: 13, color: GD }}>🌍 Once installed, it's protected everywhere — home, school, mobile data.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
        {plats.map(([id, l, icon]) => (
          <button key={id} onClick={() => setPlatform(id)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px', borderRadius: 14, textAlign: 'left', border: '1.5px solid ' + (platform === id ? G : '#EAE5DA'), background: platform === id ? GL : '#fff', width: '100%' }}>
            <span style={{ fontSize: 24 }}>{icon}</span>
            <span style={{ fontWeight: 700, fontSize: 14, color: platform === id ? GD : '#1A2420' }}>{l}</span>
          </button>
        ))}
      </div>
      {platform && (<>
        <label style={label}>Name this device</label>
        <input className="gx-input" value={deviceName} onChange={e => setDeviceName(e.target.value)} placeholder={plats.find(p => p[0] === platform)?.[3]} style={{ marginBottom: 8 }} />
        <p style={{ fontSize: 12, color: '#9AA39D', marginBottom: 20 }}>Helps you spot this device in your activity logs.</p>
      </>)}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => setPhase('guide')} disabled={!platform || !deviceName.trim()} className="gx-btn" style={{ flex: 1, opacity: (!platform || !deviceName.trim()) ? 0.5 : 1 }}>Show me how →</button>
        <button onClick={() => onNext({ deviceName: '' })} className="gx-btn-ghost" style={{ flex: 1 }}>I'll do this later</button>
      </div>
    </div>
  )

  return (
    <div>
      <h2 style={{ fontFamily: FONT_D, fontSize: 24, marginBottom: 4 }}>Installing on {deviceName}</h2>
      <p style={{ fontSize: 14, color: '#5B655F', marginBottom: 20 }}>Follow these on the device itself.</p>
      <div style={{ background: '#F7F4ED', borderRadius: 14, padding: 18, marginBottom: 14 }}>
        {(steps[platform] || []).map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < steps[platform].length - 1 ? 13 : 0 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: G, color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</div>
            <span style={{ fontSize: 13.5, color: '#3d3d3a', lineHeight: 1.6, paddingTop: 2 }}>{s}</span>
          </div>
        ))}
      </div>
      <label style={label}>{platform === 'android' ? 'Hostname' : 'Guardly install link'}</label>
      <div style={{ background: '#F7F4ED', border: '1px solid #EAE5DA', borderRadius: 10, padding: '10px 14px', fontSize: 12.5, fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: 20 }}>{platform === 'android' ? dotHost : configUrl}</div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => onNext({ deviceName })} className="gx-btn" style={{ flex: 1 }}>✓ Done, continue →</button>
        <button onClick={() => onNext({ deviceName })} className="gx-btn-ghost" style={{ flex: 1 }}>Skip</button>
      </div>
    </div>
  )
}

function Step3({ childName, deviceName, onFinish }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 74, height: 74, borderRadius: '50%', background: GL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 20px' }}>🎉</div>
      <h2 style={{ fontFamily: FONT_D, fontSize: 27, marginBottom: 8 }}>{childName} is set up!</h2>
      {deviceName && <div className="gx-pill" style={{ background: GL, color: GD, marginBottom: 16 }}>📱 {deviceName} protected once installed</div>}
      <p style={{ fontSize: 15, color: '#5B655F', lineHeight: 1.7, marginBottom: 28 }}>From your dashboard you can fine-tune filters, set time limits, add more children and devices, and see activity.</p>
      <button onClick={onFinish} className="gx-btn" style={{ width: '100%' }}>Go to my dashboard →</button>
    </div>
  )
}

export default function OnboardingFlow() {
  const [step, setStep] = useState(0)
  const [profileId, setProfileId] = useState(null)
  const [childName, setChildName] = useState('')
  const [deviceName, setDeviceName] = useState('')
  const navigate = useNavigate()
  const auth = useAuth()
  const userName = auth?.user?.user_metadata?.full_name || ''

  return (
    <div style={{ minHeight: '100vh', background: '#FBF9F4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 18px' }}>
      <div className="gx-card fade-up" style={{ padding: '40px', width: '100%', maxWidth: 520, boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 30 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(160deg,#27B07A,#1F9D6B)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2 L20 5.5 L20 12 C20 17 16.5 20.5 12 22 C7.5 20.5 4 17 4 12 L4 5.5 Z" fill="#fff" /><path d="M8.5 12 l2.5 2.5 l4.5 -5.5" stroke="#1F9D6B" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <span style={{ fontFamily: FONT_D, fontWeight: 700, fontSize: 17 }}>Guardly</span>
        </div>
        <Bar step={step} />
        {step === 0 && <Step0 onNext={() => setStep(1)} userName={userName} />}
        {step === 1 && <Step1 onNext={({ profileId, childName }) => { setProfileId(profileId); setChildName(childName); setStep(2) }} />}
        {step === 2 && <Step2 profileId={profileId} childName={childName} onNext={({ deviceName }) => { setDeviceName(deviceName); setStep(3) }} />}
        {step === 3 && <Step3 childName={childName} deviceName={deviceName} onFinish={() => navigate('/app')} />}
      </div>
    </div>
  )
}
