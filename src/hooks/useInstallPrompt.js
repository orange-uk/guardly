import { useState, useEffect } from 'react'

// Captures the browser's install prompt so we can show our own button.
export function useInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); setPromptEvent(e) }
    const onInstalled = () => { setInstalled(true); setPromptEvent(null) }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const promptInstall = async () => {
    if (!promptEvent) return
    promptEvent.prompt()
    await promptEvent.userChoice
    setPromptEvent(null)
  }

  return { canInstall: !!promptEvent && !installed, promptInstall }
}
