// functions/api/install/[profileId].js
// Silent proxy — serves the device config profile under the Guardly domain.
// No third-party URLs are ever exposed to the user.

export async function onRequest(context) {
  const { params, env } = context
  const profileId = params.profileId
  const apiKey = env.NEXTDNS_API_KEY

  if (!apiKey) {
    return new Response('Service unavailable', { status: 503 })
  }

  try {
    const upstream = await fetch(
      `https://api.nextdns.io/profiles/${profileId}/apple-configuration-profile`,
      {
        headers: {
          'X-Api-Key': apiKey,
          'User-Agent': 'Guardly/1.0'
        }
      }
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
