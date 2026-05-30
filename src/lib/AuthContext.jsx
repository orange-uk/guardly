// src/lib/AuthContext.jsx
// Provides auth state across the app and maps the logged-in parent
// to the set of child profiles they own (stored in Supabase).
import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from './supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // Dev fallback: treat as logged-out until keys are added.
      setLoading(false)
      return
    }
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
      email, password,
      options: { data: { full_name: name } }
    })
    if (error) throw error
    return data
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

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

// --- Profile ownership helpers (maps parent → their child profiles) ---
// Table: profiles_owned (user_id uuid, profile_id text, created_at timestamp)
export async function linkProfileToUser(userId, profileId) {
  if (!isSupabaseConfigured()) return
  await supabase.from('profiles_owned').insert({ user_id: userId, profile_id: profileId })
}

export async function getOwnedProfileIds(userId) {
  if (!isSupabaseConfigured()) return null // null = "not configured, show all"
  const { data, error } = await supabase
    .from('profiles_owned').select('profile_id').eq('user_id', userId)
  if (error) return []
  return data.map(r => r.profile_id)
}

export async function unlinkProfile(userId, profileId) {
  if (!isSupabaseConfigured()) return
  await supabase.from('profiles_owned').delete()
    .eq('user_id', userId).eq('profile_id', profileId)
}
