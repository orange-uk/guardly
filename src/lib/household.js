// src/lib/household.js
// Household model: parents belong to a household, child profiles + devices
// belong to the household, so two parents (mum & dad) can share one dashboard.
import { supabase, isSupabaseConfigured } from './supabase'

function genCode() {
  // Friendly 6-char invite code, no ambiguous chars
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let c = ''
  for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)]
  return c
}

// Returns the household id for the current user, creating one if needed.
export async function ensureHousehold(userId, displayName) {
  if (!isSupabaseConfigured() || !userId) return null
  // Already a member?
  const { data: mem } = await supabase
    .from('household_members').select('household_id').eq('user_id', userId).limit(1)
  if (mem && mem.length) return mem[0].household_id
  // Create a new household + membership
  const { data: hh, error } = await supabase
    .from('households').insert({ name: (displayName || 'My') + ' family' }).select().single()
  if (error) return null
  await supabase.from('household_members').insert({ household_id: hh.id, user_id: userId, role: 'parent' })
  return hh.id
}

export async function getHousehold(userId) {
  if (!isSupabaseConfigured() || !userId) return null
  const { data } = await supabase
    .from('household_members').select('household_id, households(name)').eq('user_id', userId).limit(1)
  if (!data || !data.length) return null
  return { id: data[0].household_id, name: data[0].households?.name }
}

export async function getMembers(householdId) {
  if (!isSupabaseConfigured() || !householdId) return []
  const { data } = await supabase
    .from('household_members').select('user_id, role, created_at').eq('household_id', householdId)
  return data || []
}

// --- Invites ---
export async function createInvite(householdId, email) {
  if (!isSupabaseConfigured() || !householdId) return null
  const code = genCode()
  const { error } = await supabase.from('household_invites')
    .insert({ household_id: householdId, code, email: email || null })
  if (error) return null
  return code
}

export async function redeemInvite(code, userId) {
  if (!isSupabaseConfigured()) throw new Error('Not configured')
  const clean = (code || '').trim().toUpperCase()
  const { data: inv, error } = await supabase
    .from('household_invites').select('*').eq('code', clean).eq('accepted', false).limit(1)
  if (error || !inv || !inv.length) throw new Error('That invite code is invalid or has already been used.')
  const invite = inv[0]
  // Remove any household this user already created on their own, then join.
  await supabase.from('household_members').delete().eq('user_id', userId)
  await supabase.from('household_members').insert({ household_id: invite.household_id, user_id: userId, role: 'parent' })
  await supabase.from('household_invites').update({ accepted: true }).eq('id', invite.id)
  return invite.household_id
}

// --- Child profiles owned by household ---
export async function linkProfile(householdId, profileId) {
  if (!isSupabaseConfigured() || !householdId) return
  await supabase.from('household_profiles').insert({ household_id: householdId, profile_id: profileId })
}
export async function getProfileIds(householdId) {
  if (!isSupabaseConfigured() || !householdId) return null
  const { data } = await supabase.from('household_profiles').select('profile_id').eq('household_id', householdId)
  return (data || []).map(r => r.profile_id)
}
export async function unlinkProfile(householdId, profileId) {
  if (!isSupabaseConfigured() || !householdId) return
  await supabase.from('household_profiles').delete().eq('household_id', householdId).eq('profile_id', profileId)
  await supabase.from('devices').delete().eq('profile_id', profileId)
}

// --- Devices (multiple per child) ---
export async function getDevices(profileId) {
  if (!isSupabaseConfigured() || !profileId) return []
  const { data } = await supabase.from('devices').select('*').eq('profile_id', profileId).order('created_at')
  return data || []
}
export async function getDevicesForProfiles(profileIds) {
  if (!isSupabaseConfigured() || !profileIds?.length) return {}
  const { data } = await supabase.from('devices').select('*').in('profile_id', profileIds)
  const map = {}
  ;(data || []).forEach(d => { (map[d.profile_id] = map[d.profile_id] || []).push(d) })
  return map
}
export async function addDevice(householdId, profileId, name, platform) {
  if (!isSupabaseConfigured()) return null
  const { data, error } = await supabase.from('devices')
    .insert({ household_id: householdId, profile_id: profileId, name, platform }).select().single()
  if (error) return null
  return data
}
export async function removeDevice(deviceId) {
  if (!isSupabaseConfigured()) return
  await supabase.from('devices').delete().eq('id', deviceId)
}
