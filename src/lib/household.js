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
// Uses a client-generated id and NO select-after-insert, so RLS read
// policies can never block the membership row from being written.
export async function ensureHousehold(userId, displayName) {
  if (!isSupabaseConfigured() || !userId) return null
  // Already a member? (the hm read policy allows reading your own rows)
  const { data: mem } = await supabase
    .from('household_members').select('household_id').eq('user_id', userId).limit(1)
  if (mem && mem.length) return mem[0].household_id

  // Create a brand-new household with an id we generate here.
  const hhId = (crypto.randomUUID && crypto.randomUUID()) ||
    ('hh-' + Date.now() + '-' + Math.random().toString(36).slice(2))
  const { error: e1 } = await supabase.from('households')
    .insert({ id: hhId, name: (displayName || 'My') + ' family' })
  if (e1) return null
  const { error: e2 } = await supabase.from('household_members')
    .insert({ household_id: hhId, user_id: userId, role: 'parent' })
  if (e2) return null
  return hhId
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

// --- Child profiles owned by household (name lives HERE, not in NextDNS) ---
export async function linkProfile(householdId, profileId, name) {
  if (!isSupabaseConfigured() || !householdId) return
  await supabase.from('household_profiles').insert({ household_id: householdId, profile_id: profileId, name: name || 'Child' })
}
export async function getProfileIds(householdId) {
  if (!isSupabaseConfigured() || !householdId) return null
  const { data } = await supabase.from('household_profiles').select('profile_id').eq('household_id', householdId)
  return (data || []).map(r => r.profile_id)
}
// Returns [{ profile_id, name }] — the source of truth for a family's children.
export async function getHouseholdProfiles(householdId) {
  if (!isSupabaseConfigured() || !householdId) return []
  const { data } = await supabase.from('household_profiles')
    .select('profile_id, name, created_at').eq('household_id', householdId).order('created_at')
  return data || []
}
export async function renameProfileInHousehold(householdId, profileId, name) {
  if (!isSupabaseConfigured() || !householdId) return
  await supabase.from('household_profiles').update({ name }).eq('household_id', householdId).eq('profile_id', profileId)
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
