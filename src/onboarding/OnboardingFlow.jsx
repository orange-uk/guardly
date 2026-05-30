import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProfile } from '../api'

const G = '#1D9E75'
const GL = '#E1F5EE'
const GD = '#0F6E56'

const STEP_LABELS = ['Welcome', 'Your child', 'Their device', 'All done']

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
        Let's get your child protected in about 3 minutes. Guardly works at the
        <strong> device level</strong> — protection travels with the device wherever it goes.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        {[
          ['👤', 'Create a profile for your child'],
          ['📱', 'Install a security profile on their specific device'],
          ['🌍', 'That device is then protected on every network — home, school, anywhere'],
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
      <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8, color: '#1A1A18' }}>Your child</h2>
      <p style={{ fontSize: 14, color: '#6B6B68', marginBottom: 24, fontFamily: 'system-ui, sans-serif' }}>
        We'll set sensible default filters based on their age. You can adjust everything later.
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
        {creating ? 'Creating…' : 'Next →'}
      </button>
    </div>
  )
}

function Step2({ profileId, childName, onNext }) {
  const [platform, setPlatform] = useState(null)
  const [deviceName, setDeviceName] = useState('')
  const [step, setStep] = useState('pick') // pick | guide | done

  const platforms = [
    { id: 'iphone', label: 'iPhone or iPad', icon: '📱', placeholder: "e.g. Emma's iPhone" },
    { id: 'mac', label: 'Mac', icon: '💻', placeholder: "e.g. Emma's MacBook" },
    { id: 'android', label: 'Android phone', icon: '🤖', placeholder: "e.g. Emma's Samsung" },
  ]

  const guideSteps = {
    iphone: [
      { text: 'On ' + deviceName + ', open Settings' },
      { text: 'Go to General → VPN & Device Management' },
      { text: 'Tap "Add Configuration" or look for a pending profile' },
      { text: 'If not there: open Safari and go to the Guardly install link we\'ll email you' },
      { text: 'Tap Install and enter the device passcode to confirm' },
    ],
    mac: [
      { text: 'On ' + deviceName + ', open System Settings' },
      { text: 'Go to Privacy & Security → Profiles' },
      { text: 'If no profile appears: open Safari and go to the Guardly install link we\'ll email you' },
      { text: 'Open the downloaded file and click Install in System Settings' },
      { text: 'Enter your admin password (your password, not the child\'s)' },
    ],
    android: [
      { text: 'On ' + deviceName + ', open Settings' },
      { text: 'Search for "Private DNS"' },
      { text: 'Select "Private DNS provider hostname"' },
      { text: 'Enter the hostname from the install link we\'ll email you' },
      { text: 'Tap Save' },
    ],
  }

  if (step === 'pick') {
    return (
      <div>
        <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8, color: '#1A1A18' }}>
          Which device does {childName} use?
        </h2>
        <p style={{ fontSize: 14, color: '#6B6B68', marginBottom: 8, fontFamily: 'system-ui, sans-serif' }}>
          Protection is installed <strong>per device</strong>. You can add more devices later.
        </p>
        <div style={{
          background: GL, border: '0.5px solid #5DCAA5', borderRadius: 10,
          padding: '12px 16px', marginBottom: 24, fontSize: 13, color: GD,
          fontFamily: 'system-ui, sans-serif'
        }}>
          🌍 Once installed on a device, it's protected everywhere — home WiFi, school network, mobile data. The protection travels with the device.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {platforms.map(p => (
            <button key={p.id} onClick={() => setPlatform(p.id)} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '16px',
              borderRadius: 10, cursor: 'pointer', textAlign: 'left',
              border: '1.5px solid ' + (platform === p.id ? G : '#E4E4E0'),
              background: platform === p.id ? GL : '#fff', width: '100%'
            }}>
              <span style={{ fontSize: 24 }}>{p.icon}</span>
              <span style={{ fontWeight: 600, fontSize: 14, color: platform === p.id ? GD : '#1A1A18', fontFamily: 'system-ui, sans-serif' }}>{p.label}</span>
            </button>
          ))}
        </div>
        {platform && (
          <>
            <label style={labelStyle}>Give this device a name</label>
            <input
              value={deviceName}
              onChange={e => setDeviceName(e.target.value)}
              placeholder={platforms.find(p => p.id === platform)?.placeholder}
              style={{ ...inputStyle, marginBottom: 20 }}
            />
            <p style={{ fontSize: 12, color: '#9B9B97', marginBottom: 20, fontFamily: 'system-ui, sans-serif' }}>
              This helps you identify which device is which in your activity logs.
            </p>
          </>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setStep('guide')}
            disabled={!platform || !deviceName.trim()}
            style={{ ...btnStyle, flex: 1, opacity: (!platform || !deviceName.trim()) ? 0.5 : 1 }}>
            Show me how to install →
          </button>
          <button onClick={() => onNext({ deviceName: '', platform: '' })} style={{
            flex: 1, padding: '13px', borderRadius: 10, border: '0.5px solid #E4E4E0',
            background: '#fff', fontSize: 14, cursor: 'pointer', color: '#6B6B68',
            fontFamily: 'system-ui, sans-serif'
          }}>I'll do this later</button>
        </div>
      </div>
    )
  }

  if (step === 'guide') {
    return (
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4, color: '#1A1A18' }}>
          Installing on {deviceName}
        </h2>
        <p style={{ fontSize: 14, color: '#6B6B68', marginBottom: 20, fontFamily: 'system-ui, sans-serif' }}>
          Follow these steps on the device itself.
        </p>
        <div style={{ background: '#F7F7F5', borderRadius: 10, padding: '18px', marginBottom: 16 }}>
          {(guideSteps[platform] || []).map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < guideSteps[platform].length - 1 ? 14 : 0 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', background: G,
                color: '#fff', fontSize: 11, fontWeight: 600, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{i + 1}</div>
              <span style={{ fontSize: 13, color: '#3d3d3a', lineHeight: 1.6, paddingTop: 2, fontFamily: 'system-ui, sans-serif' }}>{s.text}</span>
            </div>
          ))}
        </div>
        <div style={{
          background: '#FAEEDA', border: '0.5px solid #EF9F27',
          borderRadius: 10, padding: '12px 16px', marginBottom: 20,
          fontSize: 13, color: '#854F0B', fontFamily: 'system-ui, sans-serif'
        }}>
          💌 We'll also send the install link to your email so you can open it directly on {deviceName}.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => onNext({ deviceName, platform })} style={{ ...btnStyle, flex: 1 }}>
            ✓ Done, continue →
          </button>
          <button onClick={() => onNext({ deviceName, platform })} style={{
            flex: 1, padding: '13px', borderRadius: 10, border: '0.5px solid #E4E4E0',
            background: '#fff', fontSize: 14, cursor: 'pointer', color: '#6B6B68',
            fontFamily: 'system-ui, sans-serif'
          }}>Skip for now</button>
        </div>
      </div>
    )
  }
}

function Step3({ childName, deviceName, onFinish }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%', background: GL,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36, margin: '0 auto 20px'
      }}>🎉</div>
      <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8, color: '#1A1A18' }}>{childName} is set up!</h2>
      {deviceName && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: GL, color: GD, padding: '6px 14px', borderRadius: 20,
          fontSize: 13, fontWeight: 500, marginBottom: 16, fontFamily: 'system-ui, sans-serif'
        }}>
          📱 {deviceName} will be protected once the profile is installed
        </div>
      )}
      <p style={{ fontSize: 15, color: '#6B6B68', lineHeight: 1.7, marginBottom: 28, fontFamily: 'system-ui, sans-serif' }}>
        From your dashboard you can fine-tune filters, add more children and devices, and see activity logs.
      </p>
      <button onClick={onFinish} style={btnStyle}>Go to my dashboard →</button>
    </div>
  )
}

export default function OnboardingFlow({ userName }) {
  const [step, setStep] = useState(0)
  const [profileId, setProfileId] = useState(null)
  const [childName, setChildName] = useState('')
  const [deviceName, setDeviceName] = useState('')
  const navigate = useNavigate()

  function handleChildCreated({ profileId, childName }) {
    setProfileId(profileId)
    setChildName(childName)
    setStep(2)
  }

  function handleDeviceDone({ deviceName, platform }) {
    setDeviceName(deviceName)
    setStep(3)
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
        {step === 2 && <Step2 profileId={profileId} childName={childName} onNext={handleDeviceDone} />}
        {step === 3 && <Step3 childName={childName} deviceName={deviceName} onFinish={() => navigate('/app')} />}
      </div>
    </div>
  )
}
