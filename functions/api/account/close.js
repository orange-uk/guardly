// functions/api/account/close.js
// Securely deletes a user's auth account.
// Requires (Cloudflare env vars, server-side only — do NOT prefix with VITE_):
//   SUPABASE_URL                — your project URL
//   SUPABASE_SERVICE_ROLE_KEY   — the secret service_role key
// If these aren't set, the endpoint cleans up gracefully and the client still
// signs the user out (their data is removed client-side either way).

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}
function json(o, s = 200) {
  return new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', ...cors() } })
}

export async function onRequest(context) {
  const { request, env } = context
  if (request.method === 'OPTIONS') return new Response(null, { headers: cors() })

  const url = env.SUPABASE_URL
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    // Not configured for hard-delete; client will still sign out + wipe data.
    return json({ success: false, reason: 'not_configured' })
  }

  try {
    const { access_token } = await request.json()
    if (!access_token) return json({ error: 'Missing token' }, 401)

    // Verify the token belongs to the user we're about to delete.
    const who = await fetch(`${url}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${access_token}`, apikey: serviceKey }
    })
    if (!who.ok) return json({ error: 'Invalid session' }, 401)
    const me = await who.json()
    const userId = me.id
    if (!userId) return json({ error: 'No user' }, 401)

    // Delete the auth user (admin endpoint). Cascades remove their data via
    // the foreign keys set up in the SQL.
    const del = await fetch(`${url}/auth/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey }
    })
    return json({ success: del.ok })
  } catch (err) {
    return json({ error: err.message }, 500)
  }
}
