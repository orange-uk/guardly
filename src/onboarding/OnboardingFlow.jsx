import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProfile } from '../api'

const G = '#1D9E75'
const GL = '#E1F5EE'
const GD = '#0F6E56'

const STEP_LABELS = ['Welcome', 'First child', 'Install', 'All done']

const btnStyle = {
  width: '100%', padding: '13px', borderRadius: 10,
  background: G, color: '#fff', border: 'none',
  fontSize: 15, fontWeight: 600, cursor: 'pointer',
  fontFamily: 'system-ui, sans-serif'
}

const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: '#6B6B68', marginBottom: 6, fontFamily: 'system-ui, sans-serif'
}

const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: 8,
  border: '0.5px solid #E4E4E0', fontSize: 14,
  fontFamily: 'system-ui, sans-serif', boxSizing: 'border-box', outline: 'none'
}

function ProgressBar({ step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
      {STEP_LABELS.map((label, i) => {
        const done = i < step
        const active = i === step
        return (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: done ? G : active ? GL : '#F0F0EE',
                border: '2px solid ' + (done || active ? G : '#E4E4E0'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 600,
                color: done ? '#fff' : active ? GD : '#C0C0BB'
              }}>
                {done ? '✓' : i + 1}
              </div>
              <span style={{
                fontSize: 11, color: active ? GD : done ? '#6B6B68' : '#C0C0BB',
                fontWeight: active ? 600 : 400, whiteSpace: 'nowrap',
                fontFamily: 'system-ui, sans-serif'
              }}>{label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div style={{
                flex: 1, height: 2, background: done ? G : '#E4E4E0',
                margin: '-14px 4px 0'
              }} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

function Step0({ onNext, userName }) {
  return (
    <div>
      <div style={{ fontSize: 36, marginBottom: 16 }}>👋</div>
      <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8, color: '#1A1A18' }}>
        Welcome{userName ? ', ' + userName.split(' ')[0] : ''}!
      </h2>
      <p style={{ fontSize: 15, color: '#6B6B68', lineHeight: 1.7, marginBottom: 28, fontFamily: 'system-ui, sans-serif' }}>
        Guardly takes about 3 minutes to set up. By the end your child's
        device will be quietly protected on every network they use.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        {[
          ['🛡', "Create a profile with your filtering rules"],
          ['📱', "Install it on their device in 60 seconds"],
          ['✓', "Done — protection works everywhere, automatically"],
        ].map(([icon, text]) => (
          <div key={text} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px',
            borderRadius: 10, background: '#F7F7F5',
            fontFamily: 'system-ui, sans-serif', fontSize: 14, color: '#3d3d3a'
          }}>
            <span style={{ fontSize: 18 }}>{icon}</span> {text}
          </div>
        ))}
      </div>
      <button onClick={onNext} style={btnStyle}>Let's get started →</button>
    </div>
  )
}

function Step1({ onNext }) {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)

  const ages = [
    { label: 'Under 8', value: '7', desc: 'Strictest filters' },
    { label: '8–11', value: '10', desc: 'Balanced for primary' },
    { label: '12–15', value: '13', desc: 'Secondary school' },
    { label: '16+', value: '16', desc: 'Lighter touch' },
  ]

  async function go() {
    if (!name.trim() || !age) return
    setCreating(true)
    setError(null)
    try {
      const result = await createProfile({ name: name.trim() })
      onNext({ profileId: result.data?.id, childName: name.trim(), age })
    } catch (e) {
      setError('Could not create profile. Please try again.')
      setCreating(false)
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8, color: '#1A1A18' }}>Tell us about your child</h2>
      <p style={{ fontSize: 14, color: '#6B6B68', marginBottom: 24, fontFamily: 'system-ui, sans-serif' }}>
        We'll set sensible defaults for their age. You can change everything later.
      </p>
      <label style={labelStyle}>Child's first name</label>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Emma"
        style={{ ...inputStyle, marginBottom: 20 }} />
      <label style={labelStyle}>Age group</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 28 }}>
        {ages.map(a => (
          <button key={a.value} onClick={() => setAge(a.value)} style={{
            padding: '13px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
            border: '1.5px solid ' + (age === a.value ? G : '#E4E4E0'),
            background: age === a.value ? GL : '#fff'
          }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: age === a.value ? GD : '#1A1A18', fontFamily: 'system-ui, sans-serif' }}>{a.label}</div>
            <div style={{ fontSize: 12, color: '#9B9B97', marginTop: 2, fontFamily: 'system-ui, sans-serif' }}>{a.desc}</div>
          </button>
        ))}
      </div>
      {error && <p style={{ color: '#A32D2D', fontSize: 13, marginBottom: 12, fontFamily: 'system-ui, sans-serif' }}>{error}</p>}
      <button onClick={go} disabled={!name.trim() || !age || creating}
        style={{ ...btnStyle, opacity: (!name.trim() || !age || creating) ? 0.5 : 1 }}>
        {creating ? 'Creating…' : 'Create profile →'}
      </button>
    </div>
  )
}

function Step2({ profileId, childName, onNext }) {
  const [platform, setPlatform] = useState('iphone')
  const [installed, setInstalled] = useState(false)
  const configUrl = 'https://api.nextdns.io/profiles/' + profileId + '/apple-configuration-profile'
  const dotHost = profileId + '.dns.nextdns.io'

  const platforms = [
    { id: 'iphone', label: 'iPhone / iPad', icon: '📱' },
    { id: 'mac', label: 'Mac', icon: '💻' },
    { id: 'android', label: 'Android', icon: '🤖' },
    { id: 'later', label: "I'll do this later", icon: '⏭' },
  ]

  const steps = {
    iphone: [
      "Open Safari on " + childName + "'s device (must be Safari)",
      "Go to the URL below and tap Allow",
      "Go to Settings → General → VPN & Device Management",
      "Tap the Guardly profile and tap Install",
      "Enter the device passcode to confirm",
    ],
    mac: [
      "Open Safari on " + childName + "'s Mac and go to the URL below",
      "Open System Settings → Privacy & Security → Profiles",
      "Click the Guardly profile and click Install",
      "Enter your admin password to approve",
    ],
    android: [
      "Open Settings on the device",
      'Search for "Private DNS" in Settings',
      'Select "Private DNS provider hostname"',
      "Enter the hostname below and tap Save",
    ],
  }

  return (
    <div>
      <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8, color: '#1A1A18' }}>Install on {childName}'s device</h2>
      <p style={{ fontSize: 14, color: '#6B6B68', marginBottom: 20, fontFamily: 'system-ui, sans-serif' }}>
        Pick the device type and follow the steps.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {platforms.map(p => (
          <button key={p.id} onClick={() => setPlatform(p.id)} style={{
            padding: '7px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
            border: '1.5px solid ' + (platform === p.id ? G : '#E4E4E0'),
            background: platform === p.id ? GL : '#fff',
            color: platform === p.id ? GD : '#6B6B68',
            fontWeight: platform === p.id ? 600 : 400,
            fontFamily: 'system-ui, sans-serif',
            display: 'flex', alignItems: 'center', gap: 5
          }}>{p.icon} {p.label}</button>
        ))}
      </div>

      {platform === 'later' ? (
        <div style={{ background: '#FAEEDA', border: '0.5px solid #EF9F27', borderRadius: 10, padding: '16px 20px', marginBottom: 24 }}>
          <p style={{ fontSize: 14, color: '#854F0B', fontFamily: 'system-ui, sans-serif', lineHeight: 1.6, margin: 0 }}>
            No problem — install anytime from <strong>Install on device</strong> in your dashboard.
          </p>
        </div>
      ) : (
        <>
          <div style={{ background: '#F7F7F5', borderRadius: 10, padding: '18px', marginBottom: 14 }}>
            {(steps[platform] || []).map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < steps[platform].length - 1 ? 12 : 0 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', background: G,
                  color: '#fff', fontSize: 11, fontWeight: 600, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>{i + 1}</div>
                <span style={{ fontSize: 13, color: '#3d3d3a', lineHeight: 1.6, paddingTop: 2, fontFamily: 'system-ui, sans-serif' }}>{s}</span>
              </div>
            ))}
          </div>
          <label style={{ ...labelStyle, marginBottom: 6 }}>{platform === 'android' ? 'Hostname' : 'Profile URL'}</label>
          <div style={{
            background: '#F7F7F5', border: '0.5px solid #E4E4E0', borderRadius: 8,
            padding: '10px 14px', fontSize: 12, fontFamily: 'monospace',
            wordBreak: 'break-all', color: '#1A1A18', marginBottom: 20
          }}>{platform === 'android' ? dotHost : configUrl}</div>
        </>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        {platform !== 'later' && (
          <button onClick={() => setInstalled(!installed)} style={{
            ...btnStyle, flex: 1,
            background: installed ? G : '#fff',
            color: installed ? '#fff' : '#1A1A18',
            border: '1.5px solid ' + (installed ? G : '#E4E4E0')
          }}>
            {installed ? '✓ Installed' : 'Mark installed'}
          </button>
        )}
        <button onClick={onNext} style={{ ...btnStyle, flex: 1 }}>
          {platform === 'later' ? 'Go to dashboard →' : installed ? 'Continue →' : 'Skip for now →'}
        </button>
      </div>
    </div>
  )
}

function Step3({ childName, onFinish }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%', background: GL,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36, margin: '0 auto 20px'
      }}>🎉</div>
      <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8, color: '#1A1A18' }}>{childName} is protected!</h2>
      <p style={{ fontSize: 15, color: '#6B6B68', lineHeight: 1.7, marginBottom: 28, fontFamily: 'system-ui, sans-serif' }}>
        Guardly is quietly working in the background. Update filters, add more children,
        or check activity anytime from your dashboard.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28, textAlign: 'left' }}>
        {[
          ['🔧', 'Fine-tune filters', 'Adjust what\'s blocked'],
          ['👧', 'Add another child', 'A profile for each child'],
          ['📊', 'View activity', 'See what\'s being blocked'],
          ['📱', 'More devices', 'Protect all their devices'],
        ].map(([icon, title, desc]) => (
          <div key={title} style={{ padding: '14px', borderRadius: 10, border: '0.5px solid #E4E4E0', background: '#fff' }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A18', fontFamily: 'system-ui, sans-serif' }}>{title}</div>
            <div style={{ fontSize: 12, color: '#9B9B97', fontFamily: 'system-ui, sans-serif' }}>{desc}</div>
          </div>
        ))}
      </div>
      <button onClick={onFinish} style={btnStyle}>Go to my dashboard →</button>
    </div>
  )
}

export default function OnboardingFlow({ userName }) {
  const [step, setStep] = useState(0)
  const [profileId, setProfileId] = useState(null)
  const [childName, setChildName] = useState('')
  const navigate = useNavigate()

  function handleChildCreated({ profileId, childName }) {
    setProfileId(profileId)
    setChildName(childName)
    setStep(2)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#F7F7F5',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', fontFamily: 'Georgia, serif'
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, border: '0.5px solid #E4E4E0',
        padding: '40px 48px', width: '100%', maxWidth: 520
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7, background: G,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, color: '#fff'
          }}>🛡</div>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#1A1A18' }}>Guardly</span>
        </div>
        <ProgressBar step={step} />
        {step === 0 && <Step0 onNext={() => setStep(1)} userName={userName} />}
        {step === 1 && <Step1 onNext={handleChildCreated} />}
        {step === 2 && <Step2 profileId={profileId} childName={childName} onNext={() => setStep(3)} />}
        {step === 3 && <Step3 childName={childName} onFinish={() => navigate('/app')} />}
      </div>
    </div>
  )
}
