import { existsSync } from 'node:fs'
import { defaults } from './default.js'

export interface Config {
  port: number
  production: boolean
  chromiumExecutablePath: string | undefined
  ci: boolean
}

export function config(): Config {
  const { HOMELAB_TEST_PORT, HOMELAB_PRODUCTION, PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, CI } =
    process.env
  const port = HOMELAB_TEST_PORT === undefined ? defaults.port : Number(HOMELAB_TEST_PORT)
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('HOMELAB_TEST_PORT must be an integer from 1 to 65535.')
  if (HOMELAB_PRODUCTION !== undefined && !['true', 'false'].includes(HOMELAB_PRODUCTION))
    throw new Error('HOMELAB_PRODUCTION must be true or false.')
  if (CI !== undefined && !['true', 'false', '1', '0'].includes(CI))
    throw new Error('CI must be true, false, 1 or 0.')
  if (
    PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH !== undefined &&
    !existsSync(PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH)
  )
    throw new Error('PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH must point to an installed browser.')
  return {
    port,
    production:
      HOMELAB_PRODUCTION === undefined ? defaults.production : HOMELAB_PRODUCTION === 'true',
    chromiumExecutablePath:
      PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ??
      (existsSync('/usr/bin/google-chrome')
        ? '/usr/bin/google-chrome'
        : defaults.chromiumExecutablePath),
    ci: CI === undefined ? defaults.ci : CI === 'true' || CI === '1',
  }
}
