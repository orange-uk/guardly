// functions/api/dns/[profileId].js
// Returns Guardly-branded DNS configuration for Android/router setup.
// No engine hostnames exposed — the Guardly Worker acts as the DNS forwarder.
// (For future: set up a custom DoT hostname like dns.guardly.app)

export async function onRequest(context) {
  const { params } = context
  const profileId = params.profileId

  return new Response(JSON.stringify({
    profile: profileId,
    // These point to Guardly's proxy layer.
    // Replace dns.guardly.app with your actual custom DoT hostname once set up.
    dot_hostname: `dns.guardly.app`,
    doh_url: `https://guardly-4d3.pages.dev/api/resolve/${profileId}`,
    instructions: 'Use the Private DNS setting on Android with the hostname above.'
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  })
}
