// functions/api/profiles/[profileId]/pause.js
// Pause = block everything for this profile. Unpause = restore.
const NEXTDNS_BASE = 'https://api.nextdns.io'

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
  const profileId = params.profileId
  if (request.method === 'OPTIONS') return new Response(null, { headers: cors() })

  const apiKey = env.NEXTDNS_API_KEY
  if (!apiKey) return json({ error: 'Service unavailable' }, 503)

  try {
    const { paused } = await request.json()
    if (paused) {
      await fetch(`${NEXTDNS_BASE}/profiles/${profileId}/denylist`, {
        method: 'POST',
        headers: { 'X-Api-Key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: '*', active: true })
      })
    } else {
      await fetch(`${NEXTDNS_BASE}/profiles/${profileId}/denylist/*`, {
        method: 'DELETE',
        headers: { 'X-Api-Key': apiKey }
      })
    }
    return json({ success: true, paused })
  } catch (err) {
    return json({ error: err.message }, 500)
  }
}
