import { config } from '@/config'

export function initialOfflineStatus(): string {
  return config().production ? 'Preparing offline play...' : 'Development preview'
}

export function prepareOffline(onChange: (status: string) => void): () => void {
  if (!config().production) return () => {}
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    onChange('Offline play unavailable')
    return () => {}
  }
  let active = true
  let installing: ServiceWorker | null = null
  let registration: ServiceWorkerRegistration | null = null
  const report = (status: string) => {
    if (active) onChange(status)
  }
  const update = () => report(navigator.onLine ? 'Ready for offline play' : 'Playing offline')
  const stateChange = () => {
    if (installing?.state === 'redundant' && !registration?.active)
      report('Offline download failed. Reload to retry.')
  }
  async function register() {
    try {
      registration = await navigator.serviceWorker.register(`${config().baseUrl}sw.js`)
      if (!active) return
      installing = registration.installing
      installing?.addEventListener('statechange', stateChange)
      await navigator.serviceWorker.ready
      if (!active) return
      update()
      window.addEventListener('online', update)
      window.addEventListener('offline', update)
    } catch {
      report('Offline download failed. Reload to retry.')
    }
  }
  void register()
  return () => {
    active = false
    installing?.removeEventListener('statechange', stateChange)
    window.removeEventListener('online', update)
    window.removeEventListener('offline', update)
  }
}
