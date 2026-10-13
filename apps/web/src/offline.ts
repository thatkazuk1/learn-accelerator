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
    if (installing?.state === 'installed' && registration?.waiting)
      report('Update ready. Close all tabs to finish.')
    if (installing?.state === 'redundant') report('Offline download failed. Reload to retry.')
  }
  const watchInstall = (worker: ServiceWorker | null) => {
    installing?.removeEventListener('statechange', stateChange)
    installing = worker
    installing?.addEventListener('statechange', stateChange)
  }
  async function register() {
    try {
      registration = await navigator.serviceWorker.register(`${config().baseUrl}sw.js`)
      if (!active) return
      watchInstall(registration.installing)
      registration.addEventListener('updatefound', () => {
        watchInstall(registration?.installing ?? null)
      })
      await navigator.serviceWorker.ready
      if (!active) return
      if (registration.waiting) report('Update ready. Close all tabs to finish.')
      else update()
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
