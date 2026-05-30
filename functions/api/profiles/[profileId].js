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
  const text = await res.text()
  let data
  try { data = text ? JSON.parse(text) : { success: true } }
  catch { data = { success: true } }
  return { status: res.status, data, ok: res.ok }
}

// Always return a 200 with a JSON body. We never echo upstream no-body
// statuses (204/205/304) because attaching a body to those throws in the
// browser ("Response with null body status cannot have a body").
function reply(data, upstreamOk = true) {
  return new Response(JSON.stringify(data), {
    status: upstreamOk ? 200 : 502,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() }
  })
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
  const section = url.searchParams.get('section')

  try {
    if (request.method === 'GET') {
      const path = section ? `/profiles/${profileId}/${section}` : `/profiles/${profileId}`
      const { data, ok } = await nextdns(apiKey, path)
      return reply(data, ok)
    }

    if (request.method === 'PATCH') {
      const body = await request.json()
      const path = section ? `/profiles/${profileId}/${section}` : `/profiles/${profileId}`
      const { data, ok } = await nextdns(apiKey, path, 'PATCH', body)
      return reply(data, ok)
    }

    if (request.method === 'POST') {
      const body = await request.json()
      const path = section ? `/profiles/${profileId}/${section}` : `/profiles/${profileId}`
      const { data, ok } = await nextdns(apiKey, path, 'POST', body)
      return reply(data, ok)
    }

    if (request.method === 'DELETE') {
      const { ok } = await nextdns(apiKey, `/profiles/${profileId}`, 'DELETE')
      return reply({ success: ok }, ok)
    }

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    })
  }
}
