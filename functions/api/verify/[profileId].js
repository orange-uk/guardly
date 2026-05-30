// functions/api/verify/[profileId].js
// Confirms a profile is live by checking for recent DNS activity.
// Honest by design: recent activity = confident "active"; no recent activity is
// reported as inconclusive (device may be idle/cached), never as "not protected".
const NEXTDNS_BASE = 'https://api.nextdns.io'

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status, headers: { 'Content-Type': 'application/json', ...cors() }
  })
}

export async function onRequest(context) {
  const { request, env, params } = context
  if (request.method === 'OPTIONS') return new Response(null, { headers: cors() })
  const profileId = params.profileId
  const apiKey = env.NEXTDNS_API_KEY
  if (!apiKey) return json({ error: 'Service unavailable' }, 503)

  try {
    // Pull the most recent log entries for this profile.
    const res = await fetch(`${NEXTDNS_BASE}/profiles/${profileId}/logs?limit=50`, {
      headers: { 'X-Api-Key': apiKey, 'Content-Type': 'application/json' }
    })
    const text = await res.text()
    const body = text ? JSON.parse(text) : { data: [] }
    const logs = Array.isArray(body.data) ? body.data : []

    if (!logs.length) {
      return json({ active: false, lastSeen: null, devices: [] })
    }

    // Most recent timestamp = last time the profile saw a query.
    let lastSeen = null
    const deviceMap = {}
    for (const entry of logs) {
      const ts = entry.timestamp || entry.time || null
      if (ts && (!lastSeen || ts > lastSeen)) lastSeen = ts
      const dev = entry.device && (entry.device.name || entry.device.id)
      if (dev) {
        if (!deviceMap[dev] || (ts && ts > deviceMap[dev])) deviceMap[dev] = ts
      }
    }

    // "active" = there is recent activity within the last 24h.
    let active = false
    if (lastSeen) {
      const ageMs = Date.now() - new Date(lastSeen).getTime()
      active = ageMs < 24 * 60 * 60 * 1000
    }

    const devices = Object.entries(deviceMap).map(([name, ts]) => ({ name, lastSeen: ts }))
    return json({ active, lastSeen, devices })
  } catch (err) {
    return json({ error: err.message, active: false, lastSeen: null, devices: [] }, 500)
  }
}
