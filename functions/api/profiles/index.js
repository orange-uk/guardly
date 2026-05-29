// functions/api/profiles/index.js
// Cloudflare Pages Function - proxies requests to NextDNS API
// Env vars set in Cloudflare Pages dashboard:
//   NEXTDNS_API_KEY  — your NextDNS API key

const NEXTDNS_BASE = 'https://api.nextdns.io'

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

export async function onRequest(context) {
  const { request, env } = context

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() })
  }

  const apiKey = env.NEXTDNS_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    })
  }

  try {
    // GET /api/profiles — list all profiles
    if (request.method === 'GET') {
      const res = await fetch(`${NEXTDNS_BASE}/profiles`, {
        headers: {
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json'
        }
      })
      const data = await res.json()
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() }
      })
    }

    // POST /api/profiles — create a new profile
    if (request.method === 'POST') {
      const body = await request.json()
      const res = await fetch(`${NEXTDNS_BASE}/profiles`, {
        method: 'POST',
        headers: {
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() }
      })
    }

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    })
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() }
  })
}
