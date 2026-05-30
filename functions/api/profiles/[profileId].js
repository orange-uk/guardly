// functions/api/install/[profileId].js
// Generates an Apple .mobileconfig on the fly, served under the Guardly domain.
// This is the proven approach: we build the same profile structure NextDNS uses
// (verified against a real signed profile), pointing at the encrypted-DNS
// endpoint. Ours is unsigned, so the device shows a normal "unsigned" notice
// during install — it installs fine. The engine is never named to the user.

function uuid() {
  return (crypto.randomUUID && crypto.randomUUID()) ||
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    })
}

function buildProfile(profileId, deviceName) {
  const u1 = uuid()
  const u2 = uuid()
  const serverUrl = `https://apple.dns.nextdns.io/${profileId}/${encodeURIComponent(deviceName)}`
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>PayloadDisplayName</key>
    <string>Guardly</string>
    <key>PayloadDescription</key>
    <string>This profile keeps this device protected by Guardly on every network.</string>
    <key>PayloadIdentifier</key>
    <string>app.guardly.${profileId}.profile</string>
    <key>PayloadScope</key>
    <string>System</string>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>${u1}</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
    <key>PayloadContent</key>
    <array>
      <dict>
        <key>DNSSettings</key>
        <dict>
          <key>DNSProtocol</key>
          <string>HTTPS</string>
          <key>ServerURL</key>
          <string>${serverUrl}</string>
        </dict>
        <key>OnDemandRules</key>
        <array>
          <dict>
            <key>Action</key>
            <string>EvaluateConnection</string>
            <key>ActionParameters</key>
            <array>
              <dict>
                <key>DomainAction</key>
                <string>NeverConnect</string>
                <key>Domains</key>
                <array>
                  <string>captive.apple.com</string>
                  <string>3gppnetwork.org</string>
                </array>
              </dict>
            </array>
          </dict>
          <dict>
            <key>Action</key>
            <string>Connect</string>
          </dict>
        </array>
        <key>PayloadType</key>
        <string>com.apple.dnsSettings.managed</string>
        <key>PayloadIdentifier</key>
        <string>app.guardly.${profileId}.profile.dnsSettings.managed</string>
        <key>PayloadUUID</key>
        <string>${u2}</string>
        <key>PayloadDisplayName</key>
        <string>Guardly</string>
        <key>PayloadOrganization</key>
        <string>Guardly</string>
        <key>PayloadVersion</key>
        <integer>1</integer>
      </dict>
    </array>
  </dict>
</plist>`
}

export async function onRequest(context) {
  const { params, request } = context
  const profileId = (params.profileId || '').trim()
  if (!profileId) return new Response('Missing profile', { status: 400 })

  // Device name for the DNS endpoint (helps NextDNS analytics). Clean it.
  const raw = new URL(request.url).searchParams.get('name') || 'Guardly'
  let deviceName = raw.normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, ' ').slice(0, 40)
  if (!deviceName) deviceName = 'Guardly'

  const xml = buildProfile(profileId, deviceName)
  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/x-apple-aspen-config; charset=utf-8',
      'Content-Disposition': 'attachment; filename="guardly.mobileconfig"',
      'Cache-Control': 'no-store',
    }
  })
}
