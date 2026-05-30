// functions/api/install/[profileId].js
// Silent proxy — serves the Apple .mobileconfig under the Guardly domain.
// NextDNS generates these at apple.dns.nextdns.io/<profileId>/<deviceName>,
// keyed by the profile id itself (no API key needed). The engine is never
// exposed to the user — they only ever see the guardly.app URL.

export async function onRequest(context) {
  const { params, request } = context
  const profileId = params.profileId

  // Optional device name from query (?name=Ematts%20iPhone) for a nicer profile label
  const url = new URL(request.url)
  const deviceName = encodeURIComponent(url.searchParams.get('name') || 'Guardly')

  try {
    const upstream = await fetch(
      `https://apple.dns.nextdns.io/${profileId}/${deviceName}`,
      { headers: { 'User-Agent': 'Guardly/1.0' } }
    )

    if (!upstream.ok) {
      return new Response('Profile not found', { status: 404 })
    }

    const body = await upstream.arrayBuffer()
    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-apple-aspen-config',
        'Content-Disposition': 'attachment; filename="guardly-profile.mobileconfig"',
        'Cache-Control': 'no-store',
      }
    })
  } catch (err) {
    return new Response('Error fetching profile', { status: 500 })
  }
}
