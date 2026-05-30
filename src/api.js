// src/api.js
// All calls route through /api/* which Cloudflare Pages Functions proxy
// to the filtering engine. The engine is never exposed to the client.

const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `Request failed: ${res.status}`)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : { success: true }
}

// Profiles
export const getProfiles = () => request('/profiles')
export const createProfile = (data) => request('/profiles', { method: 'POST', body: JSON.stringify(data) })
export const deleteProfile = (id) => request(`/profiles/${id}`, { method: 'DELETE' })
export const updateProfile = (id, data) => request(`/profiles/${id}`, { method: 'PATCH', body: JSON.stringify(data) })

// Profile sections (parentalControl, denylist, allowlist, settings)
export const getProfileSection = (id, section) => request(`/profiles/${id}?section=${section}`)
export const updateProfileSection = (id, section, data) =>
  request(`/profiles/${id}?section=${section}`, { method: 'PATCH', body: JSON.stringify(data) })
export const addToList = (id, section, data) =>
  request(`/profiles/${id}?section=${section}`, { method: 'POST', body: JSON.stringify(data) })

// Schedules / time limits — stored in the engine's parentalControl section
// (recreation windows) and settings.
export const updateSchedule = (id, recreation) =>
  request(`/profiles/${id}?section=parentalControl`, {
    method: 'PATCH', body: JSON.stringify({ recreation })
  })

// Analytics
export const getLogs = (profileId) => request(`/analytics/${profileId}?type=logs`)
export const getAnalytics = (profileId, kind) => request(`/analytics/${profileId}?type=${kind}`)
