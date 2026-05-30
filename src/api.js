// src/api.js
// All calls go through /api/* which Cloudflare Pages routes to our Workers functions
// In dev, Vite proxies these to a local wrangler instance

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
  return res.json()
}

// Profiles
export const getProfiles = () => request('/profiles')
export const createProfile = (data) => request('/profiles', { method: 'POST', body: JSON.stringify(data) })
export const deleteProfile = (id) => request(`/profiles/${id}`, { method: 'DELETE' })
export const updateProfile = (id, data) => request(`/profiles/${id}`, { method: 'PATCH', body: JSON.stringify(data) })

// Profile sections
export const getProfileSection = (id, section) =>
  request(`/profiles/${id}?section=${section}`)

export const updateProfileSection = (id, section, data) =>
  request(`/profiles/${id}?section=${section}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  })

export const addToList = (id, section, data) =>
  request(`/profiles/${id}?section=${section}`, {
    method: 'POST',
    body: JSON.stringify(data)
  })

// Analytics
export const getLogs = (profileId) =>
  request(`/analytics/${profileId}?type=logs`)

export const getStatus = (profileId) =>
  request(`/analytics/${profileId}?type=status`)
