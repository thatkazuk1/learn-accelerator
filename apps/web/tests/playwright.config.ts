import { defineConfig } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import { config } from './config/index.js'

const { port, production, chromiumExecutablePath, ci } = config()
const baseURL = `http://127.0.0.1:${port}`
const outputDir = fileURLToPath(new URL('./test-results', import.meta.url))
const reportDir = fileURLToPath(new URL('./playwright-report', import.meta.url))

export default defineConfig({
  testDir: './browser',
  outputDir,
  reporter: [['list'], ['html', { outputFolder: reportDir, open: 'never' }]],
  use: { baseURL, launchOptions: { executablePath: chromiumExecutablePath } },
  webServer: {
    command: production
      ? `pnpm build && pnpm --filter @homelab/web preview --port ${port} --strictPort`
      : `pnpm --filter @homelab/web dev --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: !ci && !production,
  },
})
