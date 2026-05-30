import { useState, useEffect } from 'react'

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  )
  useEffect(() => {
    const m = window.matchMedia(query)
    const handler = (e) => setMatches(e.matches)
    m.addEventListener('change', handler)
    setMatches(m.matches)
    return () => m.removeEventListener('change', handler)
  }, [query])
  return matches
}

export const useIsMobile = () => useMediaQuery('(max-width: 860px)')
