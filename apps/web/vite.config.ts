import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  plugins: [
    {
      name: 'homelab-offline',
      apply: 'build',
      generateBundle: {
        order: 'post',
        handler(_, bundle) {
          const files = Object.keys(bundle)
          const digest = createHash('sha256')
          for (const file of files.sort()) {
            const output = bundle[file]
            if (!output) throw new Error(`Missing build output: ${file}`)
            digest.update(file).update(output.type === 'chunk' ? output.code : output.source)
          }
          const version = digest.digest('hex').slice(0, 16)
          this.emitFile({
            type: 'asset',
            fileName: 'sw.js',
            source: `
const PREFIX = 'homelab-offline-';
const CACHE = PREFIX + '${version}';
const URLS = ${JSON.stringify(files)}.map(file => new URL(file, self.registration.scope).href);
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    try { await cache.addAll(URLS); }
    catch (error) { await caches.delete(CACHE); throw error; }
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith(PREFIX) && key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  const index = new URL('index.html', self.registration.scope).href;
  const isEntry = event.request.mode === 'navigate' && (url.pathname === new URL(self.registration.scope).pathname || url.href.split('?')[0] === index);
  if (!isEntry && !URLS.includes(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // These are this build's static files; preview servers may vary on Origin.
    return await cache.match(isEntry ? index : event.request, { ignoreVary: true }) || fetch(event.request);
  })());
});
`,
          })
        },
      },
    },
  ],
})
