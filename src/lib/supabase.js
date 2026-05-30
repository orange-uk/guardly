// src/lib/supabase.js
// Supabase client — handles authentication and the user/profile database.
// Env vars (set in Cloudflare Pages → Settings → Variables):
//   VITE_SUPABASE_URL       — your project URL
//   VITE_SUPABASE_ANON_KEY  — your project's anon/public key
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = (url && anonKey)
  ? createClient(url, anonKey)
  : null

export const isSupabaseConfigured = () => !!(url && anonKey)
