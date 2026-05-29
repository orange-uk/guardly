// functions/api/profiles/[profileId].js
// Handles operations on a specific NextDNS profile

const NEXTDNS_BASE = 'https://api.nextdns.io'

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

async function nextdns(apiKey, path, method = 'GET', body = null) {
  const opts = {
    method,
    headers: { 'X-Api-Key': apiKey, 'Content-Type': 'application/json' }
  }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(`${NEXTDNS_BASE}${path}`, opts)
  const data = await res.json()
  return { status: res.status, data }
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
  const section = url.searchParams.get('section') // security | parentalControl | denylist | allowlist

  try {
    if (request.method === 'GET') {
      // Fetch a specific section or the whole profile
      const path = section
        ? `/profiles/${profileId}/${section}`
        : `/profiles/${profileId}`
      const { status, data } = await nextdns(apiKey, path)
      return new Response(JSON.stringify(data), {
        status, headers: { 'Content-Type': 'application/json', ...corsHeaders() }
      })
    }

    if (request.method === 'PATCH') {
      const body = await request.json()
      const path = section
        ? `/profiles/${profileId}/${section}`
        : `/profiles/${profileId}`
      const { status, data } = await nextdns(apiKey, path, 'PATCH', body)
      return new Response(JSON.stringify(data), {
        status, headers: { 'Content-Type': 'application/json', ...corsHeaders() }
      })
    }

    if (request.method === 'POST') {
      // Used for adding items to denylist/allowlist
      const body = await request.json()
      const path = section
        ? `/profiles/${profileId}/${section}`
        : `/profiles/${profileId}`
      const { status, data } = await nextdns(apiKey, path, 'POST', body)
      return new Response(JSON.stringify(data), {
        status, headers: { 'Content-Type': 'application/json', ...corsHeaders() }
      })
    }

    if (request.method === 'DELETE') {
      const { status, data } = await nextdns(apiKey, `/profiles/${profileId}`, 'DELETE')
      return new Response(JSON.stringify(data), {
        status, headers: { 'Content-Type': 'application/json', ...corsHeaders() }
      })
    }

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    })
  }
}
