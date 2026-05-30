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
// Module-level promise cache so concurrent callers (Layout + Dashboard loading
// at the same time) share ONE resolution instead of each creating a household.
let _ensurePromise = null
let _ensureFor = null

export async function ensureHousehold(userId, displayName) {
  if (!isSupabaseConfigured() || !userId) return null
  // Reuse an in-flight call for the same user (prevents race duplicates).
  if (_ensurePromise && _ensureFor === userId) return _ensurePromise
  _ensureFor = userId
  _ensurePromise = (async () => {
    // Already a member? Pick the OLDEST membership so everyone converges on the
    // same household even if stray duplicates exist.
    const { data: mem } = await supabase
      .from('household_members').select('household_id, created_at')
      .eq('user_id', userId).order('created_at').limit(1)
    if (mem && mem.length) return mem[0].household_id

    // Genuinely no household → create one.
    const hhId = (crypto.randomUUID && crypto.randomUUID()) ||
      ('hh-' + Date.now() + '-' + Math.random().toString(36).slice(2))
    const { error: e1 } = await supabase.from('households')
      .insert({ id: hhId, name: (displayName || 'My') + ' family' })
    if (e1) return null
    const { error: e2 } = await supabase.from('household_members')
      .insert({ household_id: hhId, user_id: userId, role: 'parent' })
    if (e2) return null
    return hhId
  })()
  try { return await _ensurePromise }
  finally { _ensurePromise = null; _ensureFor = null }
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

  // The joiner may have had a household auto-created on login. Find those.
  const { data: old } = await supabase
    .from('household_members').select('household_id').eq('user_id', userId)
  const oldIds = (old || []).map(r => r.household_id).filter(id => id !== invite.household_id)

  // Leave any old households, then join the invited one.
  await supabase.from('household_members').delete().eq('user_id', userId)
  await supabase.from('household_members')
    .insert({ household_id: invite.household_id, user_id: userId, role: 'parent' })
  await supabase.from('household_invites').update({ accepted: true }).eq('id', invite.id)

  // Tidy up any now-empty households the joiner left behind (and their stray
  // empty profiles), so we don't accumulate orphans.
  for (const id of oldIds) {
    const { data: stillMembers } = await supabase
      .from('household_members').select('user_id').eq('household_id', id).limit(1)
    if (!stillMembers || !stillMembers.length) {
      await supabase.from('household_profiles').delete().eq('household_id', id)
      await supabase.from('households').delete().eq('id', id)
    }
  }
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
