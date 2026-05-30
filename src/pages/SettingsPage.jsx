import React, { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { useNavigate } from 'react-router-dom'
import { isSupabaseConfigured } from '../lib/supabase'
import { getHousehold, getMembers, createInvite, redeemInvite } from '../lib/household'

const FONT_D = "'Fraunces', Georgia, serif"
function Card({ children, danger }) {
  return <div className="gx-card" style={{ padding: 24, marginBottom: 14, ...(danger ? { borderColor: '#E9B5AF' } : {}) }}>{children}</div>
}

export default function SettingsPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [household, setHousehold] = useState(null)
  const [members, setMembers] = useState([])
  const [inviteCode, setInviteCode] = useState(null)
  const [redeemCode, setRedeemCode] = useState('')
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)
  const [closeText, setCloseText] = useState('')

  useEffect(() => { if (auth?.user) loadHousehold() }, [auth?.user])

  async function loadHousehold() {
    const hh = await getHousehold(auth.user.id)
    setHousehold(hh)
    if (hh) setMembers(await getMembers(hh.id))
  }

  async function makeInvite() {
    setBusy(true); setMsg(null)
    const hh = household || await getHousehold(auth.user.id)
    const code = await createInvite(hh?.id)
    setInviteCode(code)
    setBusy(false)
  }

  async function joinHousehold() {
    if (!redeemCode.trim()) return
    setBusy(true); setMsg(null)
    try {
      await redeemInvite(redeemCode, auth.user.id)
      setMsg({ ok: true, text: 'Joined! You now share this family dashboard.' })
      setRedeemCode('')
      await loadHousehold()
      setTimeout(() => navigate('/app'), 1200)
    } catch (e) { setMsg({ ok: false, text: e.message }) }
    finally { setBusy(false) }
  }

  async function doClose() {
    setBusy(true)
    await auth.closeAccount()
    navigate('/')
  }

  const configured = isSupabaseConfigured()

  return (
    <div className="fade-up">
      <h1 style={{ fontFamily: FONT_D, fontSize: 28, fontWeight: 600, marginBottom: 4 }}>Settings</h1>
      <p style={{ color: '#5B655F', fontSize: 15, marginBottom: 22 }}>Manage your account and family.</p>

      <Card>
        <h2 style={{ fontFamily: FONT_D, fontSize: 18, marginBottom: 8 }}>Account</h2>
        {auth?.user
          ? <p style={{ fontSize: 14.5, color: '#5B655F', marginBottom: 16 }}>Signed in as <strong>{auth.user.email}</strong></p>
          : <p style={{ fontSize: 14.5, color: '#5B655F', marginBottom: 16 }}>You're using Guardly in preview mode.</p>}
        <span className="gx-pill" style={{ background: '#E8F5EE', color: '#0E5E42' }}>✓ Active</span>
      </Card>

      {/* Family members / sharing */}
      {configured && auth?.user && (
        <Card>
          <h2 style={{ fontFamily: FONT_D, fontSize: 18, marginBottom: 8 }}>Family members</h2>
          <p style={{ fontSize: 14, color: '#5B655F', marginBottom: 16 }}>
            Invite your partner so you both manage the same children from your own logins.
          </p>

          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#5B655F', marginBottom: 8 }}>People in your family</div>
            {members.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #F2EEE6', fontSize: 14 }}>
                <span style={{ fontSize: 18 }}>{m.user_id === auth.user.id ? '🧑' : '🧑‍🤝‍🧑'}</span>
                <span style={{ flex: 1 }}>{m.user_id === auth.user.id ? 'You' : 'Partner'}</span>
                <span className="gx-pill" style={{ background: '#E8F5EE', color: '#0E5E42' }}>{m.role}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#5B655F', marginBottom: 8 }}>Invite your partner</div>
              {inviteCode ? (
                <div style={{ background: '#E8F5EE', border: '1px solid #A9DCC2', borderRadius: 12, padding: '14px 18px' }}>
                  <div style={{ fontSize: 13, color: '#0E5E42', marginBottom: 6 }}>Share this code with your partner. They sign up, then enter it below under “Join a family”.</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 24, fontWeight: 700, letterSpacing: '0.15em', color: '#0E5E42' }}>{inviteCode}</div>
                </div>
              ) : (
                <button onClick={makeInvite} disabled={busy} className="gx-btn-ghost">Generate invite code</button>
              )}
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#5B655F', marginBottom: 8 }}>Join a family</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="gx-input" value={redeemCode} onChange={e => setRedeemCode(e.target.value.toUpperCase())} placeholder="Enter invite code" style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }} />
                <button onClick={joinHousehold} disabled={busy || !redeemCode.trim()} className="gx-btn" style={{ whiteSpace: 'nowrap', opacity: (busy || !redeemCode.trim()) ? 0.6 : 1 }}>Join</button>
              </div>
              {msg && <p style={{ fontSize: 13, marginTop: 8, color: msg.ok ? '#0E5E42' : '#C24238' }}>{msg.ok ? '✓ ' : '⚠️ '}{msg.text}</p>}
            </div>
          </div>
        </Card>
      )}

      <Card>
        <h2 style={{ fontFamily: FONT_D, fontSize: 18, marginBottom: 8 }}>How Guardly works</h2>
        <p style={{ fontSize: 14.5, color: '#5B655F', lineHeight: 1.7 }}>
          Guardly installs a lightweight security profile on each child's device. It quietly filters the
          tiny lookups every app makes before loading content, so blocked material never appears — on any
          network, anywhere. Nothing runs in the background and nothing slows the device down.
        </p>
      </Card>

      <Card>
        <h2 style={{ fontFamily: FONT_D, fontSize: 18, marginBottom: 8 }}>Support</h2>
        <p style={{ fontSize: 14.5, color: '#5B655F', marginBottom: 16 }}>Questions or trouble? We're happy to help.</p>
        <a href="mailto:support@guardly.app" className="gx-btn-ghost" style={{ display: 'inline-flex' }}>Email support@guardly.app</a>
      </Card>

      {auth?.user && (
        <button onClick={() => { auth.signOut(); navigate('/') }} className="gx-btn-ghost" style={{ marginBottom: 14 }}>Sign out</button>
      )}

      {/* Danger zone */}
      {auth?.user && (
        <Card danger>
          <h2 style={{ fontFamily: FONT_D, fontSize: 18, marginBottom: 8, color: '#C24238' }}>Close account</h2>
          <p style={{ fontSize: 14, color: '#5B655F', marginBottom: 16 }}>
            This permanently deletes your account and your family's profiles. This can't be undone.
          </p>
          {!confirmClose ? (
            <button onClick={() => setConfirmClose(true)} className="gx-btn-ghost" style={{ color: '#C24238', borderColor: '#E9B5AF' }}>Close my account</button>
          ) : (
            <div>
              <p style={{ fontSize: 13, color: '#5B655F', marginBottom: 8 }}>Type <strong>DELETE</strong> to confirm:</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="gx-input" value={closeText} onChange={e => setCloseText(e.target.value)} placeholder="DELETE" />
                <button onClick={doClose} disabled={closeText !== 'DELETE' || busy} className="gx-btn" style={{ background: '#C24238', boxShadow: 'none', whiteSpace: 'nowrap', opacity: (closeText !== 'DELETE' || busy) ? 0.5 : 1 }}>
                  {busy ? 'Closing…' : 'Permanently close'}
                </button>
                <button onClick={() => { setConfirmClose(false); setCloseText('') }} className="gx-btn-ghost" style={{ whiteSpace: 'nowrap' }}>Cancel</button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
