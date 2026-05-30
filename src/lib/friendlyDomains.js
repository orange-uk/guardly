// src/lib/friendlyDomains.js
// Turns raw DNS domains into parent-friendly names + icons.
// Matches on substrings so subdomains (api.tiktok.com, graph.facebook.com,
// googlevideo.com) all resolve to the right friendly label.

const MAP = [
  // Social
  [['tiktok', 'tiktokcdn', 'musical.ly'], 'TikTok', '🎵'],
  [['instagram', 'cdninstagram'], 'Instagram', '📸'],
  [['facebook', 'fbcdn', 'fb.com', 'graph.facebook'], 'Facebook', '👤'],
  [['snapchat', 'sc-cdn', 'snap.com'], 'Snapchat', '👻'],
  [['twitter', 't.co', 'twimg', 'x.com'], 'X (Twitter)', '🐦'],
  [['reddit', 'redd.it'], 'Reddit', '🟠'],
  [['pinterest', 'pinimg'], 'Pinterest', '📌'],
  [['discord'], 'Discord', '💬'],
  [['whatsapp'], 'WhatsApp', '💬'],
  [['telegram', 't.me'], 'Telegram', '✈️'],
  [['bereal'], 'BeReal', '📷'],
  [['tumblr'], 'Tumblr', '📝'],
  // Video / music
  [['youtube', 'googlevideo', 'ytimg', 'youtu.be'], 'YouTube', '▶️'],
  [['netflix', 'nflxvideo', 'nflximg'], 'Netflix', '🎬'],
  [['disney', 'disneyplus', 'dssott'], 'Disney+', '✨'],
  [['twitch', 'ttvnw'], 'Twitch', '🟣'],
  [['primevideo', 'aiv-cdn', 'amazonvideo'], 'Prime Video', '📦'],
  [['spotify', 'scdn.co', 'spotifycdn'], 'Spotify', '🎧'],
  [['soundcloud', 'sndcdn'], 'SoundCloud', '🎵'],
  [['hulu'], 'Hulu', '🟩'],
  // Games
  [['roblox', 'rbxcdn'], 'Roblox', '🧱'],
  [['fortnite', 'epicgames', 'unrealengine'], 'Fortnite / Epic', '🔫'],
  [['minecraft', 'minecraftservices'], 'Minecraft', '⛏️'],
  [['steampowered', 'steamcommunity', 'steamcontent'], 'Steam', '🎮'],
  [['xbox', 'xboxlive'], 'Xbox', '🟢'],
  [['playstation', 'sonyentertainmentnetwork', 'psn'], 'PlayStation', '🎮'],
  [['leagueoflegends', 'riotgames'], 'Riot Games', '⚔️'],
  [['supercell', 'clashofclans', 'clashroyale'], 'Supercell games', '🎮'],
  [['ea.com', 'eagames'], 'EA games', '🎮'],
  // Search / shopping / general
  [['google', 'gstatic', 'googleapis', 'googleusercontent'], 'Google', '🔍'],
  [['bing'], 'Bing', '🔍'],
  [['amazon', 'media-amazon', 'ssl-images-amazon'], 'Amazon', '📦'],
  [['ebay'], 'eBay', '🏷️'],
  [['apple', 'icloud', 'mzstatic'], 'Apple', '🍎'],
  [['microsoft', 'msftncsi', 'windows'], 'Microsoft', '🪟'],
  [['wikipedia', 'wikimedia'], 'Wikipedia', '📚'],
  [['bbc'], 'BBC', '📺'],
  [['9gag'], '9GAG', '😂'],
  [['onlyfans'], 'OnlyFans', '🔞'],
  [['pornhub', 'xvideos', 'xnxx', 'xhamster'], 'Adult site', '🔞'],
  // Messaging / mail
  [['gmail', 'mail.google'], 'Gmail', '✉️'],
  [['outlook', 'hotmail', 'live.com'], 'Outlook', '✉️'],
  // Education
  [['khanacademy'], 'Khan Academy', '📚'],
  [['duolingo'], 'Duolingo', '🦉'],
  [['classroom.google', 'edu'], 'School / education', '🎓'],
]

// Common ad/tracking/CDN noise → group under one friendly bucket
const NOISE = ['doubleclick','googlesyndication','google-analytics','googletagmanager',
  'scorecardresearch','adservice','adsystem','cloudfront','akamai','fastly','cdn',
  'amazonaws','azureedge','crashlytics','sentry','bugsnag','segment','mixpanel','branch.io']

export function friendlyDomain(raw) {
  if (!raw) return { name: 'Unknown', icon: '🌐', sub: '' }
  const d = raw.toLowerCase()
  for (const [needles, name, icon] of MAP) {
    if (needles.some(n => d.includes(n))) return { name, icon, sub: raw }
  }
  if (NOISE.some(n => d.includes(n))) {
    return { name: 'Ads & background services', icon: '⚙️', sub: raw }
  }
  // Fallback: clean root domain (e.g. "foo.example.co.uk" -> "example.co.uk")
  const parts = d.replace(/^https?:\/\//, '').split('/')[0].split('.')
  let root = parts.slice(-2).join('.')
  // handle .co.uk style
  if (parts.length >= 3 && ['co','com','org','gov','ac','net'].includes(parts[parts.length - 2])) {
    root = parts.slice(-3).join('.')
  }
  const pretty = root.split('.')[0]
  return { name: pretty.charAt(0).toUpperCase() + pretty.slice(1), icon: '🌐', sub: raw }
}

// Group a list of log entries by friendly name, summing counts and keeping
// the most recent blocked/allowed status. Returns readable activity rows.
export function groupActivity(logs) {
  const map = new Map()
  for (const log of logs) {
    const raw = log.domain || log.name || ''
    const f = friendlyDomain(raw)
    const key = f.name
    if (!map.has(key)) {
      map.set(key, { name: f.name, icon: f.icon, count: 0, blocked: 0, allowed: 0, lastBlocked: false })
    }
    const row = map.get(key)
    row.count++
    if (log.blocked) { row.blocked++; row.lastBlocked = true } else { row.allowed++ }
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count)
}
