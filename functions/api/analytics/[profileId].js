// functions/api/analytics/[profileId].js
// Proxies NextDNS analytics and log data for a profile

const NEXTDNS_BASE = 'https://api.nextdns.io'

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

export async function onRequest(context) {
  const { request, env, params } = context
  const profileId = params.profileId

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() })
  }

  const apiKey = env.NEXTDNS_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    })
  }

  const url = new URL(request.url)
  const type = url.searchParams.get('type') || 'logs' // logs | status | domains

  try {
    const res = await fetch(`${NEXTDNS_BASE}/profiles/${profileId}/${type}`, {
      headers: { 'X-Api-Key': apiKey, 'Content-Type': 'application/json' }
    })
    const data = await res.json()
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    })
  }
}
