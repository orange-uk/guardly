// src/lib/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from './supabase'
import { ensureHousehold, getHousehold, getProfileIds, linkProfile, unlinkProfile } from './household'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured()) { setLoading(false); return }
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, name) => {
    if (!isSupabaseConfigured()) throw new Error('Auth not configured yet')
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: { full_name: name } }
    })
    if (error) throw error
    const needsConfirmation = !!data.user && !data.session
    return { ...data, needsConfirmation }
  }

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured()) throw new Error('Auth not configured yet')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    if (isSupabaseConfigured()) await supabase.auth.signOut()
    setUser(null)
  }

  // Closes the account: removes household data this user owns, deletes their
  // auth account via the secure Worker (if configured), then signs out.
  const closeAccount = async () => {
    if (!isSupabaseConfigured() || !user) { await signOut(); return }
    try {
      const hh = await getHousehold(user.id)
      const { data: { session } } = await supabase.auth.getSession()
      await fetch('/api/account/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: session?.access_token, household_id: hh?.id })
      })
    } catch (e) { /* best effort */ }
    await signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, closeAccount }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

// ---- Backward-compatible helpers used across the app (household-based) ----
export async function getOwnedProfileIds(userId) {
  if (!isSupabaseConfigured()) return null
  const hh = await ensureHousehold(userId)
  if (!hh) return []
  return await getProfileIds(hh)
}
export async function linkProfileToUser(userId, profileId, displayName) {
  if (!isSupabaseConfigured()) return
  const hh = await ensureHousehold(userId, displayName)
  if (hh) await linkProfile(hh, profileId)
}
export async function unlinkProfileForUser(userId, profileId) {
  if (!isSupabaseConfigured()) return
  const hh = await ensureHousehold(userId)
  if (hh) await unlinkProfile(hh, profileId)
}
