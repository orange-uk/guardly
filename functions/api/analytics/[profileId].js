// functions/api/analytics/[profileId].js
// Proxies engine analytics. Supports: logs, status, topBlocked, topDomains.
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
  const profileId = params.profileId
  if (request.method === 'OPTIONS') return new Response(null, { headers: cors() })

  const apiKey = env.NEXTDNS_API_KEY
  if (!apiKey) return json({ error: 'Service unavailable' }, 503)

  const url = new URL(request.url)
  const type = url.searchParams.get('type') || 'logs'

  // Map our friendly types to engine analytics endpoints
  const endpointMap = {
    logs: `/profiles/${profileId}/logs?limit=50`,
    status: `/profiles/${profileId}/analytics/status`,
    topBlocked: `/profiles/${profileId}/analytics/domains?status=blocked&limit=10`,
    topDomains: `/profiles/${profileId}/analytics/domains?limit=10`,
  }
  const path = endpointMap[type] || endpointMap.logs

  try {
    const res = await fetch(`${NEXTDNS_BASE}${path}`, {
      headers: { 'X-Api-Key': apiKey, 'Content-Type': 'application/json' }
    })
    const text = await res.text()
    const data = text ? JSON.parse(text) : { data: [] }
    return json(data, res.status)
  } catch (err) {
    return json({ error: err.message, data: [] }, 500)
  }
}
